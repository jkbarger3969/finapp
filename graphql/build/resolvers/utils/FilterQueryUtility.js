"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates a mongo db filter query and utility method that will determine which
 * conditions if any fail.
 */
class FilterQueryUtility {
    /**
     * @param preCondition is an optional condition that will run and test before
     * any conditions added with @see FilterQueryUtility#addCondition.
     * The precondition must succeed before @see FilterQueryUtility#addCondition
     * are tested during @see FilterQueryUtility#explainFailed calls.
     * The precondition is added to filter query returned from
     * @see FilterQueryUtility#filterQuery
     */
    constructor(field, condition, failedMsg) {
        this._conditions_ = [];
        if (!!field) {
            this._preCondition_ = [field, condition, failedMsg];
        }
    }
    addCondition(field, condition, failedMsg) {
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
    filterQuery() {
        if (!this._preCondition_ && this._conditions_.length === 0) {
            throw new ReferenceError("FilterQueryUtility has no conditions.");
        }
        const $and = [];
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
    explainFailed(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._preCondition_ && this._conditions_.length === 0) {
                throw new ReferenceError("FilterQueryUtility has no conditions.");
            }
            // Pre condition
            const preMatch = this._preCondition_
                ? { $match: { [this._preCondition_[0]]: this._preCondition_[1] } }
                : { $match: {} };
            // Tests
            const $facet = {
                preCond: [FilterQueryUtility._keepMatchStage_],
            };
            // Error messages
            const $project = {
                preCond: {
                    $cond: {
                        if: { $eq: [{ $size: "$preCond" }, 0] },
                        then: (this._preCondition_ || [])[2] ||
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
            const [{ failed }] = yield collection
                .aggregate([
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
            return failed.map((msg) => new Error(msg));
        });
    }
}
exports.default = FilterQueryUtility;
FilterQueryUtility._keepMatchStage_ = {
    $count: "m",
};
FilterQueryUtility._failedReportStage_ = {
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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsdGVyUXVlcnlVdGlsaXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Jlc29sdmVycy91dGlscy9GaWx0ZXJRdWVyeVV0aWxpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFJQTs7O0dBR0c7QUFDSCxNQUFxQixrQkFBa0I7SUE4Q3JDOzs7Ozs7O09BT0c7SUFDSCxZQUNFLEtBQVMsRUFDVCxTQUF1RSxFQUN2RSxTQUFrQjtRQW5CSCxpQkFBWSxHQU92QixFQUFFLENBQUM7UUFjUCxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDWCxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUNyRDtJQUNILENBQUM7SUFFRCxZQUFZLENBQ1YsS0FBUSxFQUNSLFNBQXNFLEVBQ3RFLFNBQWtCO1FBRWxCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3RELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7Ozs7U0FNSztJQUNMLFdBQVc7UUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDMUQsTUFBTSxJQUFJLGNBQWMsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1NBQ25FO1FBRUQsTUFBTSxJQUFJLEdBQTJDLEVBQUUsQ0FBQztRQUV4RCxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDdkIsTUFBTSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7U0FDbkM7UUFFRCxLQUFLLE1B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