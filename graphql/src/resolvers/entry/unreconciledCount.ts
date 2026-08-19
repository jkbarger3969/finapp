import { QueryResolvers } from "../../graphTypes";
import { Context } from "../../types";
import { getAccessibleDeptIdsWithDescendants } from "../utils/departmentAccess";

interface FacetCountResult {
  unreconciledEntries: [{ count: number }] | [];
  unreconciledRefunds: [{ count: number }] | [];
}

export const unreconciledCount: QueryResolvers["unreconciledCount"] = async (
  _,
  __,
  context
) => {
  const { dataSources: { accountingDb }, authService, user } = context as Context;

  const permittedDeptIds = await getAccessibleDeptIdsWithDescendants({
    authService,
    userId: user?.id,
    db: accountingDb.db,
  });

  if (permittedDeptIds && permittedDeptIds.length === 0) {
    return 0;
  }

  const pipeline: object[] = [];

  if (permittedDeptIds) {
    pipeline.push({
      $match: { "department.0.value": { $in: permittedDeptIds } },
    });
  }

  pipeline.push({
    $match: { "deleted.0.value": { $ne: true } },
  });

  pipeline.push({
    $facet: {
      unreconciledEntries: [
        { $match: { "reconciled.0.value": false } },
        { $count: "count" },
      ],
      unreconciledRefunds: [
        { $unwind: "$refunds" },
        {
          $match: {
            "refunds.deleted.0.value": { $ne: true },
            "refunds.reconciled.0.value": false,
          },
        },
        { $count: "count" },
      ],
    },
  });

  const [result] = await accountingDb
    .getCollection("entries")
    .aggregate<FacetCountResult>(pipeline)
    .toArray();

  const entriesCount = result?.unreconciledEntries?.[0]?.count || 0;
  const refundsCount = result?.unreconciledRefunds?.[0]?.count || 0;

  return entriesCount + refundsCount;
};
