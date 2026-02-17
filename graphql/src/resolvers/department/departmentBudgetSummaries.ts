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

  // Get all departments
  const departments = await db.collection("departments").find({}).toArray();

  // Get all budgets for this fiscal year
  const budgets = await db.collection("budgets").find({
    "fiscalYear": fiscalYearObjectId,
    "owner.type": "Department"
  }).toArray();

  // Create budget map by department ID
  const budgetByDept = new Map<string, number>();
  budgets.forEach((budget: any) => {
    if (budget.owner?.id) {
      const deptId = budget.owner.id.toString();
      const amount = budget.amount?.value?.[0] 
        ? (budget.amount.value[0].n / budget.amount.value[0].d) * budget.amount.value[0].s
        : 0;
      budgetByDept.set(deptId, (budgetByDept.get(deptId) || 0) + amount);
    }
  });

  // Aggregate spending by department for this fiscal year (DEBIT entries only)
  const spendingAgg = await db.collection("entries").aggregate([
    {
      $match: {
        fiscalYear: fiscalYearObjectId,
        deleted: { $ne: true }
      }
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDoc"
      }
    },
    {
      $match: {
        "categoryDoc.type": "DEBIT"
      }
    },
    {
      $group: {
        _id: "$department",
        totalSpent: {
          $sum: {
            $let: {
              vars: {
                t: { $arrayElemAt: ["$total.value", 0] }
              },
              in: {
                $abs: {
                  $multiply: [
                    { $divide: ["$$t.n", "$$t.d"] },
                    "$$t.s"
                  ]
                }
              }
            }
          }
        }
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
