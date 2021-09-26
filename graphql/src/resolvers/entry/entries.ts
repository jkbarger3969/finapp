import { Db, FilterQuery, ObjectId } from "mongodb";

import {
  QueryResolvers,
  EntriesWhere,
  EntryRefundsWhere,
  EntryItemsWhere,
} from "../../graphTypes";
import { iterateOwnKeys, iterateOwnKeyValues } from "../../utils/iterableFns";
import {
  whereDate,
  whereId,
  whereInt,
  whereRational,
  whereRegex,
} from "../utils/queryUtils";
import { whereDepartments } from "../department/departments";
import { whereCategories } from "../category";
import { whereBusiness } from "../business";
import { wherePeople } from "../person/people";
import { whereFiscalYear, FiscalYearDbRecord } from "../fiscalYear";

export const whereEntryRefunds = (
  entryRefundsWhere: EntryRefundsWhere,
  db: Db,
  filterQuery: FilterQuery<unknown> = {}
) => {
  const promises: Promise<void>[] = [];

  for (const whereKey of iterateOwnKeys(entryRefundsWhere)) {
    switch (whereKey) {
      case "id":
        filterQuery["refunds.id"] = whereId(entryRefundsWhere[whereKey]);
        break;
      case "date":
        filterQuery["refunds.date.0.value"] = whereDate(
          entryRefundsWhere[whereKey]
        );
        break;
      case "entry": {
        if (!("$and" in filterQuery)) {
          filterQuery.$and = [];
        }
        const result = whereEntries(entryRefundsWhere[whereKey], db);

        if (result instanceof Promise) {
          promises.push(
            result.then((result) => {
              filterQuery.$and.push(result);
            })
          );
        } else {
          filterQuery.$and.push(result);
        }

        break;
      }
      case "total":
        if (!("$and" in filterQuery)) {
          filterQuery.$and = [];
        }
        filterQuery.$and.push(
          ...whereRational(
            ["refunds.total.value", 0],
            entryRefundsWhere[whereKey]
          )
        );
        break;
      case "reconciled":
        filterQuery["refunds.reconciled.0.value"] = entryRefundsWhere[whereKey];
        break;
      case "lastUpdate":
        filterQuery["refunds.lastUpdate"] = whereDate(
          entryRefundsWhere[whereKey]
        );
        break;
      case "deleted":
        filterQuery["refunds.deleted.0.value"] = entryRefundsWhere[whereKey];
        break;
      case "and":
        {
          let hasPromise = false;
          const $and: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            entryRefundsWhere[whereKey].map((where) => {
              const result = whereEntryRefunds(where, db);
              if (result instanceof Promise) {
                hasPromise = true;
              }
              return result;
            });

          if (hasPromise) {
            promises.push(
              Promise.all($and).then(($and) => {
                if (!("$and" in filterQuery)) {
                  filterQuery.$and = [];
                }
                filterQuery.$and.push(...$and);
              })
            );
          } else {
            if (!("$and" in filterQuery)) {
              filterQuery.$and = [];
            }
            filterQuery.$and.push(...($and as FilterQuery<unknown>[]));
          }
        }
        break;
      case "or":
        {
          let hasPromise = false;
          const $or: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            entryRefundsWhere[whereKey].map((where) => {
              const result = whereEntryRefunds(where, db);
              if (result instanceof Promise) {
                hasPromise = true;
              }
              return result;
            });

          if (hasPromise) {
            promises.push(
              Promise.all($or).then(($or) => {
                if (!("$or" in filterQuery)) {
                  filterQuery.$or = [];
                }
                filterQuery.$or.push(...$or);
              })
            );
          } else {
            if (!("$or" in filterQuery)) {
              filterQuery.$or = [];
            }
            filterQuery.$or.push(...($or as FilterQuery<unknown>[]));
          }
        }
        break;
      case "nor":
        {
          let hasPromise = false;
          const $nor: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            entryRefundsWhere[whereKey].map((where) => {
              const result = whereEntryRefunds(where, db);
              if (result instanceof Promise) {
                hasPromise = true;
              }
              return result;
            });

          if (hasPromise) {
            promises.push(
              Promise.all($nor).then(($nor) => {
                if (!("$nor" in filterQuery)) {
                  filterQuery.$nor = [];
                }
                filterQuery.$nor.push(...$nor);
              })
            );
          } else {
            if (!("$nor" in filterQuery)) {
              filterQuery.$nor = [];
            }
            filterQuery.$nor.push(...($nor as FilterQuery<unknown>[]));
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

export const whereEntryItems = (
  itemRefundsWhere: EntryItemsWhere,
  db: Db,
  filterQuery: FilterQuery<unknown> = {}
) => {
  const promises: Promise<void>[] = [];

  for (const whereKey of iterateOwnKeys(itemRefundsWhere)) {
    switch (whereKey) {
      case "id":
        filterQuery["items.id"] = whereId(itemRefundsWhere[whereKey]);
        break;
      case "department":
        promises.push(
          (async () => {
            const result = whereDepartments(itemRefundsWhere[whereKey], db);
            const query = result instanceof Promise ? await result : result;
            filterQuery["items.department.0.value"] = {
              $in: (
                await db
                  .collection<{
                    _id: ObjectId;
                  }>("departments")
                  .find(query, {
                    projection: {
                      _id: true,
                    },
                  })
                  .toArray()
              ).map(({ _id }) => _id),
            };
          })()
        );
        break;
      case "category":
        promises.push(
          (async () => {
            const result = whereCategories(itemRefundsWhere[whereKey], db);
            const query = result instanceof Promise ? await result : result;
            filterQuery["items.category.0.value"] = {
              $in: (
                await db
                  .collection<{
                    _id: ObjectId;
                  }>("categories")
                  .find(query, {
                    projection: {
                      _id: true,
                    },
                  })
                  .toArray()
              ).map(({ _id }) => _id),
            };
          })()
        );
        break;
      case "units":
        filterQuery["items.units.0.value"] = whereInt(
          itemRefundsWhere[whereKey]
        );
        break;
      case "total":
        if (!("$and" in filterQuery)) {
          filterQuery.$and = [];
        }
        filterQuery.$and.push(
          ...whereRational(["items.total.value", 0], itemRefundsWhere[whereKey])
        );
        break;
      case "lastUpdate":
        filterQuery["items.lastUpdate"] = whereDate(itemRefundsWhere[whereKey]);
        break;
      case "deleted":
        filterQuery["items.deleted.0.value"] = itemRefundsWhere[whereKey];
        break;
      case "and":
        {
          let hasPromise = false;
          const $and: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            itemRefundsWhere[whereKey].map((where) => {
              const result = whereEntryItems(where, db);
              if (result instanceof Promise) {
                hasPromise = true;
              }
              return result;
            });

          if (hasPromise) {
            promises.push(
              Promise.all($and).then(($and) => {
                if (!("$and" in filterQuery)) {
                  filterQuery.$and = [];
                }
                filterQuery.$and.push(...$and);
              })
            );
          } else {
            if (!("$and" in filterQuery)) {
              filterQuery.$and = [];
            }
            filterQuery.$and.push(...($and as FilterQuery<unknown>[]));
          }
        }
        break;
      case "or":
        {
          let hasPromise = false;
          const $or: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            itemRefundsWhere[whereKey].map((where) => {
              const result = whereEntryItems(where, db);
              if (result instanceof Promise) {
                hasPromise = true;
              }
              return result;
            });

          if (hasPromise) {
            promises.push(
              Promise.all($or).then(($or) => {
                if (!("$or" in filterQuery)) {
                  filterQuery.$or = [];
                }
                filterQuery.$or.push(...$or);
              })
            );
          } else {
            if (!("$or" in filterQuery)) {
              filterQuery.$or = [];
            }
            filterQuery.$or.push(...($or as FilterQuery<unknown>[]));
          }
        }
        break;
      case "nor":
        {
          let hasPromise = false;
          const $nor: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            itemRefundsWhere[whereKey].map((where) => {
              const result = whereEntryItems(where, db);
              if (result instanceof Promise) {
                hasPromise = true;
              }
              return result;
            });

          if (hasPromise) {
            promises.push(
              Promise.all($nor).then(($nor) => {
                if (!("$nor" in filterQuery)) {
                  filterQuery.$nor = [];
                }
                filterQuery.$nor.push(...$nor);
              })
            );
          } else {
            if (!("$nor" in filterQuery)) {
              filterQuery.$nor = [];
            }
            filterQuery.$nor.push(...($nor as FilterQuery<unknown>[]));
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

export const whereEntries = (entriesWhere: EntriesWhere, db: Db) => {
  const filterQuery: FilterQuery<unknown> = {};

  const promises: Promise<void | unknown>[] = [];

  for (const whereKey of iterateOwnKeys(entriesWhere)) {
    switch (whereKey) {
      case "id":
        filterQuery["_id"] = whereId(entriesWhere[whereKey]);
        break;
      case "refunds":
        {
          const result = whereEntryRefunds(
            entriesWhere[whereKey],
            db,
            filterQuery
          );
          if (result instanceof Promise) {
            promises.push(result);
          }
        }
        break;
      case "items":
        {
          const result = whereEntryItems(
            entriesWhere[whereKey],
            db,
            filterQuery
          );
          if (result instanceof Promise) {
            promises.push(result);
          }
        }
        break;
      case "date":
        filterQuery["date.0.value"] = whereDate(entriesWhere[whereKey]);
        break;
      case "dateOfRecord":
        for (const dateOfRecordKey of iterateOwnKeys(entriesWhere[whereKey])) {
          switch (dateOfRecordKey) {
            case "date":
              {
                const dateOfRecordAnd: unknown[] = [];
                const dateAnd: unknown[] = [];

                for (const [op, value] of iterateOwnKeyValues(
                  whereDate(entriesWhere[whereKey][dateOfRecordKey])
                )) {
                  dateOfRecordAnd.push({
                    [op]: [
                      { $arrayElemAt: ["$dateOfRecord.date.value", 0] },
                      value,
                    ],
                  });
                  dateAnd.push({
                    [op]: [{ $arrayElemAt: ["$date.value", 0] }, value],
                  });
                }

                if (!("$and" in filterQuery)) {
                  filterQuery.$and = [];
                }

                filterQuery.$and.push({
                  $expr: {
                    $cond: {
                      if: {
                        $ne: [{ $type: "$dateOfRecord.date.value" }, "missing"],
                      },
                      then: {
                        $and: dateOfRecordAnd,
                      },
                      else: {
                        $and: dateAnd,
                      },
                    },
                  },
                });
              }
              break;
            case "overrideFiscalYear":
              filterQuery["dateOfRecord.overrideFiscalYear.0.value"] =
                entriesWhere[whereKey][dateOfRecordKey];
              break;
          }
        }
        break;
      case "department":
        promises.push(
          (async () => {
            const result = whereDepartments(entriesWhere[whereKey], db);
            const query = result instanceof Promise ? await result : result;
            filterQuery["department.0.value"] = {
              $in: (
                await db
                  .collection<{
                    _id: ObjectId;
                  }>("departments")
                  .find(query, {
                    projection: {
                      _id: true,
                    },
                  })
                  .toArray()
              ).map(({ _id }) => _id),
            };
          })()
        );
        break;
      case "fiscalYear":
        promises.push(
          (async () => {
            const fiscalYearsQuery = whereFiscalYear(entriesWhere[whereKey]);

            const fiscalYears = await db
              .collection<Pick<FiscalYearDbRecord, "end" | "begin">>(
                "fiscalYears"
              )
              .find(fiscalYearsQuery, {
                projection: {
                  begin: true,
                  end: true,
                },
              })
              .toArray();

            const dateOr: FilterQuery<unknown>[] = [];
            const dateOfRecordOr: FilterQuery<unknown>[] = [];

            for (const { begin, end } of fiscalYears) {
              dateOr.push({
                "date.0.value": {
                  $gte: begin,
                  $lt: end,
                },
              });

              dateOfRecordOr.push({
                "dateOfRecord.date.0.value": {
                  $gte: begin,
                  $lt: end,
                },
              });
            }

            if (!("$and" in filterQuery)) {
              filterQuery.$and = [];
            }

            filterQuery.$and.push({
              $or: [
                {
                  "dateOfRecord.overrideFiscalYear.0.value": { $ne: true },
                  $or: dateOr,
                },
                {
                  "dateOfRecord.overrideFiscalYear.0.value": true,
                  $or: dateOfRecordOr,
                },
              ],
            });
          })()
        );
        break;
      case "category":
        promises.push(
          (async () => {
            const result = whereCategories(entriesWhere[whereKey], db);
            const query = result instanceof Promise ? await result : result;
            filterQuery["category.0.value"] = {
              $in: (
                await db
                  .collection<{
                    _id: ObjectId;
                  }>("categories")
                  .find(query, {
                    projection: {
                      _id: true,
                    },
                  })
                  .toArray()
              ).map(({ _id }) => _id),
            };
          })()
        );
        break;

      case "description":
        filterQuery["description.0.value"] = whereRegex(entriesWhere[whereKey]);
        break;
      case "total":
        if (!("$and" in filterQuery)) {
          filterQuery.$and = [];
        }
        filterQuery.$and.push(
          ...whereRational(["total.value", 0], entriesWhere[whereKey])
        );
        break;
      case "source":
        for (const sourceKey of iterateOwnKeys(entriesWhere[whereKey])) {
          switch (sourceKey) {
            case "businesses":
              promises.push(
                (async () => {
                  const result = whereBusiness(
                    entriesWhere[whereKey][sourceKey]
                  );
                  const query =
                    result instanceof Promise ? await result : result;

                  if (!("$and" in filterQuery)) {
                    filterQuery.$and = [];
                  }

                  filterQuery.$and.push({
                    "source.0.value.type": "Business",
                    "source.0.value.id": {
                      $in: (
                        await db
                          .collection<{
                            _id: ObjectId;
                          }>("businesses")
                          .find(query, {
                            projection: {
                              _id: true,
                            },
                          })
                          .toArray()
                      ).map(({ _id }) => _id),
                    },
                  });
                })()
              );
              break;
            case "departments":
              promises.push(
                (async () => {
                  const result = whereDepartments(
                    entriesWhere[whereKey][sourceKey],
                    db
                  );
                  const query =
                    result instanceof Promise ? await result : result;

                  if (!("$and" in filterQuery)) {
                    filterQuery.$and = [];
                  }

                  filterQuery.$and.push({
                    "source.0.value.type": "Department",
                    "source.0.value.id": {
                      $in: (
                        await db
                          .collection<{
                            _id: ObjectId;
                          }>("departments")
                          .find(query, {
                            projection: {
                              _id: true,
                            },
                          })
                          .toArray()
                      ).map(({ _id }) => _id),
                    },
                  });
                })()
              );
              break;
            case "people":
              promises.push(
                (async () => {
                  const query = wherePeople(entriesWhere[whereKey][sourceKey]);

                  if (!("$and" in filterQuery)) {
                    filterQuery.$and = [];
                  }

                  filterQuery.$and.push({
                    "source.0.value.type": "Person",
                    "source.0.value.id": {
                      $in: (
                        await db
                          .collection<{
                            _id: ObjectId;
                          }>("people")
                          .find(query, {
                            projection: {
                              _id: true,
                            },
                          })
                          .toArray()
                      ).map(({ _id }) => _id),
                    },
                  });
                })()
              );
              break;
          }
        }
        break;
      case "reconciled":
        filterQuery["reconciled.0.value"] = entriesWhere[whereKey];
        break;
      case "lastUpdate":
        filterQuery["lastUpdate"] = whereDate(entriesWhere[whereKey]);
        break;
      case "deleted":
        filterQuery["deleted.0.value"] = entriesWhere[whereKey];
        break;
      case "and":
        {
          let hasPromise = false;
          const $and: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            entriesWhere[whereKey].map((where) => {
              const result = whereEntries(where, db);
              if (result instanceof Promise) {
                hasPromise = true;
              }
              return result;
            });

          if (hasPromise) {
            promises.push(
              Promise.all($and).then(($and) => {
                if (!("$and" in filterQuery)) {
                  filterQuery.$and = [];
                }
                filterQuery.$and.push(...$and);
              })
            );
          } else {
            if (!("$and" in filterQuery)) {
              filterQuery.$and = [];
            }
            filterQuery.$and.push(...($and as FilterQuery<unknown>[]));
          }
        }
        break;
      case "or":
        {
          let hasPromise = false;
          const $or: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            entriesWhere[whereKey].map((where) => {
              const result = whereEntries(where, db);
              if (result instanceof Promise) {
                hasPromise = true;
              }
              return result;
            });

          if (hasPromise) {
            promises.push(
              Promise.all($or).then(($or) => {
                if (!("$or" in filterQuery)) {
                  filterQuery.$or = [];
                }
                filterQuery.$or.push(...$or);
              })
            );
          } else {
            if (!("$or" in filterQuery)) {
              filterQuery.$or = [];
            }
            filterQuery.$or.push(...($or as FilterQuery<unknown>[]));
          }
        }
        break;
      case "nor":
        {
          let hasPromise = false;
          const $nor: (FilterQuery<unknown> | Promise<FilterQuery<unknown>>)[] =
            entriesWhere[whereKey].map((where) => {
              const result = whereEntries(where, db);
              if (result instanceof Promise) {
                hasPromise = true;
              }
              return result;
            });

          if (hasPromise) {
            promises.push(
              Promise.all($nor).then(($nor) => {
                if (!("$nor" in filterQuery)) {
                  filterQuery.$nor = [];
                }
                filterQuery.$nor.push(...$nor);
              })
            );
          } else {
            if (!("$nor" in filterQuery)) {
              filterQuery.$nor = [];
            }
            filterQuery.$nor.push(...($nor as FilterQuery<unknown>[]));
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

export const entries: QueryResolvers["entries"] = (_, { where }, { db }) => {
  const query = where ? whereEntries(where, db) : {};

  if (query instanceof Promise) {
    return query.then((query) =>
      db.collection("entries").find(query).toArray()
    );
  }

  return db.collection("entries").find(query).toArray();
};
