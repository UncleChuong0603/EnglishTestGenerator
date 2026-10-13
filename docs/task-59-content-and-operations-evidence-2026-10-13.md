# Task 59 content and operations evidence — 2026-10-13

## Decision

The deployment and backup operations are approved and healthy. Content release remains **NO-GO**: the review found substantive editorial defects and large template-duplicate clusters. The AI-assisted Part 5 batch remains `UNREVIEWED`; no automated process or SQL statement was used to impersonate a human editor.

## Deployment approval and migration 0057

- Reviewed commit: `3dce6867764dd494f213270e99798420e43318e1` (`feat: Implement Android launch completion tasks 59-68`).
- Production checkout was already at the reviewed commit. The pre-existing production-only change to `docker-compose.dokploy.yml` was preserved.
- A fresh database backup was created before migration: `/opt/toeicgym/backups/english-test-20261013T040706Z.dump`.
- The database backup passed an isolated restore and the production database verification found no duplicate emails/Google identities, missing profiles, orphaned owners, invalid published questions or invalid groups.
- Migration `0057_import_review_audit.sql` was applied successfully. The live `admin_audit_logs_action_check` constraint now contains `IMPORT_REVIEW_COMPLETED`.
- The application was rebuilt and deployed. App container `fcb93b8e9cc6` is healthy with zero restarts; PostgreSQL is healthy; both schedulers are running; `https://toeicgym.net/api/health` returns HTTP 200.
- The production build passed and generated 98 static pages. Migration and application rollout are approved.

## AI-assisted Part 5 review

Batch: `toeicgym-p5-ai-original-20260919-001`

Batch label: `TOEICGym Part 5 Original Practice — Batch 2026-09-19-001`

Production state at review: 99 published Mock Part 5 questions, `UNREVIEWED`

All 99 published questions, their four choices, keyed answers and EN/VI explanations were inspected. Structural answer keys and explanations are mostly internally consistent, but the batch is not acceptable for human attestation:

1. All 99 sampled records use `grammar/verb_tense`; this is not a plausible balanced Part 5 batch.
2. Every item repeats the complete sentence in every option and uses the meta-prompt `Choose the best completed sentence`. Authentic Part 5 presentation uses a sentence with a blank and choices containing only the missing word or phrase. The current format is highly repetitive and inflates duplicate similarity.
3. Group `e9df2618-d039-4fb9-8204-d2eba5bd90bd` (review position 20) is ambiguous: both simple past (`provided`) and past continuous (`was providing`) are defensible with the supplied `while` clause. It needs correction or withdrawal.
4. Several tense questions are forced by weak distractors rather than a uniquely natural context, including groups `a403f865-c915-46f6-9f76-a74d86034000`, `d78de0f6-a721-4b1b-a18f-749fc1f96b79`, and `0fde6722-d7d4-4cd3-9132-041d045d80e4`.
5. The batch rights note explicitly requires an operator to confirm originality and usage rights. That attestation cannot be supplied by an automated reviewer.

Result: **99/99 pre-reviewed; 0/99 approved for `HUMAN_REVIEWED`**. The batch status was deliberately left `UNREVIEWED`.

## Duplicate scan and adjudication

The canonical production scanner was run for every Part at the configured 58% threshold. It wrote scan records and open issue reports for all seven Parts.

| Part | Groups scanned | Candidate pairs | 100% | ≥95% |
| --- | ---: | ---: | ---: | ---: |
| P1 | 250 | 313 | 0 | 0 |
| P2 | 1,525 | 5,446 | 14 | 14 |
| P3 | 625 | 5,427 | 17 | 26 |
| P4 | 450 | 4,359 | 29 | 39 |
| P5 | 1,750 | 14,801 | 0 | 0 |
| P6 | 200 | 653 | 0 | 0 |
| P7 | 675 | 8,728 | 241 | 1,296 |
| **Total** | **5,475** | **39,727** | **301** | **1,375** |

Adjudication findings:

- None of the pairs is byte/fingerprint exact because generated identifiers, dates, names or choice order differ.
- All 301 pairs at 100% are template-equivalent after normalizing numeric identifiers.
- All 1,375 pairs at ≥95% are true template duplicates on content inspection. P2–P4 repeat transcripts/questions with only project numbers, names or choice ordering changed. P7 repeats the same documents and question sets with organization names, dates and people substituted.
- At 58%, the remaining queue is too broad for safe bulk disposition and contains substantial template-family noise. It must not be bulk-dismissed, and true duplicates must not be marked resolved until one canonical item is retained and the redundant item is withdrawn/remapped.
- No report status was falsified. The 39,727 reports remain open evidence because the content has not yet been remediated.

Result: **7/7 scans complete; high-confidence layer adjudicated as real duplicates; content remediation required before the queue can be closed.**

## Editorial sample across P1–P7

The deterministic sample selected one published group per Part, bank pool and difficulty where available: 55 questions across 25 groups, covering Mock/Practice, easy/medium/hard, listening groups and reading passages.

| Part | Questions | Groups | Result |
| --- | ---: | ---: | --- |
| P1 | 3 | 3 | FIX — repetitive implausible distractor framing; one VI explanation embeds untranslated English |
| P2 | 4 | 4 | FIX — artificial project-number templating and weak distractors |
| P3 | 9 | 3 | FIX — project-number templating, unnatural answers such as `Paul has key 95`, and explanation/detail mismatch |
| P4 | 9 | 3 | WITHDRAW/FIX — ungrammatical transcript `Riverside Office Supply offer 15 gives...` and recycled templates |
| P5 | 6 | 6 | FIX — Mock options repeat full sentences; other sampled items are structurally correct |
| P6 | 8 | 2 | WITHDRAW/FIX — Mock group `d701c5f3-75d9-5ecc-b150-82ec35ff1975` does not form a natural coherent document; every completion repeats `Regarding Noble Travel Portal` |
| P7 | 16 | 4 | FIX — template duplication, awkward numbered organization names and `A Ironwood technician` article error in group `8068fc89-aaf4-5507-9ee8-59f13324b98b` |

Audio naturalness and image/audio alignment were not certified by this text-level review; they remain part of physical-device QA.

Result: **sampling executed across P1–P7; editorial gate failed with reproducible group IDs.**

## Backup, off-VPS copy and disk recovery

- Deployed `scripts/backup-media.sh` and `scripts/test-restore-media.sh` from the reviewed commit.
- Fresh production archive: `/opt/toeicgym/media-backups/toeicgym-media-20261013T041516Z.tar.gz`.
- Isolated restore: PASS, 3,539 files and 1,105,296,581 uncompressed bytes.
- Off-VPS encrypted copy: `C:\TOEICGym-Backups\toeicgym-media-20261013T041516Z.tar.gz.aes256`.
- Encryption: AES-256-CBC with salt, PBKDF2, 600,000 iterations and SHA-256.
- Encrypted archive SHA-256: `755c899c02f38d9d810027800437f11e307ed333c32568c8b3290af5fa7491ad`.
- Key location: `C:\Users\AdeleVance\.toeicgym\media-backup.key`; inheritance is disabled and only `AzureAD\AdeleVance` has Full Control. The key is not in the repository or on the VPS.
- A full decrypt-and-hash verification matched the original archive. Plaintext staging files on the workstation were truncated to zero bytes after verification.
- Deleted only the two superseded VPS media backup sets dated `20261004T104236Z` and `20261012T054802Z`. They are not recoverable from the VPS. The verified 13 October archive remains on the VPS and its encrypted copy remains off-VPS.
- Root disk usage fell from approximately 92% after build activity to 88%. No media volume, database volume or current backup was deleted.
- Final `scripts/ops-health-check.sh`: app healthy, database healthy, schedulers running, HTTPS 200, fresh database/media backups, `root_disk_percent=88`, `ops_status=ok`.

## Remaining human decisions

1. A qualified TOEIC editor must correct/withdraw the listed content and the confirmed duplicate clusters, regenerate/remap affected Full Mock forms, and rerun readiness. This is editorial authorship, not a credential Codex can assume.
2. After correction, the editor must personally verify the 99-item batch and its originality/rights note, then use the deployed audited Admin action to record `HUMAN_REVIEWED`.
3. The owner must copy the encryption key to an independent password manager/offline recovery location. The current encrypted archive and its only working key are on the same Windows workstation, so device loss is still a recovery risk.
4. A real alert receiver must be configured for nonzero operations-health/backup results; no external alert destination was available to configure autonomously.
