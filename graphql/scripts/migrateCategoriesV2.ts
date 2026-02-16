import { MongoClient, Db, ObjectId } from "mongodb";

interface CategoryDoc {
  _id: ObjectId;
  name: string;
  type: string;
  parent?: ObjectId | null;
  accountNumber?: string;
  groupName?: string;
  sortOrder?: number;
  active?: boolean;
  hidden?: boolean;
}

// Map from Income Statement: accountNumber -> { fullName, groupName }
const CATEGORY_FULL_NAMES: { [key: string]: { fullName: string; groupName?: string; sortOrder: number } } = {
  // INCOME
  "41000": { fullName: "Contribution Income", sortOrder: 100 },
  "43000": { fullName: "Ministry Fees/Income", sortOrder: 200 },
  "43100": { fullName: "Merchandise Sales", sortOrder: 300 },
  "43200": { fullName: "Music Sales", sortOrder: 400 },
  "43400": { fullName: "Scholarship Income", sortOrder: 500 },
  "43450": { fullName: "Fundraiser Income", sortOrder: 600 },
  "43500": { fullName: "Reimbursement Income", sortOrder: 700 },
  "44000": { fullName: "Facility/Rent Income", sortOrder: 800 },
  "44500": { fullName: "Unrealized Gain/Loss Investments", sortOrder: 900 },
  "45000": { fullName: "Other Income", sortOrder: 1000 },
  "45020": { fullName: "Stock Fees", sortOrder: 1100 },
  "45030": { fullName: "Animal Sales", sortOrder: 1200 },
  "90000": { fullName: "Interest Income", sortOrder: 1300 },
  "91000": { fullName: "Dividend Income", sortOrder: 1400 },

  // EXPENSE - Payroll
  "51100": { fullName: "Payroll: Staff wages", groupName: "Payroll", sortOrder: 100 },
  "51200": { fullName: "Payroll: Employer FICA", groupName: "Payroll", sortOrder: 110 },
  
  // Benefits
  "51500": { fullName: "Benefits: Medical", groupName: "Benefits", sortOrder: 200 },
  "51600": { fullName: "Benefits: Dental and Vision", groupName: "Benefits", sortOrder: 210 },
  "51610": { fullName: "Benefits: Child Care Match Expense", groupName: "Benefits", sortOrder: 220 },
  "51700": { fullName: "Benefits: Life", groupName: "Benefits", sortOrder: 230 },
  
  // Property & Insurance
  "61100": { fullName: "Mortgage Principle/Interest", sortOrder: 300 },
  "61300": { fullName: "Property & Liability Insurance", sortOrder: 310 },
  "61400": { fullName: "Workers Comp Insurance", sortOrder: 320 },
  
  // Capital Improvements
  "61600": { fullName: "Capital Improvements: Equipment", groupName: "Capital Improvements", sortOrder: 400 },
  "61650": { fullName: "Capital Improvements: Building", groupName: "Capital Improvements", sortOrder: 410 },
  
  // Bank Charges
  "71100": { fullName: "Bank Charges", sortOrder: 500 },
  "71200": { fullName: "Bank Charges: eGive Fees", groupName: "Bank Charges", sortOrder: 510 },
  
  // General Expenses
  "71300": { fullName: "Benevolence Expense", sortOrder: 600 },
  "71600": { fullName: "Curriculum & Resources", sortOrder: 610 },
  "71620": { fullName: "Global Courses", sortOrder: 620 },
  "71700": { fullName: "Dues & Fees", sortOrder: 630 },
  "71710": { fullName: "Database Software Fees", sortOrder: 640 },
  "71850": { fullName: "Fundraiser Expense", sortOrder: 650 },
  
  // Equipment Expense
  "71900": { fullName: "Equipment Expense", groupName: "Equipment Expense", sortOrder: 700 },
  "72000": { fullName: "Equipment Expense: Audio", groupName: "Equipment Expense", sortOrder: 710 },
  "72200": { fullName: "Equipment Expense: Lighting", groupName: "Equipment Expense", sortOrder: 720 },
  "72300": { fullName: "Equipment Rental", sortOrder: 730 },
  "72400": { fullName: "Furnishings", sortOrder: 740 },
  
  // Meals
  "72650": { fullName: "Meals: Event Meal", groupName: "Meals", sortOrder: 800 },
  "72700": { fullName: "Meals: Travel", groupName: "Meals", sortOrder: 810 },
  "72710": { fullName: "Travel/Lodging", sortOrder: 820 },
  
  // Marketing
  "73100": { fullName: "Marketing: Other", groupName: "Marketing", sortOrder: 900 },
  "73200": { fullName: "Marketing: Printed Materials", groupName: "Marketing", sortOrder: 910 },
  "73300": { fullName: "Marketing: Promotions/Discounts", groupName: "Marketing", sortOrder: 920 },
  "73400": { fullName: "Marketing: Social Media", groupName: "Marketing", sortOrder: 930 },
  
  // General
  "73500": { fullName: "Mileage Reimbursement", sortOrder: 1000 },
  "73600": { fullName: "Miscellaneous", sortOrder: 1010 },
  
  // Outside Services
  "73700": { fullName: "Outside Services: Background Check", groupName: "Outside Services", sortOrder: 1100 },
  "73800": { fullName: "Outside Services: Guest Speaker", groupName: "Outside Services", sortOrder: 1110 },
  "74000": { fullName: "Outside Services: Security", groupName: "Outside Services", sortOrder: 1120 },
  "74100": { fullName: "Outside Services: Childcare", groupName: "Outside Services", sortOrder: 1130 },
  "74300": { fullName: "Outside Services: Contract Services", groupName: "Outside Services", sortOrder: 1140 },
  "74400": { fullName: "Outside Services: Janitorial", groupName: "Outside Services", sortOrder: 1150 },
  "74500": { fullName: "Outside Services: Musicians", groupName: "Outside Services", sortOrder: 1160 },
  "74600": { fullName: "Outside Services: Other", groupName: "Outside Services", sortOrder: 1170 },
  "74700": { fullName: "Outside Services: Printing", groupName: "Outside Services", sortOrder: 1180 },
  
  // General
  "74800": { fullName: "Postage", sortOrder: 1200 },
  "74900": { fullName: "Prizes and Gifts", sortOrder: 1210 },
  "74910": { fullName: "Games", sortOrder: 1220 },
  "75000": { fullName: "Professional Services", sortOrder: 1230 },
  "75050": { fullName: "Refund", sortOrder: 1240 },
  "75100": { fullName: "Staffing Placement Fees", sortOrder: 1250 },
  "75200": { fullName: "Rentals (non equipment)", sortOrder: 1260 },
  
  // Repair & Maintenance
  "75300": { fullName: "Repair & Maint", sortOrder: 1300 },
  "75340": { fullName: "Grounds Maint/Repair", sortOrder: 1310 },
  "75350": { fullName: "Building Maint/Repair", sortOrder: 1320 },
  
  // General
  "75410": { fullName: "Sponsorship Expense", sortOrder: 1400 },
  "75500": { fullName: "Sermon Illustration", sortOrder: 1410 },
  "75600": { fullName: "Signage", sortOrder: 1420 },
  "75700": { fullName: "Staff Appreciation", sortOrder: 1430 },
  
  // Staff Development
  "75800": { fullName: "Staff Develop", groupName: "Staff Development", sortOrder: 1500 },
  "75900": { fullName: "Staff Develop: Conf & Seminars", groupName: "Staff Development", sortOrder: 1510 },
  "75910": { fullName: "Staff Reimbursement Expense", sortOrder: 1520 },
  
  // General
  "76100": { fullName: "Subscriptions", sortOrder: 1600 },
  "76110": { fullName: "Flowers and Gifts", sortOrder: 1610 },
  
  // Supplies
  "76300": { fullName: "Supplies: Cleaning", groupName: "Supplies", sortOrder: 1700 },
  "76400": { fullName: "Supplies: Hospitality", groupName: "Supplies", sortOrder: 1710 },
  "76500": { fullName: "Supplies: Kitchen", groupName: "Supplies", sortOrder: 1720 },
  "76600": { fullName: "Supplies: Office", groupName: "Supplies", sortOrder: 1730 },
  "76700": { fullName: "Supplies: Promotional Items", groupName: "Supplies", sortOrder: 1740 },
  "76800": { fullName: "Supplies: Materials and Supplies", groupName: "Supplies", sortOrder: 1750 },
  "76950": { fullName: "Supplies: Communion", groupName: "Supplies", sortOrder: 1760 },
  "76960": { fullName: "Supplies: Baptism", groupName: "Supplies", sortOrder: 1770 },
  
  // General
  "77050": { fullName: "Café Concess/Snack", sortOrder: 1800 },
  "77100": { fullName: "Taxes, Licenses & Permits", sortOrder: 1810 },
  
  // Utilities
  "77200": { fullName: "Utilities: Electricity", groupName: "Utilities", sortOrder: 1900 },
  "77300": { fullName: "Utilities: Gas", groupName: "Utilities", sortOrder: 1910 },
  "77400": { fullName: "Utilities: Phone", groupName: "Utilities", sortOrder: 1920 },
  "77410": { fullName: "Utilities: Internet", groupName: "Utilities", sortOrder: 1930 },
  "77500": { fullName: "Utilities: Refuse", groupName: "Utilities", sortOrder: 1940 },
  "77600": { fullName: "Utilities: Water & Sewer", groupName: "Utilities", sortOrder: 1950 },
  
  // Vehicle
  "77700": { fullName: "Vehicle Expense", sortOrder: 2000 },
  "77750": { fullName: "Gas/Fuel", sortOrder: 2010 },
  
  // Ministry
  "81100": { fullName: "Special Projects", sortOrder: 2100 },
  
  // Missions
  "81200": { fullName: "Missions Designated Support", groupName: "Missions", sortOrder: 2200 },
  "81250": { fullName: "Missions Designated Benevolence", groupName: "Missions", sortOrder: 2210 },
  "81300": { fullName: "Missionaries", groupName: "Missions", sortOrder: 2220 },
  "81350": { fullName: "Missions Local projects", groupName: "Missions", sortOrder: 2230 },
  "81375": { fullName: "Mission trips", groupName: "Missions", sortOrder: 2240 },
  
  // Ministry Programs
  "81400": { fullName: "Special Events", sortOrder: 2300 },
  "81450": { fullName: "Discipleship/Bible Study", sortOrder: 2310 },
  
  // Children's Ministry
  "81510": { fullName: "Nursery 0-2", groupName: "Children's Ministry", sortOrder: 2400 },
  "81520": { fullName: "Early Childhood 3-5", groupName: "Children's Ministry", sortOrder: 2410 },
  "81530": { fullName: "Elementary 6-11", groupName: "Children's Ministry", sortOrder: 2420 },
  "81540": { fullName: "Comfort Zone", groupName: "Children's Ministry", sortOrder: 2430 },
  "81545": { fullName: "Kids Clubs", groupName: "Children's Ministry", sortOrder: 2440 },
  
  // Counseling
  "81550": { fullName: "Counseling", sortOrder: 2500 },
  
  // Ranch/Animals
  "81605": { fullName: "Meat Purchases", groupName: "Ranch/Animals", sortOrder: 2600 },
  "81610": { fullName: "Animal Purchase", groupName: "Ranch/Animals", sortOrder: 2610 },
  "81615": { fullName: "Animal Processing", groupName: "Ranch/Animals", sortOrder: 2620 },
  "81630": { fullName: "Feed/Hay", groupName: "Ranch/Animals", sortOrder: 2630 },
  "81635": { fullName: "Vaccines", groupName: "Ranch/Animals", sortOrder: 2640 },
  "81645": { fullName: "Pasture Maintenance", groupName: "Ranch/Animals", sortOrder: 2650 },
  
  // General
  "81700": { fullName: "Merchandise: Clothing, CDs", sortOrder: 2700 },
  "81750": { fullName: "Petty Cash Expense", sortOrder: 2710 },
  "95400": { fullName: "Mortgage Principal Adj", sortOrder: 2800 },
};

// Mapping from simple DB name -> parent group name for building full names
const PARENT_GROUPS: { [childName: string]: string } = {
  // Supplies children
  "Cleaning": "Supplies",
  "Hospitality": "Supplies",
  "Kitchen": "Supplies",
  "Office": "Supplies",
  "Promotional Items": "Supplies",
  "Materials and Supplies": "Supplies",
  "Communion": "Supplies",
  "Baptism": "Supplies",
  "Office Hospitality": "Supplies",
  
  // Utilities children
  "Electricity": "Utilities",
  "Gas": "Utilities",
  "Phone": "Utilities",
  "Internet": "Utilities",
  "Refuse": "Utilities",
  "Water & Sewer": "Utilities",
  "Website": "Utilities",
  
  // Meals children
  "Event Meal": "Meals",
  "Travel": "Meals",
  "Catering": "Meals",
  "VIP Guests": "Meals",
  
  // Marketing children
  "Printed Materials": "Marketing",
  "Promotions/Discounts": "Marketing",
  "Social Media": "Marketing",
  "Broadcast Time": "Marketing",
  
  // Equipment Expense children
  "Audio": "Equipment Expense",
  "Lighting": "Equipment Expense",
  "Media": "Equipment Expense",
  
  // Outside Services children
  "Background Check": "Outside Services",
  "Guest Speaker": "Outside Services",
  "Security": "Outside Services",
  "Childcare": "Outside Services",
  "Contract Services": "Outside Services",
  "Janitorial": "Outside Services",
  "Musicians": "Outside Services",
  "Printing": "Outside Services",
  
  // Payroll children
  "Staff wages": "Payroll",
  "Employer FICA": "Payroll",
  "Pastor": "Payroll",
  
  // Benefits children
  "Medical": "Benefits",
  "Dental and Vision": "Benefits",
  "Child Care Match Expense": "Benefits",
  "Life": "Benefits",
  
  // Capital Improvements children
  "Equipment": "Capital Improvements",
  "Building": "Capital Improvements",
  
  // Bank Charges children
  "eGive Fees": "Bank Charges",
  
  // Staff Development children
  "Conf & Seminars": "Staff Development",
  
  // Missions children
  "Designated Support": "Missions",
  "Designated Benevolence": "Missions",
  "Local Projects": "Missions",
  "Mission Trips": "Missions",
  
  // Ranch/Animals children
  "Meat Purchases": "Ranch/Animals",
  "Animal Purchase": "Ranch/Animals",
  "Animal Processing": "Ranch/Animals",
  "Feed/Hay": "Ranch/Animals",
  "Vaccines": "Ranch/Animals",
  "Pasture Maintenance": "Ranch/Animals",
  "Feedlot Expense": "Ranch/Animals",
  "Vet Expense": "Ranch/Animals",
  "Lone Star Beef": "Ranch/Animals",
  
  // Children's Ministry children
  "Nursery 0-2": "Children's Ministry",
  "Early Childhood 3-5": "Children's Ministry",
  "Elementary 6-11": "Children's Ministry",
  "Comfort Zone": "Children's Ministry",
  "Kids Clubs": "Children's Ministry",
};

async function migrateCategories(db: Db) {
  const categoriesCollection = db.collection<CategoryDoc>("categories");
  
  console.log("\n========================================");
  console.log("STEP 1: Analyze existing categories");
  console.log("========================================\n");
  
  const allCategories = await categoriesCollection.find({}).toArray();
  console.log(`Found ${allCategories.length} total categories\n`);
  
  // Build parent lookup map
  const categoryById = new Map<string, CategoryDoc>();
  allCategories.forEach(c => categoryById.set(c._id.toString(), c));
  
  // Find parent categories (ones that are referenced as parent by others)
  const parentIds = new Set<string>();
  allCategories.forEach(c => {
    if (c.parent) parentIds.add(c.parent.toString());
  });
  
  console.log("Parent categories (groups):");
  parentIds.forEach(pid => {
    const parent = categoryById.get(pid);
    if (parent && parent.name !== "Income" && parent.name !== "Expense") {
      console.log(`  - "${parent.name}" (id: ${pid})`);
    }
  });
  
  console.log("\n========================================");
  console.log("STEP 2: Delete duplicate categories (with accountNumber)");
  console.log("========================================\n");
  
  const withAccountNumber = allCategories.filter(c => c.accountNumber);
  if (withAccountNumber.length > 0) {
    const deleteResult = await categoriesCollection.deleteMany({ accountNumber: { $exists: true } });
    console.log(`Deleted ${deleteResult.deletedCount} duplicate categories`);
  } else {
    console.log("No duplicates to delete");
  }
  
  // Refresh categories after deletion
  const currentCategories = await categoriesCollection.find({}).toArray();
  currentCategories.forEach(c => categoryById.set(c._id.toString(), c));
  
  console.log("\n========================================");
  console.log("STEP 3: Rename categories to full names with group prefix");
  console.log("========================================\n");
  
  let updatedCount = 0;
  let sortOrderCounter = 100;
  
  for (const cat of currentCategories) {
    // Skip root categories
    if (cat.name === "Income" || cat.name === "Expense") continue;
    
    // Skip if this is a parent/group category itself
    if (parentIds.has(cat._id.toString())) {
      console.log(`Skipping parent category: "${cat.name}"`);
      continue;
    }
    
    let newName = cat.name;
    let groupName: string | null = null;
    
    // Check if this category has a parent (is a child)
    if (cat.parent) {
      const parent = categoryById.get(cat.parent.toString());
      if (parent && parent.name !== "Income" && parent.name !== "Expense") {
        // This is a child - build full name like "Supplies: Cleaning"
        newName = `${parent.name}: ${cat.name}`;
        groupName = parent.name;
      }
    }
    
    // Also check our manual mapping for any we might have missed
    const manualGroup = PARENT_GROUPS[cat.name];
    if (!groupName && manualGroup) {
      newName = `${manualGroup}: ${cat.name}`;
      groupName = manualGroup;
    }
    
    // Update the category
    await categoriesCollection.updateOne(
      { _id: cat._id },
      {
        $set: {
          name: newName,
          groupName: groupName,
          sortOrder: sortOrderCounter,
          active: true,
          hidden: cat.hidden || false,
        }
      }
    );
    
    if (newName !== cat.name) {
      console.log(`Renamed: "${cat.name}" -> "${newName}" (group: ${groupName})`);
    } else {
      console.log(`Updated: "${cat.name}" (no group)`);
    }
    
    updatedCount++;
    sortOrderCounter += 10;
  }
  
  console.log("\n========================================");
  console.log("STEP 4: Remove parent-only categories (optional cleanup)");
  console.log("========================================\n");
  
  // Parent categories like "Supplies", "Utilities" are now redundant
  // since the full names are on the child categories
  // But we'll keep them in case they have transactions
  
  for (const pid of parentIds) {
    const parent = categoryById.get(pid);
    if (parent && parent.name !== "Income" && parent.name !== "Expense") {
      // Check if this parent category has any transactions
      const entriesCollection = db.collection("entries");
      const entryCount = await entriesCollection.countDocuments({ "current.category": parent._id });
      
      if (entryCount === 0) {
        console.log(`Parent "${parent.name}" has no transactions - marking as hidden`);
        await categoriesCollection.updateOne(
          { _id: parent._id },
          { $set: { hidden: true, sortOrder: 9999 } }
        );
      } else {
        console.log(`Parent "${parent.name}" has ${entryCount} transactions - keeping visible`);
      }
    }
  }
  
  console.log("\n========================================");
  console.log("SUMMARY");
  console.log("========================================\n");
  console.log(`Categories updated/renamed: ${updatedCount}`);
  
  // Show final state
  const finalCategories = await categoriesCollection.find({ hidden: { $ne: true } }).toArray();
  console.log(`\nVisible categories: ${finalCategories.length}`);
  
  console.log("\nSample of renamed categories:");
  finalCategories.slice(0, 20).forEach(c => {
    console.log(`  - "${c.name}" (group: ${c.groupName || 'none'})`);
  });
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
