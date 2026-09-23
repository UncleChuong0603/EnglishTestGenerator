import type { PostCategory } from "./core";
import { TOEIC_TIP_POSTS } from "./toeic-tips";
import { GRAMMAR_POSTS, grammarImageForSlug } from "./grammar-editorial";
import { ETS_2025_REVIEW_POST } from "./ets-2025-review";

export type EditorialPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "PUBLISHED";
  category: PostCategory;
  seoTitle: string;
  seoDescription: string;
  canonicalPath: string;
  coverMediaId: null;
  coverAlt: string;
  socialTitle: string;
  socialDescription: string;
  authorName: string;
  targetTopic: string;
  searchIntent: string;
  noindex: false;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  tags: { name: string; slug: string }[];
  editorialCover: string;
};

const dates = { publishedAt: new Date("2026-09-20T02:00:00.000Z"), createdAt: new Date("2026-09-20T02:00:00.000Z"), updatedAt: new Date("2026-09-23T02:00:00.000Z") };
const tag = (name: string, slug: string) => ({ name, slug });
const cover = (category: PostCategory) => `/blog/cover/${category.toLowerCase()}`;

function post(input: Omit<EditorialPost, keyof typeof dates | "status" | "coverMediaId" | "noindex" | "createdBy" | "updatedBy" | "editorialCover">): EditorialPost {
  return { ...input, ...dates, status: "PUBLISHED", coverMediaId: null, noindex: false, createdBy: "editorial", updatedBy: "editorial", editorialCover: cover(input.category) };
}

export const EDITORIAL_POSTS: EditorialPost[] = [
  ETS_2025_REVIEW_POST,
  ...TOEIC_TIP_POSTS,
  post({
    id: "editorial-score-roadmap", category: "TOEIC_STRATEGY", slug: "chien-luoc-tang-diem-toeic-450-den-700",
    title: "Chiến lược tăng điểm TOEIC từ 450 lên 700: học gì trước?",
    excerpt: "Lộ trình ưu tiên theo từng mốc điểm, giúp bạn ngừng học dàn trải và tập trung vào những phần tạo ra nhiều điểm nhất.",
    seoTitle: "Cách tăng điểm TOEIC từ 450 lên 700 theo lộ trình",
    seoDescription: "Lộ trình tăng điểm TOEIC 450 lên 700: chọn Part ưu tiên, phân bổ thời gian, đo tiến bộ và tránh các lỗi học dàn trải.", canonicalPath: "/blog/chien-luoc-tang-diem-toeic-450-den-700",
    coverAlt: "Bản đồ lộ trình tăng điểm TOEIC từ 450 lên 700", socialTitle: "Tăng TOEIC 450 lên 700: lộ trình thực tế", socialDescription: "Biết rõ nên học gì trước ở từng giai đoạn thay vì luyện đề liên tục.", authorName: "TOEICGym Editorial", targetTopic: "tăng điểm TOEIC 450 lên 700", searchIntent: "informational", tags: [tag("Lộ trình TOEIC", "lo-trinh-toeic"), tag("TOEIC 700", "toeic-700")],
    content: `## Đừng bắt đầu bằng một lịch học thật dày

Từ 450 lên 700 không chỉ là làm thêm thật nhiều đề. Khoảng điểm này thường cho thấy người học đã nhận ra cấu trúc bài thi nhưng còn mất điểm vì ba nguyên nhân: vốn từ theo ngữ cảnh chưa đủ, ngữ pháp nền chưa tự động và tốc độ xử lý chưa ổn định. Vì vậy, lộ trình hiệu quả cần ưu tiên đúng thứ tự.

## Giai đoạn 1: củng cố điểm chắc chắn

Trong 2 tuần đầu, hãy dùng một bài đánh giá để xác định Part yếu thay vì đoán. Với Reading, ưu tiên Part 5 để củng cố loại từ, thì, mệnh đề quan hệ và liên từ. Với Listening, tập trung Part 2 vì câu ngắn giúp bạn nhận ra nhanh vấn đề về từ để hỏi, thì và ý định người nói.

- Học 20–30 phút mỗi ngày, 5 ngày mỗi tuần.
- Sau mỗi lượt luyện, ghi lại **lý do sai**, không chỉ đáp án đúng.
- Ôn lại câu sai sau 1 ngày và 3 ngày.
- Chỉ tăng số lượng khi độ chính xác đã ổn định.

## Giai đoạn 2: chuyển từ kiến thức sang tốc độ

Khi Part 5 và Part 2 đạt khoảng 75–80% trong các bộ câu vừa sức, bắt đầu ghép bài theo nhóm. Part 3–4 cần nghe theo cụm thông tin: ai, ở đâu, vấn đề gì và hành động tiếp theo. Part 6–7 cần đọc câu hỏi trước, tìm từ khóa và nhận ra cách đề diễn đạt lại thông tin.

Đừng bấm giờ quá gắt ngay từ đầu. Hãy đo thời gian hoàn thành tự nhiên trong ba buổi, sau đó giảm mục tiêu khoảng 5–10% mỗi tuần. Tốc độ bền vững đến từ khả năng nhận dạng mẫu câu, không phải đọc hoặc nghe vội.

## Giai đoạn 3: mô phỏng áp lực bài thi

Trong 2–3 tuần cuối, xen kẽ một bài thi thử với các buổi sửa lỗi. Một bài thi thử chỉ có giá trị khi bạn dành đủ thời gian phân tích. Chia lỗi thành bốn nhóm: thiếu từ vựng, sai ngữ pháp, bỏ sót chi tiết và quản lý thời gian. Nhóm lỗi xuất hiện nhiều nhất sẽ là trọng tâm tuần tiếp theo.

## Lịch mẫu 6 tuần

- **Tuần 1–2:** Part 2, Part 5 và từ vựng nền. Theo dõi độ chính xác theo kỹ năng.
- **Tuần 3–4:** Part 3–4, Part 6–7. Theo dõi tốc độ và lỗi paraphrase.
- **Tuần 5:** Bài hỗn hợp theo nửa đề. Theo dõi sức bền và cách phân bổ thời gian.
- **Tuần 6:** Thi thử, sửa lỗi và ôn nhẹ. Theo dõi độ ổn định qua nhiều lần làm bài.

Điểm số không tăng tuyến tính từng ngày. Hãy nhìn xu hướng của 3–5 phiên gần nhất và số lỗi lặp lại. Khi lỗi cũ giảm, bạn đang tiến bộ ngay cả khi một bài cụ thể khó hơn.

## Ví dụ: chọn việc học từ sổ lỗi

Giả sử một bài luyện có 12 câu sai: 6 câu Part 5 do nhầm loại từ, 4 câu Part 7 do thiếu thời gian và 2 câu nghe sai tên riêng. Buổi tiếp theo nên bắt đầu bằng 10 câu loại từ có giải thích, rồi một cụm Part 7 bấm giờ. Đừng dành cả buổi để học từ mới chỉ vì đó là việc dễ bắt đầu. Sau một tuần, so lại *số lỗi cùng loại trên cùng số câu*, không so hai đề có độ khó khác nhau.

Nếu bạn chỉ có 35 phút mỗi ngày, dùng [lộ trình TOEIC 30 ngày cho người bận rộn](/blog/lo-trinh-hoc-toeic-30-ngay-cho-nguoi-ban-ron) để chia nhỏ lịch. Mốc 450 và 700 là mục tiêu tham khảo, không phải lời hứa tăng điểm trong sáu tuần.`
  }),
  post({
    id: "editorial-listening", category: "LISTENING", slug: "cach-luyen-nghe-toeic-part-3-4",
    title: "Cách luyện nghe TOEIC Part 3 và 4 không cần nghe từng từ",
    excerpt: "Kỹ thuật đọc trước câu hỏi, dự đoán bối cảnh và bắt cụm thông tin giúp bạn theo kịp hội thoại dài.",
    seoTitle: "Cách luyện nghe TOEIC Part 3, 4 hiệu quả", seoDescription: "Hướng dẫn luyện nghe TOEIC Part 3 và 4: đọc trước câu hỏi, bắt từ khóa, nhận diện paraphrase và sửa lỗi bằng transcript.", canonicalPath: "/blog/cach-luyen-nghe-toeic-part-3-4", coverAlt: "Tai nghe và dạng sóng minh họa luyện nghe TOEIC Part 3 và 4", socialTitle: "Nghe Part 3–4 mà không cần hiểu từng từ", socialDescription: "Một quy trình nghe chủ động, dễ áp dụng trong mỗi buổi luyện.", authorName: "TOEICGym Editorial", targetTopic: "cách luyện nghe TOEIC Part 3 4", searchIntent: "informational", tags: [tag("TOEIC Listening", "toeic-listening"), tag("Part 3", "part-3"), tag("Part 4", "part-4")],
    content: `## Vì sao cố nghe từng từ lại làm bạn chậm hơn?

Part 3 và Part 4 kiểm tra khả năng theo dõi mục đích giao tiếp, chi tiết và hành động tiếp theo. Nếu cố dịch từng từ sang tiếng Việt, bạn dễ mắc kẹt ở một câu và bỏ lỡ phần còn lại. Mục tiêu tốt hơn là nhận ra **khung thông tin** của đoạn nghe.

## Quy trình 4 bước cho mỗi nhóm câu

### 1. Đọc trước câu hỏi

Trong thời gian hướng dẫn hoặc khoảng nghỉ, đọc nhanh ba câu hỏi. Gạch trong đầu các từ giúp xác định người, địa điểm, vấn đề, thời gian hoặc hành động. Đừng đọc kỹ cả bốn đáp án nếu chưa đủ thời gian.

### 2. Dự đoán bối cảnh

Các từ như appointment, shipment, invoice hay reservation giúp bạn dự đoán ngữ cảnh. Dự đoán không phải chọn đáp án trước; nó giúp não chuẩn bị nhóm từ vựng có thể xuất hiện.

### 3. Nghe ý và paraphrase

Đáp án có thể diễn đạt lại ý trong đoạn nghe. “The delivery has been delayed” có thể được hỏi thành “What problem does the speaker mention?”. Hãy kiểm tra ý nghĩa của cả cụm thay vì chỉ săn một từ trùng khớp.

### 4. Chốt đáp án và chuyển tiếp

Nếu phân vân, loại đáp án sai bối cảnh rồi chọn phương án tốt nhất. Không dùng thời gian của đoạn sau để cứu một câu trước.

## Sửa bài bằng transcript đúng cách

Nghe lại lần hai mà chưa xem transcript. Sau đó mở transcript, đánh dấu đoạn chứa đáp án và từ nối bạn đã bỏ lỡ. Cuối cùng nghe lại ở tốc độ chuẩn, vừa nghe vừa theo dõi chữ, rồi đóng transcript và nghe lần cuối.

Bạn không cần chép chính tả toàn bộ. Chỉ chép câu chứa lỗi phát âm nối âm, từ vựng mới hoặc paraphrase quan trọng. Cách này giữ thời gian sửa bài ngắn nhưng vẫn có chiều sâu.

## Bài luyện 20 phút

- 3 phút đọc câu hỏi và dự đoán bối cảnh.
- 5 phút làm một nhóm Part 3 hoặc Part 4.
- 8 phút nghe lại và phân tích transcript.
- 4 phút nhại lại 2–3 câu quan trọng.

Theo dõi riêng ba loại lỗi: không nhận ra âm, không biết từ và biết từ nhưng không theo kịp ý. Mỗi loại lỗi cần một cách sửa khác nhau; đây là lý do bảng điểm tổng không đủ để định hướng buổi học tiếp theo.

## Ví dụ nhận diện paraphrase

Trong câu hỏi tự luyện “What will the woman do next?”, bạn nghe “I’ll send the revised schedule this afternoon.” Đáp án đúng có thể viết “Email an updated timetable”. *Send* tương ứng với *email*, còn *revised schedule* tương ứng với *updated timetable*. Ví dụ này do TOEICGym biên soạn để minh họa kỹ thuật, không phải câu hỏi ETS.

Sau khi chọn đáp án, gạch dưới cụm trong transcript tạo ra suy luận. Nếu không tìm được bằng chứng, đánh dấu là câu đoán đúng và ôn lại. Với câu suy luận, bằng chứng có thể nằm ở cả ngữ cảnh thay vì một cụm từ duy nhất. Nếu hay mất nhịp trước khi vào đoạn hội thoại, luyện [Part 2 hỏi đáp ngắn](/blog/meo-lam-toeic-part-2-hoi-dap); nếu Reading chậm, xem [khung luyện 75 phút](/blog/quan-ly-thoi-gian-toeic-reading-75-phut).`
  }),
  post({
    id: "editorial-reading", category: "READING", slug: "quan-ly-thoi-gian-toeic-reading-75-phut",
    title: "Cách chia 75 phút TOEIC Reading để không bỏ dở Part 7",
    excerpt: "Khung thời gian thực tế cho Part 5, 6, 7 cùng chiến thuật xử lý khi bạn bắt đầu chậm hơn dự kiến.",
    seoTitle: "Cách chia thời gian TOEIC Reading 75 phút", seoDescription: "Cách quản lý 75 phút TOEIC Reading cho Part 5, 6, 7, kèm mốc kiểm tra và chiến thuật tránh bỏ trắng Part 7.", canonicalPath: "/blog/quan-ly-thoi-gian-toeic-reading-75-phut", coverAlt: "Đồng hồ 75 phút và ba phần của bài TOEIC Reading", socialTitle: "Chia 75 phút Reading để không bỏ Part 7", socialDescription: "Khung thời gian và mốc kiểm soát dễ nhớ cho ngày thi.", authorName: "TOEICGym Editorial", targetTopic: "chia thời gian TOEIC Reading 75 phút", searchIntent: "informational", tags: [tag("TOEIC Reading", "toeic-reading"), tag("Part 7", "part-7")],
    content: `## Mục tiêu không phải làm Part 5 thật nhanh bằng mọi giá

Reading có 100 câu trong 75 phút. Nhiều người dành quá lâu cho các câu ngữ pháp khó rồi phải đoán hàng loạt ở Part 7. Một khung để thử là: Part 5 trong 12 phút, Part 6 trong 10 phút, Part 7 trong 50 phút và 3 phút cuối để rà đáp án. Nếu bạn tô đáp án ngay sau mỗi câu, có thể chuyển bớt thời gian kiểm tra cho Part 7.

## Mốc kiểm soát dễ nhớ

- Còn 63 phút: chuyển sang Part 6.
- Còn 53 phút: bắt đầu Part 7.
- Còn 25 phút: nên bước vào nhóm nhiều đoạn văn.
- Còn 3 phút: hoàn tất mọi ô đáp án, quay lại câu đã đánh dấu.

Khung này cần được điều chỉnh theo năng lực. Nếu bạn mạnh Part 5, có thể tiết kiệm vài phút; nếu thường sai vì đọc vội, đừng ép xuống một mốc không thực tế.

## Quy tắc 30 giây cho câu mắc kẹt

Với Part 5, nếu sau khoảng 30 giây bạn vẫn chưa xác định được câu đang kiểm tra gì, hãy loại đáp án rõ ràng sai, đánh dấu và chuyển tiếp. Một câu khó có cùng giá trị điểm với câu dễ.

Ở Part 7, đọc câu hỏi trước đoạn văn để biết cần tìm thông tin nào. Với câu hỏi ý chính, đọc tiêu đề, câu mở đầu và mục đích của tài liệu. Với câu hỏi chi tiết, xác định tên riêng, ngày, số hoặc từ khóa rồi quét đúng vùng văn bản.

## Xử lý bài đọc đôi và ba

Đừng đọc cả ba tài liệu từ đầu đến cuối rồi mới nhìn câu hỏi. Hãy đọc câu hỏi, xác định câu nào chỉ cần một tài liệu và câu nào yêu cầu kết nối nhiều nguồn. Làm câu đơn nguồn trước để tích lũy điểm chắc chắn.

Các câu suy luận nên làm sau câu chi tiết. Khi đã hiểu nhân vật, thời gian và sự kiện, bạn sẽ suy luận nhanh hơn và ít dựa vào cảm giác.

## Cách luyện để khung thời gian trở thành phản xạ

Mỗi tuần, làm ít nhất hai phiên có bấm giờ nhưng không nhất thiết làm đủ 100 câu. Một phiên có thể là 30 câu Part 5 trong 12 phút; phiên khác là một cụm Part 7 trong 20 phút. Sau khi chấm, ghi lại số câu đúng và số câu phải đoán vì hết giờ.

Bạn chỉ nên rút thời gian khi độ chính xác không giảm mạnh. Quản lý thời gian tốt là hoàn thành nhiều câu **có chất lượng**, không phải lướt qua toàn bộ đề.

## Minh họa một cách chia 75 phút

![Sơ đồ gợi ý phân bổ 75 phút Reading: Part 5 12 phút, Part 6 10 phút, Part 7 50 phút và 3 phút kiểm tra](/blog/reading-75-minute-plan.svg)

*Đây là khung luyện tập để thử và điều chỉnh, không phải thời gian cố định do ETS quy định.* [ETS xác nhận Reading có 100 câu trong 75 phút](https://www.in.ets.org/toeic/test-takers/about/listening-reading.html); thí sinh tự phân bổ thời gian trong phần này.

Ví dụ khi còn 50 phút mà vẫn ở Part 5, hãy chốt các câu chưa chắc bằng phương án tốt nhất và chuyển sang phần còn lại theo thứ tự bạn đã tập. Trong buổi sửa bài, ghi rõ câu nào sai vì kiến thức và câu nào sai vì vội. Nếu câu đúng giảm mạnh khi bấm giờ, tăng thời gian cho Part đó ở lượt luyện kế tiếp thay vì ép tốc độ. Xem [quy trình giải Part 5](/blog/meo-lam-toeic-part-5-trong-thoi-gian-gioi-han), [cách đọc Part 6](/blog/meo-lam-toeic-part-6-dien-doan-van) và [cách truy bằng chứng Part 7](/blog/meo-lam-toeic-part-7-doc-hieu-nhieu-van-ban) để thử từng chặng của khung giờ.`
  }),
  post({
    id: "editorial-grammar", category: "GRAMMAR", slug: "ngu-phap-toeic-part-5-can-hoc",
    title: "7 chủ điểm ngữ pháp TOEIC Part 5 cần học trước",
    excerpt: "Danh sách ngữ pháp có tần suất ứng dụng cao, dấu hiệu nhận biết và cách luyện để tránh học lan man.",
    seoTitle: "7 chủ điểm ngữ pháp TOEIC Part 5 quan trọng", seoDescription: "Tổng hợp 7 chủ điểm ngữ pháp TOEIC Part 5 nên ưu tiên: loại từ, thì, hòa hợp, mệnh đề, liên từ, giới từ và cấu trúc so sánh.", canonicalPath: "/blog/ngu-phap-toeic-part-5-can-hoc", coverAlt: "Các khối câu minh họa ngữ pháp TOEIC Part 5", socialTitle: "Ngữ pháp Part 5: học 7 nhóm này trước", socialDescription: "Dấu hiệu nhận biết và cách ôn theo lỗi thay vì học thuộc rời rạc.", authorName: "TOEICGym Editorial", targetTopic: "ngữ pháp TOEIC Part 5", searchIntent: "informational", tags: [tag("Ngữ pháp TOEIC", "ngu-phap-toeic"), tag("Part 5", "part-5")],
    content: `## 1. Loại từ

Đây là nhóm tạo điểm nhanh vì vị trí trống thường cho biết cần danh từ, động từ, tính từ hay trạng từ. Hãy nhìn từ đứng trước và sau chỗ trống trước khi dịch cả câu. Ví dụ, sau mạo từ thường cần danh từ; trước danh từ thường là tính từ.

## 2. Thì và dạng động từ

Không học thì như một bảng công thức tách rời. Hãy gắn chúng với dấu hiệu thời gian và quan hệ giữa các sự kiện. TOEIC thường dùng hiện tại đơn cho quy trình, hiện tại hoàn thành cho trải nghiệm hoặc thay đổi đến hiện tại, và tương lai cho lịch trình hoặc cam kết.

## 3. Hòa hợp chủ ngữ – động từ

Tìm chủ ngữ chính, bỏ qua cụm giới từ chen giữa. Các từ như each, every, neither thường đi với động từ số ít; trong khi a number of đi với số nhiều nhưng the number of đi với số ít.

## 4. Mệnh đề quan hệ

Phân biệt who, which, that, whose và where dựa trên danh từ được thay thế và vai trò còn thiếu trong mệnh đề. Đừng chọn chỉ vì thấy danh từ chỉ người hoặc vật; cần kiểm tra sau chỗ trống đã có chủ ngữ hay chưa.

## 5. Liên từ và trạng từ nối

Because nối một mệnh đề, because of đi với cụm danh từ. Although tạo quan hệ nhượng bộ trong một câu, còn however thường nối ý giữa hai câu hoặc hai mệnh đề độc lập với dấu câu phù hợp.

## 6. Giới từ

Giới từ trong TOEIC xuất hiện nhiều trong cụm cố định công sở: responsible for, interested in, comply with, prior to. Nên học cả cụm và một câu ví dụ thay vì ghi riêng từng từ.

## 7. So sánh và lượng từ

Chú ý danh từ đếm được, không đếm được và cấu trúc so sánh. Fewer đi với danh từ đếm được số nhiều; less đi với danh từ không đếm được. Các cấu trúc the more…, the more… hoặc one of the most… cũng xuất hiện thường xuyên.

## Đọc sâu từng chủ điểm

- [Loại từ: tìm đáp án bằng vị trí trong câu](/blog/loai-tu-trong-toeic-part-5)
- [Thì và dạng động từ: đọc mốc thời gian](/blog/thi-va-dang-dong-tu-toeic)
- [Hòa hợp chủ ngữ – động từ: tìm chủ ngữ chính](/blog/hoa-hop-chu-ngu-dong-tu-toeic)
- [Mệnh đề quan hệ: who, which, whose, where](/blog/menh-de-quan-he-toeic)
- [Liên từ: because, although, however](/blog/lien-tu-va-tu-noi-toeic)
- [Giới từ trong email công việc](/blog/gioi-tu-toeic-trong-cong-viec)
- [So sánh và lượng từ: fewer hay less](/blog/so-sanh-va-luong-tu-toeic)

## Cách ôn 15 phút mỗi ngày

Chọn một chủ điểm, làm 8–10 câu và ghi lại mẫu khiến bạn chọn sai. Cuối tuần, trộn các chủ điểm để kiểm tra khả năng nhận diện. Nếu chỉ luyện từng nhóm riêng, bạn có thể làm đúng vì đã biết trước dạng bài chứ chưa thật sự nhận ra tín hiệu trong đề.

## Thử một câu loại từ

“The manager gave a ___ explanation of the new policy.” Chọn **clear**, không chọn *clearly*: chỗ trống đứng trước danh từ *explanation*, nên cần tính từ bổ nghĩa cho danh từ. Sau khi làm, viết lại tín hiệu “a + tính từ + danh từ” vào sổ lỗi. Đây là câu minh họa do TOEICGym biên soạn, không phải đề ETS.

Nếu bạn hay chọn theo nghĩa tiếng Việt trước khi nhìn cấu trúc, thử [bài Word Form ngắn](/toeic/part-5/word-form) rồi giải thích vì sao ba đáp án còn lại sai. Sau đó áp dụng [quy trình tìm tín hiệu quanh chỗ trống](/blog/meo-lam-toeic-part-5-trong-thoi-gian-gioi-han). Nếu làm đúng nhưng quá chậm, kết hợp [khung thời gian Reading](/blog/quan-ly-thoi-gian-toeic-reading-75-phut) để kiểm tra tốc độ thực tế.`
  }),
  post({
    id: "editorial-vocabulary", category: "VOCABULARY", slug: "tu-vung-toeic-theo-chu-de-cong-so",
    title: "Từ vựng TOEIC theo chủ đề công sở: học cụm, không học từ lẻ",
    excerpt: "Cách xây vốn từ có thể dùng ngay trong Listening và Reading bằng collocation, ngữ cảnh và lịch ôn ngắt quãng.",
    seoTitle: "Từ vựng TOEIC theo chủ đề công sở dễ nhớ", seoDescription: "Học từ vựng TOEIC theo cụm và chủ đề: tuyển dụng, họp, giao hàng, du lịch công tác; kèm phương pháp ôn ngắt quãng.", canonicalPath: "/blog/tu-vung-toeic-theo-chu-de-cong-so", coverAlt: "Sổ từ vựng TOEIC với các chủ đề công sở", socialTitle: "Học từ vựng TOEIC theo cụm để nhớ lâu", socialDescription: "Biến danh sách từ thành vốn từ dùng được trong bài thi.", authorName: "TOEICGym Editorial", targetTopic: "từ vựng TOEIC theo chủ đề", searchIntent: "informational", tags: [tag("Từ vựng TOEIC", "tu-vung-toeic"), tag("Collocation", "collocation")],
    content: `## Vì sao danh sách 600 từ thường không đủ?

Biết nghĩa tiếng Việt của một từ chưa chắc giúp bạn nhận ra nó khi nghe hoặc chọn đúng trong câu. TOEIC kiểm tra từ trong ngữ cảnh công việc, vì vậy đơn vị học hiệu quả nên là **cụm từ + tình huống + một câu mẫu**.

## Bốn nhóm nên học trước

### Tuyển dụng và nhân sự

Các cụm phổ biến gồm apply for a position, meet the qualifications, conduct an interview, receive training và employee benefits. Hãy chú ý cả từ loại: application, applicant và applicable có vai trò khác nhau.

### Họp và dự án

Học các cụm schedule a meeting, meet a deadline, submit a proposal, reach an agreement và provide an update. Đây là nhóm thường xuất hiện trong email, thông báo và hội thoại nội bộ.

### Đơn hàng và giao nhận

Các cụm process an order, issue an invoice, track a shipment, delivery delay và out of stock giúp bạn xử lý cả Part 3, 4, 6 và 7.

### Du lịch công tác

Ưu tiên make a reservation, boarding pass, travel itinerary, rental vehicle và accommodation. Học thêm các cách diễn đạt tương đương vì đề thường paraphrase.

## Mẫu thẻ từ hiệu quả

Mặt trước ghi một câu có chỗ trống: “The supplier will ___ the order by Friday.” Mặt sau ghi confirm, phát âm, nghĩa ngắn và cụm confirm an order. Câu có ngữ cảnh buộc bạn nhớ cách dùng, không chỉ nhận mặt từ.

## Lịch ôn ngắt quãng

Ôn lại sau 1 ngày, 3 ngày, 7 ngày và 14 ngày. Mỗi lần, ưu tiên tự nhớ trước khi lật đáp án. Nếu một từ liên tục sai, thêm một câu ví dụ mới hoặc đối chiếu với từ dễ nhầm.

## Biến từ mới thành điểm số

Sau khi học 10–15 cụm, làm một bài ngắn đúng chủ đề. Đánh dấu cụm đã gặp và cách đề biến đổi chúng. Chu trình học – gặp trong câu hỏi – sửa lỗi giúp từ vựng gắn với tín hiệu bài thi và được nhớ lâu hơn.

## Thử học một cụm thay vì một từ

Với *postpone a meeting*, ghi thêm câu “The team postponed the meeting until Friday.” Khi đọc email thông báo, bạn có thể gặp *the meeting has been rescheduled for Friday* — cùng ý đổi lịch nhưng cách diễn đạt khác. Hãy ghi cả hai cụm vào một thẻ, đọc lại sau vài ngày và tự viết một câu mới. Đây là ví dụ tự biên soạn để luyện cách diễn đạt lại.

Trong tuần, kiểm tra từ đã học qua một đoạn email ngắn. Nếu chỉ nhận ra từ trên thẻ mà không hiểu nó trong câu, thêm câu chứa ngữ cảnh thay vì tăng số lượng thẻ. Xem [cách tìm bằng chứng trong Part 7](/blog/meo-lam-toeic-part-7-doc-hieu-nhieu-van-ban) để dùng vốn từ trong bài đọc thực tế.`
  }),
  post({
    id: "editorial-study-plan", category: "STUDY_PLAN", slug: "lo-trinh-hoc-toeic-30-ngay-cho-nguoi-ban-ron",
    title: "Lộ trình học TOEIC 30 ngày cho người bận rộn",
    excerpt: "Kế hoạch 30–45 phút mỗi ngày với mục tiêu rõ cho từng tuần, ngày nghỉ và cách điều chỉnh khi lỡ buổi.",
    seoTitle: "Lộ trình học TOEIC 30 ngày cho người bận rộn", seoDescription: "Kế hoạch học TOEIC 30 ngày, 30–45 phút mỗi ngày: đánh giá đầu vào, luyện theo điểm yếu, thi thử và ôn lỗi có hệ thống.", canonicalPath: "/blog/lo-trinh-hoc-toeic-30-ngay-cho-nguoi-ban-ron", coverAlt: "Lịch học TOEIC 30 ngày với các buổi luyện ngắn", socialTitle: "Lộ trình TOEIC 30 ngày, mỗi ngày 30–45 phút", socialDescription: "Một kế hoạch đủ nhẹ để duy trì và đủ rõ để đo tiến bộ.", authorName: "TOEICGym Editorial", targetTopic: "lộ trình học TOEIC 30 ngày", searchIntent: "informational", tags: [tag("Kế hoạch học", "ke-hoach-hoc"), tag("30 ngày", "30-ngay")],
    content: `## Nguyên tắc: buổi ngắn nhưng có vòng phản hồi

Một kế hoạch tốt phải gồm luyện, chấm, hiểu lỗi và ôn lại. Nếu 45 phút chỉ dùng để làm câu mới, bạn sẽ lặp lại cùng một lỗi. Hãy dành ít nhất một phần ba thời gian cho sửa bài.

## Tuần 1: đo điểm xuất phát

Ngày đầu làm bài đánh giá hoặc một bộ hỗn hợp vừa sức. Trong các ngày tiếp theo, chia thời gian cho Part yếu nhất và một Part bạn có thể cải thiện nhanh. Cuối tuần xem lại lỗi theo kỹ năng: loại từ, ý chính, chi tiết, paraphrase hay không nhận ra âm.

## Tuần 2: xây kỹ năng nền

Mỗi ngày chọn một mục tiêu hẹp. Ví dụ: 10 câu loại từ, một nhóm Part 3, hoặc một bài đọc email. Học tối đa 10–15 cụm từ mới từ chính các câu đã làm. Ngày thứ bảy nghỉ hoặc chỉ ôn thẻ từ 10 phút.

## Tuần 3: tăng tốc và trộn dạng bài

Bắt đầu bấm giờ cho các nhóm ngắn. Xen kẽ Listening và Reading để tránh học lệch. Hai buổi trong tuần nên là bài hỗn hợp, giúp bạn chuyển nhanh giữa các dạng câu hỏi.

## Tuần 4: mô phỏng và ổn định

Làm một bài dài vào đầu tuần, sau đó dùng 2–3 ngày sửa lỗi. Cuối tuần làm bài mô phỏng cuối cùng ở đúng khung giờ dự kiến thi. Ngày trước kỳ thi chỉ ôn nhẹ, chuẩn bị giấy tờ và ngủ đủ.

## Khung 35 phút mẫu

- 5 phút ôn lại lỗi cũ.
- 15 phút làm bài có mục tiêu.
- 10 phút đọc giải thích và ghi lý do sai.
- 5 phút ôn từ vựng vừa gặp.

Nếu bỏ lỡ một ngày, không cần học gấp đôi vào hôm sau. Tiếp tục lịch và dời bài thi thử nếu cần. Tính liên tục quan trọng hơn một buổi học quá sức khiến bạn bỏ cuộc trong nhiều ngày.

## Mẫu theo dõi sau mỗi buổi

Ghi bốn cột: ngày, Part đã làm, số đúng trên tổng số câu, và lỗi lặp lại. Ví dụ: “Thứ ba | Part 3 | 7/9 | nghe nhầm giờ giao hàng”. Buổi kế tiếp nghe lại đúng đoạn có thời gian, rồi làm một nhóm mới. Cuối tuần, nếu cùng lỗi còn xuất hiện, giữ mục tiêu đó thêm một tuần. Nếu lỗi đã giảm, chuyển sang nhóm lỗi lớn tiếp theo.

Ngày bận nhất, chỉ cần 10 phút xem lại ba câu sai cũ. Với mục tiêu tăng điểm dài hơn, đọc [lộ trình từ 450 lên 700](/blog/chien-luoc-tang-diem-toeic-450-den-700) để chọn Part ưu tiên; lịch 30 ngày này là khung tổ chức việc học, không đảm bảo một mức điểm cụ thể.`
  }),
  post({
    id: "editorial-exam", category: "EXAM_TIPS", slug: "kinh-nghiem-thi-toeic-ngay-thi",
    title: "Kinh nghiệm thi TOEIC: checklist trước và trong ngày thi",
    excerpt: "Chuẩn bị giấy tờ, nhịp sinh hoạt và chiến thuật phòng thi để năng lực thật không bị giảm vì lỗi nhỏ.",
    seoTitle: "Kinh nghiệm thi TOEIC và checklist ngày thi", seoDescription: "Checklist thi TOEIC: giấy tờ, thời gian có mặt, ăn ngủ, tô đáp án và cách xử lý khi mất tập trung trong phòng thi.", canonicalPath: "/blog/kinh-nghiem-thi-toeic-ngay-thi", coverAlt: "Checklist chuẩn bị cho ngày thi TOEIC", socialTitle: "Checklist ngày thi TOEIC để tránh mất điểm oan", socialDescription: "Những việc nhỏ nên chuẩn bị từ tối hôm trước đến khi nộp bài.", authorName: "TOEICGym Editorial", targetTopic: "kinh nghiệm thi TOEIC ngày thi", searchIntent: "informational", tags: [tag("Ngày thi TOEIC", "ngay-thi-toeic"), tag("Checklist", "checklist")],
    content: `## Trước ngày thi

Kiểm tra chính xác giấy tờ được đơn vị tổ chức yêu cầu, địa điểm, phòng thi và giờ có mặt. Quy định có thể thay đổi theo từng đơn vị, vì vậy hãy đọc thông báo chính thức thay vì chỉ dựa vào kinh nghiệm truyền miệng.

Chuẩn bị quần áo thoải mái, đường đi và phương án dự phòng. Không cố học một chủ điểm mới vào tối cuối. Ôn nhẹ các lỗi quen thuộc rồi đi ngủ đúng giờ giúp ích nhiều hơn một buổi luyện kéo dài.

## Buổi sáng ngày thi

Ăn món quen thuộc, uống đủ nước nhưng tránh thay đổi thói quen với quá nhiều cà phê. Đến sớm để có thời gian ổn định tâm lý và xử lý tình huống giao thông. Tắt hoặc cất thiết bị theo đúng hướng dẫn của giám thị.

## Trong phần Listening

Tận dụng khoảng hướng dẫn để làm quen âm lượng và đọc trước khi được phép. Nếu bỏ lỡ một câu, chọn phương án tốt nhất rồi chuyển tiếp. Việc cố nhớ lại một đoạn đã qua thường khiến bạn mất thêm câu kế tiếp.

Giữ mắt ở nhóm câu hiện tại. Với Part 3 và 4, xác định nhanh câu hỏi về ai, ở đâu, vấn đề và hành động tiếp theo.

## Trong phần Reading

Giữ các mốc thời gian đã luyện. Không để một câu Part 5 khó lấy mất thời gian của nhiều câu Part 7. Tô đáp án theo nhịp ổn định và kiểm tra số câu để tránh lệch dòng.

Khi mất tập trung, dừng vài giây, thở chậm và quay lại từ câu hiện tại. Đừng tự đánh giá điểm số giữa bài; năng lượng đó nên dành cho câu còn lại.

## Năm phút cuối

Đảm bảo mọi câu đều có đáp án theo hướng dẫn của buổi thi. Kiểm tra các câu đã đánh dấu và vị trí tô, không thay đổi hàng loạt chỉ vì lo lắng. Sau khi nộp bài, ghi lại trải nghiệm khi còn nhớ để kế hoạch sau này thực tế hơn.

## Checklist ngắn có thể lưu lại

- **Trước khi đi:** xác nhận địa điểm, giờ có mặt và giấy tờ theo email từ đơn vị tổ chức.
- **Trước khi vào phòng:** để thiết bị, đồng hồ và đồ cá nhân đúng nơi được yêu cầu.
- **Khi làm Reading:** nhìn mốc thời gian đã luyện; nếu kẹt một câu, đánh dấu rồi chuyển tiếp.
- **Trước khi nộp:** kiểm tra đáp án còn trống và việc tô đúng dòng nếu thi trên giấy.

[ETS mô tả bài Listening & Reading gồm 45 phút nghe và 75 phút đọc](https://www.ets.org/toeic/about/listening-reading.html). Quy định giấy tờ, vật dụng và thời gian có mặt phụ thuộc địa điểm thi; hãy dùng thông báo đăng ký của bạn làm nguồn quyết định. Nếu phần Reading thường không kịp, thử [khung chia 75 phút](/blog/quan-ly-thoi-gian-toeic-reading-75-phut) trước ngày thi.`
  }),
  ...GRAMMAR_POSTS,
];

export { grammarImageForSlug };

export function getEditorialPost(slug: string) { return EDITORIAL_POSTS.find(item => item.slug === slug) ?? null; }
