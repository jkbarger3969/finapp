#!/usr/bin/env node
/* eslint-disable no-console */
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config({ path: `${__dirname}/../.env` });

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "27017";
const DB_USER = process.env.DB_USER || "";
const DB_PASS = process.env.DB_PASS || "";
const DB_NAME = process.env.DB_NAME || "accounting";
const SCRIPT_VERSION = "2026-05-29-r6";

const APPLY = process.argv.includes("--apply");
const ARCHIVE_ONLY = process.argv.includes("--archive-only");

const TARGETS = [
  {
    canonicalName: "Building Maint/Repair",
    sourceNames: ["Building Maint/Repair - Other"],
    type: "Debit",
  },
  {
    canonicalName: "Grounds Maint/Repair",
    sourceNames: ["Grounds Maint/Repair - Other", "Ground Maint/Repair - Other"],
    type: "Debit",
  },
  {
    canonicalName: "Ground Maint/Repair",
    sourceNames: ["Ground Maint/Repair - Other", "Grounds Maint/Repair - Other"],
    type: "Debit",
  },
];

const SPLIT_REPAIR_AND_MAINT = process.argv.includes("--split-repair-and-maint");

function buildMongoUri() {
  if (DB_USER && DB_PASS) {
    return `mongodb://${encodeURIComponent(DB_USER)}:${encodeURIComponent(
      DB_PASS
    )}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;
  }
  return `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

function normName(name) {
  return String(name || "")
    .normalize("NFKC")
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function unwrapValue(value) {
  if (Array.isArray(value)) {
    const first = value[0];
    if (first && typeof first === "object" && "value" in first) return first.value;
    return first;
  }
  if (value && typeof value === "object" && "value" in value) return value.value;
  return value;
}

function normalizeCategory(raw) {
  return {
    ...raw,
    name: unwrapValue(raw.name),
    type: unwrapValue(raw.type),
    groupName: unwrapValue(raw.groupName),
    hidden: unwrapValue(raw.hidden),
    active: unwrapValue(raw.active),
    sortOrder: unwrapValue(raw.sortOrder),
  };
}

function hasMaintRepairTokens(name) {
  const n = normName(name);
  return (
    (n.includes("maint") && n.includes("repair")) ||
    n.includes("m/r") ||
    n.includes("m&r")
  );
}

function isOtherLike(name) {
  const n = normName(name);
  return n.includes("other");
}

function chooseCanonical(candidates) {
  if (!candidates.length) return null;
  const sorted = [...candidates].sort((a, b) => {
    const aScore =
      (a.hidden === false ? 2 : 0) +
      (a.active === true ? 2 : 0) +
      (a.groupName ? 1 : 0) +
      (isOtherLike(a.name) ? -8 : 0) +
      (isOtherLike(a.groupName) ? -12 : 0);
    const bScore =
      (b.hidden === false ? 2 : 0) +
      (b.active === true ? 2 : 0) +
      (b.groupName ? 1 : 0) +
      (isOtherLike(b.name) ? -8 : 0) +
      (isOtherLike(b.groupName) ? -12 : 0);
    if (aScore !== bScore) return bScore - aScore;
    return String(a._id).localeCompare(String(b._id));
  });
  return sorted[0];
}

function isMaintRepairOtherName(name) {
  const n = normName(name);
  return (
    hasMaintRepairTokens(n) &&
    (n.includes("other") || n.includes("expense other"))
  );
}

function isMaintRepairOtherCategory(category) {
  const nameNorm = normName(category?.name || "");
  const groupNorm = normName(category?.groupName || "");
  return (
    (hasMaintRepairTokens(nameNorm) || hasMaintRepairTokens(groupNorm)) &&
    (isOtherLike(nameNorm) || isOtherLike(groupNorm))
  );
}

function isGroundCanonicalVariant(name) {
  const n = normName(name);
  return (
    (n.includes("ground") || n.includes("grounds")) &&
    hasMaintRepairTokens(n) &&
    !isMaintRepairOtherName(n)
  );
}

function isBuildingCanonicalVariant(name) {
  const n = normName(name);
  return (
    n.includes("building") &&
    hasMaintRepairTokens(n) &&
    !isMaintRepairOtherName(n)
  );
}

function stripOtherMarkers(value) {
  if (!value) return value;
  return String(value)
    .replace(/\bexpense\s+other\b/gi, "")
    .replace(/\s*-\s*other\b/gi, "")
    .replace(/\bother\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function countEntryRefs(entriesCol, categoryId) {
  return entriesCol.countDocuments({
    "category.0.value": categoryId,
    "deleted.0.value": { $ne: true },
  });
}

async function getCategoryUsageStats(entriesCol, categoryId) {
  const rows = await entriesCol
    .aggregate([
      {
        $match: {
          "category.0.value": categoryId,
          "deleted.0.value": { $ne: true },
        },
      },
      {
        $project: {
          refundRows: {
            $size: {
              $filter: {
                input: { $ifNull: ["$refunds", []] },
                as: "refund",
                cond: {
                  $ne: [{ $arrayElemAt: ["$$refund.deleted.value", 0] }, true],
                },
              },
            },
          },
          reconciledRefundRows: {
            $size: {
              $filter: {
                input: { $ifNull: ["$refunds", []] },
                as: "refund",
                cond: {
                  $and: [
                    { $ne: [{ $arrayElemAt: ["$$refund.deleted.value", 0] }, true] },
                    { $eq: [{ $arrayElemAt: ["$$refund.reconciled.value", 0] }, true] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          entries: { $sum: 1 },
          entriesWithRefunds: {
            $sum: { $cond: [{ $gt: ["$refundRows", 0] }, 1, 0] },
          },
          refundRows: { $sum: "$refundRows" },
          reconciledRefundRows: { $sum: "$reconciledRefundRows" },
        },
      },
    ])
    .toArray();

  return (
    rows[0] || {
      entries: 0,
      entriesWithRefunds: 0,
      refundRows: 0,
      reconciledRefundRows: 0,
    }
  );
}

async function moveCategoryRefs(entriesCol, fromId, toId) {
  // Category shape is historical array-based audit field.
  return entriesCol.updateMany(
    { "category.0.value": fromId },
    { $set: { "category.0.value": toId } }
  );
}

async function ensureCanonicalNotOther(entriesCol, categoriesCol, target) {
  const debitCategories = await categoriesCol
    .find(
      { type: target.type },
      { projection: { _id: 1, name: 1, type: 1, hidden: 1, active: 1, groupName: 1 } }
    )
    .toArray();

  const candidateSet = debitCategories.filter((c) => {
    if (isBuildingCanonicalVariant(target.canonicalName)) {
      return isBuildingCanonicalVariant(c.name) || isMaintRepairOtherName(c.name);
    }
    if (isGroundCanonicalVariant(target.canonicalName)) {
      return isGroundCanonicalVariant(c.name) || isMaintRepairOtherName(c.name);
    }
    return normName(c.name) === normName(target.canonicalName) || isMaintRepairOtherName(c.name);
  });

  if (!candidateSet.length) return;

  const canonical = chooseCanonical(candidateSet);
  const losers = candidateSet.filter((c) => !c._id.equals(canonical._id));
  for (const loser of losers) {
    const refs = await countEntryRefs(entriesCol, loser._id);
    if (refs > 0) {
      const res = await moveCategoryRefs(entriesCol, loser._id, canonical._id);
      console.log(
        `  correction: moved ${res.modifiedCount || 0} refs from ${loser.name} (${loser._id}) -> ${canonical.name} (${canonical._id})`
      );
    }
  }
}

async function splitRepairAndMaintBetweenBuildingAndGrounds(entriesCol, categoriesCol) {
  const repairMaint = await categoriesCol.findOne({ type: "Debit", name: "Repair & Maint" });
  if (!repairMaint) return { movedToBuilding: 0, movedToGrounds: 0 };

  const building = await categoriesCol.findOne({ type: "Debit", name: "Building Maint/Repair" });
  const grounds = await categoriesCol.findOne({
    type: "Debit",
    name: { $in: ["Grounds Maint/Repair", "Ground Maint/Repair"] },
  });
  if (!building || !grounds) return { movedToBuilding: 0, movedToGrounds: 0 };

  const toGroundRegex = /(ground|lawn|landscap|yard|pasture|field|mow|tree|brush|weed|fence|ditch|irrigat|sprinkler)/i;
  const toBuildingRegex = /(build|hvac|roof|plumb|electri|door|window|wall|floor|paint|facility|structure)/i;

  const cursor = entriesCol.find({
    "category.0.value": repairMaint._id,
    "deleted.0.value": { $ne: true },
  }, { projection: { _id: 1, description: 1, department: 1 } });

  let movedToBuilding = 0;
  let movedToGrounds = 0;

  // eslint-disable-next-line no-restricted-syntax
  for await (const e of cursor) {
    const description = String(e.description || "");
    const departmentName = String(
      e?.department?.[0]?.value?.name ||
      e?.department?.[0]?.displayName ||
      e?.department?.[0]?.name ||
      ""
    );
    const text = `${description} ${departmentName}`;

    let targetId = building._id;
    if (toGroundRegex.test(text) && !toBuildingRegex.test(text)) {
      targetId = grounds._id;
    } else if (toBuildingRegex.test(text) && !toGroundRegex.test(text)) {
      targetId = building._id;
    } else if (toGroundRegex.test(text) && toBuildingRegex.test(text)) {
      // tie-breaker: prefer grounds only when ground signals dominate by count
      const groundHits = (text.match(new RegExp(toGroundRegex.source, "gi")) || []).length;
      const buildHits = (text.match(new RegExp(toBuildingRegex.source, "gi")) || []).length;
      targetId = groundHits > buildHits ? grounds._id : building._id;
    }

    // eslint-disable-next-line no-await-in-loop
    await entriesCol.updateOne({ _id: e._id }, { $set: { "category.0.value": targetId } });
    if (String(targetId) === String(grounds._id)) movedToGrounds += 1;
    else movedToBuilding += 1;
  }

  return { movedToBuilding, movedToGrounds };
}

async function archiveCategory(categoriesCol, categoryId, note) {
  return categoriesCol.updateOne(
    { _id: categoryId },
    {
      $set: {
        hidden: true,
        active: false,
      },
      $push: {
        mergeNotes: {
          at: new Date(),
          note,
        },
      },
    }
  );
}

async function ensureCanonicalGroup(categoriesCol, canonical, canonicalName, applyMode) {
  const desiredGroup = stripOtherMarkers(canonicalName) || canonicalName;
  const currentGroup = stripOtherMarkers(canonical.groupName || "");
  const needsGroupFix =
    !currentGroup ||
    isOtherLike(currentGroup) ||
    currentGroup !== stripOtherMarkers(desiredGroup);

  if (!needsGroupFix) return canonical;

  if (!applyMode) {
    console.log(
      `  DRY-RUN: would set canonical groupName '${desiredGroup}' on ${canonical._id} (${canonical.name})`
    );
    return canonical;
  }

  await categoriesCol.updateOne(
    { _id: canonical._id },
    {
      $set: {
        groupName: desiredGroup,
        hidden: false,
        active: true,
      },
    }
  );

  console.log(
    `  normalized canonical grouping: ${canonical._id} (${canonical.name}) -> groupName='${desiredGroup}'`
  );

  return {
    ...canonical,
    groupName: desiredGroup,
    hidden: false,
    active: true,
  };
}

async function run() {
  const uri = buildMongoUri();
  const client = new MongoClient(uri);

  console.log(`Connecting to ${DB_HOST}:${DB_PORT}/${DB_NAME} ...`);
  console.log(`mergeMaintRepairOtherCategories.js v${SCRIPT_VERSION}`);
  await client.connect();
  const db = client.db(DB_NAME);
  const categoriesCol = db.collection("categories");
  const entriesCol = db.collection("entries");

  let totalMoved = 0;
  let totalSourcesProcessed = 0;
  let totalDeleted = 0;
  let totalArchived = 0;

  try {
    const allCategoriesRaw = await categoriesCol
      .find({}, { projection: { _id: 1, name: 1, type: 1, hidden: 1, active: 1, groupName: 1 } })
      .toArray();
    const allCategories = allCategoriesRaw.map(normalizeCategory);

    console.log(`Loaded ${allCategories.length} categories`);
    console.log(APPLY ? "MODE: APPLY" : "MODE: DRY-RUN");
    if (SPLIT_REPAIR_AND_MAINT) {
      console.log("Split mode enabled for legacy 'Repair & Maint' category");
    }
    if (APPLY) {
      console.log(ARCHIVE_ONLY ? "Source categories will be archived (hidden)" : "Source categories will be deleted after migration");
    }
    console.log("Auto-discovery enabled for *Maint/Repair*Other* category variants");
    console.log("");

    // Auto-discover additional "*Maint/Repair*Other*" variants so migration
    // runs across full dataset, not only exact hardcoded names.
    const discoveredSources = allCategories.filter(
      (c) =>
        String(c.type || "").toLowerCase() === "debit" &&
        isMaintRepairOtherCategory(c)
    );
    console.log(`Discovered source candidates: ${discoveredSources.length}`);

    if (APPLY && discoveredSources.length === 0) {
      const legacyWrapped = allCategoriesRaw.some(
        (c) => Array.isArray(c.name) || Array.isArray(c.groupName) || Array.isArray(c.type)
      );
      if (legacyWrapped) {
        console.log(
          "WARNING: no sources discovered but legacy wrapped fields detected; run dry-run output review before apply."
        );
      }
    }

    if (SPLIT_REPAIR_AND_MAINT) {
      if (!APPLY) {
        console.log("");
        console.log("DRY-RUN: split mode is active; run with --apply to redistribute 'Repair & Maint' refs between Building and Grounds canonical categories.");
      } else {
        const split = await splitRepairAndMaintBetweenBuildingAndGrounds(
          entriesCol,
          categoriesCol
        );
        console.log("");
        console.log("=== SPLIT REPAIR & MAINT ===");
        console.log(`moved to Building Maint/Repair: ${split.movedToBuilding}`);
        console.log(`moved to Grounds Maint/Repair: ${split.movedToGrounds}`);

        const repairMaint = await categoriesCol.findOne({
          type: "Debit",
          name: "Repair & Maint",
        });
        if (repairMaint) {
          const remaining = await countEntryRefs(entriesCol, repairMaint._id);
          if (remaining === 0) {
            if (ARCHIVE_ONLY) {
              await archiveCategory(
                categoriesCol,
                repairMaint._id,
                "Split into Building/Grounds Maint/Repair"
              );
              console.log("archived legacy 'Repair & Maint' category");
            } else {
              await categoriesCol.deleteOne({ _id: repairMaint._id });
              console.log("deleted legacy 'Repair & Maint' category");
            }
          } else {
            console.log(
              `WARNING: legacy 'Repair & Maint' still has ${remaining} refs after split`
            );
          }
        }
      }
    }

    const dynamicTargets = [...TARGETS];
    if (discoveredSources.length) {
      // Heuristic mapping by name prefix
      const buildingNames = discoveredSources
        .filter((c) => normName(c.name).includes("building"))
        .map((c) => c.name);
      const groundsNames = discoveredSources
        .filter((c) => normName(c.name).includes("ground"))
        .map((c) => c.name);

      if (buildingNames.length) {
        const t = dynamicTargets.find((x) => x.canonicalName === "Building Maint/Repair");
        if (t) t.sourceNames = Array.from(new Set([...t.sourceNames, ...buildingNames]));
      }
      if (groundsNames.length) {
        dynamicTargets
          .filter((x) => isGroundCanonicalVariant(x.canonicalName))
          .forEach((t) => {
            t.sourceNames = Array.from(new Set([...t.sourceNames, ...groundsNames]));
          });
      }
    }

    for (const target of dynamicTargets) {
      const canonicalNorm = normName(target.canonicalName);
      const sourceNorms = target.sourceNames.map(normName);

      const sameType = allCategories.filter(
        (c) => String(c.type || "").toLowerCase() === String(target.type || "").toLowerCase()
      );

      const canonicalCandidates = sameType.filter((c) => {
        const cNorm = normName(c.name);
        if (isBuildingCanonicalVariant(target.canonicalName)) {
          return isBuildingCanonicalVariant(cNorm);
        }
        if (isGroundCanonicalVariant(target.canonicalName)) {
          return isGroundCanonicalVariant(cNorm);
        }
        return cNorm === canonicalNorm;
      });
      let canonical = chooseCanonical(canonicalCandidates);

      if (!canonical) {
        const sourceCandidates = sameType.filter((c) => {
          const cNorm = normName(c.name);
          if (sourceNorms.includes(cNorm)) return true;
          if (isBuildingCanonicalVariant(target.canonicalName)) {
            return cNorm.includes("building") && isMaintRepairOtherCategory(c);
          }
          if (isGroundCanonicalVariant(target.canonicalName)) {
            return (
              (cNorm.includes("ground") || cNorm.includes("grounds")) &&
              isMaintRepairOtherCategory(c)
            );
          }
          return isMaintRepairOtherCategory(c);
        });

        if (!sourceCandidates.length) {
          console.log(`- ${target.canonicalName}: canonical category not found, skipping`);
          continue;
        }

        const template = chooseCanonical(sourceCandidates);
        const inferredGroup =
          stripOtherMarkers(template?.groupName) ||
          stripOtherMarkers(template?.name) ||
          stripOtherMarkers(target.canonicalName);

        if (!APPLY) {
          console.log(`- ${target.canonicalName}: canonical missing`);
          console.log(
            `  DRY-RUN: would create canonical category '${target.canonicalName}' using template ${template._id} (${template.name})`
          );
          continue;
        }

        const insertRes = await categoriesCol.insertOne({
          name: target.canonicalName,
          type: target.type,
          hidden: false,
          active: true,
          groupName: inferredGroup || null,
          sortOrder: template?.sortOrder ?? null,
        });
        canonical = {
          _id: insertRes.insertedId,
          name: target.canonicalName,
          type: target.type,
          hidden: false,
          active: true,
          groupName: inferredGroup || null,
          sortOrder: template?.sortOrder ?? null,
        };
        allCategories.push(canonical);
        sameType.push(canonical);
        console.log(
          `- ${target.canonicalName}: created canonical ${canonical._id} (${canonical.name})`
        );
      }

      let forcedSourceFromCanonical = null;
      if (canonical && isMaintRepairOtherCategory(canonical)) {
        const nonOtherCandidates = canonicalCandidates.filter(
          (c) => !isMaintRepairOtherCategory(c)
        );
        if (!nonOtherCandidates.length) {
          const inferredGroup =
            stripOtherMarkers(canonical.groupName) ||
            stripOtherMarkers(canonical.name) ||
            stripOtherMarkers(target.canonicalName);

          if (!APPLY) {
            console.log(`- ${target.canonicalName}: canonical currently points to Other group`);
            console.log(
              `  DRY-RUN: would create canonical '${target.canonicalName}' and move refs from ${canonical._id} (${canonical.name})`
            );
            continue;
          }

          const previousCanonical = canonical;
          const insertRes = await categoriesCol.insertOne({
            name: target.canonicalName,
            type: target.type,
            hidden: false,
            active: true,
            groupName: inferredGroup || null,
            sortOrder: previousCanonical?.sortOrder ?? null,
          });
          canonical = {
            _id: insertRes.insertedId,
            name: target.canonicalName,
            type: target.type,
            hidden: false,
            active: true,
            groupName: inferredGroup || null,
            sortOrder: previousCanonical?.sortOrder ?? null,
          };
          allCategories.push(canonical);
          sameType.push(canonical);
          forcedSourceFromCanonical = previousCanonical;
          console.log(
            `- ${target.canonicalName}: created non-Other canonical ${canonical._id} (${canonical.name})`
          );
        }
      }

      canonical = await ensureCanonicalGroup(
        categoriesCol,
        canonical,
        target.canonicalName,
        APPLY
      );

      // Source set:
      // 1) explicit "- Other" names
      // 2) duplicate canonical categories (same name/type but different _id)
      const explicitSources = sameType.filter((c) =>
        sourceNorms.includes(normName(c.name))
      );
      const duplicateCanonicalSources = canonicalCandidates.filter(
        (c) => !c._id.equals(canonical._id)
      );

      const sourcesById = new Map();
      [...explicitSources, ...duplicateCanonicalSources].forEach((c) => {
        if (!c._id.equals(canonical._id)) sourcesById.set(String(c._id), c);
      });
      // Legacy alias often used under Expense Other; merge it into
      // Building canonical to eliminate duplicate selector entry.
      if (isBuildingCanonicalVariant(target.canonicalName)) {
        sameType
          .filter(
            (c) =>
              normName(c.name) === "repair & maint" &&
              !c._id.equals(canonical._id)
          )
          .forEach((c) => sourcesById.set(String(c._id), c));
      }
      if (isGroundCanonicalVariant(target.canonicalName)) {
        sameType
          .filter(
            (c) =>
              normName(c.name) === "repair & maint" &&
              !c._id.equals(canonical._id)
          )
          .forEach((c) => sourcesById.set(String(c._id), c));
      }
      if (forcedSourceFromCanonical && !forcedSourceFromCanonical._id.equals(canonical._id)) {
        sourcesById.set(String(forcedSourceFromCanonical._id), forcedSourceFromCanonical);
      }
      const sources = Array.from(sourcesById.values());

      console.log(`- ${target.canonicalName}`);
      console.log(
        `  canonical: ${canonical._id} (${canonical.name})` +
          (canonical.groupName ? ` [group: ${canonical.groupName}]` : "")
      );

      if (!sources.length) {
        console.log("  no source categories found for merge");
        const maintRepairInType = sameType.filter(
          (c) =>
            hasMaintRepairTokens(c.name || "") ||
            hasMaintRepairTokens(c.groupName || "")
        );
        if (maintRepairInType.length) {
          console.log("  debug maint/repair candidates in this type:");
          maintRepairInType.forEach((c) => {
            console.log(
              `    - ${c._id} | name='${c.name}' | group='${c.groupName || ""}' | hidden=${String(
                c.hidden
              )} | active=${String(c.active)}`
            );
          });
        }
        continue;
      }

      for (const source of sources) {
        const beforeCount = await countEntryRefs(entriesCol, source._id);
        const sourceStatsBefore = await getCategoryUsageStats(entriesCol, source._id);
        const canonicalStatsBefore = await getCategoryUsageStats(entriesCol, canonical._id);
        totalSourcesProcessed += 1;

        console.log(`  source: ${source._id} (${source.name}) -> refs: ${beforeCount}`);
        console.log(
          `    refunds on source entries: ${sourceStatsBefore.refundRows} ` +
            `(reconciled: ${sourceStatsBefore.reconciledRefundRows}, entries with refunds: ${sourceStatsBefore.entriesWithRefunds})`
        );

        if (!APPLY) continue;

        if (beforeCount > 0) {
          const res = await moveCategoryRefs(entriesCol, source._id, canonical._id);
          totalMoved += res.modifiedCount || 0;
          console.log(`    moved entry refs: ${res.modifiedCount || 0}`);
        }

        const afterCount = await countEntryRefs(entriesCol, source._id);
        const sourceStatsAfter = await getCategoryUsageStats(entriesCol, source._id);
        const canonicalStatsAfter = await getCategoryUsageStats(entriesCol, canonical._id);

        const carriedRefundRowsDelta =
          canonicalStatsAfter.refundRows - canonicalStatsBefore.refundRows;
        const carriedReconciledRefundRowsDelta =
          canonicalStatsAfter.reconciledRefundRows -
          canonicalStatsBefore.reconciledRefundRows;

        console.log(
          `    refund carry-over delta on canonical: +${carriedRefundRowsDelta} ` +
            `(reconciled: +${carriedReconciledRefundRowsDelta})`
        );

        if (
          sourceStatsBefore.refundRows > 0 &&
          sourceStatsAfter.refundRows !== 0
        ) {
          console.log(
            `    WARNING: source category still has ${sourceStatsAfter.refundRows} refund rows after move`
          );
        }

        if (afterCount > 0) {
          console.log(`    WARNING: ${afterCount} refs remain; not removing source category`);
          continue;
        }

        if (ARCHIVE_ONLY) {
          await archiveCategory(
            categoriesCol,
            source._id,
            `Merged into ${canonical.name} (${canonical._id})`
          );
          totalArchived += 1;
          console.log("    archived source category");
        } else {
          await categoriesCol.deleteOne({ _id: source._id });
          totalDeleted += 1;
          console.log("    deleted source category");
        }
      }

      if (APPLY) {
        // Safety correction: if earlier runs ever chose an \"Other\" canonical,
        // force all maint/repair refs back to best non-Other canonical.
        await ensureCanonicalNotOther(entriesCol, categoriesCol, target);
      }
    }

    console.log("");
    console.log("=== SUMMARY ===");
    console.log(`sources processed: ${totalSourcesProcessed}`);
    console.log(`entry refs moved: ${totalMoved}`);
    if (APPLY) {
      console.log(`categories deleted: ${totalDeleted}`);
      console.log(`categories archived: ${totalArchived}`);
      console.log("transactions deleted: 0");
    }
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
