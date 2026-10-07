import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { startPart5Challenge } from "@/app/challenge/actions";
import { ChallengeStartButton } from "@/components/challenge-start-button";
import { Markdown } from "@/components/blog/markdown";
import { HomeScrollEffects } from "@/components/marketing/home-scroll-effects";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { managedMetadata } from "@/components/seo/managed-page";
import { ToeicFormatTable } from "@/components/seo/toeic-format-table";
import { getCurrentUser } from "@/lib/auth/session";
import { getPostRedirect, getPublishedPost } from "@/lib/blog/service";
import { TOEIC_FORMAT_ROWS } from "@/lib/seo/toeic-format";
import styles from "./toeic.module.css";

export const dynamic = "force-dynamic";
export function generateMetadata() { return managedMetadata("seo-toeic"); }

const nextSteps = [
  {
    href: "/toeic/listening",
    marker: "01",
    title: "Luyện Listening Part 1–4",
    description: "Nghe audio mẫu, xem transcript và sửa lỗi theo từng dạng.",
  },
  {
    href: "/toeic/part-5",
    marker: "02",
    title: "Bắt đầu với Reading Part 5",
    description: "Nhận diện ngữ pháp và từ vựng trong câu ngắn.",
  },
  {
    href: "/toeic/part-7",
    marker: "03",
    title: "Rèn tốc độ Reading Part 7",
    description: "Tìm bằng chứng và đối chiếu thông tin giữa các tài liệu.",
  },
  {
    href: "/full-mock",
    marker: "04",
    title: "Xem kho đề thi thử",
    description: "Xem trước đề ngắn, Listening, Reading và Full Mock.",
  },
] as const;

export default async function Page() {
  const destination = await getPostRedirect("seo-toeic");
  if (destination) permanentRedirect(destination);
  const post = await getPublishedPost("seo-toeic");
  if (!post) notFound();
  const user = await getCurrentUser();

  return (
    <div className={styles.page} data-home-page>
      <HomeScrollEffects locale="vi" />
      <div aria-hidden="true" className={styles.scrollProgress}>
        <span data-home-progress-value />
      </div>
      <a className={styles.skipLink} href="#main-content">Bỏ qua điều hướng</a>
      <PublicHeader locale="vi" signedIn={Boolean(user)} tone="dark" />

      <main id="main-content" lang="vi">
        <section aria-labelledby="toeic-title" className={styles.hero} data-home-hero>
          <div className={styles.heroCopy} data-home-reveal="hero-copy">
            <BreadcrumbTrail items={[
              { name: "Trang chủ", path: "/" },
              { name: post.title, path: "/toeic" },
            ]} />
            <p className={styles.eyebrow}>TOEIC GYM / BẮT ĐẦU HỌC TOEIC</p>
            <h1 id="toeic-title">{post.title}</h1>
            <p className={styles.lead}>{post.excerpt}</p>
            <ul aria-label="Tóm tắt cấu trúc bài thi" className={styles.heroFacts}>
              <li><strong>7</strong><span>Part</span></li>
              <li><strong>200</strong><span>câu hỏi</span></li>
              <li><strong>120</strong><span>phút làm bài</span></li>
            </ul>
            <div className={styles.actions}>
              {user ? (
                <Link className={styles.primaryAction} href="/dashboard">
                  Mở bài học hôm nay <span aria-hidden="true">↗</span>
                </Link>
              ) : (
                <form action={startPart5Challenge}>
                  <ChallengeStartButton
                    className={styles.primaryAction}
                    label="Làm thử 10 câu miễn phí"
                    pendingLabel="Đang chuẩn bị bài…"
                  />
                </form>
              )}
              <Link className={styles.secondaryAction} href="#toeic-format">
                Xem cấu trúc 7 Part <span aria-hidden="true">↓</span>
              </Link>
            </div>
          </div>

          <div className={styles.heroVisual} data-home-hero-visual data-home-reveal="hero-visual">
            <div className={styles.formatPreview}>
              <div className={styles.previewTop}>
                <span>TOEIC LISTENING &amp; READING</span>
                <span>FORMAT MAP</span>
              </div>
              <div className={styles.previewSummary}>
                <div><span>Listening</span><strong>45 phút</strong><small>100 câu · Part 1–4</small></div>
                <div><span>Reading</span><strong>75 phút</strong><small>100 câu · Part 5–7</small></div>
              </div>
              <ol className={styles.partMap}>
                {TOEIC_FORMAT_ROWS.map((row) => (
                  <li key={row.part}>
                    <span>{String(row.part).padStart(2, "0")}</span>
                    <strong>Part {row.part}</strong>
                    <small>{row.task}</small>
                    <b>{row.questions}</b>
                  </li>
                ))}
              </ol>
              <p className={styles.previewNote}>Nắm cấu trúc trước, rồi chọn đúng Part cần luyện.</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="format-section-title" className={styles.formatSection} data-home-reveal="rise">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>BẢN ĐỒ BÀI THI</p>
            <h2 id="format-section-title">Hai kỹ năng. Bảy Part. Một cấu trúc cần nắm rõ.</h2>
            <p>Mỗi Part đòi hỏi một thao tác khác nhau. Xem số câu và thời gian trước khi chọn nơi cần bắt đầu.</p>
          </div>
          <ToeicFormatTable id="toeic-format" tone="dark" />
        </section>

        <section aria-labelledby="guide-title" className={styles.guideSection}>
          <div className={styles.guideIntro} data-home-reveal="heading">
            <p className={styles.eyebrow}>HƯỚNG DẪN BẮT ĐẦU</p>
            <h2 id="guide-title">Hiểu bài thi, rồi biến thông tin thành buổi luyện tiếp theo.</h2>
          </div>
          <div className={styles.contentGrid}>
            <article className={styles.editorial} data-home-reveal="rise">
              <Markdown content={post.content} />
            </article>
            <aside aria-labelledby="next-step-title" className={styles.nextSteps} data-home-reveal="rise">
              <p className={styles.eyebrow}>CHỌN BƯỚC TIẾP</p>
              <h2 id="next-step-title">Học theo đúng mục tiêu hiện tại.</h2>
              <ol>
                {nextSteps.map((step) => (
                  <li key={step.href}>
                    <span>{step.marker}</span>
                    <div>
                      <Link href={step.href}>{step.title}<span aria-hidden="true">↗</span></Link>
                      <p>{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </section>

        <section aria-labelledby="closing-title" className={styles.closing} data-home-reveal="rise">
          <div>
            <p className={styles.eyebrow}>BẮT ĐẦU TỪ DỮ LIỆU THẬT</p>
            <h2 id="closing-title">Làm 10 câu để biết nên học gì tiếp theo.</h2>
            <p>Không cần tài khoản để bắt đầu. Sau khi nộp, bạn xem lời giải và biết dạng lỗi nào cần ưu tiên.</p>
          </div>
          {user ? (
            <Link className={styles.primaryAction} href="/dashboard">Mở bài học hôm nay <span aria-hidden="true">↗</span></Link>
          ) : (
            <form action={startPart5Challenge}>
              <ChallengeStartButton
                className={styles.primaryAction}
                label="Làm thử 10 câu miễn phí"
                pendingLabel="Đang chuẩn bị bài…"
              />
            </form>
          )}
        </section>
      </main>
      <PublicFooter locale="vi" tone="dark" />
    </div>
  );
}
