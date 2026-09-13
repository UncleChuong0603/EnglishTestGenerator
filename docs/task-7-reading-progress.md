# Task 7: Reading progress rules

## Analytics source of truth

Progress is calculated server-side from `practice_sessions`, `attempt_answers`, and the canonical taxonomy on `questions`. Every query is scoped with the authenticated user's ID; callers never accept a user ID from route or form input.

A session contributes only when all of these checks pass:

- its status is `submitted` and it has `submitted_at`;
- `score_total` equals `question_count`, and `score_correct` is within range;
- it has exactly one answer row per expected question (also enforced by a database unique constraint);
- the answer correctness total equals the stored session score;
- every answer resolves to a Part 5, 6, or 7 question with a skill and subskill.

Abandoned/in-progress sessions, corrupt or incomplete sessions, answers owned by another user, and excluded sessions (used for the results-page historical comparison) do not contribute. There is currently no development-record marker in the schema; if one is added later it must be included in this filter.

## Confidence and classifications

- 0 answers: `No data`
- 1–4 answers: `Early data`
- 5+ answers below 50%: `Needs Focus`
- 5+ answers from 50% through 69%: `Needs Improvement`
- 5+ answers from 70% through 84%: `Good`
- 5+ answers at 85% or higher: `Strong`

The minimum reliable sample is five answers. Early data is displayed but is not used to produce a personalized weakness recommendation.

## Recent performance and trends

Recent accuracy is the accuracy of the newest 20 answers available within the relevant overall, Part, skill, or subskill slice. Trend uses the newest and immediately previous equal-sized windows. Each window must contain at least five answers and can contain at most 20. A change of at least +5 percentage points is `Improving`; at most -5 points is `Declining`; smaller changes are `Stable`. Otherwise the trend is `Not enough data`.

## Recommendation ranking

Candidates are evaluated in fallback order: subskill, skill, Part, then balanced Reading. A candidate needs at least five learner attempts and five verified, published questions. Content verification uses the same integrity checks as practice selection, including complete Part 6/7 passage sets, four options, and a solution for every selected question.

Within a level, the score combines:

- effective weakness, using 40% lifetime accuracy and 60% recent accuracy;
- confidence, increasing to its cap at 20 attempts;
- trend factor: 1.15 for declining, 0.85 for improving, otherwise 1;
- content availability, increasing to its cap at 15 available questions.

If no reliable candidate has enough valid content, the recommendation falls back to balanced Reading. Strong learners may receive a low-scoring area as reinforcement; the explanation says so rather than inventing a weakness.
