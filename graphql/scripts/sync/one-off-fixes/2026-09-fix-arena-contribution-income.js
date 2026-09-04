// Fixes the Arena department's Contribution Income discrepancy for
// FY2025-2026 (a $320 gap between old and new servers).
//
// Root cause: on Sept 2, 2026, someone on the old server deleted 3
// duplicate "Arena - Contribution Income" entries ($300 + $20 + $300) and
// replaced them with a single correct $300 entry - a deliberate cleanup
// action taken entirely on the old server, after the last sync. None of it
// (the 3 deletions or the 1 replacement) ever made it to the new server.
//
// Part 1: soft-deletes the 3 duplicates on new to match old (same
// historized-delete shape deleteEntry uses).
// Part 2: inserts the 1 missing replacement entry, with its category
// remapped from the old-server id (5e26314d520286b1238cda09, "Ministry
// Fees/Income") to the new server's own id for the same category
// (69961ace23f412d6c2ae7c0d - same name, same account number 43000)
// since the old id doesn't exist on the new server at all.
//
// Usage (run ON the new server, against its local mongod):
//   node 2026-09-fix-arena-contribution-income.js "mongodb://localhost:27017/?directConnection=true"
const { MongoClient, ObjectId } = require("mongodb");

async function main() {
  const uri = process.argv[2] || "mongodb://localhost:27017/?directConnection=true";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("accounting");

  const adminUserId = new ObjectId("5de16db089c4360df927a3db");
  const now = new Date();

  console.log("=== Part 1: soft-delete the 3 duplicate entries (matching old server) ===");
  const duplicateIds = [
    "6a3178b4ec4bbd221fb9d2fd", // $300
    "6a3187c4ec4bbd221fb9d303", // $20
    "6a3187e6ec4bbd221fb9d304", // $300
  ];
  for (const idHex of duplicateIds) {
    const result = await db.collection("entries").updateOne(
      { _id: new ObjectId(idHex) },
      {
        $push: { deleted: { $each: [{ value: true, createdBy: adminUserId, createdOn: now }], $position: 0 } },
        $set: { lastUpdate: now },
      }
    );
    console.log(`  ${idHex}: matched=${result.matchedCount} modified=${result.modifiedCount}`);
  }

  console.log("\n=== Part 2: insert the missing replacement entry ===");
  const before = await db.collection("entries").countDocuments({});
  const alreadyExists = await db.collection("entries").findOne({ _id: new ObjectId("6a985f9d7cc5b9f01a4952cf") });
  if (alreadyExists) {
    console.log("SKIP - entry already exists on target");
  } else {
    const doc = {
      _id: new ObjectId("6a985f9d7cc5b9f01a4952cf"),
      lastUpdate: new Date("2026-09-02T17:40:56.375Z"),
      createdOn: new Date("2026-09-02T17:40:44.965Z"),
      createdBy: adminUserId,
      category: [{ value: new ObjectId("69961ace23f412d6c2ae7c0d"), createdBy: adminUserId, createdOn: new Date("2026-09-02T17:40:44.965Z") }],
      date: [{ value: new Date("2026-05-25T17:40:00.000Z"), createdBy: adminUserId, createdOn: new Date("2026-09-02T17:40:44.965Z") }],
      deleted: [{ value: false, createdBy: adminUserId, createdOn: new Date("2026-09-02T17:40:44.965Z") }],
      department: [{ value: new ObjectId("5dc36bbbc7167f67e39cd6b5"), createdBy: adminUserId, createdOn: new Date("2026-09-02T17:40:44.965Z") }],
      paymentMethod: [{ value: { currency: "USD", type: "Online" }, createdBy: adminUserId, createdOn: new Date("2026-09-02T17:40:44.965Z") }],
      reconciled: [
        { value: true, createdBy: adminUserId, createdOn: new Date("2026-09-02T17:40:56.375Z") },
        { value: false, createdBy: adminUserId, createdOn: new Date("2026-09-02T17:40:44.965Z") },
      ],
      source: [{ value: { type: "Person", id: new ObjectId("65ba6630c70580ce95042425") }, createdBy: adminUserId, createdOn: new Date("2026-09-02T17:40:44.965Z") }],
      total: [{ value: { s: 1, n: 300, d: 1 }, createdBy: adminUserId, createdOn: new Date("2026-09-02T17:40:44.965Z") }],
      description: [{ value: "Arena - Contribution Income", createdBy: adminUserId, createdOn: new Date("2026-09-02T17:40:44.965Z") }],
    };
    const result = await db.collection("entries").insertOne(doc);
    console.log("Inserted:", result.insertedId.toHexString());
  }

  const after = await db.collection("entries").countDocuments({});
  console.log(`\nTotal entry count: ${before} -> ${after} (expect +1)`);

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
