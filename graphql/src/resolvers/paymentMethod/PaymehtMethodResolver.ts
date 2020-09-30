import { ObjectId } from "mongodb";
import { PaymentMethodResolvers, PaymentMethod } from "../../graphTypes";
import { $addFields } from "./utils";

const ancestors: PaymentMethodResolvers["ancestors"] = async (
  doc,
  args,
  context,
  info
) => {
  const ancestors: PaymentMethod[] = [];

  const { db } = context;
  const collect = db.collection("paymentMethods");

  while (doc.parent) {
    const _id = new ObjectId(
      doc.parent?.__typename === "PaymentMethod"
        ? doc.parent.id
        : ((doc.parent as any) as string | ObjectId)
    );
    [doc] = await collect
      .aggregate<PaymentMethod>([{ $match: { _id } }, { $addFields }])
      .toArray();
    ancestors.push(doc);
  }

  return ancestors;
};

const children: PaymentMethodResolvers["children"] = (
  doc,
  args,
  context,
  info
) => {
  const { db } = context;

  const parent = new ObjectId(doc.id ? doc.id : (doc as any)._id) as any;

  return db
    .collection("paymentMethods")
    .aggregate([{ $match: { parent } }, { $addFields }])
    .toArray();
};

const parent: PaymentMethodResolvers["parent"] = async (
  parent,
  args,
  context,
  info
) => {
  if (!parent.parent) {
    return null;
  } else if (parent.parent?.__typename === "PaymentMethod") {
    return parent.parent;
  }

  const _id = new ObjectId((parent.parent as any) as string | ObjectId);

  const { db } = context;

  const [result] = await db
    .collection("paymentMethods")
    .aggregate([{ $match: { _id } }, { $addFields }])
    .toArray();

  return result;
};

const PaymentMethod: PaymentMethodResolvers = {
  // id: doc => (doc.id ? doc.id : ((doc as any)._id as ObjectId).toHexString()),
  parent,
  ancestors,
  children,
  authorization: (doc) => (doc.authorization ? doc.authorization : []),
};

export default PaymentMethod;
