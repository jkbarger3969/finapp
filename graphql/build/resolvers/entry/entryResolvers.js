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
    fiscalYear: ({ date, dateOfRecord }, _, { dataSources: { accountingDb } }) => {
        // NOTE: Fiscal Year lookup by Date Range cannot be easily Datloaded without a complex key.
        // Keeping this one usage of accountingDb.findOne is acceptable as it's typically one per entry,
        // and Fiscal Years are few. However, caching could be added if needed.
        // For now, let's leave valid Date-based lookup as is, since DataLoader is ID-based.
        const value = (dateOfRecord === null || dateOfRecord === void 0 ? void 0 : dateOfRecord.overrideFiscalYear[0].value)
            ? dateOfRecord.date[0].value
            : date[0].value;
        return accountingDb.findOne({
            collection: "fiscalYears",
            filter: {
                begin: {
                    $lte: value,
                },
                end: {
                    $gt: value,
                },
            },
        });
    },
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
    fiscalYear: ({ date, dateOfRecord }, _, { dataSources: { accountingDb } }) => {
        const value = (dateOfRecord === null || dateOfRecord === void 0 ? void 0 : dateOfRecord.overrideFiscalYear[0].value)
            ? dateOfRecord.date[0].value
            : date[0].value;
        return accountingDb.findOne({
            collection: "fiscalYears",
            filter: {
                begin: {
                    $lte: value,
                },
                end: {
                    $gt: value,
                },
            },
        });
    },
    items: ({ items }) => items !== null && items !== void 0 ? items : [],
    // lastUpdate: Default works
    paymentMethod: ({ paymentMethod }) => paymentMethod[0].value,
    reconciled: ({ reconciled }) => reconciled[0].value,
    refunds: ({ refunds }) => refunds || [],
    source: ({ source, _id }, _, { loaders }) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!((_a = source === null || source === void 0 ? void 0 : source[0]) === null || _a === void 0 ? void 0 : _a.value)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlSZXNvbHZlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2VudHJ5L2VudHJ5UmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQU1BLG9EQUFrRDtBQUVyQyxRQUFBLFNBQVMsR0FBdUI7SUFDM0MsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUM3QixRQUFRLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FDekMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNyRCxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSztJQUMxQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FDN0MsVUFBVSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7SUFDN0UsV0FBVyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUM3RSw0QkFBNEI7SUFDNUIsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMsS0FB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