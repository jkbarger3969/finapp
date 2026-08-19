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
exports.reconcileEntries = void 0;
const mongodb_1 = require("mongodb");
const _1 = require(".");
const DocHistory_1 = require("../utils/DocHistory");
const departmentAccess_1 = require("../utils/departmentAccess");
/**
 * Rejects a reconcile request that targets any entry or refund outside the
 * caller's accessible departments (including descendants). Refunds are
 * checked against their *parent* entry's department, since refunds don't
 * carry their own department.
 */
function assertReconcileAccess({ input, authService, userId, accountingDb, }) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        const permittedDeptIds = yield (0, departmentAccess_1.getAccessibleDeptIdsWithDescendants)({
            authService,
            userId,
            db: accountingDb.db,
        });
        // null => unrestricted (SUPER_ADMIN or no authService wired up)
        if (!permittedDeptIds) {
            return;
        }
        const entryIds = (input.entries || []).filter((id) => id != null);
        const refundIds = (input.refunds || []).filter((id) => id != null);
        if (entryIds.length === 0 && refundIds.length === 0) {
            return;
        }
        const permittedDeptIdStrings = new Set(permittedDeptIds.map((id) => id.toString()));
        const entryObjectIds = entryIds.map((id) => new mongodb_1.ObjectId(id));
        const refundObjectIds = refundIds.map((id) => new mongodb_1.ObjectId(id));
        const referencedEntries = yield accountingDb.db
            .collection("entries")
            .find({
            $or: [
                ...(entryObjectIds.length ? [{ _id: { $in: entryObjectIds } }] : []),
                ...(refundObjectIds.length
                    ? [{ "refunds.id": { $in: refundObjectIds } }]
                    : []),
            ],
        }, {
            projection: { _id: 1, department: 1, "refunds.id": 1 },
        })
            .toArray();
        const entryById = new Map(referencedEntries.map((entry) => [entry._id.toString(), entry]));
        for (const id of entryIds) {
            const entry = entryById.get(id);
            const deptId = (_c = (_b = (_a = entry === null || entry === void 0 ? void 0 : entry.department) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) === null || _c === void 0 ? void 0 : _c.toString();
            if (!entry || !deptId || !permittedDeptIdStrings.has(deptId)) {
                throw new Error(`Unauthorized: cannot reconcile entry "${id}"`);
            }
        }
        const parentEntryByRefundId = new Map();
        for (const entry of referencedEntries) {
            for (const refund of entry.refunds || []) {
                parentEntryByRefundId.set(refund.id.toString(), entry);
            }
        }
        for (const id of refundIds) {
            const parentEntry = parentEntryByRefundId.get(id);
            const deptId = (_f = (_e = (_d = parentEntry === null || parentEntry === void 0 ? void 0 : parentEntry.department) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.value) === null || _f === void 0 ? void 0 : _f.toString();
            if (!parentEntry || !deptId || !permittedDeptIdStrings.has(deptId)) {
                throw new Error(`Unauthorized: cannot reconcile refund "${id}"`);
            }
        }
    });
}
const reconcileEntries = (_, { input }, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent } = context;
    if (!(user === null || user === void 0 ? void 0 : user.id)) {
        throw new Error("Unauthorized: Please log in");
    }
    yield _1.validateEntry.reconcileEntries({
        reconcileEntries: input,
        accountingDb,
    });
    yield assertReconcileAccess({
        input,
        authService,
        userId: user.id,
        accountingDb,
    });
    const docHistory = new DocHistory_1.DocHistory({ by: user.id, date: reqDateTime });
    const entriesSet = new Set(input.entries || []);
    const refundsSet = new Set(input.refunds || []);
    yield Promise.all([
        ...[...entriesSet].map((entry) => {
            const updateBuilder = new DocHistory_1.UpdateHistoricalDoc({
                docHistory,
                isRootDoc: true,
            }).updateHistoricalField("reconciled", true);
            const entryUpdate = updateBuilder.valueOf();
            const update = {};
            if (entryUpdate === null || entryUpdate === void 0 ? void 0 : entryUpdate.$set) {
                update.$set = Object.assign({}, entryUpdate === null || entryUpdate === void 0 ? void 0 : entryUpdate.$set);
            }
            if (entryUpdate === null || entryUpdate === void 0 ? void 0 : entryUpdate.$push) {
                update.$push = Object.assign({}, entryUpdate === null || entryUpdate === void 0 ? void 0 : entryUpdate.$push);
            }
            return accountingDb.updateOne({
                collection: "entries",
                filter: { _id: new mongodb_1.ObjectId(entry) },
                update,
            });
        }),
        ...[...refundsSet].map((refund) => {
            const updateBuilder = new DocHistory_1.UpdateHistoricalDoc({
                docHistory,
                isRootDoc: true,
                fieldPrefix: "refunds.$",
            }).updateHistoricalField("reconciled", true);
            return accountingDb.updateOne({
                collection: "entries",
                filter: {
                    "refunds.id": new mongodb_1.ObjectId(refund),
                },
                update: updateBuilder.valueOf(),
            });
        }),
    ]);
    // Log audit entries for reconciliation
    if (authService) {
        if (entriesSet.size > 0) {
            yield authService.logAudit({
                userId: user.id,
                action: "RECONCILE",
                resourceType: "Entry",
                details: {
                    entryIds: [...entriesSet],
                    count: entriesSet.size,
                },
                ipAddress,
                userAgent,
                timestamp: new Date(),
            });
        }
        if (refundsSet.size > 0) {
            yield authService.logAudit({
                userId: user.id,
                action: "RECONCILE",
                resourceType: "Refund",
                details: {
                    refundIds: [...refundsSet],
                    count: refundsSet.size,
                },
                ipAddress,
                userAgent,
                timestamp: new Date(),
            });
        }
    }
    return {
        reconciledEntries: ((_a = input.entries) === null || _a === void 0 ? void 0 : _a.length)
            ? yield accountingDb.find({
                collection: "entries",
                filter: {
                    _id: { $in: [...entriesSet].map((id) => new mongodb_1.ObjectId(id)) },
                },
            })
            : [],
        reconciledRefunds: ((_b = input.refunds) === null || _b === void 0 ? void 0 : _b.length)
            ? (yield accountingDb.find({
                collection: "entries",
                filter: {
                    "refunds.id": {
                        $in: [...refundsSet].map((id) => new mongodb_1.ObjectId(id)),
                    },
                },
                options: {
                    projection: {
                        refunds: true,
                    },
                },
            })).reduce((reconciledRefunds, { refunds }) => {
                reconciledRefunds.push(...refunds.filter(({ id }) => refundsSet.has(id.toHexString())));
                return reconciledRefunds;
            }, [])
            : [],
    };
});
exports.reconcileEntries = reconcileEntries;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb25jaWxlRW50cmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZW50cnkvcmVjb25jaWxlRW50cmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFDbkMsd0JBQWtDO0FBUWxDLG9EQUFzRTtBQUN0RSxnRUFBZ0Y7QUFFaEY7Ozs7O0dBS0c7QUFDSCxTQUFlLHFCQUFxQixDQUFDLEVBQ25DLEtBQUssRUFDTCxXQUFXLEVBQ1gsTUFBTSxFQUNOLFlBQVksR0FNYjs7O1FBQ0MsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLElBQUEsc0RBQW1DLEVBQUM7WUFDakUsV0FBVztZQUNYLE1BQU07WUFDTixFQUFFLEVBQUUsWUFBWSxDQUFDLEVBQUU7U0FDcEIsQ0FBQyxDQUFDO1FBRUgsZ0VBQWdFO1FBQ2hFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUNyQixPQUFPO1NBQ1I7UUFFRCxNQUFNLFFBQVEsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUMzQyxDQUFDLEVBQUUsRUFBZ0IsRUFBRSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQ2pDLENBQUM7UUFDRixNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUM1QyxDQUFDLEVBQUUsRUFBZ0IsRUFBRSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQ2pDLENBQUM7UUFFRixJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ25ELE9BQU87U0FDUjtRQUVELE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxHQUFHLENBQ3BDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFD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