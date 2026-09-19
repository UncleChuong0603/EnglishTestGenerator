# TOEICGym self-host architecture

## Current target

```text
Internet
  |
DNS / optional Cloudflare proxy
  |
Traefik (public 80/443, managed outside this Compose project)
  |-------------------------------|
  v                               v
Next.js app:3000 (internal)   media-server:8080 (internal, signed LOCAL URLs)
  |                               |
  +--> PostgreSQL:5432            +--> toeicgym_media_data (read-only)
  |      (internal network)              ^
  +--> toeicgym_media_data (read/write)--+
  |
  +--> SMTP relay (optional for boot; required for verification/recovery delivery)
  +--> Google OAuth (optional login method)
  +--> payOS (optional checkout capability; external payment boundary)
  +--> R2 (migration/rollback only until retirement criteria are met)
```

The self-hosted core is Next.js, PostgreSQL, local media, Traefik and the lightweight Nginx media delivery service. PostgreSQL owns users, sessions, profiles, preferences, questions/groups/stimuli/answers, learning history, progress, mastery, diagnostics, Full Mock, rankings/challenges, memberships/payment records, SEO content, import records and media metadata. The local volume owns actual media files. The app container is replaceable; its writable filesystem is not authoritative state.

## Runtime and failure boundaries

| Integration | Trigger | If unavailable | Core practice impact |
|---|---|---|---|
| PostgreSQL | boot health, every data-backed request | app is not ready | unavailable; required core datastore |
| Local media | signed media request/upload when LOCAL is selected | affected audio/image fails; app remains available | listening media may be affected |
| SMTP | signup verification, resend and password recovery | mail action fails in a controlled way; process stays up | none for an authenticated learner |
| Google OAuth | user chooses Google login | controlled unavailable/callback error; local login remains | none after local login |
| payOS | checkout, status/cancel, webhook verification | checkout/status fails safely; existing learning remains | none |
| R2 | only when R2 provider or migration tool is explicitly selected | LOCAL delivery is unaffected | none after verified cutover |
| OpenAI TTS | explicitly selected offline authoring command only | authoring fails; Edge/fake path remains | none |

No analytics, error-tracking, hosted logging, Redis, queue, search, AI or CDN service is required by the runtime. `/api/health` validates configuration and executes only `select 1` against PostgreSQL; it does not contact optional providers. Production build does not query DB or contact Google, SMTP, payOS, R2 or AI APIs. Package installation and base-image retrieval are normal build-time network requirements.

## Persistent and ephemeral state

Persistent production state is exactly the PostgreSQL volume and `toeicgym_media_data`. Credentials also need operator custody but are not application data. Next.js build output, container filesystem, logs, temporary upload files and cache are replaceable/ephemeral. Local upload uses an atomic temporary file in the persistent media volume. A single app instance is assumed, so Redis/shared cache is unnecessary.

Task 22 owns backup and disaster-recovery implementation. This document only identifies state.

## Network exposure and Cloudflare

The Dokploy Compose publishes no app, database or media host port. Traefik alone exposes public 80/443 and routes app traffic plus the exact signed local-media path. PostgreSQL is on an internal Docker network. `db-tools` is profile-only; `migrate`, `preflight` and `media-init` are one-shot services.

Cloudflare R2 and Cloudflare DNS/proxy are separate decisions. R2 is storage fallback/migration infrastructure. DNS/proxy may remain useful for DNS, edge security and traffic protection, but the app has no Cloudflare-specific asset hostname or CDN requirement. Without the proxy, DNS must point to the VPS and Traefik must remain reachable with valid TLS; application data remains under TOEICGym control.

## Data ownership and privacy boundary

- Git contains source, migrations, configuration templates and authored manifests—not credentials or runtime data.
- PostgreSQL contains structured application/user data; local VPS storage contains media bytes.
- payOS receives only data necessary to create and verify payment transactions.
- SMTP receives recipient addresses and transactional message content.
- Google receives the OAuth identity exchange only when a user chooses Google login.
- R2 contains media during the migration/rollback window.

Practice answers, progress and mistake/mastery history are not sent to unrelated external services by the current runtime.

## Cost model and guardrails

Fixed/expected costs are the VPS and domain. Optional or usage-based costs are transactional email, payment processing fees and any selected Cloudflare paid plan. R2 storage/egress is targeted for removal only after LOCAL production verification and rollback expiry. AI APIs, hosted analytics and hosted monitoring are future optional items and absent from runtime.

Do not introduce paid SaaS unless the VPS cannot reasonably provide the capability, security or reliability materially improves, recurring cost is understood, and a self-hosted alternative was evaluated.

## R2 retirement criteria

Keep R2 code, SDK and credentials during the migration window. Remove them only after a human operator confirms: all media migrated with size/hash verification; LOCAL production smoke tests cover Admin, Listening, practice, Diagnostic, Full Mock and blog covers; no unexplained media errors occur for the agreed rollback window; PostgreSQL and local-media backups are verified; and rollback is formally closed. Then remove R2 variables, SDKs, provider implementation and migration command in a separate reviewed change. Do not delete the bucket as part of code deployment.

## Operator independence

Signup, practice, import, SEO publishing, media upload and admin operations run through the application. Email signup/recovery needs SMTP; Google login is optional. Premium purchase necessarily depends on payOS for new checkout, while existing entitlements remain local. Routine operation does not require Supabase, R2 after cutover, AI, analytics, Redis, external search or developer intervention.
