import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { EntityDbRecord } from "../../dataSources/accountingDb/types";
import { UpsertEntrySource } from "../../graphTypes";
/**
 * Parses {@link UpsertEntrySource} and creates records.
 */
export declare const upsertEntrySourceToEntityDbRecord: ({ upsertEntrySourceInput, accountingDb, }: {
    upsertEntrySourceInput: UpsertEntrySource;
    accountingDb: AccountingDb;
}) => Promise<EntityDbRecord>;
