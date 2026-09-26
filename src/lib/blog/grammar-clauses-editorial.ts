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
    coverAlt: `Minh họa cấu trúc ${draft.targetTopic} qua ví dụ tiếng Anh`,
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
    tags: [{ name: "Ngữ pháp tiếng Anh", slug: "ngu-phap-tieng-anh" }, { name: "TOEIC", slug: "toeic" }],
  };
}

export const GRAMMAR_CLAUSE_POSTS: EditorialPost[] = [
  post({
    slug: "cau-dieu-kien-tieng-anh-if-wish",
    title: "Câu điều kiện tiếng Anh: if loại 0–3 và wish trong ngữ cảnh",
    excerpt: "Phân biệt sự thật, khả năng thực tế và tình huống giả định; tránh nhầm will, would, had trong mệnh đề if.",
    seoTitle: "Câu điều kiện tiếng Anh loại 0, 1, 2, 3 và wish",
    seoDescription: "Học câu điều kiện loại 0–3, câu giả định với wish và các lỗi thường gặp trong tiếng Anh; có ví dụ công việc và bài tập giải thích.",
    targetTopic: "câu điều kiện tiếng Anh",
    content: `## If nói về điều có thật hay điều giả định?

Câu điều kiện gồm **mệnh đề điều kiện** và **mệnh đề kết quả**. *If the system fails, call support* đưa ra một điều kiện thực tế. *If we had more time, we would review every file* nói về tình huống giả định hiện tại. Trước khi chọn động từ, hãy hỏi người viết xem điều kiện ấy **luôn đúng, có thể xảy ra, khó đúng ở hiện tại, hay đã trái với quá khứ**.

## Bốn mẫu cơ bản

- **Loại 0:** *If + hiện tại đơn, hiện tại đơn* cho quy luật hoặc quy trình: *If a payment fails, the system sends an alert*.
- **Loại 1:** *If + hiện tại đơn, will + V* cho khả năng tương lai: *If the client agrees, we will sign tomorrow*.
- **Loại 2:** *If + quá khứ đơn, would + V* cho giả định hiện tại hoặc tương lai: *If we had a larger room, we would invite everyone*.
- **Loại 3:** *If + had + V3, would have + V3* cho giả định trái với quá khứ: *If we had checked earlier, we would have found the error*.

Trong mẫu loại 1 thông thường, không viết *if the client will agree* khi *if* chỉ điều kiện. Nhưng *if* cũng có thể nghĩa “liệu có” trong mệnh đề danh từ: *I don't know if the client will agree*. Hai *if* làm hai nhiệm vụ khác nhau; xem [mệnh đề danh từ](/blog/menh-de-danh-tu-va-cau-hoi-gian-tiep).

## Wish diễn tả điều trái với thực tế

*I wish I had more time* nói về hiện tại chưa có đủ thời gian. *I wish I had checked the file* tiếc một hành động đã không làm trong quá khứ. *Wish + would* thường diễn tả mong người khác hoặc tình huống thay đổi: *I wish the supplier would respond sooner*. Không dùng *would* máy móc sau mọi *wish*.

**If the documents arrive today, we _____ them tomorrow.** (A) reviews (B) will review (C) would have reviewed (D) had reviewed

**Đáp án B.** *Arrive today* đặt điều kiện có thể xảy ra, còn *tomorrow* chỉ kết quả tương lai. A không hòa hợp với *we*; C là kết quả giả định quá khứ; D là quá khứ hoàn thành. Ví dụ do TOEICGym tự biên soạn.

## Tự kiểm tra

**If the team had received the notice, they _____ the venue.** (A) change (B) will change (C) would have changed (D) are changing

**Đáp án C.** *Had received* đặt điều kiện giả định vào quá khứ; kết quả giả định là *would have changed*. Đừng chỉ săn chữ *if*: tìm thời điểm của cả hai mệnh đề. [Cambridge Grammar](https://dictionary.cambridge.org/grammar/british-grammar/conditional-sentences) có thêm ví dụ về điều kiện có thể xảy ra và điều kiện giả định.`,
  }),
  post({
    slug: "cau-hoi-va-cau-phu-dinh-tieng-anh",
    title: "Câu hỏi và câu phủ định tiếng Anh: do, does, did và trợ động từ",
    excerpt: "Đặt câu hỏi trực tiếp, câu hỏi Yes/No và phủ định đúng thì mà không chia động từ hai lần.",
    seoTitle: "Câu hỏi và phủ định tiếng Anh: do, does, did",
    seoDescription: "Hướng dẫn đặt câu hỏi và câu phủ định với do, does, did, be, have và modal verbs; có ví dụ email công việc và bài tự kiểm tra.",
    targetTopic: "câu hỏi và câu phủ định tiếng Anh",
    content: `## Tìm trợ động từ trước khi đảo trật tự

Trong hiện tại đơn, câu khẳng định *The office opens at nine* chuyển thành *Does the office open at nine?* và *The office does not open at nine*. Khi đã dùng *does*, động từ chính trở về dạng nguyên mẫu *open*. Quá khứ đơn tương tự: *They sent the invoice* → *Did they send the invoice?*; không viết *Did they sent*.

Với *be*, đảo *be* lên trước chủ ngữ: *The meeting is online* → *Is the meeting online?*; phủ định *The meeting is not online*. Với hiện tại hoàn thành, dùng *have/has*: *Has the client received the email?* Với modal verbs, đảo chính modal: *Can the team finish today?*; xem [động từ khuyết thiếu](/blog/dong-tu-khuyet-thieu-can-must-should-may).

## Wh-questions và câu hỏi về chủ ngữ

Một câu hỏi về **tân ngữ** thường cần đảo trợ động từ: *Who did the manager call?* (người quản lý gọi ai?). Nhưng câu hỏi về **chủ ngữ** thường giữ trật tự khẳng định: *Who called the manager?* (ai gọi người quản lý?). Đây là lý do hai câu cùng có *who* mà cấu trúc khác.

Trong giao tiếp công việc, *Could you tell me when the meeting starts?* là câu hỏi gián tiếp lịch sự. Phần sau *when* giữ trật tự chủ ngữ–động từ, không viết *when does the meeting start* sau *Could you tell me*. Xem [mệnh đề danh từ và câu hỏi gián tiếp](/blog/menh-de-danh-tu-va-cau-hoi-gian-tiep).

## Tránh phủ định hai lần ngoài ý định

*We do not have any vacancies* là câu phủ định thông thường. *We have no vacancies* cũng đúng. Khi kết hợp *not* với *no* trong cùng mệnh đề, ý nghĩa có thể chuyển thành một dạng khẳng định hoặc trở nên không tự nhiên trong văn phong chuẩn. Hãy đọc nghĩa trước khi thay *any* bằng *no*.

**_____ the supplier send the revised contract yesterday?** (A) Do (B) Does (C) Did (D) Has

**Đáp án C.** *Yesterday* đặt câu ở quá khứ đơn; sau *did* dùng động từ nguyên mẫu *send*. Câu do TOEICGym tự biên soạn.

## Tự kiểm tra

**The printer _____ working at the moment.** (A) do not (B) does not (C) is not (D) did not

**Đáp án C.** Cấu trúc tiếp diễn cần *is + V-ing*, nên phủ định là *is not working*. Nếu chọn *does not*, động từ chính phải là nguyên mẫu *work*.`,
  }),
  post({
    slug: "cau-tuong-thuat-tieng-anh-said-told-asked",
    title: "Câu tường thuật tiếng Anh: said, told, asked và đổi mốc thời gian",
    excerpt: "Chuyển lời nói trực tiếp sang gián tiếp, phân biệt said/told/asked và hiểu khi nào thì có thể lùi thì.",
    seoTitle: "Câu tường thuật tiếng Anh: said, told, asked",
    seoDescription: "Học câu tường thuật với said, told, asked, câu hỏi gián tiếp, lùi thì và đổi đại từ hoặc mốc thời gian qua ví dụ công việc rõ nghĩa.",
    targetTopic: "câu tường thuật tiếng Anh",
    content: `## Tường thuật là kể lại lời người khác theo góc nhìn mới

Lời trực tiếp: *The manager said, “I will call you tomorrow.”* Nếu kể lại ngày hôm sau, ta có thể nói: *The manager said that she would call me the next day*. Đại từ và mốc thời gian đổi theo người kể, thời điểm kể. Không nên đổi máy móc *tomorrow* thành *the next day* nếu người kể vẫn đang nói trong cùng ngày.

**Say** thường không cần nêu người nghe trực tiếp: *She said that the report was ready*. **Tell** thường cần người nghe: *She told us that the report was ready*. **Ask** dùng cho câu hỏi hoặc yêu cầu: *She asked whether the report was ready*; *She asked us to send it*.

## Lùi thì khi phù hợp với thời điểm kể

Khi động từ tường thuật ở quá khứ, hiện tại đơn thường lùi thành quá khứ đơn (*is → was*), *will → would*, *can → could*. Ví dụ: *“The office is closed.”* → *He said the office was closed*. Tuy nhiên, nếu thông tin vẫn đúng và người nói muốn nhấn mạnh hiện tại, việc giữ hiện tại có thể hợp: *The guide said the office is open on Sundays*. Hãy kiểm tra mốc thời gian và ý định thay vì học thuộc một bảng chuyển thì bất biến.

Câu hỏi tường thuật giữ **trật tự câu kể**: *“Where is the meeting?”* → *She asked where the meeting was*. Với câu hỏi Yes/No, dùng *if/whether*: *“Is the meeting online?”* → *She asked whether the meeting was online*. Không giữ dạng *where was the meeting* sau *asked*. Đọc thêm [câu hỏi gián tiếp](/blog/menh-de-danh-tu-va-cau-hoi-gian-tiep).

## Ví dụ kiểu TOEIC

**The supervisor told the staff that the meeting _____ at nine the next morning.** (A) would starting (B) would start (C) starting (D) start

**Đáp án B.** *Would start* kể lại lịch tương lai từ điểm nhìn quá khứ. A sai dạng sau modal; C thiếu động từ chia thì; D không hòa hợp với *the meeting*. Trong ngữ cảnh khác, người kể có thể giữ hiện tại nếu lịch còn hiệu lực; câu luyện này không đặt hai cách hiểu đó thành hai lựa chọn cạnh tranh.

## Tự kiểm tra

**“Please submit the form today,” she said to us.** Câu nào tường thuật đúng? (A) She told us submit the form that day. (B) She told us to submit the form that day. (C) She told to us submit the form that day.

**Đáp án B.** Lời yêu cầu dùng *tell + người + to + V*. A thiếu *to*; C đặt *to* sai vị trí. Với *to + V* sau động từ khác, xem [V-ing và to-infinitive](/blog/ving-va-to-infinitive-toeic). [Cambridge Grammar](https://dictionary.cambridge.org/grammar/british-grammar/reported-speech-indirect-speech) giải thích thêm cách tường thuật câu kể, câu hỏi và mệnh lệnh.`,
  }),
  post({
    slug: "menh-de-danh-tu-va-cau-hoi-gian-tiep",
    title: "Mệnh đề danh từ và câu hỏi gián tiếp: what, whether, if",
    excerpt: "Đọc và viết các mệnh đề làm tân ngữ hoặc chủ ngữ; giữ trật tự câu kể sau what, where, whether, if.",
    seoTitle: "Mệnh đề danh từ và câu hỏi gián tiếp tiếng Anh",
    seoDescription: "Giải thích mệnh đề danh từ với that, what, whether, if và câu hỏi gián tiếp; có ví dụ TOEIC, lỗi đảo trợ động từ và bài tập.",
    targetTopic: "mệnh đề danh từ và câu hỏi gián tiếp",
    content: `## Một mệnh đề có thể làm nhiệm vụ của danh từ

Trong *We know that the shipment is late*, toàn bộ *that the shipment is late* là điều mà ta biết. Nó làm tân ngữ của *know*. Trong *What the client needs is a revised invoice*, mệnh đề *what the client needs* làm chủ ngữ. Những mệnh đề này có động từ riêng nhưng vẫn nằm trong một câu lớn hơn; nếu chưa quen phân tích, bắt đầu từ [cấu trúc câu tiếng Anh](/blog/cau-truc-cau-tieng-anh-co-ban).

## That, what, whether và if

- **That** giới thiệu một thông tin: *The team confirmed that the file was complete*. Trong nhiều câu, *that* có thể lược bỏ sau động từ.
- **What** mang nghĩa “điều mà”: *Please explain what the client requested*.
- **Whether/if** mang nghĩa “liệu có”: *We do not know whether the supplier will agree*. Với *whether or not* hoặc sau giới từ, *whether* thường là lựa chọn an toàn hơn.

Trong *If the supplier agrees, we will proceed*, *if* mở mệnh đề điều kiện. Trong *I don't know if the supplier will agree*, *if* mở câu hỏi gián tiếp. Cùng một từ nhưng quy tắc thời gian không giống nhau; xem [câu điều kiện](/blog/cau-dieu-kien-tieng-anh-if-wish).

## Câu hỏi gián tiếp giữ trật tự câu kể

Câu hỏi trực tiếp: *Where does the meeting take place?* Câu gián tiếp: *Could you tell me where the meeting takes place?* Sau *where*, chủ ngữ *the meeting* đứng trước động từ; không dùng *where does the meeting take place* trong mệnh đề phụ. Tương tự: *Do you know when the store opens?* chứ không phải *when does the store open?*

**Please confirm _____ the delivery will arrive before noon.** (A) whether (B) what (C) because (D) despite

**Đáp án A.** Người viết cần xác nhận **liệu** hàng có đến trước trưa hay không. Câu sau chỗ trống có chủ ngữ và động từ, tạo mệnh đề danh từ. Ví dụ do TOEICGym tự biên soạn.

## Tự kiểm tra

**Could you tell me where _____?** (A) is the reception desk (B) the reception desk is (C) does the reception desk be (D) be the reception desk

**Đáp án B.** Trong câu hỏi gián tiếp, trật tự là *where + chủ ngữ + động từ*. Nếu muốn hỏi trực tiếp, ta nói *Where is the reception desk?*`,
  }),
  post({
    slug: "menh-de-thoi-gian-when-while-before-after",
    title: "Mệnh đề thời gian: when, while, before, after, until, as soon as",
    excerpt: "Đọc thứ tự sự kiện và chọn thì phù hợp khi hai mệnh đề nối bằng từ chỉ thời gian.",
    seoTitle: "Mệnh đề thời gian tiếng Anh: when, while, until",
    seoDescription: "Cách dùng when, while, before, after, until, as soon as trong mệnh đề thời gian; phân biệt thứ tự sự kiện và thì qua ví dụ TOEIC.",
    targetTopic: "mệnh đề thời gian tiếng Anh",
    content: `## Từ nối chỉ thời gian cho biết quan hệ giữa hai việc

*When* chỉ lúc một việc xảy ra; *while* thường nhấn hai việc diễn ra đồng thời; *before/after* cho biết thứ tự; *until* chỉ điểm kết thúc; *as soon as* nghĩa là ngay khi. Chọn từ nối bằng quan hệ ý, rồi mới kiểm tra thì của từng mệnh đề. Nếu câu cần biểu đạt nguyên nhân hoặc đối lập, xem [liên từ và từ nối TOEIC](/blog/lien-tu-va-tu-noi-toeic).

**We will send the receipt when the payment arrives.** Việc gửi biên nhận theo sau việc nhận tiền. Trong mệnh đề thời gian nói về tương lai, tiếng Anh thường dùng **hiện tại đơn** sau *when, before, after, until, as soon as*: *We will call you as soon as the package arrives*. Không viết *as soon as the package will arrive* trong mẫu thông thường.

## While và when với quá khứ

*The technician was checking the printer when the alarm sounded* nhấn hành động đang diễn ra và sự kiện chen vào. *While the technician was checking the printer, the assistant was preparing the room* nhấn hai quá trình song song. Từ nối chỉ là một tín hiệu; ý nghĩa toàn câu vẫn quyết định. Đọc thêm [quá khứ đơn và quá khứ tiếp diễn](/blog/qua-khu-don-va-qua-khu-tiep-dien).

**By the time** cho biết một việc đã xảy ra trước một mốc: *By the time the guests arrived, the staff had prepared the room*. Quá khứ hoàn thành ở đây làm rõ việc chuẩn bị xong trước lúc khách đến. Nhưng nếu trình tự đã rõ và không cần nhấn trước–sau, quá khứ đơn có thể đủ ở ngữ cảnh khác.

## Until không đồng nghĩa với by

*Wait until five* nghĩa là chờ liên tục tới 5 giờ. *Submit the form by five* nghĩa là nộp không muộn hơn 5 giờ. Nếu thay *by* bằng *until* trong chỉ dẫn nộp hồ sơ, ý nghĩa sẽ sai. Bài [giới từ trong công việc](/blog/gioi-tu-toeic-trong-cong-viec) giải thích thêm các mốc hạn chót.

## Tự kiểm tra

**We will start the presentation as soon as the director _____.** (A) arrives (B) will arrive (C) arrived (D) arriving

**Đáp án A.** Mệnh đề chính dùng *will start*; mệnh đề thời gian sau *as soon as* dùng hiện tại đơn để nói sự kiện tương lai. Câu do TOEICGym tự biên soạn.`,
  }),
  post({
    slug: "menh-de-rut-gon-phan-tu-ving-v3",
    title: "Mệnh đề rút gọn và phân từ: khi nào dùng V-ing, V3?",
    excerpt: "Rút gọn mệnh đề quan hệ khi danh từ thực hiện hoặc nhận hành động; tránh câu sai chủ ngữ khi mở đầu bằng V-ing.",
    seoTitle: "Mệnh đề rút gọn tiếng Anh: V-ing, V3 và ví dụ",
    seoDescription: "Phân biệt mệnh đề rút gọn chủ động V-ing và bị động V3 trong tiếng Anh, lỗi dangling modifier và ví dụ TOEIC có giải thích.",
    targetTopic: "mệnh đề rút gọn V-ing V3",
    content: `## Rút gọn để câu ngắn hơn mà vẫn rõ người làm

*Employees who work remotely* có thể thành *employees working remotely*: *employees* thực hiện hành động *work*. *Documents that were signed yesterday* có thể thành *documents signed yesterday*: *documents* nhận hành động ký. Hai dạng **V-ing chủ động** và **V3 bị động** không thể thay thế nhau chỉ vì đều đứng sau danh từ.

Khi chưa chắc danh từ làm hay chịu hành động, quay về câu đầy đủ có *who/which/that*. Bài [mệnh đề quan hệ TOEIC](/blog/menh-de-quan-he-toeic) giúp xác định danh từ được mô tả; bài [câu bị động](/blog/cau-bi-dong-toeic-part-5) giúp xác định hướng hành động.

## Rút gọn mệnh đề trạng ngữ cần cùng chủ ngữ

*After reviewing the report, the manager approved it* có nghĩa người quản lý vừa xem báo cáo vừa phê duyệt. Nếu viết *After reviewing the report, the proposal was approved*, cụm đầu ngầm gán việc “xem báo cáo” cho *proposal*, tạo câu lủng củng. Hãy dùng chủ ngữ rõ: *After reviewing the report, the manager approved the proposal*.

Trong văn bản công việc, câu *Attached to this email is the revised schedule* là cấu trúc đảo với phân từ *attached* mô tả *schedule*. Tránh hiểu *attached* như động từ chính ở thì quá khứ; động từ hữu hạn là *is*.

## Ví dụ kiểu TOEIC

**The files _____ in the shared folder are ready for review.** (A) storing (B) stored (C) store (D) stores

**Đáp án B.** *Files* được lưu trong thư mục; *stored in the shared folder* rút gọn từ *that are stored in the shared folder*. Động từ chính của câu là *are*. Ví dụ do TOEICGym tự biên soạn.

## Tự kiểm tra

**The employees _____ on the new project will meet tomorrow.** (A) working (B) worked (C) work (D) works

**Đáp án A.** Nhân viên là người **làm** dự án; *working on the new project* mô tả *employees*. *Will meet* đã là động từ chính, nên không thêm một động từ hữu hạn thứ hai. Nếu còn nhầm chức năng chỗ trống, ôn [cấu trúc câu tiếng Anh](/blog/cau-truc-cau-tieng-anh-co-ban).`,
  }),
  post({
    slug: "cau-truc-song-song-parallel-structure",
    title: "Cấu trúc song song tiếng Anh: and, or, both...and, not only...but also",
    excerpt: "Giữ cùng dạng ngữ pháp ở hai vế nối để câu rõ nghĩa và chọn đúng đáp án Part 5–6.",
    seoTitle: "Cấu trúc song song tiếng Anh: and, or, not only",
    seoDescription: "Học parallel structure với and, or, both...and, either...or, not only...but also; có ví dụ công việc và bài tự kiểm tra.",
    targetTopic: "cấu trúc song song tiếng Anh",
    content: `## Hai ý ngang hàng nên có hình thức tương xứng

*The role requires planning, coordinating and reporting* có ba động từ dạng V-ing song song. *Planning, to coordinate and reporting* làm danh sách mất cân đối. Trong bài Part 5, từ nối *and/or* thường cho biết chỗ trống cần cùng loại từ hoặc cùng cấu trúc với vế bên kia; tuy nhiên nghĩa của hai ý vẫn phải hợp.

**Both ... and** nối hai yếu tố cùng vai trò: *The course covers both listening and reading*. **Either ... or** đưa ra hai lựa chọn: *You can either email the form or bring it to the office*. **Not only ... but also** thêm thông tin: *The update not only fixed bugs but also improved speed*. Không nhất thiết mọi từ ở hai vế giống hệt nhau, nhưng hai vế nên có cùng chức năng trong câu.

## Song song ở cấp cụm và mệnh đề

*The manager asked us to review the figures and to confirm the totals* là hai cụm nguyên mẫu song song; *to* thứ hai có thể lược bỏ: *to review ... and confirm ...*. Ở cấp mệnh đề, *The client approved the design, and the team began production* có hai câu hoàn chỉnh. Chọn dấu câu phù hợp để người đọc biết nơi một ý kết thúc.

Điều khó là xác định phần nào thực sự được nối. Trong *The report is clear and accurate*, hai tính từ mô tả báo cáo. Trong *The team worked quickly and carefully*, hai trạng từ mô tả cách làm việc. Bài [loại từ](/blog/loai-tu-trong-toeic-part-5) và [từ bổ nghĩa](/blog/tu-bo-nghia-toeic-part-5) giúp phân biệt hai trường hợp.

## Ví dụ kiểu TOEIC

**The workshop will cover budgeting, scheduling, and _____.** (A) report (B) reports (C) reporting (D) to report

**Đáp án C.** *Budgeting* và *scheduling* là hai hoạt động ở dạng V-ing; *reporting* tạo danh sách đồng dạng. Ví dụ do TOEICGym tự biên soạn.

## Tự kiểm tra

**The new process is both efficient and _____.** (A) reliability (B) reliable (C) reliably (D) rely

**Đáp án B.** Sau *both efficient and* cần tính từ song song với *efficient*. Nếu hai vế nối các chủ ngữ, việc chia động từ còn phụ thuộc cấu trúc; ôn [hòa hợp chủ ngữ – động từ](/blog/hoa-hop-chu-ngu-dong-tu-toeic).`,
  }),
  post({
    slug: "dao-ngu-tieng-anh-only-never-not-only",
    title: "Đảo ngữ tiếng Anh: only after, never, not only trong văn viết",
    excerpt: "Nhận ra khi nào trợ động từ đứng trước chủ ngữ sau trạng ngữ phủ định hoặc giới hạn ở đầu câu.",
    seoTitle: "Đảo ngữ tiếng Anh với only after, never, not only",
    seoDescription: "Cách dùng đảo ngữ tiếng Anh với only after, never, rarely, not only; có công thức, ví dụ email trang trọng và bài tập giải thích.",
    targetTopic: "đảo ngữ tiếng Anh",
    content: `## Đảo ngữ là đổi trật tự để nhấn mạnh

Câu thường: *We realized the error only after the report was sent.* Khi đưa *Only after the report was sent* lên đầu để nhấn thời điểm, mệnh đề chính đảo trợ động từ: *Only after the report was sent did we realize the error*. Phần **sau only after** không đảo; phần **mệnh đề chính** mới đảo. Đây là điểm dễ đọc nhầm trong văn bản trang trọng.

Các trạng từ phủ định hoặc hạn chế ở đầu câu cũng có thể tạo đảo ngữ: *Never have we received so many requests*; *Rarely does the office close early*. Nếu câu gốc chưa có trợ động từ, thêm *do/does/did* và dùng động từ nguyên mẫu: *Rarely does the office close*, không viết *does ... closes*.

## Not only ... but also

Khi *not only* đứng đầu mệnh đề, đảo trợ động từ trong vế đầu: *Not only did the team finish early, but it also stayed within budget*. Khi *not only* đứng giữa câu, thường không cần đảo: *The team not only finished early but also stayed within budget*. Hai vế vẫn cần tương ứng về nghĩa và hình thức; xem [cấu trúc song song](/blog/cau-truc-song-song-parallel-structure).

Đảo ngữ chủ yếu xuất hiện trong văn phong nhấn mạnh, không phải cách diễn đạt bắt buộc cho mọi câu. Khi sửa email, dùng cấu trúc thường nếu nó rõ và tự nhiên hơn. Người học TOEIC cần **nhận diện** để không nhầm trợ động từ đứng trước chủ ngữ với câu hỏi.

## Ví dụ kiểu TOEIC

**Only after yesterday's inspection _____ the company reopen the facility.** (A) did (B) do (C) had (D) was

**Đáp án A.** *Yesterday's inspection* đặt sự kiện ở quá khứ. Sau *only after* đứng đầu, mệnh đề chính dùng *did + chủ ngữ + V*. B không hòa hợp với *company* và không đúng thời gian; C cần V3; D không nối trực tiếp với *reopen*. Ví dụ do TOEICGym tự biên soạn.

## Tự kiểm tra

**Rarely _____ the manager approve a request without reviewing the details.** (A) do (B) does (C) is (D) has

**Đáp án B.** *The manager* số ít, dùng *does*; động từ chính *approve* giữ nguyên mẫu. Khi không có *rarely* ở đầu, trật tự thông thường là *The manager rarely approves ...*.`,
  }),
  post({
    slug: "cau-khien-have-get-something-done",
    title: "Câu khiến tiếng Anh: have/get something done, make và let",
    excerpt: "Phân biệt nhờ người khác làm việc, khiến ai làm việc và cho phép ai làm việc trong ngữ cảnh công sở.",
    seoTitle: "Câu khiến tiếng Anh: have/get something done, make, let",
    seoDescription: "Học cấu trúc have/get something done, have/make/let someone do và get someone to do; có ví dụ công việc, lỗi thường gặp và bài tập.",
    targetTopic: "câu khiến tiếng Anh",
    content: `## Câu khiến cho biết ai thực sự làm việc

*We had the printer repaired* thường có nghĩa nhóm đã sắp xếp để **người khác sửa máy in**. *We repaired the printer* nghĩa nhóm tự sửa. Sự khác biệt nằm ở người thực hiện hành động, dù cả hai câu đều nói chiếc máy được sửa. Cấu trúc thường gặp là **have/get + vật + V3**: *She got the documents translated*.

Nếu nêu người thực hiện, dùng **have + người + V**: *The manager had the assistant send the invoice*. **Get + người + to + V**: *The manager got the assistant to send the invoice*. Không dùng *had the assistant to send* trong mẫu này. Với *make* và *let*, dùng **người + V nguyên mẫu**: *The policy made staff wear badges*; *The supervisor let staff leave early*.

## Phân biệt với bị động thường

*The printer was repaired yesterday* là câu bị động, chỉ sự việc máy được sửa. *We had the printer repaired yesterday* nhấn rằng chúng ta đã sắp xếp việc sửa. Mẫu *have/get something done* không luôn có nghĩa chủ ngữ tự làm; xem [câu bị động](/blog/cau-bi-dong-toeic-part-5) để tách rõ hai cấu trúc.

Khi *have* mang nghĩa sở hữu, nó không phải câu khiến: *We have a printer*. Khi *get* mang nghĩa nhận, nó cũng không nhất thiết là câu khiến: *We got a new printer*. Đừng nhận diện cấu trúc chỉ nhờ một từ đơn lẻ; hãy đọc toàn bộ cụm theo sau.

## Ví dụ kiểu TOEIC

**The company will have its website _____ before the product launch.** (A) update (B) updated (C) updating (D) to update

**Đáp án B.** *Website* là đối tượng được cập nhật; *have + vật + V3* nói việc công ty sắp xếp để cập nhật. Ví dụ do TOEICGym tự biên soạn.

## Tự kiểm tra

**The director asked a designer _____ the brochure.** (A) revise (B) revising (C) to revise (D) revised

**Đáp án C.** *Ask + người + to + V*; khác với *have + người + V*. Để ôn sâu cách chọn dạng sau từng động từ, đọc [V-ing và to-infinitive](/blog/ving-va-to-infinitive-toeic).`,
  }),
];
