import { GraphQLResolveInfo } from 'graphql';
import {ObjectID} from "mongodb";

import {Context, NodeValue} from "../../types";

export const nodeDocResolver = 
  async (nodeValue:NodeValue, context:Context) =>
{

  const {node, id} = nodeValue;
  const {db, nodeMap} = context;

  const {collection, typename} = nodeMap.id.get(node.toString());

  const docLookUp = await db.collection(collection).aggregate([
    {$match:{_id:new ObjectID(id.toString())}},
    {$limit:1},
    {$addFields: {
      id:{$toString: "$_id"}
    }}
  ]).toArray();

  docLookUp[0]["__typename"] = typename;

  return docLookUp[0];

}

export const nodeFieldResolver = 
  (parentObj, args, context:Context, info:GraphQLResolveInfo) => 
{
     
  const nodeValue = parentObj[info.fieldName];

  if(nodeValue && "node" in nodeValue && "id" in nodeValue) {

    return nodeDocResolver({
      node:new ObjectID(nodeValue.node),
      id:new ObjectID(nodeValue.id)
    }, context);

  }
  return nodeValue;

}