import { ObjectId } from "mongodb";
import { MutationResolvers } from "../../graphTypes";

export const updateBusiness: MutationResolvers["updateBusiness"] = async (
  _,
  { id, input },
  { dataSources: { accountingDb } }
) => {
  const businessId = new ObjectId(id);

  const updateFields: Record<string, any> = {};

  if (input.hidden !== undefined && input.hidden !== null) {
    updateFields.hidden = input.hidden;
  }

  if (input.name !== undefined && input.name !== null) {
    updateFields.name = input.name;
  }

  if (Object.keys(updateFields).length > 0) {
    await accountingDb.updateOne({
      collection: "businesses",
      filter: { _id: businessId },
      update: { $set: updateFields },
    });
  }

  const business = await accountingDb.findOne({
    collection: "businesses",
    filter: { _id: businessId },
  });

  return { business };
};
