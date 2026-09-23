import type { PostCategory } from "./core";
import type { EditorialPost } from "./editorial";

const publishedAt = new Date("2026-09-23T03:00:00.000Z");
const etsFormat = "https://www.ets.org/toeic/about/listening-reading.html";
const etsSamples = "https://www.ets.org/content/ets-org/language-master/in/home/toeic/test-takers/prepare.html";

type Tip = Pick<EditorialPost, "id" | "slug" | "title" | "excerpt" | "content" | "seoTitle" | "seoDescription" | "coverAlt" | "socialTitle" | "socialDescription" | "targetTopic" | "tags"> & {
  category: PostCategory;
  editorialCover?: string;
};

function tip(input: Tip): EditorialPost {
  return {
    ...input,
    status: "PUBLISHED",
    canonicalPath: `/blog/${input.slug}`,
    coverMediaId: null,
    editorialCover: input.editorialCover ?? `/blog/cover/${input.category.toLowerCase()}`,
    authorName: "TOEICGym Editorial",
    searchIntent: "informational",
    noindex: false,
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    createdBy: "editorial",
    updatedBy: "editorial",
  };
}

export const TOEIC_TIP_POSTS: EditorialPost[] = [
  tip({
    id: "tip-part-1", slug: "meo-lam-toeic-part-1-mo-ta-tranh", category: "LISTENING",
    title: "Mẹo làm TOEIC Part 1: nhìn tranh trước, nghe hành động sau",
    excerpt: "Quy trình quan sát ảnh, loại câu mô tả sai và bài tập 10 phút giúp bạn xử lý Part 1 có căn cứ.",
    seoTitle: "Mẹo làm TOEIC Part 1 mô tả tranh dễ áp dụng",
    seoDescription: "Cách làm TOEIC Part 1: quan sát người, vật, hành động và vị trí; tránh bẫy âm gần giống và luyện với ví dụ tự biên soạn.",
    socialTitle: "Part 1 TOEIC: nhìn gì trước khi nghe?", socialDescription: "Một trình tự ngắn để chọn câu mô tả ảnh bằng bằng chứng.",
    coverAlt: "Bàn học với một bức ảnh tình huống công sở dùng để luyện mô tả tranh TOEIC Part 1",
    editorialCover: "/blog/meo-toeic-part-1.webp", targetTopic: "mẹo làm TOEIC Part 1",
    tags: [{ name: "TOEIC Listening", slug: "toeic-listening" }, { name: "Part 1", slug: "part-1" }],
    content: `## Trước khi audio bắt đầu: quét ảnh theo ba câu hỏi

Part 1 yêu cầu chọn câu mô tả phù hợp nhất với ảnh. Trong vài giây quan sát, tự hỏi: **Ai hoặc vật gì là trọng tâm? Họ đang làm gì? Vật ở đâu so với vật khác?** Đừng tự dựng câu chuyện trước và sau khoảnh khắc trong ảnh; đáp án phải được ảnh hỗ trợ.

Nếu có người, chú ý động từ hành động và tư thế: *is carrying*, *is reaching for*, *is seated*. Nếu ảnh không có người, tìm vị trí đồ vật và trạng thái có thể nhìn thấy: *are stacked*, *is parked beside*. Bạn không cần gọi tên mọi đồ vật; chỉ cần vài chi tiết có khả năng phân biệt bốn câu nghe.

## Khi nghe: kiểm tra cả chủ thể, hành động và vị trí

Một câu có từ vựng đúng bối cảnh vẫn có thể sai ở động từ hoặc giới từ. Thử hình dung ảnh có một người đặt hồ sơ lên kệ. Câu “The woman is taking a folder **off** the shelf” nhắc đúng người và hồ sơ nhưng đảo chiều hành động. Gạch bỏ khi một phần quan trọng mâu thuẫn rõ với ảnh.

Đừng chọn chỉ vì nghe được từ quen hoặc âm gần giống. *Shelf* và *self* có thể gây phân tâm, nhưng quyết định cuối cùng vẫn là câu nào mô tả điều nhìn thấy. Nếu hai câu đều nghe hợp lý, đối chiếu chi tiết cụ thể nhất: số người, vị trí, hành động đang diễn ra hay trạng thái hoàn tất.

## Ví dụ tự luyện trong 30 giây

**Ảnh giả định:** ba chiếc ghế được xếp dọc một bức tường; không có người.

- A. Several chairs are lined up against a wall.
- B. A worker is moving the chairs into a room.
- C. The chairs are surrounding a table.
- D. A wall is being painted.

**Đáp án A.** Ảnh xác nhận được ghế xếp hàng và vị trí sát tường. B và D bịa thêm người hoặc hành động; C đổi quan hệ không gian. Đây là ví dụ TOEICGym tự biên soạn, không phải câu hỏi ETS.

## Bài luyện 10 phút có thể làm ngay

Lấy 6 ảnh trong bộ luyện phù hợp. Trước khi nghe, ghi đúng **ba cụm** cho mỗi ảnh: chủ thể, hành động hoặc trạng thái, vị trí. Nghe một lần ở tốc độ chuẩn rồi chọn đáp án. Khi sửa, ghi lỗi theo nhãn: nghe sai âm, hiểu sai động từ, nhầm giới từ, hoặc suy diễn ngoài ảnh. Sau đó nghe lại câu đúng và tự chỉ vào chi tiết tương ứng trên ảnh.

Nếu sai vì âm, nghe lại cả câu. Nếu sai vì suy diễn, luyện mô tả ảnh bằng điều chắc chắn nhìn thấy. Tránh học thuộc một danh sách “bẫy Part 1” rồi áp dụng máy móc cho mọi ảnh.

## Chuyển sang Part 2

Khi đã biết kiểm tra bằng chứng trong ảnh, hãy áp dụng cùng nguyên tắc cho lời nói: đáp án Part 2 phải **phản hồi đúng ý định câu hỏi**, không chỉ lặp một từ. Xem [mẹo làm TOEIC Part 2](/blog/meo-lam-toeic-part-2-hoi-dap) để luyện tiếp.

**Nguồn đối chiếu:** [ETS mô tả cấu trúc bài Listening & Reading](${etsFormat}) và cung cấp [đề mẫu chính thức](${etsSamples}). Các bước quan sát và ví dụ trên là hướng dẫn luyện tập do TOEICGym biên soạn.`,
  }),
  tip({
    id: "tip-part-2", slug: "meo-lam-toeic-part-2-hoi-dap", category: "LISTENING",
    title: "Mẹo làm TOEIC Part 2: bắt ý định câu hỏi, không săn từ trùng",
    excerpt: "Cách nhận diện câu hỏi, phản hồi gián tiếp và quy trình sửa lỗi khi nghe Part 2 chỉ một lượt.",
    seoTitle: "Mẹo làm TOEIC Part 2 hỏi đáp và ví dụ",
    seoDescription: "Hướng dẫn TOEIC Part 2: nghe từ hỏi và ý định, nhận ra câu trả lời gián tiếp, loại đáp án chỉ lặp âm và luyện 12 câu mỗi ngày.",
    socialTitle: "Part 2 TOEIC: nghe câu hỏi để chọn đúng ý", socialDescription: "Đáp án hợp lý có thể trả lời gián tiếp; hãy kiểm tra mối quan hệ hỏi đáp.",
    coverAlt: "Người học đeo tai nghe luyện phản hồi câu hỏi trong TOEIC Listening Part 2",
    editorialCover: "/blog/meo-toeic-part-2.webp", targetTopic: "mẹo làm TOEIC Part 2",
    tags: [{ name: "TOEIC Listening", slug: "toeic-listening" }, { name: "Part 2", slug: "part-2" }],
    content: `## Nghe đầu câu để biết người nói muốn gì

Part 2 là hỏi đáp ngắn. Trong lần nghe duy nhất, ưu tiên nhận ra câu đang hỏi **ai, khi nào, ở đâu, vì sao, chọn phương án nào** hay đang đề nghị một việc. Từ để hỏi thường giúp định hướng, nhưng đừng dừng ở đó: câu hỏi Yes/No có thể được trả lời bằng lý do hoặc một hành động thay vì “Yes” hay “No”.

Ví dụ tự biên soạn: “Has the invoice been sent?” – “I emailed it this morning.” Đây là câu trả lời có nghĩa “rồi”, dù không nói *yes*. Câu “The office is on the second floor” có thể có từ vựng công sở nhưng không trả lời việc gửi hóa đơn.

## Cách loại hai kiểu nhiễu thường gặp

**Lặp âm hoặc từ trong câu hỏi:** nghe “Where is the *meeting*?” rồi chọn một câu nhắc *meeting* nhưng nói về người chủ trì. Hãy kiểm tra xem câu trả lời có nêu địa điểm, lịch đổi phòng hoặc thông tin hữu ích tương đương hay không.

**Đúng ngữ pháp nhưng sai lượt lời:** “Could you send me the agenda?” có thể được đáp “Sure, after lunch” hoặc “I already sent it.” Câu đáp chỉ mô tả agenda màu xanh không phù hợp với lời đề nghị. Thử đặt hai câu cạnh nhau như một cuộc hội thoại thật.

## Ví dụ 3 lựa chọn

**Question:** “When will the replacement parts arrive?”

- A. The parts are made of steel.
- B. By Thursday afternoon.
- C. I replaced the broken handle.

**Chọn B** vì câu hỏi cần thời điểm. A và C bám theo *parts/replaced* nhưng không cho biết lúc hàng đến. Với câu hỏi “When”, đáp án đôi khi có thể là “The supplier hasn't confirmed yet”; vẫn hợp lý vì người trả lời chưa có thời gian chính xác. Ví dụ do TOEICGym biên soạn, không lấy từ đề ETS.

## Sửa bài theo nguyên nhân, không chỉ chép đáp án

Làm 12 câu ở tốc độ chuẩn. Với câu sai, nghe lại **trước khi** mở transcript và ghi: (1) đã nghe đầu câu thành gì, (2) người hỏi thật sự muốn biết gì, (3) câu đúng phản hồi trực tiếp hay gián tiếp. Chỉ sau đó mở transcript để xác nhận. Nếu sai vì phát âm, nghe và nhại lại cả cặp hỏi đáp; nếu sai vì logic, tự viết thêm một câu đáp sai để thấy điểm khác biệt.

Khi lỡ một câu trong bài thi, chọn phương án tốt nhất hiện có rồi chuyển sang câu mới. Bạn sẽ cần giữ nhịp này ở [Part 3–4, nơi mỗi đoạn có nhiều câu hỏi](/blog/cach-luyen-nghe-toeic-part-3-4).

**Nguồn đối chiếu:** [ETS giới thiệu Part 2 Question-Response](${etsFormat}) và [đề mẫu TOEIC chính thức](${etsSamples}). Chiến thuật cùng ví dụ là nội dung luyện tập của TOEICGym.`,
  }),
  tip({
    id: "tip-part-5", slug: "meo-lam-toeic-part-5-trong-thoi-gian-gioi-han", category: "READING",
    title: "Mẹo làm TOEIC Part 5: tìm tín hiệu quanh chỗ trống",
    excerpt: "Phân biệt câu hỏi loại từ, ngữ pháp và nghĩa; thử quy trình giải nhanh có ví dụ và cách xử lý câu khó.",
    seoTitle: "Mẹo làm TOEIC Part 5: đọc chỗ trống đúng cách",
    seoDescription: "Cách làm TOEIC Part 5 theo tín hiệu quanh chỗ trống: loại từ, động từ, liên từ, từ vựng; ví dụ có giải thích và cách bấm giờ.",
    socialTitle: "Part 5 TOEIC: tìm tín hiệu trước khi chọn đáp án", socialDescription: "Một quy trình ba bước để giải câu điền từ nhanh và chắc hơn.",
    coverAlt: "Bút chì chỉ vào chỗ trống trong bài luyện câu tiếng Anh TOEIC Part 5",
    editorialCover: "/blog/meo-toeic-part-5.webp", targetTopic: "mẹo làm TOEIC Part 5",
    tags: [{ name: "TOEIC Reading", slug: "toeic-reading" }, { name: "Part 5", slug: "part-5" }],
    content: `## Bước 1: nhìn bốn lựa chọn để nhận dạng dạng câu

Nếu bốn lựa chọn cùng gốc từ (*clear, clearly, clarity, clarify*), đây nhiều khả năng là câu **loại từ**. Nếu là các thì của cùng một động từ, kiểm tra chủ ngữ và mốc thời gian. Nếu là bốn từ khác nghĩa, bạn thường phải đọc cả câu để hiểu ngữ cảnh. Nhận dạng trước giúp bạn biết cần đọc rộng đến đâu; đừng mặc định chỉ nhìn hai từ sát chỗ trống.

## Bước 2: xác nhận bằng cấu trúc, rồi mới xét nghĩa

Ví dụ tự biên soạn: “The manager gave a ___ explanation of the policy.” Trong cụm *a ___ explanation*, chỗ trống bổ nghĩa cho danh từ *explanation*, nên cần tính từ **clear**. *Clearly* là trạng từ; *clarity* là danh từ; *clarify* là động từ.

Với câu “The forms must be submitted ___ Friday”, chỉ nhìn sau chỗ trống chưa đủ. Đọc toàn câu để hiểu hạn chót, rồi cân nhắc giới từ chỉ thời hạn như *by*. Mẹo loại từ không thay thế việc hiểu nghĩa, nhất là khi đáp án đều cùng từ loại.

## Bước 3: chốt câu có bằng chứng; đánh dấu câu chưa chắc

Nếu không thấy tín hiệu sau một lượt đọc có chủ đích, loại lựa chọn chắc chắn sai rồi chọn phương án tốt nhất theo khung thời gian bạn đã tập. Đừng để một câu khó lấy mất thời gian của cả đoạn Part 7. [Khung 75 phút Reading](/blog/quan-ly-thoi-gian-toeic-reading-75-phut) gợi ý mốc 12 phút cho Part 5 như một điểm bắt đầu để thử, không phải quy định của ETS.

## Bài luyện 15 phút

Làm 10 câu hỗn hợp và tự ghi ký hiệu bên cạnh mỗi câu: **F** (form/loại từ), **G** (grammar), **V** (vocabulary/ngữ cảnh). Sau khi chấm, ghi câu sai cùng **tín hiệu quyết định**; chẳng hạn “a + adjective + noun” hoặc “by + deadline”. Hai ngày sau làm lại các câu sai mà không nhìn ghi chú. Nếu làm đúng nhưng vẫn không giải thích được, giữ câu đó trong sổ lỗi.

Để học phần nền, xem [7 chủ điểm ngữ pháp Part 5](/blog/ngu-phap-toeic-part-5-can-hoc). Bài đó giúp chọn kiến thức cần ôn; bài này tập trung vào trình tự quyết định trong lúc làm bài.

**Nguồn đối chiếu:** [ETS xác nhận Part 5 là Incomplete Sentences](${etsFormat}) và có [đề mẫu](${etsSamples}). Ví dụ và mốc luyện tập do TOEICGym biên soạn.`,
  }),
  tip({
    id: "tip-part-6", slug: "meo-lam-toeic-part-6-dien-doan-van", category: "READING",
    title: "Mẹo làm TOEIC Part 6: đọc cả đoạn trước khi điền câu",
    excerpt: "Cách dùng ngữ cảnh trước sau, đại từ và mạch thời gian để xử lý câu điền từ hoặc điền câu Part 6.",
    seoTitle: "Mẹo làm TOEIC Part 6 điền đoạn văn có ví dụ",
    seoDescription: "Làm TOEIC Part 6 bằng cách xác định mục đích văn bản, đọc hai phía chỗ trống và kiểm tra mạch ý; có ví dụ và bài luyện ngắn.",
    socialTitle: "Part 6 TOEIC: đừng bỏ qua câu phía sau", socialDescription: "Cách tìm bằng chứng cho từ và câu còn thiếu trong văn bản.",
    coverAlt: "Ảnh bìa chủ đề TOEIC Reading cho bài hướng dẫn Part 6",
    targetTopic: "mẹo làm TOEIC Part 6",
    tags: [{ name: "TOEIC Reading", slug: "toeic-reading" }, { name: "Part 6", slug: "part-6" }],
    content: `## Đọc mở đầu để biết văn bản đang làm gì

Part 6 đặt chỗ trống trong văn bản như email, thông báo hoặc bài viết ngắn. Trước khi nhìn đáp án, đọc dòng mở đầu và xác định: người viết thông báo, xin lỗi, hướng dẫn hay đề nghị? Mục đích này giúp loại câu chèn lệch chủ đề.

## Kiểm tra hai phía của mỗi chỗ trống

Với **loại từ hoặc ngữ pháp**, nhìn cấu trúc câu chứa chỗ trống. Với **từ vựng**, đọc cả câu và câu kề bên. Với **câu còn thiếu**, đọc ít nhất câu trước và câu sau; kiểm tra đại từ như *it/they/this*, từ nối và mốc thời gian. Một câu nghe hay riêng lẻ vẫn sai nếu làm đứt mạch đoạn văn.

Ví dụ tự biên soạn: “The meeting has moved to Friday. ___. Please update your calendar before noon.” Câu phù hợp có thể là “The new room number is listed in the revised invitation.” Nó nối thông báo đổi lịch với yêu cầu cập nhật lịch. Câu “Our office sells several kinds of chairs” đúng ngữ pháp nhưng lạc chủ đề.

## Quy trình ba lượt trên một đoạn

**Lượt 1:** đọc mở đầu và lướt toàn đoạn để biết chủ đề. **Lượt 2:** giải câu có tín hiệu tại chỗ, sau đó giải câu cần mạch ý. **Lượt 3:** đọc lại đoạn đã điền, kiểm tra thì, đại từ, quan hệ nguyên nhân – kết quả và giọng văn. Nếu một đáp án buộc bạn tự tưởng tượng thêm thông tin không có trong đoạn, cần xem lại.

Đừng đọc toàn bộ bốn đáp án của mọi chỗ trống ngay từ đầu; dễ khiến bạn giữ nhiều phương án không liên quan trong đầu. Làm từng chỗ nhưng luôn đối chiếu mạch chung.

## Bài luyện 12 phút

Chọn một đoạn Part 6, bấm giờ theo tốc độ hiện tại. Với mỗi đáp án, gạch đúng **câu trước hoặc sau** tạo ra bằng chứng. Khi sửa, phân nhóm lỗi: ngữ pháp tại câu, từ vựng theo ngữ cảnh, hay liên kết ý. Sau đó thử [quy trình Part 5](/blog/meo-lam-toeic-part-5-trong-thoi-gian-gioi-han) với lỗi ngữ pháp và [cách đọc Part 7](/blog/meo-lam-toeic-part-7-doc-hieu-nhieu-van-ban) với lỗi hiểu văn bản.

**Nguồn đối chiếu:** [ETS liệt kê Part 6 Text Completion trong Reading](${etsFormat}) và cung cấp [đề mẫu chính thức](${etsSamples}). Ví dụ, quy trình và mốc luyện là gợi ý của TOEICGym.`,
  }),
  tip({
    id: "tip-part-7", slug: "meo-lam-toeic-part-7-doc-hieu-nhieu-van-ban", category: "READING",
    title: "Mẹo làm TOEIC Part 7: tìm bằng chứng trong một hoặc nhiều văn bản",
    excerpt: "Đọc câu hỏi theo mục tiêu, tìm thông tin và đối chiếu nhiều tài liệu mà không phải đọc đi đọc lại toàn bộ.",
    seoTitle: "Mẹo làm TOEIC Part 7 đọc hiểu và đối chiếu văn bản",
    seoDescription: "Chiến thuật TOEIC Part 7: phân loại câu hỏi, tìm bằng chứng, nhận ra diễn đạt lại và nối thông tin giữa email, lịch hay thông báo.",
    socialTitle: "Part 7 TOEIC: tìm đúng đoạn, nối đúng ý", socialDescription: "Một cách đọc có mục tiêu cho bài đơn, đôi và nhiều văn bản.",
    coverAlt: "Ảnh bìa chủ đề TOEIC Reading cho bài hướng dẫn Part 7",
    targetTopic: "mẹo làm TOEIC Part 7",
    tags: [{ name: "TOEIC Reading", slug: "toeic-reading" }, { name: "Part 7", slug: "part-7" }],
    content: `## Bắt đầu từ câu hỏi, nhưng vẫn xem văn bản là gì

Nhìn nhanh loại tài liệu, người gửi, người nhận, tiêu đề và ngày tháng. Sau đó đọc câu hỏi để biết cần tìm **ý chính**, **chi tiết**, **suy luận** hay **liên kết hai văn bản**. Đọc câu hỏi trước không có nghĩa bỏ qua ngữ cảnh; nếu chỉ săn đúng một từ khóa, bạn dễ chọn câu chứa từ giống nhưng diễn đạt ý khác.

## Tìm vị trí rồi đọc đủ ngữ cảnh

Với câu chi tiết, dùng tên người, ngày, địa điểm hoặc số tiền làm điểm neo. Khi tìm thấy, đọc cả câu và câu sát bên để kiểm tra điều kiện, phủ định hoặc sự thay đổi lịch. Với câu ý chính, đọc tiêu đề, phần mở đầu và kết thúc. Với câu suy luận, hỏi “văn bản cho phép kết luận gì?” thay vì dựa vào kiến thức ngoài đề.

Ví dụ tự biên soạn: email nói “The workshop has been moved from Tuesday to Thursday”; lịch đính kèm ghi “Room B, Thursday, 2 p.m.” Nếu hỏi **buổi hội thảo hiện diễn ra khi nào và ở đâu**, phải nối hai nguồn thành “Thursday at 2 p.m. in Room B”. Đáp án “Tuesday in Room B” trộn thông tin cũ với thông tin mới.

## Bài đôi và nhiều văn bản: vẽ quan hệ đơn giản

Ghi nhớ một dòng ngắn: **ai – việc gì – thay đổi gì – văn bản nào xác nhận**. Làm câu chỉ cần một tài liệu trước nếu đã thấy bằng chứng; dành câu nối thông tin cho lúc đã hiểu cả hai tài liệu. Với đáp án có từ đồng nghĩa, chứng minh bằng ý: *postponed* có thể được diễn đạt là *rescheduled for a later date*, nhưng phải kiểm tra ngày mới thực sự muộn hơn.

Nếu bạn đọc một đoạn ba lần mà vẫn không thấy bằng chứng, chuyển sang câu tiếp theo rồi quay lại khi còn thời gian. Khung [chia 75 phút Reading](/blog/quan-ly-thoi-gian-toeic-reading-75-phut) giúp bạn giữ đủ thời gian cho cụm văn bản cuối.

## Bài luyện 20 phút

Làm một cụm bài đơn và một cụm nhiều văn bản. Sau mỗi câu, đánh dấu **dòng chứa bằng chứng**; nếu câu phải nối hai văn bản, đánh dấu cả hai nơi. Khi chấm, phân biệt “không tìm thấy vị trí” với “tìm thấy nhưng hiểu sai paraphrase”. Loại đầu cần luyện quét mốc thông tin; loại sau cần luyện diễn đạt lại bằng một câu tiếng Việt ngắn.

Đừng học thuộc “vị trí đáp án thường nằm ở đâu”; vị trí thay đổi theo tài liệu. Kỹ năng bền hơn là truy vết bằng chứng và kiểm tra thời gian, người, điều kiện.

**Nguồn đối chiếu:** [ETS giới thiệu Part 7 Reading Comprehension](${etsFormat}) và có [đề mẫu](${etsSamples}). Tình huống cùng quy trình trên do TOEICGym biên soạn.`,
  }),
];
