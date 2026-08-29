import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { ObjectId } from "mongodb";

import { backupCollections, timestampedBackupDir } from "./backup";
import { NEW_SCHEMA_TOP_LEVEL_FIELDS, censusCollection, formatCensusReport, topLevelFieldName } from "./detectSchema";
import { mapReferenceData } from "./mapReferenceData";
import { closeDb, connectDb } from "./mongo";
import { toRefIdMaps } from "./remapReferences";
import {
  readCheckpoint,
  readGeneratedIdMap,
  readIdMapOverrides,
  writeCheckpoint,
  writeGeneratedIdMap,
} from "./state";
import { syncBudgets } from "./syncBudgets";
import { syncEntries } from "./syncEntries";

const DB_NAME = process.env.SYNC_DB_NAME || "accounting";
const BACKUP_BASE_DIR = path.join(__dirname, "backups");

function requireConnectionInfo(oldUri?: string, newUri?: string): { oldUri: string; newUri: string } {
  if (!oldUri || !newUri) {
    console.error(
      "Missing connection info. Pass --old-uri/--new-uri or set OLD_MONGODB_URI/NEW_MONGODB_URI.\n" +
        "Both should point at your local SSH tunnel ports - see open-tunnels.sh and README.md."
    );
    process.exit(1);
  }
  return { oldUri, newUri };
}

async function runDetectSchema({
  oldUri,
  newUri,
  collections,
  sampleSize,
}: {
  oldUri: string;
  newUri: string;
  collections: string[];
  sampleSize: number;
}) {
  const source = await connectDb(oldUri, DB_NAME);
  const target = await connectDb(newUri, DB_NAME);

  try {
    for (const collectionName of collections) {
      console.log(`\n=== ${collectionName} (old server) ===`);
      const { sampleSize: n, census } = await censusCollection(source.db, collectionName, sampleSize);
      console.log(formatCensusReport(n, census));

      const known = NEW_SCHEMA_TOP_LEVEL_FIELDS[collectionName] ?? [];
      const unexpectedTopLevel = [...new Set(Object.keys(census).map(topLevelFieldName))].filter(
        (field) => !known.includes(field)
      );
      if (unexpectedTopLevel.length > 0) {
        console.log(
          `\n  Unexpected top-level fields vs. this repo's current schema: ${unexpectedTopLevel.join(", ")}\n` +
            `  -> review these before running sync-entries; add handling in fieldMapping.ts if needed.`
        );
      }

      console.log(`\n=== ${collectionName} (new server, for comparison) ===`);
      const { sampleSize: nNew, census: censusNew } = await censusCollection(target.db, collectionName, sampleSize);
      console.log(formatCensusReport(nNew, censusNew));
    }
  } finally {
    await closeDb(source);
    await closeDb(target);
  }
}

async function runMapReferenceData({ oldUri, newUri, dryRun }: { oldUri: string; newUri: string; dryRun: boolean }) {
  const source = await connectDb(oldUri, DB_NAME);
  const target = await connectDb(newUri, DB_NAME);

  try {
    const overrides = await readIdMapOverrides();
    const { idMap, reports } = await mapReferenceData({ sourceDb: source.db, targetDb: target.db, overrides, dryRun });

    for (const report of reports) {
      console.log(
        `${report.collection}: matched=${report.matched} created=${report.created} ` +
          `unmatched=${report.unmatched.length} ambiguous=${report.ambiguous.length}`
      );
      for (const doc of report.unmatched) {
        console.log(`  UNMATCHED ${report.collection} _id=${doc._id} - ${JSON.stringify(doc).slice(0, 120)}`);
      }
      for (const item of report.ambiguous) {
        console.log(
          `  AMBIGUOUS ${report.collection} key="${item.key}" oldIds=${item.oldIds} newIds=${item.newIds} ` +
            `- add a resolution to idMapOverrides.json`
        );
      }
    }

    if (!dryRun) {
      await writeGeneratedIdMap(idMap);
      console.log("\nWrote idMap.generated.json");
    } else {
      console.log("\nDry run - nothing written. Re-run with --apply once unmatched/ambiguous items are resolved.");
    }
  } finally {
    await closeDb(source);
    await closeDb(target);
  }
}

async function runSyncBudgets({ oldUri, newUri, dryRun }: { oldUri: string; newUri: string; dryRun: boolean }) {
  const source = await connectDb(oldUri, DB_NAME);
  const target = await connectDb(newUri, DB_NAME);

  try {
    if (!dryRun) {
      await backupBeforeApply(newUri, ["budgets"], "sync-budgets");
    }

    const generated = await readGeneratedIdMap();
    const idMaps = toRefIdMaps(generated);
    const fiscalYears = new Map(
      Object.entries(generated.fiscalYears ?? {}).map(([oldHex, newHex]) => [oldHex, new ObjectId(newHex)])
    );
    const report = await syncBudgets({
      sourceDb: source.db,
      targetDb: target.db,
      idMaps: { departments: idMaps.departments, fiscalYears },
      dryRun,
    });
    console.log(report);
  } finally {
    await closeDb(source);
    await closeDb(target);
  }
}

async function backupBeforeApply(uri: string, collections: string[], label: string) {
  mkdirSync(BACKUP_BASE_DIR, { recursive: true });
  const outDir = timestampedBackupDir(BACKUP_BASE_DIR, label);
  console.log(`Backing up target collections [${collections.join(", ")}] to ${outDir} before writing...`);
  await backupCollections({ uri, dbName: DB_NAME, collections, outDir });
  console.log("Backup complete.");
}

async function runSyncEntries({
  oldUri,
  newUri,
  dryRun,
  since,
  full,
  enableNodeIdUnwrap,
}: {
  oldUri: string;
  newUri: string;
  dryRun: boolean;
  since?: string;
  full: boolean;
  enableNodeIdUnwrap?: "id" | "node";
}) {
  const source = await connectDb(oldUri, DB_NAME);
  const target = await connectDb(newUri, DB_NAME);

  try {
    if (!dryRun) {
      await backupBeforeApply(newUri, ["entries"], "sync-entries");
    }

    const generated = await readGeneratedIdMap();
    const idMaps = toRefIdMaps(generated);

    const checkpoint = await readCheckpoint();
    const sinceDate = full
      ? undefined
      : since
      ? new Date(since)
      : checkpoint.entries?.lastUpdateIso
      ? new Date(checkpoint.entries.lastUpdateIso)
      : undefined;

    console.log(`Syncing entries ${sinceDate ? `since ${sinceDate.toISOString()}` : "(full sync)"} - dryRun=${dryRun}`);

    const report = await syncEntries({
      sourceDb: source.db,
      targetDb: target.db,
      idMaps,
      since: sinceDate,
      dryRun,
      transformOptions: enableNodeIdUnwrap ? { unwrapLegacyNodeIdRefs: { idKey: enableNodeIdUnwrap } } : undefined,
    });

    console.log(
      `inserted=${report.inserted} updated=${report.updated} unchanged=${report.unchanged} errors=${report.errors} ` +
        `unresolvedRefs=${report.unresolvedRefCount} outOfScopeRefs=${report.outOfScopeRefCount}`
    );

    const logPath = path.join(__dirname, `sync-entries-${new Date().toISOString().replace(/[:.]/g, "-")}.log`);
    writeFileSync(logPath, JSON.stringify(report, null, 2));
    console.log(`Full decision log written to ${logPath}`);

    if (!dryRun && report.newCheckpoint) {
      await writeCheckpoint({ entries: { lastUpdateIso: report.newCheckpoint.toISOString() } });
      console.log(`Checkpoint advanced to ${report.newCheckpoint.toISOString()}`);
    }

    if (report.errors > 0) {
      console.error(`${report.errors} entries failed to sync - see the log above. Checkpoint was NOT advanced past them.`);
      process.exitCode = 1;
    }
  } finally {
    await closeDb(source);
    await closeDb(target);
  }
}

async function main() {
  const [subcommand, ...rest] = process.argv.slice(2);

  const { values } = parseArgs({
    args: rest,
    options: {
      "old-uri": { type: "string" },
      "new-uri": { type: "string" },
      apply: { type: "boolean", default: false },
      full: { type: "boolean", default: false },
      since: { type: "string" },
      collection: { type: "string", multiple: true },
      "sample-size": { type: "string", default: "500" },
      "unwrap-node-id-refs": { type: "string" },
    },
  });

  const { oldUri, newUri } = requireConnectionInfo(
    values["old-uri"] ?? process.env.OLD_MONGODB_URI,
    values["new-uri"] ?? process.env.NEW_MONGODB_URI
  );
  const dryRun = !values.apply;

  switch (subcommand) {
    case "detect-schema":
      await runDetectSchema({
        oldUri,
        newUri,
        collections: values.collection ?? ["entries", "categories", "departments", "accounts", "budgets", "fiscalYears"],
        sampleSize: Number(values["sample-size"]),
      });
      break;
    case "map-reference-data":
      await runMapReferenceData({ oldUri, newUri, dryRun });
      break;
    case "sync-budgets":
      await runSyncBudgets({ oldUri, newUri, dryRun });
      break;
    case "sync-entries":
      await runSyncEntries({
        oldUri,
        newUri,
        dryRun,
        since: values.since,
        full: values.full ?? false,
        enableNodeIdUnwrap: values["unwrap-node-id-refs"] as "id" | "node" | undefined,
      });
      break;
    default:
      console.error(
        "Usage: npx ts-node cli.ts <detect-schema|map-reference-data|sync-budgets|sync-entries> " +
          "[--apply] [--old-uri <uri>] [--new-uri <uri>]\n" +
          "See README.md for the full workflow."
      );
      process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
