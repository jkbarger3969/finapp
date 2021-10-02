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
exports.departments = exports.whereDepartments = void 0;
const mongodb_1 = require("mongodb");
const iterableFns_1 = require("../../utils/iterableFns");
const queryUtils_1 = require("../utils/queryUtils");
const whereDepartments = (deptWhere, db) => {
    const filterQuery = {};
    const promises = [];
    const getRangeIds = (rangeOp, id) => __awaiter(void 0, void 0, void 0, function* () {
        const result = rangeOp === "gte" || rangeOp === "lte" ? [id] : [];
        switch (rangeOp) {
            case "gt":
            case "gte":
                {
                    const opts = {
                        projection: {
                            parent: true,
                        },
                    };
                    let parentDoc = yield db
                        .collection("departments")
                        .findOne({ _id: id }, opts);
                    // Departments ALWAYS have a parent
                    // Do NOT included business parents.
                    while (parentDoc && parentDoc.parent.type === "Department") {
                        result.push(parentDoc.parent.id);
                        parentDoc = yield db
                            .collection("departments")
                            .findOne({ _id: parentDoc.parent.id }, opts);
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
                        .collection("departments")
                        .find({
                        "parent.type": "Department",
                        "parent.id": id,
                    }, opts)
                        .toArray()).map(mapFn);
                    while (queue.length) {
                        result.push(...queue);
                        queue.push(...(yield db
                            .collection("departments")
                            .find({
                            "parent.type": "Department",
                            "parent.id": { $in: queue.splice(0) },
                        }, opts)
                            .toArray()).map(mapFn));
                    }
                }
                break;
        }
        return result;
    });
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(deptWhere)) {
        switch (whereKey) {
            case "id":
                {
                    const result = (0, queryUtils_1.whereTreeId)(deptWhere[whereKey], getRangeIds);
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
                filterQuery["name"] = (0, queryUtils_1.whereRegex)(deptWhere[whereKey]);
                break;
            case "code":
                filterQuery["code"] = deptWhere[whereKey];
                break;
            case "parent":
                {
                    const $and = (0, queryUtils_1.whereNode)(deptWhere[whereKey], "parent");
                    if ("$and" in filterQuery) {
                        filterQuery.$and.push(...$and);
                    }
                    else {
                        filterQuery.$and = $and;
                    }
                }
                break;
            case "business":
                {
                    promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                        const $in = (yield Promise.all((yield db
                            .collection("departments")
                            .find({
                            "parent.type": "Business",
                            "parent.id": new mongodb_1.ObjectId(deptWhere[whereKey]),
                        }, {
                            projection: {
                                _id: true,
                            },
                        })
                            .toArray()).map(({ _id }) => getRangeIds("lte", _id)))).reduce(($in, ids) => {
                            $in.push(...ids);
                            return $in;
                        }, []);
                        if ($in.length) {
                            if ("$and" in filterQuery) {
                                filterQuery.$and.push({ _id: { $in } });
                            }
                            else {
                                filterQuery.$and = [{ _id: { $in } }];
                            }
                        }
                    }))());
                }
                break;
            case "and":
                {
                    let hasPromise = false;
                    const $and = deptWhere[whereKey].map((where) => {
                        const result = (0, exports.whereDepartments)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($and).then(($and) => {
                            if ("$and" in filterQuery) {
                                filterQuery.$and.push(...$and);
                            }
                            else {
                                filterQuery.$and = $and;
                            }
                        }));
                    }
                    else {
                        if ("$and" in filterQuery) {
                            filterQuery.$and.push(...$and);
                        }
                        else {
                            filterQuery.$and = $and;
                        }
                    }
                }
                break;
            case "or":
                {
                    let hasPromise = false;
                    const $or = deptWhere[whereKey].map((where) => {
                        const result = (0, exports.whereDepartments)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($or).then(($or) => {
                            if ("$or" in filterQuery) {
                                filterQuery.$or.push(...$or);
                            }
                            else {
                                filterQuery.$or = $or;
                            }
                        }));
                    }
                    else {
                        if ("$or" in filterQuery) {
                            filterQuery.$or.push(...$or);
                        }
                        else {
                            filterQuery.$or = $or;
                        }
                    }
                }
                break;
            case "nor":
                {
                    let hasPromise = false;
                    const $nor = deptWhere[whereKey].map((where) => {
                        const result = (0, exports.whereDepartments)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($nor).then(($nor) => {
                            if ("$nor" in filterQuery) {
                                filterQuery.$nor.push(...$nor);
                            }
                            else {
                                filterQuery.$nor = $nor;
                            }
                        }));
                    }
                    else {
                        if ("$nor" in filterQuery) {
                            filterQuery.$nor.push(...$nor);
                        }
                        else {
                            filterQuery.$nor = $nor;
                        }
                    }
                }
                break;
        }
    }
    if (promises.length) {
        return Promise.all(promises).then(() => filterQuery);
    }
    return filterQuery;
};
exports.whereDepartments = whereDepartments;
const departments = (_, { where }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
    return db
        .collection("departments")
        .find(where ? yield (0, exports.whereDepartments)(where, db) : {})
        .toArray();
});
exports.departments = departments;
exports.default = exports.departments;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwYXJ0bWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2RlcGFydG1lbnQvZGVwYXJ0bWVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQW9EO0FBR3BELHlEQUF5RDtBQUV6RCxvREFBeUU7QUFFbEUsTUFBTSxnQkFBZ0IsR0FBRyxDQUM5QixTQUEyQixFQUMzQixFQUFNLEVBQ2dELEVBQUU7SUFDeEQsTUFBTSxXQUFXLEdBQXlCLEVBQUUsQ0FBQztJQUU3QyxNQUFNLFFBQVEsR0FBb0IsRUFBRSxDQUFDO0lBRXJDLE1BQU0sV0FBVyxHQUFHLENBQU8sT0FBTyxFQUFFLEVBQVksRUFBRSxFQUFFO1FBQ2xELE1BQU0sTUFBTSxHQUNWLE9BQU8sS0FBSyxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRXJELFFBQVEsT0FBTyxFQUFFO1lBQ2YsS0FBSyxJQUFJLENBQUM7WUFDVixLQUFLLEtBQUs7Z0JBQ1I7b0JBQ0UsTUFBTSxJQUFJLEdBQUc7d0JBQ1gsVUFBVSxFQUFFOzRCQUNWLE1BQU0sRUFBRSxJQUFJO3lCQUNiO3FCQUNGLENBQUM7b0JBUUYsSUFBSSxTQUFTLEdBQUcsTUFBTSxFQUFFO3lCQUNyQixVQUFVLENBQUMsYUFBYSxDQUFDO3lCQUN6QixPQUFPLENBQU0sRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBRW5DLG1DQUFtQztvQkFDbkMsb0NBQW9DO29CQUNwQyxPQUFPLFNBQVMsSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxZQUFZLEVBQUU7d0JBQzFELE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFFakMsU0FBUyxHQUFHLE1B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