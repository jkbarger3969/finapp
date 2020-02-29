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
const condValTransformDefault = condVal => condVal;
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
        return id.map(id => new mongodb_1.ObjectID(id));
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
                                as: "descendants"
                            }
                        },
                        {
                            $project: {
                                _id: true,
                                "descendants._id": true
                            }
                        }
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
            case "or":
                filterQuery.$or = yield Promise.all(where[key].map(where => filter(where, db)));
                break;
            case "and":
                filterQuery.$and = yield Promise.all(where[key].map(where => filter(where, db)));
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
    pipeline.push(utils_1.addFields, utils_1.project);
    const results = yield db
        .collection("journalEntries")
        .aggregate(pipeline)
        .toArray();
    return results;
});
exports.default = journalEntries;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS9qb3VybmFsRW50cmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHFDQUErRDtBQUUvRCxtQ0FBNkM7QUFjN0MsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFDekIsTUFBTSx1QkFBdUIsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUNuRCxNQUFNLGNBQWMsR0FBRyxDQUNyQixJQUFlLEVBQ2YsZ0JBQWdCLEdBQUcsdUJBQXVCLEVBQzFDLFNBQXlCLEVBQUUsRUFDM0IsRUFBRTs7SUFDRixLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUE0QixFQUFFO1FBQzlELG9DQUFvQztRQUNwQyxJQUFJLE1BQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyx1Q0FBSSxPQUFPLEVBQUMsS0FBSyxPQUFPLEVBQUU7WUFDdEMsU0FBUztTQUNWO1FBRUQsUUFBUSxHQUFHLEVBQUU7WUFDWCxLQUFLLElBQUk7Z0JBQ1AsTUFBTSxDQUFDLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDekMsTUFBTTtZQUVSLEtBQUssSUFBSTtnQkFDUCxNQUFNLENBQUMsR0FBRyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNO1lBRVIsS0FBSyxJQUFJO2dCQUNQLE1BQU0sQ0FBQyxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLE1BQU07WUFFUixLQUFLLEtBQUs7Z0JBQ1IsTUFBTSxDQUFDLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FB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