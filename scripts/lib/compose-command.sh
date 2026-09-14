#!/usr/bin/env sh

COMPOSE_ENV_FILE="${COMPOSE_ENV_FILE:-.env.production}"
COMPOSE_FILE_PATH="${COMPOSE_FILE_PATH:-docker-compose.yml}"

test -f "$COMPOSE_ENV_FILE" || {
  echo "$COMPOSE_ENV_FILE is required" >&2
  exit 1
}

compose() {
  if [ "$COMPOSE_FILE_PATH" = "docker-compose.yml" ] && grep -q '^NGINX_CONFIG=https\.conf\.template$' "$COMPOSE_ENV_FILE"; then
    docker compose --env-file "$COMPOSE_ENV_FILE" -f docker-compose.yml -f docker-compose.https.yml "$@"
  else
    docker compose --env-file "$COMPOSE_ENV_FILE" -f "$COMPOSE_FILE_PATH" "$@"
  fi
}

if [ "$COMPOSE_FILE_PATH" = "docker-compose.dokploy.yml" ]; then
  PUBLIC_SERVICES="app"
else
  PUBLIC_SERVICES="app nginx"
fi
