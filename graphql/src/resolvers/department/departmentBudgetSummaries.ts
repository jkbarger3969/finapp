import { ObjectId } from "mongodb";
import { Context } from "../../types";

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

  // Get all DEBIT category IDs for filtering expenses
  const debitCategories = await db.collection("categories").find({ type: "Debit" }).toArray();
  const debitCategoryIds = debitCategories.map((cat: any) => cat._id);

  // Aggregate spending by department for this fiscal year (DEBIT entries only)
  // Note: entries use historical document format where fields are stored as field.0.value
  const spendingAgg = await db.collection("entries").aggregate([
    {
      $match: {
        "deleted.0.value": { $ne: true },
        "date.0.value": { $gte: begin, $lt: end },
        "category.0.value": { $in: debitCategoryIds }
      }
    },
    {
      $group: {
        _id: "$department.0.value",
        totalSpent: {
          $sum: {
            $let: {
              vars: {
                t: { $arrayElemAt: ["$total.value", 0] }
              },
              in: {
                $cond: [
                  { $eq: ["$$t", null] },
                  0,
                  {
                    $abs: {
                      $multiply: [
                        { $cond: [{ $or: [{ $eq: ["$$t.d", 0] }, { $eq: ["$$t.d", null] }] }, 0, { $divide: [{ $ifNull: ["$$t.n", 0] }, "$$t.d"] }] },
                        { $ifNull: ["$$t.s", 1] }
                      ]
                    }
                  }
                ]
              }
            }
          }
        },
        count: { $sum: 1 }
      }
    }
  ]).toArray();

  // Create spending map by department ID
  const spendingByDept = new Map<string, number>();
  spendingAgg.forEach((agg: any) => {
    if (agg._id) {
      spendingByDept.set(agg._id.toString(), agg.totalSpent || 0);
    }
  });

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
      spent: spendingByDept.get(deptId) || 0,
      level: getLevel(dept),
      parentId
    };
  });

  return results;
};
