import { WhereRegexInput, RegexOptions } from "../../../graphTypes";

const parseGQLMongoRegex = (
  whereRegex: WhereRegexInput
): { $regex: string; $options?: string } => {
  const condition: { $regex: string; $options?: string } = {
    $regex: whereRegex.pattern,
  };

  if (whereRegex.options) {
    condition.$options = Array.from(
      whereRegex.options.reduce(
        (optSet, option) => {
          switch (option) {
            case RegexOptions.CaseInsensitive:
            case RegexOptions.I:
              optSet.add("i");
              break;
            case RegexOptions.Multiline:
            case RegexOptions.M:
              optSet.add("m");
              break;
            case RegexOptions.Extended:
            case RegexOptions.X:
              optSet.add("x");
              break;
            case RegexOptions.DotAll:
            case RegexOptions.S:
              optSet.add("s");
              break;
          }
          return optSet;
        },
        // Insure no duplicate options
        new Set<"i" | "m" | "x" | "s">()
      )
    ).join("");
  }

  return condition;
};

export default parseGQLMongoRegex;
