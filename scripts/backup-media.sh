#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."
. scripts/lib/compose-command.sh
BACKUP_DIR="${1:-/opt/toeicgym/media-backups}"
umask 077
mkdir -p "$BACKUP_DIR"
BACKUP_DIR="$(cd "$BACKUP_DIR" && pwd -P)"
if [ "$BACKUP_DIR" = "/" ]; then echo "Refusing to use / as BACKUP_DIR" >&2; exit 1; fi

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FINAL="$BACKUP_DIR/toeicgym-media-$STAMP.tar.gz"
PARTIAL="$FINAL.partial"
CHECKSUM="$FINAL.sha256"
cleanup() { rm -f "$PARTIAL" "$CHECKSUM.partial"; }
trap cleanup EXIT HUP INT TERM

# The database-tools image mounts the same named media volume as the app. Read
# it only and stream the archive to the host so no second copy exists in Docker.
compose run --rm --no-deps -T db-tools sh -c 'cd /var/lib/toeicgym/media && tar -czf - .' > "$PARTIAL"
test -s "$PARTIAL"
tar -tzf "$PARTIAL" > /dev/null
mv "$PARTIAL" "$FINAL"
(
  cd "$BACKUP_DIR"
  sha256sum "$(basename "$FINAL")" > "$(basename "$CHECKSUM").partial"
)
mv "$CHECKSUM.partial" "$CHECKSUM"
chmod 600 "$FINAL" "$CHECKSUM"

find "$BACKUP_DIR" -type f -name 'toeicgym-media-*.tar.gz' -mtime +14 -print |
  while IFS= read -r expired; do rm -f "$expired" "$expired.sha256"; done
find "$BACKUP_DIR" -type f -name 'toeicgym-media-*.tar.gz.sha256' -mtime +14 -delete
trap - EXIT HUP INT TERM
echo "$FINAL"
