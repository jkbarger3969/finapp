import { Db, MongoClient } from "mongodb";

export interface DbHandle {
  client: MongoClient;
  db: Db;
}

export async function connectDb(uri: string, dbName: string): Promise<DbHandle> {
  const client = new MongoClient(uri);
  await client.connect();
  return { client, db: client.db(dbName) };
}

export async function closeDb(handle: DbHandle): Promise<void> {
  await handle.client.close();
}
