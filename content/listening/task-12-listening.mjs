/** TOEICGym-owned original content. Stable external IDs are the authoring contract. */
const keys = ["A", "B", "C", "D"];
const options = (correct, wrong, answer = 0) => {
  const values = [...wrong];
  values.splice(answer, 0, correct);
  return values.map((text, index) => ({ key: keys[index], text }));
};
const q = (order, text, correct, wrong, skill, subSkill, answer = 0, difficulty = "medium") => ({
  order, text, skill, subSkill, difficulty, options: options(correct, wrong, answer), correctKey: keys[answer],
  explanationEn: "The recording directly states or clearly implies this answer.",
  explanationVi: "Nội dung đoạn ghi âm trực tiếp nêu hoặc ngụ ý rõ ràng đáp án này.",
});

export const listeningManifest = [];

listeningManifest.push({
  externalId: "L-P1-PROD-006", version: 1, part: 1, type: "photograph", status: "published",
  skillArea: "LISTENING", responseType: "MULTIPLE_CHOICE", difficulty: "easy",
  transcript: "A. A courier is placing a parcel on a counter.\nB. A customer is opening a window.\nC. Several shelves are being painted.\nD. A clerk is sweeping the floor.",
  script: [{ speaker: "NARRATOR", text: "A. A courier is placing a parcel on a counter. B. A customer is opening a window. C. Several shelves are being painted. D. A clerk is sweeping the floor." }],
  media: [{ role: "IMAGE", assetRef: "content/listening/source/L-P1-PROD-006.png", altText: "A courier placing a parcel on a service counter" }, { role: "AUDIO", assetRef: "content/listening/audio/L-P1-PROD-006.mp3" }],
  question: q(1, "[Spoken choices only]", "A courier is placing a parcel on a counter.", ["A customer is opening a window.", "Several shelves are being painted.", "A clerk is sweeping the floor."], "photographs", "visual_detail", 0, "easy"),
});

const p2 = [
  ["When will the replacement printer arrive?", "By Thursday afternoon.", ["At the loading entrance.", "The color model."], "when"],
  ["Who approved the revised floor plan?", "Ms. Ortega did.", ["Beside the elevators.", "It has three floors."], "who"],
  ["Where should I leave these invoices?", "In the blue tray on my desk.", ["About twelve invoices.", "I left at five."], "where"],
  ["Why was the client meeting postponed?", "The director's flight was delayed.", ["In the large conference room.", "Yes, I met the client."], "why"],
  ["How do I reserve a company vehicle?", "Use the form on the staff portal.", ["A compact vehicle.", "For the regional office."], "how"],
  ["What did the technician say about the copier?", "It needs a new sensor.", ["He arrived by train.", "On the second shelf."], "what"],
  ["Could you send me the updated price list?", "Certainly, I'll e-mail it now.", ["The prices rose last year.", "Near the front desk."], "request"],
  ["Why don't we move the workshop to Friday?", "That would give us more time.", ["The workshop was useful.", "At the training center."], "suggestion"],
  ["Would you like me to call the supplier?", "Yes, please ask about our order.", ["The supplies are downstairs.", "I called it a catalog."], "offer"],
  ["The lobby signs have been delivered, haven't they?", "Not yet, but they are on the way.", ["The lobby is quite large.", "A sign-making course."], "confirmation"],
  ["Which catering package did the committee choose?", "The vegetarian lunch option.", ["For twenty committee members.", "It was delivered early."], "which"],
  ["Didn't you submit the travel request yesterday?", "No, I was waiting for the cost estimate.", ["The trip takes two hours.", "At the airport counter."], "indirect_response"],
  ["How often is the safety equipment inspected?", "Once every three months.", ["By the warehouse supervisor.", "In the locked cabinet."], "frequency"],
  ["Can I pick up my badge before the conference?", "Yes, the registration desk opens at eight.", ["The speaker wore a badge.", "The conference was informative."], "request"],
  ["Where is this month's sales report?", "I think Lena is still reviewing it.", ["Sales increased by eight percent.", "This month's calendar."], "indirect_response"],
];
p2.forEach(([prompt, correct, wrong, intent], index) => {
  const id = `L-P2-PROD-${String(index + 11).padStart(3, "0")}`;
  const difficulty = index < 5 ? "easy" : index < 12 ? "medium" : "hard";
  listeningManifest.push({
    externalId: id, version: 1, part: 2, type: "question_response", status: "published", skillArea: "LISTENING", responseType: "MULTIPLE_CHOICE", difficulty,
    transcript: `Question: ${prompt}\nA. ${correct}\nB. ${wrong[0]}\nC. ${wrong[1]}`,
    script: [{ speaker: index % 2 ? "WOMAN" : "MAN", text: prompt }, { speaker: "NARRATOR", text: `A. ${correct} B. ${wrong[0]} C. ${wrong[1]}` }],
    media: [{ role: "AUDIO", assetRef: `content/listening/audio/${id}.mp3` }],
    question: { ...q(1, "[Spoken prompt and responses only]", correct, wrong, "question_response", intent, 0, difficulty), options: options(correct, wrong, 0).slice(0, 3) },
  });
});

const conversations = [
  ["MAN: The product review was moved to two o'clock because the director has a client call at noon.\nWOMAN: Good. I'll update the invitation and reserve Room 4.\nMAN: Thanks. I'll send the revised sales figures before the meeting.", [
    ["Why was the product review moved?", "The director has a client call", ["Room 4 is unavailable", "The sales figures are incomplete", "The invitation has the wrong date"], "detail", "explicit_information"],
    ["What will the woman do?", "Update the invitation", ["Call a client", "Revise the sales figures", "Meet with the director"], "next_action", "next_action"],
    ["Where will the product review be held?", "In Room 4", ["In the director's office", "In the sales department", "At a client's office"], "detail", "location"],
  ]],
  ["WOMAN: The sample boxes are ready, but the courier was supposed to arrive twenty minutes ago.\nMAN: I'll call the dispatch office and ask for a pickup time.\nWOMAN: Please tell them the loading entrance closes at six.", [
    ["What is ready?", "Some sample boxes", ["A customer invoice", "A delivery truck", "The loading entrance"], "detail", "explicit_information"],
    ["What problem is mentioned?", "A courier is late", ["Some boxes are damaged", "An office is closed", "A pickup was canceled"], "detail", "explicit_information"],
    ["What will the man do?", "Call the dispatch office", ["Pack the samples", "Open the loading entrance", "Drive to the courier's office"], "next_action", "next_action"],
  ]],
  ["MAN: This projector keeps turning off during presentations. I already changed the power cable.\nWOMAN: Facilities has a spare one in the equipment room.\nMAN: Great. Could you bring it before the training session starts?", [
    ["What problem does the man mention?", "A projector turns off", ["A cable is missing", "A presentation was canceled", "An equipment room is locked"], "detail", "explicit_information"],
    ["Who has replacement equipment?", "The facilities department", ["The training instructor", "The sales department", "The building owner"], "detail", "explicit_information"],
    ["What does the man ask the woman to do?", "Bring another projector", ["Change the power cable", "Reserve the equipment room", "Postpone the training session"], "next_action", "next_action"],
  ]],
  ["WOMAN: My train arrives at Central Station at nine fifteen, but I have two large suitcases.\nMAN: I'll meet you by the information desk and help with them. Then we can drive to the branch office.\nWOMAN: Perfect. The presentation there begins at eleven.", [
    ["Where will the speakers meet?", "By the information desk", ["At the branch office", "On the train platform", "Outside the presentation room"], "detail", "location"],
    ["When will the woman arrive?", "At 9:15", ["At 10:00", "At 10:30", "At 11:00"], "detail", "explicit_information"],
    ["What will the speakers probably do after meeting?", "Travel to a branch office", ["Attend a station tour", "Buy another train ticket", "Leave the suitcases at a hotel"], "next_action", "next_action"],
  ]],
  ["MAN: A customer ordered this jacket online, but she says the sleeves are too short.\nWOMAN: We have the next size in storage. I'll inspect it and prepare an exchange.\nMAN: Good. The customer will return after lunch.", [
    ["Why does the customer want to exchange the jacket?", "The sleeves are too short", ["The color is incorrect", "The zipper is broken", "The price was changed"], "detail", "explicit_information"],
    ["Where is another jacket?", "In storage", ["At another store", "In the fitting room", "Near the checkout counter"], "detail", "location"],
    ["What will the woman do next?", "Inspect another jacket", ["Call the customer", "Issue a cash refund", "Place an online order"], "next_action", "next_action"],
  ]],
  ["WOMAN: Dr. Malik has an opening at eleven thirty tomorrow. The clinic is in the Westgate Building.\nMAN: That time works for me. Please send the building directions with the confirmation.\nWOMAN: Of course. I'll text both of them this afternoon.", [
    ["Why are the speakers talking?", "To arrange an appointment", ["To discuss a medical bill", "To change a building address", "To interview a doctor"], "purpose", "purpose"],
    ["What appointment time does the man accept?", "11:30 tomorrow", ["10:30 today", "11:00 tomorrow", "3:30 tomorrow"], "detail", "explicit_information"],
    ["What does the man request?", "Building directions", ["A payment receipt", "A medical report", "A different doctor"], "detail", "explicit_information"],
  ]],
  ["MAN: The lights in the east hallway are flickering again, and that area gets dark after sunset.\nWOMAN: I'll submit a maintenance ticket and put a warning sign there.\nMAN: Thanks. I'll ask the evening staff to use the west hallway.", [
    ["What needs attention?", "Hallway lights", ["A warning sign", "An office door", "A staff schedule"], "detail", "explicit_information"],
    ["What will the woman submit?", "A maintenance ticket", ["An expense report", "A work schedule", "A supply order"], "next_action", "next_action"],
    ["What will the man ask the evening staff to do?", "Use another hallway", ["Repair the lights", "Work before sunset", "Remove a warning sign"], "next_action", "next_action"],
  ]],
  ["WOMAN: We have sixty registrations for Saturday's workshop, ten more than we expected.\nMAN: Then I'll order more name tags and ask the cafe for extra coffee.\nWOMAN: I'll add another row of chairs to the meeting room.", [
    ["What are the speakers preparing for?", "A workshop", ["A cafe opening", "A job fair", "A staff dinner"], "purpose", "purpose"],
    ["How many people registered?", "Sixty", ["Ten", "Fifty", "Seventy"], "detail", "explicit_information"],
    ["What will the man order?", "More name tags", ["Another row of chairs", "A larger meeting room", "Workshop registration forms"], "next_action", "next_action"],
  ]],
];
conversations.forEach(([transcript, questions], index) => {
  const id = `L-P3-PROD-G${String(index + 6).padStart(3, "0")}`;
  listeningManifest.push({
    externalId: id, version: 2, part: 3, type: "conversation", status: "published", skillArea: "LISTENING", responseType: "MULTIPLE_CHOICE", difficulty: index < 3 ? "easy" : "medium",
    transcript, script: transcript.split("\n").map((line) => ({ speaker: line.split(":")[0], text: line.slice(line.indexOf(":") + 2) })),
    media: [{ role: "AUDIO", assetRef: `content/listening/audio/${id}.mp3` }],
    questions: questions.map((question, questionIndex) => q(questionIndex + 1, ...question, (index + questionIndex) % 4)),
  });
});

const talks = [
  ["announcement", "Attention passengers. The 6:10 service to Lakeside will depart from Platform 8 instead of Platform 5. Please use the west stairs, since the elevator near Platform 8 is being inspected. Station staff will be available to assist travelers with heavy luggage.", [
    ["What is the purpose of the announcement?", "To announce a platform change", ["To report a train cancellation", "To advertise a luggage service", "To explain a ticket policy"], "purpose", "purpose"],
    ["Where will the train depart?", "From Platform 8", ["From Platform 5", "From the west entrance", "From Lakeside Station"], "detail", "location"],
    ["Why should passengers use the stairs?", "An elevator is being inspected", ["The train is leaving early", "A platform is being cleaned", "The station entrance is closed"], "detail", "explicit_information"],
  ]],
  ["voicemail", "Hello, this is Priya from Northstar Dental. Your appointment on Tuesday has been moved from three o'clock to three thirty because the dentist has a meeting. Please call us before noon tomorrow if the new time is inconvenient. Otherwise, we will see you Tuesday afternoon.", [
    ["Who most likely left the message?", "A clinic employee", ["A meeting organizer", "A dental patient", "A building receptionist"], "inference", "implied_information"],
    ["What changed?", "An appointment time", ["A clinic address", "A dentist's name", "A payment deadline"], "detail", "explicit_information"],
    ["What should the listener do if the new time is inconvenient?", "Call the clinic", ["Arrive at three o'clock", "Send a payment", "Contact the dentist at home"], "next_action", "next_action"],
  ]],
  ["instructions", "Before operating the label printer, check that the paper roll is beneath the green guide. Then press the power button for two seconds and select the label size on the screen. If the warning light flashes, stop the machine and ask a supervisor for assistance.", [
    ["What are the instructions about?", "Using a label printer", ["Replacing an office computer", "Ordering shipping supplies", "Repairing a warning light"], "purpose", "purpose"],
    ["What should be checked first?", "The paper roll", ["The label size", "The power cable", "The warning light"], "detail", "explicit_information"],
    ["Who should be contacted if the warning light flashes?", "A supervisor", ["A delivery driver", "A customer", "A security guard"], "next_action", "next_action"],
  ]],
  ["advertisement", "This week at Harbor Home Market, all desk lamps are twenty percent off. Customers who order through our mobile application before noon can collect their purchases after four at the River Street branch. App users will also receive a coupon for a future purchase.", [
    ["What is being advertised?", "A discount on desk lamps", ["A new mobile phone", "An office furniture rental", "A home delivery service"], "purpose", "purpose"],
    ["How can customers place an order?", "Through a mobile application", ["By mailing a form", "At the River Street warehouse", "By calling before four"], "detail", "explicit_information"],
    ["Where can purchases be collected?", "At the River Street branch", ["At Harbor Station", "At a customer's home", "At the main warehouse"], "detail", "location"],
  ]],
  ["meeting_update", "Here is an update on the office renovation. Painting on the third floor will finish Wednesday, and employees may return Thursday morning. The kitchen will remain closed until new cabinets arrive next week, so please continue using the cafeteria on the first floor.", [
    ["What is the talk mainly about?", "An office renovation", ["A staff relocation plan", "A cafeteria menu", "A furniture sale"], "purpose", "purpose"],
    ["When may employees return to the third floor?", "Thursday morning", ["Wednesday morning", "Thursday afternoon", "Next week"], "detail", "explicit_information"],
    ["What will remain closed?", "The kitchen", ["The third floor", "The cafeteria", "The main office"], "detail", "explicit_information"],
  ]],
];
talks.forEach(([talkType, transcript, questions], index) => {
  const id = `L-P4-PROD-G${String(index + 6).padStart(3, "0")}`;
  listeningManifest.push({
    externalId: id, version: 2, part: 4, type: "talk", talkType, status: "published", skillArea: "LISTENING", responseType: "MULTIPLE_CHOICE", difficulty: index < 2 ? "easy" : "medium",
    transcript, script: [{ speaker: index % 2 ? "WOMAN" : "MAN", text: transcript }], media: [{ role: "AUDIO", assetRef: `content/listening/audio/${id}.mp3` }],
    questions: questions.map((question, questionIndex) => q(questionIndex + 1, ...question, (index + questionIndex) % 4)),
  });
});
