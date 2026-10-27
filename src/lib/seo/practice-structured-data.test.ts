import { describe, expect, it } from "vitest";
import { practiceStructuredData } from "./practice-structured-data";

describe("practice structured data", () => {
  it("describes a free embedded quiz at its canonical URL", () => {
    const data = practiceStructuredData({
      path: "/toeic/part-5/practice",
      title: "Bài tập TOEIC Part 5",
      description: "Bảy câu có lời giải",
      questionCount: 7,
    }, "https://toeicgym.net");
    expect(data).toMatchObject({
      "@type": "LearningResource",
      url: "https://toeicgym.net/toeic/part-5/practice",
      isAccessibleForFree: true,
      hasPart: { "@type": "Quiz", numberOfQuestions: 7 },
    });
  });
});
