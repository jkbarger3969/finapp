import { Filter as FilterQuery } from "mongodb";
import { QueryResolvers, PeopleWhere } from "../../graphTypes";
import { iterateOwnKeys } from "../../utils/iterableFns";
import { whereId, whereRegex } from "../utils/queryUtils";

export const wherePeople = (peopleWhere: PeopleWhere): FilterQuery<unknown> => {
  const filterQuery: FilterQuery<any> = {};

  for (const whereKey of iterateOwnKeys(peopleWhere)) {
    switch (whereKey) {
      case "id":
        filterQuery["_id"] = whereId(peopleWhere[whereKey]);
        break;
      case "name":
        for (const name of iterateOwnKeys(peopleWhere[whereKey])) {
          switch (name) {
            case "first":
              filterQuery["name.first"] = whereRegex(
                peopleWhere[whereKey][name]
              );
              break;
            case "last":
              filterQuery["name.last"] = whereRegex(
                peopleWhere[whereKey][name]
              );
              break;
          }
        }
        break;
      case "and":
        filterQuery.$and = peopleWhere[whereKey].map((where) =>
          wherePeople(where)
        );
        break;
      case "or":
        filterQuery.$or = peopleWhere[whereKey].map((where) =>
          wherePeople(where)
        );
        break;
      case "nor":
        filterQuery.$nor = peopleWhere[whereKey].map((where) =>
          wherePeople(where)
        );
        break;
    }
  }

  return filterQuery;
};

export const people: QueryResolvers["people"] = (
  _,
  { where },
  { dataSources: { accountingDb } }
) =>
  accountingDb.find({
    collection: "people",
    filter: where ? wherePeople(where) : {},
  });
