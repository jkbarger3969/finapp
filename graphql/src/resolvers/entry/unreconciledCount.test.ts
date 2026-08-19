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
import { addNewEntryRefund } from "./addNewEntryRefund";
import { reconcileEntries } from "./reconcileEntries";
import { unreconciledCount } from "./unreconciledCount";

describe("unreconciledCount", () => {
  let env: TestEnv;
  let deptA: ObjectId;
  let deptB: ObjectId;
  let category: ObjectId;
  let superAdminId: ObjectId;
  let deptAUserId: ObjectId;

  beforeAll(async () => {
    env = await startTestEnv();

    deptA = await createDepartment(env.db, { name: "Dept A" });
    deptB = await createDepartment(env.db, { name: "Dept B" });
    category = await createCategory(env.db, { name: "Supplies", type: "Debit" });

    superAdminId = await createUser(env.db, {
      email: "admin@test.com",
      role: "SUPER_ADMIN",
    });
    deptAUserId = await createUser(env.db, {
      email: "deptA@test.com",
      role: "USER",
    });
    await grantDeptAccess(env.db, { userId: deptAUserId, departmentId: deptA });

    const adminContext = buildContext(env, superAdminId);

    // Dept A: one reconciled entry with one unreconciled refund on it - this
    // is exactly the "buried" case this feature exists to surface.
    const { newEntry: entryA } = await addNewEntry(
      {},
      {
        input: {
          date: new Date(),
          department: deptA.toHexString(),
          category: category.toHexString(),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(100, 1),
          source: { business: { name: "Vendor A" } },
        },
      },
      adminContext
    );
    await addNewEntryRefund(
      {},
      {
        input: {
          entry: entryA._id.toHexString(),
          date: new Date(),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(20, 1),
        },
      },
      adminContext
    );
    await reconcileEntries(
      {},
      { input: { entries: [entryA._id.toHexString()], refunds: [] } },
      adminContext
    );

    // Dept A: one plain unreconciled entry, no refund.
    await addNewEntry(
      {},
      {
        input: {
          date: new Date(),
          department: deptA.toHexString(),
          category: category.toHexString(),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(15, 1),
          source: { business: { name: "Vendor A" } },
        },
      },
      adminContext
    );

    // Dept B: one unreconciled entry - out of deptAUser's access.
    await addNewEntry(
      {},
      {
        input: {
          date: new Date(),
          department: deptB.toHexString(),
          category: category.toHexString(),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(50, 1),
          source: { business: { name: "Vendor B" } },
        },
      },
      adminContext
    );
  });

  afterAll(async () => {
    await stopTestEnv(env);
  });

  it("counts unreconciled entries plus unreconciled refunds on reconciled entries, scoped to accessible departments", async () => {
    const count = await unreconciledCount({}, {}, buildContext(env, deptAUserId));
    // 1 unreconciled refund (on the reconciled dept-A entry) + 1 unreconciled
    // plain dept-A entry. Dept B's unreconciled entry is out of scope.
    expect(count).toBe(2);
  });

  it("counts across all departments for SUPER_ADMIN", async () => {
    const count = await unreconciledCount({}, {}, buildContext(env, superAdminId));
    expect(count).toBe(3);
  });
});
