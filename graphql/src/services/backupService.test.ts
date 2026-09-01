import { execFile } from "child_process";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { promisify } from "util";

import { MongoClient, ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  BackupConfig,
  createBackupArchive,
  deleteBackupArchive,
  listBackups,
  restoreFromArchive,
  verifyBackupArchive,
} from "./backupService";

const execFileAsync = promisify(execFile);

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

  it("verifies a freshly created backup as ok, with correct per-collection counts", async () => {
    const db = client.db("accounting");
    await db.collection("entries").insertMany([{ description: "A" }, { description: "B" }]);
    await db.collection("categories").insertOne({ name: "Repairs" });

    const backup = await createBackupArchive(config, "manual");
    const verification = await verifyBackupArchive(config, backup.filename);

    expect(verification.manifestFound).toBe(true);
    expect(verification.ok).toBe(true);
    const entriesCheck = verification.collections.find((c) => c.collection === "entries");
    expect(entriesCheck).toEqual({ collection: "entries", expectedCount: 2, actualCount: 2, ok: true });
  }, 30000);

  it("detects a backup that doesn't match its own manifest", async () => {
    const db = client.db("accounting");
    await db.collection("entries").insertOne({ description: "Only one" });
    const backup = await createBackupArchive(config, "manual");
    const archivePath = path.join(config.archivesDir, backup.filename);

    // Simulate corruption/tampering: extract, lie in the manifest, re-tar over the original.
    const tamperDir = path.join(config.tmpDir, `tamper-test-${Date.now()}`);
    await execFileAsync("mkdir", ["-p", tamperDir]);
    await execFileAsync("tar", ["-xzf", archivePath, "-C", tamperDir]);

    const manifestPath = path.join(tamperDir, "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.collections.entries = 999;
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    await execFileAsync("tar", ["-czf", archivePath, "-C", tamperDir, config.dbName, "manifest.json"]);
    await rm(tamperDir, { recursive: true, force: true });

    const verification = await verifyBackupArchive(config, backup.filename);
    expect(verification.manifestFound).toBe(true);
    expect(verification.ok).toBe(false);
    const entriesCheck = verification.collections.find((c) => c.collection === "entries");
    expect(entriesCheck).toEqual({ collection: "entries", expectedCount: 999, actualCount: 1, ok: false });
  }, 30000);

  it("reports manifestFound: false for an archive with no manifest, without crashing", async () => {
    const db = client.db("accounting");
    await db.collection("entries").insertOne({ description: "Legacy backup" });

    // Build a manifest-less archive directly (pre-dates this feature).
    const legacyDumpDir = path.join(config.tmpDir, `legacy-dump-${Date.now()}`);
    await execFileAsync("mongodump", [
      "--host", config.dbHost,
      "--port", config.dbPort,
      "--db", config.dbName,
      "--out", legacyDumpDir,
    ]);
    const legacyFilename = "backup-2020-01-01T00-00-00-000Z-manual.tar.gz";
    await execFileAsync("tar", ["-czf", path.join(config.archivesDir, legacyFilename), "-C", legacyDumpDir, config.dbName]);
    await rm(legacyDumpDir, { recursive: true, force: true });

    const verification = await verifyBackupArchive(config, legacyFilename);
    expect(verification.manifestFound).toBe(false);
    expect(verification.ok).toBe(false);

    await deleteBackupArchive(config, legacyFilename);
  }, 30000);

  it("deleteBackupArchive removes the file and it disappears from the list", async () => {
    const backup = await createBackupArchive(config, "manual");
    expect((await listBackups(config)).map((b) => b.filename)).toContain(backup.filename);

    await deleteBackupArchive(config, backup.filename);

    expect((await listBackups(config)).map((b) => b.filename)).not.toContain(backup.filename);
  }, 30000);

  it("refuses to restore when the archive fails its integrity check", async () => {
    const db = client.db("accounting");
    await db.collection("entries").insertOne({ description: "Should survive" });
    const backup = await createBackupArchive(config, "manual");
    const archivePath = path.join(config.archivesDir, backup.filename);

    // Tamper with the manifest inside the archive to claim more entries than exist.
    const tamperDir = path.join(config.tmpDir, `tamper-restore-${Date.now()}`);
    await execFileAsync("mkdir", ["-p", tamperDir]);
    await execFileAsync("tar", ["-xzf", archivePath, "-C", tamperDir]);

    const manifestPath = path.join(tamperDir, "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.collections.entries = 999;
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    await execFileAsync("tar", ["-czf", archivePath, "-C", tamperDir, config.dbName, "manifest.json"]);
    await rm(tamperDir, { recursive: true, force: true });

    await expect(restoreFromArchive(config, backup.filename)).rejects.toThrow(/integrity check/i);

    // The live data must be untouched since the restore was refused before mongorestore ran.
    const survivor = await db.collection("entries").findOne({ description: "Should survive" });
    expect(survivor).not.toBeNull();
  }, 30000);
});
