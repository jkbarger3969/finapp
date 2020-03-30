import { JournalEntryResolvers, JournalEntryType } from "../../graphTypes";
import { nodeFieldResolver } from "../utils/nodeResolver";
import paymentMethodResolver from "../paymentMethod/paymentMethod";

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
  type: parent =>
    (parent.type as any) === "credit"
      ? JournalEntryType.Credit
      : JournalEntryType.Debit,
  department: nodeFieldResolver,
  category: nodeFieldResolver,
  paymentMethod,
  source: nodeFieldResolver,
  date: (parent, args, context, info) => {
    return ((parent.date as any) as Date).toISOString();
  },
  lastUpdate: (parent, args, context, info) => {
    return ((parent.lastUpdate as any) as Date).toISOString();
  }
};

export default JournalEntry;
