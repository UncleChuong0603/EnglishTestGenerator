# Task 6: Unified diagnosis and adaptive workouts

## Architecture

`ToeicProgress` remains the factual aggregate. `ToeicDiagnosis` is a separate,
pure domain derived from it. Signal identity contains skill area, part, skill,
and subskill, so same-named Listening and Reading skills never collide.

## Deterministic thresholds

- 0-2 attempts: `INSUFFICIENT_DATA`; no qualitative strength/weakness label.
- 3-7 attempts: `EARLY_SIGNAL`; exploratory `DEVELOPING` label only.
- 8+ attempts: `SUPPORTED`.
- Supported accuracy below 60%: `NEEDS_ATTENTION`.
- 60-74%: `DEVELOPING`.
- 75-89%: `STABLE`.
- 90%+: `STRONG`.

Ranking gives supported evidence a higher band than early evidence, then orders
by lower observed accuracy and sample size. Zero-attempt and 0-2-attempt signals
are not improvement candidates. The latest-attempt timestamp remains attached
to each signal for future scheduling without claiming statistical precision.

## Recommendation and selection

The server combines progress, diagnosis, the last ten submitted sessions, and
published content availability. It applies a deterministic section-balance
adjustment so a small difference cannot permanently starve the other section.
The structured result contains target identity, observed evidence, reason code,
requested/actual group-aware size, and selection mix.

The initial focused Reading mix is 60% primary target, 20% same-part support,
and 20% other-part maintenance. Part 6/7 selection operates on whole passage
units, so exact percentages and counts can vary. Fallback is target subskill,
same skill, same part, then balanced Reading. Listening 3/4 use complete groups;
a target of about ten becomes three groups/nine questions. Existing Listening
eligibility checks require published groups, valid structure, CONTENT/READY
media, transcript, options, solution, and explanations.

With no supported history, the engine creates a profile-building exploration
recommendation and never fabricates a weakest skill. Recommendation reasons are
codes plus parameters; EN/VI text is rendered at the UI boundary.

The CTA accepts no learner ID or target taxonomy. Its server action resolves the
authenticated learner, recalculates the recommendation, validates content again,
and then creates the session. Manual practice remains unchanged.

## Queries, cache, and database

Progress uses the existing grouped SQL aggregate; it does not load answer
history into JavaScript. Recommendation availability uses distinct published
section/part rows and only the ten latest submitted sessions. Content selectors
query bounded eligible pools. Practice submission already revalidates Progress
and Dashboard, so the next request recalculates diagnosis and recommendation.

No new migration is required. No environment or content-bank changes are
required.
