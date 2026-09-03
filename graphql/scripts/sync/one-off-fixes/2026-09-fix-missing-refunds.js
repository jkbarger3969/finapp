// One-off remediation: copies 3 refunds from the old server to the new
// server that never made it across during sync.
//
// Root cause: the sync tool's change-detection for an already-synced entry
// relies entirely on comparing the entry's root `lastUpdate` timestamp
// between old and new. The old server's refund-creation code doesn't bump
// the parent entry's `lastUpdate` when a refund is added, so these 3
// entries' `lastUpdate` stayed identical on both servers even after a
// refund was added on the old server well after the entry had already
// synced - the sync tool saw "unchanged" and never re-copied the entry.
//
// Verified system-wide: of 577 refund-bearing entries whose parent already
// existed on the new server, only these 3 are affected (574 matched
// correctly, meaning their refunds were already present at the time of the
// entry's initial sync). All 3 refunds use Card payment method, which is
// already left pointing at the old-server paymentCards id for every
// successfully-synced entry too (out of scope, not remapped) - so these
// can be copied verbatim with no reference remapping needed.
//
// Usage (run ON the new server, against its local mongod):
//   node 2026-09-fix-missing-refunds.js "mongodb://localhost:27017/?directConnection=true"
const fs = require("fs");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

function reviveObjectIds(value) {
  if (Array.isArray(value)) return value.map(reviveObjectIds);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if ((k === "id" || k === "card" || k === "createdBy") && typeof v === "string" && /^[0-9a-f]{24}$/i.test(v)) {
        out[k] = new ObjectId(v);
      } else {
        out[k] = reviveObjectIds(v);
      }
    }
    return out;
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    return new Date(value);
  }
  return value;
}

async function main() {
  const uri = process.argv[2] || "mongodb://localhost:27017/?directConnection=true";
  const dataPath = path.join(__dirname, "2026-09-missing-refunds-data.json");
  const items = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  console.log(`Loaded ${items.length} entries with missing refunds`);

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("accounting");

  const before = await db.collection("entries").countDocuments({});

  let modified = 0;
  for (const item of items) {
    const id = new ObjectId(item.id);
    const existing = await db.collection("entries").findOne({ _id: id });
    if (!existing) {
      console.log(`SKIP ${item.id} - not found on target`);
      continue;
    }
    if (Array.isArray(existing.refunds) && existing.refunds.length > 0) {
      console.log(`SKIP ${item.id} "${item.desc}" - already has ${existing.refunds.length} refund(s), not overwriting`);
      continue;
    }

    const refunds = reviveObjectIds(item.refunds);
    const result = await db.collection("entries").updateOne(
      { _id: id },
      { $set: { refunds } }
    );
    console.log(`${item.id} "${item.desc}" - matched=${result.matchedCount} modified=${result.modifiedCount}`);
    modified += result.modifiedCount;
  }

  console.log(`\nTotal modified: ${modified} (expect ${items.length})`);

  const after = await db.collection("entries").countDocuments({});
  console.log("Total entry count unchanged:", before === after, `(${before} -> ${after})`);

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
