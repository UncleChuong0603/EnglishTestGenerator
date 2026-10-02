export type ListeningSample = {
  id: string;
  title: string;
  startNumber?: number;
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
    id: "bai-nghe-mau",
    title: "Nghe thử TOEIC Part 1: mô tả tranh",
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
    id: "bai-nghe-mau",
    title: "Câu 1: trả lời trực tiếp về thời gian",
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
    id: "bai-nghe-mau",
    title: "Nghe thử TOEIC Part 4: thông báo đổi lịch",
    part: 4,
    audio: "/seo/toeic-part-4-sample.mp3",
    audioText: "Good morning, everyone. This is a reminder that the training workshop originally scheduled for Thursday will take place on Friday at ten A M in Conference Room B. Please bring your employee identification cards. If you registered but can no longer attend, email the training team by Wednesday evening so we can offer your place to someone else. We look forward to seeing you on Friday.",
    instructions: "Đọc ba câu hỏi trước, nghe thông báo một lượt rồi trả lời. Sau khi nộp, dùng transcript để đối chiếu đúng mốc thời gian và hành động.",
    transcript: ["Good morning, everyone. This is a reminder that the training workshop originally scheduled for Thursday will take place on Friday at 10 a.m. in Conference Room B.", "Please bring your employee identification cards. If you registered but can no longer attend, email the training team by Wednesday evening so we can offer your place to someone else.", "We look forward to seeing you on Friday."],
    questions: [
      { prompt: "What is the announcement mainly about?", options: ["A. A change to a training workshop", "B. A new employee identification card", "C. A conference room renovation", "D. A job opening"], answer: 0, explanation: "A đúng: người nói thông báo buổi training workshop chuyển từ thứ Năm sang thứ Sáu. B sai vì mang thẻ là yêu cầu phụ, không có việc cấp thẻ mới. C sai vì Conference Room B là nơi diễn ra, không có thông tin sửa phòng. D sai vì lời mời tham dự workshop không phải thông báo tuyển dụng." },
      { prompt: "When will the workshop take place?", options: ["A. Wednesday evening", "B. Thursday at 10 a.m.", "C. Friday at 10 a.m.", "D. Friday evening"], answer: 2, explanation: "C đúng: will take place on Friday at 10 a.m. là lịch mới. A là hạn báo vắng, không phải thời gian workshop. B dùng Thursday là ngày của lịch cũ (originally scheduled), không phải ngày hiện tại. D giữ đúng ngày Friday nhưng đổi buổi sáng thành buổi tối." },
      { prompt: "What should registered employees do if they cannot attend?", options: ["A. Call the conference room", "B. Email the training team", "C. Bring an identification card", "D. Offer their place in person"], answer: 1, explanation: "B đúng: email the training team by Wednesday evening. A sai vì thông báo yêu cầu gửi email cho nhóm đào tạo, không gọi phòng họp. C là yêu cầu dành cho người đến dự, không phải cách báo vắng. D sai vì nhóm đào tạo sẽ nhường chỗ cho người khác sau khi nhận email; nhân viên không được yêu cầu trực tiếp tìm người thay." },
    ],
  },
};

/** Original teaching examples, independently authored; not ETS test items. */
export const part2IndirectSamples: ListeningSample[] = [
  {
    id: "phan-hoi-chua-quyet-dinh", part: 2,
    startNumber: 2,
    title: "Câu 2: thông tin chưa được quyết định",
    audio: "/seo/toeic-part-2-undecided.mp3",
    audioText: "When will the new office open? A. The office has a large reception area. B. The opening date hasn't been confirmed yet. C. I opened the window this morning.",
    instructions: "Nghe một lượt trước khi xem transcript. Người hỏi cần biết thời điểm; hãy tìm phản hồi có thể giải thích vì sao chưa có thời điểm đó.",
    transcript: ["Question: When will the new office open?", "A. The office has a large reception area.", "B. The opening date hasn't been confirmed yet.", "C. I opened the window this morning."],
    questions: [{
      prompt: "Which response best answers the question?",
      options: ["A. The office has a large reception area.", "B. The opening date hasn't been confirmed yet.", "C. I opened the window this morning."], answer: 1,
      explanation: "B đúng: ngày khai trương chưa được xác nhận, nên người nói chưa thể đưa ra một mốc thời gian. A mô tả khu vực lễ tân, không trả lời việc khi nào văn phòng mở. C có opened và this morning nhưng nói về mở cửa sổ, không phải khai trương văn phòng. Không tự suy ra văn phòng đã mở hoặc sẽ mở vào sáng mai.",
    }],
  },
  {
    id: "phan-hoi-chuyen-nguoi", part: 2,
    startNumber: 3,
    title: "Câu 3: chuyển sang người có thông tin",
    audio: "/seo/toeic-part-2-ask-colleague.mp3",
    audioText: "Where can I find the signed delivery form? A. The delivery arrived yesterday. B. Please sign your name here. C. Ask Priya; she filed it after lunch.",
    instructions: "Câu hỏi Where không bắt buộc có một địa điểm trong đáp án. Nghe xem phản hồi nào giúp tìm đúng tài liệu được hỏi.",
    transcript: ["Question: Where can I find the signed delivery form?", "A. The delivery arrived yesterday.", "B. Please sign your name here.", "C. Ask Priya; she filed it after lunch."],
    questions: [{
      prompt: "Which response best answers the question?",
      options: ["A. The delivery arrived yesterday.", "B. Please sign your name here.", "C. Ask Priya; she filed it after lunch."], answer: 2,
      explanation: "C đúng: Priya đã lưu tài liệu nên là người có thể chỉ nơi tìm nó. Người nói không nêu vị trí trực tiếp nhưng đưa ra bước tìm thông tin phù hợp. A nói thời điểm hàng tới, không phải nơi lưu biểu mẫu. B yêu cầu ký tên trong khi người hỏi cần tìm biểu mẫu đã ký. Filed ở đây là lưu hồ sơ; không thể kết luận hồ sơ nằm ở ngăn kéo nào.",
    }],
  },
  {
    id: "phan-hoi-tu-choi", part: 2,
    startNumber: 4,
    title: "Câu 4: từ chối yêu cầu bằng lý do",
    audio: "/seo/toeic-part-2-unavailable.mp3",
    audioText: "Could you cover the front desk during lunch? A. I'll be meeting a client at that time. B. The desk was delivered last week. C. Lunch is served on the second floor.",
    instructions: "Could you ở đây là một lời nhờ, không chỉ hỏi khả năng. Hãy chọn phản hồi cho biết người được nhờ có nhận việc trong thời gian đó được hay không.",
    transcript: ["Question: Could you cover the front desk during lunch?", "A. I'll be meeting a client at that time.", "B. The desk was delivered last week.", "C. Lunch is served on the second floor."],
    questions: [{
      prompt: "Which response best answers the question?",
      options: ["A. I'll be meeting a client at that time.", "B. The desk was delivered last week.", "C. Lunch is served on the second floor."], answer: 0,
      explanation: "A đúng: người nói có cuộc gặp khách hàng cùng thời điểm, nên hàm ý không thể trực quầy trong giờ ăn trưa. B nói về việc giao chiếc bàn và hiểu desk như đồ vật, không phản hồi lời nhờ cover the front desk (trực quầy lễ tân). C nêu nơi phục vụ bữa trưa, không cho biết có nhận việc được không. Câu A không có No nhưng vẫn thể hiện sự bận rộn; cũng không cho biết ai sẽ trực thay.",
    }],
  },
];

export function samplesForListeningPart(part: ListeningSample["part"]): ListeningSample[] {
  return part === 2 ? [listeningSamples[2], ...part2IndirectSamples] : [listeningSamples[part]];
}
