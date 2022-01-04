import { Filter as FilterQuery } from "mongodb";
import { pascalCase } from "change-case";

import { AliasesWhere, QueryResolvers } from "../../graphTypes";
import { iterateOwnKeys } from "../../utils/iterableFns";
import { whereId, whereNode, whereRegex } from "../utils/queryUtils";

const whereAliases = (aliasesWhere: AliasesWhere): FilterQuery<unknown> => {
  const filterQuery: FilterQuery<any> = {};

  for (const whereKey of iterateOwnKeys(aliasesWhere)) {
    switch (whereKey) {
      case "id":
        filterQuery["_id"] = whereId(aliasesWhere[whereKey]);
        break;
      case "target":
        {
          const $and = whereNode(aliasesWhere[whereKey], "target");

          if (!("$and" in filterQuery)) {
            filterQuery.$and = [];
          }

          filterQuery.$and.push(...$and);
        }

        break;
      case "name":
        filterQuery["name"] = whereRegex(aliasesWhere[whereKey]);
        break;
      case "type":
        filterQuery["type"] = pascalCase(aliasesWhere[whereKey]);
        break;
      case "and":
        if (!("$and" in filterQuery)) {
          filterQuery.$and = [];
        }

        filterQuery.$and.push(
          ...aliasesWhere[whereKey].map((where) => whereAliases(where))
        );

        break;
      case "or":
        if (!("$or" in filterQuery)) {
          filterQuery.$or = [];
        }

        filterQuery.$or.push(
          ...aliasesWhere[whereKey].map((where) => whereAliases(where))
        );

        break;
      case "nor":
        if (!("$nor" in filterQuery)) {
          filterQuery.$nor = [];
        }

        filterQuery.$nor.push(
          ...aliasesWhere[whereKey].map((where) => whereAliases(where))
        );

        break;
    }
  }

  return filterQuery;
};

export const aliases: QueryResolvers["aliases"] = (_, { where }, { db }) => {
  const query = where ? whereAliases(where) : {};

  return db.collection("aliases").find(query).toArray() as any;
};
