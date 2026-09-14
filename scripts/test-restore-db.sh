#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."
: "${1:?Usage: scripts/test-restore-db.sh /absolute/path/backup.dump}"
test -f .env.production || { echo ".env.production is required" >&2; exit 1; }
BACKUP_FILE="$(cd "$(dirname "$1")" && pwd -P)/$(basename "$1")"
test -f "$BACKUP_FILE"
TEST_DB="restore_test_$(date -u +%Y%m%d%H%M%S)_$$"

cleanup() {
  docker compose --env-file .env.production exec -T postgres sh -c 'dropdb --if-exists -U "$POSTGRES_USER" "$1"' sh "$TEST_DB" >/dev/null 2>&1 || true
}
trap cleanup EXIT
docker compose --env-file .env.production exec -T postgres sh -c 'createdb -U "$POSTGRES_USER" "$1"' sh "$TEST_DB"
docker compose --env-file .env.production exec -T postgres sh -c 'pg_restore --exit-on-error --no-owner -U "$POSTGRES_USER" -d "$1"' sh "$TEST_DB" < "$BACKUP_FILE"
docker compose --env-file .env.production exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$1" -c "select count(*) from users" -c "select count(*) from questions"' sh "$TEST_DB"
echo "Restore test passed in an isolated temporary database."
