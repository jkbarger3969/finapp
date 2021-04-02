import { FilterQuery } from "mongodb";

import { QueryResolvers, FiscalYearsWhere } from "../../graphTypes";
import { iterateOwnKeyValues, iterateOwnKeys } from "../../utils/iterableFns";

import { whereRegex, whereId } from "../utils/queryUtils";

export const whereFiscalYear = (
  fiscalYearWhere: FiscalYearsWhere
): FilterQuery<unknown> => {
  const filterQuery: FilterQuery<unknown> = {};

  for (const whereKey of iterateOwnKeys(fiscalYearWhere)) {
    switch (whereKey) {
      case "id":
        filterQuery["_id"] = whereId(fiscalYearWhere[whereKey]);
        break;
      case "name":
        filterQuery["name"] = whereRegex(fiscalYearWhere[whereKey]);
        break;
      case "date":
        if (!("$and" in fiscalYears)) {
          filterQuery.$and = [];
        }

        for (const [dateKey, date] of iterateOwnKeyValues(
          fiscalYearWhere[whereKey]
        )) {
          switch (dateKey) {
            case "eq":
              filterQuery.$and.push({
                begin: { $lte: date },
                end: { $gt: date },
              });
              break;
            case "ne":
              filterQuery.$and.push({
                $or: [{ begin: { $gt: date } }, { end: { $lte: date } }],
              });
              break;
            case "gt":
              filterQuery.$and.push({
                begin: { $gt: date },
              });
              break;
            case "gte":
              filterQuery.$and.push({
                end: { $gt: date },
              });
              break;
            case "lt":
              filterQuery.$and.push({
                end: { $lte: date },
              });
              break;
            case "lte":
              filterQuery.$and.push({
                begin: { $lte: date },
              });
              break;
          }
        }
        break;
      case "and":
        if (!("$and" in fiscalYears)) {
          filterQuery.$and = [];
        }

        filterQuery.$and.push(
          ...fiscalYearWhere[whereKey].map((where) => whereFiscalYear(where))
        );
        break;
      case "or":
        filterQuery.$or = fiscalYearWhere[whereKey].map((where) =>
          whereFiscalYear(where)
        );
        break;
      case "nor":
        filterQuery.$nor = fiscalYearWhere[whereKey].map((where) =>
          whereFiscalYear(where)
        );
        break;
    }
  }

  return filterQuery;
};

export const fiscalYears: QueryResolvers["fiscalYears"] = (
  _,
  { where },
  { db }
) => {
  const query = where ? whereFiscalYear(where) : {};

  return db.collection("fiscalYears").find(query).toArray();
};
