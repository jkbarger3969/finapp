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
const filterQuery_1 = require("../utils/filterQuery/filterQuery");
const mapComarisonOperators_1 = require("../utils/filterQuery/mapComarisonOperators");
const utils_1 = require("./utils");
const NULLISH = Symbol();
const filedAndConditionCreator = (key, value) => __awaiter(void 0, void 0, void 0, function* () {
    switch (key) {
        case "active":
            return {
                field: key,
                condition: { $eq: value }
            };
        case "name":
            return {
                field: key,
                condition: yield mapComarisonOperators_1.default(value)
            };
        case "parent":
            return {
                field: key,
                condition: yield mapComarisonOperators_1.default(value, id => (id ? new mongodb_1.ObjectID(id) : id))
            };
        case "refId":
            return {
                field: key,
                condition: yield mapComarisonOperators_1.default(value)
            };
    }
});
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
                { parent: { $in: [undefined, null] } }
            ]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudE1ldGhvZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL3BheW1lbnRNZXRob2QvcGF5bWVudE1ldGhvZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU9BLHFDQUFnRDtBQUNoRCxrRUFFMEM7QUFDMUMsc0ZBQWdGO0FBQ2hGLG1DQUFxQztBQUVyQyxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQztBQUV6QixNQUFNLHdCQUF3QixHQUd6QixDQUFPLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUN4QixRQUFRLEdBQUcsRUFBRTtRQUNYLEtBQUssUUFBUTtZQUNYLE9BQU87Z0JBQ0wsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsU0FBUyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRTthQUMxQixDQUFDO1FBQ0osS0FBSyxNQUFNO1lBQ1QsT0FBTztnQkFDTCxLQUFLLEVBQUUsR0FBRztnQkFDVixTQUFTLEVBQUUsTUFBTSwrQkFBc0IsQ0FDckMsS0FBb0MsQ0FDckM7YUFDRixDQUFDO1FBQ0osS0FBSyxRQUFRO1lBQ1gsT0FBTztnQkFDTCxLQUFLLEVBQUUsR0FBRztnQkFDVixTQUFTLEVBQUUsTUFBTSwrQkFBc0IsQ0FDckMsS0FBc0MsRUFDdEMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FDbkM7YUFDRixDQUFDO1FBQ0osS0FBSyxPQUFPO1lBQ1YsT0FBTztnQkFDTCxLQUFLLEVBQUUsR0FBRztnQkFDVixTQUFTLEVBQUUsTUFBTSwrQkFBc0IsQ0FDckMsS0FBcUMsQ0FDdEM7YUFDRixDQUFDO0tBQ0w7QUFDSCxDQUFDLENBQUEsQ0FBQztBQUVGLE1BQU0sY0FBYyxHQUFHLENBQ3JCLFVBQW9DLEVBQ1QsRUFBRTtJQUM3QixJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ2YsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUVELE1BQU0sRUFBRSxTQUFTLEtBQWUsVUFBVSxFQUF2Qix5Q0FBdUIsQ0FBQztJQUUzQyxNQUFNLFNBQVMsR0FBRyxNQUFNLHFCQUFNLENBQUMsS0FBSyxFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFFaEUsSUFBSSxFQUFDLFNBQVMsYUFBVCxTQUFTLGNBQVQsU0FBUyxHQUFJLE9BQU8sRUFBQyxLQUFLLE9BQU8sRUFBRTtRQUN0QyxPQUFPLFNBQVMsQ0FBQztLQUNsQjtJQUVELE1BQU0sSUFBSSxHQUF1QixFQUFFLENBQUM7SUFFcEMsSUFBSSxTQUFTLEVBQUU7UUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDbkU7U0FBTTtRQUNMLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDUixHQUFHLEVBQUU7Z0JBQ0gsRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQzlCLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7YUFDdkM7U0FDRixDQUFDLENBQUM7S0FDSjtJQUVELElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDdEI7SUFFRCxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDbEIsQ0FBQyxDQUFBLENBQUM7QUFFVyxRQUFBLGNBQWMsR0FBcUMsQ0FDOUQsTUFBTSxFQUNOLElBQUksRUFDSixPQUFPLEVBQ1AsSUFBSSxFQUNKLEVBQUU7SUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDO0lBRXZCLE1BQU0sV0FBVyxHQUFxQixNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFdkUsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLEVBQUU7U0FDOUIsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1NBQzVCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFWLGtCQUFVLEVBQUUsQ0FBQyxDQUFDO1NBQ3BELE9BQU8sRUFBRSxDQUFDO0lBRWIsT0FBTyxnQkFBZ0IsQ0FBQztBQUMxQixDQUFDLENBQUEsQ0FBQztBQUVGLGtCQUFlLHNCQUFjLENBQUMifQ==