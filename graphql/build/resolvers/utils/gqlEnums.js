"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeGQLEnum = exports.serializeGQLEnum = void 0;
const change_case_1 = require("change-case");
const lodash_1 = require("lodash");
const serializeGQLEnum = (gqlEnum) => (0, change_case_1.pascalCase)(gqlEnum);
exports.serializeGQLEnum = serializeGQLEnum;
const deserializeGQLEnum = (serializeGQLEnum) => (0, lodash_1.snakeCase)(serializeGQLEnum).toUpperCase();
exports.deserializeGQLEnum = deserializeGQLEnum;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3FsRW51bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL3V0aWxzL2dxbEVudW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUF1RDtBQUN2RCxtQ0FBbUM7QUFFNUIsTUFBTSxnQkFBZ0IsR0FBRyxDQUFtQixPQUFVLEVBQVUsRUFBRSxDQUN2RSxJQUFBLHdCQUFVLEVBQUMsT0FBTyxDQUFDLENBQUM7QUFEVCxRQUFBLGdCQUFnQixvQkFDUDtBQUVmLE1BQU0sa0JBQWtCLEdBQUcsQ0FBSSxnQkFBd0IsRUFBSyxFQUFFLENBQ25FLElBQUEsa0JBQVMsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFDLFdBQVcsRUFBa0IsQ0FBQztBQUQvQyxRQUFBLGtCQUFrQixzQkFDNkIifQ==