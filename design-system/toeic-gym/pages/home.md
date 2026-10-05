# Homepage override

Use the global [MASTER.md](../MASTER.md) rules, with these homepage priorities:

1. The first viewport names actual practice options: questions, audio with transcripts and daily workouts. Keep the short free practice action prominent.
2. The guest hero action starts a Part 5 session directly: ten questions, no account, results and explanations after submission. Other entry links may open `/challenge/part-5`. The signed-in hero action goes to `/dashboard`.
3. Show a clearly labeled illustrative answer explanation beside the hero. Do not present fabricated scores or user progress as real.
4. Below the hero, link directly to listening with transcripts, daily workouts, weekly rankings and vocabulary. Give listening, workouts and rankings prominent sections with real content and accurate access labels. Follow with a complete feature directory, then Part guides and learning resources. Reuse the directory on the About page so feature descriptions and destinations stay consistent.
5. Keep plan limits and Premium upsells out of this first-use page. Pricing details remain available on the dedicated pricing page.
6. Keep the header as the only navigation system on the public homepage. Vocabulary is a direct top-bar destination. Lead with copy and the action on mobile; supporting product preview follows.
7. Verify 375px, 768px, 1024px and 1440px, both Vietnamese and English, plus keyboard focus and route destinations.

## Feature content

Use `src/lib/marketing/features.ts` for the basic Free feature directory. Explain whether a visitor can open the feature now or needs a free account. Diagnostic supports guests. Listening and vocabulary show the real learner interface to guests, including one complete listening sample and one vocabulary quiz question. Request a free sign-in for the remaining library and questions, protected study content, saving words and progress. Saved learning tools require an account. Mock formats and scheduled challenges remain subject to their real availability. Avoid describing Premium targeting or skill analysis as Free. Show authentic library titles and transcript excerpts instead of invented player screenshots or learner results.
