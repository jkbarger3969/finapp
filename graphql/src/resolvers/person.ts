import {ObjectID} from "mongodb";

import {QueryResolvers, MutationResolvers} from "../graphTypes";

export const people:QueryResolvers["people"] = 
  async (parent, args, context, info) =>
{

  const {searchByName} = args;

  const {db} = context;

  let match = {};

  if(searchByName) {

    const first = searchByName.first.trim().toLowerCase();
    const last = searchByName.last.trim().toLowerCase();
    
    const query = [];

    if(first.length > 0) {
      query.push({"name.first":new RegExp(`^${first}`, "i")}); 
    }

    if(last.length > 0) {
      query.push({"name.last":new RegExp(`^${last}`, "i")}); 
    }

    switch(query.length) {
      case 0:
        break;
      case 1:
        match = query[0];
        break;
      default:
        match = {$or:query};
    }

    const results = await db.collection("people").aggregate([
      {$match:match},
      {$addFields:{id:{$toString:"$_id"}}}
    ]).toArray();

    return results;

  }

}

export const addPerson:MutationResolvers["addPerson"] = 
  async(parent, args, context, info) =>
{

  const {db} = context;

  const {fields:{name:{first, last}}} = args;

  if(first.length === 0) {
    throw new Error(`Mutation "addPerson" requires first name.`);
  } else if(last.length === 0) {
    throw new Error(`Mutation "addPerson" requires last name.`);
  }

  const {insertedId, insertedCount} = await db.collection("people").insertOne({
    name:{
      first,
      last
    }
  });

  if(insertedCount === 0) {
    throw new Error(`Mutation "addPerson" arguments "${JSON.stringify(args)}" failed.`);
  }

  const newPerson = await db.collection("people").aggregate([
    {$match:{_id:new ObjectID(insertedId)}},
    {$limit:1},
    {$addFields:{id:{$toString:"$_id"}}}
  ]).toArray();

  return newPerson[0];

}