import type { EditorialPost } from "./editorial";

type Draft = Pick<EditorialPost, "slug" | "title" | "excerpt" | "seoTitle" | "seoDescription" | "targetTopic" | "content">;
const publishedAt = new Date("2026-10-02T06:00:00.000Z");

function post(draft: Draft): EditorialPost {
  return {
    ...draft,
    id: `editorial-grammar-${draft.slug}`,
    status: "PUBLISHED",
    category: "GRAMMAR",
    canonicalPath: `/blog/${draft.slug}`,
    coverMediaId: null,
    coverAlt: `Ví dụ ngữ pháp ${draft.targetTopic} trong ngữ cảnh công việc`,
    editorialCover: "/blog/cover/grammar",
    socialTitle: draft.seoTitle,
    socialDescription: draft.seoDescription,
    authorName: "TOEICGym Editorial",
    searchIntent: "informational",
    noindex: false,
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    createdBy: "editorial",
    updatedBy: "editorial",
    tags: [{ name: "Ngữ pháp TOEIC", slug: "ngu-phap-toeic" }, { name: "TOEIC", slug: "toeic" }],
    contentOrigin: "AI_ASSISTED",
  };
}

export const GRAMMAR_COMPLETE_POSTS: EditorialPost[] = [
  post({
    slug: "cum-danh-tu-va-danh-tu-ghep-toeic",
    title: "Cụm danh từ và danh từ ghép TOEIC: tìm từ chính trước",
    excerpt: "Tách từ hạn định, từ bổ nghĩa và danh từ chính để xử lý các cụm dài trong Part 5, Part 6 và tài liệu Part 7.",
    seoTitle: "Cụm danh từ và danh từ ghép TOEIC: cách nhận biết",
    seoDescription: "Cách đọc cụm danh từ tiếng Anh và danh từ ghép trong TOEIC: tìm danh từ chính, chọn số ít/số nhiều, word form; có ví dụ và bài tập.",
    targetTopic: "cụm danh từ và danh từ ghép TOEIC",
    content: `## Vì sao cụm danh từ dài dễ làm bạn chọn sai?

Trong *the updated employee training schedule*, từ chính là **schedule**. *The* xác định cụm, *updated* và *employee training* bổ nghĩa cho danh từ chính. Nếu chỉ đọc từ trái sang phải và dịch từng từ, bạn dễ nhầm *training* là động từ hoặc chia động từ theo *employee*. Hãy tìm danh từ chính từ cuối cụm, rồi quay lại xác định chức năng của các từ đứng trước.

Một khung thường gặp là **từ hạn định + số lượng + tính từ + danh từ bổ nghĩa + danh từ chính**: *the three new office security systems*. Không phải cụm nào cũng có đủ các phần. Danh từ đứng trước một danh từ khác thường giữ dạng số ít để chỉ loại hoặc mục đích: *a customer service survey*, *two customer service surveys*. Tuy nhiên, có các cụm cố định cần học nguyên cụm thay vì tự suy ra.

## Danh từ chính quyết định số và hòa hợp

Trong *a list of available rooms*, danh từ chính là *list*, nên viết *A list ... is attached*. Cụm *of available rooms* không đổi chủ ngữ thành số nhiều. Ngược lại, *several lists of available rooms are attached* có danh từ chính *lists*. Kết nối cách đọc này với [hòa hợp chủ ngữ – động từ](/blog/hoa-hop-chu-ngu-dong-tu-toeic) sẽ giúp bạn tránh bị danh từ gần động từ đánh lạc hướng.

**The company introduced a new customer _____ program.** (A) retain (B) retained (C) retention (D) retaining

**Đáp án C.** *Customer retention* là cụm danh từ bổ nghĩa cho *program*: chương trình giữ chân khách hàng. A là động từ nguyên mẫu; B và D không tạo cụm tự nhiên trong ngữ cảnh này. Câu ví dụ do TOEIC GYM tự biên soạn.

## Quy trình ba bước

1. Khoanh danh từ chính và xác định số ít hay số nhiều.
2. Xem chỗ trống đang bổ nghĩa cho danh từ chính hay hoàn thành một thành phần khác của câu.
3. Đọc cả cụm trong ngữ cảnh công việc để kiểm tra collocation; đúng loại từ chưa chắc đã tạo cụm tự nhiên.

## Tự kiểm tra

**All conference registration _____ must be submitted by Friday.** (A) form (B) forms (C) forming (D) formed

**Đáp án B.** *Forms* là danh từ chính số nhiều; *conference registration* cho biết loại biểu mẫu. *All* cũng là tín hiệu cần danh từ đếm được số nhiều ở đây. Nếu bạn còn nhầm vị trí danh từ và tính từ, học tiếp [loại từ trong TOEIC Part 5](/blog/loai-tu-trong-toeic-part-5).`,
  }),
  post({
    slug: "noi-dong-tu-ngoai-dong-tu-va-bo-ngu",
    title: "Nội động từ, ngoại động từ và bổ ngữ: câu đang thiếu gì?",
    excerpt: "Kiểm tra động từ có cần tân ngữ, giới từ hay bổ ngữ để tránh chọn một đáp án đúng dạng nhưng sai cấu trúc.",
    seoTitle: "Nội động từ, ngoại động từ và bổ ngữ trong TOEIC",
    seoDescription: "Phân biệt nội động từ, ngoại động từ và động từ nối trong câu TOEIC; nhận biết tân ngữ, giới từ, bổ ngữ với ví dụ và bài tập có đáp án.",
    targetTopic: "nội động từ ngoại động từ và bổ ngữ",
    content: `## Đừng chỉ hỏi “đây là thì gì?”

Hai động từ có nghĩa gần nhau có thể đi với cấu trúc khác nhau. *Discuss* nhận tân ngữ trực tiếp: *discuss the proposal*. *Talk* thường cần giới từ: *talk about the proposal*. *Arrive* không nhận tân ngữ trực tiếp: *arrive at the station*. Vì vậy một đáp án đúng về thì vẫn sai nếu không khớp với thành phần đứng sau.

**Ngoại động từ** cần tân ngữ để hoàn tất nghĩa trong cách dùng đang xét: *The team completed the report*. **Nội động từ** không nhận tân ngữ trực tiếp: *The shipment arrived*. Nhiều động từ có thể đổi nhóm theo nghĩa; hãy học cả mẫu câu, không gắn một nhãn bất biến cho mọi cách dùng.

## Động từ nối cần bổ ngữ, không phải tân ngữ

Sau *be, seem, become, remain* thường là phần mô tả chủ ngữ: *The instructions remain clear*. *Clear* là bổ ngữ tính từ. Trong *The board appointed Ms. Tran chair*, *chair* bổ sung thông tin cho tân ngữ *Ms. Tran*. Nhìn xem câu thiếu đối tượng nhận hành động hay thiếu phần mô tả sẽ giúp chọn đúng danh từ, tính từ hoặc giới từ.

**The committee will _____ the revised budget tomorrow.** (A) discuss (B) discuss about (C) discussion (D) discussed

**Đáp án A.** Sau *will* dùng động từ nguyên mẫu; *discuss* nhận trực tiếp *the revised budget*, không thêm *about*. Câu ví dụ do TOEIC GYM tự biên soạn.

## Bị động cũng phụ thuộc vào tân ngữ

Thông thường, chỉ thành phần làm tân ngữ mới chuyển thành chủ ngữ bị động: *The staff completed the inspection* → *The inspection was completed*. Không tạo bị động trực tiếp từ *The guests arrived*. Khi gặp *be + V3*, hãy kiểm tra động từ có thể nhận tân ngữ trong nghĩa đó hay không; sau đó ôn [câu bị động TOEIC Part 5](/blog/cau-bi-dong-toeic-part-5).

## Tự kiểm tra

**The package _____ at the regional office this morning.** (A) arrived (B) was arrived (C) arrived it (D) was arriving it

**Đáp án A.** *Arrive* là nội động từ trong câu này nên không dùng bị động và không nhận *it* làm tân ngữ. Mốc *this morning* cho phép quá khứ đơn khi người nói xem thời điểm đó đã kết thúc.`,
  }),
  post({
    slug: "tinh-tu-phan-tu-ing-ed-trong-toeic",
    title: "Tính từ đuôi -ing và -ed: interesting hay interested?",
    excerpt: "Phân biệt đặc điểm gây cảm giác với trạng thái người hoặc vật trải nghiệm cảm giác trong các câu TOEIC.",
    seoTitle: "Tính từ đuôi -ing và -ed trong TOEIC: cách phân biệt",
    seoDescription: "Phân biệt tính từ V-ing và V-ed như interesting/interested, confusing/confused; cách chọn theo nghĩa và danh từ được bổ nghĩa, có bài tập TOEIC.",
    targetTopic: "tính từ đuôi ing và ed trong TOEIC",
    content: `## -ing không chỉ “chủ động”, -ed không chỉ “bị động”

Với các cặp chỉ cảm xúc, **-ing** thường mô tả người hoặc vật tạo ra cảm giác: *an interesting presentation*. **-ed** thường mô tả trạng thái của người trải nghiệm: *interested attendees*. Cách hỏi hữu ích là “ai/cái gì gây ra cảm giác?” và “ai cảm thấy như vậy?”, thay vì áp dụng máy móc chủ động–bị động.

Trong TOEIC, danh từ chỉ sự vật cũng có thể đi với -ed khi mang nghĩa trạng thái: *an updated schedule*, *a damaged package*, *the attached file*. Các từ này gần với phân từ bị động. Ngược lại, *increasing costs* là chi phí đang tăng; *increased costs* là mức chi phí đã tăng. Nghĩa và mốc của câu quyết định lựa chọn.

## Vị trí trước danh từ và sau động từ nối

Cả hai dạng có thể đứng trước danh từ hoặc sau *be/seem/become*: *a confusing instruction*, *the instruction is confusing*, *the employees are confused*. Nếu bốn đáp án cùng gốc từ, trước tiên xác định chỗ trống cần tính từ hay động từ; sau đó mới chọn -ing hay -ed theo quan hệ nghĩa.

**Participants were _____ by the sudden room change.** (A) surprise (B) surprising (C) surprised (D) surprisingly

**Đáp án C.** Người tham dự trải nghiệm cảm giác ngạc nhiên; *were surprised by* cũng tạo cấu trúc bị động tự nhiên. B là đặc điểm gây ngạc nhiên, D là trạng từ. Câu ví dụ do TOEIC GYM tự biên soạn.

## Hai bẫy cần tránh

- Không mặc định danh từ chỉ người luôn dùng -ed: *an inspiring manager* là người tạo cảm hứng.
- Không chọn chỉ theo đuôi từ: *experienced staff* nghĩa nhân viên có kinh nghiệm, không phải “nhân viên bị trải nghiệm”.

## Tự kiểm tra

**The new expense form is less _____ than the previous version.** (A) confuse (B) confused (C) confusing (D) confusion

**Đáp án C.** Biểu mẫu là thứ có thể gây bối rối; sau *is less* cần tính từ để so sánh. Học tiếp [từ bổ nghĩa trong TOEIC Part 5](/blog/tu-bo-nghia-toeic-part-5) để phân biệt tính từ với trạng từ.`,
  }),
  post({
    slug: "vi-tri-trang-tu-trong-cau-tieng-anh",
    title: "Vị trí trạng từ trong câu tiếng Anh: đặt ở đâu cho đúng?",
    excerpt: "Chọn vị trí cho trạng từ tần suất, mức độ, cách thức và trạng từ nối thay vì chỉ nhận diện đuôi -ly.",
    seoTitle: "Vị trí trạng từ trong câu tiếng Anh và TOEIC",
    seoDescription: "Hướng dẫn vị trí trạng từ tần suất, mức độ, cách thức và trạng từ nối trong câu tiếng Anh; ví dụ công việc và bài tập TOEIC có đáp án.",
    targetTopic: "vị trí trạng từ trong câu tiếng Anh",
    content: `## Trạng từ bổ nghĩa cho thành phần nào?

Trạng từ có thể bổ nghĩa cho động từ, tính từ, trạng từ khác hoặc cả câu. *The team responded quickly* mô tả cách phản hồi. *The system is highly reliable* bổ nghĩa cho tính từ *reliable*. *Fortunately, the shipment arrived on time* thể hiện đánh giá của người nói về cả mệnh đề. Xác định từ được bổ nghĩa trước khi chọn vị trí.

## Bốn nhóm vị trí thường gặp

- **Tần suất:** thường đứng trước động từ thường (*usually arrives*) nhưng sau *be* (*is usually available*) và sau trợ động từ đầu tiên (*has already arrived*).
- **Mức độ:** thường đứng trước tính từ hoặc trạng từ (*very clear, extremely efficiently*); vẫn cần kiểm tra collocation vì không phải từ chỉ mức độ nào cũng đi tự nhiên với mọi từ.
- **Cách thức:** thường đứng sau động từ hoặc tân ngữ (*completed the form carefully*).
- **Trạng từ nối:** *however, therefore, moreover* kết nối ý và cần dấu câu phù hợp; chúng không hoạt động hoàn toàn giống liên từ *but, so, and*.

**The maintenance team has _____ completed the safety inspection.** (A) successful (B) successfully (C) success (D) succeed

**Đáp án B.** Chỗ trống bổ nghĩa cho cụm động từ *has completed*, nên cần trạng từ *successfully*. Câu ví dụ do TOEIC GYM tự biên soạn.

## Đừng tin tuyệt đối vào đuôi -ly

*Friendly, costly, likely* có thể là tính từ. *Fast, hard, late* có thể là trạng từ không có -ly; *hardly* lại mang nghĩa “hầu như không”, không phải cách nói thông thường của *hard*. Vì vậy hãy kiểm tra chức năng và nghĩa, không chỉ nhìn hình thức.

## Tự kiểm tra

**Ms. Patel is _____ available for calls after 2 p.m.** (A) general (B) generally (C) generalize (D) generality

**Đáp án B.** Trạng từ tần suất *generally* đứng sau *be* và bổ nghĩa cho trạng thái *available*. Nếu câu cần nối hai mệnh đề, xem [liên từ và từ nối TOEIC](/blog/lien-tu-va-tu-noi-toeic).`,
  }),
  post({
    slug: "ngu-phap-toeic-part-1-2-nghe-cau",
    title: "Ngữ pháp TOEIC Part 1–2: nghe hành động và dạng câu hỏi",
    excerpt: "Dùng cấu trúc câu để nhận ra hành động, trạng thái, câu hỏi Wh-, Yes/No và câu đáp gián tiếp khi nghe.",
    seoTitle: "Ngữ pháp TOEIC Part 1 và 2 cần nắm khi nghe",
    seoDescription: "Các điểm ngữ pháp giúp nghe TOEIC Part 1–2: hiện tại tiếp diễn, bị động, giới từ vị trí, câu hỏi Wh-, Yes/No và câu đáp gián tiếp.",
    targetTopic: "ngữ pháp TOEIC Part 1 và Part 2",
    content: `## Part 1–2 kiểm tra nghe hiểu, không phải bài chia động từ

Theo [mô tả bài thi TOEIC Listening & Reading của ETS](https://www.ets.org/toeic/test-takers/about/listening-reading.html), Part 1 là Photographs và Part 2 là Question-Response. Ngữ pháp giúp bạn phân tích tín hiệu nghe được, nhưng đáp án vẫn phụ thuộc vào hình ảnh, ý định và ngữ cảnh; không có một danh sách quy tắc ngữ pháp chính thức bảo đảm giải được mọi câu.

## Part 1: hành động, trạng thái và vị trí

**Be + V-ing** thường mô tả hành động đang diễn ra: *A woman is arranging folders*. **Be + V3** có thể mô tả hành động bị động hoặc trạng thái kết quả: *The folders are arranged on a shelf*. Hãy nghe rõ từ sau *is/are*. Giới từ vị trí như *beside, across from, beneath, along* giúp nối vật thể với không gian trong ảnh.

Đừng suy diễn ý định không nhìn thấy được. Một người cầm điện thoại chưa chắc *is making a reservation*. Mô tả an toàn hơn thường bám vào hành động hoặc vị trí có thể quan sát.

## Part 2: từ đầu câu quyết định loại thông tin cần nghe

- *Who/where/when/why/how* yêu cầu loại thông tin khác nhau.
- Câu Yes/No mở bằng *do, be, have, can, will...* có thể nhận câu đáp trực tiếp hoặc gián tiếp.
- Câu hỏi lựa chọn có *or* cần nghe các phương án, nhưng đáp án vẫn có thể là *Either is fine*.
- Câu hỏi phủ định như *Haven't you sent it?* cần hiểu ý người nói, không chỉ săn *yes/no*.

**Could you send the revised agenda?** — *I'll do it after lunch.* Đây là câu đáp phù hợp về ý định dù không lặp lại *send* hay *agenda*.

## Tự kiểm tra

Bạn nghe: **Where has the conference been moved?** Chọn câu đáp phù hợp nhất: (A) To Room 402. (B) For three hours. (C) By the organizer.

**Đáp án A.** *Where* hỏi địa điểm; *has been moved* là hiện tại hoàn thành bị động. B trả lời thời lượng, C nêu tác nhân. Sau bài này, mở [Part 1 có ảnh và audio](/toeic/part-1) hoặc [Part 2 có audio và lời giải](/toeic/part-2) để áp dụng với tín hiệu nghe thật.`,
  }),
  post({
    slug: "ngu-phap-toeic-part-3-4-theo-doi-hoi-thoai",
    title: "Ngữ pháp TOEIC Part 3–4: theo dõi thời gian, người nói và ý định",
    excerpt: "Dùng thì, đại từ, modal verbs và câu điều kiện như tín hiệu để theo mạch hội thoại và bài nói.",
    seoTitle: "Ngữ pháp TOEIC Part 3 và 4 để nghe đúng mạch",
    seoDescription: "Cách dùng thì, đại từ tham chiếu, modal verbs và câu điều kiện để hiểu TOEIC Part 3–4; có ví dụ hội thoại và bài tự kiểm tra.",
    targetTopic: "ngữ pháp TOEIC Part 3 và Part 4",
    content: `## Ngữ pháp là bản đồ thời gian và quan hệ giữa ý

Part 3–4 yêu cầu theo dõi hội thoại hoặc bài nói trong bối cảnh công việc. Bạn không cần gọi tên mọi cấu trúc khi audio chạy. Hãy dùng ngữ pháp để trả lời nhanh bốn câu: chuyện đã xảy ra, đang xảy ra hay sắp xảy ra; ai chịu trách nhiệm; điều gì chắc chắn hay chỉ là khả năng; từ nào đang thay cho người hoặc vật đã nhắc trước đó.

## Tín hiệu nên nghe theo cụm

- **Thì và mốc thời gian:** *has been delayed* báo thay đổi đã xảy ra và còn liên quan hiện tại; *will be leaving* đặt sự kiện ở tương lai.
- **Modal verbs:** *might* là khả năng; *must* có thể là nghĩa vụ hoặc suy luận tùy ngữ cảnh; *should* thường là lời khuyên/kỳ vọng.
- **Điều kiện:** *If the shipment arrives today, we can install the units tomorrow* nối điều kiện với hành động tiếp theo.
- **Đại từ và từ tham chiếu:** *it, they, this change, the former* chỉ có nghĩa khi nối đúng với thông tin trước đó.

## Ví dụ theo mạch

*The morning flight has been canceled, so we'll take the 2 p.m. train instead. It should arrive before the client meeting.*

*Has been canceled* giải thích lý do đổi kế hoạch. *Will take* là quyết định tương lai. *It* hợp lý nhất là chuyến tàu, và *should arrive* diễn tả kỳ vọng. Nếu câu hỏi hỏi người nói sẽ làm gì, đáp án là đi chuyến tàu 2 giờ; nếu hỏi lý do, đáp án là chuyến bay bị hủy.

## Tự kiểm tra

Bạn nghe: **If the technician finishes by noon, she will test the system this afternoon.** Điều gì sẽ xảy ra khi công việc sửa chữa hoàn tất đúng hạn? (A) Hệ thống sẽ được kiểm tra. (B) Cuộc hẹn sẽ bị hủy. (C) Kỹ thuật viên sẽ đến vào ngày mai.

**Đáp án A.** Mệnh đề *if* đặt điều kiện; *will test* cho kết quả dự kiến. Đại từ *she* quay lại *the technician*. Luyện tiếp với [hội thoại Part 3](/toeic/part-3) và [bài nói Part 4](/toeic/part-4), sau đó nghe lại với transcript để xác định đúng cụm tín hiệu.`,
  }),
  post({
    slug: "ngu-phap-toeic-part-6-7-doc-cau-phuc",
    title: "Ngữ pháp TOEIC Part 6–7: nối ý và đọc câu phức",
    excerpt: "Kết hợp thì, từ nối, từ tham chiếu và ranh giới mệnh đề để điền đoạn văn Part 6 và tìm bằng chứng Part 7.",
    seoTitle: "Ngữ pháp TOEIC Part 6 và 7: cách đọc câu phức",
    seoDescription: "Các điểm ngữ pháp cần dùng ở TOEIC Part 6–7: liên kết thì, từ nối, đại từ tham chiếu, mệnh đề quan hệ và cách tách câu phức.",
    targetTopic: "ngữ pháp TOEIC Part 6 và Part 7",
    content: `## Part 6 cần đúng trong cả câu lẫn đoạn

Ở Part 6, một đáp án có thể đúng cấu trúc trong câu nhưng sai mạch của đoạn. Khi chọn thì, xác định mốc thời gian chung và xem các câu xung quanh đang kể sự kiện đã xảy ra, thông báo hiện tại hay kế hoạch tương lai. Khi chọn *however, therefore, additionally*, gọi tên quan hệ giữa hai ý: đối lập, kết quả hay bổ sung.

Đại từ như *it, they, these* phải có từ được thay thế rõ ràng và phù hợp số. Một câu chèn còn cần nối được cả phía trước lẫn phía sau; từ tham chiếu ở đầu câu thường là manh mối mạnh.

## Part 7 dùng ngữ pháp để tìm đúng bằng chứng

Part 7 là đọc hiểu, không phải bài kiểm tra quy tắc riêng lẻ. Ngữ pháp giúp bạn tách câu dài: tìm động từ chính, đóng các mệnh đề quan hệ trong ngoặc ý nghĩa, rồi nối đại từ với danh từ phù hợp. Ví dụ:

*Customers who submitted a request before May 1 will receive the replacement units, which are scheduled to arrive next week.*

Khung chính là *Customers will receive the replacement units*. *Who submitted...* giới hạn nhóm khách hàng; *which are scheduled...* bổ sung thông tin cho *replacement units*. Bỏ qua ranh giới mệnh đề có thể khiến bạn gắn *next week* với hành động gửi yêu cầu.

## Quy trình đọc câu phức

1. Gạch chân các động từ đã chia.
2. Tìm từ mở mệnh đề: *who, which, that, because, although, if, when*.
3. Xác định khung chính trước khi xử lý chi tiết.
4. Với mỗi đại từ, quay lại danh từ gần nhất phù hợp cả nghĩa lẫn số.

## Tự kiểm tra

**The revised policy, which was approved on Monday, will take effect after all employees have completed the training.** Khi nào chính sách có hiệu lực? (A) Trước buổi đào tạo. (B) Sau khi toàn bộ nhân viên hoàn thành đào tạo. (C) Vào thứ Hai bất kể tiến độ đào tạo.

**Đáp án B.** *Which was approved on Monday* chỉ bổ sung thời điểm phê duyệt. Mệnh đề *after...* xác định thời điểm có hiệu lực. Tiếp tục với [hướng dẫn Part 6](/toeic/part-6) và [cách làm Part 7](/toeic/part-7); nếu câu dài vẫn khó tách, ôn [mệnh đề quan hệ](/blog/menh-de-quan-he-toeic).`,
  }),
];
