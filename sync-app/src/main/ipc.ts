import { BrowserWindow, IpcMain, shell } from "electron";
import { Db, MongoClient, ObjectId } from "mongodb";
import path from "path";

import { censusCollection, diffAgainstKnownFields, NEW_SCHEMA_TOP_LEVEL_FIELDS, topLevelFieldName } from "../../../graphql/scripts/sync/detectSchema";
import { mapReferenceData } from "../../../graphql/scripts/sync/mapReferenceData";
import { RefDoc } from "../../../graphql/scripts/sync/idMap";
import { toRefIdMaps } from "../../../graphql/scripts/sync/remapReferences";
import { syncBudgets } from "../../../graphql/scripts/sync/syncBudgets";
import { syncEntries } from "../../../graphql/scripts/sync/syncEntries";
import { backupCollections, timestampedBackupDir } from "../../../graphql/scripts/sync/backup";
import {
  readCheckpoint,
  readGeneratedIdMap,
  writeCheckpoint,
  writeGeneratedIdMap,
} from "../../../graphql/scripts/sync/state";
import { closeTunnel, openTunnel, TunnelHandle } from "./tunnels";
import { verifyDatabase } from "./dbVerify";
import {
  AmbiguousItem,
  ConnectRequest,
  DetectSchemaRequest,
  DetectSchemaResult,
  IPC_CHANNELS,
  MapReferenceDataRequest,
  MapReferenceDataResponse,
  ReferenceCollectionSummary,
  ServerSide,
  SyncBudgetsRequest,
  SyncBudgetsResponse,
  SyncEntriesRequest,
  SyncEntriesResponse,
  UnmatchedItem,
  VerifyResult,
} from "../shared/ipcTypes";

const DB_NAME = "accounting";
const REFERENCE_COLLECTIONS = ["categories", "departments", "accounts", "fiscalYears"] as const;
const LABEL_FIELDS = ["name", "code"];

interface Connection {
  client: MongoClient;
  db: Db;
  uri: string;
  tunnel?: TunnelHandle;
}

const connections: Partial<Record<ServerSide, Connection>> = {};

function requireConnection(side: ServerSide): Connection {
  const conn = connections[side];
  if (!conn) throw new Error(`Not connected to the ${side} server yet`);
  return conn;
}

function labelFor(doc: RefDoc | null | undefined): string {
  if (!doc) return "(deleted)";
  for (const field of LABEL_FIELDS) {
    if (typeof doc[field] === "string" && doc[field]) return doc[field] as string;
  }
  return doc._id.toHexString();
}

export function getUserDataPaths(userDataDir: string) {
  return {
    stateDir: path.join(userDataDir, "sync-state"),
    backupsDir: path.join(userDataDir, "backups"),
    tmpDir: path.join(userDataDir, "tmp"),
  };
}

export function registerIpcHandlers(ipcMain: IpcMain, userDataDir: string) {
  const { stateDir, backupsDir, tmpDir } = getUserDataPaths(userDataDir);

  ipcMain.handle(IPC_CHANNELS.connect, async (_event, request: ConnectRequest): Promise<{ uri: string }> => {
    const { side, input } = request;

    // Replace any existing connection for this side.
    const existing = connections[side];
    if (existing) {
      await existing.client.close().catch(() => undefined);
      if (existing.tunnel) closeTunnel(existing.tunnel);
      delete connections[side];
    }

    let uri: string;
    let tunnel: TunnelHandle | undefined;

    if (input.mode === "direct") {
      uri = input.uri;
    } else {
      tunnel = await openTunnel({
        sshHost: input.sshHost,
        sshPort: input.sshPort,
        localPort: input.localPort,
        remotePort: input.remotePort,
      });
      uri = `mongodb://localhost:${input.localPort}`;
    }

    const client = new MongoClient(uri);
    try {
      await client.connect();
    } catch (err) {
      if (tunnel) closeTunnel(tunnel);
      throw err;
    }

    connections[side] = { client, db: client.db(DB_NAME), uri, tunnel };
    return { uri };
  });

  ipcMain.handle(IPC_CHANNELS.disconnect, async (_event, side: ServerSide) => {
    const conn = connections[side];
    if (!conn) return;
    await conn.client.close().catch(() => undefined);
    if (conn.tunnel) closeTunnel(conn.tunnel);
    delete connections[side];
  });

  ipcMain.handle(IPC_CHANNELS.verify, async (_event, side: ServerSide): Promise<VerifyResult> => {
    const conn = requireConnection(side);
    return verifyDatabase(conn.uri, DB_NAME);
  });

  ipcMain.handle(
    IPC_CHANNELS.detectSchema,
    async (_event, request: DetectSchemaRequest): Promise<DetectSchemaResult> => {
      const oldConn = requireConnection("old");
      const newConn = requireConnection("new");
      const sampleSize = request.sampleSize ?? 500;

      const result: DetectSchemaResult = { old: {}, new: {}, unexpectedTopLevelFields: {} };

      for (const collection of request.collections) {
        const [oldCensus, newCensus] = await Promise.all([
          censusCollection(oldConn.db, collection, sampleSize),
          censusCollection(newConn.db, collection, sampleSize),
        ]);

        result.old[collection] = {
          sampleSize: oldCensus.sampleSize,
          fields: Object.entries(oldCensus.census).map(([fieldPath, entry]) => ({
            path: fieldPath,
            count: entry.count,
            types: [...entry.types],
          })),
        };
        result.new[collection] = {
          sampleSize: newCensus.sampleSize,
          fields: Object.entries(newCensus.census).map(([fieldPath, entry]) => ({
            path: fieldPath,
            count: entry.count,
            types: [...entry.types],
          })),
        };

        const known = NEW_SCHEMA_TOP_LEVEL_FIELDS[collection] ?? [];
        const unexpected = [
          ...new Set(diffAgainstKnownFields(oldCensus.census, known).map(topLevelFieldName)),
        ].filter((field) => !known.includes(field));
        if (unexpected.length > 0) {
          result.unexpectedTopLevelFields[collection] = unexpected;
        }
      }

      return result;
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.mapReferenceData,
    async (_event, request: MapReferenceDataRequest): Promise<MapReferenceDataResponse> => {
      const oldConn = requireConnection("old");
      const newConn = requireConnection("new");

      const { idMap, reports } = await mapReferenceData({
        sourceDb: oldConn.db,
        targetDb: newConn.db,
        overrides: request.overrides,
        dryRun: request.dryRun,
      });

      const summaries: ReferenceCollectionSummary[] = [];
      for (const report of reports) {
        const unmatched: UnmatchedItem[] = report.unmatched.map((doc) => ({
          collection: report.collection,
          oldId: doc._id.toHexString(),
          label: labelFor(doc),
        }));

        const ambiguous: AmbiguousItem[] = [];
        for (const item of report.ambiguous) {
          const candidateDocs = await newConn.db
            .collection(report.collection)
            .find({ _id: { $in: item.newIds } })
            .toArray();
          const byId = new Map(candidateDocs.map((d) => [d._id.toHexString(), d]));
          ambiguous.push({
            collection: report.collection,
            key: item.key,
            oldId: item.oldIds[0].toHexString(),
            candidates: item.newIds.map((id) => ({
              id: id.toHexString(),
              label: labelFor(byId.get(id.toHexString()) as RefDoc),
            })),
          });
        }

        summaries.push({
          collection: report.collection,
          matched: report.matched,
          created: report.created,
          unmatched,
          ambiguous,
        });
      }

      if (!request.dryRun) {
        await writeGeneratedIdMap(idMap, stateDir);
      }

      return { idMap, reports: summaries };
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.syncBudgets,
    async (_event, request: SyncBudgetsRequest): Promise<SyncBudgetsResponse> => {
      const oldConn = requireConnection("old");
      const newConn = requireConnection("new");
      const generated = await readGeneratedIdMap(stateDir);
      const idMaps = toRefIdMaps(generated);
      const fiscalYears = new Map(
        Object.entries(generated.fiscalYears ?? {}).map(([oldHex, newHex]) => [oldHex, new ObjectId(newHex)])
      );

      if (!request.dryRun) {
        await backupCollections({
          uri: newConn.uri,
          dbName: DB_NAME,
          collections: ["budgets"],
          outDir: timestampedBackupDir(backupsDir, "sync-budgets"),
        });
      }

      return syncBudgets({
        sourceDb: oldConn.db,
        targetDb: newConn.db,
        idMaps: { departments: idMaps.departments, fiscalYears },
        dryRun: request.dryRun,
      });
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.syncEntries,
    async (event, request: SyncEntriesRequest): Promise<SyncEntriesResponse> => {
      const oldConn = requireConnection("old");
      const newConn = requireConnection("new");
      const generated = await readGeneratedIdMap(stateDir);
      const idMaps = toRefIdMaps(generated);
      const checkpoint = await readCheckpoint(stateDir);

      const since = request.full
        ? undefined
        : request.since
        ? new Date(request.since)
        : checkpoint.entries?.lastUpdateIso
        ? new Date(checkpoint.entries.lastUpdateIso)
        : undefined;

      if (!request.dryRun) {
        await backupCollections({
          uri: newConn.uri,
          dbName: DB_NAME,
          collections: ["entries"],
          outDir: timestampedBackupDir(backupsDir, "sync-entries"),
        });
      }

      const sender = event.sender;
      const report = await syncEntries({
        sourceDb: oldConn.db,
        targetDb: newConn.db,
        idMaps,
        since,
        dryRun: request.dryRun,
        transformOptions: request.unwrapLegacyNodeIdRefs
          ? { unwrapLegacyNodeIdRefs: request.unwrapLegacyNodeIdRefs }
          : undefined,
        onProgress: (processed) => {
          sender.send(IPC_CHANNELS.syncEntriesProgress, processed);
        },
      });

      if (!request.dryRun && report.newCheckpoint) {
        await writeCheckpoint({ entries: { lastUpdateIso: report.newCheckpoint.toISOString() } }, stateDir);
      }

      return {
        inserted: report.inserted,
        updated: report.updated,
        unchanged: report.unchanged,
        errors: report.errors,
        unresolvedRefCount: report.unresolvedRefCount,
        outOfScopeRefCount: report.outOfScopeRefCount,
        newCheckpoint: report.newCheckpoint?.toISOString(),
        totalProcessed: report.decisions.length,
        errorSamples: report.decisions.filter((d) => d.action === "error").slice(0, 10).map((d) => `${d.id}: ${d.error}`),
      };
    }
  );

  ipcMain.handle(IPC_CHANNELS.getCheckpoint, async () => readCheckpoint(stateDir));

  ipcMain.handle(IPC_CHANNELS.openBackupsFolder, async () => {
    await shell.openPath(backupsDir);
  });

  ipcMain.handle(IPC_CHANNELS.openLogsFolder, async () => {
    await shell.openPath(tmpDir);
  });
}

export async function closeAllConnections() {
  for (const side of Object.keys(connections) as ServerSide[]) {
    const conn = connections[side];
    if (!conn) continue;
    await conn.client.close().catch(() => undefined);
    if (conn.tunnel) closeTunnel(conn.tunnel);
  }
}

export function broadcastToAllWindows(channel: string, ...args: unknown[]) {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(channel, ...args);
  }
}
