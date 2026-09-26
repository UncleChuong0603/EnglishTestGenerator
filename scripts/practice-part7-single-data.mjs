import { extraSingleScenarios } from "./practice-part7-single-extra-data.mjs";

const companies = ["Aster", "Bayview", "Clearwater", "Dunhill", "Easton", "Foxbridge", "Goldleaf", "Highland", "Ironwood", "Jasper", "Kestrel", "Longview", "Meadowbrook", "Newhaven", "Orchard", "Pinecrest", "Quarry", "Riverton", "Silverlake", "Tamarack"];
const keys = ["A", "B", "C", "D"];

function question(index, order, prompt, correct, wrong, skill, subSkill, evidence) {
  const answerIndex = (index + order) % 4;
  const values = [...wrong]; values.splice(answerIndex, 0, correct);
  return { key: `q${order}`, order, text: prompt, skill, subSkill, questionType: "reading_comprehension", passageKey: "doc1", status: "published", difficulty: order === 3 ? "medium" : "easy",
    options: values.map((text, position) => ({ key: keys[position], text, correct: position === answerIndex })),
    explanationEn: evidence, explanationVi: `Chi tiết trong văn bản hỗ trợ đáp án “${correct}”.` };
}

export function practiceSingleSet(index) {
  const company = companies[Math.floor(index / 20)];
  const date = `${["February", "March", "April", "May", "June", "July", "August", "September", "October", "November"][index % 10]} ${5 + Math.floor(index / 10) % 20}`;
  const scene = index % 20;
  const scenarios = [
    () => ({
      title: `${company} Vendor Application`, documentType: "notice",
      content: `${company} Market — Vendor Application\n\nApplications for the next weekend market close on ${date}. New vendors must upload a product list and a copy of their business permit through the market portal. Returning vendors who participated last season do not need to pay the registration fee again, but they must still confirm their stall size. Assignments will be emailed after all applications have been reviewed.`,
      qa: [["Why was the notice posted?", "To explain how to apply for market stalls", ["To advertise a store opening", "To report a missing permit", "To announce new bus routes"], "purpose", "document_purpose", "The notice lists the application deadline and requirements."], ["What must new vendors upload?", "A product list and business permit", ["A hotel receipt and passport", "A training certificate and invoice", "A floor plan and photograph"], "detail", "explicit_information", "The second sentence names the two required documents."], ["What is suggested about returning vendors?", "They may avoid paying another registration fee", ["They receive stalls without confirming a size", "They cannot apply through the portal", "They must attend a training course"], "inference", "implied_information", "Returning vendors from last season do not pay the fee again."],
      ],
    }),
    () => ({
      title: `${company} Airport Shuttle`, documentType: "email",
      content: `Subject: Airport shuttle for your ${company} hotel stay\n\nDear Guest,\n\nOur complimentary airport shuttle runs every thirty minutes between the main terminal and the ${company} Hotel. Please send us your flight number by noon on ${date} so that we can reserve a seat. The pickup point is outside Door 4 on the arrivals level. Guests arriving after 10:00 P.M. should call reception because the regular shuttle will have stopped operating.\n\nGuest Services`,
      qa: [["What is the main purpose of the email?", "To give guests shuttle booking instructions", ["To request payment for a room", "To announce a restaurant menu", "To advertise a flight discount"], "purpose", "document_purpose", "The email explains how to reserve and find the airport shuttle."], ["Where should guests meet the shuttle?", "Outside Door 4 on the arrivals level", ["At the departures ticket counter", "Inside the hotel restaurant", "At the airport parking office"], "detail", "explicit_information", "The email gives Door 4 on the arrivals level as the pickup point."], ["What should a guest arriving at 11:00 P.M. do?", "Call hotel reception", ["Wait for the regular shuttle", "Send a product list", "Go to Door 4 without calling"], "inference", "implied_information", "The regular shuttle ends after 10:00 P.M., so late guests should call."],
      ],
    }),
    () => ({
      title: `${company} Museum Exhibition`, documentType: "web_page",
      content: `${company} Museum — Design Through Time\n\nTimed admission for the new design exhibition begins on ${date}. Visitors can select an entry time on the museum website; a ticket does not allow entry at a different time. Audio guides are included with admission and can be collected near the exhibition entrance. The west gallery is temporarily closed for restoration, but the main exhibition remains open.`,
      qa: [["Why was the page written?", "To provide information about a museum exhibition", ["To recruit restoration workers", "To sell audio equipment", "To announce the museum's closure"], "purpose", "document_purpose", "The page describes admission and visitor services for the exhibition."], ["Where can visitors get audio guides?", "Near the exhibition entrance", ["At the west gallery exit", "From a nearby bookstore", "At the parking gate"], "detail", "explicit_information", "The page says audio guides are collected near the entrance."], ["What is suggested about the west gallery?", "Visitors cannot enter it during restoration", ["It contains the main exhibition", "It is open only to ticket holders", "It has moved to another museum"], "inference", "implied_information", "The west gallery is temporarily closed for restoration."],
      ],
    }),
    () => ({
      title: `${company} Software Training`, documentType: "memo",
      content: `To: All ${company} staff\nSubject: Software training on ${date}\n\nA two-hour training session will introduce the revised customer database. Employees should obtain their manager's approval before enrolling through the staff portal. Course materials will be available online the day before the session, so no printed handbook will be distributed. If the class reaches capacity, employees may add their names to a waiting list.`,
      qa: [["What is the memo about?", "A training session for a revised database", ["A new employee benefits plan", "A software purchase order", "A customer complaint procedure"], "purpose", "document_purpose", "The opening sentence announces database training."], ["What is required before enrollment?", "A manager's approval", ["A printed handbook", "A customer reference", "A travel expense claim"], "detail", "explicit_information", "The memo explicitly requires manager approval."], ["What can an employee do if the class is full?", "Join a waiting list", ["Request a paper handbook", "Attend without enrolling", "Cancel the revised database"], "inference", "implied_information", "The last sentence permits employees to add their names to a waiting list."],
      ],
    }),
    () => ({
      title: `${company} Parcel Collection`, documentType: "text_message",
      content: `${company} Courier: Your parcel is ready for collection from our central service counter starting ${date}. Bring the six-digit pickup code in your confirmation email and a photo ID. We will hold the parcel for seven days, after which it will be returned to the sender. The counter is open from 9:00 A.M. to 6:00 P.M. on weekdays, except public holidays. Reply HELP if you cannot find your code.`,
      qa: [["Why was the message sent?", "To provide parcel pickup instructions", ["To announce a new delivery driver", "To request a product review", "To advertise a holiday sale"], "purpose", "document_purpose", "The message says a parcel is ready and gives collection requirements."], ["What should the recipient bring?", "A pickup code and photo ID", ["A business permit and invoice", "A credit card and printed map", "A passport and luggage tag"], "detail", "explicit_information", "The message requires the code and a photo ID."], ["What will happen if the parcel is not collected within seven days?", "It will be returned to the sender", ["It will be moved to the airport", "It will be delivered free of charge", "It will be stored indefinitely"], "inference", "implied_information", "The message says uncollected parcels are returned after seven days."],
      ],
    }),
    () => ({
      title: `${company} Bus Route Notice`, documentType: "notice",
      content: `${company} Transit — Temporary Stop Change\n\nFrom ${date}, buses on Route 18 will stop on Oak Street instead of at the library entrance while roadwork is completed. The temporary stop is about a three-minute walk from the usual one and has a step-free boarding area. Departure times and fares will remain the same. Staff will place direction signs along the walkway on the first morning of the change.`,
      qa: [["What change does the notice announce?", "A temporary Route 18 stop on Oak Street", ["A permanent fare increase", "A new library opening", "The cancellation of Route 18"], "purpose", "document_purpose", "The notice announces a temporary stop location during roadwork."], ["What will remain unchanged?", "Departure times and fares", ["The location of the bus stop", "The roadwork schedule", "The library opening hours"], "detail", "explicit_information", "The notice says both times and fares stay the same."], ["What is suggested about passengers who cannot use steps?", "They can use the temporary stop's step-free area", ["They must avoid Route 18 entirely", "They need to pay an additional fare", "They must board at the library entrance"], "inference", "implied_information", "The temporary stop has a step-free boarding area."],
      ],
    }),
    () => ({
      title: `${company} Clinic Appointment`, documentType: "email",
      content: `Subject: Your appointment at ${company} Clinic on ${date}\n\nDear Patient,\n\nPlease arrive fifteen minutes before your appointment so the front desk can verify your contact details. You may complete the health history form through the patient portal in advance; paper copies will also be available at reception. If you need to change the appointment, call us at least twenty-four hours before the scheduled time. Parking is available behind the clinic building.\n\nAppointment Team`,
      qa: [["What is the purpose of the email?", "To give instructions for a clinic appointment", ["To advertise a new parking garage", "To announce a doctor resignation", "To request an insurance refund"], "purpose", "document_purpose", "The email gives arrival, form, and rescheduling instructions."], ["Why should the patient arrive early?", "To have contact details checked", ["To collect a parcel", "To attend a training course", "To receive a parking permit"], "detail", "explicit_information", "The front desk needs time to verify contact details."], ["What can a patient without portal access do?", "Complete a paper form at reception", ["Skip the health history form", "Change the appointment automatically", "Ask the parking attendant for a form"], "inference", "implied_information", "Paper forms are available at reception as an alternative."],
      ],
    }),
    () => ({
      title: `${company} Theater Ticket Exchanges`, documentType: "web_page",
      content: `${company} Theater — Ticket Exchanges\n\nIf your plans change, request an exchange through the booking portal at least two hours before the performance begins. You may choose another performance of the same production, subject to seat availability. A difference in ticket price must be paid before new tickets are issued. Tickets purchased through a third-party seller must be exchanged with that seller rather than through our portal.`,
      qa: [["What does the page explain?", "How to exchange theater tickets", ["How to audition for a production", "How to buy costumes", "How to request a parking pass"], "purpose", "document_purpose", "The page sets out the rules for ticket exchanges."], ["When must a portal exchange be requested?", "At least two hours before the show", ["Within two hours after the show", "Only on the day tickets were bought", "One week before any performance"], "detail", "explicit_information", "The first sentence sets a two-hour advance deadline."], ["What should a third-party buyer do?", "Contact the seller that issued the ticket", ["Use the theater's booking portal", "Pay the full ticket price again", "Visit the theater's costume room"], "inference", "implied_information", "Third-party tickets must be exchanged with the seller."],
      ],
    }),
    () => ({
      title: `${company} Fitness Class Registration`, documentType: "announcement",
      content: `${company} Fitness Center\n\nRegistration for next month's small-group exercise classes opens on ${date}. Members may book two classes each week through the center's website. Mats and resistance bands will be provided, but participants should bring their own water bottles. Each class has only twelve places, and a waiting list will open when those places are filled. Cancellations made before 6:00 P.M. the previous day will free a place for another member.`,
      qa: [["What is the announcement about?", "Booking small-group exercise classes", ["Buying exercise equipment", "Applying for a trainer job", "Changing the center's address"], "purpose", "document_purpose", "The announcement explains how and when to book classes."], ["What should participants bring?", "Their own water bottles", ["Exercise mats", "Resistance bands", "Printed membership cards"], "detail", "explicit_information", "Mats and bands are provided, but water bottles are not."], ["Why might a member be offered a place after a class fills?", "Someone may cancel before the deadline", ["The class capacity increases automatically", "The website gives unlimited bookings", "Mats are removed from the room"], "inference", "implied_information", "A timely cancellation frees a place for someone on the waiting list."],
      ],
    }),
    () => ({
      title: `${company} Study Room Reservations`, documentType: "notice",
      content: `${company} Library — Study Room Rules\n\nBeginning ${date}, visitors can reserve study rooms for up to two hours using the library website. Please check in at the information desk within ten minutes of the reservation start time; otherwise, the room may be given to another visitor. Extensions are possible only when no one else has booked the room. Food is not allowed in study rooms, but covered drinks are permitted.`,
      qa: [["What is the notice mainly about?", "Rules for reserving library study rooms", ["A library renovation schedule", "A new food service", "A book return procedure"], "purpose", "document_purpose", "The notice gives booking and use rules for study rooms."], ["Where must visitors check in?", "At the information desk", ["At the cafeteria", "At the room's window", "At the parking gate"], "detail", "explicit_information", "The notice directs visitors to the information desk."], ["When can a visitor extend a reservation?", "When no one else has booked the room", ["Whenever the visitor brings food", "Only if the library website is unavailable", "After missing the check-in time"], "inference", "implied_information", "Extensions depend on there being no later booking."],
      ],
    }),
  ];
  const { title, documentType, content, qa } = [...scenarios, ...extraSingleScenarios(company, date).map(value => () => value)][scene]();
  return { key: `p7-single-practice-${String(index + 1).padStart(3, "0")}`, toeicPart: 7, setType: "single", title, status: "published",
    passages: [{ key: "doc1", position: 1, documentType, title, content }],
    questions: qa.map(([text, correct, wrong, skill, subSkill, evidence], rowIndex) => question(index, rowIndex + 1, text, correct, wrong, skill, subSkill, evidence)),
  };
}
