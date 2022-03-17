import { AliasResolvers } from "../../graphTypes";
import { Context } from "../../types";
import { AliasTypeDbRecord } from "../../dataSources/accountingDb/types";

export const Alias: AliasResolvers<Context, AliasTypeDbRecord> = {
  id: ({ _id }) => _id.toString(),
};
