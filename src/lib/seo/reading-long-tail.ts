import { readingParaphraseGuide } from "./reading-paraphrase-guide";
import { readingPart6WordsGuide } from "./reading-part6-words-guide";

export type ReadingSampleQuestion = {
  prompt: string;
  options: readonly [string, string, string, string];
  answer: number;
  explanation: string;
};

export type ReadingLongTailGuide = {
  path: string;
  part: 6 | 7;
  breadcrumbLabel: string;
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
  paraphrase: readingParaphraseGuide,
  wordPhraseCompletion: readingPart6WordsGuide,
  sentenceInsertion: {
    path: "/toeic/part-6/dien-cau-vao-doan-van",
    part: 6,
    breadcrumbLabel: "Điền câu vào đoạn",
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
      { href: "/toeic/part-6/dien-tu-va-cum-tu", label: "Điền từ và cụm từ Part 6", description: "Luyện chín câu về cấu trúc trong câu và quan hệ ý giữa các câu." },
      { href: "/toeic/part-7/doc-hieu-hai-doan-van", label: "Đọc hiểu hai đoạn văn Part 7", description: "Luyện đối chiếu bằng chứng giữa hai tài liệu." },
      { href: "/try#quick-practice", label: "Thử bài Reading dài hơn", description: "Chuyển từ một câu mẫu sang nhóm câu hỏi theo Part." },
    ],
  },
  singlePassage: {
    path: "/toeic/part-7/doc-hieu-mot-doan-van",
    part: 7,
    breadcrumbLabel: "Một văn bản",
    title: "TOEIC Part 7 một đoạn văn: bài tập email có đáp án",
    description: "Luyện TOEIC Part 7 dạng một đoạn văn bằng email tự biên soạn. Làm 4 câu về mục đích, chi tiết, hành động và từ vựng, rồi xem bằng chứng cho từng đáp án.",
    intro: "Dạng một văn bản là nơi phù hợp để tập thói quen trả lời bằng bằng chứng trước khi chuyển sang bài đọc đôi hoặc ba. Bài mẫu dưới đây giúp bạn nhận diện mục đích email, định vị một chi tiết, làm theo hướng dẫn và hiểu từ trong đúng ngữ cảnh.",
    sections: [
      {
        title: "Nhìn cấu trúc tài liệu trước khi đọc từng câu",
        paragraphs: ["Với email hoặc thông báo ngắn, hãy đọc dòng chủ đề, câu mở đầu và câu kết trước. Ba vị trí này thường cho biết vì sao tài liệu được viết, thay đổi nào đang xảy ra và người đọc cần làm gì. Sau đó phân loại câu hỏi: mục đích cần nhìn toàn tài liệu; chi tiết và hành động cần định vị đúng câu; từ vựng cần đọc cả câu chứa từ đó."],
        steps: ["Đọc tiêu đề và xác định loại văn bản.", "Xem câu hỏi đang hỏi mục đích, chi tiết, hành động hay nghĩa trong ngữ cảnh.", "Tìm câu chứa bằng chứng rồi diễn đạt lại bằng lời của bạn.", "Chọn phương án khớp toàn bộ ý và mốc thời gian, không chỉ trùng một từ."],
      },
      {
        title: "Giữ đúng đối tượng và địa điểm",
        paragraphs: ["Một tài liệu có thể nhắc đến khách, nhân viên và người giao hàng cùng lúc. Trong bài mẫu, khách đến quầy tạm thời ở Room 105, còn việc giao hàng vẫn diễn ra tại loading dock. Hai địa điểm đều đúng nhưng phục vụ hai nhóm khác nhau. Khi sửa bài, hãy gạch cả danh từ chỉ người và hành động đi cùng địa điểm."],
      },
    ],
    documents: [{
      label: "Email nội bộ · bài mẫu tự biên soạn",
      paragraphs: [
        "To: All Staff | Subject: Temporary Reception Desk",
        "Beginning Monday, November 4, the main lobby floor will be replaced. During the work, the reception desk will operate from Room 105, across from the cafeteria. Visitors should enter through the east entrance and go directly to Room 105. If the east entrance is locked, they should call extension 204 for assistance. Deliveries will continue to be accepted at the loading dock. Regular lobby reception will resume on Monday, November 11.",
      ],
    }],
    questions: [
      {
        prompt: "What is the purpose of the email?",
        options: ["To announce temporary reception arrangements", "To invite staff to a cafeteria event", "To request bids for floor replacement", "To change the company delivery schedule"],
        answer: 0,
        explanation: "A. To announce temporary reception arrangements. Email giải thích quầy lễ tân chuyển sang Room 105 trong lúc thay sàn sảnh chính và hướng dẫn khách đi vào đâu. B, C và D không phải mục đích của email; lịch nhận hàng vẫn tiếp tục như cũ.",
      },
      {
        prompt: "Where should visitors go during the lobby work?",
        options: ["The loading dock", "Room 105", "The main lobby", "The cafeteria"],
        answer: 1,
        explanation: "B. Room 105. Email nói reception desk will operate from Room 105 và visitors should go directly there. Cafeteria chỉ là mốc đối diện; loading dock dành cho deliveries; main lobby đang được thay sàn.",
      },
      {
        prompt: "What should visitors do if the east entrance is locked?",
        options: ["Return on November 11", "Wait at the loading dock", "Call extension 204", "Contact the cafeteria"],
        answer: 2,
        explanation: "C. Call extension 204. Câu hướng dẫn nêu trực tiếp: ‘If the east entrance is locked, they should call extension 204 for assistance.’ Các lựa chọn còn lại không phải hành động được yêu cầu.",
      },
      {
        prompt: "The word “resume” is closest in meaning to",
        options: ["move", "stop", "begin again", "remain hidden"],
        answer: 2,
        explanation: "C. begin again. ‘Regular lobby reception will resume on Monday, November 11’ nghĩa là hoạt động lễ tân tại sảnh chính sẽ bắt đầu lại sau giai đoạn tạm chuyển. Move mô tả việc đổi chỗ; stop và remain hidden trái với ý khôi phục hoạt động.",
      },
    ],
    review: "Với câu 1, hãy tóm tắt toàn email trong một câu. Với câu 2 và 3, chỉ đúng câu chứa địa điểm hoặc hành động. Với câu 4, thay resume bằng begin again rồi đọc lại câu để kiểm tra nghĩa. Nếu chọn sai, ghi mình đã nhầm đối tượng, địa điểm, hành động hay nghĩa trong ngữ cảnh trước khi làm bài hai văn bản.",
    related: [
      { href: "/toeic/part-7", label: "Tổng quan TOEIC Part 7", description: "Ôn các dạng câu hỏi và cách định vị bằng chứng." },
      { href: "/toeic/part-7/paraphrase-tu-dong-nghia", label: "Paraphrase và từ đồng nghĩa Part 7", description: "Luyện sáu câu về cách diễn đạt lại và nghĩa trong ngữ cảnh." },
      { href: "/toeic/part-7/doc-hieu-hai-doan-van", label: "Đọc hiểu hai văn bản", description: "Tiếp tục bằng bài cần đối chiếu hai email." },
      { href: "/toeic/part-7/doc-hieu-ba-van-ban", label: "Đọc hiểu ba văn bản", description: "Luyện nối lịch, số lượng và email cập nhật." },
      { href: "/blog/quan-ly-thoi-gian-toeic-reading-75-phut", label: "Chia thời gian Reading", description: "Tạo mốc thời gian để giữ đủ phút cho Part 7." },
    ],
  },
  doublePassage: {
    path: "/toeic/part-7/doc-hieu-hai-doan-van",
    part: 7,
    breadcrumbLabel: "Hai văn bản",
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
      { href: "/toeic/part-7/paraphrase-tu-dong-nghia", label: "Bài tập paraphrase Part 7", description: "Tách riêng kỹ năng nhận diện từ đồng nghĩa và cách đổi cấu trúc." },
      { href: "/toeic/part-7/doc-hieu-mot-doan-van", label: "Bài đọc một văn bản Part 7", description: "Luyện từng dạng câu hỏi trên một email trước khi đối chiếu hai nguồn." },
      { href: "/toeic/part-7/doc-hieu-ba-van-ban", label: "Bài đọc ba văn bản Part 7", description: "Nối lịch sự kiện với hai email để giải câu hỏi liên văn bản." },
      { href: "/blog/meo-lam-toeic-part-7-doc-hieu-nhieu-van-ban", label: "Chiến lược đọc nhiều văn bản", description: "Mở rộng sang câu hỏi cần nối hai hoặc ba tài liệu." },
      { href: "/toeic/part-6/dien-cau-vao-doan-van", label: "Điền câu vào đoạn Part 6", description: "Luyện mạch ý trong một email trước khi đối chiếu nhiều tài liệu." },
    ],
  },
  triplePassage: {
    path: "/toeic/part-7/doc-hieu-ba-van-ban",
    part: 7,
    breadcrumbLabel: "Ba văn bản",
    title: "TOEIC Part 7 ba văn bản: bài tập triple passage có lời giải",
    description: "Luyện TOEIC Part 7 dạng ba văn bản bằng thông báo và hai email tự biên soạn. Làm 5 câu, đối chiếu lịch, số lượng và phương án xử lý giao hàng chậm.",
    intro: "Với ba văn bản, đáp án có thể nằm ở chỗ giao nhau giữa lịch sự kiện, yêu cầu đặt hàng và email cập nhật. Bài tập này cho bạn thực hành tìm tài liệu chứa dữ kiện đầu tiên, rồi kiểm tra xem tài liệu sau có thay đổi kế hoạch đó hay không.",
    sections: [
      {
        title: "Tạo bản đồ ba tài liệu trước khi đọc chi tiết",
        paragraphs: ["Thông báo sự kiện cho biết mỗi hoạt động diễn ra khi nào và cần bao nhiêu ghế. Email đặt hàng cho biết ban tổ chức dự kiến nhận hàng ra sao. Phản hồi của nhà cung cấp thay đổi một phần lịch giao. Nếu câu hỏi hỏi hoạt động nào vẫn đúng kế hoạch, bạn phải ghép thời điểm hoạt động với số ghế thực sự sẽ tới trước đó."],
        steps: ["Đọc tiêu đề, người gửi và mục đích của từng tài liệu; gắn nhãn lịch, yêu cầu, cập nhật.", "Nhìn câu hỏi để xác định dữ kiện cần tìm: thời điểm, số lượng hay hành động.", "Đánh dấu dữ kiện ở tài liệu đầu rồi kiểm tra xem email mới nhất có sửa nó không.", "Chọn đáp án chỉ khi có câu trong tài liệu chứng minh; ghi cả hai tài liệu nếu câu hỏi cần đối chiếu."],
      },
      {
        title: "Phân biệt hạn đăng ký với hạn xác nhận phương án thay thế",
        paragraphs: ["Một ngày có thể xuất hiện ở nhiều việc khác nhau. Trong bài mẫu, người tham dự đăng ký sự kiện trước ngày 12 tháng 10; nhà cung cấp cũng cần được xác nhận việc dùng ghế mượn trước ngày đó. Hai hạn trùng nhau nhưng người chịu trách nhiệm và hành động khác nhau. Đọc động từ đi cùng ngày tháng để tránh chọn đáp án chỉ vì nhận ra con số."],
      },
      {
        title: "Làm bài rồi chỉ ra đường đi của bằng chứng",
        paragraphs: ["Sau khi trả lời, hãy viết ngắn gọn ‘thông báo → email nhà cung cấp’ bên cạnh câu cần đối chiếu. Câu chỉ hỏi số ghế giao đợt đầu có thể giải bằng email cuối. Câu hỏi về buổi học nào bị ảnh hưởng cần ít nhất lịch hoạt động trong thông báo và lịch giao cập nhật. Thao tác này giúp phát hiện bạn đang đọc thừa hay bỏ sót một văn bản."],
      },
    ],
    documents: [
      {
        label: "Văn bản 1 · thông báo sự kiện",
        paragraphs: [
          "Workplace Skills Week — Event Notice",
          "A product demonstration will take place in Room B on October 16 at 1 p.m. Thirty chairs are needed. A staff training session will take place in Room C on October 18 at 9 a.m. Ten chairs are needed there. Participants must register by October 12.",
        ],
      },
      {
        label: "Văn bản 2 · email đặt hàng",
        paragraphs: [
          "To: Cedar Office Supply | From: Nhi Tran | Subject: Order 842 — 40 folding chairs",
          "As agreed, please deliver all 40 folding chairs by October 15. We need 30 chairs for the product demonstration in Room B and the other 10 for staff training in Room C. Please let me know immediately if either part of the delivery will be late.",
        ],
      },
      {
        label: "Văn bản 3 · phản hồi nhà cung cấp",
        paragraphs: [
          "To: Nhi Tran | From: Cedar Office Supply | Subject: Re: Order 842 — Delivery Update",
          "We can deliver 30 chairs on October 15. Because one shipment is delayed, the remaining 10 chairs will arrive on October 19. We can provide 10 loaner chairs on October 17 for your training session if you confirm this arrangement by October 12. We will collect the loaner chairs on October 19.",
        ],
      },
    ],
    questions: [
      {
        prompt: "Which event can use the ordered chairs as originally planned?",
        options: ["The product demonstration", "The staff training session", "Both events", "Neither event"],
        answer: 0,
        explanation: "A. The product demonstration. Thông báo nói buổi demo ngày 16/10 cần 30 ghế; email cuối xác nhận 30 ghế giao ngày 15/10. Buổi training ngày 18/10 cần 10 ghế còn lại, nhưng ghế đặt mua đến ngày 19/10. Vì vậy B và C sai; D bỏ qua đợt giao đầu.",
      },
      {
        prompt: "What should Ms. Tran do to have chairs for the staff training session?",
        options: ["Move the training to Room B", "Confirm the loaner-chair arrangement by October 12", "Cancel participant registration", "Wait for the ordered chairs on October 19"],
        answer: 1,
        explanation: "B. Confirm the loaner-chair arrangement by October 12. Thông báo xếp training ngày 18/10; phản hồi nhà cung cấp đề nghị 10 ghế mượn giao ngày 17/10 nếu xác nhận trước 12/10. A và C không xuất hiện trong tài liệu; D quá muộn so với buổi training.",
      },
      {
        prompt: "How many ordered chairs will arrive on October 15?",
        options: ["10", "20", "30", "40"],
        answer: 2,
        explanation: "C. 30. Email cuối xác nhận 30 ghế giao ngày 15/10. Mười ghế còn lại giao ngày 19/10; 40 là tổng đơn hàng trong email đặt mua, không phải số ghế giao đợt đầu.",
      },
      {
        prompt: "When must participants register for Workplace Skills Week?",
        options: ["October 12", "October 15", "October 17", "October 19"],
        answer: 0,
        explanation: "A. October 12. Thông báo sự kiện nói rõ participants must register by October 12. Cùng ngày này cũng là hạn xác nhận ghế mượn trong email nhà cung cấp, nhưng câu hỏi đang hỏi người tham dự đăng ký.",
      },
      {
        prompt: "Why are loaner chairs offered?",
        options: ["The demonstration needs more than 30 chairs", "The training room is being renovated", "The remaining ordered chairs will arrive after the training", "Participants requested a different room"],
        answer: 2,
        explanation: "C. The remaining ordered chairs will arrive after the training. Training diễn ra ngày 18/10 theo thông báo, trong khi 10 ghế đặt mua còn lại đến 19/10 theo email cập nhật. Ghế mượn ngày 17/10 lấp khoảng trống đó. Các lý do A, B và D không được tài liệu hỗ trợ.",
      },
    ],
    review: "Với câu 1 và 5, hãy chỉ ra ít nhất hai bằng chứng ở hai văn bản khác nhau: lịch cần ghế và lịch giao mới. Với câu 2, kiểm tra thêm hạn xác nhận phương án ghế mượn. Sau đó thử trả lời lại mà không nhìn lựa chọn để xem bạn thực sự nối được ba tài liệu hay chỉ nhận ra một con số quen mắt.",
    related: [
      { href: "/toeic/part-7", label: "Tổng quan TOEIC Part 7", description: "Ôn các dạng câu hỏi và cách định vị bằng chứng." },
      { href: "/toeic/part-7/paraphrase-tu-dong-nghia", label: "Bài tập paraphrase Part 7", description: "Ôn cách xác nhận một đáp án diễn đạt lại đúng toàn bộ ý." },
      { href: "/toeic/part-7/doc-hieu-mot-doan-van", label: "Đọc hiểu một văn bản", description: "Ôn cách tìm mục đích, chi tiết và nghĩa trong một email." },
      { href: "/toeic/part-7/doc-hieu-hai-doan-van", label: "Đọc hiểu hai văn bản", description: "Bắt đầu với tình huống hai email ngắn hơn." },
      { href: "/blog/meo-lam-toeic-part-7-doc-hieu-nhieu-van-ban", label: "Chiến lược đọc nhiều văn bản", description: "Xem quy trình đọc và sửa lỗi cho câu hỏi liên văn bản." },
    ],
  },
} satisfies Record<string, ReadingLongTailGuide>;
