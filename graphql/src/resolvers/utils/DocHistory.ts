import { ObjectId } from "mongodb";

export type PresentValueExpression = {
  readonly $ifNull: [{ readonly $arrayElemAt: [string, 0] }, null];
};

export type PresentValueProjection = {
  readonly [field: string]: PresentValueExpression;
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

export type HistoricalRootDoc = HistoricalRoot & HistoricalDoc;

export interface UpdateValue<T> {
  readonly $each: [HistoryObject<T>];
  readonly $position: 0;
}

export type UpdatePush = {
  [field: string]: UpdateValue<any>;
};

export type Update = {
  $push: UpdatePush;
  $set: { readonly lastUpdate: Date } | { [lastUpdateField: string]: Date };
};

class NewHistoricalDoc<T extends boolean> {
  private readonly _doc_: T extends true ? HistoricalRootDoc : HistoricalDoc;
  constructor(private readonly _docHistory_: DocHistory, withRootHistory: T) {
    this._doc_ = (withRootHistory
      ? { ..._docHistory_.rootHistory() }
      : {}) as any;
  }
  addField<T>(field: string, value: T): this {
    (this._doc_ as any)[field] = this._docHistory_.newValue(value);
    return this;
  }
  addFields(fieldValuesMap: Iterable<[string, any]>): this {
    for (const [field, value] of fieldValuesMap) {
      this.addField(field, value);
    }
    return this;
  }
  doc() {
    return this._doc_;
  }
}

class UpdateHistoricalDoc {
  private readonly _update_: Update;
  private readonly _prependUpdateFields_: string = "";
  private _hasUpdate_ = false;
  constructor(
    private readonly _docHistory_: DocHistory,
    args?:
      | {
          prependUpdateFields?: string;
          prependLastUpdate?: string;
        }
      | string
  ) {
    if (args) {
      if (typeof args === "string") {
        this._prependUpdateFields_ = `${args}.`;
        this._update_ = {
          $push: {},
          $set: {
            [`${this._prependUpdateFields_}lastUpdate`]: _docHistory_.date,
          },
        };
      } else {
        if (args.prependUpdateFields) {
          this._prependUpdateFields_ = `${args.prependUpdateFields}.`;
        }
        if (args.prependLastUpdate) {
          this._update_ = {
            $push: {},
            $set: {
              [`${args.prependLastUpdate}.lastUpdate`]: _docHistory_.date,
            },
          };
        }
      }
    } else {
      this._update_ = {
        $push: {},
        $set: { lastUpdate: _docHistory_.date },
      };
    }
  }
  get hasUpdate() {
    return this._hasUpdate_;
  }
  updateField<T>(field: string, value: T): this {
    this._update_.$push[`${this._prependUpdateFields_}${field}`] = {
      $each: [this._docHistory_.historyObject(value)],
      $position: 0,
    };
    this._hasUpdate_ = true;
    return this;
  }
  updateFields(fieldValuesMap: Iterable<[string, any]>): this {
    for (const [field, value] of fieldValuesMap) {
      this.updateField(field, value);
    }
    return this;
  }
  update(): Update {
    return this._update_;
  }
}

export interface PresentValueExpressionOpts<TDefaultValue = unknown> {
  defaultValue?: TDefaultValue;
  asVar?: string;
}

export default class DocHistory {
  constructor(
    private readonly _by_: CreatedBy,
    private readonly _date_ = new Date()
  ) {}

  get date() {
    return this._date_;
  }

  get by() {
    return this._by_;
  }

  rootHistory(): HistoricalRoot {
    return {
      lastUpdate: this._date_,
      createdOn: this._date_,
      createdBy: this._by_,
    };
  }

  // newHistoricalDoc(withRootHistory: true): NewHistoricalDoc<true>;
  // newHistoricalDoc(withRootHistory: false): NewHistoricalDoc<false>;
  newHistoricalDoc<T extends boolean>(withRootHistory: T) {
    return new NewHistoricalDoc<T>(this, withRootHistory);
  }

  updateHistoricalDoc(
    prependFields?: ConstructorParameters<typeof UpdateHistoricalDoc>[1]
  ): UpdateHistoricalDoc {
    return new UpdateHistoricalDoc(this, prependFields);
  }

  historyObject<T>(value: T): HistoryObject<T> {
    return {
      value,
      createdBy: this._by_,
      createdOn: this._date_,
    };
  }

  newValue<T>(value: T): [HistoryObject<T>] {
    return [this.historyObject(value)];
  }

  getPresentValues(presentValueMap: Iterable<string>) {
    return DocHistory.getPresentValues(presentValueMap);
  }

  static getPresentValuesAllFields(
    args: { path?: string; exclude?: Iterable<string> } = {
      path: "$$ROOT",
    }
  ) {
    const { path = "$$ROOT", exclude } = args;

    const isRoot = path === "$$ROOT";

    const docLocation = isRoot ? "__doc" : `${path}.__doc`;

    return [
      {
        $addFields: {
          [docLocation]: {
            $arrayToObject: {
              $map: {
                input: { $objectToArray: isRoot ? path : `$${path}` },
                as: "kv",
                in: {
                  $cond: {
                    if: {
                      $eq: [{ $type: "$$kv.v" }, "array"],
                      ...(exclude ? { $nin: ["$$kv.k", [...exclude]] } : {}),
                    },
                    then: {
                      k: "$$kv.k",
                      v: {
                        $ifNull: [{ $arrayElemAt: ["$$kv.v.value", 0] }, null],
                      },
                    },
                    else: "$$kv",
                  },
                },
              },
            },
          },
        },
      },
      isRoot
        ? { $replaceRoot: { newRoot: `$${docLocation}` } }
        : {
            $addFields: {
              [docLocation]: `$${docLocation}.__doc`,
            },
          },
    ];
  }

  static getPresentValueExpression<TDefaultValue = unknown>(
    key: string,
    opts: PresentValueExpressionOpts<TDefaultValue> = {}
  ): PresentValueExpression {
    const asVar = opts.asVar ? `$${opts.asVar}.` : "";
    const defaultValue = "defaultValue" in opts ? opts.defaultValue : null;

    return {
      $ifNull: [
        { $arrayElemAt: [`$${asVar}${key}.value`, 0] },
        defaultValue as any,
      ],
    };
  }

  static getPresentValues<TDefaultValue = unknown>(
    presentValueMap: Iterable<
      string | [string, PresentValueExpressionOpts<TDefaultValue>]
    >,
    opts: PresentValueExpressionOpts<TDefaultValue> = {}
  ): PresentValueProjection {
    const presentValueProjection = {} as {
      [P in keyof PresentValueProjection]: PresentValueProjection[P];
    };

    for (const val of presentValueMap) {
      if (typeof val === "string") {
        presentValueProjection[val] = this.getPresentValueExpression(val, opts);
      } else {
        const [key, keyOpts] = val;
        presentValueProjection[key] = this.getPresentValueExpression(key, {
          ...opts,
          ...keyOpts,
        });
      }
    }

    return presentValueProjection;
  }
}
