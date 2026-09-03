// One-off remediation: the "2026-2027" fiscal year was created with
// different boundary conventions than every other fiscal year on record
// (noon UTC instead of midnight, and an inclusive Aug 31 end instead of the
// exclusive Sept 1 end every other fiscal year uses - see the FiscalYear
// schema doc: "[begin, end)"). That inconsistency creates two small date
// gaps: 2026-09-01T00:00-12:00 UTC (after FY2025-2026 ends, before this one
// begins) and 2027-08-31T12:00-24:00 UTC (after this one ends). Verified no
// entries currently fall in either gap, so this is a safe, no-side-effect
// correction that makes this fiscal year tile cleanly with the rest.
//
// Usage (run ON the new server, against its local mongod):
//   node 2026-09-fix-fiscal-year-2026-2027-boundaries.js "mongodb://localhost:27017/?directConnection=true"
const { MongoClient, ObjectId } = require("mongodb");

async function main() {
  const uri = process.argv[2] || "mongodb://localhost:27017/?directConnection=true";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("accounting");

  const id = new ObjectId("6a9644e27230719aaa07d6cb");
  const before = await db.collection("fiscalYears").findOne({ _id: id });
  console.log("Before:", JSON.stringify({ begin: before.begin, end: before.end }));

  const result = await db.collection("fiscalYears").updateOne(
    { _id: id },
    { $set: { begin: new Date("2026-09-01T00:00:00.000Z"), end: new Date("2027-09-01T00:00:00.000Z") } }
  );
  console.log("Matched:", result.matchedCount, "(expect 1) Modified:", result.modifiedCount);

  const after = await db.collection("fiscalYears").findOne({ _id: id });
  console.log("After:", JSON.stringify({ begin: after.begin, end: after.end }));

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
