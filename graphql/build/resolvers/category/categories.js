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
exports.categories = exports.whereCategories = void 0;
const change_case_1 = require("change-case");
const iterableFns_1 = require("../../utils/iterableFns");
const queryUtils_1 = require("../utils/queryUtils");
const whereCategories = (categoryWhere, db) => {
    const filterQuery = {};
    const promises = [];
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(categoryWhere)) {
        switch (whereKey) {
            // Fields
            case "id":
                {
                    const result = (0, queryUtils_1.whereTreeId)(categoryWhere[whereKey], (rangeOp, id) => __awaiter(void 0, void 0, void 0, function* () {
                        const result = rangeOp === "gte" || rangeOp === "lte" ? [id] : [];
                        switch (rangeOp) {
                            case "gt":
                            case "gte":
                                {
                                    let parentDoc = yield db
                                        .collection("categories")
                                        .findOne({ _id: id }, {
                                        projection: {
                                            parent: true,
                                        },
                                    });
                                    while (parentDoc && parentDoc.parent) {
                                        result.push(parentDoc.parent);
                                        parentDoc = yield db
                                            .collection("categories")
                                            .findOne({ _id: parentDoc.parent }, {
                                            projection: {
                                                parent: true,
                                            },
                                        });
                                    }
                                }
                                break;
                            case "lt":
                            case "lte":
                                {
                                    const opts = {
                                        projection: {
                                            _id: true,
                                        },
                                    };
                                    const mapFn = ({ _id }) => _id;
                                    const queue = (yield db
                                        .collection("categories")
                                        .find({ parent: id }, opts)
                                        .toArray()).map(mapFn);
                                    while (queue.length) {
                                        result.push(...queue);
                                        queue.push(...(yield db
                                            .collection("categories")
                                            .find({ parent: { $in: queue.splice(0) } }, opts)
                                            .toArray()).map(mapFn));
                                    }
                                }
                                break;
                        }
                        return result;
                    }));
                    if (result instanceof Promise) {
                        promises.push(result.then((result) => {
                            filterQuery["_id"] = result;
                        }));
                    }
                    else {
                        filterQuery["_id"] = result;
                    }
                }
                break;
            case "name":
                filterQuery["name"] = (0, queryUtils_1.whereRegex)(categoryWhere[whereKey]);
                break;
            case "type":
                filterQuery["type"] = (0, change_case_1.pascalCase)(categoryWhere[whereKey]);
                break;
            case "parent":
                filterQuery["parent"] = (0, queryUtils_1.whereId)(categoryWhere[whereKey]);
                break;
            case "active":
                filterQuery["active"] = categoryWhere[whereKey];
                break;
            case "hidden":
                filterQuery["hidden"] = categoryWhere[whereKey];
                break;
            case "groupName":
                filterQuery["groupName"] = (0, queryUtils_1.whereRegex)(categoryWhere[whereKey]);
                break;
            // Logic
            case "and":
                {
                    let hasPromise = false;
                    const $and = categoryWhere[whereKey].map((where) => {
                        const result = (0, exports.whereCategories)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($and).then(($and) => {
                            filterQuery.$and = $and;
                        }));
                    }
                    else {
                        filterQuery.$and = $and;
                    }
                }
                break;
            case "or":
                {
                    let hasPromise = false;
                    const $or = categoryWhere[whereKey].map((where) => {
                        const result = (0, exports.whereCategories)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($or).then(($or) => {
                            filterQuery.$or = $or;
                        }));
                    }
                    else {
                        filterQuery.$or = $or;
                    }
                }
                break;
            case "nor":
                {
                    let hasPromise = false;
                    const $nor = categoryWhere[whereKey].map((where) => {
                        const result = (0, exports.whereCategories)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($nor).then(($nor) => {
                            filterQuery.$nor = $nor;
                        }));
                    }
                    else {
                        filterQuery.$nor = $nor;
                    }
                }
                break;
            case "root":
                if (!("$and" in filterQuery)) {
                    filterQuery.$and = [];
                }
                filterQuery.$and.push({
                    parent: categoryWhere[whereKey] ? null : { $ne: null },
                });
                break;
        }
    }
    if (promises.length) {
        return Promise.all(promises).then(() => filterQuery);
    }
    return filterQuery;
};
exports.whereCategories = whereCategories;
const categories = (_, { where }, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    return accountingDb.find({
        collection: "categories",
        filter: where ? yield (0, exports.whereCategories)(where, accountingDb.db) : {},
    });
});
exports.categories = categories;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2F0ZWdvcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvY2F0ZWdvcnkvY2F0ZWdvcmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSw2Q0FBeUM7QUFHekMseURBQXlEO0FBQ3pELG9EQUF1RTtBQUVoRSxNQUFNLGVBQWUsR0FBRyxDQUM3QixhQUE4QixFQUM5QixFQUFNLEVBQ2dELEVBQUU7SUFDeEQsTUFBTSxXQUFXLEdBQXFCLEVBQUUsQ0FBQztJQUV6QyxNQUFNLFFBQVEsR0FBb0IsRUFBRSxDQUFDO0lBRXJDLEtBQUssTUFBTSxRQUFRLElBQUksSUFBQSw0QkFBYyxFQUFDLGFBQWEsQ0FBQyxFQUFFO1FBQ3BELFFBQVEsUUFBUSxFQUFFO1lBQ2hCLFNBQVM7WUFDVCxLQUFLLElBQUk7Z0JBQ1A7b0JBQ0UsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBVyxFQUN4QixhQUFhLENBQUMsUUFBUSxDQUFDLEVBQ3ZCLENBQU8sT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFO3dCQUNwQixNQUFNLE1BQU0sR0FDVixPQUFPLEtBQUssS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzt3QkFFckQsUUFBUSxPQUFPLEVBQUU7NEJBQ2YsS0FBSyxJQUFJLENBQUM7NEJBQ1YsS0FBSyxLQUFLO2dDQUNSO29DQUVFLElBQUksU0FBUyxHQUFHLE1BQU0sRUFBRTt5Q0FDckIsVUFBVSxDQUFDLFlBQVksQ0FBQzt5Q0FDeEIsT0FBTyxDQUNOLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUNYO3dDQUNFLFVBQVUsRUFBRTs0Q0FDVixNQUFNLEVBQUUsSUFBSTt5Q0FDYjtxQ0FDRixDQUNGLENBQUM7b0NBRUosT0FBTyxTQUFTLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRTt3Q0FDcEMsTUFB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