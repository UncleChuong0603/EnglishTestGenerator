function contextualizeScenarios(scenarios, site) {
  const replacements = {
    "The courier's invoice": `The courier's invoice for ${site}`,
    "Deliver the sample herself": `Deliver the ${site} sample herself`,
    "The training room has no chairs": `The training room at ${site} has no chairs`,
    "Order more conference chairs": `Order more conference chairs for ${site}`,
    "It has the wrong company address": `It has the wrong address for ${site}`,
    "The conference room schedule": `The conference room schedule at ${site}`,
    "The supplier will close then": `The supplier for ${site} will close then`,
    "A new laptop": `A new laptop for the ${site} course`,
    "A printed course handbook": `A printed ${site} course handbook`,
    "The display was sold to a customer": `The ${site} display was sold to a customer`,
    "At the trade show entrance": `At the ${site} trade show entrance`,
    "To change the trade show date": `To change the ${site} trade show date`,
    "The cafe's opening date": `The ${site} cafe's opening date`,
    "Call the supplier about lunch": `Call the ${site} supplier about lunch`,
    "In the print room": `In the ${site} print room`,
    "The airport is closed": `The airport near ${site} is closed`,
    "At the main lobby desk": `At the main lobby desk at ${site}`,
    "A printed boarding pass": `A printed boarding pass for a guest at ${site}`,
    "For a stock delivery": `For a stock delivery at ${site}`,
    "Collect purchases at the counter": `Collect purchases at the ${site} counter`,
    "Return all items to shelves": `Return all items to the ${site} shelves`,
    "A refrigerator was delivered to the wrong address": `A refrigerator for a ${site} customer was delivered to the wrong address`,
    "Tomorrow before noon": `Tomorrow before noon at ${site}`,
    "Collect the refrigerator": `Collect the refrigerator from ${site}`,
    "At the ground-floor cafe": `At the ground-floor cafe at ${site}`,
    "They are needed to order lunch": `They are needed to order lunch at ${site}`,
    "Flash photography everywhere": `Flash photography everywhere at ${site}`,
    "Start the cutting machine": `Start the cutting machine at ${site}`,
    "Repair the workshop door": `Repair the workshop door at ${site}`,
    "Before signing in": `Before signing in at ${site}`,
    "To announce a building closure": `To announce a building closure at ${site}`,
    "The annual budget": `The annual budget for ${site}`,
    "Interrupt the presenter by microphone": `Interrupt the ${site} presenter by microphone`,
  };
  return scenarios.map(scenario => ({ ...scenario, qa: scenario.qa.map(([prompt, correct, wrong, ...rest]) => {
    const first = wrong[0].includes(site) ? wrong[0] : replacements[wrong[0]];
    if (!first) throw new Error(`Missing contextualized distractor: ${wrong[0]}`);
    return [prompt, correct, [first, ...wrong.slice(1)], ...rest];
  }) }));
}

export function extraConversationScenarios(c) {
  const s = c.site;
  return contextualizeScenarios([
    {
      lines: [["MAN", `The shipping label for the ${s} sample has the wrong address.`], ["WOMAN", `I'll print a corrected label and give it to the courier before ${c.time}.`], ["MAN", `Thanks. Please also email the tracking number to ${c.person}.`]],
      qa: [["What problem is mentioned?", `The ${s} sample has an incorrect shipping label`, [`The ${s} sample is damaged`, `The courier canceled the ${s} pickup`, `${c.person} lost the tracking number`], "detail", "explicit_information", "The man says the address on the label is wrong."], ["What will the woman do?", `Print a corrected label for the ${s} sample`, [`Deliver the sample herself`, `Call the customer about the address`, `Repair the ${s} printer`], "next_action", "next_action", "She says she will print another label."], [`What should be emailed to ${c.person}?`, `The tracking number for the ${s} sample`, [`The courier's invoice`, `The original shipping label`, `The delivery schedule for ${c.day}`], "detail", "explicit_information", "The man requests the tracking number by email."]],
    },
    {
      lines: [["WOMAN", `The conference room at ${s} was booked by two teams for ${c.day}.`], ["MAN", `The training room is free after ${c.time}. Can the sales team move there?`], ["WOMAN", `I think so. I'll call ${c.person} to confirm before updating the room schedule.`]],
      qa: [["What is the problem?", `Two teams reserved the same room at ${s}`, [`The training room has no chairs`, `${c.person} canceled a meeting`, `The office will close on ${c.day}`], "detail", "explicit_information", "The woman says the conference room was double-booked."], ["Which room might the sales team use?", `The training room at ${s}`, [`The conference room at ${s}`, `The main lobby at ${s}`, `The storage room at ${s}`], "detail", "location", "The man suggests the free training room."], ["What will the woman do next?", `Ask ${c.person} whether the room change works`, [`Order more conference chairs`, `Cancel the sales meeting`, `Call the building manager about lighting`], "next_action", "next_action", "She will call the colleague before changing the schedule."]],
    },
    {
      lines: [["MAN", `The invoice from the supplier for ${s} lists twelve monitors, but only ten arrived.`], ["WOMAN", `I'll check the delivery record and ask the supplier to correct the invoice.`], ["MAN", `Please do that before ${c.person} approves payment on ${c.day}.`]],
      qa: [["What is wrong with the invoice?", `It lists more monitors than ${s} received`, [`It has the wrong company address`, `It omits a delivery fee`, `It was sent after payment`], "detail", "explicit_information", "The invoice lists twelve monitors, but ten arrived."], ["What will the woman check?", `The ${s} delivery record`, [`The conference room schedule`, `The annual leave calendar`, `${c.person}'s training plan`], "next_action", "next_action", "She says she will check the delivery record."], [`Why should the issue be resolved before ${c.day}?`, `${c.person} will approve payment then`, [`The supplier will close then`, `The monitors will be returned then`, `The office will move then`], "inference", "implied_information", "The man mentions the payment approval on that day."]],
    },
    {
      lines: [["WOMAN", `Registration for the software course at ${s} closes on ${c.day}.`], ["MAN", `I need approval from my manager first. Is there still space in the afternoon class?`], ["WOMAN", `There are a few places left. I'll send you the registration link now.`]],
      qa: [["What are the speakers discussing?", `A software course at ${s}`, [`A supplier delivery to ${s}`, `An office renovation at ${s}`, `A customer refund at ${s}`], "purpose", "purpose", "The speakers discuss course registration and available places."], ["What does the man need before registering?", `His manager's approval`, [`A new laptop`, `A copy of an invoice`, `A visitor badge`], "detail", "explicit_information", "The man says he needs manager approval first."], ["What will the woman send?", `A registration link for the ${s} course`, [`A printed course handbook`, `An invoice for the manager`, `The course attendance list`], "next_action", "next_action", "She offers to send the registration link." ]],
    },
    {
      lines: [["MAN", `One panel on the ${s} trade show display was damaged during transport.`], ["WOMAN", `We have a spare panel in storage. Can you ask ${c.person} to bring it to the venue?`], ["MAN", `Yes. I'll call now so it arrives before the hall opens at ${c.time}.`]],
      qa: [["What happened to the display?", `A panel was damaged during transport to ${s}`, [`The display was sold to a customer`, `The venue canceled the show`, `All panels were left in storage`], "detail", "explicit_information", "The man says one panel was damaged in transit."], ["Where is the replacement panel?", `In storage at ${s}`, [`At the trade show entrance`, `In ${c.person}'s car`, `At a supplier's office`], "detail", "location", "The woman says a spare panel is in storage."], [`Why will the man call ${c.person}?`, `To get the spare panel before the hall opens`, [`To change the trade show date`, `To order a new display`, `To ask for an invoice`], "next_action", "next_action", "He will call so the replacement arrives before opening." ]],
    },
    {
      lines: [["WOMAN", `The printed menu for the ${s} cafe still shows last month's lunch price.`], ["MAN", `I'll update the file and print new copies after ${c.time}.`], ["WOMAN", `Great. Please leave them at the counter for ${c.person} before the lunch service.`]],
      qa: [["What needs to be corrected?", `The lunch price on the ${s} cafe menu`, [`The cafe's opening date`, `The name of the chef`, `The counter's location`], "detail", "explicit_information", "The woman notes an outdated lunch price."], ["What will the man do?", `Update and reprint the ${s} menu`, [`Call the supplier about lunch`, `Change the cafe opening hours`, `Repair the counter printer`], "next_action", "next_action", "He says he will update the file and print new menus."], [`Where should the copies be left for ${c.person}?`, `At the ${s} cafe counter`, [`In the print room`, `At the loading dock`, `In the conference hall`], "detail", "location", "The woman asks him to leave them at the counter." ]],
    },
  ], s);
}

export function extraTalkScenarios(c) {
  const s = c.site;
  return contextualizeScenarios([
    { type: "announcement", text: `Guests at ${s} Hotel, the airport shuttle will leave from the east entrance at ${c.time} today. The usual pickup area is closed for paving. Please show your room key to the driver and allow five extra minutes to reach the temporary stop.`,
      qa: [["Why has the shuttle pickup point changed?", `Paving is taking place at ${s}`, [`The airport is closed`, `The hotel is changing its check-in time`, `The shuttle has been canceled`], "detail", "explicit_information", "The usual pickup area is closed for paving."], ["Where should guests board?", `At the east entrance of ${s}`, [`At the main lobby desk`, `Outside the airport terminal`, `At the parking garage`], "detail", "location", "The announcement names the east entrance."], ["What should guests show the driver?", `Their ${s} room key`, [`A printed boarding pass`, `A parking permit`, `A restaurant receipt`], "next_action", "next_action", "Guests are told to show their room key."]],
    },
    { type: "announcement", text: `Attention shoppers at ${s}. Our store will close at ${c.time} on ${c.day} for a staff training session. Online orders can still be placed, and collection will resume the following morning. Please bring any items you wish to purchase to a checkout counter now.`,
      qa: [["Why is the store closing early?", `For staff training at ${s}`, [`For a stock delivery`, `For a building repair`, `For a public holiday`], "detail", "explicit_information", "The announcement says staff training is the reason."], ["What can customers still do during the closure?", `Place online orders with ${s}`, [`Collect purchases at the counter`, `Use the in-store checkout`, `Attend a training course`], "detail", "explicit_information", "Online orders remain available."], ["What should shoppers do now?", `Take their purchases to a checkout counter`, [`Return all items to shelves`, `Call ${c.person} about a refund`, `Wait until the following morning`], "next_action", "next_action", "Shoppers are asked to finish purchasing before closing."]],
    },
    { type: "voicemail", text: `Hello, this is ${c.person} from ${s} Appliance Service. The replacement part for your refrigerator arrived this morning. Our technician can visit on ${c.day} after ${c.time}. Please call us by noon tomorrow to confirm the appointment or request another time.`,
      qa: [["Why is the speaker calling?", `A replacement part has arrived at ${s}`, [`A refrigerator was delivered to the wrong address`, `The service center has moved`, `A repair invoice is overdue`], "purpose", "purpose", "The voicemail says the part has arrived and offers a visit."], ["When can a technician visit?", `On ${c.day} after ${c.time}`, [`Tomorrow before noon`, `This evening before closing`, `The following month`], "detail", "explicit_information", "The speaker gives the available day and time."], ["What should the listener do by noon tomorrow?", `Confirm or change the ${s} appointment`, [`Collect the refrigerator`, `Pay for a new appliance`, `Send a warranty document`], "next_action", "next_action", "The speaker asks for a call to confirm or reschedule." ]],
    },
    { type: "tour_information", text: `Welcome to the ${s} museum's new photography exhibition. This guided tour begins in the west gallery and finishes at the ground-floor cafe. Please keep your admission ticket, as the guide will check it before entering the special display area. Photography without a flash is permitted.`,
      qa: [["Where does the tour begin?", `In the west gallery at ${s}`, [`At the ground-floor cafe`, `At the museum shop`, `Outside the east entrance`], "detail", "location", "The guide says the tour starts in the west gallery."], ["Why should visitors keep their tickets?", `They will be checked before a special display at ${s}`, [`They are needed to order lunch`, `They must be returned at the exit`, `They include a parking code`], "detail", "explicit_information", "Tickets are checked before the special display."], ["What kind of photography is allowed?", `Photography without flash at ${s}`, [`Flash photography everywhere`, `Photography only in the cafe`, `No photography at all`], "detail", "explicit_information", "The guide permits photos without flash." ]],
    },
    { type: "instructions", text: `Before entering the ${s} workshop, put on safety glasses and sign the attendance sheet beside the door. ${c.person} will demonstrate the new cutting machine at ${c.time}. Please do not operate it until the demonstration is finished, and report any loose tools to the supervisor.`,
      qa: [["What should listeners do before entering?", `Put on safety glasses at ${s}`, [`Start the cutting machine`, `Collect a visitor badge`, `Move the attendance sheet`], "next_action", "next_action", "The first instruction is to wear safety glasses."], [`What will ${c.person} do?`, `Demonstrate the cutting machine at ${s}`, [`Repair the workshop door`, `Lead a museum tour`, `Inspect the attendance sheet`], "detail", "explicit_information", "The named colleague will demonstrate the machine."], ["When may listeners operate the machine?", `After the ${s} demonstration ends`, [`Before signing in`, `As soon as they enter`, `Only after the supervisor leaves`], "inference", "implied_information", "The instructions prohibit use before the demonstration ends." ]],
    },
    { type: "meeting_update", text: `Welcome to the ${s} online product briefing. ${c.person} will present the new catalog first, followed by a question session. Please keep your microphones muted during the presentation and type questions into the chat. A recording and price list will be emailed to everyone after the meeting.`,
      qa: [["What is the main purpose of the talk?", `To introduce a ${s} online product briefing`, [`To announce a building closure`, `To confirm a shipment`, `To explain a staff parking rule`], "purpose", "purpose", "The speaker welcomes participants to a product briefing."], [`What will ${c.person} present?`, `The new ${s} catalog`, [`The annual budget`, `A travel policy`, `A repair estimate`], "detail", "explicit_information", "The named presenter will show the new catalog."], ["How should participants ask questions?", `Type them into the chat during the ${s} briefing`, [`Interrupt the presenter by microphone`, `Send a postal letter`, `Wait for a phone call next week`], "next_action", "next_action", "The speaker requests questions through the chat." ]],
    },
  ], s);
}
