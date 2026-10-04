#!/usr/bin/env bash
set -euo pipefail

archive="/tmp/task46-source.tar.gz"
test -f "$archive"
qa_dir="$(mktemp -d /tmp/toeic-task46.XXXXXX)"
prior_dir="$(mktemp -d /tmp/toeic-task46-prior.XXXXXX)"
tar -xzf "$archive" -C "$qa_dir"
cp -R "$qa_dir/drizzle/." "$prior_dir/"
node_image="node:22-alpine"
docker run --rm --label task=task46-isolated -v "$prior_dir:/work" "$node_image" node -e '
  const fs=require("fs");
  const path="/work/meta/_journal.json";
  const journal=JSON.parse(fs.readFileSync(path,"utf8"));
  journal.entries=journal.entries.filter((entry)=>entry.tag!=="0051_task46_remediation_context");
  fs.writeFileSync(path,JSON.stringify(journal,null,2)+"\n");
  fs.rmSync("/work/0051_task46_remediation_context.sql");
'
network="toeicgym-task46-qa"
database="toeicgym-task46-qa-postgres"
migrator="toeicgym-task46-migrator-qa:latest"
if docker network inspect "$network" >/dev/null 2>&1 || docker inspect "$database" >/dev/null 2>&1 || docker image inspect "$migrator" >/dev/null 2>&1; then
  echo "Refusing pre-existing Task46 QA targets"
  exit 1
fi
docker network create --label task=task46-isolated "$network" >/dev/null
cleanup() {
  if [ "$(docker inspect --format='{{index .Config.Labels "task"}}' "$database" 2>/dev/null || true)" = "task46-isolated" ]; then docker rm -f "$database" >/dev/null; fi
  if [ "$(docker network inspect --format='{{index .Labels "task"}}' "$network" 2>/dev/null || true)" = "task46-isolated" ]; then docker network rm "$network" >/dev/null || true; fi
  if [ "$(docker image inspect --format='{{index .Config.Labels "task"}}' "$migrator" 2>/dev/null || true)" = "task46-isolated" ]; then docker image rm "$migrator" >/dev/null || true; fi
  rm -rf "$qa_dir" "$prior_dir"
}
trap cleanup EXIT
docker run -d --name "$database" --label task=task46-isolated --network "$network" --network-alias task46-postgres \
  -e POSTGRES_USER=task46 -e POSTGRES_PASSWORD=qa-only-not-production -e POSTGRES_DB=task46_clean postgres:17-alpine >/dev/null
for _attempt in $(seq 1 30); do
  if docker exec "$database" pg_isready -U task46 -d task46_clean >/dev/null; then break; fi
  sleep 1
done
sleep 2
docker exec "$database" pg_isready -U task46 -d task46_clean >/dev/null
docker exec "$database" createdb -U task46 task46_upgrade
docker build --target migrator --label task=task46-isolated -t "$migrator" "$qa_dir" >/dev/null
run_migrations() {
  local database_name="$1"
  local drizzle_dir="$2"
  docker run --rm --label task=task46-isolated --network "$network" -v "$drizzle_dir:/app/drizzle:ro" \
    -e DATABASE_URL="postgresql://task46:qa-only-not-production@task46-postgres:5432/$database_name" "$migrator" npm run db:migrate >/dev/null
}
run_migrations task46_clean "$qa_dir/drizzle"
run_migrations task46_clean "$qa_dir/drizzle"
run_migrations task46_upgrade "$prior_dir"
prior_count="$(docker exec "$database" psql -U task46 -d task46_upgrade -Atc 'select count(*) from drizzle.__drizzle_migrations')"
test "$prior_count" = "51"
run_migrations task46_upgrade "$qa_dir/drizzle"
run_migrations task46_upgrade "$qa_dir/drizzle"
for qa_database in task46_clean task46_upgrade; do
  table_present="$(docker exec "$database" psql -U task46 -d "$qa_database" -Atc "select to_regclass('public.remediation_session_contexts') is not null")"
  migration_count="$(docker exec "$database" psql -U task46 -d "$qa_database" -Atc 'select count(*) from drizzle.__drizzle_migrations')"
  if [ "$table_present" != "t" ] || [ "$migration_count" != "52" ]; then echo "Task46 isolated migration verification failed"; exit 1; fi
  echo "$qa_database: table=present migrations=$migration_count"
done
echo "TASK46_PG17_QA=PASS"
