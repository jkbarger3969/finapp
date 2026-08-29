import { Db, ObjectId } from "mongodb";

import { AmbiguousMatch, KeyFn, REFERENCE_KEY_FNS, RefDoc, buildIdMap } from "./idMap";
import { IdMapFile } from "./state";

export type ReferenceCollection = keyof typeof REFERENCE_KEY_FNS;

const REFERENCE_COLLECTIONS: ReferenceCollection[] = [
  "categories",
  "departments",
  "accounts",
  "fiscalYears",
];

export interface ReferenceSyncReport {
  collection: ReferenceCollection;
  matched: number;
  created: number;
  unmatched: RefDoc[];
  ambiguous: AmbiguousMatch[];
}

export interface MapReferenceDataResult {
  idMap: IdMapFile;
  reports: ReferenceSyncReport[];
}

/**
 * Resolves old-server -> new-server ids for every in-scope reference
 * collection by business key (see idMap.ts), creating the doc on the target
 * when no match is found. Works whether the target was seeded from a copy of
 * the old server or built independently, since it never assumes matching
 * `_id`s - see plan "Reference IDs are resolved by business key" decision.
 */
export async function mapReferenceData({
  sourceDb,
  targetDb,
  overrides,
  dryRun = true,
}: {
  sourceDb: Db;
  targetDb: Db;
  overrides: IdMapFile;
  dryRun?: boolean;
}): Promise<MapReferenceDataResult> {
  const idMap: IdMapFile = {};
  const reports: ReferenceSyncReport[] = [];

  for (const collection of REFERENCE_COLLECTIONS) {
    const keyFn: KeyFn = REFERENCE_KEY_FNS[collection];
    const oldDocs = (await sourceDb.collection(collection).find({}).toArray()) as RefDoc[];
    const newDocs = (await targetDb.collection(collection).find({}).toArray()) as RefDoc[];

    const { matched, unmatched, ambiguous } = buildIdMap(
      oldDocs,
      newDocs,
      keyFn,
      overrides[collection] ?? {}
    );

    let created = 0;
    if (!dryRun) {
      for (const doc of unmatched) {
        const { _id: oldId, ...rest } = doc;
        const { insertedId } = await targetDb.collection(collection).insertOne(rest as any);
        matched.set(oldId.toHexString(), insertedId);
        created++;
      }
    }

    idMap[collection] = Object.fromEntries(
      Array.from(matched.entries()).map(([oldHex, newId]) => [oldHex, newId.toHexString()])
    );

    reports.push({
      collection,
      matched: matched.size - created,
      created,
      unmatched: dryRun ? unmatched : [],
      ambiguous,
    });
  }

  if (!dryRun) {
    // Newly-created department/category docs still hold old-server parent
    // ids (copied verbatim from source) - now that every doc in this batch
    // has a target id, fix up the self-referential tree pointers.
    await fixDepartmentParentRefs(targetDb, idMap.departments ?? {});
    await fixCategoryParentRefs(targetDb, idMap.categories ?? {});
  }

  return { idMap, reports };
}

async function fixDepartmentParentRefs(
  targetDb: Db,
  departmentIdMap: Record<string, string>
): Promise<void> {
  const candidates = await targetDb
    .collection("departments")
    .find({ "parent.type": "Department" })
    .toArray();

  for (const dept of candidates) {
    const parentId = dept.parent?.id;
    if (!(parentId instanceof ObjectId)) continue;
    const mappedNewId = departmentIdMap[parentId.toHexString()];
    if (mappedNewId) {
      await targetDb
        .collection("departments")
        .updateOne({ _id: dept._id }, { $set: { "parent.id": new ObjectId(mappedNewId) } });
    }
  }
}

async function fixCategoryParentRefs(
  targetDb: Db,
  categoryIdMap: Record<string, string>
): Promise<void> {
  const candidates = await targetDb
    .collection("categories")
    .find({ parent: { $exists: true, $ne: null } })
    .toArray();

  for (const category of candidates) {
    const parentId = category.parent;
    if (!(parentId instanceof ObjectId)) continue;
    const mappedNewId = categoryIdMap[parentId.toHexString()];
    if (mappedNewId) {
      await targetDb
        .collection("categories")
        .updateOne({ _id: category._id }, { $set: { parent: new ObjectId(mappedNewId) } });
    }
  }
}
