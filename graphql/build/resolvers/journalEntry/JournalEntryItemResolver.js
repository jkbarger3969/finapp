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
const departments_1 = require("../departments");
const department = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const dept = (_a = doc) === null || _a === void 0 ? void 0 : _a.department;
    if (dept && "node" in dept && "id" in dept) {
        return departments_1.department(doc, { id: ((_b = dept.id) === null || _b === void 0 ? void 0 : _b.toHexString()) || dept.id }, context, info);
    }
    return (dept !== null && dept !== void 0 ? dept : null);
});
const category = (doc, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    // category is optional in type JournalEntryItem
    const cat = (_c = doc) === null || _c === void 0 ? void 0 : _c.category;
    if (cat && "node" in cat && "id" in cat) {
        return journalEntryCategory_1.journalEntryCategory(doc, { id: ((_d = cat.id) === null || _d === void 0 ? void 0 : _d.toHexString()) || cat.id }, context, info);
    }
    return (cat !== null && cat !== void 0 ? cat : null);
});
const JournalEntryItem = {
    department,
    category,
};
exports.default = JournalEntryItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSm91cm5hbEVudHJ5SXRlbVJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9qb3VybmFsRW50cnkvSm91cm5hbEVudHJ5SXRlbVJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQ0Esa0VBQWlGO0FBQ2pGLGdEQUFnRTtBQUVoRSxNQUFNLFVBQVUsR0FBNEMsQ0FDMUQsR0FBRyxFQUNILElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7O0lBQ0YsTUFBTSxJQUFJLEdBQUcsTUFBQSxHQUFHLDBDQUFFLFVBQWlCLENBQUM7SUFFcEMsSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO1FBQzFDLE9BQU8sd0JBQWdCLENBQ3JCLEdBQUcsRUFDSCxFQUFFLEVBQUUsRUFBRSxPQUFBLElBQUksQ0FBQyxFQUFFLDBDQUFFLFdBQVcsT0FBTSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQ3pDLE9BQU8sRUFDUCxJQUFJLENBQ0wsQ0FBQztLQUNIO0lBRUQsUUFBTyxJQUFJLGFBQUosSUFBSSxjQUFKLElBQUksR0FBSSxJQUFJLEVBQUM7QUFDdEIsQ0FBQyxDQUFBLENBQUM7QUFFRixNQUFNLFFBQVEsR0FBMEMsQ0FDdEQsR0FBRyxFQUNILElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7O0lBQ0YsZ0RBQWdEO0lBQ2hELE1BQU0sR0FBRyxHQUFHLE1BQUEsR0FBRywwQ0FBRSxRQUFlLENBQUM7SUFDakMsSUFBSSxHQUFHLElBQUksTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFO1FBQ3ZDLE9BQU8sMkNBQWMsQ0FDbkIsR0FBRyxFQUNILEVBQUUsRUFBRSxFQUFFLE9BQUEsR0FBRyxDQUFDLEVBQUUsMENBQUUsV0FBVyxPQUFNLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFDdkMsT0FBTyxFQUNQLElBQUksQ0FDTCxDQUFDO0tBQ0g7SUFFRCxRQUFPLEdBQUcsYUFBSCxHQUFHLGNBQUgsR0FBRyxHQUFJLElBQUksRUFBQztBQUNyQixDQUFDLENBQUEsQ0FBQztBQUVGLE1BQU0sZ0JBQWdCLEdBQThCO0lBQ2xELFVBQVU7SUFDVixRQUFRO0NBQ1QsQ0FBQztBQUVGLGtCQUFlLGdCQUFnQixDQUFDIn0=