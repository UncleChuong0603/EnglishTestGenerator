import { patterns } from "./part5-blueprint-expansion-data.mjs";

const names = [
  "Ashford", "Bellmont", "Clearwater", "Dunhill", "Evergreen", "Foxbridge", "Goldleaf", "Highland", "Ironwood",
  "Jasper", "Kestrel", "Longview", "Maplewood", "Newhaven", "Orchard", "Pinecrest", "Quayside", "Riverton",
  "Silveroak", "Trillium", "Upland", "Valemont", "Westbrook", "Yorkshire", "Zenith", "Arborfield", "Bluewater",
  "Copperfield", "Daleside", "Eastport", "Fernwood", "Greystone", "Hawthorne", "Inverness", "Kingsford", "Larkspur",
  "Millstone", "Norwood", "Overlook", "Portwell", "Redstone", "Springvale", "Timberline", "Unionford", "Whitecliff",
];
const keys = ["A", "B", "C", "D"];

export const part5TwentyFiveFormExpansion = patterns.flatMap((pattern, patternIndex) => names.map((name, nameIndex) => {
  const answerIndex = (patternIndex * 3 + nameIndex) % 4;
  const values = [...pattern.wrong];
  values.splice(answerIndex, 0, pattern.correct);
  return {
    key: `p5-form25-${String(patternIndex * names.length + nameIndex + 1).padStart(3, "0")}`,
    toeicPart: 5, questionType: "incomplete_sentence", skill: pattern.skill, subSkill: pattern.subSkill,
    difficulty: nameIndex % 9 < 3 ? "easy" : nameIndex % 9 < 7 ? "medium" : "hard", status: "published",
    text: pattern.sentence(name), options: values.map((text, index) => ({ key: keys[index], text })),
    answer: keys[answerIndex], explanationEn: pattern.en, explanationVi: pattern.vi,
  };
}));
