import { QuerySelector } from "mongodb";

export type OperatorValueTransmutator<T, U, V> =
  | ((operatorValue: T, operator?: U) => V)
  | ((operatorValue: T, operator?: U) => Promise<V>)
  | ((operatorValue: T, operator?: U) => V | Promise<V>);

export interface QuerySelectorIterableIterator
  extends Iterator<[string, any], undefined | Promise<void>> {
  [Symbol.iterator](): QuerySelectorIterableIterator;
}

export interface QuerySelectorGenerator {
  (
    operatorValues: Iterable<[string, any]>,
    querySelector: QuerySelector<any>,
    operatorValueTransmutator: OperatorValueTransmutator<any, string, any>
  ): QuerySelectorIterableIterator;
}
