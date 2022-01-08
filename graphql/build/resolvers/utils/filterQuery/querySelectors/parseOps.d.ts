import { FilterOperators as QuerySelector } from "mongodb";
import { OpsParser } from "./types";
import { AsyncIterableIteratorFns } from "../../../../utils/iterableFns";
export declare const parseOpsGenerator: <TopValsDef extends Record<string, unknown>, Toptions = unknown>(opValues: AsyncIterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]> | Iterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]>, opsParsers: Iterable<OpsParser<TopValsDef, Toptions>>, options?: Toptions) => AsyncIterableIteratorFns<[keyof TopValsDef, TopValsDef[keyof TopValsDef]], QuerySelector<unknown>, undefined>;
export declare const parseOpsIgnoreUnmatched: <TopValsDef extends Record<string, unknown>, Toptions = unknown>(opValues: AsyncIterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]> | Iterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]>, opsParsers: Iterable<OpsParser<TopValsDef, Toptions>>, options?: Toptions) => Promise<QuerySelector<unknown>>;
export default function parseOps<TopValsDef extends Record<string, unknown>, Toptions = unknown>(yieldUnmatched: true, opValues: AsyncIterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]> | Iterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]>, opsParsers: Iterable<OpsParser<TopValsDef, Toptions>>, options?: Toptions): AsyncIterableIteratorFns<[
    keyof TopValsDef,
    TopValsDef[keyof TopValsDef]
], QuerySelector<unknown>>;
export default function parseOps<TopValsDef extends Record<string, unknown>, Toptions = unknown>(yieldUnmatched: false, opValues: AsyncIterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]> | Iterable<[keyof TopValsDef, TopValsDef[keyof TopValsDef]]>, opsParsers: Iterable<OpsParser<TopValsDef, Toptions>>, options?: Toptions): Promise<QuerySelector<unknown>>;
