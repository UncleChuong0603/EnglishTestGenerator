#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."
: "${1:?Usage: scripts/test-restore-db.sh /absolute/path/backup.dump}"
. scripts/lib/compose-command.sh
BACKUP_FILE="$(cd "$(dirname "$1")" && pwd -P)/$(basename "$1")"
test -f "$BACKUP_FILE"
TEST_DB="restore_test_$(date -u +%Y%m%d%H%M%S)_$$"

cleanup() {
  compose exec -T postgres sh -c 'dropdb --if-exists -U "$POSTGRES_USER" "$1"' sh "$TEST_DB" >/dev/null 2>&1 || true
}
trap cleanup EXIT
if [ "$COMPOSE_FILE_PATH" = "docker-compose.dokploy.yml" ]; then
  compose exec -T postgres sh -c 'createdb -U "$POSTGRES_USER" -O "$APP_DATABASE_USER" "$1"' sh "$TEST_DB"
  compose exec -T postgres sh -c 'pg_restore --exit-on-error --no-owner -U "$APP_DATABASE_USER" -d "$1"' sh "$TEST_DB" < "$BACKUP_FILE"
else
  compose exec -T postgres sh -c 'createdb -U "$POSTGRES_USER" "$1"' sh "$TEST_DB"
  compose exec -T postgres sh -c 'pg_restore --exit-on-error --no-owner -U "$POSTGRES_USER" -d "$1"' sh "$TEST_DB" < "$BACKUP_FILE"
fi
compose exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$1" -c "select count(*) from users" -c "select count(*) from questions"' sh "$TEST_DB"
compose run --rm -e TEST_DB="$TEST_DB" db-tools sh -c '
  DATABASE_URL="$(node -e '\''const url = new URL(process.env.DATABASE_URL); url.pathname = `/${process.env.TEST_DB}`; process.stdout.write(url.href)'\'')"
  export DATABASE_URL
  npm run verify:production-db
'
echo "Restore test passed in an isolated temporary database."
