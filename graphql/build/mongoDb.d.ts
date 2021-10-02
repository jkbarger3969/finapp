import { MongoClient, Db } from "mongodb";
declare const _default: ({ dbHost, dbPort, dbUser, dbPass, db, }: {
    dbHost: string;
    dbPort: string;
    dbUser: string;
    dbPass: string;
    db: string;
}) => Promise<{
    client: MongoClient;
    db: Db;
}>;
export default _default;
