import { MongoClient, Db, ObjectId, ClientSession } from "mongodb";
import { PubSub } from "apollo-server";

export interface NodeValue {
  node: ObjectId;
  id: ObjectId;
}

export interface NodeInfo {
  id: string;
  typename: string;
  db: string;
  collection: string;
}

export interface Context {
  client: MongoClient;
  db: Db;
  nodeMap: {
    id: Map<string, NodeInfo>;
    typename: Map<string, NodeInfo>;
  };
  user?: {
    id: ObjectId;
  };
  pubSub: PubSub;
  ephemeral?: {
    docHistoryDate?: Date;
    session?: ClientSession;
  };
}
