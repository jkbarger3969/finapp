import {QueryResolvers, BusinessResolvers} from "../graphTypes";
import {departments as departmentsResolver} from "./departments";
import {nodeFieldResolver} from "./utils/nodeResolver";

const addId = {$addFields: {id:{$toString: "$_id"}}};

export const businesses:QueryResolvers["businesses"] = 
  async (parent, args, context, info) => 
{

  const {db} = context;
  const searchByName = args.searchByName ? args.searchByName.trim() : "";

  if(searchByName.length > 0) {

    const nameResults = await db.collection("businesses")
      .aggregate([
        {$match:{name:new RegExp(`(^|\\s)${searchByName}`,"i")}},
        addId
      ]).toArray();

    return nameResults;

  }

  const allBusinesses = await db.collection("businesses")
    .aggregate([addId]).toArray();

  return allBusinesses;

}

export const departments:BusinessResolvers["departments"] = 
  async (parent, args, context, info) => 
{

  const {id} = parent;

  return departmentsResolver({}, {fromParent:id}, context, info);

}

export const Business:BusinessResolvers = {
  budget:nodeFieldResolver,
  departments
};