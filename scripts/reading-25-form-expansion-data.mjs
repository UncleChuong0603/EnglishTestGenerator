import { doubleSet, p6Set } from "./reading-blueprint-expansion-data.mjs";

const organizations = [
  "Ashford", "Bellmont", "Clearwater", "Dunhill", "Evergreen", "Foxbridge", "Goldleaf", "Highland", "Ironwood", "Jasper", "Kestrel", "Longview", "Maplewood", "Newhaven", "Orchard",
];
const events = [
  ["customer workshop", "training center", "registered customers", "hands-on product demonstrations"],
  ["equipment inspection", "service depot", "maintenance teams", "a revised safety checklist"],
  ["staff orientation", "head office", "new employees", "a guided tour of the facilities"],
  ["supplier briefing", "conference hall", "purchasing teams", "updated delivery standards"],
];

export const part6TwentyFiveFormExpansion = organizations.flatMap((org, orgIndex) => events.map(([event, place, audience, feature], eventIndex) => {
  const index = orgIndex * events.length + eventIndex;
  return p6Set([
    `${org} ${event.replace(/\b\w/g, (letter) => letter.toUpperCase())}`,
    `${org} ${event}`, `${["January", "March", "May", "July", "September", "November"][index % 6]} ${3 + index % 25}`,
    `${org} ${place}`, audience, feature,
  ], index + 20);
}));

const readingServices = [
  ["Library", "notice", "room booking process", "confirm the room number in the online catalog", "longer evening study hours"],
  ["Hotel", "email", "airport transfer service", "send a flight number by noon", "a direct shuttle to the main entrance"],
  ["Market", "announcement", "vendor registration program", "submit a stall request by Thursday", "covered stands for fresh produce"],
  ["Clinic", "text_message", "appointment reminder service", "verify the appointment through the patient portal", "a shorter wait at reception"],
  ["Transit", "web_page", "temporary bus stop change", "board at the stop beside the library", "more frequent morning departures"],
  ["Museum", "notice", "guided tour schedule", "reserve a place at the information desk", "an extra afternoon tour"],
  ["Courier", "email", "parcel collection procedure", "bring a pickup code to the service counter", "extended collection hours"],
  ["Theater", "announcement", "ticket exchange policy", "request an exchange through the booking portal", "same-day seat confirmation"],
  ["Fitness", "web_page", "class enrollment system", "choose a class before Friday evening", "smaller instructor-led groups"],
  ["Training", "memo", "staff course registration", "obtain a manager's approval before enrolling", "downloadable course materials"],
];

function singleSet(org, service, index) {
  const [unit, documentType, subject, action, benefit] = service;
  const title = `${org} ${unit} Service Update`;
  const date = `${["February", "April", "June", "August", "October", "December"][index % 6]} ${2 + index % 26}`;
  const content = `${title}\n\nBeginning on ${date}, ${org} ${unit.toLowerCase()} will introduce an updated ${subject}. Customers should ${action}. The change will provide ${benefit}. The information desk is open from 9:00 A.M. to 5:00 P.M. on weekdays. Existing reservations remain valid; customers need not submit them again.`;
  const answerIndex = (offset) => (index + offset) % 4;
  const options = (correct, wrong, offset) => {
    const values = [...wrong]; values.splice(answerIndex(offset), 0, correct);
    return values.map((text, position) => ({ key: ["A", "B", "C", "D"][position], text, correct: position === answerIndex(offset) }));
  };
  const q = (order, skill, subSkill, text, correct, wrong, en, vi) => ({
    key: `q${order}`, order, skill, subSkill, text, difficulty: order === 3 ? "medium" : "easy", questionType: "reading_comprehension", passageKey: "doc1", status: "published",
    options: options(correct, wrong, order - 1), explanationEn: en, explanationVi: vi,
  });
  const questions = [
    q(1, "purpose", "document_purpose", `Why was the ${title} published?`, `To explain a change to the ${subject}`, ["To announce a vacant position", "To report a missing payment", "To compare two suppliers"], `The opening sentence introduces an updated ${subject}.`, `Câu mở đầu giới thiệu thay đổi đối với ${subject}.`),
    q(2, "detail", "explicit_information", `What should ${org} customers do under the new arrangement?`, action[0].toUpperCase() + action.slice(1), ["Cancel every existing reservation", "Wait for a letter in the mail", "Contact the accounting team"], `The document directly tells customers to ${action}.`, `Văn bản trực tiếp yêu cầu khách hàng ${action}.`),
    q(3, "detail", "explicit_information", `What benefit is mentioned in the ${title}?`, benefit[0].toUpperCase() + benefit.slice(1), ["A cash refund for all customers", "Free annual membership", "A new employee discount card"], `The third sentence identifies ${benefit} as the benefit.`, `Câu thứ ba nêu rõ lợi ích là ${benefit}.`),
  ];
  return {
    key: `p7-single-form25-${String(index + 1).padStart(3, "0")}`, toeicPart: 7, setType: "single", title, status: "published",
    passages: [{ key: "doc1", position: 1, documentType, title, content }], questions: index % 10 === 9 ? questions.slice(0, 2) : questions,
  };
}

export const part7TwentyFiveFormExpansion = [
  ...organizations.flatMap((org, orgIndex) => readingServices.map((service, serviceIndex) => singleSet(org, service, orgIndex * readingServices.length + serviceIndex))),
  ...Array.from({ length: 75 }, (_, index) => doubleSet(index + 30)),
];
