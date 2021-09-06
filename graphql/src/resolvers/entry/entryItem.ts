import { ObjectId } from "mongodb";

import { QueryResolvers } from "../../graphTypes";

const entryItem: QueryResolvers["entryItem"] = async (
  obj,
  args,
  context,
  info
) => {
  const { id } = args;

  const { db } = context;

  const itemId = new ObjectId(id);

  return {} as any;
};

export default entryItem;
