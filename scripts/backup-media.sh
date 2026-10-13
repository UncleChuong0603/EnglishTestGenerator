#!/usr/bin/env sh
set -eu

REPO_ROOT="${TOEICGYM_REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd -P)}"
cd "$REPO_ROOT"
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

find "$BACKUP_DIR" -type f -name 'toeicgym-media-*.tar.gz' -mtime +14 -print |
  while IFS= read -r expired; do rm -f "$expired" "$expired.sha256" "$expired.manifest"; done
find "$BACKUP_DIR" -type f -name 'toeicgym-media-*.tar.gz.sha256' -mtime +14 -delete
find "$BACKUP_DIR" -type f -name 'toeicgym-media-*.tar.gz.manifest' -mtime +14 -delete
trap - EXIT HUP INT TERM
echo "$FINAL"
