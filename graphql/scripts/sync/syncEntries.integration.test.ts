import { MongoClient, ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { RefIdMaps } from "./remapReferences";
import { syncEntries } from "./syncEntries";

const h = <T>(value: T) => ({ value, createdBy: new ObjectId(), createdOn: new Date() });

describe("syncEntries (two independent Mongo instances)", () => {
  let sourceServer: MongoMemoryServer;
  let targetServer: MongoMemoryServer;
  let sourceClient: MongoClient;
  let targetClient: MongoClient;

  const oldCategoryId = new ObjectId();
  const newCategoryId = new ObjectId();
  const oldDepartmentId = new ObjectId();
  const newDepartmentId = new ObjectId();
  const unmappedCategoryId = new ObjectId();

  const idMaps: RefIdMaps = {
    categories: new Map([[oldCategoryId.toHexString(), newCategoryId]]),
    departments: new Map([[oldDepartmentId.toHexString(), newDepartmentId]]),
    accounts: new Map(),
  };

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
    await sourceClient.db("accounting").collection("entries").deleteMany({});
    await targetClient.db("accounting").collection("entries").deleteMany({});
  });

  it("dry-run computes decisions but writes nothing to the target", async () => {
    const sourceDb = sourceClient.db("accounting");
    const targetDb = targetClient.db("accounting");
    const entryId = new ObjectId();

    await sourceDb.collection("entries").insertOne({
      _id: entryId,
      lastUpdate: new Date("2024-01-01"),
      createdOn: new Date("2024-01-01"),
      createdBy: new ObjectId(),
      category: [h(oldCategoryId)],
      department: [h(oldDepartmentId)],
      date: [h(new Date("2024-01-01"))],
      deleted: [h(false)],
      reconciled: [h(false)],
      total: [h({ s: 1, n: 100, d: 1 })],
    });

    const report = await syncEntries({ sourceDb, targetDb, idMaps, dryRun: true });

    expect(report.inserted).toBe(1);
    expect(await targetDb.collection("entries").countDocuments()).toBe(0);
  });

  it("apply inserts with the original _id preserved and references remapped", async () => {
    const sourceDb = sourceClient.db("accounting");
    const targetDb = targetClient.db("accounting");
    const entryId = new ObjectId();

    await sourceDb.collection("entries").insertOne({
      _id: entryId,
      lastUpdate: new Date("2024-01-01"),
      createdOn: new Date("2024-01-01"),
      createdBy: new ObjectId(),
      category: [h(oldCategoryId)],
      department: [h(oldDepartmentId)],
      date: [h(new Date("2024-01-01"))],
      deleted: [h(false)],
      reconciled: [h(false)],
      total: [h({ s: 1, n: 100, d: 1 })],
    });

    const report = await syncEntries({ sourceDb, targetDb, idMaps, dryRun: false });
    expect(report.inserted).toBe(1);

    const copied = await targetDb.collection("entries").findOne({ _id: entryId });
    expect(copied).not.toBeNull();
    expect(copied!.category[0].value).toEqual(newCategoryId);
    expect(copied!.department[0].value).toEqual(newDepartmentId);
  });

  it("re-running the same sync never creates a duplicate and reports the doc as unchanged", async () => {
    const sourceDb = sourceClient.db("accounting");
    const targetDb = targetClient.db("accounting");
    const entryId = new ObjectId();

    await sourceDb.collection("entries").insertOne({
      _id: entryId,
      lastUpdate: new Date("2024-01-01"),
      createdOn: new Date("2024-01-01"),
      createdBy: new ObjectId(),
      category: [h(oldCategoryId)],
      date: [h(new Date("2024-01-01"))],
      deleted: [h(false)],
      reconciled: [h(false)],
      total: [h({ s: 1, n: 100, d: 1 })],
    });

    await syncEntries({ sourceDb, targetDb, idMaps, dryRun: false });
    const secondReport = await syncEntries({ sourceDb, targetDb, idMaps, dryRun: false });

    expect(secondReport.inserted).toBe(0);
    expect(secondReport.updated).toBe(0);
    expect(secondReport.unchanged).toBe(1);
    expect(await targetDb.collection("entries").countDocuments({ _id: entryId })).toBe(1);
  });

  it("a source-side edit (new lastUpdate) is applied as an update, not a duplicate", async () => {
    const sourceDb = sourceClient.db("accounting");
    const targetDb = targetClient.db("accounting");
    const entryId = new ObjectId();

    await sourceDb.collection("entries").insertOne({
      _id: entryId,
      lastUpdate: new Date("2024-01-01"),
      createdOn: new Date("2024-01-01"),
      createdBy: new ObjectId(),
      category: [h(oldCategoryId)],
      total: [h({ s: 1, n: 100, d: 1 })],
    });
    await syncEntries({ sourceDb, targetDb, idMaps, dryRun: false });

    await sourceDb.collection("entries").updateOne(
      { _id: entryId },
      {
        $set: { lastUpdate: new Date("2024-02-01") },
        $push: { total: { $each: [h({ s: 1, n: 250, d: 1 })], $position: 0 } },
      }
    );

    const report = await syncEntries({ sourceDb, targetDb, idMaps, dryRun: false });

    expect(report.updated).toBe(1);
    expect(await targetDb.collection("entries").countDocuments({ _id: entryId })).toBe(1);
    const updated = await targetDb.collection("entries").findOne({ _id: entryId });
    expect(updated!.total[0].value.n).toBe(250);
  });

  it("leaves an unresolved category reference as-is and reports it, rather than dropping the doc", async () => {
    const sourceDb = sourceClient.db("accounting");
    const targetDb = targetClient.db("accounting");
    const entryId = new ObjectId();

    await sourceDb.collection("entries").insertOne({
      _id: entryId,
      lastUpdate: new Date("2024-01-01"),
      createdOn: new Date("2024-01-01"),
      createdBy: new ObjectId(),
      category: [h(unmappedCategoryId)],
      total: [h({ s: 1, n: 100, d: 1 })],
    });

    const report = await syncEntries({ sourceDb, targetDb, idMaps, dryRun: false });

    expect(report.inserted).toBe(1);
    expect(report.unresolvedRefCount).toBe(1);
    const copied = await targetDb.collection("entries").findOne({ _id: entryId });
    expect(copied!.category[0].value).toEqual(unmappedCategoryId);
  });

  it("`since` only pulls entries updated after the given checkpoint", async () => {
    const sourceDb = sourceClient.db("accounting");
    const targetDb = targetClient.db("accounting");

    await sourceDb.collection("entries").insertMany([
      {
        _id: new ObjectId(),
        lastUpdate: new Date("2024-01-01"),
        createdOn: new Date("2024-01-01"),
        createdBy: new ObjectId(),
        total: [h({ s: 1, n: 1, d: 1 })],
      },
      {
        _id: new ObjectId(),
        lastUpdate: new Date("2024-06-01"),
        createdOn: new Date("2024-06-01"),
        createdBy: new ObjectId(),
        total: [h({ s: 1, n: 2, d: 1 })],
      },
    ]);

    const report = await syncEntries({
      sourceDb,
      targetDb,
      idMaps,
      since: new Date("2024-03-01"),
      dryRun: false,
    });

    expect(report.inserted).toBe(1);
    expect(await targetDb.collection("entries").countDocuments()).toBe(1);
  });
});
