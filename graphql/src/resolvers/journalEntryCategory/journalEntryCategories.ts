import { ObjectID, FilterQuery } from "mongodb";

import {
  QueryResolvers,
  JournalEntryType,
  JournalEntryCategoryWhereParentInput,
  JournalEntryCategoryWhereNameInput,
  JournalEntryCategoryWhereTypeInput,
  JournalEntryCategoryWhereInput,
} from "../../graphTypes";
import filter, {
  FieldAndConditionCreator,
} from "../utils/filterQuery/filterQuery";
import mapComparisonOperators from "../utils/filterQuery/mapComarisonOperators";

const filedAndConditionCreator: FieldAndConditionCreator<Omit<
  JournalEntryCategoryWhereInput,
  "hasParent"
>> = async (key, value) => {
  switch (key) {
    case "name":
      return {
        field: key,
        condition: await mapComparisonOperators(
          value as JournalEntryCategoryWhereNameInput
        ),
      };
    case "parent":
      return {
        field: `${key}.id`,
        condition: await mapComparisonOperators(
          value as JournalEntryCategoryWhereParentInput,
          (id) => (id ? new ObjectID(id) : id)
        ),
      };
    case "type":
      return {
        field: key,
        condition: await mapComparisonOperators(
          value as JournalEntryCategoryWhereTypeInput,
          (type: JournalEntryType) =>
            type === JournalEntryType.Credit ? "credit" : "debit"
        ),
      };
  }
};

const NULLISH = Symbol();

const getFilterQuery = async (
  whereInput?: JournalEntryCategoryWhereInput
): Promise<FilterQuery<any>> => {
  if (!whereInput) {
    return {};
  }

  const { hasParent, ...where } = whereInput;

  const condition = await filter(where, filedAndConditionCreator);

  if ((hasParent ?? NULLISH) === NULLISH) {
    return condition;
  }

  const $and: FilterQuery<any>[] = [];

  if (hasParent) {
    $and.push({ parent: { $exists: true, $nin: [undefined, null] } });
  } else {
    $and.push({
      $or: [
        { parent: { $exists: false } },
        { parent: { $in: [undefined, null] } },
      ],
    });
  }

  if (Object.keys(condition).length > 0) {
    $and.push(condition);
  }

  return { $and };
};

const journalEntryCategories: QueryResolvers["journalEntryCategories"] = async (
  obj,
  args,
  context,
  info
) => {
  const { db } = context;

  const filterQuery: FilterQuery<any> = await getFilterQuery(args.where);

  const results = await db
    .collection("journalEntryCategories")
    .aggregate([
      { $match: filterQuery },
      { $addFields: { id: { $toString: "$_id" } } },
    ])
    .toArray();

  return results;
};

export default journalEntryCategories;
