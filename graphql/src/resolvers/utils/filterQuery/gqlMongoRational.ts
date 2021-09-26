import { WhereRational } from "../../../graphTypes";
import { rationalComparison, Rational } from "../../../utils/mongoRational";
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
            value as Rational[]
          )
        );
        break;
      default:
        expressions.push(
          rationalComparison(
            lhsRationalField,
            mongoOp as typeof mongoOp,
            value as Rational
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
