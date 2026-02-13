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
    attachments: (root) => {
        var _a, _b;
        const attachments = ((_b = (_a = root.snapshot) === null || _a === void 0 ? void 0 : _a.meta) === null || _b === void 0 ? void 0 : _b.attachments) || [];
        return attachments.filter((a) => !a.deleted);
    },
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