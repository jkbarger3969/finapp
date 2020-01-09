import {ObjectID} from "mongodb";

import {Department as IDepartment, QueryResolvers, DepartmentResolvers
} from "../graphTypes";
import {NodeValue} from "../types";
import {nodeFieldResolver, nodeDocResolver} from "./utils/nodeResolver";

const addId = {$addFields: {id:{$toString: "$_id"}}};

export const departments:QueryResolvers["departments"] = 
  async (parent, args, context, info) => 
{

  const {db} = context;
  const fromParent = args.fromParent;
  const searchByName = args.searchByName ? args.searchByName.trim() : "";

  const searchByNameRegex = searchByName.length > 0 ? 
    new RegExp(`(^|\\s)${searchByName}`,"i") : null;

  const deptsPromises:Promise<IDepartment[]>[] = [];
  
  if(fromParent) {

    const fromMatch = {$match:{"parent.id":new ObjectID(fromParent)}};
    
    const parentPromise = db.collection("departments").aggregate([
      searchByNameRegex ? {$match:{...fromMatch.$match, name:searchByNameRegex}} 
        : fromMatch,
      addId
    ]).toArray();

    deptsPromises.push(parentPromise);

    const descendentPipeline:any[] = [fromMatch];
    
    if(searchByNameRegex) {
    
      descendentPipeline.push({$graphLookup: {
        from: "departments",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parent.id",
        as: "subDepartments",
        restrictSearchWithMatch:{name:searchByNameRegex}
      }});
    
    } else {
    
      descendentPipeline.push({$graphLookup: {
        from: "departments",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parent.id",
        as: "subDepartments"
      }});
    
    }
    
    descendentPipeline.push(
      {$unwind: {
        path: "$subDepartments",
        preserveNullAndEmptyArrays: false
      }},
      {$replaceRoot: { newRoot: "$subDepartments" }},
      addId
    );

    const decedentPromises = db.collection("departments")
      .aggregate(descendentPipeline).toArray();
    
    deptsPromises.push(decedentPromises);

    const graphResults = await Promise.all(deptsPromises);
    
    const allResults = [].concat.apply([], graphResults);

    return allResults.length === 0 ? null : allResults;

  } else if(searchByNameRegex) {

    const nameOnlyResults = await db.collection("departments")
      .aggregate([
        {$match:{name:searchByNameRegex}},
        addId
      ]).toArray();

    return nameOnlyResults.length === 0 ? null : nameOnlyResults;

  }

  const allDepts = await db.collection("departments")
    .aggregate([addId]).toArray();

  return allDepts;

}

export const department:QueryResolvers["department"] = 
  async (parent, args, context, info) =>
{
  
  const {db} = context;
  const {id} = args;
  const _id = new ObjectID(id);
  const result = db.collection("departments").aggregate([
    {$match:{_id}},
    {$limit:1},
    {$addFields:{id:{$toString:"$_id"}}}
  ]);

  if(await result.hasNext()) {
  
    return await result.next();
  
  }

  return null;

}

const ancestors:DepartmentResolvers['ancestors'] = 
  async (parent, args, context, info) => 
{
  
  const {db, nodeMap} = context;
  const node = ((parent.parent) as any as NodeValue).node;
  const docId = ((parent.parent) as any as NodeValue).id;
  const {id} = parent; 

  const parentNodeType = nodeMap.id.get(node.toString());

  if(parentNodeType.typename === "Department") {

    const results =  await db.collection('departments').aggregate([
      {$match:{_id:new ObjectID(id)}},
      {$graphLookup: {
        from: "departments",
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
      {$addFields:{__typename:"Department"}},
      {$addFields:{id:{$toString:"$_id"}}}
    ]).toArray();

    const businessParent = 
      await nodeDocResolver(results[results.length -1].parent, context);
    
    results.push(businessParent);

    return results;

  }

  const businessParent = 
      await nodeDocResolver({node, id:docId}, context);

  return [businessParent];

}

export const Department:DepartmentResolvers = {
  budget:nodeFieldResolver,
  parent:nodeFieldResolver,
  ancestors
};