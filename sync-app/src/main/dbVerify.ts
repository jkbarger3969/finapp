import { MongoClient } from "mongodb";

export interface DbVerifyResult {
  dbName: string;
  collections: string[];
  counts: Record<string, number>;
}

const KEY_COLLECTIONS = [
  "entries",
  "categories",
  "departments",
  "accounts",
  "budgets",
  "fiscalYears",
  "users",
];

/**
 * Connects and reports back what's actually there - the "does this look
 * like the right server" confirmation shown right after connecting, before
 * any sync step runs.
 */
export async function verifyDatabase(uri: string, dbName = "accounting"): Promise<DbVerifyResult> {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collections = (await db.listCollections().toArray()).map((c) => c.name);

    const counts: Record<string, number> = {};
    for (const name of KEY_COLLECTIONS) {
      if (collections.includes(name)) {
        counts[name] = await db.collection(name).countDocuments();
      }
    }

    return { dbName, collections, counts };
  } finally {
    await client.close();
  }
}
