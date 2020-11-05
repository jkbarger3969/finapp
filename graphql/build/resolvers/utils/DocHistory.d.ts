import { ObjectId } from "mongodb";
export declare type PresentValueExpression<TDefaultValue = null> = {
    readonly $ifNull: [{
        readonly $arrayElemAt: [string, 0];
    }, TDefaultValue];
};
export declare type PresentValueProjection<TDefaultValue = null> = {
    readonly [field: string]: PresentValueExpression<TDefaultValue>;
};
export interface CreatedBy {
    readonly node: ObjectId;
    readonly id: ObjectId;
}
export interface HistoryObject<T> {
    readonly value: T;
    readonly createdBy: CreatedBy;
    readonly createdOn: Date;
}
export interface HistoricalRoot {
    readonly lastUpdate: Date;
    readonly createdOn: Date;
    readonly createdBy: CreatedBy;
}
export interface HistoricalDoc {
    [field: string]: [HistoryObject<any>];
}
export declare type HistoricalRootDoc = HistoricalRoot & HistoricalDoc;
export interface UpdateValue<T> {
    readonly $each: [HistoryObject<T>];
    readonly $position: 0;
}
export declare type UpdatePush = {
    [field: string]: UpdateValue<any>;
};
export declare type Update = {
    $push: UpdatePush;
    $set: {
        readonly lastUpdate: Date;
    } | {
        [lastUpdateField: string]: Date;
    };
};
declare class NewHistoricalDoc<T extends boolean> {
    private readonly _docHistory_;
    private readonly _doc_;
    constructor(_docHistory_: DocHistory, withRootHistory: T);
    addField<T>(field: string, value: T): this;
    addFields(fieldValuesMap: Iterable<[string, any]>): this;
    /**
     * Utility method to set a straight key/value to the historical doc.
     */
    addNonHistoricalFieldValue(field: string, value: unknown): this;
    doc(): T extends true ? HistoricalRootDoc : HistoricalDoc;
}
declare class UpdateHistoricalDoc {
    private readonly _docHistory_;
    private readonly _update_;
    private readonly _prependUpdateFields_;
    private _hasUpdate_;
    constructor(_docHistory_: DocHistory, args?: {
        prependUpdateFields?: string;
        prependLastUpdate?: string;
    } | string);
    get hasUpdate(): boolean;
    updateField<T>(field: string, value: T): this;
    updateFields(fieldValuesMap: Iterable<[string, any]>): this;
    update(): Update;
}
export interface PresentValueExpressionOpts<TDefaultValue = null> {
    defaultValue?: TDefaultValue;
    asVar?: string;
}
export default class DocHistory {
    private readonly _by_;
    private readonly _date_;
    constructor(_by_: CreatedBy, _date_?: Date);
    get date(): Date;
    get by(): CreatedBy;
    rootHistory(): HistoricalRoot;
    newHistoricalDoc<T extends boolean>(withRootHistory: T): NewHistoricalDoc<T>;
    updateHistoricalDoc(prependFields?: ConstructorParameters<typeof UpdateHistoricalDoc>[1]): UpdateHistoricalDoc;
    historyObject<T>(value: T): HistoryObject<T>;
    newValue<T>(value: T): [HistoryObject<T>];
    getPresentValues(presentValueMap: Iterable<string>): PresentValueProjection<null>;
    static getPresentValuesAllFields(args?: {
        path?: string;
        exclude?: Iterable<string>;
    }): ({
        $addFields: {
            [x: string]: {
                $arrayToObject: {
                    $map: {
                        input: {
                            $objectToArray: string;
                        };
                        as: string;
                        in: {
                            $cond: {
                                if: {
                                    $nin?: (string | string[])[];
                                    $eq: (string | {
                                        $type: string;
                                    })[];
                                };
                                then: {
                                    k: string;
                                    v: {
                                        $ifNull: {
                                            $arrayElemAt: (string | number)[];
                                        }[];
                                    };
                                };
                                else: string;
                            };
                        };
                    };
                };
            };
        };
        $replaceRoot?: undefined;
    } | {
        $replaceRoot: {
            newRoot: string;
        };
        $addFields?: undefined;
    } | {
        $addFields: {
            [x: string]: string;
        };
        $replaceRoot?: undefined;
    })[];
    static getPresentValueExpression<TDefaultValue = null>(key: string, opts?: PresentValueExpressionOpts<TDefaultValue>): PresentValueExpression<TDefaultValue>;
    static getPresentValues<TDefaultValue = null>(presentValueMap: Iterable<string | [path: string, projectionKey: string] | [string, PresentValueExpressionOpts<TDefaultValue>]>, opts?: PresentValueExpressionOpts<TDefaultValue>): PresentValueProjection<TDefaultValue>;
}
export {};
