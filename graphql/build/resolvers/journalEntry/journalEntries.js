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
                    const descendants = yield db.collection("departments").aggregate([
                        { $match: { "_id": matchCondition(deptCond, toObjectId) } },
                        { $graphLookup: {
                                from: "departments",
                                startWith: "$_id",
                                connectFromField: "_id",
                                connectToField: "parent.id",
                                as: "descendants"
                            } },
                        { $project: {
                                _id: true,
                                "descendants._id": true
                            } }
                    ]).toArray();
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
                    filterQuery["department.0.value.id"]
                        = matchCondition(deptCond, toObjectId);
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
                filterQuery.$or =
                    yield Promise.all(where[key].map((where) => filter(where, db)));
                break;
            case "and":
                filterQuery.$and =
                    yield Promise.all(where[key].map((where) => filter(where, db)));
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
    const results = yield db.collection("journalEntries")
        .aggregate(pipeline).toArray();
    return results;
});
exports.default = journalEntries;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam91cm5hbEVudHJpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2pvdXJuYWxFbnRyeS9qb3VybmFsRW50cmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHFDQUE2RDtBQUU3RCxtQ0FBMkM7QUFTM0MsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFDekIsTUFBTSx1QkFBdUIsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDO0FBQ3JELE1BQU0sY0FBYyxHQUFHLENBQUMsSUFBYyxFQUNwQyxnQkFBZ0IsR0FBRyx1QkFBdUIsRUFBRSxTQUF3QixFQUFFLEVBQUUsRUFBRTs7SUFHMUUsS0FBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBNEIsRUFBRTtRQUU3RCxvQ0FBb0M7UUFDcEMsSUFBRyxNQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsdUNBQUksT0FBTyxFQUFDLEtBQUssT0FBTyxFQUFFO1lBQ3JDLFNBQVM7U0FDVjtRQUVELFFBQU8sR0FBRyxFQUFFO1lBRVYsS0FBSyxJQUFJO2dCQUNQLE1BQU0sQ0FBQyxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLE1BQU07WUFFUixLQUFLLElBQUk7Z0JBQ1AsTUFBTSxDQUFDLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDekMsTUFBTTtZQUVSLEtBQUssSUFBSTtnQkFDUCxNQUFNLENBQUMsR0FBRyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNO1lBRVIsS0FBSyxLQUFLO2dCQUNSLE1BQU0sQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFD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