export type ReadingSampleQuestion = {
  prompt: string;
  options: readonly [string, string, string, string];
  answer: number;
  explanation: string;
};

export type ReadingLongTailGuide = {
  path: string;
  part: 6 | 7;
  title: string;
  description: string;
  intro: string;
  sections: readonly { title: string; paragraphs: readonly string[]; steps?: readonly string[] }[];
  documents: readonly { label: string; paragraphs: readonly string[] }[];
  questions: readonly ReadingSampleQuestion[];
  review: string;
  related: readonly { href: string; label: string; description: string }[];
};

// Original practice passages and questions written for TOEIC GYM, independent of ETS material.
export const readingLongTailGuides = {
  sentenceInsertion: {
    path: "/toeic/part-6/dien-cau-vao-doan-van",
    part: 6,
    title: "TOEIC Part 6 điền câu vào đoạn văn: cách chọn và bài tập có đáp án",
    description: "Học cách xử lý câu điền vào đoạn văn TOEIC Part 6 bằng dấu hiệu trước và sau chỗ trống. Làm bài email tự biên soạn, xem đáp án và lời giải miễn phí.",
    intro: "Dạng điền cả câu trong Part 6 yêu cầu bạn theo dõi mạch ý của đoạn, không chỉ kiểm tra ngữ pháp của một câu. Bài mẫu dưới đây cho bạn một cách đọc có thể áp dụng ngay: xác định vấn đề, tìm quan hệ nguyên nhân – kết quả, rồi kiểm tra câu sau chỗ trống.",
    sections: [
      {
        title: "Đọc hai phía của chỗ trống trước khi xem đáp án",
        paragraphs: ["Câu đứng trước thường đặt ra một sự kiện, vấn đề hoặc lời hứa. Câu đứng sau có thể nêu kết quả, giải thích thêm hoặc chuyển sang hành động cần làm. Hãy diễn đạt vai trò của câu còn thiếu bằng một cụm ngắn, chẳng hạn ‘thông báo thay đổi lịch’, trước khi đọc bốn lựa chọn. Cách này giúp bạn ít bị cuốn theo một từ khóa quen mắt."],
        steps: ["Tìm người viết, người nhận và mục đích của email hoặc thông báo.", "Đọc câu trước chỗ trống để xác định điều gì vừa xảy ra.", "Đọc câu sau chỗ trống để xem ý nào cần được nối tiếp.", "Thử từng lựa chọn trong cả đoạn; loại câu lạc chủ đề hoặc làm đứt mạch thời gian."],
      },
      {
        title: "Bẫy thường gặp: đúng ngữ pháp nhưng sai mạch ý",
        paragraphs: ["Một phương án có thể là câu tiếng Anh hoàn chỉnh nhưng vẫn không phù hợp. Nếu email đang báo đổi lịch vì giảng viên vắng mặt, câu nói về việc sửa phòng họp không giải thích được lịch mới. Nếu câu sau đã nêu thời điểm mới, câu cần điền nên làm rõ quyết định đổi lịch hoặc nguyên nhân của nó. Kiểm tra cả đại từ, từ nối và mốc thời gian thay vì chỉ đối chiếu một từ trùng trong đoạn."],
      },
    ],
    documents: [{
      label: "Email nội bộ · bài mẫu tự biên soạn",
      paragraphs: [
        "Subject: Customer Service Workshop — Schedule Update",
        "The customer service workshop was originally scheduled for Friday, June 12. Several instructors must attend a regional meeting that day.",
        "[1]",
        "The workshop will now take place on Tuesday, June 16, in Room 204. Please update your calendars. If you registered but cannot attend on the new date, email Ms. Tran by Thursday.",
      ],
    }],
    questions: [{
      prompt: "Which sentence best fits in [1]?",
      options: [
        "We have therefore moved the workshop to the following week.",
        "The meeting room was renovated last year.",
        "All instructors have already received their certificates.",
        "Registration for the regional meeting closed yesterday.",
      ],
      answer: 0,
      explanation: "A nối nguyên nhân ‘instructors must attend a regional meeting’ với kết quả đổi lịch sang tuần sau. Câu tiếp theo xác nhận lịch mới là Tuesday, June 16. B lạc sang việc sửa phòng; C nói về chứng chỉ; D nói về đăng ký một sự kiện khác và không giải thích việc dời workshop.",
    }],
    review: "Sau khi chọn đáp án, đọc liền đoạn từ câu nêu lý do đến câu ghi lịch mới. Nếu hai câu nối được với nhau mà không cần suy đoán thêm, bạn đã tìm đúng vai trò của câu điền. Với câu sai, ghi lại vì sao phương án mình chọn không nối được hai phía chỗ trống.",
    related: [
      { href: "/toeic/part-6", label: "Tổng quan TOEIC Part 6", description: "Ôn cách xử lý từ loại, từ nối và mạch ý trong cả đoạn." },
      { href: "/toeic/part-7/doc-hieu-hai-doan-van", label: "Đọc hiểu hai đoạn văn Part 7", description: "Luyện đối chiếu bằng chứng giữa hai tài liệu." },
      { href: "/try#quick-practice", label: "Thử bài Reading dài hơn", description: "Chuyển từ một câu mẫu sang nhóm câu hỏi theo Part." },
    ],
  },
  doublePassage: {
    path: "/toeic/part-7/doc-hieu-hai-doan-van",
    part: 7,
    title: "TOEIC Part 7 đọc hiểu hai đoạn văn: bài tập đối chiếu có lời giải",
    description: "Luyện TOEIC Part 7 dạng hai đoạn văn với email đặt hàng và phản hồi tự biên soạn. Trả lời 3 câu, xem bằng chứng ở từng tài liệu và cách tránh bẫy mốc thời gian.",
    intro: "Ở dạng hai tài liệu, một câu hỏi có thể cần thông tin từ cả email ban đầu lẫn phản hồi. Bài mẫu này luyện cách ghép số lượng, ngày giao và hành động tiếp theo. Bạn có thể làm ngay trên trang rồi xem câu nào trong tài liệu chứng minh đáp án.",
    sections: [
      {
        title: "Gắn mỗi câu hỏi với đúng tài liệu",
        paragraphs: ["Đọc tiêu đề và người gửi trước để hiểu vai trò của từng tài liệu. Sau đó xem câu hỏi cần một chi tiết có sẵn hay cần đối chiếu thay đổi giữa hai bên. Chẳng hạn, ngày giao ban đầu nằm trong email của nhà cung cấp, còn quyết định chấp nhận giao từng đợt nằm trong phản hồi của người mua. Đừng lấy một con số đúng ở tài liệu thứ nhất để trả lời câu hỏi về kế hoạch cuối cùng."],
        steps: ["Khoanh loại thông tin cần tìm: số lượng, ngày, lý do hay hành động.", "Định vị câu chứa thông tin trong tài liệu đầu tiên.", "Đọc phản hồi để kiểm tra thông tin đó có được giữ nguyên hay thay đổi.", "Chọn phương án diễn đạt đúng ý; loại lựa chọn chỉ lặp lại một từ trong bài."],
      },
      {
        title: "Đặc biệt cẩn thận với số lượng và mốc thời gian",
        paragraphs: ["Trong bài mẫu, tổng đơn hàng là 40 ghế, nhưng không phải toàn bộ được giao trong cùng một ngày. Nếu câu hỏi hỏi số ghế đến vào thứ Ba, phải lấy phần giao đợt đầu. Nếu hỏi khi nào gửi hóa đơn, cần đọc phản hồi vì người mua đặt điều kiện sau khi nhận đủ hàng. Những thay đổi này là lý do phải đọc cả hai tài liệu trước khi chốt đáp án."],
      },
    ],
    documents: [
      { label: "Email 1 · nhà cung cấp", paragraphs: ["To: Mai Nguyen | Subject: Order 314 — Chair Delivery", "Thank you for ordering 40 conference chairs. We can deliver 30 chairs on Tuesday, June 16. The remaining 10 chairs are delayed and will arrive on Thursday, June 18. Please let us know if this split delivery works for your office."] },
      { label: "Email 2 · phản hồi của khách hàng", paragraphs: ["To: Sales Team | Subject: Re: Order 314 — Chair Delivery", "The split delivery is fine. We will use the 30 chairs arriving Tuesday to prepare the new meeting room. The room opens on Friday, so Thursday's delivery of the final 10 chairs is still in time. Please send the invoice after all 40 chairs have arrived."] },
    ],
    questions: [
      {
        prompt: "How many chairs are scheduled to arrive on Tuesday?",
        options: ["10", "30", "40", "50"], answer: 1,
        explanation: "B. 30. Email đầu nói rõ ‘deliver 30 chairs on Tuesday’. Số 40 là toàn bộ đơn hàng; 10 là số ghế giao đợt sau vào Thursday. Email phản hồi cũng nhắc lại 30 ghế đến Tuesday.",
      },
      {
        prompt: "When does the customer want the invoice sent?",
        options: ["Before Tuesday's delivery", "On Tuesday morning", "After all the chairs arrive", "When the room opens on Friday"], answer: 2,
        explanation: "C. After all the chairs arrive. Câu cuối email phản hồi yêu cầu ‘send the invoice after all 40 chairs have arrived’. Friday là ngày mở phòng, không phải hạn gửi hóa đơn.",
      },
      {
        prompt: "Why does the customer accept the split delivery?",
        options: ["The supplier offered a lower price", "The room will open after the final delivery", "Only 30 chairs were ordered", "The invoice has already been paid"], answer: 1,
        explanation: "B. The room will open after the final delivery. 10 ghế cuối đến Thursday và phòng mở Friday, nên vẫn kịp chuẩn bị. Hai email không nhắc giảm giá hay thanh toán; đơn hàng là 40 ghế.",
      },
    ],
    review: "Xem lại từng câu và chỉ ra email nào chứa bằng chứng. Câu về hóa đơn và lý do chấp nhận giao đợt phải dựa vào phản hồi của khách hàng; câu về số lượng có thể đối chiếu cả hai email. Nếu bạn chọn sai, ghi rõ mình đã nhầm tổng số lượng, đợt giao hay thời điểm mở phòng.",
    related: [
      { href: "/toeic/part-7", label: "Tổng quan TOEIC Part 7", description: "Ôn kỹ thuật định vị thông tin và nhận ra cách diễn đạt lại." },
      { href: "/blog/meo-lam-toeic-part-7-doc-hieu-nhieu-van-ban", label: "Chiến lược đọc nhiều văn bản", description: "Mở rộng sang câu hỏi cần nối hai hoặc ba tài liệu." },
      { href: "/toeic/part-6/dien-cau-vao-doan-van", label: "Điền câu vào đoạn Part 6", description: "Luyện mạch ý trong một email trước khi đối chiếu nhiều tài liệu." },
    ],
  },
} satisfies Record<string, ReadingLongTailGuide>;
