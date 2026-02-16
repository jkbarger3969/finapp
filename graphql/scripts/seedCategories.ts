import { MongoClient, ObjectId, Db } from "mongodb";

interface CategorySeed {
  accountNumber: string;
  name: string;
  groupName?: string;
  type: "Credit" | "Debit";
  sortOrder: number;
  hidden?: boolean;
}

const INCOME_CATEGORIES: CategorySeed[] = [
  { accountNumber: "41000", name: "Contribution Income", type: "Credit", sortOrder: 100 },
  { accountNumber: "43000", name: "Ministry Fees/Income", type: "Credit", sortOrder: 200 },
  { accountNumber: "43100", name: "Merchandise Sales", type: "Credit", sortOrder: 300 },
  { accountNumber: "43200", name: "Music Sales", type: "Credit", sortOrder: 400 },
  { accountNumber: "43400", name: "Scholarship Income", type: "Credit", sortOrder: 500 },
  { accountNumber: "43450", name: "Fundraiser Income", type: "Credit", sortOrder: 600 },
  { accountNumber: "43500", name: "Reimbursement Income", type: "Credit", sortOrder: 700 },
  { accountNumber: "44000", name: "Facility/Rent Income", type: "Credit", sortOrder: 800 },
  { accountNumber: "44500", name: "Unrealized Gain/Loss Investments", type: "Credit", sortOrder: 900 },
  { accountNumber: "45000", name: "Other Income", type: "Credit", sortOrder: 1000 },
  { accountNumber: "45020", name: "Stock Fees", type: "Credit", sortOrder: 1100 },
  { accountNumber: "45030", name: "Animal Sales", type: "Credit", sortOrder: 1200 },
  { accountNumber: "90000", name: "Interest Income", type: "Credit", sortOrder: 1300 },
  { accountNumber: "91000", name: "Dividend Income", type: "Credit", sortOrder: 1400 },
];

const EXPENSE_CATEGORIES: CategorySeed[] = [
  // Payroll
  { accountNumber: "51100", name: "Staff Wages", groupName: "Payroll", type: "Debit", sortOrder: 100 },
  { accountNumber: "51200", name: "Employer FICA", groupName: "Payroll", type: "Debit", sortOrder: 110 },
  
  // Benefits
  { accountNumber: "51500", name: "Medical", groupName: "Benefits", type: "Debit", sortOrder: 200 },
  { accountNumber: "51600", name: "Dental and Vision", groupName: "Benefits", type: "Debit", sortOrder: 210 },
  { accountNumber: "51610", name: "Child Care Match Expense", groupName: "Benefits", type: "Debit", sortOrder: 220 },
  { accountNumber: "51700", name: "Life", groupName: "Benefits", type: "Debit", sortOrder: 230 },
  
  // Property & Insurance
  { accountNumber: "61100", name: "Mortgage Principal/Interest", type: "Debit", sortOrder: 300 },
  { accountNumber: "61300", name: "Property & Liability Insurance", type: "Debit", sortOrder: 310 },
  { accountNumber: "61400", name: "Workers Comp Insurance", type: "Debit", sortOrder: 320 },
  
  // Capital Improvements
  { accountNumber: "61600", name: "Equipment", groupName: "Capital Improvements", type: "Debit", sortOrder: 400 },
  { accountNumber: "61650", name: "Building", groupName: "Capital Improvements", type: "Debit", sortOrder: 410 },
  
  // Bank Charges
  { accountNumber: "71100", name: "Bank Charges", type: "Debit", sortOrder: 500 },
  { accountNumber: "71200", name: "eGive Fees", groupName: "Bank Charges", type: "Debit", sortOrder: 510 },
  
  // General Expenses
  { accountNumber: "71300", name: "Benevolence Expense", type: "Debit", sortOrder: 600 },
  { accountNumber: "71600", name: "Curriculum & Resources", type: "Debit", sortOrder: 610 },
  { accountNumber: "71620", name: "Global Courses", type: "Debit", sortOrder: 620 },
  { accountNumber: "71700", name: "Dues & Fees", type: "Debit", sortOrder: 630 },
  { accountNumber: "71710", name: "Database Software Fees", type: "Debit", sortOrder: 640 },
  { accountNumber: "71850", name: "Fundraiser Expense", type: "Debit", sortOrder: 650 },
  
  // Equipment Expense
  { accountNumber: "71900", name: "General", groupName: "Equipment Expense", type: "Debit", sortOrder: 700 },
  { accountNumber: "72000", name: "Audio", groupName: "Equipment Expense", type: "Debit", sortOrder: 710 },
  { accountNumber: "72200", name: "Lighting", groupName: "Equipment Expense", type: "Debit", sortOrder: 720 },
  { accountNumber: "72300", name: "Rental", groupName: "Equipment Expense", type: "Debit", sortOrder: 730 },
  { accountNumber: "72400", name: "Furnishings", type: "Debit", sortOrder: 740 },
  
  // Meals
  { accountNumber: "72650", name: "Event Meal", groupName: "Meals", type: "Debit", sortOrder: 800 },
  { accountNumber: "72700", name: "Travel", groupName: "Meals", type: "Debit", sortOrder: 810 },
  { accountNumber: "72710", name: "Travel/Lodging", type: "Debit", sortOrder: 820 },
  
  // Marketing
  { accountNumber: "73100", name: "Other", groupName: "Marketing", type: "Debit", sortOrder: 900 },
  { accountNumber: "73200", name: "Printed Materials", groupName: "Marketing", type: "Debit", sortOrder: 910 },
  { accountNumber: "73300", name: "Promotions/Discounts", groupName: "Marketing", type: "Debit", sortOrder: 920 },
  { accountNumber: "73400", name: "Social Media", groupName: "Marketing", type: "Debit", sortOrder: 930 },
  
  // General 2
  { accountNumber: "73500", name: "Mileage Reimbursement", type: "Debit", sortOrder: 1000 },
  { accountNumber: "73600", name: "Miscellaneous", type: "Debit", sortOrder: 1010 },
  
  // Outside Services
  { accountNumber: "73700", name: "Background Check", groupName: "Outside Services", type: "Debit", sortOrder: 1100 },
  { accountNumber: "73800", name: "Guest Speaker", groupName: "Outside Services", type: "Debit", sortOrder: 1110 },
  { accountNumber: "74000", name: "Security", groupName: "Outside Services", type: "Debit", sortOrder: 1120 },
  { accountNumber: "74100", name: "Childcare", groupName: "Outside Services", type: "Debit", sortOrder: 1130 },
  { accountNumber: "74300", name: "Contract Services", groupName: "Outside Services", type: "Debit", sortOrder: 1140 },
  { accountNumber: "74400", name: "Janitorial", groupName: "Outside Services", type: "Debit", sortOrder: 1150 },
  { accountNumber: "74500", name: "Musicians", groupName: "Outside Services", type: "Debit", sortOrder: 1160 },
  { accountNumber: "74600", name: "Other", groupName: "Outside Services", type: "Debit", sortOrder: 1170 },
  { accountNumber: "74700", name: "Printing", groupName: "Outside Services", type: "Debit", sortOrder: 1180 },
  
  // General 3
  { accountNumber: "74800", name: "Postage", type: "Debit", sortOrder: 1200 },
  { accountNumber: "74900", name: "Prizes and Gifts", type: "Debit", sortOrder: 1210 },
  { accountNumber: "74910", name: "Games", type: "Debit", sortOrder: 1220 },
  { accountNumber: "75000", name: "Professional Services", type: "Debit", sortOrder: 1230 },
  { accountNumber: "75050", name: "Refund", type: "Debit", sortOrder: 1240 },
  { accountNumber: "75100", name: "Staffing Placement Fees", type: "Debit", sortOrder: 1250 },
  { accountNumber: "75200", name: "Rentals (non equipment)", type: "Debit", sortOrder: 1260 },
  
  // Repair & Maintenance
  { accountNumber: "75300", name: "General", groupName: "Repair & Maintenance", type: "Debit", sortOrder: 1300 },
  { accountNumber: "75340", name: "Grounds", groupName: "Repair & Maintenance", type: "Debit", sortOrder: 1310 },
  { accountNumber: "75350", name: "Building", groupName: "Repair & Maintenance", type: "Debit", sortOrder: 1320 },
  
  // General 4
  { accountNumber: "75410", name: "Sponsorship Expense", type: "Debit", sortOrder: 1400 },
  { accountNumber: "75500", name: "Sermon Illustration", type: "Debit", sortOrder: 1410 },
  { accountNumber: "75600", name: "Signage", type: "Debit", sortOrder: 1420 },
  { accountNumber: "75700", name: "Staff Appreciation", type: "Debit", sortOrder: 1430 },
  
  // Staff Development
  { accountNumber: "75800", name: "General", groupName: "Staff Development", type: "Debit", sortOrder: 1500 },
  { accountNumber: "75900", name: "Conferences & Seminars", groupName: "Staff Development", type: "Debit", sortOrder: 1510 },
  { accountNumber: "75910", name: "Reimbursement Expense", groupName: "Staff Development", type: "Debit", sortOrder: 1520 },
  
  // General 5
  { accountNumber: "76100", name: "Subscriptions", type: "Debit", sortOrder: 1600 },
  { accountNumber: "76110", name: "Flowers and Gifts", type: "Debit", sortOrder: 1610 },
  
  // Supplies
  { accountNumber: "76300", name: "Cleaning", groupName: "Supplies", type: "Debit", sortOrder: 1700 },
  { accountNumber: "76400", name: "Hospitality", groupName: "Supplies", type: "Debit", sortOrder: 1710 },
  { accountNumber: "76500", name: "Kitchen", groupName: "Supplies", type: "Debit", sortOrder: 1720 },
  { accountNumber: "76600", name: "Office", groupName: "Supplies", type: "Debit", sortOrder: 1730 },
  { accountNumber: "76700", name: "Promotional Items", groupName: "Supplies", type: "Debit", sortOrder: 1740 },
  { accountNumber: "76800", name: "Materials and Supplies", groupName: "Supplies", type: "Debit", sortOrder: 1750 },
  { accountNumber: "76950", name: "Communion", groupName: "Supplies", type: "Debit", sortOrder: 1760 },
  { accountNumber: "76960", name: "Baptism", groupName: "Supplies", type: "Debit", sortOrder: 1770 },
  
  // General 6
  { accountNumber: "77050", name: "Café Concession/Snack", type: "Debit", sortOrder: 1800 },
  { accountNumber: "77100", name: "Taxes, Licenses & Permits", type: "Debit", sortOrder: 1810 },
  
  // Utilities
  { accountNumber: "77200", name: "Electricity", groupName: "Utilities", type: "Debit", sortOrder: 1900 },
  { accountNumber: "77300", name: "Gas", groupName: "Utilities", type: "Debit", sortOrder: 1910 },
  { accountNumber: "77400", name: "Phone", groupName: "Utilities", type: "Debit", sortOrder: 1920 },
  { accountNumber: "77410", name: "Internet", groupName: "Utilities", type: "Debit", sortOrder: 1930 },
  { accountNumber: "77500", name: "Refuse", groupName: "Utilities", type: "Debit", sortOrder: 1940 },
  { accountNumber: "77600", name: "Water & Sewer", groupName: "Utilities", type: "Debit", sortOrder: 1950 },
  
  // Vehicle
  { accountNumber: "77700", name: "Vehicle Expense", type: "Debit", sortOrder: 2000 },
  { accountNumber: "77750", name: "Gas/Fuel", type: "Debit", sortOrder: 2010 },
  
  // Ministry
  { accountNumber: "81100", name: "Special Projects", type: "Debit", sortOrder: 2100 },
  
  // Missions
  { accountNumber: "81200", name: "Designated Support", groupName: "Missions", type: "Debit", sortOrder: 2200 },
  { accountNumber: "81250", name: "Designated Benevolence", groupName: "Missions", type: "Debit", sortOrder: 2210 },
  { accountNumber: "81300", name: "Missionaries", groupName: "Missions", type: "Debit", sortOrder: 2220 },
  { accountNumber: "81350", name: "Local Projects", groupName: "Missions", type: "Debit", sortOrder: 2230 },
  { accountNumber: "81375", name: "Mission Trips", groupName: "Missions", type: "Debit", sortOrder: 2240 },
  
  // Ministry Programs
  { accountNumber: "81400", name: "Special Events", type: "Debit", sortOrder: 2300 },
  { accountNumber: "81450", name: "Discipleship/Bible Study", type: "Debit", sortOrder: 2310 },
  
  // Children's Ministry
  { accountNumber: "81510", name: "Nursery 0-2", groupName: "Children's Ministry", type: "Debit", sortOrder: 2400 },
  { accountNumber: "81520", name: "Early Childhood 3-5", groupName: "Children's Ministry", type: "Debit", sortOrder: 2410 },
  { accountNumber: "81530", name: "Elementary 6-11", groupName: "Children's Ministry", type: "Debit", sortOrder: 2420 },
  { accountNumber: "81540", name: "Comfort Zone", groupName: "Children's Ministry", type: "Debit", sortOrder: 2430 },
  { accountNumber: "81545", name: "Kids Clubs", groupName: "Children's Ministry", type: "Debit", sortOrder: 2440 },
  
  // Counseling
  { accountNumber: "81550", name: "Counseling", type: "Debit", sortOrder: 2500 },
  
  // Ranch/Animals
  { accountNumber: "81605", name: "Meat Purchases", groupName: "Ranch/Animals", type: "Debit", sortOrder: 2600 },
  { accountNumber: "81610", name: "Animal Purchase", groupName: "Ranch/Animals", type: "Debit", sortOrder: 2610 },
  { accountNumber: "81615", name: "Animal Processing", groupName: "Ranch/Animals", type: "Debit", sortOrder: 2620 },
  { accountNumber: "81630", name: "Feed/Hay", groupName: "Ranch/Animals", type: "Debit", sortOrder: 2630 },
  { accountNumber: "81635", name: "Vaccines", groupName: "Ranch/Animals", type: "Debit", sortOrder: 2640 },
  { accountNumber: "81645", name: "Pasture Maintenance", groupName: "Ranch/Animals", type: "Debit", sortOrder: 2650 },
  
  // General 7
  { accountNumber: "81700", name: "Merchandise: Clothing, CDs", type: "Debit", sortOrder: 2700 },
  { accountNumber: "81750", name: "Petty Cash Expense", type: "Debit", sortOrder: 2710 },
  { accountNumber: "95400", name: "Mortgage Principal Adj", type: "Debit", sortOrder: 2800 },
];

async function seedCategories(db: Db) {
  const categoriesCollection = db.collection("categories");
  
  console.log("Starting category seed...");
  
  let incomeParentId: ObjectId | null = null;
  let expenseParentId: ObjectId | null = null;
  
  const existingIncome = await categoriesCollection.findOne({ name: "Income", type: "Credit", parent: null });
  const existingExpense = await categoriesCollection.findOne({ name: "Expense", type: "Debit", parent: null });
  
  if (existingIncome) {
    incomeParentId = existingIncome._id;
    console.log("Found existing Income root category:", incomeParentId);
  }
  
  if (existingExpense) {
    expenseParentId = existingExpense._id;
    console.log("Found existing Expense root category:", expenseParentId);
  }
  
  for (const cat of INCOME_CATEGORIES) {
    const existing = await categoriesCollection.findOne({ accountNumber: cat.accountNumber });
    
    if (existing) {
      await categoriesCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: cat.name,
            groupName: cat.groupName || null,
            sortOrder: cat.sortOrder,
            active: true,
          }
        }
      );
      console.log(`Updated income category: ${cat.accountNumber} - ${cat.name}`);
    } else {
      await categoriesCollection.insertOne({
        _id: new ObjectId(),
        accountNumber: cat.accountNumber,
        name: cat.name,
        groupName: cat.groupName || null,
        type: cat.type,
        sortOrder: cat.sortOrder,
        active: true,
        hidden: false,
        parent: incomeParentId,
      });
      console.log(`Inserted income category: ${cat.accountNumber} - ${cat.name}`);
    }
  }
  
  for (const cat of EXPENSE_CATEGORIES) {
    const existing = await categoriesCollection.findOne({ accountNumber: cat.accountNumber });
    
    if (existing) {
      await categoriesCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: cat.name,
            groupName: cat.groupName || null,
            sortOrder: cat.sortOrder,
            active: true,
          }
        }
      );
      console.log(`Updated expense category: ${cat.accountNumber} - ${cat.name}`);
    } else {
      await categoriesCollection.insertOne({
        _id: new ObjectId(),
        accountNumber: cat.accountNumber,
        name: cat.name,
        groupName: cat.groupName || null,
        type: cat.type,
        sortOrder: cat.sortOrder,
        active: true,
        hidden: false,
        parent: expenseParentId,
      });
      console.log(`Inserted expense category: ${cat.accountNumber} - ${cat.name}`);
    }
  }
  
  console.log("Category seed completed!");
  console.log(`Total Income categories: ${INCOME_CATEGORIES.length}`);
  console.log(`Total Expense categories: ${EXPENSE_CATEGORIES.length}`);
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
    await seedCategories(db);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

main();
