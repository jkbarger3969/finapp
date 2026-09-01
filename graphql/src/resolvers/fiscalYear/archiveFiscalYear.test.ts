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
import {
  archiveFiscalYear,
  deleteFiscalYear,
  exportFiscalYear,
  restoreFiscalYear,
} from "./archiveFiscalYear";

describe("archiveFiscalYear / restoreFiscalYear / exportFiscalYear / deleteFiscalYear - entries scoping", () => {
  let env: TestEnv;
  let dept: ObjectId;
  let category: ObjectId;
  let adminId: ObjectId;
  let fy: ObjectId;
  let inRangeEntryId: string;
  let overriddenIntoRangeEntryId: string;

  beforeAll(async () => {
    env = await startTestEnv();
    dept = await createDepartment(env.db, { name: "Grounds" });
    category = await createCategory(env.db, { name: "Repairs", type: "Debit" });
    adminId = await createUser(env.db, { email: "admin@test.com", role: "SUPER_ADMIN" });

    fy = new ObjectId();
    await env.db.collection("fiscalYears").insertOne({
      _id: fy,
      name: "FY24",
      begin: new Date("2023-09-01"),
      end: new Date("2024-09-01"),
    });

    const adminContext = buildContext(env, adminId);
    const baseInput = {
      department: dept.toHexString(),
      category: category.toHexString(),
      paymentMethod: { cash: { currency: "USD" } },
      total: new Fraction(50, 1),
      source: { business: { name: "Vendor" } },
    };

    // Entry whose plain transaction date is inside FY24 - should be scoped in.
    const inRange = await addNewEntry(
      {},
      { input: { ...baseInput, date: new Date("2024-01-15") } },
      adminContext
    );
    inRangeEntryId = (inRange.newEntry as any)._id.toHexString();

    // Entry whose transaction date is OUTSIDE FY24 (it's in FY25), but whose
    // posted date is overridden into FY24 - should still be scoped in.
    const overridden = await addNewEntry(
      {},
      {
        input: {
          ...baseInput,
          date: new Date("2024-10-01"),
          dateOfRecord: { date: new Date("2024-08-01"), overrideFiscalYear: true },
        },
      },
      adminContext
    );
    overriddenIntoRangeEntryId = (overridden.newEntry as any)._id.toHexString();

    // Entry entirely outside FY24, no override - should never be scoped in.
    await addNewEntry({}, { input: { ...baseInput, date: new Date("2022-01-01") } }, adminContext);
  });

  afterAll(async () => {
    await stopTestEnv(env);
  });

  it("archiveFiscalYear archives exactly the entries whose effective date falls in the fiscal year", async () => {
    const adminContext = buildContext(env, adminId);
    const result = await archiveFiscalYear({}, { id: fy.toHexString() }, adminContext);

    expect(result.entriesArchived).toBe(2);
  });

  it("exportFiscalYear exports exactly those same entries", async () => {
    const adminContext = buildContext(env, adminId);
    const result = await exportFiscalYear({}, { id: fy.toHexString() }, adminContext);

    const ids = (result.entries as any[]).map((e) => e._id.toHexString()).sort();
    expect(ids).toEqual([inRangeEntryId, overriddenIntoRangeEntryId].sort());
  });

  it("restoreFiscalYear restores exactly those same entries", async () => {
    const adminContext = buildContext(env, adminId);
    const result = await restoreFiscalYear({}, { id: fy.toHexString() }, adminContext);

    expect(result.entriesRestored).toBe(2);
  });

  it("deleteFiscalYear deletes exactly those same entries and leaves the out-of-range one alone", async () => {
    const adminContext = buildContext(env, adminId);
    const result = await deleteFiscalYear({}, { id: fy.toHexString() }, adminContext);

    expect(result.entriesDeleted).toBe(2);

    const remaining = await env.db.collection("entries").find({}).toArray();
    expect(remaining).toHaveLength(1);
  });
});
