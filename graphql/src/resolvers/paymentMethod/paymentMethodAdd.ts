import { ObjectId } from "mongodb";
import { MutationResolvers } from "../../graphTypes";
import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import { $addFields } from "./utils";

const paymentMethodAdd: MutationResolvers["paymentMethodAdd"] = async (
  obj,
  args,
  context,
  info
) => {
  const {
    fields: { active, refId, name, parent: parentId },
  } = args;

  const { db, user } = context;

  const docHistory = new DocHistory(
    { node: userNodeType, id: user.id },
    context.ephemeral?.docHistoryDate
  );

  const parent = new ObjectId(parentId);

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

  const docBuilder = docHistory.newHistoricalDoc(true).addFields([
    ["active", active],
    ["name", name],
  ]);

  if (refId) {
    docBuilder.addField("refId", refId);
  }

  const { insertedId } = await collection.insertOne({
    parent,
    allowChildren: false, //Not exposed to GQL api at this time
    ...docBuilder.doc(),
  });

  const [result] = await collection
    .aggregate([{ $match: { _id: insertedId } }, { $addFields }])
    .toArray();

  return result;
};

export default paymentMethodAdd;
