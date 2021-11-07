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
exports.validateEntry = void 0;
const mongodb_1 = require("mongodb");
const apollo_server_errors_1 = require("apollo-server-errors");
const categoryResolver_1 = require("../category/categoryResolver");
const graphTypes_1 = require("../../graphTypes");
const person_1 = require("../person");
const business_1 = require("../business");
const department_1 = require("../department");
const date_fns_1 = require("date-fns");
const category_1 = require("../category");
const fraction_js_1 = require("fraction.js");
const paymentMethod_1 = require("../paymentMethod");
exports.validateEntry = new (class {
    exists({ entry, accountingDb, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield accountingDb.findOne({
                collection: "entries",
                filter: {
                    _id: entry,
                },
                options: {
                    projection: {
                        _id: true,
                    },
                },
            }))) {
                throw new apollo_server_errors_1.UserInputError(`"Entry" id "${entry.toHexString()} does not exists`);
            }
        });
    }
    refundExists({ refund, accountingDb, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield accountingDb.findOne({
                collection: "entries",
                filter: {
                    "refunds.id": refund,
                },
                options: {
                    projection: {
                        _id: true,
                    },
                },
            }))) {
                throw new apollo_server_errors_1.UserInputError(`"EntryRefund" id "${refund.toHexString()} does not exists`);
            }
        });
    }
    entryCategoryPayMethod(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { paymentMethod, category, accountingDb } = yield (() => __awaiter(this, void 0, void 0, function* () {
                if (!("entry" in args)) {
                    return Object.assign({}, args);
                }
                else if ("category" in args) {
                    return Object.assign(Object.assign({}, args), { paymentMethod: yield args.accountingDb
                            .findOne({
                            collection: "entries",
                            filter: {
                                _id: args.entry,
                            },
                            options: {
                                projection: {
                                    paymentMethod: true,
                                },
                            },
                        })
                            .then(({ paymentMethod: [{ value }] }) => value) });
                }
                else {
                    return Object.assign(Object.assign({}, args), { category: yield args.accountingDb
                            .findOne({
                            collection: "entries",
                            filter: {
                                _id: args.entry,
                            },
                            options: {
                                projection: {
                                    category: true,
                                },
                            },
                        })
                            .then(({ category: [{ value }] }) => value) });
                }
            }))();
            const entryType = yield (0, categoryResolver_1.categoryType)({
                category,
                accountingDb,
            });
            switch (paymentMethod.type) {
                // Valid for all entryTypes
                case "Cash":
                case "Combination":
                case "Online":
                case "Unknown":
                    break;
                // Type dependent
                case "Check":
                    {
                        const isAccountCheck = !!paymentMethod.check.account;
                        if (entryType === "Credit") {
                            if (isAccountCheck) {
                                // Cannot receive money with an AccountCheck
                                throw new apollo_server_errors_1.UserInputError(`Entry "Category" of type "${graphTypes_1.EntryType.Credit}" and payment method "AccountCheck" are incompatible.`);
                            }
                        }
                        else if (!isAccountCheck) {
                            // Cannot give money with an PaymentCheck
                            throw new apollo_server_errors_1.UserInputError(`Entry "Category" of type "${graphTypes_1.EntryType.Debit}" and payment method "PaymentCheck" are incompatible.`);
                        }
                    }
                    break;
                case "Card": {
                    const isAccountCard = paymentMethod.card instanceof mongodb_1.ObjectId;
                    if (entryType === "Credit") {
                        if (isAccountCard) {
                            // Cannot be receive money on an AccountCard
                            throw new apollo_server_errors_1.UserInputError(`Entry "Category" of type "${graphTypes_1.EntryType.Credit}" and payment method "AccountCard" are incompatible.`);
                        }
                    }
                    else if (!isAccountCard) {
                        // Cannot be give money on an PaymentCard
                        throw new apollo_server_errors_1.UserInputError(`Entry "Category" of type "${graphTypes_1.EntryType.Debit}" and payment method "PaymentCard" are incompatible.`);
                    }
                }
            }
        });
    }
    entryRefundCategoryPayMethod({ entry, paymentMethod, accountingDb, }) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (paymentMethod.type) {
                // Valid for all entryTypes
                case "Cash":
                case "Combination":
                case "Online":
                case "Unknown":
                    return;
                default:
                    break;
            }
            const entryType = yield (0, categoryResolver_1.categoryType)({
                category: yield accountingDb
                    .findOne({
                    collection: "entries",
                    filter: {
                        _id: entry,
                    },
                    options: {
                        projection: {
                            category: true,
                        },
                    },
                })
                    .then(({ category: [{ value }] }) => value),
                accountingDb,
            });
            switch (paymentMethod.type) {
                case "Card":
                    {
                        const isAccountCard = paymentMethod.card instanceof mongodb_1.ObjectId;
                        if (entryType === "Credit") {
                            if (isAccountCard) {
                                // Cannot give a refund from a AccountCard
                                throw new apollo_server_errors_1.UserInputError(`A refund with entry "Category" of type "${graphTypes_1.EntryType.Credit}" and payment method "AccountCard" are incompatible.`);
                            }
                        }
                        else if (!isAccountCard) {
                            // Cannot receive a refund from a PaymentCard
                            throw new apollo_server_errors_1.UserInputError(`A refund with entry "Category" of type "${graphTypes_1.EntryType.Debit}" and payment method "PaymentCard" are incompatible.`);
                        }
                    }
                    break;
                case "Check":
                    {
                        const isAccountCheck = !!paymentMethod.check.account;
                        if (entryType === "Credit") {
                            if (!isAccountCheck) {
                                // Cannot give a refund with an PaymentCheck.
                                throw new apollo_server_errors_1.UserInputError(`A refund with entry "Category" of type "${graphTypes_1.EntryType.Credit}" and payment method "PaymentCheck" are incompatible.`);
                            }
                        }
                        else if (isAccountCheck) {
                            // Cannot receive a refund with an AccountCheck
                            throw new apollo_server_errors_1.UserInputError(`A refund with entry "Category" of type "${graphTypes_1.EntryType.Debit}" and payment method "AccountCheck" are incompatible.`);
                        }
                    }
                    break;
            }
        });
    }
    upsertEntrySource({ upsertEntrySource, accountingDb, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const [field, ...restFields] = Object.keys(upsertEntrySource);
            if (!field) {
                throw new apollo_server_errors_1.UserInputError(`"UpsertEntrySource" requires one field."`);
            }
            else if (restFields.length) {
                throw new apollo_server_errors_1.UserInputError(`"UpsertEntrySource.${field}" is mutually exclusive to  ${restFields
                    .map((field) => `"UpsertEntrySource.${field}"`)
                    .join(", ")}.`);
            }
            switch (field) {
                case "business":
                    business_1.validateBusiness.newBusiness({
                        newBusiness: upsertEntrySource.business,
                    });
                    break;
                case "person":
                    yield person_1.validatePerson.newPerson({ newPerson: upsertEntrySource.person });
                    break;
                case "source":
                    {
                        const id = new mongodb_1.ObjectId(upsertEntrySource.source.id);
                        switch (upsertEntrySource.source.type) {
                            case graphTypes_1.EntityType.Business:
                                yield business_1.validateBusiness.exists({ business: id, accountingDb });
                                break;
                            case graphTypes_1.EntityType.Department:
                                yield department_1.validateDepartment.exists({ department: id, accountingDb });
                                break;
                            case graphTypes_1.EntityType.Person:
                                yield person_1.validatePerson.exists({ person: id, accountingDb });
                                break;
                        }
                    }
                    break;
            }
        });
    }
    upsertEntryDate({ newEntryDate, reqDateTime, }) {
        if ((0, date_fns_1.startOfDay)(newEntryDate) > (0, date_fns_1.startOfDay)(reqDateTime)) {
            throw new apollo_server_errors_1.UserInputError(`Entry date cannot be in the future.`);
        }
    }
    upsertEntryTotal({ total }) {
        if (total.compare(0) < 1) {
            throw new apollo_server_errors_1.UserInputError(`Entry total must be greater than zero.`);
        }
    }
    upsertEntryRefundTotal({ entry, total: newTotal, refund: refundId, accountingDb, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (newTotal.compare(0) < 1) {
                throw new apollo_server_errors_1.UserInputError(`Entry refund total must be greater than zero.`);
            }
            const { refunds, total: [{ value: total }], } = yield accountingDb.findOne({
                collection: "entries",
                filter: { _id: entry },
                options: {
                    projection: {
                        "total.value": true,
                        "refunds.id": true,
                        "refunds.total.value": true,
                        "refunds.deleted.value": true,
                    },
                },
            });
            let remaining = new fraction_js_1.default(total).sub(newTotal);
            const lessThanZero = (amount) => {
                if (remaining.compare(0) < 0) {
                    throw new apollo_server_errors_1.UserInputError(`Refunds cannot exceed entry total.`);
                }
            };
            lessThanZero(remaining);
            for (const { id, total: [{ value: refund }], deleted: [{ value: deleted }], } of refunds || []) {
                if (!deleted && (!refundId || !id.equals(refundId))) {
                    lessThanZero((remaining = remaining.sub(new fraction_js_1.default(refund))));
                }
            }
        });
    }
    newEntry({ newEntry, accountingDb, reqDateTime, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const categoryId = new mongodb_1.ObjectId(newEntry.category);
            yield Promise.all([
                // date
                this.upsertEntryDate({ newEntryDate: newEntry.date, reqDateTime }),
                // department
                department_1.validateDepartment.exists({
                    department: new mongodb_1.ObjectId(newEntry.department),
                    accountingDb,
                }),
                // category
                category_1.validateCategory.exists({
                    category: categoryId,
                    accountingDb,
                }),
                category_1.validateCategory.isNotRoot({
                    category: categoryId,
                    accountingDb,
                }),
                // paymentMethod
                (() => __awaiter(this, void 0, void 0, function* () {
                    yield paymentMethod_1.validatePaymentMethod.upsertPaymentMethod({
                        upsertPaymentMethod: newEntry.paymentMethod,
                        accountingDb,
                    });
                    yield this.entryCategoryPayMethod({
                        accountingDb,
                        category: categoryId,
                        paymentMethod: (0, paymentMethod_1.upsertPaymentMethodToDbRecord)({
                            upsertPaymentMethod: newEntry.paymentMethod,
                        }),
                    });
                }))(),
                // total
                this.upsertEntryTotal({ total: newEntry.total }),
                // Source
                this.upsertEntrySource({
                    upsertEntrySource: newEntry.source,
                    accountingDb,
                }),
            ]);
        });
    }
    updateEntry({ updateEntry, accountingDb, reqDateTime, }) {
        return __awaiter(this, void 0, void 0, function* () {
            // Must be the id + some field update
            if (Object.keys(updateEntry).length < 2) {
                throw new apollo_server_errors_1.UserInputError("Nothing to update.");
            }
            const entry = new mongodb_1.ObjectId(updateEntry.id);
            // entry
            yield this.exists({
                entry: entry,
                accountingDb,
            });
            yield Promise.all([
                // date
                updateEntry.date &&
                    this.upsertEntryDate({
                        newEntryDate: updateEntry.date,
                        reqDateTime,
                    }),
                // dateOfRecord
                updateEntry.dateOfRecord &&
                    this.updateEntryDateOfRecord({
                        updateEntryDateOfRecord: updateEntry.dateOfRecord,
                    }),
                // department
                updateEntry.department &&
                    department_1.validateDepartment.exists({
                        department: new mongodb_1.ObjectId(updateEntry.department),
                        accountingDb,
                    }),
                // category and paymentMethod
                (() => __awaiter(this, void 0, void 0, function* () {
                    const categoryId = updateEntry.category && new mongodb_1.ObjectId(updateEntry.category);
                    if (categoryId && updateEntry.paymentMethod) {
                        yield Promise.all([
                            category_1.validateCategory.exists({
                                category: categoryId,
                                accountingDb,
                            }),
                            category_1.validateCategory.isNotRoot({
                                category: categoryId,
                                accountingDb,
                            }),
                            paymentMethod_1.validatePaymentMethod.upsertPaymentMethod({
                                upsertPaymentMethod: updateEntry.paymentMethod,
                                accountingDb,
                            }),
                        ]);
                        yield this.entryCategoryPayMethod({
                            accountingDb,
                            category: categoryId,
                            paymentMethod: (0, paymentMethod_1.upsertPaymentMethodToDbRecord)({
                                upsertPaymentMethod: updateEntry.paymentMethod,
                            }),
                        });
                    }
                    else if (categoryId) {
                        yield Promise.all([
                            category_1.validateCategory.exists({
                                category: categoryId,
                                accountingDb,
                            }),
                            category_1.validateCategory.isNotRoot({
                                category: categoryId,
                                accountingDb,
                            }),
                        ]);
                        yield this.entryCategoryPayMethod({
                            accountingDb,
                            category: categoryId,
                            entry,
                        });
                    }
                    else if (updateEntry.paymentMethod) {
                        yield paymentMethod_1.validatePaymentMethod.upsertPaymentMethod({
                            upsertPaymentMethod: updateEntry.paymentMethod,
                            accountingDb,
                        });
                        yield this.entryCategoryPayMethod({
                            accountingDb,
                            entry,
                            paymentMethod: (0, paymentMethod_1.upsertPaymentMethodToDbRecord)({
                                upsertPaymentMethod: updateEntry.paymentMethod,
                            }),
                        });
                    }
                }))(),
                // total
                updateEntry.total && this.upsertEntryTotal({ total: updateEntry.total }),
                // Source
                updateEntry.source &&
                    this.upsertEntrySource({
                        upsertEntrySource: updateEntry.source,
                        accountingDb,
                    }),
            ]);
        });
    }
    updateEntryDateOfRecord({ updateEntryDateOfRecord, }) {
        const fields = Object.keys(updateEntryDateOfRecord);
        const numFields = fields.length;
        if (!numFields) {
            throw new apollo_server_errors_1.UserInputError(`"UpdateEntryDateOfRecord" requires at least one field.`);
        }
        else if (numFields > 1 && "clear" in updateEntryDateOfRecord) {
            throw new apollo_server_errors_1.UserInputError(`"UpdateEntryDateOfRecord.clear" is mutually exclusive to ${fields
                .filter((field) => field !== "clear")
                .map((field) => `"UpdateEntryDateOfRecord.${field}"`)
                .join(", ")}.`);
        }
    }
    newEntryRefund({ newEntryRefund, accountingDb, reqDateTime, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const entry = new mongodb_1.ObjectId(newEntryRefund.entry);
            yield this.exists({
                accountingDb,
                entry: entry,
            });
            yield Promise.all([
                // date
                this.upsertEntryDate({
                    newEntryDate: newEntryRefund.date,
                    reqDateTime,
                }),
                // paymentMethod
                (() => __awaiter(this, void 0, void 0, function* () {
                    yield paymentMethod_1.validatePaymentMethod.upsertPaymentMethod({
                        upsertPaymentMethod: newEntryRefund.paymentMethod,
                        accountingDb,
                    });
                    yield this.entryRefundCategoryPayMethod({
                        accountingDb,
                        paymentMethod: (0, paymentMethod_1.upsertPaymentMethodToDbRecord)({
                            upsertPaymentMethod: newEntryRefund.paymentMethod,
                        }),
                        entry,
                    });
                }))(),
                // total
                this.upsertEntryRefundTotal({
                    total: newEntryRefund.total,
                    entry,
                    accountingDb,
                }),
            ]);
        });
    }
    updateEntryRefund({ accountingDb, reqDateTime, updateEntryRefund, }) {
        return __awaiter(this, void 0, void 0, function* () {
            // Must be the id + some field update
            if (Object.keys(updateEntryRefund).length < 2) {
                throw new apollo_server_errors_1.UserInputError("Nothing to update.");
            }
            const refundId = new mongodb_1.ObjectId(updateEntryRefund.id);
            yield this.refundExists({
                refund: refundId,
                accountingDb,
            });
            yield Promise.all([
                // Date
                updateEntryRefund.date &&
                    this.upsertEntryDate({
                        newEntryDate: updateEntryRefund.date,
                        reqDateTime,
                    }),
                // Date of Record
                updateEntryRefund.dateOfRecord &&
                    this.updateEntryDateOfRecord({
                        updateEntryDateOfRecord: updateEntryRefund.dateOfRecord,
                    }),
                // paymentMethod
                updateEntryRefund.paymentMethod &&
                    (() => __awaiter(this, void 0, void 0, function* () {
                        yield paymentMethod_1.validatePaymentMethod.upsertPaymentMethod({
                            upsertPaymentMethod: updateEntryRefund.paymentMethod,
                            accountingDb,
                        });
                        yield this.entryRefundCategoryPayMethod({
                            accountingDb,
                            paymentMethod: (0, paymentMethod_1.upsertPaymentMethodToDbRecord)({
                                upsertPaymentMethod: updateEntryRefund.paymentMethod,
                            }),
                            entry: (yield accountingDb.findOne({
                                collection: "entries",
                                filter: {
                                    "refunds.id": refundId,
                                },
                                options: {
                                    projection: {
                                        _id: true,
                                    },
                                },
                            }))._id,
                        });
                    }))(),
                updateEntryRefund.total &&
                    this.upsertEntryRefundTotal({
                        total: updateEntryRefund.total,
                        refund: refundId,
                        entry: (yield accountingDb.findOne({
                            collection: "entries",
                            filter: {
                                "refunds.id": refundId,
                            },
                            options: {
                                projection: {
                                    _id: true,
                                },
                            },
                        }))._id,
                        accountingDb,
                    }),
            ]);
        });
    }
    reconcileEntries({ reconcileEntries, accountingDb, }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!((_a = reconcileEntries.entries) === null || _a === void 0 ? void 0 : _a.length) &&
                !((_b = reconcileEntries === null || reconcileEntries === void 0 ? void 0 : reconcileEntries.refunds) === null || _b === void 0 ? void 0 : _b.length)) {
                throw new apollo_server_errors_1.UserInputError("No entries or refunds to update.");
            }
            yield Promise.all([
                ...(reconcileEntries.entries || []).map((entry) => (() => __awaiter(this, void 0, void 0, function* () {
                    const id = new mongodb_1.ObjectId(entry);
                    yield this.exists({
                        entry: id,
                        accountingDb,
                    });
                    const { reconciled: [{ value }], } = yield accountingDb.findOne({
                        collection: "entries",
                        filter: { _id: id },
                        options: {
                            projection: {
                                "reconciled.value": true,
                            },
                        },
                    });
                    if (value) {
                        throw new apollo_server_errors_1.UserInputError(`Entry id "${entry}" is already reconciled.`);
                    }
                }))()),
                ...(reconcileEntries.refunds || []).map((refund) => (() => __awaiter(this, void 0, void 0, function* () {
                    const id = new mongodb_1.ObjectId(refund);
                    yield this.refundExists({
                        refund: id,
                        accountingDb,
                    });
                    const { refunds } = yield accountingDb.findOne({
                        collection: "entries",
                        filter: { "refunds.id": id },
                        options: {
                            projection: {
                                "refunds.id": true,
                                "refunds.reconciled": true,
                            },
                        },
                    });
                    if (refunds.find(({ id: refundId }) => refundId.equals(id))
                        .reconciled[0].value) {
                        throw new apollo_server_errors_1.UserInputError(`Refund id "${refund}" is already reconciled.`);
                    }
                }))()),
            ]);
        });
    }
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlWYWxpZGF0b3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9lbnRyeS9lbnRyeVZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBQ25DLCtEQUFzRDtBQUl0RCxtRUFBNEQ7QUFDNUQsaURBVTBCO0FBQzFCLHNDQUEyQztBQUMzQywwQ0FBK0M7QUFDL0MsOENBQW1EO0FBQ25ELHVDQUFzQztBQUN0QywwQ0FBK0M7QUFDL0MsNkNBQW1DO0FBQ25DLG9EQUcwQjtBQUdiLFFBQUEsYUFBYSxHQUFHLElBQUksQ0FBQztJQUMxQixNQUFNLENBQUMsRUFDWCxLQUFLLEVBQ0wsWUFBWSxHQUliOztZQUNDLElBQ0UsQ0FBQyxDQUFDLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDM0IsVUFBVSxFQUFFLFNBQVM7Z0JBQ3JCLE1BQU0sRUFBRTtvQkFDTixHQUFHLEVBQUUsS0FBSztpQkFDWDtnQkFDRCxPQUFPLEVBQUU7b0JBQ1AsVUFBVSxFQUFFO3dCQUNWLEdBQUcsRUFBRSxJQUFJO3FCQUNWO2lCQUNGO2FBQ0YsQ0FBQyxDQUFDLEVBQ0g7Z0JBQ0EsTUFBTSxJQUFJLHFDQUFjLENBQ3RCLGVBQWUsS0FBSyxDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FDckQsQ0FBQzthQUNIO1FBQ0gsQ0FBQztLQUFBO0lBQ0ssWUFBWSxDQUFDLEVBQ2pCLE1BQU0sRUFDTixZQUFZLEdBSWI7O1lBQ0MsSUFDRSxDQUFDLENBQUMsTUFBTSxZQUFZLENBQUMsT0FBTyxDQUFDO2dCQUMzQixVQUFVLEVBQUUsU0FBUztnQkFDckIsTUFBTSxFQUFFO29CQUNOLFlBQVksRUFBRSxNQUFNO2lCQUNyQjtnQkFDRCxPQUFPLEVBQUU7b0JBQ1AsVUFBVSxFQUFFO3dCQUNWLEdBQUcsRUFBRSxJQUFJO3FCQUNWO2lCQUNGO2FBQ0YsQ0FBQyxDQUFDLEVBQ0g7Z0JBQ0Es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