import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/authorization";
import { getAdminOverview } from "@/lib/admin/service";
import { getPreferences } from "@/lib/i18n/get-translations";

const number = (value: unknown, locale: string) => Number(value ?? 0).toLocaleString(locale);
const money = (value: unknown, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(value ?? 0));

const auditLabels: Record<string, { vi: string; en: string }> = {
  CONTENT_PUBLISHED: { vi: "Xuất bản học liệu", en: "Content published" },
  CONTENT_DRAFT_CREATED: { vi: "Tạo bản nháp học liệu", en: "Content draft created" },
  PREMIUM_GRANTED: { vi: "Cấp Premium", en: "Premium granted" },
  PREMIUM_REVOKED: { vi: "Thu hồi Premium", en: "Premium revoked" },
  USER_SUSPENDED: { vi: "Tạm khóa người dùng", en: "User suspended" },
  USER_REACTIVATED: { vi: "Mở khóa người dùng", en: "User reactivated" },
  CHALLENGE_PUBLISHED: { vi: "Công bố sự kiện", en: "Event published" },
  IMPORT_COMMITTED: { vi: "Nhập ngân hàng câu hỏi", en: "Question batch imported" },
};

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="admin-metric"><dt>{label}</dt><dd>{value}</dd><p>{note}</p></div>;
}

function WorkLink({ href, title, description, count }: { href: string; title: string; description: string; count?: string }) {
  return <Link className="admin-work-link" href={href}>
    <span><strong>{title}</strong><small>{description}</small></span>
    <span className="admin-work-count">{count ?? "↗"}</span>
  </Link>;
}

function Panel({ title, href, linkLabel, children }: { title: string; href: string; linkLabel: string; children: React.ReactNode }) {
  return <section className="admin-panel">
    <div className="admin-panel-heading"><h2>{title}</h2><Link href={href}>{linkLabel} <span aria-hidden="true">↗</span></Link></div>
    {children}
  </section>;
}

export default async function AdminPage() {
  const actor = await requireAdmin("ADMIN_DASHBOARD_READ");
  const [preferences, data] = await Promise.all([getPreferences(actor.id), getAdminOverview()]);
  const vi = preferences.interfaceLanguage === "vi";
  const locale = vi ? "vi-VN" : "en-US";
  const premiumRate = Number(data.total) ? Math.round(Number(data.premium) / Number(data.total) * 100) : 0;
  const attention = [
    Number(data.content.draftGroups) > 0 && { href: "/admin/content/questions?lifecycle=draft", title: vi ? "Nhóm câu hỏi cần duyệt" : "Question groups to review", detail: vi ? "Kiểm tra nội dung trước khi xuất bản" : "Check content before publishing", count: data.content.draftGroups },
    Number(data.payments.pending) > 0 && { href: "/admin/payments?status=PENDING", title: vi ? "Thanh toán đang chờ" : "Pending payments", detail: vi ? "Kiểm tra trạng thái giao dịch" : "Check transaction status", count: data.payments.pending },
    Number(data.unverified) > 0 && { href: "/admin/users?verified=no", title: vi ? "Tài khoản chưa xác minh" : "Unverified accounts", detail: vi ? "Tra cứu và hỗ trợ người học" : "Look up and support learners", count: data.unverified },
    Number(data.challenges.drafts) > 0 && { href: "/admin/challenges", title: vi ? "Sự kiện đang soạn" : "Draft events", detail: vi ? "Xem lại trước khi công bố" : "Review before publishing", count: data.challenges.drafts },
  ].filter(Boolean) as Array<{ href: string; title: string; detail: string; count: unknown }>;

  return <main className="admin-page min-h-screen px-4 py-6 sm:px-6">
    <div className="mx-auto max-w-7xl">
      <AdminNav locale={preferences.interfaceLanguage} />
      <header className="admin-title">
        <div><p className="section-kicker">{vi ? "Vận hành TOEIC GYM" : "TOEIC GYM operations"}</p><h1>{vi ? "Hôm nay cần làm gì?" : "What needs work today?"}</h1><p>{vi ? "Ưu tiên việc đang chờ. Các con số bên dưới giúp bạn kiểm tra tình hình." : "Start with pending work. The numbers below help you check the overall picture."}</p></div>
        <Link className="admin-create-link" href="/admin/content/new">{vi ? "Tạo học liệu" : "Create content"} <span aria-hidden="true">↗</span></Link>
      </header>

      <section className="admin-work-section" aria-labelledby="admin-work-title">
        <div className="admin-section-heading"><div><p className="section-kicker">{vi ? "Hàng chờ" : "Work queue"}</p><h2 id="admin-work-title">{vi ? "Cần xử lý" : "Needs attention"}</h2></div><span>{attention.length} {vi ? "nhóm việc" : "work areas"}</span></div>
        {attention.length ? <div className="admin-work-grid">{attention.map(item => <WorkLink key={item.href} href={item.href} title={item.title} description={item.detail} count={number(item.count, locale)} />)}</div>
          : <p className="admin-empty">{vi ? "Hiện không có nhóm việc nào đang chờ trong bảng tổng quan." : "No pending work is shown in this overview right now."}</p>}
      </section>

      <section className="admin-stats-section" aria-labelledby="admin-stats-title">
        <div className="admin-section-heading"><div><p className="section-kicker">{vi ? "Tình hình" : "Snapshot"}</p><h2 id="admin-stats-title">{vi ? "Các chỉ số chính" : "Key measures"}</h2></div><Link href="/admin/analytics">{vi ? "Xem phân tích" : "View analytics"} ↗</Link></div>
        <dl className="admin-stats-grid">
          <Metric label={vi ? "Người học có hoạt động" : "Active learners"} value={number(data.learning.learners7, locale)} note={vi ? "Trong 7 ngày gần nhất" : "In the last 7 days"} />
          <Metric label={vi ? "Buổi luyện tập" : "Practice sessions"} value={number(data.learning.practice7, locale)} note={vi ? "Trong 7 ngày gần nhất" : "In the last 7 days"} />
          <Metric label={vi ? "Người dùng" : "Users"} value={number(data.total, locale)} note={`+${number(data.new7, locale)} ${vi ? "trong 7 ngày" : "in 7 days"}`} />
          <Metric label={vi ? "Doanh thu" : "Revenue"} value={money(data.payments.revenue30, locale)} note={vi ? "Trong 30 ngày gần nhất" : "In the last 30 days"} />
        </dl>
      </section>

      <div className="admin-panels">
        <Panel title={vi ? "Học liệu" : "Learning content"} href="/admin/content" linkLabel={vi ? "Mở ngân hàng câu hỏi" : "Open question bank"}>
          <dl className="admin-detail-grid">
            <div><dt>{vi ? "Câu đã xuất bản" : "Published questions"}</dt><dd>{number(data.content.publishedQuestions, locale)}</dd></div>
            <div><dt>{vi ? "Câu bản nháp" : "Draft questions"}</dt><dd>{number(data.content.draftQuestions, locale)}</dd></div>
            <div><dt>{vi ? "Nhóm bản nháp" : "Draft groups"}</dt><dd>{number(data.content.draftGroups, locale)}</dd></div>
            <div><dt>{vi ? "Media sẵn sàng" : "Ready media"}</dt><dd>{number(data.content.readyMedia, locale)}</dd></div>
          </dl>
          <div className="admin-panel-actions"><Link href="/admin/content/questions?lifecycle=draft">{vi ? "Duyệt bản nháp" : "Review drafts"} ↗</Link><Link href="/admin/content/import">{vi ? "Nhập bộ câu hỏi" : "Import questions"} ↗</Link></div>
        </Panel>
        <Panel title={vi ? "Người học & tài khoản" : "Learners & accounts"} href="/admin/users" linkLabel={vi ? "Tra cứu người học" : "Find a learner"}>
          <dl className="admin-detail-grid">
            <div><dt>{vi ? "Tài khoản hoạt động" : "Active accounts"}</dt><dd>{number(data.active, locale)}</dd></div>
            <div><dt>{vi ? "Người dùng mới" : "New users"}</dt><dd>{number(data.new30, locale)}</dd><small>{vi ? "30 ngày" : "30 days"}</small></div>
            <div><dt>Premium</dt><dd>{number(data.premium, locale)}</dd><small>{premiumRate}% {vi ? "tài khoản" : "of accounts"}</small></div>
            <div><dt>{vi ? "Tạm khóa" : "Suspended"}</dt><dd>{number(data.suspended, locale)}</dd></div>
          </dl>
        </Panel>
        <Panel title={vi ? "Thanh toán" : "Payments"} href="/admin/payments" linkLabel={vi ? "Xem giao dịch" : "View payments"}>
          <dl className="admin-detail-grid">
            <div><dt>{vi ? "Đơn đã thanh toán" : "Paid orders"}</dt><dd>{number(data.payments.paid30, locale)}</dd><small>{vi ? "30 ngày" : "30 days"}</small></div>
            <div><dt>{vi ? "Đang chờ" : "Pending"}</dt><dd>{number(data.payments.pending, locale)}</dd></div>
            <div><dt>{vi ? "Giao dịch lỗi" : "Failed payments"}</dt><dd>{number(data.payments.failed7, locale)}</dd><small>{vi ? "7 ngày" : "7 days"}</small></div>
          </dl>
        </Panel>
        <Panel title={vi ? "Sản phẩm & sự kiện" : "Product & events"} href="/admin/analytics" linkLabel={vi ? "Xem dữ liệu" : "Explore data"}>
          <dl className="admin-detail-grid">
            <div><dt>{vi ? "Người dùng/khách" : "Users/guests"}</dt><dd>{number(data.analytics.activeActors7, locale)}</dd></div>
            <div><dt>{vi ? "Đăng ký hoàn tất" : "Completed signups"}</dt><dd>{number(data.analytics.signups7, locale)}</dd></div>
            <div><dt>{vi ? "Bắt đầu thanh toán" : "Checkout starts"}</dt><dd>{number(data.analytics.checkouts7, locale)}</dd></div>
            <div><dt>{vi ? "Sự kiện đang diễn ra" : "Live events"}</dt><dd>{number(data.challenges.live, locale)}</dd></div>
          </dl>
          <div className="admin-panel-actions"><Link href="/admin/challenges">{vi ? "Quản lý sự kiện" : "Manage events"} ↗</Link><Link href="/admin/challenges/new">{vi ? "Tạo sự kiện" : "Create event"} ↗</Link></div>
        </Panel>
      </div>

      <section className="admin-audit" aria-labelledby="admin-audit-title">
        <div className="admin-section-heading"><div><p className="section-kicker">{vi ? "Gần đây" : "Recent"}</p><h2 id="admin-audit-title">{vi ? "Hoạt động quản trị" : "Admin activity"}</h2></div><Link href="/admin/audit">{vi ? "Xem nhật ký" : "View audit log"} ↗</Link></div>
        {data.recentAudit.length ? <ul>{data.recentAudit.map(item => <li key={`${item.action}-${item.createdAt.toISOString()}`}><span>{auditLabels[item.action]?.[vi ? "vi" : "en"] ?? item.action.replaceAll("_", " ").toLowerCase()}</span><small>{item.actorEmail ?? (vi ? "Hệ thống" : "System")} · {item.createdAt.toLocaleString(locale, { timeZone: "Asia/Ho_Chi_Minh" })}</small></li>)}</ul>
          : <p className="admin-empty">{vi ? "Chưa có hoạt động quản trị." : "No admin activity yet."}</p>}
      </section>
    </div>
  </main>;
}
