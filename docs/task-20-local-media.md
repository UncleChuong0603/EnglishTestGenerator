# Local-only VPS media

## Architecture

Production only accepts `MEDIA_STORAGE_PROVIDER=LOCAL`. The application writes media atomically to the persistent `toeicgym_media_data` volume. The media Nginx container mounts that volume read-only and serves files only after the Next.js authorization route validates the HMAC signature and expiry, then returns `X-Accel-Redirect`. `/protected-media/` is an internal Nginx location and is never exposed directly.

Required production variables:

```dotenv
MEDIA_ENABLED=true
MEDIA_STORAGE_PROVIDER=LOCAL
LOCAL_MEDIA_ROOT=/var/lib/toeicgym/media
MEDIA_SIGNING_SECRET=<random value with at least 32 characters>
```

Do not configure R2, S3, CDN, or external object-storage credentials. Upload limits remain 15 MB for MP3 and 5 MB for JPEG, PNG, or WebP. The server validates MIME type, magic bytes, and generated storage keys.

## Operating checks

```sh
docker compose --env-file .env -f docker-compose.dokploy.yml --profile tools run --rm db-tools npm run media:preflight
docker compose --env-file .env -f docker-compose.dokploy.yml --profile tools run --rm db-tools npm run media:status
docker compose --env-file .env -f docker-compose.dokploy.yml --profile tools run --rm db-tools npm run media:verify
```

`media:verify` must report zero non-LOCAL READY assets, missing files, size/checksum mismatches, unsafe entries, and orphan files.

## One-time cutover from legacy object storage

1. Keep the currently deployed transition version running long enough to use its `media:migrate-to-local` command.
2. Create and mount `toeicgym_media_data`, then back up PostgreSQL and the legacy media source.
3. Run the transition command with `--dry-run`, then `--execute`. It copies every object, verifies size and SHA-256, and updates the corresponding DB row to `LOCAL`.
4. Run `media:verify` and stop if it does not pass.
5. Deploy the local-only version. Migration `0030_local_only_media` intentionally blocks deployment while any database row still uses another provider.
6. Remove all legacy object-storage variables from Dokploy and redeploy.
7. Smoke test Admin upload/preview, blog covers, Listening P1-P4, Practice, Diagnostic, and Full Mock.

The local-only release deliberately contains no R2 implementation or AWS S3 SDK. If the transition release is no longer available, copy the objects to the same logical paths in the volume with an audited external transfer tool, then run `npm run media:finalize-local -- --execute`; it verifies every READY asset before changing provider metadata.

## Backup and restore

Pause uploads or use a short maintenance window, then archive the volume:

```sh
docker run --rm -v toeicgym_media_data:/data:ro -v "$PWD":/backup alpine tar -C /data -czf /backup/toeicgym-media.tgz .
```

Restore PostgreSQL and media from the same backup point. Preserve app ownership UID/GID `1001`, directory mode `0755`, file mode `0644`, and the read-only Nginx mount. Rollback uses a previous local-only image with the same media volume; it never switches back to an external provider.
