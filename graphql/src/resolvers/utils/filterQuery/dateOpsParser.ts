import parseComparisonOps from "./querySelectors/parseComparisonOps";
import { OpsParser } from "./querySelectors/types";
import { WhereDate, WhereDateTime } from "../../../graphTypes";

const dateOpParser: Readonly<OpsParser<WhereDate>[]> = [
  parseComparisonOps<WhereDate>((whereDateTime: WhereDateTime) => {
    const date = new Date(whereDateTime.date);
    return whereDateTime.ignoreTime ? new Date(date.toDateString()) : date;
  }),
] as const;

export default dateOpParser;
