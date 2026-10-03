#!/usr/bin/env bash
set -euo pipefail

archive="/tmp/task45-source.tar.gz"
test -f "$archive"
qa_dir="$(mktemp -d /tmp/toeic-task45.XXXXXX)"
tar -xzf "$archive" -C "$qa_dir"
network="toeicgym-task45-qa"
database="toeicgym-task45-qa-postgres"
if docker network inspect "$network" >/dev/null 2>&1 || docker inspect "$database" >/dev/null 2>&1; then
  echo "Refusing pre-existing Task45 QA targets"
  exit 1
fi
docker network create --label task=task45-isolated "$network" >/dev/null
cleanup() {
  if [ "$(docker inspect --format='{{index .Config.Labels "task"}}' "$database" 2>/dev/null || true)" = "task45-isolated" ]; then docker rm -f "$database" >/dev/null; fi
  if [ "$(docker network inspect --format='{{index .Labels "task"}}' "$network" 2>/dev/null || true)" = "task45-isolated" ]; then docker network rm "$network" >/dev/null || true; fi
}
trap cleanup EXIT
docker run -d --name "$database" --label task=task45-isolated --network "$network" --network-alias task45-postgres \
  -e POSTGRES_USER=task45 -e POSTGRES_PASSWORD=qa-only-not-production -e POSTGRES_DB=task45_clean postgres:17-alpine >/dev/null
for _attempt in $(seq 1 30); do
  if docker exec "$database" pg_isready -U task45 -d task45_clean >/dev/null; then break; fi
  sleep 1
done
sleep 2
docker exec "$database" pg_isready -U task45 -d task45_clean >/dev/null
docker exec "$database" createdb -U task45 task45_upgrade
migrator="toeic-gym-frontend-bhwkds-migrate:latest"
docker image inspect "$migrator" >/dev/null
docker run --rm --label task=task45-isolated --network "$network" -v "$qa_dir/drizzle:/app/drizzle:ro" \
  -e DATABASE_URL=postgresql://task45:qa-only-not-production@task45-postgres:5432/task45_clean "$migrator" npm run db:migrate >/dev/null
docker run --rm --label task=task45-isolated --network "$network" -v "$qa_dir/drizzle:/app/drizzle:ro" \
  -e DATABASE_URL=postgresql://task45:qa-only-not-production@task45-postgres:5432/task45_clean "$migrator" npm run db:migrate >/dev/null
# The current production migrator image ends at 0049; use it to model an upgrade.
docker run --rm --label task=task45-isolated --network "$network" \
  -e DATABASE_URL=postgresql://task45:qa-only-not-production@task45-postgres:5432/task45_upgrade "$migrator" npm run db:migrate >/dev/null
docker run --rm --label task=task45-isolated --network "$network" -v "$qa_dir/drizzle:/app/drizzle:ro" \
  -e DATABASE_URL=postgresql://task45:qa-only-not-production@task45-postgres:5432/task45_upgrade "$migrator" npm run db:migrate >/dev/null
docker run --rm --label task=task45-isolated --network "$network" -v "$qa_dir/drizzle:/app/drizzle:ro" \
  -e DATABASE_URL=postgresql://task45:qa-only-not-production@task45-postgres:5432/task45_upgrade "$migrator" npm run db:migrate >/dev/null
for qa_database in task45_clean task45_upgrade; do
  table_present="$(docker exec "$database" psql -U task45 -d "$qa_database" -Atc "select to_regclass('public.mistake_reason_classifications') is not null")"
  migration_count="$(docker exec "$database" psql -U task45 -d "$qa_database" -Atc 'select count(*) from drizzle.__drizzle_migrations')"
  if [ "$table_present" != "t" ] || [ "$migration_count" != "51" ]; then echo "Task45 isolated migration verification failed"; exit 1; fi
  echo "$qa_database: table=present migrations=$migration_count"
done
echo "TASK45_PG17_QA=PASS"
