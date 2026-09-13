#!/usr/bin/env sh
set -eu
: "${1:?Usage: scripts/restore-db.sh /absolute/path/backup.dump}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${POSTGRES_USER:?POSTGRES_USER is required}"
test -f "$1"
docker compose exec -T postgres pg_restore --clean --if-exists --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$1"
