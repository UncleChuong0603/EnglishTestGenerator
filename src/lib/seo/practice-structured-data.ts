import { getSiteUrl } from "./site-url";

export function practiceStructuredData(input: {
  path: string;
  title: string;
  description: string;
  questionCount: number;
}, base = getSiteUrl()) {
  const url = new URL(input.path, base).toString();
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "@id": `${url}#learning-resource`,
    url,
    name: input.title,
    description: input.description,
    inLanguage: "vi",
    learningResourceType: "Practice problem",
    educationalLevel: "TOEIC preparation",
    isAccessibleForFree: true,
    hasPart: {
      "@type": "Quiz",
      "@id": `${url}#practice`,
      name: input.title,
      about: "TOEIC Listening and Reading",
      inLanguage: ["vi", "en"],
      numberOfQuestions: input.questionCount,
    },
  };
}
