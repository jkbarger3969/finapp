import { PaymentMethodDBRecord } from "../../dataSources/accountingDb/types";
import { UpsertPaymentMethod } from "../../graphTypes";
export declare const upsertPaymentMethodToDbRecord: ({ upsertPaymentMethod, }: {
    upsertPaymentMethod: UpsertPaymentMethod;
}) => PaymentMethodDBRecord;
