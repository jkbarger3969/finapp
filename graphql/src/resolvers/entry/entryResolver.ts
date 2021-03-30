import { EntryResolvers, Budget } from "../../graphTypes";
import { nodeFieldResolver } from "../utils/nodeResolver";
import Fraction from "fraction.js";
import { ObjectId } from "mongodb";
import { NodeValue } from "../../types";

const deptNode = new ObjectId("5dc4addacf96e166daaa008f");
const bizNode = new ObjectId("5dc476becf96e166daa9fd0b");

// const paymentMethod: EntryResolvers["paymentMethod"] = async (
//   doc: any,
//   args,
//   context,
//   info
// ) => {
//   const payMethod = doc.paymentMethod ?? doc;
//   if ("node" in payMethod && "id" in payMethod) {
//     return paymentMethodResolver(
//       payMethod,
//       { id: payMethod.id as string },
//       context,
//       info
//     );
//   }

//   return payMethod;
// };

const budget: EntryResolvers["budget"] = async (doc, args, context, info) =>
  null;

const fiscalYear: EntryResolvers["fiscalYear"] = async (
  { date },
  _,
  { db }
) => {
  return db.collection("fiscalYears").findOne({
    begin: { $lte: date },
    end: { $gt: date },
  });
};

const Entry: EntryResolvers = {
  fiscalYear,
  budget,
  department: nodeFieldResolver,
  category: nodeFieldResolver,
  // paymentMethod,
  source: nodeFieldResolver,
  total: (doc) => doc.total,
};

export default Entry;
