import type { EditorialPost } from "./editorial";

const source = {
  ets: "https://www.eu.ets.org/toeic/about/listening-reading.html",
  forms: "https://dictionary.cambridge.org/grammar/british-grammar/word-formation_2",
  tense: "https://dictionary.cambridge.org/grammar/british-grammar/past-perfect-simple",
  agreement: "https://dictionary.cambridge.org/grammar/british-grammar/subject-verb-agreement",
  relative: "https://dictionary.cambridge.org/grammar/british-grammar/relative-pronouns",
  conjunction: "https://dictionary.cambridge.org/grammar/british-grammar/because-because-of-and-cos-cos-of",
  preposition: "https://dictionary.cambridge.org/grammar/british-grammar/prepositions_2",
  quantity: "https://dictionary.cambridge.org/grammar/british-grammar/fewer-or-less",
};

type Draft = Pick<EditorialPost, "slug" | "title" | "excerpt" | "seoTitle" | "seoDescription" | "coverAlt" | "targetTopic" | "content">;
const imageNames = [
  "loai-tu", "thi-dong-tu", "hoa-hop-chu-ngu-dong-tu", "menh-de-quan-he",
  "lien-tu", "gioi-tu", "so-sanh-luong-tu",
];
export const GRAMMAR_SLUGS = [
  "loai-tu-trong-toeic-part-5",
  "thi-va-dang-dong-tu-toeic",
  "hoa-hop-chu-ngu-dong-tu-toeic",
  "menh-de-quan-he-toeic",
  "lien-tu-va-tu-noi-toeic",
  "gioi-tu-toeic-trong-cong-viec",
  "so-sanh-va-luong-tu-toeic",
];
export function grammarImageForSlug(slug: string): string | null {
  const index = GRAMMAR_SLUGS.indexOf(slug);
  return index < 0 ? null : `/blog/grammar/${imageNames[index]}.webp`;
}

const publishedAt = new Date("2026-09-23T02:00:00.000Z");
function grammarPost(draft: Draft): EditorialPost {
  return {
    ...draft, id: `editorial-grammar-${draft.slug}`, status: "PUBLISHED", category: "GRAMMAR",
    canonicalPath: `/blog/${draft.slug}`, coverMediaId: null,
    editorialCover: grammarImageForSlug(draft.slug)!, socialTitle: draft.seoTitle,
    socialDescription: draft.seoDescription, authorName: "TOEICGym Editorial",
    searchIntent: "informational", noindex: false, publishedAt, createdAt: publishedAt,
    updatedAt: publishedAt, createdBy: "editorial", updatedBy: "editorial",
    tags: [{ name: "Ngữ pháp TOEIC", slug: "ngu-phap-toeic" }, { name: "Part 5", slug: "part-5" }],
  };
}

export const GRAMMAR_POSTS: EditorialPost[] = [
  grammarPost({
    slug: GRAMMAR_SLUGS[0],
    title: "Loại từ trong TOEIC Part 5: nhìn vị trí trống để chọn đúng",
    excerpt: "Hiểu cách phân biệt danh từ, động từ, tính từ và trạng từ qua vị trí trong câu, kèm bài tập Part 5 có giải thích.",
    seoTitle: "Loại từ TOEIC Part 5: cách nhận biết và bài tập",
    seoDescription: "Học loại từ TOEIC Part 5 bằng vị trí trong câu: danh từ, động từ, tính từ, trạng từ; có ví dụ công sở, lỗi dễ nhầm và bài tập giải thích.",
    coverAlt: "Các thẻ giấy xếp thành câu minh họa cách nhận biết loại từ trong TOEIC",
    targetTopic: "loại từ TOEIC Part 5",
    content: `## Vì sao câu loại từ dễ sai dù bạn biết nghĩa?

Trong Part 5, bốn đáp án đôi khi cùng gốc từ: *success, succeed, successful, successfully*. Nếu chỉ dịch nghĩa “thành công”, bạn chưa biết điền từ nào. Hãy xác định **chỗ trống đang làm nhiệm vụ gì trong câu**. Theo [ETS](${source.ets}), Part 5 là câu chưa hoàn chỉnh; cách phân tích vị trí này cũng hữu ích khi điền từ trong đoạn văn Part 6.

## Bốn loại từ cốt lõi và vị trí thường gặp

- **Danh từ** gọi tên người, vật, việc: *the approval of the budget*. Sau *the* có thể có tính từ rồi mới đến danh từ.
- **Động từ** diễn tả hành động hoặc trạng thái: *The manager approved the budget*. Hãy tìm chủ ngữ và kiểm tra câu đã có động từ chính chưa.
- **Tính từ** mô tả danh từ hoặc đứng sau động từ nối: *a successful launch*; *The launch was successful*.
- **Trạng từ** bổ nghĩa cho động từ, tính từ hoặc cả mệnh đề: *The team completed the project successfully*.

Đuôi *-tion, -ment, -ity* thường gợi danh từ; *-able, -ive* gợi tính từ; *-ly* thường gợi trạng từ. Đây là **tín hiệu, không phải quy tắc tuyệt đối**: *friendly* là tính từ. [Cambridge giải thích về cấu tạo từ](${source.forms}) để bạn tra những trường hợp chưa chắc.

## Phân tích một câu kiểu TOEIC

**The marketing team prepared a _____ report for the client.** (A) detail (B) detailed (C) detailing (D) details

Sau mạo từ *a* và trước danh từ *report*, chỗ trống cần một từ mô tả *report*. **B. detailed** là tính từ: “một báo cáo chi tiết”. *Detail* và *details* là danh từ trong các lựa chọn này; *detailing* có thể là phân từ trong ngữ cảnh khác, nhưng *a detailed report* là cách diễn đạt tự nhiên ở đây. Câu này do TOEICGym tự biên soạn, không phải đề ETS.

## Quy trình ba bước khi làm bài

1. Gạch chân từ ngay trước và sau chỗ trống.
2. Xác định chỗ trống cần loại từ nào, rồi loại đáp án sai loại.
3. Đọc lại cả câu để kiểm tra nghĩa và cách kết hợp từ.

Đừng áp dụng máy móc “sau *the* luôn là danh từ”: *the revised schedule* có tính từ chen giữa. Sau khi chọn loại từ, bạn vẫn cần kiểm tra thì hoặc số ít/số nhiều nếu đáp án là động từ.

## Tự kiểm tra

**The new policy will take effect _____ after approval.** (A) immediate (B) immediately (C) immediacy (D) immediateness

**Đáp án B.** Chỗ trống bổ nghĩa cho cụm động từ *take effect*, nên cần trạng từ *immediately*. Nếu bạn chọn A vì thấy nghĩa “ngay”, hãy quay lại hỏi từ đó đang bổ nghĩa cho **động từ hay danh từ**. Học tiếp [thì và dạng động từ](/blog/thi-va-dang-dong-tu-toeic) để xử lý nhóm đáp án là động từ.`
  }),
  grammarPost({
    slug: GRAMMAR_SLUGS[1],
    title: "Thì và dạng động từ TOEIC: đọc mốc thời gian trước khi chọn",
    excerpt: "Cách chọn thì, bị động và dạng động từ theo thời điểm, chủ thể hành động và cấu trúc câu trong TOEIC Part 5–6.",
    seoTitle: "Thì và dạng động từ TOEIC: dấu hiệu, ví dụ, bài tập",
    seoDescription: "Phân biệt quá khứ đơn, hiện tại hoàn thành, quá khứ hoàn thành và bị động trong TOEIC bằng mốc thời gian và quan hệ sự kiện.",
    coverAlt: "Các tờ lịch và đường thời gian minh họa thì động từ tiếng Anh trong TOEIC",
    targetTopic: "thì động từ TOEIC",
    content: `## Đọc ý nghĩa thời gian, không chỉ săn từ khóa

Trong email, thông báo và câu Part 5, thì động từ cho biết sự việc đã xong, còn liên quan hiện tại hay xảy ra trước một mốc quá khứ. Từ như *yesterday* hữu ích, nhưng có câu không có từ khóa rõ ràng. Khi đó, hãy tìm **mốc tham chiếu** và thứ tự sự kiện.

## Ba cặp dễ nhầm

**Quá khứ đơn** dùng cho việc đã hoàn thành tại thời điểm quá khứ xác định: *The supplier delivered the chairs yesterday.* **Hiện tại hoàn thành** nối một việc trong quá khứ với hiện tại, thường khi chưa nêu thời điểm quá khứ xác định: *The supplier has delivered the chairs, so we can set up the room now.* Không viết *has delivered yesterday* trong cách dùng thông thường.

**Quá khứ hoàn thành** dùng khi cần làm rõ việc xảy ra trước một mốc quá khứ khác: *By the time the meeting began, the technician had repaired the projector.* Việc sửa máy xảy ra trước lúc họp bắt đầu. [Cambridge giải thích quan hệ này](${source.tense}); không phải cứ thấy hai hành động quá khứ là bắt buộc dùng quá khứ hoàn thành.

**Chủ động**: *The team will announce the results.* **Bị động**: *The results will be announced on Friday.* Hãy nhìn chủ ngữ có **thực hiện** hành động hay **nhận** hành động. Với bị động, dạng cơ bản là *be + past participle*, còn *be* đổi theo thì.

## Câu kiểu TOEIC: chọn bằng hai tín hiệu

**The invoices _____ before the accounting team closed the monthly report last Friday.** (A) had been checked (B) have checked (C) are checking (D) check

“Invoices” là đối tượng **được kiểm tra**, nên cần bị động. Việc kiểm tra diễn ra **trước** thời điểm đóng báo cáo trong quá khứ. **A. had been checked** diễn đạt cả hai quan hệ. *Have checked* vừa chủ động vừa không phù hợp với chủ ngữ “invoices”. Ví dụ do TOEICGym biên soạn.

## Cách giải trong 20 giây

1. Tìm chủ ngữ và động từ cần chia.
2. Đánh dấu mốc thời gian; hỏi hành động trước, sau hay kéo dài đến hiện tại.
3. Hỏi chủ ngữ làm hay chịu hành động.
4. Đọc lại để kiểm tra nghĩa của toàn câu.

## Tự kiểm tra

**The company _____ three new branches since January.** (A) opened (B) has opened (C) had opened (D) opening

**Đáp án B.** *Since January* tính từ một mốc trước đến hiện tại; “the company” thực hiện hành động mở chi nhánh. Nếu ngữ cảnh có mốc kết thúc rõ trong quá khứ, lựa chọn sẽ khác. Hãy làm tiếp [5 câu thì động từ Part 5 có lời giải](/toeic/part-5/thi-dong-tu), rồi xem thêm [hòa hợp chủ ngữ và động từ](/blog/hoa-hop-chu-ngu-dong-tu-toeic) để không chọn đúng thì nhưng sai số ít/số nhiều.`
  }),
  grammarPost({
    slug: GRAMMAR_SLUGS[2],
    title: "Hòa hợp chủ ngữ – động từ TOEIC: tìm đúng chủ ngữ chính",
    excerpt: "Nhận ra chủ ngữ thật khi câu có cụm chen giữa; phân biệt each, a number of và the number of qua ví dụ Part 5.",
    seoTitle: "Hòa hợp chủ ngữ động từ TOEIC: quy tắc và bài tập",
    seoDescription: "Cách tìm chủ ngữ chính trong TOEIC Part 5, xử lý cụm giới từ, each/every, a number of và the number of với ví dụ có giải thích.",
    coverAlt: "Một tập hồ sơ và nhiều tập hồ sơ minh họa số ít số nhiều của chủ ngữ",
    targetTopic: "hòa hợp chủ ngữ động từ TOEIC",
    content: `## Chủ ngữ ở xa động từ vẫn quyết định cách chia

Hòa hợp chủ ngữ – động từ nghĩa là dạng động từ phù hợp với **chủ ngữ của mệnh đề**. Trong câu ngắn, *The manager is available* rất dễ. TOEIC hay chen thêm cụm thông tin: *The manager of the regional offices is available*. Danh từ gần động từ nhất là *offices*, nhưng chủ ngữ chính vẫn là *manager*. [Cambridge nêu nguyên tắc hòa hợp](${source.agreement}).

## Cách gỡ cụm chen giữa

Đọc câu **The schedule for the training sessions _____ on the website.** Bỏ tạm *for the training sessions*, bạn còn *The schedule _____ on the website*. *Schedule* là số ít, nên chọn *is* hoặc một động từ số ít phù hợp với ngữ cảnh, không chọn theo *sessions*.

Cụm bắt đầu bằng *of, for, with, in, as well as* thường thêm thông tin nhưng không thay đổi chủ ngữ chính. Tuy vậy, luôn xem cả câu: *The manager and the assistant are available* có hai chủ ngữ nối bằng *and*.

## Ba cấu trúc cần nhớ

- **Each/Every + danh từ số ít**: *Each applicant has an interview time.* Dù có nhiều ứng viên, từng người được xét riêng.
- **A number of + danh từ số nhiều**: *A number of employees are working remotely.* Nghĩa là “một số nhân viên”.
- **The number of + danh từ số nhiều**: *The number of employees is increasing.* Chủ ngữ là “số lượng”, ở số ít.

Trong tiếng Anh, danh từ tập hợp như *team* có thể đi với cách chia khác nhau tùy biến thể và cách nhìn tập thể; khi gặp câu thi, chọn theo ngữ cảnh và các phương án được cho, đừng học một mẹo tuyệt đối.

## Câu kiểu TOEIC

**The list of approved suppliers _____ available to all purchasing staff.** (A) are (B) is (C) have (D) were

**Đáp án B.** Chủ ngữ là *The list*, còn *of approved suppliers* chỉ bổ nghĩa cho danh sách. Vì vậy cần *is available*. Câu tự biên soạn để luyện cách gạch bỏ cụm chen giữa.

## Tự kiểm tra

**A number of new employees _____ orientation today.** (A) attends (B) attend (C) attending (D) has attended

**Đáp án B.** *A number of employees* mang nghĩa nhiều nhân viên, nên động từ số nhiều *attend* phù hợp. Sau khi tìm đúng chủ ngữ, nếu câu có mốc thời gian phức tạp, áp dụng thêm cách chọn [thì và dạng động từ](/blog/thi-va-dang-dong-tu-toeic).`
  }),
  grammarPost({
    slug: GRAMMAR_SLUGS[3],
    title: "Mệnh đề quan hệ TOEIC: chọn who, which, whose hay where?",
    excerpt: "Hiểu vai trò của từ quan hệ trong câu để chọn đúng who, which, whose, where và tránh mẹo chỉ nhìn danh từ đứng trước.",
    seoTitle: "Mệnh đề quan hệ TOEIC: who, which, whose, where",
    seoDescription: "Giải thích mệnh đề quan hệ TOEIC bằng vai trò chủ ngữ, tân ngữ, sở hữu và nơi chốn; có câu Part 5 mẫu và bài tập giải thích.",
    coverAlt: "Hai tờ ghi chú công sở được nối với nhau minh họa mệnh đề quan hệ",
    targetTopic: "mệnh đề quan hệ TOEIC",
    content: `## Mệnh đề quan hệ giúp thêm thông tin về danh từ

Thay vì viết hai câu “The employee called. The employee handles invoices”, ta ghép: *The employee **who handles invoices** called.* Mệnh đề bắt đầu bằng *who* cho biết nhân viên nào. Trong TOEIC, đây là cách người viết làm câu email hoặc thông báo gọn hơn; ở Part 5, bạn thường cần chọn đúng từ nối.

## Đừng chỉ nhìn “người hay vật”

- **Who** thường thay người và làm chủ ngữ hoặc tân ngữ: *the consultant who reviewed the contract*.
- **Which** thường thay vật hoặc sự việc: *the software which stores the files*.
- **Whose** chỉ sở hữu và đứng trước danh từ: *the manager whose office is on the third floor*.
- **Where** chỉ nơi chốn, thay cho ý *in/at which*: *the branch where she works*.

*That* cũng có thể thay *who/which* trong nhiều mệnh đề xác định, nhưng thông thường không dùng nó để thay mệnh đề không xác định sau dấu phẩy. Khi cần chọn, hãy xét cả **dấu câu** và **chỗ thiếu trong mệnh đề**. [Cambridge trình bày các đại từ quan hệ](${source.relative}).

## Nhìn phần sau chỗ trống để tìm chức năng

**The technician _____ repaired the printer will return tomorrow.** (A) who (B) whose (C) where (D) when

Sau chỗ trống là động từ *repaired*; mệnh đề đang thiếu **chủ ngữ** chỉ người. **A. who** đúng. *Whose* cần theo sau bằng danh từ, ví dụ *whose team repaired the printer*. Câu này do TOEICGym tự viết.

So sánh: *The technician **whom** we contacted...* có *we* làm chủ ngữ, còn chỗ trống là tân ngữ; trong văn phong thường, *who/that* cũng được dùng cho tân ngữ của mệnh đề xác định. Đừng áp một công thức cho mọi câu.

## Tự kiểm tra

**The company opened a service center _____ customers can collect their orders.** (A) whose (B) where (C) who (D) what

**Đáp án B.** *Service center* là địa điểm; phần sau có đủ chủ ngữ *customers* và động từ *can collect*, cần một từ chỉ “tại đó”. Nếu mệnh đề sau chỗ trống thiếu chủ ngữ, bạn sẽ cần phân tích lại vai trò thay vì cứ thấy địa điểm là chọn *where*. Học tiếp [liên từ và từ nối](/blog/lien-tu-va-tu-noi-toeic) để phân biệt mệnh đề quan hệ với quan hệ nguyên nhân, nhượng bộ.`
  }),
  grammarPost({
    slug: GRAMMAR_SLUGS[4],
    title: "Liên từ TOEIC: phân biệt because, because of, although, however",
    excerpt: "Chọn liên từ theo thành phần đứng sau và dấu câu, từ nguyên nhân đến nhượng bộ trong Part 5 và Part 6.",
    seoTitle: "Liên từ TOEIC: because, although, however dễ hiểu",
    seoDescription: "Phân biệt because/because of, although/despite và however trong TOEIC bằng mệnh đề, cụm danh từ và dấu câu; kèm bài tập giải thích.",
    coverAlt: "Hai tài liệu được kết nối bằng dải giấy minh họa liên từ và từ nối",
    targetTopic: "liên từ TOEIC",
    content: `## Chọn từ nối bằng cấu trúc phía sau

Ở Part 5, bạn thấy một chỗ trống nối hai ý; ở Part 6, bạn còn phải xét mạch của cả đoạn. Đừng chọn chỉ vì dịch được “vì” hay “tuy nhiên”. Hãy xác định phía sau chỗ trống là **mệnh đề có chủ ngữ và động từ** hay **cụm danh từ**.

## Nguyên nhân: because hay because of?

**Because + mệnh đề:** *The meeting was delayed because the director was absent.* Phần sau *because* có chủ ngữ *the director* và động từ *was*.

**Because of + danh từ/cụm danh từ:** *The meeting was delayed because of the director's absence.* Phần sau là cụm danh từ, không có động từ chính. [Cambridge phân biệt rõ hai dạng](${source.conjunction}).

## Nhượng bộ: although, despite, however

**Although + mệnh đề:** *Although the deadline was tight, the team finished on time.* **Despite + cụm danh từ hoặc V-ing:** *Despite the tight deadline, the team finished on time.* Không viết *despite the deadline was tight*.

**However** thường là trạng từ nối ý giữa hai câu hoặc hai mệnh đề độc lập với dấu câu thích hợp: *The deadline was tight. However, the team finished on time.* Không dùng *however* y như *although* để mở một mệnh đề phụ trong cùng cấu trúc.

## Câu kiểu TOEIC

**The shipment was postponed _____ a customs inspection.** (A) because (B) because of (C) although (D) however

**Đáp án B.** Sau chỗ trống là cụm danh từ *a customs inspection*; nghĩa câu cần chỉ nguyên nhân. *Because* thiếu mệnh đề, còn C và D không hợp quan hệ ý. Ví dụ tự biên soạn.

## Tự kiểm tra

**_____ the software was updated, some users still reported errors.** (A) Despite (B) Although (C) Because of (D) However

**Đáp án B.** Phần sau có chủ ngữ *the software* và động từ *was updated*, trong khi *still* báo hiệu quan hệ nhượng bộ. *Despite* cần cụm danh từ hoặc V-ing; *However* cần dấu câu và cấu trúc khác. Nếu vướng giữa liên từ và giới từ, đọc [giới từ TOEIC trong công việc](/blog/gioi-tu-toeic-trong-cong-viec).`
  }),
  grammarPost({
    slug: GRAMMAR_SLUGS[5],
    title: "Giới từ TOEIC trong email công việc: học cả cụm, không học rời",
    excerpt: "Cách dùng in, on, at, by, until và các cụm responsible for, comply with, prior to trong ngữ cảnh công sở.",
    seoTitle: "Giới từ TOEIC: thời gian và cụm từ công sở",
    seoDescription: "Học giới từ TOEIC qua email, lịch họp và thông báo: in/on/at, by/until, responsible for, comply with; có ví dụ và bài tập.",
    coverAlt: "Lịch, đồng hồ và phong bì minh họa giới từ chỉ thời gian trong TOEIC",
    targetTopic: "giới từ TOEIC",
    content: `## Giới từ quyết định quan hệ giữa các ý

*At 9 a.m.*, *on Monday*, *in September* đều chỉ thời gian nhưng không thể thay tùy ý. Trong TOEIC, giới từ còn xuất hiện trong các cụm công việc như *responsible for*, *comply with* và *prior to*. [Cambridge mô tả giới từ](${source.preposition}) là từ hoặc cụm từ thể hiện quan hệ về thời gian, nơi chốn hay logic.

## Ba mốc thời gian thông dụng

- **At** với giờ hoặc thời điểm cụ thể: *at 9:30 a.m.*, *at noon*.
- **On** với ngày hoặc ngày tháng: *on Monday*, *on September 23*.
- **In** với tháng, năm hoặc khoảng thời gian dài: *in September*, *in 2026*.

Đây là quy tắc nền; một số biểu thức cố định có cách dùng riêng. Khi gặp một cụm lạ, tra cả cụm trong từ điển thay vì suy từ một chữ.

## By khác until ở đâu?

**By Friday** là hạn chót: việc cần hoàn tất không muộn hơn thứ Sáu. *Please submit the form by Friday.* **Until Friday** là một trạng thái kéo dài tới thứ Sáu: *The office will remain closed until Friday.* Đặt *until* vào câu nộp biểu mẫu sẽ làm sai ý dự định nếu bạn muốn diễn đạt hạn chót.

## Học cụm cố định cùng một câu

*Responsible for scheduling meetings* nghĩa là chịu trách nhiệm sắp lịch họp. *Comply with safety regulations* là tuân thủ quy định an toàn. *Prior to the meeting* là trước cuộc họp, mang sắc thái trang trọng. Ghi mỗi cụm cùng một câu mới do bạn tự đặt giúp nhớ giới từ và ngữ cảnh sử dụng.

## Câu kiểu TOEIC

**All employees must complete the safety training _____ Friday.** (A) by (B) until (C) during (D) since

**Đáp án A.** Câu nói về **hạn hoàn thành**, nên *by Friday*. *Until Friday* hợp với một hành động hoặc trạng thái kéo dài, chẳng hạn *The registration portal will stay open until Friday*. Câu do TOEICGym biên soạn.

## Tự kiểm tra

**The new staff member is responsible _____ updating the client list.** (A) in (B) for (C) at (D) with

**Đáp án B.** Cụm đúng là *responsible for + noun/V-ing*. Học tiếp [liên từ TOEIC](/blog/lien-tu-va-tu-noi-toeic) để phân biệt *because of + cụm danh từ* với *because + mệnh đề*.`
  }),
  grammarPost({
    slug: GRAMMAR_SLUGS[6],
    title: "So sánh và lượng từ TOEIC: fewer hay less, more hay most?",
    excerpt: "Phân biệt danh từ đếm được, không đếm được, so sánh hơn và so sánh nhất qua bảng số liệu, email và câu Part 5.",
    seoTitle: "So sánh và lượng từ TOEIC: fewer, less, more, most",
    seoDescription: "Hiểu fewer/less, much/many và cấu trúc so sánh trong TOEIC qua ngữ cảnh công việc; có ví dụ, mẹo kiểm tra và bài tập giải thích.",
    coverAlt: "Hai chồng báo cáo trên cân minh họa so sánh và lượng từ TOEIC",
    targetTopic: "so sánh lượng từ TOEIC",
    content: `## Bắt đầu từ danh từ phía sau

Trong TOEIC, bảng doanh thu, số lượng đơn hàng và email tiến độ thường cần so sánh. Nếu chỗ trống đứng trước danh từ, câu hỏi đầu tiên là danh từ đó **đếm được** hay **không đếm được**. Đừng học một cặp từ mà bỏ qua danh từ đi kèm.

## Fewer, less, many, much

**Fewer + danh từ đếm được số nhiều:** *fewer complaints*, *fewer orders*. **Less + danh từ không đếm được:** *less time*, *less equipment*. Cambridge cũng nêu cách phân biệt này trong [mục fewer và less](${source.quantity}). Trong văn nói có những cách dùng linh hoạt hơn; với câu kiểm tra ngữ pháp trang trọng, hãy dựa vào loại danh từ và ngữ cảnh.

Tương tự, **many** đi với danh từ đếm được số nhiều (*many clients*), còn **much** đi với danh từ không đếm được (*much information*). *Information* không có dạng số nhiều thông thường *informations*; để đếm, dùng *pieces of information*.

## So sánh hơn và so sánh nhất

*This process is faster than the old one* so hai quy trình; *This is the fastest process in the department* chọn một trong cả nhóm. Từ **than** thường gợi so sánh hơn. Cụm **the + so sánh nhất** cần một nhóm hoặc phạm vi so sánh. Với tính từ dài: *more efficient than*, *the most efficient*.

Đừng ghép hai dấu so sánh: *more faster* là sai trong cách dùng chuẩn. Với *one of the most efficient systems*, danh từ *systems* ở số nhiều vì đó là một hệ thống trong nhóm các hệ thống hiệu quả nhất.

## Câu kiểu TOEIC

**The revised procedure requires _____ time than the previous one.** (A) fewer (B) less (C) many (D) most

**Đáp án B.** *Time* trong nghĩa “lượng thời gian” không đếm được; *than* cho thấy đang so sánh hơn. *Less time* hợp cả hai tín hiệu. Ví dụ do TOEICGym tự viết.

## Tự kiểm tra

**The updated website received _____ complaints this month than last month.** (A) less (B) fewer (C) much (D) most

**Đáp án B.** *Complaints* là danh từ đếm được số nhiều và có *than* so sánh hai tháng. Sau khi chọn lượng từ, hãy kiểm tra thêm [hòa hợp chủ ngữ – động từ](/blog/hoa-hop-chu-ngu-dong-tu-toeic) nếu câu có động từ cần chia.`
  }),
];
