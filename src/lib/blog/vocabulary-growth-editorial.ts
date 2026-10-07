import type { EditorialPost } from "./editorial";

const dates = {
  publishedAt: new Date("2026-10-07T14:00:00.000Z"),
  createdAt: new Date("2026-10-07T14:00:00.000Z"),
  updatedAt: new Date("2026-10-07T14:00:00.000Z"),
};

function vocabularyPost(input: Omit<EditorialPost, "status" | "coverMediaId" | "noindex" | "createdBy" | "updatedBy" | "contentOrigin" | "publishedAt" | "createdAt" | "updatedAt">): EditorialPost {
  return {
    ...input,
    ...dates,
    status: "PUBLISHED",
    coverMediaId: null,
    noindex: false,
    createdBy: "editorial",
    updatedBy: "editorial",
    contentOrigin: "AI_ASSISTED",
  };
}

export const VOCABULARY_GROWTH_POSTS: EditorialPost[] = [
  vocabularyPost({
    id: "editorial-collocation-toeic",
    slug: "collocation-la-gi-cum-tu-toeic-thong-dung",
    title: "Collocation là gì? 44 cụm từ TOEIC công sở và cách học theo ngữ cảnh",
    excerpt: "Hiểu vì sao những từ đúng nghĩa vẫn có thể đi cùng nhau không tự nhiên; học 44 collocation công sở theo hành động, chủ thể và câu ví dụ.",
    category: "VOCABULARY",
    seoTitle: "Collocation là gì? 44 cụm từ TOEIC thông dụng",
    seoDescription: "Collocation là các từ thường đi cùng nhau. Học 44 cụm TOEIC theo họp, tuyển dụng, đơn hàng, tài chính; có cách ghi thẻ và bài tập lời giải.",
    canonicalPath: "/blog/collocation-la-gi-cum-tu-toeic-thong-dung",
    coverAlt: "Các thẻ từ ghép thành collocation tiếng Anh trong bối cảnh công sở",
    editorialCover: "/blog/cover/vocabulary",
    socialTitle: "Đừng chỉ học nghĩa từ: hãy học từ nào đi cùng từ nào",
    socialDescription: "44 collocation công sở, cách tra và một quy trình biến cụm mới thành vốn từ dùng được.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "collocation là gì cụm từ TOEIC thông dụng",
    searchIntent: "COLLOCATION_GUIDE_PRACTICE",
    tags: [{ name: "Collocation", slug: "collocation" }, { name: "Từ vựng TOEIC", slug: "tu-vung-toeic" }],
    content: `## Collocation là gì?

Collocation là những từ thường xuất hiện cùng nhau theo một cách được người dùng ngôn ngữ chấp nhận là tự nhiên. [Cambridge Dictionary mô tả collocation](https://dictionary.cambridge.org/grammar/british-grammar/collocation_2) là cách các từ đi cùng nhau hoặc tạo quan hệ tương đối cố định.

Vì vậy, biết nghĩa riêng của hai từ chưa đủ để ghép chúng tùy ý. Trong môi trường công việc, người ta nói **meet a deadline**, **reach an agreement** và **raise a concern**. *Do a deadline*, *arrive an agreement* hoặc *lift a concern* có thể được đoán ra nghĩa nhưng không phải lựa chọn tự nhiên cho các tình huống đó.

## Collocation khác phrasal verb và idiom thế nào?

Collocation là khái niệm rộng về những từ thường đi cùng nhau: động từ + danh từ, tính từ + danh từ, trạng từ + tính từ hoặc danh từ + danh từ. Nghĩa của **make a reservation** vẫn khá rõ từ các thành phần.

Phrasal verb gồm động từ và particle như **put off** hoặc **fill out**; nghĩa của cả cụm có thể khác nghĩa riêng của động từ. Idiom thường có nghĩa khó suy trực tiếp hơn nữa. Ba nhóm có thể giao nhau trong cách học, nhưng đừng gắn mọi cụm nhiều từ thành “thành ngữ”. Đọc [phrasal verbs TOEIC theo tình huống](/blog/phrasal-verbs-toeic-theo-chu-de-cong-viec) để thấy sự khác biệt trong câu.

## 44 collocation TOEIC nên học theo tình huống

### Họp và dự án

- **schedule / postpone / attend a meeting:** lên lịch, hoãn, tham dự cuộc họp.
- **set / meet / extend a deadline:** đặt, đáp ứng, gia hạn hạn chót.
- **submit / review / approve a proposal:** nộp, xem xét, phê duyệt đề xuất.
- **provide an update:** cung cấp thông tin cập nhật.
- **reach an agreement:** đạt được thỏa thuận.
- **raise a concern:** nêu một mối lo ngại.
- **take minutes:** ghi biên bản cuộc họp.
- **allocate resources:** phân bổ nguồn lực.

Đừng học ba động từ của *meeting* như từ đồng nghĩa. Chủ thể và thời điểm quyết định hành động: trợ lý *schedules*, người tham gia *attends*, còn ban tổ chức có thể *postpone*.

### Tuyển dụng và nhân sự

- **apply for a position:** ứng tuyển một vị trí.
- **meet the qualifications:** đáp ứng tiêu chuẩn.
- **conduct an interview:** tiến hành phỏng vấn.
- **hire / train an employee:** tuyển, đào tạo nhân viên.
- **offer a promotion:** đề nghị/thăng chức.
- **receive benefits:** nhận phúc lợi.
- **take annual leave:** nghỉ phép năm.
- **fill a vacancy:** tuyển người cho vị trí trống.

Trong Part 5, lựa chọn có thể đều là động từ đúng ngữ pháp. Danh từ sau chỗ trống như *interview*, *position* hoặc *vacancy* mới là tín hiệu chọn collocation.

### Đơn hàng và dịch vụ

- **place / process / cancel an order:** đặt, xử lý, hủy đơn.
- **issue / pay an invoice:** xuất, thanh toán hóa đơn.
- **track / deliver a shipment:** theo dõi, giao lô hàng.
- **confirm a reservation:** xác nhận đặt chỗ.
- **handle a complaint:** xử lý khiếu nại.
- **request a refund:** yêu cầu hoàn tiền.
- **provide customer support:** hỗ trợ khách hàng.
- **meet customer demand:** đáp ứng nhu cầu khách hàng.

Một email có thể chuyển qua nhiều hành động: doanh nghiệp *issues an invoice*, khách hàng *pays the invoice*, còn bộ phận kế toán *records the payment*. Ghi luôn chủ thể điển hình giúp bạn không chỉ nhớ cặp từ.

### Tài chính và vận hành

- **reduce / cover costs:** giảm, trang trải chi phí.
- **generate revenue:** tạo doanh thu.
- **make a payment:** thực hiện thanh toán.
- **conduct an inspection:** tiến hành kiểm tra.
- **perform maintenance:** thực hiện bảo trì.
- **comply with regulations:** tuân thủ quy định.
- **maintain accurate records:** duy trì hồ sơ chính xác.
- **ensure quality:** bảo đảm chất lượng.

Hãy chú ý giới từ cố định trong **comply with**, **responsible for**, **eligible for**. Bài [giới từ trong email công việc](/blog/gioi-tu-toeic-trong-cong-viec) có câu luyện riêng cho nhóm này.

## Cách nhận ra câu collocation trong TOEIC Part 5

1. Xác định câu đã đủ cấu trúc ngữ pháp chưa.
2. Nhìn danh từ hoặc tính từ sát chỗ trống.
3. Ghép từng lựa chọn với từ đó thành cụm.
4. Kiểm tra chủ thể có thực hiện được hành động không.
5. Đọc lại cả câu để loại cụm đúng từ nhưng sai tình huống.

Ví dụ tự biên soạn: **The committee expects to _____ an agreement before Friday.** Các đáp án có thể đều là động từ, nhưng **reach an agreement** là cụm phù hợp với mục tiêu đàm phán. *Meet an agreement* sai cụm; *attend an agreement* sai nghĩa; *arrive an agreement* thiếu *at* và vẫn không phải lựa chọn ở cấu trúc này.

## Ghi một thẻ collocation thế nào?

Mặt trước đừng chỉ ghi *deadline*. Hãy ghi câu có chỗ trống: **Because the supplier was late, we had to _____ the deadline.** Mặt sau ghi **extend the deadline**, nghĩa, chủ thể thường gặp và một cách diễn đạt liên quan như *move the due date back*.

Mỗi thẻ nên có:

- cụm mục tiêu, không chỉ một từ;
- một câu đúng ngữ cảnh;
- chủ thể và vật nhận hành động;
- một cụm đối lập hoặc dễ nhầm;
- ngày cần tự nhớ lại tiếp theo.

Dùng [100 từ vựng TOEIC theo chủ đề](/toeic/tu-vung) để chọn từ nền, sau đó biến những từ đó thành cụm. [Flashcards công sở](/toeic/flashcards-tu-vung-cong-so) giúp ôn trong câu thay vì đọc danh sách tĩnh.

## Lịch ôn bảy ngày cho 12 cụm

- Ngày 1: chia 12 cụm thành ba tình huống và đọc câu ví dụ.
- Ngày 2: che động từ, tự điền từ danh từ cho sẵn.
- Ngày 3: đổi chủ thể hoặc thời gian trong sáu câu.
- Ngày 4: phân biệt cặp đối lập như *meet/extend a deadline*.
- Ngày 5: viết một email ngắn dùng bốn cụm.
- Ngày 7: làm câu mới không báo trước chủ đề và giải thích tín hiệu chọn.

Nếu chỉ nhận ra cụm khi nhìn đáp án nhưng không tự nhớ được, bạn đang ở mức nhận biết. Giảm số cụm và tăng lượt tự tạo câu. [Cách học từ vựng nhớ lâu](/blog/cach-hoc-tu-vung-tieng-anh-nho-lau-theo-cum) giải thích active recall và lịch ôn chi tiết hơn.

## Bước tiếp theo

Làm mini-practice ở đầu bài trước khi xem lời giải. Sau đó ghi lại cụm khiến bạn chọn sai, tìm thêm một câu trong ngữ cảnh công việc và dùng nó trong [bài Part 5 hỗn hợp](/toeic/part-5/practice). Mục tiêu không phải thuộc 44 cụm ngay hôm nay, mà là nhận ra đúng cụm trong một câu mới và biết vì sao các từ gần nghĩa không thay thế được nhau.`
  }),
  vocabularyPost({
    id: "editorial-phrasal-verbs-work",
    slug: "phrasal-verbs-toeic-theo-chu-de-cong-viec",
    title: "Phrasal verbs TOEIC: 30 cụm động từ công việc kèm cách dùng",
    excerpt: "Học phrasal verbs theo email, họp, đơn hàng và thiết bị; phân biệt cụm tách được, không tách được và luyện bằng câu có ngữ cảnh.",
    category: "VOCABULARY",
    seoTitle: "30 phrasal verbs TOEIC theo chủ đề công việc",
    seoDescription: "30 phrasal verbs TOEIC thường dùng trong email và công sở: fill out, put off, look into, carry out. Có cách dùng, vị trí tân ngữ và bài tập lời giải.",
    canonicalPath: "/blog/phrasal-verbs-toeic-theo-chu-de-cong-viec",
    coverAlt: "Các phrasal verb tiếng Anh được nhóm theo email, họp và đơn hàng",
    editorialCover: "/blog/cover/vocabulary",
    socialTitle: "30 phrasal verbs công việc: học theo hành động, không học ABC",
    socialDescription: "Hiểu nghĩa, tân ngữ và tình huống sử dụng để nhận ra cụm trong TOEIC Reading và Listening.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "phrasal verbs TOEIC theo chủ đề công việc",
    searchIntent: "PHRASAL_VERBS_GUIDE_PRACTICE",
    tags: [{ name: "Phrasal verbs", slug: "phrasal-verbs" }, { name: "Tiếng Anh công việc", slug: "tieng-anh-cong-viec" }],
    content: `## Phrasal verb là gì?

Phrasal verb thường gồm một động từ chính và một particle như *up, out, off, over*. Nghĩa của cả cụm có thể khác nghĩa bạn đoán từ từng phần. [Cambridge Dictionary định nghĩa](https://dictionary.cambridge.org/us/dictionary/english/phrasal-verb) đây là cụm gồm động từ với trạng từ, giới từ hoặc cả hai, trong đó nghĩa kết hợp có thể khác nghĩa riêng lẻ.

Trong cách gọi rộng, người học thường gom cả multi-word verbs như **look into**, **run out of** vào phrasal verbs. Điều quan trọng khi làm bài không phải tranh luận nhãn, mà là biết cụm có cần tân ngữ, particle có tách được không và nghĩa nào phù hợp ngữ cảnh.

## 30 phrasal verbs theo tình huống công việc

### Biểu mẫu và email

- **fill out a form:** điền biểu mẫu.
- **send out a notice:** gửi/phát thông báo cho nhiều người.
- **look over a document:** xem nhanh hoặc kiểm tra tài liệu.
- **follow up on a request:** tiếp tục kiểm tra/xử lý yêu cầu.
- **point out an error:** chỉ ra lỗi.
- **write down a number:** ghi lại con số.
- **get back to someone:** phản hồi lại sau.
- **hand in a report:** nộp báo cáo.

Ví dụ: **Please fill out the attached form and send it back by Thursday.** Hai cụm miêu tả hai bước khác nhau: hoàn thành biểu mẫu và gửi lại.

### Họp và kế hoạch

- **set up a meeting:** sắp xếp cuộc họp.
- **put off a meeting:** hoãn cuộc họp.
- **call off an event:** hủy sự kiện.
- **bring up an issue:** nêu vấn đề.
- **go over the agenda:** xem xét kỹ chương trình họp.
- **work out a solution:** tìm ra giải pháp.
- **carry out a plan:** thực hiện kế hoạch.
- **come up with an idea:** nghĩ ra ý tưởng.

*Put off* khác *call off*: một việc bị hoãn dự kiến diễn ra sau; một việc bị hủy thì không còn lịch hiện tại. Ngữ cảnh có ngày mới hay hoàn tiền thường giúp phân biệt.

### Đơn hàng và vận hành

- **run out of stock:** hết hàng tồn.
- **pick up a package:** nhận/lấy kiện hàng.
- **drop off a delivery:** giao/để hàng tại điểm nhận.
- **check in at reception:** làm thủ tục/đăng ký tại quầy.
- **look into a complaint:** điều tra/xem xét khiếu nại.
- **sort out a problem:** giải quyết vấn đề.
- **back up the files:** sao lưu tệp.
- **shut down the system:** tắt hệ thống.

Trong Part 7, **The item is out of stock** có thể được diễn đạt lại thành **We have run out of the item**. Học cụm cùng paraphrase giúp bạn không chờ từ trùng.

### Nhân sự và thay đổi

- **take over a role:** tiếp quản vai trò.
- **step down from a position:** rời chức vụ.
- **turn down an offer:** từ chối đề nghị.
- **take on new staff/work:** nhận thêm nhân sự/công việc.
- **phase out a product:** dần ngừng một sản phẩm.
- **cut back on expenses:** cắt giảm chi phí.

Đừng đoán *take on* chỉ từ nghĩa “take”. Trong email nhân sự, tân ngữ *new staff* hoặc *additional responsibilities* quyết định cách hiểu.

## Cụm tách được và vị trí đại từ

Một số phrasal verbs có tân ngữ có thể đứng giữa động từ và particle:

- **fill out the form** = **fill the form out**;
- **call off the meeting** = **call the meeting off**;
- **turn down the offer** = **turn the offer down**.

Khi tân ngữ là đại từ, thường phải đặt ở giữa: **fill it out**, **call it off**, **turn it down**. Không viết *fill out it*.

Các cụm ba phần như **run out of** hoặc cụm như **look into** không tách theo cách trên: **look into the complaint**, không phải *look the complaint into*. Khi ghi từ mới, luôn ghi một câu có tân ngữ để nhớ cấu trúc.

## Nhận diện phrasal verb trong TOEIC

### Part 5

Nhìn phần đứng sau chỗ trống. Nếu câu có **the form**, *fill out* phù hợp; nếu có **the problem**, *sort out* có thể phù hợp; nếu có **the event due to weather**, *call off* đúng nghĩa hơn *put off* khi không có lịch thay thế. Kiểm tra thì và bị động sau khi chọn cụm.

### Part 6–7

Đọc mục đích của cả email. **We are looking into the issue** báo rằng việc điều tra đang diễn ra, chưa chắc vấn đề đã được giải quyết. **We have sorted out the issue** cho biết đã xử lý xong. Sự khác biệt về trạng thái có thể quyết định câu điền hoặc câu hỏi suy luận.

### Listening

Particle thường ngắn và không được nhấn mạnh như động từ/danh từ. Luyện nghe cả cụm **pick up**, **send out**, **get back to** thay vì chờ từng từ. [Connected speech](/blog/noi-am-tieng-anh-cach-nghe-connected-speech) giải thích vì sao ranh giới cụm có thể khó nghe.

## Cách học không phụ thuộc danh sách dài

Chọn năm cụm cùng một quy trình công việc. Ví dụ với khiếu nại: **bring up an issue → look into it → sort it out → follow up with the customer → write down the outcome**. Viết một đoạn bốn câu dùng chuỗi đó, rồi che particle để tự nhớ lại.

Tạo thẻ hai chiều:

- mặt trước: câu có chỗ trống và tình huống;
- mặt sau: cả cụm, cấu trúc tân ngữ, nghĩa trong câu và một paraphrase một từ.

Ví dụ *put off = postpone*, *carry out = perform*, *look into = investigate*. Paraphrase giúp Part 7, nhưng không có nghĩa hai từ thay thế nhau trong mọi cấu trúc.

## Phân biệt collocation và phrasal verb khi học

Trong **carry out an inspection**, *carry out* là multi-word verb, còn cả cụm với *inspection* cũng tạo một kết hợp thường gặp. Bạn không cần ép mỗi câu vào đúng một hộp. Hãy lưu đơn vị đủ lớn để dùng được: **carry out an inspection of the equipment**.

[Bài collocation TOEIC](/blog/collocation-la-gi-cum-tu-toeic-thong-dung) giúp mở rộng động từ–danh từ, còn [100 từ vựng theo chủ đề](/toeic/tu-vung) cung cấp danh từ nền cho từng tình huống. Sau khi học, dùng [flashcards công sở](/toeic/flashcards-tu-vung-cong-so) hoặc viết lại email bằng cụm mới.

## Kiểm tra sau bảy ngày

Đừng hỏi “tôi đã đọc hết danh sách chưa”. Hãy chọn một email Part 7 mới và đánh dấu phrasal verb bạn nhận ra, nghĩa theo ngữ cảnh, tân ngữ và paraphrase. Sau đó làm mini-practice của bài này không nhìn danh sách.

Nếu sai vì quên particle, ghi cả cụm và câu. Nếu sai vì không hiểu tình huống, học theo quy trình công việc. Nếu nhận đúng nghĩa nhưng đặt sai đại từ, ôn riêng nhóm tách được. Ba lỗi đó cần ba cách sửa khác nhau.`
  }),
  vocabularyPost({
    id: "editorial-confusing-words",
    slug: "tu-de-nham-trong-tieng-anh-toeic-part-5",
    title: "20 cặp từ dễ nhầm trong tiếng Anh và TOEIC Part 5",
    excerpt: "Phân biệt từ gần hình thức hoặc gần nghĩa bằng từ loại, tân ngữ và cụm đi kèm: affect/effect, assure/ensure, rise/raise, personnel/personal.",
    category: "VOCABULARY",
    seoTitle: "20 cặp từ dễ nhầm trong tiếng Anh, TOEIC Part 5",
    seoDescription: "Phân biệt 20 cặp từ dễ nhầm: affect/effect, assure/ensure/insure, rise/raise, access/assess. Có ví dụ công việc và bài tập lời giải.",
    canonicalPath: "/blog/tu-de-nham-trong-tieng-anh-toeic-part-5",
    coverAlt: "Hai cột từ tiếng Anh gần giống nhau được phân biệt bằng câu ví dụ",
    editorialCover: "/blog/cover/vocabulary",
    socialTitle: "Đừng phân biệt từ dễ nhầm chỉ bằng bản dịch tiếng Việt",
    socialDescription: "Nhìn từ loại, tân ngữ và cụm đi cùng để xử lý 20 nhóm từ trong câu công việc.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "từ dễ nhầm trong tiếng Anh TOEIC Part 5",
    searchIntent: "CONFUSING_WORDS_PRACTICE",
    tags: [{ name: "Từ dễ nhầm", slug: "tu-de-nham" }, { name: "TOEIC Part 5", slug: "toeic-part-5" }],
    content: `## Vì sao học hai bản dịch tiếng Việt thường chưa đủ?

Hai từ có thể cùng được dịch gần giống nhau nhưng khác từ loại, cấu trúc hoặc đối tượng đi cùng. **Assure** thường hướng tới người được trấn an; **ensure** hướng tới việc bảo đảm một kết quả; **insure** liên quan bảo hiểm. Nếu chỉ ghi cả ba là “đảm bảo”, bạn chưa có tín hiệu để chọn trong câu.

Khi gặp nhóm dễ nhầm, ghi bốn dữ liệu: từ loại, có cần tân ngữ không, tân ngữ thường là người hay sự việc và một collocation. [Cambridge Grammar có riêng mục các từ dễ nhầm](https://dictionary.cambridge.org/grammar/british-grammar/English), cho thấy đây là vấn đề về cách dùng chứ không chỉ dịch nghĩa.

## Nhóm 1: khác từ loại

### Affect và effect

- **affect (v):** ảnh hưởng — *The delay affected production.*
- **effect (n):** ảnh hưởng/kết quả — *The delay had an effect on production.*

Nhìn vị trí sau chủ ngữ và trước tân ngữ để chọn động từ; nhìn mạo từ *an/the* hoặc cụm *effect on* để chọn danh từ.

### Advice và advise

- **advice (n, không đếm được):** lời khuyên — *Thank you for your advice.*
- **advise (v):** khuyên/thông báo chính thức — *We advise customers to keep the receipt.*

Không viết *an advice* trong nghĩa chung; có thể viết *a piece of advice*.

### Practice và practise/practice

Trong Anh–Mỹ, cách viết động từ có thể khác. **Practice** là danh từ trong cả hai biến thể; tiếng Anh Mỹ cũng dùng *practice* làm động từ, tiếng Anh Anh thường dùng *practise*. Trong câu TOEIC, vị trí ngữ pháp quan trọng hơn việc học một mẹo chữ cái không xét biến thể.

### Compliment và complement

- **compliment:** lời khen hoặc khen.
- **complement:** bổ sung để làm hoàn chỉnh/phù hợp.

*The new chairs complement the redesigned lobby* nói ghế phù hợp với sảnh, không phải ghế “khen” sảnh.

### Personal và personnel

- **personal (adj):** cá nhân, riêng tư.
- **personnel (n):** nhân sự/nhân viên của tổ chức.

So sánh *personal information* với *personnel department*.

## Nhóm 2: khác cấu trúc tân ngữ

### Rise và raise

- **rise (nội động từ):** tự tăng — *Prices rose last month.*
- **raise (ngoại động từ):** nâng/tăng cái gì — *The company raised prices.*

Nếu ngay sau chỗ trống có tân ngữ *prices, funds, concerns*, thường cần *raise*. Nếu chính chủ ngữ tăng, dùng *rise* và chia thì phù hợp.

### Lie và lay

- **lie:** nằm, không nhận tân ngữ — *The documents lie on the desk.*
- **lay:** đặt vật xuống, cần tân ngữ — *Please lay the documents on the desk.*

Dạng quá khứ dễ gây nhầm: *lie → lay → lain*; *lay → laid → laid*. Hãy học trong câu thay vì chỉ học hai dạng nguyên thể.

### Attend và participate

- **attend + sự kiện:** *attend a workshop*.
- **participate in + hoạt động:** *participate in a workshop*.

Không viết *attend in the meeting* hoặc *participate the meeting*.

### Discuss và discuss about

**Discuss** nhận tân ngữ trực tiếp: *discuss the proposal*. Danh từ **discussion** dùng *about/on*: *a discussion about the proposal*. Đây là lỗi thường xuất hiện khi người học dịch từ “thảo luận về”.

### Reach và arrive

- **reach + nơi chốn/mục tiêu:** *reach the station; reach an agreement*.
- **arrive at/in + nơi chốn:** *arrive at the station; arrive in Hanoi*.

Không viết *reach at the office*.

### Borrow và lend

- **borrow something from someone:** mượn vật từ một người — *May I borrow the projector from the training team?*
- **lend something to someone / lend someone something:** cho ai mượn — *The training team lent us a projector.*

Hãy nhìn hướng di chuyển của vật: người nhận *borrows*, người đưa *lends*. Không viết *borrow me the projector* khi ý là “cho tôi mượn máy chiếu”.

## Nhóm 3: nghĩa gần nhưng đối tượng khác

### Assure, ensure và insure

- **assure someone:** trấn an/cam đoan với người.
- **ensure something/that...:** bảo đảm điều xảy ra.
- **insure property/person:** mua hoặc cung cấp bảo hiểm.

Ví dụ: *We assured the client that the new checks would ensure accuracy. The shipment was insured against damage.*

### Access và assess

- **access:** truy cập/tiếp cận.
- **assess:** đánh giá.

Kỹ thuật viên *accesses the system*; kiểm toán viên *assesses the risk*.

### Accept và except

- **accept (v):** chấp nhận/nhận.
- **except (prep/conj):** ngoại trừ.

*We accept cards except American Express* dùng cả hai trong một câu.

### Economic và economical

- **economic:** liên quan kinh tế — *economic growth*.
- **economical:** tiết kiệm, ít tốn kém — *an economical vehicle*.

### Customer và client

Cả hai chỉ người mua/nhận dịch vụ, nhưng **customer** thường dùng cho giao dịch hàng hóa hoặc dịch vụ phổ thông; **client** thường gắn với dịch vụ chuyên môn và mối quan hệ tư vấn. Ngữ cảnh tổ chức quyết định lựa chọn; không áp một quy tắc tuyệt đối cho mọi ngành.

## Nhóm 4: khác sắc thái thời gian hoặc số lượng

### Later và latest

- **later:** muộn hơn/sau đó — *I will reply later today.*
- **latest:** mới nhất hoặc muộn nhất — *the latest report; by Friday at the latest*.

### Fewer và less

**Fewer** thường đi với danh từ đếm được số nhiều: *fewer orders*. **Less** đi với danh từ không đếm được: *less time*. Đọc [so sánh và lượng từ TOEIC](/blog/so-sanh-va-luong-tu-toeic) để xử lý ngoại lệ và cấu trúc đầy đủ.

### Number và amount

**A number of** đi với danh từ đếm được số nhiều; **an amount of** đi với danh từ không đếm được. *The number of applications has increased* có chủ ngữ chính là *number* số ít.

### Each và every

Cả hai thường đi với danh từ số ít, nhưng **each** nhấn từng thành viên riêng; **every** nhìn toàn nhóm. *Each of the applicants* dùng được, còn không viết *every of the applicants*.

## Quy trình làm câu từ dễ nhầm

1. Xác định loại từ mà vị trí trống cần.
2. Kiểm tra động từ có cần tân ngữ hoặc giới từ không.
3. Xác định chủ thể là người, vật hay sự việc.
4. Tìm collocation ngay bên cạnh.
5. Chỉ sau đó mới so nghĩa toàn câu.

Ví dụ tự biên soạn: **The safety review will _____ that every exit is clearly marked.** Sau chỗ trống là mệnh đề *that...*, chủ thể là quá trình review bảo đảm kết quả, nên **ensure** phù hợp. *Assure* thường cần người; *insure* liên quan bảo hiểm; *secure* có nghĩa khác.

## Cách ôn để không nhầm lại

Đừng tạo thẻ “affect = ảnh hưởng; effect = ảnh hưởng”. Ghi hai khung câu đối lập trên cùng một thẻ. Sau một ngày, che đáp án và tự điền; sau ba ngày đổi chủ đề từ production sang sales; sau bảy ngày làm câu mới.

Kết hợp [bài loại từ Part 5](/blog/loai-tu-trong-toeic-part-5), [collocation công sở](/blog/collocation-la-gi-cum-tu-toeic-thong-dung) và [bài Part 5 hỗn hợp](/toeic/part-5/practice). Nếu chỉ đúng khi biết trước bài đang hỏi cặp nào, bạn vẫn cần luyện trộn dạng.`
  }),
  vocabularyPost({
    id: "editorial-work-email",
    slug: "cach-viet-email-tieng-anh-cong-viec-mau",
    title: "Cách viết email tiếng Anh công việc: cấu trúc, 5 mẫu và checklist",
    excerpt: "Viết subject rõ, nêu mục đích sớm, cung cấp đủ bối cảnh và yêu cầu hành động cụ thể; kèm năm mẫu email có chỗ thay thế thay vì câu thuộc lòng.",
    category: "VOCABULARY",
    seoTitle: "Cách viết email tiếng Anh công việc: 5 mẫu dễ dùng",
    seoDescription: "Cấu trúc email tiếng Anh công việc từ subject đến closing, 5 mẫu cho yêu cầu, xác nhận, đổi lịch, follow-up và xin lỗi; kèm checklist và bài tập.",
    canonicalPath: "/blog/cach-viet-email-tieng-anh-cong-viec-mau",
    coverAlt: "Email tiếng Anh công việc được chia thành subject, purpose, action và closing",
    editorialCover: "/blog/cover/vocabulary",
    socialTitle: "Email công việc rõ không cần phải dùng từ quá trang trọng",
    socialDescription: "Một cấu trúc sáu phần và năm mẫu có thể điều chỉnh theo người nhận, mục đích cùng deadline.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "cách viết email tiếng Anh công việc mẫu",
    searchIntent: "WORK_EMAIL_WRITING",
    tags: [{ name: "Email tiếng Anh", slug: "email-tieng-anh" }, { name: "Tiếng Anh công việc", slug: "tieng-anh-cong-viec" }],
    content: `## Một email công việc tốt cần giúp người nhận làm gì tiếp theo?

Trước khi chọn câu chào, hãy viết một dòng tiếng Việt: “Sau email này, tôi muốn người nhận biết/làm điều gì?” Dòng đó quyết định subject, câu mở đầu và lời kêu gọi hành động. Email lịch sự nhưng giấu mục đích đến đoạn cuối vẫn làm người nhận mất thời gian.

[Purdue OWL khuyên](https://owl.purdue.edu/owl/general_writing/academic_writing/email_etiquette.html) dùng subject có ý nghĩa, đoạn ngắn và đi thẳng vào vấn đề. [British Council](https://learnenglish.britishcouncil.org/free-resources/business/english-emails) cũng tổ chức kỹ năng email quanh mở/kết thư, sắp xếp nội dung, yêu cầu, proofreading và etiquette. Cấu trúc dưới đây áp dụng các nguyên tắc đó vào tình huống công việc phổ biến.

## Cấu trúc email sáu phần

### 1. Subject cụ thể

Subject nên cho biết chủ đề và, khi cần, hành động hoặc thời điểm:

- **Action required: Approve Q4 budget by 12 October**
- **Meeting rescheduled to 3:00 p.m. on Friday**
- **Question about invoice 1842**
- **Follow-up: Website proposal sent 5 October**

Tránh subject chỉ ghi *Hello*, *Important* hoặc *Question*. Chúng không giúp người nhận ưu tiên và khó tìm lại.

### 2. Greeting phù hợp quan hệ

**Dear Ms Tran,** phù hợp khi cần trang trọng hoặc chưa quen. **Hello Minh,** hay **Hi Minh,** phù hợp nhiều trao đổi nội bộ. Nếu không biết cách xưng hô, kiểm tra chữ ký hoặc quy ước tổ chức thay vì đoán chức danh và giới tính.

[British Council phân biệt](https://learnenglish.britishcouncil.org/business-english/english-emails/unit-4-starting-finishing-emails) email formal với informal dựa vào mối quan hệ và mục đích. Không có một greeting duy nhất đúng cho mọi công ty.

### 3. Purpose ở một hoặc hai câu đầu

- **I’m writing to confirm...**
- **Could you please send...?**
- **I’m following up on...**
- **I’m sorry to let you know that...**

Không cần mở bằng nhiều câu hỏi thăm trong một yêu cầu gấp. Một câu chào ngắn có thể phù hợp, nhưng mục đích vẫn nên xuất hiện sớm.

### 4. Context vừa đủ

Cung cấp mã đơn, ngày họp, phiên bản tài liệu hoặc quyết định trước đó. Đừng kể lại toàn bộ lịch sử nếu người nhận chỉ cần hai dữ kiện để hành động. Dùng bullet khi có nhiều mục cần trả lời.

### 5. Action và deadline rõ

So sánh **Please review this soon** với **Could you review sections 2 and 3 by 4:00 p.m. Thursday?** Câu sau nói rõ việc, phạm vi và thời điểm. Nếu deadline linh hoạt, hãy nói: **If Thursday is not possible, please suggest another time this week.**

### 6. Closing và signature

**Best regards, Kind regards, Thanks** đều có thể phù hợp tùy quan hệ. Chữ ký nên có tên và thông tin người nhận cần để phản hồi hoặc liên hệ; không cần lặp một khối thông tin dài trong mọi trao đổi nội bộ.

## Mẫu 1: yêu cầu thông tin

**Subject: Request for updated delivery schedule**

**Hello Ms Nguyen,**

**Could you please send the updated delivery schedule for order 4721? We need the expected arrival date to arrange warehouse staff. If possible, please reply by noon on Wednesday.**

**Thank you,**  
**An**

Mẫu này gồm việc cần làm, lý do và deadline. Hãy thay toàn bộ dữ kiện, không chỉ đổi tên người nhận.

## Mẫu 2: xác nhận cuộc họp

**Subject: Confirmation: Product review on 14 October**

**Hi Daniel,**

**This is to confirm our product review at 10:00 a.m. on 14 October in Meeting Room B. We’ll discuss the launch timeline and final packaging. Please let me know if you would like to add an item to the agenda.**

**Best,**  
**Mai**

Subject và câu đầu lặp đúng dữ kiện quan trọng để người nhận xác nhận nhanh.

## Mẫu 3: đề nghị đổi lịch

**Subject: Request to reschedule Thursday’s supplier call**

**Dear Mr Lee,**

**Would it be possible to move our supplier call from Thursday at 2:00 p.m. to Friday morning? Our technical lead will be unavailable at the original time. I am available between 9:00 and 11:30 a.m. on Friday, but I would be happy to consider another time.**

**Kind regards,**  
**Linh**

Email không chỉ nói “I’m busy”; nó đưa lý do vừa đủ và hai phương án để giảm số lượt trao đổi.

## Mẫu 4: follow-up lịch sự

**Subject: Follow-up: Revised contract sent 5 October**

**Hello Mr Pham,**

**I’m following up on the revised contract I sent on 5 October. Could you confirm whether your legal team has had a chance to review section 6? We are hoping to complete the agreement by Friday. Please let me know if you need any additional information.**

**Best regards,**  
**Thu**

Nêu lại ngày và tài liệu giúp người nhận tìm đúng chuỗi email. *Have had a chance to review* giảm độ trực diện nhưng vẫn giữ yêu cầu rõ.

## Mẫu 5: báo chậm và đưa phương án

**Subject: Update: Report delivery moved to Tuesday**

**Dear Project Team,**

**I’m sorry to let you know that the monthly report will not be ready on Monday because two regional figures still need verification. We will send the completed report by 11:00 a.m. on Tuesday. In the meantime, the approved sales summary is available in the shared folder.**

**Thank you for your understanding,**  
**Quang**

Một lời xin lỗi hữu ích đi cùng sự việc, nguyên nhân vừa đủ, thời hạn mới và phương án tạm thời. Tránh hứa thời gian bạn chưa kiểm soát được.

## Cụm từ nên học theo chức năng

### Nêu mục đích

- **I’m writing to request / confirm / clarify...**
- **This email is to inform you that...**
- **I’m contacting you regarding...**

### Yêu cầu

- **Could you please...?**
- **Would it be possible to...?**
- **Please let me know whether...**

### Đính kèm và tham chiếu

- **I’ve attached the revised schedule.**
- **Please see the attached invoice.**
- **As discussed in yesterday’s meeting,...**

### Kết thúc hành động

- **Please reply by...**
- **I look forward to hearing from you.**
- **Let me know if you need any additional information.**

Học cả cụm thay vì thay từng từ bằng từ đồng nghĩa. [Collocation công việc](/blog/collocation-la-gi-cum-tu-toeic-thong-dung) và [phrasal verbs trong email](/blog/phrasal-verbs-toeic-theo-chu-de-cong-viec) giúp mở rộng ngôn ngữ mà vẫn giữ câu tự nhiên.

## Email công việc liên quan TOEIC thế nào?

Part 6–7 thường dùng email để thông báo, yêu cầu, xác nhận, phàn nàn hoặc đổi lịch. Khi hiểu cấu trúc email, bạn dự đoán được thông tin: subject nêu chủ đề, câu đầu nêu mục đích, thân bài cho chi tiết, cuối thư nêu hành động tiếp theo.

Khi đọc, hỏi: ai viết cho ai, vì sao viết, điều gì đã xảy ra và người nhận cần làm gì? Thử [Part 6 điền câu vào đoạn](/toeic/part-6/dien-cau-vao-doan-van) để luyện mạch email, rồi [Part 7 một văn bản](/toeic/part-7/doc-hieu-mot-doan-van) để tìm bằng chứng.

## Checklist trước khi gửi

- Subject có giúp hiểu chủ đề và hành động không?
- Tên, chức danh và greeting có đúng không?
- Mục đích xuất hiện trong hai câu đầu chưa?
- Người nhận có đủ mã, ngày, tệp hoặc bối cảnh để xử lý không?
- Yêu cầu và deadline có cụ thể nhưng lịch sự không?
- Tệp đính kèm thực sự đã được gắn chưa?
- Ngày, giờ, múi giờ và tên tệp có khớp nội dung không?
- Đã bỏ câu dài, từ thừa và lỗi chính tả chưa?
- Closing có phù hợp quan hệ không?

Đừng sao chép nguyên mẫu nếu tình huống khác. Hãy giữ cấu trúc, thay dữ kiện và đọc lại từ góc nhìn người nhận: họ có biết chính xác việc cần làm tiếp theo không? Mini-practice đầu bài kiểm tra chính kỹ năng chọn subject, giọng điệu và câu hành động đó.`
  }),
];
