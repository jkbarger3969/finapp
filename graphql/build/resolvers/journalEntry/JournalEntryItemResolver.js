"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const journalEntryCategory_1 = require("../journalEntryCategory");
const department_1 = require("../department/department");
const rational_1 = require("../../utils/rational");
const department = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const dept = doc === null || doc === void 0 ? void 0 : doc.department;
    if (dept && "node" in dept && "id" in dept) {
        return department_1.default(doc, { id: ((_a = dept.id) === null || _a === void 0 ? void 0 : _a.toHexString()) || dept.id }, context, info);
    }
    return dept !== null && dept !== void 0 ? dept : null;
});
const category = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    // category is optional in type JournalEntryItem
    const cat = doc === null || doc === void 0 ? void 0 : doc.category;
    if (cat && "node" in cat && "id" in cat) {
        return journalEntryCategory_1.journalEntryCategory(doc, { id: ((_b = cat.id) === null || _b === void 0 ? void 0 : _b.toHexString()) || cat.id }, context, info);
    }
    return cat !== null && cat !== void 0 ? cat : null;
});
const JournalEntryItem = {
    department,
    category,
    total: (doc) => { var _a; return rational_1.fractionToRational(((_a = doc.total) !== null && _a !== void 0 ? _a : doc)); },
};
exports.default = JournalEntryItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSm91cm5hbEVudHJ5SXRlbVJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkvSm91cm5hbEVudHJ5SXRlbVJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQ0Esa0VBQWlGO0FBQ2pGLHlEQUF3RDtBQUN4RCxtREFBMEQ7QUFFMUQsTUFBTSxVQUFVLEdBQTRDLENBQzFELEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFOztJQUNGLE1BQU0sSUFBSSxHQUFHLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxVQUFpQixDQUFDO0lBRXBDLElBQUksSUFBSSxJQUFJLE1BQU0sSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtRQUMxQyxPQUFPLG9CQUFnQixDQUNyQixHQUFHLEVBQ0gsRUFBRSxFQUFFLEVBQUUsT0FBQSxJQUFJLENBQUMsRUFBRSwwQ0FBRSxXQUFXLE9BQU0sSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUN6QyxPQUFPLEVBQ1AsSUFBSSxDQUNMLENBQUM7S0FDSDtJQUVELE9BQU8sSUFBSSxhQUFKLElBQUksY0FBSixJQUFJLEdBQUksSUFBSSxDQUFDO0FBQ3RCLENBQUMsQ0FBQSxDQUFDO0FBRUYsTUFBTSxRQUFRLEdBQTBDLENBQ3RELEdBQUcsRUFDSCxJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFOztJQUNGLGdEQUFnRDtJQUNoRCxNQUFNLEdBQUcsR0FBRyxHQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsUUFBZSxDQUFDO0lBQ2pDLElBQUksR0FBRyxJQUFJLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRTtRQUN2QyxPQUFPLDJDQUFjLENBQ25CLEdBQUcsRUFDSCxFQUFFLEVBQUUsRUFBRSxPQUFBLEdBQUcsQ0FBQyxFQUFFLDBDQUFFLFdBQVcsT0FBTSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQ3ZDLE9BQU8sRUFDUCxJQUFJLENBQ0wsQ0FBQztLQUNIO0lBRUQsT0FBTyxHQUFHLGFBQUgsR0FBRyxjQUFILEdBQUcsR0FBSSxJQUFJLENBQUM7QUFDckIsQ0FBQyxDQUFBLENBQUM7QUFFRixNQUFNLGdCQUFnQixHQUE4QjtJQUNsRCxVQUFVO0lBQ1YsUUFBUTtJQUNSLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLFdBQUMsT0FBQSw2QkFBa0IsQ0FBQyxPQUFDLEdBQUcsQ0FBQyxLQUFLLG1DQUFJLEdBQUcsQ0FBUSxDQUFDLENBQUEsRUFBQTtDQUM5RCxDQUFDO0FBRUYsa0JBQWUsZ0JBQWdCLENBQUMifQ==