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
import { addNewEntry } from "../entry/addNewEntry";
import { addNewEntryRefund } from "../entry/addNewEntryRefund";
import { departmentBudgetSummaries } from "./departmentBudgetSummaries";

describe("departmentBudgetSummaries - refund and fiscal-year regressions", () => {
  let env: TestEnv;
  let dept: ObjectId;
  let debitCategory: ObjectId;
  let adminId: ObjectId;
  let fiscalYearId: ObjectId;

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

    const { insertedId } = await env.db.collection("fiscalYears").insertOne({
      name: "FY2026",
      begin: new Date("2026-01-01T00:00:00Z"),
      end: new Date("2027-01-01T00:00:00Z"),
    });
    fiscalYearId = insertedId;
  });

  afterAll(async () => {
    await stopTestEnv(env);
  });

  it("includes an entry whose overridden dateOfRecord falls in the fiscal year, even though its raw date does not", async () => {
    const adminContext = buildContext(env, adminId);

    // Raw `date` predates the fiscal year, but dateOfRecord overrides it to
    // land inside FY2026 - the spend aggregation should follow dateOfRecord,
    // the same way the refund aggregation already does.
    const { newEntry } = await addNewEntry(
      {},
      {
        input: {
          date: new Date("2025-12-15T00:00:00Z"),
          dateOfRecord: {
            date: new Date("2026-01-15T00:00:00Z"),
            overrideFiscalYear: true,
          },
          department: dept.toHexString(),
          category: debitCategory.toHexString(),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(100, 1),
          source: { business: { name: "Vendor" } },
        },
      },
      adminContext
    );

    const before = await departmentBudgetSummaries(
      {},
      { fiscalYearId: fiscalYearId.toHexString() },
      adminContext
    );
    const deptSummaryBefore = before.find((d) => d.id === dept.toHexString());
    expect(deptSummaryBefore?.spent).toBe(100);

    // Unreconciled refund - should reduce spend immediately per the earlier fix.
    await addNewEntryRefund(
      {},
      {
        input: {
          entry: newEntry._id.toHexString(),
          date: new Date("2026-02-01T00:00:00Z"),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(40, 1),
        },
      },
      adminContext
    );

    const after = await departmentBudgetSummaries(
      {},
      { fiscalYearId: fiscalYearId.toHexString() },
      adminContext
    );
    const deptSummaryAfter = after.find((d) => d.id === dept.toHexString());
    expect(deptSummaryAfter?.spent).toBe(60);
  });
});
