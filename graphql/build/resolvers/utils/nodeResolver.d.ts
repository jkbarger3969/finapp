import { GraphQLResolveInfo } from 'graphql';
import { Context, NodeValue } from "../../types";
export declare const nodeDocResolver: (nodeValue: NodeValue, context: Context) => Promise<any>;
export declare const nodeFieldResolver: (parentObj: any, args: any, context: Context, info: GraphQLResolveInfo) => any;
