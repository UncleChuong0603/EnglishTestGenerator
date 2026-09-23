import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { PricingSection } from "@/components/pricing-section";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getPaymentCatalog } from "@/lib/payments/catalog";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const user = await getCurrentUser();
  const locale = (await getPreferences(user?.id)).interfaceLanguage;
  const vi = locale === "vi";
  const primary = user ? "/dashboard" : "/challenge/part-5";
  const copy = vi ? {
    eyebrow: "Luyện TOEIC có hướng đi",
    title: "Biết mình đang ở đâu. Biết hôm nay nên học gì.",
    body: "Bắt đầu với 10 câu Part 5, xem kết quả thật và lời giải cho câu sai. Khi lưu kết quả, TOEIC GYM gợi ý bài luyện tiếp theo từ lịch sử học của bạn.",
    primary: "Thử thách Part 5 miễn phí", secondary: "Khám phá bài luyện khác",
    reassurance: "10 câu Part 5 · Không cần tài khoản · Xem kết quả ngay",
    caveat: "Kết quả là độ chính xác của bài làm, không phải điểm TOEIC chính thức hay dự đoán điểm.",
    example: "Một kết quả dễ hiểu", exampleBody: "Bạn nhìn thấy Part nào cần thêm thời gian và có một bước luyện tiếp theo.",
    sample: "Ví dụ minh họa, không phải kết quả của bạn", focus: "Nên tập trung",
    next: "Bài tiếp theo", nextValue: "Part 3 · Hội thoại ngắn",
    method: "Học theo một vòng rõ ràng",
    methodBody: "Mỗi lần luyện đều cho bạn một lý do để bắt đầu và một việc để làm sau khi hoàn thành.",
    steps: [
      ["01", "Làm bài để hiểu mình", "Bắt đầu với câu hỏi Listening và Reading, rồi xem độ chính xác theo Part."],
      ["02", "Luyện đúng phần cần thiết", "Nhận một bài luyện gợi ý với thời lượng và lý do chọn bài rõ ràng."],
      ["03", "Quay lại câu đã sai", "Ôn lỗi sai, kiểm tra lại và theo dõi phần bạn đã nắm chắc hơn."],
    ],
    closing: "Bắt đầu từ bài làm của chính bạn.",
    closingBody: "Thử miễn phí trước. Khi muốn lưu kết quả và học tiếp theo lộ trình cá nhân, bạn có thể tạo tài khoản.",
  } : {
    eyebrow: "TOEIC practice with direction",
    title: "Know where you are. Know what to study today.",
    body: "Start with 10 Part 5 questions, see your real result and review missed answers. When you save the result, TOEIC GYM suggests your next workout from your learning history.",
    primary: "Try the free Part 5 challenge", secondary: "Explore other practice",
    reassurance: "10 Part 5 questions · No account needed · Immediate results",
    caveat: "Results show your raw accuracy, not an official TOEIC score or score prediction.",
    example: "A result you can use", exampleBody: "See which Part needs more time and what to practice next.",
    sample: "Illustration only, not your result", focus: "Focus area",
    next: "Next workout", nextValue: "Part 3 · Short conversations",
    method: "A clear way to keep learning",
    methodBody: "Each session gives you a reason to start and a useful next step when you finish.",
    steps: [
      ["01", "Practice to understand", "Answer Listening and Reading questions and see your accuracy by Part."],
      ["02", "Work on what matters", "Get a suggested workout with a clear length and reason for the choice."],
      ["03", "Return to mistakes", "Review missed questions and follow the skills you are starting to master."],
    ],
    closing: "Start with your own answers.",
    closingBody: "Try it free. Create an account when you want to save your results and continue your learning path.",
  };
  return (
    <main className="marketing-page min-h-screen overflow-x-hidden">
      <PublicHeader locale={locale} signedIn={Boolean(user)} />
      <section className="marketing-hero">
        <div className="marketing-hero-copy">
          <p className="section-kicker">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="marketing-lead">{copy.body}</p>
          <div className="marketing-actions">
            <Link className="button-primary" href={primary}>{user ? (vi ? "Tiếp tục học" : "Continue learning") : copy.primary}<span aria-hidden="true">↗</span></Link>
            {!user && <Link className="button-text" href="/try#quick-practice">{copy.secondary} <span aria-hidden="true">→</span></Link>}
          </div>
          <p className="marketing-reassurance">{copy.reassurance}</p>
          <p className="marketing-caveat">{copy.caveat}</p>
        </div>
        <div className="marketing-hero-image">
          <Image src="/images/study-desk.webp" alt={vi ? "Góc bàn học với vở trắng và tai nghe" : "A quiet study desk with a blank notebook and headphones"} fill priority sizes="(max-width: 900px) 100vw, 48vw" />
          <div className="marketing-image-caption">TOEIC GYM <span aria-hidden="true">/</span> {vi ? "Từng buổi học có mục đích" : "A purpose for every session"}</div>
        </div>
      </section>
      <section className="marketing-example" aria-labelledby="example-title">
        <div className="marketing-section-intro">
          <p className="section-kicker">{vi ? "Khi tiếp tục luyện" : "As you keep practicing"}</p>
          <h2 id="example-title">{copy.example}</h2>
          <p>{copy.exampleBody}</p>
        </div>
        <ProductPreview copy={copy} />
      </section>
      <section className="marketing-method" id="how-it-works" aria-labelledby="method-title">
        <div className="marketing-section-intro">
          <p className="section-kicker">{vi ? "Cách học" : "How it works"}</p>
          <h2 id="method-title">{copy.method}</h2>
          <p>{copy.methodBody}</p>
        </div>
        <ol className="method-steps">{copy.steps.map(([number, title, detail]) => <li key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{detail}</p></li>)}</ol>
      </section>
      <PricingSection compact locale={locale} products={getPaymentCatalog()} startHref={primary} />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6" aria-labelledby="learn-toeic-title">
        <p className="section-kicker">{vi ? "Bắt đầu từ kiến thức nền" : "Start with the fundamentals"}</p>
        <h2 className="mt-3 text-3xl font-black text-slate-900" id="learn-toeic-title">{vi ? "Chọn một chủ đề TOEIC để học ngay" : "Choose a TOEIC topic to study"}</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/toeic", title: vi ? "Tổng quan TOEIC" : "TOEIC overview", detail: vi ? "Hiểu từng Part và chọn điểm bắt đầu." : "Understand each Part and where to start." },
            { href: "/toeic/part-5", title: "Part 5", detail: vi ? "Hoàn thành câu: ngữ pháp và từ vựng." : "Sentence completion, grammar and vocabulary." },
            { href: "/toeic/part-5/word-form", title: "Word Form", detail: vi ? "Làm thử 5 câu có giải thích đáp án." : "Try five questions with explanations." },
            { href: "/toeic/part-6", title: "Part 6", detail: vi ? "Điền từ và câu theo mạch đoạn văn." : "Complete a text using its context." },
            { href: "/toeic/part-7", title: "Part 7", detail: vi ? "Tìm bằng chứng trong bài đọc." : "Find evidence in reading passages." },
            { href: "/luyen-thi-toeic-online", title: vi ? "Luyện TOEIC online" : "Online TOEIC practice", detail: vi ? "Lập một buổi luyện ngắn, có mục tiêu." : "Plan a focused practice session." },
          ].map((item) => <Link className="rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm transition hover:border-teal-700" href={item.href} key={item.href}><h3 className="text-lg font-black">{item.title} <span aria-hidden="true">→</span></h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p></Link>)}
        </div>
      </section>
      <section className="marketing-closing">
        <div><p className="section-kicker">{vi ? "Sẵn sàng khi bạn sẵn sàng" : "Start when you are ready"}</p><h2>{copy.closing}</h2><p>{copy.closingBody}</p></div>
        <Link className="button-primary" href={primary}>{user ? (vi ? "Tiếp tục học" : "Continue learning") : copy.primary}<span aria-hidden="true">↗</span></Link>
      </section>
      <PublicFooter locale={locale} />
    </main>
  );
}

function ProductPreview({ copy }: { copy: { sample: string; focus: string; next: string; nextValue: string } }) {
  return <div className="result-sheet">
    <div className="result-sheet-header"><span>TOEIC GYM / DIAGNOSTIC</span><span>{copy.sample}</span></div>
    <div className="result-sheet-grid"><Score label="Listening" items={[["Part 2", 78], ["Part 3", 58]]} /><Score label="Reading" items={[["Part 5", 82], ["Part 7", 61]]} /></div>
    <div className="result-sheet-next"><div><span>{copy.focus}</span><strong>Part 3 · Part 7</strong></div><div><span>{copy.next}</span><strong>{copy.nextValue}</strong></div></div>
  </div>;
}

function Score({ label, items }: { label: string; items: (readonly [string, number])[] }) {
  return <div className="result-score"><h3>{label}</h3>{items.map(([name, value]) => <div className="result-score-row" key={name}><div><span>{name}</span><strong>{value}%</strong></div><div className="result-bar"><span style={{ width: `${value}%` }} /></div></div>)}</div>;
}
