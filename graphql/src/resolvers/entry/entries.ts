import { Db, Filter as FilterQuery, ObjectId } from "mongodb";

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
import { EntryDbRecord } from "../../dataSources/accountingDb/types";
import { Context } from "../../types";

const refundDateOfRecordCondition = (
  $and: FilterQuery<unknown>[],
  dateLetVar = "date"
) => ({
  $expr: {
    $let: {
      vars: {
        // Grab refunds or provided default
        refunds: { $ifNull: ["$refunds", []] },
      },
      in: {
        // Loop over refunds and check conditions
        $reduce: {
          input: {
            // Ensure $$refunds is an array
            $cond: [{ $isArray: "$$refunds" }, "$$refunds", ["$$refunds"]],
          },
          initialValue: false,
          in: {
            $cond: [
              "$$value",
              // Short circuit on "true" condition
              true,
              // Perform condition check
              {
                $let: {
                  vars: {
                    // dateOfRecord or fallback to date.
                    [dateLetVar]: {
                      $ifNull: [
                        {
                          $arrayElemAt: ["$$this.dateOfRecord.date.value", 0],
                        },
                        {
                          $arrayElemAt: ["$$this.date.value", 0],
                        },
                      ],
                    },
                  },
                  in: {
                    $and,
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
});

export const whereEntryRefunds = (
  entryRefundsWhere: EntryRefundsWhere,
  db: Db,
  filterQuery: FilterQuery<any> = {}
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
      case "dateOfRecord":
        for (const dateOfRecordKey of iterateOwnKeys(
          entryRefundsWhere[whereKey]
        )) {
          switch (dateOfRecordKey) {
            case "date":
              {
                const $and: unknown[] = [];

                for (const [op, value] of iterateOwnKeyValues(
                  whereDate(entryRefundsWhere[whereKey][dateOfRecordKey])
                )) {
                  $and.push({
                    [op]: ["$$date", value],
                  });
                }

                if (!("$and" in filterQuery)) {
                  filterQuery.$and = [];
                }

                // Note: "dateOfRecord" falls back to "date".
                filterQuery.$and.push(
                  refundDateOfRecordCondition($and, "date")
                );
              }
              break;
            case "overrideFiscalYear":
              filterQuery["refunds.dateOfRecord.overrideFiscalYear.0.value"] =
                entryRefundsWhere[whereKey][dateOfRecordKey];
              break;
          }
        }
        break;
      case "fiscalYear":
        promises.push(
          (async () => {
            const fiscalYearsQuery = whereFiscalYear(
              entryRefundsWhere[whereKey]
            );

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

            const $and: FilterQuery<unknown>[] = [];

            for (const { begin, end } of fiscalYears) {
              $and.push(
                {
                  $gte: ["$$date", begin],
                },
                {
                  $lt: ["$$date", end],
                }
              );
            }

            if (!("$and" in filterQuery)) {
              filterQuery.$and = [];
            }
            filterQuery.$and.push(refundDateOfRecordCondition($and, "date"));
          })()
        );
        break;
      case "total":
        if (!("$and" in filterQuery)) {
          filterQuery.$and = [];
        }
        filterQuery.$and.push(
          ...whereRational(
            {
              $let: {
                vars: {
                  lhs: {
                    $reduce: {
                      input: {
                        $ifNull: ["$refunds", []],
                      },
                      initialValue: [],
                      in: {
                        $concatArrays: [
                          "$$value",
                          [
                            {
                              $arrayElemAt: ["$$this.total.value", 0],
                            },
                          ],
                        ],
                      },
                    },
                  },
                },
                in: {
                  $cond: [
                    { $gt: [{ $size: "$$lhs" }, 0] },
                    "$$lhs",
                    {
                      s: 1,
                      n: 0,
                      d: 1,
                    },
                  ],
                },
              },
            },
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
  filterQuery: FilterQuery<any> = {}
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
          ...whereRational(
            {
              field: "items.total.value",
              elemIndex: 0,
              defaultValue: {
                s: 1,
                n: 0,
                d: 1,
              },
            },
            itemRefundsWhere[whereKey]
          )
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

export const whereEntries = (
  entriesWhere: EntriesWhere,
  db: Db,
  {
    excludeWhereRefunds = false,
  }: {
    excludeWhereRefunds?: boolean;
  } = {}
) => {
  const filterQuery: FilterQuery<any> = {};

  const promises: Promise<void | unknown>[] = [];

  for (const whereKey of iterateOwnKeys(entriesWhere)) {
    switch (whereKey) {
      case "id":
        filterQuery["_id"] = whereId(entriesWhere[whereKey]);
        break;
      case "refunds":
        if (!excludeWhereRefunds) {
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
                const $and: unknown[] = [];

                for (const [op, value] of iterateOwnKeyValues(
                  whereDate(entriesWhere[whereKey][dateOfRecordKey])
                )) {
                  $and.push({
                    [op]: ["$$date", value],
                  });
                }

                if (!("$and" in filterQuery)) {
                  filterQuery.$and = [];
                }

                filterQuery.$and.push({
                  $expr: {
                    $let: {
                      vars: {
                        // Get dateOfRecord or fallback to date
                        date: {
                          $ifNull: [
                            {
                              $arrayElemAt: ["$dateOfRecord.date.value", 0],
                            },
                            {
                              $arrayElemAt: ["$date.value", 0],
                            },
                          ],
                        },
                      },
                      in: {
                        $and,
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

            if (dateOr.length > 0) {
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
            } else {
              filterQuery.$and.push({ _id: { $in: [] } });
            }
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
      case "paymentMethodType":
        // Maps "CARD", "CHECK" (Enum) to "Card", "Check" (DB)
        const type = entriesWhere[whereKey];
        if (type) {
          // Simple TitleCase conversion
          const dbType = type.charAt(0) + type.slice(1).toLowerCase();
          filterQuery["paymentMethod.type"] = dbType;
        }
        break;
      case "total":
        if (!("$and" in filterQuery)) {
          filterQuery.$and = [];
        }
        filterQuery.$and.push(
          ...whereRational(
            { $arrayElemAt: ["$total.value", 0] },
            entriesWhere[whereKey]
          )
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
      case "hasRefunds":
        if (entriesWhere[whereKey] === true) {
          filterQuery["refunds"] = { $exists: true, $ne: [], $type: "array" };
          filterQuery["refunds.0"] = { $exists: true };
        } else if (entriesWhere[whereKey] === false) {
          filterQuery["$or"] = [
            { "refunds": { $exists: false } },
            { "refunds": { $size: 0 } },
            { "refunds": [] }
          ];
        }
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
                if ($and.length > 0) {
                  if (!("$and" in filterQuery)) {
                    filterQuery.$and = [];
                  }
                  filterQuery.$and.push(...$and);
                }
              })
            );
          } else {
            if ($and.length > 0) {
              if (!("$and" in filterQuery)) {
                filterQuery.$and = [];
              }
              filterQuery.$and.push(...($and as FilterQuery<unknown>[]));
            }
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
                if ($or.length > 0) {
                  if (!("$or" in filterQuery)) {
                    filterQuery.$or = [];
                  }
                  filterQuery.$or.push(...$or);
                }
              })
            );
          } else {
            if ($or.length > 0) {
              if (!("$or" in filterQuery)) {
                filterQuery.$or = [];
              }
              filterQuery.$or.push(...($or as FilterQuery<unknown>[]));
            }
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
                if ($nor.length > 0) {
                  if (!("$nor" in filterQuery)) {
                    filterQuery.$nor = [];
                  }
                  filterQuery.$nor.push(...$nor);
                }
              })
            );
          } else {
            if ($nor.length > 0) {
              if (!("$nor" in filterQuery)) {
                filterQuery.$nor = [];
              }
              filterQuery.$nor.push(...($nor as FilterQuery<unknown>[]));
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

export const entries: QueryResolvers["entries"] = async (
  _,
  { where, filterRefunds, limit = 50, offset = 0 },
  context
) => {
  const { dataSources: { accountingDb }, authService, user } = context as Context;

  const pipeline: object[] = [];

  if (authService && user?.id) {
    const authUser = await authService.getUserById(user.id);

    if (authUser && authUser.role !== "SUPER_ADMIN") {
      const accessibleDeptIds = await authService.getAccessibleDepartmentIds(user.id);

      if (accessibleDeptIds.length === 0) {
        return [];
      }

      const allAccessibleIds = new Set<string>();
      for (const deptId of accessibleDeptIds) {
        allAccessibleIds.add(deptId.toString());

        const descendants = await getDescendantDeptIds(deptId, accountingDb.db);
        descendants.forEach((id) => allAccessibleIds.add(id.toString()));
      }

      const permittedDeptIds = Array.from(allAccessibleIds).map((id) => new ObjectId(id));

      pipeline.push({
        $match: {
          "department.0.value": { $in: permittedDeptIds },
        },
      });
    }
  }

  if (where) {
    pipeline.push({
      $match: await whereEntries(where, accountingDb.db),
    });

    if (filterRefunds) {
      const matchRefunds = await whereEntries(where, accountingDb.db, {
        excludeWhereRefunds: true,
      });

      pipeline.push(
        {
          $facet: {
            all: [
              {
                $project: { refunds: false },
              },
            ],
            refunds: [
              { $unwind: "$refunds" },
              {
                $replaceRoot: {
                  newRoot: { $mergeObjects: ["$$CURRENT", "$refunds"] },
                },
              },
              {
                $match: matchRefunds,
              },
              {
                $group: { _id: "$_id", refunds: { $push: "$refunds" } },
              },
            ],
          },
        },
        {
          $project: {
            all: { $concatArrays: ["$all", "$refunds"] },
          },
        },
        { $unwind: "$all" },
        { $group: { _id: "$all._id", docs: { $push: "$all" } } },
        { $replaceRoot: { newRoot: { $mergeObjects: "$docs" } } }
      );
    }
  }

  if (where) {
    // Determine sort order based on input (default to date desc)
    // Note: If 'where' contains date range, we might want to ensure sort matches index
  }

  // Always sort by date desc for consistent pagination
  pipeline.push({ $sort: { "date.0.value": -1 } });

  if (offset > 0) {
    pipeline.push({ $skip: offset });
  }

  // Safe limit - 0 means no limit (for Dashboard aggregations)
  if (limit !== 0) {
    const safeLimit = Math.min(Math.max(limit, 1), 1000);
    pipeline.push({ $limit: safeLimit });
  }

  return accountingDb
    .getCollection("entries")
    .aggregate<EntryDbRecord>(pipeline)
    .toArray();
};

async function getDescendantDeptIds(parentId: ObjectId, db: Db): Promise<ObjectId[]> {
  const descendants: ObjectId[] = [];
  const queue: ObjectId[] = [parentId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = await db
      .collection("departments")
      .find({ "parent.type": "Department", "parent.id": currentId }, { projection: { _id: 1 } })
      .toArray();

    for (const child of children) {
      descendants.push(child._id);
      queue.push(child._id);
    }
  }

  return descendants;
}

export const searchEntries: QueryResolvers["searchEntries"] = async (
  _,
  { query, limit = 50 },
  context
) => {
  const { dataSources: { accountingDb }, authService, user } = context as Context;
  const db = accountingDb.db;

  if (!query || query.trim().length === 0) {
    return [];
  }

  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i"); // Safe, Case-insensitive

  // 1. Find matching Departments and Categories first
  const [matchingDepts, matchingCats] = await Promise.all([
    db.collection("departments").find({ name: regex }, { projection: { _id: 1 } }).toArray(),
    db.collection("categories").find({ name: regex }, { projection: { _id: 1 } }).toArray(),
  ]);

  const deptIds = matchingDepts.map(d => d._id);
  const catIds = matchingCats.map(c => c._id);

  // 2. Build Base Query
  const searchFilter: any = {
    $or: [
      { "description.0.value": regex },
      ...(deptIds.length > 0 ? [{ "department.0.value": { $in: deptIds } }] : []),
      ...(catIds.length > 0 ? [{ "category.0.value": { $in: catIds } }] : []),
      // Attempt to match amount if query looks like a number?
      // For now, keep it text-based as per plan.
    ],
    // Ensure deleted entries are excluded
    "deleted.0.value": false,
  };

  // 3. Apply Permissions (same as 'entries' resolver)
  const pipeline: any[] = [];

  if (authService && user?.id) {
    const authUser = await authService.getUserById(user.id);
    if (authUser && authUser.role !== "SUPER_ADMIN") {
      const accessibleDeptIds = await authService.getAccessibleDepartmentIds(user.id);
      if (accessibleDeptIds.length === 0) return [];

      const allAccessibleIds = new Set<string>();
      for (const deptId of accessibleDeptIds) {
        allAccessibleIds.add(deptId.toString());
        const descendants = await getDescendantDeptIds(deptId, db);
        descendants.forEach((id) => allAccessibleIds.add(id.toString()));
      }
      const permittedDeptIds = Array.from(allAccessibleIds).map((id) => new ObjectId(id));

      pipeline.push({
        $match: { "department.0.value": { $in: permittedDeptIds } }
      });
    }
  }

  pipeline.push({ $match: searchFilter });

  // Sort by date desc (most recent first)
  pipeline.push({ $sort: { "date.0.value": -1 } });
  pipeline.push({ $limit: limit });

  return accountingDb.getCollection("entries").aggregate<EntryDbRecord>(pipeline).toArray();
};

export const entriesCount: QueryResolvers["entriesCount"] = async (
  _,
  { where, filterRefunds },
  context
) => {
  const { dataSources: { accountingDb }, authService, user } = context as Context;
  const db = accountingDb.db;

  // Reuse the logic from entries resolver for permissions and where clause
  // We'll simplisticly assume count follows same rules but without complex pipeline if possible
  // However, entries resolver uses aggregation for some things (like refund filtering).
  // For basic count, filterRefunds might be complex.
  // Standard 'entries' pipeline returns documents.
  // We can convert the pipeline to a count aggregation.

  const pipeline: any[] = [];

  if (authService && user?.id) {
    const authUser = await authService.getUserById(user.id);

    if (authUser && authUser.role !== "SUPER_ADMIN") {
      const accessibleDeptIds = await authService.getAccessibleDepartmentIds(user.id);

      if (accessibleDeptIds.length === 0) {
        return 0;
      }

      const allAccessibleIds = new Set<string>();
      for (const deptId of accessibleDeptIds) {
        allAccessibleIds.add(deptId.toString());

        const descendants = await getDescendantDeptIds(deptId, accountingDb.db);
        descendants.forEach((id) => allAccessibleIds.add(id.toString()));
      }

      const permittedDeptIds = Array.from(allAccessibleIds).map((id) => new ObjectId(id));

      pipeline.push({
        $match: {
          "department.0.value": { $in: permittedDeptIds },
        },
      });
    }
  }

  if (where) {
    pipeline.push({
      $match: await whereEntries(where, accountingDb.db),
    });

    if (filterRefunds) {
      // Only if filtering *by* refunds or excluding them?
      // Logic copied from entries resolver lines 978+
      const matchRefunds = await whereEntries(where, accountingDb.db, {
        excludeWhereRefunds: true,
      });

      pipeline.push(
        {
          $facet: {
            all: [
              {
                $project: { refunds: false },
              },
            ],
            refunds: [
              { $unwind: "$refunds" },
              {
                $replaceRoot: {
                  newRoot: { $mergeObjects: ["$$CURRENT", "$refunds"] },
                },
              },
              {
                $match: matchRefunds,
              },
              {
                $group: { _id: "$_id", refunds: { $push: "$refunds" } },
              },
            ],
          },
        },
        {
          $project: {
            all: { $concatArrays: ["$all", "$refunds"] },
          },
        },
        { $unwind: "$all" },
        { $group: { _id: "$all._id", docs: { $push: "$all" } } },
        { $replaceRoot: { newRoot: { $mergeObjects: "$docs" } } }
      );
    }
  }

  pipeline.push({ $count: "count" });

  const result = await accountingDb.getCollection("entries").aggregate(pipeline).toArray();
  return result.length > 0 ? result[0].count : 0;
};

export const entriesSummary: QueryResolvers["entriesSummary"] = async (
  _,
  { where },
  context
) => {
  const { dataSources: { accountingDb }, authService, user } = context as Context;

  // Reuse the logic from entries resolver for permissions and where clause
  const pipeline: any[] = [];

  if (authService && user?.id) {
    const authUser = await authService.getUserById(user.id);

    if (authUser && authUser.role !== "SUPER_ADMIN") {
      const accessibleDeptIds = await authService.getAccessibleDepartmentIds(user.id);

      if (accessibleDeptIds.length === 0) {
        return { count: 0, balance: 0 };
      }

      const allAccessibleIds = new Set<string>();
      for (const deptId of accessibleDeptIds) {
        allAccessibleIds.add(deptId.toString());

        const descendants = await getDescendantDeptIds(deptId, accountingDb.db);
        descendants.forEach((id) => allAccessibleIds.add(id.toString()));
      }

      const permittedDeptIds = Array.from(allAccessibleIds).map((id) => new ObjectId(id));

      pipeline.push({
        $match: {
          "department.0.value": { $in: permittedDeptIds },
        },
      });
    }
  }

  if (where) {
    pipeline.push({
      $match: await whereEntries(where, accountingDb.db),
    });
    // Note: entriesSummary ignores filterRefunds for simplicity and alignment with request (Total Transactions/Balance of main list)
    // If we need to account for refunds, we would need to replicate the complex facet logic from 'entries' resolver.
    // However, usually balance is sum of entries. Refunds are contained WITHIN entries or are separate?
    // In this app, refunds are sub-documents of entries.
    // The "Balance" usually implies the sum of the entries' totals.
    // Refund logic determines if we are looking at *just* refunds.
    // If 'Show Transactions with Refunds' (showMatchingOnly) is off, we show entries.
    // If it's on, we show entries with refunds.
    // The prompt says "Total Transactions and Balance should reflect the total numbers and amount for the Dept and Subdepartment selected and not based on pagination."
    // It implies adhering to the current filters.
    // But 'entries' query logic for refunds is complex.
    // For now, I will stick to summing the Entry totals.
    // If the user wants net balance (Entry - Refunds), that's harder.
    // Client-side code was: `row.total`.
    // Client-side `rows` contained *Refunds* as separate rows when expanded or matching.
    // Standard view: just entries.
    // So summing Entry totals is correct for standard view.
    // If 'where' filters by attributes, it filters entries.
  }

  pipeline.push({
    $group: {
      _id: null,
      count: { $sum: 1 },
      balance: {
        $sum: {
          $let: {
            vars: {
              t: { $arrayElemAt: ["$total.value", 0] }
            },
            in: {
              $multiply: [
                {
                  $cond: [
                    { $eq: ["$$t.d", 0] },
                    0,
                    { $divide: ["$$t.n", "$$t.d"] }
                  ]
                },
                "$$t.s"
              ]
            }
          }
        }
      }
    }
  });

  const result = await accountingDb.getCollection("entries").aggregate(pipeline).toArray();
  if (result.length > 0) {
    return {
      count: result[0].count,
      balance: result[0].balance
    };
  }
  return { count: 0, balance: 0 };
};
