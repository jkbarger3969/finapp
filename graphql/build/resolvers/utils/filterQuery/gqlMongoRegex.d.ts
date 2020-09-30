import { WhereRegexInput } from "../../../graphTypes";
declare const parseGQLMongoRegex: (whereRegex: WhereRegexInput) => {
    $regex: string;
    $options?: string;
};
export default parseGQLMongoRegex;
