import { GraphQLResolveInfo } from "graphql";
import { Context, NodeValue } from "../../types";
export declare const nodeDocResolver: <Tdoc = unknown, Ttypename = string>(nodeValue: NodeValue, context: Context) => Promise<Tdoc & {
    __typename: Ttypename;
}>;
export declare const nodeFieldResolver: (parentObj: any, args: any, context: Context, info: GraphQLResolveInfo) => any;
