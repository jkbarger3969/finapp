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
import { departmentBudgetSummaries } from "./departmentBudgetSummaries";

describe("departmentBudgetSummaries - respects dateOfRecord/overrideFiscalYear", () => {
  let env: TestEnv;
  let dept: ObjectId;
  let debitCategory: ObjectId;
  let adminId: ObjectId;
  let fy24: ObjectId;
  let fy25: ObjectId;

  beforeAll(async () => {
    env = await startTestEnv();
    dept = await createDepartment(env.db, { name: "Missions" });
    debitCategory = await createCategory(env.db, { name: "Supplies", type: "Debit" });
    adminId = await createUser(env.db, { email: "admin@test.com", role: "SUPER_ADMIN" });

    fy24 = new ObjectId();
    fy25 = new ObjectId();
    await env.db.collection("fiscalYears").insertMany([
      { _id: fy24, name: "FY24", begin: new Date("2023-09-01"), end: new Date("2024-09-01") },
      { _id: fy25, name: "FY25", begin: new Date("2024-09-01"), end: new Date("2025-09-01") },
    ]);

    const adminContext = buildContext(env, adminId);

    // Ordered/entered in FY24, but posted (per the bank/vendor) in FY25, with
    // "use posted date for fiscal year" checked - should count against FY25.
    await addNewEntry(
      {},
      {
        input: {
          date: new Date("2024-08-15"),
          department: dept.toHexString(),
          category: debitCategory.toHexString(),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(100, 1),
          source: { business: { name: "Vendor" } },
          dateOfRecord: { date: new Date("2024-09-15"), overrideFiscalYear: true },
        },
      },
      adminContext
    );
  });

  afterAll(async () => {
    await stopTestEnv(env);
  });

  it("does not count the entry against the fiscal year its transaction date falls in", async () => {
    const adminContext = buildContext(env, adminId);
    const result = await departmentBudgetSummaries({}, { fiscalYearId: fy24.toHexString() }, adminContext);

    const row = result.find((r) => r.id === dept.toHexString());
    expect(row?.spent ?? 0).toBe(0);
  });

  it("counts the entry against the fiscal year its posted date falls in", async () => {
    const adminContext = buildContext(env, adminId);
    const result = await departmentBudgetSummaries({}, { fiscalYearId: fy25.toHexString() }, adminContext);

    const row = result.find((r) => r.id === dept.toHexString());
    expect(row?.spent).toBe(100);
  });
});
