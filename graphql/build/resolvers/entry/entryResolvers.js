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
exports.Entry = exports.EntryRefund = exports.EntryItem = void 0;
const mongodb_1 = require("mongodb");
const queryUtils_1 = require("../utils/queryUtils");
exports.EntryItem = {
    id: ({ id }) => id.toString(),
    category: ({ category, id }, _, { loaders }) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!((_a = category === null || category === void 0 ? void 0 : category[0]) === null || _a === void 0 ? void 0 : _a.value)) {
            console.warn(`EntryItem ${id} has no category`);
            return {
                _id: new mongodb_1.ObjectId(),
                name: "Unknown Category",
                code: "UNKNOWN",
                externalId: "unknown",
                type: "Debit",
                inactive: true,
                donation: false,
                active: false,
                hidden: true,
            };
        }
        const cat = yield loaders.category.load(category[0].value.toString());
        if (!cat) {
            return {
                _id: new mongodb_1.ObjectId(category[0].value.toString()),
                name: "Unknown Category",
                code: "UNKNOWN",
                externalId: category[0].value.toString(),
                type: "Debit",
                inactive: true,
                donation: false,
                active: false,
                hidden: true,
            };
        }
        return cat;
    }),
    deleted: ({ deleted }) => { var _a, _b; return (_b = (_a = deleted === null || deleted === void 0 ? void 0 : deleted[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : false; },
    department: ({ department }, _, { loaders }) => { var _a; return ((_a = department === null || department === void 0 ? void 0 : department[0]) === null || _a === void 0 ? void 0 : _a.value) ? loaders.department.load(department[0].value.toString()) : null; },
    description: ({ description }) => { var _a; return (description ? ((_a = description[0]) === null || _a === void 0 ? void 0 : _a.value) || null : null); },
    // lastUpdate: Default works
    total: ({ total }) => { var _a, _b; return (_b = (_a = total === null || total === void 0 ? void 0 : total[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0; },
    units: ({ units }) => { var _a, _b; return (_b = (_a = units === null || units === void 0 ? void 0 : units[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0; },
};
exports.EntryRefund = {
    id: ({ id }) => id.toString(),
    date: ({ date }) => { var _a, _b; return (_b = (_a = date === null || date === void 0 ? void 0 : date[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : new Date(); },
    dateOfRecord: ({ dateOfRecord }) => {
        var _a, _b, _c, _d, _e, _f;
        return dateOfRecord
            ? {
                date: (_c = (_b = (_a = dateOfRecord.date) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : new Date(),
                overrideFiscalYear: (_f = (_e = (_d = dateOfRecord.overrideFiscalYear) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : false,
            }
            : null;
    },
    fiscalYear: ({ date, dateOfRecord }, _, { loaders }) => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c, _d, _e, _f, _g, _h;
        const entryDate = (_c = (_b = date === null || date === void 0 ? void 0 : date[0]) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : new Date();
        const value = ((_e = (_d = dateOfRecord === null || dateOfRecord === void 0 ? void 0 : dateOfRecord.overrideFiscalYear) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.value)
            ? (_h = (_g = (_f = dateOfRecord.date) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : entryDate
            : entryDate;
        try {
            const years = yield loaders.allFiscalYears.load("ALL");
            const match = years === null || years === void 0 ? void 0 : years.find(fy => value >= fy.begin && value < fy.end);
            if (match)
                return match;
        }
        catch (error) {
            console.error("Error loading fiscal years for refund:", error);
        }
        // Fallback
        const year = value.getFullYear();
        return {
            _id: new mongodb_1.ObjectId(),
            name: `FY${year} (Fallback)`,
            begin: new Date(year, 0, 1),
            end: new Date(year + 1, 0, 1),
        };
    }),
    deleted: ({ deleted }) => { var _a, _b; return (_b = (_a = deleted === null || deleted === void 0 ? void 0 : deleted[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : false; },
    description: ({ description }) => { var _a; return ((_a = description === null || description === void 0 ? void 0 : description[0]) === null || _a === void 0 ? void 0 : _a.value) || null; },
    entry: ({ id }, _, { dataSources: { accountingDb } }) => accountingDb.findOne({
        collection: "entries",
        filter: {
            "refunds.id": id,
        },
    }),
    // lastUpdate: Default works
    paymentMethod: ({ paymentMethod }) => { var _a, _b; return (_b = (_a = paymentMethod === null || paymentMethod === void 0 ? void 0 : paymentMethod[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : { currency: "USD" }; },
    reconciled: ({ reconciled }) => { var _a, _b; return (_b = (_a = reconciled === null || reconciled === void 0 ? void 0 : reconciled[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : false; },
    total: ({ total }) => { var _a, _b; return (_b = (_a = total === null || total === void 0 ? void 0 : total[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0; },
};
exports.Entry = {
    id: ({ _id }) => _id.toString(),
    category: ({ category, _id }, _, { loaders }) => __awaiter(void 0, void 0, void 0, function* () {
        var _j;
        if (!((_j = category === null || category === void 0 ? void 0 : category[0]) === null || _j === void 0 ? void 0 : _j.value)) {
            console.warn(`Entry ${_id} has no category`);
            return {
                _id: new mongodb_1.ObjectId(),
                name: "Unknown Category",
                code: "UNKNOWN",
                externalId: "unknown",
                type: "Debit",
                inactive: true,
                donation: false,
                active: false,
                hidden: true,
            };
        }
        const categoryId = category[0].value.toString();
        const cat = yield loaders.category.load(categoryId);
        if (!cat) {
            console.warn(`Entry ${_id} references missing/hidden category: ${categoryId}`);
            return {
                _id: new mongodb_1.ObjectId(categoryId),
                name: "Unknown Category",
                code: "UNKNOWN",
                externalId: categoryId,
                type: "Debit",
                inactive: true,
                donation: false,
                active: false,
                hidden: true,
            };
        }
        return cat;
    }),
    date: ({ date }) => { var _a, _b; return (_b = (_a = date === null || date === void 0 ? void 0 : date[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : new Date(); },
    dateOfRecord: ({ dateOfRecord }) => {
        var _a, _b, _c, _d, _e, _f;
        return dateOfRecord
            ? {
                date: (_c = (_b = (_a = dateOfRecord.date) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : new Date(),
                overrideFiscalYear: (_f = (_e = (_d = dateOfRecord.overrideFiscalYear) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : false,
            }
            : null;
    },
    deleted: ({ deleted }) => { var _a, _b; return (_b = (_a = deleted === null || deleted === void 0 ? void 0 : deleted[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : false; },
    department: ({ department, _id }, _, { loaders }) => __awaiter(void 0, void 0, void 0, function* () {
        var _k;
        if (!((_k = department === null || department === void 0 ? void 0 : department[0]) === null || _k === void 0 ? void 0 : _k.value)) {
            console.warn(`Entry ${_id} has no department`);
            return null;
        }
        return loaders.department.load(department[0].value.toString());
    }),
    description: ({ description }) => { var _a; return description ? ((_a = description[0]) === null || _a === void 0 ? void 0 : _a.value) || null : null; },
    fiscalYear: ({ date, dateOfRecord }, _, { loaders }) => __awaiter(void 0, void 0, void 0, function* () {
        var _l, _m, _o, _p, _q, _r, _s;
        const entryDate = (_m = (_l = date === null || date === void 0 ? void 0 : date[0]) === null || _l === void 0 ? void 0 : _l.value) !== null && _m !== void 0 ? _m : new Date();
        const value = ((_p = (_o = dateOfRecord === null || dateOfRecord === void 0 ? void 0 : dateOfRecord.overrideFiscalYear) === null || _o === void 0 ? void 0 : _o[0]) === null || _p === void 0 ? void 0 : _p.value)
            ? (_s = (_r = (_q = dateOfRecord.date) === null || _q === void 0 ? void 0 : _q[0]) === null || _r === void 0 ? void 0 : _r.value) !== null && _s !== void 0 ? _s : entryDate
            : entryDate;
        try {
            const years = yield loaders.allFiscalYears.load("ALL");
            if (!years || years.length === 0) {
                console.warn("No fiscal years found in DB.");
            }
            const match = years === null || years === void 0 ? void 0 : years.find(fy => value >= fy.begin && value < fy.end);
            if (match)
                return match;
        }
        catch (error) {
            console.error("Error loading fiscal years:", error);
        }
        // Fallback if no FY found (prevents GraphQL non-nullable error)
        const year = value.getFullYear();
        return {
            _id: new mongodb_1.ObjectId(),
            name: `FY${year} (Fallback)`,
            begin: new Date(year, 0, 1),
            end: new Date(year + 1, 0, 1),
        };
    }),
    items: ({ items }) => items !== null && items !== void 0 ? items : [],
    // lastUpdate: Default works
    paymentMethod: ({ paymentMethod }) => { var _a, _b; return (_b = (_a = paymentMethod === null || paymentMethod === void 0 ? void 0 : paymentMethod[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : { currency: "USD" }; },
    reconciled: ({ reconciled }) => { var _a, _b; return (_b = (_a = reconciled === null || reconciled === void 0 ? void 0 : reconciled[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : false; },
    refunds: ({ refunds }) => refunds || [],
    source: ({ source, _id }, _, { loaders }) => __awaiter(void 0, void 0, void 0, function* () {
        var _t;
        if (!((_t = source === null || source === void 0 ? void 0 : source[0]) === null || _t === void 0 ? void 0 : _t.value)) {
            console.warn(`Entry ${_id} has no source`);
            return { __typename: 'Business', id: 'unknown', name: 'Unknown Source' };
        }
        const sourceValue = source[0].value;
        const type = sourceValue === null || sourceValue === void 0 ? void 0 : sourceValue.type;
        const id = sourceValue === null || sourceValue === void 0 ? void 0 : sourceValue.id;
        if (!type || !id) {
            console.warn(`Entry ${_id} has invalid source (type: ${type}, id: ${id})`);
            return { __typename: 'Business', id: (id === null || id === void 0 ? void 0 : id.toString()) || 'unknown', name: 'Unknown Source' };
        }
        let result = null;
        switch (type) {
            case "Business":
                result = yield loaders.business.load(id.toString());
                if (result)
                    return (0, queryUtils_1.addTypename)(type, result);
                break;
            case "Department":
                result = yield loaders.department.load(id.toString());
                if (result)
                    return (0, queryUtils_1.addTypename)(type, result);
                break;
            case "Person":
                result = yield loaders.person.load(id.toString());
                if (result)
                    return (0, queryUtils_1.addTypename)(type, result);
                break;
        }
        console.warn(`Entry source ${type}:${id} not found for entry ${_id}`);
        return { __typename: 'Business', id: id.toString(), name: `Unknown ${type}` };
    }),
    total: ({ total }) => { var _a, _b; return (_b = (_a = total === null || total === void 0 ? void 0 : total[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0; },
    lastEditedAt: (root) => root.lastUpdate,
    lastEditedBy: (root, _, { loaders }) => __awaiter(void 0, void 0, void 0, function* () {
        // Find the most recent change across all fields
        let latest = null;
        const fields = ["category", "date", "department", "description", "paymentMethod", "reconciled", "total"];
        for (const key of fields) {
            const history = root[key];
            if (history && history.length > 0) {
                const first = history[0];
                if (!latest || first.createdOn > latest.date) {
                    latest = { date: first.createdOn, by: first.createdBy.toString() };
                }
            }
        }
        if (latest) {
            const person = yield loaders.person.load(latest.by);
            return person ? person.name.first + " " + person.name.last : latest.by;
        }
        return null;
    }),
    editHistory: (root, _, { loaders }) => __awaiter(void 0, void 0, void 0, function* () {
        const historyMap = new Map();
        // Fields to track in history
        const fields = ["category", "date", "department", "description", "paymentMethod", "reconciled", "total"];
        for (const key of fields) {
            const history = root[key];
            if (!history || history.length === 0)
                continue;
            // Iterate backwards to calculate changes (oldest to newest)
            // Actually, we want to group by "transaction" (createdOn/By)
            for (let i = 0; i < history.length; i++) {
                const entry = history[i];
                const uniqueKey = `${entry.createdOn.getTime()}-${entry.createdBy.toString()}`;
                if (!historyMap.has(uniqueKey)) {
                    historyMap.set(uniqueKey, {
                        id: uniqueKey,
                        editedAt: new Date(entry.createdOn),
                        editedByUserId: entry.createdBy.toString(),
                        changes: {}
                    });
                }
                const group = historyMap.get(uniqueKey);
                const newValue = entry.value;
                // The "old" value is the next one in the array (i+1), or null if this is the first (creation)
                const oldValue = (i + 1 < history.length) ? history[i + 1].value : null;
                // Simple serialization for display
                const formatVal = (val) => {
                    if (val && typeof val === 'object' && val.toString && Object.keys(val).length === 0)
                        return val.toString();
                    // Handle MongoDB ObjectIds
                    if (val && val._bsontype === 'ObjectID')
                        return val.toString();
                    // Handle Rational objects
                    if (val && typeof val.n === 'number' && typeof val.d === 'number')
                        return `${val.n}/${val.d}`;
                    return val;
                };
                // Only add if there is an actual change (or it's the initial value)
                group.changes[key] = {
                    old: formatVal(oldValue),
                    new: formatVal(newValue)
                };
            }
        }
        // Convert map to array and sort by date descending
        const result = Array.from(historyMap.values()).sort((a, b) => b.editedAt.getTime() - a.editedAt.getTime());
        // Resolve user emails
        return Promise.all(result.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const person = yield loaders.person.load(item.editedByUserId);
            return {
                id: item.id,
                editedAt: item.editedAt,
                editedBy: person ? (person.email || `${person.name.first} ${person.name.last}`) : item.editedByUserId,
                changes: item.changes
            };
        })));
    })
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlSZXNvbHZlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2VudHJ5UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQU9uQyxvREFBa0Q7QUFFckMsUUFBQSxTQUFTLEdBQXVCO0lBQzNDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDN0IsUUFBUSxFQUFFLENBQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRTs7UUFDbkQsSUFBSSxDQUFDLENBQUEsTUFBQSxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUcsQ0FBQyxDQUFDLDBDQUFFLEtBQUssQ0FBQSxFQUFFO1lBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFDaEQsT0FBTztnQkFDTCxHQUFHLEVBQUUsSUFBSSxrQkFBUSxFQUFFO2dCQUNuQixJQUFJLEVBQUUsa0JBQWtCO2dCQUN4QixJQUFJLEVBQUUsU0FBUztnQkFDZixVQUFVLEVBQUUsU0FBUztnQkFDckIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLElBQUk7YUFDTixDQUFDO1NBQ1Y7UUFDRCxNQUFNLEdBQUcsR0FBRyxNQUFNLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1IsT0FBTztnQkFDTCxHQUFHLEVBQUUsSUFBSSxrQkFB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