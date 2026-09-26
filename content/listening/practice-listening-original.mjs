import { extraConversationScenarios, extraTalkScenarios } from "./practice-listening-extra.mjs";

const companies = ["Alder", "Bellmont", "Creston", "Dover", "Elmwood", "Fairview", "Granite", "Harbor", "Ivory", "Juniper", "Kestrel", "Linden", "Maple", "Northstar", "Oakridge", "Parkview", "Quarry", "Riverside", "Stonebridge", "Tamarack", "Uplands", "Valley", "Westhaven", "Yorkfield", "Zenith"];
const people = ["Amelia", "Ben", "Carla", "Daniel", "Elena", "Felix", "Grace", "Hugo", "Iris", "Jonah"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const times = ["8:30", "9:15", "10:00", "11:45", "1:30", "2:15", "3:00", "4:20"];
const keys = ["A", "B", "C", "D"];
const pad = n => String(n).padStart(3, "0");

function context(n) {
  const variant = Math.floor((n - 1) / 6);
  const company = companies[variant % companies.length];
  const branch = variant < companies.length ? "North" : "South";
  return { site: `${company} ${branch}`, company, person: people[variant % people.length], day: days[variant % days.length], time: times[variant % times.length], amount: 42 + variant % 23 };
}

function group(part, n, type, lines, qa) {
  const externalId = `L-P${part}-PRACTICE-G${pad(n)}`;
  return { externalId, version: 1, part, type, status: "published", skillArea: "LISTENING", responseType: "MULTIPLE_CHOICE", difficulty: "medium",
    transcript: lines.map(([speaker, text]) => `${speaker}: ${text}`).join("\n"),
    script: lines.map(([speaker, text]) => ({ speaker, text })),
    media: [{ role: "AUDIO", assetRef: `content/listening/audio/${externalId}.mp3` }],
    questions: qa.map(([stem, correct, wrong, skill, subSkill, evidence], index) => {
      const answerIndex = (n + index) % 4;
      const choices = [...wrong]; choices.splice(answerIndex, 0, correct);
      return { order: index + 1, text: stem, skill, subSkill, difficulty: index === 2 ? "hard" : "medium",
        options: choices.map((text, position) => ({ key: keys[position], text })), correctKey: keys[answerIndex],
        explanationEn: evidence, explanationVi: `Bài nghe nêu rõ chi tiết tương ứng với đáp án “${correct}”.` };
    }),
  };
}

export function practiceConversation(n) {
  const c = context(n), s = c.site, scene = (n - 1) % 12;
  const scenarios = [
    () => ({
      lines: [["WOMAN", `The brochure for ${s} is ready, but the copier in the design office has stopped working.`], ["MAN", `I'll make the copies in the print room before ${c.time}.`], ["WOMAN", `Please leave one set for ${c.person} at reception.`]],
      qa: [["What problem is mentioned?", `The copier at ${s} has stopped working`, [`The brochure for ${s} is unfinished`, `${c.person} canceled a meeting at ${s}`, `The print room at ${s} is closed`], "detail", "explicit_information", "The woman says the design office copier stopped working."], ["What will the man do?", `Use the print room at ${s}`, [`Call ${c.person} about the brochure`, `Repair the copier at ${s}`, `Rewrite the ${s} brochure`], "next_action", "next_action", "He says he will make the copies in the print room."], ["Where should a set of copies be left?", `At reception in ${s}`, [`In the ${s} design office`, `Beside the broken ${s} copier`, `At ${c.person}'s home`], "detail", "location", "The woman asks for a set to be left at reception."]],
    }),
    () => ({
      lines: [["MAN", `Our supplier moved the delivery of display stands for ${s} to ${c.day} afternoon.`], ["WOMAN", `That's too late for the morning presentation. I'll ask ${c.person} whether we can collect them from the depot.`], ["MAN", `Good idea. The supplier has already packed the stands.`]],
      qa: [["Why is the woman concerned?", `The stands for ${s} will arrive after the presentation`, [`The stands for ${s} are damaged`, `${c.person} cannot attend the presentation`, `The supplier depot serving ${s} is closed`], "detail", "explicit_information", "The afternoon delivery is too late for the morning presentation."], ["What will the woman probably do next?", `Ask ${c.person} about collecting the ${s} stands`, [`Cancel the ${s} order`, `Move the ${s} presentation`, `Visit the ${s} design office`], "next_action", "next_action", "She says she will ask whether they can collect the stands."], ["What has the supplier already done?", `Packed the stands for ${s}`, [`Delivered the stands to ${s}`, `Called ${c.person} at ${s}`, `Changed the presentation time at ${s}`], "detail", "explicit_information", "The man says the supplier has already packed the stands."]],
    }),
    () => ({
      lines: [["WOMAN", `Welcome to ${s}. Your interview with the operations manager begins at ${c.time}.`], ["MAN", `Thank you. Is there somewhere I can leave my coat?`], ["WOMAN", `Certainly. The coatroom is beside reception. I'll take you to the interview room afterward.`]],
      qa: [["Why has the man come to the office?", `For an interview at ${s}`, [`To deliver a parcel to ${s}`, `To repair equipment at ${s}`, `To reserve a room at ${s}`], "purpose", "purpose", "The receptionist says his interview will begin soon."], ["When will the appointment begin?", `At ${c.time} at ${s}`, [`After lunch at ${s}`, `At closing time at ${s}`, `On ${c.day} evening at ${s}`], "detail", "explicit_information", "The receptionist states the interview time."], ["What will the woman do next?", `Show the visitor to the interview room at ${s}`, [`Take the visitor's coat home`, `Conduct the operations interview`, `Call the manager at ${s} later`], "next_action", "next_action", "She says she will take him to the interview room."]],
    }),
    () => ({
      lines: [["MAN", `Registration for the ${s} workshop has risen to ${c.amount} people.`], ["WOMAN", `Then the training room is too small. I'll reserve the main hall instead.`], ["MAN", `Great. I'll ask ${c.person} to order more refreshments.`]],
      qa: [["What are the speakers discussing?", `Arrangements for a workshop at ${s}`, [`A restaurant booking for ${s}`, `A customer complaint at ${s}`, `The payroll schedule at ${s}`], "purpose", "purpose", "They discuss the workshop room and refreshments."], ["Why will the woman change the room?", `More people will attend the ${s} workshop`, [`The projector at ${s} is broken`, `${c.person} requested a private office`, `The ${s} workshop changed dates`], "detail", "explicit_information", "The increased attendance makes the training room too small."], [`What will the man ask ${c.person} to do?`, `Order more refreshments for ${s}`, [`Reserve the training room at ${s}`, `Prepare the annual report at ${s}`, `Contact the finance team at ${s}`], "next_action", "next_action", "The man says he will request more refreshments."]],
    }),
    () => ({
      lines: [["WOMAN", `I checked the ${s} quarterly report, and two figures on the final page are incorrect.`], ["MAN", `I'll ask ${c.person} in accounting to revise them before ${c.time}.`], ["WOMAN", `Please do. The director needs the corrected report for a meeting on ${c.day}.`]],
      qa: [["What did the woman find?", `Incorrect figures in the ${s} report`, [`A missing delivery to ${s}`, `A broken copier at ${s}`, `An empty meeting room at ${s}`], "detail", "explicit_information", "She identifies two incorrect figures on the final page."], ["Who will the man contact?", `${c.person} in accounting at ${s}`, [`The supplier for ${s}`, `The building manager at ${s}`, `The meeting chair at ${s}`], "detail", "explicit_information", "The man says he will ask the named accounting colleague."], ["Why is the corrected version needed?", `For a director's meeting at ${s}`, [`For a refund at ${s}`, `For a safety inspection at ${s}`, `For an employee course at ${s}`], "purpose", "purpose", "The director needs the corrected report for a meeting."]],
    }),
    () => ({
      lines: [["MAN", `A client visiting ${s} at ${c.time} asked to see a sample of the new desk lamp.`], ["WOMAN", `The sample is in the storage room, but ${c.person} has the key.`], ["MAN", `I'll message ${c.person}. Could you prepare the showroom for the visit?`]],
      qa: [["What did the client request?", `A desk lamp sample at ${s}`, [`Directions to ${s}`, `A copy of the staff schedule at ${s}`, `A showroom reservation at ${s}`], "detail", "explicit_information", "The client asked to see a sample of the desk lamp."], [`Why will the man contact ${c.person}?`, `${c.person} has the storage room key at ${s}`, [`${c.person} knows the client visiting ${s}`, `${c.person} designed the lamp at ${s}`, `${c.person} reserved the ${s} showroom`], "detail", "explicit_information", "The woman says the colleague has the storage room key."], ["What does the man ask the woman to do?", `Prepare the showroom at ${s}`, [`Meet the client at ${s} at ${c.time}`, `Find a second lamp sample at ${s}`, `Call the director at ${s}`], "next_action", "next_action", "He asks her to prepare the showroom."]],
    }),
  ];
  const { lines, qa } = [...scenarios, ...extraConversationScenarios(c).map(value => () => value)][scene]();
  return group(3, n, "conversation", lines, qa);
}

export function practiceTalk(n) {
  const c = context(n), s = c.site, scene = (n - 1) % 12;
  const scenarios = [
    () => ({ type: "announcement", text: `Attention employees at ${s}. The main lobby will close from ${c.time} on ${c.day} while new lighting is installed. Please use the side entrance. The lobby will reopen the following morning.`,
      qa: [["What is the purpose of the announcement?", `To announce a temporary lobby closure at ${s}`, [`To introduce a new employee at ${s}`, `To advertise lighting products at ${s}`, `To change the training schedule at ${s}`], "purpose", "purpose", "The speaker announces when the lobby will close."], ["Why will the lobby be closed?", `New lighting will be installed at ${s}`, [`The floor at ${s} will be cleaned`, `A staff meeting will take place at ${s}`, `Furniture will arrive at ${s}`], "detail", "explicit_information", "The closure is for a lighting installation."], ["What should employees use?", `The side entrance at ${s}`, [`The closed main lobby at ${s}`, `The loading dock at ${s}`, `A nearby parking garage`], "next_action", "next_action", "Employees are asked to use the side entrance."]],
    }),
    () => ({ type: "voicemail", text: `Hello, this is ${c.person} calling from ${s} about your office supply order. It is ready early and can be collected from our service counter after ${c.time} on ${c.day}. Please bring your receipt. If you prefer delivery, call us before noon.`,
      qa: [["Why is the speaker calling?", `To say an order at ${s} is ready`, [`To request a refund from ${s}`, `To cancel a delivery from ${s}`, `To advertise a new ${s} location`], "purpose", "purpose", "The speaker says the order is ready early."], ["Where can the order be collected?", `At the service counter in ${s}`, [`At a warehouse outside ${s}`, `At the main entrance of ${s}`, `At the office of ${c.person}`], "detail", "location", "The voicemail names the service counter."], ["How can the listener request delivery?", `Call ${s} before noon`, [`Bring a receipt to ${s} on ${c.day}`, `Visit ${s} after ${c.time}`, `Contact ${c.person} next week`], "next_action", "next_action", "The speaker says to call before noon for delivery."]],
    }),
    () => ({ type: "instructions", text: `Before submitting a travel expense claim to ${s}, check that every page includes the employee number. Place the signed original in the tray at reception and keep a copy. Send any questions to ${c.person} before ${c.time} on ${c.day}.`,
      qa: [["What are the instructions about?", `Submitting an expense claim to ${s}`, [`Reserving a room at ${s}`, `Planning a staff event at ${s}`, `Operating a machine at ${s}`], "purpose", "purpose", "The speaker explains how to submit an expense claim."], ["What should be checked first?", `Every page has an employee number for ${s}`, [`The reception tray at ${s} is empty`, `${c.person} is available at ${s}`, `The claim has been paid already`], "detail", "explicit_information", "Every page must include the employee number."], ["What should listeners keep?", `A copy of the claim sent to ${s}`, [`The tray at ${s}`, `A reception key at ${s}`, `The original receipt only`], "detail", "explicit_information", "The speaker explicitly says to keep a copy."]],
    }),
    () => ({ type: "advertisement", text: `This ${c.day}, ${s} Office Supply is offering twenty-five percent off desk organizers. Order before ${c.time} for free delivery, or collect your purchase at our store. Members earn double reward points.`,
      qa: [["What product is discounted?", `Desk organizers at ${s}`, [`Office chairs at ${s}`, `Delivery vehicles at ${s}`, `Reward cards at ${s}`], "detail", "explicit_information", "The advertisement identifies desk organizers."], ["How can customers receive free delivery?", `Order from ${s} before ${c.time}`, [`Collect a purchase from ${s}`, `Buy from ${s} next week`, `Speak with ${c.person} at ${s}`], "detail", "explicit_information", "Customers must order before the stated time."], ["What will members receive?", `Double reward points at ${s}`, [`A free desk at ${s}`, `A discount next month at ${s}`, `Access to the ${s} warehouse`], "detail", "explicit_information", "The advertisement promises double reward points to members."]],
    }),
    () => ({ type: "tour_information", text: `Welcome to the ${s} business center tour. We begin at the front entrance and end in the exhibition hall. ${c.person} will explain how the building saves energy. The tour lasts forty minutes, with refreshments afterward.`,
      qa: [["Who is the intended audience?", `Visitors touring ${s}`, [`Delivery drivers serving ${s}`, `Job applicants at ${s}`, `Staff attending a meeting at ${s}`], "purpose", "purpose", "The speaker welcomes visitors to a business center tour."], ["What topic will be explained?", `Energy saving features at ${s}`, [`Membership prices at ${s}`, `The history of a restaurant at ${s}`, `Parking rules at ${s}`], "detail", "explicit_information", "The guide will discuss how the building saves energy."], ["What will happen after the tour?", `Refreshments will be served at ${s}`, [`A second tour will begin at ${s}`, `Visitors will pay a fee at ${s}`, `A meeting will be canceled at ${s}`], "detail", "explicit_information", "The speaker says refreshments follow the tour."]],
    }),
    () => ({ type: "meeting_update", text: `Good morning, ${s} team. Our quarterly planning meeting on ${c.day} will start at ${c.time} in the conference hall. ${c.person} will present the updated budget. Please review the agenda that was emailed yesterday and bring any questions about staffing.`,
      qa: [["What is the announcement about?", `A planning meeting at ${s}`, [`A product launch at ${s}`, `A customer tour at ${s}`, `A building inspection at ${s}`], "purpose", "purpose", "The speaker gives details of a planning meeting."], [`What will ${c.person} present?`, `The updated budget for ${s}`, [`A new staffing contract at ${s}`, `A revised agenda for ${s}`, `A sales brochure for ${s}`], "detail", "explicit_information", "The named colleague will present the updated budget."], ["What should listeners bring?", `Questions about staffing at ${s}`, [`Printed invitations to ${s}`, `Receipts from the previous meeting`, `Samples of a new product at ${s}`], "next_action", "next_action", "The speaker asks listeners to bring staffing questions."]],
    }),
  ];
  const { type, text, qa } = [...scenarios, ...extraTalkScenarios(c).map(value => () => value)][scene]();
  return group(4, n, type, [["NARRATOR", text]], qa);
}
