import { Filter as FilterQuery } from "mongodb";

import { QueryResolvers, BusinessesWhere } from "../../graphTypes";

import { Returns as BusinessReturns } from "./business";
import { iterateOwnKeys } from "../../utils/iterableFns";

import { whereId, whereRegex } from "../utils/queryUtils";

export type Returns = BusinessReturns[];

export const whereBusiness = (
  businessWhere: BusinessesWhere
): FilterQuery<unknown> => {
  const filterQuery: FilterQuery<any> = {};

  for (const whereKey of iterateOwnKeys(businessWhere)) {
    switch (whereKey) {
      case "id":
        filterQuery["_id"] = whereId(businessWhere[whereKey]);
        break;
      case "name":
        filterQuery["name"] = whereRegex(businessWhere[whereKey]);
        break;
      case "and":
        filterQuery.$and = businessWhere[whereKey].map((where) =>
          whereBusiness(where)
        );
        break;
      case "or":
        filterQuery.$or = businessWhere[whereKey].map((where) =>
          whereBusiness(where)
        );
        break;
      case "nor":
        filterQuery.$nor = businessWhere[whereKey].map((where) =>
          whereBusiness(where)
        );
        break;
    }
  }

  return filterQuery;
};

export const businesses: QueryResolvers["businesses"] = (
  _,
  { where },
  { dataSources: { accountingDb } }
) =>
  accountingDb.find({
    collection: "businesses",
    filter: where ? whereBusiness(where) : {},
  });
