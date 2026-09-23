const KEYS = ["A", "B", "C", "D"];
const companies = ["Alder", "Benton", "Creston", "Dover", "Elmwood", "Fairview", "Granite", "Harbor", "Ivory", "Juniper"];

export const patterns = [
  { skill: "grammar", subSkill: "verb_tense", sentence: (c) => `${c} Logistics _____ the revised delivery schedule yesterday.`, correct: "announced", wrong: ["announces", "will announce", "announcing"], en: "The finished time marker 'yesterday' requires the simple past 'announced'.", vi: "Mốc thời gian đã kết thúc 'yesterday' yêu cầu thì quá khứ đơn 'announced'." },
  { skill: "grammar", subSkill: "subject_verb_agreement", sentence: (c) => `Each of the ${c} conference rooms _____ a digital display.`, correct: "has", wrong: ["have", "having", "are having"], en: "The grammatical subject is the singular pronoun 'Each', so the verb must be 'has'.", vi: "Chủ ngữ ngữ pháp là đại từ số ít 'Each', nên động từ phải là 'has'." },
  { skill: "grammar", subSkill: "passive_voice", sentence: (c) => `All ${c} expense claims must _____ by a supervisor.`, correct: "be approved", wrong: ["approve", "be approving", "approved them"], en: "Claims receive the action; after 'must', the passive form is 'be approved'.", vi: "Các yêu cầu thanh toán nhận hành động; sau 'must', dạng bị động đúng là 'be approved'." },
  { skill: "grammar", subSkill: "word_form", sentence: (c) => `${c}'s receptionist responded _____ to the visitor's request.`, correct: "promptly", wrong: ["prompt", "promptness", "prompting"], en: "An adverb is needed to modify 'responded', so 'promptly' is correct.", vi: "Cần trạng từ bổ nghĩa cho 'responded', vì vậy 'promptly' là đáp án đúng." },
  { skill: "grammar", subSkill: "prepositions", sentence: (c) => `${c} employees must submit travel requests _____ Friday noon.`, correct: "by", wrong: ["among", "toward", "through"], en: "'By' introduces the latest time at which the request may be submitted.", vi: "'By' chỉ thời hạn muộn nhất mà yêu cầu có thể được nộp." },
  { skill: "grammar", subSkill: "conjunctions_connectors", sentence: (c) => `${c} will add another checkout counter _____ customers can be served faster.`, correct: "so that", wrong: ["although", "unless", "whereas"], en: "'So that' introduces the intended result of adding the counter.", vi: "'So that' giới thiệu kết quả mong muốn của việc bổ sung quầy thanh toán." },
  { skill: "grammar", subSkill: "relative_clauses", sentence: (c) => `The consultant _____ advised ${c} will return next week.`, correct: "who", wrong: ["which", "whose", "where"], en: "'Who' is the subject relative pronoun referring to the consultant, a person.", vi: "'Who' là đại từ quan hệ làm chủ ngữ, thay cho người tư vấn." },
  { skill: "grammar", subSkill: "gerunds_infinitives", sentence: (c) => `${c} plans _____ its customer portal in April.`, correct: "to upgrade", wrong: ["upgrading", "upgrade", "upgraded"], en: "The verb 'plan' is followed by a to-infinitive: 'plans to upgrade'.", vi: "Động từ 'plan' đi với động từ nguyên mẫu có 'to': 'plans to upgrade'." },
  { skill: "vocabulary", subSkill: "collocations", sentence: (c) => `${c} will _____ a survey to measure customer satisfaction.`, correct: "conduct", wrong: ["perform of", "make on", "operate to"], en: "'Conduct a survey' is the natural business collocation for carrying out a survey.", vi: "'Conduct a survey' là cụm từ kết hợp tự nhiên để diễn tả việc tiến hành khảo sát." },
  { skill: "vocabulary", subSkill: "contextual_vocabulary", sentence: (c) => `Because demand has risen, ${c} will _____ production next month.`, correct: "increase", wrong: ["postpone", "inspect", "borrow"], en: "Rising demand logically requires the company to produce more, so 'increase' fits the context.", vi: "Nhu cầu tăng khiến công ty cần sản xuất nhiều hơn, nên 'increase' phù hợp với ngữ cảnh." },
];

export const part5BlueprintExpansion = patterns.flatMap((pattern, patternIndex) => companies.map((company, companyIndex) => {
  const answerIndex = (patternIndex + companyIndex) % 4;
  const values = [...pattern.wrong];
  values.splice(answerIndex, 0, pattern.correct);
  return {
    key: `p5-blueprint-${String(patternIndex * companies.length + companyIndex + 201).padStart(3, "0")}`,
    toeicPart: 5, questionType: "incomplete_sentence", skill: pattern.skill, subSkill: pattern.subSkill,
    difficulty: companyIndex < 3 ? "easy" : companyIndex < 8 ? "medium" : "hard", status: "published",
    text: pattern.sentence(company), options: values.map((text, index) => ({ key: KEYS[index], text })),
    answer: KEYS[answerIndex], explanationEn: pattern.en, explanationVi: pattern.vi,
  };
}));
