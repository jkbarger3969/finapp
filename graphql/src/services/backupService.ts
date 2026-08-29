import { execFile } from "child_process";
import { mkdir, readdir, rm, stat } from "fs/promises";
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

const FILENAME_PATTERN = /^backup-[0-9TZ-]+-(manual|pre-restore)\.tar\.gz$/;

function buildFilename(label: BackupLabel, date = new Date()): string {
  const stamp = date.toISOString().replace(/[:.]/g, "-");
  return `backup-${stamp}-${label}.tar.gz`;
}

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
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
 * Whole-database backup via `mongodump` + `tar`, the same mechanism this
 * app's backups have always been taken with by hand over SSH - just
 * triggered from the Admin UI instead. `users`/`userPermissions`/`auditLog`
 * live in the same `accounting` database as every accounting collection
 * (see plan), so one dump captures everything, "and users" included.
 */
export async function createBackupArchive(
  config: BackupConfig,
  label: BackupLabel
): Promise<BackupInfo> {
  await ensureDir(config.archivesDir);
  await ensureDir(config.tmpDir);

  const dumpDir = path.join(config.tmpDir, `dump-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  await execFileAsync("mongodump", [
    "--host", config.dbHost,
    "--port", config.dbPort,
    "--db", config.dbName,
    "--out", dumpDir,
  ]);

  const filename = buildFilename(label);
  const archivePath = path.join(config.archivesDir, filename);
  await execFileAsync("tar", ["-czf", archivePath, "-C", dumpDir, config.dbName]);
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
 * Replaces the ENTIRE database with the contents of `filename`. Always takes
 * a fresh "pre-restore" backup first (defense in depth - so even a mistaken
 * restore is itself recoverable) before running `mongorestore --drop`.
 */
export async function restoreFromArchive(config: BackupConfig, filename: string): Promise<RestoreInfo> {
  const archivePath = resolveArchivePath(config, filename);

  const preRestoreBackup = await createBackupArchive(config, "pre-restore");

  await ensureDir(config.tmpDir);
  const extractDir = path.join(config.tmpDir, `restore-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await ensureDir(extractDir);

  await execFileAsync("tar", ["-xzf", archivePath, "-C", extractDir]);

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
