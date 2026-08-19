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

describe("entriesSummary - refund balance regression", () => {
  let env: TestEnv;
  let dept: ObjectId;
  let debitCategory: ObjectId;
  let adminId: ObjectId;

  beforeAll(async () => {
    env = await startTestEnv();
    dept = await createDepartment(env.db, { name: "Maintenance" });
    debitCategory = await createCategory(env.db, {
      name: "Repairs",
      type: "Debit",
    });
    adminId = await createUser(env.db, {
      email: "admin@test.com",
      role: "SUPER_ADMIN",
    });
  });

  afterAll(async () => {
    await stopTestEnv(env);
  });

  it("applies an unreconciled refund to the balance immediately, without requiring it be reconciled first", async () => {
    const adminContext = buildContext(env, adminId);

    const { newEntry } = await addNewEntry(
      {},
      {
        input: {
          date: new Date(),
          department: dept.toHexString(),
          category: debitCategory.toHexString(),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(100, 1),
          source: { business: { name: "Vendor" } },
        },
      },
      adminContext
    );

    const before = await entriesSummary(
      {},
      { where: { department: { id: { eq: dept.toHexString() } } } },
      adminContext
    );
    // A $100 debit entry reduces balance by 100.
    expect(before.balance).toBe(-100);

    // Refund left at its default (unreconciled).
    await addNewEntryRefund(
      {},
      {
        input: {
          entry: newEntry._id.toHexString(),
          date: new Date(),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(30, 1),
        },
      },
      adminContext
    );

    const after = await entriesSummary(
      {},
      { where: { department: { id: { eq: dept.toHexString() } } } },
      adminContext
    );

    // A debit refund adds back to balance: -100 + 30 = -70, immediately,
    // with no reconcile step required.
    expect(after.balance).toBe(-70);
  });
});
