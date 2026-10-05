import type { EditorialPost } from "./editorial";

type Draft = Pick<EditorialPost, "slug" | "title" | "excerpt" | "seoTitle" | "seoDescription" | "coverAlt" | "targetTopic" | "content">;

const publishedAt = new Date("2026-09-26T02:00:00.000Z");

function post(draft: Draft): EditorialPost {
  return {
    ...draft,
    id: `editorial-grammar-${draft.slug}`,
    status: "PUBLISHED",
    category: "GRAMMAR",
    canonicalPath: `/blog/${draft.slug}`,
    coverMediaId: null,
    editorialCover: "/blog/cover/grammar",
    socialTitle: draft.seoTitle,
    socialDescription: draft.seoDescription,
    authorName: "TOEIC GYM Editorial",
    searchIntent: "informational",
    noindex: false,
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    createdBy: "editorial",
    updatedBy: "editorial",
    tags: [{ name: "Ngữ pháp TOEIC", slug: "ngu-phap-toeic" }, { name: "Part 5", slug: "part-5" }],
  };
}

export const MORE_GRAMMAR_POSTS: EditorialPost[] = [
  post({
    slug: "cau-bi-dong-toeic-part-5",
    title: "Câu bị động TOEIC Part 5: nhận ra người làm và vật chịu tác động",
    excerpt: "Phân biệt chủ động và bị động theo người thực hiện, thì và trợ động từ. Làm 6 câu Part 5 miễn phí, xem lời giải từng lựa chọn.",
    seoTitle: "Câu bị động TOEIC Part 5: 6 bài tập có đáp án và công thức",
    seoDescription: "Luyện 6 câu bị động TOEIC Part 5 miễn phí: be + V3, modal, tiếp diễn và hoàn thành; có giải thích từng đáp án và cách tránh bẫy chủ động.",
    coverAlt: "Hướng dẫn nhận biết câu bị động trong bài TOEIC Part 5",
    targetTopic: "câu bị động TOEIC Part 5",
    content: `## Câu bị động trong TOEIC Part 5 là gì?

Khi chủ ngữ **nhận** hành động thay vì thực hiện hành động, câu thường dùng bị động. So sánh *The team approved the proposal* (nhóm phê duyệt đề xuất) với *The proposal was approved* (đề xuất được phê duyệt). Trong câu thứ hai, *proposal* không tự phê duyệt. Đây là tín hiệu quan trọng hơn việc chỉ tìm từ *by*.

Part 5 thường đưa ra nhiều dạng của cùng một động từ. Muốn chọn đúng, hãy hỏi lần lượt: **chủ ngữ làm hay chịu hành động, hành động xảy ra khi nào, và câu đã có trợ động từ chưa?** Nếu bạn còn lẫn mốc thời gian, đọc thêm [thì và dạng động từ TOEIC](/blog/thi-va-dang-dong-tu-toeic).

Sáu câu luyện ở đầu bài kiểm tra modal, quá khứ đơn, quá khứ hoàn thành, tiếp diễn, tương lai và một câu chủ động để tránh đoán rằng câu nào trong bài cũng cần bị động. Chọn trước khi mở lời giải; với câu sai, ghi riêng lỗi **thể**, **thì** hoặc **hòa hợp**. Câu hỏi do TOEIC GYM tự biên soạn, không phải đề ETS.

## Công thức cần dùng

- **Hiện tại đơn:** am/is/are + V3. *Invoices are sent every Friday.*
- **Quá khứ đơn:** was/were + V3. *The order was shipped yesterday.*
- **Hiện tại hoàn thành:** has/have been + V3. *The policy has been revised.*
- **Tương lai với will:** will be + V3. *The results will be announced tomorrow.*
- **Sau động từ khuyết thiếu:** modal + be + V3. *The form must be signed.*
- **Hiện tại tiếp diễn:** am/is/are being + V3. *The loading dock is being repaired right now.*
- **Quá khứ hoàn thành:** had been + V3. *The loading dock had been repaired before the inspection began.*

*V3* là quá khứ phân từ. Với động từ đều, dạng này thường có đuôi *-ed*; với động từ bất quy tắc, cần nhớ riêng như *send → sent* và *write → written*. Giữ nguyên thì và đổi thể: *sent* trong *was sent* là quá khứ phân từ, còn *sent* đứng một mình có thể là động từ quá khứ.

## Ví dụ kiểu đề TOEIC

**The revised schedule _____ to all employees tomorrow.** (A) will send (B) will be sent (C) sent (D) has sent

**Đáp án B.** *Schedule* là thứ được gửi, và *tomorrow* đặt hành động ở tương lai. Vì vậy cần *will be sent*. A và D biến lịch trình thành người gửi; C thiếu trợ động từ phù hợp với tương lai. Ví dụ này do TOEIC GYM tự biên soạn.

Đừng chọn bị động chỉ vì câu có *by*: *The report was prepared by the analyst* có *by* chỉ người thực hiện, nhưng nhiều câu bị động không nêu người thực hiện: *The report was prepared yesterday*.

## Being khác been ở đâu?

*The lobby is being painted today* diễn tả việc đang diễn ra; **being** nằm trong cấu trúc tiếp diễn bị động. *The lobby has been painted* cho biết việc sơn đã hoàn tất với kết quả liên quan đến hiện tại; **been** là phân từ của be sau has. Đọc cả chuỗi trợ động từ: không viết *has being painted* hay *is been painted*.

Nếu câu đã cho *will*, chỗ trống có thể chỉ cần *be delivered*, không phải toàn bộ *will be delivered*. Kiểm tra phần có sẵn để tránh lặp trợ động từ. [British Council trình bày cách tạo bị động theo các thì](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/passives); các câu công sở trong bài này được viết riêng cho TOEIC GYM.

## Ba bẫy khiến công thức đúng vẫn sai

- **Thấy by là chọn bị động:** *The courier will arrive by noon* có by chỉ hạn thời gian, không phải người thực hiện. Arrive là động từ nội động trong nghĩa này; không viết *will be arrived*. Học cách phân biệt tân ngữ ở [cấu trúc câu S–V–O](/blog/cau-truc-cau-tieng-anh-co-ban).
- **Chỉ nhìn danh từ chỉ vật:** *The machine prints labels* là chủ động dù machine là vật. Chủ ngữ thực hiện chức năng in; labels là tân ngữ. Cần xét vai trò thực tế, không chỉ người/vật.
- **Chọn đúng be + V3 nhưng bỏ qua thời gian:** *The invoices were sent yesterday* khác *The invoices are sent every Friday*. Thể bị động không quyết định thì; mốc thời gian và ngữ cảnh vẫn quan trọng.

## Mang cách đọc bị động sang Part 6

*The old loading dock is closed. It is being repaired this week. Deliveries will use the side entrance.* **Is being repaired** giải thích vì sao hiện phải đổi cửa giao hàng. Nếu câu trước nói việc sửa đã hoàn tất, cần xét cấu trúc hoàn thành hoặc quá khứ theo cả đoạn; đừng chọn riêng từ *week*.

Thử [bài điền câu vào đoạn Part 6](/toeic/part-6/dien-cau-vao-doan-van) để kiểm tra quan hệ giữa sự kiện và hướng dẫn. Với cụm như *documents sent yesterday* chưa có động từ chính, học thêm [mệnh đề rút gọn V-ing/V3](/blog/menh-de-rut-gon-phan-tu-ving-v3); đừng nhầm cụm bổ nghĩa với một câu bị động đầy đủ.

## Ba bước xử lý khi làm bài

1. Tìm chủ ngữ chính và xác định nó làm hay nhận hành động. Một cụm giới từ chen giữa không đổi chủ ngữ chính.
2. Tìm mốc thời gian hoặc trình tự sự kiện để chọn thì.
3. Kiểm tra đủ trợ động từ và V3; đọc lại nghĩa cả câu.

Trong *The documents _____ before the meeting began*, hành động hoàn tất trước một mốc quá khứ có thể cần *had been prepared* nếu các đáp án yêu cầu phân biệt thứ tự thời gian. Đừng áp dụng một công thức thì cho mọi câu; ngữ cảnh quyết định.

## Tự kiểm tra

**The final report must _____ by the director before publication.** (A) approve (B) be approved (C) approved (D) approving

**Đáp án B.** *Report* nhận hành động phê duyệt và *by the director* nêu người thực hiện; sau *must* cần *be + V3*. Đây là ví dụ do TOEIC GYM tự biên soạn.

**The contracts _____ by both parties last week.** (A) signed (B) were signed (C) are signing (D) have signed

**Đáp án B.** *Contracts* nhận hành động ký; *last week* yêu cầu quá khứ đơn, chủ ngữ số nhiều dùng *were*. Khi đáp án bị động vẫn sai, nguyên nhân thường là sai thì hoặc sai số ít/số nhiều; ôn thêm [hòa hợp chủ ngữ – động từ](/blog/hoa-hop-chu-ngu-dong-tu-toeic).`,
  }),
  post({
    slug: "dai-tu-va-tu-han-dinh-toeic",
    title: "Đại từ và từ hạn định TOEIC: chọn đúng theo vị trí và đối tượng tham chiếu",
    excerpt: "Phân biệt they, them, their, theirs; this, these, each và every trong câu ngắn và câu hỏi tham chiếu Part 7.",
    seoTitle: "Đại từ và từ hạn định TOEIC: cách phân biệt, ví dụ",
    seoDescription: "Phân biệt đại từ chủ ngữ, tân ngữ, sở hữu và từ hạn định trong TOEIC. Có bảng vị trí, ví dụ Part 5, câu tham chiếu Part 7 và bài tự kiểm tra.",
    coverAlt: "Bảng phân biệt đại từ và từ hạn định trong TOEIC",
    targetTopic: "đại từ và từ hạn định TOEIC",
    content: `## Vì sao đại từ dễ gây nhầm trong TOEIC?

Các lựa chọn *they, them, their, theirs* cùng nói về một nhóm người hoặc vật, nhưng mỗi từ đảm nhiệm một vị trí khác nhau. Ở Part 7, câu hỏi “*What does it refer to?*” còn yêu cầu tìm **đối tượng được đại từ thay thế** trong văn bản. Hai dạng câu này dùng chung kỹ năng: nhìn cấu trúc và kiểm tra đối tượng có hợp nghĩa hay không.

## Chọn theo vị trí trong câu

- **Chủ ngữ:** I, you, he, she, it, we, they. *They approved the plan.*
- **Tân ngữ:** me, him, her, it, us, them. *Please contact them.*
- **Từ hạn định sở hữu:** my, your, his, her, its, our, their; đứng trước danh từ: *Their office is open.*
- **Đại từ sở hữu:** mine, yours, his, hers, ours, theirs; đứng độc lập: *The decision is theirs.*

**The manager asked _____ to review the invoice.** (A) they (B) them (C) their (D) theirs

**Đáp án B.** Sau động từ *asked* cần tân ngữ chỉ người được yêu cầu: *them*. *Their* phải đi cùng danh từ, như *their team*. Ví dụ do TOEIC GYM tự biên soạn. Nếu sau chỗ trống là danh từ, hãy kiểm tra thêm [loại từ trong Part 5](/blog/loai-tu-trong-toeic-part-5).

## This, these, each, every: vừa nhìn số lượng vừa nhìn danh từ

*This* đi với danh từ đếm được số ít hoặc danh từ không đếm được (*this report, this information*); *these* đi với danh từ số nhiều (*these reports*). *Each* và *every* thường đứng trước danh từ đếm được số ít: *each employee*, *every application*. Động từ của cụm chủ ngữ này thường ở số ít: *Each employee has a badge*. Xem thêm [hòa hợp chủ ngữ – động từ](/blog/hoa-hop-chu-ngu-dong-tu-toeic) nếu đáp án cần chia động từ.

Đừng suy ra *its* và *it's* giống nhau. *Its* là từ sở hữu: *The company updated its policy*. *It's* viết tắt của *it is* hoặc *it has* và cần một cấu trúc khác theo sau.

## Tìm đại từ tham chiếu trong Part 7

Đọc câu chứa đại từ và câu ngay trước nó. Liệt kê các danh từ có thể được thay thế, rồi loại những danh từ sai **số ít/số nhiều, vai trò hoặc nghĩa**. Chẳng hạn: *The shuttle leaves every hour. It stops at the main entrance.* Ở đây *It* chỉ *the shuttle*, vì xe đưa đón mới là thứ dừng ở lối vào. Không chọn danh từ gần nhất một cách máy móc.

Với *this* hoặc *that*, đối tượng tham chiếu có thể là cả một **sự việc** đã nêu, không chỉ một danh từ. Ví dụ: *The venue changed. This surprised the guests.* “This” chỉ việc địa điểm thay đổi. Khi giải câu tham chiếu, thử thay đáp án vào chỗ đại từ và đọc lại hai câu.

## Tự kiểm tra

**The applicants should submit _____ forms by Friday.** (A) they (B) them (C) their (D) theirs

**Đáp án C.** *Forms* là danh từ ngay sau chỗ trống; cần từ hạn định sở hữu *their*.

**Each of the branches _____ a separate contact number.** (A) have (B) has (C) having (D) are

**Đáp án B.** Chủ ngữ chính là *each* ở số ít; *of the branches* không biến chủ ngữ thành số nhiều.`,
  }),
  post({
    slug: "ving-va-to-infinitive-toeic",
    title: "V-ing và to-infinitive TOEIC: chọn dạng động từ sau từ đứng trước",
    excerpt: "Nhận diện V-ing, to + V và động từ nguyên mẫu bằng từ đứng trước. Luyện 6 câu Part 5 có lời giải, phân biệt to giới từ và to nguyên mẫu.",
    seoTitle: "V-ing và to V TOEIC: 6 bài tập có đáp án, quy tắc và bẫy",
    seoDescription: "Làm 6 câu V-ing và to-infinitive TOEIC miễn phí; giải thích từng lựa chọn, look forward to, avoid, remind và in order to trong ngữ cảnh công việc.",
    coverAlt: "Sơ đồ chọn V-ing hoặc to-infinitive trong câu TOEIC",
    targetTopic: "V-ing và to-infinitive TOEIC",
    content: `## Nhìn từ đứng trước chỗ trống trước khi chia động từ

Nếu đáp án gồm *prepare, preparing, to prepare, prepared*, câu có thể kiểm tra **dạng động từ theo sau một từ hoặc một cấu trúc**. Hãy đọc tối thiểu cụm ngay trước chỗ trống. *To* không phải lúc nào cũng báo hiệu *to + động từ nguyên mẫu*: trong *look forward to meeting you*, *to* là giới từ và sau nó là V-ing.

Sáu câu đầu bài cho bạn thử agree to V, remind + người + to V, before V-ing, look forward to V-ing, avoid V-ing và in order to V. Chọn đáp án trước khi mở lời giải từng câu; ghi lại **cả cụm điều khiển**, không chỉ từ đúng. Đây là bài luyện tự biên soạn, không phải đề ETS.

## Khi nào dùng V-ing?

Sau giới từ, động từ thường ở dạng **V-ing**: *before submitting the form*, *after reviewing the report*, *interested in joining the team*. Cụm *look forward to* và *be committed to* cũng kết thúc bằng giới từ *to*: *We look forward to hearing from you*; *The company is committed to improving service*.

Một số động từ thường đi với V-ing như *avoid, consider, finish, suggest*: *The committee considered extending the deadline*. Đây là các mẫu cần học theo cụm và kiểm tra lại trong câu, không nên chỉ nhớ một danh sách rời.

## Khi nào dùng to + động từ nguyên mẫu?

Sau các động từ như *plan, decide, hope, agree*, thường dùng **to + V**: *They plan to expand the office*. Với mẫu *ask/tell/encourage + người + to + V*: *The supervisor asked employees to attend the meeting*. *In order to* cũng diễn tả mục đích: *The company updated the website in order to improve access*.

Lưu ý sự khác biệt giữa *used to + V* (từng làm) và *be used to + V-ing* (quen với việc làm): *She used to commute by train*; *She is used to commuting by train*. Từ *to* giống nhau nhưng vai trò khác nhau.

## So sánh các cặp dễ nhầm bằng một tình huống

- *We agreed to update the checklist* dùng **agree to V**. *We are committed to updating the checklist* dùng **committed to + V-ing** vì to là giới từ. Cả hai đều có thể nói về việc tương lai; không chọn dạng chỉ bằng mốc thời gian.
- *Remember to attach the invoice before sending the email* nhắc làm việc còn cần làm. *I remember attaching the invoice* nói ký ức về việc đã làm. Dạng động từ thay đổi ý, không phải hai cách viết tùy ý thay nhau.
- *The technician stopped printing labels* là ngừng in. *The technician stopped to replace the paper roll* là dừng một hoạt động để thay cuộn giấy. Hãy đọc mục đích hoặc hoạt động bị dừng trước khi chọn.

[British Council giải thích các mẫu động từ theo sau bởi V-ing và to-infinitive](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/verbs-followed-ing-or-infinitive). Khi một động từ có nhiều mẫu, kiểm tra nghĩa đang dùng; không suy rằng mọi V-ing chỉ hiện tại hoặc mọi to V chỉ tương lai.

## Sau modal và let/make: đừng thêm to theo thói quen

*Staff must wear safety glasses* dùng nguyên mẫu sau must, không phải *must to wear* hay *must wearing*. *The supervisor let the team leave early* theo let + người + nguyên mẫu. Nhưng *The team was made to wait* dùng to-infinitive trong cấu trúc bị động của make. Nếu câu có was/were + V3, xem thêm [câu bị động Part 5](/blog/cau-bi-dong-toeic-part-5) trước khi áp mẫu chủ động.

## Cách chữa một câu sai để không học thuộc đáp án

Ghi ba cột trong sổ: cụm trước chỗ trống, dạng đúng, câu mới do bạn tự viết. Ví dụ *look forward to → V-ing → We look forward to receiving the updated agenda*. Sau vài ngày, che cột dạng đúng và tự hoàn thành câu mới. Khi câu có *has been working*, đó là cấu trúc thì; khi có *interested in working*, working là bổ ngữ sau giới từ. Dùng [hướng dẫn giới từ](/blog/gioi-tu-toeic-trong-cong-viec) và [thì động từ](/blog/thi-va-dang-dong-tu-toeic) để phân biệt.

## Ví dụ kiểu TOEIC Part 5

**The staff looks forward to _____ the new clients next week.** (A) meet (B) meeting (C) met (D) to meet

**Đáp án B.** *Look forward to* kết thúc bằng giới từ; sau giới từ cần *meeting*. *Next week* nói thời gian của cuộc gặp, không quyết định dạng động từ sau giới từ. Ví dụ do TOEIC GYM tự biên soạn.

**The director decided _____ the launch until Monday.** (A) postpone (B) postponing (C) to postpone (D) postponed

**Đáp án C.** *Decide to do something* là cấu trúc phù hợp. *Until Monday* giúp hiểu nghĩa nhưng không thay đổi cấu trúc *decide to + V*.

## Quy trình ba bước

1. Xác định từ điều khiển chỗ trống: giới từ, động từ chính hay cấu trúc mục đích.
2. Chọn V-ing hoặc to + V theo cả cụm; đặc biệt kiểm tra *to* là giới từ hay dấu hiệu nguyên mẫu.
3. Đọc lại chủ ngữ và nghĩa câu để tránh chọn một cấu trúc đúng hình thức nhưng sai ý.

Nếu câu hỏi kiểm tra *was working* hay *has worked* thì đó là **thì động từ**, không phải V-ing làm danh động từ; tham khảo [bài thì và dạng động từ](/blog/thi-va-dang-dong-tu-toeic). Nếu chỗ trống theo sau một giới từ nhưng các lựa chọn là danh từ hoặc V-ing, đọc thêm [giới từ trong email công việc](/blog/gioi-tu-toeic-trong-cong-viec).

## Tự kiểm tra

**Please finish _____ the application before noon.** (A) complete (B) completing (C) to complete (D) completed

**Đáp án B.** *Finish + V-ing* diễn tả hoàn tất việc điền đơn.

**We hope _____ the final design on Thursday.** (A) present (B) presenting (C) to present (D) presented

**Đáp án C.** *Hope to + V*; mốc *on Thursday* không đổi mẫu động từ.`,
  }),
  post({
    slug: "tu-bo-nghia-toeic-part-5",
    title: "Từ bổ nghĩa trong TOEIC Part 5: đặt tính từ và trạng từ đúng chỗ",
    excerpt: "Nhận ra từ đang bổ nghĩa cho danh từ, động từ hay tính từ; xử lý các bẫy modifier thường gặp trong Part 5.",
    seoTitle: "Từ bổ nghĩa TOEIC Part 5: tính từ, trạng từ và vị trí",
    seoDescription: "Cách chọn từ bổ nghĩa TOEIC Part 5 theo từ được mô tả: tính từ, trạng từ, cụm bổ nghĩa. Có ví dụ, lỗi sai phổ biến và bài tự kiểm tra có giải thích.",
    coverAlt: "Ví dụ vị trí từ bổ nghĩa trong câu TOEIC Part 5",
    targetTopic: "từ bổ nghĩa TOEIC Part 5",
    content: `## Từ bổ nghĩa đang mô tả điều gì?

Trong câu *The team prepared a detailed report quickly*, *detailed* bổ nghĩa cho danh từ *report*, còn *quickly* bổ nghĩa cho hành động *prepared*. Đó là câu hỏi cần đặt khi gặp đáp án khác nhau ở đuôi *-al, -ly, -tion*. Chủ điểm này gần với [loại từ TOEIC Part 5](/blog/loai-tu-trong-toeic-part-5), nhưng cần đọc thêm **quan hệ giữa từ bổ nghĩa và từ được bổ nghĩa**, không chỉ nhìn vị trí trống.

## Tính từ, trạng từ và cụm bổ nghĩa

- **Danh từ:** dùng tính từ, như *a clear explanation*.
- **Hành động:** dùng trạng từ, như *explained the policy clearly*.
- **Tính từ khác:** dùng trạng từ chỉ mức độ, như *a highly effective plan*.
- **Cả câu:** có thể dùng trạng từ đầu câu khi hợp nghĩa, như *Fortunately, the shipment arrived.*

Sau *be, seem, become, remain* khi mô tả **chủ ngữ**, thường dùng tính từ: *The instructions are clear*, không phải *are clearly*. Tuy vậy *be* cũng có thể nằm trong thể bị động và theo sau là V3: *The instructions were revised*. Khi phân vân, xác định cấu trúc chính trước.

## Ví dụ kiểu đề TOEIC

**The consultant gave a _____ explanation of the new procedure.** (A) clearly (B) clarity (C) clear (D) clarify

**Đáp án C.** Chỗ trống đứng trước danh từ *explanation*, nên *clear* mô tả lời giải thích. *Clearly* là trạng từ, *clarity* là danh từ, *clarify* là động từ. Đây là ví dụ do TOEIC GYM tự biên soạn.

**The support team responded _____ to the request.** (A) prompt (B) promptly (C) prompting (D) promptness

**Đáp án B.** *Promptly* bổ nghĩa cho hành động *responded*. Đừng suy ra mọi từ tận cùng *-ly* đều là trạng từ: *friendly* là tính từ. Cấu trúc và nghĩa vẫn quan trọng hơn đuôi từ.

## Cẩn thận với vị trí và ý nghĩa

Không phải trạng từ nào cũng đặt cùng một chỗ. *Usually* thường đứng trước động từ chính (*We usually send invoices on Monday*) nhưng sau *be* (*The office is usually open*). *Only* có thể đổi nghĩa theo vị trí: *Only managers approved the plan* khác *Managers approved only the plan*. Trong Part 5, hãy đọc cả câu để xác định điều được nhấn mạnh.

Với phân từ làm tính từ, xem danh từ **gây ra** hay **cảm nhận** trạng thái: *an interesting presentation* (bài thuyết trình gây hứng thú), *interested employees* (nhân viên thấy hứng thú). Đừng chọn *-ing* hoặc *-ed* chỉ dựa vào danh từ là người hay vật; phải đọc nghĩa cụ thể.

## Tự kiểm tra

**The new software is _____ useful for remote teams.** (A) particular (B) particularly (C) particularity (D) particulars

**Đáp án B.** Chỗ trống bổ nghĩa cho tính từ *useful*, nên cần trạng từ *particularly*.

**The revised instructions remain _____ despite the added steps.** (A) clearly (B) clarity (C) clear (D) clarify

**Đáp án C.** *Remain* là động từ nối ở đây; *clear* mô tả *instructions*. Khi hai dạng cùng hợp vị trí, đọc lại cả câu và đối chiếu nghĩa.`,
  }),
];
