import { EntryRefundResolvers, Scalars } from "../../graphTypes";

// const paymentMethod: EntryRefundResolvers["paymentMethod"] = async (
//   doc,
//   args,
//   context,
//   info
// ) => {

//   return doc,;
// };

const JournalRefundEntry: EntryRefundResolvers = {
  // paymentMethod,
  total: (doc) => doc.total ?? ((doc as unknown) as Scalars["Rational"]),
};

export default JournalRefundEntry;
