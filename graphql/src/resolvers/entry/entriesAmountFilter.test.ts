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
import { entries } from "./entries";

// The `total` resolver returns a Rational history array; extract the current amount.
const amountOf = (entry: any) => entry.total[0].value.n / entry.total[0].value.d;

describe("entries - amount range filter", () => {
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

    const adminContext = buildContext(env, adminId);

    for (const amount of [10, 25, 50, 100]) {
      await addNewEntry(
        {},
        {
          input: {
            date: new Date(),
            department: dept.toHexString(),
            category: debitCategory.toHexString(),
            paymentMethod: { cash: { currency: "USD" } },
            total: new Fraction(amount, 1),
            source: { business: { name: `Vendor $${amount}` } },
          },
        },
        adminContext
      );
    }
  });

  afterAll(async () => {
    await stopTestEnv(env);
  });

  it("filters entries within a min/max amount range", async () => {
    const adminContext = buildContext(env, adminId);

    const result = await entries(
      {},
      {
        where: {
          department: { id: { eq: dept.toHexString() } },
          total: { gte: new Fraction(20), lte: new Fraction(60) },
        } as any,
      },
      adminContext
    );

    expect(result.map(amountOf).sort((a, b) => a - b)).toEqual([25, 50]);
  });

  it("filters entries by a minimum amount only", async () => {
    const adminContext = buildContext(env, adminId);

    const result = await entries(
      {},
      {
        where: {
          department: { id: { eq: dept.toHexString() } },
          total: { gte: new Fraction(50) },
        } as any,
      },
      adminContext
    );

    expect(result.map(amountOf).sort((a, b) => a - b)).toEqual([50, 100]);
  });

  it("filters entries by a maximum amount only", async () => {
    const adminContext = buildContext(env, adminId);

    const result = await entries(
      {},
      {
        where: {
          department: { id: { eq: dept.toHexString() } },
          total: { lte: new Fraction(25) },
        } as any,
      },
      adminContext
    );

    expect(result.map(amountOf).sort((a, b) => a - b)).toEqual([10, 25]);
  });

  it("filters entries by an exact amount", async () => {
    const adminContext = buildContext(env, adminId);

    const result = await entries(
      {},
      {
        where: {
          department: { id: { eq: dept.toHexString() } },
          total: { eq: new Fraction(25) },
        } as any,
      },
      adminContext
    );

    expect(result).toHaveLength(1);
    expect(amountOf(result[0])).toBe(25);
  });

  it("returns nothing for a range outside all entries", async () => {
    const adminContext = buildContext(env, adminId);

    const result = await entries(
      {},
      {
        where: {
          department: { id: { eq: dept.toHexString() } },
          total: { gte: new Fraction(1000), lte: new Fraction(2000) },
        } as any,
      },
      adminContext
    );

    expect(result).toHaveLength(0);
  });
});
