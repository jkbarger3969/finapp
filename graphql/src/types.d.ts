import {Db, ObjectID} from "mongodb";

export interface NodeValue {
  node:ObjectID;
  id:ObjectID;
}

export interface NodeInfo {
  id:string,
  typename:string,
  db:string,
  collection:string
}

export interface Context {
  db:Db;
  nodeMap:{
    id:Map<string, NodeInfo>,
    typename:Map<string, NodeInfo>
  };
  user?:{
    id:ObjectID;
  };
}