# Task 36: lifecycle learning email

Learning reminders are opt in. Existing transactional email sent only verification and password recovery mail, so the new `profiles.learning_email_enabled` flag defaults to `false` for existing and new accounts. Turning it off has no effect on security mail. The preference is in Settings → Email học tập. Every learning email carries a 32 byte random unsubscribe token; only its HMAC hash is stored. The unsubscribe page uses GET to display a confirmation and POST to change the preference, so link previews cannot silently opt out a user. The token is single use.

The daily scheduler runs at 08:15 `Asia/Ho_Chi_Minh` inside Dokploy Compose. It calls a POST only endpoint over the internal database network. The Bearer secret is derived by HMAC from the existing `SESSION_SECRET` with a job specific context; no new secret or external queue is required. Nothing is sent until the user enables the preference. No production test email is required or permitted.

The job evaluates only active, verified users. Weekly Review has first priority when the previous Monday–Sunday product week contains a submitted learning session and it is Monday–Wednesday after 08:00. Then come inactive three days, a single first session 24–48 hours ago, and signup with no learning 24–48 hours ago. Ordinary learning requires a submitted practice session with at least one answered question; diagnostic, demo, challenge, and embedded full mock sessions are excluded. Completed Listening mocks with answers count as learning. A reminder needs published Part 5 content and available manual practice quota; Weekly Review needs actual previous week data. The bilingual Weekly Review includes learning days, sessions, answered questions, accuracy, and the Part needing attention. Every message includes a branded HTML version, a plain-text fallback, a direct learning action, and an unsubscribe link.

`lifecycle_emails` holds one row per user, type, and window, plus sent, suppressed, failure, and return timestamps. The transaction locks the user row before claiming an email, checks the last 24 hours, and writes a claim before calling SMTP. A retry is allowed only for a known failure before SMTP message acceptance, up to three attempts. Errors with ambiguous acceptance are never retried automatically. A claimed row after process interruption is also not retried, favoring no duplicates over guaranteed delivery. `returned_at` is derived from the first later submitted ordinary learning session. No pixel or external analytics is used. Admin → Email học tập shows eligible and opted-in audiences, learning-email sends in the last seven days, the last learning-email send time, and per-trigger counts. Campaign mail is deliberately excluded from these learning-email totals.

Migration `0039` adds the preference and send history; `0040` adds a unique unsubscribe token hash. There is no backfill or destructive change. The Drizzle journal uses later timestamps than `0038`; this was verified against the isolated Task 17 PostgreSQL database, including checking that the new table and column actually exist.

QA command on the isolated database, after opening an SSH tunnel to `english-vps` port 15433:

```powershell
$env:DATABASE_URL='postgresql://toeicgym_test:isolated_test_only@127.0.0.1:15433/toeicgym_task17'
npm run db:migrate
node --conditions=react-server --import tsx scripts/task36-integration.mts
```

The integration script refuses any other database identity, creates only `task36-%@qa.invalid` users, uses an in-process mock SMTP listener, and removes its fixtures. It checks all four triggers, Free/Premium, opt out, unverified exclusion, 24 hour cap, repeat run, SMTP refusal and safe retry, one use unsubscribe, security mail independence, and return to learning. Policy tests check time windows and the Vietnam week boundary.
