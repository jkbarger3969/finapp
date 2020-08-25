import { JournalEntryResolvers } from "../../graphTypes";
import { nodeFieldResolver } from "../utils/nodeResolver";
import paymentMethodResolver from "../paymentMethod/paymentMethod";
import { fractionToRational } from "../../utils/rational";
import Fraction from "fraction.js";

const paymentMethod: JournalEntryResolvers["paymentMethod"] = async (
  doc: any,
  args,
  context,
  info
) => {
  const payMethod = doc.paymentMethod ?? doc;
  if ("node" in payMethod && "id" in payMethod) {
    return paymentMethodResolver(
      payMethod,
      { id: payMethod.id as string },
      context,
      info
    );
  }

  return payMethod;
};

const JournalEntry: JournalEntryResolvers = {
  department: nodeFieldResolver,
  category: nodeFieldResolver,
  paymentMethod,
  source: nodeFieldResolver,
  total: (doc) => fractionToRational((doc.total as unknown) as Fraction),
};

export default JournalEntry;
