import { ObjectId } from "mongodb";
import { validateEntry } from ".";
import { AccountingDb, UpdateOne } from "../../dataSources/accountingDb/accountingDb";
import {
  EntryDbRecord,
  EntryRefundDbRecord,
} from "../../dataSources/accountingDb/types";
import { MutationResolvers, ReconcileEntries } from "../../graphTypes";
import { AuthService } from "../../services/authService";
import { DocHistory, UpdateHistoricalDoc } from "../utils/DocHistory";
import { getAccessibleDeptIdsWithDescendants } from "../utils/departmentAccess";

/**
 * Rejects a reconcile request that targets any entry or refund outside the
 * caller's accessible departments (including descendants). Refunds are
 * checked against their *parent* entry's department, since refunds don't
 * carry their own department.
 */
async function assertReconcileAccess({
  input,
  authService,
  userId,
  accountingDb,
}: {
  input: ReconcileEntries;
  authService: AuthService | undefined;
  userId: ObjectId;
  accountingDb: AccountingDb;
}): Promise<void> {
  const permittedDeptIds = await getAccessibleDeptIdsWithDescendants({
    authService,
    userId,
    db: accountingDb.db,
  });

  // null => unrestricted (SUPER_ADMIN or no authService wired up)
  if (!permittedDeptIds) {
    return;
  }

  const entryIds = (input.entries || []).filter(
    (id): id is string => id != null
  );
  const refundIds = (input.refunds || []).filter(
    (id): id is string => id != null
  );

  if (entryIds.length === 0 && refundIds.length === 0) {
    return;
  }

  const permittedDeptIdStrings = new Set(
    permittedDeptIds.map((id) => id.toString())
  );

  const entryObjectIds = entryIds.map((id) => new ObjectId(id));
  const refundObjectIds = refundIds.map((id) => new ObjectId(id));

  const referencedEntries = await accountingDb.db
    .collection<EntryDbRecord>("entries")
    .find(
      {
        $or: [
          ...(entryObjectIds.length ? [{ _id: { $in: entryObjectIds } }] : []),
          ...(refundObjectIds.length
            ? [{ "refunds.id": { $in: refundObjectIds } }]
            : []),
        ],
      },
      {
        projection: { _id: 1, department: 1, "refunds.id": 1 },
      }
    )
    .toArray();

  const entryById = new Map(
    referencedEntries.map((entry) => [entry._id.toString(), entry])
  );

  for (const id of entryIds) {
    const entry = entryById.get(id);
    const deptId = entry?.department?.[0]?.value?.toString();
    if (!entry || !deptId || !permittedDeptIdStrings.has(deptId)) {
      throw new Error(`Unauthorized: cannot reconcile entry "${id}"`);
    }
  }

  const parentEntryByRefundId = new Map<string, EntryDbRecord>();
  for (const entry of referencedEntries) {
    for (const refund of entry.refunds || []) {
      parentEntryByRefundId.set(refund.id.toString(), entry);
    }
  }

  for (const id of refundIds) {
    const parentEntry = parentEntryByRefundId.get(id);
    const deptId = parentEntry?.department?.[0]?.value?.toString();
    if (!parentEntry || !deptId || !permittedDeptIdStrings.has(deptId)) {
      throw new Error(`Unauthorized: cannot reconcile refund "${id}"`);
    }
  }
}

export const reconcileEntries: MutationResolvers["reconcileEntries"] = async (
  _,
  { input },
  context
) => {
  const { reqDateTime, user, dataSources: { accountingDb }, authService, ipAddress, userAgent } = context;

  if (!user?.id) {
    throw new Error("Unauthorized: Please log in");
  }

  await validateEntry.reconcileEntries({
    reconcileEntries: input,
    accountingDb,
  });

  await assertReconcileAccess({
    input,
    authService,
    userId: user.id,
    accountingDb,
  });

  const docHistory = new DocHistory({ by: user.id, date: reqDateTime });

  const entriesSet = new Set(input.entries || []);
  const refundsSet = new Set(input.refunds || []);

  await Promise.all([
    ...[...entriesSet].map((entry) => {
      const updateBuilder = new UpdateHistoricalDoc<EntryDbRecord>({
        docHistory,
        isRootDoc: true,
      }).updateHistoricalField("reconciled", true);

      const entryUpdate = updateBuilder.valueOf();

      const update = {} as UpdateOne<"entries">;

      if (entryUpdate?.$set) {
        update.$set = {
          ...entryUpdate?.$set,
        };
      }

      if (entryUpdate?.$push) {
        update.$push = {
          ...entryUpdate?.$push,
        };
      }

      return accountingDb.updateOne({
        collection: "entries",
        filter: { _id: new ObjectId(entry) },
        update,
      });
    }),
    ...[...refundsSet].map((refund) => {
      const updateBuilder = new UpdateHistoricalDoc<
        EntryRefundDbRecord,
        "refunds.$"
      >({
        docHistory,
        isRootDoc: true,
        fieldPrefix: "refunds.$",
      }).updateHistoricalField("reconciled", true);

      return accountingDb.updateOne({
        collection: "entries",
        filter: {
          "refunds.id": new ObjectId(refund),
        },
        update: updateBuilder.valueOf(),
      });
    }),
  ]);

  // Log audit entries for reconciliation
  if (authService) {
    if (entriesSet.size > 0) {
      await authService.logAudit({
        userId: user.id,
        action: "RECONCILE",
        resourceType: "Entry",
        details: {
          entryIds: [...entriesSet],
          count: entriesSet.size,
        },
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });
    }
    if (refundsSet.size > 0) {
      await authService.logAudit({
        userId: user.id,
        action: "RECONCILE",
        resourceType: "Refund",
        details: {
          refundIds: [...refundsSet],
          count: refundsSet.size,
        },
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });
    }
  }

  return {
    reconciledEntries: input.entries?.length
      ? await accountingDb.find({
          collection: "entries",
          filter: {
            _id: { $in: [...entriesSet].map((id) => new ObjectId(id)) },
          },
        })
      : [],
    reconciledRefunds: input.refunds?.length
      ? (
          await accountingDb.find({
            collection: "entries",
            filter: {
              "refunds.id": {
                $in: [...refundsSet].map((id) => new ObjectId(id)),
              },
            },
            options: {
              projection: {
                refunds: true,
              },
            },
          })
        ).reduce((reconciledRefunds, { refunds }) => {
          reconciledRefunds.push(
            ...refunds.filter(({ id }) => refundsSet.has(id.toHexString()))
          );

          return reconciledRefunds;
        }, [] as EntryRefundDbRecord[])
      : [],
  };
};
