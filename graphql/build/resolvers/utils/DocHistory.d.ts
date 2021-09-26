import { ObjectId } from "mongodb";
import { OmitProperties } from "ts-essentials";
export interface HistoryObject<T> {
    readonly value: T;
    readonly createdBy: ObjectId;
    readonly createdOn: Date;
}
export interface HistoricalRoot {
    readonly lastUpdate: Date;
    readonly createdOn: Date;
    readonly createdBy: ObjectId;
}
export declare type IDField<IsMongoRoot extends true | false = true> = IsMongoRoot extends true ? {
    _id: ObjectId;
} : {
    id: ObjectId;
};
export declare type IDFieldKeys = keyof IDField<true> | keyof IDField<false>;
export declare type HistoricalDoc<IsRootDoc extends true | false, HistoricalFields extends Record<string, unknown>, Fields extends Record<string, unknown> | undefined = undefined, IsMongoRoot extends true | false = IsRootDoc> = Omit<{
    [K in keyof HistoricalFields]: HistoryObject<HistoricalFields[K]>[];
}, keyof HistoricalRoot | IDFieldKeys> & (Fields extends undefined ? {} : Omit<Fields, keyof HistoricalFields | keyof HistoricalRoot>) & (IsRootDoc extends true ? HistoricalRoot & IDField<IsMongoRoot> : {});
export declare type ExtractHistoricalFields<THistoricalDoc> = OmitProperties<{
    [K in string & keyof THistoricalDoc]: THistoricalDoc[K] extends HistoryObject<infer T>[] ? T : never;
}, never>;
export declare type ExtractFields<THistoricalDoc> = OmitProperties<{
    [K in string & keyof Omit<THistoricalDoc, keyof HistoricalRoot | keyof ExtractHistoricalFields<THistoricalDoc>>]: THistoricalDoc[K];
}, never>;
export declare type ExtractIsRootDoc<THistoricalDoc> = Extract<string & keyof THistoricalDoc, IDFieldKeys> extends never ? false : true;
export declare class NewHistoricalDoc<THistoricalDoc, IsRootDoc extends true | false = ExtractIsRootDoc<THistoricalDoc>, HistoricalFields extends ExtractHistoricalFields<THistoricalDoc> = ExtractHistoricalFields<THistoricalDoc>, Fields extends ExtractFields<THistoricalDoc> = ExtractFields<THistoricalDoc>> {
    #private;
    constructor({ docHistory, isRootDoc, }: {
        docHistory: DocHistory;
        isRootDoc: IsRootDoc;
    });
    addHistoricalField<K extends Exclude<keyof HistoricalFields, keyof HistoricalRoot | IDFieldKeys>>(field: K, value: HistoricalFields[K]): this;
    /**
     * Utility method to set a straight key/value to the historical doc.
     */
    addFieldValued<K extends Exclude<keyof Fields, keyof HistoricalFields | keyof HistoricalRoot>>(field: K, value: Fields[K]): this;
    get doc(): HistoricalDoc<IsRootDoc, HistoricalFields, Fields, IsRootDoc>;
    valueOf(): HistoricalDoc<IsRootDoc, HistoricalFields, Fields>;
    toString(): string;
}
export interface HistoricalFieldUpdateValue<T> {
    readonly $each: [HistoryObject<T>];
    readonly $position: 0;
}
declare type PrefixFieldPath<T extends Record<string, unknown>, FieldPrefix extends string | undefined = undefined> = {
    [K in string & keyof T as FieldPrefix extends undefined ? K : `${FieldPrefix}.${K}`]: T[K];
};
export declare type HistoricalFieldUpdate<HistoricalFields extends Record<string, unknown>, FieldPrefix extends string | undefined = undefined> = PrefixFieldPath<{
    [K in keyof HistoricalFields]?: HistoricalFieldUpdateValue<HistoricalFields[K]>;
}, FieldPrefix>;
export declare type Update<IsRootDoc extends true | false, HistoricalFields extends Record<string, unknown>, Fields extends Record<string, unknown> | undefined = undefined, FieldPrefix extends string | undefined = undefined> = {
    $push: HistoricalFieldUpdate<Omit<HistoricalFields, keyof HistoricalRoot | IDFieldKeys>, FieldPrefix>;
} & (Fields extends undefined ? IsRootDoc extends true ? {
    $set: PrefixFieldPath<Pick<HistoricalRoot, "lastUpdate">, FieldPrefix>;
} : {} : IsRootDoc extends true ? {
    $set: Partial<PrefixFieldPath<Omit<Fields, keyof HistoricalFields | keyof HistoricalRoot | IDFieldKeys>, FieldPrefix> & PrefixFieldPath<Pick<HistoricalRoot, "lastUpdate">, FieldPrefix>>;
} : {
    $set: Partial<PrefixFieldPath<Omit<Fields, keyof HistoricalFields | keyof HistoricalRoot | IDFieldKeys>, FieldPrefix>>;
});
export declare class UpdateHistoricalDoc<THistoricalDoc, FieldPrefix extends string | undefined = undefined, IsRootDoc extends true | false = ExtractIsRootDoc<THistoricalDoc>, HistoricalFields extends ExtractHistoricalFields<THistoricalDoc> = ExtractHistoricalFields<THistoricalDoc>, Fields extends ExtractFields<THistoricalDoc> = ExtractFields<THistoricalDoc>> {
    #private;
    constructor({ docHistory, isRootDoc, fieldPrefix, }: {
        docHistory: DocHistory;
        isRootDoc: IsRootDoc;
        fieldPrefix?: FieldPrefix;
    });
    get hasUpdate(): boolean;
    updateHistoricalField<K extends Exclude<string & keyof HistoricalFields, keyof HistoricalRoot | IDFieldKeys>>(field: K, value: HistoricalFields[K]): this;
    /**
     * Utility method to set a straight key/value on the update.
     */
    updateFieldValue<K extends Exclude<string & keyof Fields, keyof HistoricalFields | keyof HistoricalRoot | IDFieldKeys>>(field: K, value: Fields[K]): this;
    get update(): Update<IsRootDoc, HistoricalFields, Fields, FieldPrefix>;
    valueOf(): Update<IsRootDoc, HistoricalFields, Fields, FieldPrefix> | null;
    toString(): string;
    static getFieldName<T extends string, FieldPrefix extends string | undefined>(field: T, fieldPrefix?: FieldPrefix): FieldPrefix extends undefined ? T : `${FieldPrefix}.${T}`;
}
export declare class DocHistory {
    #private;
    constructor({ by, date }: {
        by: ObjectId;
        date?: Date;
    });
    get date(): Date;
    get by(): ObjectId;
    get rootHistory(): HistoricalRoot;
    historyObject<T>(value: T): HistoryObject<T>;
}
export {};
