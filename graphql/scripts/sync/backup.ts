import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/**
 * Runs `mongodump` once per collection into a timestamped folder. Called
 * automatically before any `--apply` write, so every sync run has a
 * corresponding rollback point (`mongorestore --uri <target> --drop <dir>`).
 */
export async function backupCollections({
  uri,
  dbName,
  collections,
  outDir,
}: {
  uri: string;
  dbName: string;
  collections: string[];
  outDir: string;
}): Promise<string> {
  for (const collection of collections) {
    await execFileAsync("mongodump", [
      "--uri",
      uri,
      "--db",
      dbName,
      "--collection",
      collection,
      "--out",
      outDir,
    ]);
  }
  return outDir;
}

export function timestampedBackupDir(baseDir: string, label: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${baseDir}/${stamp}-${label}`;
}
