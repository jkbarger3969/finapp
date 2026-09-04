// Fixes 7 department budget records for FY2025-2026 where the new server's
// amount has drifted from the old server's. These are the SAME document
// (identical _id on both servers - confirmed, not a sync gap) - budgets
// were copied once, and every prior fiscal year still matches perfectly on
// both sides, but this year's amount was edited independently on one side
// since. Per user direction, the old server is authoritative for the
// current year's budget, same as every other fix this session - updates
// new to match old's current value.
//
// Does NOT touch the 7 budget records that exist ONLY on the new server
// (General & Administrative, Missions, TECH, Adult Ministries, Connect
// Ministries, IT, Breeze) - user decided those should be left alone, since
// there's no old-server record to compare against or restore from.
//
// Usage (run ON the new server, against its local mongod):
//   node 2026-09-fix-budget-amounts-group-a.js "mongodb://localhost:27017/?directConnection=true"
const { MongoClient, ObjectId } = require("mongodb");

async function main() {
  const uri = process.argv[2] || "mongodb://localhost:27017/?directConnection=true";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("accounting");

  const fixes = [
    { id: "690ed11b5cfc94198d272959", dept: "Student Ministry", amount: 59020 },
    { id: "690ed11c5cfc94198d27295f", dept: "Children's Ministry", amount: 49600 },
    { id: "690ed11c5cfc94198d272962", dept: "Mother's Day Out", amount: 0 },
    { id: "690ed11d5cfc94198d272965", dept: "Arena", amount: 49350 },
    { id: "690ed11d5cfc94198d272968", dept: "Building and Construction", amount: 86000 },
    { id: "690ed11e5cfc94198d27296b", dept: "RBC", amount: 0 },
    { id: "690ed11e5cfc94198d27296e", dept: "Three Cross Meat Ministry", amount: 236965 },
  ];

  for (const fix of fixes) {
    const before = await db.collection("budgets").findOne({ _id: new ObjectId(fix.id) });
    const beforeAmt = before?.amount ? (before.amount.s * before.amount.n) / before.amount.d : null;

    const result = await db.collection("budgets").updateOne(
      { _id: new ObjectId(fix.id) },
      { $set: { amount: { s: 1, n: fix.amount, d: 1 } } }
    );
    console.log(`${fix.dept}: before=$${beforeAmt} after=$${fix.amount} matched=${result.matchedCount} modified=${result.modifiedCount}`);
  }

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
