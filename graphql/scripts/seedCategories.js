const { MongoClient } = require('mongodb');

// Complete list from Income Statement - categories to ensure exist
const REQUIRED_CATEGORIES = {
  // INCOME (Credit) - from your Income Statement
  income: [
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
  ],
  
  // EXPENSE (Debit) - from your Income Statement
  expense: [
    // Payroll
    { name: "Payroll: Staff wages", num: "51100", group: "Payroll" },
    { name: "Payroll: Employer FICA", num: "51200", group: "Payroll" },
    // Benefits
    { name: "Benefits: Medical", num: "51500", group: "Benefits" },
    { name: "Benefits: Dental and Vision", num: "51600", group: "Benefits" },
    { name: "Benefits: Child Care Match Expense", num: "51610", group: "Benefits" },
    { name: "Benefits: Life", num: "51700", group: "Benefits" },
    // Capital
    { name: "Mortgage Principle/Interest", num: "61100" },
    { name: "Property & Liability Insurance", num: "61300" },
    { name: "Workers Comp Insurance", num: "61400" },
    { name: "Capital Improvements: Equipment", num: "61600", group: "Capital Improvements" },
    { name: "Capital Improvements: Building", num: "61650", group: "Capital Improvements" },
    // Bank
    { name: "Bank Charges", num: "71100" },
    { name: "Bank Charges: eGive Fees", num: "71200", group: "Bank Charges" },
    // General
    { name: "Benevolence Expense", num: "71300" },
    { name: "Curriculum & Resources", num: "71600" },
    { name: "Global Courses", num: "71620" },
    { name: "Dues & Fees", num: "71700" },
    { name: "Database Software Fees", num: "71710" },
    { name: "Fundraiser Expense", num: "71850" },
    // Equipment
    { name: "Equipment Expense", num: "71900" },
    { name: "Equipment Expense: Audio", num: "72000", group: "Equipment Expense" },
    { name: "Equipment Expense: Lighting", num: "72200", group: "Equipment Expense" },
    { name: "Equipment Rental", num: "72300" },
    { name: "Furnishings", num: "72400" },
    // Meals
    { name: "Meals: Event Meal", num: "72650", group: "Meals" },
    { name: "Meals: Travel", num: "72700", group: "Meals" },
    { name: "Travel/Lodging", num: "72710" },
    // Marketing
    { name: "Marketing: Other", num: "73100", group: "Marketing" },
    { name: "Marketing: Printed Materials", num: "73200", group: "Marketing" },
    { name: "Marketing: Promotions/Discounts", num: "73300", group: "Marketing" },
    { name: "Marketing: Social Media", num: "73400", group: "Marketing" },
    // Travel
    { name: "Mileage Reimbursement", num: "73500" },
    { name: "Miscellaneous", num: "73600" },
    // Outside Services
    { name: "Outside Services: Background Check", num: "73700", group: "Outside Services" },
    { name: "Outside Services: Guest Speaker", num: "73800", group: "Outside Services" },
    { name: "Outside Services: Security", num: "74000", group: "Outside Services" },
    { name: "Outside Services: Childcare", num: "74100", group: "Outside Services" },
    { name: "Outside Services: Contract Services", num: "74300", group: "Outside Services" },
    { name: "Outside Services: Janitorial", num: "74400", group: "Outside Services" },
    { name: "Outside Services: Musicians", num: "74500", group: "Outside Services" },
    { name: "Outside Services: Other", num: "74600", group: "Outside Services" },
    { name: "Outside Services: Printing", num: "74700", group: "Outside Services" },
    // General
    { name: "Postage", num: "74800" },
    { name: "Prizes and Gifts", num: "74900" },
    { name: "Games", num: "74910" },
    { name: "Professional Services", num: "75000" },
    { name: "Refund", num: "75050" },
    { name: "Staffing Placement Fees", num: "75100" },
    { name: "Rentals (non equipment)", num: "75200" },
    // Repair & Maint
    { name: "Repair & Maint", num: "75300" },
    { name: "Grounds Maint/Repair", num: "75340", group: "Repair & Maint" },
    { name: "Building Maint/Repair", num: "75350", group: "Repair & Maint" },
    // Staff
    { name: "Sponsorship Expense", num: "75410" },
    { name: "Sermon Illustration", num: "75500" },
    { name: "Signage", num: "75600" },
    { name: "Staff Appreciation", num: "75700" },
    { name: "Staff Develop", num: "75800" },
    { name: "Staff Develop: Conf & Seminars", num: "75900", group: "Staff Develop" },
    { name: "Staff Reimbursement Expense", num: "75910" },
    // Subscriptions
    { name: "Subscriptions", num: "76100" },
    { name: "Flowers and Gifts", num: "76110" },
    // Supplies
    { name: "Supplies: Cleaning", num: "76300", group: "Supplies" },
    { name: "Supplies: Hospitality", num: "76400", group: "Supplies" },
    { name: "Supplies: Kitchen", num: "76500", group: "Supplies" },
    { name: "Supplies: Office", num: "76600", group: "Supplies" },
    { name: "Supplies: Promotional Items", num: "76700", group: "Supplies" },
    { name: "Supplies: Materials and Supplies", num: "76800", group: "Supplies" },
    { name: "Supplies: Communion", num: "76950", group: "Supplies" },
    { name: "Supplies: Baptism", num: "76960", group: "Supplies" },
    // Café/Taxes
    { name: "Café Concess/Snack", num: "77050" },
    { name: "Taxes, Licenses & Permits", num: "77100" },
    // Utilities
    { name: "Utilities: Electricity", num: "77200", group: "Utilities" },
    { name: "Utilities: Gas", num: "77300", group: "Utilities" },
    { name: "Utilities: Phone", num: "77400", group: "Utilities" },
    { name: "Utilities: Internet", num: "77410", group: "Utilities" },
    { name: "Utilities: Refuse", num: "77500", group: "Utilities" },
    { name: "Utilities: Water & Sewer", num: "77600", group: "Utilities" },
    // Vehicle
    { name: "Vehicle Expense", num: "77700" },
    { name: "Gas/Fuel", num: "77750" },
    // Ministry
    { name: "Special Projects", num: "81100" },
    { name: "Missions Designated Support", num: "81200" },
    { name: "Missions Designated Benevolence", num: "81250" },
    { name: "Missionaries", num: "81300" },
    { name: "Missions Local projects", num: "81350" },
    { name: "Mission trips", num: "81375" },
    { name: "Special Events", num: "81400" },
    { name: "Discipleship/Bible Study", num: "81450" },
    // Children
    { name: "Nursery 0-2", num: "81510" },
    { name: "Early Childhood 3-5", num: "81520" },
    { name: "Elementary 6-11", num: "81530" },
    { name: "Comfort Zone", num: "81540" },
    { name: "Kids Clubs", num: "81545" },
    { name: "Counseling", num: "81550" },
    // Ranch
    { name: "Meat Purchases", num: "81605" },
    { name: "Animal Purchase", num: "81610" },
    { name: "Animal Processing", num: "81615" },
    { name: "Feed/Hay", num: "81630" },
    { name: "Vaccines", num: "81635" },
    { name: "Pasture Maintenance", num: "81645" },
    // Merchandise
    { name: "Merchandise: Clothing, CDs", num: "81700", group: "Merchandise" },
    { name: "Petty Cash Expense", num: "81750" },
    // Mortgage Adj
    { name: "Mortgage Principal Adj", num: "95400" },
  ]
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

    // Get existing categories
    const existing = await cats.find({}).toArray();
    const existingByName = {};
    existing.forEach(c => {
      const key = `${c.type}:${c.name}`;
      existingByName[key] = c;
    });

    let createdCount = 0;
    let updatedCount = 0;

    // Process INCOME categories
    console.log('=== Processing INCOME Categories ===\n');
    for (const cat of REQUIRED_CATEGORIES.income) {
      const key = `Credit:${cat.name}`;
      
      if (existingByName[key]) {
        // Update existing
        const updates = { accountNumber: cat.num };
        if (cat.group) updates.groupName = cat.group;
        
        await cats.updateOne({ _id: existingByName[key]._id }, { $set: updates });
        console.log(`  ✓ Updated: "${cat.name}" => ${cat.num}`);
        updatedCount++;
      } else {
        // Create new
        const newCat = {
          name: cat.name,
          type: 'Credit',
          accountNumber: cat.num,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        if (cat.group) newCat.groupName = cat.group;
        
        await cats.insertOne(newCat);
        console.log(`  + Created: "${cat.name}" => ${cat.num}`);
        createdCount++;
      }
    }

    // Process EXPENSE categories
    console.log('\n=== Processing EXPENSE Categories ===\n');
    for (const cat of REQUIRED_CATEGORIES.expense) {
      const key = `Debit:${cat.name}`;
      
      if (existingByName[key]) {
        // Update existing
        const updates = { accountNumber: cat.num };
        if (cat.group) updates.groupName = cat.group;
        
        await cats.updateOne({ _id: existingByName[key]._id }, { $set: updates });
        console.log(`  ✓ Updated: "${cat.name}" => ${cat.num}`);
        updatedCount++;
      } else {
        // Create new
        const newCat = {
          name: cat.name,
          type: 'Debit',
          accountNumber: cat.num,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        if (cat.group) newCat.groupName = cat.group;
        
        await cats.insertOne(newCat);
        console.log(`  + Created: "${cat.name}" => ${cat.num}`);
        createdCount++;
      }
    }

    console.log(`\n=== Created: ${createdCount}, Updated: ${updatedCount} ===\n`);

    // Now update any remaining categories that might have different names
    console.log('=== Updating remaining categories with account numbers ===\n');
    
    // Account number mappings for various name formats
    const NAME_TO_NUM = {
      // Income variations
      "Contribution Income": "41000", "Donations": "41000", "Credit": "41000",
      "Ministry Fees/Income": "43000",
      "Merchandise Sales": "43100",
      "Music Sales": "43200",
      "Scholarship Income": "43400", "Camp Registration": "43400",
      "Fundraiser Income": "43450", "Sponsorship Income": "43450",
      "Reimbursement Income": "43500",
      "Facility/Rent Income": "44000",
      "Unrealized Gain/Loss Investments": "44500",
      "Other Income": "45000", "Income transfer": "45000", "Unknown Credit": "45000",
      "Stock Fees": "45020",
      "Animal Sales": "45030", "Lone Star Beef Donations": "45030",
      "Interest Income": "90000",
      "Dividend Income": "91000",
      
      // Expense variations - short names
      "Staff Wages": "51100", "Staff wages": "51100",
      "Employer FICA": "51200",
      "Medical": "51500",
      "Dental and Vision": "51600",
      "Child Care Match Expense": "51610",
      "Life": "51700",
      "Equipment": "61600",
      "Building": "61650",
      "eGive Fees": "71200",
      "Audio": "72000", "Media": "72000",
      "Lighting": "72200", "Video": "72200",
      "Event Meal": "72650", "Catering": "72650", "Meals": "72650",
      "Travel": "72700",
      "Other": "73100", "Billboards": "73100", "Radio": "73100", "TV": "73100", "Broadcast Time": "73100",
      "Printed Materials": "73200", "Graphic Design": "73200",
      "Promotions/Discounts": "73300",
      "Social Media": "73400", "Website": "73400", "Live Streaming Fee": "73400",
      "Travel/Moving Reimb": "73500",
      "Debit": "73600", "Unknown Debit": "73600",
      "Background Check": "73700",
      "Guest Speaker": "73800", "Pastor": "73800", "VIP Guests": "73800",
      "Security": "74000",
      "Childcare": "74100",
      "Contract Services": "74300",
      "Janitorial": "74400",
      "Musicians": "74500",
      "Outside Services": "74600",
      "Printing": "74700",
      "Roping Series": "75200",
      "Conf & Seminars": "75900",
      "Education Reimbursement": "75910",
      "Stage Design": "72400",
      "Cleaning": "76300",
      "Hospitality": "76400", "Office Hospitality": "76400",
      "Kitchen": "76500",
      "Office": "76600",
      "Promotional Items": "76700",
      "Materials and Supplies": "76800", "Supplies": "76800", "Salvation": "76800", "Supplies: Salvation": "76800",
      "Communion": "76950",
      "Baptism": "76960",
      "Cafe Concess/Snack": "77050",
      "Taxes Licenses & Permits": "77100", "Property Tax & Assessments": "77100",
      "Utilities": "77200", "Electricity": "77200",
      "Gas": "77300",
      "Phone": "77400",
      "Internet": "77410",
      "Refuse": "77500",
      "Water & Sewer": "77600",
      "Arena": "72300",
      "Feedlot Expense": "81630",
      "Lone Star Beef": "81605",
      "Vet Expense": "81635",
      "Clothing, CDs": "81700", "Merchandise": "81700",
      "Insurance Claims Expense": "61300",
      "Capital Improvements": "61600",
      "Bank Charges": "71100",
      "Global Courses": "71620", "Sponsored Courses": "71620", "Unsponsored Courses": "71620",
    };

    // Update remaining categories without numbers
    const remaining = await cats.find({
      $or: [
        { accountNumber: { $exists: false } },
        { accountNumber: null },
        { accountNumber: '' }
      ]
    }).toArray();

    for (const cat of remaining) {
      let num = NAME_TO_NUM[cat.name];
      
      // Try extracting from prefixed name
      if (!num && cat.name.includes(': ')) {
        const parts = cat.name.split(': ');
        const baseName = parts[parts.length - 1];
        num = NAME_TO_NUM[baseName];
        
        // Also try the prefix
        if (!num) {
          num = NAME_TO_NUM[parts[0]];
        }
      }
      
      if (num) {
        await cats.updateOne({ _id: cat._id }, { $set: { accountNumber: num } });
        console.log(`  ✓ "${cat.name}" => ${num}`);
        updatedCount++;
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(50));
    console.log('=== FINAL SUMMARY ===');
    console.log('='.repeat(50));

    const withNumbers = await cats.countDocuments({
      accountNumber: { $exists: true, $ne: null, $ne: '' }
    });
    const withoutNumbers = await cats.countDocuments({
      $or: [
        { accountNumber: { $exists: false } },
        { accountNumber: null },
        { accountNumber: '' }
      ]
    });

    console.log(`Categories with account numbers: ${withNumbers}`);
    console.log(`Categories without account numbers: ${withoutNumbers}`);

    if (withoutNumbers > 0) {
      console.log('\n=== Still Missing Account Numbers ===');
      const missing = await cats.find({
        $or: [
          { accountNumber: { $exists: false } },
          { accountNumber: null },
          { accountNumber: '' }
        ]
      }).sort({ type: 1, name: 1 }).toArray();
      
      missing.forEach(c => {
        console.log(`  "${c.name}" (${c.type})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

main();
