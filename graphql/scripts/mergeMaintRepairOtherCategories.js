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
    sourceNames: ["Grounds Maint/Repair - Other"],
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

function chooseCanonical(candidates) {
  if (!candidates.length) return null;
  const sorted = [...candidates].sort((a, b) => {
    const aScore =
      (a.hidden === false ? 2 : 0) +
      (a.active === true ? 2 : 0) +
      (a.groupName ? 1 : 0);
    const bScore =
      (b.hidden === false ? 2 : 0) +
      (b.active === true ? 2 : 0) +
      (b.groupName ? 1 : 0);
    if (aScore !== bScore) return bScore - aScore;
    return String(a._id).localeCompare(String(b._id));
  });
  return sorted[0];
}

async function countEntryRefs(entriesCol, categoryId) {
  return entriesCol.countDocuments({
    "category.0.value": categoryId,
    "deleted.0.value": { $ne: true },
  });
}

async function moveCategoryRefs(entriesCol, fromId, toId) {
  // Category shape is historical array-based audit field.
  return entriesCol.updateMany(
    { "category.0.value": fromId },
    { $set: { "category.0.value": toId } }
  );
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
    console.log("");

    for (const target of TARGETS) {
      const canonicalNorm = normName(target.canonicalName);
      const sourceNorms = target.sourceNames.map(normName);

      const sameType = allCategories.filter(
        (c) => String(c.type || "").toLowerCase() === String(target.type || "").toLowerCase()
      );

      const canonicalCandidates = sameType.filter(
        (c) => normName(c.name) === canonicalNorm
      );
      const canonical = chooseCanonical(canonicalCandidates);

      if (!canonical) {
        console.log(`- ${target.canonicalName}: canonical category not found, skipping`);
        continue;
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
      const sources = Array.from(sourcesById.values());

      console.log(`- ${target.canonicalName}`);
      console.log(`  canonical: ${canonical._id} (${canonical.name})`);

      if (!sources.length) {
        console.log("  no source categories found for merge");
        continue;
      }

      for (const source of sources) {
        const beforeCount = await countEntryRefs(entriesCol, source._id);
        totalSourcesProcessed += 1;

        console.log(`  source: ${source._id} (${source.name}) -> refs: ${beforeCount}`);

        if (!APPLY) continue;

        if (beforeCount > 0) {
          const res = await moveCategoryRefs(entriesCol, source._id, canonical._id);
          totalMoved += res.modifiedCount || 0;
          console.log(`    moved entry refs: ${res.modifiedCount || 0}`);
        }

        const afterCount = await countEntryRefs(entriesCol, source._id);
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
