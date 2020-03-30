"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DocHistory_1 = require("../utils/DocHistory");
exports.$addFields = Object.assign(Object.assign({}, DocHistory_1.default.getPresentValues(["active", "name", "refId"])), { id: { $toString: "$_id" } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL3BheW1lbnRNZXRob2QvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvREFBNkM7QUFFaEMsUUFBQSxVQUFVLEdBQUcsZ0NBQ3JCLG9CQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLEtBQzNELEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsR0FDakIsQ0FBQyJ9