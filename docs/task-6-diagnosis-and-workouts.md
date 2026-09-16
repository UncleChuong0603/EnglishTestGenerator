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

Adaptive selection uses one central recent-content window: the latest 10
submitted practice sessions for the authenticated learner. Candidate questions
are checked only within bounded eligible pools. Unseen units are preferred,
older answered units are fallback, and units containing a question from that
ten-session window receive the strongest penalty. This is ranking, not a hard
exclusion, so a small bank can reuse content. For Listening Parts 3/4 and Reading
Parts 6/7, one recent child deprioritizes the complete group.

Listening ranks exact subskill, then same skill, then other eligible content in
the selected Part. Parts 3/4 score complete groups by matching-child coverage
and never split a group. Reading builds the primary pool in subskill -> skill ->
Part order, then applies 60/20/20 primary/support/maintenance targets. Stored
actual counts may differ from requested counts when whole groups are required.

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
query bounded eligible pools. Practice submission revalidates Progress,
Dashboard, and the submitted result path. The result page recalculates after the
attempt transaction; its CTA recalculates again and accepts no target payload.

No new migration is required. No environment or content-bank changes are
required.

## Manual browser smoke-test checklist

Manual browser verification still required when realistic authenticated
database and R2 media state are unavailable.

- New learner: complete the first practice; verify no definitive weakness is
  shown; start the exploration recommendation and verify a valid session opens.
- Supported Reading weakness: verify the result CTA, target emphasis, whole
  Part 6/7 passage groups, and recent-content deprioritization.
- Listening Parts 1/2: verify target skill/subskill preference and playable
  READY/CONTENT media.
- Listening Parts 3/4: verify complete three-question groups, gated group review,
  and a recommendation only after the session is complete.
- Small bank: repeat workouts until reuse occurs; verify fallback rather than a
  failure solely because all eligible items were previously seen.
- Manual regression: start every Part 1-7 from manual practice and verify the
  adaptive flow remains optional.
