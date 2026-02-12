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
const reconcileEntries = (_, { input }, { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb25jaWxlRW50cmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZW50cnkvcmVjb25jaWxlRW50cmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFDbkMsd0JBQWtDO0FBT2xDLG9EQUFzRTtBQUUvRCxNQUFNLGdCQUFnQixHQUEwQyxDQUNyRSxDQUFDLEVBQ0QsRUFBRSxLQUFLLEVBQUUsRUFDVCxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFDdkYsRUFBRTs7SUFDRixNQUFNLGdCQUFhLENBQUMsZ0JBQWdCLENBQUM7UUFDbkMsZ0JBQWdCLEVBQUUsS0FBSztRQUN2QixZQUFZO0tBQ2IsQ0FBQyxDQUFDO0lBRUgsTUFBTSxVQUFVLEdBQUcsSUFBSSx1QkFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFFdEUsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNoRCxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBRWhELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUNoQixHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUMvQixNQUFNLGFBQWEsR0FBRyxJQUFJLGdDQUFtQixDQUFnQjtnQkFDM0QsVUFBVTtnQkFDVixTQUFTLEVBQUUsSUFBSTthQUNoQixDQUFDLENBQUMscUJBQXFCLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1lB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