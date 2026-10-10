import type { EditorialPost } from "./editorial";

const dates = {
  publishedAt: new Date("2026-10-10T07:00:00.000Z"),
  createdAt: new Date("2026-10-10T07:00:00.000Z"),
  updatedAt: new Date("2026-10-10T07:00:00.000Z"),
};

function listeningPost(input: Omit<EditorialPost, "status" | "coverMediaId" | "noindex" | "createdBy" | "updatedBy" | "contentOrigin" | "publishedAt" | "createdAt" | "updatedAt">): EditorialPost {
  return { ...input, ...dates, status: "PUBLISHED", coverMediaId: null, noindex: false, createdBy: "editorial", updatedBy: "editorial", contentOrigin: "AI_ASSISTED" };
}

export const ADVANCED_LISTENING_POSTS: EditorialPost[] = [
  listeningPost({
    id: "editorial-part2-indirect-response",
    slug: "toeic-part-2-cau-tra-loi-gian-tiep",
    title: "Câu trả lời gián tiếp TOEIC Part 2: 7 mẫu phản hồi và cách luyện",
    excerpt: "Nhận ra phản hồi không lặp từ hỏi trong TOEIC Part 2 bằng chức năng giao tiếp, ngữ cảnh và bảy mẫu hội thoại tự biên soạn có giải thích bẫy.",
    category: "LISTENING",
    seoTitle: "TOEIC Part 2 câu trả lời gián tiếp: 7 mẫu dễ nhầm",
    seoDescription: "Học 7 mẫu câu trả lời gián tiếp TOEIC Part 2: chưa biết, nhờ người khác, sửa giả định, nêu lý do và đề xuất; kèm ví dụ tự biên soạn.",
    canonicalPath: "/blog/toeic-part-2-cau-tra-loi-gian-tiep",
    coverAlt: "Sơ đồ câu hỏi TOEIC Part 2 nối với câu trả lời gián tiếp",
    editorialCover: "/blog/cover/listening",
    socialTitle: "Part 2: đáp án đúng không nhất thiết trả lời thẳng",
    socialDescription: "Nghe chức năng của phản hồi thay vì săn một từ trùng với câu hỏi.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "TOEIC Part 2 câu trả lời gián tiếp",
    searchIntent: "PART2_INDIRECT_RESPONSE_PRACTICE",
    tags: [{ name: "TOEIC Part 2", slug: "toeic-part-2" }, { name: "TOEIC Listening", slug: "toeic-listening" }],
    content: `## Câu trả lời gián tiếp là gì?

Trong Part 2, đáp án tốt nhất không nhất thiết cung cấp đúng loại thông tin bề mặt mà câu hỏi yêu cầu. “When will the report be ready?” có thể nhận phản hồi “Mina is still checking the figures.” Người nói không nêu ngày, nhưng lý do cho biết báo cáo chưa sẵn sàng. Nếu chỉ chờ Monday, at three hoặc next week, bạn sẽ bỏ lỡ chức năng của lời đáp.

[ETS mô tả Part 2 là dạng Question–Response](https://www.ets.org/toeic/about/listening-reading.html); sample test chính thức cho biết câu hỏi/phát biểu cùng ba phản hồi được nói một lần và không in trong test book. Vì thế, mục tiêu là giữ **ý định câu đầu** rồi đánh giá mỗi phản hồi có hợp với tình huống hay không, không cố nhớ nguyên văn.

Các đoạn và lựa chọn dưới đây do TOEIC GYM tự biên soạn để luyện kỹ thuật, không phải câu hỏi ETS.

## Mẫu 1: “Tôi chưa biết” nhưng chỉ nơi tìm câu trả lời

**Question:** *Where is the updated seating plan?*  
**Best response:** *Nora uploaded the latest file this morning.*

Phản hồi không nói “in the shared folder”, nhưng cho biết Nora đã tải file lên. Trong ngữ cảnh công việc, đây là đầu mối hữu ích hơn một câu trả lời sai ngữ pháp chỉ chứa *where*. Khi chữa, viết chức năng: **chỉ nguồn/người phụ trách**.

Bẫy thường dùng từ cùng trường nghĩa nhưng không tạo hội thoại, chẳng hạn *The seats are comfortable*. Có từ *seats* không làm nó trả lời vị trí của kế hoạch chỗ ngồi.

## Mẫu 2: nêu lý do thay cho yes/no

**Question:** *Can you attend the supplier meeting tomorrow?*  
**Best response:** *I’ll be visiting the north warehouse all day.*

Câu đúng ngụ ý “không thể” qua xung đột lịch. Bạn phải nối *tomorrow* với *all day* và hiểu hai hoạt động không thể diễn ra đồng thời. Đây không phải suy luận xa: lý do trực tiếp giải quyết khả năng tham dự.

Khi nghe câu hỏi yes/no, đừng đợi đúng *yes* hoặc *no*. Chuẩn bị các chức năng: đồng ý, từ chối kèm lý do, chưa chắc, chuyển người xử lý hoặc đề nghị phương án khác.

## Mẫu 3: sửa một giả định sai trong câu hỏi

**Question:** *Why did Leo cancel the afternoon tour?*  
**Best response:** *Actually, it was moved to Friday morning.*

Người hỏi giả định tour bị hủy; phản hồi sửa lại rằng nó được dời lịch. Từ *actually* báo hiệu điều chỉnh thông tin. Nếu chỉ săn câu bắt đầu bằng *because*, bạn dễ chọn một lý do nghe hợp lý nhưng không có quan hệ với sự kiện.

Các tín hiệu tương tự gồm *in fact, not exactly, I thought, it turns out*. Hãy nghe phần sau tín hiệu để cập nhật mô hình tình huống thay vì giữ giả định ban đầu.

## Mẫu 4: nhờ hoặc chỉ người khác xử lý

**Question:** *Who can approve this travel request?*  
**Best response:** *Try asking the finance director.*

Đáp án không dùng cấu trúc “The finance director can”, nhưng chức năng vẫn là chỉ đúng người. *Try asking...*, *You may want to check with...* và *... would know* thường chuyển người hỏi tới nguồn thông tin hoặc người có thẩm quyền.

Bẫy có thể nhắc tới *travel* nhưng trả lời một chủ đề khác, ví dụ *The flight was comfortable*. Chọn theo quan hệ giao tiếp, không theo số từ trùng.

## Mẫu 5: đề xuất phương án thay thế

**Question:** *Should we print fifty copies for the workshop?*  
**Best response:** *Why don’t we send everyone a digital version?*

Đây là đề xuất thay thế, ngụ ý không cần in theo kế hoạch ban đầu. Câu hỏi hình thức *why* trong phản hồi không thật sự hỏi nguyên nhân; nó thực hiện chức năng gợi ý. Học cả cụm *Why don’t we...?*, *How about...?*, *We could...*.

Nếu đáp án khác nói *The printer is near reception*, nó liên quan từ vựng nhưng không giải quyết quyết định số bản in.

## Mẫu 6: việc đã được xử lý

**Question:** *Would you remind the guests about the new entrance?*  
**Best response:** *I sent them a message a few minutes ago.*

Người nói không nói “yes”, nhưng hành động quá khứ cho thấy yêu cầu đã hoàn tất. Các tín hiệu *already, just, a few minutes ago* thường quan trọng. Bạn cần xác định đối tượng *them* có thể quay về *the guests*.

Nếu bỏ lỡ đuôi quá khứ hoặc đại từ, xem lại [âm cuối tiếng Anh](/blog/am-cuoi-tieng-anh-cach-phat-am-khong-them-am) và [ngữ pháp nghe Part 1–2](/blog/ngu-phap-toeic-part-1-2-nghe-cau). Nhận ra hình thức ngữ pháp giúp hiểu trình tự hành động.

## Mẫu 7: câu trả lời nằm trong một điều kiện

**Question:** *Will the outdoor concert start at seven?*  
**Best response:** *As long as the weather stays clear.*

Phản hồi xác nhận có điều kiện. Nó không đảm bảo buổi diễn chắc chắn bắt đầu; thời tiết phải phù hợp. Các cụm *as long as, unless, if everything arrives on time* thay đổi mức chắc chắn và có thể là phần quyết định.

Đừng biến mọi điều kiện thành “yes”. Hãy diễn đạt lại đầy đủ: “Có, nếu trời quang.” Cách này giúp loại đáp án khẳng định tuyệt đối không phù hợp.

## Quy trình ba bước trong vài giây

**Bước 1 — giữ từ hỏi và hành động chính.** Với *When will the technician inspect the elevator?*, giữ “when + inspect elevator”, không cần thuộc cả câu.

**Bước 2 — nghe chức năng, không săn từ khóa.** Mỗi lựa chọn đang cung cấp thời gian, lý do, sửa thông tin, chuyển người, đề xuất hay nói lạc đề?

**Bước 3 — chọn quan hệ tự nhiên nhất.** Đáp án không cần hoàn chỉnh như văn viết, nhưng phải tạo một lượt hội thoại hợp lý. Nếu bỏ lỡ, chốt lựa chọn tốt nhất và chuyển ngay; câu tiếp theo là dữ liệu mới.

[Bài luyện TOEIC Part 2](/toeic/part-2) giúp bạn áp dụng quy trình vào nội dung nghe. Khi chữa, đừng chỉ ghi A/B/C; ghi chức năng của đáp án đúng.

## Bảng lỗi để biết mình cần sửa gì

- **Không giữ được từ hỏi:** luyện nghe phần mở đầu và phân loại who/when/where/why/how.
- **Chọn từ trùng:** buộc bản thân giải thích quan hệ giữa hai lượt nói bằng tiếng Việt.
- **Không hiểu phản hồi gián tiếp:** gắn nhãn bảy chức năng trong bài này.
- **Biết khi nhìn transcript nhưng nghe không ra:** khoanh cụm âm, nghe lại trong cả câu rồi đóng transcript.
- **Sai dây chuyền:** luyện quy tắc bỏ câu cũ và vào lại ngay câu mới.

Một câu đúng do đoán vẫn đưa vào bảng. Điểm số không phát hiện lỗ hổng nếu bạn chỉ review câu sai.

## Bài luyện 15 phút mỗi ngày

Chọn tám đến mười câu mới. Lượt đầu nghe liên tục và trả lời. Lượt hai vẫn chưa mở transcript: nói loại câu hỏi và chức năng đáp án bạn nhớ. Sau đó mở transcript, gạch tín hiệu tạo phản hồi gián tiếp và giải thích vì sao hai lựa chọn còn lại không nối được với lượt đầu.

Cuối buổi, tự tạo hai cặp hỏi–đáp theo mẫu đã sai. Ví dụ với “việc đã xử lý”, viết *Could you reserve the small conference room? — I booked it before lunch.* Đọc thành tiếng cả cặp để nối kiến thức nghĩa với âm thanh.

Sau một tuần, làm nhóm câu trộn mà không biết trước nhãn. Nếu chỉ đúng khi bài báo “hôm nay học câu từ chối”, kỹ năng chưa chuyển giao. Dùng [cách review lỗi TOEIC](/blog/cach-review-loi-sai-toeic) để theo dõi tín hiệu bị bỏ qua.

## Checklist trước khi chuyển sang Part 3

Bạn đã sẵn sàng tăng độ dài khi có thể giữ từ hỏi sau một lượt nghe, nhận ra phản hồi sửa giả định hoặc nêu lý do, không chọn chỉ vì từ trùng và quay lại nhịp sau câu lỡ. Sau đó, chuyển sang [Part 3 hội thoại ba người](/blog/toeic-part-3-hoi-thoai-ba-nguoi) để theo dõi chức năng tương tự qua nhiều lượt lời.

Nếu Part 2 vẫn sai chủ yếu do không nhận ra âm, tiếp tục với [connected speech](/blog/noi-am-tieng-anh-cach-nghe-connected-speech). Nếu nghe rõ nhưng chọn sai quan hệ, ưu tiên phân loại chức năng và bẫy nghĩa thay vì nghe lặp vô hạn.`,
  }),
  listeningPost({
    id: "editorial-part3-three-speakers",
    slug: "toeic-part-3-hoi-thoai-ba-nguoi",
    title: "TOEIC Part 3 hội thoại ba người: sơ đồ vai và bài mẫu tự biên soạn",
    excerpt: "Theo dõi hội thoại ba người bằng sơ đồ vai–vấn đề–hành động, đọc trước câu hỏi và chữa transcript với hai bài mẫu tự biên soạn.",
    category: "LISTENING",
    seoTitle: "TOEIC Part 3 ba người nói: cách nghe không bị rối",
    seoDescription: "Cách làm TOEIC Part 3 hội thoại ba người: phân biệt vai, ghi ký hiệu, theo dõi đổi kế hoạch và luyện với 2 transcript tự biên soạn có lời giải.",
    canonicalPath: "/blog/toeic-part-3-hoi-thoai-ba-nguoi",
    coverAlt: "Sơ đồ ba người nói trong hội thoại TOEIC Part 3",
    editorialCover: "/blog/cover/listening",
    socialTitle: "Part 3 ba người: đừng cố nhớ từng câu",
    socialDescription: "Gắn mỗi giọng với vai trò, vấn đề và hành động tiếp theo.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "TOEIC Part 3 hội thoại ba người",
    searchIntent: "PART3_THREE_SPEAKERS_PRACTICE",
    tags: [{ name: "TOEIC Part 3", slug: "toeic-part-3" }, { name: "TOEIC Listening", slug: "toeic-listening" }],
    content: `## Vì sao ba người nói làm bạn mất dấu?

Khó khăn không chỉ là có thêm một giọng. Bạn phải cập nhật ai biết thông tin gì, ai chịu trách nhiệm và một đề xuất của người này được người nào chấp nhận. Nếu ghi mọi từ, bạn sẽ chậm hơn audio; nếu chỉ nghe từ khóa, bạn có thể gán đúng hành động cho sai người.

Theo format ETS đang công bố, [Part 3 là Conversations trong phần Listening](https://www.ets.org/toeic/about/listening-reading.html). Score user guide mô tả 13 conversations với ba câu hỏi mỗi nhóm. Một số hội thoại có nhiều người nói; câu hỏi vẫn kiểm tra ý chính, chi tiết, mục đích, hàm ý hoặc hành động dự kiến.

Các transcript dưới đây do TOEIC GYM tự biên soạn để luyện sơ đồ vai, không phải nội dung ETS.

## Đọc trước câu hỏi: tìm người và loại thông tin

Trước audio, rút câu hỏi thành ký hiệu. *What problem does the woman mention?* thành **W–problem**. *What will the man probably do next?* thành **M–next**. Nếu có hai giọng cùng giới, dùng vai sau khi nghe mở đầu: **M-manager**, **M-technician** thay vì M1/M2 mơ hồ.

Đáp án có tên chức vụ, bộ phận hoặc hành động sẽ giúp bạn dự đoán sơ đồ. Nhưng dự đoán chỉ hướng sự chú ý; không chọn trước. Khi audio bắt đầu, lấy câu đầu để xác định bối cảnh và người khởi tạo vấn đề.

Bạn không cần dịch đủ bốn lựa chọn nếu điều đó làm lỡ phần mở đầu. Ưu tiên danh từ phân biệt đáp án: invoice, venue, shipment; và động từ hành động: call, revise, deliver.

## Sơ đồ tối giản: vai – vấn đề – hành động

Vẽ hoặc giữ trong đầu ba dòng:

- **A:** vai trò; thông tin mới; việc sẽ làm.
- **B:** vai trò; phản hồi/quyết định; việc sẽ làm.
- **C:** vai trò; điều kiện/thay đổi; việc sẽ làm.

Không ghi câu đầy đủ. Ví dụ: **A event—room small**, **B facilities—hall free Fri**, **C catering—update count**. Các mũi tên giúp theo đề xuất: A asks → B offers → C confirms.

Nếu hình thức thi không cho phép ghi chú theo cách bạn luyện, hãy biến sơ đồ thành ba nhãn trong đầu. Kiểm tra quy định ca thi thay vì giả định được dùng giấy nháp.

## Bài mẫu 1: phòng họp bị đổi

**Maya:** The client workshop has twenty more registrations than expected, so Room 204 will be too small.  
**Jon:** The main hall is free Friday morning, but facilities needs the request before noon today.  
**Luis:** If you reserve the hall, Maya, I’ll ask catering to increase the coffee order.  
**Maya:** Great. I’ll submit the room request as soon as we finish here.

Sơ đồ: **Maya—registration ↑—submit room request**; **Jon—hall free—deadline noon**; **Luis—catering—increase coffee**.

**Question 1: What problem does Maya mention?** Room 204 cannot hold the increased attendance. Bằng chứng nối *twenty more registrations* với *too small*.

**Question 2: What information does Jon provide?** The main hall is available on Friday morning, with a request deadline. Đừng gán việc catering cho Jon chỉ vì nó xuất hiện ngay sau lượt của anh.

**Question 3: What will Luis probably do?** Ask catering to increase the order. Điều kiện *If you reserve the hall* không xóa hành động; nó cho biết hành động phụ thuộc việc Maya đặt phòng.

## Bài mẫu 2: giao hàng và bản thiết kế

**Priya:** The display stands arrived, but their shelves are wider than the measurements in our plan.  
**Evan:** I used the dimensions the supplier sent last month. Did they ship a different model?  
**Rosa:** I checked the labels. It’s the correct model, but the supplier revised the specifications afterward.  
**Evan:** Then I’ll update the floor plan. Rosa, could you send me the new dimensions?  
**Rosa:** Sure, and Priya can tell the installation team to wait until tomorrow.

Sơ đồ: **Priya—stands too wide—inform installers**; **Evan—old dimensions—revise plan**; **Rosa—spec updated—send dimensions**.

Điểm khó là *correct model* không có nghĩa giao hàng hoàn toàn khớp kế hoạch. Vấn đề đến từ specifications được cập nhật sau đó. Một đáp án nói “the wrong product was delivered” hấp dẫn nhưng bị Rosa phủ định.

Khi câu hỏi hỏi Evan sẽ làm gì, chọn update the floor plan; send dimensions thuộc Rosa. Với ba người, đúng hành động nhưng sai chủ thể là bẫy quan trọng.

## Cách xử lý khi hai giọng giống nhau

Đừng cố phân biệt chỉ bằng cao độ. Gắn người với nội dung: người nói về đăng ký là event coordinator; người báo phòng trống là facilities; người nói coffee là catering. Khi giọng quay lại, từ vựng và mục tiêu của lượt nói giúp xác nhận danh tính.

Đại từ và cách xưng hô cũng là tín hiệu. *Maya, I’ll...* cho thấy người nói không phải Maya. *Could you send me...* tạo quan hệ người yêu cầu–người nhận. Nếu transcript cho thấy bạn nghe đúng từ nhưng gán sai vai, bài luyện tiếp theo phải là sơ đồ chủ thể, không phải học thêm từ.

Với audio mới, sau mỗi lượt chỉ tự hỏi: “Ai vừa nói? Họ thêm hoặc đổi điều gì?” Hai câu này đủ giữ mạch mà không phải dịch toàn bộ.

## Dạng đổi kế hoạch và điều kiện

Hội thoại công việc thường mở bằng kế hoạch A rồi chuyển sang B qua *but, instead, actually, then, in that case*. Đáp án có thể hỏi hành động cuối cùng, nên thông tin đầu đoạn chỉ là bối cảnh hoặc bẫy.

Trong bài mẫu 1, phòng 204 là kế hoạch cũ; main hall là phương án mới. Trong bài mẫu 2, measurements cũ giải thích lỗi; revised specifications mới quyết định hành động. Khi nghe từ đổi hướng, gạch kế hoạch cũ trong đầu và cập nhật người chịu trách nhiệm.

Điều kiện cũng cần gắn đúng nhánh. *If you reserve the hall, I’ll ask catering...* nghĩa Luis hành động sau khi Maya đặt phòng; nó không có nghĩa Luis sẽ đặt phòng.

## Câu hỏi hàm ý: nhìn một lượt trước và một lượt sau

Nếu đề trích lời một người và hỏi *What does the speaker mean?*, đừng dịch riêng câu trích. Xem vấn đề vừa được nêu và phản ứng tiếp theo. *Then I’ll update the floor plan* ngụ ý Evan chấp nhận rằng bản plan hiện tại cần thay đổi vì dữ liệu mới.

Viết công thức: **bối cảnh trước + chức năng câu trích + phản ứng sau**. Câu đúng phải giải quyết bối cảnh và phù hợp hành động, không chỉ là nghĩa từ điển. Bạn có thể luyện thêm ở [cách nghe Part 3–4 không dịch từng từ](/blog/cach-luyen-nghe-toeic-part-3-4).

## Quy trình chữa transcript bốn màu

Không cần thật sự dùng bốn bút màu; bốn nhãn là đủ: **speaker**, **problem**, **change**, **next action**. Nghe lại chưa transcript, sau đó mở chữ và gắn nhãn cho từng lượt. Nối mỗi câu hỏi với một hoặc hai dòng tạo đáp án.

Với lựa chọn sai, ghi nó lấy chi tiết từ đâu. “Wrong model” lấy từ câu hỏi của Evan nhưng bị Rosa sửa. Đây là bẫy đúng từ nhưng sai trạng thái. “Jon will order coffee” lấy hành động thật nhưng đổi chủ thể.

Cuối cùng đóng transcript và nghe lại. Nếu giờ mới theo được vai, kỹ thuật đã giúp; hãy kiểm tra trên audio mới để chứng minh chuyển giao.

## Lịch luyện ba buổi

**Buổi 1:** hai hội thoại, không bấm dừng, chỉ ghi/gắn vai và vấn đề. **Buổi 2:** hai hội thoại mới, thêm change và next action. **Buổi 3:** nhóm trộn hai–ba người, bấm giờ và chữa bằng bốn nhãn.

Mỗi buổi 20–25 phút là đủ nếu phần review sâu. Làm tại [trang luyện TOEIC Part 3](/toeic/part-3), rồi ghi câu sai vào [sổ review lỗi](/blog/cach-review-loi-sai-toeic). Nếu không theo kịp ngay câu ngắn, quay lại [câu trả lời gián tiếp Part 2](/blog/toeic-part-2-cau-tra-loi-gian-tiep) để luyện chức năng từng lượt.

## Checklist trước khi chọn đáp án

Ai khởi tạo vấn đề? Người được hỏi là nam/nữ hay vai cụ thể? Kế hoạch nào là cũ và kế hoạch nào là cuối? Hành động thuộc đúng người chưa? Đáp án dựa trên bằng chứng hay chỉ có từ trùng? Nếu có visual, câu hỏi cần nối chi tiết nghe với hàng/cột nào?

Visual là một tầng riêng; sau khi sơ đồ vai ổn, tiếp tục [Part 4 kết hợp bảng biểu](/blog/toeic-part-4-cau-hoi-bang-bieu) để luyện phép nối audio–dữ liệu mà không cố đọc toàn bộ hình.`,
  }),
  listeningPost({
    id: "editorial-part4-visual",
    slug: "toeic-part-4-cau-hoi-bang-bieu",
    title: "TOEIC Part 4 câu hỏi bảng biểu: cách nối audio với dữ liệu nhìn thấy",
    excerpt: "Đọc bảng, lịch và sơ đồ trước khi nghe; xác định ô neo rồi nối chi tiết audio với dữ liệu trực quan qua ba bài mẫu tự biên soạn.",
    category: "LISTENING",
    seoTitle: "TOEIC Part 4 bảng biểu: cách làm và bài mẫu",
    seoDescription: "Cách làm câu hỏi bảng biểu TOEIC Part 4: đọc nhãn, dự đoán ô cần tìm, nghe điểm đổi hướng và nối audio với lịch/bảng qua 3 ví dụ tự biên soạn.",
    canonicalPath: "/blog/toeic-part-4-cau-hoi-bang-bieu",
    coverAlt: "Audio TOEIC Part 4 nối với lịch và bảng thông tin",
    editorialCover: "/blog/cover/listening",
    socialTitle: "Part 4 bảng biểu: tìm ô neo trước khi audio chạy",
    socialDescription: "Không đọc hết visual; dùng câu hỏi để xác định hàng, cột và dữ liệu cần nối.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "TOEIC Part 4 câu hỏi bảng biểu",
    searchIntent: "PART4_VISUAL_QUESTION_PRACTICE",
    tags: [{ name: "TOEIC Part 4", slug: "toeic-part-4" }, { name: "TOEIC Listening", slug: "toeic-listening" }],
    content: `## Dạng visual kiểm tra hai nguồn thông tin cùng lúc

Bạn không thể chọn chỉ từ bảng, cũng không thể chọn chỉ từ audio. Câu hỏi thường yêu cầu lấy một mốc nghe được—tên, giờ, giá, địa điểm hoặc thay đổi—rồi tìm hàng/cột tương ứng trong visual. Sai lầm phổ biến là đọc toàn bộ bảng trước audio hoặc bỏ hẳn bảng để săn một từ trong bài nói.

[ETS xếp Part 4 vào dạng Talks của Listening](https://www.ets.org/toeic/about/listening-reading.html). Format hiện hành có 10 talks với ba câu hỏi mỗi bài; tài liệu chính thức và sample test nên là nguồn để xác nhận cấu trúc. Các bảng và script dưới đây do TOEIC GYM tự biên soạn nhằm luyện thao tác nối dữ liệu.

## Đọc trước theo ba tầng: tiêu đề – trục – điểm khác biệt

Đầu tiên đọc tiêu đề để biết visual là lịch, bảng giá, sơ đồ hay danh sách. Tiếp theo xác định trục: cột là ngày hay dịch vụ, hàng là tên hay địa điểm? Cuối cùng nhìn điểm khác biệt giữa các lựa chọn—đừng đọc các ô không thể trở thành đáp án.

Ví dụ câu hỏi hỏi *Which room will the speaker use?* và bảng có các cột Time, Room, Capacity. Bạn cần nghe mốc time hoặc capacity để khóa một hàng, rồi đọc Room. Không cần ghi nhớ mọi sức chứa.

Viết công thức ngắn cạnh câu hỏi: **audio key → row → answer column**. Trong đầu cũng có thể dùng công thức này nếu không ghi chú.

## Bài mẫu 1: lịch phòng họp

| Time | Room | Capacity |
|---|---|---:|
| 9:00 | Cedar | 12 |
| 10:30 | Maple | 24 |
| 1:00 | Oak | 18 |

**Talk:** *Our training session was originally planned for nine o’clock. Since eighteen employees have registered, we’ll begin ninety minutes later in a room with enough seats. Please arrive ten minutes early.*

**Question:** Which room will the training session use?  
**Reasoning:** *ninety minutes later* từ 9:00 tạo 10:30; hoặc capacity cần ít nhất 18 cũng loại Cedar. Hàng 10:30 dẫn tới **Maple**.

Bẫy Oak có capacity 18 khớp chính xác, nhưng giờ 1:00 không khớp phép thay đổi. Khi hai dữ kiện xuất hiện, chọn hàng thỏa cả hai thay vì bám một con số.

## Bài mẫu 2: bảng giao hàng

| Route | Driver | Departure |
|---|---|---|
| North | Chen | 7:15 |
| East | Patel | 7:40 |
| West | Gomez | 8:05 |

**Talk:** *The East route driver has reported a flat tire. Ms. Gomez, after you finish loading, please take those packages first. Your regular route can leave with the backup driver at eight thirty.*

**Question:** According to the table, what time was Ms. Gomez originally scheduled to depart?  
**Reasoning:** Audio cung cấp tên Ms. Gomez; bảng cung cấp giờ **8:05**. Mốc 8:30 trong audio thuộc backup driver cho regular route sau thay đổi, không phải original schedule của Gomez.

Từ *originally* trong câu hỏi quyết định chọn dữ liệu cũ ở bảng. Đây là ví dụ audio chứa con số hấp dẫn nhưng câu hỏi yêu cầu phép nối với visual.

## Bài mẫu 3: bảng giá dịch vụ

| Package | Includes | Price |
|---|---|---:|
| Basic | Room only | $180 |
| Plus | Room + projector | $230 |
| Complete | Room + projector + refreshments | $310 |

**Talk:** *For Thursday’s seminar, we won’t need food because the session ends before lunch. However, the presenter asked us to display several videos, so please make sure the equipment is included.*

**Question:** Which package will most likely be selected?  
**Reasoning:** No food loại Complete; cần display videos/equipment loại Basic. **Plus** có room + projector và không bắt trả thêm cho refreshments không cần thiết.

Đây là câu suy luận có giới hạn: hai điều kiện trong audio được đối chiếu trực tiếp với cột Includes. Không cần suy đoán ngân sách hoặc sở thích người tổ chức.

## Cách tìm “ô neo” trước khi nghe

Ô neo là thông tin visual mà câu hỏi buộc bạn phải định vị: một tên riêng, mốc giờ, tuyến, sản phẩm hoặc ký hiệu trên sơ đồ. Khoanh bằng mắt tất cả hàng có thể liên quan, sau đó chờ audio cho khóa còn thiếu.

Nếu câu hỏi chứa *According to the schedule*, visual chắc chắn cung cấp một phần đáp án. Nếu hỏi *What will happen at 2:00?*, 2:00 là ô neo; audio có thể nói sự kiện dời sớm/muộn rồi bạn tính hàng mới. Nếu hỏi *Where should visitors go?* với map, audio có thể mô tả landmark hoặc đường đi.

Không chọn ngay từ bảng vì audio thường cập nhật, loại trừ hoặc cung cấp điều kiện. Visual là dữ liệu tĩnh; bài nói cho bạn biết hàng nào đang được nói tới.

## Nghe điểm đổi hướng và từ chỉ quan hệ

Các từ *instead, rather than, no longer, moved to, delayed by, earlier than, after, before* thay đổi hàng hoặc cột. Ghi nhận con số đầu nhưng chờ xem nó là kế hoạch cũ hay mới. Trong bài mẫu 1, 9:00 là original, còn 90 minutes later tạo mốc cuối.

Đại từ và mô tả cũng thay cho nhãn bảng. *The East route driver* trỏ tới hàng East; *a room with enough seats* yêu cầu so capacity. *The package with equipment but no food* trỏ tới thuộc tính, không lặp tên Plus.

Khi chữa, viết phép nối dạng: **heard phrase ↔ table label**. Ví dụ *display videos ↔ projector*, *reported a flat tire ↔ East route*. Đây là paraphrase xuyên hai nguồn.

## Sơ đồ và bản đồ: biến hình thành quan hệ

Với sơ đồ địa điểm, đọc mốc cố định: entrance, elevator, reception, north/south. Audio có thể nói *across from, at the end of the hall, next to, between*. Đừng xoay bản đồ trong đầu liên tục; chọn một hướng chuẩn rồi đi từng quan hệ.

Nếu câu hỏi hỏi một booth theo số, audio có thể nêu công ty hoặc sản phẩm; visual nối tên với số. Nếu hỏi nơi diễn ra hoạt động, audio có thể cho thay đổi địa điểm; từ *now, instead, has been moved* quyết định vị trí cuối.

Tự luyện bằng cách lấy sơ đồ đơn giản, mô tả một đường đi rồi nhờ người khác chọn điểm. Nội dung tự tạo giúp luyện quan hệ không gian mà không sao chép câu hỏi có bản quyền.

## Quy trình trước – trong – sau audio

**Trước:** đọc ba câu hỏi, xác định câu nào cần visual, tìm ô neo và cột đáp án. **Trong:** nghe bối cảnh, khóa hàng bằng tên/giờ/điều kiện, chú ý thay đổi. **Sau:** chọn ô giao giữa hàng đã khóa và cột câu hỏi; chuyển sang câu tiếp theo.

Không dành toàn bộ khoảng nghỉ cho một visual khó. Nếu chưa giải được, loại lựa chọn không thỏa điều kiện rồi chốt. Audio mới quan trọng hơn việc cứu một câu cũ.

Thực hành quy trình với [bài nói TOEIC Part 4 có audio](/toeic/part-4). Bài trên trang có transcript và lời giải để bạn kiểm tra chỗ nối, còn lượt đầu nên làm khi chưa xem chữ.

## Chữa sai theo bốn loại lỗi

**Sai ô neo:** đọc nhầm tên/hàng trước audio. **Sai phép nối:** nghe đúng nhưng không liên hệ *equipment* với projector. **Không cập nhật:** giữ kế hoạch cũ dù có *instead*. **Sai thao tác:** dành quá lâu đọc bảng và bỏ lỡ câu mở đầu.

Mỗi loại có bài sửa khác nhau. Sai ô neo: luyện đọc tiêu đề/trục trong vài giây. Sai phép nối: lập cặp paraphrase. Không cập nhật: khoanh từ đổi hướng trong transcript. Sai thao tác: rehearsal cả nhóm ba câu theo thời gian liên tục.

Đừng ghi chung “không nghe được”. Nếu audio rõ nhưng chọn sai hàng, nghe lặp không chữa kỹ năng đọc visual.

## Lịch luyện một tuần

Ngày 1–2 dùng bảng nhỏ với một phép nối. Ngày 3 dùng lịch có thay đổi thời gian. Ngày 4 dùng bảng thuộc tính cần loại trừ. Ngày 5 dùng sơ đồ vị trí. Ngày 6 trộn visual và câu không visual để luyện phân bổ thời gian. Ngày 7 làm nhóm mới và review lỗi theo bốn nhãn.

Mỗi lượt phải dùng dữ liệu mới nếu mục tiêu là đo chuyển giao. Làm lại bảng cũ chỉ dùng để luyện quy trình. Kết hợp [dictation đoạn ngắn](/blog/dictation-la-gi-cach-nghe-chep-chinh-ta-tieng-anh) khi lỗi nằm ở một cụm số/quan hệ, và [connected speech](/blog/noi-am-tieng-anh-cach-nghe-connected-speech) khi nhìn transcript mới nhận ra cụm quen.

## Checklist 10 giây

Visual là loại gì? Câu hỏi cần cột nào? Ô neo nằm ở đâu? Audio đang nói kế hoạch cũ hay mới? Tôi đã dùng cả dữ liệu nghe và dữ liệu nhìn chưa? Hàng chọn có thỏa mọi điều kiện không?

Nếu bạn theo được bảng nhưng hay gán nhầm hành động cho người, quay lại [Part 3 hội thoại ba người](/blog/toeic-part-3-hoi-thoai-ba-nguoi). Nếu cả đoạn dài đều mất mạch, dùng [lộ trình luyện nghe cho người mất gốc](/blog/cach-luyen-nghe-tieng-anh-cho-nguoi-mat-goc) để giảm độ dài trước khi tăng độ phức tạp visual.`,
  }),
  listeningPost({
    id: "editorial-part34-implied-meaning",
    slug: "toeic-part-3-4-cau-hoi-ham-y-ngu-y",
    title: "Câu hỏi hàm ý TOEIC Part 3–4: nghe chức năng, không dịch nghĩa đen",
    excerpt: "Giải câu hỏi ngụ ý bằng bối cảnh trước, chức năng câu trích và phản ứng sau; luyện với sáu tình huống tự biên soạn và bản đồ bằng chứng.",
    category: "LISTENING",
    seoTitle: "Câu hỏi hàm ý TOEIC Part 3–4: cách làm và ví dụ",
    seoDescription: "Cách làm câu hỏi hàm ý, ngụ ý TOEIC Part 3–4: xác định vấn đề, chức năng câu trích, phản ứng sau và loại bẫy nghĩa đen qua ví dụ tự biên soạn.",
    canonicalPath: "/blog/toeic-part-3-4-cau-hoi-ham-y-ngu-y",
    coverAlt: "Ba bước suy ra hàm ý từ hội thoại TOEIC Part 3 và Part 4",
    editorialCover: "/blog/cover/listening",
    socialTitle: "Nghe hàm ý Part 3–4 bằng ba mảnh bằng chứng",
    socialDescription: "Đừng dịch riêng câu trích; nối vấn đề, chức năng và hành động tiếp theo.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "câu hỏi hàm ý TOEIC Part 3 4",
    searchIntent: "PART34_IMPLIED_MEANING_PRACTICE",
    tags: [{ name: "TOEIC Part 3", slug: "toeic-part-3" }, { name: "TOEIC Part 4", slug: "toeic-part-4" }],
    content: `## Câu hỏi hàm ý không yêu cầu đoán tự do

Khi đề trích một câu rồi hỏi *What does the speaker mean when he/she says, “...” ?*, đáp án không nhất thiết là bản dịch sát. Bạn cần xác định câu nói đang làm gì trong tình huống: từ chối khéo, sửa thông tin, báo đã xử lý, gợi ý phương án, thể hiện lo ngại hoặc chấp nhận một điều kiện.

[ETS mô tả Part 3 là Conversations và Part 4 là Talks](https://www.ets.org/toeic/about/listening-reading.html). ETS cũng nêu năng lực nghe ở mức cao hơn gồm hiểu implied meaning trong hội thoại và thông báo công việc. Các tình huống dưới đây do TOEIC GYM tự biên soạn để luyện thao tác, không phải câu hỏi ETS.

Nguyên tắc quan trọng nhất: hàm ý phải được bối cảnh hỗ trợ. Nếu đáp án cần thêm một sự kiện không có trong audio, đó là suy đoán quá mức.

## Công thức ba mảnh bằng chứng

Viết hoặc giữ trong đầu:

**Vấn đề trước câu trích → chức năng câu trích → phản ứng/hành động sau đó**

Ví dụ: *We need the revised poster by noon.* → *That might be difficult.* → *I can send a draft first.* Câu trích không chỉ nói chung rằng việc gì đó “khó”; nó báo người nói có thể không hoàn thành bản sửa đúng hạn. Phản ứng gửi draft xác nhận cách hiểu này.

Không phải câu nào cũng có đủ lời nói sau đó. Khi không có phản ứng sau, dùng mục tiêu của cả đoạn và câu ngay trước. Nhưng luôn tìm ít nhất một bằng chứng ngoài riêng câu trích.

## Mẫu 1: từ chối bằng xung đột lịch

**A:** *Could you lead the two o’clock orientation?*  
**B:** *That’s when I’m meeting the regional manager.*  
**A:** *All right, I’ll ask Camila instead.*

**Hàm ý:** B không thể hoặc khó dẫn buổi orientation vì có lịch trùng. Câu B không chứa *no*, nhưng *that’s when* nối cùng mốc 2 giờ. Phản ứng của A—tìm Camila—xác nhận lời từ chối.

Bẫy có thể nói “B sẽ mời regional manager đến orientation”. Cả hai danh từ đều có trong audio nhưng không có quan hệ đó.

## Mẫu 2: thông báo việc đã được xử lý

**A:** *The lobby sign still shows last month’s opening hours.*  
**B:** *The replacement is on the printer now.*  
**A:** *Perfect. I’ll put it up before lunch.*

**Hàm ý:** B đã chuẩn bị/in bảng thay thế và nó sẵn sàng để gắn. *On the printer* không có nghĩa bảng đang nằm trên mặt máy in theo nghĩa vị trí đơn thuần; trong ngữ cảnh công việc, replacement đang được in hoặc đã ở hàng in. Phản ứng *I’ll put it up* chứng minh vật sắp sẵn sàng.

Khi đáp án khác nói “máy in cần được thay”, đó là bẫy lấy từ *replacement* nhưng gán sai đối tượng.

## Mẫu 3: sửa giả định của người nghe

**A:** *I thought the shipment was arriving on Thursday.*  
**B:** *That was before the carrier changed its route.*  
**A:** *Then I’ll move the installation to next week.*

**Hàm ý:** Lịch Thursday không còn đúng và shipment sẽ đến muộn hơn hoặc ít nhất đã đổi. Câu B đặt kế hoạch Thursday vào quá khứ bằng *that was before*. Hành động dời installation củng cố kết luận có delay.

Đừng suy ra chính xác shipment đến ngày nào nếu audio không nêu. Đáp án “the delivery schedule has changed” an toàn hơn “it will arrive Friday”.

## Mẫu 4: gợi ý mà không dùng should

**A:** *The conference rooms are all booked for Tuesday.*  
**B:** *The training center across the street has a large classroom.*

**Hàm ý:** B đề xuất xem xét classroom ở training center làm địa điểm thay thế. Câu bề mặt chỉ là một phát biểu về cơ sở vật chất, nhưng nó xuất hiện ngay sau vấn đề thiếu phòng nên thực hiện chức năng suggestion.

Đáp án đúng phải giữ mức độ: “consider another venue”, không biến thành “the training center has already been reserved”. Chưa có hành động đặt phòng trong audio.

## Mẫu 5: thể hiện lo ngại về khả năng hoàn thành

**A:** *Can your team inspect all twelve units by Friday?*  
**B:** *We normally complete only three a day.*

**Hàm ý:** Deadline có thể khó đạt. Tính đơn giản cho thấy 12 units cần khoảng bốn ngày theo tốc độ thông thường, nhưng ngữ cảnh cụ thể còn phụ thuộc ngày bắt đầu. Vì vậy, đáp án nên nói người nói lo ngại hoặc cần đủ thời gian, không khẳng định chắc chắn sẽ trễ.

Các từ *normally, usually, only* giới hạn năng lực hiện tại và thường tạo hàm ý. Chú ý mức chắc chắn trong lựa chọn: *may not* phù hợp hơn *definitely will not* nếu chưa có kết luận tuyệt đối.

## Mẫu 6: chấp nhận có điều kiện

**A:** *Could we add another stop to the delivery route?*  
**B:** *If the driver can leave before seven.*

**Hàm ý:** Có thể thêm điểm dừng nếu đáp ứng điều kiện khởi hành sớm. Đây không phải yes tuyệt đối và cũng không phải từ chối. Đáp án cần giữ điều kiện.

Các cụm *as long as, provided that, unless* cũng tạo quan hệ tương tự. Khi nghe, nối điều kiện với hành động nào nó kiểm soát; đừng tách thành hai sự kiện độc lập.

## Sáu chức năng nên gắn nhãn khi review

- **Refuse/decline:** từ chối qua lý do hoặc xung đột.
- **Correct/update:** sửa giả định hay lịch cũ.
- **Suggest:** nêu lựa chọn có thể giải quyết vấn đề.
- **Reassure/report completion:** cho biết việc đã hoặc đang được xử lý.
- **Express concern:** báo rủi ro, thiếu thời gian hoặc nguồn lực.
- **Accept conditionally:** đồng ý nếu một điều kiện được đáp ứng.

Nhãn không phải đáp án cuối. Nó giúp bạn chuyển từ nghĩa từng từ sang vai trò của lượt nói. Một câu có thể vừa update vừa suggest; chọn chức năng giải quyết trực tiếp câu hỏi và mạch đoạn.

## Bốn loại bẫy thường gặp

**Nghĩa đen đúng nhưng sai ngữ cảnh:** dịch *That’s when I’m meeting...* thành “đó là lúc tôi họp” nhưng không nhận ra lời từ chối. **Đúng chi tiết nhưng sai chức năng:** nhắc regional manager thay vì việc không thể dẫn orientation. **Quá mức:** từ “khó” suy ra chắc chắn hủy. **Đổi chủ thể/thời gian:** hành động đúng nhưng gán cho người khác hoặc kế hoạch cũ.

Khi loại lựa chọn, nói rõ nó sai ở đâu. “Có từ giống audio” không phải lý do chọn; “thêm ngày Friday không được nêu” là lý do loại có thể kiểm chứng.

## Cách đọc trước câu hỏi mà không bỏ lỡ audio

Nếu thấy câu trích trong câu hỏi, đọc nó cùng động từ *mean*. Nhìn nhanh các lựa chọn để xác định chúng khác nhau ở chức năng nào: cancel, delay, ask for help, finish a task. Không cần dịch từng chữ; giữ bốn động từ phân biệt.

Khi audio đến câu trích, đừng dừng xử lý. Lời ngay sau có thể xác nhận hàm ý. Ghi trong đầu một nhãn ngắn rồi tiếp tục nghe hành động cuối. Với [hội thoại ba người](/blog/toeic-part-3-hoi-thoai-ba-nguoi), còn phải gắn câu trích đúng speaker.

Ở Part 4, câu trích có thể thuộc thông báo hoặc lời nhắn của một người; khi đó cấu trúc cả bài—vấn đề, thông báo, yêu cầu—thay cho phản ứng của người đối thoại.

## Quy trình chữa một câu hàm ý

1. Nghe lại cả nhóm chưa xem transcript và tóm tắt vấn đề bằng một câu.
2. Mở transcript, khoanh câu trước, câu trích và câu sau.
3. Gắn nhãn chức năng cho câu trích.
4. Viết paraphrase trung tính, không thêm dữ kiện.
5. Với từng đáp án sai, đánh dấu nghĩa đen, quá mức, sai chủ thể hay sai thời gian.
6. Đóng transcript và nghe lại; sau đó kiểm tra kỹ năng trên audio mới.

Dùng [sổ review lỗi TOEIC](/blog/cach-review-loi-sai-toeic) để lưu chuỗi bằng chứng thay vì chỉ chữ cái. Nếu nhìn transcript mới hiểu mọi từ, tách lỗi âm bằng [dictation](/blog/dictation-la-gi-cach-nghe-chep-chinh-ta-tieng-anh). Nếu nghe rõ nhưng vẫn chọn sai, tập trung chức năng và giới hạn suy luận.

## Bài luyện 20 phút

Làm hai nhóm Part 3 hoặc Part 4 mới tại [hub TOEIC Listening](/toeic/listening). Đánh dấu câu hỏi hàm ý và trả lời trong lượt nghe liên tục. Dành 12 phút chữa hai câu khó nhất theo quy trình sáu bước; sáu phút còn lại tự tạo một mini-dialogue có cùng chức năng nhưng khác bối cảnh.

Ví dụ nếu sai mẫu từ chối gián tiếp, tạo: *Can you cover the evening shift? — My train leaves at six.* Sau đó viết một đáp án đúng “The speaker is unavailable in the evening” và hai đáp án nhiễu lấy từ train/six nhưng sai chức năng.

Cuối tuần, trộn câu hàm ý với ý chính và chi tiết. Nếu biết trước mọi câu đều là inference, bạn có thể bật “chế độ suy luận” không giống bài thật.

## Checklist chọn đáp án

Vấn đề trước câu trích là gì? Câu trích đang từ chối, sửa, gợi ý, trấn an, lo ngại hay đặt điều kiện? Phản ứng/hành động sau có xác nhận cách hiểu không? Đáp án có thêm ngày, người hoặc quyết định chưa được nêu không? Mức chắc chắn có quá mạnh không?

Sau khi vững hàm ý, luyện [Part 4 kết hợp bảng biểu](/blog/toeic-part-4-cau-hoi-bang-bieu) để nối chức năng lời nói với nguồn dữ liệu thứ hai. Nếu Part 2 cũng hay sai vì phản hồi không trực tiếp, quay lại [bảy mẫu trả lời gián tiếp](/blog/toeic-part-2-cau-tra-loi-gian-tiep).`,
  }),
];
