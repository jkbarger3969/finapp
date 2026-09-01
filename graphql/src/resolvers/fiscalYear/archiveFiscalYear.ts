import { ObjectId } from "mongodb";
import { MutationResolvers, QueryResolvers } from "../../graphTypes";
import { effectiveDateExpr } from "../utils/queryUtils";

/**
 * Entry documents have no stored `fiscalYear` field (it's a computed
 * resolver field, see `entryResolvers.ts`) - matching entries to a fiscal
 * year here must use the same effective-date range check `Entry.fiscalYear`
 * and the budget aggregations use, honoring dateOfRecord/overrideFiscalYear.
 */
function entriesInFiscalYearFilter(fiscalYear: { begin: Date; end: Date }) {
  return {
    $expr: {
      $and: [
        { $gte: [effectiveDateExpr(), fiscalYear.begin] },
        { $lt: [effectiveDateExpr(), fiscalYear.end] },
      ],
    },
  };
}

export const archiveFiscalYear: MutationResolvers["archiveFiscalYear"] = async (
  _,
  { id },
  { dataSources: { accountingDb }, user, authService }
) => {
  if (!user) {
    throw new Error("Authentication required");
  }

  const fiscalYearId = new ObjectId(id);

  const fiscalYear = await accountingDb.findOne({
    collection: "fiscalYears",
    filter: { _id: fiscalYearId },
  });

  if (!fiscalYear) {
    throw new Error("Fiscal year not found");
  }

  if ((fiscalYear as any).archived) {
    throw new Error("Fiscal year is already archived");
  }

  const entriesResult = await accountingDb.db
    .collection("entries")
    .updateMany(
      { ...entriesInFiscalYearFilter(fiscalYear), archived: { $ne: true } },
      { $set: { archived: true, archivedAt: new Date(), archivedById: new ObjectId(user.id) } }
    );

  const budgetsResult = await accountingDb.db
    .collection("budgets")
    .updateMany(
      { fiscalYear: fiscalYearId, archived: { $ne: true } },
      { $set: { archived: true, archivedAt: new Date(), archivedById: new ObjectId(user.id) } }
    );

  await accountingDb.db.collection("fiscalYears").updateOne(
    { _id: fiscalYearId },
    {
      $set: {
        archived: true,
        archivedAt: new Date(),
        archivedById: new ObjectId(user.id),
      },
    }
  );

  const updatedFiscalYear = await accountingDb.findOne({
    collection: "fiscalYears",
    filter: { _id: fiscalYearId },
  });

  await authService.logAudit({
    userId: new ObjectId(user.id),
    action: "FISCAL_YEAR_ARCHIVE",
    resourceType: "FiscalYear",
    resourceId: fiscalYearId,
    details: {
      fiscalYearName: fiscalYear.name,
      entriesArchived: entriesResult.modifiedCount,
      budgetsArchived: budgetsResult.modifiedCount,
    },
    timestamp: new Date(),
  });

  return {
    fiscalYear: updatedFiscalYear,
    entriesArchived: entriesResult.modifiedCount,
    budgetsArchived: budgetsResult.modifiedCount,
  };
};

export const restoreFiscalYear: MutationResolvers["restoreFiscalYear"] = async (
  _,
  { id },
  { dataSources: { accountingDb }, user, authService }
) => {
  if (!user) {
    throw new Error("Authentication required");
  }

  const fiscalYearId = new ObjectId(id);

  const fiscalYear = await accountingDb.findOne({
    collection: "fiscalYears",
    filter: { _id: fiscalYearId },
  });

  if (!fiscalYear) {
    throw new Error("Fiscal year not found");
  }

  if (!(fiscalYear as any).archived) {
    throw new Error("Fiscal year is not archived");
  }

  const entriesResult = await accountingDb.db
    .collection("entries")
    .updateMany(
      { ...entriesInFiscalYearFilter(fiscalYear), archived: true },
      { $unset: { archived: "", archivedAt: "", archivedById: "" } }
    );

  const budgetsResult = await accountingDb.db
    .collection("budgets")
    .updateMany(
      { fiscalYear: fiscalYearId, archived: true },
      { $unset: { archived: "", archivedAt: "", archivedById: "" } }
    );

  await accountingDb.db.collection("fiscalYears").updateOne(
    { _id: fiscalYearId },
    {
      $unset: { archived: "", archivedAt: "", archivedById: "" },
    }
  );

  const updatedFiscalYear = await accountingDb.findOne({
    collection: "fiscalYears",
    filter: { _id: fiscalYearId },
  });

  await authService.logAudit({
    userId: new ObjectId(user.id),
    action: "FISCAL_YEAR_RESTORE",
    resourceType: "FiscalYear",
    resourceId: fiscalYearId,
    details: {
      fiscalYearName: fiscalYear.name,
      entriesRestored: entriesResult.modifiedCount,
      budgetsRestored: budgetsResult.modifiedCount,
    },
    timestamp: new Date(),
  });

  return {
    fiscalYear: updatedFiscalYear,
    entriesRestored: entriesResult.modifiedCount,
    budgetsRestored: budgetsResult.modifiedCount,
  };
};

export const exportFiscalYear: QueryResolvers["exportFiscalYear"] = async (
  _,
  { id },
  { dataSources: { accountingDb }, user }
) => {
  if (!user) {
    throw new Error("Authentication required");
  }

  const fiscalYearId = new ObjectId(id);

  const fiscalYear = await accountingDb.findOne({
    collection: "fiscalYears",
    filter: { _id: fiscalYearId },
  });

  if (!fiscalYear) {
    throw new Error("Fiscal year not found");
  }

  const entries = await accountingDb.find({
    collection: "entries",
    filter: entriesInFiscalYearFilter(fiscalYear),
  });

  const budgets = await accountingDb.find({
    collection: "budgets",
    filter: { fiscalYear: fiscalYearId },
  });

  return {
    fiscalYear,
    entries,
    budgets,
    exportedAt: new Date(),
  };
};

export const deleteFiscalYear: MutationResolvers["deleteFiscalYear"] = async (
  _,
  { id },
  { dataSources: { accountingDb }, user, authService }
) => {
  if (!user) {
    throw new Error("Authentication required");
  }

  const fiscalYearId = new ObjectId(id);

  const fiscalYear = await accountingDb.findOne({
    collection: "fiscalYears",
    filter: { _id: fiscalYearId },
  });

  if (!fiscalYear) {
    throw new Error("Fiscal year not found");
  }

  const entriesResult = await accountingDb.db
    .collection("entries")
    .deleteMany(entriesInFiscalYearFilter(fiscalYear));

  const budgetsResult = await accountingDb.db
    .collection("budgets")
    .deleteMany({ fiscalYear: fiscalYearId });

  await accountingDb.db.collection("fiscalYears").deleteOne({ _id: fiscalYearId });

  await authService.logAudit({
    userId: new ObjectId(user.id),
    action: "FISCAL_YEAR_DELETE",
    resourceType: "FiscalYear",
    resourceId: fiscalYearId,
    details: {
      fiscalYearName: fiscalYear.name,
      entriesDeleted: entriesResult.deletedCount,
      budgetsDeleted: budgetsResult.deletedCount,
    },
    timestamp: new Date(),
  });

  return {
    success: true,
    entriesDeleted: entriesResult.deletedCount,
    budgetsDeleted: budgetsResult.deletedCount,
  };
};
