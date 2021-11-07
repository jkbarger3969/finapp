import { Db, FilterQuery, ObjectId } from "mongodb";

import { QueryResolvers, BudgetsWhere } from "../../graphTypes";
import { iterateOwnKeys } from "../../utils/iterableFns";
import { whereFiscalYear } from "../fiscalYear";
import { whereRational, whereId, whereNode } from "../utils/queryUtils";

export const whereBudgets = (
  budgetWhere: BudgetsWhere,
  db: Db
): FilterQuery<unknown> | Promise<FilterQuery<unknown>> => {
  const filterQuery: FilterQuery<unknown> = {};

  const promises: Promise<void>[] = [];

  for (const whereKey of iterateOwnKeys(budgetWhere)) {
    switch (whereKey) {
      case "id":
        filterQuery["_id"] = whereId(budgetWhere[whereKey]);
        break;
      case "amount":
        {
          const $and = whereRational("$amount", budgetWhere[whereKey]);

          if ("$and" in filterQuery) {
            filterQuery.$and.push(...$and);
          } else {
            filterQuery.$and = $and;
          }
        }
        break;
      case "owner":
        if (!("$and" in filterQuery)) {
          filterQuery.$and = [];
        }
        filterQuery.$and.push(...whereNode(budgetWhere[whereKey], "owner"));

        break;
      case "fiscalYear":
        promises.push(
          (async () => {
            const query = whereFiscalYear(budgetWhere[whereKey]);

            const $in = (
              await db
                .collection<{ _id: ObjectId }>("fiscalYears")
                .find(query, {
                  projection: {
                    _id: true,
                  },
                })
                .toArray()
            ).map(({ _id }) => _id);

            filterQuery["fiscalYear"] = { $in };
          })()
        );

        break;
      case "and":
        {
          let hasPromise = false;
          const $and: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            budgetWhere[whereKey].map((where) => {
              const result = whereBudgets(where, db);
              if (result instanceof Promise) {
                hasPromise = true;
              }
              return result;
            });

          if (hasPromise) {
            promises.push(
              Promise.all($and).then(($and) => {
                if ("$and" in filterQuery) {
                  filterQuery.$and.push(...$and);
                } else {
                  filterQuery.$and = $and;
                }
              })
            );
          } else {
            if ("$and" in filterQuery) {
              filterQuery.$and.push(...($and as FilterQuery<unknown>[]));
            } else {
              filterQuery.$and = $and as FilterQuery<unknown>[];
            }
          }
        }
        break;
      case "or":
        {
          let hasPromise = false;
          const $or: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            budgetWhere[whereKey].map((where) => {
              const result = whereBudgets(where, db);
              if (result instanceof Promise) {
                hasPromise = true;
              }
              return result;
            });

          if (hasPromise) {
            promises.push(
              Promise.all($or).then(($or) => {
                if ("$or" in filterQuery) {
                  filterQuery.$or.push(...$or);
                } else {
                  filterQuery.$or = $or;
                }
              })
            );
          } else {
            if ("$or" in filterQuery) {
              filterQuery.$or.push(...($or as FilterQuery<unknown>[]));
            } else {
              filterQuery.$or = $or as FilterQuery<unknown>[];
            }
          }
        }
        break;
      case "nor":
        {
          let hasPromise = false;
          const $nor: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            budgetWhere[whereKey].map((where) => {
              const result = whereBudgets(where, db);
              if (result instanceof Promise) {
                hasPromise = true;
              }
              return result;
            });

          if (hasPromise) {
            promises.push(
              Promise.all($nor).then(($nor) => {
                if ("$nor" in filterQuery) {
                  filterQuery.$nor.push(...$nor);
                } else {
                  filterQuery.$nor = $nor;
                }
              })
            );
          } else {
            if ("$nor" in filterQuery) {
              filterQuery.$nor.push(...($nor as FilterQuery<unknown>[]));
            } else {
              filterQuery.$nor = $nor as FilterQuery<unknown>[];
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

export const budgets: QueryResolvers["budgets"] = async (
  _,
  { where },
  { db }
) => {
  const query = where ? whereBudgets(where, db) : {};

  if (query instanceof Promise) {
    return db
      .collection("budgets")
      .find(await query)
      .toArray();
  }

  return db.collection("budgets").find(query).toArray();
};
