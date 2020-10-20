import { ObjectId } from "mongodb";

import { MutationResolvers } from "../graphTypes";

/* export const people: QueryResolvers["people"] = async (
  parent,
  args,
  context,
  info
) => {
  const { searchByName } = args;

  const { db } = context;

  let match = {};

  if (searchByName) {
    const first = searchByName.first.trim().toLowerCase();
    const last = searchByName.last.trim().toLowerCase();

    const query = [];

    if (first.length > 0) {
      query.push({ "name.first": new RegExp(`^${first}`, "i") });
    }

    if (last.length > 0) {
      query.push({ "name.last": new RegExp(`^${last}`, "i") });
    }

    switch (query.length) {
      case 0:
        break;
      case 1:
        match = query[0];
        break;
      default:
        match = { $or: query };
    }

    const results = await db
      .collection("people")
      .aggregate([
        { $match: match },
        { $addFields: { id: { $toString: "$_id" } } },
      ])
      .toArray();

    return results;
  }
}; */

export const addPerson: MutationResolvers["addPerson"] = async (
  parent,
  args,
  context,
  info
) => {
  const { db } = context;

  const session = context.ephemeral?.session;

  const {
    fields: {
      name: { first, last },
    },
  } = args;

  // Ensure graphql required fields not defeated by blank string.
  if (first.length === 0) {
    throw new Error(`Mutation "addPerson" requires first name.`);
  } else if (last.length === 0) {
    throw new Error(`Mutation "addPerson" requires last name.`);
  }

  const { insertedId, insertedCount } = await db.collection("people").insertOne(
    {
      name: {
        first,
        last,
      },
    },
    { session }
  );

  if (insertedCount === 0) {
    throw new Error(`Failed to add person: ${JSON.stringify(args, null, 2)}`);
  }

  const [newPerson] = await db
    .collection("people")
    .aggregate(
      [
        { $match: { _id: new ObjectId(insertedId) } },
        { $limit: 1 },
        { $addFields: { id: { $toString: "$_id" } } },
      ],
      { session }
    )
    .toArray();

  return newPerson;
};
