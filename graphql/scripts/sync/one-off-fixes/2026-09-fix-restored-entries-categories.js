// One-off remediation: fixes 1213 entries restored from the old-server
// backup (the "552-bucket" false-positive-deletion restore) whose
// category/department still pointed at raw OLD-SERVER ids instead of the
// new server's ids for the same reference doc.
//
// Root cause: the restore re-inserted the untouched old-server documents
// verbatim (insertMany) to guarantee data fidelity, but that bypassed the
// sync tool's reference-remapping step. Entries whose category happened to
// keep the same _id across both servers still resolved fine; ~1213 whose
// category was renamed/split/renumbered during the original migration were
// left pointing at nothing on the new server - rendering as "Uncategorized"
// in the UI and skewing category/balance views.
//
// Every target id in the accompanying .json was computed via the exact same
// validated mapReferenceData()/remapEntryReferences() logic the sync tool
// itself uses (business-key matching + known category overrides + the
// Repair & Maint per-transaction split) - not guessed. One entry
// (665f62048e0e8ab78eefb1eb) also had a stale department reference (old
// "IT" department id); its correction is hardcoded below since it's the
// only case found.
//
// Usage (run ON the new server, against its local mongod):
//   node 2026-09-fix-restored-entries-categories.js "mongodb://localhost:27017/?directConnection=true"
const fs = require("fs");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

async function main() {
  const uri = process.argv[2] || "mongodb://localhost:27017/?directConnection=true";
  const fixesPath = path.join(__dirname, "2026-09-restored-entries-category-fixes.json");
  const fixes = JSON.parse(fs.readFileSync(fixesPath, "utf8"));

  console.log(`Loaded ${fixes.length} fixes from ${fixesPath}`);
  console.log(`Connecting to ${uri}...`);

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("accounting");

  const before = await db.collection("entries").countDocuments({});

  const ops = fixes.map((f) => {
    const set = { "category.0.value": new ObjectId(f.newCatId) };
    if (f.deptChanged) {
      set["department.0.value"] = new ObjectId("66d3d07025c8744069e98556"); // IT
    }
    return {
      updateOne: {
        filter: { _id: new ObjectId(f.id) },
        update: { $set: set },
      },
    };
  });

  const result = await db.collection("entries").bulkWrite(ops, { ordered: false });
  console.log("Matched:", result.matchedCount, `(expect ${fixes.length})`, "Modified:", result.modifiedCount);

  const after = await db.collection("entries").countDocuments({});
  console.log("Total entry count unchanged:", before === after, `(${before} -> ${after})`);

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
