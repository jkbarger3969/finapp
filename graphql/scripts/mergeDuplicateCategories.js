const { MongoClient, ObjectId } = require('mongodb');

// Mapping of OLD category names to NEW proper category names
// Format: { oldName: newName }
const MERGE_MAP = {
  // Income duplicates - keep the proper names
  "Credit": "Contribution Income",
  "Donations": "Contribution Income",
  
  // Supplies - merge short names to "Supplies: X" format
  "Cleaning": "Supplies: Cleaning",
  "Hospitality": "Supplies: Hospitality",
  "Office Hospitality": "Supplies: Hospitality",
  "Kitchen": "Supplies: Kitchen",
  "Office": "Supplies: Office",
  "Promotional Items": "Supplies: Promotional Items",
  "Materials and Supplies": "Supplies: Materials and Supplies",
  "Supplies": "Supplies: Materials and Supplies",
  "Supplies: Salvation": "Supplies: Materials and Supplies",
  "Communion": "Supplies: Communion",
  "Baptism": "Supplies: Baptism",
  
  // Equipment Expense - merge to "Equipment Expense: X" format
  "Audio": "Equipment Expense: Audio",
  "Media": "Equipment Expense: Audio",
  "Lighting": "Equipment Expense: Lighting",
  "Video": "Equipment Expense: Lighting",  // Video and Lighting share same account number
  
  // Capital Improvements
  "Equipment": "Capital Improvements: Equipment",
  "Capital Improvements": "Capital Improvements: Equipment",
  "Building": "Capital Improvements: Building",
  
  // Bank Charges
  "eGive Fees": "Bank Charges: eGive Fees",
  
  // Meals
  "Event Meal": "Meals: Event Meal",
  "Catering": "Meals: Event Meal",
  "Meals": "Meals: Event Meal",
  "Travel": "Meals: Travel",
  
  // Marketing
  "Marketing": "Marketing: Other",
  "Other": "Marketing: Other",  // Note: "Other" has multiple meanings, defaulting to Marketing
  "Billboards": "Marketing: Other",
  "Broadcast Time": "Marketing: Other",
  "Radio": "Marketing: Other",
  "TV": "Marketing: Other",
  "Graphic Design": "Marketing: Printed Materials",
  "Printed Materials": "Marketing: Printed Materials",
  "Promotions/Discounts": "Marketing: Promotions/Discounts",
  "Social Media": "Marketing: Social Media",
  "Live Streaming Fee": "Marketing: Social Media",
  "Website": "Marketing: Social Media",
  
  // Outside Services
  "Background Check": "Outside Services: Background Check",
  "Guest Speaker": "Outside Services: Guest Speaker",
  "Pastor": "Outside Services: Guest Speaker",
  "VIP Guests": "Outside Services: Guest Speaker",
  "Security": "Outside Services: Security",
  "Childcare": "Outside Services: Childcare",
  "Contract Services": "Outside Services: Contract Services",
  "Janitorial": "Outside Services: Janitorial",
  "Musicians": "Outside Services: Musicians",
  "Outside Services": "Outside Services: Other",
  "Printing": "Outside Services: Printing",
  
  // Staff Develop
  "Conf & Seminars": "Staff Develop: Conf & Seminars",
  
  // Utilities
  "Utilities": "Utilities: Electricity",
  "Electricity": "Utilities: Electricity",
  "Gas": "Utilities: Gas",
  "Phone": "Utilities: Phone",
  "Internet": "Utilities: Internet",
  "Refuse": "Utilities: Refuse",
  "Water & Sewer": "Utilities: Water & Sewer",
  
  // Ranch/Animals
  "Lone Star Beef": "Meat Purchases",
  "Feedlot Expense": "Feed/Hay",
  "Vet Expense": "Vaccines",
  
  // Merchandise
  "Clothing, CDs": "Merchandise: Clothing, CDs",
  "Merchandise": "Merchandise: Clothing, CDs",
  
  // Misc duplicates
  "Debit": "Miscellaneous",
  "Unknown Debit": "Miscellaneous",
  "Education Reimbursement": "Staff Reimbursement Expense",
  "Roping Series": "Rentals (non equipment)",
  "Insurance Claims Expense": "Property & Liability Insurance",
  "Arena": "Equipment Rental",
  "Stage Design": "Furnishings",
  "Travel/Moving Reimb": "Mileage Reimbursement",
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
      // Find both old and new categories (check both Credit and Debit)
      for (const type of ['Credit', 'Debit']) {
        const oldKey = `${type}:${oldName}`;
        const newKey = `${type}:${newName}`;
        
        const oldCat = catByName[oldKey];
        const newCat = catByName[newKey];
        
        if (!oldCat) continue; // Old category doesn't exist for this type
        
        if (!newCat) {
          // New category doesn't exist - just rename the old one
          await cats.updateOne(
            { _id: oldCat._id },
            { $set: { name: newName } }
          );
          console.log(`  Renamed: "${oldName}" -> "${newName}" (${type})`);
          continue;
        }
        
        if (oldCat._id.equals(newCat._id)) continue; // Same category
        
        // Update all entries that reference the old category to use the new one
        // Entries store category as historical field: category: [{ value: ObjectId, ... }]
        const updateResult = await entries.updateMany(
          { "category.value": oldCat._id },
          { $set: { "category.$[elem].value": newCat._id } },
          { arrayFilters: [{ "elem.value": oldCat._id }] }
        );
        
        if (updateResult.modifiedCount > 0) {
          console.log(`  Migrated ${updateResult.modifiedCount} entries: "${oldName}" -> "${newName}" (${type})`);
          transactionsUpdated += updateResult.modifiedCount;
        }
        
        // Delete the old category
        await cats.deleteOne({ _id: oldCat._id });
        console.log(`  Deleted duplicate: "${oldName}" (${type})`);
        categoriesDeleted++;
      }
    }

    // Also handle duplicate "Staff Develop" and "Equipment Expense" entries
    console.log('\n=== Removing exact duplicates ===\n');
    
    const duplicateNames = ["Staff Develop", "Equipment Expense", "Bank Charges", "Other"];
    for (const name of duplicateNames) {
      for (const type of ['Credit', 'Debit']) {
        const dups = allCats.filter(c => c.name === name && c.type === type);
        if (dups.length > 1) {
          // Keep the first one, merge others into it
          const keepCat = dups[0];
          for (let i = 1; i < dups.length; i++) {
            const dupCat = dups[i];
            
            // Update entries
            const updateResult = await entries.updateMany(
              { "category.value": dupCat._id },
              { $set: { "category.$[elem].value": keepCat._id } },
              { arrayFilters: [{ "elem.value": dupCat._id }] }
            );
            
            if (updateResult.modifiedCount > 0) {
              console.log(`  Migrated ${updateResult.modifiedCount} entries from duplicate "${name}"`);
              transactionsUpdated += updateResult.modifiedCount;
            }
            
            await cats.deleteOne({ _id: dupCat._id });
            console.log(`  Deleted exact duplicate: "${name}" (${type})`);
            categoriesDeleted++;
          }
        }
      }
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
