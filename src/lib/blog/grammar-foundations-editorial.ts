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
    coverAlt: `Minh họa bài học ${draft.targetTopic} bằng câu tiếng Anh trong công việc`,
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

export const GRAMMAR_FOUNDATION_POSTS: EditorialPost[] = [
  post({
    slug: "cau-truc-cau-tieng-anh-co-ban",
    title: "Cấu trúc câu tiếng Anh cơ bản: tìm chủ ngữ và động từ trước",
    excerpt: "Học cách tách chủ ngữ, động từ, tân ngữ, bổ ngữ và mệnh đề để đọc câu dài, làm Part 5 và viết email rõ ý.",
    seoTitle: "Cấu trúc câu tiếng Anh: S V O, bổ ngữ và mệnh đề",
    seoDescription: "Hướng dẫn cấu trúc câu tiếng Anh từ S V O đến mệnh đề: nhận diện chủ ngữ, động từ, tân ngữ và phần bổ nghĩa qua ví dụ công việc có giải thích.",
    targetTopic: "cấu trúc câu tiếng Anh cơ bản",
    content: `## Đọc câu từ bộ khung chính

Khi gặp một câu dài trong email TOEIC, đừng dịch từ đầu đến cuối rồi mới tìm đáp án. Hãy xác định **ai hoặc cái gì là chủ ngữ** và **hành động hay trạng thái chính là gì**. Ví dụ: *The marketing team approved the proposal yesterday.* Bộ khung là *the team approved the proposal*; *marketing* làm rõ nhóm nào, còn *yesterday* cho biết thời gian.

Một mệnh đề độc lập thường có chủ ngữ và động từ hữu hạn. *The shipment arrived* là một câu hoàn chỉnh. *Because the shipment arrived* có chủ ngữ và động từ nhưng là mệnh đề phụ; nó cần một ý chính đi kèm: *Because the shipment arrived, the team can start work.* Cụm *after the meeting* không có động từ hữu hạn nên chỉ là cụm từ.

## Năm mẫu câu thường gặp

- **S + V:** *The train departed.* Động từ không cần tân ngữ.
- **S + V + O:** *The manager reviewed the report.* *Report* nhận hành động.
- **S + V + bổ ngữ:** *The report seems accurate.* *Accurate* mô tả chủ ngữ sau động từ nối.
- **S + V + người + vật:** *The director sent the team an update.*
- **S + V + O + bổ ngữ:** *They found the instructions useful.* *Useful* mô tả *instructions*.

Tên mẫu giúp định vị chỗ trống, nhưng không thay thế việc đọc nghĩa. Chẳng hạn *The report is useful* cần tính từ, còn *The team reviewed the report carefully* cần trạng từ; xem [cách chọn từ bổ nghĩa](/blog/tu-bo-nghia-toeic-part-5).

## Cụm chen giữa không đổi chủ ngữ chính

Trong *The list of approved suppliers is on the desk*, chủ ngữ chính là *list*, không phải *suppliers*. Vì vậy động từ là *is*. Tương tự, *The documents on the desk are ready* có chủ ngữ chính *documents* nên dùng *are*. Nếu bị rối bởi các cụm *of, in, on, with*, hãy gạch riêng cụm đó rồi đọc lại bộ khung. Bài [hòa hợp chủ ngữ – động từ](/blog/hoa-hop-chu-ngu-dong-tu-toeic) phân tích thêm trường hợp này.

## Tự kiểm tra

**The updated schedule _____ available online.** (A) are (B) is (C) be (D) being

**Đáp án B.** *Schedule* là chủ ngữ số ít; *updated* chỉ mô tả lịch trình. *Is available* tạo câu hoàn chỉnh. Nếu bỏ *is*, câu chỉ còn cụm danh từ và tính từ, chưa có động từ chính.

Khi sửa một câu sai, hãy ghi lại ba phần: chủ ngữ chính, động từ chính và chức năng của chỗ trống. Đây là nền để học tiếp [danh từ đếm được và không đếm được](/blog/danh-tu-dem-duoc-khong-dem-duoc-tieng-anh) hoặc [mệnh đề danh từ](/blog/menh-de-danh-tu-va-cau-hoi-gian-tiep).`,
  }),
  post({
    slug: "danh-tu-dem-duoc-khong-dem-duoc-tieng-anh",
    title: "Danh từ đếm được và không đếm được: chia động từ, chọn lượng từ",
    excerpt: "Phân biệt report/reports với information, equipment, advice để chọn a/an, many/much và động từ số ít hay số nhiều.",
    seoTitle: "Danh từ đếm được, không đếm được: quy tắc và ví dụ",
    seoDescription: "Phân biệt danh từ đếm được và không đếm được trong tiếng Anh, cách dùng số nhiều, mạo từ, many/much, few/little và động từ qua ví dụ TOEIC.",
    targetTopic: "danh từ đếm được và không đếm được",
    content: `## Một danh từ, nhiều quyết định ngữ pháp

Danh từ đếm được có thể đi với số đếm: *one report, two reports*. Danh từ không đếm được thường chỉ chất liệu, khái niệm hoặc một lượng chung: *information, equipment, advice*. Sự phân biệt này ảnh hưởng đến **mạo từ, lượng từ và hòa hợp chủ ngữ – động từ**, nên cần kiểm tra trước khi chọn đáp án.

Trong tiếng Anh công việc, *information* và *equipment* thường không có dạng số nhiều *informations* hay *equipments*. Muốn đếm từng đơn vị, dùng *a piece of information*, *two pieces of equipment*, hoặc chọn danh từ cụ thể như *two devices*. *Staff* và *data* có cách dùng thay đổi theo ngữ cảnh, nên tránh áp một quy tắc số ít tuyệt đối cho mọi văn bản.

## Chọn lượng từ theo loại danh từ

- **Many, a few, fewer** thường đi với danh từ đếm được số nhiều: *many invoices, a few clients, fewer delays*.
- **Much, a little, less** thường đi với danh từ không đếm được: *much information, a little time, less traffic*.
- **Some, a lot of, enough** có thể đi với cả hai nhóm: *some files*, *some advice*.

Trong văn phong trang trọng, *fewer complaints* và *less time* là hai cặp nên nhớ. Bài [so sánh và lượng từ](/blog/so-sanh-va-luong-tu-toeic) giúp luyện thêm khi câu có *than, more, most*.

## Mạo từ và động từ theo danh từ chính

Danh từ đếm được số ít thường cần một từ hạn định: *a report, the report, this report*. Không viết *I sent report*. Danh từ không đếm được nói chung có thể đứng một mình: *Information is available online*. Khi chỉ thông tin cụ thể đã nhắc, dùng *the information*.

**The equipment _____ inspected every month.** (A) are (B) is (C) have (D) be

**Đáp án B.** *Equipment* là danh từ không đếm được trong nghĩa này, nên dùng động từ số ít *is*. *Every month* chỉ tần suất, không làm danh từ thành số nhiều. Câu ví dụ do TOEIC GYM tự biên soạn.

## Tự kiểm tra

**The manager needs _____ information before approving the plan.** (A) many (B) a few (C) more (D) several

**Đáp án C.** *More information* hợp với danh từ không đếm được. *Many, a few, several* cần danh từ đếm được số nhiều. Nếu câu có *an, a, the*, tiếp tục đọc [bài mạo từ tiếng Anh](/blog/mao-tu-a-an-the-va-khong-mao-tu).`,
  }),
  post({
    slug: "mao-tu-a-an-the-va-khong-mao-tu",
    title: "Mạo từ a, an, the và không mạo từ: chọn theo nghĩa danh từ",
    excerpt: "Hiểu khi nào dùng a/an, the hoặc không dùng mạo từ với danh từ số ít, số nhiều và danh từ không đếm được.",
    seoTitle: "Mạo từ a, an, the và zero article: cách dùng dễ hiểu",
    seoDescription: "Cách dùng a, an, the và không mạo từ trong tiếng Anh với ví dụ email TOEIC, lỗi thường gặp và bài tự kiểm tra có đáp án.",
    targetTopic: "mạo từ a an the",
    content: `## Chọn mạo từ bằng ý nghĩa “một” và “đã xác định”

*A/an* giới thiệu một người hoặc vật chưa xác định đối với người đọc: *We need a meeting room*. *The* chỉ một đối tượng đã rõ trong ngữ cảnh: *The meeting room on the second floor is free*. Nếu nói về một nhóm theo nghĩa chung, danh từ đếm được số nhiều thường không cần mạo từ: *Meeting rooms are available*. Danh từ không đếm được nói chung cũng có thể đứng không mạo từ: *Information is available online*.

**A hay an phụ thuộc âm đầu**, không phụ thuộc riêng chữ cái đầu: *an hour* vì *h* câm, nhưng *a university* vì bắt đầu bằng âm /j/. Khi đã có tính từ, xét âm đầu của từ đứng ngay sau mạo từ: *an updated schedule*, *a useful guide*.

## Ba bước quyết định

1. Xác định danh từ chính đếm được hay không và ở số ít hay số nhiều. Nếu chưa chắc, xem [danh từ đếm được và không đếm được](/blog/danh-tu-dem-duoc-khong-dem-duoc-tieng-anh).
2. Hỏi người đọc đã biết chính xác đối tượng nào chưa. Nếu có, dùng *the* hoặc từ hạn định phù hợp.
3. Nếu là danh từ đếm được số ít chưa xác định, chọn *a/an* theo âm đầu của từ theo sau.

Đừng mặc định lần xuất hiện đầu luôn dùng *a*: *Please read the attached file* dùng *the* vì tệp đính kèm đã được xác định. Cũng đừng thêm *the* vào mọi danh từ không đếm được: *The information in your email* chỉ thông tin cụ thể; *Information is important* nói chung.

## Câu kiểu TOEIC

**Please send _____ updated invoice to the client today.** (A) a (B) an (C) the (D) không dùng mạo từ

Nếu đây là lần đầu nhắc đến một hóa đơn bất kỳ, **B. an** phù hợp vì *updated* bắt đầu bằng **âm nguyên âm** /ʌ/. Nếu hai bên đã biết hóa đơn cụ thể nào, **C. the** cũng có thể đúng. Vì vậy, câu chỉ có một đáp án cần thêm ngữ cảnh. Trong bài thi thực tế, hãy đọc toàn bộ câu và đoạn, đừng chọn chỉ theo chữ cái đầu. Đây là ví dụ phân tích ngữ cảnh, không phải câu chấm điểm.

**Please send _____ updated invoice attached to this email.** (A) a (B) an (C) the (D) không dùng mạo từ

**Đáp án C.** *Attached to this email* xác định hóa đơn cụ thể. Ví dụ do TOEIC GYM tự biên soạn.

## Tự kiểm tra

**Our team needs _____ additional hour to finish the review.** (A) a (B) an (C) the (D) không dùng mạo từ

**Đáp án B.** Trong cụm *an additional hour*, mạo từ đứng ngay trước *additional*, từ bắt đầu bằng âm nguyên âm /ə/. Nếu nói *an hour*, ta vẫn dùng *an* vì *h* trong *hour* là âm câm. Với *this/that/our*, ôn tiếp [đại từ và từ hạn định](/blog/dai-tu-va-tu-han-dinh-toeic). [Cambridge Grammar](https://dictionary.cambridge.org/grammar/british-grammar/articles) trình bày thêm sự khác nhau giữa *a/an*, *the* và trường hợp không dùng mạo từ.`,
  }),
  post({
    slug: "hien-tai-don-va-hien-tai-tiep-dien",
    title: "Hiện tại đơn và hiện tại tiếp diễn: phân biệt thói quen với việc đang diễn ra",
    excerpt: "Chọn đúng present simple hay present continuous qua nghĩa thường xuyên, tạm thời và các động từ trạng thái.",
    seoTitle: "Hiện tại đơn và hiện tại tiếp diễn: cách phân biệt",
    seoDescription: "Phân biệt hiện tại đơn và hiện tại tiếp diễn bằng thói quen, việc tạm thời, thời điểm nói và động từ trạng thái; có ví dụ công việc và bài tập.",
    targetTopic: "hiện tại đơn và hiện tại tiếp diễn",
    content: `## Câu đang nói về lịch thường lệ hay việc diễn ra lúc này?

*Present simple* diễn tả thói quen, lịch thường lệ và sự thật chung: *The office opens at 8 a.m.* *Present continuous* diễn tả việc đang diễn ra hoặc một tình huống tạm thời quanh hiện tại: *The office is opening late this week while repairs continue*. Cả hai câu có thể đúng với cùng một chủ ngữ; nghĩa và mốc thời gian quyết định.

Các từ *usually, every Monday, often* thường gợi ý thói quen; *now, at the moment, this week* thường gợi ý việc hiện tại hoặc tạm thời. Nhưng chúng không thay thế việc đọc cả câu. *The train leaves at six tomorrow* dùng hiện tại đơn cho lịch trình cố định, dù nói về tương lai.

## Cấu trúc cần nhớ

- Hiện tại đơn: *I/we/they work*; *he/she/it works*. Câu hỏi: *Does the branch open on Sunday?*
- Hiện tại tiếp diễn: *am/is/are + V-ing*. *The technician is checking the printer now.*

Một số động từ chỉ trạng thái như *know, own, believe, understand* thường dùng hiện tại đơn khi diễn tả trạng thái: *She knows the policy*. Không viết *She is knowing the policy* trong nghĩa thông thường. Tuy nhiên một số động từ đổi nghĩa tùy cách dùng: *I think the plan is good* (ý kiến) khác *I am thinking about the plan* (quá trình cân nhắc).

## Ví dụ kiểu TOEIC

**The accounting team usually _____ invoices on Fridays, but it _____ them today because of the holiday.** (A) processes / is processing (B) is processing / processes

**Đáp án A.** *Usually* chỉ lịch thường lệ; *today because of the holiday* cho thấy thay đổi tạm thời. Ví dụ do TOEIC GYM tự biên soạn. Nếu chỗ trống chỉ yêu cầu số ít/số nhiều, xem [hòa hợp chủ ngữ – động từ](/blog/hoa-hop-chu-ngu-dong-tu-toeic).

## Tự kiểm tra

**At the moment, the receptionist _____ a visitor at the front desk.** (A) helps (B) is helping (C) helped (D) has helped

**Đáp án B.** *At the moment* và ngữ cảnh cho thấy việc đang diễn ra. *Helps* sẽ phù hợp nếu câu mô tả công việc thường ngày: *The receptionist helps visitors every day*.

Để đặt hai thì này vào toàn bộ trục thời gian, xem [thì và dạng động từ TOEIC](/blog/thi-va-dang-dong-tu-toeic).`,
  }),
  post({
    slug: "qua-khu-don-va-qua-khu-tiep-dien",
    title: "Quá khứ đơn và quá khứ tiếp diễn: hành động chính và bối cảnh",
    excerpt: "Phân biệt việc đã hoàn tất với việc đang diễn ra tại một mốc quá khứ; xử lý when, while và câu hai hành động.",
    seoTitle: "Quá khứ đơn và quá khứ tiếp diễn: when, while",
    seoDescription: "Cách dùng quá khứ đơn và quá khứ tiếp diễn trong tiếng Anh với when, while, hành động chen ngang và ví dụ TOEIC có giải thích.",
    targetTopic: "quá khứ đơn và quá khứ tiếp diễn",
    content: `## Một sự kiện đã xong, một bối cảnh đang diễn ra

*Past simple* thường kể sự kiện đã hoàn tất: *The client called at 10 a.m.* *Past continuous* mô tả việc đang diễn ra tại một thời điểm quá khứ: *The team was discussing the budget at 10 a.m.* Khi hai ý gặp nhau, hành động đang diễn ra có thể làm bối cảnh cho sự kiện chen vào: *The team was discussing the budget when the client called*.

*When* và *while* không tự động quyết định thì. *While* thường giới thiệu một quá trình, nhưng câu vẫn phải hợp nghĩa: *While the manager was speaking, the screen went blank*. Cũng có thể hai quá trình song song: *While we were checking the files, the designer was updating the slides*.

## Công thức và điểm dễ nhầm

- Quá khứ đơn: V2 hoặc *did + V* trong câu hỏi/phủ định. *Did the technician arrive?* Không viết *did arrived*.
- Quá khứ tiếp diễn: *was/were + V-ing*. *The technicians were working at noon.*
- Trong câu bị động, *was/were + V3* là dạng khác: *The files were checked at noon*. Phân biệt bằng V-ing và V3; xem [câu bị động TOEIC](/blog/cau-bi-dong-toeic-part-5).

Nếu có hai hành động đều đã hoàn tất theo trình tự, dùng quá khứ đơn là đủ: *The manager arrived and opened the meeting*. Không cần ép một hành động sang quá khứ tiếp diễn chỉ vì câu có hai động từ.

## Câu kiểu TOEIC

**The receptionist _____ a customer when the fire alarm sounded.** (A) is helping (B) was helping (C) has helped (D) will help

**Đáp án B.** Việc hỗ trợ khách đang diễn ra thì chuông báo cháy vang lên. A là hiện tại tiếp diễn, không phù hợp với mốc quá khứ *sounded*. Ví dụ do TOEIC GYM tự biên soạn.

## Tự kiểm tra

**While the engineers _____ the system, the power went out.** (A) was testing (B) were testing (C) have testing (D) testing

**Đáp án B.** *Were testing* diễn tả quá trình đang diễn ra trước và tại lúc mất điện. Sau khi giải, hãy tìm động từ chính của từng mệnh đề; nếu vẫn nhầm, ôn [cấu trúc câu tiếng Anh](/blog/cau-truc-cau-tieng-anh-co-ban).`,
  }),
  post({
    slug: "hien-tai-hoan-thanh-va-qua-khu-don",
    title: "Hiện tại hoàn thành và quá khứ đơn: chọn theo mốc thời gian",
    excerpt: "Dùng present perfect với kinh nghiệm, kết quả còn liên quan hiện tại; dùng past simple với thời điểm quá khứ đã xác định.",
    seoTitle: "Hiện tại hoàn thành và quá khứ đơn: since, for, yesterday",
    seoDescription: "Phân biệt hiện tại hoàn thành và quá khứ đơn qua since, for, yesterday, kết quả hiện tại và thời điểm quá khứ; kèm ví dụ TOEIC có giải thích.",
    targetTopic: "hiện tại hoàn thành và quá khứ đơn",
    content: `## Hỏi “khi nào?” hay “đến hiện tại đã thế nào?”

*Past simple* đặt sự việc tại một thời điểm quá khứ đã xác định: *The supplier sent the parts yesterday*. *Present perfect* nối một việc trước đây với hiện tại, thường nhấn vào kết quả hoặc kinh nghiệm mà không nêu thời điểm quá khứ cụ thể: *The supplier has sent the parts, so production can resume*. Dạng hiện tại hoàn thành là *has/have + V3*.

*Since* chỉ điểm bắt đầu (*since Monday, since 2022*); *for* chỉ độ dài (*for three days*). Khi trạng thái kéo dài đến hiện tại, dùng hiện tại hoàn thành: *She has worked here since 2022*. Khi giai đoạn đã kết thúc, dùng quá khứ đơn: *She worked here from 2019 to 2022*.

## Yesterday dùng since hay for?

Nếu **yesterday** chỉ một thời điểm quá khứ đã kết thúc, thường không dùng riêng *since* hoặc *for*: *I sent the invoice yesterday* dùng quá khứ đơn. Dùng **since yesterday** khi một trạng thái bắt đầu hôm qua và vẫn tiếp tục đến hiện tại: *The website has been unavailable since yesterday*. Dùng **for + khoảng thời gian** khi muốn nói độ dài: *The website has been unavailable for one day*.

Tóm lại: *yesterday* trả lời “khi nào?”, *since yesterday* trả lời “bắt đầu từ khi nào?”, còn *for one day* trả lời “trong bao lâu?”. Trước khi chọn, hãy xác định sự việc đã khép lại hay còn nối tới hiện tại.

## Các lỗi thường gặp

- Không dùng *has sent yesterday* khi *yesterday* chỉ thời điểm quá khứ đã khép lại; nói *sent yesterday*.
- Không suy ra mọi câu có *since* đều là hiện tại hoàn thành; *Since the office moved, attendance has improved* có *since* mở mệnh đề chỉ mốc bắt đầu, cần xét từng động từ.
- Đừng nhầm *has been sent* (bị động hiện tại hoàn thành) với *has sent* (chủ động). Chủ ngữ nhận hành động thì đọc [bài câu bị động](/blog/cau-bi-dong-toeic-part-5).

**The company _____ three new branches since January.** (A) opened (B) has opened (C) had opened (D) opening

**Đáp án B.** *Since January* cho biết khoảng thời gian bắt đầu vào tháng Một và kéo dài đến hiện tại, nên dùng *has opened*. *Had opened* cần một mốc quá khứ khác làm điểm nhìn. Ví dụ do TOEIC GYM tự biên soạn.

## Tự kiểm tra

**The manager _____ the contract last Friday.** (A) signs (B) signed (C) has signed (D) signing

**Đáp án B.** *Last Friday* là thời điểm quá khứ đã xác định. Nếu câu nói *The manager has signed the contract; we can proceed now*, hiện tại hoàn thành sẽ hợp vì nhấn vào kết quả hiện tại.

Khi cần diễn tả một quá trình kéo dài đến hiện tại, *has/have been + V-ing* cũng có thể xuất hiện: *They have been working on the update all week*. Nó nhấn vào quá trình hơn là kết quả; hãy đọc [tổng quan thì động từ](/blog/thi-va-dang-dong-tu-toeic) để đặt các dạng vào cùng một hệ thống.`,
  }),
  post({
    slug: "tuong-lai-will-going-to-hien-tai-tiep-dien",
    title: "Tương lai tiếng Anh: will, be going to và hiện tại tiếp diễn",
    excerpt: "Chọn dạng tương lai theo quyết định, dự đoán, dự định và lịch hẹn đã sắp xếp thay vì chỉ thấy từ tomorrow.",
    seoTitle: "Tương lai tiếng Anh: will, going to, hiện tại tiếp diễn",
    seoDescription: "Phân biệt will, be going to, hiện tại tiếp diễn và lịch trình hiện tại đơn khi nói về tương lai; có ví dụ công việc và bài tự kiểm tra.",
    targetTopic: "will going to hiện tại tiếp diễn",
    content: `## Tiếng Anh có nhiều cách nói về tương lai

*Will + V* thường diễn tả quyết định tại lúc nói, lời hứa hoặc dự đoán: *I will call the client now*. *Be going to + V* thường dùng cho ý định đã có hoặc dự đoán dựa trên dấu hiệu hiện tại: *We are going to hire two assistants*. Hiện tại tiếp diễn có thể nói về lịch hẹn cá nhân đã sắp xếp: *We are meeting the supplier on Thursday*. Lịch trình cố định còn có thể dùng hiện tại đơn: *The train leaves at 7 a.m. tomorrow*.

Đây là các xu hướng nghĩa, không phải ranh giới cứng tuyệt đối. *I will meet the supplier on Thursday* vẫn có thể đúng trong ngữ cảnh lời hứa; nếu câu hỏi trắc nghiệm cho nhiều dạng đều hợp, hãy tìm thêm bằng chứng ở phần trước và sau câu.

## Tín hiệu nào thực sự giúp chọn?

- “We have already booked the room” hỗ trợ cách hiểu một cuộc họp đã lên lịch: *We are meeting there on Friday*.
- “Look at those dark clouds” hỗ trợ dự đoán có dấu hiệu: *It is going to rain*.
- “I forgot to send it” và quyết định ngay lúc nói: *I will send it now*.

Trong mệnh đề thời gian với *when, before, after, as soon as*, thường dùng hiện tại đơn để nói sự kiện tương lai: *We will start when the director arrives*, không dùng *when the director will arrive* trong mẫu thông thường. Xem thêm [mệnh đề thời gian](/blog/menh-de-thoi-gian-when-while-before-after).

## Ví dụ kiểu TOEIC

So sánh *The board discusses the policy next Tuesday* (lịch trình) và *The board is discussing the policy next Tuesday* (việc đã sắp xếp). Cả hai có thể đúng tùy ngữ cảnh; không dùng chúng làm hai đáp án đối lập trong một câu chỉ cho phép một lựa chọn.

**Look at the confirmed schedule. The board _____ the new policy next Tuesday.** (A) discussed (B) is discussing (C) had discussed (D) discusses yesterday

**Đáp án B.** Lịch đã xác nhận và các phương án còn lại sai thời gian hoặc cấu trúc. Câu do TOEIC GYM tự biên soạn.

## Tự kiểm tra

**“The client is waiting.” “I _____ call her now.”** (A) will (B) was (C) have (D) had

**Đáp án A.** Người nói quyết định gọi tại thời điểm trả lời. Đừng chỉ nhìn *now*; hãy hiểu ý định của lời nói. [Cambridge Grammar](https://dictionary.cambridge.org/grammar/british-grammar/future) tổng hợp các cách diễn đạt tương lai và sắc thái sử dụng.`,
  }),
  post({
    slug: "dong-tu-khuyet-thieu-can-must-should-may",
    title: "Động từ khuyết thiếu: can, must, should, may và mức độ bắt buộc",
    excerpt: "Hiểu khả năng, lời khuyên, nghĩa vụ và sự cho phép; tránh nhầm must not với do not have to trong email công việc.",
    seoTitle: "Modal verbs can, must, should, may: cách dùng và ví dụ",
    seoDescription: "Học động từ khuyết thiếu can, could, may, might, must, have to, should trong tiếng Anh; phân biệt nghĩa vụ, cấm đoán và lời khuyên qua ví dụ.",
    targetTopic: "động từ khuyết thiếu tiếng Anh",
    content: `## Modal verbs thay đổi nghĩa, không chỉ thay đổi hình thức

Các từ *can, could, may, might, must, should* đứng trước **động từ nguyên mẫu không to**: *You must submit the form*. Không viết *must to submit* hay *must submits*. Khi cần bị động, dùng *modal + be + V3*: *The form must be submitted*; xem [câu bị động TOEIC](/blog/cau-bi-dong-toeic-part-5).

## Chọn theo mức độ và mục đích

- **Can/could:** khả năng, sự cho phép hoặc lời yêu cầu; *Could you send the file?* lịch sự hơn *Can you send the file?*.
- **May/might:** khả năng xảy ra; *The delivery may arrive late*. *May* cũng dùng xin phép trong văn phong trang trọng.
- **Should:** lời khuyên hoặc điều được mong đợi; *You should review the policy*.
- **Must/have to:** nghĩa vụ; *Visitors must wear badges*.

*Must not* là **cấm**: *Visitors must not enter this room*. *Do not have to* là **không cần thiết**: *Visitors do not have to sign again*. Hai câu khác nghĩa hoàn toàn. Trong thông báo công việc, đây là điểm dễ gây hiểu sai quy định.

## Quá khứ và suy đoán

Muốn nói khả năng trong quá khứ, dùng *could* khi phù hợp: *I could read the sign from the entrance*. Với một lần thành công cụ thể, *was able to* thường rõ hơn: *I was able to fix the printer yesterday*. *Must have + V3* có thể diễn tả suy đoán mạnh về quá khứ: *She must have received the email*; nó không phải nghĩa vụ quá khứ.

**Under the mandatory safety policy, employees _____ wear safety glasses in the laboratory.** (A) must (B) might (C) could (D) would

**Đáp án A.** *Mandatory safety policy* xác định đây là nghĩa vụ bắt buộc. *Might* chỉ khả năng; *could* nói khả năng hoặc sự cho phép; *would* không nêu nghĩa vụ hiện tại trong câu này. Ví dụ do TOEIC GYM tự biên soạn.

## Tự kiểm tra

**You _____ print the ticket; showing it on your phone is sufficient.** (A) must not (B) do not have to (C) should not (D) cannot

**Đáp án B.** In vé là việc không bắt buộc, không phải bị cấm. Nếu câu có *if* và một kết quả giả định, học tiếp [câu điều kiện](/blog/cau-dieu-kien-tieng-anh-if-wish). [Cambridge Grammar](https://dictionary.cambridge.org/grammar/british-grammar/modality-meanings-and-uses) giải thích thêm cách modal verbs diễn tả mức độ chắc chắn và nghĩa vụ.`,
  }),
];
