import { ObjectId } from "mongodb";
import { MutationResolvers } from "../../graphTypes";

export const updatePerson: MutationResolvers["updatePerson"] = async (
  _,
  { id, input },
  { dataSources: { accountingDb } }
) => {
  const personId = new ObjectId(id);

  const updateFields: Record<string, any> = {};

  if (input.hidden !== undefined && input.hidden !== null) {
    updateFields.hidden = input.hidden;
  }

  if (input.name !== undefined && input.name !== null) {
    updateFields.name = input.name;
  }

  if (input.email !== undefined) {
    updateFields.email = input.email;
  }

  if (input.phone !== undefined) {
    updateFields.phone = input.phone;
  }

  if (Object.keys(updateFields).length > 0) {
    await accountingDb.updateOne({
      collection: "people",
      filter: { _id: personId },
      update: { $set: updateFields },
    });
  }

  const person = await accountingDb.findOne({
    collection: "people",
    filter: { _id: personId },
  });

  return { person };
};
