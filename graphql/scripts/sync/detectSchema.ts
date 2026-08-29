import { Db, Document, ObjectId } from "mongodb";

export interface FieldCensusEntry {
  count: number;
  types: Set<string>;
  examples: unknown[];
}

export type Census = Record<string, FieldCensusEntry>;

function typeOf(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (value instanceof Date) return "date";
  if (value instanceof ObjectId) return "ObjectId";
  return typeof value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !(value instanceof Date) &&
    !(value instanceof ObjectId) &&
    !Array.isArray(value)
  );
}

function walkFields(doc: Record<string, unknown>, prefix: string, census: Census): void {
  for (const [key, value] of Object.entries(doc)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const entry = census[path] ?? (census[path] = { count: 0, types: new Set(), examples: [] });
    entry.count++;
    entry.types.add(typeOf(value));
    if (entry.examples.length < 3) entry.examples.push(value);

    if (Array.isArray(value)) {
      // Historized fields are arrays of {value, createdBy, createdOn} - descend
      // into the first element's shape once, under a `[]` marker.
      if (value.length > 0 && isPlainObject(value[0])) {
        walkFields(value[0], `${path}[]`, census);
      }
    } else if (isPlainObject(value)) {
      walkFields(value, path, census);
    }
  }
}

/** Pure field-presence/type census over an already-fetched sample of docs. */
export function censusDocuments(docs: Document[]): Census {
  const census: Census = {};
  for (const doc of docs) {
    walkFields(doc, "", census);
  }
  return census;
}

export async function censusCollection(
  db: Db,
  collectionName: string,
  sampleSize = 500
): Promise<{ sampleSize: number; census: Census }> {
  const docs = await db.collection(collectionName).find({}).limit(sampleSize).toArray();
  return { sampleSize: docs.length, census: censusDocuments(docs) };
}

/** Field paths present in the sample that aren't in the given known-shape
 * list - candidates to review before extending fieldMapping.ts. Not a strict
 * validator: absence from this list doesn't mean the field is wrong, only
 * unexpected relative to this repo's current CollectionSchemaMap. */
export function diffAgainstKnownFields(census: Census, knownFieldPaths: string[]): string[] {
  const known = new Set(knownFieldPaths);
  return Object.keys(census).filter((path) => !known.has(path));
}

export function topLevelFieldName(path: string): string {
  return path.split(/[.[]/)[0];
}

/** Top-level fields per collection as of this repo's current
 * `CollectionSchemaMap` (graphql/src/dataSources/accountingDb/types.d.ts).
 * Used only to flag unfamiliar top-level fields for human review - not a
 * strict validator, and deliberately shallow (see cli.ts "detect-schema"). */
export const NEW_SCHEMA_TOP_LEVEL_FIELDS: Record<string, string[]> = {
  entries: [
    "_id", "lastUpdate", "createdOn", "createdBy", "category", "date", "deleted",
    "department", "description", "paymentMethod", "reconciled", "source", "total",
    "dateOfRecord", "items", "refunds", "attachments",
  ],
  categories: [
    "_id", "name", "code", "externalId", "type", "inactive", "donation", "parent",
    "active", "hidden", "accountNumber", "groupName", "sortOrder", "allowStandalone",
  ],
  departments: ["_id", "code", "name", "parent", "disable", "virtualRoot"],
  accounts: ["_id", "name", "accountType", "active", "currencyType", "owner", "type"],
  budgets: ["_id", "amount", "fiscalYear", "owner"],
  fiscalYears: ["_id", "name", "begin", "end", "archived", "archivedAt", "archivedById"],
};

export function formatCensusReport(sampleSize: number, census: Census): string {
  const lines = [`sample size: ${sampleSize}`];
  const sorted = Object.entries(census).sort((a, b) => b[1].count - a[1].count);
  for (const [path, entry] of sorted) {
    const pct = sampleSize > 0 ? Math.round((entry.count / sampleSize) * 100) : 0;
    lines.push(`  ${entry.count}/${sampleSize} (${pct}%)  ${path}  [${[...entry.types].join(", ")}]`);
  }
  return lines.join("\n");
}
