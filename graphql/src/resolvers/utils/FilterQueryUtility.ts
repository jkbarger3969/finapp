import { FilterQuery, Condition, Collection } from "mongodb";

type TLogicOperators = "$and" | "$not" | "$nor" | "$or";

/**
 * Creates a mongo db filter query and utility method that will determine which
 * conditions if any fail.
 */
export default class FilterQueryUtility<T extends string, U = unknown> {
  private static readonly _keepMatchStage_ = {
    $count: "m",
  } as const;
  private static readonly _failedReportStage_ = {
    $project: {
      failed: {
        $cond: {
          if: { $eq: ["$preCond", null] },
          then: {
            $map: {
              input: {
                $filter: {
                  input: { $objectToArray: "$$ROOT" },
                  as: "item",
                  cond: {
                    $ne: ["$$item.v", null],
                  },
                },
              },
              as: "item",
              in: "$$item.v",
            },
          },
          else: ["$preCond"],
        },
      },
    },
  } as const;

  private readonly _preCondition_?: [
    string,
    (
      | Condition<unknown>
      | { [P in keyof TLogicOperators]: FilterQuery<unknown>[] }
    ),
    string?
  ];
  private readonly _conditions_: [
    string,
    (
      | Condition<unknown>
      | { [P in keyof TLogicOperators]: FilterQuery<unknown>[] }
    ),
    string?
  ][] = [];
  /**
   * @param preCondition is an optional condition that will run and test before
   * any conditions added with @see FilterQueryUtility#addCondition.
   * The precondition must succeed before @see FilterQueryUtility#addCondition
   * are tested during @see FilterQueryUtility#explainFailed calls.
   * The precondition is added to filter query returned from
   * @see FilterQueryUtility#filterQuery
   */
  constructor(
    field?: T,
    condition?: T extends TLogicOperators ? FilterQuery<U>[] : Condition<U>,
    failedMsg?: string
  ) {
    if (!!field) {
      this._preCondition_ = [field, condition, failedMsg];
    }
  }

  addCondition<T extends string, U = unknown>(
    field: T,
    condition: T extends TLogicOperators ? FilterQuery<U>[] : Condition<U>,
    failedMsg?: string
  ): this {
    this._conditions_.push([field, condition, failedMsg]);
    return this;
  }

  /**
   * Creates mongo filter query condition from conditions added to by
   * @see FilterQueryUtility#addCondition
   *
   * @throws ReferenceError if no conditions have been added at construction or
   * by @see FilterQueryUtility#addCondition
   * */
  filterQuery(): { $and: FilterQuery<Record<string, unknown>>[] } {
    if (!this._preCondition_ && this._conditions_.length === 0) {
      throw new ReferenceError("FilterQueryUtility has no conditions.");
    }

    const $and: FilterQuery<Record<string, unknown>>[] = [];

    if (this._preCondition_) {
      const [field, condition] = this._preCondition_;
      $and.push({ [field]: condition });
    }

    for (const [field, condition] of this._conditions_) {
      $and.push({ [field]: condition });
    }

    return { $and };
  }

  /**
   * Determines which condition failed and returns an array of Errors with
   * failed messages passed in @see FilterQueryUtility#addCondition
   *
   * @throws ReferenceError if no conditions have been added at construction or
   * by @see FilterQueryUtility#addCondition
   */
  async explainFailed(collection: Collection): Promise<Error[]> {
    if (!this._preCondition_ && this._conditions_.length === 0) {
      throw new ReferenceError("FilterQueryUtility has no conditions.");
    }

    // Pre condition
    const preMatch = this._preCondition_
      ? { $match: { [this._preCondition_[0]]: this._preCondition_[1] } }
      : { $match: {} };

    // Tests
    const $facet: Record<
      number | "preCond",
      [{ $match: unknown }, { $count: "m" }] | [{ $count: "m" }]
    > = {
      preCond: [FilterQueryUtility._keepMatchStage_],
    };

    // Error messages
    const $project: Record<
      number | "preCond",
      {
        $cond: {
          if: { $eq: [{ $size: string }, 0] };
          then: string;
          else: null;
        };
      }
    > = {
      preCond: {
        $cond: {
          if: { $eq: [{ $size: "$preCond" }, 0] },
          then:
            (this._preCondition_ || [])[2] ||
            `Failed ${JSON.stringify(preMatch)}`,
          else: null,
        },
      },
    };

    for (let i = 0, len = this._conditions_.length; i < len; i++) {
      const [field, condition, failedMsg] = this._conditions_[i];

      const $match = { [field]: condition };

      $facet[i] = [{ $match }, FilterQueryUtility._keepMatchStage_];

      $project[i] = {
        $cond: {
          if: { $eq: [{ $size: `$${i}` }, 0] },
          then: failedMsg || `Failed: ${JSON.stringify($match)}`,
          else: null,
        },
      };
    }

    const [{ failed }] = await collection
      .aggregate<{ failed: string[] }>([
        preMatch,
        {
          $facet,
        },
        {
          $project,
        },
        FilterQueryUtility._failedReportStage_,
      ])
      .toArray();

    return failed.map((msg: string) => new Error(msg));
  }
}
