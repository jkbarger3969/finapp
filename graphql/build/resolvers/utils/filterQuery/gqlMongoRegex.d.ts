import { WhereRegex } from "../../../graphTypes";
declare const parseGQLMongoRegex: (whereRegex: WhereRegex) => {
    $regex: string;
    $options?: string;
};
export default parseGQLMongoRegex;
