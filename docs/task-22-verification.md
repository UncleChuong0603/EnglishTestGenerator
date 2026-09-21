# Production verification

Production media is local-only. Required configuration is `MEDIA_STORAGE_PROVIDER=LOCAL`, `LOCAL_MEDIA_ROOT=/var/lib/toeicgym/media`, and a `MEDIA_SIGNING_SECRET` of at least 32 characters.

Run inside the Dokploy checkout:

```sh
npm run production:preflight
docker compose --env-file .env -f docker-compose.dokploy.yml --profile tools run --rm db-tools npm run production:verify
docker compose --env-file .env -f docker-compose.dokploy.yml --profile tools run --rm db-tools npm run media:verify
```

Require all checks to pass. `media:verify` reports DB/file counts, missing files, size and SHA-256 mismatches, invalid metadata, unsafe paths, orphan files, and any remaining non-LOCAL assets. It never modifies or deletes media.

After deployment, verify Admin upload and preview, blog covers, Listening P1-P4, guest and authenticated Practice, Diagnostic, Full Mock, HTTP range playback, and persistence after recreating the app and media-server containers.

Rollback uses the previous local-only image and the same persistent volume. Restore PostgreSQL and media from the same backup point if data recovery is needed. External object storage is not a runtime or rollback path.
