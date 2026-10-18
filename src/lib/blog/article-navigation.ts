import type { PostCategory } from "./core";

type Locale = "vi" | "en";

export type ArticleAction = {
  title: string;
  body: string;
  label: string;
  href: string;
};

export type ArticleHub = {
  label: string;
  href: string;
  description: string;
};

const localized = (locale: Locale, vi: string, en: string) => locale === "vi" ? vi : en;

export function articleNextStep(category: PostCategory, locale: Locale, signedIn: boolean): ArticleAction {
  const personalizedHref = signedIn ? "/dashboard" : "/try";

  switch (category) {
    case "LISTENING":
      return {
        title: localized(locale, "Nghe tiếp theo đúng lỗi vừa nhận ra", "Practice the listening gap you just identified"),
        body: localized(locale, "Chọn Part 1–4, nghe audio tự biên soạn rồi đối chiếu transcript và lời giải.", "Choose Part 1–4, listen to original audio, then review the transcript and explanation."),
        label: localized(locale, "Chọn bài nghe theo Part", "Choose a listening Part"),
        href: "/toeic/listening",
      };
    case "GRAMMAR":
      return {
        title: localized(locale, "Áp dụng quy tắc vào câu Part 5", "Apply the rule to Part 5 questions"),
        body: localized(locale, "Làm bảy câu hỗn hợp có lời giải để kiểm tra bạn nhận ra cấu trúc khi không biết trước chủ điểm.", "Try seven mixed questions with explanations and check whether you can spot the structure without a topic hint."),
        label: localized(locale, "Luyện Part 5 có lời giải", "Practice Part 5 with explanations"),
        href: "/toeic/part-5/practice",
      };
    case "VOCABULARY":
      return {
        title: localized(locale, "Ôn từ trong ngữ cảnh công sở", "Review vocabulary in workplace context"),
        body: localized(locale, "Dùng flashcard để nhớ cả cụm từ và gặp lại từ trong câu thay vì học một bản dịch rời rạc.", "Use flashcards to remember complete phrases and meet each word in a sentence instead of learning an isolated translation."),
        label: localized(locale, "Mở flashcard từ vựng", "Open vocabulary flashcards"),
        href: "/toeic/flashcards-tu-vung-cong-so",
      };
    case "EXAM_REVIEW":
      return {
        title: localized(locale, "Chuyển phần sửa đề thành một lượt thi thử", "Turn the review into a mock-test attempt"),
        body: localized(locale, "Chọn bài phù hợp với thời gian hiện có, làm liền mạch rồi quay lại đúng nhóm lỗi cần sửa.", "Choose a test that fits your available time, complete it in one sitting, then return to the error group that needs work."),
        label: localized(locale, "Chọn bài thi thử", "Choose a mock test"),
        href: "/thi-thu-toeic-online",
      };
    case "READING":
      return {
        title: localized(locale, "Đưa chiến thuật đọc vào một bài ngắn", "Use the reading strategy in a short practice"),
        body: localized(locale, "Làm một lượt ngắn và dùng lời giải để xác định bằng chứng hoặc cấu trúc đã bỏ qua.", "Try a short set and use the explanations to identify the evidence or structure you missed."),
        label: signedIn
          ? localized(locale, "Mở bài luyện được gợi ý", "Open recommended practice")
          : localized(locale, "Thử bài luyện miễn phí", "Try free practice"),
        href: personalizedHref,
      };
    case "TOEIC_STRATEGY":
    case "STUDY_PLAN":
    case "EXAM_TIPS":
    default:
      return {
        title: localized(locale, "Biết phần nào nên luyện tiếp", "Know what to practice next"),
        body: localized(locale, "Làm bài đánh giá ngắn để thấy Part cần ưu tiên và nhận bước luyện tiếp theo từ kết quả thực tế.", "Take a short diagnostic to identify the Part to prioritize and get a useful next step from your result."),
        label: signedIn
          ? localized(locale, "Xem bài nên luyện tiếp", "See what to practice next")
          : localized(locale, "Làm bài đánh giá miễn phí", "Take the free diagnostic"),
        href: personalizedHref,
      };
  }
}

export function articleHub(category: PostCategory, locale: Locale): ArticleHub {
  const hubs: Record<PostCategory, ArticleHub> = {
    TOEIC_STRATEGY: { href: "/toeic", label: localized(locale, "bản đồ TOEIC 7 Part", "the seven-Part TOEIC map"), description: localized(locale, "để nối chiến thuật này với đúng dạng câu hỏi", "to connect this strategy to the right question type") },
    LISTENING: { href: "/toeic/listening", label: localized(locale, "thư viện Listening Part 1–4", "the Part 1–4 Listening library"), description: localized(locale, "để chọn audio và dạng lỗi cần luyện", "to choose audio and the listening gap to practice") },
    READING: { href: "/toeic/part-7", label: localized(locale, "hướng dẫn TOEIC Reading Part 7", "the TOEIC Reading Part 7 guide"), description: localized(locale, "để luyện tìm bằng chứng trong từng loại văn bản", "to practice finding evidence in each document type") },
    GRAMMAR: { href: "/ngu-phap", label: localized(locale, "Ngữ pháp TOEIC A–Z", "TOEIC Grammar A–Z"), description: localized(locale, "để chọn bài trước hoặc sau chủ điểm này", "to choose the lesson before or after this topic") },
    VOCABULARY: { href: "/toeic/tu-vung", label: localized(locale, "100 từ vựng TOEIC theo chủ đề", "100 TOEIC words by topic"), description: localized(locale, "để gặp lại từ trong các tình huống công sở", "to meet the words again in workplace situations") },
    STUDY_PLAN: { href: "/blog", label: localized(locale, "thư viện lộ trình và chiến lược", "the study-plan and strategy library"), description: localized(locale, "để chọn kế hoạch phù hợp với mục tiêu hiện tại", "to choose a plan that fits your current goal") },
    EXAM_TIPS: { href: "/toeic", label: localized(locale, "cấu trúc và các Part của bài TOEIC", "the TOEIC format and Parts"), description: localized(locale, "để chuẩn bị đúng phần trước ngày thi", "to prepare the right section before test day") },
    EXAM_REVIEW: { href: "/thi-thu-toeic-online", label: localized(locale, "trung tâm thi thử TOEIC", "the TOEIC mock-test hub"), description: localized(locale, "để chọn bài ngắn hoặc bài dài phù hợp", "to choose a suitable short or long test") },
  };
  return hubs[category];
}

