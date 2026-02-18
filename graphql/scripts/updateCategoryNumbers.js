const { MongoClient } = require('mongodb');

// Income (Credit) categories mapping
const INCOME_MAP = {
  "Animal Sales": "45030",
  "Camp Registration": "43400",
  "Contribution Income": "41000",
  "Credit": "41000",
  "Donations": "41000",
  "Facility/Rent Income": "44000",
  "Fundraiser Income": "43450",
  "Income transfer": "45000",
  "Lone Star Beef Donations": "45030",
  "Merchandise Sales": "43100",
  "Ministry Fees/Income": "43000",
  "Music Sales": "43200",
  "Other Income": "45000",
  "Refund": "43500",
  "Reimbursement Income": "43500",
  "Scholarship Income": "43400",
  "Sponsorship Income": "43450",
  "Stock Fees": "45020",
  "Unknown Credit": "45000",
  "Unrealized Gain/Loss Investments": "44500",
  "Interest Income": "90000",
  "Dividend Income": "91000"
};

// Expense (Debit) categories mapping with optional groupName
const EXPENSE_MAP = {
  "Animal Processing": { num: "81615" },
  "Animal Purchase": { num: "81610" },
  "Arena": { num: "72300" },
  "Audio": { num: "72000", group: "Equipment Expense" },
  "Background Check": { num: "73700", group: "Outside Services" },
  "Bank Charges": { num: "71100" },
  "Baptism": { num: "76960", group: "Supplies" },
  "Benevolence Expense": { num: "71300" },
  "Billboards": { num: "73100", group: "Marketing" },
  "Broadcast Time": { num: "73100" },
  "Building": { num: "61650", group: "Capital Improvements" },
  "Building Maint/Repair": { num: "75350", group: "Repair & Maint" },
  "Café Concess/Snack": { num: "77050" },
  "Capital Improvements": { num: "61600" },
  "Catering": { num: "72650", group: "Meals" },
  "Childcare": { num: "74100", group: "Outside Services" },
  "Cleaning": { num: "76300", group: "Supplies" },
  "Clothing, CDs": { num: "81700" },
  "Comfort Zone": { num: "81540" },
  "Communion": { num: "76950", group: "Supplies" },
  "Conf & Seminars": { num: "75900", group: "Staff Develop" },
  "Contract Services": { num: "74300", group: "Outside Services" },
  "Counseling": { num: "81550" },
  "Curriculum & Resources": { num: "71600" },
  "Database Software Fees": { num: "71710" },
  "Debit": { num: "73600" },
  "Discipleship/Bible Study": { num: "81450" },
  "Dues & Fees": { num: "71700" },
  "Early Childhood 3-5": { num: "81520" },
  "Education Reimbursement": { num: "75910" },
  "Electricity": { num: "77200", group: "Utilities" },
  "Elementary 6-11": { num: "81530" },
  "Equipment": { num: "61600", group: "Capital Improvements" },
  "Equipment Expense": { num: "71900" },
  "Equipment Rental": { num: "72300" },
  "Event Meal": { num: "72650", group: "Meals" },
  "Feed/Hay": { num: "81630" },
  "Feedlot Expense": { num: "81630" },
  "Flowers and Gifts": { num: "76110" },
  "Fundraiser Expense": { num: "71850" },
  "Furnishings": { num: "72400" },
  "Games": { num: "74910" },
  "Gas": { num: "77300", group: "Utilities" },
  "Gas/Fuel": { num: "77750" },
  "Global Courses": { num: "71620" },
  "Graphic Design": { num: "73200", group: "Marketing" },
  "Grounds Maint/Repair": { num: "75340", group: "Repair & Maint" },
  "Guest Speaker": { num: "73800", group: "Outside Services" },
  "Hospitality": { num: "76400", group: "Supplies" },
  "Insurance Claims Expense": { num: "61300" },
  "Internet": { num: "77410", group: "Utilities" },
  "Janitorial": { num: "74400", group: "Outside Services" },
  "Kids Clubs": { num: "81545" },
  "Kitchen": { num: "76500", group: "Supplies" },
  "Lighting": { num: "72200", group: "Equipment Expense" },
  "Live Streaming Fee": { num: "73400" },
  "Lone Star Beef": { num: "81605" },
  "Marketing": { num: "73100" },
  "Materials and Supplies": { num: "76800", group: "Supplies" },
  "Meals": { num: "72650" },
  "Meat Purchases": { num: "81605" },
  "Media": { num: "72000" },
  "Merchandise": { num: "81700" },
  "Mileage Reimbursement": { num: "73500" },
  "Miscellaneous": { num: "73600" },
  "Mission trips": { num: "81375" },
  "Missionaries": { num: "81300" },
  "Missions Designated Benevolence": { num: "81250" },
  "Missions Designated Support": { num: "81200" },
  "Missions Local projects": { num: "81350" },
  "Musicians": { num: "74500", group: "Outside Services" },
  "Nursery 0-2": { num: "81510" },
  "Office": { num: "76600", group: "Supplies" },
  "Office Hospitality": { num: "76400", group: "Supplies" },
  "Other": { num: "73100", group: "Marketing" },
  "Outside Services": { num: "74600" },
  "Pastor": { num: "73800" },
  "Pasture Maintenance": { num: "81645" },
  "Petty Cash Expense": { num: "81750" },
  "Phone": { num: "77400", group: "Utilities" },
  "Postage": { num: "74800" },
  "Printed Materials": { num: "73200", group: "Marketing" },
  "Printing": { num: "74700", group: "Outside Services" },
  "Prizes and Gifts": { num: "74900" },
  "Professional Services": { num: "75000" },
  "Promotional Items": { num: "76700", group: "Supplies" },
  "Promotions/Discounts": { num: "73300", group: "Marketing" },
  "Property Tax & Assessments": { num: "77100" },
  "Radio": { num: "73100", group: "Broadcast Time" },
  "Refund": { num: "75050" },
  "Refuse": { num: "77500", group: "Utilities" },
  "Rentals (non equipment)": { num: "75200" },
  "Repair & Maint": { num: "75300" },
  "Roping Series": { num: "75200" },
  "Security": { num: "74000", group: "Outside Services" },
  "Sermon Illustration": { num: "75500" },
  "Signage": { num: "75600" },
  "Social Media": { num: "73400", group: "Marketing" },
  "Special Events": { num: "81400" },
  "Special Projects": { num: "81100" },
  "Sponsored Courses": { num: "71620" },
  "Sponsorship Expense": { num: "75410" },
  "Staff Appreciation": { num: "75700" },
  "Staff Develop": { num: "75800" },
  "Staff Reimbursement Expense": { num: "75910" },
  "Staffing Placement Fees": { num: "75100" },
  "Stage Design": { num: "72400" },
  "Subscriptions": { num: "76100" },
  "Supplies": { num: "76800" },
  "Supplies: Salvation": { num: "76800", group: "Supplies" },
  "TV": { num: "73100", group: "Broadcast Time" },
  "Taxes, Licenses & Permits": { num: "77100" },
  "Travel": { num: "72700", group: "Meals" },
  "Travel/Lodging": { num: "72710" },
  "Travel/Moving Reimb": { num: "73500" },
  "Unknown Debit": { num: "73600" },
  "Unsponsored Courses": { num: "71620" },
  "Utilities": { num: "77200" },
  "VIP Guests": { num: "73800" },
  "Vaccines": { num: "81635" },
  "Vehicle Expense": { num: "77700" },
  "Vet Expense": { num: "81635" },
  "Video": { num: "72200", group: "Equipment Expense" },
  "Water & Sewer": { num: "77600", group: "Utilities" },
  "Website": { num: "73400", group: "Marketing" },
  "eGive Fees": { num: "71200", group: "Bank Charges" }
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

    let totalUpdated = 0;

    // Update Income (Credit) categories
    console.log('=== Updating INCOME (Credit) Categories ===\n');
    for (const [name, num] of Object.entries(INCOME_MAP)) {
      const result = await cats.updateMany(
        { name: name, type: 'Credit' },
        { $set: { accountNumber: num } }
      );
      if (result.modifiedCount > 0) {
        console.log(`  ✓ "${name}" => ${num} (${result.modifiedCount} updated)`);
        totalUpdated += result.modifiedCount;
      } else if (result.matchedCount > 0) {
        console.log(`  - "${name}" already set to ${num}`);
      }
    }

    // Update Expense (Debit) categories
    console.log('\n=== Updating EXPENSE (Debit) Categories ===\n');
    for (const [name, mapping] of Object.entries(EXPENSE_MAP)) {
      const update = { accountNumber: mapping.num };
      if (mapping.group) {
        update.groupName = mapping.group;
      }
      
      const result = await cats.updateMany(
        { name: name, type: 'Debit' },
        { $set: update }
      );
      if (result.modifiedCount > 0) {
        console.log(`  ✓ "${name}" => ${mapping.num}${mapping.group ? ` (group: ${mapping.group})` : ''} (${result.modifiedCount} updated)`);
        totalUpdated += result.modifiedCount;
      } else if (result.matchedCount > 0) {
        console.log(`  - "${name}" already set`);
      }
    }

    console.log(`\n=== Total Updated: ${totalUpdated} ===\n`);

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
