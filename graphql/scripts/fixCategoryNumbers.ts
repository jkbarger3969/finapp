import { MongoClient } from "mongodb";

// Income categories - EXACT names from database
const INCOME_CATEGORIES: Record<string, string> = {
  "Animal Sales": "45030",
  "Camp Registration": "43400",  // Using Scholarship Income number
  "Contribution Income": "41000",
  "Credit": "41000",  // Generic credit
  "Donations": "41000",  // Same as Contribution
  "Facility/Rent Income": "44000",
  "Fundraiser Income": "43450",
  "Income transfer": "45000",  // Other Income
  "Lone Star Beef Donations": "45030",  // Animal Sales related
  "Merchandise Sales": "43100",
  "Ministry Fees/Income": "43000",
  "Music Sales": "43200",
  "Other Income": "45000",
  "Refund": "43500",  // Reimbursement Income
  "Reimbursement Income": "43500",
  "Scholarship Income": "43400",
  "Sponsorship Income": "43450",  // Fundraiser related
  "Stock Fees": "45020",
  "Unknown Credit": "45000",  // Other Income
  "Unrealized Gain/Loss Investments": "44500",
  "Interest Income": "90000",
  "Dividend Income": "91000",
};

// Expense categories - EXACT names from database
const EXPENSE_CATEGORIES: Record<string, string> = {
  // Animals/Ranch
  "Animal Processing": "81615",
  "Animal Purchase": "81610",
  "Feed/Hay": "81630",
  "Feedlot Expense": "81630",
  "Lone Star Beef": "81605",
  "Meat Purchases": "81605",
  "Pasture Maintenance": "81645",
  "Vaccines": "81635",
  "Vet Expense": "81635",
  
  // Audio/Video/Equipment
  "Arena": "72300",
  "Audio": "72000",
  "Equipment": "61600",
  "Equipment Expense": "71900",
  "Equipment Rental": "72300",
  "Furnishings": "72400",
  "Lighting": "72200",
  "Media": "72000",
  "Stage Design": "72400",
  "Video": "72200",
  
  // Bank
  "Bank Charges": "71100",
  "eGive Fees": "71200",
  
  // Benefits - using Payroll numbers since Benefits not in original list
  "Education Reimbursement": "75910",
  
  // Building/Property
  "Building": "61650",
  "Building Maint/Repair": "75350",
  "Capital Improvements": "61600",
  "Grounds Maint/Repair": "75340",
  "Insurance Claims Expense": "61300",
  "Property Tax & Assessments": "77100",
  "Repair & Maint": "75300",
  
  // Children's Ministry
  "Comfort Zone": "81540",
  "Early Childhood 3-5": "81520",
  "Elementary 6-11": "81530",
  "Kids Clubs": "81545",
  "Nursery 0-2": "81510",
  
  // Counseling
  "Counseling": "81550",
  
  // Curriculum
  "Curriculum & Resources": "71600",
  "Global Courses": "71620",
  "Sponsored Courses": "71620",
  "Unsponsored Courses": "71620",
  
  // Dues/Fees
  "Database Software Fees": "71710",
  "Dues & Fees": "71700",
  
  // Food/Café
  "Café Concess/Snack": "77050",
  "Catering": "72650",
  "Event Meal": "72650",
  
  // Fundraiser
  "Fundraiser Expense": "71850",
  
  // Games/Gifts
  "Flowers and Gifts": "76110",
  "Games": "74910",
  "Prizes and Gifts": "74900",
  
  // Generic
  "Debit": "73600",
  "Miscellaneous": "73600",
  "Unknown Debit": "73600",
  
  // Marketing
  "Billboards": "73100",
  "Broadcast Time": "73100",
  "Graphic Design": "73200",
  "Live Streaming Fee": "73400",
  "Marketing": "73100",
  "Printed Materials": "73200",
  "Promotions/Discounts": "73300",
  "Radio": "73100",
  "Social Media": "73400",
  "TV": "73100",
  "Website": "73400",
  
  // Meals/Travel
  "Meals": "72650",
  "Mileage Reimbursement": "73500",
  "Travel": "72700",
  "Travel/Lodging": "72710",
  "Travel/Moving Reimb": "73500",
  
  // Merchandise
  "Clothing, CDs": "81700",
  "Merchandise": "81700",
  
  // Missions
  "Discipleship/Bible Study": "81450",
  "Mission trips": "81375",
  "Missionaries": "81300",
  "Missions Designated Benevolence": "81250",
  "Missions Designated Support": "81200",
  "Missions Local projects": "81350",
  
  // Outside Services
  "Background Check": "73700",
  "Childcare": "74100",
  "Contract Services": "74300",
  "Guest Speaker": "73800",
  "Janitorial": "74400",
  "Musicians": "74500",
  "Other": "74600",
  "Outside Services": "74600",
  "Printing": "74700",
  "Security": "74000",
  
  // Pastoral
  "Benevolence Expense": "71300",
  "Pastor": "73800",
  "Sermon Illustration": "75500",
  "VIP Guests": "73800",
  
  // Petty Cash
  "Petty Cash Expense": "81750",
  
  // Postage
  "Postage": "74800",
  
  // Professional Services
  "Professional Services": "75000",
  "Staffing Placement Fees": "75100",
  
  // Refund
  "Refund": "75050",
  
  // Rentals
  "Rentals (non equipment)": "75200",
  "Roping Series": "75200",
  
  // Signage
  "Signage": "75600",
  
  // Special Events/Projects
  "Special Events": "81400",
  "Special Projects": "81100",
  
  // Sponsorship
  "Sponsorship Expense": "75410",
  
  // Staff
  "Staff Appreciation": "75700",
  "Staff Develop": "75800",
  "Conf & Seminars": "75900",
  "Staff Reimbursement Expense": "75910",
  
  // Subscriptions
  "Subscriptions": "76100",
  
  // Supplies
  "Baptism": "76960",
  "Cleaning": "76300",
  "Communion": "76950",
  "Hospitality": "76400",
  "Kitchen": "76500",
  "Materials and Supplies": "76800",
  "Office": "76600",
  "Office Hospitality": "76400",
  "Promotional Items": "76700",
  "Supplies": "76800",
  "Supplies: Salvation": "76800",
  
  // Taxes
  "Taxes, Licenses & Permits": "77100",
  
  // Utilities
  "Electricity": "77200",
  "Gas": "77300",
  "Gas/Fuel": "77750",
  "Internet": "77410",
  "Phone": "77400",
  "Refuse": "77500",
  "Utilities": "77200",
  "Water & Sewer": "77600",
  
  // Vehicle
  "Vehicle Expense": "77700",
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
    console.log("Connected to MongoDB\n");

    const db = client.db("accounting");
    const categoriesCollection = db.collection("categories");

    let updatedCount = 0;
    let alreadySetCount = 0;
    let notFoundNames: string[] = [];

    // Process Income Categories
    console.log("=== Processing Income Categories (Credit) ===\n");
    for (const [name, accountNumber] of Object.entries(INCOME_CATEGORIES)) {
      const existing = await categoriesCollection.findOne({
        name: name,
        type: "Credit"
      });

      if (existing) {
        if (existing.accountNumber === accountNumber) {
          console.log(`  ✓ Already set: ${accountNumber} - ${name}`);
          alreadySetCount++;
        } else {
          await categoriesCollection.updateOne(
            { _id: existing._id },
            { $set: { accountNumber: accountNumber } }
          );
          console.log(`  ✓ Updated: ${accountNumber} - ${name}`);
          updatedCount++;
        }
      }
    }

    // Process Expense Categories
    console.log("\n=== Processing Expense Categories (Debit) ===\n");
    
    for (const [name, accountNumber] of Object.entries(EXPENSE_CATEGORIES)) {
      // Find all matching categories (there might be duplicates)
      const existingCursor = categoriesCollection.find({
        name: name,
        type: "Debit"
      });
      
      const existingList = await existingCursor.toArray();
      
      for (const existing of existingList) {
        if (existing.accountNumber === accountNumber) {
          console.log(`  ✓ Already set: ${accountNumber} - ${name}`);
          alreadySetCount++;
        } else {
          await categoriesCollection.updateOne(
            { _id: existing._id },
            { $set: { accountNumber: accountNumber } }
          );
          console.log(`  ✓ Updated: ${accountNumber} - ${name}`);
          updatedCount++;
        }
      }
    }

    // Find any categories still without account numbers
    console.log("\n=== Categories Still Missing Account Numbers ===\n");
    
    const stillMissing = await categoriesCollection.find({
      $or: [
        { accountNumber: { $exists: false } },
        { accountNumber: null },
        { accountNumber: "" }
      ]
    }).sort({ type: 1, name: 1 }).toArray();

    if (stillMissing.length > 0) {
      for (const cat of stillMissing) {
        console.log(`  ✗ ${cat.type}: "${cat.name}"`);
      }
    } else {
      console.log("  None! All categories have account numbers.");
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("=== SUMMARY ===");
    console.log("=".repeat(50));
    console.log(`Updated: ${updatedCount}`);
    console.log(`Already set: ${alreadySetCount}`);
    console.log(`Still missing: ${stillMissing.length}`);

    // Final verification
    console.log("\n=== Final Verification ===");
    const withNumbers = await categoriesCollection.countDocuments({
      accountNumber: { $exists: true, $nin: [null, ""] }
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
