import type { ReadingLongTailGuide } from "./reading-long-tail";

export const readingInferenceGuide = {
  path: "/toeic/part-7/cau-hoi-suy-luan",
  part: 7,
  breadcrumbLabel: "Câu hỏi suy luận",
  title: "Câu hỏi suy luận TOEIC Part 7: 6 câu có đáp án và bằng chứng",
  description: "Luyện 6 câu hỏi suy luận TOEIC Part 7 qua 3 tài liệu tự biên soạn. Học cách ghép bằng chứng, giới hạn kết luận và loại đáp án thêm thông tin.",
  publishedAt: "2026-10-04T00:00:00+07:00",
  updatedAt: "2026-10-04T00:00:00+07:00",
  intro: "Câu suy luận không yêu cầu đoán tự do. Đáp án đúng phải là kết luận chắc chắn hoặc hợp lý nhất khi ghép các chi tiết có trong tài liệu. Bài luyện này tập trung vào ba thao tác: nối mốc thời gian, kết hợp số lượng và nhận ra hành động nhiều khả năng sẽ xảy ra.",
  sections: [
    {
      title: "Suy luận trong phạm vi bằng chứng",
      paragraphs: [
        "Hãy xem mỗi lựa chọn như một kết luận cần được chứng minh. Một đáp án có vẻ hợp lý trong đời thực vẫn sai nếu tài liệu không cung cấp đủ dữ kiện. Khi email nói cửa hàng mở cho công chúng vào thứ Hai và nhân viên mới dự buổi chuẩn bị vào thứ Bảy, bạn có thể kết luận người đó đến trước ngày khai trương. Bạn không thể kết luận doanh thu, số khách hay mức lương vì bài không nhắc đến những thông tin đó.",
      ],
      steps: [
        "Gạch chân từ khóa giới hạn trong câu hỏi: inferred, most likely hoặc suggests.",
        "Tìm ít nhất hai chi tiết cùng nói về người, vật hoặc thời điểm đang được hỏi.",
        "Viết kết luận ngắn bằng lời của bạn trước khi xem bốn lựa chọn.",
        "Loại phương án dùng từ tuyệt đối hoặc thêm nguyên nhân, cảm xúc hay kế hoạch không có bằng chứng.",
      ],
    },
    {
      title: "Ba kiểu nối dữ kiện thường gặp",
      paragraphs: [
        "Mốc thời gian cho biết sự kiện nào xảy ra trước hoặc sau. Số lượng cho phép bạn cộng, trừ hoặc xác định phần còn thiếu. Hành động và phản hồi cho biết người đọc nhiều khả năng sẽ làm gì tiếp theo. Trong cả ba kiểu, đáp án đúng thường diễn đạt lại kết quả của hai chi tiết thay vì lặp nguyên văn một câu.",
        "Nếu chỉ một câu đã nêu trực tiếp đáp án, đó thường là câu hỏi chi tiết. Với câu suy luận, hãy tự chỉ ra chuỗi bằng chứng, chẳng hạn “12 màn hình giao thứ Hai + mượn 3 chiếc thứ Ba = đủ 15 chiếc cho thứ Tư.” Chuỗi này cũng giúp bạn nhận ra ngay lựa chọn nào thêm giả định.",
      ],
    },
  ],
  documents: [
    {
      label: "Tài liệu 1 · email cho nhân viên mới",
      paragraphs: [
        "To: Elena Ortiz | Subject: Harbor Street Store Orientation",
        "The renovation of our Harbor Street store will finish on Friday, June 14. All newly hired sales assistants should attend an orientation from 8:30 to 11:00 a.m. on Saturday, June 15. The store will open to the public on Monday, June 17. Ms. Ortiz, your security badge will be waiting at the service entrance. Please wear comfortable shoes because the team will arrange merchandise displays after the orientation.",
      ],
    },
    {
      label: "Tài liệu 2 · chuỗi email chuẩn bị phòng đào tạo",
      paragraphs: [
        "From: Northline Office Supply | Monday, 9:10 a.m.\nWe can deliver 12 of the 20 monitors you ordered this afternoon. The remaining eight will arrive on Thursday.",
        "From: Facilities Manager | Monday, 10:05 a.m.\nThe software training in Room 3 begins Wednesday and requires 15 monitors. I have arranged to borrow three monitors from the fourth-floor team after 4 p.m. Tuesday. We will return them on Friday.",
      ],
    },
    {
      label: "Tài liệu 3 · thông tin đi lại cho hội thảo",
      paragraphs: [
        "Free conference shuttles leave Stop B at Central Station every 20 minutes from 8:00 to 9:00 a.m. The first session begins at 9:30 a.m. Luggage storage is available beside the registration desk.",
        "Message from Minh Tran: My train is scheduled to reach Central Station at 8:40 a.m. I will have one suitcase with me. Should I go directly to the conference venue?\nReply from organizer: Yes. Follow the signs to Stop B when you leave the platform.",
      ],
    },
  ],
  questions: [
    {
      prompt: "What can be inferred about Ms. Ortiz?",
      options: ["She will visit the store before it opens to the public.", "She completed the renovation work.", "She has managed the store since Friday.", "She will receive her badge by mail."],
      answer: 0,
      explanation: "A. She will visit the store before it opens to the public. Ms. Ortiz phải dự orientation ngày 15/6, còn cửa hàng mở cho công chúng ngày 17/6. B, C và D thêm vai trò hoặc cách nhận thẻ không có trong email; thẻ được để ở service entrance.",
    },
    {
      prompt: "What will Ms. Ortiz most likely do after the orientation?",
      options: ["Meet customers at the main entrance", "Inspect the renovation company", "Help arrange merchandise displays", "Order security badges for the team"],
      answer: 2,
      explanation: "C. Help arrange merchandise displays. Email yêu cầu mang giày thoải mái vì the team will arrange merchandise displays after the orientation. Cửa hàng chưa mở cho công chúng, và tài liệu không nói cô ấy kiểm tra nhà thầu hay đặt thẻ.",
    },
    {
      prompt: "What can be inferred about the training room on Wednesday?",
      options: ["It will contain all 20 ordered monitors.", "It will have the 15 monitors required for training.", "It will be moved to the fourth floor.", "It will remain closed until Thursday."],
      answer: 1,
      explanation: "B. It will have the 15 monitors required for training. 12 máy được giao thứ Hai và 3 máy được mượn chiều thứ Ba, vừa đủ 15 máy cho thứ Tư. Tám máy còn lại chỉ đến thứ Năm, nên A sai; C và D không được nêu.",
    },
    {
      prompt: "Why will the borrowed monitors most likely be returned on Friday?",
      options: ["The training will move to the fourth floor.", "The supplier will collect all 20 monitors.", "Room 3 will purchase different equipment.", "The remaining ordered monitors will have arrived."],
      answer: 3,
      explanation: "D. The remaining ordered monitors will have arrived. Tám máy còn lại đến thứ Năm, sau đó ba máy mượn có thể được trả vào thứ Sáu. A, B và C không có bằng chứng trong hai email.",
    },
    {
      prompt: "How will Mr. Tran most likely travel from the station to the venue?",
      options: ["By a train leaving at 9:00", "In the organizer's car", "By the free conference shuttle", "On a bus from the registration desk"],
      answer: 2,
      explanation: "C. By the free conference shuttle. Tàu của ông Tran đến lúc 8:40, trong khung shuttle 8:00–9:00, và organizer hướng dẫn đi tới Stop B là điểm đón. Các phương án khác không xuất hiện trong tài liệu.",
    },
    {
      prompt: "What does the organizer's reply suggest about Mr. Tran's suitcase?",
      options: ["He must leave it at Central Station overnight.", "He can store it at the venue before the first session.", "It will be delivered to his hotel.", "It is too large for the shuttle."],
      answer: 1,
      explanation: "B. He can store it at the venue before the first session. Organizer bảo ông đi thẳng tới venue, nơi có khu giữ hành lý cạnh quầy đăng ký. A, C và D thêm yêu cầu hoặc dịch vụ mà tài liệu không nêu.",
    },
  ],
  review: "Với mỗi câu, viết chuỗi bằng chứng bằng dấu cộng hoặc mũi tên. Sau đó khoanh phần của đáp án đúng có thể chứng minh được từ chuỗi đó. Với đáp án sai, đánh dấu từ hoặc ý đã vượt quá bài đọc, chẳng hạn chức danh, cảm xúc, mức độ tuyệt đối hoặc một kế hoạch chưa được nói đến. Cuối cùng, che bốn lựa chọn và tự trả lời lại bằng một câu ngắn.",
  related: [
    { href: "/toeic/part-7", label: "Tổng quan TOEIC Part 7", description: "Đặt câu suy luận vào quy trình đọc mục đích, chi tiết và nghĩa theo ngữ cảnh." },
    { href: "/toeic/part-7/paraphrase-tu-dong-nghia", label: "Paraphrase và từ đồng nghĩa", description: "Nhận ra cách đáp án diễn đạt lại kết luận từ bằng chứng trong bài." },
    { href: "/toeic/part-7/doc-hieu-mot-doan-van", label: "Đọc hiểu một văn bản", description: "Luyện định vị thông tin trong một email trước khi nối nhiều chi tiết." },
    { href: "/toeic/part-7/doc-hieu-hai-doan-van", label: "Đọc hiểu hai văn bản", description: "Áp dụng suy luận khi phải đối chiếu hai tài liệu." },
  ],
} satisfies ReadingLongTailGuide;
