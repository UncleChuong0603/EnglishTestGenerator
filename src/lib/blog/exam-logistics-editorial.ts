import type { EditorialPost } from "./editorial";

const dates = {
  publishedAt: new Date("2026-10-10T03:00:00.000Z"),
  createdAt: new Date("2026-10-10T03:00:00.000Z"),
  updatedAt: new Date("2026-10-10T03:00:00.000Z"),
};

function logisticsPost(input: Omit<EditorialPost, "status" | "coverMediaId" | "noindex" | "createdBy" | "updatedBy" | "contentOrigin" | "publishedAt" | "createdAt" | "updatedAt">): EditorialPost {
  return { ...input, ...dates, status: "PUBLISHED", coverMediaId: null, noindex: false, createdBy: "editorial", updatedBy: "editorial", contentOrigin: "AI_ASSISTED" };
}

export const EXAM_LOGISTICS_POSTS: EditorialPost[] = [
  logisticsPost({
    id: "editorial-toeic-computer-vs-paper",
    slug: "thi-toeic-tren-may-tinh-hay-tren-giay",
    title: "Thi TOEIC trên máy tính hay trên giấy? Cách chọn bằng một buổi thử",
    excerpt: "So sánh trải nghiệm đọc, nghe, chọn đáp án và quản lý thời gian; dùng bài rehearsal để chọn hình thức TOEIC phù hợp thay vì dựa vào cảm giác.",
    category: "EXAM_TIPS",
    seoTitle: "Thi TOEIC trên máy tính hay trên giấy tốt hơn?",
    seoDescription: "So sánh thi TOEIC trên máy tính và trên giấy theo thao tác, nghe, Reading, trả điểm và lịch thi; kèm bài thử 40 phút để chọn hình thức phù hợp.",
    canonicalPath: "/blog/thi-toeic-tren-may-tinh-hay-tren-giay",
    coverAlt: "Màn hình máy tính và phiếu trả lời giấy để chọn hình thức thi TOEIC",
    editorialCover: "/blog/cover/exam_tips",
    socialTitle: "TOEIC thi máy hay giấy: thử trước khi chọn",
    socialDescription: "Đừng chọn theo lời truyền miệng; đo tốc độ, độ chính xác và mức mệt trên cả hai cách làm.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "thi TOEIC trên máy tính hay trên giấy",
    searchIntent: "TOEIC_COMPUTER_PAPER_DECISION",
    tags: [{ name: "Thi TOEIC", slug: "thi-toeic" }, { name: "TOEIC trên máy tính", slug: "toeic-tren-may-tinh" }],
    content: `## Câu trả lời ngắn: hình thức tốt hơn là hình thức bạn đã thử đúng thao tác

Thi máy không tự động dễ hơn vì có màn hình; thi giấy cũng không tự động tốt hơn vì bạn quen cầm bút. Khác biệt quan trọng nằm ở cách mắt đọc, tai nghe, tay chọn đáp án, khả năng theo dõi câu đã làm và mức mệt sau một chặng dài. Cách chọn đáng tin nhất là thử cùng loại nội dung trên cả hai giao diện rồi so dữ liệu.

Bài TOEIC Listening & Reading vẫn đo hai kỹ năng với 200 câu trong khoảng hai giờ; [handbook IIG đang công bố](https://iigvietnam.com/wp-content/uploads/2025/12/H%C6%AF%E1%BB%9ANG%20D%E1%BB%B0%20THI%20TOEIC%20ONLINE%20P%C4%90%20upd%2021Nov25.pdf) mô tả 45 phút Listening và 75 phút Reading. Tuy nhiên, hình thức đang mở, giao diện, thiết bị, cách trả điểm và lựa chọn tại từng địa điểm có thể thay đổi. Hãy coi thông tin trên [cổng đăng ký IIG](https://online.iigvietnam.com/) cùng email xác nhận của ca thi là nguồn quyết định.

Bài này được đối chiếu ngày **10/10/2026**. Nó không giả định mọi địa điểm và ngày thi đều cung cấp cả hai hình thức.

## So sánh theo việc bạn thực sự phải làm

Với máy tính, bạn đọc trên màn hình và chọn đáp án bằng thiết bị của phòng thi. Điểm cần thử trước là khả năng đọc đoạn dài, chuyển giữa câu hỏi và văn bản, theo dõi đồng hồ, sửa lựa chọn và duy trì tập trung trước màn hình. Đừng suy diễn tính năng từ một website luyện thi: giao diện thi thật có thể khác.

Với giấy, bạn đọc đề in và ghi đáp án theo quy trình của ca thi. Điểm cần thử là tốc độ chuyển đáp án, nguy cơ lệch dòng, khả năng quản lý dấu đánh dấu và việc đọc tài liệu dài trên trang. Chỉ sử dụng dụng cụ được đơn vị tổ chức cho phép; danh sách vật dụng trong một bài blog cũ không thay thế hướng dẫn ngày thi.

Nếu cổng đăng ký mô tả thêm điều kiện hoặc dịch vụ của một hình thức, chụp/lưu xác nhận sau thanh toán. [Hướng dẫn đăng ký TOEIC online](/blog/dang-ky-thi-toeic-online-iig) có checklist đối chiếu đúng bài thi, ngày, địa điểm và thông tin giấy tờ.

## Listening: tai nghe hay môi trường phòng thi không thay thế kỹ năng nghe

Người học thường chọn thi máy vì kỳ vọng âm thanh “dễ nghe hơn”. Chất lượng thiết bị và cách phát âm thanh phải được xác nhận theo ca thi; dù nghe bằng thiết bị nào, audio vẫn đòi hỏi bạn theo kịp một lượt phát và chuyển sang câu tiếp theo. Nếu bỏ lỡ, việc tiếp tục nghe quan trọng hơn cố nhớ câu cũ.

Hãy thử một nhóm [TOEIC Part 3 có audio và transcript](/toeic/part-3) trong hai điều kiện: một lượt bằng tai nghe ở âm lượng vừa, một lượt bằng loa trong phòng yên tĩnh. Không dùng cùng đoạn vì trí nhớ làm sai kết quả. Ghi số câu đúng, câu đoán, thời điểm mất mạch và mức âm lượng khiến bạn nghe rõ nhưng không mệt.

Mục đích không phải mô phỏng chính xác thiết bị IIG tại nhà. Bạn đang kiểm tra mình có phụ thuộc bất thường vào một cách nghe hay không. Nếu cả hai đều khó ở cùng cụm âm, dùng [quy trình chữa Listening bằng transcript](/blog/cach-luyen-nghe-toeic-part-3-4) thay vì đổi hình thức thi để né lỗi kỹ năng.

## Reading: màn hình và giấy tạo hai kiểu tải nhận thức

Trên màn hình, một số người quét câu hỏi nhanh nhưng mỏi mắt hoặc khó giữ vị trí trong văn bản dài. Trên giấy, một số người định vị đoạn tốt hơn nhưng mất thời gian khi chuyển đáp án hoặc dễ lệch dòng. Không có kết luận chung cho mọi thí sinh; bạn cần đo trên chính mắt và thao tác của mình.

Thử hai chặng Reading mới, mỗi chặng 20 phút, có tỷ lệ Part 5–7 tương tự. Chặng A làm hoàn toàn trên màn hình, không ghi ra giấy nếu điều đó không chắc được phép ở ca thi. Chặng B in ra, chọn đáp án và chuyển sang một phiếu tự tạo. Ghi ba số: đúng/tổng, câu chưa làm và số lần phải tìm lại vị trí.

Nếu độ chính xác gần nhau, dùng mức mệt và số thao tác thừa để quyết định. Nếu một hình thức tốt hơn rõ, lặp lại bằng bộ mới vào ngày khác trước khi kết luận. [Khung chia 75 phút Reading](/blog/quan-ly-thoi-gian-toeic-reading-75-phut) giúp bạn kiểm tra mốc chuyển Part ở cả hai cách.

## Bài rehearsal 40 phút để chọn hình thức

1. Chuẩn bị hai bộ câu mới có độ dài và dạng gần nhau; không dùng lại câu đã thuộc.
2. Làm bộ thứ nhất trên màn hình trong 20 phút. Không pause, không tra từ và ghi thời gian còn lại khi đổi Part.
3. Nghỉ đủ để giảm hiệu ứng mệt, rồi làm bộ thứ hai trên giấy trong điều kiện tương tự.
4. Chấm và ghi câu đúng do đoán, lỗi thao tác, lỗi kiến thức, mức mỏi mắt/tay và khả năng giữ vị trí.
5. Một ngày khác, đổi thứ tự máy–giấy để tránh hình thức làm sau bị bất lợi do mệt.

Chỉ so khi hai bộ tương đối tương đương; đây không phải thí nghiệm hoàn hảo nhưng tốt hơn lựa chọn từ một bình luận trên mạng. Nếu một hình thức thắng cả hai lượt về độ chính xác lẫn sự ổn định, đó là tín hiệu hữu ích. Nếu kết quả chia đều, lịch thi, địa điểm và deadline hồ sơ có thể là yếu tố quyết định.

## Khi nào nên nghiêng về thi trên máy tính?

Bạn có thể nghiêng về máy nếu đọc màn hình dài vẫn ổn, thao tác chọn/sửa đáp án không gây mất nhịp, kết quả rehearsal ổn định và ca thi phù hợp deadline. [FAQ IIG hiện tại](https://iigvietnam.com/faq/) cho biết một số bài thi trên máy tính, trong đó có TOEIC, có thể hiển thị điểm ngay sau khi hoàn thành; điều này khác với thời gian nhận chứng chỉ hoặc phiếu điểm bản cứng.

Đừng chọn chỉ vì “biết điểm nhanh”. Nơi nhận hồ sơ có thể cần giấy tờ cụ thể, không chấp nhận ảnh màn hình hay con số bạn tự ghi. Đọc [TOEIC bao lâu có kết quả](/blog/thi-toeic-bao-lau-co-ket-qua) và hỏi nơi nhận họ cần loại giấy nào trước khi tính ngày thi.

## Khi nào nên nghiêng về thi trên giấy?

Bạn có thể nghiêng về giấy nếu định vị thông tin trên trang tốt hơn, mắt nhanh mệt trước màn hình, việc chuyển đáp án đã được luyện ổn định và ca thi giấy phù hợp. Nhưng “quen làm giấy” chỉ có ý nghĩa khi bạn đã luyện cả thao tác chuyển đáp án dưới thời gian. Một lần lệch dòng có thể làm hỏng nhiều câu dù kiến thức đúng.

Trong rehearsal, hãy kiểm tra định kỳ số câu trên đề và phiếu, đặc biệt sau khi bỏ qua câu khó. Xây một quy tắc cố định: chuyển từng câu hoặc từng nhóm nhỏ, rồi rà số thứ tự. Không chờ đến phút cuối mới chuyển toàn bộ nếu bạn chưa chứng minh cách đó an toàn trong nhiều lượt luyện.

## Những thông tin phải xác nhận trước khi trả phí

- Tên chính xác của bài thi và số kỹ năng nơi nhận yêu cầu.
- Hình thức của ca thi đang chọn, địa điểm và giờ có mặt.
- Quy định giấy tờ, ảnh, đổi/hủy và hỗ trợ đặc biệt nếu cần.
- Thời điểm biết điểm, cách nhận phiếu/chứng chỉ và thời gian chuyển phát.
- Số tiền hiển thị ở bước thanh toán cùng dịch vụ bổ sung đã chọn.

Nếu yêu cầu đầu ra không ghi rõ hai hay bốn kỹ năng, đọc [TOEIC 2 kỹ năng và 4 kỹ năng](/blog/toeic-2-ky-nang-va-4-ky-nang) rồi xác nhận trực tiếp với đơn vị tiếp nhận. Việc chọn đúng giao diện không bù được việc đăng ký nhầm bài thi.

## Kết luận và checklist quyết định

Chọn máy nếu dữ liệu rehearsal cho thấy bạn đọc, nghe và thao tác ổn trên màn hình; chọn giấy nếu định vị, sức bền và chuyển đáp án tốt hơn trên bản in. Khi hai kết quả gần nhau, ưu tiên ca thi phù hợp deadline, địa điểm và quy trình nhận giấy tờ. Không dùng tin đồn “đề máy dễ hơn” hoặc “thi giấy được điểm cao hơn” nếu không có bằng chứng áp dụng cho bạn.

Trước khi chốt, ghi một dòng cho mỗi câu: Tôi đã thử cả hai trên câu mới chưa? Hình thức nào ít lỗi thao tác hơn? Tôi cần điểm hiển thị hay giấy tờ bản cứng? Ca nào chừa đủ biên cho hạn hồ sơ? Email xác nhận ghi gì? Sau đó dùng [checklist ngày thi TOEIC](/blog/kinh-nghiem-thi-toeic-ngay-thi) để chuẩn bị cho đúng hình thức đã chọn.`,
  }),
  logisticsPost({
    id: "editorial-toeic-result-timeline",
    slug: "thi-toeic-bao-lau-co-ket-qua",
    title: "Thi TOEIC bao lâu có kết quả? Phân biệt điểm, phiếu điểm và chuyển phát",
    excerpt: "Mốc trả kết quả TOEIC phụ thuộc bài thi, hình thức và địa điểm. Phân biệt điểm hiện sau thi với giấy tờ bản cứng để tính ngược deadline hồ sơ.",
    category: "EXAM_TIPS",
    seoTitle: "Thi TOEIC bao lâu có kết quả và nhận ở đâu?",
    seoDescription: "TOEIC bao lâu có kết quả? Xem mốc IIG công bố cho L&R, Speaking & Writing, cách tính ngày làm việc và biên an toàn khi nhận phiếu điểm.",
    canonicalPath: "/blog/thi-toeic-bao-lau-co-ket-qua",
    coverAlt: "Lịch tính ngày thi, ngày có điểm và ngày nhận phiếu TOEIC",
    editorialCover: "/blog/cover/exam_tips",
    socialTitle: "Điểm TOEIC có khi nào và giấy tờ về lúc nào?",
    socialDescription: "Ba mốc khác nhau cần tính riêng trước deadline hồ sơ.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "thi TOEIC bao lâu có kết quả",
    searchIntent: "TOEIC_RESULT_TIMELINE",
    tags: [{ name: "Kết quả TOEIC", slug: "ket-qua-toeic" }, { name: "Thi TOEIC", slug: "thi-toeic" }],
    content: `## Câu trả lời nhanh theo thông tin IIG đang công bố

Trang hỏi đáp TOEIC của IIG nêu mốc Listening & Reading sau **5 ngày làm việc** tại văn phòng Trung Yên – Hà Nội và **7–10 ngày làm việc** tại chi nhánh TP.HCM/Đà Nẵng cùng các test site khác. Speaking & Writing được nêu là **16 ngày** tại Trung Yên và **21 ngày** tại các địa điểm còn lại; chuyển phiếu về nhà có thể lâu hơn **2–3 ngày**. Xem [bảng gốc của IIG](https://toeic.iigvietnam.com/faq_toeic/bao-gio-co-ket-qua-thi-toeic/).

Trang nguồn này mang ngày đăng 19/08/2023, còn bài của TOEIC GYM được đối chiếu lại ngày **10/10/2026**. Vì lịch, địa điểm, hình thức và dịch vụ có thể đổi, mốc ghi trên đơn đăng ký/email xác nhận của ca thi mới là thông tin ưu tiên. [FAQ IIG hiện tại](https://iigvietnam.com/faq/) cũng cho biết một số bài TOEIC trên máy tính có thể cho thí sinh biết điểm ngay sau khi hoàn thành, nhưng giấy tờ bản cứng vẫn được nhận sau.

Vì vậy, câu “có kết quả” phải được tách thành ba mốc: biết con số, giấy tờ sẵn sàng và giấy tờ đến tay.

## Ba loại mốc thường bị gọi chung là kết quả

**Mốc 1 — biết điểm:** ở một số ca thi trên máy tính, điểm có thể hiển thị sau khi nộp bài theo FAQ hiện hành. Con số này giúp bạn lên kế hoạch nhưng không mặc nhiên là tài liệu được trường hoặc doanh nghiệp chấp nhận.

**Mốc 2 — phiếu điểm/chứng chỉ sẵn sàng:** đây là lúc đơn vị tổ chức thông báo có thể nhận giấy tờ theo quy trình. Nó phụ thuộc bài thi, địa điểm và hình thức.

**Mốc 3 — giấy tờ đến tay:** nếu nhận trực tiếp, cần tính thời gian đi lấy và giờ làm việc; nếu chuyển phát, cộng thời gian vận chuyển. Nếu gửi thẳng đến nơi tiếp nhận, hỏi cách ghi người nhận và phương thức đối soát.

Khi hỏi hỗ trợ, đừng chỉ nói “bao giờ có bằng”. Gửi tên bài thi, hình thức, ngày/ca, địa điểm, mã đăng ký và loại giấy tờ bạn cần. Câu hỏi cụ thể giúp tránh nhận câu trả lời cho một bài thi khác.

## Cách tính ngày làm việc đúng

“Năm ngày làm việc” không luôn bằng bảy ngày theo lịch. Không tính Thứ Bảy, Chủ Nhật và ngày nghỉ lễ nếu thông báo quy định như vậy. Ví dụ minh họa: thi vào Thứ Sáu trước một tuần không có ngày lễ, năm ngày làm việc tiếp theo thường đi qua Thứ Hai đến Thứ Sáu của tuần sau; nhưng kỳ nghỉ lễ có thể đẩy mốc xa hơn.

Đừng tự chốt ngày nhận chỉ bằng cách cộng trên lịch. Hãy ghi khoảng sớm–muộn, sau đó đối chiếu ngày trả kết quả hiển thị cho chính ca thi. Nếu deadline rơi sát cuối tuần hoặc kỳ nghỉ, thêm biên an toàn. Bài viết này không thay thế email xác nhận.

Một bảng tính đơn giản nên có: ngày thi, số ngày làm việc được thông báo, ngày dự kiến giấy sẵn sàng, phương thức nhận, số ngày chuyển phát dự phòng và hạn cuối nơi nhận phải có hồ sơ.

## Tính ngược từ deadline hồ sơ

Bắt đầu bằng ngày trường/doanh nghiệp phải **nhận đủ giấy tờ**, không phải ngày bạn muốn thi. Trừ thời gian chuyển phát hoặc đi nhận; trừ tiếp thời gian trả kết quả theo ca; rồi thêm biên cho ngày nghỉ, sai thông tin, cần thi lại hoặc yêu cầu xác minh. Ngày còn lại là hạn thi an toàn hơn.

Ví dụ, nếu hồ sơ phải đến vào cuối tháng, đừng chọn ca chỉ vừa đủ theo mốc sớm nhất. Một chậm trễ nhỏ có thể khiến điểm hợp lệ nhưng giấy đến muộn. Nếu nơi nhận cho bổ sung sau deadline hoặc chấp nhận xác minh điện tử, yêu cầu họ xác nhận bằng văn bản.

Khi chưa đăng ký, xem [cách chọn và khai ca thi trên cổng IIG](/blog/dang-ky-thi-toeic-online-iig). Khi đang phân vân hình thức, [so sánh thi máy và giấy bằng rehearsal](/blog/thi-toeic-tren-may-tinh-hay-tren-giay) giúp cân bằng tốc độ biết điểm với trải nghiệm làm bài.

## Trường hợp thi Listening & Reading trên máy tính

FAQ IIG nói một số bài thi trên máy tính có thể cho biết điểm sau khi hoàn thành. Hãy coi đây là **điểm được hiển thị**, không tự biến ảnh chụp hoặc ghi nhớ thành phiếu điểm. Quy tắc bảo mật và hình thức nhận kết quả phải theo hướng dẫn của ca thi.

Trước khi chọn vì cần gấp, hỏi bốn việc: điểm có hiện sau thi ở đúng ca này không; khi nào giấy tờ bản cứng sẵn sàng; có thể chuyển phát hay nhận trực tiếp; nơi nộp hồ sơ chấp nhận tài liệu nào. Nếu câu trả lời cuối là “chỉ nhận bản cứng”, lợi thế biết con số ngay không rút ngắn toàn bộ quy trình.

Không dựa vào trải nghiệm của một thí sinh ở địa điểm khác. Cùng tên bài thi nhưng quy trình giao nhận có thể khác theo test site và thời điểm.

## Trường hợp thi trên giấy hoặc tại test site khác

Mốc IIG công bố cho L&R ngoài Trung Yên là 7–10 ngày làm việc, nhưng ca của bạn có thể có ngày trả kết quả cụ thể. Kiểm tra trên đơn/email và kênh lịch thi, rồi lưu lại. Nếu test site là trường hoặc đối tác, hỏi bạn nhận từ IIG, từ test site hay qua bộ phận nhà trường.

Nếu cần chuyển phát, xác nhận địa chỉ, số điện thoại và người nhận trước ngày thi. Thời gian chuyển phát được IIG nêu là có thể cộng thêm 2–3 ngày so với nhận trực tiếp; địa chỉ xa, ngày nghỉ hoặc giao lại có thể làm thời gian thực tế khác đi.

Đừng đặt vé đi lấy kết quả chỉ dựa vào mốc ước tính. Chờ trạng thái hoặc thông báo sẵn sàng nếu quy trình yêu cầu.

## Speaking & Writing có cùng thời gian không?

Không nên lấy mốc L&R áp cho Speaking & Writing. Trang IIG nêu S&W sau 16 ngày tại Trung Yên và 21 ngày tại các địa điểm còn lại, với cách loại trừ ngày nghỉ được mô tả trên nguồn. Đây là khoảng dài hơn đáng kể khi tính hồ sơ bốn kỹ năng.

Nếu nơi nhận yêu cầu bốn điểm, hồ sơ chỉ hoàn tất khi đủ tài liệu họ quy định. Đọc [TOEIC 2 kỹ năng và 4 kỹ năng](/blog/toeic-2-ky-nang-va-4-ky-nang) để không đăng ký nhầm; sau đó tính deadline theo phần có thời gian trả chậm hơn, không theo L&R riêng.

Với câu hỏi về Speaking/Writing hiện hành, dùng tên bài và ca cụ thể khi liên hệ IIG. Các bài gộp, bài riêng hoặc chương trình tổ chức qua trường có thể có quy trình khác nhau.

## Nếu đến ngày dự kiến vẫn chưa nhận được kết quả

Kiểm tra email, thư rác, tài khoản đăng ký và thông báo của test site. Đối chiếu ngày làm việc thay vì ngày lịch. Chuẩn bị mã đăng ký, họ tên, ngày sinh, ngày thi, địa điểm và phương thức nhận trước khi liên hệ hỗ trợ. Không đăng công khai số giấy tờ tùy thân hay ảnh phiếu điểm lên mạng để nhờ tra cứu.

Nếu hồ sơ sắp hết hạn, báo cho nơi tiếp nhận sớm và hỏi phương án được chấp nhận. Không tự khẳng định “IIG đang chậm” khi chưa kiểm tra ca cụ thể; có thể bạn đang tính cả cuối tuần, chọn chuyển phát hoặc chờ qua bộ phận trung gian.

Giữ email thanh toán, email xác nhận dự thi và biên nhận dịch vụ. Đây là dữ liệu giúp bộ phận hỗ trợ tìm đúng hồ sơ.

## Phiếu điểm còn hạn đến khi nào?

Thời gian chờ nhận kết quả khác với thời hạn sử dụng. ETS nêu điểm TOEIC có giá trị hai năm từ ngày thi; ngày giấy được phát không làm mốc hai năm bắt đầu muộn hơn. [Hướng dẫn tính thời hạn TOEIC](/blog/bang-toeic-co-thoi-han-bao-lau) có ví dụ về ngày thi, ngày hết hạn và yêu cầu riêng của nơi nhận.

Khi tính hồ sơ dài hạn, bạn cần tránh hai cực: thi quá muộn khiến giấy không kịp đến, và thi quá sớm khiến điểm gần hết hạn tại mốc xét. Lấy deadline, thời gian trả kết quả và thời hạn hai năm đặt trên cùng một lịch.

## Checklist trước và sau khi thi

Trước thanh toán: xác nhận đúng bài, hình thức, địa điểm, ngày trả dự kiến, loại giấy cần nộp và cách nhận. Sau thanh toán: lưu email, kiểm tra chính tả tên và địa chỉ, đặt nhắc lịch. Ngày thi: giữ mã đăng ký và làm theo hướng dẫn nhận kết quả. Sau thi: phân biệt điểm hiển thị với giấy tờ chính thức và chỉ chia sẻ dữ liệu cá nhân qua kênh phù hợp.

Nếu chưa thi, dùng [lịch thi TOEIC và cách chọn ngày](/blog/lich-thi-toeic-cach-tra-cuu-chon-ngay) để tính ngược. Nếu đã có lịch, [checklist ngày thi](/blog/kinh-nghiem-thi-toeic-ngay-thi) giúp rà giấy tờ và nhịp làm bài mà không thay đổi chiến thuật phút cuối.`,
  }),
  logisticsPost({
    id: "editorial-toeic-schedule",
    slug: "lich-thi-toeic-cach-tra-cuu-chon-ngay",
    title: "Lịch thi TOEIC: cách tra cứu ca còn chỗ và chọn ngày an toàn",
    excerpt: "Tra lịch TOEIC theo khu vực và bài thi trên cổng IIG, rồi tính ngược từ hạn hồ sơ, thời gian trả kết quả và khoảng dự phòng thay vì chọn ngày gần nhất.",
    category: "EXAM_TIPS",
    seoTitle: "Lịch thi TOEIC 2026: tra cứu và chọn ngày thi",
    seoDescription: "Cách tra lịch thi TOEIC 2026 theo khu vực, bài thi và ca còn chỗ; tính ngày thi từ deadline hồ sơ, thời gian trả kết quả và kế hoạch ôn.",
    canonicalPath: "/blog/lich-thi-toeic-cach-tra-cuu-chon-ngay",
    coverAlt: "Lịch thi TOEIC với ngày thi, trả kết quả và hạn nộp hồ sơ",
    editorialCover: "/blog/cover/exam_tips",
    socialTitle: "Chọn lịch TOEIC bằng deadline, không bằng ngày gần nhất",
    socialDescription: "Tra đúng bài, đúng khu vực và chừa đủ thời gian cho kết quả cùng phương án dự phòng.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "lịch thi TOEIC 2026",
    searchIntent: "TOEIC_SCHEDULE_LOOKUP_DECISION",
    tags: [{ name: "Lịch thi TOEIC", slug: "lich-thi-toeic" }, { name: "Đăng ký TOEIC", slug: "dang-ky-toeic" }],
    content: `## Lịch thi thay đổi liên tục: tra ở đâu mới đúng?

Ca còn chỗ phụ thuộc khu vực, bài thi, hình thức và thời điểm bạn mở cổng. Vì vậy, một bảng ngày thi chép lại trong bài blog sẽ nhanh lỗi thời. [FAQ IIG](https://iigvietnam.com/faq/) hướng dẫn vào cổng đăng ký, chọn mục **Lịch thi**, nhập khu vực và bài thi rồi tra cứu; chỉ các lịch đang mở và còn trống mới có ý nghĩa cho quyết định hiện tại.

Bài này được kiểm tra ngày **10/10/2026** và hướng dẫn cách chọn, không sao chép một lịch tĩnh. Mở [cổng đăng ký IIG](https://online.iigvietnam.com/) trong tab riêng, rồi đối chiếu từng bước. Nếu giao diện thay đổi, tên trường trên cổng và hướng dẫn của IIG được ưu tiên.

Trước khi tra, xác định bạn cần Listening & Reading, Speaking, Writing hay tổ hợp bốn kỹ năng. Nếu văn bản chỉ ghi “TOEIC 650”, hỏi nơi nhận họ cần bài nào; [bài so sánh TOEIC 2 và 4 kỹ năng](/blog/toeic-2-ky-nang-va-4-ky-nang) giúp bạn đặt câu hỏi đúng.

## Cách tra lịch theo khu vực và bài thi

Đăng nhập cổng chính thức bằng tài khoản của bạn. Vào mục lịch thi, chọn khu vực hoặc địa điểm có thể đến, rồi chọn đúng tên bài. Ghi lại ngày, giờ, hình thức nếu được hiển thị, địa điểm và ngày trả kết quả. Đừng chỉ nhìn ô đầu tiên còn chỗ.

Nếu không thấy ca mong muốn, kiểm tra bộ lọc, tên bài và khu vực. Không suy ra bài đã ngừng tổ chức chỉ từ một ngày không có chỗ. FAQ IIG cho biết lịch mở tiếp theo được cập nhật thường xuyên trên cổng; bạn có thể kiểm tra lại hoặc liên hệ kênh hỗ trợ chính thức.

Không chuyển tiền qua đường dẫn do tài khoản lạ gửi. Bắt đầu từ website IIG, kiểm tra tên miền và giữ email xác nhận. [Checklist đăng ký TOEIC online](/blog/dang-ky-thi-toeic-online-iig) giải thích cách rà hồ sơ và thanh toán.

## Chọn ngày bằng cách tính ngược từ hạn hồ sơ

Viết ngày nơi nhận phải có đủ giấy tờ. Trừ thời gian chuyển phát hoặc đi lấy, trừ thời gian trả kết quả, rồi thêm biên cho cuối tuần/ngày lễ, sai hồ sơ và khả năng cần thi lại. Sau đó so với mức sẵn sàng hiện tại để chọn ca.

Ví dụ minh họa: bạn có hạn nộp cuối tháng nhưng giấy dự kiến sẵn sàng sát deadline. Dù ca đó còn chỗ, nó không phải lựa chọn an toàn nếu hồ sơ bắt buộc bản cứng. Một ca sớm hơn hoặc địa điểm có quy trình phù hợp có thể tốt hơn. Đọc [TOEIC bao lâu có kết quả](/blog/thi-toeic-bao-lau-co-ket-qua) để phân biệt ngày biết điểm với ngày nhận giấy.

Yêu cầu nơi nhận xác nhận họ tính ngày nộp, ngày nhận hay ngày xác minh; có chấp nhận bổ sung hay không. Một giả định sai ở đây quan trọng hơn vài ngày chênh lệch trong lịch ôn.

## Đánh giá mức sẵn sàng trước khi chốt ca

Đừng dùng cảm giác “học gần xong”. Làm một bài mới trong điều kiện có thời gian, ghi riêng Listening, Reading, câu đúng do đoán và nhóm lỗi. Một quiz ngắn giúp tìm điểm yếu nhưng không đủ để dự đoán sức bền toàn bài. Nếu kết quả gần mục tiêu và lỗi tập trung ở một vài dạng có thể sửa, ca sau một chu kỳ review có thể hợp lý hơn ca quá gần.

Nếu đang quanh 450, [lộ trình 450 lên 550](/blog/lo-trinh-toeic-450-len-550) ưu tiên nền và lỗi quy tắc. Từ 550, [kế hoạch 550 lên 650](/blog/lo-trinh-toeic-550-len-650) thêm paraphrase và thời gian. Mục tiêu cao hơn cần [chu kỳ 650 lên 800](/blog/lo-trinh-toeic-650-len-800) với nhiều văn bản và sức bền.

Các lộ trình là khung học, không bảo đảm một ngày cụ thể. Nếu dữ liệu chưa ổn nhưng deadline bắt buộc, đăng ký với kỳ vọng thực tế và chuẩn bị phương án hồ sơ cùng nơi tiếp nhận.

## Chọn địa điểm: đừng chỉ tính quãng đường

So thời gian di chuyển ở đúng khung giờ, phương án nếu mưa/kẹt xe, chỗ gửi xe hoặc giao thông công cộng và khả năng đến sớm theo yêu cầu. Kiểm tra địa chỉ trong email xác nhận; đừng dùng địa chỉ cũ từ một bài viết hoặc bản đồ đã lưu lâu.

Địa điểm còn ảnh hưởng cách nhận kết quả. Hỏi giấy được nhận tại đâu, qua test site hay chuyển phát. Nếu thi qua trường/đơn vị, quy trình có thể đi qua bộ phận phụ trách thay vì quầy IIG. Chọn điểm thi xa hơn một chút nhưng quy trình phù hợp deadline đôi khi hợp lý hơn điểm gần.

Nếu cần hỗ trợ đặc biệt, handbook IIG đề nghị liên hệ trước; đừng đợi đến ngày thi mới yêu cầu. Ghi nhu cầu trong quá trình đăng ký và lưu xác nhận.

## Chọn thi máy hay giấy trong lịch đang mở

Không phải mọi ca đều có cả hai lựa chọn. Nếu cổng hiển thị hình thức, chỉ so các ca thực sự còn chỗ. Đừng tin bảng tổng hợp ngoài cổng hơn thông tin của đơn đăng ký.

Trước khi chọn, làm [bài rehearsal máy–giấy 40 phút](/blog/thi-toeic-tren-may-tinh-hay-tren-giay). So độ chính xác, câu bỏ trống, lỗi thao tác và mức mệt. Nếu hình thức phù hợp không có vào ngày mong muốn, cân nhắc đổi ngày hoặc địa điểm thay vì vào phòng thi với thao tác chưa từng luyện.

Nếu cần giấy gấp, xác nhận riêng thời gian điểm hiển thị và thời gian phiếu/chứng chỉ sẵn sàng. “Thi máy biết điểm sớm” không đồng nghĩa hồ sơ bản cứng đến tay ngay.

## Khoảng cách giữa hai lần thi và phương án dự phòng

[Handbook IIG đang công bố](https://iigvietnam.com/wp-content/uploads/2025/12/H%C6%AF%E1%BB%9ANG%20D%E1%BB%B0%20THI%20TOEIC%20ONLINE%20P%C4%90%20upd%2021Nov25.pdf) nêu hai lần thi TOEIC liên tiếp phải cách nhau tối thiểu **5 ngày làm việc**. Đây chỉ là khoảng cách tối thiểu theo quy định được nêu, không có nghĩa năm ngày là đủ để sửa năng lực hoặc nhận xong kết quả trước.

Nếu dự kiến một lượt dự phòng, đặt cả khoảng cách thi, thời gian trả kết quả lần hai và deadline hồ sơ lên lịch. Kiểm tra lại quy định hiện hành trước thanh toán vì chính sách có thể cập nhật. Không giữ nhiều ca bằng cách vi phạm điều khoản hoặc tạo tài khoản khác.

Một phương án dự phòng tốt cũng có thể là thi sớm hơn, chọn chuyển phát phù hợp, xác nhận quyền bổ sung hồ sơ hoặc điều chỉnh mục tiêu; không nhất thiết luôn là đăng ký hai lượt sát nhau.

## Tránh mất chỗ hoặc thanh toán nhầm

FAQ IIG hiện hành mô tả việc đăng ký hoàn tất sau khi thanh toán và nhận email xác nhận; thời gian giữ phiên thanh toán có giới hạn. Chuẩn bị trước ảnh, giấy tờ, thông tin cá nhân và phương thức thanh toán. Khi đến bước cuối, đọc lại tên bài, nghề nghiệp/đối tượng, địa điểm, ngày, dịch vụ kèm và tổng tiền.

Nếu trạng thái không rõ, đừng thanh toán lặp ngay. Kiểm tra email, lịch sử giao dịch và liên hệ hỗ trợ với mã liên quan. Không gửi OTP, mật khẩu hoặc toàn bộ ảnh giấy tờ cho tài khoản tự xưng hỗ trợ qua mạng xã hội.

Lệ phí và dịch vụ là dữ liệu thay đổi; số tiền hiển thị trên hồ sơ trước khi thanh toán là mốc cần đối chiếu. Lưu ảnh hoặc PDF xác nhận cho mục đích cá nhân nhưng che dữ liệu nhạy cảm khi chia sẻ.

## Lịch ôn từ ngày đã chọn

Sau khi chốt ca, chia thời gian còn lại thành ba giai đoạn. Giai đoạn đầu sửa hai lỗi lớn nhất; giai đoạn giữa trộn dạng và bấm giờ; giai đoạn cuối mô phỏng, review và ổn định nhịp sinh hoạt. Chừa ít nhất một ngày nhẹ trước thi thay vì nhồi đề đến khuya.

Mỗi tuần ghi số câu mới, câu đoán, lỗi lặp lại và hành động tuần sau bằng [checklist học TOEIC](/toeic/checklist-hoc-tuan). Nếu một buổi mô phỏng cho thấy Reading hết giờ, thử [công cụ chia 75 phút](/blog/quan-ly-thoi-gian-toeic-reading-75-phut). Nếu Listening mất mạch, tập quay lại ở câu tiếp theo chứ không pause mọi đoạn.

Lịch thi là một deadline hỗ trợ kỷ luật, không phải phép biến đổi năng lực. Điều chỉnh khối lượng theo dữ liệu và sức khỏe thay vì cố hoàn thành một số đề cố định.

## Checklist chốt lịch TOEIC

Trước khi thanh toán, xác nhận: đúng bài thi; đúng khu vực; hình thức đã hiểu; đủ thời gian trả giấy; deadline còn biên; giấy tờ/ảnh hợp lệ; tổng tiền và dịch vụ đúng; email/số điện thoại truy cập được. Sau thanh toán, lưu xác nhận, đặt nhắc lịch và đọc chính sách đổi/hủy của chính đơn.

Một tuần trước thi, kiểm tra lại địa chỉ, giờ có mặt, giấy tờ bản gốc và phương thức di chuyển. Tối trước thi, dùng [checklist ngày thi TOEIC](/blog/kinh-nghiem-thi-toeic-ngay-thi), không thay toàn bộ chiến thuật. Sau thi, theo dõi mốc kết quả bằng thông tin của ca thay vì một lịch chép lại trên blog.`,
  }),
];
