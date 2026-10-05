import type { EditorialPost } from "./editorial";

type Draft = Pick<EditorialPost, "slug" | "title" | "excerpt" | "seoTitle" | "seoDescription" | "targetTopic" | "content">;
const publishedAt = new Date("2026-09-26T04:00:00.000Z");

function post(draft: Draft): EditorialPost {
  return {
    ...draft,
    id: `editorial-grammar-${draft.slug}`,
    status: "PUBLISHED",
    category: "GRAMMAR",
    canonicalPath: `/blog/${draft.slug}`,
    coverMediaId: null,
    coverAlt: `Minh họa ngữ pháp ${draft.targetTopic} bằng câu tiếng Anh`,
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
    tags: [{ name: "Ngữ pháp tiếng Anh", slug: "ngu-phap-tieng-anh" }, { name: "TOEIC", slug: "toeic" }],
  };
}

export const GRAMMAR_ADVANCED_POSTS: EditorialPost[] = [
  post({
    slug: "hien-tai-hoan-thanh-va-hoan-thanh-tiep-dien",
    title: "Hiện tại hoàn thành và hoàn thành tiếp diễn: kết quả hay quá trình?",
    excerpt: "Chọn has done hoặc has been doing khi muốn nhấn kết quả đã đạt được hay quá trình kéo dài đến hiện tại.",
    seoTitle: "Hiện tại hoàn thành và hoàn thành tiếp diễn: phân biệt",
    seoDescription: "Phân biệt present perfect simple và present perfect continuous qua kết quả, quá trình, since/for và động từ trạng thái; ví dụ TOEIC có đáp án.",
    targetTopic: "hiện tại hoàn thành và hoàn thành tiếp diễn",
    content: `## Cùng nối quá khứ với hiện tại, nhưng nhấn khác nhau

*We have updated the website* nhấn kết quả: website đã được cập nhật. *We have been updating the website all morning* nhấn quá trình làm việc kéo dài đến hoặc gần hiện tại. Dạng thứ nhất là **has/have + V3**; dạng thứ hai là **has/have been + V-ing**. Cả hai có thể xuất hiện với *since* và *for*, nên không chọn chỉ dựa vào một từ khóa.

Khi nêu số lượng việc hoàn tất, hiện tại hoàn thành thường tự nhiên hơn: *The team has processed 40 orders today*. Khi nói thời lượng hoặc dấu hiệu của việc đang diễn ra, hoàn thành tiếp diễn thường rõ hơn: *The team has been processing orders since 8 a.m.; they need a break*. Sự khác biệt này là về trọng tâm câu, không phải quy tắc cấm dùng dạng kia trong mọi ngữ cảnh.

## Động từ trạng thái và bị động

Các động từ chỉ trạng thái như *know, own, belong* ít dùng ở dạng tiếp diễn khi giữ nghĩa trạng thái: *She has known the client for years*. Nếu chủ ngữ nhận hành động, hiện tại hoàn thành bị động là **has/have been + V3**: *The report has been checked*. Nó trông giống hoàn thành tiếp diễn ở *has been*, nhưng từ sau là V3 thay vì V-ing. Đọc [bài câu bị động](/blog/cau-bi-dong-toeic-part-5) nếu dễ nhầm hai dạng.

**The engineers _____ the network for three hours, and the repair is still in progress.** (A) has been testing (B) have been testing (C) will testing (D) had testing

**Đáp án B.** *Still in progress* nhấn quá trình đang tiếp tục. A dùng *has* với chủ ngữ số nhiều; C phải dùng *will + V*; D thiếu *been* trước V-ing. Ví dụ do TOEIC GYM tự biên soạn.

## Tự kiểm tra

**The team _____ all 40 applications so far.** (A) has reviewed (B) has reviewing (C) reviewed yesterday (D) is reviewed

**Đáp án A.** *All 40 applications* và *so far* nhấn tổng số đã hoàn tất tính đến hiện tại. Nếu muốn nói quá trình chưa xong, câu có thể là *The team has been reviewing applications all morning*. Ôn lại [hiện tại hoàn thành và quá khứ đơn](/blog/hien-tai-hoan-thanh-va-qua-khu-don) để chọn đúng mốc thời gian.`,
  }),
  post({
    slug: "qua-khu-hoan-thanh-va-hoan-thanh-tiep-dien",
    title: "Quá khứ hoàn thành và hoàn thành tiếp diễn: việc nào xảy ra trước?",
    excerpt: "Phân biệt had done với had been doing khi một hành động đã hoàn tất hoặc kéo dài trước một mốc quá khứ.",
    seoTitle: "Quá khứ hoàn thành và hoàn thành tiếp diễn: had done",
    seoDescription: "Cách dùng past perfect simple và past perfect continuous để diễn tả việc xảy ra trước một mốc quá khứ; có ví dụ công việc và bài tập.",
    targetTopic: "quá khứ hoàn thành và hoàn thành tiếp diễn",
    content: `## Điểm nhìn đặt ở một mốc trong quá khứ

Trong *By the time the meeting began, the staff had prepared the room*, việc chuẩn bị **đã hoàn tất** trước lúc họp bắt đầu. *Had prepared* là quá khứ hoàn thành: **had + V3**. Trong *The staff had been preparing the room for two hours when the guests arrived*, việc chuẩn bị là một **quá trình kéo dài** đến trước hoặc tại mốc khách đến: **had been + V-ing**.

Đừng dùng quá khứ hoàn thành cho mọi câu có hai việc quá khứ. *The manager arrived and opened the meeting* đã rõ thứ tự, quá khứ đơn là tự nhiên. Dùng *had + V3* khi cần làm rõ một việc xảy ra **trước điểm nhìn quá khứ**, nhất là khi thứ tự không trùng với thứ tự kể.

## Nhìn kết quả hay độ dài?

*The team had finished the report before noon* nhấn báo cáo đã xong. *The team had been working on the report for three hours before the call* nhấn khoảng thời gian làm việc. Một số động từ trạng thái như *know* thường không dùng hoàn thành tiếp diễn trong nghĩa trạng thái: *They had known each other for years before joining the same company*.

**Before the client arrived, the designer _____ the final version.** (A) had completed (B) has completed (C) completes (D) is completing

**Đáp án A.** Việc hoàn tất đã xảy ra trước một mốc quá khứ; *had completed* thể hiện thứ tự. Ví dụ do TOEIC GYM tự biên soạn. Với trường hợp hai việc chỉ đồng thời trong quá khứ, xem [quá khứ đơn và quá khứ tiếp diễn](/blog/qua-khu-don-va-qua-khu-tiep-dien).

## Tự kiểm tra

**The staff were tired because they _____ the venue all morning before the event began.** (A) had been preparing (B) have prepared (C) will prepare (D) prepare

**Đáp án A.** *Were tired* và *before the event began* đặt điểm nhìn ở quá khứ; *all morning* nhấn quá trình kéo dài trước đó. Nếu câu chỉ nêu kết quả căn phòng đã sẵn sàng, *had prepared* sẽ phù hợp hơn.`,
  }),
  post({
    slug: "used-to-be-used-to-get-used-to",
    title: "Used to, be used to, get used to: từng làm hay đã quen?",
    excerpt: "Phân biệt thói quen quá khứ với trạng thái quen thuộc và quá trình dần thích nghi; chọn đúng V hay V-ing theo sau.",
    seoTitle: "Used to, be used to, get used to: cách phân biệt",
    seoDescription: "Phân biệt used to + V, be used to + V-ing và get used to + V-ing qua nghĩa, cấu trúc, ví dụ công việc và bài tự kiểm tra.",
    targetTopic: "used to be used to get used to",
    content: `## Ba cấu trúc giống chữ nhưng khác nghĩa

**Used to + V** nói về một thói quen hoặc trạng thái trước đây, nay thường không còn: *I used to commute by train*. **Be used to + danh từ/V-ing** nói ai đó đã quen với việc gì: *I am used to commuting by train*. **Get used to + danh từ/V-ing** nói quá trình dần quen: *I am getting used to the new schedule*.

Trong hai cấu trúc sau, *to* là giới từ, nên sau nó dùng **V-ing** nếu theo sau bằng động từ. Trong *used to work*, *to* mở động từ nguyên mẫu. Đây là lý do học từng cụm có nghĩa hữu ích hơn việc nhìn thấy *to* rồi tự động chọn một dạng động từ. Bài [V-ing và to-infinitive](/blog/ving-va-to-infinitive-toeic) phân tích thêm vai trò của *to*.

## Bảng chọn nhanh used to, be used to và get used to

- **Used to + V:** từng làm, nay thường không còn — *We used to print every invoice.*
- **Be used to + danh từ/V-ing:** đã quen với — *We are used to using digital invoices.*
- **Get used to + danh từ/V-ing:** dần quen với — *We are getting used to the new system.*

Muốn phân biệt **be used to** và **get used to**, hãy hỏi trạng thái đã ổn định hay vẫn đang thích nghi. *She is used to the schedule* nghĩa là cô ấy đã quen; *She is getting used to the schedule* nghĩa là quá trình làm quen vẫn diễn ra.

## Phủ định và câu hỏi

Với thói quen quá khứ, có thể nói *I didn't use to work weekends* và *Did you use to work weekends?* Sau *did*, dùng dạng *use* không có *-d*. Với trạng thái đã quen, phủ định bằng *be*: *She isn't used to the new system*. Đừng viết *She doesn't used to the system* nếu muốn nói chưa quen.

**New employees need time to get used to _____ remotely.** (A) work (B) working (C) worked (D) to work

**Đáp án B.** Trong *get used to*, *to* là giới từ, nên dùng *working*. Ví dụ do TOEIC GYM tự biên soạn.

## Tự kiểm tra

**Before joining this company, Mr. Lee _____ for a smaller firm.** (A) used to work (B) is used to working (C) gets used to working (D) used working

**Đáp án A.** Câu kể về một công việc trước đây, nay đã thay đổi. Nếu câu nói *Mr. Lee is used to working under pressure*, nghĩa sẽ là anh ấy đã quen với áp lực. Khi gặp thời điểm quá khứ cụ thể, cũng có thể chỉ cần quá khứ đơn; xem [bài quá khứ đơn](/blog/qua-khu-don-va-qua-khu-tiep-dien).`,
  }),
  post({
    slug: "menh-de-muc-dich-va-ket-qua-so-such-enough",
    title: "Mệnh đề mục đích và kết quả: so that, in order to, so...that",
    excerpt: "Phân biệt để làm gì với kết quả đã xảy ra; chọn đúng so that, in order to, so, such, enough, too.",
    seoTitle: "So that, in order to, so...that, such...that: phân biệt",
    seoDescription: "Cách dùng mệnh đề mục đích và kết quả trong tiếng Anh: so that, in order to, so...that, such...that, too, enough; ví dụ TOEIC có lời giải.",
    targetTopic: "mệnh đề mục đích và kết quả",
    content: `## “Để” và “đến mức” là hai quan hệ khác nhau

*We updated the website so that customers could find information faster* nói về **mục đích** của việc cập nhật. *The website was so slow that customers left* nói về **kết quả** do tốc độ chậm. Cả hai đều có *so* nhưng cấu trúc và nghĩa khác nhau. Trước khi chọn từ nối, hỏi mệnh đề sau đang giải thích **ý định** hay **hệ quả**.

## Mục đích: to, in order to, so that

*To + V* và *in order to + V* mở cụm mục đích: *We hired another assistant to reduce waiting time*. Chủ ngữ ngầm của hành động mục đích thường là chủ ngữ câu chính. Nếu cần nêu một chủ thể khác hoặc khả năng, dùng *so that + chủ ngữ + động từ*: *We moved the sign so that visitors could see it*. Không viết *so that to see it*.

## Kết quả: so...that, such...that, too, enough

*So + tính từ/trạng từ + that*: *The room was so large that everyone fit*. *Such + (a/an) + tính từ + danh từ + that*: *It was such a large room that everyone fit*. *Too + tính từ + to + V* nói mức độ vượt quá để làm việc gì: *The file was too large to email*. *Tính từ + enough + to + V* nói mức độ đủ: *The file was small enough to email*. Vị trí của *enough* khác khi đi với danh từ: *enough time*.

**The team installed a second printer _____ employees could print without waiting.** (A) so that (B) such (C) despite (D) because of

**Đáp án A.** Phần sau có chủ ngữ *employees* và động từ *could print*, diễn tả mục đích. Câu do TOEIC GYM tự biên soạn. Nếu cần phân biệt quan hệ nguyên nhân và nhượng bộ, xem [liên từ TOEIC](/blog/lien-tu-va-tu-noi-toeic).

## Tự kiểm tra

**The report was _____ detailed that the director requested a shorter summary.** (A) such (B) so (C) enough (D) too

**Đáp án B.** *So + tính từ + that* tạo quan hệ mức độ–kết quả. *Such* cần cụm danh từ như *such a detailed report that...*.`,
  }),
  post({
    slug: "cau-gia-dinh-recommend-that-be",
    title: "Câu giả định sau recommend, suggest, essential: vì sao dùng be?",
    excerpt: "Nhận ra mandative subjunctive trong văn phong trang trọng: recommend that he be, suggest that she attend.",
    seoTitle: "Câu giả định recommend that, suggest that, essential that",
    seoDescription: "Giải thích câu giả định tiếng Anh sau recommend, suggest, require, essential: động từ nguyên mẫu, should và các lỗi chia động từ thường gặp.",
    targetTopic: "câu giả định recommend that be",
    content: `## Một đề nghị có thể dùng động từ nguyên mẫu trong mệnh đề that

*The manager recommended that the report be revised* là một cấu trúc trang trọng: sau *recommended that*, động từ ở dạng nguyên mẫu **be** dù chủ ngữ *the report* số ít. Tương tự: *The committee suggested that she attend the meeting*. Cách dùng này thường được gọi là **mandative subjunctive**. Nó hay gặp trong văn bản đưa ra yêu cầu, khuyến nghị hoặc điều cần thiết.

Trong tiếng Anh Anh, cũng có thể thấy *should + V*: *The manager recommended that the report should be revised*. Ở một số ngữ cảnh, cách chia động từ thông thường có thể xuất hiện, nên cần chú ý văn phong và các phương án đề cho. Với bài Part 5, nếu bốn đáp án là *be, is, was, being* sau *recommended that*, *be* thường là tín hiệu của mẫu trang trọng này.

## Những từ thường kích hoạt cấu trúc

- Động từ: *recommend, suggest, request, require, insist* khi chúng mang nghĩa **đề nghị hoặc yêu cầu**.
- Tính từ: *essential, important, necessary* trong mẫu *It is essential that ...*.
- Danh từ: *recommendation, requirement* trong mẫu *The recommendation is that ...*.

Đừng áp dụng sau mọi *suggest*. *The results suggest that the plan is working* nghĩa “kết quả cho thấy”; ở đây *suggest* mô tả bằng chứng, không đưa ra đề nghị. Nghĩa của động từ quyết định cấu trúc.

**The director requested that each employee _____ the form by Friday.** (A) submits (B) submit (C) submitted (D) submitting

**Đáp án B.** *Requested that* đưa ra yêu cầu; trong mẫu trang trọng, *submit* là dạng nguyên mẫu. *Each employee* số ít không đổi dạng này thành *submits*. Ví dụ do TOEIC GYM tự biên soạn.

## Tự kiểm tra

**It is essential that the equipment _____ checked before use.** (A) being (B) be (C) been (D) to be

**Đáp án B.** *Essential that* dẫn vào yêu cầu; bị động dùng *be + V3*: *be checked*. Nếu bạn chưa quen phân biệt yêu cầu với sự thật, xem [cấu trúc câu cơ bản](/blog/cau-truc-cau-tieng-anh-co-ban) và [câu bị động](/blog/cau-bi-dong-toeic-part-5).`,
  }),
];
