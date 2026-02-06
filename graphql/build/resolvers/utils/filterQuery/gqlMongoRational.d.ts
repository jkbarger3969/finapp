import { WhereRational } from "../../../graphTypes";
import { FieldAndCondition } from "./filter";
declare const rationalFieldCondition: (whereRational: WhereRational, lhsRationalField: string | [string, number]) => FieldAndCondition<unknown> | null;
export default rationalFieldCondition;
