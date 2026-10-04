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
    expect(media).toContain("tar -czf -");
    expect(media).toContain("tar -tzf");
    expect(media).toContain("sha256sum");
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
