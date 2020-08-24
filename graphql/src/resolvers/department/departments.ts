import { ObjectId } from "mongodb";

import {
  DepartmentsWhereInput as Where,
  DepartmentsWhereAncestor,
  DepartmentAncestorType,
  QueryResolvers,
} from "../../graphTypes";
import { Context, NodeValue } from "../../types";
import filterQueryCreator, {
  FieldAndConditionGenerator,
} from "../utils/filterQuery/filter";
import parseOps from "../utils/filterQuery/querySelectors/parseOps";
import parseComparisonOps from "../utils/filterQuery/querySelectors/parseComparisonOps";
import { OpsParser } from "../utils/filterQuery/querySelectors/types";
import {
  iterateOwnKeyValues,
  resolveWithAsyncReturn,
} from "../../utils/iterableFns";
import { addId } from "../utils/mongoUtils";
import { Returns as DeptReturns } from "./department";
import gqlMongoRegex from "../utils/filterQuery/gqlMongoRegex";

const deptNode = new ObjectId("5dc4addacf96e166daaa008f");
const bizNode = new ObjectId("5dc476becf96e166daa9fd0b");

const parseWhereParentDeptOpValues: Readonly<
  OpsParser<DepartmentsWhereAncestor>[]
> = [
  // Convert "eq" and "ne" to NodeValue and "in" and "nin" to NodeValue[]
  async function* (opValues, querySelector) {
    for await (const [op, opVal] of opValues) {
      switch (op) {
        case "eq":
        case "ne":
          if (opVal) {
            yield [
              op,
              {
                id: new ObjectId(
                  (opVal as NonNullable<DepartmentsWhereAncestor[typeof op]>).id
                ),
                node:
                  (opVal as NonNullable<DepartmentsWhereAncestor[typeof op]>)
                    .type === DepartmentAncestorType.Business
                    ? bizNode
                    : deptNode,
              } as NodeValue,
            ];
          }
          break;
        case "in":
        case "nin":
          if (opVal) {
            yield [
              op,
              (opVal as NonNullable<DepartmentsWhereAncestor[typeof op]>).map(
                ({ id, type }) =>
                  ({
                    id: new ObjectId(id),
                    node:
                      type === DepartmentAncestorType.Business
                        ? bizNode
                        : deptNode,
                  } as NodeValue)
              ),
            ];
          }
          break;
        default:
          yield [op, opVal];
      }
    }

    return querySelector;
  } as OpsParser<DepartmentsWhereAncestor>,
  // Parse the comparison ops and add to querySelector
  parseComparisonOps<DepartmentsWhereAncestor>(),
] as const;

const parseWhereDeptId: Readonly<OpsParser<Where>[]> = [
  // Convert "eq" and "ne" to NodeValue and "in" and "nin" to NodeValue[]
  async function* (opValues, querySelector) {
    for await (const [op, opVal] of opValues) {
      switch (op) {
        case "eq":
        case "ne":
          if (opVal) {
            yield [op, new ObjectId(opVal as NonNullable<Where[typeof op]>)];
          }
          break;
        case "in":
        case "nin":
          if (opVal) {
            yield [
              op,
              (opVal as NonNullable<Where[typeof op]>).map(
                (id) => new ObjectId(id)
              ),
            ];
          }
          break;
        default:
          yield [op, opVal];
      }
    }

    return querySelector;
  } as OpsParser<Where>,
  // Parse the comparison ops and add to querySelector
  parseComparisonOps<Where>(),
] as const;

const fieldAndConditionGenerator: FieldAndConditionGenerator<
  Where,
  Context
> = async function* (keyValueIterator, opts: Context) {
  const [asyncIterator, asyncReturn] = resolveWithAsyncReturn(
    parseOps(true, keyValueIterator, parseWhereDeptId, opts)
  );

  for await (const [key, value] of asyncIterator) {
    switch (key) {
      case "name":
        if (value) {
          yield {
            field: "name",
            condition: gqlMongoRegex(value as Where[typeof key]),
          };
        }
        break;
      case "parent":
        if (value) {
          const condition = await parseOps(
            false,
            iterateOwnKeyValues(value as Where[typeof key]),
            parseWhereParentDeptOpValues,
            opts
          );
          yield {
            field: "parent",
            condition,
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

export type Returns = DeptReturns[];

const departments: QueryResolvers["departments"] = async (
  parent,
  args,
  context,
  info
) => {
  const pipeline: Record<string, unknown>[] = [];

  await Promise.all([
    (async () => {
      if (!args.where) {
        return;
      }

      const $match = await filterQueryCreator(
        args.where,
        fieldAndConditionGenerator,
        context
      );
      pipeline.push({ $match });
    })(),
  ]);

  pipeline.push(addId);

  return context.db.collection("departments").aggregate(pipeline).toArray();
};

export default departments;
