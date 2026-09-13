const KEYS = ["A", "B", "C", "D"];

function optionSet(correct, distractors, answerIndex) {
  const values = [...distractors];
  values.splice(answerIndex, 0, correct);
  return values.map((text, index) => ({ key: KEYS[index], text, correct: index === answerIndex }));
}

function question(key, order, skill, subSkill, text, correct, distractors, answerIndex, evidence, difficulty = "medium", passageKey = null) {
  return {
    key, order, skill, subSkill, text, difficulty, passageKey,
    questionType: skill === "sentence_placement" ? "sentence_placement" : "reading_comprehension",
    status: "published",
    options: optionSet(correct, distractors, answerIndex),
    explanationEn: `${evidence} Therefore, “${correct}” is correct.`,
    explanationVi: `Thông tin liên quan trong văn bản cho thấy “${correct}”; vì vậy đây là đáp án đúng.`,
  };
}

const singles = [
  ["Oakridge Fitness Hours", "notice", "inform members about revised weekend hours", "September 7", "the downtown gym", "arrive after 8:00 A.M.", "a free yoga class", "members"],
  ["Marina Hotel Shuttle", "email", "confirm airport transportation arrangements", "October 12", "Terminal 2", "meet the 3:40 P.M. flight", "space for six passengers", "hotel guests"],
  ["Cobalt Phone Trade-In", "advertisement", "promote a device trade-in offer", "November 30", "Cobalt retail stores", "bring an old phone and identification", "up to $180 in store credit", "phone owners"],
  ["Hilltop Community Market", "announcement", "invite vendors to a weekend market", "May 18", "Hilltop Square", "submit an application by April 26", "electricity at each booth", "local vendors"],
  ["AeroLink Baggage Policy", "web_page", "explain a change to carry-on baggage rules", "January 1", "all AeroLink flights", "measure bags before boarding", "one free personal item", "passengers"],
  ["Minton Office Chairs", "article", "describe a locally designed office chair", "June 4", "Minton's new workshop", "order through selected retailers", "an adjustable recycled-aluminum frame", "office buyers"],
  ["Eastlake Museum Tour", "schedule", "provide times for guided museum tours", "August 16", "the main information desk", "reserve the 2:15 P.M. tour", "a 45-minute gallery visit", "museum visitors"],
  ["Willow Pharmacy Refill", "text_message", "notify a customer that medicine is ready", "March 9", "Willow Pharmacy", "collect the order before 7:00 P.M.", "a consultation with the pharmacist", "a pharmacy customer"],
  ["Seabrook Tenant Inspection", "letter", "announce an annual apartment inspection", "February 20", "Seabrook Apartments", "secure pets before the inspector arrives", "a two-hour arrival window", "apartment residents"],
  ["OrbitCloud Maintenance", "email", "warn users about scheduled online maintenance", "July 13", "the OrbitCloud platform", "save current work before midnight", "improved file-search tools", "software users"],
  ["Juniper Café Catering", "advertisement", "introduce a lunch catering package", "April 10", "offices within eight kilometers", "place orders by 10:00 A.M.", "free delivery for 15 meals", "office coordinators"],
  ["Redwood Volunteer Day", "memo", "recruit staff for a river cleanup", "September 21", "Redwood River Park", "register with Human Resources", "transportation from headquarters", "company employees"],
  ["Beacon Parcel Collection", "notice", "explain how to collect undelivered parcels", "December 3", "Beacon Service Counter", "show photo identification", "storage for five business days", "parcel recipients"],
  ["Silverline Photography Course", "web_page", "advertise an evening photography course", "October 2", "Silverline Arts Center", "bring a camera to the first class", "four instructor-led field sessions", "beginning photographers"],
  ["Parkside Clinic Appointment", "text_message", "remind a patient about a medical appointment", "May 6", "Parkside Clinic", "arrive fifteen minutes early", "online check-in", "a clinic patient"],
  ["Tamarind Restaurant Opening", "article", "report on a restaurant's new branch", "August 28", "Central Station Plaza", "book tables through the restaurant website", "a menu based on regional ingredients", "local diners"],
  ["Verde Energy Survey", "email", "request feedback about an energy-saving program", "November 8", "the employee portal", "complete a five-minute questionnaire", "entry in a bicycle prize drawing", "office employees"],
  ["Kingsway Parking Permit", "form", "give instructions for renewing parking permits", "January 24", "Kingsway Management Office", "attach a copy of vehicle registration", "same-day processing before noon", "building tenants"],
  ["Meadow Book Festival", "schedule", "outline activities at a book festival", "March 17", "Meadow Civic Hall", "attend the author interview at 1:30 P.M.", "a used-book exchange", "festival visitors"],
  ["Atlas Printer Warranty", "letter", "respond to a request for printer repair", "June 25", "an authorized Atlas service center", "send the printer with the claim number", "repair at no charge", "a printer customer"],
];

function singleSet(data, index) {
  const [title, documentType, purpose, date, place, action, feature, audience] = data;
  const instruction = /[.!?]$/.test(action) ? action : `${action}.`;
  const paragraphs = [
    `${title}\n\nThis notice is for ${audience}. Updated arrangements concerning ${place} take effect on ${date}.`,
    `${title}\n\nAttention, ${audience}: A scheduled service concerning ${place} will be available on ${date}.`,
    `${title}\n\nBeginning on ${date}, a new arrangement for ${audience} will apply through ${place}.`,
    `${title}\n\nWe are writing to ${audience} about a service scheduled for ${date} through ${place}.`,
  ];
  const content = `${paragraphs[index % 4]} Please ${instruction} The arrangement includes ${feature}. It applies on the date stated above. For questions, the service desk is available during regular business hours.`;
  const q4mode = index % 4;
  const q4 = q4mode === 0
    ? question("q4", 4, "vocabulary_in_context", "word_meaning", `In “${title},” the word “available” is closest in meaning to`, "ready to help", ["sold at a discount", "difficult to find", "temporarily closed"], 0, "The document says the service desk is available, meaning its staff can help.")
    : q4mode === 1
      ? question("q4", 4, "reference", "referent", `In “${title},” what does “It” refer to?`, "the arrangement", ["the date", "the location", "the service desk"], 1, "The pronoun follows the sentence describing the arrangement and its included feature.")
      : q4mode === 2
        ? question("q4", 4, "sentence_placement", "logical_position", `Where would the sentence “Advance planning is therefore recommended” best fit in “${title}”?`, "After the action instruction", ["Before the title", "Between the title and audience", "After the contact sentence"], 2, "The sentence logically follows the instruction telling readers what they should do.", "hard")
        : question("q4", 4, "vocabulary_in_context", "word_meaning", `In “${title},” the phrase “stated above” refers to information that was`, "mentioned earlier", ["canceled recently", "sent privately", "changed twice"], 3, "The phrase points back to the date already given in the document.");
  return {
    key: `p7-single-${String(index + 1).padStart(2, "0")}`, toeicPart: 7, setType: "single", title, status: "published",
    passages: [{ key: "doc1", position: 1, documentType, title, content }],
    questions: [
      question("q1", 1, "purpose", "document_purpose", `Why was “${title}” written?`, purpose, ["To report an employee promotion", "To request a product refund", "To compare two suppliers"], index % 4, "The document's opening and instructions identify its main purpose.", "easy", "doc1"),
      question("q2", 2, "detail", "explicit_information", `According to “${title},” what should readers do?`, action[0].toUpperCase() + action.slice(1), ["Call the accounting office", "Visit every branch", "Wait for a mailed invoice"], (index + 1) % 4, "The document directly tells readers what action to take.", "easy", "doc1"),
      question("q3", 3, "inference", "implied_information", `What is suggested about ${feature}?`, "It is part of the announced arrangement", ["It requires a separate annual contract", "It was rejected by customers", "It is offered at every competing business"], (index + 2) % 4, "The document lists the feature as something included in the arrangement.", "medium", "doc1"),
      q4,
    ],
  };
}

const doubles = [
  ["Crescent Meeting Rooms", "advertisement", "$160", "a projector and whiteboard", "Tuesday, October 8", "Room B", "a product-planning session", "12"],
  ["Porter Bicycle Rentals", "web_page", "$28", "a helmet and repair kit", "Saturday, May 11", "riverside branch", "a staff recreation ride", "18"],
  ["Arbor Translation Service", "advertisement", "$95", "one revision", "Monday, July 15", "online delivery", "a supplier contract translation", "6"],
  ["Nexa Courier Express", "web_page", "$42", "tracking and signature confirmation", "Friday, March 22", "West District", "a sample shipment", "9"],
  ["Grove Audio Equipment", "advertisement", "$210", "two wireless microphones", "Thursday, June 13", "Grove showroom", "an awards presentation", "14"],
  ["Harborview Boat Tours", "web_page", "$36", "a boxed lunch", "Sunday, August 4", "Pier 7", "a client appreciation outing", "20"],
  ["PixelWorks Poster Printing", "advertisement", "$75", "next-day pickup", "Wednesday, September 18", "Market Street branch", "a recruitment fair", "25"],
  ["Larkspur Floral Studio", "web_page", "$120", "delivery and vase rental", "Friday, November 1", "Larkspur lobby", "a retirement reception", "30"],
  ["MetroDesk Furniture Assembly", "advertisement", "$55", "removal of packaging", "Monday, January 20", "fifth-floor office", "a workspace renovation", "8"],
  ["Suntrail Van Hire", "web_page", "$190", "insurance and unlimited distance", "Tuesday, April 9", "airport counter", "a regional site visit", "7"],
];

function doubleSet(data, index) {
  const [title, adType, price, inclusion, date, place, event, people] = data;
  const doc1 = `${title}\nBusiness package: ${price}. The price includes ${inclusion}. Reservations for groups must be confirmed at least three business days in advance. Cancellations made later than 5:00 P.M. on the previous day are not refundable.`;
  const doc2 = `To: ${title}\nSubject: Reservation request\n\nI am organizing ${event} for ${people} people on ${date}. Please reserve the service at ${place}. Our finance team can issue payment tomorrow. Let me know whether the advertised business package will cover our group.\n\nRegards,\nMorgan Chen`;
  return {
    key: `p7-double-${String(index + 1).padStart(2, "0")}`, toeicPart: 7, setType: "double", title, status: "published",
    passages: [
      { key: "doc1", position: 1, documentType: adType, title: `${title} offer`, content: doc1 },
      { key: "doc2", position: 2, documentType: "email", title: "Reservation request", content: doc2 },
    ],
    questions: [
      question("q1", 1, "detail", "explicit_information", `What is included in the ${title} package?`, inclusion[0].toUpperCase() + inclusion.slice(1), ["A personal assistant", "A monthly subscription", "Free parking for a year"], index % 4, "The first document explicitly lists what the business package includes.", "easy", "doc1"),
      question("q2", 2, "detail", "explicit_information", `When does Morgan Chen need the service from ${title}?`, date, ["The previous day", "Three weeks later", "Tomorrow morning"], (index + 1) % 4, "The email gives the requested service date.", "easy", "doc2"),
      question("q3", 3, "purpose", "document_purpose", `Why did Morgan Chen write to ${title}?`, "To request a business reservation", ["To complain about an invoice", "To apply for employment", "To cancel a membership"], (index + 2) % 4, "The email asks the company to reserve its service for an event.", "medium", "doc2"),
      question("q4", 4, "inference", "implied_information", `What is suggested about payment for the ${title} booking?`, "It has not yet been issued", ["It was refunded yesterday", "It must be made in cash", "It includes a late fee"], (index + 3) % 4, "Morgan says the finance team can issue payment tomorrow, implying it has not been issued yet.", "medium", "doc2"),
      question("q5", 5, "cross_text", "information_synthesis", `What must Morgan most likely do to use the advertised offer from ${title}?`, "Confirm early enough and verify that the package suits the group", ["Visit the location every month", "Reduce the event to two people", "Purchase a separate annual policy"], index % 4, "The advertisement gives an advance-confirmation rule, while the email asks whether the package covers the group.", "hard"),
    ],
  };
}

const triples = [
  ["Evergreen Conference", "September 9", "Lake Hall", "Designing Better Services", "$85", "Noor Patel", "vegetarian lunch", "Train 614 arrives at 8:20 A.M."],
  ["Meridian Retail Fair", "October 17", "Expo Center", "Small-Store Technology", "$70", "Luis Romero", "a printed exhibitor guide", "Bus C arrives at Expo Center at 8:35 A.M."],
  ["Bluewater Safety Forum", "June 6", "Pier Auditorium", "Safer Warehouse Operations", "$60", "Hana Kim", "accessibility seating", "Ferry 3 docks at 8:35 A.M."],
  ["Northfield Careers Day", "March 14", "Northfield College", "Building a Career Portfolio", "$40", "Amina Yusuf", "a receipt for reimbursement", "Shuttle A reaches the college at 8:55 A.M."],
  ["Solstice Food Expo", "December 2", "Civic Pavilion", "Responsible Food Packaging", "$90", "Ethan Brooks", "nut-free meal", "Metro Line 2 reaches Civic Station at 8:45 A.M."],
];

function tripleSet(data, index) {
  const [title, date, venue, session, fee, person, request, transport] = data;
  return {
    key: `p7-triple-${String(index + 1).padStart(2, "0")}`, toeicPart: 7, setType: "triple", title, status: "published",
    passages: [
      { key: "doc1", position: 1, documentType: "advertisement", title: `${title} announcement`, content: `${title} — ${date} at ${venue}. Registration costs ${fee} and includes lunch. The opening session, “${session},” begins at 9:30 A.M. Register online at least one week before the event.` },
      { key: "doc2", position: 2, documentType: "schedule", title: "Morning transport", content: `Morning travel information for ${date}\n${transport}\nLocal taxi service begins at 7:00 A.M. Allow ten minutes to walk from the nearest stop to ${venue}.` },
      { key: "doc3", position: 3, documentType: "email", title: "Registration confirmation", content: `Dear ${person},\n\nYour registration for ${title} is confirmed. We noted your request for ${request}. Please check in at the main desk by 9:15 A.M. and show this message.\n\nEvents Team` },
    ],
    questions: [
      question("q1", 1, "detail", "explicit_information", `What is included in the registration fee for ${title}?`, "Lunch", ["Hotel accommodation", "Taxi fare", "A yearly membership"], index % 4, "The announcement explicitly says that registration includes lunch.", "easy", "doc1"),
      question("q2", 2, "detail", "explicit_information", `What should ${person} show at check-in?`, "The confirmation message", ["A train ticket", "A printed résumé", "A meal receipt"], (index + 1) % 4, "The confirmation email tells the registrant to show the message.", "easy", "doc3"),
      question("q3", 3, "cross_text", "information_synthesis", `Why can ${person} use the listed public transport and still arrive before check-in for ${title}?`, "It arrives with enough time for the walk to the venue", ["Check-in takes place at the transport stop", "The opening session was canceled", "A taxi is included in the fee"], (index + 2) % 4, "The schedule provides an arrival time and a ten-minute walk, while the email sets check-in at 9:15 A.M.", "hard"),
      question("q4", 4, "cross_text", "information_synthesis", `What special arrangement connects the announcement and ${person}'s email?`, `The included lunch must meet the request for ${request}`, ["The registration fee must be refunded", "The venue must provide overnight lodging", "The transport fare must be paid by the organizer"], (index + 3) % 4, "The announcement says lunch is included, and the email records the registrant's specific request.", "hard"),
    ],
  };
}

export const part7Sets = [
  ...singles.map(singleSet),
  ...doubles.map(doubleSet),
  ...triples.map(tripleSet),
];
