export type GrammarLesson = { slug: string; label: string; summary: string };
export type GrammarUnit = { id: string; title: string; intro: string; lessons: GrammarLesson[] };

export const GRAMMAR_LEARNING_PATH: GrammarUnit[] = [
  {
    id: "nen-tang",
    title: "1. Nền tảng câu và danh từ",
    intro: "Bắt đầu từ bộ khung câu, rồi quyết định cách dùng danh từ, mạo từ và đại từ.",
    lessons: [
      { slug: "cau-truc-cau-tieng-anh-co-ban", label: "Cấu trúc câu S–V–O", summary: "Tìm chủ ngữ và động từ chính trước khi xử lý chỗ trống." },
      { slug: "loai-tu-trong-toeic-part-5", label: "Loại từ", summary: "Nhận diện danh từ, động từ, tính từ và trạng từ theo vị trí." },
      { slug: "danh-tu-dem-duoc-khong-dem-duoc-tieng-anh", label: "Danh từ đếm được và không đếm được", summary: "Chọn số nhiều, lượng từ và động từ phù hợp." },
      { slug: "mao-tu-a-an-the-va-khong-mao-tu", label: "Mạo từ a, an, the", summary: "Phân biệt một đối tượng chưa xác định và đối tượng đã rõ." },
      { slug: "dai-tu-va-tu-han-dinh-toeic", label: "Đại từ và từ hạn định", summary: "Chọn they, them, their và theo dõi từ tham chiếu." },
      { slug: "hoa-hop-chu-ngu-dong-tu-toeic", label: "Hòa hợp chủ ngữ – động từ", summary: "Chia động từ theo chủ ngữ chính, bỏ qua cụm chen giữa." },
    ],
  },
  {
    id: "dong-tu-va-thoi-gian",
    title: "2. Động từ, thời gian và thể",
    intro: "Đọc mốc thời gian và hướng hành động để chọn thì, modal verbs hoặc dạng bị động.",
    lessons: [
      { slug: "ngu-phap-toeic-part-5-can-hoc", label: "Bảy nhóm ngữ pháp Part 5 cần ưu tiên", summary: "Chọn đúng chủ điểm khi thời gian ôn TOEIC có hạn." },
      { slug: "hien-tai-don-va-hien-tai-tiep-dien", label: "Hiện tại đơn và hiện tại tiếp diễn", summary: "Tách thói quen khỏi việc đang diễn ra hoặc tạm thời." },
      { slug: "qua-khu-don-va-qua-khu-tiep-dien", label: "Quá khứ đơn và quá khứ tiếp diễn", summary: "Nhận ra sự kiện chính và bối cảnh đang diễn ra." },
      { slug: "hien-tai-hoan-thanh-va-qua-khu-don", label: "Hiện tại hoàn thành và quá khứ đơn", summary: "Chọn theo mốc đã khép lại hoặc kết quả còn liên quan hiện tại." },
      { slug: "hien-tai-hoan-thanh-va-hoan-thanh-tiep-dien", label: "Hiện tại hoàn thành và hoàn thành tiếp diễn", summary: "Nhấn kết quả đã xong hoặc quá trình kéo dài đến hiện tại." },
      { slug: "qua-khu-hoan-thanh-va-hoan-thanh-tiep-dien", label: "Quá khứ hoàn thành và hoàn thành tiếp diễn", summary: "Xác định việc đã xong hay đang kéo dài trước một mốc quá khứ." },
      { slug: "tuong-lai-will-going-to-hien-tai-tiep-dien", label: "Các cách nói tương lai", summary: "Phân biệt will, going to, lịch hẹn và lịch trình." },
      { slug: "thi-va-dang-dong-tu-toeic", label: "Tổng quan thì và dạng động từ", summary: "Đặt các thì vào cùng một trục thời gian TOEIC." },
      { slug: "cau-bi-dong-toeic-part-5", label: "Câu bị động", summary: "Kiểm tra chủ ngữ làm hay nhận hành động." },
      { slug: "dong-tu-khuyet-thieu-can-must-should-may", label: "Động từ khuyết thiếu", summary: "Diễn tả khả năng, lời khuyên, nghĩa vụ và sự cho phép." },
      { slug: "ving-va-to-infinitive-toeic", label: "V-ing và to-infinitive", summary: "Chọn dạng động từ theo từ hoặc cụm đứng trước." },
      { slug: "used-to-be-used-to-get-used-to", label: "Used to, be used to, get used to", summary: "Tách thói quen quá khứ khỏi trạng thái hoặc quá trình đã quen." },
      { slug: "cau-khien-have-get-something-done", label: "Câu khiến", summary: "Phân biệt tự làm, nhờ người làm và khiến ai làm." },
    ],
  },
  {
    id: "bo-nghia-va-lien-ket",
    title: "3. Bổ nghĩa và liên kết ý",
    intro: "Mở rộng câu bằng tính từ, trạng từ, so sánh, giới từ và từ nối.",
    lessons: [
      { slug: "tu-bo-nghia-toeic-part-5", label: "Từ bổ nghĩa", summary: "Xác định từ nào đang được tính từ hoặc trạng từ mô tả." },
      { slug: "so-sanh-va-luong-tu-toeic", label: "So sánh và lượng từ", summary: "Phân biệt fewer/less và more/most theo danh từ, ngữ cảnh." },
      { slug: "gioi-tu-toeic-trong-cong-viec", label: "Giới từ", summary: "Học cụm công việc và phân biệt mốc hạn chót." },
      { slug: "lien-tu-va-tu-noi-toeic", label: "Liên từ và từ nối", summary: "Chọn quan hệ nguyên nhân, đối lập hoặc bổ sung." },
      { slug: "menh-de-muc-dich-va-ket-qua-so-such-enough", label: "Mục đích và kết quả", summary: "Phân biệt so that, in order to, so...that, such...that." },
      { slug: "cau-truc-song-song-parallel-structure", label: "Cấu trúc song song", summary: "Giữ hai vế nối cùng chức năng ngữ pháp." },
    ],
  },
  {
    id: "menh-de-va-cau-phuc",
    title: "4. Mệnh đề và cấu trúc câu phức",
    intro: "Luyện đọc mệnh đề phụ, câu hỏi gián tiếp và các cấu trúc trang trọng.",
    lessons: [
      { slug: "cau-hoi-va-cau-phu-dinh-tieng-anh", label: "Câu hỏi và câu phủ định", summary: "Dùng do/does/did hoặc đảo trợ động từ đúng cách." },
      { slug: "menh-de-quan-he-toeic", label: "Mệnh đề quan hệ", summary: "Chọn who, which, whose, where theo vai trò còn thiếu." },
      { slug: "menh-de-danh-tu-va-cau-hoi-gian-tiep", label: "Mệnh đề danh từ", summary: "Dùng what, whether, if và giữ trật tự câu kể." },
      { slug: "menh-de-thoi-gian-when-while-before-after", label: "Mệnh đề thời gian", summary: "Xác định thứ tự sự kiện và thì sau when, while, until." },
      { slug: "cau-dieu-kien-tieng-anh-if-wish", label: "Câu điều kiện và wish", summary: "Tách điều thực tế khỏi giả định hiện tại và quá khứ." },
      { slug: "cau-tuong-thuat-tieng-anh-said-told-asked", label: "Câu tường thuật", summary: "Đổi góc nhìn thời gian với said, told, asked." },
      { slug: "menh-de-rut-gon-phan-tu-ving-v3", label: "Mệnh đề rút gọn", summary: "Chọn V-ing chủ động hoặc V3 bị động." },
      { slug: "dao-ngu-tieng-anh-only-never-not-only", label: "Đảo ngữ", summary: "Nhận ra trợ động từ sau only, never và not only." },
      { slug: "cau-gia-dinh-recommend-that-be", label: "Câu giả định sau recommend và essential", summary: "Dùng động từ nguyên mẫu trong mệnh đề nêu yêu cầu." },
    ],
  },
];

export const GRAMMAR_LESSONS = GRAMMAR_LEARNING_PATH.flatMap(unit => unit.lessons);

export function relatedGrammarLessons(slug: string, limit = 3): GrammarLesson[] {
  const unit = GRAMMAR_LEARNING_PATH.find(item => item.lessons.some(lesson => lesson.slug === slug));
  if (!unit) return [];
  const index = unit.lessons.findIndex(lesson => lesson.slug === slug);
  const candidates = [unit.lessons[index + 1], unit.lessons[index - 1], ...unit.lessons].filter(
    (lesson): lesson is GrammarLesson => Boolean(lesson && lesson.slug !== slug),
  );
  return [...new Map(candidates.map(lesson => [lesson.slug, lesson])).values()].slice(0, limit);
}
