#!/usr/bin/env sh
set -eu

REPO_ROOT="${TOEICGYM_REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd -P)}"
cd "$REPO_ROOT"
. scripts/lib/compose-command.sh
BACKUP_DIR="${1:-/opt/toeicgym/media-backups}"
RETENTION_DAYS="${MEDIA_BACKUP_RETENTION_DAYS:-14}"
RETENTION_COUNT="${MEDIA_BACKUP_RETENTION_COUNT:-3}"
case "$RETENTION_DAYS:$RETENTION_COUNT" in
  *[!0-9:]*) echo "Backup retention must use whole numbers" >&2; exit 1 ;;
esac
[ "$RETENTION_COUNT" -ge 1 ] || {
  echo "MEDIA_BACKUP_RETENTION_COUNT must be at least 1" >&2
  exit 1
}
umask 077
mkdir -p "$BACKUP_DIR"
BACKUP_DIR="$(cd "$BACKUP_DIR" && pwd -P)"
if [ "$BACKUP_DIR" = "/" ]; then echo "Refusing to use / as BACKUP_DIR" >&2; exit 1; fi

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FINAL="$BACKUP_DIR/toeicgym-media-$STAMP.tar.gz"
PARTIAL="$FINAL.partial"
CHECKSUM="$FINAL.sha256"
MANIFEST="$FINAL.manifest"
cleanup() { rm -f "$PARTIAL" "$CHECKSUM.partial" "$MANIFEST.partial"; }
trap cleanup EXIT HUP INT TERM

# Write through a dedicated host bind mount. Docker Compose progress output can
# be written to stdout by some releases, so streaming stdout into the archive
# can silently corrupt an otherwise successful backup.
ARCHIVE_NAME="$(basename "$PARTIAL")"
MANIFEST_NAME="$(basename "$MANIFEST").partial"
compose run --rm --no-deps -T \
  -e ARCHIVE_NAME="$ARCHIVE_NAME" -e MANIFEST_NAME="$MANIFEST_NAME" \
  -v "$BACKUP_DIR:/backup" db-tools sh -c '
    set -eu
    cd /var/lib/toeicgym/media
    files="$(find . -type f | wc -l | tr -d " ")"
    bytes="$(find . -type f -printf "%s\n" | awk "{ total += \$1 } END { print total + 0 }")"
    printf "files=%s\nbytes=%s\n" "$files" "$bytes" > "/backup/$MANIFEST_NAME"
    tar -czf "/backup/$ARCHIVE_NAME" .
  '
test -s "$PARTIAL"
tar -tzf "$PARTIAL" > /dev/null
mv "$PARTIAL" "$FINAL"
mv "$MANIFEST.partial" "$MANIFEST"
(
  cd "$BACKUP_DIR"
  sha256sum "$(basename "$FINAL")" > "$(basename "$CHECKSUM").partial"
)
mv "$CHECKSUM.partial" "$CHECKSUM"
chmod 600 "$FINAL" "$CHECKSUM" "$MANIFEST"

find "$BACKUP_DIR" -type f -name 'toeicgym-media-*.tar.gz' -mtime "+$RETENTION_DAYS" -print |
  while IFS= read -r expired; do rm -f "$expired" "$expired.sha256" "$expired.manifest"; done
find "$BACKUP_DIR" -type f -name 'toeicgym-media-*.tar.gz.sha256' -mtime "+$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -type f -name 'toeicgym-media-*.tar.gz.manifest' -mtime "+$RETENTION_DAYS" -delete

# Day-only retention can exhaust a small production host after manual backups.
# Keep the newest complete sets as a second bound. This runs only after the new
# archive has passed checksum and readability validation.
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'toeicgym-media-*.tar.gz' \
  -printf '%T@ %p\n' | sort -nr | tail -n "+$((RETENTION_COUNT + 1))" | \
  cut -d ' ' -f 2- | while IFS= read -r expired; do
    [ -n "$expired" ] && rm -f "$expired" "$expired.sha256" "$expired.manifest"
  done
trap - EXIT HUP INT TERM
echo "$FINAL"
