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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const graphTypes_1 = require("../../graphTypes");
const filterQuery_1 = require("../utils/filterQuery/filterQuery");
const mapComarisonOperators_1 = require("../utils/filterQuery/mapComarisonOperators");
const filedAndConditionCreator = (key, value) => __awaiter(void 0, void 0, void 0, function* () {
    switch (key) {
        case "name":
            return {
                field: key,
                condition: yield mapComarisonOperators_1.default(value),
            };
        case "parent":
            return {
                field: `${key}.id`,
                condition: yield mapComarisonOperators_1.default(value, (id) => (id ? new mongodb_1.ObjectId(id) : id)),
            };
        case "type":
            return {
                field: key,
                condition: yield mapComarisonOperators_1.default(value, (type) => type === graphTypes_1.JournalEntryType.Credit ? "credit" : "debit"),
            };
    }
});
const NULLISH = Symbol();
const getFilterQuery = (whereInput) => __awaiter(void 0, void 0, void 0, function* () {
    if (!whereInput) {
        return {};
    }
    const { hasParent } = whereInput, where = __rest(whereInput, ["hasParent"]);
    const condition = yield filterQuery_1.default(where, filedAndConditionCreator);
    if (((hasParent !== null && hasParent !== void 0 ? hasParent : NULLISH)) === NULLISH) {
        return condition;
    }
    const $and = [];
    if (hasParent) {
        $and.push({ parent: { $exists: true, $nin: [undefined, null] } });
    }
    else {
        $and.push({
            $or: [
                { parent: { $exists: false } },
                { parent: { $in: [undefined, null] } },
            ],
        });
    }
    if (Object.keys(condition).length > 0) {
        $and.push(condition);
    }
    return { $and };
});
const journalEntryCategories = (obj, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const filterQuery = yield getFilterQuery(args.where);
    const results = yield db
        .collection("journalEntryCategories")
        .aggregate([
        { $match: filterQuery },
        { $addFields: { id: { $toString: "$_id" } } },
    ])
        .toArray();
    return results;
});
exports.default = journalEntryCategories;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5Q2F0ZWdvcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvam91cm5hbEVudHJ5Q2F0ZWdvcnkvam91cm5hbEVudHJ5Q2F0ZWdvcmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUNBQWdEO0FBRWhELGlEQU8wQjtBQUMxQixrRUFFMEM7QUFDMUMsc0ZBQWdGO0FBRWhGLE1BQU0sd0JBQXdCLEdBR3pCLENBQU8sR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO0lBQ3hCLFFBQVEsR0FBRyxFQUFFO1FBQ1gsS0FBSyxNQUFNO1lBQ1QsT0FBTztnQkFDTCxLQUFLLEVBQUUsR0FBRztnQkFDVixTQUFTLEVBQUUsTUFBTSwrQkFBc0IsQ0FDckMsS0FBMkMsQ0FDNUM7YUFDRixDQUFDO1FBQ0osS0FBSyxRQUFRO1lBQ1gsT0FBTztnQkFDTCxLQUFLLEVBQUUsR0FBRyxHQUFHLEtBQUs7Z0JBQ2xCLFNBQVMsRUFBRSxNQUFNLCtCQUFzQixDQUNyQyxLQUE2QyxFQUM3QyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQ3JDO2FBQ0YsQ0FBQztRQUNKLEtBQUssTUFBTTtZQUNULE9BQU87Z0JBQ0wsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsU0FBUyxFQUFFLE1BQU0sK0JBQXNCLENBQ3JDLEtBQTJDLEVBQzNDLENBQUMsSUFBc0IsRUFBRSxFQUFFLENBQ3pCLElBQUksS0FBSyw2QkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUN4RDthQUNGLENBQUM7S0FDTDtBQUNILENBQUMsQ0FBQSxDQUFDO0FBRUYsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFFekIsTUFBTSxjQUFjLEdBQUcsQ0FDckIsVUFBMkMsRUFDaEIsRUFBRTtJQUM3QixJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ2YsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUVELE1BQU0sRUFBRSxTQUFTLEtBQWUsVUFBVSxFQUF2Qix5Q0FBdUIsQ0FBQztJQUUzQyxNQUFNLFNBQVMsR0FBRyxNQUFNLHFCQUFNLENBQUMsS0FBSyxFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFFaEUsSUFBSSxFQUFDLFNBQVMsYUFBVCxTQUFTLGNBQVQsU0FBUyxHQUFJLE9BQU8sRUFBQyxLQUFLLE9BQU8sRUFBRTtRQUN0QyxPQUFPLFNBQVMsQ0FBQztLQUNsQjtJQUVELE1BQU0sSUFBSSxHQUF1QixFQUFFLENBQUM7SUFFcEMsSUFBSSxTQUFTLEVBQUU7UUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDbkU7U0FBTTtRQUNMLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDUixHQUFHLEVBQUU7Z0JBQ0gsRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQzlCLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7YUFDdkM7U0FDRixDQUFDLENBQUM7S0FDSjtJQUVELElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDdEI7SUFFRCxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDbEIsQ0FBQyxDQUFBLENBQUM7QUFFRixNQUFNLHNCQUFzQixHQUE2QyxDQUN2RSxHQUFHLEVBQ0gsSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTtJQUNGLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFdkIsTUFBTSxXQUFXLEdBQXFCLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUV2RSxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUU7U0FDckIsVUFBVSxDQUFDLHdCQUF3QixDQUFDO1NBQ3BDLFNBQVMsQ0FBQztRQUNULEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRTtRQUN2QixFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFO0tBQzlDLENBQUM7U0FDRCxPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUMsQ0FBQSxDQUFDO0FBRUYsa0JBQWUsc0JBQXNCLENBQUMifQ==