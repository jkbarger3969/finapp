declare const parseGQLMongoRegex: (whereRegex: any) => {
    $regex: string;
    $options?: string;
};
export default parseGQLMongoRegex;
