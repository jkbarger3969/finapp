import { MongoClient } from "mongodb";

// Income categories - map name to account number
const INCOME_CATEGORIES: Record<string, string> = {
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

// Expense categories - map name to account number
// Names match your database names (with colons for grouped items)
const EXPENSE_CATEGORIES: Record<string, string> = {
  // Payroll
  "Payroll: Staff wages": "51100",
  "Staff Wages": "51100",
  "Payroll: Employer FICA": "51200",
  "Employer FICA": "51200",
  
  // Benefits
  "Benefits: Medical": "51500",
  "Medical": "51500",
  "Benefits: Dental and Vision": "51600",
  "Dental and Vision": "51600",
  "Benefits: Child Care Match Expense": "51610",
  "Child Care Match Expense": "51610",
  "Benefits: Life": "51700",
  "Life": "51700",
  
  // Property & Insurance
  "Mortgage Principle/Interest": "61100",
  "Mortgage Principal/Interest": "61100",
  "Property & Liability Insurance": "61300",
  "Workers Comp Insurance": "61400",
  
  // Capital Improvements
  "Capital Improvements: Equipment": "61600",
  "Capital Improvements: Building": "61650",
  
  // Bank Charges
  "Bank Charges": "71100",
  "Bank Charges: eGive Fees": "71200",
  "eGive Fees": "71200",
  
  // General Expenses
  "Benevolence Expense": "71300",
  "Curriculum & Resources": "71600",
  "Global Courses": "71620",
  "Dues & Fees": "71700",
  "Database Software Fees": "71710",
  "Fundraiser Expense": "71850",
  
  // Equipment Expense
  "Equipment Expense": "71900",
  "Equipment Expense: Audio": "72000",
  "Audio": "72000",
  "Equipment Expense: Lighting": "72200",
  "Lighting": "72200",
  "Equipment Rental": "72300",
  "Furnishings": "72400",
  
  // Meals
  "Meals: Event Meal": "72650",
  "Event Meal": "72650",
  "Meals: Travel": "72700",
  "Travel": "72700",
  "Travel/Lodging": "72710",
  
  // Marketing
  "Marketing: Other": "73100",
  "Marketing: Printed Materials": "73200",
  "Printed Materials": "73200",
  "Marketing: Promotions/Discounts": "73300",
  "Promotions/Discounts": "73300",
  "Marketing: Social Media": "73400",
  "Social Media": "73400",
  
  // General
  "Mileage Reimbursement": "73500",
  "Miscellaneous": "73600",
  
  // Outside Services
  "Outside Services: Background Check": "73700",
  "Background Check": "73700",
  "Outside Services: Guest Speaker": "73800",
  "Guest Speaker": "73800",
  "Outside Services: Security": "74000",
  "Security": "74000",
  "Outside Services: Childcare": "74100",
  "Childcare": "74100",
  "Outside Services: Contract Services": "74300",
  "Contract Services": "74300",
  "Outside Services: Janitorial": "74400",
  "Janitorial": "74400",
  "Outside Services: Musicians": "74500",
  "Musicians": "74500",
  "Outside Services: Other": "74600",
  "Outside Services: Printing": "74700",
  "Printing": "74700",
  
  // General
  "Postage": "74800",
  "Prizes and Gifts": "74900",
  "Games": "74910",
  "Professional Services": "75000",
  "Refund": "75050",
  "Staffing Placement Fees": "75100",
  "Rentals (non equipment)": "75200",
  
  // Repair & Maintenance
  "Repair & Maint": "75300",
  "Repair & Maintenance": "75300",
  "Grounds Maint/Repair": "75340",
  "Grounds": "75340",
  "Building Maint/Repair": "75350",
  "Building": "75350",
  
  // General
  "Sponsorship Expense": "75410",
  "Sermon Illustration": "75500",
  "Signage": "75600",
  "Staff Appreciation": "75700",
  
  // Staff Development
  "Staff Develop": "75800",
  "Staff Development": "75800",
  "Staff Develop: Conf & Seminars": "75900",
  "Conferences & Seminars": "75900",
  "Staff Reimbursement Expense": "75910",
  "Reimbursement Expense": "75910",
  
  // General
  "Subscriptions": "76100",
  "Flowers and Gifts": "76110",
  
  // Supplies
  "Supplies: Cleaning": "76300",
  "Cleaning": "76300",
  "Supplies: Hospitality": "76400",
  "Hospitality": "76400",
  "Supplies: Kitchen": "76500",
  "Kitchen": "76500",
  "Supplies: Office": "76600",
  "Office": "76600",
  "Supplies: Promotional Items": "76700",
  "Promotional Items": "76700",
  "Supplies: Materials and Supplies": "76800",
  "Materials and Supplies": "76800",
  "Supplies: Communion": "76950",
  "Communion": "76950",
  "Supplies: Baptism": "76960",
  "Baptism": "76960",
  
  // General
  "Café Concess/Snack": "77050",
  "Café Concession/Snack": "77050",
  "Taxes, Licenses & Permits": "77100",
  
  // Utilities
  "Utilities: Electricity": "77200",
  "Electricity": "77200",
  "Utilities: Gas": "77300",
  "Gas": "77300",
  "Utilities: Phone": "77400",
  "Phone": "77400",
  "Utilities: Internet": "77410",
  "Internet": "77410",
  "Utilities: Refuse": "77500",
  "Refuse": "77500",
  "Utilities: Water & Sewer": "77600",
  "Water & Sewer": "77600",
  
  // Vehicle
  "Vehicle Expense": "77700",
  "Gas/Fuel": "77750",
  
  // Ministry
  "Special Projects": "81100",
  
  // Missions
  "Missions Designated Support": "81200",
  "Designated Support": "81200",
  "Missions Designated Benevolence": "81250",
  "Designated Benevolence": "81250",
  "Missionaries": "81300",
  "Missions Local projects": "81350",
  "Local Projects": "81350",
  "Mission trips": "81375",
  "Mission Trips": "81375",
  
  // Ministry Programs
  "Special Events": "81400",
  "Discipleship/Bible Study": "81450",
  
  // Children's Ministry
  "Nursery 0-2": "81510",
  "Early Childhood 3-5": "81520",
  "Elementary 6-11": "81530",
  "Comfort Zone": "81540",
  "Kids Clubs": "81545",
  
  // Counseling
  "Counseling": "81550",
  
  // Ranch/Animals
  "Meat Purchases": "81605",
  "Animal Purchase": "81610",
  "Animal Processing": "81615",
  "Feed/Hay": "81630",
  "Vaccines": "81635",
  "Pasture Maintenance": "81645",
  
  // General
  "Merchandise: Clothing, CDs": "81700",
  "Petty Cash Expense": "81750",
  "Mortgage Principal Adj": "95400",
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

    let updatedCount = 0;
    let alreadySetCount = 0;
    let notFoundNames: string[] = [];

    // Process Income Categories
    console.log("\n=== Processing Income Categories (Credit) ===\n");
    for (const [name, accountNumber] of Object.entries(INCOME_CATEGORIES)) {
      const existing = await categoriesCollection.findOne({
        name: name,
        type: "Credit"
      });

      if (existing) {
        if (existing.accountNumber === accountNumber) {
          console.log(`✓ Already set: ${accountNumber} - ${name}`);
          alreadySetCount++;
        } else {
          await categoriesCollection.updateOne(
            { _id: existing._id },
            { $set: { accountNumber: accountNumber } }
          );
          console.log(`✓ Updated: ${accountNumber} - ${name}`);
          updatedCount++;
        }
      } else {
        notFoundNames.push(`Income: ${name}`);
      }
    }

    // Process Expense Categories
    console.log("\n=== Processing Expense Categories (Debit) ===\n");
    const processedExpenseNumbers = new Set<string>();
    
    for (const [name, accountNumber] of Object.entries(EXPENSE_CATEGORIES)) {
      // Skip if we already processed this account number
      if (processedExpenseNumbers.has(accountNumber)) continue;
      
      const existing = await categoriesCollection.findOne({
        name: name,
        type: "Debit"
      });

      if (existing) {
        processedExpenseNumbers.add(accountNumber);
        if (existing.accountNumber === accountNumber) {
          console.log(`✓ Already set: ${accountNumber} - ${name}`);
          alreadySetCount++;
        } else {
          await categoriesCollection.updateOne(
            { _id: existing._id },
            { $set: { accountNumber: accountNumber } }
          );
          console.log(`✓ Updated: ${accountNumber} - ${name}`);
          updatedCount++;
        }
      }
    }

    // Find expense categories without account numbers
    const expenseWithoutNumbers = await categoriesCollection.find({
      type: "Debit",
      $or: [
        { accountNumber: { $exists: false } },
        { accountNumber: null },
        { accountNumber: "" }
      ]
    }).toArray();

    if (expenseWithoutNumbers.length > 0) {
      console.log("\n=== Expense Categories Missing Account Numbers ===");
      for (const cat of expenseWithoutNumbers) {
        // Try to find a match in our mapping
        const accountNumber = EXPENSE_CATEGORIES[cat.name];
        if (accountNumber) {
          await categoriesCollection.updateOne(
            { _id: cat._id },
            { $set: { accountNumber: accountNumber } }
          );
          console.log(`✓ Fixed: ${accountNumber} - ${cat.name}`);
          updatedCount++;
        } else {
          console.log(`✗ No mapping for: ${cat.name}`);
          notFoundNames.push(`Expense: ${cat.name}`);
        }
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("=== SUMMARY ===");
    console.log("=".repeat(50));
    console.log(`Updated: ${updatedCount}`);
    console.log(`Already set: ${alreadySetCount}`);
    
    if (notFoundNames.length > 0) {
      console.log(`\nCategories not found in database (${notFoundNames.length}):`);
      notFoundNames.forEach(n => console.log(`  - ${n}`));
    }

    // Final verification
    console.log("\n=== Final Verification ===");
    const withNumbers = await categoriesCollection.countDocuments({
      accountNumber: { $exists: true, $ne: null, $ne: "" }
    });
    const withoutNumbers = await categoriesCollection.countDocuments({
      $or: [
        { accountNumber: { $exists: false } },
        { accountNumber: null },
        { accountNumber: "" }
      ]
    });
    console.log(`Categories with account numbers: ${withNumbers}`);
    console.log(`Categories without account numbers: ${withoutNumbers}`);

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\nDisconnected from MongoDB");
  }
}

main();
