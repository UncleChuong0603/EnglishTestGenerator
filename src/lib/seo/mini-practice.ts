export type MiniQuestion = {
  id: string;
  text: string;
  options: [string, string, string, string];
  answer: number;
  explanation: string;
  // Review records explain why every distractor fails in this exact sentence.
  distractors: [string, string, string, string];
  origin: "TOEICGYM_ORIGINAL";
};

function question(id: string, text: string, options: MiniQuestion["options"], answer: number, explanation: string, distractors: MiniQuestion["distractors"]): MiniQuestion {
  return { id, text, options, answer, explanation, distractors, origin: "TOEICGYM_ORIGINAL" };
}

// Written for this release; independent of ETS/IIG material and the learner question bank.
export const MINI_PRACTICE: Record<string, MiniQuestion[]> = {
  "cau-bi-dong-toeic-part-5": [
    question("passive-1", "The access cards _____ by the security officer before the visitors arrived yesterday.", ["had checked", "had been checked", "have been checking", "will check"], 1,
      "Had been checked diễn tả thẻ được kiểm tra trước một sự kiện quá khứ khác: the visitors arrived yesterday.", ["Had checked là chủ động; thẻ không tự kiểm tra thứ khác.", "Đúng: quá khứ hoàn thành bị động.", "Have been checking là chủ động hiện tại hoàn thành tiếp diễn, sai cả thể và mốc quá khứ.", "Will check là chủ động tương lai, không khớp yesterday."]),
    question("passive-2", "All expense claims must _____ by a department manager before payment.", ["approve", "approved", "be approved", "approving"], 2,
      "Must be approved là modal + be + V3: các yêu cầu hoàn phí phải được quản lý phê duyệt.", ["Approve làm claims thành người phê duyệt; câu cần bị động.", "Approved thiếu be sau must.", "Đúng: must be approved.", "Approving không theo trực tiếp must trong cấu trúc này."]),
    question("passive-3", "The damaged monitors _____ by the repair team last Thursday.", ["were replaced", "was replaced", "have replaced", "are replacing"], 0,
      "Were replaced là bị động quá khứ đơn, hòa hợp với monitors số nhiều và last Thursday.", ["Đúng: monitors were replaced.", "Was không hòa hợp với monitors số nhiều.", "Have replaced là chủ động; monitors không tự thay thiết bị khác.", "Are replacing là chủ động hiện tại tiếp diễn, không khớp nghĩa và last Thursday."]),
    question("passive-4", "Please use the side entrance; the main staircase _____ by contractors right now.", ["renovates", "renovated", "has renovating", "is being renovated"], 3,
      "Is being renovated diễn tả cầu thang đang được sửa ngay lúc này: hiện tại tiếp diễn bị động.", ["Renovates là chủ động; staircase không thực hiện việc sửa.", "Renovated thiếu trợ động từ bị động trong câu này.", "Has renovating sai cấu trúc; has không nối trực tiếp với renovating ở đây.", "Đúng: is being renovated."]),
    question("passive-5", "The replacement printer will _____ to the branch tomorrow morning.", ["deliver", "be delivered", "delivering", "been delivered"], 1,
      "Be delivered kết hợp với will thành will be delivered: máy in sẽ được giao vào sáng mai.", ["Deliver là chủ động; máy in là vật được giao.", "Đúng: will be delivered.", "Delivering không đi trực tiếp sau will.", "Been delivered không đi trực tiếp sau will; phải là be delivered."]),
    question("passive-6", "The maintenance crew _____ the backup generator every Monday.", ["is inspected", "was inspected", "inspects", "be inspected"], 2,
      "Inspects là chủ động hiện tại đơn: maintenance crew thực hiện kiểm tra generator theo lịch every Monday.", ["Is inspected làm crew thành đối tượng được kiểm tra và không nối được tân ngữ generator như ở đây.", "Was inspected sai cấu trúc với tân ngữ generator, đồng thời không diễn tả lịch hiện tại.", "Đúng: crew inspects the generator.", "Be inspected chưa chia thì và không phù hợp với tân ngữ generator."]),
  ],
  "ving-va-to-infinitive-toeic": [
    question("verb-pattern-1", "The purchasing team agreed _____ the supplier's revised delivery terms.", ["accepting", "accepted", "accept", "to accept"], 3,
      "To accept theo mẫu agree to do something: nhóm mua hàng đồng ý chấp nhận điều khoản mới.", ["Accepting không theo trực tiếp agreed trong mẫu này.", "Accepted không làm động từ thứ hai sau agreed ở đây.", "Accept thiếu to sau agreed.", "Đúng: agreed to accept."]),
    question("verb-pattern-2", "The supervisor reminded the technicians _____ their tools before leaving the site.", ["to collect", "collecting", "collected", "collect"], 0,
      "To collect theo mẫu remind + người + to V: nhắc các kỹ thuật viên thu dọn dụng cụ.", ["Đúng: reminded the technicians to collect.", "Collecting không theo mẫu remind + người đang dùng ở đây.", "Collected không tạo được cấu trúc sau reminded the technicians.", "Collect thiếu to trong mẫu remind + người + to V."]),
    question("verb-pattern-3", "Before _____ the equipment, read the safety instructions carefully.", ["operate", "to operate", "operating", "operated"], 2,
      "Operating là V-ing sau giới từ before; chủ thể ngầm của operating cũng là người được yêu cầu đọc hướng dẫn.", ["Operate không theo trực tiếp giới từ before trong cụm này.", "To operate không theo before ở đây.", "Đúng: before operating.", "Operated không diễn tả người đọc chủ động vận hành thiết bị trong cụm này."]),
    question("verb-pattern-4", "We look forward to _____ your design proposal at next week's review.", ["discuss", "discussing", "to discuss", "discussed"], 1,
      "Discussing theo look forward to + V-ing; to là giới từ dù buổi thảo luận diễn ra tuần tới.", ["Discuss không theo giới từ to trong look forward to.", "Đúng: look forward to discussing.", "To discuss tạo thêm to và dùng sai dạng sau giới từ.", "Discussed không tạo được cụm chỉ hành động sau look forward to ở đây."]),
    question("verb-pattern-5", "To prevent duplicate orders, please avoid _____ the request more than once.", ["submitting", "to submit", "submit", "submitted"], 0,
      "Submitting theo mẫu avoid + V-ing: tránh gửi yêu cầu nhiều lần.", ["Đúng: avoid submitting.", "To submit không theo avoid trong mẫu này.", "Submit là nguyên mẫu thiếu cấu trúc sau avoid.", "Submitted không làm danh động từ sau avoid."]),
    question("verb-pattern-6", "The courier paused at reception in order _____ the package tracking number before continuing upstairs.", ["checking", "checked", "to check", "check"], 2,
      "To check hoàn tất mẫu in order to + V, diễn tả mục đích dừng lại để kiểm tra mã kiện hàng.", ["Checking không hoàn tất mẫu in order to + V.", "Checked không theo in order để diễn tả mục đích.", "Đúng: in order to check.", "Check thiếu to sau in order."]),
  ],
  "loai-tu-trong-toeic-part-5": [
    question("form-1", "The design team explained the changes _____ during the briefing.", ["clear", "clearly", "clarity", "clarify"], 1,
      "Clearly bổ nghĩa cho động từ explained: nhóm thiết kế giải thích một cách rõ ràng.", ["Clear là tính từ, không bổ nghĩa cho explained ở vị trí này.", "Đúng: trạng từ chỉ cách giải thích.", "Clarity là danh từ; câu không thiếu tân ngữ.", "Clarify là động từ nguyên mẫu, không nối trực tiếp sau the changes."]),
    question("form-2", "Visitors need written _____ before entering the laboratory.", ["permit", "permitted", "permissible", "permission"], 3,
      "Written permission là sự cho phép bằng văn bản. Permission là danh từ không đếm được nên không cần mạo từ.", ["Permit là danh từ đếm được số ít trong nghĩa giấy phép; phải có a written permit.", "Permitted là phân từ, không làm danh từ chỉ sự cho phép.", "Permissible là tính từ, chưa có danh từ để bổ nghĩa.", "Đúng: written permission."]),
    question("form-3", "The supplier offered a _____ solution to the packaging problem.", ["practical", "practically", "practice", "practices"], 0,
      "A practical solution là một giải pháp thiết thực: tính từ practical bổ nghĩa cho solution.", ["Đúng: tính từ trước danh từ.", "Practically là trạng từ; không dùng để mô tả danh từ solution trực tiếp.", "Practice không diễn tả tính thiết thực trong cụm này.", "Practices là danh từ số nhiều hoặc động từ, không phù hợp vị trí này."]),
  ],
  "thi-va-dang-dong-tu-toeic": [
    question("tense-1", "The courier _____ the signed contract to our office yesterday.", ["delivers", "will deliver", "delivered", "is delivering"], 2,
      "Yesterday xác định một thời điểm quá khứ đã kết thúc, nên dùng delivered.", ["Delivers là hiện tại đơn.", "Will deliver là tương lai.", "Đúng: quá khứ đơn.", "Is delivering diễn tả hiện tại đang diễn ra."]),
    question("tense-2", "By the time the workshop began, the technician _____ all the microphones.", ["tests", "had tested", "will test", "is testing"], 1,
      "Việc kiểm tra hoàn tất trước một sự kiện quá khứ khác (began): had tested.", ["Tests là hiện tại đơn.", "Đúng: quá khứ hoàn thành.", "Will test nói tương lai.", "Is testing là hiện tại tiếp diễn, không khớp mốc began."]),
    question("tense-3", "Please lower your voice; the director _____ a client on the phone right now.", ["called", "calls", "will call", "is calling"], 3,
      "Right now cùng lời đề nghị giữ yên lặng cho thấy hành động đang diễn ra: is calling.", ["Called chỉ việc đã qua.", "Calls mô tả thói quen, không diễn tả cuộc gọi đang diễn ra ở đây.", "Will call chỉ tương lai.", "Đúng: hiện tại tiếp diễn."]),
  ],
  "hoa-hop-chu-ngu-dong-tu-toeic": [
    question("agreement-1", "The list of approved suppliers _____ on the reception desk.", ["is", "are", "have", "were"], 0,
      "Chủ ngữ chính là list (số ít), không phải suppliers trong cụm of approved suppliers.", ["Đúng: list is.", "Are đi với chủ ngữ số nhiều.", "Have không tạo được vị ngữ với on the desk.", "Were đi với chủ ngữ số nhiều trong câu trần thuật này."]),
    question("agreement-2", "Each of the conference rooms _____ a projector.", ["contain", "contains", "containing", "have contained"], 1,
      "Each là chủ ngữ số ít, nên động từ hiện tại đơn thêm -s: contains.", ["Contain thiếu -s với each.", "Đúng: each contains.", "Containing chưa phải động từ chia thì.", "Have contained không hòa hợp với each; phải là has contained."]),
    question("agreement-3", "The number of online orders _____ increased this month.", ["have", "are", "has", "were"], 2,
      "The number là chủ ngữ số ít. Has increased diễn tả số lượng đã tăng trong tháng này.", ["Have không hòa hợp với the number.", "Are increased không diễn tả sự tăng số lượng và không hòa hợp.", "Đúng: the number has increased.", "Were không hòa hợp với the number."]),
  ],
  "gioi-tu-toeic-trong-cong-viec": [
    question("preposition-1", "The new coordinator is responsible _____ arranging airport transfers.", ["at", "with", "for", "of"], 2,
      "Responsible for + danh từ/V-ing diễn tả chịu trách nhiệm về một việc.", ["Responsible at không phải cụm phù hợp.", "Responsible with không diễn tả trách nhiệm về việc này.", "Đúng: responsible for arranging.", "Responsible of không đúng cụm."]),
    question("preposition-2", "All contractors must comply _____ the building's safety rules.", ["for", "with", "at", "to"], 1,
      "Comply with nghĩa là tuân thủ quy định.", ["Comply for không đi với rules.", "Đúng: comply with the rules.", "Comply at không đúng cụm.", "Comply to không đúng; đừng nhầm với adhere to."]),
    question("preposition-3", "The design team is interested _____ testing the new software.", ["on", "for", "under", "in"], 3,
      "Interested in + danh từ/V-ing diễn tả hứng thú với việc gì.", ["Interested on không đúng cụm.", "Interested for không đúng cấu trúc này.", "Interested under không dùng để chỉ mong muốn tham gia việc testing ở đây.", "Đúng: interested in testing."]),
  ],
  "lien-tu-va-tu-noi-toeic": [
    question("conjunction-1", "The reception desk was moved _____ the main entrance was being repaired.", ["because of", "because", "despite", "during"], 1,
      "Sau chỗ trống là mệnh đề có chủ ngữ the main entrance và động từ was being repaired, nên chọn because.", ["Because of cần cụm danh từ.", "Đúng: because + mệnh đề.", "Despite không nối trực tiếp mệnh đề này.", "During cần cụm danh từ chỉ thời gian."]),
    question("conjunction-2", "_____ the heavy rain, the delivery team completed all scheduled stops.", ["Although", "Because", "Despite", "Unless"], 2,
      "The heavy rain là cụm danh từ; despite diễn tả sự tương phản giữa mưa lớn và việc vẫn giao xong.", ["Although cần mệnh đề.", "Because cần mệnh đề.", "Đúng: despite + cụm danh từ.", "Unless cần mệnh đề điều kiện."]),
    question("conjunction-3", "Please email the invoice _____ the customer can arrange payment.", ["so that", "because of", "in spite of", "during"], 0,
      "So that + mệnh đề diễn tả mục đích: gửi hóa đơn để khách có thể thanh toán.", ["Đúng: so that + chủ ngữ + động từ.", "Because of cần cụm danh từ.", "In spite of cần cụm danh từ hoặc V-ing.", "During cần cụm danh từ."]),
    question("conjunction-4", "The outdoor demonstration was canceled _____ a severe storm warning.", ["although", "because", "however", "because of"], 3,
      "A severe storm warning là cụm danh từ chỉ nguyên nhân hủy buổi trình diễn, nên dùng because of.", ["Although không nối trực tiếp cụm danh từ này và không thể hiện nguyên nhân.", "Because cần mệnh đề có chủ ngữ và động từ.", "However không nối canceled với cụm danh từ chỉ nguyên nhân.", "Đúng: because of + cụm danh từ."]),
    question("conjunction-5", "_____ the new printer costs more, it uses less electricity than the old model.", ["Although", "Despite", "Because of", "During"], 0,
      "Although + mệnh đề the new printer costs more diễn tả sự nhượng bộ: giá mua cao hơn nhưng tiêu thụ ít điện hơn.", ["Đúng: although + chủ ngữ + động từ.", "Despite không đi trực tiếp với mệnh đề the new printer costs more.", "Because of cần cụm danh từ, không phải mệnh đề costs more.", "During cần cụm danh từ chỉ một khoảng thời gian."]),
    question("conjunction-6", "The warehouse is closed today; _____, online orders will still be processed.", ["although", "however", "despite", "because"], 1,
      "However nối hai ý tương phản; dấu chấm phẩy trước và dấu phẩy sau phù hợp với hai mệnh đề độc lập trong câu này.", ["Although mở mệnh đề phụ; không đứng trước dấu phẩy theo cấu trúc này.", "Đúng: however với dấu câu nối hai mệnh đề độc lập.", "Despite cần cụm danh từ hoặc V-ing, không đứng độc lập trước dấu phẩy ở đây.", "Because cần mệnh đề ngay sau, không tách khỏi chủ ngữ bằng dấu phẩy này."]),
  ],
  "menh-de-quan-he-toeic": [
    question("relative-1", "The consultant _____ report won the award will speak at Friday's meeting.", ["who", "whom", "whose", "which"], 2,
      "Sau chỗ trống là danh từ report; cần whose để diễn tả báo cáo của chuyên gia.", ["Who làm chủ ngữ, không đứng trước report theo nghĩa sở hữu.", "Whom làm tân ngữ, không chỉ sở hữu.", "Đúng: whose report.", "Which không chỉ sở hữu của consultant ở đây."]),
    question("relative-2", "The employee _____ organized the workshop received a thank-you letter.", ["who", "whose", "where", "whom"], 0,
      "Mệnh đề organized the workshop thiếu chủ ngữ chỉ người, nên dùng who.", ["Đúng: who làm chủ ngữ của organized.", "Whose cần danh từ sau nó.", "Where chỉ nơi chốn, không làm chủ ngữ.", "Whom làm tân ngữ, không làm chủ ngữ của organized."]),
    question("relative-3", "The office _____ we held the interview is on the second floor.", ["whose", "where", "who", "whom"], 1,
      "We held the interview đã có chủ ngữ và tân ngữ; where bổ sung địa điểm tổ chức.", ["Whose không bổ nghĩa cho we.", "Đúng: where tương đương in which.", "Who chỉ người.", "Whom chỉ người làm tân ngữ."]),
    question("relative-4", "The training room, _____ was renovated last month, now has adjustable desks.", ["where", "whose", "that", "which"], 3,
      "Which làm chủ ngữ của was renovated và thay cho the training room trong mệnh đề bổ sung có dấu phẩy.", ["Where chỉ địa điểm, không làm chủ ngữ của was renovated.", "Whose cần danh từ theo sau để chỉ sở hữu.", "That không mở mệnh đề quan hệ không xác định có dấu phẩy.", "Đúng: which làm chủ ngữ thay cho vật."]),
    question("relative-5", "The specialist to _____ we sent the technical drawings will visit on Tuesday.", ["who", "whom", "whose", "that"], 1,
      "Whom là tân ngữ chỉ người sau giới từ to được đặt trước từ quan hệ: to whom we sent the technical drawings.", ["Who không dùng sau giới từ to đặt trước từ quan hệ trong cấu trúc trang trọng này.", "Đúng: to whom.", "Whose diễn tả sở hữu, không làm tân ngữ của to ở đây.", "That không đứng ngay sau giới từ đưa lên trước mệnh đề quan hệ."]),
    question("relative-6", "The storage facility _____ the company leased last year is near the airport.", ["which", "where", "whose", "who"], 0,
      "Which làm tân ngữ của leased: the company leased the storage facility. Dù facility là địa điểm, câu thiếu vật được thuê nên không chọn where.", ["Đúng: which thay cho tân ngữ của leased.", "Where chỉ nơi diễn ra hành động, không điền được tân ngữ còn thiếu của leased.", "Whose cần danh từ theo sau, không phải the company leased trong câu này.", "Who chỉ người, không thay cho storage facility."]),
  ],
  "tu-vung-toeic-theo-chu-de-cong-so": [
    question("vocab-1", "Please keep the receipt so that you can request _____ for your travel expenses.", ["attendance", "reimbursement", "recruitment", "maintenance"], 1,
      "Receipt và travel expenses gợi việc hoàn lại khoản tiền đã chi: reimbursement.", ["Attendance là sự có mặt.", "Đúng: reimbursement là hoàn tiền chi phí.", "Recruitment là tuyển dụng.", "Maintenance là bảo trì."]),
    question("vocab-2", "The supplier cannot ship the goods until it receives a signed purchase _____.", ["weather", "journey", "order", "traffic"], 2,
      "Purchase order là đơn đặt hàng, phù hợp với supplier, ship the goods và signed.", ["Weather không kết hợp với purchase trong ngữ cảnh này.", "Journey là chuyến đi.", "Đúng: purchase order.", "Traffic là giao thông hoặc lưu lượng."]),
    question("vocab-3", "The supervisor asked us to _____ the deadline by submitting the report before noon.", ["meet", "attend", "participate", "arrive"], 0,
      "Meet a deadline nghĩa là hoàn thành đúng hạn. Before noon giải thích hạn nộp báo cáo.", ["Đúng: meet the deadline.", "Attend dùng với sự kiện, không dùng với deadline.", "Participate cần in và một hoạt động.", "Arrive là nội động từ, không nhận deadline làm tân ngữ."]),
    question("vocab-4", "The accounting team will _____ an invoice after verifying the order.", ["issue", "attend", "meet", "board"], 0,
      "Issue an invoice là xuất hóa đơn; accounting team là chủ thể phù hợp với hành động này.", ["Đúng: issue an invoice.", "Attend đi với sự kiện hoặc cuộc họp.", "Meet đi với deadline hoặc người, không phải invoice trong câu này.", "Board là lên tàu hoặc hội đồng, không phù hợp ngữ cảnh."]),
    question("vocab-5", "The manager asked us to _____ the deadline because the supplier needs two more days.", ["track", "extend", "reserve", "recruit"], 1,
      "Supplier cần thêm thời gian nên deadline được gia hạn: extend the deadline.", ["Track thường đi với shipment hoặc order.", "Đúng: extend a deadline.", "Reserve đi với chỗ, bàn hoặc lịch đặt trước.", "Recruit đi với nhân sự cần tuyển."]),
    question("vocab-6", "Please _____ the shipment online so we know when it will arrive.", ["track", "issue", "meet", "make"], 0,
      "Track a shipment là theo dõi lô hàng; mệnh đề sau hỏi thời điểm hàng đến.", ["Đúng: track the shipment.", "Issue an invoice hoặc issue a notice, không issue shipment trong câu này.", "Meet đi với deadline hoặc người, không phải shipment.", "Make cần một cụm khác như make a reservation; make the shipment không diễn tả theo dõi."]),
  ],
  "collocation-la-gi-cum-tu-toeic-thong-dung": [
    question("collocation-1", "The negotiation team hopes to _____ an agreement with the supplier by Friday.", ["reach", "attend", "arrive", "meet"], 0,
      "Reach an agreement là đạt được thỏa thuận; negotiation team và supplier tạo đúng ngữ cảnh đàm phán.", ["Đúng: reach an agreement.", "Attend dùng với cuộc họp hoặc sự kiện, không dùng với agreement.", "Arrive là nội động từ và thường cần at/in trước địa điểm.", "Meet an agreement không phải collocation phù hợp; meet thường đi với deadline, requirement hoặc người."]),
    question("collocation-2", "Please _____ an update on the installation before tomorrow's meeting.", ["make", "provide", "reach", "perform"], 1,
      "Provide an update là cung cấp thông tin cập nhật; câu yêu cầu thông tin trước cuộc họp.", ["Make an update có thể gặp trong ngữ cảnh kỹ thuật nhưng không tự nhiên bằng provide an update khi báo cáo tình hình.", "Đúng: provide an update.", "Reach an update không phải collocation.", "Perform an update thường nói về thao tác cập nhật hệ thống, không phải cung cấp báo cáo tình hình."]),
    question("collocation-3", "The accounting department will _____ an invoice after confirming the order.", ["issue", "meet", "raise", "conduct"], 0,
      "Issue an invoice là xuất hóa đơn; accounting department là chủ thể tự nhiên của hành động này.", ["Đúng: issue an invoice.", "Meet không kết hợp với invoice trong nghĩa xuất hóa đơn.", "Raise an invoice có thể xuất hiện trong một số biến thể Anh-Anh, nhưng issue là lựa chọn chuẩn và rõ nhất trong câu này.", "Conduct thường đi với interview, survey hoặc inspection, không đi với invoice."]),
    question("collocation-4", "Because two figures are still missing, we may need to _____ the deadline.", ["extend", "attend", "track", "fill"], 0,
      "Extend the deadline là gia hạn thời hạn; dữ liệu còn thiếu giải thích vì sao cần thêm thời gian.", ["Đúng: extend the deadline.", "Attend dùng với sự kiện, không dùng với deadline.", "Track a deadline có thể là theo dõi hạn, nhưng không diễn tả việc cần thêm thời gian.", "Fill không kết hợp với deadline trong nghĩa gia hạn."]),
  ],
  "phrasal-verbs-toeic-theo-chu-de-cong-viec": [
    question("phrasal-1", "Please _____ the attached form and return it to Human Resources.", ["fill out", "run out of", "call off", "take over"], 0,
      "Fill out a form là điền thông tin vào biểu mẫu; attached form và return it là hai tín hiệu trực tiếp.", ["Đúng: fill out the form.", "Run out of nghĩa là dùng hết một thứ gì đó.", "Call off nghĩa là hủy một sự kiện hoặc kế hoạch.", "Take over nghĩa là tiếp quản công việc hoặc quyền kiểm soát."]),
    question("phrasal-2", "The outdoor product demonstration was _____ because of the storm warning.", ["looked into", "called off", "taken over", "sent out"], 1,
      "Was called off là bị hủy; cảnh báo bão là nguyên nhân hợp lý để hủy buổi trình diễn ngoài trời.", ["Looked into nghĩa là được điều tra hoặc xem xét, không phù hợp với sự kiện ngoài trời ở đây.", "Đúng: was called off.", "Taken over nghĩa là được tiếp quản, không diễn tả việc sự kiện không diễn ra.", "Sent out nghĩa là được gửi đi hoặc phát đi."]),
    question("phrasal-3", "Our support team is _____ the billing error and will contact you tomorrow.", ["looking into", "running out of", "turning down", "handing in"], 0,
      "Is looking into the billing error nghĩa là đang điều tra hoặc xem xét lỗi thanh toán; lời hứa liên hệ lại cho thấy nhóm đang kiểm tra vấn đề.", ["Đúng: is looking into the billing error.", "Run out of nghĩa là cạn một nguồn lực và không phù hợp với billing error.", "Turn down nghĩa là từ chối hoặc giảm âm lượng.", "Hand in nghĩa là nộp một tài liệu hoặc vật."]),
    question("phrasal-4", "The assistant printed the report and _____ to the manager before noon.", ["handed it in", "handed in it", "ran it out of", "looked it into"], 0,
      "Với đại từ it, phrasal verb tách được hand in đặt đại từ ở giữa: handed it in.", ["Đúng: handed it in.", "Handed in it sai vị trí đại từ với phrasal verb tách được này.", "Run out of nghĩa là dùng hết và không thể nhận report theo cấu trúc này.", "Look into nghĩa là điều tra; looked it into vừa sai trật tự vừa sai nghĩa."]),
  ],
  "tu-de-nham-trong-tieng-anh-toeic-part-5": [
    question("confusing-1", "The new inspection procedure will _____ that every emergency exit is clearly marked.", ["assure", "ensure", "insure", "securely"], 1,
      "Ensure + mệnh đề nghĩa là bảo đảm một kết quả xảy ra: mọi lối thoát được đánh dấu rõ.", ["Assure thường nhận người làm tân ngữ, như assure employees that..., nên không phù hợp trực tiếp trước mệnh đề này.", "Đúng: ensure that...", "Insure chủ yếu nói về bảo hiểm trước rủi ro tài chính.", "Securely là trạng từ, không thể làm động từ sau will."]),
    question("confusing-2", "Higher shipping costs have _____ the price of imported equipment.", ["effect", "affected", "effects", "effective"], 1,
      "Have affected là hiện tại hoàn thành: chi phí vận chuyển đã tác động đến giá thiết bị.", ["Effect thường là danh từ; nếu dùng làm động từ mang nghĩa tạo ra thì cũng phải ở dạng effect sau have been hoặc effected sau have.", "Đúng: have affected.", "Effects không đi sau trợ động từ have trong cấu trúc này.", "Effective là tính từ, không làm động từ chính sau have."]),
    question("confusing-3", "The company plans to _____ prices after the warranty period ends.", ["rise", "raise", "arise", "rose"], 1,
      "Raise là ngoại động từ và nhận prices làm tân ngữ; công ty chủ động tăng giá.", ["Rise là nội động từ nên không nhận prices làm tân ngữ.", "Đúng: raise prices.", "Arise nghĩa là phát sinh và không nhận prices làm tân ngữ.", "Rose là dạng quá khứ của rise, không theo sau plans to."]),
    question("confusing-4", "Before approving the loan, the bank will _____ the applicant's financial risk.", ["access", "assess", "excess", "accept"], 1,
      "Assess risk là đánh giá rủi ro; đây là việc ngân hàng cần làm trước khi phê duyệt khoản vay.", ["Access nghĩa là truy cập hoặc quyền truy cập, không phải đánh giá.", "Đúng: assess the risk.", "Excess là danh từ hoặc tính từ chỉ phần vượt quá.", "Accept nghĩa là chấp nhận, không diễn tả bước đánh giá trước quyết định."]),
  ],
  "cach-viet-email-tieng-anh-cong-viec-mau": [
    question("email-1", "Which subject line is clearest for an email asking a manager to approve the travel budget by Friday?", ["Hello", "Important request", "Action required: Approve travel budget by Friday", "A question"], 2,
      "Action required: Approve travel budget by Friday nêu hành động, đối tượng và thời hạn; người nhận hiểu yêu cầu trước khi mở email.", ["Hello không cho biết chủ đề hoặc việc cần làm.", "Important request vẫn mơ hồ về nội dung và hạn xử lý.", "Đúng: dòng chủ đề có hành động, đối tượng và hạn Friday.", "A question không giúp người nhận ưu tiên hoặc đoán nội dung."]),
    question("email-2", "Could you please _____ the revised schedule by 3:00 p.m. today?", ["review", "reviewing", "reviewed", "to review"], 0,
      "Sau could you please dùng động từ nguyên mẫu không to: review.", ["Đúng: could you please review.", "Reviewing không theo trực tiếp could you please.", "Reviewed là dạng quá khứ/phân từ, không đứng sau could trong câu hỏi này.", "To review thừa to sau modal could."]),
    question("email-3", "Which opening most clearly follows up on a proposal sent on 5 October?", ["I hope you are fine.", "I am following up on the proposal I sent on 5 October.", "Why haven't you replied?", "This is very urgent."], 1,
      "I am following up on the proposal I sent on 5 October. Câu này nêu đúng mục đích, tài liệu và mốc thời gian nên người nhận xác định được email trước đó.", ["Lời chào chung không nói email đang theo dõi việc gì.", "Đúng: câu mở đầu xác định proposal và ngày gửi.", "Câu hỏi trách móc không chuyên nghiệp và vẫn thiếu ngữ cảnh cụ thể.", "Câu báo khẩn cấp không nêu đối tượng cần xử lý."]),
    question("email-4", "Which sentence makes a clear, polite rescheduling request?", ["Change the meeting.", "I cannot come.", "Would it be possible to move Thursday's meeting to Friday morning?", "The meeting time is bad."], 2,
      "Would it be possible to move Thursday's meeting to Friday morning? là lời đề nghị lịch sự, nêu cả lịch cũ lẫn phương án mới.", ["Mệnh lệnh trực tiếp không lịch sự và không cho thời gian thay thế.", "Câu này chỉ nêu vấn đề, chưa đề nghị lịch mới.", "Đúng: yêu cầu rõ, lịch sự và có phương án cụ thể.", "Câu đánh giá mơ hồ, không chỉ ra thời gian thay thế."]),
  ],
};

export function practiceForSlug(slug: string): MiniQuestion[] {
  if (slug === "seo-word-form") return MINI_PRACTICE["loai-tu-trong-toeic-part-5"];
  if (slug === "seo-tenses") return MINI_PRACTICE["thi-va-dang-dong-tu-toeic"];
  // This published seven-question sample has a fixed syllabus. Adding a topic
  // exercise must not silently change its question count or advertised scope.
  if (slug === "seo-part5-practice") return [
    "loai-tu-trong-toeic-part-5", "thi-va-dang-dong-tu-toeic", "hoa-hop-chu-ngu-dong-tu-toeic",
    "gioi-tu-toeic-trong-cong-viec", "lien-tu-va-tu-noi-toeic", "menh-de-quan-he-toeic", "tu-vung-toeic-theo-chu-de-cong-so",
  ].map(topic => MINI_PRACTICE[topic][0]);
  return MINI_PRACTICE[slug] ?? [];
}
