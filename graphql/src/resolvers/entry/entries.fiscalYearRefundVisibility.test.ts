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
import { entries } from "./entries";

describe("entries - surfaces a purchase whose refund (not the purchase itself) falls in the fiscal year", () => {
  // Real bug this guards against: a purchase made in FY24, refunded in FY25,
  // was invisible when browsing FY25 in Transactions - the fiscal-year
  // filter only ever checked the entry's own date, never its refunds' dates.
  // The refund correctly reduced FY25 spending in the budget summary, but
  // the transaction itself couldn't be found there to explain why.
  let env: TestEnv;
  let dept: ObjectId;
  let category: ObjectId;
  let adminId: ObjectId;
  let fy24: ObjectId;
  let fy25: ObjectId;
  let purchaseId: ObjectId;

  beforeAll(async () => {
    env = await startTestEnv();
    dept = await createDepartment(env.db, { name: "Missions Ministry" });
    category = await createCategory(env.db, { name: "Fundraiser Expense", type: "Debit" });
    adminId = await createUser(env.db, { email: "admin@test.com", role: "SUPER_ADMIN" });

    fy24 = new ObjectId();
    fy25 = new ObjectId();
    await env.db.collection("fiscalYears").insertMany([
      { _id: fy24, name: "FY24", begin: new Date("2023-09-01"), end: new Date("2024-09-01") },
      { _id: fy25, name: "FY25", begin: new Date("2024-09-01"), end: new Date("2025-09-01") },
    ]);

    const adminContext = buildContext(env, adminId);

    const { newEntry } = await addNewEntry(
      {},
      {
        input: {
          date: new Date("2024-08-04"), // FY24
          department: dept.toHexString(),
          category: category.toHexString(),
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(14350, 1),
          source: { business: { name: "Assembly of God World Missions" } },
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
          date: new Date("2024-09-02"), // FY25 - the refund happens the year after the purchase
          paymentMethod: { cash: { currency: "USD" } },
          total: new Fraction(14350, 1),
        },
      },
      adminContext
    );
  });

  afterAll(async () => {
    await stopTestEnv(env);
  });

  it("does not appear when browsing the fiscal year the purchase was made in isn't queried for refund reasons alone", async () => {
    // Sanity check: the purchase itself is correctly found in FY24 (its own year).
    const adminContext = buildContext(env, adminId);
    const result = await entries(
      {},
      { where: { fiscalYear: { id: { eq: fy24.toHexString() } } }, limit: 50, offset: 0 },
      adminContext
    );
    expect(result.some((e: any) => e._id.equals(purchaseId))).toBe(true);
  });

  it("also appears when browsing the fiscal year its refund happened in", async () => {
    const adminContext = buildContext(env, adminId);
    const result = await entries(
      {},
      { where: { fiscalYear: { id: { eq: fy25.toHexString() } } }, limit: 50, offset: 0 },
      adminContext
    );
    expect(result.some((e: any) => e._id.equals(purchaseId))).toBe(true);
  });
});
