import type { EditorialPost } from "./editorial";

const etsFormat = "https://www.ets.org/toeic/test-takers/about/listening-reading.html";
const etsResources = "https://www.ets.org/toeic/test-takers.html";
const etsSample = "https://www.ets.org/content/dam/ets-org/pdfs/toeic/toeic-listening-reading-sample-test.pdf";

export const ETS_2025_REVIEW_POST: EditorialPost = {
  id: "editorial-ets-2025-reading-review",
  slug: "sua-de-mau-ets-toeic-2025-reading-part-5-6-7",
  title: "Sửa đề TOEIC Reading 100 câu: tìm đúng lỗi ở Part 5, 6 và 7",
  excerpt: "Quy trình chữa đủ 100 câu Reading theo từng dải câu, có mẫu sổ lỗi, ví dụ tự biên soạn và cách biến kết quả thành buổi học tiếp theo.",
  category: "EXAM_REVIEW",
  status: "PUBLISHED",
  seoTitle: "ETS TOEIC 2025 Reading: cách sửa đủ 100 câu",
  seoDescription: "Cách chữa đề TOEIC Reading 100 câu từ 101–200: phân loại lỗi Part 5, 6, 7, tìm bằng chứng, quản lý thời gian và lập bài ôn sau khi chấm.",
  canonicalPath: "/blog/sua-de-mau-ets-toeic-2025-reading-part-5-6-7",
  coverMediaId: null,
  coverAlt: "Bàn học với phiếu Reading, sổ ghi lỗi, bút và đồng hồ",
  editorialCover: "/blog/ets-2025-reading-sample-review.webp",
  socialTitle: "Chữa đủ 100 câu TOEIC Reading, không chỉ dò đáp án",
  socialDescription: "Bản đồ câu 101–200, mẫu sổ lỗi và quy trình chữa Part 5–7 để biết chính xác buổi sau cần học gì.",
  contentOrigin: "AI_ASSISTED",
  authorName: "TOEIC GYM Editorial",
  targetTopic: "cách sửa đề TOEIC Reading 100 câu",
  searchIntent: "LEARN",
  noindex: false,
  createdBy: "editorial",
  updatedBy: "editorial",
  tags: [
    { name: "TOEIC Reading", slug: "toeic-reading" },
    { name: "Sửa đề", slug: "sua-de" },
    { name: "ETS 2025", slug: "ets-2025" },
  ],
  content: `## Trước hết: “ETS TOEIC 2025” có phải tên một đề mẫu chính thức?

Trên mạng, cụm “ETS TOEIC 2025” thường được dùng để gọi sách hoặc bộ đề luyện phát hành theo năm. Tuy nhiên, tệp đề mẫu miễn phí trên website ETS không mang tên “ETS 2025”. Bạn nên mở tài liệu từ [trang tài nguyên dành cho thí sinh của ETS](${etsResources}) hoặc [PDF sample test trên tên miền ETS](${etsSample}), rồi kiểm tra tên tài liệu, đơn vị phát hành và ngày cập nhật ngay trên nguồn.

TOEIC GYM không chép lại 100 câu hay bảng đáp án thuộc tài liệu ETS. Phần dưới là **quy trình chữa đủ một section Reading 100 câu** và các ví dụ do TOEIC GYM tự biên soạn. Bạn có thể áp dụng quy trình này cho tài liệu hợp pháp mình đang có, kể cả đề mẫu ETS, sách đã mua hoặc bài thi thử trên TOEIC GYM.

## Bản đồ 100 câu Reading cần chữa

[ETS mô tả Reading gồm 100 câu trong 75 phút](${etsFormat}). Theo cấu trúc hiện hành, một section Reading được chia như sau:

- **Câu 101–130 — Part 5:** 30 câu Incomplete Sentences.
- **Câu 131–146 — Part 6:** 16 câu Text Completion, thường là 4 văn bản, mỗi văn bản 4 câu.
- **Câu 147–175 — Part 7 một văn bản:** 29 câu trên 10 văn bản.
- **Câu 176–200 — Part 7 nhiều văn bản:** 25 câu trên 5 bộ văn bản đôi hoặc ba.

Đây là lý do chỉ xem tổng số đúng là chưa đủ. Hai người cùng đúng 70/100 có thể cần hai kế hoạch hoàn toàn khác nhau: một người mất điểm ở loại từ Part 5, người kia đọc không kịp các bộ ba văn bản cuối Part 7.

## Chấm lần một: ghi bốn dữ liệu cho từng câu sai

Đừng chỉ khoanh đáp án đúng bằng bút đỏ. Với mỗi câu sai hoặc câu đoán, ghi bốn dòng:

1. **Câu và Part:** ví dụ 118 — Part 5.
2. **Tôi đã chọn / đáp án đúng:** B → D.
3. **Bằng chứng quyết định:** một cấu trúc, mốc thời gian, câu trong văn bản hoặc quan hệ giữa hai văn bản.
4. **Nguyên nhân gốc:** thiếu kiến thức, hiểu sai câu hỏi, dính bẫy từ trùng, không thấy paraphrase hay hết giờ.

Đánh dấu cả câu **đúng do đoán**. Nếu không thể chỉ ra vì sao ba phương án còn lại sai, kiến thức chưa ổn định và câu đó vẫn nên vào sổ review.

## Câu 101–130: chữa Part 5 theo loại quyết định

Nhìn bốn lựa chọn trước. Nếu chúng là các dạng của cùng một gốc từ, đây thường là câu từ loại hoặc dạng động từ; nếu bốn từ khác nghĩa, bạn cần xét ngữ cảnh và collocation. Sau đó gắn mỗi câu sai vào một trong sáu nhóm:

- từ loại và vị trí trong câu;
- thì, thể và dạng động từ;
- hòa hợp chủ ngữ – động từ;
- đại từ, mạo từ, từ hạn định và lượng từ;
- giới từ, liên từ, mệnh đề;
- từ vựng hoặc cụm từ đi với nhau.

**The purchasing team reviewed the contract _____ before signing it.** (A) care (B) careful (C) carefully (D) caring

**Đáp án C.** Chỗ trống bổ nghĩa cho động từ *reviewed*, vì vậy cần trạng từ *carefully*. Nếu đã chọn B, lỗi gốc không phải “không biết nghĩa careful” mà là chưa kiểm tra chức năng của chỗ trống. Hãy ghi mẫu “động từ + tân ngữ + trạng từ”, rồi tự đặt một câu mới.

Sau khi chữa 30 câu, đếm lỗi theo nhóm. Nếu có từ ba lỗi cùng loại trở lên, đừng làm thêm một đề đầy đủ ngay. Học lại chủ điểm đó ở [lộ trình ngữ pháp TOEIC A–Z](/ngu-phap), sau đó làm [bài Part 5 hỗn hợp có lời giải](/toeic/part-5/practice) để kiểm tra trong ngữ cảnh mới.

## Câu 131–146: chữa Part 6 bằng mạch của cả đoạn

Part 6 có câu giải được bằng ngữ pháp ngay tại chỗ trống, nhưng cũng có câu buộc bạn đọc câu trước và câu sau. Khi chữa, ghi thêm **vai trò của câu chứa chỗ trống**: mở mục đích, nêu vấn đề, đưa giải pháp, bổ sung chi tiết hay kết thúc bằng hành động tiếp theo.

Đoạn tự biên soạn: “The training room will be closed on Thursday. _____, all scheduled workshops will take place in Room 204. The usual room will reopen on Friday.”

- A. Otherwise
- B. Therefore
- C. For example
- D. Meanwhile

**Đáp án B.** Việc phòng đóng là nguyên nhân khiến workshop chuyển sang phòng khác. *Therefore* thể hiện quan hệ kết quả; ba lựa chọn còn lại không nối đúng logic. Khi review, ghi “closed → move rooms: cause → result”, không chỉ ghi chữ B.

Với câu điền cả một câu, kiểm tra lần lượt: đại từ có đối tượng tham chiếu không, thời gian có khớp không, câu có lặp thông tin không và nó có tạo cầu nối giữa hai ý không. [Bài điền câu Part 6](/toeic/part-6/dien-cau-vao-doan-van) cho phép luyện riêng thao tác này.

## Câu 147–175: chữa Part 7 một văn bản bằng bằng chứng

Với mỗi câu, viết cạnh đáp án đúng **vị trí bằng chứng**: tiêu đề, dòng đầu, đoạn hai, ghi chú cuối hoặc một cặp câu. Sau đó phân loại câu hỏi:

- mục đích hoặc ý chính;
- chi tiết trực tiếp;
- từ đồng nghĩa hoặc paraphrase;
- suy luận;
- từ vựng trong ngữ cảnh;
- vị trí chèn câu.

Thông báo tự biên soạn: “Visitors collecting equipment must bring the confirmation email and a photo ID. Collection is available at the east entrance from 2 p.m. to 5 p.m.”

Nếu câu hỏi hỏi **cần mang gì**, bằng chứng là *confirmation email and a photo ID*. Nếu hỏi **nhận thiết bị ở đâu**, bằng chứng là *east entrance*. Chi tiết *2 p.m. to 5 p.m.* là đúng trong bài nhưng không trả lời hai câu trên — đây là kiểu bẫy “đúng thông tin, sai câu hỏi”.

Nếu đáp án diễn đạt khác nguyên văn, viết cặp tương đương vào sổ, chẳng hạn *collect equipment* ↔ *pick up the items*. Đó là dữ liệu ôn có giá trị hơn việc chép cả đoạn. Bạn có thể luyện tiếp với [Part 7 một văn bản có câu hỏi và lời giải](/toeic/part-7/doc-hieu-mot-doan-van).

## Câu 176–200: chữa bài đôi và ba văn bản

Với mỗi bộ, ghi một dòng cho từng văn bản trước khi xem câu hỏi sai:

- Văn bản A: ai viết, gửi cho ai, mục đích gì?
- Văn bản B: bổ sung, phản hồi hay thay đổi thông tin nào?
- Văn bản C: xác nhận kết quả, lịch, giá hoặc điều kiện nào?

Câu liên kết thông tin thường không có một câu duy nhất chứa toàn bộ đáp án. Ví dụ email cho biết khách đặt gói Standard, bảng giá cho biết gói Standard không gồm giao hàng, còn hóa đơn có thêm phí vận chuyển. Muốn trả lời “vì sao tổng tiền cao hơn giá gói”, bạn phải nối cả ba dữ kiện.

Khi sai, ghi rõ mình đã bỏ qua **văn bản nào** hoặc **mối nối nào**. Nếu thường xuyên đúng bài đơn nhưng sai bài đôi/ba, luyện [hai văn bản](/toeic/part-7/doc-hieu-hai-doan-van) trước rồi mới chuyển sang [ba văn bản](/toeic/part-7/doc-hieu-ba-van-ban).

## Review cả những câu không kịp làm

Một câu bỏ trống vì hết giờ không nên được xếp chung với lỗi kiến thức. Ghi thời điểm bạn bắt đầu Part 7 và câu cuối đã làm chắc. Sau đó xem lại phân bổ thời gian bằng [khung 75 phút TOEIC Reading](/blog/quan-ly-thoi-gian-toeic-reading-75-phut).

Khi làm lại, dùng hai lượt:

1. **Lượt không bấm giờ:** giải thích được bằng chứng và lý do loại từng đáp án.
2. **Lượt có giờ:** kiểm tra liệu thao tác đúng có thực hiện được trong nhịp làm bài hay không.

Nếu lượt một vẫn sai, cần học kiến thức hoặc kỹ năng đọc. Nếu lượt một đúng nhưng lượt hai sai, cần luyện nhận diện nhanh, thứ tự làm bài hoặc quyết định bỏ qua câu khó.

## Từ bảng lỗi đến kế hoạch bảy ngày

Sau khi chữa đủ câu 101–200, chọn tối đa ba vấn đề có tần suất hoặc tác động lớn nhất. Một tuần mẫu có thể là:

- **Ngày 1:** học lại một chủ điểm Part 5 và tự đặt năm câu.
- **Ngày 2:** làm hai đoạn Part 6, giải thích quan hệ giữa các câu.
- **Ngày 3:** luyện ba văn bản đơn, gạch đúng bằng chứng.
- **Ngày 4:** ôn các cặp paraphrase đã ghi.
- **Ngày 5:** luyện một bộ đôi và một bộ ba văn bản.
- **Ngày 6:** làm một section Reading có giờ.
- **Ngày 7:** chữa lại câu sai và so sánh mẫu lỗi với đầu tuần.

Chỉ đổi trọng tâm khi dữ liệu mới cho thấy lỗi cũ đã giảm. Nếu cần một mẫu ghi ngắn hơn, dùng [sổ lỗi bốn dòng của TOEIC GYM](/blog/cach-review-loi-sai-toeic). Kết quả bài luyện là độ chính xác trên bộ câu đã làm, không phải điểm TOEIC chính thức; ETS dùng scaled score và quy trình quy đổi riêng cho từng form thi.`,
  publishedAt: new Date("2026-09-23T03:00:00.000Z"),
  createdAt: new Date("2026-09-23T03:00:00.000Z"),
  updatedAt: new Date("2026-10-06T03:00:00.000Z"),
};
