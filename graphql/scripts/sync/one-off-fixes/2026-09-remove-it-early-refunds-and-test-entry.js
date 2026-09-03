// One-off remediation, two parts:
//
// Part 1: Removes 2 refunds from the new server that don't exist on the old
// server. Both parent purchases ("Rack mount nuts", "Outdoor Fiber Patch")
// exist correctly on both servers, but these two refunds were entered
// directly on the new app back in Dec 2025 - before the officially
// sanctioned dual-use period, which per the user only ever covered
// Maintenance and Product. Since the old server was authoritative for every
// other department until the real cutover, these are removed from the new
// server to match. Soft-deleted the same way the app's own deleteEntryRefund
// mutation does (push {value:true} onto the refund's historized `deleted`
// field), not physically removed, to preserve the audit trail.
//
// Part 2: Hard-deletes one confirmed test entry ("Check refund test entry",
// $55, TECH dept) plus its own $55 test refund, found while auditing the
// same pre-cutover new-server-only data. The other two test entries found
// in that audit ("test" and "Test 4") were already soft-deleted by someone
// else, so no action needed for those.
//
// Usage (run ON the new server, against its local mongod):
//   node 2026-09-remove-it-early-refunds-and-test-entry.js "mongodb://localhost:27017/?directConnection=true"
const { MongoClient, ObjectId } = require("mongodb");

async function main() {
  const uri = process.argv[2] || "mongodb://localhost:27017/?directConnection=true";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("accounting");

  const adminUserId = new ObjectId("5de16db089c4360df927a3db");
  const now = new Date();

  console.log("=== Part 1: soft-delete the 2 IT refunds not present on the old server ===");
  const refundFixes = [
    { entryId: "693d8932ea2a989ba4a1714b", refundId: "69516968c62c43d8269a1ba3", desc: "Mounting adapter ($11.36)" },
    { entryId: "692dc090ea2a989ba4a17057", refundId: "695168d9c62c43d8269a1ba2", desc: "Fiber optic stripper ($86)" },
  ];

  for (const fix of refundFixes) {
    const result = await db.collection("entries").updateOne(
      { "refunds.id": new ObjectId(fix.refundId) },
      {
        $push: { "refunds.$.deleted": { $each: [{ value: true, createdBy: adminUserId, createdOn: now }], $position: 0 } },
        $set: { "refunds.$.lastUpdate": now },
      }
    );
    console.log(`  ${fix.desc}: matched=${result.matchedCount} modified=${result.modifiedCount}`);
  }

  console.log("\n=== Part 2: hard-delete the confirmed test entry and its test refund ===");
  const before = await db.collection("entries").countDocuments({});
  const delResult = await db.collection("entries").deleteMany({
    _id: { $in: [new ObjectId("69921650de3a870ba5c95101")] },
  });
  console.log("Deleted count:", delResult.deletedCount, "(expect 1)");
  const after = await db.collection("entries").countDocuments({});
  console.log("Entry count:", before, "->", after);

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
