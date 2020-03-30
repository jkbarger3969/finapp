import { ObjectID } from "mongodb";
export declare type PresentValueMap = Iterable<string>;
export declare type PresentValueProjection = {
    readonly [field: string]: {
        readonly $ifNull: [{
            readonly $arrayElemAt: [string, 0];
        }, null];
    };
};
export interface CreatedBy {
    readonly node: ObjectID;
    readonly id: ObjectID;
}
export interface HistoryObject<T> {
    readonly value: T;
    readonly createdBy: CreatedBy;
    readonly createdOn: Date;
}
export interface RootHistoryObject {
    readonly lastUpdate: Date;
    readonly createdOn: Date;
    readonly createdBy: CreatedBy;
}
export interface UpdateValuePushArg<T> {
    readonly $each: [HistoryObject<T>];
    readonly $position: 0;
}
export declare type UpdateValuePush = {
    [field: string]: UpdateValuePushArg<any>;
};
export default class DocHistory {
    private readonly _by_;
    private readonly _date_;
    private readonly _push_;
    private _hasUpdate_;
    constructor(_by_: CreatedBy, _date_?: Date);
    get updatePushArg(): UpdateValuePush;
    get hasUpdate(): boolean;
    get lastUpdate(): Date;
    get createdBy(): CreatedBy;
    get rootHistoryObject(): RootHistoryObject;
    getPresentValues(presentValueMap: PresentValueMap): PresentValueProjection;
    static getPresentValues(presentValueMap: PresentValueMap): PresentValueProjection;
    historyObject<T>(value: T): HistoryObject<T>;
    updateValue<T>(field: string, value: T): this;
    updateValues(fieldValuesMap: Iterable<[string, any]>): this;
    addValue<T>(value: T): [HistoryObject<T>];
}
