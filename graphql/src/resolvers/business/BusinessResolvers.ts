import { DepartmentDbRecord } from "../../dataSources/accountingDb/types";
import { BusinessResolvers } from "../../graphTypes";

const budgets: BusinessResolvers["budgets"] = ({ _id }, _, { db }) => {
  return db
    .collection("budgets")
    .find({
      "owner.type": "Business",
      "owner.id": _id,
    })
    .toArray() as any;
};

const departments: BusinessResolvers["departments"] = async (
  { _id },
  { root },
  { db }
) => {
  const results: DepartmentDbRecord[] = [];

  const query = await db
    .collection<DepartmentDbRecord>("departments")
    .find({
      "parent.type": "Business",
      "parent.id": _id,
    })
    .toArray();

  if (root) {
    results.push(...query);
  } else {
    while (query.length) {
      results.push(...query);

      query.push(
        ...(await db
          .collection<DepartmentDbRecord>("departments")
          .find({
            "parent.type": "Department",
            "parent.id": {
              $in: query.splice(0).map(({ _id }) => _id),
            },
          })
          .toArray())
      );
    }
  }

  return results;
};

export const Business: BusinessResolvers = {
  id: ({ _id }) => _id.toString(),
  budgets,
  departments,
} as const;
