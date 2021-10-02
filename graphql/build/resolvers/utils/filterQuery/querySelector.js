"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.querySelectorGenerator = void 0;
const iterableFns_1 = require("../../../utils/iterableFns");
// Wraps QuerySelectorIterableIterators, yields results, and captures return
// promises from async OperatorValueTransmutator(s) into passed promises array.
const querySelectorIterableIteratorWrapper = function* (querySelectorIterableIterator, promises) {
    for (const result of (0, iterableFns_1.iterateIteratorResults)(querySelectorIterableIterator)) {
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
const querySelectorGenerator = function* (condition, querySelectorGenerators, querySelector) {
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
exports.querySelectorGenerator = querySelectorGenerator;
const querySelector = (condition, querySelectorGenerators, querySelector = {}) => {
    const querySelectorIterableIterator = (0, exports.querySelectorGenerator)(condition, querySelectorGenerators, querySelector);
    let result;
    while (!(result = querySelectorIterableIterator.next()).done)
        ;
    return result.value;
};
exports.default = querySelector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlTZWxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvZmlsdGVyUXVlcnkvcXVlcnlTZWxlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSw0REFHb0M7QUE0RHBDLDRFQUE0RTtBQUM1RSwrRUFBK0U7QUFDL0UsTUFBTSxvQ0FBb0MsR0FBRyxRQUFRLENBQUMsRUFJcEQsNkJBRThDLEVBQzlDLFFBQXlCO0lBRXpCLEtBQUssTUFBTSxNQUFNLElBQUksSUFBQSxvQ0FBc0IsRUFBQyw2QkFBNkIsQ0FBQyxFQUFFO1FBQzFFLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDeEIsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO2dCQUNoQixRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM3QjtTQUNGO2FBQU07WUFDTCxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUM7U0FDcEI7S0FDRjtBQUNILENBQUMsQ0FBQztBQUVGLHlFQUF5RTtBQUN6RSxvRUFBb0U7QUFDcEUsbUVBQW1FO0FBQ25FLHFEQUFxRDtBQUM5QyxNQUFNLHNCQUFzQixHQUFHLFFBQVEsQ0FBQyxFQUk3QyxTQUFxQixFQUNyQix1QkFJRyxFQUNILGFBQXFDO0lBRXJDLE1BQU0sUUFBUSxHQUFvQixFQUFFLENBQUM7SUFFckMsSUFBSSw2QkFBNkIsR0FBRyxvQ0FBb0MsQ0FDdEUsQ0FBQyxRQUFRLENBQUM7UUFDUixLQUFLLE1BQU0sRUFBRSxJQUFJLFNBQVMsRUFBRTtZQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRTtnQkFDeEQsU0FBUzthQUNWO1lBQ0QsTUFBTSxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBR3ZCLENBQUM7U0FDSDtJQUNILENBQUMsQ0FBQyxFQUFFLEVBQ0osUUFBUSxDQUNULENBQUM7SUFFRixLQUFLLE1BQU0sc0JBQXNCLElBQUksdUJBQXVCLEVBQUU7UUFDNUQsNkJBQTZCLEdBQUcsb0NBQW9DLENBQ2xFLHNCQUFzQixDQUFDLDZCQUE2QixFQUFFLGFBQWEsQ0FBQyxFQUNwRSxRQUFRLENBQ1QsQ0FBQztLQUNIO0lBRUQsMkNBQTJDO0lBQzNDLEtBQUssQ0FBQyxDQUFDLDZCQUE2QixDQUFDO0lBRXJDLDhDQUE4QztJQUM5QyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3ZCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDeEQ7SUFFRCxPQUFPLGFBQWEsQ0FBQztBQUN2QixDQUFDLENBQUM7QUE3Q1csUUFBQSxzQkFBc0IsMEJBNkNqQztBQUVGLE1BQU0sYUFBYSxHQUFHLENBQ3BCLFNBQXFCLEVBQ3JCLHVCQUlHLEVBQ0gsZ0JBQXdDLEVBQUUsRUFDMUMsRUFBRTtJQUNGLE1BQU0sNkJBQTZCLEdBQUcsSUFBQSw4QkFBc0IsRUFDMUQsU0FBUyxFQUNULHVCQUF1QixFQUN2QixhQUFhLENBQ2QsQ0FBQztJQUVGLElBQUksTUFBZ0UsQ0FBQztJQUNyRSxPQUFPLENBQUMsQ0FBQyxNQUFNLEdBQUcsNkJBQTZCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO1FBQUMsQ0FBQztJQUU5RCxPQUFPLE1BQU0sQ0FBQyxLQUVxQixDQUFDO0FBQ3RDLENBQUMsQ0FBQztBQUVGLGtCQUFlLGFBQWEsQ0FBQyJ9