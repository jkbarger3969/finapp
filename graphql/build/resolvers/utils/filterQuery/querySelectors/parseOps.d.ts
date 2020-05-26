import { QuerySelector } from "mongodb";
import { OpsParser } from "./types";
import { AsyncIterableIteratorFns } from "../../../../utils/iterableFns";
export declare const parseOpsGenerator: (opValues: AsyncIterable<[string, unknown]> | Iterable<[string, unknown]>, opsParsers: Iterable<OpsParser>, opts?: unknown) => AsyncIterableIteratorFns<[string, unknown], QuerySelector<unknown>, undefined>;
export declare const parseOpsIgnoreUnmatched: (opValues: AsyncIterable<[string, unknown]> | Iterable<[string, unknown]>, opsParsers: Iterable<OpsParser>, opts?: unknown) => Promise<QuerySelector<unknown>>;
export default function parseOps(yieldUnmatched: true, ...args: Parameters<typeof parseOpsGenerator>): ReturnType<typeof parseOpsGenerator>;
export default function parseOps(yieldUnmatched: false, ...args: Parameters<typeof parseOpsGenerator>): ReturnType<typeof parseOpsIgnoreUnmatched>;
