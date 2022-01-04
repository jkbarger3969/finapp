import { Filter as FilterQuery, Db, ObjectId } from "mongodb";
import { pascalCase } from "change-case";

import { QueryResolvers, AccountCardsWhere } from "../../graphTypes";
import { iterateOwnKeys } from "../../utils/iterableFns";
import { whereId, whereRegex } from "../utils/queryUtils";
import { whereEntities } from "../entity";
import { whereAccounts } from "./accounts";

export const whereAccountCards = (
  accountCardsWhere: AccountCardsWhere,
  db: Db
) => {
  const filterQuery: FilterQuery<any> = {
    $and: [{ account: { $exists: true } }],
  };

  const promises: Promise<void>[] = [];

  for (const whereKey of iterateOwnKeys(accountCardsWhere)) {
    switch (whereKey) {
      case "id":
        filterQuery["_id"] = whereId(accountCardsWhere[whereKey]);
        break;
      case "account":
        promises.push(
          (async () => {
            const result = whereAccounts(accountCardsWhere[whereKey], db);

            const results = (
              await db
                .collection("accounts")
                .find<{ _id: ObjectId }>(
                  result instanceof Promise ? await result : result,
                  {
                    projection: {
                      _id: true,
                    },
                  }
                )
                .toArray()
            ).map(({ _id }) => _id);

            if (results.length) {
              filterQuery["account"] = {
                $in: results,
              };
            }
          })()
        );
        break;
      case "active":
        filterQuery["active"] = accountCardsWhere[whereKey];
        break;
      case "authorizedUsers":
        promises.push(
          (async () => {
            const { businesses, departments, people } = await whereEntities(
              accountCardsWhere[whereKey],
              db
            );

            if (businesses) {
              if (!("$or" in filterQuery)) {
                filterQuery.$or = [];
              }

              filterQuery.$or.push({
                "authorizedUsers.type": "Business",
                "authorizedUsers.id": { $in: businesses },
              });
            }

            if (departments) {
              if (!("$or" in filterQuery)) {
                filterQuery.$or = [];
              }

              filterQuery.$or.push({
                "authorizedUsers.type": "Department",
                "authorizedUsers.id": { $in: departments },
              });
            }

            if (people) {
              if (!("$or" in filterQuery)) {
                filterQuery.$or = [];
              }

              filterQuery.$or.push({
                "authorizedUsers.type": "Person",
                "authorizedUsers.id": { $in: people },
              });
            }
          })()
        );
        break;
      case "trailingDigits":
        filterQuery["trailingDigits"] = whereRegex(accountCardsWhere[whereKey]);
        break;
      case "type":
        filterQuery["type"] = pascalCase(accountCardsWhere[whereKey]);
        break;
      case "and":
        {
          if (!("$and" in filterQuery)) {
            filterQuery.$and = [];
          }
          const $and = filterQuery.$and;
          for (const where of accountCardsWhere[whereKey]) {
            const result = whereAccountCards(where, db);
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
          for (const where of accountCardsWhere[whereKey]) {
            const result = whereAccountCards(where, db);
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
          for (const where of accountCardsWhere[whereKey]) {
            const result = whereAccountCards(where, db);
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

export const accountCards: QueryResolvers["accountCards"] = async (
  _,
  { where },
  { dataSources: { accountingDb } }
) =>
  accountingDb.find({
    collection: "paymentCards",
    filter: where
      ? await whereAccountCards(where, accountingDb.db)
      : { account: { $exists: true } },
  });
