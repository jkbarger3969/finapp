import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";

export const entryRefund: QueryResolvers["entryRefund"] = async (
  _,
  { id },
  { dataSources: { accountingDb } }
) => {
  const refundId = new ObjectId(id);

  const results = await accountingDb.findOne({
    collection: "entries",
    filter: {
      "refunds.id": refundId,
    },
    options: {
      projection: {
        refunds: true,
      },
    },
  });

  return (results?.refunds || []).find(({ id }) => refundId.equals(id)) || null;
};
