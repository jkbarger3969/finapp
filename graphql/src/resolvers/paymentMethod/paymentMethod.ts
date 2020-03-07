import { QueryResolvers } from "../../graphTypes";
import { ObjectID } from "mongodb";

const paymentMethod: QueryResolvers["paymentMethod"] = async (
  doc,
  args,
  context,
  info
) => {
  const { id } = args;

  const { db } = context;

  const result = await db
    .collection("paymentMethods")
    .findOne({ _id: new ObjectID(id) });

  return result || null;
};

export default paymentMethod;
