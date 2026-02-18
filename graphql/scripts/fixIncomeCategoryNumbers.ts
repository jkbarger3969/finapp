import { MongoClient } from "mongodb";

const INCOME_CATEGORY_NUMBERS: Record<string, string> = {
  "Contribution Income": "41000",
  "Ministry Fees/Income": "43000",
  "Merchandise Sales": "43100",
  "Music Sales": "43200",
  "Scholarship Income": "43400",
  "Fundraiser Income": "43450",
  "Reimbursement Income": "43500",
  "Facility/Rent Income": "44000",
  "Unrealized Gain/Loss Investments": "44500",
  "Other Income": "45000",
  "Stock Fees": "45020",
  "Animal Sales": "45030",
  "Interest Income": "90000",
  "Dividend Income": "91000",
};

async function main() {
  const DB_HOST = process.env.DB_HOST || "localhost";
  const DB_PORT = process.env.DB_PORT || "27017";
  const DB_USER = process.env.DB_USER;
  const DB_PASS = process.env.DB_PASS;

  let uri: string;
  if (DB_USER && DB_PASS) {
    uri = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/accounting?authSource=admin`;
  } else {
    uri = `mongodb://${DB_HOST}:${DB_PORT}/accounting`;
  }

  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("accounting");
    const categoriesCollection = db.collection("categories");

    console.log("\n=== Updating Income Categories with Account Numbers ===\n");

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const [name, accountNumber] of Object.entries(INCOME_CATEGORY_NUMBERS)) {
      // Find by name and type Credit (income)
      const existing = await categoriesCollection.findOne({
        name: name,
        type: "Credit"
      });

      if (existing) {
        if (existing.accountNumber === accountNumber) {
          console.log(`✓ Already has number: ${accountNumber} - ${name}`);
        } else {
          await categoriesCollection.updateOne(
            { _id: existing._id },
            { $set: { accountNumber: accountNumber } }
          );
          console.log(`✓ Updated: ${accountNumber} - ${name}`);
          updatedCount++;
        }
      } else {
        console.log(`✗ NOT FOUND: ${name} - will need to be created`);
        notFoundCount++;
      }
    }

    console.log("\n=== Summary ===");
    console.log(`Updated: ${updatedCount}`);
    console.log(`Not found: ${notFoundCount}`);

    // Verify the results
    console.log("\n=== Verification - Income Categories ===");
    const incomeCategories = await categoriesCollection
      .find({ type: "Credit" })
      .sort({ accountNumber: 1 })
      .toArray();

    incomeCategories.forEach((cat) => {
      console.log(`${cat.accountNumber || "NO_NUM"} - ${cat.name}`);
    });

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\nDisconnected from MongoDB");
  }
}

main();
