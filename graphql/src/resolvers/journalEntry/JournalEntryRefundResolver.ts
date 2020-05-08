import { JournalEntryRefundResolvers } from "../../graphTypes";
import { nodeFieldResolver } from "../utils/nodeResolver";
import paymentMethodResolver from "../paymentMethod/paymentMethod";

const paymentMethod: JournalEntryRefundResolvers["paymentMethod"] = async (
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

const JournalEntry: JournalEntryRefundResolvers = {
  paymentMethod,
};

export default JournalEntry;
