import {ObjectID} from "mongodb";
import * as moment from "moment";

import {SortDirection} from "./shared";
import {MutationResolvers, QueryResolvers, JournalEntryResolvers,
  JournalEntrySourceType, SubscriptionResolvers, JournalEntryType,
  JournalEntiresReconciledFilter
} from "../graphTypes";
import {nodeFieldResolver} from "./utils/nodeResolver";
import {NodeValue} from "../types";
import {getDescendants as deptDescendants} from "./departments";

const JOURNAL_ENTRY_ADDED = "JOURNAL_ENTRY_ADDED";

const userNodeType = new ObjectID("5dca0427bccd5c6f26b0cde2");

const addFields = {$addFields:{
  id:{$toString: "$_id"},
  type:{$arrayElemAt: ["$type.value",0]},
  department:{$arrayElemAt: ["$department.value",0]},
  category:{$arrayElemAt: ["$category.value",0]},
  paymentMethod:{$arrayElemAt: ["$paymentMethod.value",0]},
  total:{$arrayElemAt: ["$total.value",0]},
  source:{$arrayElemAt: ["$source.value",0]},
  reconciled:{$arrayElemAt: ["$reconciled.value",0]},
  description:{$ifNull: [ {$arrayElemAt: ["$description.value",0]}, null ]},
  date:{$arrayElemAt: ["$date.value",0]}
}};

const defaultSort = {$sort:{lastUpdate:-1}};

const project = {$project: {
  deleted:false,
  lastUpdate:false,
  parent:false,
  createdBy:false
}};

enum SortBy {
  "DEPARTMENT" = "department",
  "CATEGORY" = "category",
  // "ROOT_TYPE" = "_rootType",
  "PAYMENT_METHOD" = "paymentMethod",
  "TOTAL" = "_total", //Must be decimal to sort (stored as rational)
  "DATE" = "date",
  "SOURCE" = "source"
}

const  sortByTotalField = {$addFields: {
  _total:{$divide: ["$total.num", "$total.den"]}
}};

export const journalEntries:QueryResolvers["journalEntries"] =  
  async (parent, args, context, info) => 
{

  const {db} = context;

  const {
    paginate:{
      skip,
      limit
    },
    sortBy,
    filterBy = null
  } = args;
  
  const match = {"deleted.0.value":false} as object;

  if(filterBy) {
    
    if(filterBy?.department?.eq) {

      const deptIds = await deptDescendants(db, 
        new ObjectID(filterBy.department.eq),{_id:true});

      match["department.0.value.id"] = {$in:deptIds.map(v => v._id)};

    }

    if(filterBy?.reconciled === JournalEntiresReconciledFilter.NotReconciled) {

      match["reconciled.0.value"] = false;

    } else if(filterBy?.reconciled 
      === JournalEntiresReconciledFilter.Reconciled)
    {

      match["reconciled.0.value"] = true;

    }

  }

  const skipAndLimit = [{$skip: skip}, {$limit: limit}];
  
  const pipeline:object[] = [{$match:match}];
  

  if(sortBy.length === 0) {

    pipeline.push(defaultSort, ...skipAndLimit, addFields);
    
  } else {

    pipeline.push(addFields);

    const $sort = {};

    for(const {column, direction} of sortBy) {

      $sort[SortBy[column]] = SortDirection[direction];
      
      if(column === "TOTAL") {
        pipeline.push(sortByTotalField);
      }

    }

    pipeline.push({$sort},...skipAndLimit);

  }

  pipeline.push(project);

  const totalCount = await db.collection("journalEntries")
    .countDocuments(match);
  
  const entries = await db.collection("journalEntries")
    .aggregate(pipeline).toArray();

  return {
    totalCount,
    entries
  };


}

export const updateJournalEntry:
  MutationResolvers["updateJournalEntry"] = 
  async (parent, args, context, info) => 
{
  
  const {id, fields} = args;
  const {db, nodeMap, user} = context;

  const createdBy = {
    node: userNodeType,
    id: user.id
  };

  const createdOn  = new Date();
  const lastUpdate = createdOn;

  const $push = {};

  const updateQuery = {
    $set:{
      lastUpdate,
    },
    $push
  };

  const {date:dateString = null, source = null, 
    department:departmentId = null, total = null, category:categoryId = null,
    paymentMethod:paymentMethodId = null, description = null, reconciled = null
  } = fields;

  let numFieldsToUpdate = 0;
  if(dateString !== null) {

    numFieldsToUpdate++;

    const date = moment(dateString, moment.ISO_8601);

    if(!date.isValid()){
      throw new Error(`Mutation "updateJournalEntry" date argument "${dateString}" not a valid ISO 8601 date string.`);
    }

    $push["date"] = {
      $each:[{
        value:date.toDate(),
        createdBy,
        createdOn,
      }],
      $position:0
    };
      
  }

  if(source !== null) {

    numFieldsToUpdate++;
    
    const {id:sourceId, sourceType} = source;
    
    const id = new ObjectID(sourceId);

    const value = {id} as NodeValue;

    let collection:string;
    switch(sourceType) {
      case JournalEntrySourceType.Business:
        if(nodeMap.typename.has("Business")) {
          const nodeInfo = nodeMap.typename.get("Business");
          collection = nodeInfo.collection;
          value.node = new ObjectID(nodeInfo.id);
        }
        break;
      case JournalEntrySourceType.Department:
        if(nodeMap.typename.has("Department")) {
          const nodeInfo = nodeMap.typename.get("Department");
          collection = nodeInfo.collection;
          value.node = new ObjectID(nodeInfo.id);
        }
        break;
      case JournalEntrySourceType.Person:
        if(nodeMap.typename.has("Person")) {
          const nodeInfo = nodeMap.typename.get("Person");
          collection = nodeInfo.collection;
          value.node = new ObjectID(nodeInfo.id);
        }
        break;
    }

    // Confirm id exists in node
    if(0 === (await db.collection(collection).find({_id:id})
      .limit(1).count())) 
    {
      throw new Error(`Mutation "updateJournalEntry" source type "${sourceType}" with id ${sourceId} does not exist.`);
    } else if(value.node === undefined) {
      throw new Error(`Mutation "updateJournalEntry" source type "${sourceType}" not found.`);
    }

    $push["source"] = {
      $each:[{
        value,
        createdBy,
        createdOn,
      }],
      $position:0
    };

  }

  if(departmentId !== null) {

    numFieldsToUpdate++;

    const {collection, id:node} = nodeMap.typename.get("Department");

    const id = new ObjectID(departmentId);

    if(0 === (await db.collection(collection)
      .find({_id:id}).limit(1).count()))
    {
      throw new Error(`Mutation "updateJournalEntry" type "Department" with id ${departmentId} does not exist.`);
    }

    $push["department"] = {
      $each:[{
        value:{
          node:new ObjectID(node),
          id
        },
        createdBy,
        createdOn,
      }],
      $position:0
    };
    
  }
  
  if(total !== null) {

    numFieldsToUpdate++;
    
    $push["total"] = {
      $each:[{
        value:total,
        createdBy,
        createdOn,
      }],
      $position:0
    };

  }
  
  if(categoryId !== null) {

    numFieldsToUpdate++;
    
    const {collection, id:node} = 
      nodeMap.typename.get("JournalEntryCategory");

    const id = new ObjectID(categoryId);

    if(0 === (await db.collection(collection).find({_id:id})
      .limit(1).count()))
    {
      throw new Error(`Mutation "updateJournalEntry" type "JournalEntryCategory" with id ${categoryId} does not exist.`);
    }

    $push["category"] = {
      $each:[{
        value:{
          node:new ObjectID(node),
          id
        },
        createdBy,
        createdOn,
      }],
      $position:0
    };

  }

  if(paymentMethodId !== null) {

    numFieldsToUpdate++;
    
    const {collection, id:node} = 
      nodeMap.typename.get("PaymentMethod");

    const id = new ObjectID(paymentMethodId);

    if(0 === (await db.collection(collection)
      .find({_id:id}).limit(1).count())) 
    {
      throw new Error(`Mutation "updateJournalEntry" type "PaymentMethod" with id ${paymentMethodId} does not exist.`);
    }

    $push["paymentMethod"] = {
      $each:[{
        value:{
          node:new ObjectID(node),
          id
        },
        createdBy,
        createdOn,
      }],
      $position:0
    };
    
  }

  if(description !== null) {
    
    numFieldsToUpdate++;

    $push["description"] = {
      $each:[{
        value:description,
        createdBy,
        createdOn,
      }],
      $position:0
    };

  }

  if(reconciled !== null) {
    
    numFieldsToUpdate++;

    $push["reconciled"] = {
      $each:[{
        value:reconciled,
        createdBy,
        createdOn,
      }],
      $position:0
    };

  }

  if(numFieldsToUpdate === 0) {
    throw new Error(`Mutation "updateJournalEntry" requires at least one of the following fields: "date", "source", "department", "total", "type", or "paymentMethod"`)
  }

  const {modifiedCount} = await 
    db.collection("journalEntries")
      .updateOne({_id:new ObjectID(id)}, updateQuery);

  if(modifiedCount === 0) {
    throw new Error(`Mutation "updateJournalEntry" arguments "${JSON.stringify(args)}" failed.`);    
  }

  const doc = await db.collection("journalEntries")
    .aggregate([
      {$match:{_id:new ObjectID(id)}},
      addFields,
      project
    ]).toArray();

  return doc[0];

}

export const addJournalEntry:
  MutationResolvers["addJournalEntry"] = 
  async (parent, args, context, info) => 
{


  const {
    date:dateString,
    department:departmentId,
    category:categoryId,
    source:{
      id:sourceId,
      sourceType
    },
    description = null,
    paymentMethod:paymentMethodId,
    total,
  } = args.fields;

  const reconciled = args.fields.reconciled ?? false;

  const {db, user, nodeMap, pubSub} = context;

  const createdOn = new Date();
  const lastUpdate = createdOn;
  
  const createdBy = {
    node: userNodeType,
    id: user.id
  };

  const insertDoc = {
    total:[{
      value:total,
      createdBy,
      createdOn,
    }],
    lastUpdate,
    createdOn,
    createdBy,
    deleted:[{
      value:false,
      createdBy,
      createdOn
    }],
    reconciled:[{
      value:reconciled,
      createdBy,
      createdOn
    }],
  } as any;

  // Description
  if(description) {
    insertDoc["description"] = [{
      value:description,
      createdBy,
      createdOn
    }]
  } else {
    insertDoc["description"] = [];
  } 

  // Date
  const date = moment(dateString, moment.ISO_8601);
  if(!date.isValid()){
    throw new Error(`Mutation "addJournalEntry" date argument "${dateString}" not a valid ISO 8601 date string.`);
  }

  insertDoc["date"] = [{
    value:date.toDate(),
    createdBy,
    createdOn,
  }];

  // Department
  {

    const {collection, id:node} = nodeMap.typename.get("Department");

    const id = new ObjectID(departmentId);

    if(0 === (await db.collection(collection).find({_id:id})
      .limit(1).count()))
    {
      throw new Error(`Mutation "addJournalEntry" type "Department" with id ${departmentId} does not exist.`);
    }

    insertDoc["department"] = [{
      value:{
        node:new ObjectID(node),
        id
      },
      createdBy,
      createdOn,
    }];

  }

  // JournalEntryCategory
  {

    const {collection, id:node} = 
      nodeMap.typename.get("JournalEntryCategory");

    const id = new ObjectID(categoryId);

    if(0 === (await db.collection(collection).find({_id:id})
      .limit(1).count())) 
    {
      throw new Error(`Mutation "addJournalEntry" type "JournalEntryCategory" with id ${categoryId} does not exist.`);
    }

    insertDoc["category"] = [{
      value:{
        node:new ObjectID(node),
        id
      },
      createdBy,
      createdOn,
    }];

  } 

  // JournalEntrySource
  {
    
    const id = new ObjectID(sourceId);

    const value = {id} as NodeValue;

    let collection:string;
    switch(sourceType) {
      case JournalEntrySourceType.Business:
        if(nodeMap.typename.has("Business")) {
          const nodeInfo = nodeMap.typename.get("Business");
          collection = nodeInfo.collection;
          value.node = new ObjectID(nodeInfo.id);
        }
        break;
      case JournalEntrySourceType.Department:
        if(nodeMap.typename.has("Department")) {
          const nodeInfo = nodeMap.typename.get("Department");
          collection = nodeInfo.collection;
          value.node = new ObjectID(nodeInfo.id);
        }
        break;
      case JournalEntrySourceType.Person:
        if(nodeMap.typename.has("Person")) {
          const nodeInfo = nodeMap.typename.get("Person");
          collection = nodeInfo.collection;
          value.node = new ObjectID(nodeInfo.id);
        }
        break;
    }

    // Confirm id exists in node
    if(0 === (await db.collection(collection).find({_id:id})
      .limit(1).count())) 
    {
      throw new Error(`Mutation "addJournalEntry" source type "${sourceType}" with id ${sourceId} does not exist.`);
    } else if(value.node === undefined) {
      throw new Error(`Mutation "addJournalEntry" source type "${sourceType}" not found.`);
    }
    
    insertDoc["source"] = [{
      value,
      createdBy,
      createdOn,
    }];

  }

  // PaymentMethod
  {
    
    const {collection, id:node} = 
      nodeMap.typename.get("PaymentMethod");

    const id = new ObjectID(paymentMethodId);

    if(0 === (await db.collection(collection)
      .find({_id:id}).limit(1).count())) 
    {
      throw new Error(`Mutation "addJournalEntry" type "PaymentMethod" with id ${paymentMethodId} does not exist.`);
    }
  
    insertDoc["paymentMethod"] = [{
      value:{
        node:new ObjectID(node),
        id
      },
      createdBy,
      createdOn,
    }];
    
  }

  const {insertedId, insertedCount} = 
    await db.collection("journalEntries").insertOne(insertDoc);

  if(insertedCount === 0) {
    throw new Error(`Mutation "addJournalEntry" arguments "${JSON.stringify(args)}" failed.`);   
  }

  const newEntry = await db.collection("journalEntries").aggregate([
    {$match:{_id:insertedId}},
    addFields,
    project
  ]).toArray();

  pubSub.publish(JOURNAL_ENTRY_ADDED, { journalEntryAdded: newEntry[0] })
    .catch((error)=> console.error(error));

  return newEntry[0];

}

export const JournalEntry:JournalEntryResolvers = {
  type:(parent) => (parent.type as any) === "credit" ? 
    JournalEntryType.Credit : JournalEntryType.Debit,
  department:nodeFieldResolver,
  category:nodeFieldResolver,
  paymentMethod:nodeFieldResolver,
  source:nodeFieldResolver,
  date:(parent, args, context, info) => {
    return (parent.date as any as Date).toISOString();
  }
};

export const journalEntryAdded:SubscriptionResolvers["journalEntryAdded"] = 
{
  subscribe:(_,__,{pubSub}) => pubSub.asyncIterator(JOURNAL_ENTRY_ADDED)
}