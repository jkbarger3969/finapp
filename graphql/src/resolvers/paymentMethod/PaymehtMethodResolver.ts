import { ObjectID } from "mongodb";
import { PaymentMethodResolvers, PaymentMethod } from "../../graphTypes";
import { nodeFieldResolver } from "../utils/nodeResolver";

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
    const _id = new ObjectID(
      doc.parent?.__typename === "PaymentMethod"
        ? doc.parent.id
        : ((doc.parent as any) as string | ObjectID)
    );
    doc = await collect.findOne<PaymentMethod>({ _id });
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

  const parent = new ObjectID(doc.id ? doc.id : (doc as any)._id) as any;

  return db
    .collection("paymentMethods")
    .find({ parent })
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

  const _id = new ObjectID((parent.parent as any) as string | ObjectID);

  const { db } = context;

  const result = await db
    .collection("paymentMethods")
    .findOne<PaymentMethod>({ _id });

  return result;
};

const PaymentMethod: PaymentMethodResolvers = {
  id: doc => (doc.id ? doc.id : (doc as any)._id.toHexString()),
  parent,
  ancestors,
  children,
  authorization: doc => (doc.authorization ? doc.authorization : [])
};

export default PaymentMethod;
