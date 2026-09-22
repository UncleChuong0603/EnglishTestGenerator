const KEYS = ["A", "B", "C", "D"];

function options(correct, distractors, answerIndex) {
  const values = [...distractors];
  values.splice(answerIndex, 0, correct);
  return values.map((text, index) => ({ key: KEYS[index], text, correct: index === answerIndex }));
}

function item({ key, order, skill, subSkill, text, correct, distractors, answerIndex, explanationEn, explanationVi, difficulty = "medium", questionType = "reading_comprehension", passageKey = null }) {
  return {
    key, order, skill, subSkill, text, difficulty, questionType, passageKey, status: "published",
    options: options(correct, distractors, answerIndex), explanationEn, explanationVi,
  };
}

const p6Scenarios = [
  ["Alder Branch Reopening", "bank branch", "February 3", "Alder Avenue", "customers", "a larger advice area"],
  ["Bayside Inventory System", "inventory platform", "March 17", "Bayside Warehouse", "warehouse staff", "barcode scanning on mobile devices"],
  ["Canyon Hotel Renovation", "guest-room renovation", "April 8", "Canyon Hotel", "hotel guests", "quieter air-conditioning units"],
  ["Dover Research Briefing", "research briefing", "May 21", "Dover Institute", "project managers", "a question-and-answer session"],
  ["Ember Health Enrollment", "benefits enrollment period", "June 2", "the employee portal", "eligible employees", "an online plan-comparison tool"],
  ["Fenton Street Market", "community market", "July 12", "Fenton Square", "local vendors", "covered display spaces"],
  ["Granite Security Update", "security software update", "August 26", "the company network", "remote employees", "automatic device verification"],
  ["Haven Museum Membership", "membership renewal campaign", "September 9", "Haven Museum", "museum members", "early access to new exhibitions"],
  ["Iris Delivery Trial", "same-day delivery trial", "October 14", "the central district", "online customers", "live courier tracking"],
  ["Juniper Leadership Course", "leadership course", "November 6", "Juniper Learning Center", "team supervisors", "individual coaching sessions"],
  ["Keystone Parking Project", "parking-lot improvement project", "December 1", "Keystone Offices", "building tenants", "additional bicycle spaces"],
  ["Lakeview Menu Launch", "seasonal menu launch", "January 16", "Lakeview Restaurant", "corporate clients", "vegetarian lunch packages"],
  ["Mason Equipment Inspection", "equipment inspection", "February 24", "Mason Plant", "production teams", "calibration of safety sensors"],
  ["Noble Travel Portal", "travel-booking portal", "March 5", "the staff intranet", "business travelers", "automated policy reminders"],
  ["Oakwell Recycling Program", "recycling program", "April 19", "Oakwell Complex", "office occupants", "collection bins for small electronics"],
  ["Parkline Customer Survey", "customer survey", "May 27", "Parkline Mobile App", "account holders", "a drawing for transit vouchers"],
  ["Quartz Vendor Review", "vendor review meeting", "June 11", "Quartz Conference Hall", "purchasing officers", "short presentations from shortlisted suppliers"],
  ["Rosewood Clinic Schedule", "appointment schedule change", "July 7", "Rosewood Clinic", "clinic patients", "additional evening appointments"],
  ["Stonebridge Archive Move", "records relocation", "August 18", "Stonebridge Center", "department coordinators", "a searchable digital index"],
  ["Trellis Product Webinar", "product webinar", "September 30", "the Trellis webinar platform", "retail partners", "a live demonstration of ordering tools"],
];

function p6Set(data, index) {
  const [title, event, date, place, audience, feature] = data;
  const content = `To: ${audience}\nSubject: ${title}\n\nWe are pleased to (1) _____ that the ${event} will begin on ${date} at ${place}. The schedule has been (2) _____ to give participants time to explore ${feature}. (3) _____, anyone requiring accessibility support should contact the events team by Friday. (4) _____ A confirmation message with final instructions will be sent two days before the event.`;
  const rows = [
    ["vocabulary", "contextual_vocabulary", "announce", ["borrow", "divide", "repair"], "The verb after 'to' must describe communicating the event to readers; 'announce' is the only option with that meaning.", "Sau 'to' cần động từ diễn tả việc thông báo sự kiện; 'announce' là lựa chọn duy nhất đúng nghĩa."],
    ["grammar", "word_form", "adjusted", ["adjustment", "adjustable", "adjusting"], "The present perfect passive pattern 'has been + past participle' requires 'adjusted'.", "Cấu trúc bị động hiện tại hoàn thành 'has been + quá khứ phân từ' yêu cầu 'adjusted'."],
    ["cohesion", "connectors", "In addition", ["However", "Otherwise", "Instead"], "The sentence adds another instruction, so the additive connector 'In addition' fits the logical flow.", "Câu này bổ sung một hướng dẫn khác, nên từ nối bổ sung 'In addition' phù hợp với mạch văn."],
    ["sentence_insertion", "sentence_fit", "Registration details are available on the staff portal.", ["The cafeteria changed its soup supplier last year.", "Several invoices remain unpaid from May.", "The parking garage closes every morning."], "The sentence supplies the registration source and leads naturally into the later confirmation message.", "Câu này cung cấp nơi đăng ký và nối tự nhiên với thông tin về thư xác nhận ở câu sau."],
  ];
  return {
    key: `p6-blueprint-${String(index + 21).padStart(2, "0")}`, toeicPart: 6, setType: "part6", title, status: "published",
    passages: [{ key: "document", position: 1, documentType: "email", title, content }],
    questions: rows.map(([skill, subSkill, correct, distractors, explanationEn, explanationVi], qIndex) => item({
      key: `q${qIndex + 1}`, order: qIndex + 1, skill, subSkill,
      text: `Choose the best completion for blank (${qIndex + 1}) in "${title}."`, correct, distractors,
      answerIndex: (index + qIndex) % 4, explanationEn, explanationVi,
      difficulty: qIndex === 0 ? "easy" : qIndex === 3 ? "hard" : "medium",
      questionType: qIndex === 3 ? "sentence_insertion" : "text_completion", passageKey: "document",
    })),
  };
}

export const part6BlueprintExpansion = p6Scenarios.map(p6Set);

const organizations = ["Alder", "Benton", "Cedar", "Dover", "Elmwood", "Fairview", "Granite", "Harbor", "Ivory", "Juniper", "Kingston", "Linden", "Meadow", "Northstar", "Oakridge", "Parkview", "Quarry", "Riverside", "Summit", "Tamarack"];
const services = [
  ["Library", "notice", "study-room reservation system", "reserve rooms through the online catalog", "two-hour booking slots"],
  ["Hotel", "email", "airport shuttle schedule", "confirm the terminal number before noon", "complimentary luggage storage"],
  ["Market", "announcement", "weekend vendor program", "submit a product list by Thursday", "covered stalls during light rain"],
  ["Clinic", "text_message", "appointment check-in process", "complete the health form before arrival", "a shorter reception wait"],
  ["Transit", "web_page", "temporary route arrangement", "use the stop on Central Avenue", "service every twenty minutes"],
];

function singleScenario(index) {
  const org = organizations[index % organizations.length];
  const [unit, documentType, subject, action, benefit] = services[Math.floor(index / organizations.length) % services.length];
  const day = 3 + (index * 3) % 25;
  return { title: `${org} ${unit} Update`, documentType, subject, action, benefit, date: `October ${day}`, audience: index % 2 ? "registered customers" : "local residents" };
}

function singleSet(index) {
  const s = singleScenario(index);
  const keyNumber = index + 27;
  const questionCount = index < 49 ? 3 : 2;
  const content = `${s.title}\n\nBeginning on ${s.date}, ${s.audience} will use an updated ${s.subject}. Users should ${s.action}. The change is intended to provide ${s.benefit}. Staff will answer questions at the main service desk from 9:00 A.M. to 5:00 P.M. Existing reservations will remain valid, so customers do not need to submit them again.`;
  const questions = [
    item({ key: "q1", order: 1, skill: "purpose", subSkill: "document_purpose", text: `Why was "${s.title}" written?`, correct: `To explain a change to the ${s.subject}`, distractors: ["To advertise a new staff position", "To report a lost payment", "To compare two suppliers"], answerIndex: index % 4, difficulty: "easy", passageKey: "doc1", explanationEn: `The opening sentence announces when the updated ${s.subject} begins, and the rest of the document gives instructions about that change.`, explanationVi: `Câu mở đầu thông báo thời điểm bắt đầu thay đổi về ${s.subject}; các câu sau hướng dẫn người đọc về thay đổi đó.` }),
    item({ key: "q2", order: 2, skill: "detail", subSkill: "explicit_information", text: `According to "${s.title}," what are readers asked to do?`, correct: s.action[0].toUpperCase() + s.action.slice(1), distractors: ["Cancel all existing reservations", "Visit the accounting department", "Wait for a paper application"], answerIndex: (index + 1) % 4, difficulty: "easy", passageKey: "doc1", explanationEn: `The second sentence of the notice directly instructs users to ${s.action}.`, explanationVi: `Câu thứ hai của thông báo trực tiếp yêu cầu người dùng ${s.action}.` }),
    item({ key: "q3", order: 3, skill: "inference", subSkill: "implied_information", text: `What is suggested about existing reservations in "${s.title}"?`, correct: "They will continue to be accepted", distractors: ["They must be paid for again", "They have all been canceled", "They are available only to staff"], answerIndex: (index + 2) % 4, difficulty: "medium", passageKey: "doc1", explanationEn: "The final sentence says existing reservations remain valid and do not need to be submitted again, so they will still be accepted.", explanationVi: "Câu cuối cho biết các đặt chỗ hiện tại vẫn có hiệu lực và không cần gửi lại, nên chúng vẫn được chấp nhận." }),
  ];
  return {
    key: `p7-single-blueprint-${String(keyNumber).padStart(3, "0")}`, toeicPart: 7, setType: "single", title: s.title, status: "published",
    passages: [{ key: "doc1", position: 1, documentType: s.documentType, title: s.title, content }], questions: questions.slice(0, questionCount),
  };
}

const multipleServices = [
  ["Meeting Center", "$180", "a projector and conference phone", "a quarterly planning session"],
  ["Courier Service", "$48", "tracking and signature confirmation", "a prototype shipment"],
  ["Catering Studio", "$22 per person", "delivery and reusable tableware", "a staff recognition lunch"],
  ["Training Lab", "$95 per participant", "course materials and lunch", "a spreadsheet workshop"],
  ["Equipment Rental", "$240", "delivery and setup", "a product demonstration"],
];

function doubleSet(index) {
  const org = organizations[index % organizations.length];
  const [service, price, inclusion, event] = multipleServices[index % multipleServices.length];
  const title = `${org} ${service} ${index + 1}`;
  const date = `November ${4 + (index * 2) % 24}`;
  const doc1 = `${title}\nBusiness package: ${price}. The price includes ${inclusion}. Reservations must be confirmed at least four business days in advance. Changes made after 3:00 P.M. on the previous business day may incur a service fee.`;
  const doc2 = `To: ${title}\nSubject: Availability on ${date}\n\nI am organizing ${event} for our regional team on ${date}. Please hold the advertised business package for us. Our purchasing officer will send the payment authorization tomorrow. Could you also confirm whether the included services are available at our downtown office?\n\nRegards,\nAlex Moreno`;
  const common = { toeicPart: 7, setType: "double", title, status: "published" };
  return {
    ...common, key: `p7-double-blueprint-${String(index + 11).padStart(3, "0")}`,
    passages: [{ key: "doc1", position: 1, documentType: "advertisement", title: `${title} package`, content: doc1 }, { key: "doc2", position: 2, documentType: "email", title: "Availability request", content: doc2 }],
    questions: [
      item({ key: "q1", order: 1, skill: "detail", subSkill: "explicit_information", text: `What is included in the ${title} package?`, correct: inclusion[0].toUpperCase() + inclusion.slice(1), distractors: ["An annual membership", "Employee transportation", "A cash refund"], answerIndex: index % 4, difficulty: "easy", passageKey: "doc1", explanationEn: `The advertisement explicitly states that ${inclusion} is included in the business package.`, explanationVi: `Quảng cáo nêu rõ gói doanh nghiệp bao gồm ${inclusion}.` }),
      item({ key: "q2", order: 2, skill: "detail", subSkill: "explicit_information", text: "When does Alex Moreno need the service?", correct: date, distractors: ["Tomorrow", "Four business days later", "The previous afternoon"], answerIndex: (index + 1) % 4, difficulty: "easy", passageKey: "doc2", explanationEn: `Both the subject line and the first sentence of the email identify ${date} as the requested date.`, explanationVi: `Tiêu đề và câu đầu của email đều xác định ${date} là ngày được yêu cầu.` }),
      item({ key: "q3", order: 3, skill: "purpose", subSkill: "document_purpose", text: `Why did Alex Moreno write to ${title}?`, correct: "To request and verify a business booking", distractors: ["To apply for a job", "To dispute a completed refund", "To cancel a yearly contract"], answerIndex: (index + 2) % 4, passageKey: "doc2", explanationEn: "Alex asks the company to hold a package and confirm whether its included services can be provided at the requested location.", explanationVi: "Alex yêu cầu giữ gói dịch vụ và xác nhận các dịch vụ đi kèm có thể được cung cấp tại địa điểm mong muốn hay không." }),
      item({ key: "q4", order: 4, skill: "inference", subSkill: "implied_information", text: "What is suggested about the payment authorization?", correct: "It has not been sent yet", distractors: ["It was rejected yesterday", "It must be paid in cash", "It already includes a late fee"], answerIndex: (index + 3) % 4, passageKey: "doc2", explanationEn: "Alex says the purchasing officer will send the authorization tomorrow, which means it has not yet been sent.", explanationVi: "Alex nói nhân viên mua hàng sẽ gửi giấy phê duyệt vào ngày mai, nghĩa là giấy này chưa được gửi." }),
      item({ key: "q5", order: 5, skill: "cross_text", subSkill: "information_synthesis", text: "What should Alex most likely confirm soon?", correct: "That the package can be provided at the office before the confirmation deadline", distractors: ["That every attendee has an annual membership", "That the event can be moved to next year", "That the advertised price includes employee salaries"], answerIndex: index % 4, difficulty: "hard", explanationEn: "The advertisement sets an advance-confirmation deadline, while the email asks whether the package can be delivered at the downtown office.", explanationVi: "Quảng cáo quy định hạn xác nhận trước; email hỏi liệu gói dịch vụ có thể được cung cấp tại văn phòng trung tâm hay không." }),
    ],
  };
}

function tripleSet(index) {
  const org = organizations[index];
  const title = `${org} Professional Forum`;
  const date = `December ${5 + index * 3}`;
  const venue = `${org} Civic Hall`;
  const person = ["Mina Lee", "Owen Garcia", "Priya Shah", "Daniel Kim", "Sofia Rossi"][index];
  const arrival = `8:${20 + index * 5} A.M.`;
  return {
    key: `p7-triple-blueprint-${String(index + 6).padStart(3, "0")}`, toeicPart: 7, setType: "triple", title, status: "published",
    passages: [
      { key: "doc1", position: 1, documentType: "advertisement", title: `${title} announcement`, content: `${title} will take place on ${date} at ${venue}. The $75 registration fee includes lunch and printed workshop materials. The opening session begins at 9:30 A.M. Online registration closes one week before the event.` },
      { key: "doc2", position: 2, documentType: "schedule", title: "Morning transportation", content: `Morning transportation for ${date}\nExpress Bus ${index + 4} arrives near ${venue} at ${arrival}. From the stop, allow fifteen minutes to walk to the main entrance. A later bus arrives at 9:25 A.M.` },
      { key: "doc3", position: 3, documentType: "email", title: "Registration confirmation", content: `Dear ${person},\n\nYour registration for ${title} is confirmed. We have recorded your request for a vegetarian lunch. Please check in by 9:10 A.M. and show this message at the registration desk.\n\nEvents Team` },
    ],
    questions: [
      item({ key: "q1", order: 1, skill: "detail", subSkill: "explicit_information", text: "What is included in the registration fee?", correct: "Lunch and workshop materials", distractors: ["Hotel accommodation", "Bus fare", "A yearly membership"], answerIndex: index % 4, difficulty: "easy", passageKey: "doc1", explanationEn: "The event announcement explicitly lists lunch and printed workshop materials as part of the $75 fee.", explanationVi: "Thông báo sự kiện nêu rõ phí 75 đô la bao gồm bữa trưa và tài liệu hội thảo in sẵn." }),
      item({ key: "q2", order: 2, skill: "detail", subSkill: "explicit_information", text: `What should ${person} show at check-in?`, correct: "The confirmation message", distractors: ["A bus ticket", "A hotel receipt", "A printed resume"], answerIndex: (index + 1) % 4, difficulty: "easy", passageKey: "doc3", explanationEn: "The confirmation email instructs the registrant to show the message at the desk.", explanationVi: "Email xác nhận yêu cầu người đăng ký xuất trình chính tin nhắn đó tại bàn đăng ký." }),
      item({ key: "q3", order: 3, skill: "cross_text", subSkill: "information_synthesis", text: "Which bus should the registrant take?", correct: `Express Bus ${index + 4}`, distractors: ["The bus arriving at 9:25 A.M.", "Any bus after 9:30 A.M.", "No bus can arrive in time"], answerIndex: (index + 2) % 4, difficulty: "hard", explanationEn: `Express Bus ${index + 4} arrives at ${arrival}; even after the fifteen-minute walk, the registrant can reach check-in before 9:10 A.M.`, explanationVi: `Xe buýt nhanh ${index + 4} đến lúc ${arrival}; cộng thêm 15 phút đi bộ, người đăng ký vẫn có thể đến trước hạn check-in 9:10.` }),
      item({ key: "q4", order: 4, skill: "cross_text", subSkill: "information_synthesis", text: "What arrangement must the events team make?", correct: `Provide a vegetarian version of the included lunch for ${person}`, distractors: ["Refund the registration fee", "Reserve a hotel room", "Pay the registrant's bus fare"], answerIndex: (index + 3) % 4, difficulty: "hard", explanationEn: "The announcement says lunch is included, and the confirmation records the registrant's vegetarian request.", explanationVi: "Thông báo cho biết bữa trưa đã bao gồm trong phí; email xác nhận ghi nhận yêu cầu ăn chay của người đăng ký." }),
      item({ key: "q5", order: 5, skill: "inference", subSkill: "implied_information", text: "Why is the later bus unsuitable?", correct: "It would not leave enough time to walk to check-in", distractors: ["It travels to a different city", "It requires an annual pass", "It operates only after the event"], answerIndex: index % 4, explanationEn: "The later bus arrives at 9:25 A.M., but check-in is due by 9:10 A.M. and the walk takes fifteen minutes.", explanationVi: "Xe sau đến lúc 9:25, trong khi hạn check-in là 9:10 và còn cần 15 phút đi bộ." }),
      item({ key: "q6", order: 6, skill: "purpose", subSkill: "document_purpose", text: "Why was the third document sent?", correct: "To confirm enrollment and provide check-in instructions", distractors: ["To advertise public transportation", "To request payment for a hotel", "To cancel the opening session"], answerIndex: (index + 1) % 4, passageKey: "doc3", explanationEn: "The email confirms the registration, records a meal request, and tells the attendee when and how to check in.", explanationVi: "Email xác nhận đăng ký, ghi nhận yêu cầu bữa ăn và hướng dẫn thời gian cũng như cách check-in." }),
    ],
  };
}

export const part7BlueprintExpansion = [
  ...Array.from({ length: 74 }, (_, index) => singleSet(index)),
  ...Array.from({ length: 30 }, (_, index) => doubleSet(index)),
  ...Array.from({ length: 5 }, (_, index) => tripleSet(index)),
];
