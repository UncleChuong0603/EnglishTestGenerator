/** TOEICGym-owned original content. Stable external IDs are the authoring contract. */
const keys = ["A", "B", "C", "D"];
const options = (correct, wrong, answer = 0) => {
  const values = [...wrong]; values.splice(answer, 0, correct);
  return values.map((text, i) => ({ key: keys[i], text }));
};
const explainVi = "Nội dung được nói trực tiếp hoặc ngụ ý rõ ràng trong đoạn ghi âm.";
const q = (order, text, correct, wrong, skill, subSkill, answer = 0, difficulty = "medium") => ({
  order, text, skill, subSkill, difficulty, options: options(correct, wrong, answer), correctKey: keys[answer],
  explanationEn: "The recording directly states or clearly implies this answer.", explanationVi: explainVi,
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
p2.forEach(([prompt, correct, wrong, intent], i) => listeningManifest.push({
  externalId: `L-P2-PROD-${String(i + 11).padStart(3, "0")}`, version: 1, part: 2, type: "question_response", status: "published", skillArea: "LISTENING", responseType: "MULTIPLE_CHOICE", difficulty: i < 5 ? "easy" : i < 12 ? "medium" : "hard",
  transcript: `Question: ${prompt}\nA. ${correct}\nB. ${wrong[0]}\nC. ${wrong[1]}`, script: [{ speaker: i % 2 ? "WOMAN" : "MAN", text: prompt }, { speaker: "NARRATOR", text: `A. ${correct} B. ${wrong[0]} C. ${wrong[1]}` }],
  media: [{ role: "AUDIO", assetRef: `content/listening/audio/L-P2-PROD-${String(i + 11).padStart(3, "0")}.mp3` }],
  question: { ...q(1, "[Spoken prompt and responses only]", correct, wrong, "question_response", intent, 0, i < 5 ? "easy" : "medium"), options: options(correct, wrong, 0).slice(0, 3) },
}));

const conversations = [
  ["schedule", "MAN: The product review was moved to two o'clock.\nWOMAN: Good. I'll update the invitation and reserve Room 4.", "What are the speakers discussing?", "A meeting schedule", "What will the woman do?", "Update an invitation", "Where will the event be held?", "Room 4"],
  ["shipping", "WOMAN: The sample boxes are ready, but the courier has not arrived.\nMAN: I'll call the dispatch office and ask for a pickup time.", "What is ready?", "Some sample boxes", "What problem is mentioned?", "A courier is late", "What will the man do?", "Call the dispatch office"],
  ["equipment", "MAN: This projector keeps turning off during presentations.\nWOMAN: Facilities has a spare one. I'll bring it before the training session.", "What problem does the man mention?", "A projector turns off", "Who has replacement equipment?", "The facilities department", "What will the woman probably do next?", "Bring another projector"],
  ["travel", "WOMAN: My train arrives at Central Station at nine fifteen.\nMAN: I'll meet you by the information desk and drive us to the branch office.", "Where will the speakers meet?", "By the information desk", "When will the woman arrive?", "At 9:15", "Where will they go afterward?", "To a branch office"],
  ["retail", "MAN: A customer ordered this jacket online, but the size is wrong.\nWOMAN: We have the larger size in storage. I'll prepare an exchange.", "Why was the jacket returned?", "It is the wrong size", "Where is another jacket?", "In storage", "What will the woman do?", "Prepare an exchange"],
  ["appointment", "WOMAN: Dr. Malik has an opening at eleven thirty tomorrow.\nMAN: That works for me. Please send the building directions with the confirmation.", "Why are the speakers talking?", "To arrange an appointment", "What time does the man accept?", "11:30 tomorrow", "What does the man request?", "Building directions"],
  ["facilities", "MAN: The lights in the east hallway are flickering again.\nWOMAN: I'll submit a maintenance ticket and put a warning sign there.", "What needs attention?", "Hallway lights", "What will the woman submit?", "A maintenance ticket", "What will she place in the hallway?", "A warning sign"],
  ["event", "WOMAN: We have sixty registrations for Saturday's workshop.\nMAN: Then I'll order more name tags and ask the café for extra coffee.", "What are the speakers planning?", "A workshop", "How many people registered?", "Sixty", "What will the man order?", "More name tags"],
];
conversations.forEach((c, i) => {
  const id = `L-P3-PROD-G${String(i + 6).padStart(3, "0")}`;
  listeningManifest.push({ externalId: id, version: 1, part: 3, type: "conversation", status: "published", skillArea: "LISTENING", responseType: "MULTIPLE_CHOICE", difficulty: i < 3 ? "easy" : "medium", transcript: c[1], script: c[1].split("\n").map(line => ({ speaker: line.split(":")[0], text: line.split(": ")[1] })), media: [{ role: "AUDIO", assetRef: `content/listening/audio/${id}.mp3` }], questions: [q(1, c[2], c[3], ["A budget report", "A job interview", "A lunch menu"], "detail", "explicit_information", i % 4), q(2, c[4], c[5], ["Cancel the request", "Contact a customer", "Print an invoice"], "detail", "explicit_information", (i + 1) % 4), q(3, c[6], c[7], ["At the main entrance", "Next Monday", "A payment receipt"], "next_action", "next_action", (i + 2) % 4)] });
});

const talks = [
  ["announcement", "Attention passengers. The 6:10 service to Lakeside will depart from Platform 8 instead of Platform 5. Please use the west stairs, since the elevator near Platform 8 is being inspected.", "What is the purpose of the announcement?", "To announce a platform change", "Where will the train depart?", "Platform 8", "Why should passengers use the stairs?", "An elevator is being inspected"],
  ["voicemail", "Hello, this is Priya from Northstar Dental. Your appointment on Tuesday has been moved from three o'clock to three thirty because the dentist has a meeting. Please call us if the new time is inconvenient.", "Who most likely left the message?", "A clinic employee", "What changed?", "An appointment time", "What should the listener do if necessary?", "Call the clinic"],
  ["instructions", "Before operating the label printer, check that the paper roll is beneath the green guide. Then press the power button for two seconds. If the warning light flashes, ask a supervisor for assistance.", "What are the instructions about?", "Using a label printer", "What should be checked first?", "The paper roll", "Who should be contacted if a light flashes?", "A supervisor"],
  ["advertisement", "This week at Harbor Home Market, all desk lamps are twenty percent off. Customers who order through our mobile application before noon can collect purchases after four at the River Street branch.", "What is being advertised?", "A discount on desk lamps", "How can customers place an order?", "Through a mobile application", "Where can purchases be collected?", "At the River Street branch"],
  ["meeting_update", "Here is an update on the office renovation. Painting on the third floor will finish Wednesday, and employees may return Thursday morning. The kitchen will remain closed until new cabinets arrive next week.", "What is the talk mainly about?", "An office renovation", "When may employees return to the third floor?", "Thursday morning", "What will remain closed?", "The kitchen"],
];
talks.forEach((t, i) => {
  const id = `L-P4-PROD-G${String(i + 6).padStart(3, "0")}`;
  listeningManifest.push({ externalId: id, version: 1, part: 4, type: "talk", talkType: t[0], status: "published", skillArea: "LISTENING", responseType: "MULTIPLE_CHOICE", difficulty: i < 2 ? "easy" : "medium", transcript: t[1], script: [{ speaker: i % 2 ? "WOMAN" : "MAN", text: t[1] }], media: [{ role: "AUDIO", assetRef: `content/listening/audio/${id}.mp3` }], questions: [q(1, t[2], t[3], ["A staff promotion", "A billing error", "A menu change"], "purpose", "purpose", i % 4), q(2, t[4], t[5], ["At the end of the month", "Near the front desk", "By registered mail"], "detail", "explicit_information", (i + 1) % 4), q(3, t[6], t[7], ["Complete a survey", "Bring identification", "Reserve a table"], "inference", "implied_information", (i + 2) % 4)] });
});

