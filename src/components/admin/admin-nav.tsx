import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { TableSortEnhancer } from "@/components/admin/table-sort-enhancer";
import type { InterfaceLanguage } from "@/lib/i18n/config";

export function AdminNav({ locale }: { locale: InterfaceLanguage }) {
  const vi = locale === "vi";
  const groups = [
    {
      name: vi ? "Bắt đầu" : "Start",
      links: [
        ["/admin", vi ? "Tổng quan" : "Overview"],
        ["/admin/analytics", vi ? "Phân tích sản phẩm" : "Product analytics"],
      ],
    },
    {
      name: vi ? "Học liệu" : "Learning content",
      links: [
        ["/admin/content", vi ? "Ngân hàng câu hỏi" : "Question bank"],
        ["/admin/content/similarity", vi ? "Rà soát trùng lặp" : "Similarity review"],
        ["/admin/content/media", "Media"],
        ["/admin/content/posts", vi ? "Bài viết" : "Posts"],
      ],
    },
    {
      name: vi ? "Người học" : "Learners",
      links: [["/admin/users", vi ? "Người dùng" : "Users"]],
    },
    {
      name: vi ? "Vận hành" : "Operations",
      links: [
        ["/admin/challenges", vi ? "Sự kiện xếp hạng" : "Ranking events"],
        ["/admin/payments", vi ? "Thanh toán" : "Payments"],
        ["/admin/support", vi ? "Phản hồi" : "Feedback"],
        ["/admin/audit", vi ? "Nhật ký" : "Audit log"],
        ["/admin/settings", vi ? "Cài đặt" : "Settings"],
      ],
    },
  ];
  return (
    <>
      <TableSortEnhancer locale={locale} />
      <header className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link className="text-xl font-black" href="/admin">
              TOEIC GYM
            </Link>
            <span className="ml-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
              Admin
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher locale={locale} />
            <Link
              className="rounded-lg px-3 py-2 font-semibold text-teal-700 hover:bg-white focus-visible:outline-2 focus-visible:outline-teal-700"
              href="/dashboard"
            >
              {vi ? "Đến khu học tập ↗" : "Go to learner area ↗"}
            </Link>
          </div>
        </div>
        <nav
          aria-label={vi ? "Điều hướng quản trị" : "Admin navigation"}
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {groups.map((group) => (
            <div
              className="rounded-xl border border-slate-200 bg-white p-3"
              key={group.name}
            >
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                {group.name}
              </p>
              <div className="flex flex-wrap gap-1">
                {group.links.map(([href, label]) => (
                  <Link
                    className="rounded-lg px-2 py-2 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-700"
                    href={href}
                    key={href}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </header>
    </>
  );
}
