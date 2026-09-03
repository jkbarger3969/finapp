// One-off remediation, follow-up to 2026-09-fix-restored-entries-categories.js.
// A full re-scan of all 1470 restored entries (checking category,
// department, source.Department, and paymentMethod.check.account - not just
// category) found exactly one more stale reference the first pass missed:
// this entry's category was already fine, so it wasn't in that pass's
// scope, but its department still pointed at the old-server id for
// "Breeze" instead of the new server's id for the same department.
//
// Usage (run ON the new server, against its local mongod):
//   node 2026-09-fix-dymo-department.js "mongodb://localhost:27017/?directConnection=true"
const { MongoClient, ObjectId } = require("mongodb");

async function main() {
  const uri = process.argv[2] || "mongodb://localhost:27017/?directConnection=true";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("accounting");

  const before = await db.collection("entries").countDocuments({});

  const result = await db.collection("entries").updateOne(
    { _id: new ObjectId("5f677ff7f7935207a0f3930f") },
    { $set: { "department.0.value": new ObjectId("66d3d07025c8744069e98558") } } // Breeze
  );
  console.log("Matched:", result.matchedCount, "(expect 1) Modified:", result.modifiedCount);

  const after = await db.collection("entries").countDocuments({});
  console.log("Total entry count unchanged:", before === after, `(${before} -> ${after})`);

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
