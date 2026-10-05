# Homepage override

Use the global [MASTER.md](../MASTER.md) rules, with these homepage priorities:

1. The first viewport leads with the core promise: practice real mistakes and know what to study today. Keep the short free practice action prominent; transcript, vocabulary and other tools support the promise instead of competing with it.
2. The guest hero action starts a Part 5 session directly: ten questions, no account, results and explanations after submission. Other entry links may open `/challenge/part-5`. The signed-in hero action goes to `/dashboard`.
3. Show a clearly labeled illustration of how learning evidence becomes today's workout and a weekly path. The example may include a real question and explanation, but must not present fabricated scores, progress or unsupported weakness detection as real.
4. Below the hero, explain the adaptive daily/weekly loop and give prominent, authentic entry points to transcript listening, vocabulary and grammar. Put mistake review, today's workout and the weekly path first in the shared feature directory. Ranking remains available but does not outrank the learning loop. Follow with Part guides and learning resources. Reuse the directory on the About page so feature descriptions and destinations stay consistent.
5. Keep plan limits and Premium upsells out of this first-use page. Pricing details remain available on the dedicated pricing page.
6. Keep the header as the only navigation system on the public homepage. Vocabulary is a direct top-bar destination. Lead with the promise, evidence and action on mobile; supporting product preview follows.
7. Verify 375px, 768px, 1024px and 1440px, both Vietnamese and English, plus keyboard focus and route destinations.

## Visual direction

The homepage is a deliberate dark marketing surface inspired by immersive editorial product pages, while the learning app keeps the light work-surface system from `MASTER.md`. Use `#071915` for the page, `#0b211b` for raised demonstrations, `#eef9f2` for primary copy, `#a9c0b5` for supporting copy, `#21463b` for rules and `#7be5bd` as the single action accent. Keep the implementation flat: strong type, thin rules, a restrained grid texture and real product examples; no glass panels, gradients, decorative stock art or fabricated social proof.

Tell the page as sequential chapters: promise and real next-session preview → core daily/weekly adaptation → free remediation tools → complete feature directory → Part guides and learning resources. On mobile, preserve that order rather than creating a separate compressed feature pitch.

## Feature content

Use `src/lib/marketing/features.ts` for the basic Free feature directory. Explain whether a visitor can open the feature now or needs a free account. Diagnostic supports guests. Listening and vocabulary show the real learner interface to guests, including one complete listening sample and one vocabulary quiz question. Request a free sign-in for the remaining library and questions, protected study content, saving words and progress. Saved learning tools require an account. Mock formats and scheduled challenges remain subject to their real availability. Avoid describing Premium targeting or skill analysis as Free. Show authentic library titles and transcript excerpts instead of invented player screenshots or learner results.
