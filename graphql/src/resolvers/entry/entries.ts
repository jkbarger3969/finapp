import { ObjectId } from "mongodb";

import { stages } from "./utils";
import {
  QueryResolvers,
  EntriesWhere as Where,
  EntriesWhereDepartment,
  EntriesWhereCategory,
  EntriesWherePaymentMethod,
  Entry,
  SourceType,
  EntriesWhereSource,
  EntriesWhereFiscalYear,
} from "../../graphTypes";
import { Context } from "../../types";

import filterQueryCreator, {
  FieldAndConditionGenerator,
  FieldAndCondition,
} from "../utils/filterQuery/filter";
import parseOps from "../utils/filterQuery/querySelectors/parseOps";
import parseComparisonOps from "../utils/filterQuery/querySelectors/parseComparisonOps";
import { OpsParser } from "../utils/filterQuery/querySelectors/types";
import dateOpsParser from "../utils/filterQuery/dateOpsParser";
import {
  iterateOwnKeyValues,
  resolveWithAsyncReturn,
} from "../../utils/iterableFns";
import gqlMongoRational from "../utils/filterQuery/gqlMongoRational";
import { comparisonOpsMapper } from "../utils/filterQuery/operatorMapping/comparison";
import DocHistory from "../utils/DocHistory";

const deptNode = new ObjectId("5dc4addacf96e166daaa008f");
const bizNode = new ObjectId("5dc476becf96e166daa9fd0b");
const personNode = new ObjectId("5dc476becf96e166daa9fd0a");
const categoryNode = new ObjectId("5e288fb9aa938a2bcfcdf9f9");

// Where condition parsing
// Where Department
const getDeptDescendentIds = async (
  id: ObjectId,
  context: Context
): Promise<ObjectId[]> => {
  const descendants: ObjectId[] = [];

  await Promise.all([
    ...(
      await context.db
        .collection("departments")
        .find<{ _id: ObjectId }>(
          {
            parent: {
              $eq: {
                id,
                node: deptNode,
              },
            },
          },
          { projection: { _id: true } }
        )
        .toArray()
    ).map(async ({ _id }) => {
      descendants.push(_id, ...(await getDeptDescendentIds(_id, context)));
    }),
  ]);

  return descendants;
};

const parseWhereEntryDept = async function* (
  opValues: IterableIterator<
    [
      keyof EntriesWhereDepartment,
      EntriesWhereDepartment[keyof EntriesWhereDepartment]
    ]
  >,
  context: Context
): AsyncIterableIterator<FieldAndCondition> {
  for (const [op, opVal] of opValues) {
    switch (op) {
      case "eq":
      case "in":
        if (opVal) {
          const $in: ObjectId[] = [];

          await Promise.all(
            (Array.isArray(opVal) ? opVal : [opVal]).map(async (opVal) => {
              const id = new ObjectId(opVal.id);

              $in.push(id);

              if (opVal.matchDescendants) {
                $in.push(...(await getDeptDescendentIds(id, context)));
              }
            })
          );

          yield {
            field: "$and",
            condition: [
              {
                "department.0.value.id": { $in },
              },
            ],
          };
        }
        break;
      case "ne":
      case "nin":
        if (opVal) {
          const $nin: ObjectId[] = [];

          await Promise.all(
            (Array.isArray(opVal) ? opVal : [opVal]).map(async (opVal) => {
              const id = new ObjectId(opVal.id);

              $nin.push(id);

              if (opVal.matchDescendants) {
                $nin.push(...(await getDeptDescendentIds(id, context)));
              }
            })
          );

          yield {
            field: "$and",
            condition: [
              {
                "department.0.value.id": { $nin },
              },
            ],
          };
        }
        break;
    }
  }
};
// Where Category
const getCategoryDescendentIds = async (
  id: ObjectId,
  context: Context
): Promise<ObjectId[]> => {
  const descendants: ObjectId[] = [];

  await Promise.all([
    ...(
      await context.db
        .collection("journalEntryCategories")
        .find<{ _id: ObjectId }>(
          {
            parent: {
              $eq: {
                id,
                node: categoryNode,
              },
            },
          },
          { projection: { _id: true } }
        )
        .toArray()
    ).map(async ({ _id }) => {
      descendants.push(_id, ...(await getCategoryDescendentIds(_id, context)));
    }),
  ]);

  return descendants;
};

const parseWhereCategory = async function* (
  opValues: IterableIterator<
    [
      keyof EntriesWhereCategory,
      EntriesWhereCategory[keyof EntriesWhereCategory]
    ]
  >,
  context: Context
): AsyncIterableIterator<FieldAndCondition> {
  for (const [op, opVal] of opValues) {
    switch (op) {
      case "eq":
      case "in":
        if (opVal) {
          const $in: ObjectId[] = [];

          await Promise.all(
            (Array.isArray(opVal) ? opVal : [opVal]).map(async (opVal) => {
              const id = new ObjectId(opVal.id);

              $in.push(id);

              if (opVal.matchDescendants) {
                $in.push(...(await getCategoryDescendentIds(id, context)));
              }
            })
          );

          yield {
            field: "$and",
            condition: [
              {
                "category.0.value.id": { $in },
              },
            ],
          };
        }
        break;
      case "ne":
      case "nin":
        if (opVal) {
          const $nin: ObjectId[] = [];

          await Promise.all(
            (Array.isArray(opVal) ? opVal : [opVal]).map(async (opVal) => {
              const id = new ObjectId(opVal.id);

              $nin.push(id);

              if (opVal.matchDescendants) {
                $nin.push(...(await getCategoryDescendentIds(id, context)));
              }
            })
          );

          yield {
            field: "$and",
            condition: [
              {
                "category.0.value.id": { $nin },
              },
            ],
          };
        }
        break;
    }
  }
};
// Where Payment Method
const getPayMethodDescendentIds = async (
  id: ObjectId,
  context: Context
): Promise<ObjectId[]> => {
  const descendants: ObjectId[] = [];

  await Promise.all([
    ...(
      await context.db
        .collection("paymentMethods")
        .find<{ _id: ObjectId }>(
          {
            parent: {
              $eq: id,
            },
          },
          { projection: { _id: true } }
        )
        .toArray()
    ).map(async ({ _id }) => {
      descendants.push(_id, ...(await getPayMethodDescendentIds(_id, context)));
    }),
  ]);

  return descendants;
};

const parseWhereEntryPayMethod = async function* (
  opValues: IterableIterator<
    [
      keyof EntriesWherePaymentMethod,
      EntriesWherePaymentMethod[keyof EntriesWherePaymentMethod]
    ]
  >,
  context: Context
): AsyncIterableIterator<FieldAndCondition> {
  for (const [op, opVal] of opValues) {
    switch (op) {
      case "eq":
      case "in":
        if (opVal) {
          const $in: ObjectId[] = [];

          await Promise.all(
            (Array.isArray(opVal) ? opVal : [opVal]).map(async (opVal) => {
              const id = new ObjectId(opVal.id);

              $in.push(id);

              if (opVal.matchDescendants) {
                $in.push(...(await getPayMethodDescendentIds(id, context)));
              }
            })
          );

          yield {
            field: "$and",
            condition: [
              {
                "paymentMethod.0.value.id": { $in },
              },
            ],
          };
        }
        break;
      case "ne":
      case "nin":
        if (opVal) {
          const $nin: ObjectId[] = [];

          await Promise.all(
            (Array.isArray(opVal) ? opVal : [opVal]).map(async (opVal) => {
              const id = new ObjectId(opVal.id);

              $nin.push(id);

              if (opVal.matchDescendants) {
                $nin.push(...(await getPayMethodDescendentIds(id, context)));
              }
            })
          );

          yield {
            field: "$and",
            condition: [
              {
                "paymentMethod.0.value.id": { $nin },
              },
            ],
          };
        }
        break;
    }
  }
};

const getSourceNode = (srcType: SourceType) => {
  switch (srcType) {
    case SourceType.Business:
      return bizNode;
    case SourceType.Department:
      return deptNode;
    case SourceType.Person:
      return personNode;
  }
};

const parseWhereParentDept = function* (
  whereBudgetOwnerIter: Iterable<
    [keyof EntriesWhereSource, EntriesWhereSource[keyof EntriesWhereSource]]
  >
): IterableIterator<FieldAndCondition<unknown>> {
  for (const [op, opValue] of whereBudgetOwnerIter) {
    switch (op) {
      case "eq":
        if (opValue) {
          const mongoOp = comparisonOpsMapper(op);
          yield {
            field: "$and",
            condition: [
              {
                "source.0.value.node": {
                  [mongoOp]: getSourceNode(
                    (opValue as EntriesWhereSource[typeof op]).type
                  ),
                },
              },
              {
                "source.0.value.id": {
                  [mongoOp]: new ObjectId(
                    (opValue as EntriesWhereSource[typeof op]).id
                  ),
                },
              },
            ],
          };
        }
        break;
      case "ne":
        if (opValue) {
          const mongoOp = comparisonOpsMapper(op);
          yield {
            field: "$or",
            condition: [
              {
                "source.0.value.node": {
                  [mongoOp]: getSourceNode(
                    (opValue as EntriesWhereSource[typeof op]).type
                  ),
                },
              },
              {
                "source.0.value.id": {
                  [mongoOp]: new ObjectId(
                    (opValue as EntriesWhereSource[typeof op]).id
                  ),
                },
              },
            ],
          };
        }
        break;
      case "in":
        if (opValue) {
          const orArr: unknown[] = [];

          for (const { field, condition } of parseWhereParentDept(
            (function* () {
              for (const opV of opValue as EntriesWhereSource[typeof op]) {
                yield ["eq", opV] as [
                  keyof EntriesWhereSource,
                  EntriesWhereSource[keyof EntriesWhereSource]
                ];
              }
            })()
          )) {
            orArr.push({ [field]: condition });
          }

          yield { field: "$or", condition: orArr };
        }
        break;
      case "nin":
        if (opValue) {
          const andArr: unknown[] = [];

          for (const { field, condition } of parseWhereParentDept(
            (function* () {
              for (const opV of opValue as EntriesWhereSource[typeof op]) {
                yield ["ne", opV] as [
                  keyof EntriesWhereSource,
                  EntriesWhereSource[keyof EntriesWhereSource]
                ];
              }
            })()
          )) {
            andArr.push({ [field]: condition });
          }

          yield { field: "$and", condition: andArr };
        }
        break;
    }
  }
};

const parseWhereFiscalYear = async function* (
  whereFiscalYearIter: Iterable<
    [
      keyof EntriesWhereFiscalYear,
      EntriesWhereFiscalYear[keyof EntriesWhereFiscalYear]
    ]
  >,
  context: Context
): AsyncIterableIterator<FieldAndCondition<unknown>> {
  const fiscalYears = (
    await context.db
      .collection("fiscalYears")
      .find<{
        _id: ObjectId;
        begin: Date;
        end: Date;
      }>({}, { projection: { _id: true, begin: true, end: true } })
      .toArray()
  ).reduce((fiscalYears, { _id, ...rest }) => {
    fiscalYears.set(_id.toHexString(), rest);
    return fiscalYears;
  }, new Map<string, { begin: Date; end: Date }>());

  for (const [op, opValue] of whereFiscalYearIter) {
    switch (op) {
      case "eq":
        if (opValue) {
          const { begin, end } = fiscalYears.get(
            opValue as EntriesWhereFiscalYear[typeof op]
          );
          yield {
            field: "$expr",
            condition: {
              $let: {
                vars: {
                  fiscalYearDate: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $eq: [
                              DocHistory.getPresentValueExpression(
                                "dateOfRecord.overrideFiscalYear"
                              ),
                              true,
                            ],
                          },
                        ],
                      },
                      then: DocHistory.getPresentValueExpression(
                        "dateOfRecord.date"
                      ),
                      else: DocHistory.getPresentValueExpression("date"),
                    },
                  },
                },
                in: {
                  $and: [
                    { $gte: ["$$fiscalYearDate", begin] },
                    { $lt: ["$$fiscalYearDate", end] },
                  ],
                },
              },
            },
          };
        }
        break;
      case "ne":
        if (opValue) {
          const { begin, end } = fiscalYears.get(
            opValue as EntriesWhereFiscalYear[typeof op]
          );
          yield {
            field: "$expr",
            condition: {
              $let: {
                vars: {
                  fiscalYearDate: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $eq: [
                              DocHistory.getPresentValueExpression(
                                "dateOfRecord.deleted"
                              ),
                              false,
                            ],
                          },
                          {
                            $eq: [
                              DocHistory.getPresentValueExpression(
                                "dateOfRecord.overrideFiscalYear"
                              ),
                              true,
                            ],
                          },
                        ],
                      },
                      then: DocHistory.getPresentValueExpression(
                        "dateOfRecord.date"
                      ),
                      else: DocHistory.getPresentValueExpression("date"),
                    },
                  },
                },
                in: {
                  $not: {
                    $and: [
                      { $gte: ["$$fiscalYearDate", begin] },
                      { $lt: ["$$fiscalYearDate", end] },
                    ],
                  },
                },
              },
            },
          };
        }
        break;
      case "in":
        if (opValue) {
          yield {
            field: "$expr",
            condition: {
              $let: {
                vars: {
                  fiscalYearDate: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $eq: [
                              DocHistory.getPresentValueExpression(
                                "dateOfRecord.deleted"
                              ),
                              false,
                            ],
                          },
                          {
                            $eq: [
                              DocHistory.getPresentValueExpression(
                                "dateOfRecord.overrideFiscalYear"
                              ),
                              true,
                            ],
                          },
                        ],
                      },
                      then: DocHistory.getPresentValueExpression(
                        "dateOfRecord.date"
                      ),
                      else: DocHistory.getPresentValueExpression("date"),
                    },
                  },
                },
                in: {
                  $or: (opValue as EntriesWhereFiscalYear[typeof op]).map(
                    (opValue) => {
                      const { begin, end } = fiscalYears.get(opValue);
                      return {
                        $and: [
                          { $gte: ["$$fiscalYearDate", begin] },
                          { $lt: ["$$fiscalYearDate", end] },
                        ],
                      };
                    }
                  ),
                },
              },
            },
          };
        }
        break;
      case "nin":
        if (opValue) {
          yield {
            field: "$expr",
            condition: {
              $let: {
                vars: {
                  fiscalYearDate: {
                    $cond: {
                      if: {
                        $and: [
                          {
                            $eq: [
                              DocHistory.getPresentValueExpression(
                                "dateOfRecord.deleted"
                              ),
                              false,
                            ],
                          },
                          {
                            $eq: [
                              DocHistory.getPresentValueExpression(
                                "dateOfRecord.overrideFiscalYear"
                              ),
                              true,
                            ],
                          },
                        ],
                      },
                      then: DocHistory.getPresentValueExpression(
                        "dateOfRecord.date"
                      ),
                      else: DocHistory.getPresentValueExpression("date"),
                    },
                  },
                },
                in: {
                  $not: {
                    $or: (opValue as EntriesWhereFiscalYear[typeof op]).map(
                      (opValue) => {
                        const { begin, end } = fiscalYears.get(opValue);
                        return {
                          $and: [
                            { $gte: ["$$fiscalYearDate", begin] },
                            { $lt: ["$$fiscalYearDate", end] },
                          ],
                        };
                      }
                    ),
                  },
                },
              },
            },
          };
        }
        break;
    }
  }
};

const parseWhereEntryId: Readonly<OpsParser<Where, Context>[]> = [
  parseComparisonOps<Where, Context>((opVal, op) => {
    switch (op) {
      case "eq":
      case "ne":
        return new ObjectId(opVal as Where[typeof op]);
      case "in":
      case "nin":
        return (opVal as Where[typeof op]).map((id) => new ObjectId(id));
      default:
        return opVal;
    }
  }),
] as const;

const NULLISH = Symbol();

const fieldAndConditionGen: FieldAndConditionGenerator<
  Where,
  Context
> = async function* (keyValueIterator, opts: Context) {
  const [asyncIterator, asyncReturn] = resolveWithAsyncReturn(
    parseOps(true, keyValueIterator, parseWhereEntryId, opts)
  );

  for await (const [key, value] of asyncIterator) {
    switch (key) {
      case "deleted":
        if ((value ?? NULLISH) !== NULLISH) {
          yield {
            field: "deleted.0.value",
            condition: { $eq: value as Where[typeof key] },
          };
        }
        break;
      case "department":
        if (value) {
          yield* parseWhereEntryDept(
            iterateOwnKeyValues(value as Where[typeof key]),
            opts
          );
        }
        break;
      case "category":
        if (value) {
          yield* parseWhereCategory(
            iterateOwnKeyValues(value as Where[typeof key]),
            opts
          );
        }
        break;
      case "paymentMethod":
        if (value) {
          yield* parseWhereEntryPayMethod(
            iterateOwnKeyValues(value as Where[typeof key]),
            opts
          );
        }
        break;
      case "total":
        if (value) {
          const fieldCond = gqlMongoRational(value as Where[typeof key], [
            "total.value",
            0,
          ]);
          if (fieldCond) {
            yield fieldCond;
          }
        }
        break;
      case "source":
        if (value) {
          yield* parseWhereParentDept(
            iterateOwnKeyValues(value as Where[typeof key])
          );
        }
        break;
      case "date":
        if (value) {
          const field = "date.0.value";
          const condition = await parseOps(
            false,
            iterateOwnKeyValues(value as Where[typeof key]),
            dateOpsParser
          );

          yield {
            field,
            condition,
          };
        }
        break;
      case "fiscalYear":
        if (value) {
          yield* parseWhereFiscalYear(
            iterateOwnKeyValues(value as Where[typeof key]),
            opts
          );
        }
        break;
      case "lastUpdate":
        if (value) {
          const condition = await parseOps(
            false,
            iterateOwnKeyValues(value as Where[typeof key]),
            dateOpsParser
          );
          yield {
            field: "lastUpdate",
            condition,
          };
        }
        break;
      case "lastUpdateRefund":
        if (value) {
          const condition = await parseOps(
            false,
            iterateOwnKeyValues(value as Where[typeof key]),
            dateOpsParser
          );
          yield {
            field: "refunds.lastUpdate",
            condition,
          };
        }
        break;
      case "lastUpdateItem":
        if (value) {
          const condition = await parseOps(
            false,
            iterateOwnKeyValues(value as Where[typeof key]),
            dateOpsParser
          );
          yield {
            field: "items.lastUpdate",
            condition,
          };
        }
        break;
      case "reconciled":
        if ((value ?? NULLISH) !== NULLISH) {
          yield {
            field: "reconciled.0.value",
            condition: { $eq: value as Where[typeof key] },
          };
        }
        break;
    }
  }

  const condition = await asyncReturn;

  // Check that operators have been set on condition.
  if (Object.keys(condition).length > 0) {
    yield {
      field: "_id",
      condition,
    };
  }
};

const entries: QueryResolvers["entries"] = async (
  parent,
  args,
  context,
  info
) => {
  const pipeline: object[] = [];

  await Promise.all([
    (async () => {
      if (!args.where || Object.keys(args).length === 0) {
        return;
      }

      const $match = await filterQueryCreator<Where, Context>(
        args.where,
        fieldAndConditionGen,
        context
      );
      pipeline.push({ $match });
    })(),
  ]);

  pipeline.push(stages.entryAddFields, stages.entryTransmutations);

  const results = await context.db
    .collection<Entry>("journalEntries")
    .aggregate(pipeline)
    .toArray();

  return results;
};

export default entries;
