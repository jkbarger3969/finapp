import { Db, Document, ObjectId } from "mongodb";

import { RefIdMaps } from "./remapReferences";

export interface SyncBudgetsOptions {
  sourceDb: Db;
  targetDb: Db;
  idMaps: Pick<RefIdMaps, "departments"> & { fiscalYears: Map<string, ObjectId> };
  dryRun?: boolean;
}

export interface SyncBudgetsReport {
  inserted: number;
  updated: number;
  unchanged: number;
  /** budget's fiscalYear or owner (when a Business, not Department) couldn't be resolved on the target - left unwritten */
  skippedUnresolved: number;
}

/**
 * Same preserve-`_id` + upsert-by-`_id` idempotency approach as syncEntries.ts.
 * Unlike entries, a budget has no natural business key across servers beyond
 * (fiscalYear, owner) - but ObjectIds are as globally unique here as anywhere
 * else, so preserving the source `_id` is simpler and gives the same
 * safe-to-rerun guarantee.
 */
export async function syncBudgets(options: SyncBudgetsOptions): Promise<SyncBudgetsReport> {
  const { sourceDb, targetDb, idMaps, dryRun = true } = options;
  const targetCollection = targetDb.collection("budgets");

  const report: SyncBudgetsReport = { inserted: 0, updated: 0, unchanged: 0, skippedUnresolved: 0 };

  const sourceBudgets = await sourceDb.collection("budgets").find({}).toArray();

  for (const budget of sourceBudgets) {
    const newFiscalYearId = idMaps.fiscalYears.get(budget.fiscalYear?.toHexString?.() ?? "");
    if (!newFiscalYearId) {
      report.skippedUnresolved++;
      continue;
    }

    let newOwner: Document | undefined;
    if (budget.owner?.type === "Department") {
      const newOwnerId = idMaps.departments.get(budget.owner.id?.toHexString?.() ?? "");
      if (!newOwnerId) {
        report.skippedUnresolved++;
        continue;
      }
      newOwner = { type: "Department", id: newOwnerId };
    } else {
      // Business-owned budgets: `businesses` is out of scope per project decision.
      report.skippedUnresolved++;
      continue;
    }

    const remapped: Document = { ...budget, fiscalYear: newFiscalYearId, owner: newOwner };

    const existing = await targetCollection.findOne(
      { _id: remapped._id },
      { projection: { amount: 1 } }
    );

    if (!existing) {
      report.inserted++;
    } else if (JSON.stringify(existing.amount) !== JSON.stringify(remapped.amount)) {
      report.updated++;
    } else {
      report.unchanged++;
      continue;
    }

    if (!dryRun) {
      await targetCollection.replaceOne({ _id: remapped._id }, remapped, { upsert: true });
    }
  }

  return report;
}
