const companies = ["Alder", "Bellmont", "Creston", "Dover", "Elmwood", "Fairview", "Granite", "Harbor", "Ivory", "Juniper", "Kestrel", "Linden", "Maple", "Northstar", "Oakridge", "Parkview", "Quarry", "Riverside", "Stonebridge", "Tamarack", "Uplands", "Valley", "Westhaven", "Yorkfield", "Zenith"];
const projects = ["branch opening", "staff training program", "customer survey"];
const people = ["Amelia", "Ben", "Carla", "Daniel", "Elena", "Felix", "Grace", "Hugo", "Iris", "Jonah"];
const departments = ["accounting", "design", "facilities", "human resources", "IT", "legal", "marketing", "operations", "purchasing", "sales"];
const items = ["annual report", "brochure", "catering order", "delivery schedule", "expense form", "inventory list", "maintenance request", "price estimate", "project proposal", "training guide"];
const places = ["conference room", "customer lounge", "loading dock", "main lobby", "north entrance", "print room", "reception desk", "staff kitchen", "storage room", "training center"];
const rooms = ["conference room", "meeting room", "training room", "presentation hall", "seminar room"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const times = ["8:30", "9:15", "10:00", "11:45", "1:30", "2:15", "3:00", "4:20"];

export function practiceResponse(index) {
  const scenario = index % 30;
  const group = Math.floor(index / 30);
  const company = companies[group % companies.length];
  const project = projects[group % projects.length];
  const person = people[(group + scenario) % people.length];
  const department = departments[(group + scenario) % departments.length];
  const item = items[(group + scenario) % items.length];
  const place = places[(group + scenario) % places.length];
  const room = rooms[(group + scenario) % rooms.length];
  const day = days[(group + scenario) % days.length];
  const time = times[(group + scenario) % times.length];
  const ref = `${company}'s ${project}`;
  const scenarios = [
    [`When will the ${item} for ${ref} be ready?`, `By ${time} on ${day}.`, `It is in the ${place}.`, `${person} works in ${department}.`, "direct_response"],
    [`Where should I send the ${item} for ${ref}?`, `To the ${department} office, please.`, `At about ${time}.`, `${person} wrote it yesterday.`, "direct_response"],
    [`Who is coordinating the delivery for ${ref}?`, `${person} from ${department}.`, `It should arrive on ${day}.`, `At the ${place}.`, "direct_response"],
    [`Why was the meeting about ${ref} postponed?`, `The manager is away on ${day}.`, `It will be in the ${place}.`, `${person} usually leads it.`, "direct_response"],
    [`How can I request the ${item} for ${ref}?`, `Use the ${department} team's online form.`, `It was updated on ${day}.`, `The ${place} is upstairs.`, "direct_response"],
    [`What did ${person} say about the ${item} for ${ref}?`, `It needs one final correction.`, `${person} is in ${department}.`, `The review starts at ${time}.`, "direct_response"],
    [`Could you bring the ${item} for ${ref} to the ${place}?`, `Of course. I'll take it there now.`, `The office opens at ${time}.`, `${person} is reviewing it.`, "request"],
    [`Why don't we discuss ${ref} on ${day}?`, `Good idea. That gives us more time to prepare.`, `The ${place} is on the first floor.`, `${person} discussed it yesterday.`, "suggestion"],
    [`Would you like me to send the ${item} for ${ref} to ${person}?`, `Yes, and please copy the ${department} manager.`, `It was printed at ${time}.`, `The ${place} has a copier.`, "offer"],
    [`The ${item} for ${ref} is at reception, isn't it?`, `No, ${person} moved it to the ${place}.`, `Yes, the office closes at ${time}.`, `The meeting went well.`, "indirect_response"],
    [`Which room did ${person} reserve for the workshop about ${ref}?`, `The ${room}.`, `At ${time} on ${day}.`, `The ${department} team planned it.`, "direct_response"],
    [`Didn't ${person} approve the ${item} for ${ref}?`, `Not yet. The ${department} director is still checking it.`, `It's stored in the ${place}.`, `The review took an hour.`, "indirect_response"],
    [`How often does ${department} update the schedule for ${ref}?`, `Every other ${day}.`, `${person} updates the file.`, `In the ${place}.`, "direct_response"],
    [`Can I meet ${person} about ${ref} before ${time}?`, `Yes. There's an opening on ${day} morning.`, `The ${place} is downstairs.`, `The ${department} report is ready.`, "request"],
    [`Where is ${person}'s copy of the ${item} for ${ref}?`, `The ${department} assistant may have it.`, `It has eight pages.`, `We discussed it on ${day}.`, "indirect_response"],
    [`Has the agenda for ${ref} been approved?`, `Yes, the director signed off this morning.`, `At the ${place}.`, `It has eight pages.`, "direct_response"],
    [`Would you mind checking the room booking for ${ref}?`, `Of course. I'll call reception now.`, `It costs less than expected.`, `${person} arrived on ${day}.`, "request"],
    [`Isn't the deadline for ${ref} this ${day}?`, `It was moved to next week.`, `The ${place} is locked.`, `${person} wrote the summary.`, "indirect_response"],
    [`Where can attendees find the schedule for ${ref}?`, `It's posted on the staff portal.`, `At ${time} on ${day}.`, `${person} approved the budget.`, "direct_response"],
    [`Why are there extra chairs for the presentation about ${ref}?`, `We're expecting more visitors than planned.`, `They're next to the ${place}.`, `The event starts at ${time}.`, "direct_response"],
    [`Should I email the revised plan for ${ref} to ${person} or the ${department} office?`, `Please send it directly to ${person}.`, `It was revised on ${day}.`, `The ${place} has a computer.`, "direct_response"],
    [`Have you heard whether the presentation about ${ref} will be online?`, `Yes, the organizer sent a meeting link.`, `The ${place} has new chairs.`, `${person} usually arrives early.`, "indirect_response"],
    [`Could we move the briefing for ${ref} to ${day}?`, `I'll check whether a room is available.`, `It was printed yesterday.`, `${person} works in ${department}.`, "request"],
    [`When does ${person} want the summary for ${ref}?`, `By ${time} on ${day}.`, `In the ${place}.`, `The ${department} team prepared it.`, "direct_response"],
    [`Who should I contact about the budget for ${ref}?`, `Ask ${person} in ${department}.`, `It was updated on ${day}.`, `The meeting is in the ${place}.`, "direct_response"],
    [`Are we still using the old registration form for ${ref}?`, `No, there's a revised one on the portal.`, `The ${place} closes at ${time}.`, `${person} is in ${department}.`, "indirect_response"],
    [`The visitors for ${ref} have arrived, haven't they?`, `Yes, they're waiting near reception.`, `They'll leave on ${day}.`, `The ${place} is upstairs.`, "indirect_response"],
    [`Why hasn't the invoice for ${ref} been paid?`, `Accounting is checking the amount.`, `It is in the ${place}.`, `${person} printed it on ${day}.`, "direct_response"],
    [`Would you prefer a printed or digital copy of the plan for ${ref}?`, `The digital version, please.`, `Before ${time} on ${day}.`, `${person} works in ${department}.`, "direct_response"],
    [`How long will the orientation for ${ref} take?`, `About forty-five minutes.`, `In the ${place}.`, `${person} is leading it.`, "direct_response"],
  ];
  const [prompt, correct, wrong1, wrong2, subSkill] = scenarios[scenario];
  const choices = [correct, wrong1, wrong2];
  const offset = index % 3;
  const answers = choices.map((_, position) => choices[(position + offset) % 3]);
  const externalId = `L-P2-PRACTICE-${String(index + 1).padStart(3, "0")}`;
  return {
    externalId, version: 1, part: 2, type: "question_response", status: "published", skillArea: "LISTENING", responseType: "MULTIPLE_CHOICE", difficulty: "medium",
    transcript: `Question: ${prompt}\nA. ${answers[0]}\nB. ${answers[1]}\nC. ${answers[2]}`,
    script: [{ speaker: index % 2 ? "WOMAN" : "MAN", text: prompt }, { speaker: "NARRATOR", text: `A. ${answers[0]} B. ${answers[1]} C. ${answers[2]}` }],
    media: [{ role: "AUDIO", assetRef: `content/listening/audio/${externalId}.mp3` }],
    question: { order: 1, text: "[Spoken prompt and responses only]", skill: "question_response", subSkill, difficulty: "medium",
      options: answers.map((text, position) => ({ key: ["A", "B", "C"][position], text })),
      correctKey: ["A", "B", "C"][answers.indexOf(correct)],
      explanationEn: `The response “${correct}” appropriately answers the speaker's question.`,
      explanationVi: `Câu trả lời “${correct}” phù hợp với câu hỏi của người nói.` },
  };
}
