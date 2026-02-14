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
exports.entriesCount = exports.searchEntries = exports.entries = exports.whereEntries = exports.whereEntryItems = exports.whereEntryRefunds = void 0;
const mongodb_1 = require("mongodb");
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
                    if (dateOr.length > 0) {
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
                    }
                    else {
                        filterQuery.$and.push({ _id: { $in: [] } });
                    }
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
            case "paymentMethodType":
                // Maps "CARD", "CHECK" (Enum) to "Card", "Check" (DB)
                const type = entriesWhere[whereKey];
                if (type) {
                    // Simple TitleCase conversion
                    const dbType = type.charAt(0) + type.slice(1).toLowerCase();
                    filterQuery["paymentMethod.type"] = dbType;
                }
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
                            if ($and.length > 0) {
                                if (!("$and" in filterQuery)) {
                                    filterQuery.$and = [];
                                }
                                filterQuery.$and.push(...$and);
                            }
                        }));
                    }
                    else {
                        if ($and.length > 0) {
                            if (!("$and" in filterQuery)) {
                                filterQuery.$and = [];
                            }
                            filterQuery.$and.push(...$and);
                        }
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
                            if ($or.length > 0) {
                                if (!("$or" in filterQuery)) {
                                    filterQuery.$or = [];
                                }
                                filterQuery.$or.push(...$or);
                            }
                        }));
                    }
                    else {
                        if ($or.length > 0) {
                            if (!("$or" in filterQuery)) {
                                filterQuery.$or = [];
                            }
                            filterQuery.$or.push(...$or);
                        }
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
                            if ($nor.length > 0) {
                                if (!("$nor" in filterQuery)) {
                                    filterQuery.$nor = [];
                                }
                                filterQuery.$nor.push(...$nor);
                            }
                        }));
                    }
                    else {
                        if ($nor.length > 0) {
                            if (!("$nor" in filterQuery)) {
                                filterQuery.$nor = [];
                            }
                            filterQuery.$nor.push(...$nor);
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
exports.whereEntries = whereEntries;
const entries = (_, { where, filterRefunds, limit = 50, offset = 0 }, context) => __awaiter(void 0, void 0, void 0, function* () {
    const { dataSources: { accountingDb }, authService, user } = context;
    const pipeline = [];
    if (authService && (user === null || user === void 0 ? void 0 : user.id)) {
        const authUser = yield authService.getUserById(user.id);
        if (authUser && authUser.role !== "SUPER_ADMIN") {
            const accessibleDeptIds = yield authService.getAccessibleDepartmentIds(user.id);
            if (accessibleDeptIds.length === 0) {
                return [];
            }
            const allAccessibleIds = new Set();
            for (const deptId of accessibleDeptIds) {
                allAccessibleIds.add(deptId.toString());
                const descendants = yield getDescendantDeptIds(deptId, accountingDb.db);
                descendants.forEach((id) => allAccessibleIds.add(id.toString()));
            }
            const permittedDeptIds = Array.from(allAccessibleIds).map((id) => new mongodb_1.ObjectId(id));
            pipeline.push({
                $match: {
                    "department.0.value": { $in: permittedDeptIds },
                },
            });
        }
    }
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
    if (where) {
        // Determine sort order based on input (default to date desc)
        // Note: If 'where' contains date range, we might want to ensure sort matches index
    }
    // Always sort by date desc for consistent pagination
    pipeline.push({ $sort: { "date.0.value": -1 } });
    if (offset > 0) {
        pipeline.push({ $skip: offset });
    }
    // Safe limit
    const safeLimit = Math.min(Math.max(limit, 1), 1000);
    pipeline.push({ $limit: safeLimit });
    return accountingDb
        .getCollection("entries")
        .aggregate(pipeline)
        .toArray();
});
exports.entries = entries;
function getDescendantDeptIds(parentId, db) {
    return __awaiter(this, void 0, void 0, function* () {
        const descendants = [];
        const queue = [parentId];
        while (queue.length > 0) {
            const currentId = queue.shift();
            const children = yield db
                .collection("departments")
                .find({ "parent.type": "Department", "parent.id": currentId }, { projection: { _id: 1 } })
                .toArray();
            for (const child of children) {
                descendants.push(child._id);
                queue.push(child._id);
            }
        }
        return descendants;
    });
}
const searchEntries = (_, { query, limit = 50 }, context) => __awaiter(void 0, void 0, void 0, function* () {
    const { dataSources: { accountingDb }, authService, user } = context;
    const db = accountingDb.db;
    if (!query || query.trim().length === 0) {
        return [];
    }
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i"); // Safe, Case-insensitive
    // 1. Find matching Departments and Categories first
    const [matchingDepts, matchingCats] = yield Promise.all([
        db.collection("departments").find({ name: regex }, { projection: { _id: 1 } }).toArray(),
        db.collection("categories").find({ name: regex }, { projection: { _id: 1 } }).toArray(),
    ]);
    const deptIds = matchingDepts.map(d => d._id);
    const catIds = matchingCats.map(c => c._id);
    // 2. Build Base Query
    const searchFilter = {
        $or: [
            { "description.0.value": regex },
            ...(deptIds.length > 0 ? [{ "department.0.value": { $in: deptIds } }] : []),
            ...(catIds.length > 0 ? [{ "category.0.value": { $in: catIds } }] : []),
            // Attempt to match amount if query looks like a number?
            // For now, keep it text-based as per plan.
        ],
        // Ensure deleted entries are excluded
        "deleted.0.value": false,
    };
    // 3. Apply Permissions (same as 'entries' resolver)
    const pipeline = [];
    if (authService && (user === null || user === void 0 ? void 0 : user.id)) {
        const authUser = yield authService.getUserById(user.id);
        if (authUser && authUser.role !== "SUPER_ADMIN") {
            const accessibleDeptIds = yield authService.getAccessibleDepartmentIds(user.id);
            if (accessibleDeptIds.length === 0)
                return [];
            const allAccessibleIds = new Set();
            for (const deptId of accessibleDeptIds) {
                allAccessibleIds.add(deptId.toString());
                const descendants = yield getDescendantDeptIds(deptId, db);
                descendants.forEach((id) => allAccessibleIds.add(id.toString()));
            }
            const permittedDeptIds = Array.from(allAccessibleIds).map((id) => new mongodb_1.ObjectId(id));
            pipeline.push({
                $match: { "department.0.value": { $in: permittedDeptIds } }
            });
        }
    }
    pipeline.push({ $match: searchFilter });
    // Sort by date desc (most recent first)
    pipeline.push({ $sort: { "date.0.value": -1 } });
    pipeline.push({ $limit: limit });
    return accountingDb.getCollection("entries").aggregate(pipeline).toArray();
});
exports.searchEntries = searchEntries;
const entriesCount = (_, { where, filterRefunds }, context) => __awaiter(void 0, void 0, void 0, function* () {
    const { dataSources: { accountingDb }, authService, user } = context;
    const db = accountingDb.db;
    // Reuse the logic from entries resolver for permissions and where clause
    // We'll simplisticly assume count follows same rules but without complex pipeline if possible
    // However, entries resolver uses aggregation for some things (like refund filtering).
    // For basic count, filterRefunds might be complex.
    // Standard 'entries' pipeline returns documents.
    // We can convert the pipeline to a count aggregation.
    const pipeline = [];
    if (authService && (user === null || user === void 0 ? void 0 : user.id)) {
        const authUser = yield authService.getUserById(user.id);
        if (authUser && authUser.role !== "SUPER_ADMIN") {
            const accessibleDeptIds = yield authService.getAccessibleDepartmentIds(user.id);
            if (accessibleDeptIds.length === 0) {
                return 0;
            }
            const allAccessibleIds = new Set();
            for (const deptId of accessibleDeptIds) {
                allAccessibleIds.add(deptId.toString());
                const descendants = yield getDescendantDeptIds(deptId, accountingDb.db);
                descendants.forEach((id) => allAccessibleIds.add(id.toString()));
            }
            const permittedDeptIds = Array.from(allAccessibleIds).map((id) => new mongodb_1.ObjectId(id));
            pipeline.push({
                $match: {
                    "department.0.value": { $in: permittedDeptIds },
                },
            });
        }
    }
    if (where) {
        pipeline.push({
            $match: yield (0, exports.whereEntries)(where, accountingDb.db),
        });
        if (filterRefunds) {
            // Only if filtering *by* refunds or excluding them?
            // Logic copied from entries resolver lines 978+
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
    pipeline.push({ $count: "count" });
    const result = yield accountingDb.getCollection("entries").aggregate(pipeline).toArray();
    return result.length > 0 ? result[0].count : 0;
});
exports.entriesCount = entriesCount;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZW50cnkvZW50cmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBOEQ7QUFROUQseURBQThFO0FBQzlFLG9EQU02QjtBQUM3QiwyREFBNkQ7QUFDN0QsMENBQThDO0FBQzlDLDBDQUE0QztBQUM1Qyw2Q0FBK0M7QUFDL0MsOENBQW9FO0FBSXBFLE1BQU0sMkJBQTJCLEdBQUcsQ0FDbEMsSUFBNEIsRUFDNUIsVUFBVSxHQUFHLE1BQU0sRUFDbkIsRUFBRSxDQUFDLENBQUM7SUFDSixLQUFLLEVBQUU7UUFDTCxJQUFJLEVBQUU7WUFDSixJQUFJLEVBQUU7Z0JBQ0osbUNBQW1DO2dCQUNuQyxPQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLEVBQUU7YUFDdkM7WUFDRCxFQUFFLEVBQUU7Z0JBQ0YseUNBQXlDO2dCQUN6QyxPQUFPLEVBQUU7b0JBQ1AsS0FBSyxFQUFFO3dCQUNMLCtCQUErQjt3QkFDL0IsS0FBSyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEVBQUUsV0FBVyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7cUJBQy9EO29CQUNELFlBQVksRUFBRSxLQUFLO29CQUNuQixFQUFFLEVBQUU7d0JBQ0YsS0FBSyxFQUFFOzRCQUNMLFNBQVM7NEJBQ1Qsb0NBQW9DOzRCQUNwQyxJQUFJOzRCQUNKLDBCQUEwQjs0QkFDMUI7Z0NBQ0UsSUFBSSxFQUFFO29DQUNKLElBQUksRUFBRTt3Q0FDSixvQ0FBb0M7d0NBQ3BDLENBQUMsVUFBVSxDQUFDLEVBQUU7NENBQ1osT0FBTyxFQUFFO2dEQUNQO29EQUNFLFlBQVksRUFBRSxDQUFDLGdDQUFnQyxFQUFFLENBQUMsQ0FBQztpREFDcEQ7Z0RBQ0Q7b0RBQ0UsWUFBWSxFQUFFLENBQUMsbUJBQW1CLEVBQUUs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