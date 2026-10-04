import type { ReadingLongTailGuide } from "./reading-long-tail";

export const readingChatGuide = {
  path: "/toeic/part-7/doan-tin-nhan",
  part: 7,
  breadcrumbLabel: "Đoạn tin nhắn",
  title: "TOEIC Part 7 đoạn tin nhắn: 6 câu Text Message Chain có đáp án",
  description: "Luyện TOEIC Part 7 dạng đoạn tin nhắn qua 3 cuộc trò chuyện và 6 câu tự biên soạn. Theo dõi người nói, mốc giờ, đại từ và thay đổi kế hoạch.",
  publishedAt: "2026-10-04T00:00:00+07:00",
  updatedAt: "2026-10-04T00:00:00+07:00",
  intro: "Dạng Text Message Chain buộc bạn đọc cả nội dung lẫn cấu trúc cuộc trò chuyện: ai đang phản hồi ai, tin nào cập nhật kế hoạch cũ và một đại từ đang chỉ điều gì. Ba đoạn chat dưới đây giúp bạn luyện theo dõi người nói, mốc giờ và hành động tiếp theo mà không phải đăng nhập.",
  sections: [
    {
      title: "Đọc tên người gửi cùng mốc giờ",
      paragraphs: [
        "Mỗi tin nhắn là một lượt hành động. Tên người gửi cho biết ai đưa ra vấn đề, ai nhận việc và ai chỉ xác nhận. Mốc giờ cho biết thông tin nào xuất hiện sau cùng và có thể thay đổi kế hoạch trước đó. Nếu một người hỏi “Can I update the inventory until the repair is finished?” rồi quản lý trả lời “Yes”, hành động trong câu hỏi đã được chấp thuận.",
      ],
      steps: [
        "Đọc câu hỏi để xác định người hoặc thời điểm cần theo dõi.",
        "Gạch tên người gửi và động từ chính trong từng tin nhắn.",
        "Nối câu hỏi với câu trả lời hoặc xác nhận xuất hiện ngay sau đó.",
        "Kiểm tra tin cuối để xem kế hoạch đã được chốt, thay đổi hay bổ sung điều kiện nào.",
      ],
    },
    {
      title: "Giải đại từ và câu trả lời ngắn theo ngữ cảnh",
      paragraphs: [
        "Các từ như it, them, there, then và as soon as không thể hiểu riêng lẻ. Hãy thay chúng bằng danh từ hoặc thời điểm cụ thể từ tin trước. “I’ll take my break before then” phải được nối với mốc 3 giờ vừa được nhắc đến. “Just sent it” phải được nối với email ủy quyền mà người nói được yêu cầu gửi.",
        "Đừng mặc định người gửi tin cuối là người thực hiện mọi hành động. Một người có thể giao việc, người thứ hai nhận việc và người thứ ba chỉ cung cấp điều kiện. Ghi một dòng ngắn theo mẫu “ai – làm gì – lúc nào” giúp tránh nhầm vai trò khi ba người cùng xuất hiện.",
      ],
    },
  ],
  documents: [
    {
      label: "Đoạn chat 1 · chuẩn bị gian hàng triển lãm",
      paragraphs: [
        "8:45 A.M. · Linh: The courier will bring the event brochures at 11:30. Someone must sign for the delivery at the loading entrance and move the boxes to the registration desk before the exhibition opens at 1:00.",
        "8:48 A.M. · Omar: I’ll be at a client meeting off-site, but I should be back by noon.",
        "8:50 A.M. · Mai: I can receive the delivery. I sent the supplier’s name to building security yesterday.",
        "8:52 A.M. · Linh: Great. Please keep two boxes sealed. Our sponsor will collect them at 12:30.",
      ],
    },
    {
      label: "Đoạn chat 2 · điều chỉnh ca làm tại nhà hàng",
      paragraphs: [
        "1:40 P.M. · Rosa: A technician will repair the dishwasher between 2:00 and 4:00 tomorrow. The lunch service ends at 2:00, so the timing should not affect customers.",
        "1:42 P.M. · Ken: My kitchen shift starts at 3:00. May I update the inventory in the storeroom until the repair is finished?",
        "1:44 P.M. · Rosa: Yes. Ana, please cover the front counter at 3:00. Ken can return to the kitchen as soon as the technician leaves.",
        "1:45 P.M. · Ana: Understood. I’ll take my break before then.",
      ],
    },
    {
      label: "Đoạn chat 3 · đến hội nghị bị trễ",
      paragraphs: [
        "8:50 A.M. · Duy: My train is delayed by 25 minutes and is now scheduled to arrive at 9:20. The keynote starts at 9:30, and my badge is at the registration desk.",
        "8:53 A.M. · Priya: I’m already at the venue. I can collect your badge and save you an aisle seat.",
        "9:02 A.M. · Priya: The desk staff will not release another person’s badge without an authorization email.",
        "9:05 A.M. · Duy: I just sent it. The subject line is “Badge pickup.”",
      ],
    },
  ],
  questions: [
    {
      prompt: "Who will sign for the brochure delivery?",
      options: ["Linh", "Mai", "Omar", "The sponsor"],
      answer: 1,
      explanation: "B. Mai. Linh nói cần một người ký nhận, rồi Mai trả lời “I can receive the delivery.” Omar ở cuộc họp bên ngoài; sponsor chỉ đến lấy hai thùng đã niêm phong lúc 12:30.",
    },
    {
      prompt: "What will most likely happen to two of the brochure boxes?",
      options: ["They will be returned to the supplier.", "They will be opened at the loading entrance.", "They will be taken to a client meeting.", "They will be picked up by the sponsor."],
      answer: 3,
      explanation: "D. They will be picked up by the sponsor. Linh yêu cầu giữ nguyên niêm phong hai thùng vì sponsor sẽ đến lấy lúc 12:30. Các phương án khác gán sai địa điểm, người hoặc hành động.",
    },
    {
      prompt: "Where will Ken most likely be at 3:00 tomorrow?",
      options: ["At the front counter", "At a customer’s table", "In the storeroom", "At the loading entrance"],
      answer: 2,
      explanation: "C. In the storeroom. Ca bếp của Ken bắt đầu lúc 3 giờ, nhưng Rosa đồng ý để anh cập nhật hàng tồn trong kho cho tới khi sửa xong máy rửa bát. Ana mới là người trực quầy trước.",
    },
    {
      prompt: "What does Ana mean when she says, “before then”?",
      options: ["Before 3:00", "Before lunch service begins", "Before the restaurant opens", "Before Ken checks the inventory"],
      answer: 0,
      explanation: "A. Before 3:00. Tin ngay trước yêu cầu Ana trực quầy lúc 3 giờ, nên then chỉ mốc đó. B và C không khớp chuỗi thời gian; D không phải mốc được Rosa giao cho Ana.",
    },
    {
      prompt: "Why did Duy send an email?",
      options: ["To report the train delay", "To change the keynote schedule", "To authorize Priya to collect his badge", "To reserve a different seat"],
      answer: 2,
      explanation: "C. To authorize Priya to collect his badge. Priya báo quầy đăng ký cần authorization email trước khi giao thẻ của người khác; ba phút sau Duy nói đã gửi. A đã được thông báo trong chat, còn B và D không được yêu cầu.",
    },
    {
      prompt: "What will Priya most likely do next?",
      options: ["Wait for Duy at the train station", "Show the authorization email at the registration desk", "Ask the keynote speaker to start later", "Send Duy a new train ticket"],
      answer: 1,
      explanation: "B. Show the authorization email at the registration desk. Priya đang ở venue và muốn lấy thẻ giúp Duy; Duy vừa gửi đúng email mà nhân viên quầy yêu cầu. A, C và D không nối với vấn đề đang được giải quyết.",
    },
  ],
  review: "Với mỗi câu sai, vẽ ba cột: người gửi, thông tin mới và hành động đã chốt. Viết lại then, it hoặc them bằng danh từ hay mốc giờ cụ thể. Sau đó đọc chuỗi từ tin nêu vấn đề đến tin xác nhận cuối cùng; nếu đáp án cần thêm một sự kiện không xuất hiện trong chuỗi đó, hãy loại nó.",
  related: [
    { href: "/toeic/part-7", label: "Tổng quan TOEIC Part 7", description: "Xem đoạn tin nhắn trong hệ thống các dạng tài liệu và câu hỏi của Part 7." },
    { href: "/toeic/part-7/cau-hoi-suy-luan", label: "Câu hỏi suy luận Part 7", description: "Luyện giới hạn kết luận khi hành động được thể hiện qua nhiều lượt trao đổi." },
    { href: "/toeic/part-7/paraphrase-tu-dong-nghia", label: "Paraphrase và từ đồng nghĩa", description: "Nhận ra cách đáp án diễn đạt lại phản hồi và hành động trong tin nhắn." },
    { href: "/toeic/part-7/doc-hieu-mot-doan-van", label: "Đọc hiểu một văn bản", description: "Chuyển sang email liền mạch để luyện mục đích, chi tiết và từ trong ngữ cảnh." },
  ],
} satisfies ReadingLongTailGuide;
