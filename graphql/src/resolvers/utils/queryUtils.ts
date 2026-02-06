import {
  FilterOperators as QuerySelector,
  ObjectId,
  Filter as FilterQuery,
} from "mongodb";

import {
  WhereRegex,
  RegexFlags,
  Resolvers,
  WhereDate,
  WhereRational,
  WhereId,
  WhereTreeId,
  WhereNode,
  WhereInt,
} from "../../graphTypes";
import { iterateOwnKeys, iterateOwnKeyValues } from "../../utils/iterableFns";
import {
  rationalComparison,
  Rational,
  RationalValue,
} from "../../utils/mongoRational";

export interface NodeDbRecord<T extends string = string> {
  type: T;
  id: ObjectId;
}

export const whereId = (whereId: WhereId): QuerySelector<ObjectId> => {
  const querySelector: QuerySelector<ObjectId> = {};
  for (const idKey of iterateOwnKeys(whereId)) {
    switch (idKey) {
      case "eq":
        querySelector.$eq = new ObjectId(whereId[idKey]);
        break;
      case "ne":
        querySelector.$ne = new ObjectId(whereId[idKey]);
        break;
      case "in":
        querySelector.$in = whereId[idKey].map((id) => new ObjectId(id));
        break;
      case "nin":
        querySelector.$nin = whereId[idKey].map((id) => new ObjectId(id));
        break;
    }
  }
  return querySelector;
};

export const whereTreeId = (
  whereTreeId: WhereTreeId,
  getRangeIds: (
    rangeOp: "gt" | "gte" | "lt" | "lte",
    id: ObjectId
  ) => Promise<ObjectId[]> | ObjectId[]
): Promise<QuerySelector<unknown>> | QuerySelector<unknown> => {
  const promises: Promise<void>[] = [];
  const querySelector: QuerySelector<unknown> = {};
  for (const idKey of iterateOwnKeys(whereTreeId)) {
    switch (idKey) {
      case "eq":
        querySelector.$eq = new ObjectId(whereTreeId[idKey]);
        break;
      case "ne":
        querySelector.$ne = new ObjectId(whereTreeId[idKey]);
        break;
      case "in":
        querySelector.$in = whereTreeId[idKey].map((id) => new ObjectId(id));
        break;
      case "nin":
        querySelector.$nin = whereTreeId[idKey].map((id) => new ObjectId(id));
        break;

      // Range
      case "gt":
      case "gte":
      case "lt":
      case "lte":
        {
          const result = getRangeIds(idKey, new ObjectId(whereTreeId[idKey]));

          if (result instanceof Promise) {
            promises.push(
              result.then((ids): void => {
                querySelector.$in = ids;
              })
            );
          } else {
            querySelector.$in = result;
          }
        }
        break;
    }
  }

  if (promises.length) {
    return Promise.all(promises).then(() => querySelector);
  }

  return querySelector;
};

/**
 * @returns Mongodb "$and" logic operator expression.
 * https://docs.mongodb.com/manual/reference/operator/query/and/#op._S_and
 * */
export const whereNode = (
  whereNode: WhereNode,
  nodeFieldPath: string | ((nodeType: string) => string)
): FilterQuery<unknown>[] => {
  const $and: FilterQuery<unknown>[] = [];

  const getNodeFieldPath =
    typeof nodeFieldPath === "string" ? () => nodeFieldPath : nodeFieldPath;

  for (const idKey of iterateOwnKeys(whereNode)) {
    switch (idKey) {
      case "eq":
        {
          const { id, type } = whereNode[idKey];
          $and.push({
            [`${getNodeFieldPath(type)}.type`]: type,
            [`${getNodeFieldPath(type)}.id`]: new ObjectId(id),
          });
        }
        break;
      case "ne":
        {
          const { id, type } = whereNode[idKey];
          $and.push({
            $or: [
              {
                [`${getNodeFieldPath(type)}.type`]: { $ne: type },
              },
              {
                [`${getNodeFieldPath(type)}.id`]: { $ne: new ObjectId(id) },
              },
            ],
          });
        }
        break;
      case "in":
        if (whereNode[idKey].length > 0) {
          $and.push({
            $or: whereNode[idKey].map(({ id, type }) => ({
              [`${getNodeFieldPath(type)}.type`]: type,
              [`${getNodeFieldPath(type)}.id`]: new ObjectId(id),
            })),
          });
        }
        break;
      case "nin":
        if (whereNode[idKey].length > 0) {
          $and.push({
            $nor: whereNode[idKey].map(({ id, type }) => ({
              [`${getNodeFieldPath(type)}.type`]: type,
              [`${getNodeFieldPath(type)}.id`]: new ObjectId(id),
            })),
          });
        }
        break;
    }
  }

  return $and;
};

const _whereRegexFlags = function* (flags: RegexFlags[]) {
  for (const flag of flags) {
    switch (flag) {
      case RegexFlags.G:
        yield "g";
        break;
      case RegexFlags.I:
        yield "i";
        break;
      case RegexFlags.M:
        yield "m";
        break;
      case RegexFlags.S:
        yield "s";
        break;
    }
  }
};

export const whereRegex = ({
  pattern,
  flags,
}: WhereRegex): QuerySelector<unknown> => {
  if (flags && flags.length) {
    return {
      $regex: new RegExp(pattern, ..._whereRegexFlags(flags)),
    } as QuerySelector<string>;
  }

  return {
    $regex: new RegExp(pattern),
  } as QuerySelector<string>;
};

export const addTypename = async <T extends keyof Resolvers, U>(
  typename: T,
  query: Promise<U>
): Promise<
  U extends Array<infer V> ? (V & { __typename: T })[] : U & { __typename: T }
> => {
  const result = await query;

  if (!result) {
    return result as any;
  }

  if (Array.isArray(result)) {
    return (result as any[]).map((doc) => {
      doc.__typename = typename;
      return doc;
    }) as any;
  } else {
    (result as any).__typename = typename;
    return result as any;
  }
};

export const whereDate = (dateWhere: WhereDate): QuerySelector<unknown> => {
  const querySelector: QuerySelector<unknown> = {};

  for (const [whereKey, date] of iterateOwnKeyValues(dateWhere)) {
    switch (whereKey) {
      case "eq":
        querySelector.$eq = date;
        break;
      case "ne":
        querySelector.$ne = date;
        break;
      case "gt":
        querySelector.$gt = date;
        break;
      case "gte":
        querySelector.$gte = date;
        break;
      case "lt":
        querySelector.$lt = date;
        break;
      case "lte":
        querySelector.$lte = date;
        break;
    }
  }

  return querySelector;
};

/**
 * @returns Mongodb "$and" logic operator expression.
 * https://docs.mongodb.com/manual/reference/operator/query/and/#op._S_and
 * */
export const whereRational = (
  lhs: RationalValue,
  whereRational: WhereRational
) => {
  const $and: QuerySelector<unknown>[] = [];

  for (const whereKey of iterateOwnKeys(whereRational)) {
    switch (whereKey) {
      case "eq":
        $and.push({
          $expr: rationalComparison(
            lhs,
            "$eq",
            whereRational[whereKey] as Rational
          ),
        });
        break;
      case "ne":
        $and.push({
          $expr: rationalComparison(
            lhs,
            "$ne",
            whereRational[whereKey] as Rational
          ),
        });
        break;
      case "in":
        $and.push({
          $expr: rationalComparison(
            lhs,
            "$in",
            whereRational[whereKey] as Rational[]
          ),
        });
        break;
      case "nin":
        $and.push({
          $expr: rationalComparison(
            lhs,
            "$nin",
            whereRational[whereKey] as Rational[]
          ),
        });
        break;
      case "gt":
        $and.push({
          $expr: rationalComparison(
            lhs,
            "$gt",
            whereRational[whereKey] as Rational
          ),
        });
        break;
      case "gte":
        $and.push({
          $expr: rationalComparison(
            lhs,
            "$gte",
            whereRational[whereKey] as Rational
          ),
        });
        break;
      case "lt":
        $and.push({
          $expr: rationalComparison(
            lhs,
            "$lt",
            whereRational[whereKey] as Rational
          ),
        });
        break;
      case "lte":
        $and.push({
          $expr: rationalComparison(
            lhs,
            "$lte",
            whereRational[whereKey] as Rational
          ),
        });
        break;
    }
  }

  return $and;
};

export const whereInt = (intWhere: WhereInt): QuerySelector<unknown> => {
  const querySelector: QuerySelector<unknown> = {};

  for (const [whereKey, value] of iterateOwnKeyValues(intWhere)) {
    switch (whereKey) {
      case "eq":
        querySelector.$eq = value;
        break;
      case "ne":
        querySelector.$ne = value;
        break;
      case "gt":
        querySelector.$gt = value;
        break;
      case "gte":
        querySelector.$gte = value;
        break;
      case "lt":
        querySelector.$lt = value;
        break;
      case "lte":
        querySelector.$lte = value;
        break;
    }
  }

  return querySelector;
};
