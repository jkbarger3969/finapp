import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { EntityDbRecord } from "../../dataSources/accountingDb/types";
export declare const validateEntity: {
    exists: ({ entity: { type, id: entityId }, accountingDb, }: {
        entity: EntityDbRecord;
        accountingDb: AccountingDb;
    }) => Promise<void>;
};
