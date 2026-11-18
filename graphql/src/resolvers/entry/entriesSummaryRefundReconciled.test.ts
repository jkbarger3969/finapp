import { ObjectId } from "mongodb";
import Fraction from "fraction.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  TestEnv,
  buildContext,
  createCategory,
  createDepartment,
  createUser,
  startTestEnv,
  stopTestEnv,
} from "../../test/testDb";
import { addNewEntry } from "./addNewEntry";
import { addNewEntryRefund } from "./addNewEntryRefund";
import { entriesSummary } from "./entries";
import { updateEntryRefund } from "./updateEntryRefund";

describe("entriesSummary - refunds only net into the balance once reconciled", () => {
  // Real bug this guards against: an unreconciled refund reduced the
  // Transactions page "Balance" the moment it was recorded, even though it
  // hadn't actually cleared the bank yet - and marking the ORIGINAL
  // transaction reconciled had no bearing on this either way, since a
  // refund is reconciled independently of its parent.
  let env: TestEnv;
  let dept: ObjectId;
  let category: ObjectId;
  let adminId: ObjectId;
  let fy: ObjectId;
  let purchaseId: ObjectId;

  beforeAll(async () => {
    env = await startTestEnv();
    dept = await createDepartment(env.db, { name: "Office" });
    category = await createCategory(env.db, { name: "Office Supplies", type: "Debit" });
    adminId = await createUser(env.db, { email: "admin@test.com", role: "SUPER_ADMIN" });

    fy = new ObjectId();
    await env.db.collection("fiscalYears").insertOne({
      _id: fy,
      name: "FY26",
      begin: new Date("2025-09-01"),
      end: new Date("2026-09-01"),
    });

    const adminContext = buildContext(env, adminId);

    const { newEntry } = await addNewEntry(
      {},
      {
        input: {
          date: new Date("2025-10-01"),
          department: dept.toHexString(),
          category: category.toHexString(),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(500, 1),
          source: { business: { name: "Office Depot" } },
          reconciled: true,
        },
      },
      adminContext
    );
    purchaseId = newEntry._id;

    // The original purchase is reconciled, but its refund is not - the two
    // are reconciled independently of each other.
    await addNewEntryRefund(
      {},
      {
        input: {
          entry: purchaseId.toHexString(),
          date: new Date("2025-10-05"),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(100, 1),
          reconciled: false,
        },
      },
      adminContext
    );
  });

  afterAll(async () => {
    await stopTestEnv(env);
  });

  it("filtered by fiscal year: excludes the unreconciled refund from the balance", async () => {
    const adminContext = buildContext(env, adminId);
    const summary = await entriesSummary(
      {},
      { where: { fiscalYear: { id: { eq: fy.toHexString() } } } },
      adminContext
    );
    // Full -$500 purchase; the unreconciled $100 refund doesn't net in yet.
    expect(summary.balance).toBeCloseTo(-500, 2);
  });

  it("not filtered by fiscal year (the legacy/no-date-filter path): also excludes the unreconciled refund", async () => {
    const adminContext = buildContext(env, adminId);
    const summary = await entriesSummary(
      {},
      { where: { department: { id: { eq: dept.toHexString() } } } },
      adminContext
    );
    expect(summary.balance).toBeCloseTo(-500, 2);
  });

  it("nets the refund in once it's reconciled, regardless of the purchase's own status", async () => {
    const adminContext = buildContext(env, adminId);

    const refundsBefore = await env.db
      .collection("entries")
      .findOne({ _id: purchaseId }, { projection: { refunds: 1 } });
    const refundId = refundsBefore!.refunds[0].id;

    await updateEntryRefund(
      {},
      { input: { id: refundId.toString(), reconciled: true } },
      adminContext
    );

    const summary = await entriesSummary(
      {},
      { where: { fiscalYear: { id: { eq: fy.toHexString() } } } },
      adminContext
    );
    // -$500 purchase + $100 reconciled refund netted back in = -$400.
    expect(summary.balance).toBeCloseTo(-400, 2);
  });
});
