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
const permissions_1 = require("../utils/permissions");
const reconcileEntries = (_, { input }, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent } = context;
    // Check permission - only SUPER_ADMIN can reconcile entries
    yield (0, permissions_1.checkPermission)(context, "EDIT_TRANSACTION");
    yield _1.validateEntry.reconcileEntries({
        reconcileEntries: input,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb25jaWxlRW50cmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZW50cnkvcmVjb25jaWxlRW50cmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFDbkMsd0JBQWtDO0FBT2xDLG9EQUFzRTtBQUN0RSxzREFBdUQ7QUFFaEQsTUFBTSxnQkFBZ0IsR0FBMEMsQ0FDckUsQ0FBQyxFQUNELEVBQUUsS0FBSyxFQUFFLEVBQ1QsT0FBTyxFQUNQLEVBQUU7O0lBQ0YsTUFBTSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFeEcsNERBQTREO0lBQzVELE1BQU0sSUFBQSw2QkFBZSxFQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBRW5ELE1BQU0sZ0JBQWEsQ0FBQyxnQkFBZ0IsQ0FBQztRQUNuQyxnQkFBZ0IsRUFBRSxLQUFLO1FBQ3ZCLFlBQVk7S0FDYixDQUFDLENBQUM7SUFFSCxNQUFNLFVBQVUsR0FBRyxJQUFJLHVCQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUV0RSxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7SUFFaEQsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQy9CLE1BQU0sYUFBYSxH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