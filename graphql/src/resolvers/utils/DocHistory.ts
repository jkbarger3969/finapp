import { ObjectID } from "mongodb";

export type PresentValueMap = Iterable<string>;

export type PresentValueProjection = {
  readonly [field: string]: {
    readonly $ifNull: [{ readonly $arrayElemAt: [string, 0] }, null];
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

export type UpdateValuePush = {
  [field: string]: UpdateValuePushArg<any>;
};

export default class DocHistory {
  private readonly _push_: UpdateValuePush = {};
  private _hasUpdate_ = false;

  constructor(
    private readonly _by_: CreatedBy,
    private readonly _date_ = new Date()
  ) {}

  get updatePushArg() {
    return this._push_;
  }

  get hasUpdate() {
    return this._hasUpdate_;
  }

  get lastUpdate() {
    return this._date_;
  }

  get createdBy() {
    return this._by_;
  }

  get rootHistoryObject(): RootHistoryObject {
    return {
      lastUpdate: this._date_,
      createdOn: this._date_,
      createdBy: this._by_,
    } as const;
  }

  getPresentValues(presentValueMap: PresentValueMap) {
    return DocHistory.getPresentValues(presentValueMap);
  }

  static getPresentValues(
    presentValueMap: PresentValueMap,
    defaultValue = null
  ): PresentValueProjection {
    const presentValueProjection = {} as {
      [P in keyof PresentValueProjection]: PresentValueProjection[P];
    };

    for (const key of presentValueMap) {
      presentValueProjection[key] = {
        $ifNull: [{ $arrayElemAt: [`$${key}.value`, 0] }, defaultValue],
      };
    }

    return presentValueProjection;
  }

  historyObject<T>(value: T): HistoryObject<T> {
    return {
      value,
      createdBy: this._by_,
      createdOn: this._date_,
    };
  }

  updateValue<T>(field: string, value: T): this {
    this._push_[field] = {
      $each: [this.historyObject(value)],
      $position: 0,
    };
    this._hasUpdate_ = true;
    return this;
  }
  updateValues(fieldValuesMap: Iterable<[string, any]>): this {
    for (const [field, value] of fieldValuesMap) {
      this.updateValue(field, value);
    }
    return this;
  }

  addValue<T>(value: T): [HistoryObject<T>] {
    return [this.historyObject(value)];
  }
}
