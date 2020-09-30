import {
  QueryResolvers,
  PaymentMethodWhereInput,
  PaymentMethodWhereNameInput,
  PaymentMethodWhereParentInput,
  PaymentMethodWhereRefIdInput,
} from "../../graphTypes";
import { FilterQuery, ObjectId } from "mongodb";
import filter, {
  FieldAndConditionCreator,
} from "../utils/filterQuery/filterQuery";
import mapComparisonOperators from "../utils/filterQuery/mapComarisonOperators";
import { $addFields } from "./utils";

const NULLISH = Symbol();

const filedAndConditionCreator: FieldAndConditionCreator<Omit<
  PaymentMethodWhereInput,
  "hasParent"
>> = async (key, value) => {
  switch (key) {
    case "active":
      return {
        field: key,
        condition: { $eq: value },
      };
    case "name":
      return {
        field: key,
        condition: await mapComparisonOperators(
          value as PaymentMethodWhereNameInput
        ),
      };
    case "parent":
      return {
        field: key,
        condition: await mapComparisonOperators(
          value as PaymentMethodWhereParentInput,
          (id) => (id ? new ObjectId(id) : id)
        ),
      };
    case "refId":
      return {
        field: key,
        condition: await mapComparisonOperators(
          value as PaymentMethodWhereRefIdInput
        ),
      };
  }
};

const getFilterQuery = async (
  whereInput?: PaymentMethodWhereInput
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

export const paymentMethods: QueryResolvers["paymentMethods"] = async (
  parent,
  args,
  context,
  info
) => {
  const { db } = context;

  const filterQuery: FilterQuery<any> = await getFilterQuery(args.where);

  const payMethodResults = await db
    .collection("paymentMethods")
    .aggregate([{ $match: filterQuery }, { $addFields }])
    .toArray();

  return payMethodResults;
};

export default paymentMethods;
