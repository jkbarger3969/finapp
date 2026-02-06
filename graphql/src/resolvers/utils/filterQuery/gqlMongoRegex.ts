import { WhereRegex, RegexFlags } from "../../../graphTypes";

const parseGQLMongoRegex = (
  whereRegex: WhereRegex
): { $regex: string; $options?: string } => {
  const condition: { $regex: string; $options?: string } = {
    $regex: whereRegex.pattern,
  };

  if (whereRegex.flags) {
    condition.$options = Array.from(
      whereRegex.flags.reduce(
        (optSet, flag) => {
          switch (flag) {
            case RegexFlags.I:
              optSet.add("i");
              break;
            case RegexFlags.M:
              optSet.add("m");
              break;
            case RegexFlags.S:
              optSet.add("s");
              break;
            // 'x' not supported in standard Mongo regex options via this enum usually, or mapped differently?
            // Schema only has G, I, M, S.
          }
          return optSet;
        },
        new Set<"i" | "m" | "x" | "s">()
      )
    ).join("");
  }

  return condition;
};

export default parseGQLMongoRegex;
