import { MongoClient, ObjectId } from "mongodb";

// Separate mappings for Income (Credit) and Expense (Debit)
const INCOME_MAPPINGS: Array<{ name: string; num: string }> = [
  { name: "Contribution Income", num: "41000" },
  { name: "Ministry Fees/Income", num: "43000" },
  { name: "Merchandise Sales", num: "43100" },
  { name: "Music Sales", num: "43200" },
  { name: "Scholarship Income", num: "43400" },
  { name: "Fundraiser Income", num: "43450" },
  { name: "Reimbursement Income", num: "43500" },
  { name: "Facility/Rent Income", num: "44000" },
  { name: "Unrealized Gain/Loss Investments", num: "44500" },
  { name: "Other Income", num: "45000" },
  { name: "Stock Fees", num: "45020" },
  { name: "Animal Sales", num: "45030" },
  { name: "Interest Income", num: "90000" },
  { name: "Dividend Income", num: "91000" },
  { name: "Credit", num: "41000" },
  { name: "Donations", num: "41000" },
  { name: "Income transfer", num: "45000" },
  { name: "Camp Registration", num: "43400" },
  { name: "Sponsorship Income", num: "43450" },
  { name: "Lone Star Beef Donations", num: "45030" },
  { name: "Refund", num: "43500" },
  { name: "Unknown Credit", num: "45000" },
];

const EXPENSE_MAPPINGS: Array<{ name: string; num: string; group?: string }> = [
  // Payroll (51XXX)
  { name: "Staff Wages", num: "51100", group: "Payroll" },
  { name: "Employer FICA", num: "51200", group: "Payroll" },
  
  // Benefits (51XXX)
  { name: "Medical", num: "51500", group: "Benefits" },
  { name: "Dental and Vision", num: "51600", group: "Benefits" },
  { name: "Child Care Match Expense", num: "51610", group: "Benefits" },
  { name: "Life", num: "51700", group: "Benefits" },
  
  // Capital/Property (61XXX)
  { name: "Mortgage Principle/Interest", num: "61100" },
  { name: "Mortgage Principal/Interest", num: "61100" },
  { name: "Property & Liability Insurance", num: "61300" },
  { name: "Workers Comp Insurance", num: "61400" },
  { name: "Equipment", num: "61600", group: "Capital Improvements" },
  { name: "Building", num: "61650", group: "Capital Improvements" },
  { name: "Capital Improvements", num: "61600" },
  
  // Bank Charges (71XXX)
  { name: "Bank Charges", num: "71100" },
  { name: "eGive Fees", num: "71200", group: "Bank Charges" },
  
  // General Expenses (71XXX)
  { name: "Benevolence Expense", num: "71300" },
  { name: "Curriculum & Resources", num: "71600" },
  { name: "Global Courses", num: "71620" },
  { name: "Dues & Fees", num: "71700" },
  { name: "Database Software Fees", num: "71710" },
  { name: "Fundraiser Expense", num: "71850" },
  
  // Equipment Expense (71XXX-72XXX)
  { name: "Equipment Expense", num: "71900" },
  { name: "Audio", num: "72000", group: "Equipment Expense" },
  { name: "Lighting", num: "72200", group: "Equipment Expense" },
  { name: "Video", num: "72200", group: "Equipment Expense" },
  { name: "Equipment Rental", num: "72300" },
  { name: "Furnishings", num: "72400" },
  { name: "Arena", num: "72300" },
  { name: "Media", num: "72000" },
  { name: "Stage Design", num: "72400" },
  
  // Meals (72XXX)
  { name: "Meals", num: "72650" },
  { name: "Event Meal", num: "72650", group: "Meals" },
  { name: "Travel", num: "72700", group: "Meals" },
  { name: "Travel/Lodging", num: "72710" },
  { name: "Catering", num: "72650", group: "Meals" },
  
  // Marketing (73XXX)
  { name: "Marketing", num: "73100" },
  { name: "Other", num: "73100", group: "Marketing" },
  { name: "Printed Materials", num: "73200", group: "Marketing" },
  { name: "Promotions/Discounts", num: "73300", group: "Marketing" },
  { name: "Social Media", num: "73400", group: "Marketing" },
  { name: "Billboards", num: "73100", group: "Marketing" },
  { name: "Broadcast Time", num: "73100" },
  { name: "Radio", num: "73100", group: "Broadcast Time" },
  { name: "TV", num: "73100", group: "Broadcast Time" },
  { name: "Graphic Design", num: "73200", group: "Marketing" },
  { name: "Live Streaming Fee", num: "73400" },
  { name: "Website", num: "73400", group: "Marketing" },
  
  // Travel/Mileage (73XXX)
  { name: "Mileage Reimbursement", num: "73500" },
  { name: "Miscellaneous", num: "73600" },
  { name: "Travel/Moving Reimb", num: "73500" },
  
  // Outside Services (73XXX-74XXX)
  { name: "Outside Services", num: "74600" },
  { name: "Background Check", num: "73700", group: "Outside Services" },
  { name: "Guest Speaker", num: "73800", group: "Outside Services" },
  { name: "Security", num: "74000", group: "Outside Services" },
  { name: "Childcare", num: "74100", group: "Outside Services" },
  { name: "Contract Services", num: "74300", group: "Outside Services" },
  { name: "Janitorial", num: "74400", group: "Outside Services" },
  { name: "Musicians", num: "74500", group: "Outside Services" },
  { name: "Printing", num: "74700", group: "Outside Services" },
  { name: "Pastor", num: "73800" },
  { name: "VIP Guests", num: "73800" },
  
  // General (74XXX-75XXX)
  { name: "Postage", num: "74800" },
  { name: "Prizes and Gifts", num: "74900" },
  { name: "Games", num: "74910" },
  { name: "Professional Services", num: "75000" },
  { name: "Refund", num: "75050" },
  { name: "Staffing Placement Fees", num: "75100" },
  { name: "Rentals (non equipment)", num: "75200" },
  { name: "Roping Series", num: "75200" },
  
  // Repair & Maint (75XXX)
  { name: "Repair & Maint", num: "75300" },
  { name: "Grounds Maint/Repair", num: "75340", group: "Repair & Maint" },
  { name: "Building Maint/Repair", num: "75350", group: "Repair & Maint" },
  { name: "Insurance Claims Expense", num: "61300" },
  { name: "Property Tax & Assessments", num: "77100" },
  
  // Sponsorship/Staff (75XXX)
  { name: "Sponsorship Expense", num: "75410" },
  { name: "Sermon Illustration", num: "75500" },
  { name: "Signage", num: "75600" },
  { name: "Staff Appreciation", num: "75700" },
  { name: "Staff Develop", num: "75800" },
  { name: "Conf & Seminars", num: "75900", group: "Staff Develop" },
  { name: "Staff Reimbursement Expense", num: "75910" },
  { name: "Education Reimbursement", num: "75910" },
  
  // Subscriptions/Flowers (76XXX)
  { name: "Subscriptions", num: "76100" },
  { name: "Flowers and Gifts", num: "76110" },
  
  // Supplies (76XXX)
  { name: "Supplies", num: "76800" },
  { name: "Cleaning", num: "76300", group: "Supplies" },
  { name: "Hospitality", num: "76400", group: "Supplies" },
  { name: "Kitchen", num: "76500", group: "Supplies" },
  { name: "Office", num: "76600", group: "Supplies" },
  { name: "Promotional Items", num: "76700", group: "Supplies" },
  { name: "Materials and Supplies", num: "76800", group: "Supplies" },
  { name: "Communion", num: "76950", group: "Supplies" },
  { name: "Baptism", num: "76960", group: "Supplies" },
  { name: "Office Hospitality", num: "76400", group: "Supplies" },
  { name: "Supplies: Salvation", num: "76800", group: "Supplies" },
  
  // Café/Taxes (77XXX)
  { name: "Café Concess/Snack", num: "77050" },
  { name: "Taxes, Licenses & Permits", num: "77100" },
  
  // Utilities (77XXX)
  { name: "Utilities", num: "77200" },
  { name: "Electricity", num: "77200", group: "Utilities" },
  { name: "Gas", num: "77300", group: "Utilities" },
  { name: "Phone", num: "77400", group: "Utilities" },
  { name: "Internet", num: "77410", group: "Utilities" },
  { name: "Refuse", num: "77500", group: "Utilities" },
  { name: "Water & Sewer", num: "77600", group: "Utilities" },
  
  // Vehicle (77XXX)
  { name: "Vehicle Expense", num: "77700" },
  { name: "Gas/Fuel", num: "77750" },
  
  // Ministry (81XXX)
  { name: "Special Projects", num: "81100" },
  { name: "Missions Designated Support", num: "81200" },
  { name: "Missions Designated Benevolence", num: "81250" },
  { name: "Missionaries", num: "81300" },
  { name: "Missions Local projects", num: "81350" },
  { name: "Mission trips", num: "81375" },
  
  // Events/Ministry Programs (81XXX)
  { name: "Special Events", num: "81400" },
  { name: "Discipleship/Bible Study", num: "81450" },
  
  // Children's Ministry (81XXX)
  { name: "Nursery 0-2", num: "81510" },
  { name: "Early Childhood 3-5", num: "81520" },
  { name: "Elementary 6-11", num: "81530" },
  { name: "Comfort Zone", num: "81540" },
  { name: "Kids Clubs", num: "81545" },
  
  // Counseling (81XXX)
  { name: "Counseling", num: "81550" },
  
  // Ranch/Animals (81XXX)
  { name: "Meat Purchases", num: "81605" },
  { name: "Animal Purchase", num: "81610" },
  { name: "Animal Processing", num: "81615" },
  { name: "Feed/Hay", num: "81630" },
  { name: "Vaccines", num: "81635" },
  { name: "Pasture Maintenance", num: "81645" },
  { name: "Feedlot Expense", num: "81630" },
  { name: "Lone Star Beef", num: "81605" },
  { name: "Vet Expense", num: "81635" },
  
  // Merchandise/Petty Cash (81XXX)
  { name: "Clothing, CDs", num: "81700" },
  { name: "Merchandise", num: "81700" },
  { name: "Petty Cash Expense", num: "81750" },
  
  // Mortgage Adj (95XXX)
  { name: "Mortgage Principal Adj", num: "95400" },
  
  // Generic
  { name: "Debit", num: "73600" },
  { name: "Unknown Debit", num: "73600" },
  { name: "Sponsored Courses", num: "71620" },
  { name: "Unsponsored Courses", num: "71620" },
];

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

    // Process Income Categories
    console.log("=== Processing Income Categories (Credit) ===\n");
    for (const mapping of INCOME_MAPPINGS) {
      const cats = await categoriesCollection.find({ name: mapping.name, type: "Credit" }).toArray();
      
      for (const cat of cats) {
        if (cat.accountNumber !== mapping.num) {
          await categoriesCollection.updateOne(
            { _id: cat._id },
            { $set: { accountNumber: mapping.num } }
          );
          console.log(`  ✓ Updated "${mapping.name}": accountNumber = ${mapping.num}`);
          updatedCount++;
        } else {
          console.log(`  - Already set: "${mapping.name}" = ${mapping.num}`);
        }
      }
    }

    // Process Expense Categories
    console.log("\n=== Processing Expense Categories (Debit) ===\n");
    for (const mapping of EXPENSE_MAPPINGS) {
      const cats = await categoriesCollection.find({ name: mapping.name, type: "Debit" }).toArray();
      
      for (const cat of cats) {
        const updates: any = {};
        
        if (cat.accountNumber !== mapping.num) {
          updates.accountNumber = mapping.num;
        }
        
        if (mapping.group && cat.groupName !== mapping.group) {
          updates.groupName = mapping.group;
        }
        
        if (Object.keys(updates).length > 0) {
          await categoriesCollection.updateOne({ _id: cat._id }, { $set: updates });
          console.log(`  ✓ Updated "${mapping.name}": ${JSON.stringify(updates)}`);
          updatedCount++;
        } else {
          console.log(`  - Already set: "${mapping.name}"`);
        }
      }
    }

    console.log(`\n=== Updated ${updatedCount} categories ===\n`);

    // Final summary
    console.log("=".repeat(50));
    console.log("=== FINAL SUMMARY ===");
    console.log("=".repeat(50));

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

    // List any remaining categories without account numbers
    if (withoutNumbers > 0) {
      console.log("\n=== Categories Still Missing Account Numbers ===");
      const missing = await categoriesCollection.find({
        $or: [
          { accountNumber: { $exists: false } },
          { accountNumber: null },
          { accountNumber: "" }
        ]
      }).sort({ type: 1, name: 1 }).toArray();
      
      missing.forEach(cat => {
        console.log(`  "${cat.name}" (${cat.type})`);
      });
    }

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\nDisconnected from MongoDB");
  }
}

main();
