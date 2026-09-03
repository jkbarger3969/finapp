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
import { deleteEntryRefund } from "./deleteEntryRefund";
import { entryRefunds } from "./entryRefunds";

describe("entryRefunds", () => {
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
    await addNewEntryRefund(
      {},
      {
        input: {
          entry: entryB._id.toHexString(),
          date: new Date(),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(10, 1),
        },
      },
      adminContext
    );
  });

  afterAll(async () => {
    await stopTestEnv(env);
  });

  it("scopes results to the caller's accessible departments", async () => {
    const results = await entryRefunds(
      {},
      { where: undefined, entriesWhere: undefined },
      buildContext(env, deptAUserId)
    );

    expect(results).toHaveLength(1);
    expect(results[0].total[0].value.n).toBe(20);
  });

  it("returns refunds across all departments for SUPER_ADMIN", async () => {
    const results = await entryRefunds(
      {},
      { where: undefined, entriesWhere: undefined },
      buildContext(env, superAdminId)
    );

    expect(results).toHaveLength(2);
  });

  it("returns nothing for a user with no department access", async () => {
    const noAccessUserId = await createUser(env.db, {
      email: "noaccess@test.com",
      role: "USER",
    });

    const results = await entryRefunds(
      {},
      { where: undefined, entriesWhere: undefined },
      buildContext(env, noAccessUserId)
    );

    expect(results).toHaveLength(0);
  });

  describe("soft-deleted refunds", () => {
    // Real bug this guards against: this query is what powers the
    // Unreconciled work queue. Before this default existed, a caller that
    // forgot to filter `deleted` (unlike Unreconciled.tsx, which already
    // does) would see an already-deleted refund forever - indistinguishable
    // from a real pending item needing action.
    let deletedRefundEntryId: ObjectId;

    beforeAll(async () => {
      const adminContext = buildContext(env, superAdminId);
      const { newEntry } = await addNewEntry(
        {},
        {
          input: {
            date: new Date(),
            department: deptA.toHexString(),
            category: category.toHexString(),
            paymentMethod: { cash: { currency: "USD" } },
            total: new Fraction(200, 1),
            source: { business: { name: "Vendor C" } },
          },
        },
        adminContext
      );
      deletedRefundEntryId = newEntry._id;

      const { newEntryRefund } = await addNewEntryRefund(
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

      await deleteEntryRefund({}, { id: newEntryRefund.id.toHexString() }, adminContext);
    });

    it("excludes soft-deleted refunds by default", async () => {
      const results = await entryRefunds(
        {},
        { where: undefined, entriesWhere: undefined },
        buildContext(env, superAdminId)
      );

      expect(results.some((r) => r.total[0].value.n === 30)).toBe(false);
    });

    it("still includes soft-deleted refunds when explicitly requested", async () => {
      const results = await entryRefunds(
        {},
        { where: { deleted: true }, entriesWhere: undefined },
        buildContext(env, superAdminId)
      );

      expect(results.some((r) => r.total[0].value.n === 30)).toBe(true);
    });
  });
});
