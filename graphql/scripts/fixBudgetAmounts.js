const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'accounting';

async function fixBudgetAmounts() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB\n');

        const db = client.db(DB_NAME);
        const budgets = await db.collection('budgets').find({}).toArray();

        console.log(`Found ${budgets.length} budget documents\n`);

        let fixedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const budget of budgets) {
            const amount = budget.amount;

            if (!amount) {
                console.log(`[SKIP] Budget ${budget._id}: No amount field`);
                skippedCount++;
                continue;
            }

            if (typeof amount === 'object' && 's' in amount && 'n' in amount && 'd' in amount) {
                console.log(`[OK] Budget ${budget._id}: Already in correct format {s:${amount.s}, n:${amount.n}, d:${amount.d}}`);
                skippedCount++;
                continue;
            }

            if (typeof amount === 'string') {
                const parts = amount.split(' ');
                if (parts.length === 3) {
                    const s = parseInt(parts[0], 10);
                    const n = parseInt(parts[1], 10);
                    const d = parseInt(parts[2], 10);

                    if (!isNaN(s) && !isNaN(n) && !isNaN(d)) {
                        const newAmount = { s, n, d };
                        console.log(`[FIX] Budget ${budget._id}: Converting "${amount}" -> ${JSON.stringify(newAmount)}`);

                        await db.collection('budgets').updateOne(
                            { _id: budget._id },
                            { $set: { amount: newAmount } }
                        );
                        fixedCount++;
                        continue;
                    }
                }

                try {
                    const parsed = JSON.parse(amount);
                    if (typeof parsed === 'object' && 's' in parsed && 'n' in parsed && 'd' in parsed) {
                        console.log(`[FIX] Budget ${budget._id}: Converting JSON string to object`);
                        await db.collection('budgets').updateOne(
                            { _id: budget._id },
                            { $set: { amount: parsed } }
                        );
                        fixedCount++;
                        continue;
                    }
                } catch (e) {
                }
            }

            console.log(`[ERROR] Budget ${budget._id}: Unknown format - ${JSON.stringify(amount)}`);
            errorCount++;
        }

        console.log('\n========================================');
        console.log('SUMMARY');
        console.log('========================================');
        console.log(`Total budgets: ${budgets.length}`);
        console.log(`Fixed: ${fixedCount}`);
        console.log(`Skipped (already OK): ${skippedCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

fixBudgetAmounts();
