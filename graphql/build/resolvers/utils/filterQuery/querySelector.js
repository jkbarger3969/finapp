"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.querySelectorGenerator = void 0;
const iterableFns_1 = require("../../../utils/iterableFns");
// Wraps QuerySelectorIterableIterators, yields results, and captures return
// promises from async OperatorValueTransmutator(s) into passed promises array.
const querySelectorIterableIteratorWrapper = function* (querySelectorIterableIterator, promises) {
    for (const result of iterableFns_1.iterateIteratorResults(querySelectorIterableIterator)) {
        if (result.done === true) {
            if (result.value) {
                promises.push(result.value);
            }
        }
        else {
            yield result.value;
        }
    }
};
// Generator version of "querySelector" that yields any operator/operator
// values unmatched by the QuerySelectorGenerator(s) and returns the
// QuerySelector or a promise that resolves with the QuerySelector.
// Allows for custom handling of unmatched operators.
exports.querySelectorGenerator = function* (condition, querySelectorGenerators, querySelector) {
    const promises = [];
    let querySelectorIterableIterator = querySelectorIterableIteratorWrapper((function* () {
        for (const op in condition) {
            if (!Object.prototype.hasOwnProperty.call(condition, op)) {
                continue;
            }
            yield [op, condition[op]];
        }
    })(), promises);
    for (const querySelectorGenerator of querySelectorGenerators) {
        querySelectorIterableIterator = querySelectorIterableIteratorWrapper(querySelectorGenerator(querySelectorIterableIterator, querySelector), promises);
    }
    // Yield unmatched operator/operator values
    yield* querySelectorIterableIterator;
    // Wait for async OperatorValueTransmutator(s)
    if (promises.length > 0) {
        return Promise.all(promises).then(() => querySelector);
    }
    return querySelector;
};
const querySelector = (condition, querySelectorGenerators, querySelector = {}) => {
    const querySelectorIterableIterator = exports.querySelectorGenerator(condition, querySelectorGenerators, querySelector);
    let result;
    while (!(result = querySelectorIterableIterator.next()).done)
        ;
    return result.value;
};
exports.default = querySelector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlTZWxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvZmlsdGVyUXVlcnkvcXVlcnlTZWxlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSw0REFHb0M7QUE0RHBDLDRFQUE0RTtBQUM1RSwrRUFBK0U7QUFDL0UsTUFBTSxvQ0FBb0MsR0FBRyxRQUFRLENBQUMsRUFJcEQsNkJBRThDLEVBQzlDLFFBQXlCO0lBRXpCLEtBQUssTUFBTSxNQUFNLElBQUksb0NBQXNCLENBQUMsNkJBQTZCLENBQUMsRUFBRTtRQUMxRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ3hCLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtnQkFDaEIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDN0I7U0FDRjthQUFNO1lBQ0wsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDO1NBQ3BCO0tBQ0Y7QUFDSCxDQUFDLENBQUM7QUFFRix5RUFBeUU7QUFDekUsb0VBQW9FO0FBQ3BFLG1FQUFtRTtBQUNuRSxxREFBcUQ7QUFDeEMsUUFBQSxzQkFBc0IsR0FBRyxRQUFRLENBQUMsRUFJN0MsU0FBcUIsRUFDckIsdUJBSUcsRUFDSCxhQUFxQztJQUVyQyxNQUFNLFFBQVEsR0FBb0IsRUFBRSxDQUFDO0lBRXJDLElBQUksNkJBQTZCLEdBQUcsb0NBQW9DLENBQ3RFLENBQUMsUUFBUSxDQUFDO1FBQ1IsS0FBSyxNQUFNLEVBQUUsSUFBSSxTQUFTLEVBQUU7WUFDMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUU7Z0JBQ3hELFNBQVM7YUFDVjtZQUNELE1BQU0sQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUd2QixDQUFDO1NBQ0g7SUFDSCxDQUFDLENBQUMsRUFBRSxFQUNKLFFBQVEsQ0FDVCxDQUFDO0lBRUYsS0FBSyxNQUFNLHNCQUFzQixJQUFJLHVCQUF1QixFQUFFO1FBQzVELDZCQUE2QixHQUFHLG9DQUFvQyxDQUNsRSxzQkFBc0IsQ0FBQyw2QkFBNkIsRUFBRSxhQUFhLENBQUMsRUFDcEUsUUFBUSxDQUNULENBQUM7S0FDSDtJQUVELDJDQUEyQztJQUMzQyxLQUFLLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQztJQUVyQyw4Q0FBOEM7SUFDOUMsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUN2QixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQ3hEO0lBRUQsT0FBTyxhQUFhLENBQUM7QUFDdkIsQ0FBQyxDQUFDO0FBRUYsTUFBTSxhQUFhLEdBQUcsQ0FDcEIsU0FBcUIsRUFDckIsdUJBSUcsRUFDSCxnQkFBd0MsRUFBRSxFQUMxQyxFQUFFO0lBQ0YsTUFBTSw2QkFBNkIsR0FBRyw4QkFBc0IsQ0FDMUQsU0FBUyxFQUNULHVCQUF1QixFQUN2QixhQUFhLENBQ2QsQ0FBQztJQUVGLElBQUksTUFBZ0UsQ0FBQztJQUNyRSxPQUFPLENBQUMsQ0FBQyxNQUFNLEdBQUcsNkJBQTZCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO1FBQUMsQ0FBQztJQUU5RCxPQUFPLE1BQU0sQ0FBQyxLQUVxQixDQUFDO0FBQ3RDLENBQUMsQ0FBQztBQUVGLGtCQUFlLGFBQWEsQ0FBQyJ9