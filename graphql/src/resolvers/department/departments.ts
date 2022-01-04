import { Db, Filter as FilterQuery, ObjectId } from "mongodb";

import { QueryResolvers, DepartmentsWhere } from "../../graphTypes";
import { iterateOwnKeys } from "../../utils/iterableFns";

import { whereRegex, whereTreeId, whereNode } from "../utils/queryUtils";

export const whereDepartments = (
  deptWhere: DepartmentsWhere,
  db: Db
): Promise<FilterQuery<unknown>> | FilterQuery<unknown> => {
  const filterQuery: FilterQuery<any> = {};

  const promises: Promise<void>[] = [];

  const getRangeIds = async (rangeOp, id: ObjectId) => {
    const result: ObjectId[] =
      rangeOp === "gte" || rangeOp === "lte" ? [id] : [];

    switch (rangeOp) {
      case "gt":
      case "gte":
        {
          const opts = {
            projection: {
              parent: true,
            },
          };

          type Doc = {
            parent: {
              type: "Business" | "Department";
              id: ObjectId;
            };
          };
          let parentDoc = await db
            .collection("departments")
            .findOne<Doc>({ _id: id }, opts);

          // Departments ALWAYS have a parent
          // Do NOT included business parents.
          while (parentDoc && parentDoc.parent.type === "Department") {
            result.push(parentDoc.parent.id);

            parentDoc = await db
              .collection("departments")
              .findOne<Doc>({ _id: parentDoc.parent.id }, opts);
          }
        }
        break;
      case "lt":
      case "lte":
        {
          const opts = {
            projection: {
              _id: true,
            },
          };

          type Doc = { _id: ObjectId };
          const mapFn = ({ _id }: Doc) => _id;

          const queue = (
            await db
              .collection("departments")
              .find<Doc>(
                {
                  "parent.type": "Department",
                  "parent.id": id,
                },
                opts
              )
              .toArray()
          ).map(mapFn);

          while (queue.length) {
            result.push(...queue);

            queue.push(
              ...(
                await db
                  .collection("departments")
                  .find<Doc>(
                    {
                      "parent.type": "Department",
                      "parent.id": { $in: queue.splice(0) },
                    },
                    opts
                  )
                  .toArray()
              ).map(mapFn)
            );
          }
        }
        break;
    }

    return result;
  };

  for (const whereKey of iterateOwnKeys(deptWhere)) {
    switch (whereKey) {
      case "id":
        {
          const result = whereTreeId(deptWhere[whereKey], getRangeIds);

          if (result instanceof Promise) {
            promises.push(
              result.then((result) => {
                filterQuery["_id"] = result;
              })
            );
          } else {
            filterQuery["_id"] = result;
          }
        }
        break;
      case "name":
        filterQuery["name"] = whereRegex(deptWhere[whereKey]);
        break;
      case "code":
        filterQuery["code"] = deptWhere[whereKey];
        break;
      case "parent":
        {
          const $and = whereNode(deptWhere[whereKey], "parent");
          if ("$and" in filterQuery) {
            filterQuery.$and.push(...$and);
          } else {
            filterQuery.$and = $and;
          }
        }
        break;
      case "business":
        {
          promises.push(
            (async () => {
              const $in = (
                await Promise.all(
                  (
                    await db
                      .collection<{ _id: ObjectId }>("departments")
                      .find(
                        {
                          "parent.type": "Business",
                          "parent.id": new ObjectId(deptWhere[whereKey]),
                        },
                        {
                          projection: {
                            _id: true,
                          },
                        }
                      )
                      .toArray()
                  ).map(({ _id }) => getRangeIds("lte", _id))
                )
              ).reduce(($in, ids) => {
                $in.push(...ids);
                return $in;
              }, [] as ObjectId[]);

              if ($in.length) {
                if ("$and" in filterQuery) {
                  filterQuery.$and.push({ _id: { $in } });
                } else {
                  filterQuery.$and = [{ _id: { $in } }];
                }
              }
            })()
          );
        }
        break;
      case "and":
        {
          let hasPromise = false;
          const $and: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            deptWhere[whereKey].map((where) => {
              const result = whereDepartments(where, db);
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
            deptWhere[whereKey].map((where) => {
              const result = whereDepartments(where, db);
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
            deptWhere[whereKey].map((where) => {
              const result = whereDepartments(where, db);
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

export const departments: QueryResolvers["departments"] = async (
  _,
  { where },
  { dataSources: { accountingDb } }
) =>
  accountingDb.find({
    collection: "departments",
    filter: where ? await whereDepartments(where, accountingDb.db) : {},
  });

export default departments;
