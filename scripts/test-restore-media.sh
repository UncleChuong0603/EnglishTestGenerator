#!/usr/bin/env sh
set -eu

: "${1:?Usage: scripts/test-restore-media.sh /absolute/path/backup.tar.gz}"
BACKUP_FILE="$(cd "$(dirname "$1")" && pwd -P)/$(basename "$1")"
test -f "$BACKUP_FILE"
test -f "$BACKUP_FILE.sha256"
test -f "$BACKUP_FILE.manifest"

(cd "$(dirname "$BACKUP_FILE")" && sha256sum -c "$(basename "$BACKUP_FILE").sha256") > /dev/null
tar -tzf "$BACKUP_FILE" > /dev/null

RESTORE_DIR="$(mktemp -d /tmp/toeicgym-media-restore.XXXXXX)"
case "$RESTORE_DIR" in /tmp/toeicgym-media-restore.*) ;; *) echo "Unsafe restore directory" >&2; exit 1;; esac
cleanup() {
  case "$RESTORE_DIR" in /tmp/toeicgym-media-restore.*) rm -rf -- "$RESTORE_DIR";; esac
}
trap cleanup EXIT HUP INT TERM

tar -xzf "$BACKUP_FILE" --no-same-owner --no-same-permissions -C "$RESTORE_DIR"
unsafe="$(find "$RESTORE_DIR" -mindepth 1 ! -type f ! -type d | wc -l | tr -d ' ')"
test "$unsafe" -eq 0
actual_files="$(find "$RESTORE_DIR" -type f | wc -l | tr -d ' ')"
actual_bytes="$(find "$RESTORE_DIR" -type f -printf '%s\n' | awk '{ total += $1 } END { print total + 0 }')"
expected_files="$(sed -n 's/^files=//p' "$BACKUP_FILE.manifest")"
expected_bytes="$(sed -n 's/^bytes=//p' "$BACKUP_FILE.manifest")"
case "$expected_files:$expected_bytes" in *[!0-9:]*) echo "Invalid media backup manifest" >&2; exit 1;; esac
test "$actual_files" -eq "$expected_files"
test "$actual_bytes" -eq "$expected_bytes"

printf 'Media restore test passed: files=%s bytes=%s\n' "$actual_files" "$actual_bytes"
