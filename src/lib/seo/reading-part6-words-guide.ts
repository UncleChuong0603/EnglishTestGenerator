import type { ReadingLongTailGuide } from "./reading-long-tail";

export const readingPart6WordsGuide = {
  path: "/toeic/part-6/dien-tu-va-cum-tu",
  part: 6,
  breadcrumbLabel: "Điền từ và cụm từ",
  title: "TOEIC Part 6 điền từ và cụm từ: 9 câu có đáp án",
  description: "Luyện TOEIC Part 6 điền từ và cụm từ qua 3 văn bản, 9 câu tự biên soạn. Phân biệt từ loại, thì, bị động, giới từ, từ nối và nghĩa theo ngữ cảnh.",
  intro: "Một chỗ trống Part 6 có thể kiểm tra cấu trúc ngay trong câu hoặc yêu cầu bạn đọc các câu xung quanh để hiểu mạch ý. Bài luyện này tách riêng chín câu từ và cụm từ để bạn biết lúc nào chỉ cần nhìn cấu trúc, lúc nào phải đọc cả đoạn. Mỗi đáp án đều có lý do chọn và lý do loại phương án gây nhiễu.",
  sections: [
    {
      title: "Phân loại chỗ trống trước khi dịch",
      paragraphs: [
        "Hãy nhìn vị trí quanh chỗ trống trước. Nếu bốn lựa chọn cùng một gốc từ, xác định câu cần danh từ, động từ, tính từ hay trạng từ. Nếu các lựa chọn là những thì khác nhau, tìm mốc thời gian và xem chủ ngữ thực hiện hay nhận hành động. Nếu bốn đáp án đều đúng ngữ pháp, bạn phải đọc câu trước và sau để chọn từ nối hoặc từ vựng phù hợp với toàn đoạn.",
      ],
      steps: [
        "Đọc trọn câu chứa chỗ trống và nhận diện nhiệm vụ ngữ pháp.",
        "So sánh hình thức bốn đáp án: từ loại, thì, giới từ hay nghĩa.",
        "Đọc thêm câu trước và câu sau khi đáp án phụ thuộc quan hệ ý hoặc mốc thời gian.",
        "Điền lại đáp án rồi đọc liền cả đoạn để kiểm tra nghĩa và tính nhất quán.",
      ],
    },
    {
      title: "Khi nào phải mở rộng ra cả đoạn?",
      paragraphs: [
        "Câu từ loại thường giải được bằng cấu trúc trong một câu, nhưng đừng dừng quá sớm nếu từ được chọn làm câu vô nghĩa. Với từ nối như therefore, however hoặc meanwhile, quan hệ giữa hai câu mới là bằng chứng quyết định. Với thì động từ, một ngày tháng ở câu trước có thể xác định sự kiện đã hoàn thành, còn một lời hứa ở câu sau có thể báo hiệu tương lai.",
        "Ba đoạn dưới đây không sao chép đề ETS hay tài liệu của trung tâm khác. Chúng mô phỏng thao tác đọc của Part 6 và chỉ dùng kết quả để xác định nhóm lỗi cần ôn; chín câu không thể quy đổi thành điểm TOEIC chính thức.",
      ],
    },
  ],
  documents: [
    {
      label: "Văn bản 1 · thông báo bảo trì hệ thống",
      paragraphs: [
        "To: All Employees | Subject: Expense System Maintenance",
        "The online expense system will be [1] unavailable from 8 p.m. Friday until noon Saturday while a security update is installed. Access to saved reports [2] by noon on Saturday. [3], employees who need to submit a report before the weekend should do so by 6 p.m. Friday.",
      ],
    },
    {
      label: "Văn bản 2 · email về đơn hàng",
      paragraphs: [
        "Dear Ms. Le,",
        "Thank you for the order you [4] on September 28. Two of the desk lamps are ready to ship, but the blue model requires an [5] three business days. We can send the available items now at no extra charge. Please reply [6] Wednesday if you prefer one shipment after all three lamps are ready.",
      ],
    },
    {
      label: "Văn bản 3 · xác nhận hội thảo",
      paragraphs: [
        "Your registration for the Workplace Safety Workshop has been confirmed. Because [7] is limited to 24 people, please tell us promptly if you cannot participate. The instructor [8] that attendees bring a laptop for the afternoon activity. A loan device can be reserved [9] you contact the training team before Monday.",
      ],
    },
  ],
  questions: [
    {
      prompt: "[1]",
      options: ["temporary", "temporarily", "temporariness", "temporaries"],
      answer: 1,
      explanation: "B. temporarily. Chỗ trống bổ nghĩa cho tính từ unavailable nên cần trạng từ. A là tính từ; C là danh từ; D không phải hình thức phù hợp trong cấu trúc này.",
    },
    {
      prompt: "[2]",
      options: ["restored", "will restore", "will be restored", "has been restoring"],
      answer: 2,
      explanation: "C. will be restored. Saved reports là thứ được khôi phục, và mốc by noon on Saturday nói về tương lai nên cần bị động tương lai. A thiếu trợ động từ; B khiến reports thành chủ thể thực hiện; D diễn tả hành động kéo dài không phù hợp.",
    },
    {
      prompt: "[3]",
      options: ["However", "Therefore", "Meanwhile", "For example"],
      answer: 1,
      explanation: "B. Therefore. Hệ thống ngừng từ tối thứ Sáu tạo ra kết quả là người cần nộp trước cuối tuần nên hoàn tất trước 6 giờ. However chỉ tương phản; Meanwhile chỉ sự đồng thời; For example không giới thiệu một ví dụ.",
    },
    {
      prompt: "[4]",
      options: ["place", "placed", "will place", "placing"],
      answer: 1,
      explanation: "B. placed. Ngày September 28 là mốc đã qua và chỗ trống là động từ chính của mệnh đề bổ nghĩa cho order. A là hiện tại; C là tương lai; D cần cấu trúc khác để làm động từ chính.",
    },
    {
      prompt: "[5]",
      options: ["addition", "additional", "additionally", "add"],
      answer: 1,
      explanation: "B. additional. Chỗ trống đứng trước cụm danh từ three business days nên cần tính từ mang nghĩa thêm ba ngày. A là danh từ; C là trạng từ; D là động từ.",
    },
    {
      prompt: "[6]",
      options: ["by", "during", "among", "beside"],
      answer: 0,
      explanation: "A. by. By Wednesday đặt hạn chót không muộn hơn thứ Tư. During cần một khoảng thời gian; among dùng trong một nhóm; beside chỉ vị trí bên cạnh.",
    },
    {
      prompt: "[7]",
      options: ["attend", "attendance", "attentive", "attending"],
      answer: 1,
      explanation: "B. attendance. Sau because cần một mệnh đề và chỗ trống làm chủ ngữ của is limited, nên cần danh từ chỉ số người tham dự. A là động từ; C là tính từ; D không tự nhiên trong cấu trúc này.",
    },
    {
      prompt: "[8]",
      options: ["has requested", "is requesting yesterday", "request", "was request"],
      answer: 0,
      explanation: "A. has requested. Chủ ngữ số ít The instructor cần động từ chia phù hợp; hiện tại hoàn thành diễn tả yêu cầu hiện vẫn có hiệu lực. B mâu thuẫn giữa tiếp diễn hiện tại và yesterday; C chưa chia; D thiếu dạng phân từ requested trong bị động.",
    },
    {
      prompt: "[9]",
      options: ["unless", "if", "although", "despite"],
      answer: 1,
      explanation: "B. if. Thiết bị có thể được giữ với điều kiện người học liên hệ trước thứ Hai. Unless đảo thành nghĩa nếu không liên hệ; although tạo tương phản; despite phải đi với danh từ hoặc V-ing, không đi trực tiếp với mệnh đề đầy đủ này.",
    },
  ],
  review: "Chia chín câu thành bốn nhóm: từ loại ([1], [5], [7]), thì và thể ([2], [4], [8]), quan hệ ý ([3], [9]) và giới từ thời hạn ([6]). Với mỗi câu sai, ghi tín hiệu quyết định thay vì chỉ chép đáp án. Sau đó làm lại bằng cách che bốn lựa chọn và tự dự đoán loại từ hoặc ý nghĩa cần điền trước khi mở đáp án.",
  related: [
    { href: "/toeic/part-6", label: "Tổng quan TOEIC Part 6", description: "Xem cấu trúc 16 câu và cách phân biệt lỗi trong câu với lỗi mạch đoạn." },
    { href: "/toeic/part-6/dien-cau-vao-doan-van", label: "Điền cả câu vào đoạn văn", description: "Chuyển sang dạng cần nối bằng chứng ở cả hai phía chỗ trống." },
    { href: "/toeic/part-5/word-form", label: "Luyện loại từ Part 5", description: "Củng cố vị trí danh từ, động từ, tính từ và trạng từ bằng câu ngắn." },
    { href: "/blog/lien-tu-va-tu-noi-toeic", label: "Liên từ và từ nối TOEIC", description: "Ôn quan hệ nguyên nhân, kết quả và tương phản trước khi áp dụng vào đoạn văn." },
  ],
} satisfies ReadingLongTailGuide;
