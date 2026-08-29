# Old server → new server transaction sync

Copies transactions (and the reference data they depend on) from the old
finapp server's MongoDB into the new server's, ahead of the new fiscal year
cutover. Safe to run more than once - every write command is idempotent and
defaults to a dry run.

This tool does **not** modify the old server. It only reads from it.

## How duplicate-avoidance actually works

Every `entries`/`budgets` document is written to the target with its
**original `_id` preserved**, using `replaceOne(..., { upsert: true })`.
MongoDB `ObjectId`s generated independently on two servers are effectively
globally unique (timestamp + machine + process + counter), so re-running the
sync any number of times can only ever insert-if-missing or
overwrite-with-latest - it can never create a duplicate transaction. You do
not need to be careful about running it twice.

## Prerequisites

- SSH access to both the old and new servers (already have this).
- `mongodump`/`mongorestore` installed locally (already installed - see
  `which mongodump`).
- Node 20 (`.nvmrc`) to run the app itself; the sync CLI works fine there too.
- `cd graphql` before running any command below.

## Step 0 - open SSH tunnels

Both servers' `mongod` only listen on `localhost` (see `deployment/DEPLOY.md`).
Edit `scripts/sync/open-tunnels.sh` (or export the env vars it reads) with
the real hostnames, then in its own terminal:

```bash
OLD_SSH_HOST=user@old-server NEW_SSH_HOST=user@new-server ./scripts/sync/open-tunnels.sh
```

Leave it running. In your working terminal:

```bash
export OLD_MONGODB_URI=mongodb://localhost:27101
export NEW_MONGODB_URI=mongodb://localhost:27102
```

All commands below read these two env vars (or accept `--old-uri`/`--new-uri`
directly).

## Step 1 - detect-schema

Run this **before touching anything else**. It samples real documents from
both servers and prints a field census, flagging any top-level field on the
old server that isn't part of this repo's current schema:

```bash
npx ts-node -T scripts/sync/cli.ts detect-schema
```

Add `--collection entries` (repeatable) to focus on one collection, and
`--sample-size 2000` to sample more than the default 500 docs.

What to look for:
- **Legacy `{node, id}` reference wrappers** (the old `journalEntries`-era
  shape found in this repo's git history). If you see a field whose value
  looks like `{ node: ObjectId, id: ObjectId }` instead of a plain
  `ObjectId`, do **not** guess which key is authoritative. Confirm it against
  real data (e.g. compare `node`/`id` values to a `categories`/`departments`
  `_id` you already know), then pass `--unwrap-node-id-refs=id` or
  `--unwrap-node-id-refs=node` to `sync-entries` accordingly.
- **String dates** in the `date`/`dateOfRecord.date` fields - these are
  coerced into real `Date`s automatically, no action needed.
- **Other unexpected top-level fields** (capitalized spreadsheet leftovers
  like `Amount`/`Vendor`/`Category`, stray `type`/`_paymentMethod`, etc.) -
  these pass through untouched by default (schema tolerance). If one of them
  actually needs translating into a current field, add a function to
  `customTransforms` in `fieldMapping.ts` and pass it via
  `transformOptions.customTransforms` (currently wired up in `cli.ts`'s
  `runSyncEntries` - extend it if you add one).

## Step 2 - map reference data

Resolves old ↔ new `_id`s for `categories`, `departments`, `accounts`, and
`fiscalYears` by business key (`code`/`name`, not by assuming identical
`_id`s), creating the doc on the new server if it's missing there entirely.

```bash
npx ts-node -T scripts/sync/cli.ts map-reference-data
```

This is a dry run by default - it prints `unmatched` and `ambiguous` items
without writing anything. Review the output:

- **unmatched** - exists on the old server, no business-key match on the new
  server. Left alone, it'll be auto-created on `--apply`. If you'd rather map
  it to an existing new-server doc instead (e.g. it was renamed), add an
  entry to `scripts/sync/idMapOverrides.json` (gitignored - human-edited,
  never auto-generated):
  ```json
  { "categories": { "<old _id hex>": "<new _id hex>" } }
  ```
- **ambiguous** - the business key matches more than one doc on the new
  server. The tool will never guess here - it requires an override entry as
  above before it can proceed for that item.

Once you're satisfied, apply it:

```bash
npx ts-node -T scripts/sync/cli.ts map-reference-data --apply
```

This writes `scripts/sync/idMap.generated.json` (gitignored), which every
later step reads. Safe to re-run - it only creates docs that are still
missing.

## Step 3 - sync budgets (optional, if in scope for this cutover)

```bash
npx ts-node -T scripts/sync/cli.ts sync-budgets            # dry run
npx ts-node -T scripts/sync/cli.ts sync-budgets --apply
```

Budgets owned by a `Business` (rather than a `Department`) are skipped and
counted in `skippedUnresolved` - `businesses` is out of scope for this sync
per project decision (see plan). Revisit if that changes.

## Step 4 - sync entries

```bash
# Dry run - always do this first, especially the first time against real servers
npx ts-node -T scripts/sync/cli.ts sync-entries --full

# Review the printed summary and the full per-doc log it writes next to this
# README (scripts/sync/sync-entries-<timestamp>.log), then:
npx ts-node -T scripts/sync/cli.ts sync-entries --full --apply
```

`--apply` automatically runs a `mongodump` of the target's `entries`
collection into `scripts/sync/backups/<timestamp>-sync-entries/` first, so
every write has a rollback point (`mongorestore --uri <new-uri> --drop
<dir>`).

**`unresolvedRefs` in the summary** means some `category`/`department`/
`source.Department`/`paymentMethod.check.account` reference didn't have an
entry in the id map - almost always because `map-reference-data` hasn't been
re-run since. The affected entry is still written, with the **old-server id
left in place** (never dropped or nulled) so no data is lost, but it won't
resolve correctly in the UI until you re-run Step 2 and Step 4.

**`outOfScopeRefs`** means `createdBy` (→ `users`) or a `Business`/`Person`
`source`/`paymentMethod.card` (→ `businesses`/`people`/`paymentCards`) was
left pointing at the old server's id, because those collections are out of
scope for this sync per project decision. This is expected and not an error.

### Re-running during the transition window

Once the first `--full` sync has run, subsequent runs default to incremental
(`lastUpdate` greater than the last successful checkpoint, stored in
`scripts/sync/.sync-state.json`, gitignored):

```bash
npx ts-node -T scripts/sync/cli.ts sync-entries --apply
```

If any doc in a run throws (malformed data, connection blip), the checkpoint
is **not** advanced past it - the next run will pick it up again along with
anything newer. Pass `--since 2024-01-01T00:00:00Z` to override the
checkpoint manually, or `--full` to ignore it and re-sync everything (always
safe, just slower - see "duplicate-avoidance" above).

Run this as often as you like up to and through the actual cutover (e.g. once
a day, or by hand right before flipping traffic to the new server). It is not
currently wired up to cron - do that once you trust the dry-run output,
by adding `sync-entries --apply` (no `--full`) to a periodic job that also
captures its exit code (non-zero on any doc error).

### Decommissioning the old server

1. Run `sync-entries --apply` (no `--full`) one final time after the old
   server stops taking new writes, to catch anything since the last run.
2. Diff entry counts: `db.entries.countDocuments()` on both servers should
   match (accounting for anything intentionally out of scope).
3. Only then take the old server offline.

## Separate: moving a full backup (not the live sync)

For disaster-recovery or an initial full seed, `deployment/backup-transfer.sh`
does a full `mongodump` of the old server, moves it over SSH, and restores it
into a **staging database** (`accounting_staging`) on the new server -
never directly into production. See that script's header for usage.

## Files in this directory

| File | Purpose |
|---|---|
| `cli.ts` | Entry point / subcommand dispatch |
| `fieldMapping.ts` | Per-doc transforms (date coercion, opt-in legacy ref unwrap) |
| `remapReferences.ts` | Rewrites category/department/account/source references using the id map |
| `idMap.ts` | Business-key matching logic |
| `mapReferenceData.ts` | Orchestrates id-map building + creating missing reference docs |
| `syncEntries.ts` / `syncBudgets.ts` | The actual upsert-by-`_id` sync loops |
| `detectSchema.ts` | Field census/diff report |
| `state.ts` | Reads/writes the gitignored local state files below |
| `backup.ts` | `mongodump` wrapper run automatically before any `--apply` |
| `.sync-state.json`, `idMap.generated.json`, `idMapOverrides.json`, `backups/` | Gitignored local operational state - not code, don't commit |

## Tests

```bash
npx vitest run scripts/sync
```

Runs pure-logic unit tests (`fieldMapping`, `idMap`, `remapReferences`,
`detectSchema`) plus integration tests against two real, independent
in-memory MongoDB instances (`syncEntries.integration.test.ts`,
`mapReferenceData.integration.test.ts`) that specifically assert re-running
the sync never creates a duplicate.
