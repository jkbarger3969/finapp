const { MongoClient, ObjectId } = require('mongodb');

async function migrateITBreezeDepartments() {
    const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    
    try {
        await client.connect();
        const db = client.db('accounting');

        console.log('=== IT/Breeze Department Migration Script ===\n');

        const oldIT = new ObjectId('5dc36bbbc7167f67e39cd6a0');
        const oldBreeze = new ObjectId('5dc36bbbc7167f67e39cd6a2');
        
        const newIT = new ObjectId('66d3d07025c8744069e98556');
        const newBreeze = new ObjectId('66d3d07025c8744069e98558');

        const oldITDept = await db.collection('departments').findOne({ _id: oldIT });
        const oldBreezeDept = await db.collection('departments').findOne({ _id: oldBreeze });
        
        if (!oldITDept && !oldBreezeDept) {
            console.log('Migration already complete - duplicate departments not found.');
            console.log('Verifying IT and Breeze departments exist under General and Administrative...');
            
            const newITDept = await db.collection('departments').findOne({ _id: newIT });
            const newBreezeDept = await db.collection('departments').findOne({ _id: newBreeze });
            
            console.log(`  IT under G&A: ${newITDept ? 'EXISTS' : 'NOT FOUND'}`);
            console.log(`  Breeze under G&A: ${newBreezeDept ? 'EXISTS' : 'NOT FOUND'}`);
            return;
        }

        console.log('Found duplicate departments to migrate:');
        if (oldITDept) console.log(`  - IT under TECH (${oldIT})`);
        if (oldBreezeDept) console.log(`  - Breeze under TECH (${oldBreeze})`);
        console.log('');

        if (oldITDept) {
            const itEntryCount = await db.collection('entries').countDocuments({ "department.0.value": oldIT });
            const itBudgetCount = await db.collection('budgets').countDocuments({ "owner.id": oldIT });
            console.log(`IT transactions to migrate: ${itEntryCount}`);
            console.log(`IT budgets to migrate: ${itBudgetCount}`);
            
            const itResult = await db.collection('entries').updateMany(
                { "department.0.value": oldIT },
                { $set: { "department.0.value": newIT } }
            );
            console.log(`  Moved ${itResult.modifiedCount} IT transactions`);

            const itBudgetResult = await db.collection('budgets').updateMany(
                { "owner.id": oldIT },
                { $set: { "owner.id": newIT } }
            );
            console.log(`  Moved ${itBudgetResult.modifiedCount} IT budgets`);
        }

        if (oldBreezeDept) {
            const breezeEntryCount = await db.collection('entries').countDocuments({ "department.0.value": oldBreeze });
            const breezeBudgetCount = await db.collection('budgets').countDocuments({ "owner.id": oldBreeze });
            console.log(`\nBreeze transactions to migrate: ${breezeEntryCount}`);
            console.log(`Breeze budgets to migrate: ${breezeBudgetCount}`);
            
            const breezeResult = await db.collection('entries').updateMany(
                { "department.0.value": oldBreeze },
                { $set: { "department.0.value": newBreeze } }
            );
            console.log(`  Moved ${breezeResult.modifiedCount} Breeze transactions`);

            const breezeBudgetResult = await db.collection('budgets').updateMany(
                { "owner.id": oldBreeze },
                { $set: { "owner.id": newBreeze } }
            );
            console.log(`  Moved ${breezeBudgetResult.modifiedCount} Breeze budgets`);
        }

        console.log('\n--- Deleting duplicate departments under TECH ---');
        const deleteResult = await db.collection('departments').deleteMany({
            _id: { $in: [oldIT, oldBreeze] }
        });
        console.log(`Deleted ${deleteResult.deletedCount} duplicate department(s)`);

        console.log('\n--- Verification ---');
        const remainingIT = await db.collection('departments').find({ name: 'IT' }).toArray();
        const remainingBreeze = await db.collection('departments').find({ name: 'Breeze' }).toArray();
        console.log(`IT departments remaining: ${remainingIT.length}`);
        console.log(`Breeze departments remaining: ${remainingBreeze.length}`);

        for (const dept of remainingIT) {
            const parent = dept.parent?.type === 'Department' && dept.parent?.id
                ? await db.collection('departments').findOne({ _id: dept.parent.id })
                : null;
            console.log(`  IT (${dept._id}) -> Parent: ${parent?.name || 'TOP LEVEL'}`);
        }
        for (const dept of remainingBreeze) {
            const parent = dept.parent?.type === 'Department' && dept.parent?.id
                ? await db.collection('departments').findOne({ _id: dept.parent.id })
                : null;
            console.log(`  Breeze (${dept._id}) -> Parent: ${parent?.name || 'TOP LEVEL'}`);
        }

        console.log('\n=== Migration Complete ===');

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

migrateITBreezeDepartments();
