"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlTZWxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvdXRpbHMvZmlsdGVyUXVlcnkvcXVlcnlTZWxlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDREQUdvQztBQTREcEMsNEVBQTRFO0FBQzVFLCtFQUErRTtBQUMvRSxNQUFNLG9DQUFvQyxHQUFHLFFBQVEsQ0FBQyxFQUlwRCw2QkFFOEMsRUFDOUMsUUFBeUI7SUFFekIsS0FBSyxNQUFNLE1BQU0sSUFBSSxvQ0FBc0IsQ0FBQyw2QkFBNkIsQ0FBQyxFQUFFO1FBQzFFLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDeEIsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO2dCQUNoQixRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM3QjtTQUNGO2FBQU07WUFDTCxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUM7U0FDcEI7S0FDRjtBQUNILENBQUMsQ0FBQztBQUVGLHlFQUF5RTtBQUN6RSxvRUFBb0U7QUFDcEUsbUVBQW1FO0FBQ25FLHFEQUFxRDtBQUN4QyxRQUFBLHNCQUFzQixHQUFHLFFBQVEsQ0FBQyxFQUk3QyxTQUFxQixFQUNyQix1QkFJRyxFQUNILGFBQXFDO0lBRXJDLE1BQU0sUUFBUSxHQUFvQixFQUFFLENBQUM7SUFFckMsSUFBSSw2QkFBNkIsR0FBRyxvQ0FBb0MsQ0FDdEUsQ0FBQyxRQUFRLENBQUM7UUFDUixLQUFLLE1BQU0sRUFBRSxJQUFJLFNBQVMsRUFBRTtZQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRTtnQkFDeEQsU0FBUzthQUNWO1lBQ0QsTUFBTSxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBR3ZCLENBQUM7U0FDSDtJQUNILENBQUMsQ0FBQyxFQUFFLEVBQ0osUUFBUSxDQUNULENBQUM7SUFFRixLQUFLLE1BQU0sc0JBQXNCLElBQUksdUJBQXVCLEVBQUU7UUFDNUQsNkJBQTZCLEdBQUcsb0NBQW9DLENBQ2xFLHNCQUFzQixDQUFDLDZCQUE2QixFQUFFLGFBQWEsQ0FBQyxFQUNwRSxRQUFRLENBQ1QsQ0FBQztLQUNIO0lBRUQsMkNBQTJDO0lBQzNDLEtBQUssQ0FBQyxDQUFDLDZCQUE2QixDQUFDO0lBRXJDLDhDQUE4QztJQUM5QyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3ZCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDeEQ7SUFFRCxPQUFPLGFBQWEsQ0FBQztBQUN2QixDQUFDLENBQUM7QUFFRixNQUFNLGFBQWEsR0FBRyxDQUNwQixTQUFxQixFQUNyQix1QkFJRyxFQUNILGdCQUF3QyxFQUFFLEVBQzFDLEVBQUU7SUFDRixNQUFNLDZCQUE2QixHQUFHLDhCQUFzQixDQUMxRCxTQUFTLEVBQ1QsdUJBQXVCLEVBQ3ZCLGFBQWEsQ0FDZCxDQUFDO0lBRUYsSUFBSSxNQUFnRSxDQUFDO0lBQ3JFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyw2QkFBNkIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7UUFBQyxDQUFDO0lBRTlELE9BQU8sTUFBTSxDQUFDLEtBRXFCLENBQUM7QUFDdEMsQ0FBQyxDQUFDO0FBRUYsa0JBQWUsYUFBYSxDQUFDIn0=