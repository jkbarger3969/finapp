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
exports.entries = exports.whereEntries = exports.whereEntryItems = exports.whereEntryRefunds = void 0;
const iterableFns_1 = require("../../utils/iterableFns");
const queryUtils_1 = require("../utils/queryUtils");
const departments_1 = require("../department/departments");
const category_1 = require("../category");
const business_1 = require("../business");
const people_1 = require("../person/people");
const fiscalYear_1 = require("../fiscalYear");
const whereEntryRefunds = (entryRefundsWhere, db, filterQuery = {}) => {
    const promises = [];
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(entryRefundsWhere)) {
        switch (whereKey) {
            case "id":
                filterQuery["refunds.id"] = (0, queryUtils_1.whereId)(entryRefundsWhere[whereKey]);
                break;
            case "date":
                filterQuery["refunds.date.0.value"] = (0, queryUtils_1.whereDate)(entryRefundsWhere[whereKey]);
                break;
            case "entry": {
                if (!("$and" in filterQuery)) {
                    filterQuery.$and = [];
                }
                const result = (0, exports.whereEntries)(entryRefundsWhere[whereKey], db);
                if (result instanceof Promise) {
                    promises.push(result.then((result) => {
                        filterQuery.$and.push(result);
                    }));
                }
                else {
                    filterQuery.$and.push(result);
                }
                break;
            }
            case "total":
                if (!("$and" in filterQuery)) {
                    filterQuery.$and = [];
                }
                filterQuery.$and.push(...(0, queryUtils_1.whereRational)(["refunds.total.value", 0], entryRefundsWhere[whereKey]));
                break;
            case "reconciled":
                filterQuery["refunds.reconciled.0.value"] = entryRefundsWhere[whereKey];
                break;
            case "lastUpdate":
                filterQuery["refunds.lastUpdate"] = (0, queryUtils_1.whereDate)(entryRefundsWhere[whereKey]);
                break;
            case "deleted":
                filterQuery["refunds.deleted.0.value"] = entryRefundsWhere[whereKey];
                break;
            case "and":
                {
                    let hasPromise = false;
                    const $and = entryRefundsWhere[whereKey].map((where) => {
                        const result = (0, exports.whereEntryRefunds)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($and).then(($and) => {
                            if (!("$and" in filterQuery)) {
                                filterQuery.$and = [];
                            }
                            filterQuery.$and.push(...$and);
                        }));
                    }
                    else {
                        if (!("$and" in filterQuery)) {
                            filterQuery.$and = [];
                        }
                        filterQuery.$and.push(...$and);
                    }
                }
                break;
            case "or":
                {
                    let hasPromise = false;
                    const $or = entryRefundsWhere[whereKey].map((where) => {
                        const result = (0, exports.whereEntryRefunds)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($or).then(($or) => {
                            if (!("$or" in filterQuery)) {
                                filterQuery.$or = [];
                            }
                            filterQuery.$or.push(...$or);
                        }));
                    }
                    else {
                        if (!("$or" in filterQuery)) {
                            filterQuery.$or = [];
                        }
                        filterQuery.$or.push(...$or);
                    }
                }
                break;
            case "nor":
                {
                    let hasPromise = false;
                    const $nor = entryRefundsWhere[whereKey].map((where) => {
                        const result = (0, exports.whereEntryRefunds)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($nor).then(($nor) => {
                            if (!("$nor" in filterQuery)) {
                                filterQuery.$nor = [];
                            }
                            filterQuery.$nor.push(...$nor);
                        }));
                    }
                    else {
                        if (!("$nor" in filterQuery)) {
                            filterQuery.$nor = [];
                        }
                        filterQuery.$nor.push(...$nor);
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
exports.whereEntryRefunds = whereEntryRefunds;
const whereEntryItems = (itemRefundsWhere, db, filterQuery = {}) => {
    const promises = [];
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(itemRefundsWhere)) {
        switch (whereKey) {
            case "id":
                filterQuery["items.id"] = (0, queryUtils_1.whereId)(itemRefundsWhere[whereKey]);
                break;
            case "department":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    const result = (0, departments_1.whereDepartments)(itemRefundsWhere[whereKey], db);
                    const query = result instanceof Promise ? yield result : result;
                    filterQuery["items.department.0.value"] = {
                        $in: (yield db
                            .collection("departments")
                            .find(query, {
                            projection: {
                                _id: true,
                            },
                        })
                            .toArray()).map(({ _id }) => _id),
                    };
                }))());
                break;
            case "category":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    const result = (0, category_1.whereCategories)(itemRefundsWhere[whereKey], db);
                    const query = result instanceof Promise ? yield result : result;
                    filterQuery["items.category.0.value"] = {
                        $in: (yield db
                            .collection("categories")
                            .find(query, {
                            projection: {
                                _id: true,
                            },
                        })
                            .toArray()).map(({ _id }) => _id),
                    };
                }))());
                break;
            case "units":
                filterQuery["items.units.0.value"] = (0, queryUtils_1.whereInt)(itemRefundsWhere[whereKey]);
                break;
            case "total":
                if (!("$and" in filterQuery)) {
                    filterQuery.$and = [];
                }
                filterQuery.$and.push(...(0, queryUtils_1.whereRational)(["items.total.value", 0], itemRefundsWhere[whereKey]));
                break;
            case "lastUpdate":
                filterQuery["items.lastUpdate"] = (0, queryUtils_1.whereDate)(itemRefundsWhere[whereKey]);
                break;
            case "deleted":
                filterQuery["items.deleted.0.value"] = itemRefundsWhere[whereKey];
                break;
            case "and":
                {
                    let hasPromise = false;
                    const $and = itemRefundsWhere[whereKey].map((where) => {
                        const result = (0, exports.whereEntryItems)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($and).then(($and) => {
                            if (!("$and" in filterQuery)) {
                                filterQuery.$and = [];
                            }
                            filterQuery.$and.push(...$and);
                        }));
                    }
                    else {
                        if (!("$and" in filterQuery)) {
                            filterQuery.$and = [];
                        }
                        filterQuery.$and.push(...$and);
                    }
                }
                break;
            case "or":
                {
                    let hasPromise = false;
                    const $or = itemRefundsWhere[whereKey].map((where) => {
                        const result = (0, exports.whereEntryItems)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($or).then(($or) => {
                            if (!("$or" in filterQuery)) {
                                filterQuery.$or = [];
                            }
                            filterQuery.$or.push(...$or);
                        }));
                    }
                    else {
                        if (!("$or" in filterQuery)) {
                            filterQuery.$or = [];
                        }
                        filterQuery.$or.push(...$or);
                    }
                }
                break;
            case "nor":
                {
                    let hasPromise = false;
                    const $nor = itemRefundsWhere[whereKey].map((where) => {
                        const result = (0, exports.whereEntryItems)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($nor).then(($nor) => {
                            if (!("$nor" in filterQuery)) {
                                filterQuery.$nor = [];
                            }
                            filterQuery.$nor.push(...$nor);
                        }));
                    }
                    else {
                        if (!("$nor" in filterQuery)) {
                            filterQuery.$nor = [];
                        }
                        filterQuery.$nor.push(...$nor);
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
exports.whereEntryItems = whereEntryItems;
const whereEntries = (entriesWhere, db) => {
    const filterQuery = {};
    const promises = [];
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(entriesWhere)) {
        switch (whereKey) {
            case "id":
                filterQuery["_id"] = (0, queryUtils_1.whereId)(entriesWhere[whereKey]);
                break;
            case "refunds":
                {
                    const result = (0, exports.whereEntryRefunds)(entriesWhere[whereKey], db, filterQuery);
                    if (result instanceof Promise) {
                        promises.push(result);
                    }
                }
                break;
            case "items":
                {
                    const result = (0, exports.whereEntryItems)(entriesWhere[whereKey], db, filterQuery);
                    if (result instanceof Promise) {
                        promises.push(result);
                    }
                }
                break;
            case "date":
                filterQuery["date.0.value"] = (0, queryUtils_1.whereDate)(entriesWhere[whereKey]);
                break;
            case "dateOfRecord":
                for (const dateOfRecordKey of (0, iterableFns_1.iterateOwnKeys)(entriesWhere[whereKey])) {
                    switch (dateOfRecordKey) {
                        case "date":
                            {
                                const dateOfRecordAnd = [];
                                const dateAnd = [];
                                for (const [op, value] of (0, iterableFns_1.iterateOwnKeyValues)((0, queryUtils_1.whereDate)(entriesWhere[whereKey][dateOfRecordKey]))) {
                                    dateOfRecordAnd.push({
                                        [op]: [
                                            { $arrayElemAt: ["$dateOfRecord.date.value", 0] },
                                            value,
                                        ],
                                    });
                                    dateAnd.push({
                                        [op]: [{ $arrayElemAt: ["$date.value", 0] }, value],
                                    });
                                }
                                if (!("$and" in filterQuery)) {
                                    filterQuery.$and = [];
                                }
                                filterQuery.$and.push({
                                    $expr: {
                                        $cond: {
                                            if: {
                                                $ne: [{ $type: "$dateOfRecord.date.value" }, "missing"],
                                            },
                                            then: {
                                                $and: dateOfRecordAnd,
                                            },
                                            else: {
                                                $and: dateAnd,
                                            },
                                        },
                                    },
                                });
                            }
                            break;
                        case "overrideFiscalYear":
                            filterQuery["dateOfRecord.overrideFiscalYear.0.value"] =
                                entriesWhere[whereKey][dateOfRecordKey];
                            break;
                    }
                }
                break;
            case "department":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    const result = (0, departments_1.whereDepartments)(entriesWhere[whereKey], db);
                    const query = result instanceof Promise ? yield result : result;
                    filterQuery["department.0.value"] = {
                        $in: (yield db
                            .collection("departments")
                            .find(query, {
                            projection: {
                                _id: true,
                            },
                        })
                            .toArray()).map(({ _id }) => _id),
                    };
                }))());
                break;
            case "fiscalYear":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    const fiscalYearsQuery = (0, fiscalYear_1.whereFiscalYear)(entriesWhere[whereKey]);
                    const fiscalYears = yield db
                        .collection("fiscalYears")
                        .find(fiscalYearsQuery, {
                        projection: {
                            begin: true,
                            end: true,
                        },
                    })
                        .toArray();
                    const dateOr = [];
                    const dateOfRecordOr = [];
                    for (const { begin, end } of fiscalYears) {
                        dateOr.push({
                            "date.0.value": {
                                $gte: begin,
                                $lt: end,
                            },
                        });
                        dateOfRecordOr.push({
                            "dateOfRecord.date.0.value": {
                                $gte: begin,
                                $lt: end,
                            },
                        });
                    }
                    if (!("$and" in filterQuery)) {
                        filterQuery.$and = [];
                    }
                    filterQuery.$and.push({
                        $or: [
                            {
                                "dateOfRecord.overrideFiscalYear.0.value": { $ne: true },
                                $or: dateOr,
                            },
                            {
                                "dateOfRecord.overrideFiscalYear.0.value": true,
                                $or: dateOfRecordOr,
                            },
                        ],
                    });
                }))());
                break;
            case "category":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    const result = (0, category_1.whereCategories)(entriesWhere[whereKey], db);
                    const query = result instanceof Promise ? yield result : result;
                    filterQuery["category.0.value"] = {
                        $in: (yield db
                            .collection("categories")
                            .find(query, {
                            projection: {
                                _id: true,
                            },
                        })
                            .toArray()).map(({ _id }) => _id),
                    };
                }))());
                break;
            case "description":
                filterQuery["description.0.value"] = (0, queryUtils_1.whereRegex)(entriesWhere[whereKey]);
                break;
            case "total":
                if (!("$and" in filterQuery)) {
                    filterQuery.$and = [];
                }
                filterQuery.$and.push(...(0, queryUtils_1.whereRational)(["total.value", 0], entriesWhere[whereKey]));
                break;
            case "source":
                for (const sourceKey of (0, iterableFns_1.iterateOwnKeys)(entriesWhere[whereKey])) {
                    switch (sourceKey) {
                        case "businesses":
                            promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                                const result = (0, business_1.whereBusiness)(entriesWhere[whereKey][sourceKey]);
                                const query = result instanceof Promise ? yield result : result;
                                if (!("$and" in filterQuery)) {
                                    filterQuery.$and = [];
                                }
                                filterQuery.$and.push({
                                    "source.0.value.type": "Business",
                                    "source.0.value.id": {
                                        $in: (yield db
                                            .collection("businesses")
                                            .find(query, {
                                            projection: {
                                                _id: true,
                                            },
                                        })
                                            .toArray()).map(({ _id }) => _id),
                                    },
                                });
                            }))());
                            break;
                        case "departments":
                            promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                                const result = (0, departments_1.whereDepartments)(entriesWhere[whereKey][sourceKey], db);
                                const query = result instanceof Promise ? yield result : result;
                                if (!("$and" in filterQuery)) {
                                    filterQuery.$and = [];
                                }
                                filterQuery.$and.push({
                                    "source.0.value.type": "Department",
                                    "source.0.value.id": {
                                        $in: (yield db
                                            .collection("departments")
                                            .find(query, {
                                            projection: {
                                                _id: true,
                                            },
                                        })
                                            .toArray()).map(({ _id }) => _id),
                                    },
                                });
                            }))());
                            break;
                        case "people":
                            promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                                const query = (0, people_1.wherePeople)(entriesWhere[whereKey][sourceKey]);
                                if (!("$and" in filterQuery)) {
                                    filterQuery.$and = [];
                                }
                                filterQuery.$and.push({
                                    "source.0.value.type": "Person",
                                    "source.0.value.id": {
                                        $in: (yield db
                                            .collection("people")
                                            .find(query, {
                                            projection: {
                                                _id: true,
                                            },
                                        })
                                            .toArray()).map(({ _id }) => _id),
                                    },
                                });
                            }))());
                            break;
                    }
                }
                break;
            case "reconciled":
                filterQuery["reconciled.0.value"] = entriesWhere[whereKey];
                break;
            case "lastUpdate":
                filterQuery["lastUpdate"] = (0, queryUtils_1.whereDate)(entriesWhere[whereKey]);
                break;
            case "deleted":
                filterQuery["deleted.0.value"] = entriesWhere[whereKey];
                break;
            case "and":
                {
                    let hasPromise = false;
                    const $and = entriesWhere[whereKey].map((where) => {
                        const result = (0, exports.whereEntries)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($and).then(($and) => {
                            if (!("$and" in filterQuery)) {
                                filterQuery.$and = [];
                            }
                            filterQuery.$and.push(...$and);
                        }));
                    }
                    else {
                        if (!("$and" in filterQuery)) {
                            filterQuery.$and = [];
                        }
                        filterQuery.$and.push(...$and);
                    }
                }
                break;
            case "or":
                {
                    let hasPromise = false;
                    const $or = entriesWhere[whereKey].map((where) => {
                        const result = (0, exports.whereEntries)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($or).then(($or) => {
                            if (!("$or" in filterQuery)) {
                                filterQuery.$or = [];
                            }
                            filterQuery.$or.push(...$or);
                        }));
                    }
                    else {
                        if (!("$or" in filterQuery)) {
                            filterQuery.$or = [];
                        }
                        filterQuery.$or.push(...$or);
                    }
                }
                break;
            case "nor":
                {
                    let hasPromise = false;
                    const $nor = entriesWhere[whereKey].map((where) => {
                        const result = (0, exports.whereEntries)(where, db);
                        if (result instanceof Promise) {
                            hasPromise = true;
                        }
                        return result;
                    });
                    if (hasPromise) {
                        promises.push(Promise.all($nor).then(($nor) => {
                            if (!("$nor" in filterQuery)) {
                                filterQuery.$nor = [];
                            }
                            filterQuery.$nor.push(...$nor);
                        }));
                    }
                    else {
                        if (!("$nor" in filterQuery)) {
                            filterQuery.$nor = [];
                        }
                        filterQuery.$nor.push(...$nor);
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
exports.whereEntries = whereEntries;
const entries = (_, { where }, { db }) => {
    const query = where ? (0, exports.whereEntries)(where, db) : {};
    if (query instanceof Promise) {
        return query.then((query) => db.collection("entries").find(query).toArray());
    }
    return db.collection("entries").find(query).toArray();
};
exports.entries = entries;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZW50cnkvZW50cmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSx5REFBOEU7QUFDOUUsb0RBTTZCO0FBQzdCLDJEQUE2RDtBQUM3RCwwQ0FBOEM7QUFDOUMsMENBQTRDO0FBQzVDLDZDQUErQztBQUMvQyw4Q0FBb0U7QUFFN0QsTUFBTSxpQkFBaUIsR0FBRyxDQUMvQixpQkFBb0MsRUFDcEMsRUFBTSxFQUNOLGNBQW9DLEVBQUUsRUFDdEMsRUFBRTtJQUNGLE1BQU0sUUFBUSxHQUFvQixFQUFFLENBQUM7SUFFckMsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFBLDRCQUFjLEVBQUMsaUJBQWlCLENBQUMsRUFBRTtRQUN4RCxRQUFRLFFBQVEsRUFBRTtZQUNoQixLQUFLLElBQUk7Z0JBQ1AsV0FBVyxDQUFDLFlBQVksQ0FBQyxHQUFHLElBQUEsb0JBQU8sRUFBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNqRSxNQUFNO1lBQ1IsS0FBSyxNQUFNO2dCQUNULFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLElBQUEsc0JBQVMsRUFDN0MsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQzVCLENBQUM7Z0JBQ0YsTUFBTTtZQUNSLEtBQUssT0FBTyxDQUFDLENBQUM7Z0JBQ1osSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLFdBQVcsQ0FBQyxFQUFFO29CQUM1QixXQUFXLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztpQkFDdkI7Z0JBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBQSxvQkFBWSxFQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUU3RCxJQUFJLE1BQU0sWUFBWSxPQUFPLEVBQUU7b0JBQzdCLFFBQVEsQ0FBQyxJQUFJLENBQ1gsTUFBTSxDQUFDLElBQUksQ0FB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