export type ListeningGuide = {
  part: 1 | 2 | 4;
  title: string;
  description: string;
  intro: string;
  sections: { heading: string; body: string }[];
  review: string;
};

export const listeningGuides: Record<1 | 2 | 4, ListeningGuide> = {
  1: {
    part: 1,
    title: "Luyện nghe TOEIC Part 1: mô tả tranh có audio và lời giải",
    description: "Quan sát ảnh gốc, nghe bốn câu mô tả TOEIC Part 1 và chọn đáp án. Học cách phân biệt hành động đang diễn ra với chi tiết chỉ có trong ảnh.",
    intro: "Part 1 yêu cầu chọn câu tiếng Anh mô tả đúng một bức ảnh. Bài mẫu dưới đây cho bạn thử nhìn ảnh, nghe bốn lựa chọn và giải thích vì sao ba lựa chọn còn lại sai.",
    sections: [
      { heading: "Nhìn hành động chính trước khi nghe", body: "Đừng cố gọi tên mọi vật trong ảnh. Hãy xác định ai đang làm gì, vật nào đang được tác động và trạng thái rõ nhất của các đồ vật gần đó. Trong ảnh mẫu, người phụ nữ đang xếp tập tài liệu; laptop nằm trên bàn nhưng vẫn đóng. Việc một đồ vật xuất hiện không có nghĩa mọi hành động liên quan đến nó đều đúng." },
      { heading: "Phân biệt vật có mặt với hành động xảy ra", body: "Một đáp án sai có thể gọi đúng tên chiếc ghế hoặc máy tính nhưng nói một hành động không diễn ra. Khi nghe, kiểm tra cả chủ ngữ, động từ và tân ngữ. Nếu câu nói “moving chairs” nhưng người trong ảnh đang cầm tập tài liệu, loại đáp án đó ngay cả khi ghế xuất hiện rõ ràng." },
      { heading: "Nghe lại để sửa lỗi", body: "Sau khi chọn đáp án, nghe lại từng câu. Ghi một dấu hiệu khiến câu đúng và một chi tiết làm câu sai. Với Part 1, luyện phân biệt động từ thường hiệu quả hơn học thuộc một danh sách danh từ rời rạc. Khi đã làm được bài mẫu, hãy thử bài Listening ngắn hơn một đề đầy đủ để kiểm tra sức tập trung." },
    ],
    review: "Nếu bạn chọn A, bạn đã thấy ghế nhưng gán nhầm hành động. Nếu chọn C, bạn đã thấy laptop nhưng bỏ qua trạng thái đang đóng. Nếu chọn D, bạn đã tự thêm người không có trong ảnh. Hãy mô tả bằng chứng nhìn thấy được, không suy diễn bối cảnh.",
  },
  2: {
    part: 2,
    title: "Luyện nghe TOEIC Part 2: hỏi đáp có audio và lời giải",
    description: "Nghe câu hỏi và ba phản hồi TOEIC Part 2, chọn lời đáp phù hợp và xem giải thích bẫy lặp từ, sai loại thông tin.",
    intro: "Part 2 không có ảnh hay đoạn văn để dựa vào. Bạn nghe một câu hỏi hoặc câu nói ngắn và chọn phản hồi phù hợp nhất. Bài mẫu tập trung vào cách nghe từ hỏi và loại thông tin cần trả lời.",
    sections: [
      { heading: "Bắt từ hỏi trước, rồi nghe cả ý", body: "Với When, đáp án thường cần một mốc thời gian; với Where là địa điểm; với Who là người. Đó là điểm xuất phát, không phải mẹo máy móc: câu trả lời có thể gián tiếp nhưng vẫn phải phù hợp với mục đích câu hỏi. Trong bài mẫu, người hỏi muốn biết khi nào lịch mới được gửi cho cả nhóm." },
      { heading: "Cẩn thận với bẫy lặp lại từ", body: "Một phương án chứa đúng từ schedule vẫn có thể sai vì nó trả lời câu hỏi khác. Hãy tự hỏi: nếu đây là cuộc trò chuyện thật, câu trả lời này có giúp người hỏi biết điều họ cần không? Cũng cần nghe trạng thái của hành động: will be emailed là dự định gửi, không phải hỏi lịch đã hữu ích hay chưa." },
      { heading: "Cách luyện khi nghe mất câu đầu", body: "Sau khi chấm, nghe lại câu hỏi trước khi xem transcript. Nếu bỏ lỡ từ When, Where hoặc Who, hãy tập trung vào âm đầu câu. Nếu nghe rõ từ hỏi nhưng vẫn chọn sai, kiểm tra loại thông tin của từng đáp án. Khi đã quen, chuyển sang nhóm câu dài hơn trong phần luyện Listening." },
    ],
    review: "A nêu thời điểm “by the end of this afternoon”. B nêu vị trí phòng họp, không liên quan đến lúc gửi lịch. C mở đầu bằng Yes, không trả lời câu hỏi When và chỉ lặp lại từ schedule.",
  },
  4: {
    part: 4,
    title: "Luyện nghe TOEIC Part 4: bài nói ngắn có transcript",
    description: "Nghe một thông báo TOEIC Part 4 tự biên soạn, trả lời 3 câu về mục đích, thời gian và hành động tiếp theo. Có transcript và lời giải.",
    intro: "Part 4 là bài nói của một người, thường dưới dạng thông báo hoặc hướng dẫn. Bài mẫu này cho bạn luyện theo dõi thay đổi lịch, hạn phản hồi và việc người nghe cần làm.",
    sections: [
      { heading: "Đọc câu hỏi trước để dự đoán thông tin", body: "Ba câu hỏi của bài mẫu lần lượt hỏi mục đích thông báo, thời điểm sự kiện và việc cần làm nếu không tham dự. Khi nghe, giữ ba ô thông tin này trong đầu. Bạn không cần dịch từng câu; chỉ cần đánh dấu mốc cũ, mốc mới và yêu cầu dành cho người nghe." },
      { heading: "Tách lịch cũ, lịch mới và hạn chót", body: "Bài nói nhắc Thursday, Friday và Wednesday evening. Đây là ba vai trò khác nhau: lịch ban đầu, thời gian diễn ra mới và hạn báo vắng. Đáp án gây nhiễu thường dùng đúng một từ nghe được nhưng gán sai vai trò. Hãy ghi một từ ngắn cạnh mỗi mốc: old, new, deadline." },
      { heading: "Sửa bài bằng bằng chứng cụ thể", body: "Sau khi làm, mở transcript và gạch đúng câu chứa đáp án. Với câu hỏi mục đích, bằng chứng nằm ở toàn ý thông báo đổi lịch, không phải một từ đơn lẻ. Với câu hỏi chi tiết, kiểm tra ai phải làm gì và trước khi nào. Sau đó nghe lại mà không nhìn chữ để xem bạn đã nhận ra thông tin bằng tai hay chưa." },
    ],
    review: "Friday at 10 a.m. là giờ workshop diễn ra; Thursday là lịch cũ. Wednesday evening là hạn gửi email nếu không tham dự. Mang thẻ nhân viên là yêu cầu với người đến dự, không thay cho việc báo vắng.",
  },
};
