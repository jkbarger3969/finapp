import { ObjectID } from "mongodb";

import {
  DepartmentWhereInput as Where,
  DepartmentWhereParent,
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
import { addId } from "./utils";

const deptNode = new ObjectID("5dc4addacf96e166daaa008f");
const bizNode = new ObjectID("5dc476becf96e166daa9fd0b");

const parseWhereParentDeptOpValues: Readonly<
  OpsParser<DepartmentWhereParent>[]
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
                id: new ObjectID(
                  (opVal as NonNullable<DepartmentWhereParent[typeof op]>).id
                ),
                node:
                  (opVal as NonNullable<DepartmentWhereParent[typeof op]>)
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
              (opVal as NonNullable<DepartmentWhereParent[typeof op]>).map(
                ({ id, type }) =>
                  ({
                    id: new ObjectID(id),
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
  } as OpsParser<DepartmentWhereParent>,
  // Parse the comparison ops and add to querySelector
  parseComparisonOps<DepartmentWhereParent>(),
] as const;

const parseWhereDeptId: Readonly<OpsParser<Where>[]> = [
  // Convert "eq" and "ne" to NodeValue and "in" and "nin" to NodeValue[]
  async function* (opValues, querySelector) {
    for await (const [op, opVal] of opValues) {
      switch (op) {
        case "eq":
        case "ne":
          if (opVal) {
            yield [op, new ObjectID(opVal as NonNullable<Where[typeof op]>)];
          }
          break;
        case "in":
        case "nin":
          if (opVal) {
            yield [
              op,
              (opVal as NonNullable<Where[typeof op]>).map(
                (id) => new ObjectID(id)
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
        yield {
          field: "name",
          condition: {
            $regex: (value as Where[typeof key]).pattern,
            $options: (value as Where[typeof key]).options,
          },
        };
        break;
      case "parent": {
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
        break;
      }
    }
  }

  const condition = await asyncReturn;

  yield {
    field: "_id",
    condition,
  };
};

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
