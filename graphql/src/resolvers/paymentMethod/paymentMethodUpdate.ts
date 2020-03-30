import { ObjectID, UpdateQuery } from "mongodb";
import { MutationResolvers } from "../../graphTypes";
import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import { $addFields } from "./utils";

interface PaymentMethodsSchema {
  active?: boolean;
  refId?: string;
  name?: string;
}

const paymentMethodUpdate: MutationResolvers["paymentMethodUpdate"] = async (
  obj,
  args,
  context,
  info
) => {
  const { db, user } = context;

  const docHistory = new DocHistory({ node: userNodeType, id: user.id });

  const { id, fields } = args;

  const active = fields.active ?? null;
  const refId = (fields.refId ?? "").trim();
  const name = (fields.name ?? "").trim();

  const _id = new ObjectID(id);

  if (active !== null) {
    docHistory.updateValue("active", active);
  }

  if (refId) {
    docHistory.updateValue("refId", refId);
  }

  if (name) {
    docHistory.updateValue("name", name);
  }

  const collection = db.collection("paymentMethods");

  const doc = await collection.findOne({ _id }, { projection: { _id: true } });

  if (!doc) {
    throw new Error(
      `Mutation "paymentMethodUpdate" payment method "${id}" does not exist.`
    );
  }

  const { modifiedCount } = await collection.updateOne(
    { _id },
    { $push: docHistory.updatePushArg }
  );

  if (modifiedCount === 0) {
    throw new Error(
      `Mutation "paymentMethodUpdate" arguments "${JSON.stringify(
        args
      )}" failed.`
    );
  }

  const [result] = await collection
    .aggregate([{ $match: { _id } }, { $addFields }])
    .toArray();

  return result;
};

export default paymentMethodUpdate;
