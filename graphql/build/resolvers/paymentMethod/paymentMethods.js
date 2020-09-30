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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudE1ldGhvZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL3BheW1lbnRNZXRob2QvcGF5bWVudE1ldGhvZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU9BLHFDQUFnRDtBQUNoRCxrRUFFMEM7QUFDMUMsc0ZBQWdGO0FBQ2hGLG1DQUFxQztBQUVyQyxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQztBQUV6QixNQUFNLHdCQUF3QixHQUd6QixDQUFPLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUN4QixRQUFRLEdBQUcsRUFBRTtRQUNYLEtBQUssUUFBUTtZQUNYLE9BQU87Z0JBQ0wsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsU0FBUyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRTthQUMxQixDQUFDO1FBQ0osS0FBSyxNQUFNO1lBQ1QsT0FBTztnQkFDTCxLQUFLLEVBQUUsR0FBRztnQkFDVixTQUFTLEVBQUUsTUFBTSwrQkFBc0IsQ0FDckMsS0FBb0MsQ0FDckM7YUFDRixDQUFDO1FBQ0osS0FBSyxRQUFRO1lBQ1gsT0FBTztnQkFDTCxLQUFLLEVBQUUsR0FBRztnQkFDVixTQUFTLEVBQUUsTUFBTSwrQkFBc0IsQ0FDckMsS0FBc0MsRUFDdEMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUNyQzthQUNGLENBQUM7UUFDSixLQUFLLE9BQU87WUFDVixPQUFPO2dCQUNMLEtBQUssRUFBRSxHQUFHO2dCQUNWLFNBQVMsRUFBRSxNQUFNLCtCQUFzQixDQUNyQyxLQUFxQyxDQUN0QzthQUNGLENBQUM7S0FDTDtBQUNILENBQUMsQ0FBQSxDQUFDO0FBRUYsTUFBTSxjQUFjLEdBQUcsQ0FDckIsVUFBb0MsRUFDVCxFQUFFO0lBQzdCLElBQUksQ0FBQyxVQUFVLEVBQUU7UUFDZixPQUFPLEVBQUUsQ0FBQztLQUNYO0lBRUQsTUFBTSxFQUFFLFNBQVMsS0FBZSxVQUFVLEVBQXZCLHlDQUF1QixDQUFDO0lBRTNDLE1BQU0sU0FBUyxHQUFHLE1BQU0scUJBQU0sQ0FBQyxLQUFLLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztJQUVoRSxJQUFJLEVBQUMsU0FBUyxhQUFULFNBQVMsY0FBVCxTQUFTLEdBQUksT0FBTyxFQUFDLEtBQUssT0FBTyxFQUFFO1FBQ3RDLE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0lBRUQsTUFBTSxJQUFJLEdBQXVCLEVBQUUsQ0FBQztJQUVwQyxJQUFJLFNBQVMsRUFBRTtRQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUNuRTtTQUFNO1FBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNSLEdBQUcsRUFBRTtnQkFDSCxFQUFFLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDOUIsRUFBRSxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTthQUN2QztTQUNGLENBQUMsQ0FBQztLQUNKO0lBRUQsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN0QjtJQUVELE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUNsQixDQUFDLENBQUEsQ0FBQztBQUVXLFFBQUEsY0FBYyxHQUFxQyxDQUM5RCxNQUFNLEVBQ04sSUFBSSxFQUNKLE9BQU8sRUFDUCxJQUFJLEVBQ0osRUFBRTtJQUNGLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFdkIsTUFBTSxXQUFXLEdBQXFCLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUV2RSxNQUFNLGdCQUFnQixHQUFHLE1BQU0sRUFBRTtTQUM5QixVQUFVLENBQUMsZ0JBQWdCLENBQUM7U0FDNUIsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQVYsa0JBQVUsRUFBRSxDQUFDLENBQUM7U0FDcEQsT0FBTyxFQUFFLENBQUM7SUFFYixPQUFPLGdCQUFnQixDQUFDO0FBQzFCLENBQUMsQ0FBQSxDQUFDO0FBRUYsa0JBQWUsc0JBQWMsQ0FBQyJ9