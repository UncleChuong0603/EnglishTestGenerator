#!/usr/bin/env sh
set -eu

PROJECT="${COMPOSE_PROJECT_NAME:-toeic-gym-frontend-bhwkds}"
DB_BACKUP_DIR="${DB_BACKUP_DIR:-/opt/toeicgym/backups}"
MEDIA_BACKUP_DIR="${MEDIA_BACKUP_DIR:-/opt/toeicgym/media-backups}"
MAX_BACKUP_AGE_SECONDS="${MAX_BACKUP_AGE_SECONDS:-93600}"
MAX_DISK_PERCENT="${MAX_DISK_PERCENT:-90}"
case "$PROJECT" in *[!A-Za-z0-9_-]*) echo "invalid_project=1"; exit 1;; esac

failed=0
check_service() {
  name="$1"; expected_health="$2"
  state="$(docker inspect --format '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}} {{.RestartCount}}' "$PROJECT-$name-1" 2>/dev/null || printf 'missing none 0')"
  service_state="$(printf '%s' "$state" | awk '{print $1}')"
  service_health="$(printf '%s' "$state" | awk '{print $2}')"
  service_restarts="$(printf '%s' "$state" | awk '{print $3}')"
  printf '%s_state=%s %s_health=%s %s_restarts=%s\n' "$name" "$service_state" "$name" "$service_health" "$name" "$service_restarts"
  [ "$service_state" = "running" ] || failed=1
  [ "$expected_health" = "none" ] || [ "$service_health" = "$expected_health" ] || failed=1
}

check_freshness() {
  label="$1"; directory="$2"; pattern="$3"
  latest="$(find "$directory" -maxdepth 1 -type f -name "$pattern" -printf '%T@\n' 2>/dev/null | sort -n | tail -1 | cut -d. -f1)"
  if [ -z "$latest" ]; then
    printf '%s_backup_age_seconds=missing\n' "$label"
    failed=1
    return
  fi
  age="$(( $(date -u +%s) - latest ))"
  printf '%s_backup_age_seconds=%s\n' "$label" "$age"
  [ "$age" -le "$MAX_BACKUP_AGE_SECONDS" ] || failed=1
}

check_service app healthy
check_service postgres healthy
check_service lifecycle-scheduler none
check_service mobile-retention-scheduler none

http_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 https://toeicgym.net/api/health || printf '000')"
printf 'https_health_status=%s\n' "$http_code"
[ "$http_code" = "200" ] || failed=1

disk_percent="$(df -P / | awk 'NR==2 {gsub(/%/, "", $5); print $5}')"
printf 'root_disk_percent=%s\n' "$disk_percent"
[ "$disk_percent" -le "$MAX_DISK_PERCENT" ] || failed=1

check_freshness db "$DB_BACKUP_DIR" 'english-test-*.dump'
check_freshness media "$MEDIA_BACKUP_DIR" 'toeicgym-media-*.tar.gz'

printf 'ops_status=%s\n' "$([ "$failed" -eq 0 ] && printf ok || printf failed)"
exit "$failed"
