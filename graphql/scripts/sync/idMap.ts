import { Document, ObjectId } from "mongodb";

export interface RefDoc extends Document {
  _id: ObjectId;
}

export interface AmbiguousMatch {
  key: string;
  oldIds: ObjectId[];
  newIds: ObjectId[];
}

export interface IdMapResult {
  /** old _id (hex) -> new _id */
  matched: Map<string, ObjectId>;
  /** present in old, no match (and no override) found on the target - needs a create or an override entry */
  unmatched: RefDoc[];
  /** the business key matched more than one target doc - needs a manual override, never guessed */
  ambiguous: AmbiguousMatch[];
}

export type KeyFn = (doc: RefDoc) => string | undefined;

export function normalizeKey(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const byField =
  (field: string): KeyFn =>
  (doc) =>
    normalizeKey(doc[field]);

/** Falls back through key functions in order, using the first that produces a key. */
export const byFieldsInOrder =
  (...fns: KeyFn[]): KeyFn =>
  (doc) => {
    for (const fn of fns) {
      const key = fn(doc);
      if (key) return key;
    }
    return undefined;
  };

/**
 * Natural business key per reference collection kept in sync (§ "Sync scope"
 * in README.md). `users`/`businesses`/`people` are intentionally absent -
 * out of scope per project decision.
 */
export const REFERENCE_KEY_FNS: Record<
  "categories" | "departments" | "accounts" | "fiscalYears",
  KeyFn
> = {
  categories: byFieldsInOrder(byField("code"), byField("name")),
  departments: byField("code"),
  accounts: byField("name"),
  fiscalYears: byField("name"),
};

/**
 * Matches old-server docs to new-server docs by business key rather than by
 * assuming shared `_id`s - the relationship between the two servers' data
 * (fresh install vs. restored copy) isn't known, so identical `_id`s can't be
 * relied on. `overrides` (old _id hex -> new _id hex) always wins, letting a
 * human resolve anything ambiguous or unmatched instead of the tool guessing.
 */
export function buildIdMap(
  oldDocs: RefDoc[],
  newDocs: RefDoc[],
  keyFn: KeyFn,
  overrides: Record<string, string> = {}
): IdMapResult {
  const newByKey = new Map<string, ObjectId[]>();
  for (const doc of newDocs) {
    const key = keyFn(doc);
    if (!key) continue;
    const list = newByKey.get(key) ?? [];
    list.push(doc._id);
    newByKey.set(key, list);
  }

  const matched = new Map<string, ObjectId>();
  const unmatched: RefDoc[] = [];
  const ambiguous: AmbiguousMatch[] = [];

  for (const doc of oldDocs) {
    const oldIdHex = doc._id.toHexString();

    const override = overrides[oldIdHex];
    if (override) {
      matched.set(oldIdHex, new ObjectId(override));
      continue;
    }

    const key = keyFn(doc);
    const candidates = key ? newByKey.get(key) : undefined;

    if (!candidates || candidates.length === 0) {
      unmatched.push(doc);
    } else if (candidates.length === 1) {
      matched.set(oldIdHex, candidates[0]);
    } else {
      ambiguous.push({ key: key!, oldIds: [doc._id], newIds: candidates });
    }
  }

  return { matched, unmatched, ambiguous };
}
