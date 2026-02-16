import { MongoClient, Db } from "mongodb";

async function unhideParentCategories(db: Db) {
  const categoriesCollection = db.collection("categories");
  
  console.log("\n========================================");
  console.log("Unhiding parent categories");
  console.log("========================================\n");
  
  // Find all hidden categories that are parent categories (referenced by others)
  const allCategories = await categoriesCollection.find({}).toArray();
  
  // Build set of parent IDs
  const parentIds = new Set<string>();
  allCategories.forEach(c => {
    if (c.parent) parentIds.add(c.parent.toString());
  });
  
  // Unhide parent categories (except Income/Expense root)
  let unhiddenCount = 0;
  for (const cat of allCategories) {
    if (parentIds.has(cat._id.toString()) && cat.hidden && cat.name !== "Income" && cat.name !== "Expense") {
      await categoriesCollection.updateOne(
        { _id: cat._id },
        { $set: { hidden: false, sortOrder: 50 } }
      );
      console.log(`Unhidden: "${cat.name}"`);
      unhiddenCount++;
    }
  }
  
  console.log(`\nUnhidden ${unhiddenCount} parent categories`);
  
  // Show current state
  const visibleCategories = await categoriesCollection.find({ hidden: { $ne: true } }).toArray();
  console.log(`\nTotal visible categories: ${visibleCategories.length}`);
}

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
    await unhideParentCategories(db);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\nDisconnected from MongoDB");
  }
}

main();
