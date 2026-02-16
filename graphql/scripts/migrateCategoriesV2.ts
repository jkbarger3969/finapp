import { MongoClient, Db } from "mongodb";

interface CategoryMapping {
  originalName: string;
  accountNumber: string;
  groupName?: string;
  sortOrder: number;
}

const CATEGORY_MAPPINGS: CategoryMapping[] = [
  // INCOME - These should match EXACTLY what's in your database
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

  // EXPENSE - Payroll
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
  
  // Capital Improvements
  { originalName: "Capital Improvements: Equipment", accountNumber: "61600", groupName: "Capital Improvements", sortOrder: 400 },
  { originalName: "Capital Improvements: Building", accountNumber: "61650", groupName: "Capital Improvements", sortOrder: 410 },
  
  // Bank Charges
  { originalName: "Bank Charges", accountNumber: "71100", sortOrder: 500 },
  { originalName: "Bank Charges: eGive Fees", accountNumber: "71200", groupName: "Bank Charges", sortOrder: 510 },
  
  // General Expenses
  { originalName: "Benevolence Expense", accountNumber: "71300", sortOrder: 600 },
  { originalName: "Curriculum & Resources", accountNumber: "71600", sortOrder: 610 },
  { originalName: "Global Courses", accountNumber: "71620", sortOrder: 620 },
  { originalName: "Dues & Fees", accountNumber: "71700", sortOrder: 630 },
  { originalName: "Database Software Fees", accountNumber: "71710", sortOrder: 640 },
  { originalName: "Fundraiser Expense", accountNumber: "71850", sortOrder: 650 },
  
  // Equipment Expense
  { originalName: "Equipment Expense", accountNumber: "71900", groupName: "Equipment Expense", sortOrder: 700 },
  { originalName: "Equipment Expense: Audio", accountNumber: "72000", groupName: "Equipment Expense", sortOrder: 710 },
  { originalName: "Equipment Expense: Lighting", accountNumber: "72200", groupName: "Equipment Expense", sortOrder: 720 },
  { originalName: "Equipment Rental", accountNumber: "72300", groupName: "Equipment Expense", sortOrder: 730 },
  { originalName: "Furnishings", accountNumber: "72400", sortOrder: 740 },
  
  // Meals
  { originalName: "Meals: Event Meal", accountNumber: "72650", groupName: "Meals", sortOrder: 800 },
  { originalName: "Meals: Travel", accountNumber: "72700", groupName: "Meals", sortOrder: 810 },
  { originalName: "Travel/Lodging", accountNumber: "72710", sortOrder: 820 },
  
  // Marketing
  { originalName: "Marketing: Other", accountNumber: "73100", groupName: "Marketing", sortOrder: 900 },
  { originalName: "Marketing: Printed Materials", accountNumber: "73200", groupName: "Marketing", sortOrder: 910 },
  { originalName: "Marketing: Promotions/Discounts", accountNumber: "73300", groupName: "Marketing", sortOrder: 920 },
  { originalName: "Marketing: Social Media", accountNumber: "73400", groupName: "Marketing", sortOrder: 930 },
  
  // General 2
  { originalName: "Mileage Reimbursement", accountNumber: "73500", sortOrder: 1000 },
  { originalName: "Miscellaneous", accountNumber: "73600", sortOrder: 1010 },
  
  // Outside Services
  { originalName: "Outside Services: Background Check", accountNumber: "73700", groupName: "Outside Services", sortOrder: 1100 },
  { originalName: "Outside Services: Guest Speaker", accountNumber: "73800", groupName: "Outside Services", sortOrder: 1110 },
  { originalName: "Outside Services: Security", accountNumber: "74000", groupName: "Outside Services", sortOrder: 1120 },
  { originalName: "Outside Services: Childcare", accountNumber: "74100", groupName: "Outside Services", sortOrder: 1130 },
  { originalName: "Outside Services: Contract Services", accountNumber: "74300", groupName: "Outside Services", sortOrder: 1140 },
  { originalName: "Outside Services: Janitorial", accountNumber: "74400", groupName: "Outside Services", sortOrder: 1150 },
  { originalName: "Outside Services: Musicians", accountNumber: "74500", groupName: "Outside Services", sortOrder: 1160 },
  { originalName: "Outside Services: Other", accountNumber: "74600", groupName: "Outside Services", sortOrder: 1170 },
  { originalName: "Outside Services: Printing", accountNumber: "74700", groupName: "Outside Services", sortOrder: 1180 },
  
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
  
  // Staff Development
  { originalName: "Staff Develop", accountNumber: "75800", groupName: "Staff Development", sortOrder: 1500 },
  { originalName: "Staff Develop: Conf & Seminars", accountNumber: "75900", groupName: "Staff Development", sortOrder: 1510 },
  { originalName: "Staff Reimbursement Expense", accountNumber: "75910", groupName: "Staff Development", sortOrder: 1520 },
  
  // General 5
  { originalName: "Subscriptions", accountNumber: "76100", sortOrder: 1600 },
  { originalName: "Flowers and Gifts", accountNumber: "76110", sortOrder: 1610 },
  
  // Supplies
  { originalName: "Supplies: Cleaning", accountNumber: "76300", groupName: "Supplies", sortOrder: 1700 },
  { originalName: "Supplies: Hospitality", accountNumber: "76400", groupName: "Supplies", sortOrder: 1710 },
  { originalName: "Supplies: Kitchen", accountNumber: "76500", groupName: "Supplies", sortOrder: 1720 },
  { originalName: "Supplies: Office", accountNumber: "76600", groupName: "Supplies", sortOrder: 1730 },
  { originalName: "Supplies: Promotional Items", accountNumber: "76700", groupName: "Supplies", sortOrder: 1740 },
  { originalName: "Supplies: Materials and Supplies", accountNumber: "76800", groupName: "Supplies", sortOrder: 1750 },
  { originalName: "Supplies: Communion", accountNumber: "76950", groupName: "Supplies", sortOrder: 1760 },
  { originalName: "Supplies: Baptism", accountNumber: "76960", groupName: "Supplies", sortOrder: 1770 },
  
  // General 6
  { originalName: "Café Concess/Snack", accountNumber: "77050", sortOrder: 1800 },
  { originalName: "Taxes, Licenses & Permits", accountNumber: "77100", sortOrder: 1810 },
  
  // Utilities
  { originalName: "Utilities: Electricity", accountNumber: "77200", groupName: "Utilities", sortOrder: 1900 },
  { originalName: "Utilities: Gas", accountNumber: "77300", groupName: "Utilities", sortOrder: 1910 },
  { originalName: "Utilities: Phone", accountNumber: "77400", groupName: "Utilities", sortOrder: 1920 },
  { originalName: "Utilities: Internet", accountNumber: "77410", groupName: "Utilities", sortOrder: 1930 },
  { originalName: "Utilities: Refuse", accountNumber: "77500", groupName: "Utilities", sortOrder: 1940 },
  { originalName: "Utilities: Water & Sewer", accountNumber: "77600", groupName: "Utilities", sortOrder: 1950 },
  
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
  
  // Ranch/Animals
  { originalName: "Meat Purchases", accountNumber: "81605", groupName: "Ranch/Animals", sortOrder: 2600 },
  { originalName: "Animal Purchase", accountNumber: "81610", groupName: "Ranch/Animals", sortOrder: 2610 },
  { originalName: "Animal Processing", accountNumber: "81615", groupName: "Ranch/Animals", sortOrder: 2620 },
  { originalName: "Feed/Hay", accountNumber: "81630", groupName: "Ranch/Animals", sortOrder: 2630 },
  { originalName: "Vaccines", accountNumber: "81635", groupName: "Ranch/Animals", sortOrder: 2640 },
  { originalName: "Pasture Maintenance", accountNumber: "81645", groupName: "Ranch/Animals", sortOrder: 2650 },
  
  // General 7
  { originalName: "Merchandise: Clothing, CDs", accountNumber: "81700", sortOrder: 2700 },
  { originalName: "Petty Cash Expense", accountNumber: "81750", sortOrder: 2710 },
  { originalName: "Mortgage Principal Adj", accountNumber: "95400", sortOrder: 2800 },
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
  
  console.log(`Categories WITH accountNumber (likely duplicates): ${withAccountNumber.length}`);
  console.log(`Categories WITHOUT accountNumber (original): ${withoutAccountNumber.length}\n`);
  
  console.log("Original categories (without accountNumber):");
  withoutAccountNumber.forEach(c => {
    console.log(`  - "${c.name}" (type: ${c.type}, id: ${c._id})`);
  });
  
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
  
  for (const mapping of CATEGORY_MAPPINGS) {
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
            hidden: false,
          }
        }
      );
      console.log(`Updated: "${mapping.originalName}" -> accountNumber: ${mapping.accountNumber}`);
      updatedCount++;
    } else {
      console.log(`NOT FOUND: "${mapping.originalName}"`);
      notFoundCategories.push(mapping.originalName);
      notFoundCount++;
    }
  }
  
  console.log("\n========================================");
  console.log("SUMMARY");
  console.log("========================================\n");
  console.log(`Categories updated: ${updatedCount}`);
  console.log(`Categories not found: ${notFoundCount}`);
  
  if (notFoundCategories.length > 0) {
    console.log("\nCategories not found (check spelling/naming):");
    notFoundCategories.forEach(name => console.log(`  - "${name}"`));
  }
  
  // List any categories in DB that weren't in our mapping
  const remainingCategories = await categoriesCollection.find({ 
    accountNumber: { $exists: false },
    name: { $nin: ["Income", "Expense"] } // Exclude root categories
  }).toArray();
  
  if (remainingCategories.length > 0) {
    console.log("\nCategories in DB not in our mapping (may need to add):");
    remainingCategories.forEach(c => console.log(`  - "${c.name}"`));
  }
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
