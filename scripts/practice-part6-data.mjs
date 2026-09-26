const companies = ["Aster", "Bayview", "Clearwater", "Dunhill", "Easton", "Foxbridge", "Goldleaf", "Highland", "Ironwood", "Jasper", "Kestrel", "Longview", "Meadowbrook", "Newhaven", "Orchard", "Pinecrest", "Quarry", "Riverton", "Silverlake", "Tamarack"];
const keys = ["A", "B", "C", "D"];

function row(order, title, skill, subSkill, correct, wrong, explanationEn, explanationVi, index) {
  const answerIndex = (index + order) % 4;
  const values = [...wrong]; values.splice(answerIndex, 0, correct);
  return { key: `q${order}`, order, skill, subSkill, text: `Choose the best completion for blank (${order}) in “${title}.”`, difficulty: order === 4 ? "hard" : order === 1 ? "easy" : "medium",
    questionType: order === 4 ? "sentence_insertion" : "text_completion", passageKey: "document", status: "published",
    options: values.map((text, position) => ({ key: keys[position], text, correct: position === answerIndex })),
    explanationEn, explanationVi };
}

export function practicePart6Set(index) {
  const company = companies[Math.floor(index / 5)];
  const variant = index % 5;
  const date = `${["January", "March", "May", "July", "September"][variant]} ${8 + Math.floor(index / 5) % 18}`;
  const scenarios = [
    {
      title: `${company} Safety Workshop`, documentType: "email",
      content: `To: ${company} staff\nSubject: Safety workshop on ${date}\n\nOur office will (1) _____ a safety workshop on ${date} at the training center. The session includes a practical demonstration and a short discussion of emergency procedures. Seats are (2) _____ because the demonstration room is small. (3) _____, employees should register by the end of this week. (4) _____ A confirmation email with the room number will be sent on Monday.`,
      answers: [
        ["vocabulary", "contextual_vocabulary", "host", ["borrow", "repair", "divide"], "Host means organize an event, which fits a workshop.", "Host nghĩa là tổ chức một sự kiện, phù hợp với hội thảo."],
        ["grammar", "word_form", "limited", ["limiting", "limit", "limits"], "An adjective describing seats is needed after are.", "Cần tính từ mô tả số chỗ ngồi sau are."],
        ["cohesion", "connectors", "Therefore", ["Nevertheless", "In contrast", "Meanwhile"], "Limited seats explain why registration is needed soon.", "Số chỗ có hạn là lý do phải đăng ký sớm."],
        ["sentence_insertion", "sentence_fit", "Please use the staff portal to reserve a seat.", ["The cafeteria changed its menu last month.", "A delivery truck will arrive at the loading dock.", "The parking area was repainted last year."], "The sentence gives the registration method before mentioning a confirmation email.", "Câu này chỉ cách đăng ký trước khi nhắc đến email xác nhận."],
      ],
    },
    {
      title: `${company} Lobby Access Notice`, documentType: "notice",
      content: `${company} visitor notice\n\nThe main lobby will (1) _____ for repairs from ${date} through the following afternoon. Visitors should use the east entrance, where a receptionist will provide directions. Temporary signs have been (2) _____ along the walkway. (3) _____, all deliveries should be taken to the loading dock rather than the usual reception counter. (4) _____ Normal access will resume after the repairs are inspected.`,
      answers: [
        ["vocabulary", "contextual_vocabulary", "close", ["borrow", "calculate", "deliver"], "A lobby can close for repairs; the other verbs do not fit.", "Sảnh có thể đóng để sửa chữa; các động từ khác không phù hợp."],
        ["grammar", "word_form", "installed", ["installation", "install", "installing"], "Have been requires a past participle in the passive voice.", "Have been trong câu bị động cần quá khứ phân từ."],
        ["cohesion", "connectors", "In addition", ["However", "Otherwise", "Instead"], "The sentence adds a second instruction for deliveries.", "Câu này bổ sung hướng dẫn thứ hai dành cho hàng giao đến."],
        ["sentence_insertion", "sentence_fit", "Security staff will help visitors find the temporary entrance.", ["The annual budget was approved in June.", "The company sells office stationery online.", "Lunch orders must be submitted on Friday."], "The sentence continues the guidance about temporary access.", "Câu này tiếp nối hướng dẫn về lối vào tạm thời."],
      ],
    },
    {
      title: `${company} Expense Claim Memo`, documentType: "memo",
      content: `To: All ${company} employees\nSubject: Expense claims\n\nBeginning ${date}, employees must (1) _____ a receipt to each travel expense claim. Claims without supporting documents cannot be (2) _____ by the finance team. (3) _____, check that the date and amount on every receipt match the online form. (4) _____ The finance team will return incomplete claims and explain what needs to be corrected.`,
      answers: [
        ["vocabulary", "contextual_vocabulary", "attach", ["borrow", "announce", "divide"], "Attach a receipt means include it with a claim.", "Attach a receipt nghĩa là đính kèm hóa đơn vào yêu cầu."],
        ["grammar", "word_form", "processed", ["processing", "process", "processor"], "After cannot be, a past participle completes the passive verb.", "Sau cannot be cần quá khứ phân từ để tạo câu bị động."],
        ["cohesion", "connectors", "Before submitting", ["Despite submitting", "Instead of submitting", "After it is approved"], "The checks must happen before the claim is submitted.", "Việc kiểm tra cần diễn ra trước khi nộp yêu cầu."],
        ["sentence_insertion", "sentence_fit", "The online claim form is available on the staff portal.", ["A client tour begins at the museum on Sunday.", "The warehouse ordered new shelving yesterday.", "The cafeteria will serve soup next week."], "The sentence identifies where employees can find the form mentioned earlier.", "Câu này cho biết nơi tìm biểu mẫu được nhắc ở trên."],
      ],
    },
    {
      title: `${company} Equipment Delivery Update`, documentType: "email",
      content: `To: ${company} operations team\nSubject: Delivery update\n\nThe new display equipment has been (1) _____ until ${date} because heavy rain has slowed transport. Our carrier is (2) _____ the shipment and will send its latest location this afternoon. (3) _____, a loan unit can be used for demonstrations already scheduled this week. (4) _____ Please reply by 3:00 P.M. if your team needs the loan unit.`,
      answers: [
        ["vocabulary", "contextual_vocabulary", "delayed", ["expanded", "printed", "translated"], "Delayed means moved to a later delivery date.", "Delayed nghĩa là bị dời đến ngày giao muộn hơn."],
        ["grammar", "word_form", "tracking", ["track", "tracked", "tracker"], "Is tracking is the present continuous verb form for an action in progress.", "Is tracking là thì hiện tại tiếp diễn cho hành động đang diễn ra."],
        ["cohesion", "connectors", "In the meantime", ["On the contrary", "For example", "In summary"], "The loan unit is available during the wait for the delayed delivery.", "Thiết bị mượn được dùng trong lúc chờ hàng giao trễ."],
        ["sentence_insertion", "sentence_fit", "The loan unit is available at no extra charge.", ["The annual leave policy was revised last year.", "A new cafeteria opened across the street.", "The sales report includes several charts."], "The sentence adds a useful detail about the loan unit before requesting a reply.", "Câu này bổ sung thông tin về thiết bị mượn trước lời yêu cầu phản hồi."],
      ],
    },
    {
      title: `${company} Customer Feedback Survey`, documentType: "web_page",
      content: `${company} customer update\n\nWe are (1) _____ a short survey about our delivery service through ${date}. Responses will be kept (2) _____ and used only to improve delivery times. (3) _____, everyone who completes the survey will receive a discount code by email. (4) _____ A summary of the results will be published on this page next month.`,
      answers: [
        ["vocabulary", "contextual_vocabulary", "conducting", ["borrowing", "repairing", "dividing"], "Conducting a survey means carrying it out.", "Conducting a survey nghĩa là tiến hành khảo sát."],
        ["grammar", "word_form", "confidential", ["confidentially", "confidentiality", "confide"], "After kept, an adjective describes the status of the responses.", "Sau kept cần tính từ mô tả tình trạng bảo mật của câu trả lời."],
        ["cohesion", "connectors", "As a thank-you", ["In contrast", "Otherwise", "Despite that"], "The discount code is presented as a reward for participating.", "Mã giảm giá được đưa ra để cảm ơn người tham gia."],
        ["sentence_insertion", "sentence_fit", "A link to the survey is available at the top of this page.", ["The meeting room has new chairs.", "A supplier will collect empty boxes tomorrow.", "The annual budget was mailed to staff."], "The sentence explains how to access the survey before discussing the results.", "Câu này chỉ cách mở khảo sát trước phần nói về kết quả."],
      ],
    },
  ];
  const scenario = scenarios[variant];
  return { key: `p6-practice-${String(index + 1).padStart(3, "0")}`, toeicPart: 6, setType: "part6", title: scenario.title, status: "published",
    passages: [{ key: "document", position: 1, documentType: scenario.documentType, title: scenario.title, content: scenario.content }],
    questions: scenario.answers.map(([skill, subSkill, correct, wrong, explanationEn, explanationVi], rowIndex) => row(rowIndex + 1, scenario.title, skill, subSkill, correct, wrong, explanationEn, explanationVi, index)),
  };
}
