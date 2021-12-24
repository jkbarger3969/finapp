import { ObjectId, FilterQuery, Db } from "mongodb";
import { pascalCase } from "change-case";

import { QueryResolvers, CategoriesWhere } from "../../graphTypes";
import { iterateOwnKeys } from "../../utils/iterableFns";
import { whereRegex, whereId, whereTreeId } from "../utils/queryUtils";

export const whereCategories = (
  categoryWhere: CategoriesWhere,
  db: Db
): Promise<FilterQuery<unknown>> | FilterQuery<unknown> => {
  const filterQuery: FilterQuery<unknown> = {};

  const promises: Promise<void>[] = [];

  for (const whereKey of iterateOwnKeys(categoryWhere)) {
    switch (whereKey) {
      // Fields
      case "id":
        {
          const result = whereTreeId(
            categoryWhere[whereKey],
            async (rangeOp, id) => {
              const result: ObjectId[] =
                rangeOp === "gte" || rangeOp === "lte" ? [id] : [];

              switch (rangeOp) {
                case "gt":
                case "gte":
                  {
                    type Doc = { parent: ObjectId };
                    let parentDoc = await db
                      .collection("categories")
                      .findOne<Doc>(
                        { _id: id },
                        {
                          projection: {
                            parent: true,
                          },
                        }
                      );

                    while (parentDoc && parentDoc.parent) {
                      result.push(parentDoc.parent);
                      parentDoc = await db
                        .collection("categories")
                        .findOne<Doc>(
                          { _id: parentDoc.parent },
                          {
                            projection: {
                              parent: true,
                            },
                          }
                        );
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
                        .collection("categories")
                        .find<Doc>({ parent: id }, opts)
                        .toArray()
                    ).map(mapFn);

                    while (queue.length) {
                      result.push(...queue);

                      queue.push(
                        ...(
                          await db
                            .collection("categories")
                            .find<Doc>(
                              { parent: { $in: queue.splice(0) } },
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
            }
          );

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
        filterQuery["name"] = whereRegex(categoryWhere[whereKey]);
        break;
      case "type":
        filterQuery["name"] = pascalCase(categoryWhere[whereKey]);
        break;
      case "parent":
        filterQuery["parent"] = whereId(categoryWhere[whereKey]);
        break;
      case "active":
        filterQuery["active"] = categoryWhere[whereKey];
        break;
      // Logic
      case "and":
        {
          let hasPromise = false;
          const $and: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            categoryWhere[whereKey].map((where) => {
              const result = whereCategories(where, db);
              if (result instanceof Promise) {
                hasPromise = true;
              }
              return result;
            });

          if (hasPromise) {
            promises.push(
              Promise.all($and).then(($and) => {
                filterQuery.$and = $and;
              })
            );
          } else {
            filterQuery.$and = $and as FilterQuery<unknown>[];
          }
        }
        break;
      case "or":
        {
          let hasPromise = false;
          const $or: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            categoryWhere[whereKey].map((where) => {
              const result = whereCategories(where, db);
              if (result instanceof Promise) {
                hasPromise = true;
              }
              return result;
            });

          if (hasPromise) {
            promises.push(
              Promise.all($or).then(($or) => {
                filterQuery.$or = $or;
              })
            );
          } else {
            filterQuery.$or = $or as FilterQuery<unknown>[];
          }
        }
        break;
      case "nor":
        {
          let hasPromise = false;
          const $nor: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            categoryWhere[whereKey].map((where) => {
              const result = whereCategories(where, db);
              if (result instanceof Promise) {
                hasPromise = true;
              }
              return result;
            });

          if (hasPromise) {
            promises.push(
              Promise.all($nor).then(($nor) => {
                filterQuery.$nor = $nor;
              })
            );
          } else {
            filterQuery.$nor = $nor as FilterQuery<unknown>[];
          }
        }
        break;
      case "root":
        if (!("$and" in filterQuery)) {
          filterQuery.$and = [];
        }
        filterQuery.$and.push({
          parent: categoryWhere[whereKey] ? null : { $ne: null },
        });
        break;
    }
  }

  if (promises.length) {
    return Promise.all(promises).then(() => filterQuery);
  }

  return filterQuery;
};

export const categories: QueryResolvers["categories"] = (
  _,
  { where },
  { db }
) => {
  const query = where ? whereCategories(where, db) : {};

  if (query instanceof Promise) {
    return query.then((query) =>
      db.collection("categories").find(query).toArray()
    );
  }

  return db.collection("categories").find(query).toArray();
};
