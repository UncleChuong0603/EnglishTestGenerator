#!/usr/bin/env sh
set -eu

# Conservative host cleanup for the production VPS. It never prunes volumes or
# images referenced by containers. Build cache is retained while there is enough
# free space, then trimmed toward the configured free-space target.
MIN_FREE_SPACE="${DOCKER_MIN_FREE_SPACE:-12GB}"
RESERVED_CACHE="${DOCKER_RESERVED_CACHE:-1GB}"
MAX_CACHE="${DOCKER_MAX_CACHE:-4GB}"
JOURNAL_MAX_SIZE="${JOURNAL_MAX_SIZE:-300M}"
MAX_DISK_PERCENT="${MAX_DISK_PERCENT:-90}"
PROJECT="${COMPOSE_PROJECT_NAME:-toeic-gym-frontend-bhwkds}"
MIGRATOR_IMAGE="${TOEICGYM_MIGRATOR_IMAGE:-$PROJECT-migrate:latest}"

case "$MAX_DISK_PERCENT" in
  ''|*[!0-9]*) echo "MAX_DISK_PERCENT must be a whole number" >&2; exit 1 ;;
esac

before="$(df -P / | awk 'NR==2 {gsub(/%/, "", $5); print $5}')"
printf 'root_disk_percent_before=%s\n' "$before"

# One-shot TOEICGym Compose jobs and dangling layers are reproducible. Containers
# from other Dokploy apps, named volumes and active images stay outside scope.
docker container prune --force --filter 'until=24h' \
  --filter "label=com.docker.compose.project=$PROJECT" >/dev/null

# The migrator contains the full development dependency tree and is only needed
# during a deployment. Once its one-shot container has aged out, let the next
# deploy rebuild it from cache instead of retaining ~1 GB as a runtime image.
if ! docker ps -a --quiet --filter "ancestor=$MIGRATOR_IMAGE" | grep -q .; then
  docker image rm "$MIGRATOR_IMAGE" >/dev/null 2>&1 || true
fi
docker image prune --force --filter 'until=168h' >/dev/null

if docker builder prune --help 2>&1 | grep -q -- '--min-free-space'; then
  docker builder prune --force \
    --min-free-space "$MIN_FREE_SPACE" \
    --reserved-space "$RESERVED_CACHE" \
    --max-used-space "$MAX_CACHE" >/dev/null
else
  docker builder prune --force --filter 'until=168h' >/dev/null
fi

if command -v journalctl >/dev/null 2>&1; then
  journalctl --vacuum-size="$JOURNAL_MAX_SIZE" >/dev/null
fi

after="$(df -P / | awk 'NR==2 {gsub(/%/, "", $5); print $5}')"
printf 'root_disk_percent_after=%s\n' "$after"
if [ "$after" -gt "$MAX_DISK_PERCENT" ]; then
  echo "storage_status=failed"
  exit 1
fi
echo "storage_status=ok"
