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

describe("entriesSummary - nets refunds into the fiscal year they happened in, not their parent purchase's year", () => {
  // Real bug this guards against (Missions > Local Missions > Equipment
  // Expense, FY2025-2026): a purchase from a prior fiscal year was surfaced
  // into this year's Transactions view because it had refunds recorded this
  // year (the entries.fiscalYearRefundVisibility fix) - but entriesSummary
  // then summed the purchase's FULL original total into this year's balance
  // on top of that, while the refunds themselves weren't netted in at all,
  // wildly overstating the negative balance.
  let env: TestEnv;
  let dept: ObjectId;
  let category: ObjectId;
  let adminId: ObjectId;
  let fyPrior: ObjectId;
  let fyCurrent: ObjectId;
  let purchaseId: ObjectId;

  beforeAll(async () => {
    env = await startTestEnv();
    dept = await createDepartment(env.db, { name: "Local Missions" });
    category = await createCategory(env.db, { name: "Equipment Expense", type: "Debit" });
    adminId = await createUser(env.db, { email: "admin@test.com", role: "SUPER_ADMIN" });

    fyPrior = new ObjectId();
    fyCurrent = new ObjectId();
    await env.db.collection("fiscalYears").insertMany([
      { _id: fyPrior, name: "FY2024-2025", begin: new Date("2024-09-01"), end: new Date("2025-09-01") },
      { _id: fyCurrent, name: "FY2025-2026", begin: new Date("2025-09-01"), end: new Date("2026-09-01") },
    ]);

    const adminContext = buildContext(env, adminId);

    // "Awning for Coffee Trailer - Gray" - purchased in the prior fiscal
    // year, refunded twice in the current one.
    const { newEntry } = await addNewEntry(
      {},
      {
        input: {
          date: new Date("2025-08-18"), // FY2024-2025
          department: dept.toHexString(),
          category: category.toHexString(),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(78999, 100),
          source: { business: { name: "Awning Co" } },
        },
      },
      adminContext
    );
    purchaseId = newEntry._id;

    await addNewEntryRefund(
      {},
      {
        input: {
          entry: purchaseId.toHexString(),
          date: new Date("2025-09-17"), // FY2025-2026
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(9900, 100),
        },
      },
      adminContext
    );
    await addNewEntryRefund(
      {},
      {
        input: {
          entry: purchaseId.toHexString(),
          date: new Date("2025-09-25"), // FY2025-2026
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(53000, 100),
        },
      },
      adminContext
    );

    // "Coffee Cart - Milk Frother" - a normal, unrelated current-year expense.
    await addNewEntry(
      {},
      {
        input: {
          date: new Date("2026-07-22"), // FY2025-2026
          department: dept.toHexString(),
          category: category.toHexString(),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(949, 100),
          source: { business: { name: "Kitchen Supply Co" } },
        },
      },
      adminContext
    );
  });

  afterAll(async () => {
    await stopTestEnv(env);
  });

  it("does not net the out-of-year refunds into the purchase's own fiscal year", async () => {
    const adminContext = buildContext(env, adminId);
    const summary = await entriesSummary(
      {},
      { where: { fiscalYear: { id: { eq: fyPrior.toHexString() } } } },
      adminContext
    );
    expect(summary.count).toBe(1);
    expect(summary.balance).toBeCloseTo(-789.99, 2);
  });

  it("excludes the prior-year purchase's own total but nets in its refunds for the year they occurred", async () => {
    const adminContext = buildContext(env, adminId);
    const summary = await entriesSummary(
      {},
      { where: { fiscalYear: { id: { eq: fyCurrent.toHexString() } } } },
      adminContext
    );
    // Still 2 visible rows: the Milk Frother (own date) + the Awning
    // (surfaced via its qualifying refunds).
    expect(summary.count).toBe(2);
    // -9.49 (Milk Frother) + 99.00 + 530.00 (both refunds) = 619.51
    expect(summary.balance).toBeCloseTo(619.51, 2);
  });
});
