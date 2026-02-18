const { MongoClient, ObjectId } = require('mongodb');

// Mapping of OLD category names to NEW proper category names (based on remote database)
const MERGE_MAP = {
  // === INCOME (Credit) duplicates ===
  "Credit: Donations": "Contribution Income",
  "Credit: Camp Registration": "Scholarship Income",  // Both are 43400
  "Credit: Sponsorship Income": "Fundraiser Income",  // Both are 43450
  "Credit: Income transfer": "Other Income",  // Both are 45000
  "Credit: Unknown Credit": "Other Income",  // Both are 45000
  "Credit: Lone Star Beef Donations": "Animal Sales",  // Both are 45030

  // === EXPENSE (Debit) duplicates ===
  // 61300
  "Debit: Insurance Claims Expense": "Property & Liability Insurance",
  
  // 71620
  "Debit: Sponsored Courses": "Global Courses",
  "Debit: Unsponsored Courses": "Global Courses",
  
  // 72000
  "Supplies: Media": "Equipment Expense: Audio",
  
  // 72200
  "Equipment Expense: Video": "Equipment Expense: Lighting",  // Same account number
  
  // 72300
  "Outside Services: Arena": "Equipment Rental",
  
  // 72400
  "Debit: Stage Design": "Furnishings",
  
  // 72650
  "Supplies: Catering": "Meals: Event Meal",
  
  // 73100
  "Broadcast Time: Radio": "Marketing: Other",
  "Broadcast Time: TV": "Marketing: Other",
  "Marketing: Billboards": "Marketing: Other",
  "Supplies: Other": "Marketing: Other",
  
  // 73200
  "Outside Services: Graphic Design": "Marketing: Printed Materials",
  
  // 73400
  "Debit: Live Streaming Fee": "Marketing: Social Media",
  "Debit: Website": "Marketing: Social Media",
  
  // 73500
  "Debit: Travel/Moving Reimb": "Mileage Reimbursement",
  
  // 73600
  "Debit: Unknown Debit": "Miscellaneous",
  
  // 73800
  "Debit: VIP Guests": "Outside Services: Guest Speaker",
  "Merchandise: Pastor": "Outside Services: Guest Speaker",
  
  // 75050
  "Debit: Refund": "Refund",
  
  // 75200
  "Debit: Roping Series": "Rentals (non equipment)",
  
  // 75910
  "Debit: Education Reimbursement": "Staff Reimbursement Expense",
  
  // 76400
  "Supplies: Office Hospitality": "Supplies: Hospitality",
  
  // 76800
  "Debit: Supplies: Salvation": "Supplies: Materials and Supplies",
  
  // 77100
  "Debit: Property Tax & Assessments": "Taxes, Licenses & Permits",
  
  // 81605
  "Debit: Lone Star Beef": "Meat Purchases",
  
  // 81630
  "Debit: Feedlot Expense": "Feed/Hay",
  
  // 81635
  "Debit: Vet Expense": "Vaccines",
};

async function main() {
  const DB_HOST = process.env.DB_HOST || 'localhost';
  const DB_PORT = process.env.DB_PORT || '27017';
  const DB_USER = process.env.DB_USER;
  const DB_PASS = process.env.DB_PASS;

  let uri;
  if (DB_USER && DB_PASS) {
    uri = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/accounting?authSource=admin`;
  } else {
    uri = `mongodb://${DB_HOST}:${DB_PORT}/accounting`;
  }

  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db('accounting');
    const cats = db.collection('categories');
    const entries = db.collection('entries');

    // Build lookup: name -> category document
    const allCats = await cats.find({}).toArray();
    const catByName = {};
    allCats.forEach(c => {
      const key = `${c.type}:${c.name}`;
      catByName[key] = c;
    });

    let transactionsUpdated = 0;
    let categoriesDeleted = 0;

    console.log('=== MERGING DUPLICATE CATEGORIES ===\n');

    for (const [oldName, newName] of Object.entries(MERGE_MAP)) {
      // Determine type based on prefix or default to Debit
      let type = 'Debit';
      if (oldName.startsWith('Credit:')) {
        type = 'Credit';
      }
      
      const oldKey = `${type}:${oldName}`;
      const newKey = `${type}:${newName}`;
      
      const oldCat = catByName[oldKey];
      const newCat = catByName[newKey];
      
      if (!oldCat) {
        console.log(`  - Skipped (not found): "${oldName}"`);
        continue;
      }
      
      if (!newCat) {
        // New category doesn't exist - just rename the old one
        await cats.updateOne(
          { _id: oldCat._id },
          { $set: { name: newName } }
        );
        console.log(`  Renamed: "${oldName}" -> "${newName}"`);
        continue;
      }
      
      if (oldCat._id.equals(newCat._id)) continue; // Same category
      
      // Update all entries that reference the old category to use the new one
      const updateResult = await entries.updateMany(
        { "category.value": oldCat._id },
        { $set: { "category.$[elem].value": newCat._id } },
        { arrayFilters: [{ "elem.value": oldCat._id }] }
      );
      
      if (updateResult.modifiedCount > 0) {
        console.log(`  Migrated ${updateResult.modifiedCount} entries: "${oldName}" -> "${newName}"`);
        transactionsUpdated += updateResult.modifiedCount;
      }
      
      // Delete the old category
      await cats.deleteOne({ _id: oldCat._id });
      console.log(`  Deleted: "${oldName}"`);
      categoriesDeleted++;
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Transactions updated: ${transactionsUpdated}`);
    console.log(`Categories deleted: ${categoriesDeleted}`);

    // Final count
    const finalCount = await cats.countDocuments({});
    const creditCount = await cats.countDocuments({ type: 'Credit' });
    const debitCount = await cats.countDocuments({ type: 'Debit' });
    
    console.log(`\nFinal category count: ${finalCount}`);
    console.log(`  Income (Credit): ${creditCount}`);
    console.log(`  Expense (Debit): ${debitCount}`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

main();
