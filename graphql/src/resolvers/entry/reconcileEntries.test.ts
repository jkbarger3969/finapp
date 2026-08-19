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

describe("reconcileEntries", () => {
  let env: TestEnv;
  let deptA: ObjectId;
  let deptB: ObjectId;
  let category: ObjectId;
  let superAdminId: ObjectId;
  let deptAUserId: ObjectId;
  let entryAId: ObjectId;
  let entryBId: ObjectId;
  let refundBId: ObjectId;

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
    entryAId = entryA._id;

    const { newEntry: entryB } = await addNewEntry(
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
    entryBId = entryB._id;

    const { newEntryRefund } = await addNewEntryRefund(
      {},
      {
        input: {
          entry: entryBId.toHexString(),
          date: new Date(),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(10, 1),
        },
      },
      adminContext
    );
    refundBId = newEntryRefund.id;
  });

  afterAll(async () => {
    await stopTestEnv(env);
  });

  it("rejects reconciling an entry outside the caller's accessible departments", async () => {
    await expect(
      reconcileEntries(
        {},
        { input: { entries: [entryBId.toHexString()], refunds: [] } },
        buildContext(env, deptAUserId)
      )
    ).rejects.toThrow(/Unauthorized/);

    const entry = await env.db
      .collection("entries")
      .findOne({ _id: entryBId });
    expect(entry!.reconciled[0].value).toBe(false);
  });

  it("rejects reconciling a refund whose parent entry is outside the caller's access", async () => {
    await expect(
      reconcileEntries(
        {},
        { input: { entries: [], refunds: [refundBId.toHexString()] } },
        buildContext(env, deptAUserId)
      )
    ).rejects.toThrow(/Unauthorized/);

    const entry = await env.db
      .collection("entries")
      .findOne({ _id: entryBId });
    const refund = entry!.refunds.find((r: any) => r.id.equals(refundBId));
    expect(refund.reconciled[0].value).toBe(false);
  });

  it("allows reconciling an entry within the caller's accessible departments", async () => {
    await reconcileEntries(
      {},
      { input: { entries: [entryAId.toHexString()], refunds: [] } },
      buildContext(env, deptAUserId)
    );

    const entry = await env.db
      .collection("entries")
      .findOne({ _id: entryAId });
    expect(entry!.reconciled[0].value).toBe(true);
  });

  it("allows SUPER_ADMIN to reconcile across all departments", async () => {
    await reconcileEntries(
      {},
      { input: { entries: [entryBId.toHexString()], refunds: [refundBId.toHexString()] } },
      buildContext(env, superAdminId)
    );

    const entry = await env.db
      .collection("entries")
      .findOne({ _id: entryBId });
    expect(entry!.reconciled[0].value).toBe(true);
    const refund = entry!.refunds.find((r: any) => r.id.equals(refundBId));
    expect(refund.reconciled[0].value).toBe(true);
  });
});
