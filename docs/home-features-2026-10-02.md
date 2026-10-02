# Homepage and About feature discovery

The public homepage previously emphasized a general practice–review–progress loop. Audio with transcripts, daily workouts, weekly rankings and vocabulary had no clear entry points. The About page led with publishing implementation details rather than learner activities.

## Research and decisions

Reviewed on 2026-10-02:

- [Đậu TOEIC](https://dautoeic.vn/): distinct entries for Parts, listening lessons and supplementary tools. Adopt direct feature links and concrete activity descriptions.
- [STUDY4 test library](https://study4.com/tests/): concrete practice entries with identifying information. Use a real TOEIC GYM audio title, duration and transcript excerpt as listening evidence.
- [Migii TOEIC](https://migii.net/vi/toeic): learning by target. Surface existing TOEIC GYM goals, daily workouts and weekly plans without promises of score gains.
- [TestTOEIC](https://testtoeic.com/): presents practice and community activities together. Make weekly rankings and published challenge schedules discoverable.

These are layout references, not evidence of TOEIC GYM capabilities. Descriptions were checked against existing routes, the entitlement catalog, listening player, dashboard, weekly plan/review and ranking implementation.

## Result

- Hero names question practice, transcripts and daily training; the guest CTA still starts the existing ten-question Part 5 flow directly.
- Four quick feature links and three prominent feature sections follow the hero.
- A shared directory covers sixteen features, with direct destinations and positive guest/free-account access labels. Mock formats and scheduled challenges explain availability rather than promising immediate starts.
- Part guides, grammar and learning resources remain available.
- About leads with the directory and study flow, retaining content sources and the explanation of practice accuracy.
- Public header and footer expose transcripts, rankings and the complete feature directory.
- Vietnamese and English use the same feature definitions and structure. Account preferences apply consistently to both pages.

## Validation

Browser review script and screenshots: `artifacts/home-features-2026-10-02/`. The script reviews both pages in both languages at 375, 768, 1024 and 1440px, directory destinations, overflow, keyboard skip/focus, mobile navigation and the listening sign-in redirect. It requires the local app on port 3100. Authenticated feature bodies and database-dependent ranking data are outside this public-page layout review.

Passed: TypeScript check, ESLint for all changed TS/TSX files, whitespace check and all sixteen browser page/language/viewport combinations. All sixteen feature links appear once in each directory. Mobile keyboard navigation and the listening return destination passed in both languages. Screenshots were visually inspected. The local development environment emits existing CSP/eval warnings and analytics rate limits; neither prevented the reviewed interactions.
