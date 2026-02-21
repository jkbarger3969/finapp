/**
 * Fix Orphaned Category References
 * 
 * This script fixes entries that reference old category IDs (from journalEntryCategories)
 * by mapping them to the new category IDs (in the categories collection).
 * 
 * The mapping is done by matching:
 * 1. externalId (account number like 81400)
 * 2. name (if externalId doesn't match)
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'accounting';

async function fixOrphanedCategories() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Step 1: Get all journalEntryCategories (old categories)
    const oldCategories = await db.collection('journalEntryCategories').find({}).toArray();
    console.log(`Found ${oldCategories.length} old categories in journalEntryCategories`);
    
    // Step 2: Get all current categories
    const newCategories = await db.collection('categories').find({}).toArray();
    console.log(`Found ${newCategories.length} new categories in categories`);
    
    // Step 3: Build mapping from old ID to new ID
    const oldToNewMap = new Map();
    let mappedCount = 0;
    let unmappedCategories = [];
    
    for (const oldCat of oldCategories) {
      const oldId = oldCat._id.toString();
      
      // Skip if this ID already exists in the new categories (no mapping needed)
      if (newCategories.some(nc => nc._id.toString() === oldId)) {
        continue;
      }
      
      // Try to find matching new category by externalId (account number)
      let newCat = newCategories.find(nc => 
        nc.accountNumber === oldCat.externalId || 
        nc.displayName?.includes(oldCat.externalId)
      );
      
      // If not found by externalId, try by name (exact or partial match)
      if (!newCat) {
        // Try exact name match first
        newCat = newCategories.find(nc => 
          nc.name?.toLowerCase() === oldCat.name?.toLowerCase()
        );
      }
      
      // Try partial match (new category name contains old name or vice versa)
      if (!newCat) {
        newCat = newCategories.find(nc => {
          const oldName = oldCat.name?.toLowerCase() || '';
          const newName = nc.name?.toLowerCase() || '';
          return newName.includes(oldName) || oldName.includes(newName);
        });
      }
      
      if (newCat) {
        oldToNewMap.set(oldId, newCat._id);
        mappedCount++;
        console.log(`  Mapped: ${oldCat.name} (${oldId}) -> ${newCat.name} (${newCat._id})`);
      } else {
        unmappedCategories.push({ oldId, name: oldCat.name, externalId: oldCat.externalId, type: oldCat.type });
      }
    }
    
    console.log(`\nMapped ${mappedCount} categories`);
    console.log(`Unmapped: ${unmappedCategories.length} categories`);
    
    if (unmappedCategories.length > 0) {
      console.log('\nUnmapped categories (will need to be added or manually mapped):');
      for (const uc of unmappedCategories) {
        console.log(`  ${uc.externalId} - ${uc.name} (${uc.type}) [Old ID: ${uc.oldId}]`);
      }
    }
    
    // Step 4: Create missing categories in the categories collection
    console.log('\n--- Creating missing categories ---');
    for (const uc of unmappedCategories) {
      const oldCat = oldCategories.find(oc => oc._id.toString() === uc.oldId);
      if (!oldCat) continue;
      
      // Determine the type (Credit or Debit)
      const categoryType = oldCat.type?.toLowerCase() === 'credit' ? 'Credit' : 'Debit';
      
      // Create the new category with the SAME ID as the old one
      // This avoids needing to update entries
      const newCatDoc = {
        _id: new ObjectId(uc.oldId),
        name: uc.name,
        displayName: `${uc.externalId} ${uc.name}`,
        accountNumber: uc.externalId,
        type: categoryType,
        hidden: false,
        sortOrder: parseInt(uc.externalId) || 99999
      };
      
      try {
        await db.collection('categories').insertOne(newCatDoc);
        console.log(`  Created: ${newCatDoc.displayName} (${categoryType})`);
      } catch (err) {
        if (err.code === 11000) {
          console.log(`  Already exists: ${newCatDoc.displayName}`);
        } else {
          console.log(`  Error creating ${newCatDoc.displayName}: ${err.message}`);
        }
      }
    }
    
    // Step 4b: Create additional known missing categories (not in journalEntryCategories)
    console.log('\n--- Creating additional known missing categories ---');
    const additionalCategories = [
      { _id: '6182ee104c38cd32c32fbdae', name: 'Pasture Maintenance', type: 'Debit', accountNumber: '81645' },
      { _id: '633dadd40f6cb31f691a3d72', name: 'Global Courses', type: 'Debit', accountNumber: '71620' },
      { _id: '64f1127557fb09d3c5047267', name: 'Kids Clubs', type: 'Debit', accountNumber: '81545' },
      { _id: '64f1127557fb09d3c504726b', name: 'Building Maint/Repair', type: 'Debit', accountNumber: '75350' },
      { _id: '64f1128857fb09d3c5047283', name: 'Roping Series Expense', type: 'Debit', accountNumber: '81620' },
      { _id: '64f1127557fb09d3c5047269', name: 'Grounds Maint/Repair', type: 'Debit', accountNumber: '75340' },
      { _id: '64f1128857fb09d3c5047285', name: 'Animal Sales', type: 'Credit', accountNumber: '45030' },
      { _id: '67ae3f788e0dbcebd48abf0f', name: 'HPYF Team Roping Expense', type: 'Debit', accountNumber: '81621' },
      { _id: '67c0e082330427b2bda7d92a', name: 'Meat Purchases', type: 'Debit', accountNumber: '81605' }
    ];

    for (const cat of additionalCategories) {
      const doc = {
        _id: new ObjectId(cat._id),
        name: cat.name,
        displayName: `${cat.accountNumber} ${cat.name}`,
        accountNumber: cat.accountNumber,
        type: cat.type,
        hidden: false,
        sortOrder: parseInt(cat.accountNumber) || 99999
      };

      try {
        await db.collection('categories').insertOne(doc);
        console.log(`  Created: ${doc.displayName} (${doc.type})`);
      } catch (err) {
        if (err.code === 11000) {
          console.log(`  Already exists: ${doc.displayName}`);
        } else {
          console.log(`  Error: ${err.message}`);
        }
      }
    }

    // Step 5: Update entries with mapped categories
    console.log('\n--- Updating entries with mapped categories ---');
    let updatedCount = 0;
    
    for (const [oldId, newId] of oldToNewMap) {
      const result = await db.collection('entries').updateMany(
        { "category.0.value": new ObjectId(oldId) },
        { $set: { "category.0.value": newId } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`  Updated ${result.modifiedCount} entries: ${oldId} -> ${newId}`);
        updatedCount += result.modifiedCount;
      }
    }
    
    console.log(`\nTotal entries updated: ${updatedCount}`);
    
    // Step 6: Verify - count remaining orphaned entries
    const categories = await db.collection('categories').find({}).toArray();
    const validCatIds = new Set(categories.map(c => c._id.toString()));
    
    const allEntries = await db.collection('entries').find({ "deleted.0.value": { $ne: true } }).toArray();
    let orphanCount = 0;
    
    for (const entry of allEntries) {
      const catId = entry.category?.[0]?.value?.toString();
      if (catId && !validCatIds.has(catId)) {
        orphanCount++;
      }
    }
    
    console.log(`\nRemaining orphaned entries: ${orphanCount}`);
    
    if (orphanCount === 0) {
      console.log('SUCCESS: All entries now have valid category references!');
    } else {
      console.log('WARNING: Some entries still have orphaned categories. Manual review needed.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

fixOrphanedCategories();
