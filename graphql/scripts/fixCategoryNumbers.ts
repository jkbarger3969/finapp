import { MongoClient, ObjectId } from "mongodb";

// Map account number prefix to groupName for proper hierarchy
// Based on your list: 76XXX = Supplies, 77XXX = Utilities, 72XXX = Meals/Equipment, etc.

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

    // First, build a map of parent categories by their _id
    const allCats = await categoriesCollection.find({}).toArray();
    const catById = new Map<string, any>();
    allCats.forEach(cat => catById.set(cat._id.toString(), cat));

    console.log("=== Setting groupName based on parent hierarchy ===\n");

    let updatedCount = 0;

    for (const cat of allCats) {
      // Skip if category has no parent (it's a top-level)
      if (!cat.parent) continue;

      const parentCat = catById.get(cat.parent.toString());
      if (!parentCat) continue;

      // The groupName should be the parent's name
      const newGroupName = parentCat.name;

      // Only update if groupName is different or not set
      if (cat.groupName !== newGroupName) {
        await categoriesCollection.updateOne(
          { _id: cat._id },
          { $set: { groupName: newGroupName } }
        );
        console.log(`  ✓ Set groupName for "${cat.name}" -> group: "${newGroupName}"`);
        updatedCount++;
      }
    }

    console.log(`\nUpdated ${updatedCount} categories with groupName\n`);

    // Now assign account numbers based on the full list
    console.log("=== Assigning Account Numbers ===\n");

    // Define account number mappings
    // Format: { categoryName: { accountNumber, type, groupName (optional) } }
    const CATEGORY_MAPPINGS: Record<string, { num: string; type: "Credit" | "Debit"; group?: string }> = {
      // Income (Credit)
      "Contribution Income": { num: "41000", type: "Credit" },
      "Ministry Fees/Income": { num: "43000", type: "Credit" },
      "Merchandise Sales": { num: "43100", type: "Credit" },
      "Music Sales": { num: "43200", type: "Credit" },
      "Scholarship Income": { num: "43400", type: "Credit" },
      "Fundraiser Income": { num: "43450", type: "Credit" },
      "Reimbursement Income": { num: "43500", type: "Credit" },
      "Facility/Rent Income": { num: "44000", type: "Credit" },
      "Unrealized Gain/Loss Investments": { num: "44500", type: "Credit" },
      "Other Income": { num: "45000", type: "Credit" },
      "Stock Fees": { num: "45020", type: "Credit" },
      "Animal Sales": { num: "45030", type: "Credit" },
      "Interest Income": { num: "90000", type: "Credit" },
      "Dividend Income": { num: "91000", type: "Credit" },
      "Credit": { num: "41000", type: "Credit" },
      "Donations": { num: "41000", type: "Credit" },
      "Income transfer": { num: "45000", type: "Credit" },
      "Camp Registration": { num: "43400", type: "Credit" },
      "Sponsorship Income": { num: "43450", type: "Credit" },
      "Lone Star Beef Donations": { num: "45030", type: "Credit" },
      "Refund": { num: "43500", type: "Credit" },
      "Unknown Credit": { num: "45000", type: "Credit" },
      
      // Payroll (51XXX)
      "Staff Wages": { num: "51100", type: "Debit", group: "Payroll" },
      "Employer FICA": { num: "51200", type: "Debit", group: "Payroll" },
      
      // Benefits (51XXX)
      "Medical": { num: "51500", type: "Debit", group: "Benefits" },
      "Dental and Vision": { num: "51600", type: "Debit", group: "Benefits" },
      "Child Care Match Expense": { num: "51610", type: "Debit", group: "Benefits" },
      "Life": { num: "51700", type: "Debit", group: "Benefits" },
      
      // Capital/Property (61XXX)
      "Mortgage Principle/Interest": { num: "61100", type: "Debit" },
      "Property & Liability Insurance": { num: "61300", type: "Debit" },
      "Workers Comp Insurance": { num: "61400", type: "Debit" },
      "Equipment": { num: "61600", type: "Debit", group: "Capital Improvements" },
      "Building": { num: "61650", type: "Debit", group: "Capital Improvements" },
      
      // Bank Charges (71XXX)
      "Bank Charges": { num: "71100", type: "Debit" },
      "eGive Fees": { num: "71200", type: "Debit", group: "Bank Charges" },
      
      // General Expenses (71XXX-77XXX)
      "Benevolence Expense": { num: "71300", type: "Debit" },
      "Curriculum & Resources": { num: "71600", type: "Debit" },
      "Global Courses": { num: "71620", type: "Debit" },
      "Dues & Fees": { num: "71700", type: "Debit" },
      "Database Software Fees": { num: "71710", type: "Debit" },
      "Fundraiser Expense": { num: "71850", type: "Debit" },
      
      // Equipment Expense (71XXX-72XXX)
      "Equipment Expense": { num: "71900", type: "Debit" },
      "Audio": { num: "72000", type: "Debit", group: "Equipment Expense" },
      "Lighting": { num: "72200", type: "Debit", group: "Equipment Expense" },
      "Equipment Rental": { num: "72300", type: "Debit" },
      "Furnishings": { num: "72400", type: "Debit" },
      "Arena": { num: "72300", type: "Debit" },
      "Video": { num: "72200", type: "Debit", group: "Equipment Expense" },
      "Media": { num: "72000", type: "Debit" },
      "Stage Design": { num: "72400", type: "Debit" },
      
      // Meals (72XXX)
      "Event Meal": { num: "72650", type: "Debit", group: "Meals" },
      "Travel": { num: "72700", type: "Debit", group: "Meals" },
      "Travel/Lodging": { num: "72710", type: "Debit" },
      "Meals": { num: "72650", type: "Debit" },
      "Catering": { num: "72650", type: "Debit" },
      
      // Marketing (73XXX)
      "Marketing": { num: "73100", type: "Debit" },
      "Printed Materials": { num: "73200", type: "Debit", group: "Marketing" },
      "Promotions/Discounts": { num: "73300", type: "Debit", group: "Marketing" },
      "Social Media": { num: "73400", type: "Debit", group: "Marketing" },
      "Billboards": { num: "73100", type: "Debit", group: "Marketing" },
      "Broadcast Time": { num: "73100", type: "Debit", group: "Marketing" },
      "Graphic Design": { num: "73200", type: "Debit", group: "Marketing" },
      "Live Streaming Fee": { num: "73400", type: "Debit", group: "Marketing" },
      "Radio": { num: "73100", type: "Debit", group: "Marketing" },
      "TV": { num: "73100", type: "Debit", group: "Marketing" },
      "Website": { num: "73400", type: "Debit", group: "Marketing" },
      
      // Travel/Mileage (73XXX)
      "Mileage Reimbursement": { num: "73500", type: "Debit" },
      "Miscellaneous": { num: "73600", type: "Debit" },
      "Travel/Moving Reimb": { num: "73500", type: "Debit" },
      
      // Outside Services (73XXX-74XXX)
      "Background Check": { num: "73700", type: "Debit", group: "Outside Services" },
      "Guest Speaker": { num: "73800", type: "Debit", group: "Outside Services" },
      "Security": { num: "74000", type: "Debit", group: "Outside Services" },
      "Childcare": { num: "74100", type: "Debit", group: "Outside Services" },
      "Contract Services": { num: "74300", type: "Debit", group: "Outside Services" },
      "Janitorial": { num: "74400", type: "Debit", group: "Outside Services" },
      "Musicians": { num: "74500", type: "Debit", group: "Outside Services" },
      "Other": { num: "74600", type: "Debit", group: "Outside Services" },
      "Printing": { num: "74700", type: "Debit", group: "Outside Services" },
      "Outside Services": { num: "74600", type: "Debit" },
      "Pastor": { num: "73800", type: "Debit" },
      "VIP Guests": { num: "73800", type: "Debit" },
      
      // General (74XXX-75XXX)
      "Postage": { num: "74800", type: "Debit" },
      "Prizes and Gifts": { num: "74900", type: "Debit" },
      "Games": { num: "74910", type: "Debit" },
      "Professional Services": { num: "75000", type: "Debit" },
      "Refund": { num: "75050", type: "Debit" },
      "Staffing Placement Fees": { num: "75100", type: "Debit" },
      "Rentals (non equipment)": { num: "75200", type: "Debit" },
      "Roping Series": { num: "75200", type: "Debit" },
      
      // Repair & Maint (75XXX)
      "Repair & Maint": { num: "75300", type: "Debit" },
      "Grounds Maint/Repair": { num: "75340", type: "Debit" },
      "Building Maint/Repair": { num: "75350", type: "Debit" },
      "Capital Improvements": { num: "61600", type: "Debit" },
      "Insurance Claims Expense": { num: "61300", type: "Debit" },
      "Property Tax & Assessments": { num: "77100", type: "Debit" },
      
      // Sponsorship/Staff (75XXX)
      "Sponsorship Expense": { num: "75410", type: "Debit" },
      "Sermon Illustration": { num: "75500", type: "Debit" },
      "Signage": { num: "75600", type: "Debit" },
      "Staff Appreciation": { num: "75700", type: "Debit" },
      "Staff Develop": { num: "75800", type: "Debit" },
      "Conf & Seminars": { num: "75900", type: "Debit", group: "Staff Develop" },
      "Staff Reimbursement Expense": { num: "75910", type: "Debit" },
      "Education Reimbursement": { num: "75910", type: "Debit" },
      
      // Subscriptions/Flowers (76XXX)
      "Subscriptions": { num: "76100", type: "Debit" },
      "Flowers and Gifts": { num: "76110", type: "Debit" },
      
      // Supplies (76XXX)
      "Supplies": { num: "76800", type: "Debit" },
      "Cleaning": { num: "76300", type: "Debit", group: "Supplies" },
      "Hospitality": { num: "76400", type: "Debit", group: "Supplies" },
      "Kitchen": { num: "76500", type: "Debit", group: "Supplies" },
      "Office": { num: "76600", type: "Debit", group: "Supplies" },
      "Promotional Items": { num: "76700", type: "Debit", group: "Supplies" },
      "Materials and Supplies": { num: "76800", type: "Debit", group: "Supplies" },
      "Communion": { num: "76950", type: "Debit", group: "Supplies" },
      "Baptism": { num: "76960", type: "Debit", group: "Supplies" },
      "Office Hospitality": { num: "76400", type: "Debit", group: "Supplies" },
      "Supplies: Salvation": { num: "76800", type: "Debit", group: "Supplies" },
      
      // Café/Taxes (77XXX)
      "Café Concess/Snack": { num: "77050", type: "Debit" },
      "Taxes, Licenses & Permits": { num: "77100", type: "Debit" },
      
      // Utilities (77XXX)
      "Utilities": { num: "77200", type: "Debit" },
      "Electricity": { num: "77200", type: "Debit", group: "Utilities" },
      "Gas": { num: "77300", type: "Debit", group: "Utilities" },
      "Phone": { num: "77400", type: "Debit", group: "Utilities" },
      "Internet": { num: "77410", type: "Debit", group: "Utilities" },
      "Refuse": { num: "77500", type: "Debit", group: "Utilities" },
      "Water & Sewer": { num: "77600", type: "Debit", group: "Utilities" },
      
      // Vehicle (77XXX)
      "Vehicle Expense": { num: "77700", type: "Debit" },
      "Gas/Fuel": { num: "77750", type: "Debit" },
      
      // Ministry (81XXX)
      "Special Projects": { num: "81100", type: "Debit" },
      "Missions Designated Support": { num: "81200", type: "Debit", group: "Missions" },
      "Missions Designated Benevolence": { num: "81250", type: "Debit", group: "Missions" },
      "Missionaries": { num: "81300", type: "Debit", group: "Missions" },
      "Missions Local projects": { num: "81350", type: "Debit", group: "Missions" },
      "Mission trips": { num: "81375", type: "Debit", group: "Missions" },
      "Designated Support": { num: "81200", type: "Debit", group: "Missions" },
      "Designated Benevolence": { num: "81250", type: "Debit", group: "Missions" },
      "Local Projects": { num: "81350", type: "Debit", group: "Missions" },
      
      // Events/Ministry Programs (81XXX)
      "Special Events": { num: "81400", type: "Debit" },
      "Discipleship/Bible Study": { num: "81450", type: "Debit" },
      
      // Children's Ministry (81XXX)
      "Nursery 0-2": { num: "81510", type: "Debit" },
      "Early Childhood 3-5": { num: "81520", type: "Debit" },
      "Elementary 6-11": { num: "81530", type: "Debit" },
      "Comfort Zone": { num: "81540", type: "Debit" },
      "Kids Clubs": { num: "81545", type: "Debit" },
      
      // Counseling (81XXX)
      "Counseling": { num: "81550", type: "Debit" },
      
      // Ranch/Animals (81XXX)
      "Meat Purchases": { num: "81605", type: "Debit" },
      "Animal Purchase": { num: "81610", type: "Debit" },
      "Animal Processing": { num: "81615", type: "Debit" },
      "Feed/Hay": { num: "81630", type: "Debit" },
      "Vaccines": { num: "81635", type: "Debit" },
      "Pasture Maintenance": { num: "81645", type: "Debit" },
      "Feedlot Expense": { num: "81630", type: "Debit" },
      "Lone Star Beef": { num: "81605", type: "Debit" },
      "Vet Expense": { num: "81635", type: "Debit" },
      
      // Merchandise/Petty Cash (81XXX)
      "Clothing, CDs": { num: "81700", type: "Debit" },
      "Merchandise": { num: "81700", type: "Debit" },
      "Petty Cash Expense": { num: "81750", type: "Debit" },
      
      // Mortgage Adj (95XXX)
      "Mortgage Principal Adj": { num: "95400", type: "Debit" },
      
      // Generic
      "Debit": { num: "73600", type: "Debit" },
      "Unknown Debit": { num: "73600", type: "Debit" },
    };

    let numUpdated = 0;

    for (const [name, mapping] of Object.entries(CATEGORY_MAPPINGS)) {
      const cats = await categoriesCollection.find({ name: name, type: mapping.type }).toArray();
      
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
          console.log(`  ✓ Updated "${name}": ${JSON.stringify(updates)}`);
          numUpdated++;
        }
      }
    }

    console.log(`\nUpdated ${numUpdated} categories with account numbers/groupNames\n`);

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
