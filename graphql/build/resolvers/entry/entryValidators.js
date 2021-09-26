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
                    category: new mongodb_1.ObjectId(newEntry.category),
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
                        yield category_1.validateCategory.exists({
                            category: categoryId,
                            accountingDb,
                        });
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