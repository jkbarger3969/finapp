import { Db, FilterQuery, ObjectId } from "mongodb";
import { QueryResolvers, PaymentMethodWhere } from "../../graphTypes";
import { iterateOwnKeys } from "../../utils/iterableFns";
import { whereRegex, whereId, whereTreeId } from "../utils/queryUtils";
import { projection } from "./paymentMethod";

export const wherePaymentMethods = (
  payMethodWhere: PaymentMethodWhere,
  db: Db
) => {
  const filterQuery: FilterQuery<unknown> = {};

  const promises: Promise<void>[] = [];

  for (const whereKey of iterateOwnKeys(payMethodWhere)) {
    switch (whereKey) {
      case "id":
        {
          const result = whereTreeId(
            payMethodWhere[whereKey],
            async (rangeOp, id) => {
              const result: ObjectId[] =
                rangeOp === "gte" || rangeOp === "lte" ? [id] : [];

              switch (rangeOp) {
                case "gt":
                case "gte":
                  {
                    type Doc = {
                      parent: ObjectId;
                    };
                    let { parent } = await db
                      .collection<Doc>("paymentMethods")
                      .findOne(
                        {
                          _id: new ObjectId(id),
                        },
                        {
                          projection: {
                            parent: true,
                          },
                        }
                      );

                    while (parent) {
                      result.push(parent);

                      ({ parent } = await db
                        .collection<Doc>("paymentMethods")
                        .findOne(
                          {
                            _id: parent,
                          },
                          {
                            projection: {
                              parent: true,
                            },
                          }
                        ));
                    }
                  }
                  break;
                case "lt":
                case "lte":
                  {
                    type Doc = {
                      _id: ObjectId;
                    };

                    const query: ObjectId[] = (
                      await db
                        .collection<Doc>("paymentMethods")
                        .find(
                          {
                            parent: new ObjectId(id),
                          },
                          {
                            projection: {
                              _id: true,
                            },
                          }
                        )
                        .toArray()
                    ).map(({ _id }) => _id);

                    while (query.length) {
                      result.push(...query);

                      query.push(
                        ...(
                          await db
                            .collection<Doc>("paymentMethods")
                            .find(
                              {
                                parent: {
                                  $in: query.splice(0),
                                },
                              },
                              {
                                projection: {
                                  _id: true,
                                },
                              }
                            )
                            .toArray()
                        ).map(({ _id }) => _id)
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
      case "active":
        filterQuery["active.0.value"] = payMethodWhere[whereKey];
        break;
      case "name":
        filterQuery["name.0.value"] = whereRegex(payMethodWhere[whereKey]);
        break;
      case "parent":
        filterQuery["parent"] = whereId(payMethodWhere[whereKey]);
        break;
      case "allowChildren":
        filterQuery["allowChildren"] = payMethodWhere[whereKey];
        break;
      case "and":
        {
          let hasPromise = false;
          const $and: (
            | FilterQuery<unknown>
            | Promise<FilterQuery<unknown>>
          )[] = payMethodWhere[whereKey].map((where) => {
            const result = wherePaymentMethods(where, db);
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
          const $or: (
            | FilterQuery<unknown>
            | Promise<FilterQuery<unknown>>
          )[] = payMethodWhere[whereKey].map((where) => {
            const result = wherePaymentMethods(where, db);
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
          const $nor: (
            | FilterQuery<unknown>
            | Promise<FilterQuery<unknown>>
          )[] = payMethodWhere[whereKey].map((where) => {
            const result = wherePaymentMethods(where, db);
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
    }
  }

  if (promises.length) {
    return Promise.all(promises).then(() => filterQuery);
  }

  return filterQuery;
};

export const paymentMethods: QueryResolvers["paymentMethods"] = (
  _,
  { where },
  { db }
) => {
  const query = where ? wherePaymentMethods(where, db) : {};

  if (query instanceof Promise) {
    return query.then((query) =>
      db.collection("paymentMethods").find(query, { projection }).toArray()
    );
  }

  return db.collection("paymentMethods").find(query, { projection }).toArray();
};
