import { ObjectId } from "mongodb";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { PaymentMethodDBRecord } from "../../dataSources/accountingDb/types";
import { NewEntry, NewEntryRefund, ReconcileEntries, UpdateEntry, UpdateEntryDateOfRecord, UpdateEntryRefund, UpsertEntrySource } from "../../graphTypes";
import Fraction from "fraction.js";
export declare const validateEntry: {
    exists({ entry, accountingDb, }: {
        entry: ObjectId;
        accountingDb: AccountingDb;
    }): Promise<void>;
    refundExists({ refund, accountingDb, }: {
        refund: ObjectId;
        accountingDb: AccountingDb;
    }): Promise<void>;
    entryCategoryPayMethod(args: {
        accountingDb: AccountingDb;
    } & ({
        category: ObjectId;
        paymentMethod: PaymentMethodDBRecord;
    } | {
        entry: ObjectId;
        category: ObjectId;
    } | {
        entry: ObjectId;
        paymentMethod: PaymentMethodDBRecord;
    })): Promise<void>;
    entryRefundCategoryPayMethod({ entry, paymentMethod, accountingDb, }: {
        entry: ObjectId;
        paymentMethod: PaymentMethodDBRecord;
        accountingDb: AccountingDb;
    }): Promise<void>;
    upsertEntrySource({ upsertEntrySource, accountingDb, }: {
        accountingDb: AccountingDb;
        upsertEntrySource: UpsertEntrySource;
    }): Promise<void>;
    upsertEntryDate({ newEntryDate, reqDateTime, }: {
        newEntryDate: Date;
        reqDateTime: Date;
    }): void;
    upsertEntryTotal({ total }: {
        total: Fraction;
    }): void;
    upsertEntryRefundTotal({ entry, total: newTotal, refund: refundId, accountingDb, }: {
        entry: ObjectId;
        total: Fraction;
        refund?: ObjectId;
        accountingDb: AccountingDb;
    }): Promise<void>;
    newEntry({ newEntry, accountingDb, reqDateTime, }: {
        accountingDb: AccountingDb;
        reqDateTime: Date;
        newEntry: NewEntry;
    }): Promise<void>;
    updateEntry({ updateEntry, accountingDb, reqDateTime, }: {
        accountingDb: AccountingDb;
        reqDateTime: Date;
        updateEntry: UpdateEntry;
    }): Promise<void>;
    updateEntryDateOfRecord({ updateEntryDateOfRecord, }: {
        updateEntryDateOfRecord: UpdateEntryDateOfRecord;
    }): void;
    newEntryRefund({ newEntryRefund, accountingDb, reqDateTime, }: {
        accountingDb: AccountingDb;
        reqDateTime: Date;
        newEntryRefund: NewEntryRefund;
    }): Promise<void>;
    updateEntryRefund({ accountingDb, reqDateTime, updateEntryRefund, }: {
        accountingDb: AccountingDb;
        reqDateTime: Date;
        updateEntryRefund: UpdateEntryRefund;
    }): Promise<void>;
    reconcileEntries({ reconcileEntries, accountingDb, }: {
        accountingDb: AccountingDb;
        reconcileEntries: ReconcileEntries;
    }): Promise<void>;
};
