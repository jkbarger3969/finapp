import { MongoClient, ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { mapReferenceData } from "./mapReferenceData";

describe("mapReferenceData (two independent Mongo instances)", () => {
  let sourceServer: MongoMemoryServer;
  let targetServer: MongoMemoryServer;
  let sourceClient: MongoClient;
  let targetClient: MongoClient;

  beforeAll(async () => {
    sourceServer = await MongoMemoryServer.create();
    targetServer = await MongoMemoryServer.create();
    sourceClient = new MongoClient(sourceServer.getUri());
    targetClient = new MongoClient(targetServer.getUri());
    await sourceClient.connect();
    await targetClient.connect();
  }, 60000);

  afterAll(async () => {
    await sourceClient.close();
    await targetClient.close();
    await sourceServer.stop();
    await targetServer.stop();
  });

  beforeEach(async () => {
    for (const collection of ["categories", "departments", "accounts", "fiscalYears"]) {
      await sourceClient.db("accounting").collection(collection).deleteMany({});
      await targetClient.db("accounting").collection(collection).deleteMany({});
    }
  });

  it("matches by business key when both servers already have the doc", async () => {
    const sourceDb = sourceClient.db("accounting");
    const targetDb = targetClient.db("accounting");

    await sourceDb.collection("accounts").insertOne({ _id: new ObjectId(), name: "Checking" });
    await targetDb.collection("accounts").insertOne({ _id: new ObjectId(), name: "Checking" });

    const { reports } = await mapReferenceData({
      sourceDb,
      targetDb,
      overrides: {},
      dryRun: false,
    });

    const accountsReport = reports.find((r) => r.collection === "accounts")!;
    expect(accountsReport.matched).toBe(1);
    expect(accountsReport.created).toBe(0);
    expect(await targetDb.collection("accounts").countDocuments()).toBe(1);
  });

  it("creates a missing department on the target and fixes up its parent id afterwards", async () => {
    const sourceDb = sourceClient.db("accounting");
    const targetDb = targetClient.db("accounting");

    const oldParentId = new ObjectId();
    const oldChildId = new ObjectId();

    await sourceDb.collection("departments").insertMany([
      { _id: oldParentId, code: "OPS", name: "Operations", parent: { type: "Business", id: new ObjectId() } },
      { _id: oldChildId, code: "IT", name: "IT", parent: { type: "Department", id: oldParentId } },
    ]);

    const { idMap, reports } = await mapReferenceData({
      sourceDb,
      targetDb,
      overrides: {},
      dryRun: false,
    });

    const deptReport = reports.find((r) => r.collection === "departments")!;
    expect(deptReport.created).toBe(2);

    const newParentId = new ObjectId(idMap.departments[oldParentId.toHexString()]);
    const newChildId = new ObjectId(idMap.departments[oldChildId.toHexString()]);

    const childOnTarget = await targetDb.collection("departments").findOne({ _id: newChildId });
    expect(childOnTarget!.parent).toEqual({ type: "Department", id: newParentId });
  });

  it("reports an unmatched doc without creating it in dry-run mode", async () => {
    const sourceDb = sourceClient.db("accounting");
    const targetDb = targetClient.db("accounting");

    await sourceDb.collection("accounts").insertOne({ _id: new ObjectId(), name: "Savings" });

    const { reports } = await mapReferenceData({ sourceDb, targetDb, overrides: {}, dryRun: true });

    const accountsReport = reports.find((r) => r.collection === "accounts")!;
    expect(accountsReport.unmatched).toHaveLength(1);
    expect(await targetDb.collection("accounts").countDocuments()).toBe(0);
  });

  it("flags an ambiguous business key instead of guessing", async () => {
    const sourceDb = sourceClient.db("accounting");
    const targetDb = targetClient.db("accounting");

    await sourceDb.collection("accounts").insertOne({ _id: new ObjectId(), name: "Main" });
    await targetDb.collection("accounts").insertMany([
      { _id: new ObjectId(), name: "Main" },
      { _id: new ObjectId(), name: "Main" },
    ]);

    const { reports } = await mapReferenceData({ sourceDb, targetDb, overrides: {}, dryRun: false });

    const accountsReport = reports.find((r) => r.collection === "accounts")!;
    expect(accountsReport.ambiguous).toHaveLength(1);
    expect(accountsReport.matched).toBe(0);
    expect(accountsReport.created).toBe(0);
  });

  it("a manual override in the input resolves a match without needing a business-key hit", async () => {
    const sourceDb = sourceClient.db("accounting");
    const targetDb = targetClient.db("accounting");

    const oldId = new ObjectId();
    const newId = new ObjectId();
    await sourceDb.collection("fiscalYears").insertOne({
      _id: oldId,
      name: "FY24",
      begin: new Date("2023-07-01"),
      end: new Date("2024-06-30"),
    });
    await targetDb.collection("fiscalYears").insertOne({
      _id: newId,
      name: "FY 2024 (renamed)",
      begin: new Date("2023-07-01"),
      end: new Date("2024-06-30"),
    });

    const { idMap, reports } = await mapReferenceData({
      sourceDb,
      targetDb,
      overrides: { fiscalYears: { [oldId.toHexString()]: newId.toHexString() } },
      dryRun: false,
    });

    const fyReport = reports.find((r) => r.collection === "fiscalYears")!;
    expect(fyReport.created).toBe(0);
    expect(idMap.fiscalYears[oldId.toHexString()]).toBe(newId.toHexString());
  });
});
