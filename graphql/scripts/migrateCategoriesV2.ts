import { MongoClient, Db } from "mongodb";

interface CategoryMapping {
  originalName: string;
  accountNumber: string;
  groupName?: string;
  sortOrder: number;
}

const CATEGORY_MAPPINGS: CategoryMapping[] = [
  // INCOME - Match EXACT names from your database
  { originalName: "Contribution Income", accountNumber: "41000", sortOrder: 100 },
  { originalName: "Ministry Fees/Income", accountNumber: "43000", sortOrder: 200 },
  { originalName: "Merchandise Sales", accountNumber: "43100", sortOrder: 300 },
  { originalName: "Music Sales", accountNumber: "43200", sortOrder: 400 },
  { originalName: "Scholarship Income", accountNumber: "43400", sortOrder: 500 },
  { originalName: "Fundraiser Income", accountNumber: "43450", sortOrder: 600 },
  { originalName: "Reimbursement Income", accountNumber: "43500", sortOrder: 700 },
  { originalName: "Facility/Rent Income", accountNumber: "44000", sortOrder: 800 },
  { originalName: "Unrealized Gain/Loss Investments", accountNumber: "44500", sortOrder: 900 },
  { originalName: "Other Income", accountNumber: "45000", sortOrder: 1000 },
  { originalName: "Stock Fees", accountNumber: "45020", sortOrder: 1100 },
  { originalName: "Animal Sales", accountNumber: "45030", sortOrder: 1200 },
  { originalName: "Interest Income", accountNumber: "90000", sortOrder: 1300 },
  { originalName: "Dividend Income", accountNumber: "91000", sortOrder: 1400 },
  { originalName: "Donations", accountNumber: "41001", sortOrder: 150 },
  { originalName: "Sponsorship Income", accountNumber: "43410", sortOrder: 550 },
  { originalName: "Camp Registration", accountNumber: "43420", sortOrder: 560 },
  { originalName: "Lone Star Beef Donations", accountNumber: "45040", sortOrder: 1250 },

  // EXPENSE - Payroll (use groupName for grouping in UI)
  { originalName: "Payroll: Staff wages", accountNumber: "51100", groupName: "Payroll", sortOrder: 100 },
  { originalName: "Payroll: Employer FICA", accountNumber: "51200", groupName: "Payroll", sortOrder: 110 },
  
  // Benefits
  { originalName: "Benefits: Medical", accountNumber: "51500", groupName: "Benefits", sortOrder: 200 },
  { originalName: "Benefits: Dental and Vision", accountNumber: "51600", groupName: "Benefits", sortOrder: 210 },
  { originalName: "Benefits: Child Care Match Expense", accountNumber: "51610", groupName: "Benefits", sortOrder: 220 },
  { originalName: "Benefits: Life", accountNumber: "51700", groupName: "Benefits", sortOrder: 230 },
  
  // Property & Insurance
  { originalName: "Mortgage Principle/Interest", accountNumber: "61100", sortOrder: 300 },
  { originalName: "Property & Liability Insurance", accountNumber: "61300", sortOrder: 310 },
  { originalName: "Workers Comp Insurance", accountNumber: "61400", sortOrder: 320 },
  
  // Capital Improvements - Your DB has just "Capital Improvements"
  { originalName: "Capital Improvements", accountNumber: "61600", groupName: "Capital Improvements", sortOrder: 400 },
  
  // Bank Charges - Your DB has just "Bank Charges"
  { originalName: "Bank Charges", accountNumber: "71100", sortOrder: 500 },
  
  // General Expenses
  { originalName: "Benevolence Expense", accountNumber: "71300", sortOrder: 600 },
  { originalName: "Curriculum & Resources", accountNumber: "71600", sortOrder: 610 },
  { originalName: "Global Courses", accountNumber: "71620", sortOrder: 620 },
  { originalName: "Dues & Fees", accountNumber: "71700", sortOrder: 630 },
  { originalName: "Database Software Fees", accountNumber: "71710", sortOrder: 640 },
  { originalName: "Fundraiser Expense", accountNumber: "71850", sortOrder: 650 },
  
  // Equipment Expense - Your DB has just "Equipment Expense"
  { originalName: "Equipment Expense", accountNumber: "71900", groupName: "Equipment Expense", sortOrder: 700 },
  { originalName: "Equipment Rental", accountNumber: "72300", groupName: "Equipment Expense", sortOrder: 730 },
  { originalName: "Furnishings", accountNumber: "72400", sortOrder: 740 },
  
  // Meals - Your DB has just "Meals"
  { originalName: "Meals", accountNumber: "72650", groupName: "Meals", sortOrder: 800 },
  { originalName: "Catering", accountNumber: "72660", groupName: "Meals", sortOrder: 805 },
  { originalName: "Travel/Lodging", accountNumber: "72710", sortOrder: 820 },
  
  // Marketing - Your DB has just "Marketing"
  { originalName: "Marketing", accountNumber: "73100", groupName: "Marketing", sortOrder: 900 },
  
  // General 2
  { originalName: "Mileage Reimbursement", accountNumber: "73500", sortOrder: 1000 },
  { originalName: "Miscellaneous", accountNumber: "73600", sortOrder: 1010 },
  
  // Outside Services - Your DB has just "Outside Services"
  { originalName: "Outside Services", accountNumber: "73700", groupName: "Outside Services", sortOrder: 1100 },
  
  // General 3
  { originalName: "Postage", accountNumber: "74800", sortOrder: 1200 },
  { originalName: "Prizes and Gifts", accountNumber: "74900", sortOrder: 1210 },
  { originalName: "Games", accountNumber: "74910", sortOrder: 1220 },
  { originalName: "Professional Services", accountNumber: "75000", sortOrder: 1230 },
  { originalName: "Refund", accountNumber: "75050", sortOrder: 1240 },
  { originalName: "Staffing Placement Fees", accountNumber: "75100", sortOrder: 1250 },
  { originalName: "Rentals (non equipment)", accountNumber: "75200", sortOrder: 1260 },
  
  // Repair & Maintenance
  { originalName: "Repair & Maint", accountNumber: "75300", groupName: "Repair & Maintenance", sortOrder: 1300 },
  { originalName: "Grounds Maint/Repair", accountNumber: "75340", groupName: "Repair & Maintenance", sortOrder: 1310 },
  { originalName: "Building Maint/Repair", accountNumber: "75350", groupName: "Repair & Maintenance", sortOrder: 1320 },
  
  // General 4
  { originalName: "Sponsorship Expense", accountNumber: "75410", sortOrder: 1400 },
  { originalName: "Sermon Illustration", accountNumber: "75500", sortOrder: 1410 },
  { originalName: "Signage", accountNumber: "75600", sortOrder: 1420 },
  { originalName: "Staff Appreciation", accountNumber: "75700", sortOrder: 1430 },
  
  // Staff Development - Your DB has "Staff Develop"
  { originalName: "Staff Develop", accountNumber: "75800", groupName: "Staff Development", sortOrder: 1500 },
  
  // General 5
  { originalName: "Subscriptions", accountNumber: "76100", sortOrder: 1600 },
  { originalName: "Flowers and Gifts", accountNumber: "76110", sortOrder: 1610 },
  
  // Supplies - Your DB has simple names like "Cleaning", "Kitchen" etc.
  { originalName: "Cleaning", accountNumber: "76300", groupName: "Supplies", sortOrder: 1700 },
  { originalName: "Hospitality", accountNumber: "76400", groupName: "Supplies", sortOrder: 1710 },
  { originalName: "Kitchen", accountNumber: "76500", groupName: "Supplies", sortOrder: 1720 },
  { originalName: "Office", accountNumber: "76600", groupName: "Supplies", sortOrder: 1730 },
  { originalName: "Promotional Items", accountNumber: "76700", groupName: "Supplies", sortOrder: 1740 },
  { originalName: "Materials and Supplies", accountNumber: "76800", groupName: "Supplies", sortOrder: 1750 },
  { originalName: "Communion", accountNumber: "76950", groupName: "Supplies", sortOrder: 1760 },
  { originalName: "Baptism", accountNumber: "76960", groupName: "Supplies", sortOrder: 1770 },
  { originalName: "Supplies", accountNumber: "76000", groupName: "Supplies", sortOrder: 1690 },
  { originalName: "Supplies: Salvation", accountNumber: "76970", groupName: "Supplies", sortOrder: 1780 },
  { originalName: "Office Hospitality", accountNumber: "76410", groupName: "Supplies", sortOrder: 1715 },
  
  // General 6
  { originalName: "Café Concess/Snack", accountNumber: "77050", sortOrder: 1800 },
  { originalName: "Taxes, Licenses & Permits", accountNumber: "77100", sortOrder: 1810 },
  
  // Utilities - Your DB has simple names like "Electricity", "Gas" etc.
  { originalName: "Electricity", accountNumber: "77200", groupName: "Utilities", sortOrder: 1900 },
  { originalName: "Gas", accountNumber: "77300", groupName: "Utilities", sortOrder: 1910 },
  { originalName: "Phone", accountNumber: "77400", groupName: "Utilities", sortOrder: 1920 },
  { originalName: "Internet", accountNumber: "77410", groupName: "Utilities", sortOrder: 1930 },
  { originalName: "Refuse", accountNumber: "77500", groupName: "Utilities", sortOrder: 1940 },
  { originalName: "Water & Sewer", accountNumber: "77600", groupName: "Utilities", sortOrder: 1950 },
  { originalName: "Utilities", accountNumber: "77000", groupName: "Utilities", sortOrder: 1890 },
  { originalName: "Website", accountNumber: "77420", groupName: "Utilities", sortOrder: 1935 },
  
  // Vehicle
  { originalName: "Vehicle Expense", accountNumber: "77700", sortOrder: 2000 },
  { originalName: "Gas/Fuel", accountNumber: "77750", sortOrder: 2010 },
  
  // Ministry
  { originalName: "Special Projects", accountNumber: "81100", sortOrder: 2100 },
  
  // Missions
  { originalName: "Missions Designated Support", accountNumber: "81200", groupName: "Missions", sortOrder: 2200 },
  { originalName: "Missions Designated Benevolence", accountNumber: "81250", groupName: "Missions", sortOrder: 2210 },
  { originalName: "Missionaries", accountNumber: "81300", groupName: "Missions", sortOrder: 2220 },
  { originalName: "Missions Local projects", accountNumber: "81350", groupName: "Missions", sortOrder: 2230 },
  { originalName: "Mission trips", accountNumber: "81375", groupName: "Missions", sortOrder: 2240 },
  
  // Ministry Programs
  { originalName: "Special Events", accountNumber: "81400", sortOrder: 2300 },
  { originalName: "Discipleship/Bible Study", accountNumber: "81450", sortOrder: 2310 },
  
  // Children's Ministry
  { originalName: "Nursery 0-2", accountNumber: "81510", groupName: "Children's Ministry", sortOrder: 2400 },
  { originalName: "Early Childhood 3-5", accountNumber: "81520", groupName: "Children's Ministry", sortOrder: 2410 },
  { originalName: "Elementary 6-11", accountNumber: "81530", groupName: "Children's Ministry", sortOrder: 2420 },
  { originalName: "Comfort Zone", accountNumber: "81540", groupName: "Children's Ministry", sortOrder: 2430 },
  { originalName: "Kids Clubs", accountNumber: "81545", groupName: "Children's Ministry", sortOrder: 2440 },
  
  // Counseling
  { originalName: "Counseling", accountNumber: "81550", sortOrder: 2500 },
  
  // Ranch/Animals - Your DB has different names
  { originalName: "Meat Purchases", accountNumber: "81605", groupName: "Ranch/Animals", sortOrder: 2600 },
  { originalName: "Animal Purchase", accountNumber: "81610", groupName: "Ranch/Animals", sortOrder: 2610 },
  { originalName: "Animal Processing", accountNumber: "81615", groupName: "Ranch/Animals", sortOrder: 2620 },
  { originalName: "Feed/Hay", accountNumber: "81630", groupName: "Ranch/Animals", sortOrder: 2630 },
  { originalName: "Vaccines", accountNumber: "81635", groupName: "Ranch/Animals", sortOrder: 2640 },
  { originalName: "Pasture Maintenance", accountNumber: "81645", groupName: "Ranch/Animals", sortOrder: 2650 },
  { originalName: "Feedlot Expense", accountNumber: "81650", groupName: "Ranch/Animals", sortOrder: 2655 },
  { originalName: "Vet Expense", accountNumber: "81660", groupName: "Ranch/Animals", sortOrder: 2660 },
  { originalName: "Lone Star Beef", accountNumber: "81670", groupName: "Ranch/Animals", sortOrder: 2665 },
  
  // General 7
  { originalName: "Merchandise: Clothing, CDs", accountNumber: "81700", sortOrder: 2700 },
  { originalName: "Clothing, CDs", accountNumber: "81700", sortOrder: 2700 },
  { originalName: "Merchandise", accountNumber: "81710", sortOrder: 2705 },
  { originalName: "Petty Cash Expense", accountNumber: "81750", sortOrder: 2710 },
  { originalName: "Mortgage Principal Adj", accountNumber: "95400", sortOrder: 2800 },
  
  // Additional categories from your database
  { originalName: "Media", accountNumber: "72100", groupName: "Equipment Expense", sortOrder: 715 },
  { originalName: "Other", accountNumber: "73650", sortOrder: 1015 },
  { originalName: "VIP Guests", accountNumber: "72670", groupName: "Meals", sortOrder: 815 },
  { originalName: "Roping Series", accountNumber: "81410", sortOrder: 2305 },
  { originalName: "Pastor", accountNumber: "51300", groupName: "Payroll", sortOrder: 120 },
  { originalName: "Broadcast Time", accountNumber: "73450", groupName: "Marketing", sortOrder: 940 },
  { originalName: "Unknown Debit", accountNumber: "99000", sortOrder: 9000 },
  { originalName: "Unknown Credit", accountNumber: "99100", sortOrder: 9100 },
  { originalName: "Credit", accountNumber: "99200", sortOrder: 9200 },
  { originalName: "Debit", accountNumber: "99300", sortOrder: 9300 },
];

async function migrateCategories(db: Db) {
  const categoriesCollection = db.collection("categories");
  
  console.log("\n========================================");
  console.log("STEP 1: List ALL existing categories");
  console.log("========================================\n");
  
  const allCategories = await categoriesCollection.find({}).toArray();
  console.log(`Found ${allCategories.length} total categories in database\n`);
  
  // Group by whether they have accountNumber or not
  const withAccountNumber = allCategories.filter(c => c.accountNumber);
  const withoutAccountNumber = allCategories.filter(c => !c.accountNumber);
  
  console.log(`Categories WITH accountNumber (likely duplicates from old script): ${withAccountNumber.length}`);
  console.log(`Categories WITHOUT accountNumber (original): ${withoutAccountNumber.length}\n`);
  
  console.log("\n========================================");
  console.log("STEP 2: Delete duplicate categories (with accountNumber)");
  console.log("========================================\n");
  
  if (withAccountNumber.length > 0) {
    const deleteResult = await categoriesCollection.deleteMany({ accountNumber: { $exists: true } });
    console.log(`Deleted ${deleteResult.deletedCount} duplicate categories`);
  } else {
    console.log("No duplicates to delete");
  }
  
  console.log("\n========================================");
  console.log("STEP 3: Update existing categories with new fields");
  console.log("========================================\n");
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundCategories: string[] = [];
  const processedNames = new Set<string>();
  
  for (const mapping of CATEGORY_MAPPINGS) {
    // Skip if we already processed this name (handles duplicates in mapping)
    if (processedNames.has(mapping.originalName)) continue;
    processedNames.add(mapping.originalName);
    
    const existing = await categoriesCollection.findOne({ name: mapping.originalName });
    
    if (existing) {
      await categoriesCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            accountNumber: mapping.accountNumber,
            groupName: mapping.groupName || null,
            sortOrder: mapping.sortOrder,
            active: true,
            hidden: existing.hidden || false,
          }
        }
      );
      console.log(`Updated: "${mapping.originalName}" -> acct#: ${mapping.accountNumber}, group: ${mapping.groupName || 'none'}`);
      updatedCount++;
    } else {
      notFoundCategories.push(mapping.originalName);
      notFoundCount++;
    }
  }
  
  console.log("\n========================================");
  console.log("SUMMARY");
  console.log("========================================\n");
  console.log(`Categories updated: ${updatedCount}`);
  console.log(`Categories not found in mapping: ${notFoundCount}`);
  
  if (notFoundCategories.length > 0) {
    console.log("\nCategories in mapping but not in DB:");
    notFoundCategories.forEach(name => console.log(`  - "${name}"`));
  }
  
  // List any categories in DB that weren't updated
  const remainingCategories = await categoriesCollection.find({ 
    accountNumber: { $exists: false },
    name: { $nin: ["Income", "Expense"] }
  }).toArray();
  
  if (remainingCategories.length > 0) {
    console.log("\nCategories in DB that still need mapping (not updated):");
    remainingCategories.forEach(c => console.log(`  - "${c.name}" (type: ${c.type})`));
  }
  
  // Final count
  const finalCategories = await categoriesCollection.find({}).toArray();
  const withAcct = finalCategories.filter(c => c.accountNumber).length;
  const withoutAcct = finalCategories.filter(c => !c.accountNumber).length;
  console.log(`\nFinal state: ${finalCategories.length} total categories`);
  console.log(`  - With accountNumber: ${withAcct}`);
  console.log(`  - Without accountNumber: ${withoutAcct} (including Income/Expense root)`);
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
    await migrateCategories(db);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\nDisconnected from MongoDB");
  }
}

main();
