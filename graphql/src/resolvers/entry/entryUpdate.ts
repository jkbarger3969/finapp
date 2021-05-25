import { ObjectId } from "mongodb";
import { isValid } from "date-fns";

import {
  MutationResolvers,
  EntryUpdateFields,
  SourceType,
  EntryDateOfRecordUpdate,
  EntryType,
} from "../../graphTypes";
import DocHistory from "../utils/DocHistory";
import { getSrcCollectionAndNode, stages } from "./utils";
import { JOURNAL_ENTRY_UPDATED, JOURNAL_ENTRY_UPSERTED } from "./pubSubs";
import { addBusiness } from "../business";
import { addPerson } from "../person";
import { iterateOwnKeys, generatorInit } from "../../utils/iterableFns";
import {
  rationalComparison,
  addRational,
  Rational,
} from "../../utils/mongoRational";
import FilterQueryUtility from "../utils/FilterQueryUtility";

const NULLISH = Symbol();

const addDate = {
  $addFields: {
    ...DocHistory.getPresentValues(["date"]),
  },
} as const;

const entryUpdate: MutationResolvers["entryUpdate"] = (
  obj,
  args,
  context,
  info
) =>
  new Promise(async (resolve, reject) => {
    const { client, db, nodeMap, user, pubSub } = context;

    const session = context.ephemeral?.session || client.startSession();

    const resolver = generatorInit<never[], unknown>(function* () {
      try {
        // generatorInit calls 1st next. On 2nd next capture update doc
        const updatedDoc = yield;
        yield; // Pause
        // on 3rd next resolve with the update doc and run pubSubs
        resolve(updatedDoc);
        pubSub
          .publish(JOURNAL_ENTRY_UPDATED, {
            entryUpdated: updatedDoc,
          })
          .catch((error) => console.error(error));
        pubSub
          .publish(JOURNAL_ENTRY_UPSERTED, { entryUpserted: updatedDoc })
          .catch((error) => console.error(error));
      } catch (error) {
        // on throw reject with error.
        reject(error);
      }
    });

    const entryId = new ObjectId(args.id);

    try {
      await session.withTransaction(async () => {
        const {
          id,
          fields: {
            date,
            dateOfRecord,
            department: departmentId,
            type,
            category: categoryId,
            paymentMethod: paymentMethodId,
            source,
            description,
            total,
            reconciled,
          },
          personAdd,
          businessAdd,
        } = args;

        // "businessAdd" and "personAdd" are mutually exclusive, gql has
        // no concept of this.
        if (personAdd && businessAdd) {
          throw new Error(
            `"businessAdd" and "personAdd" are mutually exclusive source creation arguments.`
          );
        }

        const docHistory = new DocHistory(user.id);
        const updateBuilder = docHistory.updateHistoricalDoc();

        // Pre condition entry exists.
        const filterQuery = new FilterQueryUtility(
          "_id",
          entryId,
          `Journal entry "${id}" does not exist.`
        );

        // Date
        if (date) {
          if (!isValid(date)) {
            throw new Error(`Date "${date}" not a valid.`);
          }

          updateBuilder.updateField("date", date);

          // Validate against refund dates
          filterQuery.addCondition(
            "$expr",
            {
              $lte: [
                date,
                {
                  $reduce: {
                    input: {
                      $filter: {
                        input: "$refunds",
                        cond: {
                          $not: DocHistory.getPresentValueExpression(
                            "deleted",
                            {
                              asVar: "this",
                              defaultValue: true,
                            }
                          ),
                        },
                      },
                    },
                    initialValue: "$$NOW",
                    in: {
                      $min: [
                        "$$value",
                        DocHistory.getPresentValueExpression("date", {
                          asVar: "this",
                          defaultValue: "$$NOW",
                        }),
                      ],
                    },
                  },
                },
              ],
            },
            "Entry date can not be greater than the earliest refund date."
          );
        }

        // Date of Record
        if (dateOfRecord) {
          if (Object.keys(dateOfRecord).length === 0) {
            throw new Error(
              `Updating date of record requires one of the following fields: ${[
                ...iterateOwnKeys<Required<EntryDateOfRecordUpdate>>({
                  date: new Date(),
                  overrideFiscalYear: true,
                  clear: false,
                }),
              ].join(", ")}`
            );
          }

          const date = dateOfRecord?.date;

          if (dateOfRecord.clear) {
            filterQuery.addCondition(
              "$expr",
              {
                $ne: [
                  DocHistory.getPresentValueExpression("dateOfRecord.date", {
                    defaultValue: null,
                  }),
                  null,
                ],
              },
              "Date of record must NOT be null, to clear."
            );
            updateBuilder.updateField("dateOfRecord.date", null);
            updateBuilder.updateField("dateOfRecord.overrideFiscalYear", null);
          } else {
            // Ignore all dateOfRecord fields if clear is true

            if (date) {
              if (!isValid(date)) {
                throw new Error(`Date of record "${date}" not a valid.`);
              }
              updateBuilder.updateField("dateOfRecord.date", date);
            } else {
              filterQuery.addCondition(
                "$expr",
                {
                  $ne: [
                    DocHistory.getPresentValueExpression("dateOfRecord.date"),
                    null,
                  ],
                },
                "Date of record's date value is required."
              );
            }

            // overrideFiscalYear must already be set if other dateOfRecord fields.
            if ((dateOfRecord?.overrideFiscalYear ?? NULLISH) === NULLISH) {
              filterQuery.addCondition(
                "$expr",
                {
                  $ne: [
                    DocHistory.getPresentValueExpression(
                      "dateOfRecord.overrideFiscalYear"
                    ),
                    null,
                  ],
                },
                "Date of record's fiscal year override value is required."
              );
            } else {
              updateBuilder.updateField(
                "dateOfRecord.overrideFiscalYear",
                dateOfRecord.overrideFiscalYear
              );
            }
          }
        }

        // Type
        if ((type ?? NULLISH) !== NULLISH) {
          updateBuilder.updateField("type", type);
        }

        // Description
        if (description?.trim()) {
          updateBuilder.updateField("description", description);
        }

        // Total
        if (total) {
          if (total.s < 1 || total.n === 0) {
            throw new Error("Entry total must be greater than 0.");
          }

          updateBuilder.updateField("total", total);

          // Total cannot be less than refunds.
          filterQuery.addCondition(
            "$expr",
            {
              $let: {
                vars: {
                  totalRefunds: {
                    $reduce: {
                      input: {
                        $filter: {
                          input: "$refunds",
                          as: "refund",
                          cond: {
                            $not: DocHistory.getPresentValueExpression(
                              "deleted",
                              {
                                asVar: "refund",
                                defaultValue: true,
                              }
                            ),
                          },
                        },
                      },
                      initialValue: {
                        s: 1,
                        n: 0,
                        d: 1,
                      },
                      in: {
                        $let: {
                          vars: {
                            refundTotal: DocHistory.getPresentValueExpression(
                              "total",
                              {
                                asVar: "this",
                                defaultValue: {
                                  s: 1,
                                  n: 0,
                                  d: 1,
                                },
                              }
                            ),
                          },
                          in: addRational("$value", "$refundTotal"),
                        },
                      },
                    },
                  },
                },
                in: {
                  $cond: {
                    // Ensure refunds have a total greater than zero
                    if: {
                      $gt: ["$$totalRefunds.n", 0],
                    },
                    then: rationalComparison(
                      total as Rational,
                      "$gte",
                      "$totalRefunds"
                    ),
                    else: true,
                  },
                },
              },
            },
            "Entry total cannot be less than entry's total refunds."
          );

          // Total cannot be less than items.
          filterQuery.addCondition(
            "$expr",
            {
              $let: {
                vars: {
                  totalItems: {
                    $reduce: {
                      input: {
                        $filter: {
                          input: "$items",
                          as: "item",
                          cond: {
                            $not: DocHistory.getPresentValueExpression(
                              "deleted",
                              {
                                asVar: "item",
                                defaultValue: true,
                              }
                            ),
                          },
                        },
                      },
                      initialValue: {
                        s: 1,
                        n: 0,
                        d: 1,
                      },
                      in: {
                        $let: {
                          vars: {
                            itemTotal: DocHistory.getPresentValueExpression(
                              "total",
                              {
                                asVar: "this",
                                defaultValue: {
                                  s: 1,
                                  n: 0,
                                  d: 1,
                                },
                              }
                            ),
                          },
                          in: addRational("$value", "$itemTotal"),
                        },
                      },
                    },
                  },
                },
                in: {
                  $cond: {
                    // Ensure Items have a total greater than zero
                    if: {
                      $gt: ["$$totalItems.n", 0],
                    },
                    then: rationalComparison(
                      total as Rational,
                      "$gte",
                      "$totalItems"
                    ),
                    else: true,
                  },
                },
              },
            },
            "Entry total cannot be less than entry's total items."
          );
        }

        // Reconciled
        if ((reconciled ?? NULLISH) !== NULLISH) {
          updateBuilder.updateField("reconciled", reconciled);
        }

        // Async validation and new documents
        await Promise.allSettled([
          // Department
          (async () => {
            if (departmentId) {
              const { collection, id: node } = nodeMap.typename.get(
                "Department"
              );
              const id = new ObjectId(departmentId);

              if (
                0 ===
                (await db
                  .collection(collection)
                  .countDocuments({ _id: id }, { session }))
              ) {
                throw new Error(
                  `Department with id "${departmentId}" does not exist.`
                );
              }

              updateBuilder.updateField("department", {
                node: new ObjectId(node),
                id,
              });
            }
          })(),
          // Category
          (async () => {
            if (categoryId) {
              const { collection, id: node } = nodeMap.typename.get("Category");

              const id = new ObjectId(categoryId);

              const result = await db
                .collection(collection)
                .findOne<{ type: "credit" | "debit" }>(
                  { _id: id },
                  {
                    projection: {
                      type: true,
                    },
                  }
                );

              if (!result) {
                throw new Error(
                  `Category with id "${categoryId}" does not exist.`
                );
              }
              const catType =
                result.type === "credit" ? EntryType.Credit : EntryType.Debit;

              // Category must match transaction type.
              if ((type ?? NULLISH) === NULLISH) {
                filterQuery.addCondition(
                  "$expr",
                  {
                    $eq: [
                      DocHistory.getPresentValueExpression("type"),
                      result.type,
                    ],
                  },
                  `Category with id "${categoryId}" and type "${catType}" is incompatible with entry type "${
                    catType === EntryType.Credit
                      ? EntryType.Debit
                      : EntryType.Credit
                  }".`
                );
              } else {
                if (catType !== type) {
                  throw new Error(
                    `Category with id "${categoryId}" and type "${catType}" is incompatible with entry type "${type}".`
                  );
                }
              }

              updateBuilder.updateField("category", {
                node: new ObjectId(node),
                id,
              });
            }
          })(),
          // Source
          (async () => {
            if (businessAdd) {
              const { id } = await addBusiness(
                obj,
                { fields: businessAdd },
                { ...context, ephemeral: { session } },
                info
              );

              const { node } = getSrcCollectionAndNode(
                db,
                SourceType.Business,
                nodeMap
              );

              updateBuilder.updateField("source", {
                node,
                id: new ObjectId(id),
              });
            } else if (personAdd) {
              const { id } = await addPerson(
                obj,
                { fields: personAdd },
                { ...context, ephemeral: { session } },
                info
              );

              const { node } = getSrcCollectionAndNode(
                db,
                SourceType.Person,
                nodeMap
              );

              updateBuilder.updateField("source", {
                node,
                id: new ObjectId(id),
              });
            } else if (source) {
              const { id: sourceId, sourceType } = source;

              const { collection, node } = getSrcCollectionAndNode(
                db,
                sourceType,
                nodeMap
              );

              const id = new ObjectId(sourceId);

              if (
                0 ===
                (await collection.countDocuments({ _id: id }, { session }))
              ) {
                throw new Error(
                  `Source type "${sourceType}" with id "${sourceId}" does not exist.`
                );
              }

              updateBuilder.updateField("source", {
                node,
                id,
              });
            }
          })(),
          // Payment Method
          (async () => {})(),
        ]).then((results) => {
          const errorMsgs = results.reduce((errorMsgs, result) => {
            if (result.status === "rejected") {
              errorMsgs.push(
                result.reason instanceof Error
                  ? result.reason.message
                  : `${result.reason}`
              );
            }
            return errorMsgs;
          }, []);

          if (errorMsgs.length > 0) {
            return Promise.reject(new Error(errorMsgs.join("\n")));
          }
        });

        if (!updateBuilder.hasUpdate) {
          const keys = (() => {
            const obj: {
              [P in keyof Omit<EntryUpdateFields, "__typename">]-?: null;
            } = {
              date: null,
              dateOfRecord: null,
              department: null,
              type: null,
              category: null,
              paymentMethod: null,
              description: null,
              total: null,
              source: null,
              reconciled: null,
            };

            return Object.keys(obj);
          })();

          throw new Error(
            `Entry update requires at least one of the following fields: ${keys.join(
              ", "
            )}".`
          );
        }

        const updateFilter = filterQuery.filterQuery();

        const { modifiedCount, matchedCount } = await db
          .collection("journalEntries")
          .updateOne(updateFilter, { ...updateBuilder.update() }, { session });

        if (matchedCount === 0) {
          const reasons = await filterQuery.explainFailed(
            db.collection("journalEntries")
          );

          if (reasons.length > 0) {
            throw new Error(reasons.map((e) => e.message).join("\n"));
          } else {
            throw new Error(
              `Unknown Failure.  Failed to update entry: "${JSON.stringify(
                args
              )}".`
            );
          }
        }

        if (modifiedCount === 0) {
          throw new Error(`Failed to update entry: "${JSON.stringify(args)}".`);
        }

        const [updatedDoc] = await db
          .collection("journalEntries")
          .aggregate(
            [
              { $match: { _id: entryId } },
              stages.entryAddFields,
              stages.entryTransmutations,
            ],
            { session }
          )
          .toArray();

        resolver.next(updatedDoc);
      });
    } catch (e) {
      resolver.throw(e);
    } finally {
      resolver.next();
      session.endSession();
    }
  });

export default entryUpdate;
