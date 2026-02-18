const { MongoClient } = require('mongodb');

// Account number mappings - maps partial name matches to account numbers
// This handles both "Camp Registration" and "Credit: Camp Registration" style names

const ACCOUNT_NUMBERS = {
  // Income (41000-91000)
  "Contribution Income": "41000",
  "Ministry Fees/Income": "43000",
  "Merchandise Sales": "43100",
  "Music Sales": "43200",
  "Scholarship Income": "43400",
  "Camp Registration": "43400",
  "Fundraiser Income": "43450",
  "Sponsorship Income": "43450",
  "Reimbursement Income": "43500",
  "Refund": "43500",  // Credit refund
  "Facility/Rent Income": "44000",
  "Unrealized Gain/Loss Investments": "44500",
  "Other Income": "45000",
  "Income transfer": "45000",
  "Unknown Credit": "45000",
  "Stock Fees": "45020",
  "Animal Sales": "45030",
  "Lone Star Beef Donations": "45030",
  "Interest Income": "90000",
  "Dividend Income": "91000",
  "Credit": "41000",
  "Donations": "41000",

  // Payroll & Benefits (51000)
  "Staff Wages": "51100",
  "Staff wages": "51100",
  "Employer FICA": "51200",
  "Medical": "51500",
  "Dental and Vision": "51600",
  "Child Care Match Expense": "51610",
  "Life": "51700",

  // Capital & Property (61000)
  "Mortgage Principle/Interest": "61100",
  "Mortgage Principal/Interest": "61100",
  "Mortgage Principal Adj": "95400",
  "Property & Liability Insurance": "61300",
  "Insurance Claims Expense": "61300",
  "Workers Comp Insurance": "61400",
  "Capital Improvements": "61600",
  "Equipment": "61600",
  "Building": "61650",

  // Bank Charges (71000)
  "Bank Charges": "71100",
  "eGive Fees": "71200",

  // General Expenses (71000)
  "Benevolence Expense": "71300",
  "Curriculum & Resources": "71600",
  "Global Courses": "71620",
  "Sponsored Courses": "71620",
  "Unsponsored Courses": "71620",
  "Dues & Fees": "71700",
  "Database Software Fees": "71710",
  "Fundraiser Expense": "71850",
  "Equipment Expense": "71900",

  // Equipment (72000)
  "Audio": "72000",
  "Media": "72000",
  "Lighting": "72200",
  "Video": "72200",
  "Equipment Rental": "72300",
  "Arena": "72300",
  "Furnishings": "72400",
  "Stage Design": "72400",

  // Meals (72000)
  "Meals": "72650",
  "Event Meal": "72650",
  "Catering": "72650",
  "Travel": "72700",
  "Travel/Lodging": "72710",

  // Marketing (73000)
  "Marketing": "73100",
  "Other": "73100",
  "Billboards": "73100",
  "Broadcast Time": "73100",
  "Radio": "73100",
  "TV": "73100",
  "Printed Materials": "73200",
  "Graphic Design": "73200",
  "Promotions/Discounts": "73300",
  "Social Media": "73400",
  "Live Streaming Fee": "73400",
  "Website": "73400",

  // Travel/Mileage (73000)
  "Mileage Reimbursement": "73500",
  "Travel/Moving Reimb": "73500",
  "Miscellaneous": "73600",
  "Debit": "73600",
  "Unknown Debit": "73600",

  // Outside Services (73000-74000)
  "Background Check": "73700",
  "Guest Speaker": "73800",
  "Pastor": "73800",
  "VIP Guests": "73800",
  "Security": "74000",
  "Childcare": "74100",
  "Contract Services": "74300",
  "Janitorial": "74400",
  "Musicians": "74500",
  "Outside Services": "74600",
  "Printing": "74700",

  // General (74000-75000)
  "Postage": "74800",
  "Prizes and Gifts": "74900",
  "Games": "74910",
  "Professional Services": "75000",
  "Refund": "75050",  // Debit refund - will be handled specially
  "Staffing Placement Fees": "75100",
  "Rentals (non equipment)": "75200",
  "Roping Series": "75200",

  // Repair & Maintenance (75000)
  "Repair & Maint": "75300",
  "Grounds Maint/Repair": "75340",
  "Building Maint/Repair": "75350",
  "Sponsorship Expense": "75410",
  "Sermon Illustration": "75500",
  "Signage": "75600",
  "Staff Appreciation": "75700",
  "Staff Develop": "75800",
  "Conf & Seminars": "75900",
  "Staff Reimbursement Expense": "75910",
  "Education Reimbursement": "75910",

  // Subscriptions & Supplies (76000)
  "Subscriptions": "76100",
  "Flowers and Gifts": "76110",
  "Cleaning": "76300",
  "Hospitality": "76400",
  "Office Hospitality": "76400",
  "Kitchen": "76500",
  "Office": "76600",
  "Promotional Items": "76700",
  "Materials and Supplies": "76800",
  "Supplies": "76800",
  "Salvation": "76800",
  "Communion": "76950",
  "Baptism": "76960",

  // Café & Taxes (77000)
  "Café Concess/Snack": "77050",
  "Cafe Concess/Snack": "77050",
  "Taxes, Licenses & Permits": "77100",
  "Taxes Licenses & Permits": "77100",
  "Property Tax & Assessments": "77100",

  // Utilities (77000)
  "Utilities": "77200",
  "Electricity": "77200",
  "Gas": "77300",
  "Phone": "77400",
  "Internet": "77410",
  "Refuse": "77500",
  "Water & Sewer": "77600",

  // Vehicle (77000)
  "Vehicle Expense": "77700",
  "Gas/Fuel": "77750",

  // Ministry (81000)
  "Special Projects": "81100",
  "Missions Designated Support": "81200",
  "Missions Designated Benevolence": "81250",
  "Missionaries": "81300",
  "Missions Local projects": "81350",
  "Mission trips": "81375",
  "Special Events": "81400",
  "Discipleship/Bible Study": "81450",
  "Nursery 0-2": "81510",
  "Early Childhood 3-5": "81520",
  "Elementary 6-11": "81530",
  "Comfort Zone": "81540",
  "Kids Clubs": "81545",
  "Counseling": "81550",

  // Ranch/Animals (81000)
  "Meat Purchases": "81605",
  "Lone Star Beef": "81605",
  "Animal Purchase": "81610",
  "Animal Processing": "81615",
  "Feed/Hay": "81630",
  "Feedlot Expense": "81630",
  "Vaccines": "81635",
  "Vet Expense": "81635",
  "Pasture Maintenance": "81645",

  // Merchandise (81000)
  "Clothing, CDs": "81700",
  "Merchandise": "81700",
  "Petty Cash Expense": "81750"
};

// Function to find matching account number for a category name
function findAccountNumber(name, type) {
  // Direct match first
  if (ACCOUNT_NUMBERS[name]) {
    // Special case: "Refund" depends on type
    if (name === "Refund") {
      return type === "Credit" ? "43500" : "75050";
    }
    return ACCOUNT_NUMBERS[name];
  }

  // Try to extract the base name from prefixed names
  // Handle patterns like "Credit: Camp Registration", "Equipment Expense: Video", "Supplies: Kitchen"
  const colonIndex = name.lastIndexOf(': ');
  if (colonIndex !== -1) {
    const baseName = name.substring(colonIndex + 2);
    if (ACCOUNT_NUMBERS[baseName]) {
      return ACCOUNT_NUMBERS[baseName];
    }
    
    // Also try the prefix part
    const prefix = name.substring(0, colonIndex);
    if (ACCOUNT_NUMBERS[prefix]) {
      return ACCOUNT_NUMBERS[prefix];
    }
  }

  // Try partial matching for common patterns
  for (const [key, num] of Object.entries(ACCOUNT_NUMBERS)) {
    if (name.includes(key) || key.includes(name)) {
      return num;
    }
  }

  return null;
}

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

    // Get all categories without account numbers
    const allCats = await cats.find({
      $or: [
        { accountNumber: { $exists: false } },
        { accountNumber: null },
        { accountNumber: '' }
      ]
    }).toArray();

    console.log(`Found ${allCats.length} categories without account numbers\n`);

    let updatedCount = 0;
    let notFoundNames = [];

    for (const cat of allCats) {
      const accountNumber = findAccountNumber(cat.name, cat.type);
      
      if (accountNumber) {
        await cats.updateOne(
          { _id: cat._id },
          { $set: { accountNumber: accountNumber } }
        );
        console.log(`  ✓ "${cat.name}" (${cat.type}) => ${accountNumber}`);
        updatedCount++;
      } else {
        notFoundNames.push(`"${cat.name}" (${cat.type})`);
      }
    }

    console.log(`\n=== Updated ${updatedCount} categories ===\n`);

    // Final summary
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

    console.log('=== FINAL SUMMARY ===');
    console.log(`Categories with account numbers: ${withNumbers}`);
    console.log(`Categories without account numbers: ${withoutNumbers}`);

    if (notFoundNames.length > 0) {
      console.log('\n=== Could not find mapping for: ===');
      notFoundNames.forEach(n => console.log(`  ${n}`));
    }

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
