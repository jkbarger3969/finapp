import { ObjectId } from "mongodb";
import { MutationResolvers, PaymentMethodUpdateFields } from "../../graphTypes";
import DocHistory from "../utils/DocHistory";
import { userNodeType } from "../utils/standIns";
import { $addFields } from "./utils";

// interface PaymentMethodsSchema {
//   active?: boolean;
//   refId?: string;
//   name?: string;
// }

const paymentMethodUpdate: MutationResolvers["paymentMethodUpdate"] = async (
  obj,
  args,
  context,
  info
) => {
  const { db, user } = context;

  const docHistory = new DocHistory(
    { node: userNodeType, id: user.id },
    context.ephemeral?.docHistoryDate
  );

  const updateBuilder = docHistory.updateHistoricalDoc();

  const { id, fields } = args;

  const active = fields.active ?? null;
  const refId = (fields.refId ?? "").trim();
  const name = (fields.name ?? "").trim();

  const _id = new ObjectId(id);

  if (active !== null) {
    updateBuilder.updateField("active", active);
  }

  if (refId) {
    updateBuilder.updateField("refId", refId);
  }

  if (name) {
    updateBuilder.updateField("name", name);
  }

  if (!updateBuilder.hasUpdate) {
    const keys = (() => {
      const obj: {
        [P in keyof Omit<PaymentMethodUpdateFields, "__typename">]-?: null;
      } = {
        active: null,
        refId: null,
        name: null,
      };

      return Object.keys(obj);
    })();

    throw new Error(
      `Payment method update requires at least one of the following fields: ${keys.join(
        ", "
      )}".`
    );
  }

  const collection = db.collection("paymentMethods");

  const doc = await collection.findOne({ _id }, { projection: { _id: true } });

  if (!doc) {
    throw new Error(`Payment method "${id}" does not exist.`);
  }

  const { modifiedCount } = await collection.updateOne(
    { _id },
    updateBuilder.update()
  );

  if (modifiedCount === 0) {
    throw new Error(
      `Failed to update payment method: "${JSON.stringify(args)}".`
    );
  }

  const [result] = await collection
    .aggregate([{ $match: { _id } }, { $addFields }])
    .toArray();

  return result;
};

export default paymentMethodUpdate;
