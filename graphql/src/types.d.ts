import { Db, ObjectId } from "mongodb";
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
  };
}
