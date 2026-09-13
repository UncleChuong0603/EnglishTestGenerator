const KEYS = ["A", "B", "C", "D"];

const scenarios = [
  ["Harbor Sales Forum", "conference", "October 14", "Bayview Center", "regional sales teams", "updated product demonstrations"],
  ["Northgate Supplier Day", "supplier meeting", "November 3", "Northgate Plant", "approved vendors", "a tour of the new assembly line"],
  ["Cedar Hospitality Workshop", "training workshop", "September 22", "Cedar Hotel", "front-desk supervisors", "customer-service exercises"],
  ["Lumen Design Expo", "design exhibition", "December 6", "Lumen Gallery", "local retailers", "sustainable packaging displays"],
  ["Metro Logistics Briefing", "logistics briefing", "January 18", "Metro Depot", "delivery coordinators", "route-planning demonstrations"],
  ["Riverside Water Maintenance", "maintenance project", "August 9", "Riverside Complex", "building tenants", "inspection of the main water line"],
  ["Orchid App Upgrade", "software upgrade", "July 27", "Orchid Portal", "account holders", "a redesigned billing dashboard"],
  ["Pine Street Elevator Service", "equipment service", "March 11", "Pine Street Offices", "office occupants", "replacement of the control panel"],
  ["Summit Rail Schedule Change", "schedule revision", "April 2", "Summit Station", "weekday passengers", "additional morning departures"],
  ["Maple Library Renovation", "renovation project", "February 16", "Maple Library", "library members", "expanded study areas"],
  ["BrightPath Supervisor Course", "management course", "May 8", "BrightPath Academy", "new supervisors", "conflict-resolution practice"],
  ["Aster Safety Orientation", "safety orientation", "June 19", "Aster Warehouse", "seasonal employees", "hands-on equipment instruction"],
  ["Kiteworks Internship Program", "internship program", "January 29", "Kiteworks Studio", "university applicants", "mentoring from senior designers"],
  ["Greenfield Accounting Seminar", "accounting seminar", "October 7", "Greenfield Campus", "finance assistants", "guidance on the revised expense policy"],
  ["Solace Customer Care Training", "service training", "November 21", "Solace Center", "support representatives", "practice with the new ticket system"],
  ["Westport Chair Order", "furniture order", "August 24", "Westport Showroom", "corporate purchasers", "complimentary room measurements"],
  ["NovaPrint Brochure Request", "printing order", "September 5", "NovaPrint Office", "marketing departments", "a digital proof before production"],
  ["Elm Catering Reservation", "catering reservation", "December 12", "Elm Kitchen", "event organizers", "a seasonal menu consultation"],
  ["Clearview Equipment Rental", "equipment rental", "March 28", "Clearview Depot", "construction teams", "delivery and collection service"],
  ["BluePeak Subscription Renewal", "subscription renewal", "April 15", "BluePeak Website", "business subscribers", "access to quarterly market reports"],
];

function options(values, answerIndex) {
  return values.map((text, index) => ({ key: KEYS[index], text, correct: index === answerIndex }));
}

const templates = [
  (s) => ({
    content: `To: ${s[4]}\nSubject: ${s[0]}\n\nWe are pleased to (1) _____ that the ${s[1]} will take place on ${s[2]} at ${s[3]}. The program has been (2) _____ to include ${s[5]}. (3) _____, attendees should arrive thirty minutes early to collect their name badges. (4) _____ We look forward to welcoming you.`,
    questions: [
      ["vocabulary", "contextual_vocabulary", "announce", ["announce", "divide", "borrow", "repair"], 0],
      ["grammar", "word_form", "expanded", ["expansion", "expansive", "expanded", "expansively"], 2],
      ["cohesion", "connectors", "For this reason", ["Instead", "For this reason", "Similarly", "Otherwise"], 1],
      ["sentence_insertion", "sentence_fit", "Registration confirmations contain a map of the venue.", ["Registration confirmations contain a map of the venue.", "The previous event was canceled five years ago.", "No products are sold at the reception desk.", "The venue closes every morning."], 0],
    ],
  }),
  (s) => ({
    content: `NOTICE TO ${s[4].toUpperCase()}\n\nWork connected with the ${s[1]} is scheduled for ${s[2]} at ${s[3]}. Access to the affected area will be (1) _____ between 8:00 A.M. and noon. (2) _____ the work is in progress, please follow the temporary direction signs. The project team expects the work to be completed (3) _____. (4) _____ Thank you for your patience as we complete this work, which includes ${s[5]}.`,
    questions: [
      ["vocabulary", "contextual_vocabulary", "restricted", ["reserved", "restricted", "requested", "restored"], 1],
      ["cohesion", "connectors", "While", ["Despite", "Unless", "While", "Besides"], 2],
      ["grammar", "word_form", "promptly", ["prompt", "promptness", "prompted", "promptly"], 3],
      ["sentence_insertion", "sentence_fit", "Staff members will be available to assist anyone who needs an alternate route.", ["Invoices are issued on the final day of each month.", "Staff members will be available to assist anyone who needs an alternate route.", "The cafeteria introduced a new lunch menu.", "Applications must include two references."], 1],
    ],
  }),
  (s) => ({
    content: `From: Learning and Development\nSubject: ${s[0]}\n\nApplications are now open to ${s[4]} for our ${s[1]} on ${s[2]}. The session at ${s[3]} is designed to provide (1) _____ instruction and ${s[5]}. Managers should (2) _____ eligible staff members to apply. Space is limited; (3) _____, completed forms must reach Human Resources by Friday. (4) _____ Selected participants will receive confirmation next week.`,
    questions: [
      ["grammar", "word_form", "practical", ["practice", "practical", "practically", "practiced"], 1],
      ["vocabulary", "contextual_vocabulary", "encourage", ["encourage", "estimate", "exchange", "enclose"], 0],
      ["cohesion", "connectors", "therefore", ["meanwhile", "for example", "therefore", "nevertheless"], 2],
      ["sentence_insertion", "sentence_fit", "The application form is available on the employee portal.", ["The application form is available on the employee portal.", "Visitors parked behind the warehouse yesterday.", "The annual report contains six charts.", "No refund was requested by the vendor."], 0],
    ],
  }),
  (s) => ({
    content: `Dear ${s[4]},\n\nThank you for contacting us about the ${s[1]} planned for ${s[2]}. We have (1) _____ your request through ${s[3]} and added ${s[5]}. Please review the attached summary (2) _____ to ensure that every detail is correct. Changes may be made without charge until five business days before the scheduled date. (3) _____, later changes may result in an additional fee. (4) _____ We appreciate the opportunity to assist you.`,
    questions: [
      ["grammar", "tense", "processed", ["process", "will process", "processed", "processing"], 2],
      ["context", "document_context", "carefully", ["rarely", "carefully", "brief", "nearly"], 1],
      ["cohesion", "logical_flow", "However", ["Likewise", "Therefore", "For instance", "However"], 3],
      ["sentence_insertion", "sentence_fit", "If you approve the summary, no further action is required.", ["The nearest station was built in 1984.", "Our employees wear blue uniforms on Mondays.", "If you approve the summary, no further action is required.", "The catalog is printed on recycled paper."], 2],
    ],
  }),
];

export const part6Sets = scenarios.map((scenario, index) => {
  const generated = templates[Math.floor(index / 5)](scenario);
  return {
    key: `p6-${String(index + 1).padStart(2, "0")}`,
    toeicPart: 6,
    setType: "part6",
    title: scenario[0],
    status: "published",
    passages: [{ key: "document", position: 1, documentType: index % 4 === 1 ? "notice" : "email", title: scenario[0], content: generated.content }],
    questions: generated.questions.map(([skill, subSkill, answerText, choices, answerIndex], questionIndex) => ({
      key: `q${questionIndex + 1}`,
      passageKey: "document",
      order: questionIndex + 1,
      questionType: questionIndex === 3 ? "sentence_insertion" : "text_completion",
      skill,
      subSkill,
      difficulty: questionIndex === 0 ? "easy" : questionIndex === 3 ? "hard" : "medium",
      status: "published",
      text: `Choose the best completion for blank (${questionIndex + 1}) in “${scenario[0]}.”`,
      options: options(choices, answerIndex),
      explanationEn: `“${answerText}” completes the document naturally and preserves its meaning and flow.`,
      explanationVi: `“${answerText}” hoàn thành văn bản một cách tự nhiên và duy trì đúng ý nghĩa, mạch văn.`,
    })),
  };
});
