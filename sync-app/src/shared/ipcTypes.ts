export type ServerSide = "old" | "new";

export interface DirectConnectionInput {
  mode: "direct";
  uri: string;
}

export interface TunnelConnectionInput {
  mode: "tunnel";
  sshHost: string;
  sshPort?: number;
  localPort: number;
  remotePort?: number;
}

export type ConnectionInput = DirectConnectionInput | TunnelConnectionInput;

export interface ConnectRequest {
  side: ServerSide;
  input: ConnectionInput;
}

export interface VerifyResult {
  dbName: string;
  collections: string[];
  counts: Record<string, number>;
}

export interface DetectSchemaRequest {
  collections: string[];
  sampleSize?: number;
}

export interface FieldCensusRow {
  path: string;
  count: number;
  types: string[];
}

export interface CollectionCensus {
  sampleSize: number;
  fields: FieldCensusRow[];
}

export interface DetectSchemaResult {
  old: Record<string, CollectionCensus>;
  new: Record<string, CollectionCensus>;
  /** collection -> unexpected top-level field names found on the old server */
  unexpectedTopLevelFields: Record<string, string[]>;
}

export type IdMapFile = Record<string, Record<string, string>>;

export interface MapReferenceDataRequest {
  dryRun: boolean;
  overrides: IdMapFile;
}

export interface ReferenceDocOption {
  id: string;
  label: string;
}

export interface AmbiguousItem {
  collection: string;
  key: string;
  oldId: string;
  candidates: ReferenceDocOption[];
}

export interface UnmatchedItem {
  collection: string;
  oldId: string;
  label: string;
}

export interface ReferenceCollectionSummary {
  collection: string;
  matched: number;
  created: number;
  unmatched: UnmatchedItem[];
  ambiguous: AmbiguousItem[];
}

export interface MapReferenceDataResponse {
  idMap: IdMapFile;
  reports: ReferenceCollectionSummary[];
}

export interface SyncBudgetsRequest {
  dryRun: boolean;
}

export interface SyncBudgetsResponse {
  inserted: number;
  updated: number;
  unchanged: number;
  skippedUnresolved: number;
}

export interface SyncEntriesRequest {
  dryRun: boolean;
  full: boolean;
  since?: string;
  unwrapLegacyNodeIdRefs?: { idKey: "id" | "node" };
}

export interface SyncEntriesResponse {
  inserted: number;
  updated: number;
  unchanged: number;
  errors: number;
  unresolvedRefCount: number;
  outOfScopeRefCount: number;
  newCheckpoint?: string;
  totalProcessed: number;
  errorSamples: string[];
}

export interface CheckpointInfo {
  lastUpdateIso?: string;
}

export const IPC_CHANNELS = {
  connect: "connection:connect",
  disconnect: "connection:disconnect",
  verify: "connection:verify",
  detectSchema: "sync:detectSchema",
  mapReferenceData: "sync:mapReferenceData",
  syncBudgets: "sync:syncBudgets",
  syncEntries: "sync:syncEntries",
  syncEntriesProgress: "sync:syncEntriesProgress",
  getCheckpoint: "state:getCheckpoint",
  openBackupsFolder: "app:openBackupsFolder",
  openLogsFolder: "app:openLogsFolder",
} as const;
