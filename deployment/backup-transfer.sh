#!/usr/bin/env bash
# Moves a full mongodump backup of the old server's database to the new
# server, for disaster-recovery / initial-seeding purposes. This is separate
# from graphql/scripts/sync/cli.ts, which does the selective, idempotent
# live-transaction sync - this script does a full copy and restores it into a
# STAGING database on the new server, never directly into production, so it
# can be inspected/diffed before anything is promoted.
#
# Usage:
#   OLD_SSH_HOST=user@old-server NEW_SSH_HOST=user@new-server ./backup-transfer.sh

set -euo pipefail

OLD_SSH_HOST="${OLD_SSH_HOST:?set OLD_SSH_HOST, e.g. user@old-server-hostname-or-ip}"
NEW_SSH_HOST="${NEW_SSH_HOST:?set NEW_SSH_HOST, e.g. user@new-server-hostname-or-ip}"
DB_NAME="${DB_NAME:-accounting}"
STAGING_DB_NAME="${STAGING_DB_NAME:-accounting_staging}"

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
REMOTE_DIR="/tmp/finapp-backup-${STAMP}"
LOCAL_RELAY="/tmp/finapp-backup-${STAMP}.tar.gz"

echo "1/4 Dumping '${DB_NAME}' on the old server..."
ssh "$OLD_SSH_HOST" "mongodump --db '${DB_NAME}' --out '${REMOTE_DIR}' && tar -C '${REMOTE_DIR}' -czf '${REMOTE_DIR}.tar.gz' ."

echo "2/4 Pulling the dump to this machine (relay)..."
scp "${OLD_SSH_HOST}:${REMOTE_DIR}.tar.gz" "$LOCAL_RELAY"

echo "3/4 Pushing the dump to the new server..."
scp "$LOCAL_RELAY" "${NEW_SSH_HOST}:${REMOTE_DIR}.tar.gz"

echo "4/4 Restoring into staging database '${STAGING_DB_NAME}' on the new server (production '${DB_NAME}' is untouched)..."
ssh "$NEW_SSH_HOST" "mkdir -p '${REMOTE_DIR}' && tar -C '${REMOTE_DIR}' -xzf '${REMOTE_DIR}.tar.gz' && \
  mongorestore --nsFrom '${DB_NAME}.*' --nsTo '${STAGING_DB_NAME}.*' '${REMOTE_DIR}/${DB_NAME}'"

cat <<EOF

Done. The old server's data is now in '${STAGING_DB_NAME}' on the new server, alongside
(not overwriting) the live '${DB_NAME}' database.

Inspect it with:
  ssh ${NEW_SSH_HOST} mongosh ${STAGING_DB_NAME}

Clean up temp files once you're done (they contain full financial data - don't leave them lying around):
  ssh ${OLD_SSH_HOST} rm -rf '${REMOTE_DIR}' '${REMOTE_DIR}.tar.gz'
  ssh ${NEW_SSH_HOST} rm -rf '${REMOTE_DIR}' '${REMOTE_DIR}.tar.gz'
  rm -f '${LOCAL_RELAY}'
EOF
