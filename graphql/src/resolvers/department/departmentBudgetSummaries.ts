import { ObjectId } from "mongodb";
import { Context } from "../../types";
import { effectiveDateExpr } from "../utils/queryUtils";

interface DepartmentBudgetSummary {
  id: string;
  name: string;
  budget: number;
  spent: number;
  level: number;
  parentId: string | null;
}

export const departmentBudgetSummaries = async (
  _: unknown,
  { fiscalYearId }: { fiscalYearId: string },
  { db }: Context
): Promise<DepartmentBudgetSummary[]> => {
  const fiscalYearObjectId = new ObjectId(fiscalYearId);

  // Get fiscal year date range
  const fiscalYear = await db.collection("fiscalYears").findOne({ _id: fiscalYearObjectId });
  if (!fiscalYear) {
    return [];
  }

  const { begin, end } = fiscalYear;

  // Get all departments
  const departments = await db.collection("departments").find({}).toArray();

  // Get all budgets for this fiscal year
  const budgets = await db.collection("budgets").find({
    "fiscalYear": fiscalYearObjectId,
    "owner.type": "Department"
  }).toArray();

  // Create budget map by department ID
  // Note: budgets store amount directly as Rational {s, n, d}, not as historical field
  const budgetByDept = new Map<string, number>();
  budgets.forEach((budget: any) => {
    if (budget.owner?.id) {
      const deptId = budget.owner.id.toString();
      const amount = budget.amount
        ? (budget.amount.n / budget.amount.d) * budget.amount.s
        : 0;
      budgetByDept.set(deptId, (budgetByDept.get(deptId) || 0) + amount);
    }
  });

  // Get all DEBIT category IDs for filtering expenses, and CREDIT category
  // IDs for filtering income. Revenue-generating departments (e.g. Product,
  // which sells merchandise) earn income that extends their effective
  // spending power beyond their allocated budget - "remaining" needs to add
  // that income back in, not just subtract expenses. A pure cost-center
  // department (no income entries) is unaffected, since its credit total is
  // just 0.
  const debitCategories = await db.collection("categories").find({ type: "Debit" }).toArray();
  const debitCategoryIds = debitCategories.map((cat: any) => cat._id);
  const creditCategories = await db.collection("categories").find({ type: "Credit" }).toArray();
  const creditCategoryIds = creditCategories.map((cat: any) => cat._id);

  // Aggregates entries (and their refunds) matching `categoryIds` into a net
  // amount per department for this fiscal year: sum of entry totals minus
  // sum of non-deleted refund totals. Used for both DEBIT (expense) and
  // CREDIT (income) categories - same shape, just a different category set.
  // Note: In MongoDB aggregation, "$field.0.value" doesn't work - must use
  // $arrayElemAt; department.value returns array of all value props, then
  // $arrayElemAt gets first.
  const rationalSum = (valueField: string) => ({
    $sum: {
      $let: {
        vars: { t: { $arrayElemAt: [`$${valueField}`, 0] } },
        in: {
          $cond: [
            { $eq: ["$$t", null] },
            0,
            {
              $abs: {
                $multiply: [
                  { $cond: [{ $or: [{ $eq: ["$$t.d", 0] }, { $eq: ["$$t.d", null] }] }, 0, { $divide: [{ $ifNull: ["$$t.n", 0] }, "$$t.d"] }] },
                  { $ifNull: ["$$t.s", 1] },
                ],
              },
            },
          ],
        },
      },
    },
  });

  const aggregateNetByDept = async (categoryIds: ObjectId[]): Promise<Map<string, number>> => {
    // Respect dateOfRecord/overrideFiscalYear the same way refund effective
    // dates do below, so an entry posted near a fiscal-year boundary with an
    // overridden record date lands in the correct year here too.
    const entryAgg = await db.collection("entries").aggregate([
      { $match: { "deleted.0.value": { $ne: true }, "category.0.value": { $in: categoryIds } } },
      { $addFields: { entryEffectiveDate: effectiveDateExpr() } },
      { $match: { entryEffectiveDate: { $gte: begin, $lt: end } } },
      { $group: { _id: { $arrayElemAt: ["$department.value", 0] }, total: rationalSum("total.value") } },
    ]).toArray();

    // Refunds reduce the net amount as soon as they're recorded, matching
    // how the originating entries count immediately regardless of
    // reconciled status.
    const refundAgg = await db.collection("entries").aggregate([
      { $match: { "deleted.0.value": { $ne: true }, "category.0.value": { $in: categoryIds }, "refunds.0": { $exists: true } } },
      { $unwind: "$refunds" },
      { $addFields: { refundEffectiveDate: effectiveDateExpr("refunds") } },
      { $match: { "refunds.deleted.0.value": { $ne: true }, refundEffectiveDate: { $gte: begin, $lt: end } } },
      { $group: { _id: { $arrayElemAt: ["$department.value", 0] }, total: rationalSum("refunds.total.value") } },
    ]).toArray();

    const byDept = new Map<string, number>();
    entryAgg.forEach((agg: any) => {
      if (agg._id) byDept.set(agg._id.toString(), agg.total || 0);
    });
    refundAgg.forEach((agg: any) => {
      if (!agg._id) return;
      const deptId = agg._id.toString();
      byDept.set(deptId, (byDept.get(deptId) || 0) - (agg.total || 0));
    });
    return byDept;
  };

  const netExpenseByDept = await aggregateNetByDept(debitCategoryIds);
  const netIncomeByDept = await aggregateNetByDept(creditCategoryIds);

  // Net cost per department: expenses reduce "remaining", income (e.g. from
  // a department that sells merchandise or charges fees) extends it back
  // out. A pure cost-center department earns no income here, so this is a
  // no-op for it.
  const spendingByDept = new Map<string, number>();
  for (const deptId of new Set([...netExpenseByDept.keys(), ...netIncomeByDept.keys()])) {
    spendingByDept.set(deptId, (netExpenseByDept.get(deptId) || 0) - (netIncomeByDept.get(deptId) || 0));
  }

  // Build department hierarchy info
  const deptMap = new Map<string, any>();
  departments.forEach((dept: any) => {
    deptMap.set(dept._id.toString(), dept);
  });

  // Calculate level for each department (distance from root)
  const getLevel = (dept: any): number => {
    if (!dept.parent || dept.parent.type === "Business") {
      return 0;
    }
    const parentDept = deptMap.get(dept.parent.id?.toString());
    if (!parentDept) return 0;
    return 1 + getLevel(parentDept);
  };

  // Build parent-child relationships
  const childrenByParent = new Map<string, string[]>();
  departments.forEach((dept: any) => {
    if (dept.parent?.type === "Department" && dept.parent?.id) {
      const parentId = dept.parent.id.toString();
      const existing = childrenByParent.get(parentId) || [];
      existing.push(dept._id.toString());
      childrenByParent.set(parentId, existing);
    }
  });

  // Calculate total spent including all descendants
  const calcTotalSpent = (deptId: string, visited = new Set<string>()): number => {
    if (visited.has(deptId)) return 0; // Prevent infinite loops
    visited.add(deptId);
    
    let total = spendingByDept.get(deptId) || 0;
    const children = childrenByParent.get(deptId) || [];
    for (const childId of children) {
      total += calcTotalSpent(childId, visited);
    }
    return total;
  };

  // Build the result
  const results: DepartmentBudgetSummary[] = departments.map((dept: any) => {
    const deptId = dept._id.toString();
    const parentId = dept.parent?.type === "Department" && dept.parent?.id 
      ? dept.parent.id.toString() 
      : null;
    
    return {
      id: deptId,
      name: dept.name,
      budget: budgetByDept.get(deptId) || 0,
      spent: calcTotalSpent(deptId), // Include all descendants' spending
      level: getLevel(dept),
      parentId
    };
  });

  return results;
};
