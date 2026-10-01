#!/usr/bin/env bash
set -euo pipefail
archive="/tmp/task42-source.tar.gz"
test -f "$archive"
phase="${TASK42_QA_PHASE:-full}"
case "$phase" in full|integration) ;; *) echo "Refusing unknown QA phase"; exit 1 ;; esac
if [ -n "${TASK42_QA_SOURCE:-}" ]; then
  qa_dir="$(realpath "$TASK42_QA_SOURCE")"
  case "$qa_dir" in /tmp/toeic-task42.*) ;; *) echo "Refusing non-QA source"; exit 1 ;; esac
  test -f "$qa_dir/scripts/task42-integration.mts"
else
  qa_dir="$(mktemp -d /tmp/toeic-task42.XXXXXX)"
  tar -xzf "$archive" -C "$qa_dir"
fi
printf 'QA_DIRECTORY=%s\n' "$qa_dir"
network="toeicgym-task42-qa"
database="toeicgym-task42-qa-postgres"
if docker network inspect "$network" >/dev/null 2>&1 || docker inspect "$database" >/dev/null 2>&1; then
  echo "Refusing pre-existing Task42 QA targets"; exit 1
fi
docker network create --label task=task42-isolated "$network" >/dev/null
cleanup() {
  if [ "$(docker inspect --format='{{index .Config.Labels "task"}}' "$database" 2>/dev/null || true)" = "task42-isolated" ]; then docker rm -f "$database" >/dev/null; fi
  if [ "$(docker network inspect --format='{{index .Labels "task"}}' "$network" 2>/dev/null || true)" = "task42-isolated" ]; then docker network rm "$network" >/dev/null || true; fi
}
trap cleanup EXIT
docker run -d --name "$database" --label task=task42-isolated --network "$network" --network-alias task42-postgres \
  -e POSTGRES_USER=task42 -e POSTGRES_PASSWORD=qa-only-not-production -e POSTGRES_DB=toeicgym_task42 postgres:17-alpine >/dev/null
for attempt in $(seq 1 30); do
  if docker exec "$database" pg_isready -U task42 -d toeicgym_task42 >/dev/null; then break; fi
  sleep 1
done
docker run --rm --label task=task42-isolated --network "$network" -v "$qa_dir:/work" -w /work \
  -e TASK42_QA=isolated-task42 -e CI=true -e NEXT_TELEMETRY_DISABLED=1 \
  -e TASK42_QA_PHASE="$phase" \
  -e TASK42_QA_PRE_MIGRATED="${TASK42_QA_PRE_MIGRATED:-}" \
  -e DATABASE_URL=postgresql://task42:qa-only-not-production@task42-postgres:5432/toeicgym_task42 \
  -e SESSION_SECRET=task42-qa-isolated-session-secret-no-production \
  -e APP_URL=https://toeicgym-task42.invalid -e MEDIA_ENABLED=false \
  mcr.microsoft.com/playwright:v1.63.0-noble bash -lc \
  'set -euo pipefail; if [ ! -d node_modules ]; then npm ci --no-audit --no-fund; fi; node --conditions=react-server --import tsx scripts/task42-integration.mts; if [ "$TASK42_QA_PHASE" = "full" ]; then npm run lint; npx next typegen; npm run typecheck; npm test -- --maxWorkers=1; npm run build; npx playwright test --config=playwright.task42.config.ts; fi' \
  2>&1 | tee "$qa_dir/qa-$phase.log"
echo "QA_FINISHED=$qa_dir"
