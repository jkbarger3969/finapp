"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeGQLEnum = exports.deserializeGQLEnum = void 0;
const change_case_1 = require("change-case");
const lodash_1 = require("lodash");
const deserializeGQLEnum = (gqlEnum) => (0, change_case_1.pascalCase)(gqlEnum);
exports.deserializeGQLEnum = deserializeGQLEnum;
const serializeGQLEnum = (serializeGQLEnum) => (0, lodash_1.snakeCase)(serializeGQLEnum).toUpperCase();
exports.serializeGQLEnum = serializeGQLEnum;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3FsRW51bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL3V0aWxzL2dxbEVudW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUF1RDtBQUN2RCxtQ0FBbUM7QUFFNUIsTUFBTSxrQkFBa0IsR0FBRyxDQUFtQixPQUFVLEVBQVUsRUFBRSxDQUN6RSxJQUFBLHdCQUFVLEVBQUMsT0FBTyxDQUFDLENBQUM7QUFEVCxRQUFBLGtCQUFrQixzQkFDVDtBQUVmLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBSSxnQkFBd0IsRUFBSyxFQUFFLENBQ2pFLElBQUEsa0JBQVMsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFDLFdBQVcsRUFBa0IsQ0FBQztBQUQvQyxRQUFBLGdCQUFnQixvQkFDK0IifQ==