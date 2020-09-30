import { Department, DepartmentResolvers as TDepartmentResolvers, DepartmentAncestorInput } from "../../graphTypes";
import { Context } from "../../types";
import { GraphQLResolveInfo } from "graphql/type";
export declare const getDeptDescendants: (fromParent: DepartmentAncestorInput, context: Context, info: GraphQLResolveInfo) => Promise<Department[]>;
declare const DepartmentResolvers: TDepartmentResolvers;
export default DepartmentResolvers;
