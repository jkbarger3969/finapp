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
const reconcileEntries = (_, { input }, { reqDateTime, user, dataSources: { accountingDb } }) => __awaiter(void 0, void 0, void 0, function* () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb25jaWxlRW50cmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvZW50cnkvcmVjb25jaWxlRW50cmllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBbUM7QUFDbkMsd0JBQWtDO0FBT2xDLG9EQUFzRTtBQUUvRCxNQUFNLGdCQUFnQixHQUEwQyxDQUNyRSxDQUFDLEVBQ0QsRUFBRSxLQUFLLEVBQUUsRUFDVCxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFDcEQsRUFBRTs7SUFDRixNQUFNLGdCQUFhLENBQUMsZ0JBQWdCLENBQUM7UUFDbkMsZ0JBQWdCLEVBQUUsS0FBSztRQUN2QixZQUFZO0tBQ2IsQ0FBQyxDQUFDO0lBRUgsTUFBTSxVQUFVLEdBQUcsSUFBSSx1QkFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFFdEUsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNoRCxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBRWhELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUNoQixHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUMvQixNQUFNLGFBQWEsR0FBRyxJQUFJLGdDQUFtQixDQUFnQjtnQkFDM0QsVUFBVTtnQkFDVixTQUFTLEVBQUUsSUFBSTthQUNoQixDQUFDLENBQUMscUJBQXFCLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRTdDLE1BQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQyxP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