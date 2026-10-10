import type { PostCategory } from "./core";
import type { EditorialPost } from "./editorial";

const publishedAt = new Date("2026-09-23T03:00:00.000Z");
const etsFormat = "https://www.ets.org/toeic/about/listening-reading.html";
const etsSamples = "https://www.ets.org/content/ets-org/language-master/in/home/toeic/test-takers/prepare.html";

type Tip = Pick<EditorialPost, "id" | "slug" | "title" | "excerpt" | "content" | "seoTitle" | "seoDescription" | "coverAlt" | "socialTitle" | "socialDescription" | "targetTopic" | "tags"> & {
  category: PostCategory;
  editorialCover?: string;
  revisedAt?: Date;
};

function tip(input: Tip): EditorialPost {
  const { revisedAt, ...content } = input;
  return {
    ...content,
    status: "PUBLISHED",
    canonicalPath: `/blog/${input.slug}`,
    coverMediaId: null,
    editorialCover: input.editorialCover ?? `/blog/cover/${input.category.toLowerCase()}`,
    authorName: "TOEIC GYM Editorial",
    searchIntent: "informational",
    noindex: false,
    publishedAt,
    createdAt: publishedAt,
    updatedAt: revisedAt ?? publishedAt,
    createdBy: "editorial",
    updatedBy: "editorial",
  };
}

export const TOEIC_TIP_POSTS: EditorialPost[] = [
  tip({
    id: "tip-part-1", slug: "meo-lam-toeic-part-1-mo-ta-tranh", category: "LISTENING",
    revisedAt: new Date("2026-10-10T10:00:00.000Z"),
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

**Đáp án A.** Ảnh xác nhận được ghế xếp hàng và vị trí sát tường. B và D bịa thêm người hoặc hành động; C đổi quan hệ không gian. Đây là ví dụ TOEIC GYM tự biên soạn, không phải câu hỏi ETS.

## Bài luyện 10 phút có thể làm ngay

Lấy 6 ảnh trong bộ luyện phù hợp. Trước khi nghe, ghi đúng **ba cụm** cho mỗi ảnh: chủ thể, hành động hoặc trạng thái, vị trí. Nghe một lần ở tốc độ chuẩn rồi chọn đáp án. Khi sửa, ghi lỗi theo nhãn: nghe sai âm, hiểu sai động từ, nhầm giới từ, hoặc suy diễn ngoài ảnh. Sau đó nghe lại câu đúng và tự chỉ vào chi tiết tương ứng trên ảnh.

Nếu sai vì âm, nghe lại cả câu. Nếu sai vì suy diễn, luyện mô tả ảnh bằng điều chắc chắn nhìn thấy. Tránh học thuộc một danh sách “bẫy Part 1” rồi áp dụng máy móc cho mọi ảnh.

## Tranh có người: động từ phải khớp đúng khoảnh khắc

Với tranh có người, tạo nhanh ba dự đoán: chủ thể, hành động và vật/địa điểm liên quan. Ví dụ một phụ nữ đang đưa tập hồ sơ cho đồng nghiệp: *a woman — is handing — some documents to a colleague*. Khi audio chạy, kiểm tra đủ cả ba phần. Câu nhắc đúng documents nhưng nói *is filing* vẫn sai hành động; câu nói *a man is handing* sai chủ thể.

Phân biệt hành động nhìn thấy với ý định suy đoán. Một người đứng cạnh cửa không chứng minh họ *are about to leave*. Một người cầm điện thoại không chắc *is making a reservation*. Chỉ chọn điều ảnh xác nhận: *is holding a phone*, *is standing near a doorway*.

Số lượng cũng có thể là bẫy. Nếu hai người cùng nâng một hộp, *A man is lifting a box* chưa mô tả đủ chủ thể như *Two people are carrying a box together*. Đừng bỏ qua *a person, several workers, one of the men* ở đầu câu vì danh từ này quyết định phạm vi mô tả.

### Ví dụ tranh người tự biên soạn

**Ảnh giả định:** một nhân viên nữ đang đặt khay lên quầy; một khách hàng đứng phía đối diện.

- A. A customer is removing a tray from a shelf.
- B. An employee is placing a tray on a counter.
- C. Two people are cleaning the counter.
- D. Some food is being served at a table.

**Đáp án B.** *Employee* đúng người, *is placing* đúng hành động đang diễn ra và *on a counter* đúng vị trí. A đảo người, hành động và vị trí; C bịa hành động cleaning; D dùng ngữ cảnh nhà hàng nghe hợp lý nhưng ảnh không có bàn hay hành động phục vụ đồ ăn.

## Tranh không có người: ưu tiên trạng thái và vị trí

Khi không có người, đừng cố tìm hành động. Quan sát vật chính, cách sắp xếp, hướng, số lượng và quan hệ không gian. Các câu đúng thường dùng bị động/trạng thái như *chairs are arranged in rows*, *boxes are stacked near a doorway*, *a bicycle is leaning against a fence*.

Một động từ bị động không đồng nghĩa ảnh có hành động đang diễn ra. **The chairs are arranged in a circle** mô tả trạng thái hiện tại. **The chairs are being arranged** yêu cầu nhìn thấy ai đó đang sắp xếp chúng hoặc có bằng chứng rõ của quá trình. Đây là khác biệt quan trọng giữa **are + V3** trong mô tả trạng thái và **are being + V3** trong hành động đang xảy ra.

### Ví dụ tranh vật tự biên soạn

**Ảnh giả định:** bốn thùng hàng đã được xếp cạnh một cánh cửa đóng; không có người.

- A. Some boxes are stacked beside a door.
- B. A delivery worker is opening the boxes.
- C. The boxes are being carried through a doorway.
- D. A door has been placed on top of the boxes.

**Đáp án A.** Ảnh hỗ trợ trạng thái *are stacked* và vị trí *beside*. B và C thêm người/hành động không có; D đảo quan hệ vị trí. Khi chữa, hãy chỉ vào bằng chứng trong ảnh cho từng cụm của câu đúng.

## Bốn nhóm giới từ vị trí cần hiểu bằng hình

Học giới từ bằng cặp vật, không bằng bản dịch đơn lẻ:

- **next to / beside / near:** ở cạnh hoặc gần, nhưng *near* không nhất thiết sát nhau.
- **in front of / behind:** xác định theo chiều nhìn và vật mốc; tránh đảo foreground với background.
- **against / along:** *against a wall* là tựa/sát tường; *along a wall* là phân bố theo chiều dài tường.
- **above / below / over / under:** kiểm tra tương quan dọc; *over* đôi khi có nghĩa phủ hoặc bắc qua, không chỉ “ở trên”.

Để luyện, lấy một ảnh và tự tạo hai câu chỉ khác một giới từ: *A lamp is above the desk* / *A lamp is under the desk*. Chỉ giữ câu ảnh chứng minh được. Cách đối lập này tạo liên kết trực tiếp giữa âm, nghĩa và vị trí.

Nếu thường nghe nhầm giới từ ngắn trong dòng nói, luyện [connected speech](/blog/noi-am-tieng-anh-cach-nghe-connected-speech) với cả cụm thay vì nghe riêng *at, in, on*.

## Bẫy đúng danh từ nhưng sai quan hệ

Phương án nhiễu thường lấy vật nổi bật trong ảnh rồi đổi một thành phần:

- **Sai hành động:** có bicycle nhưng nó *is parked*, không *is being repaired*.
- **Sai hướng:** người đang lấy vật khỏi kệ nhưng audio nói đặt vật lên kệ.
- **Sai trạng thái:** cửa đang mở nhưng câu nói *is being opened* dù không có người.
- **Sai vị trí:** cây đúng là có trong ảnh nhưng ở behind the building, không beside it.
- **Thêm chi tiết không nhìn thấy:** suy ra nghề nghiệp, mục đích hoặc sự kiện trước/sau ảnh.

Quy tắc loại là tìm **một mâu thuẫn quan trọng**, không cần dịch hoàn hảo cả câu. Tuy nhiên, đừng loại chỉ vì câu không mô tả vật bạn chú ý đầu tiên; đáp án đúng có thể nói một chi tiết khác vẫn rõ trong ảnh.

## Bẫy âm gần giống: kiểm tra nghĩa sau khi nhận ra âm

Các cặp *walking/working*, *copying/coffee*, *files/tiles* có thể kéo chú ý, nhưng âm giống không quyết định đáp án. Sau khi nghe một từ quen, hỏi ngay: chủ thể có thực hiện hành động đó không và phần còn lại có khớp không?

Ví dụ ảnh có người đang đi cạnh xe đẩy. Nghe được *cart* trong “Some cartons are stacked by a wall” không làm câu đúng nếu ảnh không có cartons hay wall. Ngược lại, câu đúng có thể dùng *trolley* thay cho từ *cart* bạn dự đoán. Luyện nhận paraphrase và đồng nghĩa, không chờ đúng từ đã nghĩ trước.

Nếu sai do âm, chép riêng cụm quyết định, tra cách phát âm, nghe lại trong câu rồi tạo một cặp đối lập. [Cách tra trọng âm từ](/blog/trong-am-tu-tieng-anh-quy-tac-cach-tra) và [âm cuối](/blog/am-cuoi-tieng-anh-cach-phat-am-khong-them-am) hỗ trợ khi lỗi nằm ở hình thức âm chứ không phải bằng chứng ảnh.

## Ví dụ tổng hợp: mỗi lựa chọn sai ở đâu?

**Ảnh giả định:** một người đàn ông ngồi ở bàn ngoài trời, nhìn vào laptop; chiếc xe đạp tựa vào hàng rào phía sau.

- A. A man is closing a laptop computer.
- B. A man is seated at an outdoor table.
- C. A bicycle is being ridden along a fence.
- D. Some tables are being carried indoors.

**Đáp án B.** *Is seated* mô tả đúng tư thế và *at an outdoor table* đúng bối cảnh. A thêm hành động closing không nhìn thấy. C có bicycle và fence nhưng biến trạng thái *leaning/parked* thành hành động có người lái. D lấy tables thật trong ảnh rồi bịa hành động bị động tiếp diễn.

Đây là cách review nên làm: không ghi “B đúng” rồi thôi; ghi **A sai động từ, C sai trạng thái, D thêm hành động**. Sau vài buổi, bảng lỗi sẽ cho biết bạn cần học động từ, vị trí hay cách giới hạn suy luận.

## Quy trình 15 giây cho từng bức tranh

**Trước audio:** nhìn tổng thể, chọn 2–3 chi tiết phân biệt và dự đoán vài cụm đơn giản. **Trong audio:** đánh giá từng câu theo chủ thể–hành động/trạng thái–vị trí; loại khi có mâu thuẫn rõ. **Sau câu D:** chọn phương án được ảnh hỗ trợ đầy đủ nhất và chuyển mắt sang ảnh tiếp theo.

Không cố giữ cả bốn câu trong trí nhớ dưới dạng nguyên văn. Có thể dùng ba nhãn trong đầu: ✓ được ảnh hỗ trợ, × mâu thuẫn, ? chưa chắc. Khi nghe xong, so các phương án chưa bị loại. Nếu lỡ một câu, không để nó làm mất thời gian quan sát ảnh sau.

Luyện quy trình bằng [bài TOEIC Part 1 có ảnh, audio và transcript](/toeic/part-1). Lượt đầu không mở transcript; lượt chữa mới đối chiếu từng cụm với ảnh.

## Cách review một câu đúng do đoán

Câu đúng do đoán vẫn là một lỗ hổng. Ghi lại lựa chọn đã phân vân, cụm âm không nhận ra và chi tiết ảnh giúp quyết định. Nghe lại một lần không transcript; nếu vẫn không phân biệt, mở chữ, khoanh cụm rồi đóng lại và nghe toàn câu.

Sau đó tự mô tả ảnh bằng một câu khác vẫn đúng. Nếu đáp án là *Some chairs are lined up against a wall*, bạn có thể tạo *Several seats have been arranged along one side of the room*. Bài tự tạo kiểm tra bạn hiểu quan hệ ảnh–ngôn ngữ, không chỉ thuộc recording.

Dùng [sổ review lỗi TOEIC](/blog/cach-review-loi-sai-toeic) để giữ bốn trường: đã chọn gì, bằng chứng ảnh, cụm audio quyết định và lần sau quan sát gì trước.

## Kế hoạch luyện Part 1 trong bảy ngày

- **Ngày 1:** tranh một người, tập chủ thể và động từ hiện tại tiếp diễn.
- **Ngày 2:** tranh nhiều người, tập số lượng và hành động thuộc đúng người.
- **Ngày 3:** tranh vật/cảnh, tập trạng thái bị động và cách sắp xếp.
- **Ngày 4:** giới từ vị trí bằng các cặp vật.
- **Ngày 5:** bẫy đảo chiều, sai chủ thể và thêm chi tiết.
- **Ngày 6:** nhóm sáu ảnh mới, nghe liên tục như một lượt thi.
- **Ngày 7:** làm nhóm mới khác, so lỗi lặp lại và chọn một trọng tâm tuần sau.

Mỗi ngày 15–20 phút đủ nếu có review. Đừng làm lại cùng sáu ảnh để chứng minh tiến bộ; dùng ảnh và audio mới. Điểm cần theo dõi là số câu mới bạn giải thích được bằng bằng chứng, không phải số lần nghe thuộc một recording.

## Chuyển sang Part 2

Khi đã biết kiểm tra bằng chứng trong ảnh, hãy áp dụng cùng nguyên tắc cho lời nói: đáp án Part 2 phải **phản hồi đúng ý định câu hỏi**, không chỉ lặp một từ. Xem [mẹo làm TOEIC Part 2](/blog/meo-lam-toeic-part-2-hoi-dap) và [bảy mẫu trả lời gián tiếp](/blog/toeic-part-2-cau-tra-loi-gian-tiep) để luyện tiếp.

**Nguồn đối chiếu:** [ETS mô tả cấu trúc bài Listening & Reading](${etsFormat}) và cung cấp [đề mẫu chính thức](${etsSamples}). Các bước quan sát và ví dụ trên là hướng dẫn luyện tập do TOEIC GYM biên soạn.`,
  }),
  tip({
    id: "tip-part-2", slug: "meo-lam-toeic-part-2-hoi-dap", category: "LISTENING",
    revisedAt: new Date("2026-10-10T16:00:00.000Z"),
    title: "Mẹo làm TOEIC Part 2: nhận diện 7 dạng hỏi đáp và bẫy nghe",
    excerpt: "Nhận diện câu hỏi WH, Yes/No, lựa chọn, đề nghị và phản hồi gián tiếp; kèm ví dụ, bẫy nghe và quy trình review Part 2.",
    seoTitle: "Mẹo làm TOEIC Part 2: 7 dạng câu hỏi và bẫy",
    seoDescription: "Cách làm TOEIC Part 2 theo 7 dạng hỏi đáp, nhận ra câu trả lời gián tiếp, bẫy âm gần giống và luyện bằng ví dụ tự biên soạn có lời giải.",
    socialTitle: "Part 2 TOEIC: nghe câu hỏi để chọn đúng ý", socialDescription: "Đáp án hợp lý có thể trả lời gián tiếp; hãy kiểm tra mối quan hệ hỏi đáp.",
    coverAlt: "Người học đeo tai nghe luyện phản hồi câu hỏi trong TOEIC Listening Part 2",
    editorialCover: "/blog/meo-toeic-part-2.webp", targetTopic: "mẹo làm TOEIC Part 2",
    tags: [{ name: "TOEIC Listening", slug: "toeic-listening" }, { name: "Part 2", slug: "part-2" }],
    content: `## Part 2 kiểm tra khả năng phản hồi, không chỉ kiểm tra từ để hỏi

Trong Part 2 Question–Response, bạn nghe một câu hỏi hoặc phát biểu rồi chọn phản hồi phù hợp nhất trong ba lựa chọn được đọc. Theo cấu trúc TOEIC Listening & Reading hiện hành, Part 2 có 25 câu. Câu hỏi và lựa chọn không được in đầy đủ để bạn đọc trước, vì vậy kỹ năng cốt lõi là giữ được **ý định giao tiếp** trong trí nhớ ngắn hạn.

Nghe được *when* hay *where* là điểm khởi đầu, chưa phải đáp án. Bạn cần xác định người nói đang muốn biết thời gian, địa điểm, người phụ trách, lý do, lựa chọn hay đang yêu cầu một hành động. Sau đó kiểm tra câu đáp có làm lượt hội thoại tiến lên hay không.

Hãy thử [bài nghe TOEIC Part 2 có audio, transcript và lời giải](/toeic/part-2) trước. Các ví dụ trong bài này do TOEIC GYM tự biên soạn, không lấy từ câu hỏi ETS.

## Mô hình ba bước: hình thức, ý định, phản hồi

**Hình thức** là phần bạn nghe được ở đầu câu: *who, when, where, why, how, do, has, would, which*. **Ý định** là thông tin hoặc hành động người nói thực sự cần. **Phản hồi** là câu trả lời hợp lý trong tình huống đó, có thể trực tiếp hoặc gián tiếp.

Ví dụ: “Has the invoice been sent?” có hình thức Yes/No, ý định là kiểm tra trạng thái hóa đơn. “I emailed it this morning” là phản hồi hợp lý vì xác nhận việc đã hoàn tất dù không nói *yes*. “The invoice has three pages” nhắc đúng danh từ nhưng không giải quyết ý định.

Khi nghe xong câu đầu, hãy tự nói thầm một nhãn rất ngắn như **cần thời gian**, **cần người**, **yêu cầu gửi**, **chọn A hay B**. Nhãn này giúp bạn đánh giá ba câu đáp theo chức năng thay vì chạy theo từ trùng.

## Dạng 1: Who, where và when

Với **Who**, đáp án có thể là tên, chức vụ, phòng ban hoặc chỉ dẫn tới người biết. “Who approved the travel request?” có thể nhận “The regional manager did” hoặc “You should ask Ms. Chen.” Câu thứ hai không nêu người phê duyệt trực tiếp nhưng vẫn dẫn tới nguồn thông tin phù hợp.

Với **Where**, đừng chỉ chờ một giới từ địa điểm. “Where should I leave these packages?” có thể được đáp “The receiving clerk will show you.” Người nghe chưa có địa điểm cụ thể nhưng được chuyển tới người có thể hướng dẫn.

Với **When**, đáp án có thể là giờ, ngày, một mốc sự kiện hoặc thông tin chưa được xác nhận: “After the inspection,” “By Friday,” “The supplier hasn't decided yet.” Lựa chọn lặp từ trong câu hỏi nhưng mô tả vật thể thường là nhiễu.

Ví dụ tự biên soạn: “When will the replacement parts arrive?” (A) The parts are made of steel (B) By Thursday afternoon (C) I replaced the handle. Chọn **B** vì nó cung cấp mốc thời gian; A và C chỉ bám theo *parts/replaced*.

## Dạng 2: What, why và how

**What** có phạm vi rộng. Nghe tiếp danh từ hoặc động từ sau *what*: *What time, What kind, What should, What happened*. “What should we include in the report?” cần nội dung hoặc một người có thể quyết định, không phải giờ nộp.

**Why** thường nhận lý do, mục đích, lời sửa giả định hoặc thông tin cho thấy nguyên nhân chưa biết. “Why was the seminar canceled?” – “It wasn't canceled; it moved online.” Phản hồi này đúng vì sửa tiền đề sai trong câu hỏi.

**How** có thể hỏi cách thức, tình trạng, số lượng, thời gian kéo dài hoặc mức độ thường xuyên. “How did you get to the branch office?” cần phương tiện hoặc cách di chuyển; “How long will the repair take?” cần khoảng thời gian. Đừng gom mọi câu *how* vào một nhóm nghĩa.

Một thói quen hữu ích là giữ cả cụm hỏi thay vì một từ: **how many → số lượng**, **how often → tần suất**, **how soon → bao lâu nữa**, **how was → đánh giá/tình trạng**.

## Dạng 3: câu hỏi Yes/No

Câu hỏi mở đầu bằng trợ động từ hoặc động từ *be* thường không buộc đáp án phải có *yes/no*. Ba kiểu phản hồi gián tiếp phổ biến là nêu bằng chứng, nêu trở ngại và báo trạng thái.

- “Did Mina reserve the meeting room?” – “Her name is on the schedule.”
- “Can you join the site visit?” – “I have a client call all afternoon.”
- “Is the printer working again?” – “The technician is still upstairs.”

Ở ví dụ thứ hai, lịch gọi khách hàng là lời từ chối gián tiếp. Ở ví dụ thứ ba, câu trả lời không khẳng định trực tiếp; nó cho thấy việc sửa có thể chưa hoàn tất. Hãy chọn điều người nói **hàm ý an toàn**, không đẩy kết luận xa hơn dữ kiện.

Đọc thêm [bảy mẫu câu trả lời gián tiếp Part 2](/blog/toeic-part-2-cau-tra-loi-gian-tiep) để luyện phản hồi theo chức năng thay vì học thuộc câu riêng lẻ.

## Dạng 4: câu hỏi lựa chọn

Câu hỏi có *or* thường yêu cầu chọn một trong hai phương án, nhưng đáp án vẫn có thể đưa ra lựa chọn thứ ba, nói cả hai đều phù hợp hoặc cho biết quyết định thuộc về người khác.

“Should we meet on Tuesday or Wednesday?” có thể được đáp “Wednesday works better,” “Either day is fine,” hoặc “Let's ask the project manager.” Câu “Yes, we should” không cho biết chọn ngày nào nên kém phù hợp.

Bẫy quan trọng là không nghe được vế sau *or*. Nếu chỉ giữ *Tuesday*, bạn dễ chọn câu có Tuesday dù người nói thực sự so sánh hai lịch. Trong lúc luyện, nhại lại cả cụm **A or B** để giữ cấu trúc lựa chọn.

## Dạng 5: yêu cầu, đề nghị và lời mời

Những câu như *Could you, Would you, Would you like, Why don't we, Let's* kiểm tra hành động giao tiếp chứ không chỉ cấu trúc câu hỏi.

“Could you send the revised agenda?” có thể nhận “I'll do it after lunch,” “It's already in your inbox,” hoặc “Marco has the latest version.” Ba câu lần lượt là chấp nhận, báo việc đã hoàn tất và chuyển sang người có tài liệu.

“Would you like me to call the supplier?” – “That would be helpful” là nhận đề nghị. “Why don't we move the display closer to the entrance?” – “Good idea” là đồng ý với gợi ý. Nếu chỉ săn danh từ *supplier/display*, bạn có thể bỏ lỡ chức năng mời hoặc đề xuất.

## Dạng 6: câu phát biểu và câu hỏi đuôi

Part 2 có thể bắt đầu bằng một phát biểu: “The conference room is still locked.” Phản hồi phù hợp có thể là giải pháp, lời giải thích hoặc hành động: “I'll ask security to open it.” Câu đáp không cần lặp lại thông tin căn phòng bị khóa.

Với câu hỏi đuôi như “The shipment arrived this morning, didn't it?”, trọng tâm là kiểm tra hoặc xác nhận thông tin. Phản hồi “I haven't checked the loading area yet” hợp lý vì người nói chưa thể xác nhận. Đừng quyết định chỉ bằng phần đuôi khẳng định/phủ định; hãy giữ nội dung chính trước dấu phẩy.

Câu phủ định như “Haven't the invitations been printed?” có thể thể hiện ngạc nhiên hoặc kiểm tra trạng thái. Đáp án “The design was approved only yesterday” giải thích vì sao việc in chưa hoàn tất.

## Dạng 7: sửa giả định và trả lời gián tiếp

Một câu hỏi có thể chứa tiền đề không đúng. “Why is Ms. Patel leading today's tour?” – “Actually, Mr. Kim is leading it.” Đây không phải né câu hỏi; người đáp sửa thông tin sai nên không cần đưa lý do về Ms. Patel.

Các mẫu gián tiếp khác gồm **chưa chốt** (“The schedule hasn't been posted”), **người khác biết** (“Ask the facilities manager”), **việc đã xong** (“I sent it yesterday”), **xung đột lịch** (“That's when my train leaves”) và **đề xuất thay thế** (“The smaller room is available”).

Khi review, đặt nhãn chức năng cho câu đúng. Nếu chỉ ghi “đáp án A”, bạn sẽ khó nhận ra cùng một logic khi từ vựng thay đổi.

## Sáu bẫy nghe cần loại bằng logic

**Lặp từ:** câu hỏi có *meeting*, đáp án nhiễu cũng có *meeting* nhưng không trả lời ai, khi nào hay ở đâu.

**Âm gần giống:** *price/prize, file/fill, report/resort* kéo sự chú ý khỏi ý định. Một âm giống không tạo thành lượt lời hợp lý.

**Sai người hoặc đại từ:** câu hỏi về *you* nhưng đáp án nói việc một người khác đã làm mà không liên quan.

**Sai thời gian:** câu hỏi về kế hoạch ngày mai, đáp án chỉ kể một việc đã kết thúc tuần trước.

**Đúng chủ đề, sai chức năng:** lời đề nghị cần chấp nhận, từ chối hoặc xử lý; một mô tả chung về đồ vật không đủ.

**Quá tuyệt đối:** “The supplier hasn't confirmed yet” chỉ có nghĩa chưa biết, không chứng minh đơn hàng chắc chắn bị hủy.

## Quy trình ba giây cho từng câu

Ngay khi nghe câu hỏi, giữ **từ mở đầu + chủ đề + ý định**. Trong mỗi lựa chọn, kiểm tra nhanh: có trả lời đúng loại thông tin không; có hợp thời gian và người không; có làm hội thoại tiến lên không.

Nếu lựa chọn A có vẻ hợp lý, vẫn nghe B và C. Đừng tiếp tục phân tích câu trước khi audio đã sang câu mới. Khi bỏ lỡ hoàn toàn, loại phương án có quan hệ vô lý rõ nhất, chọn đáp án tốt nhất rồi đặt lại sự chú ý cho câu tiếp theo.

Nếu vấn đề là không tách được ranh giới từ, học [connected speech và dạng yếu](/blog/noi-am-tieng-anh-cach-nghe-connected-speech). Nếu thường bỏ đuôi số nhiều hoặc quá khứ, xem [cách nghe âm cuối tiếng Anh](/blog/am-cuoi-tieng-anh-cach-phat-am-khong-them-am).

## Review Part 2 theo bốn nguyên nhân

Với mỗi câu sai hoặc đúng nhờ đoán, nghe lại trước khi mở transcript. Ghi một mã: **S** – không nhận ra âm; **Q** – nghe sai loại câu hỏi; **L** – hiểu câu nhưng sai logic phản hồi; **A** – mất tập trung khi nghe lựa chọn.

Sau đó mở transcript và ghi ba dòng: câu đầu muốn gì; câu đúng thực hiện chức năng gì; lựa chọn bạn chọn sai ở đâu. Nếu lỗi âm, chép và nhại cả cụm quyết định. Nếu lỗi logic, tự viết thêm một phản hồi đúng và một phản hồi chỉ lặp từ.

Dùng [sổ review lỗi TOEIC](/blog/cach-review-loi-sai-toeic) để theo dõi nhóm lỗi lặp lại. Khi đã ổn với lượt lời ngắn, chuyển sang [cách luyện nghe Part 3–4](/blog/cach-luyen-nghe-toeic-part-3-4) để giữ cùng kỹ năng qua hội thoại dài hơn.

## Kế hoạch luyện Part 2 trong bảy ngày

- **Ngày 1:** làm một nhóm mới, phân loại bốn mã lỗi S/Q/L/A.
- **Ngày 2:** luyện Who–Where–When và nói nhãn thông tin cần tìm.
- **Ngày 3:** luyện What–Why–How, giữ cả cụm *how many/how long/how often*.
- **Ngày 4:** luyện Yes/No, lựa chọn và các phản hồi không dùng yes/no.
- **Ngày 5:** luyện yêu cầu, đề nghị, phát biểu và câu hỏi đuôi.
- **Ngày 6:** làm nhóm trộn có bấm nhịp, không biết trước dạng câu.
- **Ngày 7:** làm lại câu sai bằng audio, sau đó kiểm tra với câu mới.

Mỗi buổi 15–20 phút đủ nếu phần review chỉ ra được nguyên nhân. Đừng đo tiến bộ bằng việc thuộc lại một recording; dùng câu mới để kiểm tra khả năng chuyển giao.

**Nguồn đối chiếu:** [ETS mô tả Part 2 là Question–Response trong TOEIC Listening & Reading](${etsFormat}) và cung cấp [tài liệu luyện thi chính thức](${etsSamples}). Các ví dụ, phân loại lỗi và kế hoạch luyện là nội dung tự biên soạn của TOEIC GYM.`,
  }),
  tip({
    id: "tip-part-5", slug: "meo-lam-toeic-part-5-trong-thoi-gian-gioi-han", category: "READING",
    revisedAt: new Date("2026-10-10T16:00:00.000Z"),
    title: "Mẹo làm TOEIC Part 5: phân loại câu trước khi chọn đáp án",
    excerpt: "Quy trình xử lý từ loại, động từ, giới từ, liên từ và từ vựng Part 5 bằng tín hiệu cấu trúc, nghĩa và ví dụ tự biên soạn.",
    seoTitle: "Mẹo làm TOEIC Part 5: các dạng câu và cách giải",
    seoDescription: "Cách làm TOEIC Part 5 theo từng dạng từ loại, động từ, giới từ, liên từ và từ vựng; có bài mẫu, bẫy, cách bấm giờ và review lỗi.",
    socialTitle: "Part 5 TOEIC: tìm tín hiệu trước khi chọn đáp án", socialDescription: "Một quy trình ba bước để giải câu điền từ nhanh và chắc hơn.",
    coverAlt: "Bút chì chỉ vào chỗ trống trong bài luyện câu tiếng Anh TOEIC Part 5",
    editorialCover: "/blog/meo-toeic-part-5.webp", targetTopic: "mẹo làm TOEIC Part 5",
    tags: [{ name: "TOEIC Reading", slug: "toeic-reading" }, { name: "Part 5", slug: "part-5" }],
    content: `## Part 5 không chỉ là bài kiểm tra mẹo ngữ pháp

Part 5 là **Incomplete Sentences**: mỗi câu có một chỗ trống và bốn lựa chọn. Theo cấu trúc TOEIC Listening & Reading hiện hành, phần này có 30 câu. Có câu giải được chủ yếu bằng cấu trúc, nhưng cũng có câu buộc bạn hiểu nghĩa, collocation hoặc quan hệ giữa hai mệnh đề.

Vì vậy, một danh sách công thức không đủ. Quy trình bền hơn là **nhìn đáp án để phân loại → tìm tín hiệu quyết định → điền lại và kiểm tra nghĩa**. Bạn có thể làm [Part 5 Challenge 10 câu](/challenge/part-5) để ghi nhận lỗi hiện tại trước khi đọc tiếp.

Các ví dụ dưới đây do TOEIC GYM tự biên soạn. Chúng dùng để giải thích thao tác, không phải câu hỏi ETS và không quy đổi thành điểm TOEIC chính thức.

## Bản đồ năm nhóm câu Part 5

**Loại từ:** bốn lựa chọn cùng gốc như *apply, applicant, applicable, appropriately*. Câu hỏi yêu cầu xác định danh từ, động từ, tính từ hoặc trạng từ.

**Động từ:** lựa chọn khác nhau về thì, dạng, số ít – số nhiều hoặc chủ động – bị động. Bạn phải tìm chủ ngữ, mốc thời gian và chiều hành động.

**Từ chức năng:** giới từ, liên từ, đại từ, từ hạn định hoặc quan hệ từ. Cấu trúc phía sau chỗ trống thường là bằng chứng mạnh.

**Từ vựng/collocation:** bốn đáp án có thể cùng từ loại. Cần đọc cả câu và biết từ nào kết hợp tự nhiên trong ngữ cảnh công việc.

**Cấu trúc cố định:** V-ing/to V, so sánh, mệnh đề quan hệ hoặc mẫu động từ. Hãy học cả cụm và vai trò thay vì nhớ một từ riêng lẻ.

## Bước 1: nhìn bốn lựa chọn để phân loại

Nếu bốn đáp án cùng gốc, dự đoán câu loại từ. Nếu là *approve, approves, approved, approving*, kiểm tra động từ. Nếu là *because, because of, although, despite*, đây là câu về cấu trúc và quan hệ ý. Nếu cả bốn là danh từ khác nhau, nhiều khả năng bạn cần đọc nghĩa và collocation.

Phân loại giúp quyết định phạm vi đọc. Câu loại từ đôi khi chỉ cần cụm quanh chỗ trống; câu từ vựng thường cần cả câu. Tuy nhiên, luôn đọc lại câu hoàn chỉnh sau khi chọn để tránh đáp án đúng hình thức nhưng sai nghĩa.

Không nên gắn nhãn chỉ bằng cảm giác. Hãy chỉ ra dấu hiệu quan sát được: các đáp án cùng gốc, cùng một động từ ở nhiều dạng, hoặc phần sau chỗ trống là mệnh đề có chủ ngữ và động từ.

## Bước 2: loại từ bằng vị trí trong câu

Che bốn đáp án và xác định vị trí thiếu gì. Ví dụ tự biên soạn: “The manager gave a ___ explanation of the revised policy.” (A) clearly (B) clarity (C) clear (D) clarify

Sau *a* và trước danh từ *explanation* cần tính từ, nên chọn **C. clear**. *Clearly* là trạng từ; *clarity* là danh từ; *clarify* là động từ. Sau đó đọc lại để kiểm tra nghĩa “một lời giải thích rõ ràng”.

Các khung hữu ích gồm **mạo từ + tính từ + danh từ**, **động từ + trạng từ**, **be + tính từ/phân từ**, **tính từ sở hữu + danh từ**. Đừng máy móc: trong “The early arrival surprised us,” *early* là tính từ bổ nghĩa cho *arrival*; cùng một hình thức có thể đảm nhiệm vai trò khác tùy câu.

Luyện thêm ở [bài Word Form Part 5](/toeic/part-5/word-form) và [hướng dẫn loại từ TOEIC](/blog/loai-tu-trong-toeic-part-5).

## Bước 3: động từ bằng ba lớp bằng chứng

Với câu động từ, kiểm tra lần lượt: **chủ ngữ chính**, **mốc hoặc quan hệ thời gian**, **chủ động hay bị động**.

Ví dụ: “The maintenance team ___ the air filters every month.” (A) inspect (B) inspects (C) is inspected (D) inspecting. Chủ ngữ chính *team* số ít, thực hiện hành động theo lịch *every month*, nên chọn **B. inspects**.

So sánh: “The air filters ___ every month.” Lúc này filters nhận hành động, cần **are inspected**. Việc thấy V3 chưa đủ; phải có dạng *be* phù hợp với thì và chủ ngữ.

Mốc thời gian có thể nằm ở mệnh đề khác. “By the time the guests arrived, the staff had prepared the room” dùng quá khứ hoàn thành vì việc chuẩn bị xảy ra trước một sự kiện quá khứ khác. Nếu câu chỉ có *yesterday*, quá khứ đơn thường là điểm xuất phát hợp lý.

Làm [bài thì và dạng động từ Part 5](/toeic/part-5/thi-dong-tu), rồi ôn riêng [hòa hợp chủ ngữ – động từ](/blog/hoa-hop-chu-ngu-dong-tu-toeic) hoặc [câu bị động](/blog/cau-bi-dong-toeic-part-5) theo nhóm lỗi.

## Giới từ và liên từ: nhìn cấu trúc phía sau

Đừng chọn *because/because of* chỉ theo nghĩa “bởi vì”. **Because + mệnh đề**; **because of + danh từ/cụm danh từ**. Tương tự, **although + mệnh đề** trong khi **despite + danh từ/V-ing**.

Ví dụ tự biên soạn: “The finance team will send the budget ___ the director approves it.” (A) because of (B) once (C) despite (D) during. Sau chỗ trống là mệnh đề đầy đủ *the director approves it* và ý nghĩa là gửi khi phê duyệt xong, nên chọn **B. once**.

Với giới từ thời gian, tách rõ *by* và *until*. “Submit the form by Friday” đặt hạn chót không muộn hơn thứ Sáu; “The office is closed until Friday” mô tả trạng thái kéo dài tới thứ Sáu. *During* cần một khoảng hoặc sự kiện, như *during the meeting*.

Học sâu hơn bằng [giới từ TOEIC trong công việc](/blog/gioi-tu-toeic-trong-cong-viec) và [liên từ, từ nối TOEIC](/blog/lien-tu-va-tu-noi-toeic).

## Đại từ, từ hạn định và mệnh đề quan hệ

Với đại từ, xác định danh từ được thay thế và vai trò chủ ngữ/tân ngữ/sở hữu. “Employees must display ___ badges” cần tính từ sở hữu **their**, không phải *they* hay *them*.

*Each, every, either, neither* thường đi với danh từ đếm được số ít trong cấu trúc cơ bản. “Each applicant is required...” dùng động từ số ít dù phía sau có thể xuất hiện danh từ số nhiều trong một cụm giới từ.

Với *who, which, that, whose, where*, xem danh từ đứng trước là người, vật, sở hữu hay địa điểm; đồng thời kiểm tra mệnh đề sau chỗ trống đang thiếu chủ ngữ hay đã đủ thành phần. “The warehouse ___ the goods are stored” cần **where** vì sau chỗ trống đã có chủ ngữ *the goods* và động từ *are stored*.

Nếu nhóm này thường sai, đọc [mệnh đề quan hệ TOEIC](/blog/menh-de-quan-he-toeic) thay vì ghi nhớ một bảng từ rời rạc.

## V-ing, to V và mẫu động từ

Một số động từ đi với to-infinitive như *agree to revise, decide to postpone*. Một số đi với V-ing như *avoid delaying, consider moving*. Sau giới từ thường dùng danh từ hoặc V-ing: *interested in applying, before entering*.

Đừng thấy *to* rồi luôn chọn nguyên mẫu. Trong *look forward to receiving*, *to* là giới từ nên theo sau bằng V-ing. Ngược lại, *plan to receive* dùng to-infinitive.

Ví dụ: “The manager reminded all visitors ___ their badges.” (A) wear (B) wearing (C) to wear (D) worn. Mẫu **remind + người + to V** cho đáp án **C. to wear**.

Hãy lưu cả cụm, một câu mẫu mới và nghĩa giao tiếp. [Bài V-ing và to-infinitive](/blog/ving-va-to-infinitive-toeic) có thêm câu luyện giải thích từng lựa chọn.

## Từ vựng và collocation: cấu trúc không thể quyết định thay bạn

Khi bốn đáp án cùng từ loại, xác định nghĩa cần điền rồi kiểm tra từ nào kết hợp tự nhiên với danh từ hoặc động từ xung quanh. *Meet a deadline, conduct an inspection, submit an application, comply with a policy* là các cụm thường gặp trong ngữ cảnh công việc.

Ví dụ: “The hotel will ___ guests for the inconvenience.” (A) compensate (B) complete (C) compare (D) compete. Cấu trúc đều cho phép một động từ sau *will*, nên nghĩa và collocation quyết định: **compensate guests for** something.

Bẫy thường dùng từ có nghĩa gần nhưng khác kết hợp. *Attend a meeting* không cần *to*; *participate in a meeting* cần *in*. Hãy ghi cả cụm và tự tạo một câu mới thay vì học “attend = tham dự”.

[Collocation TOEIC theo chủ đề công sở](/blog/collocation-la-gi-cum-tu-toeic-thong-dung) giúp mở rộng nhóm này bằng ngữ cảnh thay vì danh sách dịch đơn lẻ.

## Sáu câu mẫu tự biên soạn

Thử dự đoán dạng câu và tín hiệu trước khi xem lời giải.

**1.** The revised brochure is now available ___ the company website. (A) at (B) on (C) during (D) among

**2.** Ms. Alvarez has worked in logistics ___ 2021. (A) for (B) from (C) since (D) during

**3.** The equipment must ___ before the laboratory reopens. (A) inspect (B) be inspected (C) inspecting (D) inspected

**4.** Customer feedback was generally ___. (A) favor (B) favorable (C) favorably (D) favored

**5.** The shipment arrived on time ___ the severe weather. (A) although (B) because (C) despite (D) therefore

**6.** We look forward to ___ your proposal. (A) review (B) reviewed (C) reviewing (D) reviews

**Lời giải:** 1 **B** theo collocation *on a website*. 2 **C** vì *since + mốc bắt đầu* đi với hiện tại hoàn thành. 3 **B** theo *modal + be + V3* vì equipment nhận hành động. 4 **B** vì sau *was* cần tính từ mô tả feedback. 5 **C** vì sau chỗ trống là cụm danh từ *the severe weather* và ý tương phản. 6 **C** vì *look forward to + V-ing*.

## Sáu bẫy khiến làm nhanh nhưng sai

**Chỉ nhìn từ ngay trước chỗ trống:** tín hiệu quyết định có thể nằm sau hoặc ở mệnh đề đầu câu.

**Chọn đúng từ loại nhưng sai nghĩa:** bốn tính từ vẫn cần ngữ cảnh và collocation.

**Chọn thì theo một từ khóa:** *since* có nhiều vai trò; phải đọc toàn cấu trúc và mốc thời gian.

**Chia động từ theo danh từ gần nhất:** trong “The list of suppliers is...”, chủ ngữ là *list*.

**Nhầm mệnh đề với cụm danh từ:** đây là nguồn lỗi phổ biến ở *because/because of, although/despite*.

**Cố nhớ câu đã gặp:** từ vựng thay đổi sẽ làm mẹo mất tác dụng nếu bạn không hiểu tín hiệu.

## Quy trình làm câu trong khoảng thời gian đã luyện

**Lượt 1:** nhìn đáp án và gắn nhãn dạng câu. **Lượt 2:** tìm tín hiệu quyết định ở cả hai phía chỗ trống. **Lượt 3:** điền đáp án và đọc lại cả câu để kiểm tra nghĩa.

Nếu vẫn phân vân, loại đáp án sai cấu trúc trước rồi so nghĩa của phần còn lại. Sau một lượt đọc có mục tiêu mà chưa có bằng chứng, chọn phương án tốt nhất, đánh dấu và chuyển tiếp. Đừng để một câu Part 5 lấy thời gian của [Part 6](/blog/meo-lam-toeic-part-6-dien-doan-van) và [Part 7](/blog/meo-lam-toeic-part-7-doc-hieu-nhieu-van-ban).

Không có mốc phút phù hợp mọi người. Hãy dùng [công cụ chia 75 phút TOEIC Reading](/blog/quan-ly-thoi-gian-toeic-reading-75-phut), thử trong bài mới rồi điều chỉnh theo độ chính xác và số câu còn trống.

## Review Part 5 bằng tín hiệu quyết định

Ghi mỗi lỗi bằng bốn trường: **dạng câu – đã chọn – tín hiệu đúng – câu mới**. Ví dụ: “liên từ/giới từ – chọn although – sau chỗ trống là noun phrase – despite – The event continued despite the rain.”

Phân biệt thiếu kiến thức với sai thao tác. Nếu không biết *comply with*, học collocation. Nếu biết nhưng không nhìn phần sau chỗ trống, sửa quy trình. Nếu làm đúng nhờ đoán, vẫn giữ câu trong sổ lỗi.

Sau hai ngày, che đáp án và tự dự đoán loại từ hoặc cấu trúc trước. Cuối tuần làm [bài Part 5 hỗn hợp](/toeic/part-5/practice) để kiểm tra khi không được báo trước chủ điểm. [Cách review lỗi sai TOEIC](/blog/cach-review-loi-sai-toeic) có mẫu ghi ngắn cho bước này.

## Kế hoạch luyện Part 5 trong bảy ngày

- **Ngày 1:** làm một nhóm trộn và phân loại năm nhóm lỗi.
- **Ngày 2:** luyện loại từ; nói rõ vị trí cần danh/động/tính/trạng.
- **Ngày 3:** luyện động từ, hòa hợp và bị động.
- **Ngày 4:** luyện giới từ, liên từ và mệnh đề quan hệ.
- **Ngày 5:** luyện V-ing/to V cùng các cấu trúc cố định.
- **Ngày 6:** học collocation từ chính các câu đã sai rồi viết câu mới.
- **Ngày 7:** làm bài trộn có bấm giờ, review cả câu sai và câu đoán đúng.

Chỉ tăng tốc khi bạn có thể nêu tín hiệu của phần lớn câu. Làm nhanh mà không biết vì sao đúng dễ tạo cảm giác tiến bộ trên bộ câu quen nhưng không chuyển sang đề mới.

**Nguồn đối chiếu:** [ETS mô tả Part 5 là Incomplete Sentences trong TOEIC Listening & Reading](${etsFormat}) và cung cấp [tài liệu luyện thi chính thức](${etsSamples}). Các ví dụ, quy trình và kế hoạch luyện trên là nội dung tự biên soạn của TOEIC GYM.`,
  }),
  tip({
    id: "tip-part-6", slug: "meo-lam-toeic-part-6-dien-doan-van", category: "READING",
    revisedAt: new Date("2026-10-10T14:00:00.000Z"),
    title: "Mẹo làm TOEIC Part 6: xử lý từng dạng chỗ trống bằng bằng chứng",
    excerpt: "Phân loại chỗ trống, dùng ngữ cảnh trước sau và kiểm tra mạch văn để làm câu từ loại, thì, từ nối và điền câu Part 6.",
    seoTitle: "Mẹo làm TOEIC Part 6: 4 dạng câu và bài mẫu",
    seoDescription: "Cách làm TOEIC Part 6 theo 4 dạng: từ loại, ngữ pháp, từ nối và điền câu. Có đoạn mẫu tự biên soạn, lời giải, bẫy và kế hoạch luyện 7 ngày.",
    socialTitle: "Part 6 TOEIC: đừng bỏ qua câu phía sau", socialDescription: "Cách tìm bằng chứng cho từ và câu còn thiếu trong văn bản.",
    coverAlt: "Ảnh bìa chủ đề TOEIC Reading cho bài hướng dẫn Part 6",
    targetTopic: "mẹo làm TOEIC Part 6",
    tags: [{ name: "TOEIC Reading", slug: "toeic-reading" }, { name: "Part 6", slug: "part-6" }],
    content: `## Part 6 kiểm tra điều gì ngoài ngữ pháp?

Part 6 là **Text Completion**: bạn điền từ, cụm từ hoặc cả câu vào một văn bản công việc. Theo cấu trúc Listening & Reading hiện hành do ETS công bố, phần này có 16 câu. Tuy vậy, con số 16 không phải điều khó nhất. Thử thách thật sự là biết bằng chứng nằm ngay trong câu hay phải mở rộng ra cả đoạn.

Một chỗ trống có thể hỏi loại từ, thì, thể chủ động – bị động, từ vựng theo ngữ cảnh, từ nối hoặc câu hoàn chỉnh. Vì vậy, mẹo “chỉ nhìn hai từ quanh chỗ trống” chỉ giúp được một phần. Quy tắc thực dụng hơn là: **phân loại câu hỏi trước, rồi đọc đúng phạm vi bằng chứng cần thiết**.

Bạn có thể xem [tổng quan TOEIC Part 6 và bài mẫu](/toeic/part-6) trước khi dùng quy trình dưới đây. Tất cả ví dụ trong bài này do TOEIC GYM tự biên soạn, không sao chép câu hỏi ETS.

## Bản đồ bốn nhóm chỗ trống

**Nhóm 1 – hình thức từ:** bốn lựa chọn thường cùng gốc, chẳng hạn *inform, information, informative, informatively*. Bạn cần xác định vị trí đang thiếu danh từ, động từ, tính từ hay trạng từ.

**Nhóm 2 – cấu trúc ngữ pháp:** đáp án có thể là các thì, dạng chủ động – bị động, giới từ hoặc liên từ. Bằng chứng thường nằm trong câu, nhưng mốc thời gian đôi khi xuất hiện ở câu trước.

**Nhóm 3 – từ vựng và quan hệ ý:** bốn đáp án đều có vẻ đúng ngữ pháp. Bạn phải hiểu người viết đang thông báo, giải thích, đối lập hay đưa ra kết quả gì.

**Nhóm 4 – điền cả câu:** mỗi lựa chọn là một câu hoàn chỉnh. Đáp án phải nối được câu trước với câu sau, giữ đúng người, thời gian và mục đích văn bản. Hãy luyện riêng bằng [bài Part 6 điền câu có lời giải](/toeic/part-6/dien-cau-vao-doan-van).

## Quét văn bản trong 20 giây đầu

Trước khi giải từng chỗ, đọc dòng chủ đề, câu mở đầu và câu kết. Tự trả lời bốn câu hỏi ngắn: **Ai viết? Viết cho ai? Vì việc gì? Người nhận cần làm gì?** Bạn không cần dịch toàn bộ. Mục tiêu là dựng một chiếc khung để nhận ra phương án lạc chủ đề.

Ví dụ, tiêu đề *Temporary Entrance Closure* cùng câu mở đầu nói lối vào phía đông đang sửa chữa. Nếu cuối thư yêu cầu khách đi theo biển chỉ dẫn, toàn văn có mục đích thông báo thay đổi lối đi. Một câu nói về chương trình giảm giá có thể đúng tiếng Anh nhưng không thuộc chiếc khung này.

Đánh dấu thầm các mốc như *currently, by Friday, beginning next week, as a result*. Chúng thường quyết định thì hoặc quan hệ giữa hai ý. Với email, tên người gửi và người nhận còn giúp xác định đại từ *we, you, they* đang chỉ ai.

## Dạng từ loại: đọc cấu trúc trước, nghĩa sau

Khi bốn đáp án cùng gốc từ, đừng dịch từng lựa chọn. Hãy che đáp án và hỏi vị trí cần từ loại nào.

Ví dụ tự biên soạn: “The revised safety guide gives a ___ explanation of the inspection process.” (A) clearly (B) clarity (C) clear (D) clarify

Sau mạo từ *a* và trước danh từ *explanation* cần tính từ, nên chọn **C. clear**. Sau đó mới đọc lại cả câu để xác nhận nghĩa. Cách này nhanh hơn việc thử bốn đáp án lần lượt.

Ba khung nên nhận ra ngay là **mạo từ + tính từ + danh từ**, **động từ + trạng từ** và **be + tính từ/phân từ**. Tuy nhiên, hình thức đúng chưa đủ nếu nghĩa vô lý. Trong “The report was ___ reviewed,” vị trí cần trạng từ, nhưng phải chọn từ mang nghĩa phù hợp với hành động *reviewed*.

Nếu đây là nhóm lỗi chính, làm [9 câu điền từ và cụm từ Part 6](/toeic/part-6/dien-tu-va-cum-tu), rồi quay về [bài loại từ Part 5](/toeic/part-5/word-form) để luyện cấu trúc ở cấp độ câu ngắn.

## Thì và thể: tìm chủ thể, mốc thời gian, chiều hành động

Với động từ, kiểm tra ba lớp theo thứ tự: chủ ngữ số ít hay số nhiều; sự việc ở quá khứ, hiện tại hay tương lai; chủ ngữ thực hiện hay nhận hành động.

Ví dụ tự biên soạn: “The lobby lights ___ before the building reopens on Monday.” (A) will replace (B) will be replaced (C) replaced (D) are replacing

Đèn là vật **được thay**, còn *before ... on Monday* hướng tới một việc sẽ hoàn tất trong tương lai. Đáp án là **B. will be replaced**. Chọn A nghĩa là đèn tự thay một vật khác; C thiếu trợ động từ trong cấu trúc cần dùng; D biến đèn thành chủ thể đang thực hiện hành động.

Đừng chỉ nhìn một từ báo thời gian. Nếu đoạn kể một đơn hàng đặt tuần trước nhưng câu cuối nói giao vào ngày mai, hai chỗ trống có thể cần hai thì khác nhau. Mạch thời gian của cả văn bản quan trọng hơn một “công thức thì” học thuộc.

## Từ nối: gọi tên quan hệ trước khi chọn

Trước một chỗ trống chứa *however, therefore, additionally, meanwhile*, hãy diễn đạt quan hệ giữa hai câu bằng tiếng Việt: tương phản, kết quả, bổ sung hay đồng thời.

“The west elevator is being inspected. ___, visitors should use the stairs near reception.” Câu sau là hướng xử lý phát sinh từ câu trước, nên **Therefore** phù hợp. *However* sẽ báo tương phản nhưng ở đây không có ý trái chiều. *Additionally* chỉ bổ sung và làm yếu quan hệ nguyên nhân – kết quả.

Bẫy phổ biến là chọn từ nối vì thuộc nghĩa tiếng Việt mà không kiểm tra dấu câu và loại cấu trúc theo sau. *Because* nối với một mệnh đề, còn *because of* đứng trước danh từ hoặc cụm danh từ. [Bài liên từ và từ nối TOEIC](/blog/lien-tu-va-tu-noi-toeic) giúp củng cố phần này trước khi quay lại đoạn văn.

## Điền câu: dùng phép kiểm tra hai phía

Đừng hỏi “câu nào nghe hay nhất?”. Hãy hỏi “câu nào giải thích được câu trước và chuẩn bị được câu sau?”. Viết vai trò cần thiết của câu trống thành một nhãn ngắn như **nêu kết quả**, **thông báo lịch mới**, **hướng dẫn hành động**.

Ví dụ tự biên soạn:

“The product demonstration cannot be held in Room 3 because new equipment is being installed. ___. Registered guests will receive an updated invitation this afternoon.”

Câu “It will instead take place in the main showroom” vừa giải quyết vấn đề địa điểm vừa giải thích vì sao khách nhận thư mời mới. Câu “The company introduced the product last year” có thể đúng về ngữ pháp và chủ đề sản phẩm, nhưng không nối hai phía chỗ trống.

Kiểm tra thêm đại từ. Nếu phương án mở đầu bằng *This change*, đoạn trước phải có một thay đổi rõ ràng. Nếu câu nói *They will contact you*, phải xác định được *they* là ai. Đại từ không có đối tượng tham chiếu là dấu hiệu loại nhanh.

## Đoạn mẫu bốn chỗ trống

Đọc email tự biên soạn sau và thử dự đoán trước khi xem lời giải:

“Subject: Friday Training Session

The customer-support workshop [1] in Conference Room A this Friday. Because the room's projector stopped working yesterday, the session will move to Room C. [2]. Please check the map attached to this email before arriving. The workshop will begin [3] at 9:30 a.m., but registration opens at 9:00. We apologize for any [4] the room change may cause.”

**[1]** (A) holds (B) will be held (C) was holding (D) has hold

**[2]** (A) Room C is across from the employee cafeteria (B) The instructor bought a laptop last year (C) Projectors are available from many stores (D) Customer support answers telephone calls

**[3]** (A) prompt (B) prompted (C) promptly (D) prompting

**[4]** (A) convenient (B) inconvenience (C) inconveniently (D) inconvenienced

**Lời giải:** [1] **B** vì workshop là sự kiện được tổ chức trong tương lai. [2] **A** cung cấp vị trí cần thiết trước yêu cầu xem bản đồ. [3] **C** là trạng từ bổ nghĩa cho *begin*. [4] **B** là danh từ sau *any*. Quan trọng hơn, bốn đáp án cùng tạo thành một email nhất quán: đổi phòng, chỉ vị trí, xác nhận giờ và xin lỗi vì bất tiện.

## Năm bẫy khiến người học mất điểm

**Bẫy cùng chủ đề:** phương án nhắc đúng *workshop* hoặc *projector* nhưng không nối mạch. Từ trùng không phải bằng chứng.

**Bẫy đúng tại một phía:** câu chèn hợp với câu trước nhưng mâu thuẫn câu sau. Luôn kiểm tra cả hai phía.

**Bẫy đổi thời gian:** đoạn đang nói kế hoạch tương lai nhưng phương án biến sự việc thành đã hoàn tất.

**Bẫy đại từ mồ côi:** *it, they, this change* không có đối tượng rõ trong phần trước.

**Bẫy tuyệt đối:** văn bản nói “có thể chậm” nhưng đáp án biến thành “chắc chắn bị hủy”. Không thêm mức độ mà bài không cung cấp.

## Quy trình làm một đoạn theo ba lượt

**Lượt 1 – dựng khung:** đọc tiêu đề, mở đầu và kết thúc để biết mục đích. **Lượt 2 – giải theo phạm vi:** làm câu có tín hiệu tại chỗ trước; mở rộng ra câu bên cạnh với từ nối, từ vựng và điền câu. **Lượt 3 – đọc liền:** đặt tất cả đáp án vào đoạn, kiểm tra mốc thời gian, đại từ và giọng văn.

Nếu kẹt, loại lựa chọn sai cấu trúc hoặc sai chủ đề, đánh dấu phương án tốt nhất rồi chuyển tiếp. Đừng để một chỗ trống lấy thời gian của cả [bài trụ cột TOEIC Part 7](/blog/meo-lam-toeic-part-7-doc-hieu-nhieu-van-ban). Hãy đặt Part 6 vào [kế hoạch 75 phút TOEIC Reading](/blog/quan-ly-thoi-gian-toeic-reading-75-phut) thay vì áp một mốc cứng cho mọi trình độ.

## Review sao cho lần sau nhận ra tín hiệu

Với mỗi câu sai, ghi bốn cột: **dạng câu – bằng chứng – lựa chọn đã chọn – quy tắc sửa**. Ví dụ: “điền câu – room changed + updated invitation – chọn câu cùng từ projector – phải nối được cả nguyên nhân và hành động sau”.

Làm lại câu sai sau hai ngày nhưng che đáp án. Trước tiên dự đoán loại từ hoặc vai trò của câu trống. Nếu chọn đúng nhưng không chỉ ra được bằng chứng, vẫn đánh dấu là chưa chắc. [Quy trình review lỗi sai TOEIC](/blog/cach-review-loi-sai-toeic) giúp chuyển các lỗi rời rạc thành buổi luyện tiếp theo.

## Kế hoạch luyện Part 6 trong bảy ngày

- **Ngày 1:** làm một đoạn không bấm giờ, phân loại mọi chỗ trống.
- **Ngày 2:** luyện từ loại và thì ở cấp độ câu ngắn.
- **Ngày 3:** luyện từ nối, viết quan hệ ý bên cạnh từng câu.
- **Ngày 4:** làm riêng dạng điền câu và gạch bằng chứng hai phía.
- **Ngày 5:** làm hai đoạn có bấm giờ, ghi lại nơi bị chậm.
- **Ngày 6:** làm lại toàn bộ câu sai mà không nhìn ghi chú.
- **Ngày 7:** làm một cụm Part 6 mới rồi so tỷ lệ đúng và số câu giải thích được.

Chỉ tăng tốc khi bạn đã chỉ ra được lý do chọn. Tốc độ bền vững đến từ nhận dạng đúng phạm vi bằng chứng, không phải đọc lướt nhanh hơn trong mọi câu.

**Nguồn đối chiếu:** [ETS mô tả Part 6 là Text Completion trong TOEIC Listening & Reading](${etsFormat}) và cung cấp [tài liệu luyện thi chính thức](${etsSamples}). Cấu trúc luyện, đoạn mẫu và lời giải trên là nội dung tự biên soạn của TOEIC GYM.`,
  }),
  tip({
    id: "tip-part-7", slug: "meo-lam-toeic-part-7-doc-hieu-nhieu-van-ban", category: "READING",
    revisedAt: new Date("2026-10-10T14:00:00.000Z"),
    title: "Mẹo làm TOEIC Part 7: tìm bằng chứng trong một hoặc nhiều văn bản",
    excerpt: "Đọc câu hỏi theo mục tiêu, tìm thông tin và đối chiếu nhiều tài liệu mà không phải đọc đi đọc lại toàn bộ.",
    seoTitle: "Mẹo làm TOEIC Part 7 đọc hiểu và đối chiếu văn bản",
    seoDescription: "Chiến thuật TOEIC Part 7: phân loại câu hỏi, tìm bằng chứng, nhận ra diễn đạt lại và nối thông tin giữa email, lịch hay thông báo.",
    socialTitle: "Part 7 TOEIC: tìm đúng đoạn, nối đúng ý", socialDescription: "Một cách đọc có mục tiêu cho bài đơn, đôi và nhiều văn bản.",
    coverAlt: "Ảnh bìa chủ đề TOEIC Reading cho bài hướng dẫn Part 7",
    targetTopic: "mẹo làm TOEIC Part 7",
    tags: [{ name: "TOEIC Reading", slug: "toeic-reading" }, { name: "Part 7", slug: "part-7" }],
    content: `## Part 7 khó vì phải quản lý bằng chứng, không chỉ vì nhiều từ

Part 7 là **Reading Comprehension**. Bạn đọc nhiều loại tài liệu công việc như email, thông báo, quảng cáo, lịch, tin nhắn hoặc biểu mẫu rồi trả lời câu hỏi. Theo cấu trúc ETS hiện hành, Part 7 có 54 câu trong phần Reading dùng chung 75 phút với Part 5 và Part 6.

Người học thường chậm vì đọc mọi dòng với cùng mức độ, dịch sang tiếng Việt rồi mới xem câu hỏi. Cách hiệu quả hơn là dựng bản đồ tài liệu, xác định câu hỏi cần loại bằng chứng nào và chỉ kết luận trong phạm vi văn bản cho phép. Bạn có thể thử [bài mẫu TOEIC Part 7 có lời giải](/toeic/part-7) trước khi áp dụng quy trình dưới đây.

Tất cả đoạn trích và câu hỏi minh họa trong bài do TOEIC GYM tự biên soạn. Chúng dùng để luyện thao tác đọc, không phải câu hỏi ETS và không dùng để quy đổi điểm chính thức.

## Bản đồ sáu dạng câu hỏi thường gặp

**Mục đích hoặc ý chính:** hỏi tại sao tài liệu được viết, quảng bá hay gửi đi. Bằng chứng mạnh thường nằm ở tiêu đề, câu mở đầu và lời kêu gọi hành động.

**Chi tiết:** hỏi ai, khi nào, ở đâu, bao nhiêu hoặc việc gì. Hãy dùng tên riêng, số, ngày và danh từ cụ thể làm điểm neo.

**Paraphrase:** đáp án diễn đạt lại bằng từ hoặc cấu trúc khác. Đừng chọn chỉ vì thấy một từ trùng tài liệu.

**Suy luận:** kết luận phải được một hoặc nhiều chi tiết hỗ trợ; không thêm cảm xúc, nguyên nhân hay kế hoạch ngoài bài.

**Từ vựng trong ngữ cảnh:** thay từ được hỏi bằng từng lựa chọn rồi đọc lại cả câu. Nghĩa đúng phụ thuộc văn cảnh, không phải nghĩa đầu tiên trong từ điển.

**Kết nối tài liệu hoặc vị trí câu:** cần ghép email với lịch, hóa đơn với thông báo, hoặc đặt một câu vào nơi mạch ý hợp lý. Đây là dạng dễ mất thời gian nếu chưa lập quan hệ giữa các tài liệu.

## Quét tài liệu trước khi đọc sâu

Trong vài giây đầu, nhìn loại tài liệu, tiêu đề, người gửi – người nhận, ngày và phần trình bày nổi bật. Với quảng cáo, tìm sản phẩm, lợi ích và điều kiện. Với email, tìm vấn đề và hành động người nhận cần thực hiện. Với lịch, xác định cột thời gian, địa điểm và ghi chú thay đổi.

Sau đó đọc câu hỏi và gạch trong đầu từ giúp định vị. “According to the notice, what must visitors do?” cần một hành động bắt buộc trong notice. “What is suggested about Ms. Lee?” cần các chi tiết liên quan Ms. Lee nhưng không nhất thiết lặp đúng tên trong đáp án.

Đọc câu hỏi trước không có nghĩa săn từ đơn lẻ. Điểm neo chỉ đưa bạn tới **vùng bằng chứng**; bạn vẫn phải đọc câu chứa nó và ít nhất một câu liền kề để thấy phủ định, điều kiện hoặc cập nhật.

## Câu chi tiết: tìm điểm neo rồi kiểm tra điều kiện

Ưu tiên điểm neo khó bị paraphrase như tên người, ngày tháng, số tiền, mã sản phẩm và địa điểm. Khi thấy điểm neo, đọc đủ một cụm ý và hỏi: ai làm gì, khi nào, trong điều kiện nào?

Ví dụ tự biên soạn: “Orders placed before 3 p.m. will be shipped the same day, except on public holidays.” Nếu câu hỏi hỏi đơn đặt lúc 2:30 chiều ngày lễ, đáp án “shipped the same day” sai vì bỏ mất ngoại lệ. Từ *before 3 p.m.* đúng nhưng chưa phải toàn bộ bằng chứng.

Bẫy chi tiết thường lấy một dữ kiện đúng rồi gắn sai người hoặc sai thời điểm. Nếu lịch ghi buổi giới thiệu lúc 9:00 và workshop lúc 10:30, đáp án có thể trộn đúng tên workshop với giờ của buổi giới thiệu. Hãy đối chiếu theo cặp, không theo một từ.

## Paraphrase: so toàn bộ ý thay vì ghép từ

Paraphrase có thể đổi từ loại, chuyển chủ động sang bị động hoặc diễn đạt nguyên nhân thành kết quả. “The company will reimburse the fee” tương đương với “Employees can receive repayment,” nhưng chỉ khi điều kiện và đối tượng vẫn giữ nguyên.

Ví dụ: “The west entrance will remain closed while repairs are completed.” Đáp án “Visitors cannot use the west entrance during the repair work” giữ đủ địa điểm, trạng thái và thời gian. Phương án “All entrances are being repaired” lặp *entrance/repair* nhưng mở rộng từ một lối vào thành tất cả.

Khi sửa bài, viết cặp tương đương thành hai vế. Chẳng hạn: **postponed ↔ moved to a later date**, **complimentary ↔ provided at no charge**. Sau đó ghi thêm chủ thể và điều kiện để tránh học từ đồng nghĩa rời ngữ cảnh. Luyện sâu hơn với [6 câu paraphrase và từ đồng nghĩa Part 7](/toeic/part-7/paraphrase-tu-dong-nghia).

## Suy luận: ghép dữ kiện nhưng không đoán thêm

Với câu hỏi *suggested, implied, most likely*, hãy viết kết luận ngắn trước khi nhìn đáp án. Mỗi từ quan trọng trong kết luận phải được văn bản hỗ trợ.

Ví dụ tự biên soạn: cửa hàng mở cho công chúng vào thứ Hai; nhân viên mới được yêu cầu dự buổi sắp xếp hàng hóa vào thứ Bảy. Có thể suy luận nhân viên đến cửa hàng trước ngày khai trương. Không thể kết luận người đó là quản lý, được trả thêm tiền hay đã từng làm ở đây.

Dùng công thức **chi tiết A + chi tiết B → kết luận tối thiểu**. Các từ như *always, never, all, only, definitely* là tín hiệu cần kiểm tra kỹ vì chúng thường mạnh hơn bằng chứng. [Bài câu hỏi suy luận Part 7](/toeic/part-7/cau-hoi-suy-luan) có sáu câu để luyện đúng giới hạn này.

## Mục đích và hành động tiếp theo

Để tìm mục đích, đừng chỉ đọc câu đầu. Ghép tiêu đề, vấn đề được nêu và hành động cuối tài liệu. Một email mở đầu bằng lời cảm ơn nhưng kết thúc bằng “Please confirm the revised quantity by noon” có mục đích chính là yêu cầu xác nhận, không chỉ cảm ơn.

Với câu hỏi hành động tiếp theo, tìm một yêu cầu chưa hoàn tất: *reply, submit, contact, bring, visit*. Nếu người viết nói “Your replacement card is ready at reception,” người nhận nhiều khả năng sẽ tới reception nhận thẻ. Không suy ra họ sẽ mua thẻ mới hay gọi nhà cung cấp.

Trong chuỗi tin nhắn, theo dõi người nói và thứ tự cập nhật. Một đề xuất ở tin đầu có thể đã bị thay thế ở tin cuối. Hãy thử [bài đoạn tin nhắn Part 7](/toeic/part-7/doan-tin-nhan) để luyện đổi người nói và mốc giờ.

## Bài một văn bản: đọc theo mục tiêu

Với tài liệu đơn, lập bản đồ ba dòng: **loại văn bản – mục đích – hành động cần làm**. Sau đó giải câu chi tiết trước nếu điểm neo rõ, rồi quay lại câu ý chính hoặc suy luận khi đã hiểu toàn văn.

Ví dụ tự biên soạn:

“Subject: Library Room Reservation

The second-floor meeting room will be unavailable on Wednesday morning while new lighting is installed. Your 10 a.m. reservation has been moved to Room 105 on the first floor. Please collect the access key from the information desk.”

Nếu hỏi người nhận cần làm gì, bằng chứng là *collect the access key*. Nếu hỏi vì sao đổi phòng, bằng chứng là việc lắp đèn. Nếu hỏi cuộc họp ở đâu, đáp án là Room 105 chứ không phải second floor; tài liệu đã cập nhật địa điểm.

Bạn có thể áp dụng ngay bằng [bài đọc một văn bản Part 7](/toeic/part-7/doc-hieu-mot-doan-van).

## Bài đôi và ba văn bản: lập bảng quan hệ

Đừng cố ghi nhớ mọi chi tiết. Tạo bốn cột trong đầu hoặc trên giấy nháp được phép: **người/vật – văn bản 1 – văn bản 2 – kết luận**. Với ba tài liệu, thêm cột thứ ba nhưng vẫn chỉ ghi dữ liệu phục vụ câu hỏi.

Ví dụ tự biên soạn: email xác nhận 12 màn hình được giao thứ Hai; thông báo nội bộ nói phòng đào tạo cần 15 màn hình vào thứ Tư; tin nhắn cuối cho biết đã mượn thêm 3 màn hình vào chiều thứ Ba. Kết luận an toàn là phòng sẽ có đủ 15 màn hình vào thứ Tư. Không thể suy ra cả 15 đều mới hoặc công ty đã mua thêm ba chiếc.

Làm trước câu chỉ cần một tài liệu nếu đã thấy bằng chứng. Với câu kết nối, ghi rõ mỗi nửa đáp án đến từ đâu. Tránh phương án “nửa đúng nửa sai”: ngày lấy từ email nhưng địa điểm lấy nhầm từ lịch cũ.

Thực hành theo cấp độ với [bài hai văn bản Part 7](/toeic/part-7/doc-hieu-hai-doan-van) rồi [bài ba văn bản Part 7](/toeic/part-7/doc-hieu-ba-van-ban). Cả hai đều có câu hỏi tự biên soạn và lời giải chỉ dòng bằng chứng.

## Cách xử lý câu chèn vào vị trí thích hợp

Đọc câu cần chèn trước và khoanh dấu hiệu liên kết: đại từ, từ nối, danh từ lặp lại hoặc mốc thời gian. *This delay* phải đứng sau một nguyên nhân gây chậm; *The replacement model* phải xuất hiện sau khi mẫu cũ đã được nhắc tới.

Tại từng vị trí, đọc câu ngay trước, câu cần chèn và câu ngay sau như một đoạn ba câu. Loại vị trí khiến đại từ không có đối tượng hoặc thời gian nhảy lùi vô lý. Không cần đọc lại toàn văn bốn lần.

Ví dụ, câu “This option is available at no additional charge” phải theo sau một phương án cụ thể. Nếu đặt trước khi phương án được giới thiệu, *This option* không chỉ vào điều gì. Nếu đặt sau câu yêu cầu khách xác nhận lựa chọn, mạch có thể đã quá muộn.

## Quản lý thời gian mà không hy sinh bằng chứng

Không có một mốc phút phù hợp cho mọi người. Hãy làm một bài Reading đủ 75 phút, ghi thời điểm bắt đầu Part 7, số câu còn trống và dạng khiến bạn quay lại nhiều lần. Từ dữ liệu đó mới điều chỉnh phần Part 5–6.

Trong Part 7, đặt giới hạn cho hành vi chứ không chỉ cho đồng hồ: đọc vùng bằng chứng hai lần mà vẫn không phân biệt được hai đáp án thì đánh dấu, chọn phương án tốt nhất và đi tiếp. Một câu khó không nên lấy mất cơ hội làm ba câu chi tiết phía sau.

Với cụm nhiều văn bản, đừng mặc định để hết tới cuối nếu đó là điểm mạnh của bạn. Thứ tự tốt là thứ tự đã được thử trong mô phỏng. Nếu bạn thường vào Part 7 quá muộn, kiểm tra lại [quy trình làm TOEIC Part 6](/blog/meo-lam-toeic-part-6-dien-doan-van) và dùng [công cụ chia 75 phút TOEIC Reading](/blog/quan-ly-thoi-gian-toeic-reading-75-phut) để tạo mốc cá nhân thay vì học thuộc một con số trên mạng.

## Review Part 7 theo loại lỗi

Sau mỗi câu, ghi một trong bốn mã: **L** – không định vị được; **P** – không nhận ra paraphrase; **I** – suy luận vượt bằng chứng; **T** – mất thời gian hoặc đọc nhầm dòng. Một chữ cái đáp án không cho biết bạn cần luyện gì tiếp theo.

Với câu sai, đánh dấu chính xác câu hoặc hai tài liệu tạo ra đáp án. Viết một câu giải thích vì sao lựa chọn của bạn sai: đổi người, sai thời điểm, bỏ điều kiện hay thêm thông tin. Sau hai ngày, làm lại mà che đáp án và tự diễn đạt bằng chứng trước.

Nếu câu đúng nhờ đoán, vẫn review như câu sai. [Cách review lỗi sai TOEIC](/blog/cach-review-loi-sai-toeic) giúp bạn biến bảng lỗi thành bài luyện tiếp theo thay vì chỉ cộng tổng số câu đúng.

## Kế hoạch luyện Part 7 trong bảy ngày

- **Ngày 1:** làm một bài đơn, đánh dấu dòng bằng chứng cho mọi câu.
- **Ngày 2:** luyện paraphrase, viết sáu cặp diễn đạt tương đương.
- **Ngày 3:** luyện suy luận bằng công thức A + B → kết luận tối thiểu.
- **Ngày 4:** làm chuỗi tin nhắn, theo dõi người nói và thay đổi kế hoạch.
- **Ngày 5:** làm bài đôi; ghi mỗi nửa bằng chứng thuộc tài liệu nào.
- **Ngày 6:** làm bài ba văn bản có bấm giờ và ghi điểm bị chậm.
- **Ngày 7:** làm một cụm mới, sau đó review cả câu sai lẫn câu đoán đúng.

Mục tiêu cuối tuần không chỉ là tỷ lệ đúng cao hơn. Bạn cần giảm số câu không tìm thấy bằng chứng và tăng số đáp án có thể giải thích bằng một hoặc hai dòng cụ thể.

**Nguồn đối chiếu:** [ETS mô tả Part 7 là Reading Comprehension trong TOEIC Listening & Reading](${etsFormat}) và cung cấp [tài liệu luyện thi chính thức](${etsSamples}). Các ví dụ, quy trình và kế hoạch luyện trong bài là nội dung tự biên soạn của TOEIC GYM.`,
  }),
];
