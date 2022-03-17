import { Db, Filter, ObjectId } from "mongodb";
import { AliasTypeDbRecord } from "../../dataSources/accountingDb/types";
import { AliasableResolvers, AliasesWhere } from "../../graphTypes";
import { iterateOwnKeys } from "../../utils/iterableFns";
import { whereId } from "../utils/queryUtils";

export const whereAliases = (
  instanceId: ObjectId,
  type: string,
  where: AliasesWhere
): Filter<AliasTypeDbRecord> => {
  const filter: Filter<AliasTypeDbRecord> = {
    id: instanceId,
    type: type,
  };

  for (const key of iterateOwnKeys(where)) {
    switch (key) {
      case "id":
        filter._id = whereId(where[key]);
        break;
    }
  }

  return filter;
};

export const getAliasableResolvers = (type: string): AliasableResolvers => ({
  aliases: ({ _id }, { where = {} }, { dataSources: { accountingDb } }) =>
    accountingDb.find({
      collection: "aliases",
      filter: whereAliases(_id, type, where),
    }),
});
