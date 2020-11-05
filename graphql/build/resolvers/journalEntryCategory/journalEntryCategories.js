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
    if ((hasParent !== null && hasParent !== void 0 ? hasParent : NULLISH) === NULLISH) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJ5Q2F0ZWdvcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvam91cm5hbEVudHJ5Q2F0ZWdvcnkvam91cm5hbEVudHJ5Q2F0ZWdvcmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUNBQWdEO0FBRWhELGlEQU8wQjtBQUMxQixrRUFFMEM7QUFDMUMsc0ZBQWdGO0FBRWhGLE1BQU0sd0JBQXdCLEdBR3pCLENBQU8sR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO0lBQ3hCLFFBQVEsR0FBRyxFQUFFO1FBQ1gsS0FBSyxNQUFNO1lBQ1QsT0FBTztnQkFDTCxLQUFLLEVBQUUsR0FBRztnQkFDVixTQUFTLEVBQUUsTUFBTSwrQkFBc0IsQ0FDckMsS0FBMkMsQ0FDNUM7YUFDRixDQUFDO1FBQ0osS0FBSyxRQUFRO1lBQ1gsT0FBTztnQkFDTCxLQUFLLEVBQUUsR0FBRyxHQUFHLEtBQUs7Z0JBQ2xCLFNBQVMsRUFBRSxNQUFNLCtCQUFzQixDQUNyQyxLQUE2QyxFQUM3QyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQ3JDO2FBQ0YsQ0FBQztRQUNKLEtBQUssTUFBTTtZQUNULE9BQU87Z0JBQ0wsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsU0FBUyxFQUFFLE1BQU0sK0JBQXNCLENBQ3JDLEtBQTJDLEVBQzNDLENBQUMsSUFBc0IsRUFBRSxFQUFFLENBQ3pCLElBQUksS0FBSyw2QkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUN4RDthQUNGLENBQUM7S0FDTDtBQUNILENBQUMsQ0FBQSxDQUFDO0FBRUYsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFFekIsTUFBTSxjQUFjLEdBQUcsQ0FDckIsVUFBMkMsRUFDaEIsRUFBRTtJQUM3QixJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ2YsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUVELE1BQU0sRUFBRSxTQUFTLEtBQWUsVUFBVSxFQUFwQixLQUFLLFVBQUssVUFBVSxFQUFwQyxhQUF1QixDQUFhLENBQUM7SUFFM0MsTUFBTSxTQUFTLEdBQUcsTUFBTSxxQkFBTSxDQUFDLEtBQUssRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0lBRWhFLElBQUksQ0FBQyxTQUFTLGFBQVQsU0FBUyxjQUFULFNBQVMsR0FBSSxPQUFPLENBQUMsS0FBSyxPQUFPLEVBQUU7UUFDdEMsT0FBTyxTQUFTLENBQUM7S0FDbEI7SUFFRCxNQUFNLElBQUksR0FBdUIsRUFBRSxDQUFDO0lBRXBDLElBQUksU0FBUyxFQUFFO1FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ25FO1NBQU07UUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ1IsR0FBRyxFQUFFO2dCQUNILEVBQUUsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUM5QixFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO2FBQ3ZDO1NBQ0YsQ0FBQyxDQUFDO0tBQ0o7SUFFRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3RCO0lBRUQsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ2xCLENBQUMsQ0FBQSxDQUFDO0FBRUYsTUFBTSxzQkFBc0IsR0FBNkMsQ0FDdkUsR0FBRyxFQUNILElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRXZCLE1BQU0sV0FBVyxHQUFxQixNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFdkUsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFO1NBQ3JCLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQztTQUNwQyxTQUFTLENBQUM7UUFDVCxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUU7UUFDdkIsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtLQUM5QyxDQUFDO1NBQ0QsT0FBTyxFQUFFLENBQUM7SUFFYixPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDLENBQUEsQ0FBQztBQUVGLGtCQUFlLHNCQUFzQixDQUFDIn0=