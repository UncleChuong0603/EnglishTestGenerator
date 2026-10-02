import type { ReadingLongTailGuide } from "./reading-long-tail";

export const readingParaphraseGuide = {
  path: "/toeic/part-7/paraphrase-tu-dong-nghia",
  part: 7,
  breadcrumbLabel: "Paraphrase và từ đồng nghĩa",
  title: "Paraphrase TOEIC Part 7: từ đồng nghĩa và bài tập có đáp án",
  description: "Luyện nhận diện paraphrase và từ đồng nghĩa trong TOEIC Part 7 qua 6 câu tự biên soạn. Học cách đọc đúng ngữ cảnh, tránh bẫy lặp từ và xem bằng chứng.",
  intro: "Trong Part 7, câu hỏi và đáp án thường diễn đạt lại thông tin trong tài liệu thay vì lặp nguyên văn. Bài học này giúp bạn nhận ra ba kiểu chuyển đổi thường gặp: thay từ bằng cụm tương đương, đổi cấu trúc câu và nối nguyên nhân với kết quả. Sáu câu bên dưới đều có bằng chứng và lời giải đọc được ngay trên trang.",
  sections: [
    {
      title: "Đối chiếu cả ý, không ghép từng từ riêng lẻ",
      paragraphs: [
        "Paraphrase giữ nguyên ý chính nhưng có thể đổi từ loại, chủ thể hoặc cấu trúc. Chẳng hạn, “fees will be reimbursed” có thể xuất hiện trong đáp án dưới dạng “the company will repay the cost.” Hai câu dùng từ khác nhau nhưng cùng nêu người lao động được hoàn lại tiền. Một lựa chọn lặp đúng từ parking vẫn có thể sai nếu đổi người thực hiện hoặc điều kiện nhận tiền.",
      ],
      steps: [
        "Khoanh chủ thể, hành động, đối tượng và mốc thời gian trong câu hỏi.",
        "Tìm câu trong tài liệu nói về cùng sự việc, rồi diễn đạt câu đó bằng tiếng Việt ngắn gọn.",
        "So từng lựa chọn với toàn bộ ý; loại phương án thêm điều kiện hoặc đổi thời điểm.",
        "Với câu hỏi closest in meaning, thay từ được hỏi bằng từng lựa chọn và đọc lại cả câu.",
      ],
    },
    {
      title: "Ba kiểu paraphrase cần nhận ra",
      paragraphs: [
        "Kiểu thứ nhất là từ hoặc cụm gần nghĩa trong đúng ngữ cảnh, như unavailable và cannot be used. Kiểu thứ hai đổi cấu trúc: “the company will reimburse employees” và “employees will receive repayment” chuyển giữa chủ động và bị động. Kiểu thứ ba đổi quan hệ diễn đạt: tài liệu nêu phòng có sức chứa hạn chế, còn đáp án kết luận số chỗ ngồi không đủ cho mọi người. Với kiểu thứ ba, chỉ chọn kết luận được dữ kiện hỗ trợ trực tiếp.",
        "Từ đồng nghĩa không thay thế được cho nhau trong mọi câu. “Available” có thể nói về hàng còn trong kho, người rảnh hoặc dịch vụ đang hoạt động. Vì vậy, luôn đọc câu chứa từ và ít nhất một câu bên cạnh trước khi chọn nghĩa.",
      ],
    },
  ],
  documents: [
    {
      label: "Tài liệu 1 · thông báo bãi đỗ xe",
      paragraphs: [
        "The west parking lot will be unavailable on Thursday because its entrance is being repaired. Employees should use Riverside Garage instead. The company will reimburse parking fees after employees submit their receipts to the finance office.",
      ],
    },
    {
      label: "Tài liệu 2 · email đăng ký hội thảo",
      paragraphs: [
        "All participants must complete registration by May 8. Anyone who signs up after the deadline will be placed on a waiting list. Because the training room has limited capacity, attendance cannot be guaranteed for people on that list.",
      ],
    },
    {
      label: "Tài liệu 3 · email từ nhà cung cấp",
      paragraphs: [
        "The Model X printer is no longer in stock. We can provide the Model Y at the same price, and it includes a wireless connection. Please reply by Friday if this substitute is acceptable. Otherwise, we will refund your deposit.",
      ],
    },
  ],
  questions: [
    {
      prompt: "In Document 1, the word “unavailable” is closest in meaning to",
      options: ["free of charge", "not able to be used", "easy to enter", "open for visitors"],
      answer: 1,
      explanation: "B. not able to be used. Lối vào đang được sửa nên bãi phía tây không thể sử dụng vào thứ Năm. A nói về giá; C và D trái với việc bãi xe đóng do sửa chữa.",
    },
    {
      prompt: "Which statement best paraphrases the parking-fee policy?",
      options: ["Employees must pay the finance office in advance.", "Riverside Garage will waive every parking charge.", "The company will repay employees who provide receipts.", "Only finance employees may use the alternate garage."],
      answer: 2,
      explanation: "C. The company will repay employees who provide receipts. “Reimburse parking fees” là hoàn lại chi phí, còn “after employees submit their receipts” là điều kiện cung cấp biên lai. A đảo chiều thanh toán; B đổi người trả; D thêm giới hạn không có trong thông báo.",
    },
    {
      prompt: "In Document 2, being “placed on a waiting list” means that a late registrant",
      options: ["has a confirmed seat", "may attend if a place becomes available", "must choose another workshop", "can ignore the registration deadline"],
      answer: 1,
      explanation: "B. may attend if a place becomes available. Email nói chỗ tham dự không được bảo đảm cho người trong danh sách chờ. A trái với chi tiết này; C không được nêu; D bỏ qua hậu quả của việc đăng ký muộn.",
    },
    {
      prompt: "Why is attendance not guaranteed for people on the waiting list?",
      options: ["The instructor may cancel the workshop.", "The room cannot hold an unlimited number of people.", "The registration website closes every Friday.", "Participants must pay an additional fee."],
      answer: 1,
      explanation: "B. The room cannot hold an unlimited number of people. “The training room has limited capacity” được diễn đạt lại thành số người mà phòng chứa được có giới hạn. Các lý do A, C và D không xuất hiện trong email.",
    },
    {
      prompt: "In Document 3, “no longer in stock” is closest in meaning to",
      options: ["not currently available for purchase", "available at a reduced price", "ready to be repaired", "reserved for a different customer"],
      answer: 0,
      explanation: "A. not currently available for purchase. Nhà cung cấp không còn Model X để giao nên đề nghị Model Y thay thế. B, C và D thêm thông tin mà email không nêu.",
    },
    {
      prompt: "What is the supplier offering to do?",
      options: ["Repair the Model X by Friday", "Sell the Model Y without increasing the price", "Add wireless service to the Model X", "Keep the deposit in every case"],
      answer: 1,
      explanation: "B. Sell the Model Y without increasing the price. “Provide the Model Y at the same price” là đề nghị mẫu thay thế mà không tăng giá. A và C gán hành động cho Model X không còn hàng; D trái với lời hứa hoàn tiền nếu khách không chấp nhận.",
    },
  ],
  review: "Với mỗi câu, ghi cặp diễn đạt tương đương thành hai vế, chẳng hạn “reimburse parking fees ↔ repay the parking cost.” Sau đó đánh dấu phần nghĩa quyết định: ai được hoàn tiền, khi nào và với điều kiện gì. Nếu chọn nhầm phương án lặp từ trong tài liệu, hãy chỉ ra chi tiết nào của phương án đó đã đổi chủ thể, thời gian hoặc kết quả. Cuối cùng, tự viết một câu paraphrase mới cho một bằng chứng mà không nhìn bốn lựa chọn.",
  related: [
    { href: "/toeic/part-7", label: "Tổng quan TOEIC Part 7", description: "Đặt kỹ năng paraphrase vào quy trình tìm bằng chứng cho từng dạng câu hỏi." },
    { href: "/toeic/part-7/doc-hieu-mot-doan-van", label: "Bài đọc một văn bản", description: "Áp dụng nghĩa theo ngữ cảnh trong một email hoàn chỉnh có bốn câu hỏi." },
    { href: "/toeic/part-7/doc-hieu-hai-doan-van", label: "Bài đọc hai văn bản", description: "Nhận ra cách thông tin được nhắc lại và cập nhật giữa hai email." },
    { href: "/blog/quan-ly-thoi-gian-toeic-reading-75-phut", label: "Chia thời gian TOEIC Reading", description: "Kết hợp kỹ năng định vị và paraphrase trong một kế hoạch 75 phút." },
  ],
} satisfies ReadingLongTailGuide;
