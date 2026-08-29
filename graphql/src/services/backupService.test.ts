import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

import { MongoClient, ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  BackupConfig,
  createBackupArchive,
  listBackups,
  restoreFromArchive,
} from "./backupService";

describe("backupService (real mongodump/mongorestore against an in-memory Mongo instance)", () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let config: BackupConfig;
  let workDir: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = new URL(mongoServer.getUri());
    client = new MongoClient(mongoServer.getUri());
    await client.connect();

    workDir = await mkdtemp(path.join(tmpdir(), "finapp-backup-test-"));
    config = {
      dbHost: uri.hostname,
      dbPort: uri.port,
      dbName: "accounting",
      archivesDir: path.join(workDir, "archives"),
      tmpDir: path.join(workDir, "tmp"),
    };
  }, 60000);

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
    await rm(workDir, { recursive: true, force: true });
  });

  afterEach(async () => {
    const db = client.db("accounting");
    for (const name of ["entries", "users", "categories"]) {
      await db.collection(name).deleteMany({});
    }
  });

  it("backs up and restores every collection, including users", async () => {
    const db = client.db("accounting");
    const entryId = new ObjectId();
    const userId = new ObjectId();

    await db.collection("entries").insertOne({ _id: entryId, description: "Original entry" });
    await db.collection("users").insertOne({ _id: userId, email: "admin@test.com", role: "SUPER_ADMIN" });
    await db.collection("categories").insertOne({ name: "Repairs" });

    const backup = await createBackupArchive(config, "manual");
    expect(backup.filename).toMatch(/\.tar\.gz$/);
    expect(backup.label).toBe("manual");
    expect(backup.sizeBytes).toBeGreaterThan(0);

    // Mutate everything after the backup was taken.
    await db.collection("entries").updateOne({ _id: entryId }, { $set: { description: "Changed!" } });
    await db.collection("users").deleteOne({ _id: userId });
    await db.collection("categories").insertOne({ name: "Extra category" });

    const restoreResult = await restoreFromArchive(config, backup.filename);
    expect(restoreResult.success).toBe(true);
    expect(restoreResult.restoredFrom).toBe(backup.filename);

    const restoredEntry = await db.collection("entries").findOne({ _id: entryId });
    expect(restoredEntry?.description).toBe("Original entry");

    const restoredUser = await db.collection("users").findOne({ _id: userId });
    expect(restoredUser?.email).toBe("admin@test.com");

    const categories = await db.collection("categories").find({}).toArray();
    expect(categories.map((c) => c.name)).toEqual(["Repairs"]);
  }, 30000);

  it("takes an automatic pre-restore safety backup before restoring", async () => {
    const db = client.db("accounting");
    await db.collection("entries").insertOne({ description: "Will be backed up" });
    const backup = await createBackupArchive(config, "manual");

    const before = await listBackups(config);
    await restoreFromArchive(config, backup.filename);
    const after = await listBackups(config);

    expect(after.length).toBe(before.length + 1);
    expect(after.some((b) => b.label === "pre-restore")).toBe(true);
  }, 30000);

  it("lists backups newest first", async () => {
    const first = await createBackupArchive(config, "manual");
    await new Promise((resolve) => setTimeout(resolve, 1100)); // ensure a distinct timestamp
    const second = await createBackupArchive(config, "manual");

    const backups = await listBackups(config);
    const filenames = backups.map((b) => b.filename);

    expect(filenames.indexOf(second.filename)).toBeLessThan(filenames.indexOf(first.filename));
  }, 30000);
});
