#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
: "${1:?Usage: scripts/restore-db.sh /absolute/path/backup.dump}"
test -f .env.production || { echo ".env.production is required" >&2; exit 1; }
BACKUP_FILE="$(cd "$(dirname "$1")" && pwd -P)/$(basename "$1")"
test -f "$BACKUP_FILE"

compose() {
  if grep -q '^NGINX_CONFIG=https\.conf\.template$' .env.production; then
    docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.https.yml "$@"
  else
    docker compose --env-file .env.production -f docker-compose.yml "$@"
  fi
}

echo "Stopping application writes and creating a safety backup..."
compose stop app
restart_app=true
trap 'if [ "$restart_app" = true ]; then compose up -d app nginx; fi' EXIT
sh scripts/backup-db.sh "${BACKUP_DIR:-/opt/toeic-app/backups}"
compose exec -T postgres sh -c 'pg_restore --clean --if-exists --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < "$BACKUP_FILE"
compose up -d app nginx
restart_app=false
compose run --rm db-tools npm run verify:production-db
echo "Restore and integrity verification completed."
