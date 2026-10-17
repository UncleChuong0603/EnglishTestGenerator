import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path) => readFileSync(path, "utf8");

describe("Task 54 backup and recovery controls", () => {
  it("creates atomic, validated database archives with checksums", () => {
    const backup = read("scripts/backup-db.sh");
    expect(backup).toContain("--no-owner --no-privileges");
    expect(backup).toContain("pg_restore --list");
    expect(backup).toContain(".partial");
    expect(backup).toContain("sha256sum");
  });

  it("restores without environment-specific ACLs and boots the production image", () => {
    const restoreTest = read("scripts/test-restore-db.sh");
    expect(restoreTest).toContain("--no-owner --no-privileges");
    expect(restoreTest).toContain("compose run --rm --no-deps");
    expect(restoreTest).toContain("$VERIFY_SCRIPT:/app/scripts/verify-production-db.mjs:ro");
    expect(restoreTest).toContain("server.js");
    expect(restoreTest).toContain('/api/health');
    expect(restoreTest).toContain("dropdb --if-exists");
  });

  it("backs up the media volume read-only with atomic checksums", () => {
    const media = read("scripts/backup-media.sh");
    expect(media).toContain("/var/lib/toeicgym/media");
    expect(media).toContain('tar -czf "/backup/$ARCHIVE_NAME"');
    expect(media).toContain("tar -tzf");
    expect(media).toContain("sha256sum");
    expect(media).toContain(".manifest");
    expect(media).toContain("MEDIA_BACKUP_RETENTION_COUNT");
    expect(media).toContain('tail -n "+$((RETENTION_COUNT + 1))"');
  });

  it("maintains host storage without pruning volumes or active images", () => {
    const maintenance = read("scripts/maintain-host-storage.sh");
    expect(maintenance).toContain("docker container prune");
    expect(maintenance).toContain("docker image prune");
    expect(maintenance).toContain("docker builder prune");
    expect(maintenance).toContain("--min-free-space");
    expect(maintenance).toContain("label=com.docker.compose.project");
    expect(maintenance).toContain('docker image rm "$MIGRATOR_IMAGE"');
    expect(maintenance).not.toContain("docker volume prune");
    expect(maintenance).not.toContain("docker image prune --all");
  });

  it("extracts media into an isolated directory and verifies the manifest", () => {
    const restore = read("scripts/test-restore-media.sh");
    expect(restore).toContain("mktemp -d /tmp/toeicgym-media-restore.XXXXXX");
    expect(restore).toContain("--no-same-owner --no-same-permissions");
    expect(restore).toContain('test "$actual_files" -eq "$expected_files"');
    expect(restore).toContain('test "$actual_bytes" -eq "$expected_bytes"');
  });

  it("checks both schedulers, disk, HTTPS and backup freshness", () => {
    const health = read("scripts/ops-health-check.sh");
    for (const boundary of [
      "lifecycle-scheduler",
      "mobile-retention-scheduler",
      "https://toeicgym.net/api/health",
      "root_disk_percent",
      "'%s_backup_age_seconds=%s",
      'check_freshness db',
      'check_freshness media',
    ]) expect(health).toContain(boundary);
  });

  it("accepts only the documented 0017 migration drift", () => {
    const audit = read("scripts/task42b-production-audit.mjs");
    expect(audit).toContain("historical0017Drift");
    expect(audit).toContain("0017_question_bank_import");
    expect(audit).toContain("latestMigrationApplied");
    expect(audit).toContain('mobile-retention-scheduler');
  });

  it("treats deleted tombstones and anonymous guest practice as valid", () => {
    const verifier = read("scripts/verify-production-db.mjs");
    expect(verifier).toContain("u.deleted_at is null and p.id is null");
    expect(verifier).toContain("s.user_id is not null and u.id is null");
    expect(verifier).toContain("s.user_id is distinct from a.user_id");
  });
});
