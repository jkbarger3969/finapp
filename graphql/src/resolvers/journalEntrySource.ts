import {QueryResolvers} from "../graphTypes";

export const journalEntrySources:QueryResolvers["journalEntrySources"] = 
  async function(parent, args, context, info) 
{
  const {db} = context;
  const {searchByName} = args;

  const filter = new RegExp(searchByName, "i");

  const peoplePromise = db.collection("people").aggregate([
    {$match:{$or: [{"name.first":filter},{"name.last":filter}]}},
    {$addFields:{
      id:{$toString:"$_id"},
      __typename:"Person"
    }}
  ]).toArray();

  const businessPromise = db.collection("businesses").aggregate([
    {$match:{name:filter}},
    {$addFields:{
      id:{$toString:"$_id"},
      __typename:"Business"
    }}
  ]).toArray();

  const deptPromise = db.collection("departments").aggregate([
    {$match:{name:filter}},
    {$addFields:{
      id:{$toString:"$_id"},
      __typename:"Department"
    }}
  ]).toArray();

  const results = await Promise.all([peoplePromise, businessPromise, 
    deptPromise]);

  return results.reduce((results, result)=>{
    results.push(...result);
    return results;
  },[]);
}