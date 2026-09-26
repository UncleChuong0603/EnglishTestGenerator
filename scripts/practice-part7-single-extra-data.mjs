export function extraSingleScenarios(company, date) {
  return [
    {
      title: `${company} Repair Appointment`, documentType: "email",
      content: `Subject: Service visit on ${date}\n\nDear Customer,\n\nA ${company} technician will inspect your washing machine between 9:00 A.M. and noon on ${date}. Please make sure someone over eighteen is home and that the technician can reach the machine. The inspection fee will be waived if the repair is covered by your warranty. If you need another appointment time, call our service desk before 5:00 P.M. tomorrow.\n\nCustomer Support`,
      qa: [
        ["Why was the email sent?", "To confirm a repair appointment", ["To advertise a new machine", "To request a customer review", "To announce a store opening"], "purpose", "document_purpose", "The email gives the time and requirements for a technician's visit."],
        ["What should the customer arrange?", "For an adult to be at home", ["For a delivery driver to collect the machine", "For a warranty form to be mailed", "For a store visit before noon"], "detail", "explicit_information", "The email requires someone over eighteen at home."],
        ["When might the inspection cost nothing?", "When the warranty covers the repair", ["When the technician arrives after noon", "When the customer buys a new machine", "When the appointment is changed"], "inference", "implied_information", "The inspection fee is waived for warranty repairs."],
      ],
    },
    {
      title: `${company} Book Fair Volunteers`, documentType: "notice",
      content: `${company} Community Book Fair\n\nThe annual book fair takes place on ${date} at the civic hall. Volunteers are needed to arrange donated books before the doors open and to help visitors locate categories during the event. Morning and afternoon shifts are available. Anyone who wants to help should complete the online form by Friday; the coordinator will then send a shift assignment. Volunteers will receive lunch, but they should arrange their own transportation.`,
      qa: [
        ["What is the notice mainly about?", "Finding volunteers for a book fair", ["Selling tickets to a concert", "Changing a library's opening hours", "Requesting new book donations"], "purpose", "document_purpose", "The notice describes volunteer roles and how to sign up."],
        ["What will volunteers receive?", "Lunch", ["Transportation", "Free concert tickets", "A cash payment"], "detail", "explicit_information", "The final sentence says lunch is provided."],
        ["What happens after someone submits the form?", "A coordinator assigns a shift", ["The fair doors open immediately", "Books are delivered to their home", "They choose a new venue"], "inference", "implied_information", "The coordinator sends a shift assignment after registration."],
      ],
    },
    {
      title: `${company} Restaurant Reservation`, documentType: "text_message",
      content: `${company} Restaurant: Your table for six is reserved for 7:30 P.M. on ${date}. Please arrive within fifteen minutes of the booking time. If a member of your party has a food allergy, reply to this message before noon so the kitchen can prepare. We can hold a table for no more than fifteen minutes when guests are late. Reply CANCEL if your plans have changed.`,
      qa: [
        ["Why did the restaurant send the message?", "To confirm a table reservation", ["To advertise a new lunch menu", "To recruit kitchen staff", "To explain a payment dispute"], "purpose", "document_purpose", "The message confirms a table for six and provides arrival instructions."],
        ["What should a guest with an allergy do?", "Reply before noon", ["Arrive an hour early", "Order a different table", "Call after the meal"], "detail", "explicit_information", "The message asks guests to reply before noon about allergies."],
        ["What may happen if the group arrives twenty minutes late?", "The table may no longer be held", ["The kitchen will close for the day", "The booking moves to lunchtime", "The party must pay for six meals"], "inference", "implied_information", "The restaurant holds late bookings for at most fifteen minutes."],
      ],
    },
    {
      title: `${company} Equipment Auction`, documentType: "web_page",
      content: `${company} Surplus Equipment Auction\n\nBidding for office furniture and computer monitors opens on ${date} and closes three days later. Items can be inspected at our warehouse by appointment before bidding begins. Successful bidders must pay through the auction website within forty-eight hours. All items are sold as shown, and buyers are responsible for collecting their purchases. The warehouse cannot arrange delivery.`,
      qa: [
        ["What is the page about?", "An auction of used office equipment", ["A new furniture warranty", "A warehouse job opening", "A computer repair service"], "purpose", "document_purpose", "The page gives bidding and collection rules for an equipment auction."],
        ["How can a bidder inspect an item?", "By arranging a warehouse appointment", ["By requesting home delivery", "By paying before bidding opens", "By visiting any company branch"], "detail", "explicit_information", "Inspection at the warehouse requires an appointment."],
        ["What must winning bidders arrange themselves?", "Collection of their purchases", ["An auction website", "A product inspection report", "A payment deadline"], "inference", "implied_information", "Buyers must collect items because the warehouse offers no delivery."],
      ],
    },
    {
      title: `${company} Cycling Tour`, documentType: "email",
      content: `Subject: Your cycling tour on ${date}\n\nHello,\n\nThank you for booking the ${company} city cycling tour. Meet your guide at the riverside entrance to Central Park at 8:45 A.M. Bicycles and helmets are provided, but please bring a water bottle. The route includes several stops and lasts about two hours. If heavy rain is forecast, we will email you by 6:00 P.M. the previous evening with a new date.\n\nTour Team`,
      qa: [
        ["Why was the email sent?", "To provide instructions for a booked tour", ["To sell a bicycle", "To request a park permit", "To announce a new cycling route"], "purpose", "document_purpose", "The email tells a booked participant where and when to meet."],
        ["What should the participant bring?", "A water bottle", ["A bicycle", "A helmet", "A printed city map"], "detail", "explicit_information", "Bikes and helmets are provided, but participants bring water."],
        ["What might cause the tour date to change?", "A forecast of heavy rain", ["A shortage of helmets", "A late park opening", "A request for a longer route"], "inference", "implied_information", "The tour team may reschedule if heavy rain is forecast."],
      ],
    },
    {
      title: `${company} Online Order Collection`, documentType: "text_message",
      content: `${company}: Your online order will be ready for collection at the west-side service counter from ${date}. Show this message and a photo ID when you arrive. The counter closes at 7:00 P.M. on weekdays and 5:00 P.M. on Saturdays. We will hold your purchase for ten days. If someone else is collecting it, forward the pickup code and ask them to bring their own ID.`,
      qa: [
        ["Why was the message sent?", "To explain how to collect an online order", ["To announce a product recall", "To ask for a product review", "To offer home delivery"], "purpose", "document_purpose", "The message says the order is ready and gives collection instructions."],
        ["Where should the customer go?", "The west-side service counter", ["The main warehouse", "The east parking entrance", "The customer lounge"], "detail", "explicit_information", "The message specifies the west-side service counter."],
        ["What must another person bring to collect the order?", "Their own ID and the pickup code", ["Only the customer's ID", "A printed invoice and a receipt", "A vehicle registration document"], "inference", "implied_information", "An alternate collector needs the forwarded code and their own ID."],
      ],
    },
    {
      title: `${company} Staff Art Exhibition`, documentType: "announcement",
      content: `${company} Staff Exhibition\n\nThe lobby will display photographs and drawings created by employees from ${date} through the end of the month. Visitors can view the exhibition during normal building hours without a ticket. Short descriptions beside each work explain the artist's inspiration. A reception with the artists is planned for the first Thursday; please register online if you want to attend the reception because space is limited.`,
      qa: [
        ["What is the announcement about?", "An exhibition of employee artwork", ["A new photography course", "A change to lobby hours", "A ticketed museum opening"], "purpose", "document_purpose", "The announcement describes artwork displayed in the lobby."],
        ["What appears beside each work?", "A description of the artist's inspiration", ["A ticket price", "A list of building rules", "A visitor registration form"], "detail", "explicit_information", "Descriptions explain the artists' inspiration."],
        ["Who needs to register online?", "People attending the artists' reception", ["Everyone viewing the lobby display", "Employees entering the building", "Artists submitting a drawing"], "inference", "implied_information", "Registration is required for the limited-space reception."],
      ],
    },
    {
      title: `${company} Waste Collection Schedule`, documentType: "notice",
      content: `${company} Building Notice\n\nFrom ${date}, paper recycling will be collected on Tuesdays instead of Thursdays. Please place paper in the blue containers beside the loading area by 8:00 A.M. on collection day. Cardboard boxes should be flattened before they are placed in the containers. Glass and food waste collections are unaffected by this schedule change. Contact building management if a container becomes full before pickup.`,
      qa: [
        ["What change does the notice announce?", "A new day for paper recycling collection", ["A new building entrance", "The end of glass collection", "A charge for cardboard disposal"], "purpose", "document_purpose", "Paper collection moves from Thursday to Tuesday."],
        ["Where should paper be placed?", "In blue containers beside the loading area", ["At the main reception desk", "Inside the staff kitchen", "At the east parking gate"], "detail", "explicit_information", "The notice identifies the blue containers by the loading area."],
        ["What should staff do with cardboard boxes?", "Flatten them before disposal", ["Put them out on Thursdays", "Place them with food waste", "Take them to reception"], "inference", "implied_information", "The notice asks staff to flatten boxes before placing them in containers."],
      ],
    },
    {
      title: `${company} Language Course`, documentType: "web_page",
      content: `${company} Evening Language Course\n\nA beginner-level Spanish course starts on ${date} and meets twice a week for six weeks. Classes take place online, but participants may attend an optional conversation session at the learning center each Saturday. The course fee includes digital materials and access to recorded lessons. Registration closes five days before the first class. Learners who miss a live class can watch its recording afterward.`,
      qa: [
        ["What is the page mainly promoting?", "A beginner Spanish course", ["A new learning center building", "A recorded business conference", "An advanced writing exam"], "purpose", "document_purpose", "The page describes the course schedule, format, and fee."],
        ["What is included in the course fee?", "Digital materials and lesson recordings", ["Transportation to the center", "Printed textbooks and meals", "A personal computer"], "detail", "explicit_information", "The fee includes digital materials and recorded lessons."],
        ["What can a learner do after missing a live class?", "Watch the recording", ["Attend a free replacement course", "Extend registration by five days", "Request a printed transcript"], "inference", "implied_information", "Recordings are available to learners who miss a class."],
      ],
    },
    {
      title: `${company} Maintenance Visit`, documentType: "email",
      content: `Subject: Elevator inspection on ${date}\n\nDear Tenants,\n\nThe building's west elevator will be inspected on ${date} from 1:00 to 4:00 P.M. It will be unavailable during that period. The east elevator and stairwell will remain open. Deliveries requiring a large elevator should be scheduled for the following morning. Please let reception know in advance if you need help moving equipment while the west elevator is out of service.\n\nBuilding Management`,
      qa: [
        ["Why was the email sent?", "To announce a temporary elevator closure", ["To report a missing delivery", "To request a rent payment", "To advertise moving equipment"], "purpose", "document_purpose", "The email announces a scheduled inspection and temporary closure."],
        ["What remains available during the inspection?", "The east elevator and stairwell", ["Both elevators", "The west elevator only", "A large delivery lift"], "detail", "explicit_information", "The east elevator and stairs remain open."],
        ["When should a large delivery be arranged?", "The following morning", ["During the inspection", "Before the building opens", "After the next tenant meeting"], "inference", "implied_information", "The email asks tenants to schedule large-elevator deliveries for the following morning."],
      ],
    },
  ];
}
