"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeGQLEnum = exports.deserializeGQLEnum = void 0;
const change_case_1 = require("change-case");
const deserializeGQLEnum = (gqlEnum) => (0, change_case_1.pascalCase)(gqlEnum);
exports.deserializeGQLEnum = deserializeGQLEnum;
const serializeGQLEnum = (serializeGQLEnum) => (0, change_case_1.snakeCase)(serializeGQLEnum).toUpperCase();
exports.serializeGQLEnum = serializeGQLEnum;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3FsRW51bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL3V0aWxzL2dxbEVudW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUFvRDtBQUU3QyxNQUFNLGtCQUFrQixHQUFHLENBQW1CLE9BQVUsRUFBVSxFQUFFLENBQ3pFLElBQUEsd0JBQVUsRUFBQyxPQUFPLENBQUMsQ0FBQztBQURULFFBQUEsa0JBQWtCLHNCQUNUO0FBRWYsTUFBTSxnQkFBZ0IsR0FBRyxDQUFJLGdCQUF3QixFQUFLLEVBQUUsQ0FDakUsSUFBQSx1QkFBUyxFQUFDLGdCQUFnQixDQUFDLENBQUMsV0FBVyxFQUFrQixDQUFDO0FBRC9DLFFBQUEsZ0JBQWdCLG9CQUMrQiJ9