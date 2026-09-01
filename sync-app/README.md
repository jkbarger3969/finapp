# FinApp Sync Assistant

A desktop app that walks through moving transactions from the old finapp
server to the new one for the fiscal-year cutover - the same workflow as
`graphql/scripts/sync/` (see its README for the underlying mechanics and
guarantees), but as a guided wizard instead of CLI commands.

It reuses that exact sync code directly (bundled at build time), so it
carries the same safety properties: dry-run before every write, idempotent
re-runs (never creates duplicate transactions), and an automatic backup
before anything is applied.

**This app is not the way to do a full database restore.** If you need to
wipe and replace the entire new-server database, use the Admin > Backup &
Restore feature in the app itself instead - this tool does a selective,
mergeable sync.

## Installing

1. Build it (see below) or get the `.dmg` from whoever built it.
2. Open the `.dmg` and drag **FinApp Sync Assistant** into Applications.
3. **First launch**: macOS will refuse to open it ("cannot be verified") -
   this app isn't signed with an Apple Developer ID. Either:
   - Right-click the app in Applications > Open > Open (one-time), or
   - Run `xattr -cr "/Applications/FinApp Sync Assistant.app"` in Terminal.

## Using it

1. **Connect: Old Server / New Server** - choose SSH Tunnel (enter the SSH
   host like `keith@172.16.2.5`; the app opens the tunnel itself, no need to
   run anything in a terminal first) or Direct Mongo URI (if the database is
   already reachable directly, e.g. for testing against a local instance).
   After connecting, review the database name and collection counts shown -
   confirm it's really the server you meant before continuing.
2. **Detect Schema** - samples both servers and flags anything on the old
   server that doesn't match the new server's current shape. If the old
   server uses the legacy `{node, id}` reference format, enable the unwrap
   option here (only after confirming which key - `id` or `node` - is
   correct against real data).
3. **Map References** - matches categories/departments/accounts/fiscal years
   by name/code, not by assuming shared IDs. Anything ambiguous (matches more
   than one candidate) needs a dropdown pick before you can apply; anything
   unmatched will be created automatically.
4. **Sync Budgets** - optional, same dry-run-then-apply pattern.
5. **Sync Entries** - Full (first run) or Since Last Run (afterward - reuses
   a checkpoint so it only looks at what's changed). Always run the dry run
   first and read the summary before clicking Apply.
6. **Done** - re-run "Sync Entries" as often as needed while the old server
   is still live; it's always safe.

## Development

```bash
npm install
npm run dev      # electron-vite dev - hot reload
npm test         # vitest
npm run build:mac  # produces dist/*.dmg (both arm64 and x64, unsigned)
```

State (checkpoint, resolved id map) lives in this app's own data directory
(`~/Library/Application Support/finapp-sync-assistant/`), separate from
`graphql/scripts/sync/`'s own state files - the CLI and this app are two
independent ways to run the same workflow; don't mix them in the same sync
run.
