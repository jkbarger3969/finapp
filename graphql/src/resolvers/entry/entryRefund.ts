import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";

const entryRefund: QueryResolvers["entryRefund"] = async (
  _,
  { id },
  { db }
) => {
  const refundId = new ObjectId(id);

  const results = await db.collection("entries").findOne(
    {
      "refunds.id": refundId,
    },
    {
      projection: {
        refunds: true,
      },
    }
  );

  return (results?.refunds || []).find(({ id }) => refundId.equals(id)) || null;
};

export default entryRefund;
