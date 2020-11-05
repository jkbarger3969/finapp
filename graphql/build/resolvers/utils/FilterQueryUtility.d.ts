import { FilterQuery, Condition, Collection } from "mongodb";
declare type TLogicOperators = "$and" | "$not" | "$nor" | "$or";
/**
 * Creates a mongo db filter query and utility method that will determine which
 * conditions if any fail.
 */
export default class FilterQueryUtility<T extends string, U = unknown> {
    private static readonly _keepMatchStage_;
    private static readonly _failedReportStage_;
    private readonly _preCondition_?;
    private readonly _conditions_;
    /**
     * @param preCondition is an optional condition that will run and test before
     * any conditions added with @see FilterQueryUtility#addCondition.
     * The precondition must succeed before @see FilterQueryUtility#addCondition
     * are tested during @see FilterQueryUtility#explainFailed calls.
     * The precondition is added to filter query returned from
     * @see FilterQueryUtility#filterQuery
     */
    constructor(field?: T, condition?: T extends TLogicOperators ? FilterQuery<U>[] : Condition<U>, failedMsg?: string);
    addCondition<T extends string, U = unknown>(field: T, condition: T extends TLogicOperators ? FilterQuery<U>[] : Condition<U>, failedMsg?: string): this;
    /**
     * Creates mongo filter query condition from conditions added to by
     * @see FilterQueryUtility#addCondition
     *
     * @throws ReferenceError if no conditions have been added at construction or
     * by @see FilterQueryUtility#addCondition
     * */
    filterQuery(): {
        $and: FilterQuery<Record<string, unknown>>[];
    };
    /**
     * Determines which condition failed and returns an array of Errors with
     * failed messages passed in @see FilterQueryUtility#addCondition
     *
     * @throws ReferenceError if no conditions have been added at construction or
     * by @see FilterQueryUtility#addCondition
     */
    explainFailed(collection: Collection): Promise<Error[]>;
}
export {};
