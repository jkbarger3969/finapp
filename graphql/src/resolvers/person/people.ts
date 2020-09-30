import { ObjectId } from "mongodb";
import { QueryResolvers, PeopleWhereInput as Where } from "../../graphTypes";
import { addId } from "../utils/mongoUtils";
import filterQueryCreator, {
  FieldAndConditionGenerator,
} from "../utils/filterQuery/filter";
import { Context } from "vm";
import parseOps from "../utils/filterQuery/querySelectors/parseOps";
import { resolveWithAsyncReturn } from "../../utils/iterableFns";
import { OpsParser } from "../utils/filterQuery/querySelectors/types";
import parseComparisonOps from "../utils/filterQuery/querySelectors/parseComparisonOps";
import gqlMongoRegex from "../utils/filterQuery/gqlMongoRegex";

const parseWherePeopleId: Readonly<OpsParser<Where>[]> = [
  // Convert "eq" and "ne" to ObjectId and "in" and "nin" to ObjectId[]
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

const fieldAndCondGen: FieldAndConditionGenerator<
  Where,
  Context
> = async function* (keyValueIterator, opts) {
  const [asyncIterator, asyncReturn] = resolveWithAsyncReturn(
    parseOps(true, keyValueIterator, parseWherePeopleId, opts)
  );

  for await (const [key, value] of asyncIterator) {
    switch (key) {
      case "firstName":
        if (value) {
          yield {
            field: "name.first",
            condition: gqlMongoRegex(value as Where[typeof key]),
          };
        }
        break;
      case "lastName":
        if (value) {
          yield {
            field: "name.last",
            condition: gqlMongoRegex(value as Where[typeof key]),
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

const people: QueryResolvers["people"] = async (
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
        fieldAndCondGen,
        context
      );

      pipeline.push({ $match });
    })(),
  ]);

  pipeline.push(addId);

  return context.db.collection("people").aggregate(pipeline).toArray();
};

export default people;
