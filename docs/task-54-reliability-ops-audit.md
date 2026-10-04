# Task 54 — Reliability, backup, restore, security and operations audit

Date: 2026-10-04

## Executive result

Production stayed available throughout the audit. The first isolated database
restore exposed a real ACL portability defect and failed before verification. The
backup/restore path now excludes environment-specific owners and privileges,
validates archives, records SHA-256 sidecars, and boots the production app image
against the restored PostgreSQL 17 database. A failed restore is not counted as
evidence; only the post-fix complete drill is.

Database and media backups are local recovery copies, not disaster-recovery copies.
They are mode `0600` and checksummed but are not encrypted independently from the VPS
disk and are not copied off-host. Encrypted off-VPS storage remains a P0 human action
in `docs/deferred-operational-debt.md`.

## Production observations

- Dokploy checkout: `103ba2164f231acf56d2938957e5e72d8c02eee7` for the Task 53 deployment observation.
- App, PostgreSQL, lifecycle scheduler, mobile-retention scheduler and media service
  were running; app/PostgreSQL health checks passed and migrate exited `0`.
- HTTPS `/api/health` returned `200`, `status=ok`, `database=reachable`.
- Root disk was initially 94% used. Removing only Docker build cache and dangling
  images reclaimed about 5.48 GB; no volume, database, backup or in-use image was
  removed. Disk use fell to 85% before backup work.
- Media inventory before backup: 3,539 files, 1,105,464,517 bytes.
- Existing DB cron ran daily at 02:00 UTC with 14-day local retention. There was no
  media backup or media schedule before this task.

Final backup timestamps, restore evidence, DB structure metrics and cron status are
recorded in the task handoff after post-deployment verification.

## Backup design

### PostgreSQL

`scripts/backup-db.sh` now:

1. streams a PostgreSQL custom archive to a `.partial` file;
2. excludes owner/ACL statements that are specific to the source role setup;
3. validates the archive with PostgreSQL 17 `pg_restore --list`;
4. atomically renames it and writes a SHA-256 sidecar;
5. applies mode `0600` and deletes local pairs older than 14 days.

`scripts/test-restore-db.sh` verifies the checksum/archive, creates an isolated PG17
database, restores as the app role, runs the production integrity verifier, boots the
exact production app image against that restored database, requires the health route
to query it, and drops the temporary database on exit.

The on-demand `db-tools` image is not necessarily rebuilt by a normal Dokploy app
deployment. The drill therefore mounts the verifier read-only from the audited Git
checkout into that one-off container, preventing a stale tools image from silently
running an older gate.

### Local media

`scripts/backup-media.sh` mounts the same named media volume read-only through the
database-tools container, streams a gzip tar archive to the host, validates it,
atomically publishes it with a SHA-256 sidecar and applies 14-day local retention.
The backup must never run concurrently with a media restore.

The media archive and DB dump must be copied as pairs with their checksum files to
separate encrypted storage. A same-disk archive protects against accidental volume
damage, not disk/VPS loss.

## Lightweight monitoring

`scripts/ops-health-check.sh` is a self-hosted, read-only check for:

- app and PostgreSQL running/healthy;
- both retention schedulers running;
- public HTTPS health status;
- root disk below 90%;
- DB and media backups no older than 26 hours.

It emits only status, restart counts, percentages and ages and exits nonzero on a
failure. Cron captures the output locally every 15 minutes. External alert delivery
is intentionally not claimed until an owner-controlled channel is configured and a
test alert is received.

## Deployment behavior

The Git webhook updates the Dokploy checkout before the build completes. For Task 53,
the checkout showed the new revision while the previous healthy app container kept
serving for several minutes; migrate then exited `0`, and Dokploy replaced the app
with a new image/container that became healthy. Therefore checkout HEAD alone is not
runtime evidence.

Operator-safe verification is:

1. record current app container/image IDs;
2. push the intended revision and wait for checkout HEAD to match it;
3. require migrate exit `0`;
4. require app container and image IDs to change after the checkout update;
5. require app/PostgreSQL health, both schedulers and HTTPS health to pass;
6. if the runtime IDs do not change, use Dokploy Redeploy and repeat the checks;
7. never seed, reset, prune volumes or infer success only from the webhook/checkout.

The image still lacks an embedded Git revision label, so the workflow relies on a
single serialized deployment plus before/after runtime identity. Adding signed image
provenance is a future hardening option, not a claim made by this audit.

## Security audit

- Sessions are random raw tokens returned once and stored only as HMAC hashes; cookie
  transport is HttpOnly, Secure in production and SameSite=Lax. Revoked/expired,
  deleted or inactive accounts are rejected.
- A latent `revokeAllUserSessions(..., exceptSessionId)` runtime reference was fixed
  to use Drizzle's typed `ne` predicate instead of an unimported SQL helper.
- Sensitive and high-volume routes have database-backed per-action limits; Traefik
  also applies a global request rate and in-flight cap.
- Admin UI/API authorization is server-side, DB-role-backed and permission-scoped;
  mutations and relevant role/content actions are audit logged.
- Production config validates HTTPS origin, private PostgreSQL, paired providers,
  non-placeholder session secret and complete native-store credential sets.
- Diagnostic scripts allowlist names/booleans/counts and suppress subprocess stderr;
  they do not print environment values, hashes, process arguments or encoded payloads.
- Root npm production audit is clean. Mobile Expo dependencies retain the separately
  documented ecosystem advisories; no incompatible forced downgrade is authorized.
- Provider rotation, legacy R2 revocation and Git-history cleanup remain open in the
  separate debt register.

## Database integrity and workload signals

The production ledger contains 55 migrations through `0054_dictation_engine`.
The only accepted mismatch is historical `0017_question_bank_import`. The audit now
names mismatched migration tags and succeeds only for exactly that one exception;
any additional mismatch or missing latest migration fails the gate. Never rewrite
the historical SQL or production ledger to make hashes look clean.

`scripts/task54-db-audit.mjs` runs in a read-only transaction and reports PostgreSQL
major version, database size, invalid/unready indexes, unvalidated constraints,
orphan-like relation names, tables without primary keys, safe table-level scan
statistics and whether `pg_stat_statements` is available. It emits no learner rows.
Table scan counters are signals, not proof of a query problem; no index is added from
a tiny or unmatured sample alone.

The production integrity verifier now distinguishes valid anonymous guest sessions
(`user_id IS NULL`) and deliberately profile-less deleted-account tombstones from
true broken ownership. PostgreSQL `IS DISTINCT FROM` keeps owner comparison
null-safe; those expected V1 records no longer create false orphan failures.

## Disaster recovery procedures

### Database loss or corruption

1. Stop app writes and both schedulers; preserve logs and the damaged volume.
2. Select the newest checksum-valid off-host dump before the incident.
3. Provision PostgreSQL 17 and app/admin roles through the normal Compose init path.
4. Restore with `scripts/restore-db.sh`; it creates a safety dump before touching an
   existing database, restores without source ACLs, starts the app and verifies DB
   integrity.
5. Confirm migrations, health, authentication and a read-only learner snapshot before
   reopening writes. Do not apply migrations to a damaged DB as a repair shortcut.

### Media loss

1. Stop app and media-server writes/reads; snapshot the damaged named volume.
2. Verify archive SHA-256 and list it before extraction.
3. Restore into a newly created staging volume, scan ownership/modes and compare file
   count/bytes with the backup record.
4. Mount the staging volume into a one-off read-only media verifier. Only after it
   passes, switch Compose to the restored volume in a maintenance window.
5. Keep the prior volume until signed media requests and representative audio/images
   work. Never extract an unverified archive over the only production copy.

### Bad deploy

1. Keep PostgreSQL/media volumes intact; do not roll schema back automatically.
2. Redeploy the last known-good Git revision through Dokploy and verify a new runtime
   container/image, migrate status and health.
3. If the new migration is backward-compatible, run the old app against the newer
   schema. If not, use the migration-failure plan and a tested forward fix.

### Migration failure

1. Do not start/recreate the app if migrate exits nonzero; preserve filtered logs.
2. Determine whether PostgreSQL rolled the migration transaction back. Do not edit
   `drizzle.__drizzle_migrations` manually.
3. Reproduce against a restored isolated backup, create a new forward-only migration,
   and test app boot there.
4. Redeploy only after the isolated chain and restore drill pass. Restore production
   from the safety backup only when a forward repair cannot preserve correctness.

### VPS loss

1. Provision a patched replacement host, firewall/SSH and Dokploy; restore no secrets
   from Git or chat.
2. Configure the Compose project and fresh provider credentials, PostgreSQL 17 and
   empty named volumes.
3. Restore the newest checksum-valid off-host DB and media archives, then run migration
   and application verification.
4. Update DNS only after private health and representative smoke tests pass. Keep the
   old host isolated for forensics; revoke credentials if compromise is possible.

## Remaining human actions

- Configure encrypted off-VPS DB/media replication and prove a restore from that copy.
- Configure and test an alert delivery channel for the nonzero ops-health exit.
- Complete provider credential rotations/revocation and coordinated history cleanup.
- Set explicit RPO/RTO owners; the current local schedule implies an intended RPO of
  at most 24 hours but does not guarantee it without off-host copies and alerting.
