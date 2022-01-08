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
const refundDateOfRecordCondition = ($and, dateLetVar = "date") => ({
    $expr: {
        $let: {
            vars: {
                // Grab refunds or provided default
                refunds: { $ifNull: ["$refunds", []] },
            },
            in: {
                // Loop over refunds and check conditions
                $reduce: {
                    input: {
                        // Ensure $$refunds is an array
                        $cond: [{ $isArray: "$$refunds" }, "$$refunds", ["$$refunds"]],
                    },
                    initialValue: false,
                    in: {
                        $cond: [
                            "$$value",
                            // Short circuit on "true" condition
                            true,
                            // Perform condition check
                            {
                                $let: {
                                    vars: {
                                        // dateOfRecord or fallback to date.
                                        [dateLetVar]: {
                                            $ifNull: [
                                                {
                                                    $arrayElemAt: ["$$this.dateOfRecord.date.value", 0],
                                                },
                                                {
                                                    $arrayElemAt: ["$$this.date.value", 0],
                                                },
                                            ],
                                        },
                                    },
                                    in: {
                                        $and,
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        },
    },
});
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
            case "dateOfRecord":
                for (const dateOfRecordKey of (0, iterableFns_1.iterateOwnKeys)(entryRefundsWhere[whereKey])) {
                    switch (dateOfRecordKey) {
                        case "date":
                            {
                                const $and = [];
                                for (const [op, value] of (0, iterableFns_1.iterateOwnKeyValues)((0, queryUtils_1.whereDate)(entryRefundsWhere[whereKey][dateOfRecordKey]))) {
                                    $and.push({
                                        [op]: ["$$date", value],
                                    });
                                }
                                if (!("$and" in filterQuery)) {
                                    filterQuery.$and = [];
                                }
                                // Note: "dateOfRecord" falls back to "date".
                                filterQuery.$and.push(refundDateOfRecordCondition($and, "date"));
                            }
                            break;
                        case "overrideFiscalYear":
                            filterQuery["refunds.dateOfRecord.overrideFiscalYear.0.value"] =
                                entryRefundsWhere[whereKey][dateOfRecordKey];
                            break;
                    }
                }
                break;
            case "fiscalYear":
                promises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                    const fiscalYearsQuery = (0, fiscalYear_1.whereFiscalYear)(entryRefundsWhere[whereKey]);
                    const fiscalYears = yield db
                        .collection("fiscalYears")
                        .find(fiscalYearsQuery, {
                        projection: {
                            begin: true,
                            end: true,
                        },
                    })
                        .toArray();
                    const $and = [];
                    for (const { begin, end } of fiscalYears) {
                        $and.push({
                            $gte: ["$$date", begin],
                        }, {
                            $lt: ["$$date", end],
                        });
                    }
                    if (!("$and" in filterQuery)) {
                        filterQuery.$and = [];
                    }
                    filterQuery.$and.push(refundDateOfRecordCondition($and, "date"));
                }))());
                break;
            case "total":
                if (!("$and" in filterQuery)) {
                    filterQuery.$and = [];
                }
                filterQuery.$and.push(...(0, queryUtils_1.whereRational)({
                    $let: {
                        vars: {
                            lhs: {
                                $reduce: {
                                    input: {
                                        $ifNull: ["$refunds", []],
                                    },
                                    initialValue: [],
                                    in: {
                                        $concatArrays: [
                                            "$$value",
                                            [
                                                {
                                                    $arrayElemAt: ["$$this.total.value", 0],
                                                },
                                            ],
                                        ],
                                    },
                                },
                            },
                        },
                        in: {
                            $cond: [
                                { $gt: [{ $size: "$$lhs" }, 0] },
                                "$$lhs",
                                {
                                    s: 1,
                                    n: 0,
                                    d: 1,
                                },
                            ],
                        },
                    },
                }, entryRefundsWhere[whereKey]));
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
                filterQuery.$and.push(...(0, queryUtils_1.whereRational)({
                    field: "items.total.value",
                    elemIndex: 0,
                    defaultValue: {
                        s: 1,
                        n: 0,
                        d: 1,
                    },
                }, itemRefundsWhere[whereKey]));
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
const whereEntries = (entriesWhere, db, { excludeWhereRefunds = false, } = {}) => {
    const filterQuery = {};
    const promises = [];
    for (const whereKey of (0, iterableFns_1.iterateOwnKeys)(entriesWhere)) {
        switch (whereKey) {
            case "id":
                filterQuery["_id"] = (0, queryUtils_1.whereId)(entriesWhere[whereKey]);
                break;
            case "refunds":
                if (!excludeWhereRefunds) {
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
                                const $and = [];
                                for (const [op, value] of (0, iterableFns_1.iterateOwnKeyValues)((0, queryUtils_1.whereDate)(entriesWhere[whereKey][dateOfRecordKey]))) {
                                    $and.push({
                                        [op]: ["$$date", value],
                                    });
                                }
                                if (!("$and" in filterQuery)) {
                                    filterQuery.$and = [];
                                }
                                filterQuery.$and.push({
                                    $expr: {
                                        $let: {
                                            vars: {
                                                // Get dateOfRecord or fallback to date
                                                date: {
                                                    $ifNull: [
                                                        {
                                                            $arrayElemAt: ["$dateOfRecord.date.value", 0],
                                                        },
                                                        {
                                                            $arrayElemAt: ["$date.value", 0],
                                                        },
                                                    ],
                                                },
                                            },
                                            in: {
                                                $and,
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
                filterQuery.$and.push(...(0, queryUtils_1.whereRational)({ $arrayElemAt: ["$total.value", 0] }, entriesWhere[whereKey]));
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
const entries = (_, { where, filterRefunds }, { dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
    const pipeline = [];
    if (where) {
        pipeline.push({
            $match: yield (0, exports.whereEntries)(where, accountingDb.db),
        });
        if (filterRefunds) {
            const matchRefunds = yield (0, exports.whereEntries)(where, accountingDb.db, {
                excludeWhereRefunds: true,
            });
            pipeline.push({
                $facet: {
                    all: [
                        {
                            $project: { refunds: false },
                        },
                    ],
                    refunds: [
                        { $unwind: "$refunds" },
                        // Map refunds on entry NOTE: a refund is a subset of an entry.
                        {
                            $replaceRoot: {
                                newRoot: { $mergeObjects: ["$$CURRENT", "$refunds"] },
                            },
                        },
                        {
                            $match: matchRefunds,
                        },
                        {
                            $group: { _id: "$_id", refunds: { $push: "$refunds" } },
                        },
                    ],
                },
            }, {
                $project: {
                    all: { $concatArrays: ["$all", "$refunds"] },
                },
            }, { $unwind: "$all" }, { $group: { _id: "$all._id", docs: { $push: "$all" } } }, { $replaceRoot: { newRoot: { $mergeObjects: "$docs" } } });
        }
    }
    return accountingDb
        .getCollection("entries")
        .aggregate(pipeline)
        .toArray();
});
exports.entries = entries;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZW50cnkvZW50cmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSx5REFBOEU7QUFDOUUsb0RBTTZCO0FBQzdCLDJEQUE2RDtBQUM3RCwwQ0FBOEM7QUFDOUMsMENBQTRDO0FBQzVDLDZDQUErQztBQUMvQyw4Q0FBb0U7QUFHcEUsTUFBTSwyQkFBMkIsR0FBRyxDQUNsQyxJQUE0QixFQUM1QixVQUFVLEdBQUcsTUFBTSxFQUNuQixFQUFFLENBQUMsQ0FBQztJQUNKLEtBQUssRUFBRTtRQUNMLElBQUksRUFBRTtZQUNKLElBQUksRUFBRTtnQkFDSixtQ0FBbUM7Z0JBQ25DLE9BQU8sRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsRUFBRTthQUN2QztZQUNELEVBQUUsRUFBRTtnQkFDRix5Q0FBeUM7Z0JBQ3pDLE9BQU8sRUFBRTtvQkFDUCxLQUFLLEVBQUU7d0JBQ0wsK0JBQStCO3dCQUMvQixLQUFLLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsRUFBRSxXQUFXLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQztxQkFDL0Q7b0JBQ0QsWUFBWSxFQUFFLEtBQUs7b0JBQ25CLEVBQUUsRUFBRTt3QkFDRixLQUFLLEVBQUU7NEJBQ0wsU0FBUzs0QkFDVCxvQ0FBb0M7NEJBQ3BDLElBQUk7NEJBQ0osMEJBQTBCOzRCQUMxQjtnQ0FDRSxJQUFJLEVBQUU7b0NBQ0osSUFBSSxFQUFFO3dDQUNKLG9DQUFvQzt3Q0FDcEMsQ0FBQyxVQUFVLENBQUMsRUFBRTs0Q0FDWixPQUFPLEVBQUU7Z0RBQ1A7b0RBQ0UsWUFBWSxFQUFFLENBQUMsZ0NBQWdDLEVBQUUsQ0FBQyxDQUFDO2lEQUNwRDtnREFDRDtvREFDRSxZQUFZLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7aURB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