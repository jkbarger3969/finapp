import { ObjectId } from "mongodb";

import {
  QueryResolvers,
  MutationResolvers,
  BusinessResolvers,
} from "../graphTypes";
import { nodeFieldResolver } from "./utils/nodeResolver";

const addId = { $addFields: { id: { $toString: "$_id" } } };

/* export const businesses: QueryResolvers["businesses"] = async (
  parent,
  args,
  context,
  info
) => {
  const { db } = context;
  const searchByName = args.searchByName ? args.searchByName.trim() : "";

  if (searchByName.length > 0) {
    const nameResults = await db
      .collection("businesses")
      .aggregate([
        { $match: { name: new RegExp(`(^|\\s)${searchByName}`, "i") } },
        addId,
      ])
      .toArray();

    return nameResults;
  }

  const allBusinesses = await db
    .collection("businesses")
    .aggregate([addId])
    .toArray();

  return allBusinesses;
};

export const business: QueryResolvers["business"] = async (
  parent,
  args,
  context,
  info
) => {
  const { id } = args;

  const { db } = context;

  const result = await db
    .collection("businesses")
    .aggregate([{ $match: { _id: new ObjectId(id) } }, { $limit: 1 }, addId])
    .toArray();

  return result[0];
};

export const departments: BusinessResolvers["departments"] = async (
  parent,
  args,
  context,
  info
) => {
  const { id } = parent;

  return departmentsResolver({}, { fromParent: id }, context, info);
}; */

export const addBusiness: MutationResolvers["addBusiness"] = async (
  parent,
  args,
  context,
  info
) => {
  const { db } = context;

  const {
    fields: { name },
  } = args;

  if (!name.trim()) {
    throw new Error(`Mutation "addBusiness" name.`);
  }

  const { insertedCount, insertedId } = await db
    .collection("businesses")
    .insertOne({ name, verified: false });

  if (insertedCount === 0) {
    throw new Error(
      `Mutation "addBusiness" arguments "${JSON.stringify(args)}" failed.`
    );
  }

  const newBusiness = await db
    .collection("businesses")
    .aggregate([
      { $match: { _id: new ObjectId(insertedId) } },
      { $limit: 1 },
      { $addFields: { id: { $toString: "$_id" } } },
    ])
    .toArray();

  return newBusiness[0];
};

/* export const Business: BusinessResolvers = {
  budget: nodeFieldResolver,
  departments,
}; */
