"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/locale-provider";

type CoachMessage = { eyebrow: string; text: string; action?: string; href?: string };

function routeMessage(pathname: string, vi: boolean): CoachMessage {
  if (pathname.startsWith("/admin")) return vi
    ? { eyebrow: "Milo · trợ lý vận hành", text: "Ưu tiên hàng chờ trước, rồi dùng biểu đồ để kiểm tra xu hướng thay vì nhìn một con số riêng lẻ.", action: "Mở phân tích", href: "/admin/analytics" }
    : { eyebrow: "Milo · operations coach", text: "Clear the queue first, then use trends—not a single metric—to understand the product.", action: "Open analytics", href: "/admin/analytics" };
  if (/^\/(practice|diagnostic|demo-test|full-mock|ranking\/challenges\/run|challenge\/part-5)\//.test(pathname)) return vi
    ? { eyebrow: "Milo · chế độ tập trung", text: "Đọc hết câu và loại từng đáp án. Mình sẽ ở gọn tại đây, không làm gián đoạn bài của bạn." }
    : { eyebrow: "Milo · focus mode", text: "Read the whole prompt and eliminate options one by one. I’ll stay out of your way." };
  if (pathname.includes("result") || pathname.includes("results")) return vi
    ? { eyebrow: "Milo · cùng xem lại", text: "Điểm số cho biết kết quả; lời giải và lỗi lặp lại mới chỉ ra buổi học tiếp theo.", action: "Ôn lỗi sai", href: "/mistakes" }
    : { eyebrow: "Milo · review together", text: "A score shows the result. Explanations and repeated mistakes reveal the next useful session.", action: "Review mistakes", href: "/mistakes" };
  if (pathname === "/dashboard" || pathname === "/progress") return vi
    ? { eyebrow: "Milo · coach hôm nay", text: "Hãy bắt đầu bằng bài được đề xuất. Đường xu hướng chỉ phản ánh các câu bạn thực sự đã làm.", action: "Xem bài hôm nay", href: "/dashboard#today-workout" }
    : { eyebrow: "Milo · today’s coach", text: "Start with the recommended workout. Your trend only reflects questions you actually answered.", action: "See today’s workout", href: "/dashboard#today-workout" };
  return vi
    ? { eyebrow: "Milo · TOEIC GYM coach", text: "Làm thử 10 câu trước. Sau đó mình sẽ giúp bạn biến lỗi sai thành bài nên học tiếp theo.", action: "Làm thử 10 câu", href: "/challenge/part-5" }
    : { eyebrow: "Milo · TOEIC GYM coach", text: "Try 10 questions first. Then I’ll help turn mistakes into your next useful practice.", action: "Try 10 questions", href: "/challenge/part-5" };
}

export function MascotCoach() {
  const locale = useLocale();
  const vi = locale === "vi";
  const pathname = usePathname();
  const base = useMemo(() => routeMessage(pathname, vi), [pathname, vi]);
  const [open, setOpen] = useState(false);
  const [progressMessage, setProgressMessage] = useState<{ pathname: string; message: CoachMessage } | null>(null);
  const message = progressMessage?.pathname === pathname ? progressMessage.message : base;

  useEffect(() => {
    const handle = (event: Event) => {
      const detail = (event as CustomEvent<{ answered?: number; total?: number }>).detail;
      if (!detail?.answered || !detail.total) return;
      setProgressMessage({ pathname, message: vi
        ? { eyebrow: "Milo · nhịp làm bài", text: `Bạn đã chọn ${detail.answered}/${detail.total} câu. Cứ giữ nhịp, chưa cần vội nộp.` }
        : { eyebrow: "Milo · practice pace", text: `You’ve answered ${detail.answered}/${detail.total}. Keep your pace and review before submitting.` } });
    };
    window.addEventListener("toeicgym:coach-progress", handle);
    return () => window.removeEventListener("toeicgym:coach-progress", handle);
  }, [pathname, vi]);

  const focused = /^\/(practice|diagnostic|demo-test|full-mock|ranking\/challenges\/run|challenge\/part-5)\//.test(pathname);
  return <aside className={`mascot-coach print:hidden ${focused ? "mascot-coach-focus" : ""}`} data-open={open} aria-label={vi ? "Milo, linh vật TOEIC GYM" : "Milo, TOEIC GYM mascot"}>
    {open ? <div className="mascot-coach-bubble" role="status" aria-live="polite">
      <button className="mascot-coach-close" type="button" onClick={() => setOpen(false)} aria-label={vi ? "Thu gọn Milo" : "Minimize Milo"}>×</button>
      <p>{message.eyebrow}</p>
      <strong>{message.text}</strong>
      {message.href && message.action ? <Link href={message.href} onClick={() => setOpen(false)}>{message.action}<span aria-hidden="true"> →</span></Link> : null}
    </div> : null}
    <button className="mascot-coach-trigger" type="button" aria-expanded={open} aria-label={open ? (vi ? "Thu gọn Milo" : "Minimize Milo") : (vi ? "Hỏi Milo" : "Ask Milo")} onClick={() => setOpen((value) => !value)}>
      <Image src="/mascot/milo-coach.webp" alt="" width={88} height={96} priority={pathname === "/"} />
      {!open ? <span>{vi ? "Hỏi Milo" : "Ask Milo"}</span> : null}
    </button>
  </aside>;
}
