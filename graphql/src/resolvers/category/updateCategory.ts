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

  if (input.displayName !== undefined && input.displayName !== null) {
    updateFields.displayName = input.displayName;
  }

  if (input.groupName !== undefined) {
    updateFields.groupName = input.groupName;
  }

  if (input.sortOrder !== undefined && input.sortOrder !== null) {
    updateFields.sortOrder = input.sortOrder;
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
