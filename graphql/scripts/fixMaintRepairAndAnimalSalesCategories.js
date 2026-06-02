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

function uri() {
  if (DB_USER && DB_PASS) {
    return `mongodb://${encodeURIComponent(DB_USER)}:${encodeURIComponent(
      DB_PASS
    )}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;
  }
  return `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

function norm(v) {
  return String(v || "")
    .normalize("NFKC")
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

async function countRefs(entries, categoryId) {
  return entries.countDocuments({
    "category.0.value": categoryId,
    "deleted.0.value": { $ne: true },
  });
}

async function moveRefs(entries, fromId, toId) {
  return entries.updateMany(
    { "category.0.value": fromId },
    { $set: { "category.0.value": toId } }
  );
}

function chooseBest(candidates) {
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => {
    const aScore =
      (a.hidden === false ? 3 : 0) +
      (a.active === true ? 2 : 0) +
      (a.groupName ? 1 : 0);
    const bScore =
      (b.hidden === false ? 3 : 0) +
      (b.active === true ? 2 : 0) +
      (b.groupName ? 1 : 0);
    if (aScore !== bScore) return bScore - aScore;
    return String(a._id).localeCompare(String(b._id));
  })[0];
}

async function ensureCategory(categories, desired) {
  const all = await categories
    .find({ type: desired.type }, { projection: { _id: 1, name: 1, type: 1, groupName: 1, hidden: 1, active: 1, sortOrder: 1 } })
    .toArray();
  const same = all.filter((c) => norm(c.name) === norm(desired.name));
  const keep = chooseBest(same);
  if (keep) return { keep, created: false };
  const ins = await categories.insertOne({
    name: desired.name,
    type: desired.type,
    groupName: desired.groupName || desired.name,
    sortOrder: desired.sortOrder ?? null,
    hidden: false,
    active: true,
  });
  const created = await categories.findOne({ _id: ins.insertedId });
  return { keep: created, created: true };
}

async function archiveOrDelete(categories, category, note) {
  if (ARCHIVE_ONLY) {
    await categories.updateOne(
      { _id: category._id },
      {
        $set: { hidden: true, active: false },
        $push: {
          mergeNotes: { at: new Date(), note },
        },
      }
    );
    return "archived";
  }
  await categories.deleteOne({ _id: category._id });
  return "deleted";
}

async function mergeDuplicates(categories, entries, name, type) {
  const list = await categories
    .find({ type, name }, { projection: { _id: 1, name: 1, type: 1, groupName: 1, hidden: 1, active: 1 } })
    .toArray();
  if (list.length <= 1) {
    return { kept: list[0] || null, moved: 0, touched: 0, actioned: 0 };
  }
  const keep = chooseBest(list);
  const losers = list.filter((c) => !c._id.equals(keep._id));
  let moved = 0;
  let touched = 0;
  let actioned = 0;

  for (const loser of losers) {
    const refs = await countRefs(entries, loser._id);
    touched += refs;
    if (APPLY && refs > 0) {
      const res = await moveRefs(entries, loser._id, keep._id);
      moved += res.modifiedCount || 0;
    }
    if (APPLY) {
      const remaining = await countRefs(entries, loser._id);
      if (remaining === 0) {
        const action = await archiveOrDelete(
          categories,
          loser,
          `Merged duplicate ${type} '${name}' into ${keep._id}`
        );
        actioned += 1;
        console.log(`    ${action} duplicate: ${loser._id}`);
      }
    }
  }

  return { kept: keep, moved, touched, actioned };
}

async function run() {
  const client = new MongoClient(uri());
  await client.connect();
  const db = client.db(DB_NAME);
  const categories = db.collection("categories");
  const entries = db.collection("entries");

  console.log(`Connected ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  console.log(APPLY ? "MODE: APPLY" : "MODE: DRY-RUN");

  try {
    // 1) Ensure standalone Debit Maint/Repair exists
    const maint = await ensureCategory(categories, {
      name: "Maint/Repair",
      type: "Debit",
      groupName: "Maint/Repair",
    });
    if (maint.created) {
      console.log(`- created Debit category 'Maint/Repair' -> ${maint.keep._id}`);
    } else {
      console.log(`- found Debit category 'Maint/Repair' -> ${maint.keep._id}`);
    }

    // 2) Deduplicate Credit Animal Sales into one canonical
    console.log("- deduping Credit 'Animal Sales' categories");
    const animal = await mergeDuplicates(categories, entries, "Animal Sales", "Credit");
    if (animal.kept) {
      console.log(`  canonical: ${animal.kept._id}`);
      console.log(`  refs touched: ${animal.touched}`);
      console.log(`  refs moved: ${animal.moved}`);
      console.log(`  duplicate categories removed/archived: ${animal.actioned}`);
    } else {
      console.log("  no Credit 'Animal Sales' categories found");
    }

    // 3) Also dedupe Debit Maint/Repair if accidental dupes exist
    console.log("- deduping Debit 'Maint/Repair' categories");
    const maintDedup = await mergeDuplicates(categories, entries, "Maint/Repair", "Debit");
    if (maintDedup.kept) {
      console.log(`  canonical: ${maintDedup.kept._id}`);
      console.log(`  refs touched: ${maintDedup.touched}`);
      console.log(`  refs moved: ${maintDedup.moved}`);
      console.log(`  duplicate categories removed/archived: ${maintDedup.actioned}`);
    } else {
      console.log("  no Debit 'Maint/Repair' category found");
    }

    console.log("");
    console.log("SUMMARY");
    console.log(`transactions deleted: 0`);
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
