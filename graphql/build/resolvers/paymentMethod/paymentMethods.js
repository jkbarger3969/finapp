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
exports.paymentMethods = void 0;
const mongodb_1 = require("mongodb");
const filterQuery_1 = require("../utils/filterQuery/filterQuery");
const mapComarisonOperators_1 = require("../utils/filterQuery/mapComarisonOperators");
const utils_1 = require("./utils");
const NULLISH = Symbol();
const filedAndConditionCreator = (key, value) => __awaiter(void 0, void 0, void 0, function* () {
    switch (key) {
        case "active":
            return {
                field: key,
                condition: { $eq: value },
            };
        case "name":
            return {
                field: key,
                condition: yield mapComarisonOperators_1.default(value),
            };
        case "parent":
            return {
                field: key,
                condition: yield mapComarisonOperators_1.default(value, (id) => (id ? new mongodb_1.ObjectId(id) : id)),
            };
        case "refId":
            return {
                field: key,
                condition: yield mapComarisonOperators_1.default(value),
            };
    }
});
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
exports.paymentMethods = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const filterQuery = yield getFilterQuery(args.where);
    const payMethodResults = yield db
        .collection("paymentMethods")
        .aggregate([{ $match: filterQuery }, { $addFields: utils_1.$addFields }])
        .toArray();
    return payMethodResults;
});
exports.default = exports.paymentMethods;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudE1ldGhvZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL3BheW1lbnRNZXRob2QvcGF5bWVudE1ldGhvZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFPQSxxQ0FBZ0Q7QUFDaEQsa0VBRTBDO0FBQzFDLHNGQUFnRjtBQUNoRixtQ0FBcUM7QUFFckMsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFFekIsTUFBTSx3QkFBd0IsR0FHekIsQ0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7SUFDeEIsUUFBUSxHQUFHLEVBQUU7UUFDWCxLQUFLLFFBQVE7WUFDWCxPQUFPO2dCQUNMLEtBQUssRUFBRSxHQUFHO2dCQUNWLFNBQVMsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUU7YUFDMUIsQ0FBQztRQUNKLEtBQUssTUFBTTtZQUNULE9BQU87Z0JBQ0wsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsU0FBUyxFQUFFLE1BQU0sK0JBQXNCLENBQ3JDLEtBQW9DLENBQ3JDO2FBQ0YsQ0FBQztRQUNKLEtBQUssUUFBUTtZQUNYLE9BQU87Z0JBQ0wsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsU0FBUyxFQUFFLE1BQU0sK0JBQXNCLENBQ3JDLEtBQXNDLEVBQ3RDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FDckM7YUFDRixDQUFDO1FBQ0osS0FBSyxPQUFPO1lBQ1YsT0FBTztnQkFDTCxLQUFLLEVBQUUsR0FBRztnQkFDVixTQUFTLEVBQUUsTUFBTSwrQkFBc0IsQ0FDckMsS0FBcUMsQ0FDdEM7YUFDRixDQUFDO0tBQ0w7QUFDSCxDQUFDLENBQUEsQ0FBQztBQUVGLE1BQU0sY0FBYyxHQUFHLENBQ3JCLFVBQW9DLEVBQ1QsRUFBRTtJQUM3QixJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ2YsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUVELE1BQU0sRUFBRSxTQUFTLEtBQWUsVUFBVSxFQUFwQixLQUFLLFVBQUssVUFBVSxFQUFwQyxhQUF1QixDQUFhLENBQUM7SUFFM0MsTUFBTSxTQUFTLEdBQUcsTUFBTSxxQkFBTSxDQUFDLEtBQUssRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0lBRWhFLElBQUksQ0FBQyxTQUFTLGFBQVQsU0FBUyxjQUFULFNBQVMsR0FBSSxPQUFPLENBQUMsS0FBSyxPQUFPLEVBQUU7UUFDdEMsT0FBTyxTQUFTLENBQUM7S0FDbEI7SUFFRCxNQUFNLElBQUksR0FBdUIsRUFBRSxDQUFDO0lBRXBDLElBQUksU0FBUyxFQUFFO1FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ25FO1NBQU07UUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ1IsR0FBRyxFQUFFO2dCQUNILEVBQUUsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUM5QixFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO2FBQ3ZDO1NBQ0YsQ0FBQyxDQUFDO0tBQ0o7SUFFRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3RCO0lBRUQsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ2xCLENBQUMsQ0FBQSxDQUFDO0FBRVcsUUFBQSxjQUFjLEdBQXFDLENBQzlELE1BQU0sRUFDTixJQUFJLEVBQ0osT0FBTyxFQUNQLElBQUksRUFDSixFQUFFO0lBQ0YsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQztJQUV2QixNQUFNLFdBQVcsR0FBcUIsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXZFLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxFQUFFO1NBQzlCLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztTQUM1QixTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBVixrQkFBVSxFQUFFLENBQUMsQ0FBQztTQUNwRCxPQUFPLEVBQUUsQ0FBQztJQUViLE9BQU8sZ0JBQWdCLENBQUM7QUFDMUIsQ0FBQyxDQUFBLENBQUM7QUFFRixrQkFBZSxzQkFBYyxDQUFDIn0=