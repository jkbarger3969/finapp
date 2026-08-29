#!/usr/bin/env bash
# Opens SSH local port-forwards to the old and new servers' mongod instances,
# which are only bound to localhost on each box (see deployment/DEPLOY.md).
# The sync CLI only ever talks to localhost:$OLD_LOCAL_PORT / localhost:$NEW_LOCAL_PORT -
# it never runs anything remotely itself.
#
# Fill in the four variables below, then: ./open-tunnels.sh
# Leave it running in its own terminal while you use the CLI; Ctrl-C closes both tunnels.

set -euo pipefail

OLD_SSH_HOST="${OLD_SSH_HOST:-user@old-server-hostname-or-ip}"
NEW_SSH_HOST="${NEW_SSH_HOST:-user@new-server-hostname-or-ip}"
OLD_LOCAL_PORT="${OLD_LOCAL_PORT:-27101}"
NEW_LOCAL_PORT="${NEW_LOCAL_PORT:-27102}"
REMOTE_MONGO_PORT="${REMOTE_MONGO_PORT:-27017}"

if [[ "$OLD_SSH_HOST" == "user@old-server-hostname-or-ip" ]]; then
  echo "Edit OLD_SSH_HOST/NEW_SSH_HOST (or export them) before running this." >&2
  exit 1
fi

cleanup() {
  echo "Closing tunnels..."
  kill "$OLD_PID" "$NEW_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

ssh -N -L "${OLD_LOCAL_PORT}:localhost:${REMOTE_MONGO_PORT}" "$OLD_SSH_HOST" &
OLD_PID=$!

ssh -N -L "${NEW_LOCAL_PORT}:localhost:${REMOTE_MONGO_PORT}" "$NEW_SSH_HOST" &
NEW_PID=$!

sleep 2

echo "Old server tunnel: mongodb://localhost:${OLD_LOCAL_PORT}  (pid $OLD_PID)"
echo "New server tunnel: mongodb://localhost:${NEW_LOCAL_PORT}  (pid $NEW_PID)"
echo
echo "In another terminal:"
echo "  export OLD_MONGODB_URI=mongodb://localhost:${OLD_LOCAL_PORT}"
echo "  export NEW_MONGODB_URI=mongodb://localhost:${NEW_LOCAL_PORT}"
echo
echo "Leave this running. Ctrl-C to close both tunnels."

wait
