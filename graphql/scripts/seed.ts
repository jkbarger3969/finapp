
import { MongoClient, ObjectId } from "mongodb";

// Rational interface matching your project
interface Rational {
    s: 1 | -1;
    n: number;
    d: number;
}

const url = "mongodb://localhost:27017";
const dbName = "accounting";
const client = new MongoClient(url);

const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomRational = (): Rational => {
    const amount = getRandomInt(100, 50000); // $1.00 to $500.00
    return {
        s: 1,
        n: amount,
        d: 100, // Denominator 100 for cents
    };
};

// Date utilities
const addYears = (date: Date, years: number) => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
};

async function seed() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db(dbName);

        // 1. Fetch Reference Data
        const departments = await db.collection("departments").find({}).toArray();
        const categories = await db.collection("categories").find({}).toArray();
        const businesses = await db.collection("businesses").find({}).toArray();
        const people = await db.collection("people").find({}).toArray();

        // Only use leaf departments (departments with no children ideally, but random is fine)

        const sources = [
            ...businesses.map(b => ({ type: "Business", id: b._id })),
            ...people.map(p => ({ type: "Person", id: p._id }))
        ];

        if (departments.length === 0) {
            throw new Error("Missing Departments. Cannot seed entries.");
        }

        // Seed Categories if missing
        if (categories.length === 0) {
            console.log("No Categories found. Seeding default categories...");
            const defaultCats = [
                { name: "Office Supplies", code: "100", type: "Expense" },
                { name: "Travel", code: "200", type: "Expense" },
                { name: "Payroll", code: "300", type: "Expense" },
                { name: "Sales", code: "400", type: "Income" },
                { name: "Consulting", code: "450", type: "Income" },
                { name: "Software", code: "150", type: "Expense" }
            ].map(c => ({
                name: c.name,
                code: c.code,
                type: c.type,
                externalId: c.code,
                inactive: false,
                donation: false,
                // parent: null
            }));

            const res = await db.collection("categories").insertMany(defaultCats);
            console.log(`Inserted ${res.insertedCount} Categories`);

            // Refresh categories
            (await db.collection("categories").find({}).toArray()).forEach(c => categories.push(c));
        }

        console.log(`Found ${departments.length} Depts, ${categories.length} Cats, ${sources.length} Sources`);

        // 2. Ensure Fiscal Years (2018 - 2026)
        const fiscalYears = [];
        const existingFY = await db.collection("fiscalYears").find({}).toArray();

        for (let year = 2018; year <= 2026; year++) {
            const begin = new Date(`${year}-09-01T00:00:00Z`);
            const end = new Date(`${year + 1}-09-01T00:00:00Z`);
            const name = `FY${year}-${year + 1}`;

            const exists = existingFY.find(fy => fy.begin.toISOString() === begin.toISOString());

            if (!exists) {
                const newFY = {
                    name,
                    begin,
                    end
                };
                const res = await db.collection("fiscalYears").insertOne(newFY);
                console.log(`Created Fiscal Year: ${name}`, res.insertedId);
                fiscalYears.push({ ...newFY, _id: res.insertedId });
            } else {
                fiscalYears.push(exists);
            }
        }

        // 3. Generate Entries for ALL Fiscal Years
        const entries = [];

        for (const fy of fiscalYears) {
            console.log(`Generating entries for ${fy.name}...`);

            // Generate 20-50 random entries per year (reduced count)
            const count = getRandomInt(20, 50);

            for (let i = 0; i < count; i++) {
                const date = new Date(fy.begin.getTime() + Math.random() * (fy.end.getTime() - fy.begin.getTime()));

                const dept = departments[getRandomInt(0, departments.length - 1)];
                const cat = categories[getRandomInt(0, categories.length - 1)];
                const source = sources.length > 0 ? sources[getRandomInt(0, sources.length - 1)] : { type: "Business", id: new ObjectId() };

                const total = getRandomRational();

                const entry = {
                    date: [{ value: date }],

                    department: [{ value: dept._id }],
                    category: [{ value: cat._id }],
                    source: [{ value: { type: source.type, id: source.id } }],

                    description: [{ value: `Auto-generated entry ${i}` }],

                    total: [{ value: total }],

                    deleted: [{ value: false }],
                    reconciled: [{ value: Math.random() > 0.5 }],

                    paymentMethod: [{
                        value: {
                            type: "Cash",
                            currency: "USD"
                        }
                    }]
                };

                entries.push(entry);
            }
        }

        // Batch Insert
        if (entries.length > 0) {
            await db.collection("entries").insertMany(entries);
            console.log(`Inserted ${entries.length} new entries.`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

seed();
