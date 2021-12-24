import { Db, FilterQuery, ObjectId } from "mongodb";

import { QueryResolvers, AccountsWhere } from "../../graphTypes";
import { iterateOwnKeys } from "../../utils/iterableFns";
import { whereEntities } from "../entity";
import { deserializeGQLEnum } from "../utils/gqlEnums";
import { whereId, whereRegex } from "../utils/queryUtils";
import { whereAccountCards } from "./accountCards";

export const whereAccounts = (accountsWhere: AccountsWhere, db: Db) => {
  const filterQuery: FilterQuery<unknown> = {};

  const promises: Promise<void>[] = [];

  for (const whereKey of iterateOwnKeys(accountsWhere)) {
    switch (whereKey) {
      case "id":
        filterQuery["_id"] = whereId(accountsWhere[whereKey]);
        break;
      case "accountNumber":
        filterQuery["accountNumber"] = whereRegex(accountsWhere[whereKey]);
        break;
      case "accountType":
        filterQuery["accountType"] = deserializeGQLEnum(
          accountsWhere[whereKey]
        );
        break;
      case "active":
        filterQuery["active"] = accountsWhere[whereKey];
        break;
      case "cards":
        promises.push(
          (async () => {
            const result = whereAccountCards(accountsWhere[whereKey], db);

            const query = result instanceof Promise ? await result : result;

            const results = (
              await db
                .collection<{ _id: ObjectId }>("paymentCards")
                .find(query)
                .toArray()
            ).map(({ _id }) => _id);

            if (results.length) {
              filterQuery["cards"] = { $elemMatch: { $in: results } };
            }
          })()
        );
        break;
      case "name":
        filterQuery["name"] = whereRegex(accountsWhere[whereKey]);
        break;
      case "owner":
        promises.push(
          (async () => {
            const { businesses, departments, people } = await whereEntities(
              accountsWhere[whereKey],
              db
            );

            if (businesses) {
              if (!("$or" in filterQuery)) {
                filterQuery.$or = [];
              }

              filterQuery.$or.push({
                "owner.type": "Business",
                "owner.id": { $in: businesses },
              });
            }

            if (departments) {
              if (!("$or" in filterQuery)) {
                filterQuery.$or = [];
              }

              filterQuery.$or.push({
                "owner.type": "Department",
                "owner.id": { $in: departments },
              });
            }

            if (people) {
              if (!("$or" in filterQuery)) {
                filterQuery.$or = [];
              }

              filterQuery.$or.push({
                "owner.type": "Person",
                "owner.id": { $in: people },
              });
            }
          })()
        );
        break;
      case "and":
        {
          if (!("$and" in filterQuery)) {
            filterQuery.$and = [];
          }
          const $and = filterQuery.$and;
          for (const where of accountsWhere[whereKey]) {
            const result = whereAccounts(where, db);

            if (result instanceof Promise) {
              promises.push(
                result.then((result) => {
                  $and.push(result);
                })
              );
            } else {
              $and.push(result);
            }
          }
        }
        break;
      case "or":
        {
          if (!("$or" in filterQuery)) {
            filterQuery.$or = [];
          }
          const $or = filterQuery.$or;
          for (const where of accountsWhere[whereKey]) {
            const result = whereAccounts(where, db);

            if (result instanceof Promise) {
              promises.push(
                result.then((result) => {
                  $or.push(result);
                })
              );
            } else {
              $or.push(result);
            }
          }
        }
        break;
      case "nor":
        {
          if (!("$nor" in filterQuery)) {
            filterQuery.$nor = [];
          }
          const $nor = filterQuery.$nor;
          for (const where of accountsWhere[whereKey]) {
            const result = whereAccounts(where, db);

            if (result instanceof Promise) {
              promises.push(
                result.then((result) => {
                  $nor.push(result);
                })
              );
            } else {
              $nor.push(result);
            }
          }
        }
        break;
    }
  }

  if (promises.length) {
    return Promise.all(promises).then(() => filterQuery);
  }
  return filterQuery;
};

export const accounts: QueryResolvers["accounts"] = (_, { where }, { db }) => {
  const query = where ? whereAccounts(where, db) : {};

  if (query instanceof Promise) {
    return query.then((query) =>
      db.collection("accounts").find(query).toArray()
    );
  }

  return db.collection("accounts").find(query).toArray();
};
