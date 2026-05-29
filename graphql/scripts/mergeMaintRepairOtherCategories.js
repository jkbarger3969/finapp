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

function hasMaintRepairTokens(name) {
  const n = normName(name);
  return n.includes("maint") && n.includes("repair");
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
    hasMaintRepairTokens(nameNorm) &&
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

async function run() {
  const uri = buildMongoUri();
  const client = new MongoClient(uri);

  console.log(`Connecting to ${DB_HOST}:${DB_PORT}/${DB_NAME} ...`);
  await client.connect();
  const db = client.db(DB_NAME);
  const categoriesCol = db.collection("categories");
  const entriesCol = db.collection("entries");

  let totalMoved = 0;
  let totalSourcesProcessed = 0;
  let totalDeleted = 0;
  let totalArchived = 0;

  try {
    const allCategories = await categoriesCol
      .find({}, { projection: { _id: 1, name: 1, type: 1, hidden: 1, active: 1, groupName: 1 } })
      .toArray();

    console.log(`Loaded ${allCategories.length} categories`);
    console.log(APPLY ? "MODE: APPLY" : "MODE: DRY-RUN");
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
