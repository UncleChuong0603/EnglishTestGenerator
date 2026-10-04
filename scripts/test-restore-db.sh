#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."
: "${1:?Usage: scripts/test-restore-db.sh /absolute/path/backup.dump}"
. scripts/lib/compose-command.sh
BACKUP_FILE="$(cd "$(dirname "$1")" && pwd -P)/$(basename "$1")"
test -f "$BACKUP_FILE"
TEST_DB="restore_test_$(date -u +%Y%m%d%H%M%S)_$$"

if [ -f "$BACKUP_FILE.sha256" ]; then
  (cd "$(dirname "$BACKUP_FILE")" && sha256sum -c "$(basename "$BACKUP_FILE").sha256") > /dev/null
else
  echo "Warning: backup has no checksum sidecar; archive validation will still run." >&2
fi
compose exec -T postgres pg_restore --list < "$BACKUP_FILE" > /dev/null

cleanup() {
  compose exec -T postgres sh -c 'dropdb --if-exists -U "$POSTGRES_USER" "$1"' sh "$TEST_DB" >/dev/null 2>&1 || true
}
trap cleanup EXIT
if [ "$COMPOSE_FILE_PATH" = "docker-compose.dokploy.yml" ]; then
  compose exec -T postgres sh -c 'createdb -U "$POSTGRES_USER" -O "$APP_DATABASE_USER" "$1"' sh "$TEST_DB"
  compose exec -T postgres sh -c 'pg_restore --exit-on-error --no-owner --no-privileges -U "$APP_DATABASE_USER" -d "$1"' sh "$TEST_DB" < "$BACKUP_FILE"
else
  compose exec -T postgres sh -c 'createdb -U "$POSTGRES_USER" "$1"' sh "$TEST_DB"
  compose exec -T postgres sh -c 'pg_restore --exit-on-error --no-owner --no-privileges -U "$POSTGRES_USER" -d "$1"' sh "$TEST_DB" < "$BACKUP_FILE"
fi
compose exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$1" -c "select count(*) from users" -c "select count(*) from questions"' sh "$TEST_DB"
compose run --rm -e TEST_DB="$TEST_DB" db-tools sh -c '
  DATABASE_URL="$(node -e '\''const url = new URL(process.env.DATABASE_URL); url.pathname = `/${process.env.TEST_DB}`; process.stdout.write(url.href)'\'')"
  export DATABASE_URL
  npm run verify:production-db
'

# Boot the exact production image against the restored database and require its
# health endpoint to complete a real query. The one-off container is not routed
# by Traefik and is removed when this check exits.
compose run --rm --no-deps -T -e TEST_DB="$TEST_DB" app node -e '
  const { spawn } = require("node:child_process");
  const restoredUrl = new URL(process.env.DATABASE_URL);
  restoredUrl.pathname = `/${process.env.TEST_DB}`;
  const child = spawn(process.execPath, ["server.js"], {
    env: { ...process.env, DATABASE_URL: restoredUrl.href, HOSTNAME: "127.0.0.1", PORT: "3100" },
    stdio: "ignore",
  });
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const stop = async () => {
    if (child.exitCode !== null) return;
    child.kill("SIGTERM");
    await Promise.race([new Promise((resolve) => child.once("exit", resolve)), wait(3000)]);
    if (child.exitCode === null) child.kill("SIGKILL");
  };
  (async () => {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      try {
        const response = await fetch("http://127.0.0.1:3100/api/health");
        const body = await response.json();
        if (response.ok && body.status === "ok" && body.database === "reachable") {
          await stop();
          return;
        }
      } catch { /* Server is still starting. */ }
      await wait(1000);
    }
    throw new Error("restored app did not become healthy");
  })().catch(async () => {
    await stop();
    console.error("Restored app boot verification failed");
    process.exitCode = 1;
  });
'
echo "Restore test and isolated production-image boot passed."
