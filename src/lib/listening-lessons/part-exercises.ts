import type { IndependentLesson, IndependentQuestion } from "./independent";

export type PartExercise = IndependentLesson & { toeicPart: 1 | 2 | 3 | 4; imageUrl?: string; imageAltVi?: string; imageAltEn?: string };

type ChoiceRow = [titleVi: string, titleEn: string, correct: string, wrongOne: string, wrongTwo: string];

const partOneRows: ChoiceRow[] = [
  ["Làm việc với máy tính", "Working at a computer", "A person is typing at a desk.", "A person is painting a wall.", "The chairs are stacked outside."],
  ["Chăm sóc cây", "Watering a plant", "A person is watering a plant.", "A person is cutting down a tree.", "The plant is being carried away."],
  ["Đọc sách trong công viên", "Reading in the park", "A person is reading on a bench.", "Several people are crossing a bridge.", "The bench is being repaired."],
  ["Xếp thùng hàng", "Stacking boxes", "A worker is stacking boxes.", "A worker is washing a window.", "The boxes are floating in water."],
  ["Dắt xe đạp", "Walking a bicycle", "A person is walking beside a bicycle.", "A cyclist is riding up a hill.", "A bicycle is hanging from the ceiling."],
  ["Mang khay thức ăn", "Carrying a tray", "A server is carrying a tray.", "A server is cleaning the floor.", "The tables are being moved outdoors."],
  ["Lên xe buýt", "Boarding a bus", "A passenger is boarding a bus.", "A driver is fixing a bicycle.", "The bus is parked inside a garage."],
  ["Làm bánh mì", "Baking bread", "A baker is placing bread on a shelf.", "A baker is painting the shelves.", "The bread is being thrown away."],
  ["Bắt tay chào hỏi", "Shaking hands", "Two people are shaking hands.", "Two people are carrying a ladder.", "A meeting room is being painted."],
  ["Kiểm tra ô tô", "Inspecting a car", "A mechanic is inspecting a car.", "A mechanic is planting flowers.", "The car is being loaded onto a boat."],
];

const partTwoRows: [string, string, string, string, string, string][] = [
  ["Giờ họp", "Meeting time", "When does the meeting start?", "At half past two.", "In the conference room.", "Yes, I met her yesterday."],
  ["Người phụ trách", "Person in charge", "Who is leading the workshop?", "Ms. Chen from marketing.", "It begins on Friday.", "In the main hall."],
  ["Báo cáo đã gửi", "Sent report", "Did you send the report to Maya?", "Yes, I emailed it this morning.", "At the front desk.", "It costs twenty dollars."],
  ["Chọn đường đi", "Choosing a route", "How do we get to the museum?", "Take the blue bus from here.", "It closes at six.", "I bought two tickets."],
  ["Đổi lịch giao hàng", "Delivery schedule", "Why was the delivery delayed?", "The truck had a flat tire.", "It is on the second floor.", "Three large boxes."],
  ["Đặt bàn ăn", "Dinner reservation", "Would you like me to reserve a table?", "Yes, for four people, please.", "I ate there last week.", "At seven thirty."],
  ["Tìm chìa khóa", "Finding the keys", "Where did you leave the keys?", "On the kitchen counter.", "I need two copies.", "Yes, the door is open."],
  ["Hạn nộp hồ sơ", "Application deadline", "When is the application due?", "By next Wednesday.", "It is very detailed.", "The manager reviewed it."],
  ["Mượn ô", "Borrowing an umbrella", "Could I borrow your umbrella?", "Of course, it's by the door.", "It rained all night.", "The store opens at nine."],
  ["Chọn máy in", "Choosing a printer", "Which printer should we use?", "The one near the window.", "I printed ten pages.", "Because the ink is blue."],
];

type StoryRow = [titleVi: string, titleEn: string, transcript: string, prompt: string, correct: string, wrongOne: string, wrongTwo: string, explanationVi: string];

const partThreeRows: StoryRow[] = [
  ["Đổi địa điểm họp", "Changing the meeting room", "Woman: Is our meeting still in room twelve? Man: No, the projector there is broken. We have moved to room eighteen on the third floor. Woman: Thanks. I'll tell the rest of the team.", "Where will the meeting take place?", "Room eighteen", "Room twelve", "The lobby", "Cuộc họp được chuyển sang phòng 18."],
  ["Nhận hàng", "Picking up a package", "Man: A package arrived for you this morning. Woman: Great. Is it at my desk? Man: The receptionist is holding it because it needs a signature. Woman: I'll stop by the front desk after lunch.", "Where is the package now?", "At the front desk", "On the woman's desk", "In the mail truck", "Lễ tân đang giữ kiện hàng để chờ ký nhận."],
  ["Hẹn sửa máy", "Scheduling a repair", "Woman: The coffee machine stopped working again. Man: I called the repair company. A technician can come tomorrow at ten. Woman: Good. I'll put a note in the kitchen today.", "When will the technician arrive?", "Tomorrow at ten", "Today at ten", "Tomorrow at noon", "Kỹ thuật viên sẽ đến vào ngày mai lúc 10 giờ."],
  ["Vé xem hòa nhạc", "Concert tickets", "Man: Did you buy our concert tickets? Woman: Yes, but the Friday show was sold out. I booked seats for Saturday evening instead. Man: That works. Let's take the train there.", "When will they attend the concert?", "Saturday evening", "Friday evening", "Sunday morning", "Họ đã đặt vé cho tối thứ Bảy."],
  ["Đặt bữa trưa", "Ordering lunch", "Woman: Should we order lunch for the visitors? Man: Yes. Two of them asked for vegetarian meals. Woman: I'll call the cafe across the street and arrange delivery by noon.", "What kind of meals did two visitors request?", "Vegetarian meals", "Seafood meals", "Breakfast meals", "Hai vị khách yêu cầu bữa ăn chay."],
  ["Mượn thiết bị", "Borrowing equipment", "Man: Can I borrow the portable speaker for my presentation? Woman: It's being used this morning, but you can have it after two. Man: My presentation begins at three, so that is fine.", "When can the man borrow the speaker?", "After two", "Before noon", "After three", "Loa sẽ có thể mượn sau 2 giờ."],
  ["Báo hủy chuyến", "A canceled train", "Woman: The train to Lakeside has been canceled because of the storm. Man: Then we should take the bus. It leaves in twenty minutes from platform four. Woman: Let's hurry.", "How will they travel to Lakeside?", "By bus", "By train", "By taxi", "Họ quyết định đi xe buýt vì tàu bị hủy."],
  ["Thử sản phẩm", "Trying a product", "Man: Have you tested the new camera yet? Woman: I used it during yesterday's outdoor event. The pictures look sharp, but the battery runs out quickly. Man: I'll report that to the design team.", "What problem did the woman notice?", "Short battery life", "Blurry pictures", "A broken screen", "Người phụ nữ nói pin hết nhanh."],
  ["Chuẩn bị hội chợ", "Preparing for a fair", "Woman: Have the posters for the book fair arrived? Man: Yes, they're in a box by the entrance. Woman: Great. Could you put them up before the library opens at nine?", "What does the woman ask the man to do?", "Put up posters", "Move a bookcase", "Open the library", "Người phụ nữ nhờ người đàn ông treo áp phích."],
  ["Lên kế hoạch đi bộ", "Planning a walk", "Man: The park trail is closed for repairs this weekend. Woman: We could walk along the river instead. It is shorter, but there are plenty of places to sit. Man: Let's meet at the bridge at eight.", "Where will they walk?", "Along the river", "On the park trail", "Around the stadium", "Họ sẽ đi bộ dọc bờ sông."],
];

const partFourRows: StoryRow[] = [
  ["Thông báo ở thư viện", "Library announcement", "Attention, library visitors. The second floor reading room will close at four today for maintenance. Please return borrowed laptops to the service desk before then. The first floor study area will remain open until eight this evening.", "Which area closes at four?", "The second floor reading room", "The first floor study area", "The service desk", "Phòng đọc tầng hai đóng lúc 4 giờ."],
  ["Dự báo thời tiết", "Weather update", "Good morning. Expect light rain through the early afternoon, followed by clear skies. Temperatures will reach twenty degrees. If you are traveling tonight, roads should be dry by six o'clock.", "What is expected in the early afternoon?", "Light rain", "Strong winds", "Snow", "Dự báo có mưa nhẹ đến đầu giờ chiều."],
  ["Lịch xe đưa đón", "Shuttle schedule", "This is a reminder for conference guests. The free shuttle leaves the hotel every thirty minutes, beginning at seven thirty in the morning. The final return bus leaves the convention center at six in the evening. Please show your conference badge to the driver.", "How often does the shuttle leave the hotel?", "Every thirty minutes", "Every hour", "Only once a day", "Xe đưa đón rời khách sạn mỗi 30 phút."],
  ["Giới thiệu triển lãm", "Exhibition introduction", "Welcome to the city history exhibit. The photographs on your left show the old harbor. Upstairs, you can see maps from the nineteenth century. A short film begins in the theater at half past eleven.", "What is displayed upstairs?", "Old maps", "Photographs of the harbor", "A short film", "Tầng trên trưng bày các bản đồ cũ."],
  ["Thông báo nhà hàng", "Restaurant update", "Thank you for calling Green Table. This week, we are offering a new lunch menu from eleven until two. Reservations are recommended for groups of six or more. Our outdoor seating area is closed today because of the rain.", "Why is the outdoor seating area closed?", "Because of rain", "Because of repairs", "Because of a private event", "Khu ngồi ngoài trời đóng vì trời mưa."],
  ["Khai mạc hội thảo", "Workshop opening", "Welcome to the photography workshop. We will begin with a short demonstration in this room. After the break, please meet your group in the garden to practice taking pictures. Cameras can be borrowed from the desk near the entrance.", "Where will participants practice after the break?", "In the garden", "In this room", "Near the entrance", "Sau giờ nghỉ, mọi người sẽ thực hành trong vườn."],
  ["Cập nhật đơn hàng", "Order update", "Hello, this is a message from Northside Books. The travel guide you ordered has arrived at our store. We will hold it at the counter until Friday evening. Please bring the order number from your email when you come to collect it.", "What should the customer bring?", "The order number", "A travel photograph", "A membership card", "Khách hàng cần mang mã đơn hàng trong email."],
  ["Hướng dẫn tham quan", "Museum tour instructions", "Our museum tour starts in five minutes near the main staircase. Please keep your bags with you and turn off the flash on your cameras. The tour takes about forty minutes and ends in the sculpture gallery.", "Where does the tour end?", "In the sculpture gallery", "At the main staircase", "In the gift shop", "Chuyến tham quan kết thúc tại phòng điêu khắc."],
  ["Sự kiện cộng đồng", "Community event", "The neighborhood cleanup begins this Saturday at nine in the morning. Volunteers should meet outside the community center. Gloves and bags will be provided, but please bring your own water bottle. The event will finish before lunch.", "What should volunteers bring?", "A water bottle", "Gloves", "Trash bags", "Tình nguyện viên cần tự mang chai nước."],
  ["Lịch bay thay đổi", "Flight schedule change", "Passengers traveling on Flight 416 to Denver, please note that the departure gate has changed from B twelve to C seven. Boarding will begin at three fifteen, twenty minutes later than originally planned. Please check the information screens for further updates.", "What is the new departure gate?", "C seven", "B twelve", "A fifteen", "Cổng khởi hành mới là C7."],
];

function choices(correct: string, wrongOne: string, wrongTwo: string, index: number): [string, string, string] {
  if (index % 3 === 1) return [wrongOne, correct, wrongTwo];
  if (index % 3 === 2) return [wrongOne, wrongTwo, correct];
  return [correct, wrongOne, wrongTwo];
}

function question(prompt: string, options: [string, string, string], answerIndex: number, explanationVi: string): IndependentQuestion {
  return { prompt, options, answerIndex, explanationVi, explanationEn: `The correct answer is ${options[answerIndex].toLowerCase()}.` };
}

const partOne: PartExercise[] = partOneRows.map(([titleVi, titleEn, correct, wrongOne, wrongTwo], index) => {
  const options = choices(correct, wrongOne, wrongTwo, index);
  return {
  slug: `part-1-${String(index + 1).padStart(2, "0")}`, toeicPart: 1, titleVi, titleEn,
  descriptionVi: "Nhìn hình, nghe ba câu mô tả và chọn câu phù hợp.", descriptionEn: "Look at the illustration, listen to three descriptions, and choose the matching one.",
  transcript: `A. ${options[0]} B. ${options[1]} C. ${options[2]}`,
  audioUrl: `/listening-exercises/part-1-${String(index + 1).padStart(2, "0")}.mp3`,
  imageUrl: `/listening-exercises/part-1-${String(index + 1).padStart(2, "0")}.svg`,
  imageAltVi: `Hình minh họa: ${titleVi.toLowerCase()}.`, imageAltEn: `Illustration: ${titleEn.toLowerCase()}.`,
  questions: [question("Which statement matches the illustration?", options, index % 3, `Câu phù hợp: ${correct}`)],
};
});

const partTwo: PartExercise[] = partTwoRows.map(([titleVi, titleEn, prompt, correct, wrongOne, wrongTwo], index) => {
  const options = choices(correct, wrongOne, wrongTwo, index);
  return {
  slug: `part-2-${String(index + 1).padStart(2, "0")}`, toeicPart: 2, titleVi, titleEn,
  descriptionVi: "Nghe câu hỏi và chọn câu trả lời phù hợp.", descriptionEn: "Listen to the question and choose the best response.",
  transcript: `${prompt} A. ${options[0]} B. ${options[1]} C. ${options[2]}`,
  audioUrl: `/listening-exercises/part-2-${String(index + 1).padStart(2, "0")}.mp3`,
  questions: [question("Which response best answers the question?", options, index % 3, `Câu trả lời phù hợp: ${correct}`)],
};
});

function storyExercises(rows: StoryRow[], toeicPart: 3 | 4): PartExercise[] {
  return rows.map(([titleVi, titleEn, transcript, prompt, correct, wrongOne, wrongTwo, explanationVi], index) => ({
    slug: `part-${toeicPart}-${String(index + 1).padStart(2, "0")}`, toeicPart, titleVi, titleEn,
    descriptionVi: toeicPart === 3 ? "Nghe hội thoại và trả lời câu hỏi." : "Nghe bài nói ngắn và trả lời câu hỏi.",
    descriptionEn: toeicPart === 3 ? "Listen to the conversation and answer the question." : "Listen to the short talk and answer the question.",
    transcript, audioUrl: `/listening-exercises/part-${toeicPart}-${String(index + 1).padStart(2, "0")}.mp3`,
    questions: [question(prompt, choices(correct, wrongOne, wrongTwo, index), index % 3, explanationVi)],
  }));
}

export const partExercises: readonly PartExercise[] = [...partOne, ...partTwo, ...storyExercises(partThreeRows, 3), ...storyExercises(partFourRows, 4)];

export function getPartExercise(part: number, slug: string) {
  return partExercises.find(lesson => lesson.toeicPart === part && lesson.slug === slug);
}
