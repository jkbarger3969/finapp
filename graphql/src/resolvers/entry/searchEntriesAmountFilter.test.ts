import { ObjectId } from "mongodb";
import Fraction from "fraction.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  TestEnv,
  buildContext,
  createCategory,
  createDepartment,
  createUser,
  grantDeptAccess,
  startTestEnv,
  stopTestEnv,
} from "../../test/testDb";
import { addNewEntry } from "./addNewEntry";
import { searchEntries } from "./entries";

describe("searchEntries - amount matching (Dashboard search)", () => {
  let env: TestEnv;
  let dept: ObjectId;
  let otherDept: ObjectId;
  let debitCategory: ObjectId;
  let adminId: ObjectId;
  let limitedUserId: ObjectId;

  beforeAll(async () => {
    env = await startTestEnv();
    dept = await createDepartment(env.db, { name: "Maintenance" });
    otherDept = await createDepartment(env.db, { name: "IT" });
    debitCategory = await createCategory(env.db, { name: "Repairs", type: "Debit" });
    adminId = await createUser(env.db, { email: "admin@test.com", role: "SUPER_ADMIN" });
    limitedUserId = await createUser(env.db, { email: "limited@test.com", role: "USER" });
    await grantDeptAccess(env.db, { userId: limitedUserId, departmentId: dept });

    const adminContext = buildContext(env, adminId);

    for (const [amount, department, description] of [
      [10, dept, "Hardware store"],
      [25, dept, "Plumbing supplies"],
      [50, dept, "Electrician visit"],
      [50, otherDept, "Software license"],
    ] as const) {
      await addNewEntry(
        {},
        {
          input: {
            date: new Date(),
            department: department.toHexString(),
            category: debitCategory.toHexString(),
            paymentMethod: { cash: { currency: "USD" } },
            total: new Fraction(amount, 1),
            source: { business: { name: description } },
            description,
          },
        },
        adminContext
      );
    }
  });

  afterAll(async () => {
    await stopTestEnv(env);
  });

  it("matches entries by an exact dollar amount typed into the search box", async () => {
    const adminContext = buildContext(env, adminId);

    const result = await searchEntries({}, { query: "50", limit: 50 }, adminContext);

    expect(result).toHaveLength(2);
    expect(result.map((e: any) => e.total[0].value)).toEqual([
      { s: 1, n: 50, d: 1 },
      { s: 1, n: 50, d: 1 },
    ]);
  });

  it("matches entries by an amount with cents formatting", async () => {
    const adminContext = buildContext(env, adminId);

    const result = await searchEntries({}, { query: "25.00", limit: 50 }, adminContext);

    expect(result).toHaveLength(1);
    expect(result[0].total[0].value).toEqual({ s: 1, n: 25, d: 1 });
  });

  it("still matches by description text (regression)", async () => {
    const adminContext = buildContext(env, adminId);

    const result = await searchEntries({}, { query: "Hardware", limit: 50 }, adminContext);

    expect(result).toHaveLength(1);
  });

  it("restricts amount matches to departments the user has access to", async () => {
    const limitedContext = buildContext(env, limitedUserId);

    // Two $50 entries exist total, but this user can only see `dept`, not `otherDept`.
    const result = await searchEntries({}, { query: "50", limit: 50 }, limitedContext);

    expect(result).toHaveLength(1);
  });

  it("does not treat a non-numeric query as an amount search", async () => {
    const adminContext = buildContext(env, adminId);

    const result = await searchEntries({}, { query: "not-an-amount", limit: 50 }, adminContext);

    expect(result).toHaveLength(0);
  });
});
