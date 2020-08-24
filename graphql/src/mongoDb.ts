import * as exitHook from "async-exit-hook";
import { MongoClient, Db } from "mongodb";

const clients = new Map<string, { name: string; client: MongoClient }>();

// Ensure db connections are cleaned up on exit
exitHook(async (cb) => {
  const closing: Promise<void>[] = [];

  for (const { name, client } of clients.values()) {
    if (client.isConnected()) {
      console.log(`Closing db "${name}" on exit.`);

      closing.push(
        client
          .close()
          .then(() => {
            console.log(`Closed db "${name}" on exit.`);
          })
          .catch((err: Error | any) => {
            const errorMsg = err && "message" in err ? err.message : err;
            console.error(`Failed to close db "${name}" on exit. ${errorMsg}`);
          })
      );
    }
  }

  await Promise.all(closing);

  cb();
});

export default async ({
  dbHost,
  dbPort,
  dbUser,
  dbPass,
  db,
}: {
  dbHost: string;
  dbPort: string;
  dbUser: string;
  dbPass: string;
  db: string;
}): Promise<Db> => {
  const uri = `mongodb://${dbHost}:${dbPort}`;
  const clientId = `${uri}${dbUser}${dbPass}`;

  if (!clients.has(clientId)) {
    const client = await MongoClient.connect(uri, { useUnifiedTopology: true });

    clients.set(clientId, { name: db, client });
  }

  return clients.get(clientId).client.db(db);
};
