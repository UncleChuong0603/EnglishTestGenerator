import Link from "next/link";
import { ChallengeStartButton } from "@/components/challenge-start-button";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { startPart5Challenge } from "../actions";
import styles from "./challenge-intro.module.css";

export const metadata = publicPageMetadata({
  title: "Thử thách TOEIC Part 5: 10 câu miễn phí",
  description: "Làm 10 câu TOEIC Part 5 miễn phí, không cần đăng nhập. Xem độ chính xác, nhóm kỹ năng và giải thích sau khi nộp bài.",
  canonical: "/challenge/part-5",
});

export default async function Part5ChallengePage({ searchParams }: PageProps<"/challenge/part-5">) {
  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);
  const locale = (await getPreferences(user?.id)).interfaceLanguage;
  const vi = locale === "vi";
  const steps = vi
    ? [
      { number: "01", title: "Làm 10 câu", body: "Ngữ pháp và từ vựng trong định dạng hoàn thành câu." },
      { number: "02", title: "Xem lời giải", body: "Biết câu nào sai và vì sao đáp án đúng phù hợp." },
      { number: "03", title: "Chọn bài tiếp", body: "Dùng kết quả để chọn chủ điểm cần luyện thêm." },
    ]
    : [
      { number: "01", title: "Answer 10 questions", body: "Grammar and vocabulary in the sentence completion format." },
      { number: "02", title: "Read explanations", body: "See which answers you missed and why the right one fits." },
      { number: "03", title: "Choose what is next", body: "Use your result to pick a useful topic to practice." },
    ];

  return <div className={styles.page}>
    <a className={styles.skipLink} href="#main-content">{vi ? "Bỏ qua điều hướng" : "Skip to content"}</a>
    <PublicHeader locale={locale} showPrimary={false} signedIn={Boolean(user)} />
    <main id="main-content">
    <div className={styles.wrap}>
      <nav aria-label={vi ? "Điều hướng thử thách" : "Challenge navigation"} className={styles.breadcrumb}><Link href="/">{vi ? "Trang chủ" : "Home"}</Link><span aria-hidden="true">/</span><span>Part 5</span></nav>
      <section aria-labelledby="challenge-title" className={styles.hero}>
        <div className={styles.intro}>
          <p className={styles.kicker}>TOEIC GYM / PART 5</p>
          <h1 id="challenge-title">{vi ? "Bắt đầu bằng 10 câu. Hiểu rõ từng lỗi sai." : "Start with 10 questions. Understand every mistake."}</h1>
          <p className={styles.lead}>{vi ? "Làm một bài ngắn về ngữ pháp và từ vựng. Xem kết quả và lời giải ngay sau khi nộp, rồi chọn phần cần luyện tiếp." : "Take a short grammar and vocabulary set. See results and explanations after submission, then choose what to practice next."}</p>
          <div className={styles.facts}><span>10 {vi ? "câu" : "questions"}</span><span>{vi ? "Không cần tài khoản" : "No account needed"}</span><span>{vi ? "Có lời giải" : "Explanations included"}</span></div>
          {query.error ? <p className={styles.error} role="alert">{query.error === "limit" ? (vi ? "Bạn đã dùng hết lượt tạo bài hôm nay. Lượt tiếp theo sẽ có khi hạn mức được đặt lại; lúc này bạn có thể ôn một chủ điểm Part 5." : "You have used today's session allowance. You can start again when it resets; meanwhile, review a Part 5 topic.") : (vi ? "Chưa thể tạo đủ 10 câu cho bài này. Hãy thử lại sau hoặc chọn bài luyện khác." : "A full 10-question set is unavailable right now. Please try again later or choose another practice set.")}</p> : null}
          {query.error === "limit" ? <Link className={styles.startButton} href="/toeic/part-5">{vi ? "Ôn lại Part 5" : "Review Part 5"} <span aria-hidden="true">↗</span></Link> : <form action={startPart5Challenge} className={styles.action}><ChallengeStartButton className={styles.startButton} label={vi ? "Bắt đầu ngay" : "Start now"} pendingLabel={vi ? "Đang chuẩn bị bài…" : "Preparing your questions…"} /></form>}
          <p className={styles.note}>{vi ? "Kết quả thể hiện độ chính xác của bài này, không phải điểm TOEIC chính thức hoặc dự đoán điểm." : "The result shows accuracy on this set, not an official or predicted TOEIC score."}</p>
        </div>
        <aside aria-label={vi ? "Bạn sẽ làm gì trong bài thử" : "What to expect from this practice"} className={styles.process}>
          <p className={styles.processHeading}>{vi ? "SAU KHI BẮT ĐẦU" : "AFTER YOU START"}</p>
          <ol>{steps.map((step) => <li key={step.number}><span>{step.number}</span><div><h2>{step.title}</h2><p>{step.body}</p></div></li>)}</ol>
        </aside>
      </section>
      <div className={styles.followup}><p>{vi ? "Muốn xem cách làm trước khi bắt đầu?" : "Want a quick guide before you start?"}</p><Link href="/toeic/part-5">{vi ? "Đọc hướng dẫn Part 5" : "Read the Part 5 guide"} <span aria-hidden="true">↗</span></Link></div>
    </div>
    </main>
    <PublicFooter locale={locale} />
  </div>;
}
