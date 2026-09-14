#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."
test -f .env.production || { echo ".env.production is required" >&2; exit 1; }
chmod 600 .env.production

compose() {
  if grep -q '^NGINX_CONFIG=https\.conf\.template$' .env.production; then
    docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.https.yml "$@"
  else
    docker compose --env-file .env.production -f docker-compose.yml "$@"
  fi
}

compose config --quiet
compose build app migrate db-tools
compose up -d postgres
compose run --rm migrate
compose run --rm db-tools npm run seed:reading:production
compose run --rm db-tools npm run verify:production-db
compose up -d app nginx

attempt=0
until compose exec -T app node -e "fetch('http://127.0.0.1:3000/api/health').then(async r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 12 ]; then
    echo "Application health check failed" >&2
    compose ps
    exit 1
  fi
  sleep 5
done
compose ps
echo "Deployment completed and the internal health check passed."
