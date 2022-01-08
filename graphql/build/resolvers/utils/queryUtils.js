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
exports.whereInt = exports.whereRational = exports.whereDate = exports.addTypename = exports.whereRegex = exports.whereNode = exports.whereTreeId = exports.whereId = void 0;
const mongodb_1 = require("mongodb");
const graphTypes_1 = require("../../graphTypes");
const iterableFns_1 = require("../../utils/iterableFns");
const mongoRational_1 = require("../../utils/mongoRational");
const whereId = (whereId) => {
    const querySelector = {};
    for (const idKey of (0, iterableFns_1.iterateOwnKeys)(whereId)) {
        switch (idKey) {
            case "eq":
                querySelector.$eq = new mongodb_1.ObjectId(whereId[idKey]);
                break;
            case "ne":
                querySelector.$ne = new mongodb_1.ObjectId(whereId[idKey]);
                break;
            case "in":
                querySelector.$in = whereId[idKey].map((id) => new mongodb_1.ObjectId(id));
                break;
            case "nin":
                querySelector.$nin = whereId[idKey].map((id) => new mongodb_1.ObjectId(id));
                break;
        }
    }
    return querySelector;
};
exports.whereId = whereId;
const whereTreeId = (whereTreeId, getRangeIds) => {
    const promises = [];
    const querySelector = {};
    for (const idKey of (0, iterableFns_1.iterateOwnKeys)(whereTreeId)) {
        switch (idKey) {
            case "eq":
                querySelector.$eq = new mongodb_1.ObjectId(whereTreeId[idKey]);
                break;
            case "ne":
                querySelector.$ne = new mongodb_1.ObjectId(whereTreeId[idKey]);
                break;
            case "in":
                querySelector.$in = whereTreeId[idKey].map((id) => new mongodb_1.ObjectId(id));
                break;
            case "nin":
                querySelector.$nin = whereTreeId[idKey].map((id) => new mongodb_1.ObjectId(id));
                break;
            // Range
            case "gt":
            case "gte":
            case "lt":
            case "lte":
                {
                    const result = getRangeIds(idKey, new mongodb_1.ObjectId(whereTreeId[idKey]));
                    if (result instanceof Promise) {
                        promises.push(result.then((ids) => {
                            querySelector.$in = ids;
                        }));
                    }
                    else {
                        querySelector.$in = result;
                    }
                }
                break;
        }
    }
    if (promises.length) {
        return Promise.all(promises).then(() => querySelector);
    }
    return querySelector;
};
exports.whereTreeId = whereTreeId;
/**
 * @returns Mongodb "$and" logic operator expression.
 * https://docs.mongodb.com/manual/reference/operator/query/and/#op._S_and
 * */
const whereNode = (whereNode, nodeFieldPath) => {
    const $and = [];
    const getNodeFieldPath = typeof nodeFieldPath === "string" ? () => nodeFieldPath : nodeFieldPath;
    for (const idKey of (0, iterableFns_1.iterateOwnKeys)(whereNode)) {
        switch (idKey) {
            case "eq":
                {
                    const { id, type } = whereNode[idKey];
                    $and.push({
                        [`${getNodeFieldPath(type)}.type`]: type,
                        [`${getNodeFieldPath(type)}.id`]: new mongodb_1.ObjectId(id),
                    });
                }
                break;
            case "ne":
                {
                    const { id, type } = whereNode[idKey];
                    $and.push({
                        $or: [
                            {
                                [`${getNodeFieldPath(type)}.type`]: { $ne: type },
                            },
                            {
                                [`${getNodeFieldPath(type)}.id`]: { $ne: new mongodb_1.ObjectId(id) },
                            },
                        ],
                    });
                }
                break;
            case "in":
                $and.push({
                    $or: whereNode[idKey].map(({ id, type }) => ({
                        [`${getNodeFieldPath(type)}.type`]: type,
                        [`${getNodeFieldPath(type)}.id`]: new mongodb_1.ObjectId(id),
                    })),
                });
                break;
            case "nin":
                $and.push({
                    $nor: whereNode[idKey].map(({ id, type }) => ({
                        [`${getNodeFieldPath(type)}.type`]: type,
                        [`${getNodeFieldPath(type)}.id`]: new mongodb_1.ObjectId(id),
                    })),
                });
                break;
        }
    }
    return $and;
};
exports.whereNode = whereNode;
const _whereRegexFlags = function* (flags) {
    for (const flag of flags) {
        switch (flag) {
            case graphTypes_1.RegexFlags.G:
                yield "g";
                break;
            case graphTypes_1.RegexFlags.I:
                yield "i";
                break;
            case graphTypes_1.RegexFlags.M:
                yield "m";
                break;
            case graphTypes_1.RegexFlags.S:
                yield "s";
                break;
        }
    }
};
const whereRegex = ({ pattern, flags, }) => {
    if (flags && flags.length) {
        return {
            $regex: new RegExp(pattern, ..._whereRegexFlags(flags)),
        };
    }
    return {
        $regex: new RegExp(pattern),
    };
};
exports.whereRegex = whereRegex;
const addTypename = (typename, query) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield query;
    if (Array.isArray(result)) {
        return result.map((doc) => {
            doc.__typename = typename;
            return doc;
        });
    }
    else {
        result.__typename = typename;
        return result;
    }
});
exports.addTypename = addTypename;
const whereDate = (dateWhere) => {
    const querySelector = {};
    for (const [whereKey, date] of (0, iterableFns_1.iterateOwnKeyValues)(dateWhere)) {
        switch (whereKey) {
            case "eq":
                querySelector.$eq = date;
                break;
            case "ne":
                querySelector.$ne = date;
                break;
            case "gt":
                querySelector.$gt = date;
                break;
            case "gte":
                querySelector.$gte = date;
                break;
            case "lt":
                querySelector.$lt = date;
                break;
            case "lte":
                querySelector.$lte = date;
                break;
        }
    }
    return querySelector;
};
exports.whereDate = whereDate;
/**
 * @returns Mongodb "$and" logic operator expression.
 * https://docs.mongodb.com/manual/reference/operator/query/and/#op._S_and
 * */
const whereRational = (lhs, whereRational) => {
    const $and = [];
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(whereRational)) {
        switch (whereKey) {
            case "eq":
                $and.push({
                    $expr: (0, mongoRational_1.rationalComparison)(lhs, "$eq", whereRational[whereKey]),
                });
                break;
            case "ne":
                $and.push({
                    $expr: (0, mongoRational_1.rationalComparison)(lhs, "$ne", whereRational[whereKey]),
                });
                break;
            case "in":
                $and.push({
                    $expr: (0, mongoRational_1.rationalComparison)(lhs, "$in", whereRational[whereKey]),
                });
                break;
            case "nin":
                $and.push({
                    $expr: (0, mongoRational_1.rationalComparison)(lhs, "$nin", whereRational[whereKey]),
                });
                break;
            case "gt":
                $and.push({
                    $expr: (0, mongoRational_1.rationalComparison)(lhs, "$gt", whereRational[whereKey]),
                });
                break;
            case "gte":
                $and.push({
                    $expr: (0, mongoRational_1.rationalComparison)(lhs, "$gte", whereRational[whereKey]),
                });
                break;
            case "lt":
                $and.push({
                    $expr: (0, mongoRational_1.rationalComparison)(lhs, "$lt", whereRational[whereKey]),
                });
                break;
            case "lte":
                $and.push({
                    $expr: (0, mongoRational_1.rationalComparison)(lhs, "$lte", whereRational[whereKey]),
                });
                break;
        }
    }
    return $and;
};
exports.whereRational = whereRational;
const whereInt = (intWhere) => {
    const querySelector = {};
    for (const [whereKey, value] of (0, iterableFns_1.iterateOwnKeyValues)(intWhere)) {
        switch (whereKey) {
            case "eq":
                querySelector.$eq = value;
                break;
            case "ne":
                querySelector.$ne = value;
                break;
            case "gt":
                querySelector.$gt = value;
                break;
            case "gte":
                querySelector.$gte = value;
                break;
            case "lt":
                querySelector.$lt = value;
                break;
            case "lte":
                querySelector.$lte = value;
                break;
        }
    }
    return querySelector;
};
exports.whereInt = whereInt;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvcXVlcnlVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FJaUI7QUFFakIsaURBVTBCO0FBQzFCLHlEQUE4RTtBQUM5RSw2REFJbUM7QUFPNUIsTUFBTSxPQUFPLEdBQUcsQ0FBQyxPQUFnQixFQUEwQixFQUFFO0lBQ2xFLE1BQU0sYUFBYSxHQUEyQixFQUFFLENBQUM7SUFDakQsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFBLDRCQUFjLEVBQUMsT0FBTyxDQUFDLEVBQUU7UUFDM0MsUUFBUSxLQUFLLEVBQUU7WUFDYixLQUFLLElBQUk7Z0JBQ1AsYUFBYSxDQUFDLEdBQUcsR0FBRyxJQUFJLGtCQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2pELE1BQU07WUFDUixLQUFLLElBQUk7Z0JBQ1AsYUFBYSxDQUFDLEdBQUcsR0FBRyxJQUFJLGtCQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2pELE1BQU07WUFDUixLQUFLLElBQUk7Z0JBQ1AsYUFBYSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLGtCQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDakUsTUFBTTtZQUNSLEtBQUssS0FBSztnQkFDUixhQUFhLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxNQUFNO1NBQ1Q7S0FDRjtJQUNELE9BQU8sYUFBYSxDQUFDO0FBQ3ZCLENBQUMsQ0FBQztBQW5CVyxRQUFB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