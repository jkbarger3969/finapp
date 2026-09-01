import { contextBridge, ipcRenderer } from "electron";

import {
  ConnectRequest,
  DetectSchemaRequest,
  IPC_CHANNELS,
  MapReferenceDataRequest,
  ServerSide,
  SyncBudgetsRequest,
  SyncEntriesRequest,
} from "../shared/ipcTypes";

const api = {
  connect: (request: ConnectRequest) => ipcRenderer.invoke(IPC_CHANNELS.connect, request),
  disconnect: (side: ServerSide) => ipcRenderer.invoke(IPC_CHANNELS.disconnect, side),
  verify: (side: ServerSide) => ipcRenderer.invoke(IPC_CHANNELS.verify, side),
  detectSchema: (request: DetectSchemaRequest) => ipcRenderer.invoke(IPC_CHANNELS.detectSchema, request),
  mapReferenceData: (request: MapReferenceDataRequest) =>
    ipcRenderer.invoke(IPC_CHANNELS.mapReferenceData, request),
  syncBudgets: (request: SyncBudgetsRequest) => ipcRenderer.invoke(IPC_CHANNELS.syncBudgets, request),
  syncEntries: (request: SyncEntriesRequest) => ipcRenderer.invoke(IPC_CHANNELS.syncEntries, request),
  getCheckpoint: () => ipcRenderer.invoke(IPC_CHANNELS.getCheckpoint),
  openBackupsFolder: () => ipcRenderer.invoke(IPC_CHANNELS.openBackupsFolder),
  openLogsFolder: () => ipcRenderer.invoke(IPC_CHANNELS.openLogsFolder),
  onSyncEntriesProgress: (callback: (processed: number) => void) => {
    const listener = (_event: unknown, processed: number) => callback(processed);
    ipcRenderer.on(IPC_CHANNELS.syncEntriesProgress, listener);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.syncEntriesProgress, listener);
    };
  },
  onDisconnectedAll: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on("connections:disconnectedAll", listener);
    return () => {
      ipcRenderer.removeListener("connections:disconnectedAll", listener);
    };
  },
};

export type SyncApi = typeof api;

contextBridge.exposeInMainWorld("syncApi", api);
