# Task 22 verification runbook

## Isolated PostgreSQL integration environment

The test instance is PostgreSQL 17 in `docker-compose.test.yml`. It uses a disposable tmpfs, a dedicated `toeicgym_task17` database and `toeicgym_test` user, and binds only `127.0.0.1:15433`. Never point this compose file at production. Start and stop it with:

```sh
docker compose -f docker-compose.test.yml up -d --wait
docker compose -f docker-compose.test.yml down
```

Set `TASK17_TEST_DATABASE_URL` and `DATABASE_URL` to the dedicated test URL with the compose-only password, then run the integration commands. `scripts/lib/assert-test-database.mjs` checks the URL and live PostgreSQL database/user/address/port before the destructive payment integration setup. It prints no credentials. The question-import integration test has its own identity check. Never enable DB integration tests against a production URL.

```sh
npm run test:integration:payments
TASK19_DB_INTEGRATION=1 npm test -- src/lib/question-import/service.integration.test.ts
```

The payment suite resets `public` on this disposable database, so run it before the question-import suite. For the complete clean migration chain, the payment suite applies every journaled migration from an empty schema. Production migrations remain append-only.

## LOCAL media and production read-only verification

Set `MEDIA_STORAGE_PROVIDER=LOCAL`, `LOCAL_MEDIA_ROOT` to the persistent media mount, and `DATABASE_URL` to the intended database. Run `npm run production:preflight` for fast configuration checks, then `npm run media:verify` for read-only DB/file reconciliation. The latter checks LOCAL READY assets, file hashes/sizes, and unexpected files; it never deletes or migrates data. Run it inside the app or db-tools container so the same volume is visible. The app mounts `toeicgym_media_data` read-write at `/var/lib/toeicgym/media`; media Nginx mounts it read-only at `/srv/media`, with `/protected-media/` internal-only.

The operator must confirm production environment selects LOCAL, both containers see the same volume, representative Listening audio and Part 1 image load, signed access rejects unauthorised requests, media persists after safe app recreation, new upload/import works, and learning flows load required media. Keep R2 objects and credentials intact throughout rollback. Roll back by selecting R2 and redeploying after confirming the original objects remain available.

R2 may be retired only after LOCAL production provider, complete migration, representative production smoke tests, persistence after container recreation, backup, and deliberate closure of the rollback window are all confirmed by the operator. Until then, **do not delete R2 data or credentials**.
