import { ObjectId } from "mongodb";
import { BusinessResolvers, Department } from "../../graphTypes";
import { Context } from "../../types";

import { DepartmentDbRecord } from "../department";

export interface BusinessDbRecord {
  _id: ObjectId;
  name: string;
  vendor?: {
    approved: boolean;
    vendorId: string | ObjectId;
  };
  budget?: {
    id: ObjectId;
    node: ObjectId;
  };
}

const budgets: BusinessResolvers<Context, BusinessDbRecord>["budgets"] = (
  { _id },
  _,
  { db }
) => {
  return db
    .collection("budgets")
    .find({
      "owner.type": "Business",
      "owner.id": _id,
    })
    .toArray();
};

const departments: BusinessResolvers<
  Context,
  BusinessDbRecord
>["departments"] = async ({ _id }, _, { db }) => {
  const results: DepartmentDbRecord[] = [];

  const query = await db
    .collection<DepartmentDbRecord>("departments")
    .find({
      "parent.type": "Business",
      "parent.id": _id,
    })
    .toArray();

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

  return (results as unknown[]) as Department[];
};

const BusinessResolver: BusinessResolvers<Context, BusinessDbRecord> = {
  id: ({ _id }) => _id.toString(),
  budgets,
  departments,
} as const;

export const Business = (BusinessResolver as unknown) as BusinessResolvers;
