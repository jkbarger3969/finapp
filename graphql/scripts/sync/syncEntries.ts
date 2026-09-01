import { Db, Document } from "mongodb";

import { TransformPipelineOptions, transformEntry } from "./fieldMapping";
import { RefIdMaps, remapEntryReferences } from "./remapReferences";

export interface SyncEntriesOptions {
  sourceDb: Db;
  targetDb: Db;
  idMaps: RefIdMaps;
  /** only pull source entries with `lastUpdate` strictly after this (incremental sync) */
  since?: Date;
  transformOptions?: TransformPipelineOptions;
  /** default true - callers must opt in to writing */
  dryRun?: boolean;
  batchSize?: number;
  /** invoked once per processed doc - lets a long-running caller (e.g. a GUI) show live progress */
  onProgress?: (processed: number) => void;
}

export interface EntryDecision {
  id: string;
  action: "insert" | "update" | "unchanged" | "error";
  unresolved: string[];
  outOfScope: string[];
  error?: string;
}

export interface SyncEntriesReport {
  inserted: number;
  updated: number;
  unchanged: number;
  errors: number;
  unresolvedRefCount: number;
  outOfScopeRefCount: number;
  /** max source `lastUpdate` safe to resume from next time - stops short of any doc that errored */
  newCheckpoint?: Date;
  decisions: EntryDecision[];
}

/**
 * Copies entries from `sourceDb` to `targetDb`, preserving each doc's
 * original `_id` and upserting by it. This is what makes re-running the sync
 * any number of times safe: it can only insert-if-missing or
 * overwrite-with-latest, never duplicate. `dryRun` (default) computes the
 * same decisions without writing anything.
 */
export async function syncEntries(options: SyncEntriesOptions): Promise<SyncEntriesReport> {
  const { sourceDb, targetDb, idMaps, since, transformOptions, dryRun = true, batchSize = 500, onProgress } = options;

  const filter = since ? { lastUpdate: { $gt: since } } : {};
  const cursor = sourceDb.collection("entries").find(filter).sort({ lastUpdate: 1 });
  const targetCollection = targetDb.collection("entries");

  const report: SyncEntriesReport = {
    inserted: 0,
    updated: 0,
    unchanged: 0,
    errors: 0,
    unresolvedRefCount: 0,
    outOfScopeRefCount: 0,
    decisions: [],
  };

  let successfulMax: Date | undefined;
  let firstFailure: Date | undefined;
  let batch: Document[] = [];
  let processed = 0;

  const flush = async () => {
    if (batch.length === 0) return;
    if (!dryRun) {
      const ops = batch.map((doc) => ({
        replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true },
      }));
      await targetCollection.bulkWrite(ops, { ordered: false });
    }
    batch = [];
  };

  for await (const sourceDoc of cursor) {
    try {
      const { doc: transformed } = transformEntry(sourceDoc, transformOptions);
      const { doc: remapped, report: remapReport } = remapEntryReferences(transformed, idMaps);

      report.unresolvedRefCount += remapReport.unresolved.length;
      report.outOfScopeRefCount += remapReport.outOfScope.length;

      const existing = await targetCollection.findOne(
        { _id: remapped._id },
        { projection: { lastUpdate: 1 } }
      );

      let action: EntryDecision["action"];
      if (!existing) {
        action = "insert";
        report.inserted++;
      } else if (
        !(existing.lastUpdate instanceof Date) ||
        !(remapped.lastUpdate instanceof Date) ||
        existing.lastUpdate.getTime() !== remapped.lastUpdate.getTime()
      ) {
        action = "update";
        report.updated++;
      } else {
        action = "unchanged";
        report.unchanged++;
      }

      if (action !== "unchanged") {
        batch.push(remapped);
        if (batch.length >= batchSize) await flush();
      }

      report.decisions.push({
        id: remapped._id.toHexString(),
        action,
        unresolved: remapReport.unresolved,
        outOfScope: remapReport.outOfScope,
      });

      if (remapped.lastUpdate instanceof Date) {
        if (!successfulMax || remapped.lastUpdate > successfulMax) {
          successfulMax = remapped.lastUpdate;
        }
      }
    } catch (error) {
      report.errors++;
      const lastUpdate = sourceDoc.lastUpdate instanceof Date ? sourceDoc.lastUpdate : undefined;
      if (lastUpdate && (!firstFailure || lastUpdate < firstFailure)) {
        firstFailure = lastUpdate;
      }
      report.decisions.push({
        id: sourceDoc._id?.toHexString?.() ?? "unknown",
        action: "error",
        unresolved: [],
        outOfScope: [],
        error: error instanceof Error ? error.message : String(error),
      });
    }

    processed++;
    onProgress?.(processed);
  }

  await flush();

  if (successfulMax) {
    report.newCheckpoint =
      firstFailure && firstFailure <= successfulMax
        ? new Date(firstFailure.getTime() - 1)
        : successfulMax;
  }

  return report;
}
