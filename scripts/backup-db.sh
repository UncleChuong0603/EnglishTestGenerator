#!/usr/bin/env sh
set -eu
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${POSTGRES_USER:?POSTGRES_USER is required}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/english-test}"
umask 077
mkdir -p "$BACKUP_DIR"
BACKUP_DIR="$(cd "$BACKUP_DIR" && pwd -P)"
if [ "$BACKUP_DIR" = "/" ]; then echo "Refusing to use / as BACKUP_DIR" >&2; exit 1; fi
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "$BACKUP_DIR/english-test-$STAMP.dump"
find "$BACKUP_DIR" -type f -name 'english-test-*.dump' -mtime +14 -delete
echo "$BACKUP_DIR/english-test-$STAMP.dump"
