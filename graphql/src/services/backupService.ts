import { ChildProcess, execFile, spawn } from "child_process";
import { existsSync } from "fs";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "fs/promises";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export interface BackupConfig {
  dbHost: string;
  dbPort: string;
  dbName: string;
  archivesDir: string;
  tmpDir: string;
}

export type BackupLabel = "manual" | "pre-restore";

export interface BackupInfo {
  filename: string;
  sizeBytes: number;
  createdAt: Date;
  label: string;
}

export interface RestoreInfo {
  success: boolean;
  restoredFrom: string;
  preRestoreBackup: string;
}

export interface BackupCollectionCheck {
  collection: string;
  expectedCount: number;
  actualCount: number;
  ok: boolean;
}

export interface BackupVerification {
  ok: boolean;
  /** false for backups made before this feature existed - can't verify what was never recorded */
  manifestFound: boolean;
  collections: BackupCollectionCheck[];
}

interface BackupManifest {
  createdAt: string;
  label: string;
  collections: Record<string, number>;
}

const FILENAME_PATTERN = /^backup-[0-9TZ-]+-(manual|pre-restore)\.tar\.gz$/;
const MANIFEST_FILENAME = "manifest.json";

function buildFilename(label: BackupLabel, date = new Date()): string {
  const stamp = date.toISOString().replace(/[:.]/g, "-");
  return `backup-${stamp}-${label}.tar.gz`;
}

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

function uniqueTempDir(baseDir: string, label: string): string {
  return path.join(baseDir, `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}`);
}

/** Resolves `filename` inside `archivesDir`, rejecting anything that isn't a
 * plain backup filename we generated ourselves (path traversal guard - this
 * same check is duplicated at the HTTP download route in index.ts, since
 * that's a second, independent entry point for a filename from the client). */
function resolveArchivePath(config: BackupConfig, filename: string): string {
  if (!FILENAME_PATTERN.test(filename)) {
    throw new Error(`Invalid backup filename: ${filename}`);
  }
  const resolvedDir = path.resolve(config.archivesDir);
  const archivePath = path.join(resolvedDir, filename);
  if (path.dirname(archivePath) !== resolvedDir) {
    throw new Error(`Invalid backup filename: ${filename}`);
  }
  return archivePath;
}

/**
 * Counts the documents in a single `mongodump`-produced `.bson` file by
 * streaming it through `bsondump` (one JSON line per document) and counting
 * lines - read-only, touches no live database, works directly off the dump
 * file itself. Streamed rather than buffered (not `execFile`) since a large
 * collection's dump can exceed a buffered child process's default output cap.
 */
export function countBsonDocuments(bsonFilePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child: ChildProcess = spawn("bsondump", ["--quiet", bsonFilePath]);
    let count = 0;
    let partial = "";
    let stderr = "";

    child.stdout?.on("data", (chunk: Buffer) => {
      partial += chunk.toString();
      let newlineIndex: number;
      while ((newlineIndex = partial.indexOf("\n")) >= 0) {
        count++;
        partial = partial.slice(newlineIndex + 1);
      }
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`bsondump failed for ${bsonFilePath}: ${stderr.trim() || `exit code ${code}`}`));
        return;
      }
      if (partial.trim().length > 0) count++;
      resolve(count);
    });
  });
}

async function buildManifestFromDump(dumpDbDir: string, label: BackupLabel): Promise<BackupManifest> {
  const files = await readdir(dumpDbDir);
  const bsonFiles = files.filter((f) => f.endsWith(".bson"));

  const collections: Record<string, number> = {};
  for (const file of bsonFiles) {
    const collectionName = file.slice(0, -".bson".length);
    collections[collectionName] = await countBsonDocuments(path.join(dumpDbDir, file));
  }

  return { createdAt: new Date().toISOString(), label, collections };
}

/** Re-counts an already-extracted dump against its own manifest. Read-only. */
async function verifyExtractedDump(extractDir: string, dbName: string): Promise<BackupVerification> {
  const manifestPath = path.join(extractDir, MANIFEST_FILENAME);
  if (!existsSync(manifestPath)) {
    return { ok: false, manifestFound: false, collections: [] };
  }

  const manifest: BackupManifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const collections: BackupCollectionCheck[] = [];

  for (const [collection, expectedCount] of Object.entries(manifest.collections)) {
    const bsonPath = path.join(extractDir, dbName, `${collection}.bson`);
    const actualCount = existsSync(bsonPath) ? await countBsonDocuments(bsonPath) : 0;
    collections.push({ collection, expectedCount, actualCount, ok: actualCount === expectedCount });
  }

  return { ok: collections.every((c) => c.ok), manifestFound: true, collections };
}

/**
 * Whole-database backup via `mongodump` + `tar`, the same mechanism this
 * app's backups have always been taken with by hand over SSH - just
 * triggered from the Admin UI instead. `users`/`userPermissions`/`auditLog`
 * live in the same `accounting` database as every accounting collection
 * (see plan), so one dump captures everything, "and users" included.
 *
 * Also builds a `manifest.json` of per-collection document counts (via
 * `bsondump`, straight off the dump files) and tars it in alongside the
 * dump - it travels with the archive (e.g. over scp) and is what
 * `verifyBackupArchive`/`restoreFromArchive` check the archive against
 * later, catching truncation/corruption rather than just trusting the file
 * exists.
 */
export async function createBackupArchive(
  config: BackupConfig,
  label: BackupLabel
): Promise<BackupInfo> {
  await ensureDir(config.archivesDir);
  await ensureDir(config.tmpDir);

  const dumpDir = uniqueTempDir(config.tmpDir, "dump");

  await execFileAsync("mongodump", [
    "--host", config.dbHost,
    "--port", config.dbPort,
    "--db", config.dbName,
    "--out", dumpDir,
  ]);

  const manifest = await buildManifestFromDump(path.join(dumpDir, config.dbName), label);
  await writeFile(path.join(dumpDir, MANIFEST_FILENAME), JSON.stringify(manifest, null, 2));

  const filename = buildFilename(label);
  const archivePath = path.join(config.archivesDir, filename);
  await execFileAsync("tar", ["-czf", archivePath, "-C", dumpDir, config.dbName, MANIFEST_FILENAME]);
  await rm(dumpDir, { recursive: true, force: true });

  const stats = await stat(archivePath);
  return { filename, sizeBytes: stats.size, createdAt: stats.mtime, label };
}

export async function listBackups(config: BackupConfig): Promise<BackupInfo[]> {
  await ensureDir(config.archivesDir);
  const files = await readdir(config.archivesDir);

  const backups: BackupInfo[] = [];
  for (const filename of files) {
    if (!filename.endsWith(".tar.gz")) continue;
    const stats = await stat(path.join(config.archivesDir, filename));
    const match = filename.match(FILENAME_PATTERN);
    backups.push({
      filename,
      sizeBytes: stats.size,
      createdAt: stats.mtime,
      label: match?.[1] ?? "unknown",
    });
  }

  return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Extracts the archive and checks its contents against its own manifest -
 * read-only, never touches a live database. `manifestFound: false` (rather
 * than throwing) for backups made before this feature existed.
 */
export async function verifyBackupArchive(config: BackupConfig, filename: string): Promise<BackupVerification> {
  const archivePath = resolveArchivePath(config, filename);

  await ensureDir(config.tmpDir);
  const extractDir = uniqueTempDir(config.tmpDir, "verify");
  await ensureDir(extractDir);

  try {
    await execFileAsync("tar", ["-xzf", archivePath, "-C", extractDir]);
    return await verifyExtractedDump(extractDir, config.dbName);
  } finally {
    await rm(extractDir, { recursive: true, force: true });
  }
}

export async function deleteBackupArchive(config: BackupConfig, filename: string): Promise<void> {
  const archivePath = resolveArchivePath(config, filename);
  await rm(archivePath, { force: true });
}

/**
 * Replaces the ENTIRE database with the contents of `filename`. Always takes
 * a fresh "pre-restore" backup first (defense in depth - so even a mistaken
 * restore is itself recoverable), then verifies the archive against its own
 * manifest and refuses to proceed if the counts don't match (a backup with
 * no manifest at all is allowed through - can't verify what was never
 * recorded) before ever running `mongorestore --drop`.
 */
export async function restoreFromArchive(config: BackupConfig, filename: string): Promise<RestoreInfo> {
  const archivePath = resolveArchivePath(config, filename);

  const preRestoreBackup = await createBackupArchive(config, "pre-restore");

  await ensureDir(config.tmpDir);
  const extractDir = uniqueTempDir(config.tmpDir, "restore");
  await ensureDir(extractDir);

  await execFileAsync("tar", ["-xzf", archivePath, "-C", extractDir]);

  const verification = await verifyExtractedDump(extractDir, config.dbName);
  if (verification.manifestFound && !verification.ok) {
    await rm(extractDir, { recursive: true, force: true });
    const mismatches = verification.collections
      .filter((c) => !c.ok)
      .map((c) => `${c.collection}: expected ${c.expectedCount}, found ${c.actualCount}`)
      .join("; ");
    throw new Error(`Refusing to restore - archive failed integrity check: ${mismatches}`);
  }

  await execFileAsync("mongorestore", [
    "--host", config.dbHost,
    "--port", config.dbPort,
    "--db", config.dbName,
    "--drop",
    path.join(extractDir, config.dbName),
  ]);

  await rm(extractDir, { recursive: true, force: true });

  return { success: true, restoredFrom: filename, preRestoreBackup: preRestoreBackup.filename };
}
