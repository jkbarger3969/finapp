import { ObjectID } from "mongodb";

import {QueryResolvers, JournalEntryTypeResolvers} from "../graphTypes";
import {nodeFieldResolver} from "./utils/nodeResolver";

export const journalEntryTypes:QueryResolvers["journalEntryTypes"] = 
  async (parent, args, context, info) =>
{

  const {db} = context;
  const {from} = args;

  const $match = from ? {"parent.id":new ObjectID(from)} : {parent:null};

  const transTypeResults = await db
    .collection("journalEntryTypes").aggregate([
      {$match},
      {$graphLookup: {
          from: "journalEntryTypes",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parent.id",
          as: "subTransactionTypes"
      }},
      {$unwind: {path:"$subTransactionTypes", preserveNullAndEmptyArrays:true}},
      {$addFields: {"subTransactionTypes.id":{
        $toString: "$subTransactionTypes._id"}
      }},
      {$group: {
          _id:"$_id",
          type:{$first: "$type"},
          parent:{$first: "$parent"},
          subTransactionTypes:{$addToSet: "$subTransactionTypes"}
      }},
      {$project: {
          type:true,
          parent:true,
          subTransactionTypes:{$filter: {
            input: "$subTransactionTypes",
            as: "subTransactionType",
            cond: { $ne: [ "$$subTransactionType.id", null] }
          }}
      }},
      {$addFields: {id:{$toString: "$_id"}}},
    ]).toArray();
  
  const transTypes = [];

  for(const transTypeResult of transTypeResults) {

    const {subTransactionTypes} = transTypeResult;
    delete transTypeResult.subTransactionTypes;

    transTypes.push(transTypeResult, ...subTransactionTypes);

  }

  return transTypes;

}

const ancestors:JournalEntryTypeResolvers['ancestors'] =  
  async (parent, args, context, info) => 
{
  
  const {db} = context;
  const {id} = parent;

  const results =  await db.collection('journalEntryTypes').aggregate([
    {$match:{_id:new ObjectID(id)}},
    {$graphLookup: {
      from: "journalEntryTypes",
      startWith: "$parent.id",
      connectFromField: "parent.id",
      connectToField: "_id",
      as: "ancestors"
    }},
    {$unwind: {
      path: "$ancestors",
      preserveNullAndEmptyArrays: false
    }},
    {$replaceRoot: { newRoot: "$ancestors" }},
    {$addFields:{id:{$toString:"$_id"}}}
  ]).toArray();

  return results;

}

export const JournalEntryType:JournalEntryTypeResolvers = {
  parent:nodeFieldResolver,
  ancestors
};