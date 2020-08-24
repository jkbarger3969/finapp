import { ObjectId } from "mongodb";

import {
  QueryResolvers,
  JournalEntryCategoryResolvers,
  JournalEntryType,
} from "../graphTypes";
import { nodeFieldResolver } from "./utils/nodeResolver";

const addId = { $addFields: { id: { $toString: "$_id" } } };

export const journalEntryCategories: QueryResolvers["journalEntryCategories"] = async (
  parent,
  args,
  context,
  info
) => {
  const { db } = context;

  const results = await db
    .collection("journalEntryCategories")
    .aggregate([addId])
    .toArray();

  return results;
};

export const journalEntryCategory: QueryResolvers["journalEntryCategory"] = async (
  parent,
  args,
  context,
  info
) => {
  const { db } = context;

  const { id } = args;

  const result = await db
    .collection("journalEntryCategories")
    .aggregate([{ $match: { _id: new ObjectId(id) } }, addId])
    .toArray();

  return result[0];
};

export const ancestors: JournalEntryCategoryResolvers["ancestors"] = async (
  parent,
  args,
  context,
  info
) => {
  const { db, nodeMap } = context;
  const id = parent?.id;

  if (!id) {
    return [];
  }

  // Currently only ONE type
  // const parentNodeType = nodeMap.id.get(node.toString());

  const results = await db
    .collection("journalEntryCategories")
    .aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $graphLookup: {
          from: "journalEntryCategories",
          startWith: "$parent.id",
          connectFromField: "parent.id",
          connectToField: "_id",
          as: "ancestors",
        },
      },
      {
        $unwind: {
          path: "$ancestors",
          preserveNullAndEmptyArrays: false,
        },
      },
      { $replaceRoot: { newRoot: "$ancestors" } },
      { $addFields: { __typename: "JournalEntryCategory" } },
      { $addFields: { id: { $toString: "$_id" } } },
    ])
    .toArray();

  return results;
};

const children: JournalEntryCategoryResolvers["children"] = async (
  parent,
  args,
  context,
  info
) => {
  const { db, nodeMap } = context;
  const id = parent?.id;

  if (!id) {
    return [];
  }

  const results = await db
    .collection("journalEntryCategories")
    .aggregate([
      { $match: { "parent.id": new ObjectId(id) } },
      { $addFields: { id: { $toString: "$_id" } } },
    ])
    .toArray();

  return results;
};

export const type: JournalEntryCategoryResolvers["type"] = (
  parent,
  args,
  context,
  info
) => {
  return (parent as any).type === "credit"
    ? JournalEntryType.Credit
    : JournalEntryType.Debit;
};

export const JournalEntryCategory: JournalEntryCategoryResolvers = {
  parent: nodeFieldResolver,
  type,
  ancestors,
  children,
};
