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
    description: "Luyện 4 câu TOEIC Part 2 có audio, transcript và lời giải: trả lời trực tiếp, thông tin chưa chốt, chuyển người biết và từ chối bằng lý do.",
    intro: "Trong Part 2, bạn nghe một câu hỏi hoặc câu nói ngắn và chọn một trong ba phản hồi. Bốn câu tự biên soạn dưới đây giúp bạn phân biệt trả lời trực tiếp với phản hồi gián tiếp. Nghe trước, chọn đáp án rồi đối chiếu từng lựa chọn với lời giải; không cần tài khoản.",
    sections: [
      { heading: "Câu trả lời gián tiếp Part 2 là gì?", body: "Đó là phản hồi không đưa ngay thông tin được hỏi nhưng vẫn phù hợp với lượt lời: giải thích rằng thông tin chưa được quyết định, chỉ người biết câu trả lời hoặc nêu lý do không thể nhận lời. Khi nghe When, nghĩ tới thời gian nhưng đừng bắt buộc đáp án có ngày hay giờ. Khi nghe Could you, kiểm tra xem đây có phải lời nhờ thực hiện một việc hay không. Cần nghe hết câu, không chỉ nhận diện từ đầu." },
      { heading: "Loại bẫy lặp từ bằng mối quan hệ hỏi đáp", body: "Một lựa chọn nhắc đúng schedule, office hay lunch vẫn có thể nói về chuyện khác. Hãy tự nhắc mục đích bằng vài từ: hỏi lúc gửi lịch, tìm hồ sơ đã ký, nhờ trực quầy. Sau đó kiểm tra phản hồi có cung cấp thông tin, giải thích việc chưa biết hoặc xử lý đúng lời nhờ đó không. Cũng không chọn máy móc mọi câu có “chưa biết” hoặc “hỏi đồng nghiệp”: người và hành động phải liên quan tới việc đang hỏi." },
      { heading: "Quy trình sửa bốn câu trong khoảng 10 phút", body: "Lượt đầu nghe mỗi audio một lần và ghi đáp án trước khi đọc transcript. Sau khi chấm, chọn một câu sai hoặc đúng do đoán; nghe lại câu hỏi, nói mục đích của nó bằng một câu ngắn rồi nghe ba phản hồi. Mở transcript để xác nhận từ đã nghe nhầm và lời giải để kiểm tra logic. Đóng chữ, nghe lại cả cặp hỏi đáp đúng; ghi lỗi theo ba nhóm: không nghe rõ, hiểu sai ý định, bị từ trùng kéo đi. Nếu đọc transcript đúng nhưng nghe vẫn sai, ưu tiên nghe lại cụm đó thay vì học thêm mẹo loại đáp án." },
      { heading: "Suy ra vừa đủ, không tự thêm chi tiết", body: "Một phản hồi “ngày mở cửa chưa được xác nhận” không cho phép kết luận văn phòng đã mở hay sẽ mở sáng mai. “Hỏi Priya” cho biết nên hỏi ai, không cho biết hồ sơ nằm ở ngăn kéo nào. “Tôi gặp khách lúc đó” giải thích sự bận rộn, không xác định người trực thay. Chọn lời đáp hợp ngữ cảnh rồi dừng ở bằng chứng nghe được; suy diễn quá mức có thể làm bạn bỏ một đáp án phù hợp." },
    ],
    review: "Câu 1 trả lời trực tiếp bằng thời gian. Câu 2 cho biết thời điểm chưa chốt. Câu 3 chỉ người đã lưu hồ sơ. Câu 4 nêu lịch bận để phản hồi lời nhờ. Bốn câu này minh họa cách hiểu lượt lời, không phải quy tắc chọn đáp án cố định hay bằng chứng về tần suất câu hỏi trong đề thi.",
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
