export type ListeningSample = {
  part: 1 | 2 | 4;
  audio: string;
  audioText: string;
  image?: { src: string; alt: string };
  instructions: string;
  transcript: string[];
  questions: { prompt: string; options: readonly string[]; answer: number; explanation: string }[];
};

export const listeningSamples: Record<1 | 2 | 4, ListeningSample> = {
  1: {
    part: 1,
    audio: "/seo/toeic-part-1-sample.mp3",
    audioText: "A. The woman is moving chairs around the room. B. The woman is arranging folders on a table. C. The woman is opening a laptop. D. The woman is speaking to a colleague.",
    image: { src: "/seo/toeic-part-1-office-folders.webp", alt: "Một phụ nữ đang xếp ba tập tài liệu trên bàn họp; hai ghế trống và một máy tính xách tay đóng nằm gần đó." },
    instructions: "Quan sát ảnh, nghe bốn câu mô tả rồi chọn câu đúng nhất. Ảnh và audio là bài mẫu tự tạo, không phải đề ETS.",
    transcript: ["A. The woman is moving chairs around the room.", "B. The woman is arranging folders on a table.", "C. The woman is opening a laptop.", "D. The woman is speaking to a colleague."],
    questions: [{
      prompt: "Which statement best describes the photograph?",
      options: ["A. The woman is moving chairs around the room.", "B. The woman is arranging folders on a table.", "C. The woman is opening a laptop.", "D. The woman is speaking to a colleague."],
      answer: 1,
      explanation: "B đúng vì người phụ nữ đang xếp các tập tài liệu trên bàn. Hai ghế vẫn trống, laptop đang đóng và không có đồng nghiệp trong ảnh; các chi tiết đó loại A, C và D.",
    }],
  },
  2: {
    part: 2,
    audio: "/seo/toeic-part-2-sample.mp3",
    audioText: "When will the revised schedule be emailed to the team? A. By the end of this afternoon. B. The meeting room is upstairs. C. Yes, it was a useful schedule.",
    instructions: "Nghe một câu hỏi và ba lời đáp. Chọn lời đáp phù hợp về ý, không chọn chỉ vì có từ giống câu hỏi.",
    transcript: ["Question: When will the revised schedule be emailed to the team?", "A. By the end of this afternoon.", "B. The meeting room is upstairs.", "C. Yes, it was a useful schedule."],
    questions: [{
      prompt: "Which response best answers the question?",
      options: ["A. By the end of this afternoon.", "B. The meeting room is upstairs.", "C. Yes, it was a useful schedule."],
      answer: 0,
      explanation: "A trả lời thời điểm gửi lịch sửa đổi. B trả lời địa điểm nên sai loại thông tin; C lặp lại schedule nhưng trả lời yes/no cho câu hỏi bắt đầu bằng When.",
    }],
  },
  4: {
    part: 4,
    audio: "/seo/toeic-part-4-sample.mp3",
    audioText: "Good morning, everyone. This is a reminder that the training workshop originally scheduled for Thursday will take place on Friday at ten A M in Conference Room B. Please bring your employee identification cards. If you registered but can no longer attend, email the training team by Wednesday evening so we can offer your place to someone else. We look forward to seeing you on Friday.",
    instructions: "Đọc ba câu hỏi trước, nghe thông báo một lượt rồi trả lời. Sau khi nộp, dùng transcript để đối chiếu đúng mốc thời gian và hành động.",
    transcript: ["Good morning, everyone. This is a reminder that the training workshop originally scheduled for Thursday will take place on Friday at 10 a.m. in Conference Room B.", "Please bring your employee identification cards. If you registered but can no longer attend, email the training team by Wednesday evening so we can offer your place to someone else.", "We look forward to seeing you on Friday."],
    questions: [
      { prompt: "What is the announcement mainly about?", options: ["A. A change to a training workshop", "B. A new employee identification card", "C. A conference room renovation", "D. A job opening"], answer: 0, explanation: "A đúng: người nói thông báo buổi training workshop chuyển từ thứ Năm sang thứ Sáu. Thẻ nhân viên và phòng họp chỉ là chi tiết phụ." },
      { prompt: "When will the workshop take place?", options: ["A. Wednesday evening", "B. Thursday at 10 a.m.", "C. Friday at 10 a.m.", "D. Friday evening"], answer: 2, explanation: "C đúng: originally scheduled for Thursday là lịch cũ; will take place on Friday at 10 a.m. là lịch mới. Wednesday evening là hạn báo vắng." },
      { prompt: "What should registered employees do if they cannot attend?", options: ["A. Call the conference room", "B. Email the training team", "C. Bring an identification card", "D. Offer their place in person"], answer: 1, explanation: "B đúng: email the training team by Wednesday evening. Mang thẻ là yêu cầu dành cho người đến dự, không phải cách báo vắng." },
    ],
  },
};
