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
  ],
  "menh-de-quan-he-toeic": [
    question("relative-1", "The consultant _____ report won the award will speak at Friday's meeting.", ["who", "whom", "whose", "which"], 2,
      "Sau chỗ trống là danh từ report; cần whose để diễn tả báo cáo của chuyên gia.", ["Who làm chủ ngữ, không đứng trước report theo nghĩa sở hữu.", "Whom làm tân ngữ, không chỉ sở hữu.", "Đúng: whose report.", "Which không chỉ sở hữu của consultant ở đây."]),
    question("relative-2", "The employee _____ organized the workshop received a thank-you letter.", ["who", "whose", "where", "whom"], 0,
      "Mệnh đề organized the workshop thiếu chủ ngữ chỉ người, nên dùng who.", ["Đúng: who làm chủ ngữ của organized.", "Whose cần danh từ sau nó.", "Where chỉ nơi chốn, không làm chủ ngữ.", "Whom làm tân ngữ, không làm chủ ngữ của organized."]),
    question("relative-3", "The office _____ we held the interview is on the second floor.", ["whose", "where", "who", "whom"], 1,
      "We held the interview đã có chủ ngữ và tân ngữ; where bổ sung địa điểm tổ chức.", ["Whose không bổ nghĩa cho we.", "Đúng: where tương đương in which.", "Who chỉ người.", "Whom chỉ người làm tân ngữ."]),
  ],
  "tu-vung-toeic-theo-chu-de-cong-so": [
    question("vocab-1", "Please keep the receipt so that you can request _____ for your travel expenses.", ["attendance", "reimbursement", "recruitment", "maintenance"], 1,
      "Receipt và travel expenses gợi việc hoàn lại khoản tiền đã chi: reimbursement.", ["Attendance là sự có mặt.", "Đúng: reimbursement là hoàn tiền chi phí.", "Recruitment là tuyển dụng.", "Maintenance là bảo trì."]),
    question("vocab-2", "The supplier cannot ship the goods until it receives a signed purchase _____.", ["weather", "journey", "order", "traffic"], 2,
      "Purchase order là đơn đặt hàng, phù hợp với supplier, ship the goods và signed.", ["Weather không kết hợp với purchase trong ngữ cảnh này.", "Journey là chuyến đi.", "Đúng: purchase order.", "Traffic là giao thông hoặc lưu lượng."]),
    question("vocab-3", "The supervisor asked us to _____ the deadline by submitting the report before noon.", ["meet", "attend", "participate", "arrive"], 0,
      "Meet a deadline nghĩa là hoàn thành đúng hạn. Before noon giải thích hạn nộp báo cáo.", ["Đúng: meet the deadline.", "Attend dùng với sự kiện, không dùng với deadline.", "Participate cần in và một hoạt động.", "Arrive là nội động từ, không nhận deadline làm tân ngữ."]),
  ],
};

export function practiceForSlug(slug: string): MiniQuestion[] {
  if (slug === "seo-word-form") return MINI_PRACTICE["loai-tu-trong-toeic-part-5"];
  if (slug === "seo-tenses") return MINI_PRACTICE["thi-va-dang-dong-tu-toeic"];
  if (slug === "seo-part5-practice") return Object.values(MINI_PRACTICE).map(items => items[0]);
  return MINI_PRACTICE[slug] ?? [];
}
