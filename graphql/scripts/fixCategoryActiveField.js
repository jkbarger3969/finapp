const { MongoClient } = require('mongodb');

async function fixCategoryActiveField() {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    
    try {
        await client.connect();
        const db = client.db('accounting');

        console.log('=== Fix Category Active Field ===\n');

        const missingActive = await db.collection('categories').countDocuments({ active: { $exists: false } });
        const nullActive = await db.collection('categories').countDocuments({ active: null });
        
        console.log(`Categories missing 'active' field: ${missingActive}`);
        console.log(`Categories with null 'active' field: ${nullActive}`);

        if (missingActive === 0 && nullActive === 0) {
            console.log('\nAll categories already have active field set. No fix needed.');
            return;
        }

        const result = await db.collection('categories').updateMany(
            { $or: [{ active: { $exists: false } }, { active: null }] },
            { $set: { active: true } }
        );

        console.log(`\nUpdated ${result.modifiedCount} categories with active: true`);

        const verifyMissing = await db.collection('categories').countDocuments({ active: { $exists: false } });
        const verifyNull = await db.collection('categories').countDocuments({ active: null });
        console.log(`\nVerification - Missing active: ${verifyMissing}, Null active: ${verifyNull}`);
        
        console.log('\n=== Fix Complete ===');

    } catch (error) {
        console.error('Fix failed:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

fixCategoryActiveField();
