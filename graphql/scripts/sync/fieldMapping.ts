import { Document, ObjectId } from "mongodb";

export interface TransformResult {
  doc: Document;
  warnings: string[];
}

export type EntryTransform = (doc: Document) => TransformResult;

const HISTORICAL_DATE_PATHS: string[][] = [["date"], ["dateOfRecord", "date"]];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !(value instanceof Date) &&
    !(value instanceof ObjectId) &&
    !Array.isArray(value)
  );
}

function getAtPath(obj: any, path: string[]): unknown {
  return path.reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function setAtPath(obj: any, path: string[], value: unknown): void {
  const parent = path
    .slice(0, -1)
    .reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
  if (parent == null) return;
  parent[path[path.length - 1]] = value;
}

/**
 * Coerces `YYYY-MM-DD`-style string values in historized `date` fields into
 * real `Date` objects. Safe to run unconditionally: it only rewrites values
 * that are strings where the app expects a `Date`, and is a no-op on values
 * that are already real `Date`s or that fail to parse.
 */
export function coerceLegacyDateStrings(doc: Document): TransformResult {
  const warnings: string[] = [];
  const result: Document = { ...doc };

  for (const path of HISTORICAL_DATE_PATHS) {
    const historyArray = getAtPath(result, path);
    if (!Array.isArray(historyArray)) continue;

    setAtPath(
      result,
      path,
      historyArray.map((historyObject: any) => {
        if (historyObject && typeof historyObject.value === "string") {
          const parsed = new Date(historyObject.value);
          if (!Number.isNaN(parsed.getTime())) {
            warnings.push(
              `${path.join(".")}: coerced legacy date string "${historyObject.value}" -> ${parsed.toISOString()}`
            );
            return { ...historyObject, value: parsed };
          }
        }
        return historyObject;
      })
    );
  }

  return { doc: result, warnings };
}

/**
 * OPT-IN, disabled by default. The old `journalEntries`-era schema stored
 * references as `{ node: ObjectId, id: ObjectId }` instead of a plain
 * `ObjectId`, and it's not yet confirmed which of `node`/`id` holds the
 * actual referenced document's `_id`. Do not enable this until `detect-schema`
 * has been run against the real old-server data and the correct `idKey` has
 * been confirmed - see README.md "Schema delta" section.
 */
export function unwrapLegacyNodeIdRefs(
  doc: Document,
  { idKey = "id" }: { idKey?: "id" | "node" } = {}
): TransformResult {
  const warnings: string[] = [];

  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(walk);
    }
    if (isPlainObject(value)) {
      const keys = Object.keys(value);
      if (keys.length === 2 && keys.includes("node") && keys.includes("id")) {
        const unwrapped = (value as any)[idKey];
        warnings.push(`unwrapped legacy {node,id} ref -> ${idKey}=${unwrapped}`);
        return unwrapped;
      }
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        out[k] = walk(v);
      }
      return out;
    }
    return value;
  };

  return { doc: walk(doc) as Document, warnings };
}

export interface TransformPipelineOptions {
  unwrapLegacyNodeIdRefs?: { idKey?: "id" | "node" };
  customTransforms?: EntryTransform[];
}

/**
 * The full, ordered transform pipeline applied to every entry document
 * before it's written to the target server. Fields not touched by any step
 * pass through verbatim (schema tolerance) - real production data mixes
 * current historized fields with legacy spreadsheet-import leftovers, and
 * this must not drop or reject them. Extend `customTransforms` with anything
 * `detect-schema` reveals that isn't already handled above.
 */
export function transformEntry(
  doc: Document,
  options: TransformPipelineOptions = {}
): TransformResult {
  let current = doc;
  const warnings: string[] = [];

  const applyStep = (transform: EntryTransform) => {
    const result = transform(current);
    current = result.doc;
    warnings.push(...result.warnings);
  };

  applyStep(coerceLegacyDateStrings);

  if (options.unwrapLegacyNodeIdRefs) {
    applyStep((d) => unwrapLegacyNodeIdRefs(d, options.unwrapLegacyNodeIdRefs));
  }

  for (const custom of options.customTransforms ?? []) {
    applyStep(custom);
  }

  return { doc: current, warnings };
}
