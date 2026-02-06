import { MongoClient, Db, ObjectId, ClientSession } from "mongodb";

import { AccountingDb } from "./dataSources/accountingDb/accountingDb";
import { AuthService } from "./services/authService";

export interface NodeValue<Type extends string = string> {
  type: Type;
  id: ObjectId;
}

export interface NodeInfo {
  id: string;
  typename: string;
  db: string;
  collection: string;
}

export type DataSources = {
  accountingDb: AccountingDb;
};

interface ContextBase {
  client: MongoClient;
  db: Db;
  user?: {
    id: ObjectId;
  };
  reqDateTime: Date;
  authService?: AuthService;
  ipAddress?: string;
  userAgent?: string;
  ephemeral?: {
    docHistoryDate?: Date;
    session?: ClientSession;
  };
  loaders: import("./loaders").Loaders;
}

export type Context<TDataSources = DataSources> = TDataSources extends
  | undefined
  | null
  ? ContextBase
  : { dataSources: TDataSources } & ContextBase;
