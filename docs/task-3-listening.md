# Task 3 Listening fixtures and operations

The development manifest contains 5 Part 1 and 10 Part 2 items. All prompts, choices, transcripts and explanations are deterministic original TOEICGym developer fixtures; no ETS or commercial test content is included. The manifest stores local `assetRef` values, never signed URLs.

Run `npm run validate:listening` before import. Binary media is intentionally not committed. An operator must create the referenced original/synthetic PNG and MP3 files, ingest each through the existing `ingestMedia()` service with `CONTENT` scope, replace each manifest reference with the returned canonical asset ID during the question-bank import transaction, and attach it through `question_group_media`. Practice eligibility remains false until every asset is `READY` and the group is published.

The learner-facing Part 1 image uses the neutral alt label “TOEIC Listening Part 1 photograph”. A descriptive alt text could reveal the tested visual detail, so this is a deliberate assessment-security/accessibility tradeoff.

