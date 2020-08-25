import { ObjectId } from "mongodb";
import { QueryResolvers } from "../../graphTypes";
import { addId } from "../utils/mongoUtils";

const person: QueryResolvers["person"] = async (
  parent,
  args,
  context,
  info
) => {
  return (
    (
      await context.db
        .collection("people")
        .aggregate([
          {
            $match: {
              _id: new ObjectId(args.id),
            },
          },
          addId,
        ])
        .toArray()
    )[0] || null
  );
};

export default person;
