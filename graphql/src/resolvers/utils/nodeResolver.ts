import { GraphQLResolveInfo } from "graphql";
import { ObjectId } from "mongodb";

import { Context, NodeValue } from "../../types";
import { addId } from "../utils/mongoUtils";

export const nodeDocResolver = async <Tdoc = unknown, Ttypename = string>(
  nodeValue: NodeValue,
  context: Context
): Promise<Tdoc & { __typename: Ttypename }> => {
  const { node, id } = nodeValue;
  const { db, nodeMap } = context;

  const { collection, typename } = nodeMap.id.get(node.toString());

  const docLookUp = await db
    .collection(collection)
    .aggregate([
      { $match: { _id: new ObjectId(id.toString()) } },
      { $limit: 1 },
      addId,
    ])
    .toArray();

  if (docLookUp[0] === undefined) {
    return null;
  }

  docLookUp[0]["__typename"] = typename;

  return docLookUp[0];
};

export const nodeFieldResolver = (
  parentObj,
  args,
  context: Context,
  info: GraphQLResolveInfo
) => {
  const nodeValue = parentObj[info.fieldName];

  if (nodeValue && "node" in nodeValue && "id" in nodeValue) {
    return nodeDocResolver(
      {
        node: new ObjectId(nodeValue.node),
        id: new ObjectId(nodeValue.id),
      },
      context
    );
  }
  return nodeValue;
};
