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
import { entriesChartData } from "./entries";

describe("entriesChartData - monthly trends respect dateOfRecord/overrideFiscalYear", () => {
  let env: TestEnv;
  let dept: ObjectId;
  let debitCategory: ObjectId;
  let adminId: ObjectId;

  beforeAll(async () => {
    env = await startTestEnv();
    dept = await createDepartment(env.db, { name: "Facilities" });
    debitCategory = await createCategory(env.db, { name: "Repairs", type: "Debit" });
    adminId = await createUser(env.db, { email: "admin@test.com", role: "SUPER_ADMIN" });

    const adminContext = buildContext(env, adminId);

    // Transaction date in August, posted date in September - "use posted date
    // for fiscal year" checked, so the chart should bucket it under September.
    await addNewEntry(
      {},
      {
        input: {
          date: new Date("2024-08-15"),
          department: dept.toHexString(),
          category: debitCategory.toHexString(),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(250, 1),
          source: { business: { name: "Vendor" } },
          dateOfRecord: { date: new Date("2024-09-20"), overrideFiscalYear: true },
        },
      },
      adminContext
    );
  });

  afterAll(async () => {
    await stopTestEnv(env);
  });

  it("buckets the entry under its posted month, not its transaction-date month", async () => {
    const adminContext = buildContext(env, adminId);
    const result = await entriesChartData({}, { where: undefined } as any, adminContext);

    const august = result.monthlyTrends.find((m: any) => m.month === "Aug 2024");
    const september = result.monthlyTrends.find((m: any) => m.month === "Sep 2024");

    expect(august?.expenses ?? 0).toBe(0);
    expect(september?.expenses).toBe(250);
  });
});
