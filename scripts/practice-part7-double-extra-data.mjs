export function extraDoubleScenarios(company, person, date) {
  return [
    () => {
      const title = `${company} Printing Service`;
      const ad = `${title} conference materials\nPrint color booklets for $4 each when ordering at least fifty copies. Standard production takes three business days after the final file is approved. Local delivery costs $20, while collection from our workshop is free. Files must be submitted as PDFs. Please request a proof if you need to check colors before production.`;
      const email = `To: ${title}\nSubject: Booklets for ${date}\n\nHello, we need eighty color booklets for a conference on ${date}. Our design team will send a PDF tomorrow morning. Could you make a proof before printing the full order? We can collect the finished booklets from your workshop, so delivery will not be necessary.\n\nRegards,\n${person}`;
      return { title, ad, email, qa: [
        ["What is the price per booklet for a qualifying order?", "$4", ["$20", "$50", "$80"], "detail", "explicit_information", "doc1", "The service charges four dollars per booklet for fifty or more."],
        ["How many booklets are needed?", "Eighty", ["Twenty", "Fifty", "Three"], "detail", "explicit_information", "doc2", "The email requests eighty booklets."],
        ["What does the sender request before the full run?", "A proof copy", ["A courier booking", "A new logo", "A printed invoice"], "detail", "explicit_information", "doc2", "The sender asks for a proof before the full order."],
        ["Why will the sender not pay a delivery fee?", "The order will be collected at the workshop", ["The order is below fifty copies", "The conference was canceled", "The file is not a PDF"], "cross_text", "information_synthesis", null, "Workshop collection is free, and the sender plans to collect."],
        ["What must the sender's team do before standard production can begin?", "Send and approve the final PDF", ["Pay the local delivery fee", "Collect the finished booklets", "Reserve a conference room"], "cross_text", "information_synthesis", null, "The sender will provide a PDF, and production begins only after final file approval."],
      ] };
    },
    () => {
      const title = `${company} Museum Events`;
      const ad = `${title} evening lecture\nA curator will discuss the new architecture exhibition at 6:30 P.M. on ${date}. Lecture tickets cost $18 and include entry to the exhibition from 5:00 P.M. The museum cafe closes at 6:00 P.M. and the lecture room has no food service. Seating is limited; tickets must be purchased online in advance.`;
      const email = `To: ${title}\nSubject: Lecture visit\n\nHello, I bought two tickets for the architecture lecture on ${date}. My guest and I plan to arrive around 5:30 P.M. to view the exhibition first. Is there enough time to buy coffee at the cafe before the lecture starts? Please also confirm where we should show our tickets.\n\nThank you,\n${person}`;
      return { title, ad, email, qa: [
        ["What does a lecture ticket include?", "Exhibition entry from 5:00 P.M.", ["Dinner at the cafe", "A guided city tour", "A printed architecture book"], "detail", "explicit_information", "doc1", "The listing includes exhibition entry from five o'clock."],
        ["How many tickets has the sender purchased?", "Two", ["One", "Three", "Eighteen"], "detail", "explicit_information", "doc2", "The sender bought two tickets."],
        ["What does the sender want to do before the lecture?", "View the exhibition", ["Meet the curator privately", "Buy additional tickets", "Attend a workshop"], "detail", "explicit_information", "doc2", "The email says the pair will view the exhibition first."],
        ["Can the guests visit the cafe at 5:30 P.M.?", "Yes, it closes at 6:00 P.M.", ["No, it closes at 5:00 P.M.", "No, food service is only in the lecture room", "Only after the lecture"], "cross_text", "information_synthesis", null, "Their planned arrival is before the cafe's six o'clock closing."],
        ["Why should the guests already have tickets?", "Advance online purchase is required", ["Only members can enter", "The exhibition is closed on the date", "Tickets are collected at the cafe"], "cross_text", "information_synthesis", null, "The event listing requires advance online purchase; the sender has bought tickets."],
      ] };
    },
    () => {
      const title = `${company} Hotel Conference`;
      const ad = `${title} meeting services\nOur conference rooms can be booked for a full day or a half day. A half-day booking includes four hours of room use, a projector, and wireless internet. Catering is available for an additional charge and must be ordered at least two days before the event. Parking is free for up to three registered organizers; other visitors pay the posted rate.`;
      const email = `To: ${title}\nSubject: Sales meeting on ${date}\n\nHello, please reserve a half-day conference room for our sales team on ${date}. We expect twelve participants and would like sandwiches delivered at noon. Two of us will arrive early to set up the presentation. Could you tell me what information you need to arrange the catering?\n\nBest,\n${person}`;
      return { title, ad, email, qa: [
        ["What does a half-day booking include?", "Four hours, a projector, and wireless internet", ["Sandwiches for twelve", "Free parking for all attendees", "A full day of room use"], "detail", "explicit_information", "doc1", "The listing names the four-hour period and included equipment."],
        ["How many participants are expected?", "Twelve", ["Two", "Three", "Four"], "detail", "explicit_information", "doc2", "The email expects twelve people."],
        ["What food does the sender request?", "Sandwiches at noon", ["Breakfast at nine", "Dinner after the meeting", "Coffee during setup"], "detail", "explicit_information", "doc2", "The sender asks for sandwiches delivered at noon."],
        ["Will catering be covered by the room rate?", "No, it has an additional charge", ["Yes, all meals are included", "Yes, but only for organizers", "Only if parking is paid"], "cross_text", "information_synthesis", null, "The service page states catering costs extra, and the email requests food."],
        ["What parking benefit could the two early arrivals receive?", "Free parking if registered as organizers", ["Free parking for all twelve participants", "A reserved loading space", "A free shuttle from the station"], "cross_text", "information_synthesis", null, "The hotel offers free parking for up to three registered organizers."],
      ] };
    },
    () => {
      const title = `${company} Parcel Locker`;
      const ad = `${title} collection lockers\nCollect online purchases at any of our twenty-four-hour lockers. After a parcel is delivered to a locker, a six-digit code is sent by text message. Parcels remain in a locker for four days; uncollected items are transferred to the central service desk. Large packages cannot be placed in lockers and are delivered directly to the service desk.`;
      const email = `To: ${title}\nSubject: Parcel pickup on ${date}\n\nHello, I received a text with a six-digit code for my small parcel this morning, but I will be away until ${date}. If the parcel has been moved by then, could I collect it from the service desk? Please tell me whether the same code will still identify my order.\n\nRegards,\n${person}`;
      return { title, ad, email, qa: [
        ["How is a locker code delivered?", "By text message", ["By postal letter", "In the package", "At the service desk only"], "detail", "explicit_information", "doc1", "The service sends a six-digit code by text."],
        ["What kind of parcel is the sender expecting?", "A small parcel", ["A large appliance", "A refrigerated package", "A set of furniture"], "detail", "explicit_information", "doc2", "The sender describes the parcel as small."],
        ["Why is the sender contacting the service?", "They may miss the locker collection period", ["They want a larger locker", "They received no code", "They need overnight delivery"], "purpose", "document_purpose", "doc2", "The sender will be away and asks about later pickup."],
        ["If the parcel is no longer in its locker when the sender returns, where should it be collected?", "The central service desk", ["The nearest hotel", "The original seller's office", "A refrigerated warehouse"], "cross_text", "information_synthesis", null, "The sender may return late, and the policy sends uncollected parcels to the service desk."],
        ["Can the sender collect the small parcel at any time of day while it remains in a locker?", "Yes, the lockers operate twenty-four hours", ["No, only on weekday mornings", "Only after calling the seller", "Only when the service desk is open"], "cross_text", "information_synthesis", null, "The lockers are available around the clock."],
      ] };
    },
    () => {
      const title = `${company} Garden Workshop`;
      const ad = `${title} weekend program\nOur two-hour container gardening workshop on ${date} costs $35 per person. Pots, soil, and seeds are included, and participants take their planted containers home. The class is held outdoors under a covered area, so it continues in light rain. Registration closes at noon two days before the class. Children under sixteen must attend with an adult.`;
      const email = `To: ${title}\nSubject: Workshop places\n\nHello, I would like to register myself and my fourteen-year-old daughter for the container gardening class on ${date}. We can bring our own gloves if needed. Does the fee cover the pots and seeds, and will the class go ahead if it rains lightly?\n\nThank you,\n${person}`;
      return { title, ad, email, qa: [
        ["What is included in the workshop fee?", "Pots, soil, and seeds", ["Transportation and lunch", "A large garden plot", "A printed textbook"], "detail", "explicit_information", "doc1", "The program lists pots, soil, and seeds as included."],
        ["Who does the sender want to register?", "The sender and a fourteen-year-old daughter", ["Only the daughter", "A group of sixteen children", "Two adult colleagues"], "detail", "explicit_information", "doc2", "The email requests places for an adult and a fourteen-year-old."],
        ["What weather condition concerns the sender?", "Light rain", ["Heavy snow", "Strong wind", "High temperatures"], "detail", "explicit_information", "doc2", "The sender asks whether the class continues in light rain."],
        ["Can the daughter attend with the sender?", "Yes, an adult will accompany her", ["No, children may never attend", "Only if she brings her own soil", "Only if she registers alone"], "cross_text", "information_synthesis", null, "The policy requires under-sixteen participants to attend with an adult."],
        ["What should the organizer tell the sender about light rain?", "The class will still take place", ["The class will automatically be canceled", "The location moves indoors", "The fee will be refunded"], "cross_text", "information_synthesis", null, "The covered outdoor area allows the class to continue in light rain."],
      ] };
    },
  ];
}
