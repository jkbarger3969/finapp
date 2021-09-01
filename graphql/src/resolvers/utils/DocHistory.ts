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

export type IDField<IsMongoRoot extends true | false = true> =
  IsMongoRoot extends true
    ? {
        _id: ObjectId;
      }
    : {
        id: ObjectId;
      };
export type IDFieldKeys = keyof IDField<true> | keyof IDField<false>;

export type HistoricalDoc<
  IsRootDoc extends true | false,
  HistoricalFields extends Record<string, unknown>,
  Fields extends Record<string, unknown> | undefined = undefined,
  IsMongoRoot extends true | false = IsRootDoc
> = Omit<
  {
    [K in keyof HistoricalFields]: HistoryObject<HistoricalFields[K]>[];
  },
  keyof HistoricalRoot | IDFieldKeys
> &
  (Fields extends undefined
    ? {}
    : Omit<
        Fields,
        keyof HistoricalFields | keyof HistoricalRoot | IDFieldKeys
      >) &
  (IsRootDoc extends true ? HistoricalRoot & IDField<IsMongoRoot> : {});

export type ExtractHistoricalFields<THistoricalDoc> = OmitProperties<
  {
    [K in string &
      keyof THistoricalDoc]: THistoricalDoc[K] extends HistoryObject<infer T>[]
      ? T
      : never;
  },
  never
>;

export type ExtractFields<THistoricalDoc> = OmitProperties<
  {
    [K in string &
      keyof Omit<
        THistoricalDoc,
        | keyof HistoricalRoot
        | IDFieldKeys
        | keyof ExtractHistoricalFields<THistoricalDoc>
      >]: THistoricalDoc[K];
  },
  never
>;

export type ExtractIsRootDoc<THistoricalDoc> = Extract<
  string & keyof THistoricalDoc,
  IDFieldKeys
> extends never
  ? false
  : true;

export class NewHistoricalDoc<
  THistoricalDoc,
  IsRootDoc extends true | false = ExtractIsRootDoc<THistoricalDoc>,
  HistoricalFields extends ExtractHistoricalFields<THistoricalDoc> = ExtractHistoricalFields<THistoricalDoc>,
  Fields extends ExtractFields<THistoricalDoc> = ExtractFields<THistoricalDoc>
> {
  readonly #historicalFields = new Map<
    keyof HistoricalFields,
    HistoricalFields[keyof HistoricalFields]
  >();
  readonly #fields = new Map<keyof Fields, Fields[keyof Fields]>();
  readonly #docHistory: DocHistory;
  readonly #isRootDoc: IsRootDoc;

  constructor({
    docHistory,
    isRootDoc,
  }: {
    docHistory: DocHistory;
    isRootDoc: IsRootDoc;
  }) {
    this.#docHistory = docHistory;
    this.#isRootDoc = isRootDoc;
  }

  addHistoricalField<
    K extends Exclude<
      keyof HistoricalFields,
      keyof HistoricalRoot | IDFieldKeys
    >
  >(field: K, value: HistoricalFields[K]): this {
    this.#historicalFields.set(field, value);
    return this;
  }

  /**
   * Utility method to set a straight key/value to the historical doc.
   */
  addFieldValued<
    K extends Exclude<
      keyof Fields,
      keyof HistoricalFields | keyof HistoricalRoot | IDFieldKeys
    >
  >(field: K, value: Fields[K]): this {
    this.#fields.set(field, value);
    return this;
  }

  get doc() {
    return this.valueOf();
  }

  valueOf(): Omit<
    HistoricalDoc<IsRootDoc, HistoricalFields, Fields>,
    IDFieldKeys
  > {
    const docHistory = this.#docHistory;
    const doc = {
      ...(this.#isRootDoc ? docHistory.rootHistory : undefined),
    } as unknown as HistoricalDoc<IsRootDoc, HistoricalFields, Fields>;

    this.#historicalFields.forEach((value, key) => {
      (doc as any)[key] = [docHistory.historyObject(value)];
    });
    this.#fields.forEach((value, key) => {
      (doc as any)[key] = value;
    });

    return doc;
  }

  toString() {
    return JSON.stringify(this.valueOf());
  }
}

export interface HistoricalFieldUpdateValue<T> {
  readonly $each: [HistoryObject<T>];
  readonly $position: 0;
}

type PrefixFieldPath<
  T extends Record<string, unknown>,
  FieldPrefix extends string | undefined = undefined
> = {
  [K in string & keyof T as FieldPrefix extends undefined
    ? K
    : `${FieldPrefix}.${K}`]: T[K];
};

export type HistoricalFieldUpdate<
  HistoricalFields extends Record<string, unknown>,
  FieldPrefix extends string | undefined = undefined
> = PrefixFieldPath<
  {
    [K in keyof HistoricalFields]: HistoricalFieldUpdateValue<
      HistoricalFields[K]
    >;
  },
  FieldPrefix
>;

export type Update<
  RootDoc extends true | false,
  HistoricalFields extends Record<string, unknown>,
  Fields extends Record<string, unknown> | undefined = undefined,
  FieldPrefix extends string | undefined = undefined
> = {
  $push: HistoricalFieldUpdate<
    Omit<HistoricalFields, keyof HistoricalRoot | IDFieldKeys>,
    FieldPrefix
  >;
} & (Fields extends undefined
  ? RootDoc extends true
    ? {
        $set: PrefixFieldPath<Pick<HistoricalRoot, "lastUpdate">, FieldPrefix>;
      }
    : Record<string, never>
  : RootDoc extends true
  ? {
      $set: PrefixFieldPath<
        Omit<
          Fields,
          keyof HistoricalFields | keyof HistoricalRoot | IDFieldKeys
        >,
        FieldPrefix
      > &
        PrefixFieldPath<Pick<HistoricalRoot, "lastUpdate">, FieldPrefix>;
    }
  : {
      $set: PrefixFieldPath<
        Omit<
          Fields,
          keyof HistoricalFields | keyof HistoricalRoot | IDFieldKeys
        >,
        FieldPrefix
      >;
    });

export class UpdateHistoricalDoc<
  RootDoc extends true | false,
  HistoricalFields extends Record<string, unknown>,
  Fields extends Record<string, unknown> | undefined = undefined,
  FieldPrefix extends string | undefined = undefined
> {
  readonly #historicalFields = new Map<
    string & keyof HistoricalFields,
    HistoricalFields[keyof HistoricalFields]
  >();
  readonly #fields = new Map<string & keyof Fields, Fields[keyof Fields]>();
  readonly #docHistory: DocHistory;
  readonly #isRootDoc: RootDoc;
  readonly #fieldPrefix: FieldPrefix;

  constructor({
    docHistory,
    isRootDoc,
    fieldPrefix,
  }: {
    docHistory: DocHistory;
    isRootDoc: RootDoc;
    fieldPrefix?: FieldPrefix;
  }) {
    this.#docHistory = docHistory;
    this.#isRootDoc = isRootDoc;
    this.#fieldPrefix = fieldPrefix;
  }
  get hasUpdate(): boolean {
    return this.#historicalFields.size > 0 || this.#fields.size > 0;
  }

  updateHistoricalField<
    K extends Exclude<
      string & keyof HistoricalFields,
      keyof HistoricalRoot | IDFieldKeys
    >
  >(field: K, value: HistoricalFields[K]): this {
    this.#historicalFields.set(field, value);
    return this;
  }

  /**
   * Utility method to set a straight key/value on the update.
   */
  updateFieldValue<
    K extends Exclude<
      string & keyof Fields,
      keyof HistoricalFields | keyof HistoricalRoot | IDFieldKeys
    >
  >(field: K, value: Fields[K]): this {
    this.#fields.set(field, value);
    return this;
  }

  get update() {
    return this.valueOf();
  }

  valueOf(): Update<RootDoc, HistoricalFields, Fields, FieldPrefix> | null {
    if (!this.hasUpdate) {
      return null;
    }

    const docHistory = this.#docHistory;

    const fieldPrefix = this.#fieldPrefix;

    const update = {} as Update<RootDoc, HistoricalFields, Fields, FieldPrefix>;

    const $set = {} as Update<
      RootDoc,
      HistoricalFields,
      Fields,
      FieldPrefix
    >["$set"];

    const $push = {} as Update<
      RootDoc,
      HistoricalFields,
      Fields,
      FieldPrefix
    >["$push"];

    if (this.#isRootDoc) {
      ($set as any)[
        UpdateHistoricalDoc.getFieldName("lastUpdate", fieldPrefix)
      ] = docHistory.date;

      update.$set = $set;
    }

    if (this.#fields.size) {
      this.#fields.forEach((value, key) => {
        ($set as any)[UpdateHistoricalDoc.getFieldName(key, fieldPrefix)] =
          value;
      });

      update.$set = $set;
    }

    if (this.#historicalFields.size) {
      this.#historicalFields.forEach((value, key) => {
        const updateValue: HistoricalFieldUpdateValue<typeof value> = {
          $each: [docHistory.historyObject(value)],
          $position: 0,
        };

        ($push as any)[UpdateHistoricalDoc.getFieldName(key, fieldPrefix)] =
          updateValue;
      });
      update.$push = $push;
    }

    return update;
  }

  toString() {
    return JSON.stringify(this.valueOf());
  }

  static getFieldName<T extends string, FieldPrefix extends string | undefined>(
    field: T,
    fieldPrefix?: FieldPrefix
  ): FieldPrefix extends undefined ? T : `${FieldPrefix}.${T}` {
    return (
      fieldPrefix ? `${fieldPrefix}.${field}` : field
    ) as FieldPrefix extends undefined ? T : `${FieldPrefix}.${T}`;
  }
}

export class DocHistory {
  #by: ObjectId;
  #date: Date;
  constructor({ by, date = new Date() }: { by: ObjectId; date?: Date }) {
    this.#by = by;
    this.#date = date;
  }

  get date() {
    return this.#date;
  }

  get by() {
    return this.#by;
  }

  get rootHistory(): HistoricalRoot {
    return {
      lastUpdate: this.#date,
      createdOn: this.#date,
      createdBy: this.#by,
    };
  }

  historyObject<T>(value: T): HistoryObject<T> {
    return {
      value,
      createdBy: this.#by,
      createdOn: this.#date,
    };
  }
}
