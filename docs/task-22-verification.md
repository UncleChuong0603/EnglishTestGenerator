# Task 22 verification runbook

## Isolated PostgreSQL integration environment

The test instance is PostgreSQL 17 in `docker-compose.test.yml`. It uses a disposable tmpfs, a dedicated `toeicgym_task17` database and `toeicgym_test` user, and binds only `127.0.0.1:15433`. From the repository root run the single cross-platform command:

```powershell
npm run task22:verify:postgres
```

The command checks Docker and Compose, starts only the test Compose service, waits for health, injects its fixed isolated URL, validates both URL configuration and live identity, rebuilds the empty schema through every journaled migration, runs PostgreSQL integration and schema compatibility tests, then tears down. It prints database name, user, address, and port but never the password or URL. The identity guard remains fail-closed before destructive setup. If automatic cleanup fails, run:

```powershell
npm run task22:verify:postgres:cleanup
```

Never substitute a production URL or edit historical migrations.

## Production read-only verification

Run `npm run production:preflight` for configuration-only checks. In the production app/db-tools environment run `npm run production:verify` to check database identity, expected tables, migration state, configured media provider, and (for LOCAL) readable media root. It starts a read-only transaction and does not write rows, upload files, send email, create orders, or call OAuth.

## Exact LOCAL cutover runbook

### Phase A — pre-cutover

1. Create and verify a current database and media backup.
2. Confirm `npm run media:migrate-to-local` has completed; it is never implicit in publishing or verification.
3. In the production app/db-tools environment with `MEDIA_STORAGE_PROVIDER=LOCAL`, run `npm run media:verify` and require `PASS`.
4. Confirm R2 objects and credentials remain untouched for rollback.
5. Confirm `content:listening:publish` explicitly uses `MEDIA_STORAGE_PROVIDER=LOCAL`; no R2 variables are required for this path.
6. Inspect the existing Dokploy Compose project and confirm the persistent `media_data` volume is mounted read-write at `LOCAL_MEDIA_ROOT` in app/db-tools.
7. Confirm `media-server` mounts that same named volume read-only at `/srv/media`.

### Phase B — cutover

1. Change only `MEDIA_STORAGE_PROVIDER` to `LOCAL`; confirm `LOCAL_MEDIA_ROOT` and `MEDIA_SIGNING_SECRET` are present.
2. Redeploy through the project's existing Dokploy workflow using Compose service names. Do not hard-code generated container IDs.
3. Do not rotate unrelated secrets and do not remove R2 configuration during the rollback window.

### Phase C — smoke test

1. Complete an authenticated Reading flow.
2. Play representative Listening audio and load a Part 1 image.
3. Confirm an authenticated protected-media request succeeds and invalid/unauthorized requests are rejected.
4. Publish/import one new media-backed item through the normal LOCAL path and verify it can be read.
5. Safely recreate the app container and confirm both old and newly published media persist.
6. Re-run `npm run production:verify` and `npm run media:verify` in the production app/db-tools environment.

### Phase D — rollback

If any smoke test fails, set `MEDIA_STORAGE_PROVIDER=R2` and redeploy through the same Dokploy workflow. Confirm representative R2-backed media works. Do not delete LOCAL files, R2 objects, or either provider's credentials.

### Phase E — retirement

R2 may be retired only after migration reconciliation passes, all production smoke tests pass, persistence after app recreation is proven, backups are confirmed, and the operator explicitly closes the rollback window. Retirement is a separate human-approved action.

## LOCAL media verification

Set `MEDIA_STORAGE_PROVIDER=LOCAL`, `LOCAL_MEDIA_ROOT` to the persistent media mount, and `DATABASE_URL` to the intended database, then run `npm run media:verify` inside app/db-tools so the same volume is visible. It reports DB LOCAL/R2 counts, missing files, sizes, SHA-256 where metadata exists, metadata anomalies, unsafe entries, and orphan files. It never prints contents, deletes, or migrates. With provider R2 it reports `NOT APPLICABLE / PROVIDER IS R2`.

Until Phase E is explicitly complete, **do not delete R2 data or credentials**.
