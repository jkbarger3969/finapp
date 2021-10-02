import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { UpsertPaymentMethod } from "../../graphTypes";
export declare const validatePaymentMethod: {
    upsertPaymentMethod({ upsertPaymentMethod, accountingDb, }: {
        upsertPaymentMethod: UpsertPaymentMethod;
        accountingDb?: AccountingDb;
    }): Promise<void>;
};
