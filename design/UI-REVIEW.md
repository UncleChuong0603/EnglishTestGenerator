# TOEIC GYM UI review — 23 September 2026

## Product direction

The product helps a learner turn an actual answer into a sensible next practice session: diagnostic → focused workout → mistake review → progress. The interface should explain that path plainly and should never suggest that raw accuracy is an official TOEIC score. Admin work starts from the items awaiting action, with statistics as context.

## Review findings

- Public pages used a dark section, a dark callout and several similarly weighted rounded cards. The value of the diagnostic was harder to see than the decoration.
- The learner dashboard placed plan limits and Premium information ahead of learning progress and mistake review. The workout itself was strong but competed with gradient panels.
- The admin overview repeated statistics in a hero and a second metric row. Pending work appeared after the metrics, which slowed the daily operator workflow.
- The navigation systems had different visual weights. Admin navigation was especially tall because every group was boxed.
- Pricing information is detailed and honest. Its structure is retained, with the plan cards adapted to the calmer visual language.

## Implemented direction

- Warm paper background, ink text, forest green actions and restrained terracotta for small accents.
- One primary action in the landing hero and a real, labeled example of diagnostic output.
- A short three-step explanation grounded in the product loop.
- Learner dashboard: one prominent workout, then daily goal, evidence, mistakes and plan information.
- Practice page: recommendation and custom setup appear before the Listening quick-start catalogue.
- Mistake Bank: review action and the actual questions appear before the optional Premium preview.
- Admin overview: work queue first, four compact key measures, grouped operational details and recent audit activity.
- Admin user retention and content priority panels use the same calm work-surface treatment.
- Flat borders and clear spacing replace glows, heavy shadows and decorative gradients on the redesigned surfaces.

## Imagegen deliverables

- [Three-screen visual direction](./toeicgym-ui-direction.png): generated UI mockup for public, learner and admin screens. It is a concept reference, not a production screenshot.
- [Study-desk asset](../public/images/study-desk.webp): generated candid study photograph used in the public hero. The production asset is a 149 KB WebP.

Both were created with the built-in imagegen tool. The study-desk prompt requested a documentary-style Vietnamese study scene with a blank notebook, pencil and headphones, natural daylight, no text, logos or UI. The direction-board prompt requested three coherent, practical web screens with warm paper, ink text, restrained green actions and no gradients or generic AI imagery.

### Final imagegen prompts

**Three-screen direction board**

```text
Use case: ui-mockup
Asset type: visual direction board for a Vietnamese TOEIC learning website redesign, three desktop screens side by side: public landing page, learner dashboard, admin operations overview.
Primary request: show a cohesive, human, editorial product UI that feels like a thoughtfully designed learning tool. The public page offers a clear free diagnostic and an honest sample result. The learner page presents one recommended next workout, a small daily progress indicator and mistakes to review. The admin page prioritizes a concise work queue, content review and straightforward metrics.
Style/medium: high fidelity web interface mockup, clean typography, realistic spacing, believable interface layout, warm off-white paper background, deep ink text, restrained forest green action color, occasional muted apricot/coral for guidance. Subtle ruled paper or notebook cues only where useful. No gradients, glows, glassmorphism, inflated cards, 3D objects, generic AI motifs, stock avatars, robots, or fake testimonials.
Composition/framing: 16:9 design presentation showing all three screens as a coherent family, generous margins and whitespace, crisp flat UI, no perspective skew. Vietnamese educational product context.
Text: minimal legible labels only: 'TOEIC GYM', 'Bắt đầu đánh giá', 'Bài hôm nay', 'Cần xử lý'. Avoid long paragraphs and invented numbers.
Constraints: make navigation and visual hierarchy practical; do not make the image itself the final production UI. This is a direction board to guide native HTML/CSS implementation.
```

**Final study-desk image**

```text
Use case: photorealistic-natural
Asset type: wide website image for TOEIC GYM, a Vietnamese TOEIC practice site.
Primary request: documentary-style quiet study scene, a young adult Vietnamese learner's hands arranging a completely blank open notebook and a simple pencil beside wired headphones on a wooden desk. Only hands/forearms visible; no face. Soft daylight from a window, modest lived-in room, authentic material textures.
Composition/framing: 16:9 wide landscape, objects and hands mainly on the right half, generous calm tabletop negative space on the left. The notebook pages must be entirely blank: absolutely no handwriting, no printed lines, no letters, no symbols.
Color/mood: warm natural daylight, cream paper, dark wood, subtle forest green fabric accent, welcoming and focused.
Avoid: all text, logos, charts, UI, watermarks, fake typography, gradients, glossy 3D, stock photo smiles, staged classroom.
```

## Browser review

- [Landing desktop](./landing-desktop.png) and [landing mobile](./landing-mobile.png): rendered locally at 1440 px and 390 px; both had no horizontal overflow.
- [Pricing mobile](./pricing-mobile.png): rendered locally at 390 px; no horizontal overflow.
- The live domain returned HTTP 404 during this review, so the design was based on the local application and product code.
- An unauthenticated visit to the admin route displayed the sign-in page. The authenticated admin and learner views still need a visual pass with real account data.
