#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
: "${1:?Usage: scripts/restore-db.sh /absolute/path/backup.dump}"
. scripts/lib/compose-command.sh
BACKUP_FILE="$(cd "$(dirname "$1")" && pwd -P)/$(basename "$1")"
test -f "$BACKUP_FILE"

echo "Stopping application writes and creating a safety backup..."
compose stop app
restart_app=true
trap 'if [ "$restart_app" = true ]; then compose up -d $PUBLIC_SERVICES; fi' EXIT
COMPOSE_ENV_FILE="$COMPOSE_ENV_FILE" COMPOSE_FILE_PATH="$COMPOSE_FILE_PATH" sh scripts/backup-db.sh "${BACKUP_DIR:-/opt/toeic-app/backups}"
if [ "$COMPOSE_FILE_PATH" = "docker-compose.dokploy.yml" ]; then
  compose exec -T postgres sh -c 'pg_restore --clean --if-exists --no-owner -U "$APP_DATABASE_USER" -d "$POSTGRES_DB"' < "$BACKUP_FILE"
else
  compose exec -T postgres sh -c 'pg_restore --clean --if-exists --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < "$BACKUP_FILE"
fi
compose up -d $PUBLIC_SERVICES
restart_app=false
compose run --rm db-tools npm run verify:production-db
echo "Restore and integrity verification completed."
