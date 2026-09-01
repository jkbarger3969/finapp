import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export const DEFAULT_STATE_DIR = __dirname;

export interface SyncCheckpoint {
  entries?: { lastUpdateIso: string };
}

/** collection -> old _id (hex) -> new _id (hex) */
export type IdMapFile = Record<string, Record<string, string>>;

async function readJsonIfExists<T>(filePath: string, fallback: T): Promise<T> {
  if (!existsSync(filePath)) return fallback;
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export function checkpointPath(dir: string = DEFAULT_STATE_DIR): string {
  return path.join(dir, ".sync-state.json");
}

export function generatedIdMapPath(dir: string = DEFAULT_STATE_DIR): string {
  return path.join(dir, "idMap.generated.json");
}

export function idMapOverridesPath(dir: string = DEFAULT_STATE_DIR): string {
  return path.join(dir, "idMapOverrides.json");
}

export async function readCheckpoint(dir: string = DEFAULT_STATE_DIR): Promise<SyncCheckpoint> {
  return readJsonIfExists<SyncCheckpoint>(checkpointPath(dir), {});
}

export async function writeCheckpoint(
  checkpoint: SyncCheckpoint,
  dir: string = DEFAULT_STATE_DIR
): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(checkpointPath(dir), JSON.stringify(checkpoint, null, 2));
}

export async function readGeneratedIdMap(dir: string = DEFAULT_STATE_DIR): Promise<IdMapFile> {
  return readJsonIfExists<IdMapFile>(generatedIdMapPath(dir), {});
}

export async function writeGeneratedIdMap(
  map: IdMapFile,
  dir: string = DEFAULT_STATE_DIR
): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(generatedIdMapPath(dir), JSON.stringify(map, null, 2));
}

/** Human-edited resolutions for anything `map-reference-data` reported as
 * unmatched/ambiguous. Read-only from the tool's perspective. */
export async function readIdMapOverrides(dir: string = DEFAULT_STATE_DIR): Promise<IdMapFile> {
  return readJsonIfExists<IdMapFile>(idMapOverridesPath(dir), {});
}
