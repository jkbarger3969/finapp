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
const mongodb_1 = require("mongodb");
const utils_1 = require("./utils");
const NULLISH = Symbol();
const condValTransformDefault = (condVal) => condVal;
const matchCondition = (cond, condValTransform = condValTransformDefault, _cond_ = {}) => {
    var _a;
    for (const key of Object.keys(cond)) {
        // skip null or undefined conditions
        if ((_a = cond[key], (_a !== null && _a !== void 0 ? _a : NULLISH)) === NULLISH) {
            continue;
        }
        switch (key) {
            case "eq":
                _cond_.$eq = condValTransform(cond[key]);
                break;
            case "ne":
                _cond_.$ne = condValTransform(cond[key]);
                break;
            case "in":
                _cond_.$in = condValTransform(cond[key]);
                break;
            case "nin":
                _cond_.$nin = condValTransform(cond[key]);
                break;
            case "gt":
                _cond_.$gt = condValTransform(cond[key]);
                break;
            case "gte":
                _cond_.$gte = condValTransform(cond[key]);
                break;
            case "lt":
                _cond_.$lt = condValTransform(cond[key]);
                break;
            case "lte":
                _cond_.$lte = condValTransform(cond[key]);
                break;
        }
    }
    return _cond_;
};
const toObjectId = (id) => {
    if (Array.isArray(id)) {
        return id.map((id) => new mongodb_1.ObjectID(id));
    }
    return new mongodb_1.ObjectID(id);
};
const dateStrToDate = (date) => new Date(date);
const filter = (where, db) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const filterQuery = {};
    for (const key of Object.keys(where)) {
        // skip null or undefined filters
        if ((_a = where[key], (_a !== null && _a !== void 0 ? _a : NULLISH)) === NULLISH) {
            continue;
        }
        switch (key) {
            case "department": {
                const deptCond = where[key];
                if ((_b = deptCond) === null || _b === void 0 ? void 0 : _b.includeDescendants) {
                    const descendants = yield db
                        .collection("departments")
                        .aggregate([
                        { $match: { _id: matchCondition(deptCond, toObjectId) } },
                        {
                            $graphLookup: {
                                from: "departments",
                                startWith: "$_id",
                                connectFromField: "_id",
                                connectToField: "parent.id",
                                as: "descendants",
                            },
                        },
                        {
                            $project: {
                                _id: true,
                                "descendants._id": true,
                            },
                        },
                    ])
                        .toArray();
                    const ids = descendants.reduce((ids, doc) => {
                        ids.add(doc._id);
                        for (const { _id } of doc.descendants) {
                            ids.add(_id);
                        }
                        return ids;
                    }, new Set());
                    filterQuery["department.0.value.id"] = { $in: Array.from(ids) };
                }
                else {
                    filterQuery["department.0.value.id"] = matchCondition(deptCond, toObjectId);
                }
                break;
            }
            case "reconciled":
                filterQuery["reconciled.0.value"] = { $eq: where[key] };
                break;
            case "deleted":
                filterQuery["deleted.0.value"] = { $eq: where[key] };
                break;
            case "lastUpdate":
                filterQuery["lastUpdate"] = matchCondition(where[key], dateStrToDate);
                break;
            case "lastUpdateRefund":
                filterQuery["refunds.lastUpdate"] = matchCondition(where[key], dateStrToDate);
                break;
            case "or":
                filterQuery.$or = yield Promise.all(where[key].map((where) => filter(where, db)));
                break;
            case "and":
                filterQuery.$and = yield Promise.all(where[key].map((where) => filter(where, db)));
                break;
        }
    }
    return filterQuery;
});
const journalEntries = (parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    const { db } = context;
    const pipeline = [];
    const { where } = args;
    if (where) {
        const $match = yield filter(where, db);
        pipeline.push({ $match });
    }
    pipeline.push(utils_1.stages.entryAddFields, utils_1.stages.entryTransmutations);
    const results = yield db
        .collection("journalEntries")
        .aggregate(pipeline)
        .toArray();
    return results;
});
exports.default = journalEntries;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS9qb3VybmFsRW50cmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHFDQUErRDtBQUUvRCxtQ0FBaUM7QUFjakMsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFDekIsTUFBTSx1QkFBdUIsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDO0FBQ3JELE1BQU0sY0FBYyxHQUFHLENBQ3JCLElBQWUsRUFDZixnQkFBZ0IsR0FBRyx1QkFBdUIsRUFDMUMsU0FBeUIsRUFBRSxFQUMzQixFQUFFOztJQUNGLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQTRCLEVBQUU7UUFDOUQsb0NBQW9DO1FBQ3BDLElBQUksTUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLHVDQUFJLE9BQU8sRUFBQyxLQUFLLE9BQU8sRUFBRTtZQUN0QyxTQUFTO1NBQ1Y7UUFFRCxRQUFRLEdBQUcsRUFBRTtZQUNYLEtBQUssSUFBSTtnQkFDUCxNQUFNLENBQUMsR0FBRyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNO1lBRVIsS0FBSyxJQUFJO2dCQUNQLE1BQU0sQ0FBQyxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLE1BQU07WUFFUixLQUFLLElBQUk7Z0JBQ1AsTUFBTSxDQUFDLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDekMsTUFBTTtZQUVSLEtBQUssS0FBSztnQkFDUixNQUFNLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FB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