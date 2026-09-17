// Follow-up to the "hide group categories from the transaction picker" fix.
// That fix correctly hides a category from selection if it has children,
// UNLESS flagged allowStandalone - matching the backend's existing
// validation ("Group category is not permitted... select a specific
// subcategory"). But two categories were incorrectly caught by this even
// though they have real, substantial historical direct usage - they aren't
// pure "folders", they're genuinely both a general category AND a parent
// to one more specific subcategory:
//
//   - "Staff Develop" (88 live entries use it directly, distinct from its
//     one child "Staff Develop: Conf & Seminars")
//   - "Bank Charges" (1 live entry - a general bank fee, distinct from its
//     one child "Bank Charges: eGive Fees")
//
// A full audit found these are the ONLY 2 categories (out of just 3 total
// "group" categories in the whole database) missing this flag despite
// having live direct usage - "Equipment Expense" already has it set,
// confirming this is the established, intended mechanism for exactly this
// situation.
//
// Usage (run ON the new server, against its local mongod):
//   node 2026-09-allow-standalone-group-categories.js "mongodb://localhost:27017/?directConnection=true"
const { MongoClient, ObjectId } = require("mongodb");

async function main() {
  const uri = process.argv[2] || "mongodb://localhost:27017/?directConnection=true";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("accounting");

  const fixes = [
    { id: "5e2891b8aa938a2bcfcdfa01", name: "Staff Develop" },
    { id: "5e2891b8aa938a2bcfcdf9fb", name: "Bank Charges" },
  ];

  for (const fix of fixes) {
    const result = await db.collection("categories").updateOne(
      { _id: new ObjectId(fix.id) },
      { $set: { allowStandalone: true } }
    );
    console.log(`${fix.name}: matched=${result.matchedCount} modified=${result.modifiedCount}`);
  }

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
