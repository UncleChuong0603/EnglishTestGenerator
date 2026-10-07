# TOEIC GYM design system

This is the shared direction for public, learner and admin interfaces. Read this file before UI work, then read a matching file in `pages/` if one exists. The product's existing [UI review](../../design/UI-REVIEW.md) and [UI audit](../../artifacts/ui-screenshots/UI-AUDIT.md) provide product context and known issues.

The `ui-ux-pro-max` skill was queried for **adult education exam preparation minimal**. Its suitable recommendations are a clear hero, visible primary action, restrained grid layout, readable type, keyboard focus and responsive review. Its generic black/gold palette and Outfit/Work Sans pairing were adapted to TOEIC GYM's established visual language. The children's education suggestion (clay surfaces and Comic fonts) does not fit adult exam preparation.

## Product promise

TOEIC GYM helps each learner know exactly what to practice today. Learners set a target, answer questions, understand mistakes, review until stronger and receive a useful next session and weekly path from real learning evidence. Public pages show that cycle with real routes and honest examples. Raw accuracy must never be presented as an official TOEIC score. Do not invent testimonials, progress metrics or user results.

Do not market the product as a generic collection of TOEIC tools or as a feature-count competitor. The durable product loop is learning history → supported priority → recommendation → remediation → mastery → next recommendation. Transcript listening, vocabulary, grammar, mock exams and progress are valuable when they reinforce that loop.

For first-time visitors, lead with a short practice that works without an account. Explain account benefits when relevant. Do not put plan quotas or Premium upsells in the first-use path; show an entitlement reminder when the actual limit is reached. Pricing and account pages can describe limits where the user seeks that information.

## Visual foundation

| Token | Value | Use |
| --- | --- | --- |
| Night | `#071915` | Homepage/About and shared learner/admin page background |
| Raised night | `#0b211b` | Cards, forms, tables and work surfaces |
| Deep night | `#04110e` | Strong inset sections and dark-on-mint copy |
| Paper text | `#eef9f2` | Primary copy on dark surfaces |
| Muted sage | `#a9c0b5` | Supporting copy |
| Mint | `#7be5bd` | Primary actions and active states |
| Mint soft | `#bff4dc` | Primary action hover |
| Night rule | `#21463b` | Dividers and borders |
| Warm accent | `#efb58e` | Small semantic emphasis only |

Use the existing Be Vietnam Pro font from `src/app/layout.tsx`. Keep body text readable in Vietnamese and English. Use a restrained type scale: 16px body, 20–28px card headings, 32–60px page headings according to space. Prefer weight, spacing and contrast to decoration.

Use flat borders, modest corner radius and purposeful whitespace. Avoid gradient panels, glass effects, oversized shadows, floating cards, invented UI screenshots, decorative emoji and repeated card grids. Use SVG icons when an icon is needed. A real question, explanation or learning action is better visual evidence than an abstract illustration.

## Interaction and content

- One clear primary action per view. Name the task it starts, such as “Làm thử 10 câu”, rather than a vague “Khám phá”.
- Each page should answer what the learner can do, what happens after doing it and where to go next.
- Keep public navigation small. Put focused learner navigation in the app after sign-in; do not show two navigation systems at the same level on the homepage.
- Explain free access positively. Do not surface quotas until the user reaches one. Never imply that a readiness-gated mock test is immediately startable.
- Show loading, error, empty, correct and incorrect states when applicable. Preserve user answers and scroll position when practical.
- Make all interactive elements keyboard accessible with visible focus. Controls need clear labels; color alone cannot carry meaning.
- Body text needs at least 4.5:1 contrast. Aim for touch targets of at least 44px and gaps that prevent accidental taps.
- Respect `prefers-reduced-motion`; use motion only to clarify state changes.

## Mascot and data storytelling

Milo is TOEIC GYM's chibi owl study coach. Use the transparent production asset at `public/mascot/milo-coach.webp`. Milo wears the established forest/cream palette and represents calm coaching, useful next steps and careful review—not points, streak pressure or fabricated achievement.

- Public pages may show Milo as a welcoming guide near real product evidence and first practice actions.
- Learner pages use short contextual coaching tied to the current task. During active practice, diagnostics and timed tests, Milo stays compact and never covers questions, audio, timers, navigation or submit controls.
- Admin pages frame Milo as an operations coach: prioritize pending work and interpret trends carefully. Do not use celebratory poses for routine operational metrics.
- Keep text in HTML, never baked into the mascot image. The mascot is decorative when adjacent copy already names its role; contextual advice remains readable without the image.
- Do not recolor, distort, mirror inconsistently or combine Milo with unrelated emoji/icon styles.

Use line charts when a time relationship matters. Charts must render real first-party data, name their time period and timezone where relevant, expose an equivalent screen-reader summary/list, and provide an honest empty state. A chart must not imply an official TOEIC score or trend when the sample is absent.

Motion follows three levels: rich but calm on marketing pages, restrained on learner tools, and minimal on active assessments/admin work surfaces. Shared durations, easing and reduced-motion behavior live in `src/app/globals.css`; avoid per-page animation values unless the interaction genuinely differs.

## Responsive review

Check 375px, 768px, 1024px and 1440px. The primary action and core message must appear before supporting art on mobile. No horizontal overflow, clipped Vietnamese text or tiny controls. Use a content width near 1280px for public sections; reading text should stay much narrower.

## Surface priorities

1. Public: immediate free practice, credible product proof, simple navigation and honest explanations.
2. Learner: one next workout, mistakes to review, progress and plan context.
3. Practice: question and passage readability, audio controls, clear progress, safe submission and useful explanations.
4. Admin: pending work first, compact metrics as context, dense but readable controls.

## Workspace inheritance

Learner and admin workspaces inherit the public story's visual identity without copying its marketing density. The page canvas is night (`#071915`), cards/forms/tables use raised night (`#0b211b`), primary copy uses paper (`#eef9f2`) and mint (`#7be5bd`) is the single action accent. Forms, tables, cards, focus rings and status surfaces must resolve through the shared tokens in `src/app/globals.css` rather than introduce a second light slate/teal theme.

- Learner pages may use the homepage's restrained 56px mint-on-night grid behind content. Active practice and timed assessment routes remove the grid and decorative motion.
- Admin pages use the same navigation and surface palette at higher information density. Operational status colors remain semantic and must not be recolored as brand decoration.
- Desktop and mobile navigation use the same dark editorial shell. Work surfaces remain distinct through borders and tone, not white cards or heavy shadows.
- New pages should use semantic HTML (`main`, `header`, `section`, `article`, `form`, `table`) so the shared product layer can style them consistently before page-specific overrides are added.

Review actual screenshots and interaction states after each surface change. Run the relevant lint, typecheck and browser checks for the modified flow.
