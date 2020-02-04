import {O} from "ts-toolbelt";

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
  date:{$arrayElemAt: ["$date.value",0]},
  deleted:{$arrayElemAt: ["$deleted.value",0]}
}};
type addFields = O.Readonly<typeof addFields, keyof typeof addFields, "deep">;

const project = {$project: {
  parent:false,
  createdBy:false
}};

type project = O.Readonly<typeof project, keyof typeof project, "deep">;

export {addFields, project};