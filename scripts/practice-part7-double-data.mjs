import { extraDoubleScenarios } from "./practice-part7-double-extra-data.mjs";

const companies = ["Aster", "Bayview", "Clearwater", "Dunhill", "Easton", "Foxbridge", "Goldleaf", "Highland", "Ironwood", "Jasper", "Kestrel", "Longview", "Meadowbrook", "Newhaven", "Orchard", "Pinecrest", "Quarry", "Riverton", "Silverlake", "Tamarack"];
const people = ["Maya Chen", "Daniel Reed", "Priya Shah", "Owen Garcia", "Elena Park", "Jonah Lee", "Carla Ruiz", "Felix Martin", "Iris Wong", "Ben Carter"];
const keys = ["A", "B", "C", "D"];

function question(index, order, text, correct, wrong, skill, subSkill, passageKey, evidence) {
  const answerIndex = (index + order) % 4;
  const values = [...wrong]; values.splice(answerIndex, 0, correct);
  return { key: `q${order}`, order, text, skill, subSkill, passageKey, difficulty: order === 5 ? "hard" : order < 3 ? "easy" : "medium",
    questionType: "reading_comprehension", status: "published",
    options: values.map((value, position) => ({ key: keys[position], text: value, correct: position === answerIndex })),
    explanationEn: evidence, explanationVi: `Hai tài liệu cung cấp chi tiết để xác định đáp án “${correct}”.` };
}

export function practiceDoubleSet(index) {
  const company = companies[Math.floor(index / 10)];
  const person = people[Math.floor(index / 10) % people.length];
  const day = 4 + Math.floor(index / 10);
  const date = `June ${day}`;
  const scene = index % 10;
  const scenarios = [
    () => {
      const title = `${company} Meeting Center`;
      const ad = `${title} business package\nOur half-day meeting room costs $180 and includes a projector, a conference phone, and on-site technical support. Up to twenty participants can use the room at the standard rate. Confirm reservations at least two business days ahead. Free cancellation is available until 3:00 P.M. on the previous business day.`;
      const email = `To: ${title}\nSubject: Planning meeting on ${date}\n\nHello, I am arranging a quarterly planning meeting for fourteen people on ${date}. Please hold the half-day room for us. Our finance officer will send payment authorization tomorrow. Could you confirm whether the entrance and meeting room are wheelchair accessible?\n\nRegards,\n${person}`;
      return { title, ad, email, qa: [
        ["What is included in the meeting package?", "A projector and conference phone", ["Breakfast for twenty people", "A printed annual report", "Transportation to the venue"], "detail", "explicit_information", "doc1", "The advertisement lists a projector and conference phone."],
        ["How many people will attend the meeting?", "Fourteen", ["Ten", "Twenty", "Twenty-four"], "detail", "explicit_information", "doc2", "The email says the meeting is for fourteen people."],
        [`Why did ${person} write the email?`, "To request a room and ask about accessibility", ["To cancel a room booking", "To apply for a technical job", "To order a conference phone"], "purpose", "document_purpose", "doc2", "The sender asks the center to hold a room and confirm accessibility."],
        ["What is suggested about payment authorization?", "It has not been sent yet", ["It was rejected yesterday", "It must be paid in cash", "It includes a cancellation fee"], "inference", "implied_information", "doc2", "The finance officer will send it tomorrow."],
        ["What should the center confirm before the booking is finalized?", "That the room is accessible and can be held by the deadline", ["That each attendee owns a projector", "That the meeting lasts two full days", "That breakfast is included in the standard rate"], "cross_text", "information_synthesis", null, "The advertisement sets a confirmation deadline; the email asks about accessibility."],
      ] };
    },
    () => {
      const title = `${company} Courier Service`;
      const ad = `${title} business delivery\nA local business shipment costs $48, including online tracking and a signature at delivery. Book a same-day pickup before 4:00 P.M. Packages must be sealed and labeled before the driver arrives. Perishable goods cannot be accepted. Tracking links are emailed to senders after collection.`;
      const email = `To: ${title}\nSubject: Prototype shipment for ${date}\n\nHello, our design team needs to send a sealed product prototype to a buyer on ${date}. The package will be labeled and ready for pickup at 2:00 P.M. Please confirm that a driver can come then and tell me when I should expect the tracking link.\n\nThanks,\n${person}`;
      return { title, ad, email, qa: [
        ["What is included in the courier price?", "Online tracking and a delivery signature", ["A refrigerated container", "Insurance for all items", "An overnight international flight"], "detail", "explicit_information", "doc1", "The service description lists tracking and signature confirmation."],
        ["When will the package be ready?", "At 2:00 P.M.", ["Before noon", "At 4:00 P.M.", "The following morning"], "detail", "explicit_information", "doc2", "The sender specifies a 2:00 P.M. pickup."],
        ["What is being shipped?", "A product prototype", ["Fresh food", "Office furniture", "Printed training manuals"], "detail", "explicit_information", "doc2", "The email identifies the package as a sealed product prototype."],
        ["Why is same-day pickup possible?", "The requested time is before the 4:00 P.M. cutoff", ["The buyer is paying an extra fee", "The package is perishable", "The driver is already at the office"], "cross_text", "information_synthesis", null, "The requested 2:00 P.M. time is before the advertised cutoff."],
        ["When will the sender receive the tracking link?", "After the courier collects the package", ["Before the package is labeled", "Only after the buyer signs", "When the order is canceled"], "cross_text", "information_synthesis", null, "The service page says links are emailed after collection."],
      ] };
    },
    () => {
      const title = `${company} Catering Studio`;
      const ad = `${title} workplace lunch menu\nLunch packages cost $22 per person and include a main course, fruit, and reusable tableware. Vegetarian meals can be prepared at the same price. Orders for groups of ten or more must be confirmed forty-eight hours ahead. Delivery within the city center is included in the price.`;
      const email = `To: ${title}\nSubject: Team lunch on ${date}\n\nHello, I am organizing lunch for thirty colleagues on ${date}. Four guests need vegetarian meals. Could you deliver everything to our downtown office by 11:30 A.M.? I will confirm the final headcount and payment details this afternoon.\n\nBest,\n${person}`;
      return { title, ad, email, qa: [
        ["What comes with each lunch package?", "Fruit and reusable tableware", ["A printed invitation", "A conference telephone", "A discount on parking"], "detail", "explicit_information", "doc1", "The menu lists fruit and reusable tableware."],
        ["How many vegetarian meals are needed?", "Four", ["Ten", "Twenty-two", "Thirty"], "detail", "explicit_information", "doc2", "The sender says four guests need vegetarian meals."],
        ["Where should lunch be delivered?", "To a downtown office", ["To the caterer's kitchen", "To a hotel restaurant", "To a suburban warehouse"], "detail", "explicit_information", "doc2", "The email requests delivery to the downtown office."],
        ["What still needs to be confirmed?", "The final headcount and payment details", ["The price of fruit", "Whether tableware is reusable", "The city center delivery zone"], "inference", "implied_information", "doc2", "The sender says those details will be confirmed this afternoon."],
        ["What should be checked against the catering policy?", "That the group order is confirmed at least forty-eight hours ahead", ["That vegetarian meals cost more", "That every guest orders a separate delivery", "That the office is outside the delivery area"], "cross_text", "information_synthesis", null, "The advertisement sets a forty-eight-hour confirmation rule for groups of ten or more."],
      ] };
    },
    () => {
      const title = `${company} Training Lab`;
      const ad = `${title} spreadsheet course\nThe one-day course costs $95 per participant. A printed handbook, lunch, and access to the practice files are included. Participants who complete the final exercise receive a digital certificate. Enrollment closes five business days before the course, and places are limited to sixteen.`;
      const email = `To: ${title}\nSubject: Course places for ${date}\n\nHello, I would like to enroll three analysts from our finance team in the spreadsheet course on ${date}. Please let me know whether there are still places and whether participants need to bring their own laptops. I will send the names once you confirm availability.\n\nRegards,\n${person}`;
      return { title, ad, email, qa: [
        ["What is included in the course fee?", "A printed handbook and lunch", ["Hotel accommodation", "A new laptop", "A yearly software license"], "detail", "explicit_information", "doc1", "The course listing names the handbook and lunch."],
        ["How many analysts does the sender want to enroll?", "Three", ["Five", "Sixteen", "Ninety-five"], "detail", "explicit_information", "doc2", "The email specifies three analysts."],
        ["What does the sender ask about equipment?", "Whether learners need their own laptops", ["Whether the projector is for sale", "Whether printers are available", "Whether the room has telephones"], "detail", "explicit_information", "doc2", "The sender asks if participants must bring laptops."],
        ["How can participants obtain a digital certificate?", "Complete the final exercise", ["Pay a second course fee", "Bring a personal printer", "Enroll six months early"], "detail", "explicit_information", "doc1", "The listing ties certificates to the final exercise."],
        ["What must be checked before confirming the three places?", "Availability before the enrollment deadline", ["Whether lunch is sold separately", "Whether the course lasts three days", "Whether the analysts work in sales"], "cross_text", "information_synthesis", null, "The listing has limited places and a deadline; the sender asks about availability."],
      ] };
    },
    () => {
      const title = `${company} Equipment Rental`;
      const ad = `${title} demonstration package\nRent a projector and portable screen for $240 per day. The price includes delivery, setup, and collection within the city. Requests should be placed at least three business days ahead. An extra adapter can be supplied if requested when the booking is confirmed.`;
      const email = `To: ${title}\nSubject: Product demonstration on ${date}\n\nHello, our team is planning a product demonstration on ${date} at our downtown office. Please reserve the projector and screen package. We will also need an adapter for a laptop. Our purchasing officer will send payment authorization tomorrow. Can you confirm setup before 9:00 A.M.?\n\nThank you,\n${person}`;
      return { title, ad, email, qa: [
        ["What is included in the rental price?", "Delivery, setup, and collection", ["A new laptop", "A printed product catalog", "A technician for the whole day"], "detail", "explicit_information", "doc1", "The advertisement explicitly includes those three services."],
        ["What additional item does the sender need?", "A laptop adapter", ["A conference telephone", "A second screen", "A replacement projector"], "detail", "explicit_information", "doc2", "The email requests an adapter for a laptop."],
        ["Where will the demonstration take place?", "At a downtown office", ["At the rental warehouse", "At a hotel lobby", "At the supplier's showroom"], "detail", "explicit_information", "doc2", "The sender gives the downtown office as the location."],
        ["What is suggested about payment authorization?", "It has not been sent yet", ["It has already been rejected", "It must be paid in cash", "It includes an adapter fee"], "inference", "implied_information", "doc2", "The purchasing officer will send it tomorrow."],
        ["What should the company confirm before accepting the booking?", "The setup time, adapter, and three-day notice", ["A free laptop and hotel room", "The customer's yearly membership", "A change to the product catalog"], "cross_text", "information_synthesis", null, "The rental policy sets a notice period and adapter condition; the email asks for early setup."],
      ] };
    },
  ];
  const { title, ad, email, qa } = [...scenarios, ...extraDoubleScenarios(company, person, date)][scene]();
  return { key: `p7-double-practice-${String(index + 1).padStart(3, "0")}`, toeicPart: 7, setType: "double", title, status: "published",
    passages: [{ key: "doc1", position: 1, documentType: "advertisement", title: `${title} offer`, content: ad }, { key: "doc2", position: 2, documentType: "email", title: `${title} inquiry`, content: email }],
    questions: qa.map(([text, correct, wrong, skill, subSkill, passageKey, evidence], rowIndex) => question(index, rowIndex + 1, text, correct, wrong, skill, subSkill, passageKey, evidence)),
  };
}
