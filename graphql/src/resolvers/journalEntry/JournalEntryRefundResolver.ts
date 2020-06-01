import { JournalEntryRefundResolvers } from "../../graphTypes";
import lookupPaymentMethod from "../paymentMethod/paymentMethod";
import { fractionToRational } from "../../utils/rational";

const paymentMethod: JournalEntryRefundResolvers["paymentMethod"] = async (
  doc,
  args,
  context,
  info
) => {
  const payMethod = doc?.paymentMethod as any;
  if (payMethod && "node" in payMethod && "id" in payMethod) {
    return lookupPaymentMethod(
      payMethod,
      { id: payMethod.id as string },
      context,
      info
    );
  }

  return payMethod;
};

const JournalRefundEntry: JournalEntryRefundResolvers = {
  paymentMethod,
  total: (doc) => fractionToRational((doc.total ?? doc) as any),
};

export default JournalRefundEntry;
