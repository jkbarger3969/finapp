import { ObjectId } from "mongodb";
import { MutationResolvers } from "../../graphTypes";

export const updateCategory: MutationResolvers["updateCategory"] = async (
  _,
  { id, input },
  { dataSources: { accountingDb } }
) => {
  const categoryId = new ObjectId(id);

  const updateFields: Record<string, any> = {};

  if (input.hidden !== undefined && input.hidden !== null) {
    updateFields.hidden = input.hidden;
  }

  if (input.name !== undefined && input.name !== null) {
    updateFields.name = input.name;
  }

  if (Object.keys(updateFields).length > 0) {
    await accountingDb.updateOne({
      collection: "categories",
      filter: { _id: categoryId },
      update: { $set: updateFields },
    });
  }

  const category = await accountingDb.findOne({
    collection: "categories",
    filter: { _id: categoryId },
  });

  return { category };
};
