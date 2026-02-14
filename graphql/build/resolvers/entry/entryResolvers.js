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
    category: ({ category }, _, { loaders }) => loaders.category.load(category[0].value.toString()),
    deleted: ({ deleted }) => deleted[0].value,
    department: ({ department }, _, { loaders }) => department ? loaders.department.load(department[0].value.toString()) : null,
    description: ({ description }) => (description ? description[0].value : null),
    // lastUpdate: Default works
    total: ({ total }) => total[0].value,
    units: ({ units }) => units[0].value,
};
exports.EntryRefund = {
    id: ({ id }) => id.toString(),
    date: ({ date }) => date[0].value,
    dateOfRecord: ({ dateOfRecord }) => dateOfRecord
        ? {
            date: dateOfRecord.date[0].value,
            overrideFiscalYear: dateOfRecord.overrideFiscalYear[0].value,
        }
        : null,
    fiscalYear: ({ date, dateOfRecord }, _, { loaders }) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        const entryDate = (_b = (_a = date === null || date === void 0 ? void 0 : date[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : new Date();
        const value = ((_d = (_c = dateOfRecord === null || dateOfRecord === void 0 ? void 0 : dateOfRecord.overrideFiscalYear) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value)
            ? (_g = (_f = (_e = dateOfRecord.date) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.value) !== null && _g !== void 0 ? _g : entryDate
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
    deleted: ({ deleted }) => deleted[0].value,
    description: ({ description }) => (description ? description[0].value : null),
    entry: ({ id }, _, { dataSources: { accountingDb } }) => accountingDb.findOne({
        collection: "entries",
        filter: {
            "refunds.id": id,
        },
    }),
    // lastUpdate: Default works
    paymentMethod: ({ paymentMethod }) => paymentMethod[0].value,
    reconciled: ({ reconciled }) => reconciled[0].value,
    total: ({ total }) => total[0].value,
};
exports.Entry = {
    id: ({ _id }) => _id.toString(),
    category: ({ category }, _, { loaders }) => loaders.category.load(category[0].value.toString()),
    date: ({ date }) => date[0].value,
    dateOfRecord: ({ dateOfRecord }) => dateOfRecord
        ? {
            date: dateOfRecord.date[0].value,
            overrideFiscalYear: dateOfRecord.overrideFiscalYear[0].value,
        }
        : null,
    deleted: ({ deleted }) => deleted[0].value,
    department: ({ department }, _, { loaders }) => loaders.department.load(department[0].value.toString()),
    description: ({ description }) => { var _a; return description ? ((_a = description[0]) === null || _a === void 0 ? void 0 : _a.value) || null : null; },
    fiscalYear: ({ date, dateOfRecord }, _, { loaders }) => __awaiter(void 0, void 0, void 0, function* () {
        var _h, _j, _k, _l, _m, _o, _p;
        const entryDate = (_j = (_h = date === null || date === void 0 ? void 0 : date[0]) === null || _h === void 0 ? void 0 : _h.value) !== null && _j !== void 0 ? _j : new Date();
        const value = ((_l = (_k = dateOfRecord === null || dateOfRecord === void 0 ? void 0 : dateOfRecord.overrideFiscalYear) === null || _k === void 0 ? void 0 : _k[0]) === null || _l === void 0 ? void 0 : _l.value)
            ? (_p = (_o = (_m = dateOfRecord.date) === null || _m === void 0 ? void 0 : _m[0]) === null || _o === void 0 ? void 0 : _o.value) !== null && _p !== void 0 ? _p : entryDate
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
    paymentMethod: ({ paymentMethod }) => paymentMethod[0].value,
    reconciled: ({ reconciled }) => reconciled[0].value,
    refunds: ({ refunds }) => refunds || [],
    source: ({ source, _id }, _, { loaders }) => __awaiter(void 0, void 0, void 0, function* () {
        var _q;
        if (!((_q = source === null || source === void 0 ? void 0 : source[0]) === null || _q === void 0 ? void 0 : _q.value)) {
            console.error(`Entry ${_id} has no source`);
            return { __typename: 'Business', id: 'unknown', name: 'Unknown Source' };
        }
        const { type, id } = source[0].value;
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
        console.error(`Entry source ${type}:${id} not found for entry ${_id}`);
        return { __typename: 'Business', id: id.toString(), name: `Unknown ${type}` };
    }),
    total: ({ total }) => total[0].value,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlSZXNvbHZlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2VudHJ5UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQU9uQyxvREFBa0Q7QUFFckMsUUFBQSxTQUFTLEdBQXVCO0lBQzNDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDN0IsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQ3pDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDckQsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUs7SUFDMUMsVUFBVSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQzdDLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO0lBQzdFLFdBQVcsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDN0UsNEJBQTRCO0lBQzVCLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUs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