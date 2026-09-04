// Fixes a category-id collision: the old server's "Fundraiser Expense"
// (Debit, acct 71850) category id was reused on the new server for an
// unrelated category, "HPYF Team Roping Expense" (Debit, acct 81621). Since
// both are Debit, the sync tool's type-compatibility guard didn't catch it
// (same failure mode as the earlier Stock Fees id collision, just same-type
// this time). All 325 entries that reference this id (Women's Ministry,
// Missions Ministry, Three Cross Meat Ministry) currently display under the
// wrong category name. The new server has its own separate, correctly
// account-numbered "Fundraiser Expense" category (also acct 71850) - this
// remaps all 325 entries to point at that instead. Never touches the "HPYF
// Team Roping Expense" category itself, which stays available for whatever
// it's actually meant to track going forward.
//
// Usage (run ON the new server, against its local mongod):
//   node 2026-09-fix-fundraiser-expense-category.js "mongodb://localhost:27017/?directConnection=true"
const { MongoClient, ObjectId } = require("mongodb");

async function main() {
  const uri = process.argv[2] || "mongodb://localhost:27017/?directConnection=true";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("accounting");

  const wrongCatId = new ObjectId("67ae3f788e0dbcebd48abf0f"); // "HPYF Team Roping Expense" on new server
  const correctCatId = new ObjectId("69961acf23f412d6c2ae7c28"); // new server's own "Fundraiser Expense"

  const before = await db.collection("entries").countDocuments({});
  const matching = await db.collection("entries").countDocuments({ "category.0.value": wrongCatId });
  console.log(`Entries currently pointing at the wrong category: ${matching} (expect 325)`);

  const result = await db.collection("entries").updateMany(
    { "category.0.value": wrongCatId },
    { $set: { "category.0.value": correctCatId } }
  );
  console.log("Matched:", result.matchedCount, "Modified:", result.modifiedCount);

  const after = await db.collection("entries").countDocuments({});
  console.log("Total entry count unchanged:", before === after, `(${before} -> ${after})`);

  const remaining = await db.collection("entries").countDocuments({ "category.0.value": wrongCatId });
  console.log("Entries still pointing at wrong category (expect 0):", remaining);

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
