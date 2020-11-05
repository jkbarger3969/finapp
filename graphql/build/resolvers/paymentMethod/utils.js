"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$addFields = void 0;
const DocHistory_1 = require("../utils/DocHistory");
exports.$addFields = Object.assign(Object.assign({}, DocHistory_1.default.getPresentValues(["active", "name", "refId"])), { id: { $toString: "$_id" } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL3BheW1lbnRNZXRob2QvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0RBQTZDO0FBRWhDLFFBQUEsVUFBVSxHQUFHLGdDQUNyQixvQkFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxLQUMzRCxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEdBQ2pCLENBQUMifQ==