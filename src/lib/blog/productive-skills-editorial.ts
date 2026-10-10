import type { EditorialPost } from "./editorial";

const dates = {
  publishedAt: new Date("2026-10-08T10:00:00.000Z"),
  createdAt: new Date("2026-10-08T10:00:00.000Z"),
  updatedAt: new Date("2026-10-08T10:00:00.000Z"),
};

function productivePost(input: Omit<EditorialPost, "status" | "coverMediaId" | "noindex" | "createdBy" | "updatedBy" | "contentOrigin" | "publishedAt" | "createdAt" | "updatedAt">): EditorialPost {
  return { ...input, ...dates, status: "PUBLISHED", coverMediaId: null, noindex: false, createdBy: "editorial", updatedBy: "editorial", contentOrigin: "AI_ASSISTED" };
}

export const PRODUCTIVE_SKILLS_POSTS: EditorialPost[] = [
  productivePost({
    id: "editorial-toeic-speaking-format",
    slug: "toeic-speaking-la-gi-cau-truc-11-cau",
    title: "TOEIC Speaking là gì? Cấu trúc 11 câu, cách chấm và lộ trình luyện",
    excerpt: "Hiểu năm dạng nhiệm vụ trong 11 câu TOEIC Speaking, thời gian, tiêu chí đánh giá và cách tự chẩn đoán bằng câu trả lời tự biên soạn.",
    category: "TOEIC_STRATEGY",
    seoTitle: "TOEIC Speaking: cấu trúc 11 câu và cách luyện",
    seoDescription: "Cấu trúc TOEIC Speaking 11 câu, khoảng 20 phút, thang 0–200; giải thích từng task, tiêu chí chấm và lộ trình luyện có prompt tự biên soạn.",
    canonicalPath: "/blog/toeic-speaking-la-gi-cau-truc-11-cau",
    coverAlt: "Năm dạng nhiệm vụ trong bài TOEIC Speaking 11 câu",
    editorialCover: "/blog/cover/toeic_strategy",
    socialTitle: "TOEIC Speaking 11 câu: biết mình phải nói gì trước khi luyện",
    socialDescription: "Format, thời gian, tiêu chí và cách chọn task yếu nhất để bắt đầu.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "TOEIC Speaking là gì cấu trúc 11 câu",
    searchIntent: "TOEIC_SPEAKING_FORMAT_DIAGNOSTIC",
    tags: [{ name: "TOEIC Speaking", slug: "toeic-speaking" }, { name: "TOEIC 4 kỹ năng", slug: "toeic-4-ky-nang" }],
    content: `## TOEIC Speaking đo năng lực gì?

TOEIC Speaking đo khả năng tạo phản hồi nói trong những tình huống giao tiếp và công việc. Bạn không chọn A, B, C, D như Listening & Reading; câu trả lời được ghi âm và đánh giá theo nhiệm vụ. Vì vậy, biết nhiều từ chưa đủ nếu bạn không tổ chức được ý trong thời gian ngắn hoặc nói lệch yêu cầu.

Theo [format ETS đang công bố](https://www.ets.org/toeic/about/speaking-writing.html), bài Speaking có **11 câu**, kéo dài khoảng **20 phút** và được báo trên thang **0–200**. Hãy kiểm tra lại trang chính thức trước ngày thi vì quy trình tổ chức có thể được cập nhật.

## Câu 1–2: Read a Text Aloud

Bạn có 45 giây chuẩn bị và 45 giây đọc thành tiếng cho mỗi đoạn. ETS nêu hai nhóm tiêu chí chính: pronunciation; intonation and stress. Mục tiêu không phải diễn giọng quảng cáo, mà là đọc rõ, chia cụm hợp lý và giữ nhịp để người nghe theo được.

Khi chuẩn bị, đánh dấu dấu câu, từ nội dung cần nhấn và cụm dễ vấp. Nếu một từ lạ xuất hiện, đừng dừng quá lâu giữa bài; giữ câu tiếp tục quan trọng hơn việc sửa đi sửa lại một từ. Ôn [trọng âm từ](/blog/trong-am-tu-tieng-anh-quy-tac-cach-tra) và [âm cuối](/blog/am-cuoi-tieng-anh-cach-phat-am-khong-them-am) bằng câu hoàn chỉnh.

## Câu 3–4: Describe a Picture

Bạn có 45 giây chuẩn bị và 30 giây mô tả. Một câu trả lời hữu ích thường đi từ toàn cảnh đến người/vật nổi bật, hành động và vị trí. Không cần đoán nghề nghiệp, quan hệ hoặc cảm xúc nếu ảnh không cung cấp bằng chứng.

ETS đánh giá thêm grammar, vocabulary và cohesion bên cạnh độ rõ của lời nói. Vì vậy, một danh sách “a man, a table, a window” kém hiệu quả hơn các câu kết nối: **In the foreground, a man is placing several folders on a table, while two colleagues are talking near the window.** Đọc [khung mô tả tranh 30 giây](/blog/toeic-speaking-mo-ta-tranh-khung-tra-loi) để xem prompt và bài mẫu tự biên soạn.

## Câu 5–7: Respond to Questions

Mỗi câu chỉ có 3 giây chuẩn bị. Câu 5–6 cho 15 giây trả lời; câu 7 cho 30 giây. Bạn cần phản hồi trực tiếp trước, rồi thêm lý do hoặc chi tiết phù hợp với thời gian.

Ví dụ tự luyện: **How often do you attend online meetings, and what do you usually discuss?** Mở đầu bằng tần suất, không vòng sang mô tả công ty: **I attend online meetings three or four times a week. We usually discuss project deadlines and client feedback.** Với 30 giây, thêm một ví dụ nhưng không kể chuyện dài đến mức bỏ câu hỏi chính.

## Câu 8–10: dùng thông tin được cung cấp

Bạn có 45 giây đọc tài liệu trước khi câu hỏi bắt đầu. Sau đó, mỗi câu có 3 giây chuẩn bị; câu 8–9 cho 15 giây, câu 10 cho 30 giây và được hỏi hai lần. Nhiệm vụ không phải đọc lại toàn bộ lịch mà là tìm đúng ô thông tin rồi diễn đạt thành câu trả lời tự nhiên.

Trong 45 giây, xác định loại tài liệu, ngày, giờ, tên người, phí hoặc thay đổi đáng chú ý. Nếu lịch ghi **10:30 – Product demo – Room B**, trả lời **The product demonstration is scheduled for 10:30 in Room B**, không chỉ đọc “10:30, Product demo, Room B”.

## Câu 11: Express an Opinion

Bạn có 45 giây chuẩn bị và 60 giây nói. Một khung an toàn gồm quan điểm, lý do thứ nhất + ví dụ, lý do thứ hai + hệ quả, và câu kết. Đừng học thuộc một bài chung; prompt mới có thể khiến ví dụ thuộc lòng lệch chủ đề.

Prompt tự biên soạn: **Do you think companies should allow employees to choose their own starting time? Why or why not?** Trong 45 giây, ghi bốn từ khóa: *agree – commute – productivity – coordination*. Khi nói, biến chúng thành câu và nêu điều kiện, chẳng hạn lịch linh hoạt vẫn cần giờ làm việc chung cho cuộc họp.

## TOEIC Speaking được chấm thế nào?

[ETS Examinee Handbook](https://www.ets.org/pdfs/toeic/toeic-speaking-writing-examinee-handbook.pdf) cho biết câu 1–10 dùng thang nhiệm vụ 0–3, còn câu 11 dùng thang 0–5; tổng rating được chuyển sang scaled score 0–200. Tiêu chí được bổ sung dần: phát âm, ngữ điệu/trọng âm; rồi ngữ pháp, từ vựng, liên kết; sau đó mức liên quan và đầy đủ của nội dung.

Điều này không có nghĩa bạn tự cộng điểm thô để dự đoán chính xác scaled score. Khi tự chấm, chỉ dùng rubric như checklist: câu có trả lời đúng việc không, có đủ ý chính không, người nghe có hiểu mà không phải đoán không, và lỗi ngôn ngữ có làm mờ nghĩa không.

## Bài chẩn đoán 12 phút

1. Đọc một thông báo 70–90 từ và ghi âm 45 giây.
2. Mô tả một ảnh quen thuộc trong 30 giây.
3. Trả lời một câu hỏi thói quen trong 15 giây.
4. Đọc một lịch ngắn rồi trả lời một chi tiết trong 15 giây.
5. Nêu ý kiến trong 60 giây.

Nghe lại và gắn mỗi lỗi vào một nhóm: delivery, language, organization hoặc task fulfillment. Chỉ chọn nhóm lớn nhất cho tuần đầu. Nếu phát âm làm mất nghĩa, dùng [lộ trình pronunciation](/blog/am-cuoi-tieng-anh-cach-phat-am-khong-them-am); nếu thiếu ý, luyện dàn ý bằng từ khóa thay vì viết cả bài rồi đọc.

## Lộ trình luyện bốn tuần

- Tuần 1: đọc thành tiếng và mô tả tranh, ưu tiên độ rõ.
- Tuần 2: trả lời câu hỏi ngắn, tập câu trực tiếp + chi tiết.
- Tuần 3: đọc lịch/bảng thông tin và diễn đạt lại.
- Tuần 4: opinion có bấm giờ, sau đó trộn đủ năm task.

Mỗi ngày 20–30 phút đủ nếu có vòng ghi âm–nghe lại–sửa một lỗi–thu lại. Kết hợp [shadowing](/blog/shadowing-la-gi-cach-luyen-tieng-anh) để cải thiện nhịp, nhưng nhớ rằng shadowing không thay thế việc tự tạo nội dung.

## Chọn đúng bài thi và bước tiếp theo

Speaking có điểm riêng, không cộng máy móc vào thang 990 của Listening & Reading. Nếu chưa chắc nơi nhận hồ sơ yêu cầu gì, xem [TOEIC 2 kỹ năng và 4 kỹ năng](/blog/toeic-2-ky-nang-va-4-ky-nang). Nếu cần cả đầu ra viết, tiếp tục với [email TOEIC Writing](/blog/toeic-writing-email-cach-viet-bai-mau) và [opinion essay](/blog/toeic-writing-opinion-essay-cach-viet).`
  }),
  productivePost({
    id: "editorial-speaking-picture",
    slug: "toeic-speaking-mo-ta-tranh-khung-tra-loi",
    title: "TOEIC Speaking mô tả tranh: khung 30 giây và 3 bài mẫu",
    excerpt: "Chuẩn bị trong 45 giây, nói trong 30 giây bằng khung toàn cảnh–vị trí–hành động; có ba cảnh tự biên soạn và bài mẫu được phân tích.",
    category: "EXAM_TIPS",
    seoTitle: "TOEIC Speaking mô tả tranh: khung và bài mẫu",
    seoDescription: "Cách làm TOEIC Speaking Describe a Picture câu 3–4: khung 30 giây, từ chỉ vị trí, lỗi cần tránh và 3 bài mẫu tự biên soạn.",
    canonicalPath: "/blog/toeic-speaking-mo-ta-tranh-khung-tra-loi",
    coverAlt: "Khung mô tả tranh TOEIC Speaking từ toàn cảnh đến chi tiết",
    editorialCover: "/blog/cover/exam_tips",
    socialTitle: "Mô tả tranh TOEIC Speaking trong 30 giây mà không liệt kê",
    socialDescription: "Một khung bốn bước, ba cảnh luyện và checklist nghe lại bản ghi.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "TOEIC Speaking mô tả tranh bài mẫu",
    searchIntent: "TOEIC_SPEAKING_PICTURE_MODEL_RESPONSES",
    tags: [{ name: "TOEIC Speaking", slug: "toeic-speaking" }, { name: "Mô tả tranh", slug: "mo-ta-tranh" }],
    content: `## Task mô tả tranh nằm ở đâu?

Câu 3–4 của TOEIC Speaking yêu cầu mô tả ảnh. Theo [ETS](https://www.ets.org/toeic/about/speaking-writing.html), mỗi câu cho 45 giây chuẩn bị và 30 giây nói. Bản ghi được đánh giá về độ rõ, trọng âm/ngữ điệu, ngữ pháp, từ vựng và sự liên kết.

Ba cảnh dưới đây do TOEIC GYM tự biên soạn để luyện chiến lược, không phải ảnh hoặc câu hỏi ETS. Hãy dùng đồng hồ thật và không viết cả đoạn trong lúc chuẩn bị.

## Khung bốn bước cho 30 giây

1. **Mở cảnh:** nơi chốn hoặc ấn tượng chung có bằng chứng.
2. **Tiền cảnh:** người/vật nổi bật và hành động.
3. **Hậu cảnh:** thêm một hoặc hai chi tiết có vị trí.
4. **Kết:** một chi tiết môi trường chắc chắn, không suy diễn.

Khung này giúp câu trả lời có hướng, nhưng không bắt buộc mỗi ảnh phải đủ bốn phần. Ảnh ít người có thể dành nhiều thời gian cho vật, bố cục hoặc hành động.

## 45 giây chuẩn bị nên ghi gì?

Chỉ ghi 6–8 từ khóa: **place – people – action – objects – position**. Ví dụ: *office / two people / reviewing / laptop / papers / window*. Chọn thì hiện tại tiếp diễn cho hành động đang xảy ra và **there is/are** cho sự tồn tại hoặc bố trí.

Không viết nguyên câu rồi cố đọc. Khi quên một chữ, toàn bộ script dễ đổ. Từ khóa cho phép bạn diễn đạt lại bằng câu đơn giản hơn.

## Bài mẫu 1: khu vực làm việc

**Cảnh luyện:** Một người phụ nữ và một người đàn ông đứng cạnh bàn trong văn phòng. Người phụ nữ chỉ vào màn hình laptop; người đàn ông cầm một tập giấy. Có cửa sổ và vài hộp tài liệu phía sau.

**Bài mẫu:** *This picture was taken in an office. In the foreground, two coworkers are standing next to a desk. The woman is pointing at a laptop screen, while the man is holding several sheets of paper. There are some document boxes behind them, and a large window is visible in the background. They seem to be reviewing some information together.*

Câu trả lời đi từ nơi chốn đến hai người, hành động, vật và hậu cảnh. Câu cuối dùng *seem to be* cho suy luận nhẹ; nếu không chắc, có thể bỏ mà câu vẫn hoàn chỉnh.

## Bài mẫu 2: quán cà phê

**Cảnh luyện:** Một nhân viên đặt cốc lên quầy. Một khách hàng đang mở ví. Trên quầy có máy tính tiền và một khay bánh; vài bàn trống ở phía sau.

**Bài mẫu:** *The picture shows the inside of a café. A staff member is placing a cup on the counter, and a customer is opening a wallet. I can also see a cash register and a tray of pastries on the counter. In the background, several tables are empty. The café looks clean and well organized.*

Không cần gọi chính xác loại đồ uống hoặc nghề của khách. Các danh từ phổ thông nhưng đúng ảnh có giá trị hơn từ hiếm dùng sai.

## Bài mẫu 3: khu vực giao hàng

**Cảnh luyện:** Hai công nhân đứng gần xe tải. Một người đẩy xe hàng có các thùng carton; người còn lại kiểm tra bảng kẹp giấy. Cửa kho đang mở.

**Bài mẫu:** *This appears to be a delivery area. On the left, a worker is pushing a cart loaded with cardboard boxes. Another worker is looking at a clipboard near a truck. Behind them, the warehouse door is open. Several packages are ready to be moved, so the workers may be preparing a shipment.*

Các cụm *on the left, near, behind* tạo liên kết không gian. Suy luận cuối được đánh dấu bằng *may be* thay vì khẳng định điều ảnh không chứng minh.

## Ngữ pháp và từ vựng đủ dùng

- hành động: **is placing, are talking, is being loaded**;
- vị trí: **in the foreground, behind, next to, on the right**;
- tồn tại: **there is, there are, I can see**;
- nối chi tiết: **while, and, also, in addition**;
- suy luận thận trọng: **appears to be, seems to be, may be**.

Ôn [câu bị động](/blog/cau-bi-dong-toeic-part-5) cho vật đang được xử lý và [từ vựng công sở theo cụm](/blog/tu-vung-toeic-theo-chu-de-cong-so) để tránh dịch từng danh từ.

## Sáu lỗi làm câu trả lời yếu

- Liệt kê danh từ mà không tạo câu.
- Dùng quá nhiều *I can see* liên tiếp.
- Đoán tên, quan hệ hoặc cảm xúc không có bằng chứng.
- Nói chi tiết nhỏ trước khi nêu cảnh chính.
- Dừng để sửa một lỗi và mất phần còn lại.
- Học thuộc đoạn văn không khớp ảnh.

Nếu thiếu một từ, mô tả chức năng: *a device for making payments* thay cho việc im lặng vì quên *card reader*. Task đánh giá khả năng truyền đạt, không phải thi gọi tên mọi vật.

## Checklist tự nghe lại

- Tôi có nêu được nơi hoặc toàn cảnh không?
- Có ít nhất hai hành động đúng với cảnh không?
- Người nghe xác định được vị trí các chi tiết không?
- Tôi dùng thì và số ít/số nhiều nhất quán không?
- Lỗi phát âm có làm mất từ khóa không?
- Câu trả lời có kết thúc tự nhiên trước 30 giây không?

[ETS Handbook](https://www.ets.org/pdfs/toeic/toeic-speaking-writing-examinee-handbook.pdf) mô tả câu đạt mức cao của task là nêu được đặc điểm chính, nhìn chung dễ hiểu và dùng từ/cấu trúc đủ để diễn đạt mạch lạc. Checklist này chỉ hỗ trợ luyện tập, không thay thế chấm điểm chính thức.

## Lịch luyện bảy ngày

Mỗi ngày chọn một ảnh đời thường, chuẩn bị 45 giây, nói 30 giây rồi thu lại đúng một lần sau khi sửa. Ngày 1–2 chỉ luyện toàn cảnh và hành động; ngày 3–4 thêm vị trí; ngày 5 thêm câu bị động; ngày 6 trộn cảnh; ngày 7 làm hai ảnh liên tiếp.

Nếu bản ghi khó hiểu vì âm cuối hoặc trọng âm, quay lại [cụm luyện phát âm](/blog/am-cuoi-tieng-anh-cach-phat-am-khong-them-am). Nếu bạn nói rõ nhưng không đủ ý, đọc [tổng quan TOEIC Speaking 11 câu](/blog/toeic-speaking-la-gi-cau-truc-11-cau) và dùng bài chẩn đoán để so với các task khác.`
  }),
  productivePost({
    id: "editorial-writing-email",
    slug: "toeic-writing-email-cach-viet-bai-mau",
    title: "TOEIC Writing Email: cách trả lời câu 6–7 và 3 bài mẫu",
    excerpt: "Đọc vai người gửi–người nhận, gạch đủ yêu cầu và viết email trong 10 phút; có ba prompt tự biên soạn, bài mẫu và checklist tự chấm.",
    category: "EXAM_TIPS",
    seoTitle: "TOEIC Writing Email: cách viết và 3 bài mẫu",
    seoDescription: "Cách làm TOEIC Writing câu 6–7 Respond to a Written Request trong 10 phút: bố cục, checklist yêu cầu và 3 email mẫu tự biên soạn.",
    canonicalPath: "/blog/toeic-writing-email-cach-viet-bai-mau",
    coverAlt: "Bố cục trả lời email trong TOEIC Writing câu 6 và 7",
    editorialCover: "/blog/cover/exam_tips",
    socialTitle: "TOEIC Writing Email: đủ yêu cầu trước khi viết hay",
    socialDescription: "Ba prompt mới, ba bài mẫu và quy trình kiểm tra trong 10 phút.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "TOEIC Writing email bài mẫu câu 6 7",
    searchIntent: "TOEIC_WRITING_EMAIL_MODEL_PRACTICE",
    tags: [{ name: "TOEIC Writing", slug: "toeic-writing" }, { name: "Email tiếng Anh", slug: "email-tieng-anh" }],
    content: `## TOEIC Writing Email yêu cầu gì?

Câu 6–7 thuộc task Respond to a Written Request. Theo [ETS](https://www.ets.org/toeic/about/speaking-writing.html), bạn có 10 phút để đọc và trả lời mỗi email. [ETS Handbook](https://www.ets.org/pdfs/toeic/toeic-speaking-writing-examinee-handbook.pdf) nêu các nhóm đánh giá gồm chất lượng và sự đa dạng câu, từ vựng và tổ chức.

Điểm xuất phát vẫn là **hoàn thành đúng yêu cầu**. Một email lịch sự nhưng bỏ sót hai câu hỏi hoặc nhập sai vai người gửi có thể kém hiệu quả hơn email dùng câu đơn giản nhưng xử lý đủ việc.

## Quy trình 10 phút

- Phút 0–2: xác định vai, mục đích và gạch từng yêu cầu.
- Phút 2–3: ghi thứ tự ý trả lời.
- Phút 3–8: viết email.
- Phút 8–10: kiểm tra đủ ý, thì, số ít/số nhiều, tên và thời gian.

Đừng dành năm phút cho câu chào. Phần thân cần thời gian vì đây là nơi bạn cung cấp thông tin, đặt câu hỏi, đưa hướng xử lý hoặc giải thích.

## Bố cục năm phần

1. Greeting phù hợp.
2. Purpose: xác nhận lý do viết.
3. Response: xử lý lần lượt từng yêu cầu.
4. Next action: thời hạn, tài liệu hoặc câu hỏi cần người nhận phản hồi.
5. Closing và tên/vai phù hợp với prompt.

Khung này gần với email công việc thật. Đọc thêm [hướng dẫn email tiếng Anh công việc](/blog/cach-viet-email-tieng-anh-cong-viec-mau) để phân biệt subject, greeting và mức độ lịch sự; trong bài thi, luôn ưu tiên chỉ dẫn cụ thể của prompt.

## Bài mẫu 1: trả lời khách hàng hỏi địa điểm

**Prompt tự biên soạn:** Bạn là điều phối viên của Harbor Meeting Center. Một khách hàng hỏi phòng cho 25 người vào chiều 18 tháng 11, thiết bị trình chiếu và giá. Hãy trả lời, cung cấp hai thông tin và đặt một câu hỏi.

**Bài mẫu:**

*Dear Ms. Patel,*

*Thank you for asking about our meeting rooms. The Bay Room is available on the afternoon of November 18 and can accommodate up to 30 people. It includes a projector, screen, and wireless internet. The rental fee is $280 for four hours, including basic technical support.*

*Could you let me know what time your meeting will begin? Once I receive the time, I can place a 48-hour hold on the room and send you the reservation form.*

*Best regards,*  
*Linh Tran*  
*Event Coordinator*

Email xử lý đủ sức chứa, thiết bị, giá và đặt câu hỏi về giờ bắt đầu. Câu cuối tạo bước tiếp theo thay vì kết thúc chung chung.

## Bài mẫu 2: phản hồi sự cố giao hàng

**Prompt tự biên soạn:** Bạn làm ở bộ phận dịch vụ khách hàng. Khách báo nhận thiếu hai hộp trong đơn 16 hộp. Hãy xin lỗi, giải thích hành động tiếp theo và yêu cầu hai thông tin.

**Bài mẫu:**

*Dear Mr. Nguyen,*

*I’m sorry that your shipment arrived with two boxes missing. I have asked our warehouse team to review the packing record, and we will send any items left at our facility by express delivery at no additional cost.*

*To help us locate the boxes, could you please send the order number and a photo of the shipping label? We will update you by 3:00 p.m. tomorrow after the review is complete.*

*Sincerely,*  
*Customer Support Team*

Hai request được viết thành một câu rõ. Deadline cụ thể giúp email hoàn chỉnh nhưng không bịa cam kết nếu prompt không cho phép; trong bài luyện, đó là chi tiết của tình huống tự biên soạn.

## Bài mẫu 3: đổi lịch phỏng vấn

**Prompt tự biên soạn:** Bạn là ứng viên không thể dự phỏng vấn lúc 9 giờ sáng thứ Ba. Hãy giải thích ngắn, đề xuất hai thời gian khác và hỏi hình thức phỏng vấn.

**Bài mẫu:**

*Dear Ms. Owens,*

*Thank you for inviting me to interview for the operations assistant position. Unfortunately, I have a required client meeting at 9:00 a.m. on Tuesday and cannot attend at that time.*

*Would Wednesday at 2:00 p.m. or Thursday morning be convenient instead? I am flexible within those periods. Also, could you confirm whether the interview will be held at your office or by video call?*

*Thank you for your understanding. I look forward to speaking with you.*

*Best regards,*  
*Mai Le*

Email không kể dài về lý do. Hai lựa chọn thời gian và một câu hỏi được đặt ở cùng đoạn để người nhận hành động nhanh.

## Cách tăng chất lượng câu mà không làm email rối

Kết hợp câu đơn rõ với một vài cấu trúc phức: **Once I receive..., I can...**; **Although..., we will...**; **Could you confirm whether...?** Đa dạng không có nghĩa nối mọi ý bằng một câu dài.

Ưu tiên collocation như **confirm availability, review a record, arrange delivery, provide an update**. [Bài collocation công sở](/blog/collocation-la-gi-cum-tu-toeic-thong-dung) và [các cặp từ dễ nhầm](/blog/tu-de-nham-trong-tieng-anh-toeic-part-5) giúp giảm lỗi dùng từ.

## Lỗi thường gặp

- Trả lời theo quan điểm cá nhân thay vì đúng vai trong prompt.
- Bỏ một request nhỏ như đặt hai câu hỏi.
- Chép lại email gốc mà không thêm hành động.
- Dùng lời chào thân mật trong tình huống trang trọng.
- Viết câu quá dài, thiếu dấu câu.
- Hứa thời gian, giá hoặc chính sách trái dữ kiện được cho.

Khi prompt yêu cầu “make two requests”, hãy đếm hai hành động thật sự. Hai cách diễn đạt cùng một request không tự động thành hai yêu cầu khác nhau.

## Checklist hai phút cuối

- Vai người viết và người nhận có đúng không?
- Mỗi bullet/yêu cầu đã có câu xử lý chưa?
- Tên, ngày, giờ và số lượng có khớp prompt không?
- Động từ có chủ ngữ và thì rõ không?
- Email có mở, thân, bước tiếp theo và kết không?
- Tôi có thể xóa câu nào không phục vụ nhiệm vụ không?

Đây là checklist luyện tập, không phải công cụ quy đổi điểm chính thức. Sau khi viết, so bài với tiêu chí và sửa đúng một nhóm lỗi. Để hiểu toàn bài tám câu, xem [TOEIC 2 và 4 kỹ năng](/blog/toeic-2-ky-nang-va-4-ky-nang); với task dài hơn, tiếp tục [TOEIC Writing opinion essay](/blog/toeic-writing-opinion-essay-cach-viet).`
  }),
  productivePost({
    id: "editorial-writing-opinion",
    slug: "toeic-writing-opinion-essay-cach-viet",
    title: "TOEIC Writing Opinion Essay: dàn ý, bài mẫu và checklist câu 8",
    excerpt: "Lập luận điểm–lý do–ví dụ cho câu 8, quản lý thời gian và tự sửa bài; có prompt cùng bài mẫu hơn 300 từ do TOEIC GYM biên soạn.",
    category: "EXAM_TIPS",
    seoTitle: "TOEIC Writing Opinion Essay: dàn ý và bài mẫu",
    seoDescription: "Cách viết TOEIC Writing câu 8 opinion essay: phân tích đề, dàn ý, quản lý thời gian, bài mẫu trên 300 từ và checklist tự sửa.",
    canonicalPath: "/blog/toeic-writing-opinion-essay-cach-viet",
    coverAlt: "Dàn ý luận điểm lý do ví dụ cho TOEIC Writing opinion essay",
    editorialCover: "/blog/cover/exam_tips",
    socialTitle: "TOEIC Writing câu 8: đủ lập luận trước khi dùng từ khó",
    socialDescription: "Một prompt mới, bài mẫu trên 300 từ và cách tự sửa theo tiêu chí.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "TOEIC Writing opinion essay câu 8 bài mẫu",
    searchIntent: "TOEIC_WRITING_OPINION_ESSAY_MODEL",
    tags: [{ name: "TOEIC Writing", slug: "toeic-writing" }, { name: "Opinion Essay", slug: "opinion-essay" }],
    content: `## Câu 8 TOEIC Writing yêu cầu gì?

Task cuối yêu cầu nêu, giải thích và hỗ trợ quan điểm. [ETS cho biết](https://www.ets.org/toeic/about/speaking-writing.html) một bài hiệu quả thường có tối thiểu 300 từ. Đây không phải mục tiêu “càng dài càng tốt”; bài phải có quan điểm rõ, lý do/ví dụ liên quan, ngữ pháp, từ vựng và tổ chức.

[ETS Handbook](https://www.ets.org/pdfs/toeic/toeic-speaking-writing-examinee-handbook.pdf) cho biết task này được rated 0–5 trước khi chuyển cùng các task khác thành scaled score Writing 0–200. Bạn không thể tự quy đổi chính xác chỉ từ bài mẫu, nhưng có thể dùng tiêu chí để kiểm tra điểm yếu.

## Phân tích prompt trong hai phút

Gạch ba thứ: chủ đề, lựa chọn/quan điểm phải đưa ra, và phạm vi. Nếu đề hỏi điều gì quan trọng nhất, bạn phải chọn một yếu tố và bảo vệ nó; liệt kê năm yếu tố mà không ưu tiên sẽ lệch nhiệm vụ.

Prompt tự biên soạn: **Some companies allow employees to work remotely several days a week. Do you think this arrangement benefits both employees and employers? Give reasons and examples to support your opinion.**

Chọn lập trường: nhìn chung có lợi nếu có quy tắc phối hợp. Hai lý do: giảm thời gian đi lại giúp tập trung; doanh nghiệp tiếp cận nhân sự rộng hơn và giảm chi phí. Phản biện ngắn: giao tiếp có thể khó, nhưng có thể xử lý bằng giờ họp chung.

## Dàn ý bốn đoạn

1. Introduction: paraphrase chủ đề và thesis trực tiếp.
2. Body 1: lý do thứ nhất, giải thích, ví dụ.
3. Body 2: lý do thứ hai, giải thích, ví dụ hoặc điều kiện.
4. Conclusion: khẳng định lại quan điểm và hệ quả chính.

Bốn đoạn không phải quy định bắt buộc; đây là khung dễ kiểm soát trong thời gian thi. Một body paragraph nên có quan hệ rõ giữa claim và example, không phải ba câu chung chung nối bằng *Moreover*.

## Bài mẫu tự biên soạn

*Allowing employees to work remotely for part of the week can benefit both workers and their employers, provided that the company establishes clear expectations. This arrangement can improve individual productivity while also giving organizations access to a wider range of talent.*

*First, remote work can help employees use their time and energy more effectively. People who spend an hour traveling to and from an office every day may begin work already tired. On a remote day, that time can be used to prepare for an important meeting, complete a report without interruption, or simply get adequate rest. For example, a project coordinator who needs to review a long contract may be more productive at home than in a busy open office. The employee completes focused work faster, and the company receives the finished task sooner.*

*Second, a flexible policy can make recruitment and retention easier. A company that requires every employee to live near one office limits the number of qualified applicants it can consider. If some work can be performed remotely, the organization can hire a specialist from another city and may not need to rent additional space immediately. Employees may also remain with the company longer because they can manage family responsibilities or transportation problems more easily. These advantages can reduce the cost and disruption of replacing experienced staff.*

*Remote work does create communication risks. Team members may miss information if everyone follows a different schedule. However, employers can reduce this problem by setting core collaboration hours, documenting decisions, and requiring employees to attend certain meetings. Such rules preserve flexibility without making teamwork optional.*

*In conclusion, a well-designed hybrid policy benefits employees by giving them more control over focused work and benefits employers by expanding hiring options and controlling costs. The strongest policy is not unlimited remote work, but a clear arrangement that combines flexibility with shared responsibilities.*

Bài mẫu vượt 300 từ và mỗi đoạn làm một nhiệm vụ. Nó không phải “đáp án chuẩn” để học thuộc; hãy quan sát cách ví dụ cụ thể hỗ trợ lý do và phản biện được xử lý ngắn.

## Vì sao bài mẫu có tính thuyết phục?

Thesis trả lời thẳng nhưng thêm điều kiện. Mỗi body bắt đầu bằng claim, rồi giải thích cơ chế và đưa ví dụ. Đoạn phản biện không đổi lập trường mà xử lý một hạn chế. Kết luận không đưa ý hoàn toàn mới.

Từ vựng chủ yếu là cụm công việc thông dụng: **establish expectations, complete a report, qualified applicants, reduce costs, collaboration hours**. Dùng [collocation công sở](/blog/collocation-la-gi-cum-tu-toeic-thong-dung) để viết tự nhiên hơn thay vì thay mọi từ bằng từ “học thuật”.

## Quản lý thời gian

Một khung luyện thực tế:

- 5 phút phân tích và lập dàn ý;
- 20–22 phút viết;
- 3–5 phút kiểm tra.

Hãy điều chỉnh qua bài bấm giờ; đừng coi khung này là thời lượng ETS cố định cho riêng câu 8 nếu giao diện thi không hiển thị như bạn dự đoán. Mục tiêu là luôn chừa thời gian kiểm tra thesis, chủ–vị, số nhiều, thì và dấu câu.

## Cách viết ví dụ không bị chung chung

Thay **Remote work is convenient** bằng chuỗi nguyên nhân: nhân viên bỏ thời gian di chuyển → có thêm khoảng tập trung → hoàn thành báo cáo sớm. Ví dụ không cần là nghiên cứu thật hoặc số liệu bịa; một tình huống hợp lý, cụ thể và liên quan trực tiếp đã đủ minh họa.

Nếu không có trải nghiệm cá nhân, dùng ví dụ giả định và báo hiệu bằng *For example, a company could...*. Không phát minh tên nghiên cứu hoặc phần trăm để làm bài có vẻ đáng tin.

## Ngôn ngữ liên kết nên dùng vừa đủ

- thêm lý do: **First, Another reason is that...**;
- giải thích hệ quả: **As a result, This means that...**;
- đưa ví dụ: **For example, For instance...**;
- nhượng bộ: **Although, However...**;
- kết luận: **In conclusion, Overall...**.

Từ nối không cứu được logic yếu. Sau mỗi câu *For example*, hãy hỏi ví dụ này chứng minh đúng claim trước đó không. Ôn [cấu trúc câu tiếng Anh](/blog/cau-truc-cau-tieng-anh-co-ban) nếu bài thường có câu dài thiếu chủ–vị.

## Checklist tự sửa năm phút

- Thesis có trả lời đúng câu hỏi không?
- Mỗi body có một lý do phân biệt không?
- Mỗi lý do có giải thích hoặc ví dụ cụ thể không?
- Đại từ có đối tượng rõ không?
- Câu phức có dấu câu và liên từ đúng không?
- Tôi có lặp cùng một từ quá nhiều không?
- Kết luận có khớp thesis không?
- Bài có đạt độ dài hữu ích mà không chèn câu rỗng không?

Sau khi sửa, viết lại riêng đoạn yếu nhất thay vì chép lại toàn bài. Nếu chưa quen phản hồi email ngắn, luyện [TOEIC Writing câu 6–7](/blog/toeic-writing-email-cach-viet-bai-mau) trước; nếu cần hiểu toàn bộ bốn kỹ năng và cách báo điểm, xem [TOEIC 2 kỹ năng và 4 kỹ năng](/blog/toeic-2-ky-nang-va-4-ky-nang).`
  }),
];
