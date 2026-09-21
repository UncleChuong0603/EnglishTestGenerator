# Self-hosted architecture

Production runs on one VPS through Dokploy and Traefik:

```text
Internet -> Traefik -> Next.js app -> PostgreSQL
                    -> media Nginx -> toeicgym_media_data (read-only)
Next.js app -----------------------> toeicgym_media_data (read-write)
```

PostgreSQL and `toeicgym_media_data` are the only persistent application data. The app stores logical media keys in PostgreSQL, writes validated files atomically to the volume, and issues short-lived signed URLs. Nginx validates access through the Next.js route before serving with `X-Accel-Redirect`; the protected file location is internal and supports byte ranges.

The runtime does not require hosted storage, a CDN, Redis, hosted analytics, hosted logging, external search, or an AI API. DNS may point directly to the VPS or use an optional proxy, but media storage and delivery remain on the VPS. Google OAuth, SMTP, and payOS are independent optional/business integrations rather than content storage.

Back up PostgreSQL and media at the same consistency point. App images, logs, temporary upload files, and Next.js caches are replaceable. A single app instance is assumed; multi-instance deployment would additionally require coordinated cache invalidation and shared writable media semantics.

Expected fixed costs are the VPS and domain. Media capacity and bandwidth must be monitored on the VPS. Keep firewall exposure limited to SSH, HTTP, and HTTPS; PostgreSQL, Next.js, and the internal media location must not be published directly.
