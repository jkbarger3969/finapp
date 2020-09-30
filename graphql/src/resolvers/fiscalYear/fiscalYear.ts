import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";
import { addId } from "../utils/mongoUtils";
import { transmutationStage } from "./utils";

const fiscalYear: QueryResolvers["fiscalYear"] = async (
  parent,
  args,
  context,
  info
) => {
  return (
    (
      await context.db
        .collection("fiscalYears")
        .aggregate([
          { $match: { _id: new ObjectId(args.id) } },
          addId,
          transmutationStage,
        ])
        .toArray()
    )[0] || null
  );
};

export default fiscalYear;
