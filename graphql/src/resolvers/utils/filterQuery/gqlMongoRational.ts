import { WhereRational, RationalInput } from "../../../graphTypes";
import {
  rationalComparison,
  MongoRational,
} from "../../../utils/mongoRational";
import { rationalToFraction } from "../../../utils/rational";
import { FieldAndCondition } from "./filter";
import { iterateOwnKeyValues } from "../../../utils/iterableFns";
import { comparisonOpsMapper } from "./operatorMapping/comparison";

const rationalFieldCondition = (
  whereRational: WhereRational,
  lhsRationalField: string | [string, number]
): FieldAndCondition<unknown> | null => {
  const expressions: unknown[] = [];
  for (const [key, value] of iterateOwnKeyValues(whereRational)) {
    const mongoOp = comparisonOpsMapper(key);
    switch (mongoOp) {
      case "$in":
      case "$nin":
        expressions.push(
          rationalComparison(
            lhsRationalField,
            mongoOp as typeof mongoOp,
            (value as RationalInput[]).map<MongoRational>(
              (r) => rationalToFraction(r) as MongoRational
            )
          )
        );
        break;
      default:
        expressions.push(
          rationalComparison(
            lhsRationalField,
            mongoOp as typeof mongoOp,
            rationalToFraction(value as RationalInput) as MongoRational
          )
        );
    }
  }

  const numExpressions = expressions.length;

  if (numExpressions === 0) {
    return null;
  }

  return {
    field: "$expr",
    condition:
      numExpressions === 1
        ? expressions[0]
        : { $allElementsTrue: [expressions] },
  };
};

export default rationalFieldCondition;
