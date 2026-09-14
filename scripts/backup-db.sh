#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
test -f .env.production || { echo ".env.production is required" >&2; exit 1; }
BACKUP_DIR="${1:-/opt/toeic-app/backups}"
umask 077
mkdir -p "$BACKUP_DIR"
BACKUP_DIR="$(cd "$BACKUP_DIR" && pwd -P)"
if [ "$BACKUP_DIR" = "/" ]; then echo "Refusing to use / as BACKUP_DIR" >&2; exit 1; fi
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
docker compose --env-file .env.production exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$BACKUP_DIR/english-test-$STAMP.dump"
test -s "$BACKUP_DIR/english-test-$STAMP.dump"
find "$BACKUP_DIR" -type f -name 'english-test-*.dump' -mtime +14 -delete
echo "$BACKUP_DIR/english-test-$STAMP.dump"
