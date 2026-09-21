# TOEICGym dependency register

| Dependency | Purpose | Category | Required? | Fallback / self-host alternative | Complexity | Cost risk | Lock-in | Decision |
|---|---|---|---|---|---|---|---|---|
| VPS + Docker/Dokploy/Traefik | compute, containers, HTTPS | SELF_HOSTED_REQUIRED | production | another Docker VPS | MEDIUM | fixed | LOW | KEEP |
| Next.js Node app | product runtime | SELF_HOSTED_REQUIRED | runtime/production | standard Node/Docker | MEDIUM | VPS only | LOW | SELF-HOST |
| PostgreSQL 17 | product data and sessions | SELF_HOSTED_REQUIRED | runtime/production | any PostgreSQL host | MEDIUM | VPS disk | LOW | SELF-HOST |
| Drizzle | DB access and migrations | SELF_HOSTED_REQUIRED | runtime/production | direct SQL/another ORM | MEDIUM | none | MEDIUM | KEEP |
| Local volume + Nginx | media storage/delivery | SELF_HOSTED_REQUIRED | when media enabled | restore local backup | MEDIUM | VPS disk/bandwidth | LOW | SELF-HOST |
| Domain registrar | domain ownership | EXTERNAL_REQUIRED | production | registrar transfer | LOW | fixed | LOW | KEEP |
| DNS / optional Cloudflare proxy | resolution/edge protection | DNS required, proxy optional | production | another DNS/direct VPS | HIGH to self-host DNS | plan-dependent | LOW | KEEP |
| SMTP relay | verification/recovery email | EXTERNAL_REQUIRED for mail flows | not boot/core learning | another standard SMTP; self-host mail is HIGH complexity | HIGH | usage | LOW | KEEP |
| Google OAuth | optional login | EXTERNAL_OPTIONAL | no | local email/password | HIGH to self-host IdP | low | LOW | KEEP OPTIONAL |
| payOS | payment collection | EXTERNAL_REQUIRED for checkout | payment actions only | `PaymentProvider` replacement | HIGH | transaction fees | MEDIUM | KEEP |
| OpenAI TTS | optional offline authoring | EXTERNAL_OPTIONAL | no runtime | Edge/fake/local TTS | MEDIUM | usage | LOW | KEEP OPTIONAL |
| Edge TTS, fakes, PGlite, Vitest, Playwright | authoring/test | DEV / TEST ONLY | no | local mocks | LOW | none | LOW | DEV/TEST ONLY |
| Supabase | historical source/migrations | LEGACY / MIGRATION ONLY | no | PostgreSQL + Drizzle | completed | avoidable | LOW | REMOVE AFTER MIGRATION records retained |
| Analytics SaaS | absent | UNUSED | no | future PostgreSQL events | MEDIUM | none | n/a | REMOVE NOW / do not add |
| Monitoring/error SaaS | absent | UNUSED | no | Task 23 | MEDIUM | none | n/a | REMOVE NOW / do not add |
| Redis/queues/search SaaS | absent | UNUSED | no | current PostgreSQL flows | LOW | none | n/a | REMOVE NOW / do not add |

## Environment contract

| Group | Variables | Classification |
|---|---|---|
| Core | `SESSION_SECRET`, `APP_URL`, build-only `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | required production |
| Database | `DATABASE_URL`; Compose bootstrap `POSTGRES_DB`, `POSTGRES_ADMIN_*`, `APP_DATABASE_*` | required production / operator bootstrap |
| Auth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | optional pair |
| Email | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_SECURE` | optional for boot; required for mail delivery; credentials paired |
| Media | `MEDIA_ENABLED`, `MEDIA_STORAGE_PROVIDER=LOCAL`, `LOCAL_MEDIA_ROOT`, `MEDIA_SIGNING_SECRET` | required when media is enabled |
| Payments | `PAYMENT_PROVIDER`, `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`, `PREMIUM_*_PRICE_VND` | optional capability; empty values disable checkout |
| Authoring | `CONTENT_TTS_PROVIDER`, `CONTENT_TTS_MODEL`, `OPENAI_API_KEY` | offline authoring only |
| Test/operator | `TASK16_*`, `TASK17_*`, `TASK19_DB_INTEGRATION`, `TEST_DB`, `DEMO_TEST_DURATION_SECONDS`, `BACKUP_DIR`, `DOMAIN`, `CERTBOT_EMAIL`, `NGINX_CONFIG` | testing/operations |

No `NEXT_PUBLIC_*` variable exists in production code or the environment template. All credentials remain server-only.

Normal tests use fakes/PGlite and make no real provider calls. Media storage and delivery are local-only. OAuth is not required and email is suppressed in tests. SMTP lock-in is LOW because it is standard SMTP. Google is LOW because optional. payOS is MEDIUM because webhook/status semantics require mapping despite the abstraction.
