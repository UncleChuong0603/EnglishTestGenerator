const item = (skill, subSkill, correct, wrong, explanationEn, explanationVi) =>
  [skill, subSkill, correct, wrong, explanationEn, explanationVi];

export function extraPart6Scenarios(company, date) {
  return [
    {
      title: `${company} Visitor Parking Guide`, documentType: "notice",
      content: `${company} visitor parking\n\nStarting ${date}, visitors should (1) _____ a parking space before coming to our office. Enter your vehicle number in the online form and show the confirmation code at the gate. Spaces near the main entrance are (2) _____ for visitors with limited mobility. (3) _____, other drivers should use the lower level. (4) _____ The reception desk can validate your ticket after your appointment.`,
      answers: [
        item("vocabulary", "contextual_vocabulary", "reserve", ["deliver", "repair", "measure"], "Reserve means book a space in advance.", "Reserve nghĩa là đặt trước chỗ đậu xe."),
        item("grammar", "word_form", "reserved", ["reserving", "reservation", "reserve"], "A past participle forms the passive phrase are reserved.", "Sau are cần quá khứ phân từ để tạo dạng bị động."),
        item("cohesion", "connectors", "For this reason", ["In contrast", "For example", "In summary"], "The limited allocation explains why other drivers must park elsewhere.", "Số chỗ dành riêng là lý do những người khác phải đậu ở tầng dưới."),
        item("sentence_insertion", "sentence_fit", "Keep the parking ticket with you during your visit.", ["The finance team approved a new budget.", "The cafeteria serves soup on Fridays.", "A shipment of chairs arrived yesterday."], "The next sentence explains what to do with the ticket.", "Câu tiếp theo hướng dẫn cách xác nhận vé đậu xe."),
      ],
    },
    {
      title: `${company} Software Update Memo`, documentType: "memo",
      content: `To: ${company} staff\nSubject: Customer database update\n\nThe customer database will be (1) _____ on ${date} between 6:00 and 8:00 P.M. Please save your work and sign out before the update begins. The technical team has (2) _____ a backup of all current records. (3) _____, no information should be lost during the update. (4) _____ If you see an error after signing in again, contact the help desk.`,
      answers: [
        item("vocabulary", "contextual_vocabulary", "upgraded", ["returned", "borrowed", "mailed"], "Upgraded describes the planned improvement to the database.", "Upgraded diễn tả việc nâng cấp cơ sở dữ liệu."),
        item("grammar", "tense", "created", ["create", "creating", "creation"], "Has created is the present perfect form.", "Has created là cấu trúc thì hiện tại hoàn thành."),
        item("cohesion", "connectors", "Therefore", ["Nevertheless", "Similarly", "Meanwhile"], "The backup supports the expectation that records will remain safe.", "Bản sao lưu là lý do dữ liệu dự kiến sẽ được giữ an toàn."),
        item("sentence_insertion", "sentence_fit", "The system should be available again after 8:00 P.M.", ["The sales team will visit a client next month.", "The office printer needs more paper.", "A delivery driver called this morning."], "The sentence gives the expected end of the update before discussing sign-in.", "Câu này cho biết khi nào hệ thống hoạt động lại trước hướng dẫn đăng nhập."),
      ],
    },
    {
      title: `${company} Returned Goods Policy`, documentType: "web_page",
      content: `${company} returns\n\nCustomers may (1) _____ unused goods within thirty days of delivery. Complete the return form online and include the order number inside the package. The original packaging is (2) _____ but not required. (3) _____, items with missing parts cannot be accepted. (4) _____ Once the package reaches our warehouse, a refund will be issued to the original payment method.`,
      answers: [
        item("vocabulary", "contextual_vocabulary", "return", ["borrow", "announce", "assemble"], "Return means send purchased goods back to the seller.", "Return nghĩa là gửi lại hàng đã mua cho người bán."),
        item("grammar", "word_form", "preferred", ["prefer", "preference", "preferably"], "An adjective is needed after is to describe the packaging.", "Sau is cần tính từ để mô tả bao bì."),
        item("cohesion", "connectors", "However", ["Consequently", "For instance", "Likewise"], "The sentence introduces a restriction after a flexible packaging rule.", "Câu này đưa ra giới hạn sau quy định linh hoạt về bao bì."),
        item("sentence_insertion", "sentence_fit", "Use the prepaid label supplied with the online form.", ["The company picnic is scheduled for Saturday.", "A technician repaired the copier.", "The new catalog contains eighty pages."], "The sentence adds a shipping instruction before the refund process.", "Câu này bổ sung hướng dẫn gửi hàng trước khi nói đến hoàn tiền."),
      ],
    },
    {
      title: `${company} Volunteer Day Invitation`, documentType: "email",
      content: `To: ${company} employees\nSubject: Community volunteer day\n\nWe will (1) _____ a community garden on ${date} and welcome employees who would like to help. Gloves and basic tools will be provided at the site. Participation is (2) _____, and supervisors will arrange schedules for those who register. (3) _____, please complete the online sign-up form by Friday. (4) _____ The garden coordinator will send final instructions by email next week.`,
      answers: [
        item("vocabulary", "contextual_vocabulary", "restore", ["invoice", "postpone", "translate"], "Restore means improve the condition of the garden.", "Restore nghĩa là khôi phục và cải thiện khu vườn."),
        item("grammar", "word_form", "voluntary", ["volunteer", "voluntarily", "volunteering"], "An adjective after is describes participation.", "Sau is cần tính từ mô tả việc tham gia."),
        item("cohesion", "connectors", "If you wish to join", ["Although the garden is closed", "In comparison", "As a result of the tools"], "The condition identifies who should submit the form.", "Mệnh đề điều kiện cho biết ai cần điền biểu mẫu."),
        item("sentence_insertion", "sentence_fit", "Please indicate whether you need transportation to the site.", ["The quarterly sales figures were published.", "A new printer was delivered to accounting.", "The restaurant has changed its lunch menu."], "The sentence adds a detail to the registration instructions.", "Câu này bổ sung thông tin cần khai khi đăng ký."),
      ],
    },
    {
      title: `${company} Product Demonstration Update`, documentType: "email",
      content: `To: Registered guests\nSubject: ${company} demonstration on ${date}\n\nThank you for (1) _____ for our new product demonstration. The presentation will now begin at 2:00 P.M. because the speaker's train was delayed. Your original registration is still (2) _____. (3) _____, there is no need to sign up again. (4) _____ Please arrive ten minutes early to collect your visitor badge.`,
      answers: [
        item("vocabulary", "contextual_vocabulary", "registering", ["shipping", "repairing", "borrowing"], "Registering means signing up for the demonstration.", "Registering nghĩa là đăng ký tham dự buổi giới thiệu."),
        item("grammar", "word_form", "valid", ["validate", "validity", "validly"], "An adjective is needed after is still.", "Sau is still cần tính từ mô tả tình trạng đăng ký."),
        item("cohesion", "connectors", "Therefore", ["Nevertheless", "Otherwise", "Meanwhile"], "Because the registration remains valid, guests do not need to repeat it.", "Vì đăng ký vẫn còn hiệu lực nên khách không cần đăng ký lại."),
        item("sentence_insertion", "sentence_fit", "The venue and meeting room have not changed.", ["The company has ordered a new delivery van.", "Lunch is available at a nearby restaurant.", "The annual budget was approved last week."], "The sentence clarifies what remains unchanged before the arrival instruction.", "Câu này làm rõ thông tin không thay đổi trước hướng dẫn đến nơi."),
      ],
    },
    {
      title: `${company} Invoice Reminder`, documentType: "email",
      content: `To: Accounts payable\nSubject: ${company} invoice\n\nOur records show that payment for the equipment delivered on ${date} is still (1) _____. A copy of the invoice is attached for your reference. Please (2) _____ the amount and bank details before sending payment. (3) _____ you have already paid, please send us the transaction number so we can update our records. (4) _____ We appreciate your help in resolving this matter.`,
      answers: [
        item("vocabulary", "contextual_vocabulary", "outstanding", ["fragile", "temporary", "portable"], "Outstanding means an amount remains unpaid.", "Outstanding nghĩa là khoản tiền vẫn chưa được thanh toán."),
        item("grammar", "tense", "verify", ["verified", "verifying", "verification"], "Please is followed by the base form of the verb.", "Sau please dùng động từ nguyên mẫu không to."),
        item("cohesion", "connectors", "If", ["Unless", "Whereas", "Until"], "The sentence gives an instruction under a possible condition.", "Câu đưa ra hướng dẫn khi một điều kiện có thể xảy ra."),
        item("sentence_insertion", "sentence_fit", "If the invoice number is unclear, contact our billing team.", ["The cafeteria will serve lunch at noon.", "The new office has a larger meeting room.", "A courier collected the samples yesterday."], "The sentence adds invoice-related guidance before the closing thanks.", "Câu bổ sung hướng dẫn về hóa đơn trước lời cảm ơn."),
      ],
    },
    {
      title: `${company} Training Room Change`, documentType: "notice",
      content: `${company} training update\n\nThe customer service course on ${date} has been (1) _____ to Room 204 because the original room is being painted. The course will begin at the usual time. Signs will be (2) _____ near the main entrance to direct attendees. (3) _____, trainers should bring their own laptops as previously advised. (4) _____ Please tell the training team if you need assistance finding the new room.`,
      answers: [
        item("vocabulary", "contextual_vocabulary", "moved", ["borrowed", "translated", "counted"], "Moved means the class will take place in another room.", "Moved nghĩa là lớp học được chuyển sang phòng khác."),
        item("grammar", "word_form", "posted", ["posting", "post", "postage"], "Will be posted is a passive construction.", "Will be posted là cấu trúc bị động."),
        item("cohesion", "connectors", "As a reminder", ["In contrast", "Nevertheless", "As a result"], "The laptop instruction repeats earlier guidance.", "Hướng dẫn mang laptop nhắc lại thông tin đã nêu trước đó."),
        item("sentence_insertion", "sentence_fit", "The new room is on the second floor beside the elevators.", ["The company ordered additional uniforms.", "The printer paper arrived this morning.", "A customer survey will begin next month."], "The sentence gives directions to the new room before offering help.", "Câu chỉ vị trí phòng mới trước khi đề nghị hỗ trợ."),
      ],
    },
    {
      title: `${company} Shipment Status`, documentType: "email",
      content: `To: Purchasing team\nSubject: Order shipped on ${date}\n\nYour replacement parts left our warehouse on ${date} and are (1) _____ to arrive within three business days. A tracking link was (2) _____ to your email address this morning. (3) _____ the link does not work, reply to this message and we will send a new one. (4) _____ Please check the contents when the package arrives and report any missing items within two days.`,
      answers: [
        item("vocabulary", "contextual_vocabulary", "expected", ["borrowed", "painted", "repaired"], "Expected to arrive states the estimated delivery time.", "Expected to arrive cho biết thời điểm giao hàng dự kiến."),
        item("grammar", "word_form", "sent", ["sending", "send", "sender"], "Was sent is the past passive form.", "Was sent là dạng bị động ở quá khứ."),
        item("cohesion", "connectors", "If", ["Unless", "Whereas", "Despite"], "The sentence explains what to do if the link fails.", "Câu hướng dẫn xử lý nếu đường dẫn không hoạt động."),
        item("sentence_insertion", "sentence_fit", "The package will require a signature at delivery.", ["The annual meeting has been postponed.", "The cafeteria serves breakfast.", "A new receptionist starts next week."], "The sentence adds a delivery condition before the arrival instruction.", "Câu bổ sung điều kiện giao hàng trước hướng dẫn khi nhận kiện."),
      ],
    },
    {
      title: `${company} Office Supply Requests`, documentType: "memo",
      content: `To: All departments\nSubject: Monthly supply requests\n\nPlease (1) _____ your office supply requests through the new online form by ${date}. The purchasing team will combine orders from all departments to reduce shipping costs. Requests received after the deadline may be (2) _____ until the following month. (3) _____, check your team's current stock before submitting a form. (4) _____ Contact purchasing if you cannot access the form.`,
      answers: [
        item("vocabulary", "contextual_vocabulary", "submit", ["repair", "paint", "borrow"], "Submit means send a request for processing.", "Submit nghĩa là gửi yêu cầu để được xử lý."),
        item("grammar", "word_form", "delayed", ["delay", "delaying", "delayable"], "May be delayed is a passive modal construction.", "May be delayed là cấu trúc bị động với động từ khuyết thiếu."),
        item("cohesion", "connectors", "Before ordering", ["After delivery", "In contrast", "Nevertheless"], "Checking stock should happen before an order is placed.", "Việc kiểm tra tồn kho cần diễn ra trước khi đặt hàng."),
        item("sentence_insertion", "sentence_fit", "The form is available on the staff portal under Purchasing.", ["The meeting room was repainted last year.", "A client tour begins tomorrow.", "The company received an award in June."], "The sentence tells staff where to find the form before offering access help.", "Câu cho biết nơi tìm biểu mẫu trước hướng dẫn hỗ trợ truy cập."),
      ],
    },
    {
      title: `${company} Hotel Booking Confirmation`, documentType: "email",
      content: `Dear Guest,\n\nYour reservation at ${company} Hotel for ${date} has been (1) _____. Check-in begins at 3:00 P.M., and our front desk is open all night. Please bring a photo ID and the card used to make the booking. Breakfast is (2) _____ in your room rate. (3) _____, there is no additional charge for the morning meal. (4) _____ We look forward to welcoming you.`,
      answers: [
        item("vocabulary", "contextual_vocabulary", "confirmed", ["translated", "borrowed", "repaired"], "Confirmed means the hotel has accepted the booking.", "Confirmed nghĩa là khách sạn đã xác nhận đặt phòng."),
        item("grammar", "word_form", "included", ["including", "include", "inclusion"], "Is included is the passive form describing the room rate.", "Is included là dạng bị động mô tả giá phòng."),
        item("cohesion", "connectors", "Therefore", ["However", "Meanwhile", "For example"], "Because breakfast is included, no separate fee is charged.", "Vì bữa sáng đã gồm trong giá nên không thu thêm phí."),
        item("sentence_insertion", "sentence_fit", "If you need to change your arrival time, call the front desk.", ["The hotel purchased a new delivery truck.", "Our annual report was printed yesterday.", "The restaurant next door sells office chairs."], "The sentence adds a useful booking instruction before the closing greeting.", "Câu bổ sung hướng dẫn về đặt phòng trước lời chào kết."),
      ],
    },
    {
      title: `${company} Conference Registration`, documentType: "web_page",
      content: `${company} business conference\n\nRegistration for the conference on ${date} will (1) _____ at 5:00 P.M. this Friday. Attendees can choose from three workshops when completing the online form. Seats in each workshop are (2) _____, so early registration is recommended. (3) _____ your preferred workshop is full, you may join its waiting list. (4) _____ A confirmation message will be sent after your choices are saved.`,
      answers: [
        item("vocabulary", "contextual_vocabulary", "close", ["borrow", "ship", "repair"], "Close means the registration period ends.", "Close nghĩa là thời hạn đăng ký kết thúc."),
        item("grammar", "word_form", "limited", ["limit", "limiting", "limits"], "An adjective describes the available seats after are.", "Sau are cần tính từ mô tả số chỗ còn lại."),
        item("cohesion", "connectors", "If", ["Unless", "Whereas", "Despite"], "The sentence gives an option if a workshop has no remaining seats.", "Câu đưa ra lựa chọn nếu buổi học đã hết chỗ."),
        item("sentence_insertion", "sentence_fit", "You can review your selections before submitting the form.", ["The office lift was repaired last week.", "A courier will arrive at noon.", "The restaurant ordered new chairs."], "The sentence explains a step in the registration process.", "Câu giải thích một bước trong quá trình đăng ký."),
      ],
    },
    {
      title: `${company} Product Safety Notice`, documentType: "notice",
      content: `${company} product notice\n\nWe are (1) _____ a small number of desk lamps sold before ${date} because their power cords may overheat. Customers should stop using the affected model and check the serial number printed underneath it. A replacement cord will be (2) _____ to affected customers. (3) _____, no proof of purchase is needed for this service. (4) _____ Our service team will explain how to return the old cord safely.`,
      answers: [
        item("vocabulary", "contextual_vocabulary", "recalling", ["decorating", "renting", "translating"], "Recalling means asking customers to return a product because of a safety issue.", "Recalling nghĩa là thu hồi sản phẩm do vấn đề an toàn."),
        item("grammar", "word_form", "available", ["availability", "availably", "avail"], "Available is an adjective describing the replacement cord.", "Available là tính từ mô tả việc cung cấp dây thay thế."),
        item("cohesion", "connectors", "Furthermore", ["Nevertheless", "Instead", "Otherwise"], "The sentence adds another customer-friendly condition.", "Câu bổ sung một điều kiện thuận tiện nữa cho khách hàng."),
        item("sentence_insertion", "sentence_fit", "Enter the serial number on our website to request a replacement.", ["The marketing team has prepared a new brochure.", "The building lobby closes at six.", "Employees can book annual leave online."], "The sentence tells customers how to begin the replacement process.", "Câu hướng dẫn khách bắt đầu quy trình thay thế."),
      ],
    },
    {
      title: `${company} Newsletter Subscription`, documentType: "web_page",
      content: `${company} monthly newsletter\n\nSubscribe to (1) _____ updates about local business events and training opportunities. The newsletter is sent on the first Monday of each month. You may change your email preferences (2) _____ through your account page. (3) _____, a link to unsubscribe appears at the bottom of every message. (4) _____ Your first issue will arrive next month.`,
      answers: [
        item("vocabulary", "contextual_vocabulary", "receive", ["repair", "borrow", "deliver"], "Receive means get updates sent to you.", "Receive nghĩa là nhận các thông tin được gửi tới."),
        item("grammar", "word_form", "easily", ["easy", "ease", "easier"], "An adverb modifies the verb change.", "Trạng từ bổ nghĩa cho động từ change."),
        item("cohesion", "connectors", "In addition", ["However", "Otherwise", "As a result"], "The sentence adds another way to control email preferences.", "Câu bổ sung một cách khác để quản lý email."),
        item("sentence_insertion", "sentence_fit", "Check your inbox for a message confirming your subscription.", ["The office furniture was delivered yesterday.", "A new bus stop opened near the station.", "The warehouse ordered extra boxes."], "The sentence gives the next step after signing up.", "Câu hướng dẫn bước tiếp theo sau khi đăng ký."),
      ],
    },
    {
      title: `${company} New Branch Announcement`, documentType: "announcement",
      content: `${company} is pleased to (1) _____ a new branch on ${date}. The location is two blocks from the central train station and has a customer service desk on the ground floor. Staff from our existing branch will be (2) _____ there during the first week. (3) _____, visitors can expect the same services at both locations. (4) _____ Regular opening hours will begin the following Monday.`,
      answers: [
        item("vocabulary", "contextual_vocabulary", "open", ["borrow", "print", "repair"], "Open a branch means begin operating at a new location.", "Open a branch nghĩa là bắt đầu hoạt động ở địa điểm mới."),
        item("grammar", "word_form", "available", ["availability", "availably", "avail"], "An adjective follows will be to describe staff.", "Sau will be cần tính từ mô tả nhân viên."),
        item("cohesion", "connectors", "As a result", ["On the contrary", "Nevertheless", "For example"], "Experienced staff support continuity of service at the new branch.", "Nhân viên có kinh nghiệm giúp duy trì dịch vụ ở chi nhánh mới."),
        item("sentence_insertion", "sentence_fit", "An opening event will take place on the first Saturday.", ["The finance team changed its software.", "A delivery truck needs new tires.", "The cafeteria serves soup today."], "The sentence adds an opening-week detail before regular hours begin.", "Câu bổ sung hoạt động tuần khai trương trước giờ mở cửa thường lệ."),
      ],
    },
    {
      title: `${company} Catering Change Request`, documentType: "email",
      content: `To: Catering team\nSubject: Lunch order for ${date}\n\nPlease (1) _____ our lunch order for the staff meeting on ${date} from twenty meals to twenty-four. Two of the additional meals should be vegetarian. The room booking has already been (2) _____, so the delivery location is unchanged. (3) _____, we will need four extra sets of tableware. (4) _____ Let me know whether the revised order changes the total cost.`,
      answers: [
        item("vocabulary", "contextual_vocabulary", "increase", ["cancel", "translate", "borrow"], "Increase means raise the number of meals ordered.", "Increase nghĩa là tăng số suất ăn đã đặt."),
        item("grammar", "word_form", "confirmed", ["confirming", "confirmation", "confirm"], "Has been confirmed is the passive present perfect form.", "Has been confirmed là thì hiện tại hoàn thành bị động."),
        item("cohesion", "connectors", "In addition", ["However", "Otherwise", "In contrast"], "The request adds tableware to the extra meals.", "Yêu cầu bổ sung bộ dụng cụ ăn cho số suất tăng thêm."),
        item("sentence_insertion", "sentence_fit", "Please deliver the meals before 11:30 A.M.", ["The annual report has been printed.", "The service desk closes on Sundays.", "A new employee starts next week."], "The sentence gives another detail about the same catering order.", "Câu bổ sung thời gian giao cho cùng đơn đặt đồ ăn."),
      ],
    },
  ];
}
