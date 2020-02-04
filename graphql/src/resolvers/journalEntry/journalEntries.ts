import {ObjectID, FilterQuery, Condition, Db} from "mongodb";

import {addFields, project} from "./utils";
import {QueryResolvers, JournalEntiresWhereInput as Where,
  JournalEntriesWhereDepartment, JournalEntry, JournalEntriesWhereLastUpdate
} from "../../graphTypes";

type WhereCond = JournalEntriesWhereDepartment & JournalEntriesWhereLastUpdate;
type WhereCondKeys = keyof JournalEntriesWhereDepartment |
  keyof JournalEntriesWhereLastUpdate;

const NULLISH = Symbol();
const condValTransformDefault = (condVal) => condVal;
const matchCondition = (cond:WhereCond, 
  condValTransform = condValTransformDefault, _cond_:Condition<any> = {}) => 
{

  for(const key of Object.keys(cond) as (keyof WhereCondKeys)[]) {

    // skip null or undefined conditions
    if((cond[key] ?? NULLISH) === NULLISH) {
      continue;
    }

    switch(key) {

      case "eq":
        _cond_.$eq = condValTransform(cond[key]);
        break;

      case "ne":
        _cond_.$ne = condValTransform(cond[key]);
        break;
      
      case "in":
        _cond_.$in = condValTransform(cond[key]);
        break;
      
      case "nin":
        _cond_.$nin = condValTransform(cond[key]);
        break;

      case "gt":
        _cond_.$gt = condValTransform(cond[key]);
        break;
      
      case "gte":
        _cond_.$gte = condValTransform(cond[key]);
        break;

      case "lt":
        _cond_.$lt = condValTransform(cond[key]);
        break;
      
      case "lte":
        _cond_.$lte = condValTransform(cond[key]);
        break;

    }

  }

  return _cond_;
}

const toObjectId = (id:string | string[]) => {
  
  if(Array.isArray(id)) {
    
      return id.map((id) => new ObjectID(id));

  }

  return new ObjectID(id as string);

};

const dateStrToDate = (date:string) => new Date(date);

const filter = async (where:Where, db:Db) => {

  const filterQuery:FilterQuery<any> = {};

  for(const key of Object.keys(where) as (keyof Where)[]) {
    
    // skip null or undefined filters
    if((where[key] ?? NULLISH) === NULLISH) {
      continue;
    }

    switch(key) {

      case "department":{
        
        const deptCond = where[key];

        if(deptCond?.includeDescendants) {

          const descendants = await db.collection<{
            _id:ObjectID,
            descendants:{_id:ObjectID}[]
          }>("departments").aggregate([
            {$match:{"_id":matchCondition(deptCond, toObjectId)}},
            {$graphLookup: {
              from: "departments",
              startWith: "$_id",
              connectFromField: "_id",
              connectToField: "parent.id",
              as: "descendants"
            }},
            {$project: {
              _id:true,
              "descendants._id":true
            }}
          ]).toArray();

          const ids = descendants.reduce((ids, doc) => {

            ids.add(doc._id);
            for(const {_id} of doc.descendants) {
              ids.add(_id);
            }

            return ids;

          }, new Set<ObjectID>());

          filterQuery["department.0.value.id"] = {$in:Array.from(ids)};

        } else {

          filterQuery["department.0.value.id"] 
            = matchCondition(deptCond, toObjectId);
        
        }

        break;

      }
      case "reconciled":
        filterQuery["reconciled.0.value"] = {$eq:where[key]};
        break;

      case "deleted":
        filterQuery["deleted.0.value"] = {$eq:where[key]};
        break;
      
      case "lastUpdate":
        filterQuery["lastUpdate"] = matchCondition(where[key], dateStrToDate);
        break;

        
      case "or":
        filterQuery.$or = 
          await Promise.all(where[key].map((where) => filter(where, db)));
        break;
      
      case "and":
        filterQuery.$and = 
          await Promise.all(where[key].map((where) => filter(where, db)));
        break;
    }
  
  }

  return filterQuery;

}

const journalEntries:QueryResolvers["journalEntries"] =  
  async (parent, args, context, info) => 
{
  const {db} = context;
  
  const pipeline:object[] = [];

  const {where} = args;
  
  if(where) {

    const $match = await filter(where, db);

    pipeline.push({$match});
  
  }
  

  pipeline .push(addFields, project);

  const results = await db.collection<JournalEntry>("journalEntries")
    .aggregate(pipeline).toArray();

  return results;

}

export default journalEntries;