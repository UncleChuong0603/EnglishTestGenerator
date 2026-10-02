import { existsSync, statSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ListeningSampleQuiz } from "@/components/seo/listening-sample-quiz";
import { listeningGuides } from "./listening-guides";
import { samplesForListeningPart } from "./listening-samples";

describe("public Listening practice", () => {
  it("publishes one direct and three indirect Part 2 examples without changing Part 1 or 4", () => {
    expect(samplesForListeningPart(2).map(sample => sample.questions[0].answer)).toEqual([0, 1, 2, 0]);
    expect(samplesForListeningPart(1)).toHaveLength(1);
    expect(samplesForListeningPart(4)[0].questions).toHaveLength(3);
    expect(listeningGuides[2].sections).toHaveLength(4);
    expect(listeningGuides[2].description).toContain("4 câu");
  });

  for (const part of [1, 2, 4] as const) {
    it(`has valid original media and all explanations in initial HTML for Part ${part}`, () => {
      const samples = samplesForListeningPart(part);
      expect(new Set(samples.map(sample => sample.id)).size).toBe(samples.length);
      for (const sample of samples) {
        expect(existsSync(`public${sample.audio}`), sample.audio).toBe(true);
        expect(statSync(`public${sample.audio}`).size).toBeGreaterThan(1000);
        for (const question of sample.questions) {
          expect(question.options).toHaveLength(part === 2 ? 3 : 4);
          expect(new Set(question.options).size).toBe(question.options.length);
          expect(question.answer).toBeGreaterThanOrEqual(0);
          expect(question.answer).toBeLessThan(question.options.length);
          for (const letter of question.options.map((_, index) => String.fromCharCode(65 + index))) expect(question.explanation).toContain(letter);
        }
        const html = renderToStaticMarkup(<ListeningSampleQuiz sample={sample} />);
        expect(html.match(/<fieldset/g)).toHaveLength(sample.questions.length);
        expect(html.match(/<details\b/g)).toHaveLength(sample.questions.length + 1);
        expect(html).not.toMatch(/<details[^>]*\bopen(?:[ =>])/);
        for (const question of sample.questions) expect(html).toContain(renderToStaticMarkup(<p>{question.explanation}</p>));
        for (const line of sample.transcript) expect(html).toContain(renderToStaticMarkup(<p>{line}</p>));
        expect(html).toContain("Chấm bài tự động cần JavaScript");
      }
    });
  }

  it("keeps radio groups separate across audio exercises and localizes controls", () => {
    const html = renderToStaticMarkup(<>{samplesForListeningPart(2).map(sample => <ListeningSampleQuiz key={sample.id} sample={sample} locale="en" />)}</>);
    const groups = [...html.matchAll(/name="([^"]+)"/g)].map(match => match[1]);
    expect(new Set(groups).size).toBe(4);
    expect(html).toContain("Check answers");
    expect(html).toContain("Try again");
    for (const number of [1, 2, 3, 4]) expect(html).toContain(`Answer and explanation for question ${number}`);
    expect(html).toContain("Synthesized speech");
    expect(html).toContain('<legend class="font-bold leading-7" lang="en"');
    expect(html).toContain('<div class="mt-3" lang="vi"');
  });
});
