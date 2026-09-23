/** TOEICGym-owned original content generated from reviewed scenario templates. */
const keys = ["A", "B", "C", "D"];
const pad = (n) => String(n).padStart(3, "0");
const names = ["Amelia", "Ben", "Carla", "Daniel", "Elena", "Felix", "Grace", "Hugo", "Iris", "Jonah", "Keira", "Liam", "Maya", "Noah", "Olivia", "Paul", "Rina", "Simon", "Tara", "Victor"];
const departments = ["accounting", "design", "facilities", "human resources", "IT", "legal", "marketing", "operations", "purchasing", "sales"];
const places = ["conference room", "customer lounge", "loading dock", "main lobby", "north entrance", "printing room", "reception desk", "staff kitchen", "storage area", "training center"];
const objects = ["annual report", "brochure proofs", "catering order", "delivery schedule", "expense forms", "inventory list", "maintenance request", "price estimate", "project proposal", "training materials"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const times = ["8:15", "8:45", "9:20", "10:10", "10:40", "11:30", "1:15", "2:20", "3:10", "4:30"];
const difficulty = (n) => n % 8 === 0 ? "hard" : n % 3 === 0 ? "easy" : "medium";

function question(order, text, correct, wrong, skill, subSkill, seed, context) {
  const answer = seed % 4;
  const values = [...wrong];
  values.splice(answer, 0, correct);
  return {
    order, text, skill, subSkill, difficulty: difficulty(seed),
    options: values.map((value, index) => ({ key: keys[index], text: value })),
    correctKey: keys[answer],
    explanationEn: `${context} This supports the answer "${correct}."`,
    explanationVi: `${context.replace("The recording", "Đoạn ghi âm")} Chi tiết này xác nhận đáp án "${correct}."`,
  };
}

function part2(n) {
  const name = names[n % names.length], department = departments[n % departments.length];
  const place = places[n % places.length], object = objects[n % objects.length];
  const day = days[n % days.length], time = times[n % times.length];
  const reference = `project ${n}`;
  const otherPlace = places[(n + 3) % places.length], otherDay = days[(n + 2) % days.length];
  const otherTime = times[(n + 4) % times.length];
  const patterns = [
    [`When will ${name} finish the ${object} for ${reference}?`, `By ${time} on ${day} for ${reference}.`, `In the ${place} for ${reference}.`, `${name} works in ${department} on ${reference}.`, "direct_response"],
    [`Where should I take the ${object} for ${reference}?`, `Please leave it in the ${place} for ${reference}.`, `At about ${time} for ${reference}.`, `The ${department} team prepared it for ${reference}.`, "direct_response"],
    [`Who is reviewing the ${object} for ${reference}?`, `${name} from ${department} is reviewing ${reference}.`, `It is beside the ${place} with the ${reference} files.`, `The ${reference} review starts at ${time}.`, "direct_response"],
    [`Why was the ${department} meeting about ${reference} moved?`, `${name} has a client appointment for ${reference}.`, `It is in the ${place} for ${reference}.`, `At ${time} on ${day} for ${reference}.`, "direct_response"],
    [`How can I request the ${object} for ${reference}?`, `Submit the online form to ${department} for ${reference}.`, `It arrived on ${day} for ${reference}.`, `Near the ${place} for ${reference}.`, "direct_response"],
    [`What did ${name} say about the ${object} for ${reference}?`, `The ${reference} copy needs one final correction.`, `${name} is in ${department} working on ${reference}.`, `Put the ${reference} copy in the ${place}.`, "direct_response"],
    [`Could you bring the ${object} for ${reference} to the ${place}?`, `Of course, I'll take the ${reference} materials there now.`, `The room for ${reference} opens at ${time}.`, `${name} wrote the ${reference} notes on ${day}.`, "request"],
    [`Why don't we discuss the ${object} for ${reference} on ${day}?`, `That gives the ${department} team more time for ${reference}.`, `The ${place} for ${reference} is downstairs.`, `${name} discussed ${reference} yesterday.`, "suggestion"],
    [`Would you like me to send the ${object} for ${reference} to ${name}?`, `Yes, please copy the ${department} manager on the ${reference} message too.`, `The ${reference} file was printed at ${time}.`, `The ${place} has a copier for ${reference}.`, "offer"],
    [`The ${object} for ${reference} is in the ${place}, isn't it?`, `No, ${name} took the ${reference} file to ${department}.`, `Yes, the office handling ${reference} closes at ${time}.`, `The ${reference} meeting was useful.`, "indirect_response"],
    [`Which room did ${name} reserve for ${reference}?`, `The ${place} for ${reference}.`, `At ${time} on ${day} for ${reference}.`, `For the ${department} workshop on ${reference}.`, "direct_response"],
    [`Didn't ${name} approve the ${object} for ${reference}?`, `Not yet; the ${department} director is checking ${reference}.`, `It is stored in the ${place} for ${reference}.`, `The ${reference} approval meeting lasted an hour.`, "indirect_response"],
    [`How often does ${department} update the ${object} for ${reference}?`, `Every other ${day} for ${reference}.`, `${name} updates the ${reference} file.`, `In the ${place} for ${reference}.`, "direct_response"],
    [`Can I meet ${name} about ${reference} before ${time}?`, `Yes, but call the ${department} office about ${reference} first.`, `The ${place} for ${reference} is on the first floor.`, `${day} was very busy on ${reference}.`, "request"],
    [`Where is ${name}'s copy of the ${object} for ${reference}?`, `The ${department} assistant may have the ${reference} copy.`, `The ${reference} copy contains ${n} pages.`, `We reviewed the ${reference} copy on ${day}.`, "indirect_response"],
  ];
  const [prompt, correct, ...rest] = patterns[n % patterns.length];
  // Four authored incorrect replies per prompt allow varied spoken choices
  // while keeping the generated audio and displayed answer key in sync.
  const extraWrong = [
    [`In the ${otherPlace} for ${reference}.`, `The ${department} team has the ${reference} files.`],
    [`At about ${otherTime} for ${reference}.`, `${name} prepared the ${reference} file.`],
    [`The ${reference} file is in the ${otherPlace}.`, `The ${reference} review starts on ${otherDay}.`],
    [`The ${reference} meeting is in the ${otherPlace}.`, `At ${otherTime} on ${otherDay} for ${reference}.`],
    [`The ${reference} copy arrived on ${otherDay}.`, `Beside the ${otherPlace} for ${reference}.`],
    [`${name} is at the ${otherPlace} with the ${reference} files.`, `Leave the ${reference} copy in the ${otherPlace}.`],
    [`The ${reference} room opens at ${otherTime}.`, `${name} wrote the ${reference} notes on ${otherDay}.`],
    [`The ${otherPlace} for ${reference} is downstairs.`, `${name} discussed ${reference} on ${otherDay}.`],
    [`The ${reference} file was printed at ${otherTime}.`, `The ${otherPlace} has a copier for ${reference}.`],
    [`The office handling ${reference} closes at ${otherTime}.`, `The ${reference} workshop was useful.`],
    [`At ${otherTime} on ${otherDay} for ${reference}.`, `For the ${department} review of ${reference}.`],
    [`The ${reference} file is stored in the ${otherPlace}.`, `The ${reference} approval meeting starts at ${otherTime}.`],
    [`${name} updates the ${reference} records.`, `In the ${otherPlace} for ${reference}.`],
    [`The ${otherPlace} for ${reference} is on the first floor.`, `${otherDay} was very busy on ${reference}.`],
    [`The ${reference} copy contains ${n + 2} pages.`, `We reviewed the ${reference} copy on ${otherDay}.`],
  ];
  const patternIndex = n % patterns.length;
  const wrongPool = [...rest.slice(0, 2), ...extraWrong[patternIndex]];
  const offset = (n * 7) % wrongPool.length;
  const wrong = [wrongPool[offset], wrongPool[(offset + 1) % wrongPool.length]];
  const subSkill = rest[2];
  const values = [correct, ...wrong];
  const shift = n % 3;
  const answers = values.map((_, index) => values[(index + shift) % 3]);
  const id = `L-P2-BANK-${pad(n)}`;
  return {
    externalId: id, version: 1, part: 2, type: "question_response", status: "published", skillArea: "LISTENING", responseType: "MULTIPLE_CHOICE", difficulty: difficulty(n),
    transcript: `Question: ${prompt}\nA. ${answers[0]}\nB. ${answers[1]}\nC. ${answers[2]}`,
    script: [{ speaker: n % 2 ? "WOMAN" : "MAN", text: prompt }, { speaker: "NARRATOR", text: `A. ${answers[0]} B. ${answers[1]} C. ${answers[2]}` }],
    media: [{ role: "AUDIO", assetRef: `content/listening/audio/${id}.mp3` }],
    question: { order: 1, text: "[Spoken prompt and responses only]", skill: "question_response", subSkill, difficulty: difficulty(n), options: answers.map((text, index) => ({ key: keys[index], text })), correctKey: keys[answers.indexOf(correct)], explanationEn: `The response "${correct}" fits the speaker's question.`, explanationVi: `Câu đáp "${correct}" phù hợp với câu hỏi của người nói.` },
  };
}

function conversationScenario(n) {
  const a = names[n % names.length], b = names[(n + 7) % names.length];
  const department = departments[n % departments.length], place = places[n % places.length], other = places[(n + 3) % places.length];
  const object = objects[n % objects.length], day = days[n % days.length], time = times[n % times.length];
  return [
    {
      lines: [`WOMAN: ${a}, the ${object} is ready, but printer ${n} in ${department} has stopped working.`, `MAN: I'll use the machine in the ${place} and make the copies before ${time}.`, `WOMAN: Thanks. Please leave a set for ${b} at the ${other}.`],
      qs: [["What problem is mentioned?", `Printer ${n} is not working`, [`The ${object} has not arrived for order ${n}`, `${b} canceled meeting ${n}`, `The ${place} is closed for event ${n}`], "detail", "explicit_information"], ["What will the man do?", `Use the ${place} machine instead of printer ${n}`, [`Call ${b} about file ${n}`, `Repair printer ${n}`, `Rewrite document ${n}`], "next_action", "next_action"], ["Where should a set of copies be left?", `At the ${other} for ${b} after printer ${n} failed`, [`In ${department} office ${n}`, `Beside printer ${n}`, `At the ${place} desk ${n}`], "detail", "location"]],
    },
    {
      lines: [`MAN: Supplier ${n} moved our ${object} delivery to ${day} afternoon.`, `WOMAN: That's too late for the presentation at ${time}. I'll call ${b} and ask whether we can collect it ourselves.`, `MAN: Good idea. The order is waiting at the ${place}.`],
      qs: [["Why is the woman concerned?", `Supplier ${n}'s delivery will arrive after a presentation`, [`Order ${n} contains the wrong items`, `${b} cannot attend presentation ${n}`, `The ${place} is unavailable for order ${n}`], "detail", "explicit_information"], ["What will the woman probably do next?", `Call ${b} about supplier ${n}'s delivery`, [`Cancel order ${n}`, `Move presentation ${n}`, `Visit ${department} office ${n}`], "next_action", "next_action"], ["Where is the order now?", `At the ${place} after supplier ${n} rescheduled it`, [`At the ${other} for order ${n}`, `In ${department} room ${n}`, `In presentation room ${n}`], "detail", "location"]],
    },
    {
      lines: [`WOMAN: Welcome, ${a}. Your interview ${n} with the ${department} manager begins at ${time}.`, `MAN: Thank you. May I leave my coat somewhere?`, `WOMAN: Certainly. Put it in the ${place}, and then I'll show you to the ${other}.`],
      qs: [["Why has the man most likely come to the office?", `For job interview ${n}`, [`To deliver order ${n}`, `To repair equipment ${n}`, `To reserve room ${n}`], "purpose", "purpose"], ["When will the man's appointment begin?", `At ${time} for interview ${n}`, [`On ${day} afternoon for interview ${n}`, `After lunch for interview ${n}`, `At closing time for interview ${n}`], "detail", "explicit_information"], ["What will the woman do?", `Show the man to the ${other} for interview ${n}`, [`Call manager ${n}`, `Take coat ${n} home`, `Conduct interview ${n}`], "next_action", "next_action"]],
    },
    {
      lines: [`MAN: ${a}, attendance for workshop ${n} on ${day} has increased to ${40 + n} people.`, `WOMAN: Then the ${place} is too small. I'll reserve the ${other} instead.`, `MAN: Great. I'll tell ${b} to order more refreshments.`],
      qs: [["What are the speakers discussing?", `Arrangements for workshop ${n}`, [`Restaurant reservation ${n}`, `Customer complaint ${n}`, `Employee schedule ${n}`], "purpose", "purpose"], ["Why will the woman change the room?", `More people will attend workshop ${n}`, [`Equipment ${n} is broken`, `${b} requested office ${n}`, `Workshop ${n} changed dates`], "detail", "explicit_information"], [`What will the man ask ${b} to do?`, `Order refreshments for workshop ${n}`, [`Reserve the ${place} for group ${n}`, `Prepare the ${object} for group ${n}`, `Contact attendee group ${n}`], "next_action", "next_action"]],
    },
    {
      lines: [`WOMAN: I checked report ${n}, and two figures on the final page are incorrect.`, `MAN: I'll ask ${a} in ${department} to revise them before ${time}.`, `WOMAN: Please do. ${b} needs the corrected version for a meeting on ${day}.`],
      qs: [["What did the woman find?", `Incorrect figures in report ${n}`, [`Missing delivery ${n}`, `Broken printer ${n}`, `Empty meeting room ${n}`], "detail", "explicit_information"], ["Who will the man contact?", `${a} in ${department} about report ${n}`, [`${b} about report ${n}`, `Supplier ${n}`, `Building manager ${n}`], "detail", "explicit_information"], ["Why is the corrected version needed?", `For meeting ${n} on ${day}`, [`For refund ${n}`, `For inspection ${n}`, `For course ${n}`], "purpose", "purpose"]],
    },
    {
      lines: [`MAN: Customer ${n}, arriving at ${time}, asked to see a sample of the ${object}.`, `WOMAN: The sample is in the ${place}, but ${a} has the key.`, `MAN: I'll message ${a}. Could you prepare the ${other} for the visit?`],
      qs: [["What did the customer request?", `A sample of the ${object} for customer ${n}`, [`Directions for visit ${n}`, `Schedule copy ${n}`, `Tour reservation ${n}`], "detail", "explicit_information"], [`Why will the man contact ${a}?`, `${a} has key ${n}`, [`${a} knows customer ${n}`, `${a} wrote document ${n}`, `${a} reserved room ${n}`], "detail", "explicit_information"], ["What does the man ask the woman to do?", `Prepare the ${other} for customer ${n}`, [`Meet customer ${n} at ${time}`, `Find sample ${n}`, `Call manager ${n}`], "next_action", "next_action"]],
    },
  ][n % 6];
}

function part3(n) {
  const scenario = conversationScenario(n), id = `L-P3-BANK-G${pad(n)}`, transcript = scenario.lines.join("\n");
  return { externalId: id, version: 1, part: 3, type: "conversation", status: "published", skillArea: "LISTENING", responseType: "MULTIPLE_CHOICE", difficulty: difficulty(n), transcript, script: scenario.lines.map((line) => ({ speaker: line.slice(0, line.indexOf(":")), text: line.slice(line.indexOf(":") + 2) })), media: [{ role: "AUDIO", assetRef: `content/listening/audio/${id}.mp3` }], questions: scenario.qs.map((q, index) => question(index + 1, q[0], q[1], q[2], q[3], q[4], n + index, "The recording provides this information.")) };
}

function talkScenario(n) {
  const name = names[n % names.length], place = places[n % places.length], other = places[(n + 4) % places.length];
  const object = objects[n % objects.length], day = days[n % days.length], time = times[n % times.length];
  return [
    ["announcement", `Attention employees. Area ${n} in the ${place} will close from ${time} on ${day} while new lighting is installed. Please use the ${other}. The area will reopen the following morning.`, [["What is the purpose of the announcement?", `To announce closure ${n}`, [`To introduce employee ${n}`, `To advertise lighting ${n}`, `To change training ${n}`], "purpose", "purpose"], ["Why will the area be closed?", `New lighting will be installed in area ${n}`, [`Floor ${n} will be cleaned`, `Meeting ${n} will take place`, `Furniture ${n} will arrive`], "detail", "explicit_information"], ["What are employees asked to use?", `The ${other} while area ${n} is closed`, [`The ${place} area ${n}`, `Building ${n}`, `Entrance ${n}`], "next_action", "next_action"]]],
    ["voicemail", `Hello, this is ${name} calling about order ${n}, your ${object}. It is ready early and can be collected from the ${place} after ${time} on ${day}. Bring your receipt. For delivery, call before noon.`, [["Why is the speaker calling?", `To say order ${n} is ready`, [`To request receipt ${n}`, `To cancel delivery ${n}`, `To advertise location ${n}`], "purpose", "purpose"], ["Where can the item be collected?", `Collect order ${n} at the ${place}`, [`At the ${other} for order ${n}`, `At office ${n}`, `At warehouse ${n}`], "detail", "location"], ["What should the listener do to request delivery?", `Call before noon about order ${n}`, [`Bring receipt ${n} on ${day}`, `Visit after ${time} for order ${n}`, `Contact ${name} next week about order ${n}`], "next_action", "next_action"]]],
    ["instructions", `Before submitting file ${n}, the ${object}, check that every page includes the project number. Place the signed original in the tray at the ${place}. Keep a copy. Send questions to ${name} before ${time} on ${day}.`, [["What are the instructions about?", `Submitting file ${n}`, [`Reserving room ${n}`, `Planning event ${n}`, `Operating machine ${n}`], "purpose", "purpose"], ["What should be checked first?", `Each page in file ${n} has a project number`, [`Tray ${n} is empty`, `${name} is available for file ${n}`, `Office ${n} is open`], "detail", "explicit_information"], ["What should listeners keep?", `A copy of file ${n}`, [`Tray ${n}`, `Key ${n}`, `Project sign ${n}`], "detail", "explicit_information"]]],
    ["advertisement", `This ${day}, Riverside Office Supply offer ${n} gives twenty-five percent off desk organizers. Shop before ${time} for free delivery, or collect your purchase at the ${place}. Members earn double reward points.`, [["What product is discounted?", `Desk organizers in offer ${n}`, [`Office chairs in offer ${n}`, `Delivery vehicles in offer ${n}`, `Reward cards in offer ${n}`], "detail", "explicit_information"], ["How can customers receive free delivery?", `Shop before ${time} for offer ${n}`, [`Collect at the ${place} for offer ${n}`, `Buy after ${day} for offer ${n}`, `Speak with ${name} about offer ${n}`], "detail", "explicit_information"], ["What will members receive?", `Double reward points in offer ${n}`, [`A free ${object} in offer ${n}`, `A discount next week for offer ${n}`, `Access to the ${other} for offer ${n}`], "detail", "explicit_information"]]],
    ["tour_information", `Welcome to Harbor Business Center tour ${n}. We begin in the ${place} and end at the ${other}. ${name} will explain how the building saves energy. The tour lasts forty minutes, with refreshments afterward.`, [["Who is the intended audience?", `Visitors on tour ${n}`, [`Delivery customers ${n}`, `Job applicants ${n}`, `Repair technicians ${n}`], "inference", "implied_information"], ["Where will the tour end?", `At the ${other} on tour ${n}`, [`At the ${place} on tour ${n}`, `Outside building ${n}`, `In ${name}'s office on tour ${n}`], "detail", "location"], ["What will happen after the tour?", `Refreshments for tour ${n} will be served`, [`Building ${n} will close`, `${name} will leave tour ${n}`, `Meeting ${n} will begin`], "next_action", "next_action"]]],
    ["meeting_update", `Here is update ${n} on the ${object} project. The review is at ${time} on ${day} in the ${place}. ${name} will present the latest results, and team leaders should bring budget notes.`, [["What is the talk mainly about?", `Project review ${n}`, [`Building tour ${n}`, `Product discount ${n}`, `Delivery problem ${n}`], "purpose", "purpose"], ["Who will present the results?", `${name} at project review ${n}`, [`Team leaders for review ${n}`, `Customer ${n}`, `Building manager ${n}`], "detail", "explicit_information"], ["What should team leaders bring?", `Budget notes for review ${n}`, [`Final decision ${n}`, `Refreshments ${n}`, `Building plan ${n}`], "detail", "explicit_information"]]],
  ][n % 6];
}

function part4(n) {
  const [talkType, transcript, qs] = talkScenario(n), id = `L-P4-BANK-G${pad(n)}`;
  return { externalId: id, version: 1, part: 4, type: "talk", talkType, status: "published", skillArea: "LISTENING", responseType: "MULTIPLE_CHOICE", difficulty: difficulty(n), transcript, script: [{ speaker: n % 2 ? "WOMAN" : "MAN", text: transcript }], media: [{ role: "AUDIO", assetRef: `content/listening/audio/${id}.mp3` }], questions: qs.map((q, index) => question(index + 1, q[0], q[1], q[2], q[3], q[4], n + index, "The recording provides this information.")) };
}

export const questionBankExpansion = [
  ...Array.from({ length: 225 }, (_, index) => part2(index + 26)),
  ...Array.from({ length: 117 }, (_, index) => part3(index + 14)),
  ...Array.from({ length: 90 }, (_, index) => part4(index + 11)),
  ...Array.from({ length: 375 }, (_, index) => part2(index + 251)),
  ...Array.from({ length: 195 }, (_, index) => part3(index + 131)),
  ...Array.from({ length: 150 }, (_, index) => part4(index + 101)),
];
