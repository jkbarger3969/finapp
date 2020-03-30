import { ObjectID } from "mongodb";
import { MutationResolvers } from "../../graphTypes";
import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import { $addFields } from "./utils";

const paymentMethodAdd: MutationResolvers["paymentMethodAdd"] = async (
  doc,
  args,
  context,
  info
) => {
  const {
    fields: { active, refId, name, parent: parentId }
  } = args;

  const { db, user } = context;

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  const parent = new ObjectID(parentId);

  const collection = db.collection("paymentMethods");

  const parentDoc = await collection.findOne(
    { _id: parent },
    { projection: { _id: true, allowChildren: true } }
  );

  if (!parentDoc) {
    throw new Error(`Payment method parent "${parentId}" does not exist.`);
  } else if (!parentDoc.allowChildren) {
    throw new Error(
      `Payment method parent "${parentId}" does not allow children.`
    );
  }

  const { insertedId } = await collection.insertOne({
    parent,
    active: docHistory.addValue(active),
    refId: refId ? docHistory.addValue(refId) : [],
    name: docHistory.addValue(name),
    allowChildren: false //Not exposed to GQL api at this time
  });

  const [result] = await collection
    .aggregate([{ $match: { _id: insertedId } }, { $addFields }])
    .toArray();

  return result;
};

export default paymentMethodAdd;
