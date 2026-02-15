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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
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
const fraction_js_1 = __importDefault(require("fraction.js"));
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
                                // Cannot receive money with an AccountCheck (org's own check)
                                throw new apollo_server_errors_1.UserInputError(`Entry "Category" of type "${graphTypes_1.EntryType.Credit}" and payment method "AccountCheck" are incompatible.`);
                            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlWYWxpZGF0b3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy9lbnRyeS9lbnRyeVZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUNBQW1DO0FBQ25DLCtEQUFzRDtBQUl0RCxtRUFBNEQ7QUFDNUQsaURBVTBCO0FBQzFCLHNDQUEyQztBQUMzQywwQ0FBK0M7QUFDL0MsOENBQW1EO0FBQ25ELHVDQUFzQztBQUN0QywwQ0FBK0M7QUFDL0MsOERBQW1DO0FBQ25DLG9EQUcwQjtBQUViLFFBQUEsYUFBYSxHQUFHLElBQUksQ0FBQztJQUMxQixNQUFNLENBQUMsRUFDWCxLQUFLLEVBQ0wsWUFBWSxHQUliOztZQUNDLElBQ0UsQ0FBQyxDQUFDLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQztnQkFDM0IsVUFBVSxFQUFFLFNBQVM7Z0JBQ3JCLE1BQU0sRUFBRTtvQkFDTixHQUFHLEVBQUUsS0FBSztpQkFDWDtnQkFDRCxPQUFPLEVBQUU7b0JBQ1AsVUFBVSxFQUFFO3dCQUNWLEdBQUcsRUFBRSxJQUFJO3FCQUNWO2lCQUNGO2FBQ0YsQ0FBQyxDQUFDLEVBQ0g7Z0JBQ0EsTUFBTSxJQUFJLHFDQUFjLENBQ3RCLGVBQWUsS0FBSyxDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FDckQsQ0FBQzthQUNIO1FBQ0gsQ0FBQztLQUFBO0lBQ0ssWUFBWSxDQUFDLEVBQ2pCLE1BQU0sRUFDTixZQUFZLEdBSWI7O1lBQ0MsSUFDRSxDQUFDLENBQUMsTUFBTSxZQUFZLENBQUMsT0FBTyxDQUFDO2dCQUMzQixVQUFVLEVBQUUsU0FBUztnQkFDckIsTUFBTSxFQUFFO29CQUNOLFlBQVksRUFBRSxNQUFNO2lCQUNyQjtnQkFDRCxPQUFPLEVBQUU7b0JBQ1AsVUFBVSxFQUFFO3dCQUNWLEdBQUcsRUFBRSxJQUFJO3FCQUNWO2lCQUNGO2FBQ0YsQ0FBQyxDQUFDLEVBQ0g7Z0JB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