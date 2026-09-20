# Cloudflare R2 media storage

TOEICGym uses a private R2 bucket through its S3-compatible endpoint. PostgreSQL stores only canonical object keys and typed metadata. Read URLs are signed for 15 minutes by default and are never persisted. `CONTENT` is TOEICGym-owned Listening media; `PRIVATE_USER` is reserved for owner/admin-authorized future recordings and cannot receive a permanent public URL.

## Dokploy variables

Set `MEDIA_ENABLED=true` and `MEDIA_STORAGE_PROVIDER=R2` when media operations are enabled, plus `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_ENDPOINT`. The access key and secret are secrets. `R2_PUBLIC_BASE_URL` is optional/reserved and is not used by the current private-bucket strategy. A redeploy is required after environment changes. Reading-only local/test use keeps `MEDIA_ENABLED=false`, so no R2 credentials or network calls are required.

For Dokploy, add these values in the Compose service's Environment tab rather than creating a committed `.env` file:

```dotenv
MEDIA_ENABLED=true
MEDIA_STORAGE_PROVIDER=R2
R2_ACCOUNT_ID=<cloudflare-account-id>
R2_ACCESS_KEY_ID=<bucket-scoped-access-key>
R2_SECRET_ACCESS_KEY=<bucket-scoped-secret-key>
R2_BUCKET_NAME=toeicgym
R2_ENDPOINT=https://<cloudflare-account-id>.r2.cloudflarestorage.com
R2_PUBLIC_BASE_URL=
```

Redeploy after saving the variables. Then verify from the VPS checkout:

```sh
docker compose --env-file .env -f docker-compose.dokploy.yml run --rm preflight
docker compose --env-file .env -f docker-compose.dokploy.yml --profile tools run --rm db-tools npm run media:preflight
docker compose --env-file .env -f docker-compose.dokploy.yml --profile tools run --rm db-tools npm run media:status
```

Use an R2 token restricted to the selected bucket. The endpoint is normally `https://<account-id>.r2.cloudflarestorage.com`. Never prefix any of these names with `NEXT_PUBLIC_`.

## Ingestion and failures

The server validates file signature, allowlisted MIME, non-empty size and limits (audio 15 MiB, image 5 MiB), extracts practical metadata, calculates SHA-256, creates an `UPLOADING` row, uploads and verifies the object, then marks it `READY`. Upload failure marks `FAILED`. If the object succeeds but final DB persistence fails, ingestion attempts object cleanup and marks the row `FAILED`. Cleanup errors remain visible as failed metadata for operator recovery.

Archiving changes `READY` to `ARCHIVED`; references use restrictive foreign keys. `physicallyDeleteArchivedMedia` is an explicit operator/service operation and refuses non-archived or referenced assets. No scheduled deletion is included.

## Smoke test

After deploying migration 0003, run the normal health check and Reading P5/P6/P7 smoke tests. For R2, use a server-side invocation of `R2MediaStorage` to upload a tiny allowlisted fixture, verify `exists`, create a short signed URL, fetch it, then delete that smoke-test key. Do not print configuration or signed URLs. Confirm normal Reading navigation produces no R2 request.
