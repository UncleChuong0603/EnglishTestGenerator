import type { Guide } from "@/components/seo/guide-page";

export const guides = {
  toeic: {
    eyebrow: "Bắt đầu học TOEIC",
    title: "TOEIC Listening & Reading: hiểu bài thi và chọn cách luyện phù hợp",
    intro: "Nếu mới bắt đầu, bạn cần biết bài thi đo kỹ năng gì, từng Part yêu cầu gì và nên kiểm tra năng lực hiện tại trước khi lập lịch học. Trang này giúp bạn chọn điểm bắt đầu cụ thể.",
    sections: [
      { title: "TOEIC Listening & Reading gồm những gì?", paragraphs: ["Bài thi Listening & Reading có hai phần. Listening gồm Part 1 đến Part 4: nhận diện hình ảnh, phản hồi câu hỏi, theo dõi hội thoại và bài nói ngắn. Reading gồm Part 5 đến Part 7: hoàn thành câu, hoàn thành đoạn văn và đọc hiểu tài liệu.", "Các Part dùng những thao tác khác nhau. Một người làm tốt câu ngữ pháp Part 5 vẫn có thể mất nhiều thời gian ở Part 7. Vì vậy, hãy xem kết quả theo Part thay vì chỉ nhìn một con số tổng."] },
      { title: "Chọn điểm bắt đầu trong ba bước", paragraphs: ["Bắt đầu bằng một bài đánh giá ngắn. Ghi lại Part nào có độ chính xác thấp và Part nào khiến bạn làm quá chậm. Sau đó chọn một kỹ năng nhỏ để luyện trong vài buổi liên tiếp, chẳng hạn nhận diện loại từ ở Part 5 hoặc tìm thông tin cụ thể ở Part 7."], points: ["Làm bài trong điều kiện ít bị gián đoạn để có kết quả đáng tin hơn.", "Đọc giải thích cho cả câu đúng do đoán và câu sai.", "Sau vài buổi, làm lại một nhóm câu tương đương để xem kỹ năng có tiến bộ hay không."] },
      { title: "Học theo Part hay làm đề liên tục?", paragraphs: ["Khi chưa biết vì sao mình sai, luyện theo Part giúp bạn nhận ra mẫu lỗi nhanh hơn. Đề dài hữu ích khi cần kiểm tra sức bền và quản lý thời gian, nhưng nên xen kẽ với buổi sửa lỗi có mục tiêu. Một lịch dễ duy trì là hai đến ba buổi luyện kỹ năng và một buổi ôn lỗi mỗi tuần."] },
    ],
    links: [{ href: "/toeic/part-5", label: "TOEIC Part 5", description: "Ngữ pháp và từ vựng trong câu ngắn." }, { href: "/toeic/part-6", label: "TOEIC Part 6", description: "Dùng ngữ cảnh của cả đoạn văn." }, { href: "/toeic/part-7", label: "TOEIC Part 7", description: "Đọc tài liệu và đối chiếu thông tin." }, { href: "/blog", label: "Thư viện hướng dẫn", description: "Lộ trình học và mẹo sửa lỗi." }],
    cta: { href: "/diagnostic", label: "Đánh giá miễn phí", description: "Làm bài đánh giá Listening và Reading để xem độ chính xác theo Part. Kết quả là độ chính xác thô, không phải dự đoán điểm thi." },
  },
  online: {
    eyebrow: "Luyện thi TOEIC online",
    title: "Luyện thi TOEIC online: bắt đầu bằng bài ngắn, học từ lỗi sai",
    intro: "Luyện online hiệu quả khi mỗi buổi có mục tiêu rõ ràng: biết mình cần cải thiện Part nào, làm một nhóm câu vừa sức và xem kỹ nguyên nhân sai trước khi chuyển tiếp.",
    sections: [
      { title: "Một buổi luyện 20–30 phút có thể diễn ra thế nào?", paragraphs: ["Dành vài phút đầu chọn một Part hoặc một lỗi đang lặp lại. Làm bài trong một lượt liên tục, sau đó dành ít nhất thời gian tương đương để xem đáp án và giải thích. Nếu làm sai vì không hiểu từ, ghi lại cụm từ trong ngữ cảnh; nếu sai vì đọc vội, đánh dấu vị trí thông tin đã bỏ qua."], points: ["5 phút: chọn kỹ năng cần luyện và xem lại lỗi cũ.", "10–15 phút: làm một nhóm câu, hạn chế dừng giữa chừng.", "10 phút: giải thích từng lỗi và chọn một mục tiêu cho buổi tiếp theo."] },
      { title: "Khi nào nên làm bài đánh giá?", paragraphs: ["Nếu chưa có dữ liệu về điểm mạnh và điểm yếu, hãy làm bài đánh giá trước. Sau vài tuần luyện, làm lại nhóm câu tương đương để xem xu hướng. Không nên suy ra điểm TOEIC chính thức từ một bài ngắn: số câu và điều kiện làm bài khác với kỳ thi thực tế."] },
      { title: "Dùng TOEIC GYM theo đúng mục tiêu", paragraphs: ["Bạn có thể thử câu Listening hoặc Reading mà không cần tài khoản. Bài đánh giá ngắn cho thấy độ chính xác theo Part; khi đăng nhập, bạn có thể tiếp tục với bài luyện được gợi ý và quay lại các câu đã sai. Nội dung hiện có quyết định nhóm câu có thể xuất hiện trong từng bài luyện."] },
    ],
    links: [{ href: "/toeic", label: "Hiểu cấu trúc TOEIC", description: "Xem từng Part và chọn nơi bắt đầu." }, { href: "/toeic/part-5", label: "Luyện Reading Part 5", description: "Phân biệt ngữ pháp và từ vựng trong câu." }, { href: "/blog", label: "Chiến lược học TOEIC", description: "Các hướng dẫn dài hơn cho từng mục tiêu." }],
    cta: { href: "/try", label: "Thử bài luyện miễn phí", description: "Thử bài ngắn trước khi quyết định có muốn lưu kết quả và theo một lộ trình cá nhân hay không." },
  },
  part5: {
    eyebrow: "TOEIC Reading · Part 5",
    title: "TOEIC Part 5: cách làm câu hoàn thành câu",
    intro: "Part 5 kiểm tra khả năng chọn từ hoặc cấu trúc phù hợp trong một câu ngắn. Cách làm hiệu quả là xác định chỗ trống cần loại từ nào, rồi mới xét nghĩa và ngữ pháp của cả câu.",
    topCta: { href: "/challenge/part-5", label: "Làm thử 10 câu Part 5" },
    sections: [
      { title: "Part 5 gồm những dạng câu nào?", paragraphs: ["Trong ngân hàng câu hỏi hiện tại, Part 5 có hai nhóm chính: ngữ pháp và từ vựng. Ngữ pháp gồm Word Form (từ loại), thì động từ, hòa hợp chủ ngữ – động từ, bị động, giới từ, liên từ và các cấu trúc câu khác. Từ vựng gồm từ theo ngữ cảnh, từ vựng thương mại và các cụm từ thường đi cùng nhau. Mỗi câu chỉ có một chỗ trống và bốn lựa chọn."] },
      { title: "Đọc vị trí chỗ trống trước khi nhìn bốn đáp án", paragraphs: ["Nhìn từ đứng trước và sau chỗ trống. Sau mạo từ thường cần danh từ hoặc cụm danh từ; trước danh từ có thể cần tính từ; sau động từ thường cần trạng từ nếu vị trí đó bổ nghĩa cho hành động. Đây là gợi ý ban đầu, không phải quy tắc áp dụng cho mọi câu."], points: ["Nếu bốn lựa chọn có cùng gốc từ, ưu tiên kiểm tra loại từ.", "Nếu bốn lựa chọn là các dạng động từ, kiểm tra chủ ngữ, thời gian và thể bị động.", "Nếu bốn lựa chọn khác nghĩa, đọc cả câu và chọn theo ngữ cảnh."] },
      { title: "Ba nhóm lỗi thường gặp", paragraphs: ["Lỗi thứ nhất là chọn từ có nghĩa quen thuộc nhưng sai loại từ. Lỗi thứ hai là nhìn một dấu hiệu thời gian rồi bỏ qua chủ ngữ hoặc mệnh đề. Lỗi thứ ba là dịch từng từ, khiến bạn bỏ lỡ cụm cố định như be responsible for hoặc in accordance with." , "Khi sửa bài, hãy viết một lý do ngắn cho đáp án đúng và một lý do loại đáp án bạn đã chọn. Thao tác này giúp bạn nhận ra liệu mình thiếu kiến thức hay chỉ đọc quá vội."] },
      { title: "Luyện Part 5 theo vòng nhỏ", paragraphs: ["Bắt đầu với một chủ đề như Word Form, thì và thời, hoặc giới từ. Làm một nhóm câu, xem giải thích và thử lại sau một đến ba ngày. Khi độ chính xác ổn định, trộn nhiều chủ đề để kiểm tra xem bạn còn nhận ra dấu hiệu trong câu mới hay không."] },
    ],
    example: { title: "Ví dụ: nhận diện loại từ", question: "The manager gave a _____ explanation of the revised schedule.", options: ["A. clearly", "B. clarity", "C. clear", "D. clarify"], answer: "Đáp án C. clear. Chỗ trống đứng trước danh từ explanation nên cần tính từ. Clearly là trạng từ, clarity là danh từ, clarify là động từ." },
    links: [{ href: "/toeic/part-5/word-form", label: "Luyện 5 câu Word Form", description: "Chọn loại từ và xem giải thích sau khi nộp." }, { href: "/blog/ngu-phap-toeic-part-5-can-hoc", label: "7 chủ điểm ngữ pháp", description: "Đọc thêm cách chọn chủ điểm cần học." }],
    cta: { href: "/challenge/part-5", label: "Bắt đầu Part 5 Challenge", description: "Làm 10 câu Part 5 miễn phí, không cần tài khoản. Xem độ chính xác và lời giải sau khi nộp." },
  },
  part6: {
    eyebrow: "TOEIC Reading · Part 6",
    title: "TOEIC Part 6: hoàn thành đoạn văn bằng ngữ cảnh",
    intro: "Ở Part 6, một đáp án đúng phải hợp cả vị trí chỗ trống lẫn mạch ý của đoạn văn. Đọc một câu đơn lẻ thường chưa đủ, nhất là với câu nối ý và câu cần chèn.",
    sections: [
      { title: "Đọc lượt đầu để hiểu tài liệu", paragraphs: ["Xác định đây là email, thông báo hay bài viết; ai đang viết và mục đích chính là gì. Đọc lướt toàn đoạn trước khi chốt các chỗ trống. Tên người, mốc thời gian và câu mở đầu thường cho biết giọng điệu cũng như thứ tự sự kiện."] },
      { title: "Phân loại chỗ trống", paragraphs: ["Với từ loại hoặc dạng động từ, kiểm tra cấu trúc ngay trong câu rồi đọc lại câu trước và sau. Với từ nối, hỏi hai ý đang bổ sung, đối lập hay chỉ nguyên nhân và kết quả. Với câu cần chèn, tìm đại từ, từ chỉ thời gian và chi tiết được nhắc lại ở các câu lân cận."], points: ["Kiểm tra thì của động từ theo toàn bộ chuỗi sự kiện.", "Đừng chọn từ nối chỉ vì nghĩa tiếng Việt quen thuộc; kiểm tra quan hệ giữa hai câu.", "Sau khi điền xong, đọc liền mạch cả đoạn để phát hiện chỗ chuyển ý gượng."] },
      { title: "Cách sửa một câu sai", paragraphs: ["Ghi lại dấu hiệu trong đoạn giúp xác nhận đáp án: một từ quy chiếu, sự đối lập, hoặc thời điểm sự kiện. Nếu chỉ nhớ đáp án mà không chỉ ra được dấu hiệu, bạn chưa thực sự sửa được lỗi. Hãy thử một đoạn khác cùng dạng trước khi chuyển sang Part 7."] },
    ],
    example: { title: "Ví dụ: chọn từ nối", question: "The shipment was delayed by heavy rain. _____, all customers were notified of the new delivery date.", options: ["A. However", "B. Therefore", "C. Meanwhile", "D. Otherwise"], answer: "Đáp án B. Therefore. Câu sau là hệ quả của việc giao hàng chậm: khách hàng được báo ngày giao mới. Các lựa chọn còn lại diễn tả quan hệ ý khác." },
    links: [{ href: "/toeic/part-5", label: "TOEIC Part 5", description: "Ôn cấu trúc câu trước khi đọc đoạn." }, { href: "/toeic/part-7", label: "TOEIC Part 7", description: "Tiếp tục với đọc hiểu tài liệu." }, { href: "/blog", label: "Bài viết TOEIC", description: "Lộ trình và chiến lược học theo mục tiêu." }],
    cta: { href: "/try#quick-practice", label: "Thử bài Reading", description: "Làm một nhóm Reading ngắn và đọc lời giải để kiểm tra cách suy luận của mình." },
  },
  part7: {
    eyebrow: "TOEIC Reading · Part 7",
    title: "TOEIC Part 7: đọc hiểu nhanh mà không bỏ sót bằng chứng",
    intro: "Part 7 yêu cầu tìm thông tin trong một hoặc nhiều tài liệu và hiểu cách các chi tiết liên hệ với nhau. Mục tiêu là trả lời dựa trên bằng chứng, không dựa vào từ khóa trùng lặp đơn thuần.",
    sections: [
      { title: "Bắt đầu từ câu hỏi, rồi định vị thông tin", paragraphs: ["Xem câu hỏi đang hỏi mục đích, chi tiết, suy luận hay nghĩa của từ trong ngữ cảnh. Với câu hỏi chi tiết, tìm tên, ngày, giá hoặc hành động liên quan. Với câu hỏi mục đích, đọc tiêu đề và phần mở đầu của tài liệu trước khi quét các chi tiết nhỏ."] },
      { title: "Nhận ra paraphrase", paragraphs: ["Đáp án thường diễn đạt lại ý trong bài bằng từ khác. Chẳng hạn, văn bản nói một cuộc họp was postponed thì lựa chọn có thể nói it will take place later. Hãy kiểm tra ý nghĩa và mốc thời gian, vì một từ giống hệt bài đọc vẫn có thể nằm trong phương án gây nhiễu."], points: ["Gạch ý chính của từng đoạn bằng vài từ, không dịch mọi câu.", "Với tài liệu đôi hoặc ba, xác định câu hỏi cần một tài liệu hay phải đối chiếu nhiều tài liệu.", "Nếu chưa tìm thấy bằng chứng, đánh dấu câu và tiếp tục để giữ thời gian cho các câu còn lại."] },
      { title: "Sửa bài để tăng tốc", paragraphs: ["Sau khi chấm, quay lại đúng dòng chứa bằng chứng cho từng câu sai. Ghi xem bạn bỏ sót từ phủ định, nhầm người hoặc nhầm thời điểm. Tốc độ tốt hơn đến từ việc định vị chính xác hơn và giảm số lần đọc lại cả đoạn."] },
    ],
    example: { title: "Ví dụ: hiểu paraphrase", question: "Email: “The workshop originally scheduled for Tuesday will now take place on Thursday.” What has changed?", options: ["A. The venue", "B. The instructor", "C. The date", "D. The topic"], answer: "Đáp án C. The date. Tuesday đổi thành Thursday. Câu hỏi dùng changed thay cho will now take place, nhưng bằng chứng là hai mốc ngày trong email." },
    links: [{ href: "/toeic/part-6", label: "TOEIC Part 6", description: "Luyện đọc mạch ý trong một đoạn ngắn." }, { href: "/blog/quan-ly-thoi-gian-toeic-reading-75-phut", label: "Chia thời gian Reading", description: "Giữ đủ thời gian cho các tài liệu dài." }, { href: "/toeic", label: "Tổng quan TOEIC", description: "Xem vai trò của Part 7 trong lộ trình." }],
    cta: { href: "/try#quick-practice", label: "Thử bài Reading", description: "Làm bài ngắn, đối chiếu đáp án với bằng chứng rồi chọn lỗi cần sửa ở buổi sau." },
  },
} satisfies Record<string, Guide>;
