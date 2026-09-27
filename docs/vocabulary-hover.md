# Practice vocabulary flashcards

- Enabled explicitly in reading practice, listening questions (Parts 3–4), revealed listening transcripts, and listening/shadowing lessons. Shared question/passage components default to disabled so assessment screens do not acquire lookup controls.
- Desktop: hover a word; keyboard: focus then Enter/Space to enter the card, Escape to close; mobile: tap a word. Tap outside or use Close to dismiss.
- Definitions, IPA, examples and audio come from [Free Dictionary API](https://dictionaryapi.dev/). Vietnamese meanings use the existing vocabulary catalog when available, then [MyMemory](https://mymemory.translated.net/doc/spec.php). No API key is required. Translation is a dictionary aid, not disambiguation of the sentence's exact sense.
- Providers may omit pronunciation/examples or be unavailable. Missing examples use the visible exercise context with an explicit label; missing audio uses browser speech synthesis. English definitions remain available when translation fails. Unknown words display an empty state and can be retried.
- Requests are delayed briefly and successful results cached in the browser (up to 300 words). Server fetches use Next.js revalidation. Audio is proxied through the existing same-origin route with an HTTPS hostname allowlist and size/time limits.
- Saving requires a signed-in account. The server looks up the word itself and stores a dictionary snapshot in `user_vocabulary.dictionary_card`. Re-saving a term enriches an existing card without resetting its spaced review schedule. Saved definitions can be reviewed even during a provider outage.
- Source links/license metadata are retained with the snapshot.

## Migration

Apply `drizzle/0043_simple_chat.sql` with the normal `npm run db:migrate` deployment step before running the updated app. This adds one nullable JSONB column; existing cards remain usable. The configured local PostgreSQL was offline during implementation, so it was not migrated; the complete migration chain was verified using PGlite.

## Verification

```sh
npm run typecheck
npm test -- src/lib/vocabulary/dictionary.test.ts src/lib/vocabulary/dictionary-save.test.ts src/components/listening/following-transcript.test.tsx src/components/listening/shadowing-player.test.tsx src/components/practice/practice-workspace.test.tsx
node scripts/verify-vocabulary-hover.mjs
```

The browser check uses the actual React components and generated application styles with mocked API responses. The persistence checks use PostgreSQL via PGlite and cover ownership, duplicate saves, dictionary snapshots and review scheduling.
