import parseComparisonOps from "./querySelectors/parseComparisonOps";
import { OpsParser } from "./querySelectors/types";
import { WhereDate } from "../../../graphTypes";

const dateOpParser: Readonly<OpsParser<WhereDate>[]> = [
  parseComparisonOps<WhereDate>((dateValue: any) => {
    return new Date(dateValue);
  }),
] as const;

export default dateOpParser;
