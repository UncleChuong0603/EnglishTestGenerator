import { test, expect } from "@playwright/test";
import { createHmac, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const output = path.resolve("artifacts/ui-audit/admin");
const url = new URL(process.env.DATABASE_URL ?? "");
if (url.hostname !== "127.0.0.1" || url.port !== "15433" || url.pathname !== "/toeicgym_task17" || url.username !== "toeicgym_test") {
  throw new Error("Admin audit refuses a database other than the isolated task17 database.");
}

test("capture current admin routes", async ({ browser }) => {
  test.setTimeout(900_000);
  const pool = new pg.Pool({ connectionString: url.href });
  const rows: Array<{ route: string; purpose: string; state: string; desktop: string; mobile: string; note: string }> = [];
  try {
    const identities = (await pool.query("select id,email_normalized from users where email_normalized in ('admin@task18b.invalid','free.learner@ui.invalid','premium.learner@ui.invalid')")).rows;
    const byEmail = new Map<string, string>(identities.map((r) => [r.email_normalized, r.id]));
    const adminId = byEmail.get("admin@task18b.invalid");
    if (!adminId || !byEmail.get("free.learner@ui.invalid") || !byEmail.get("premium.learner@ui.invalid")) throw new Error("Required isolated fixture users are missing.");
    const role = await pool.query("select 1 from user_roles where user_id=$1 and role='ADMIN' and revoked_at is null", [adminId]);
    if (!role.rowCount) throw new Error("Fixture admin has no active ADMIN role.");
    const token = randomBytes(32).toString("base64url");
    const hash = createHmac("sha256", process.env.SESSION_SECRET ?? "").update(token).digest("hex");
    await pool.query("insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '2 hours')", [adminId, hash]);
    const context = await browser.newContext();
    await context.addCookies([{ name: "etg_session", value: token, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" }]);
    const page = await context.newPage();
    const groups = (await pool.query("select id,toeic_part,set_type,status from passage_sets order by created_at,id")).rows;
    const posts = (await pool.query("select id,status from content_posts order by created_at,id")).rows;
    const challenges = (await pool.query("select id from ranked_challenges order by created_at,id limit 1")).rows;
    const findGroup = (part: number, setType?: string) => groups.find((g) => g.toeic_part === part && (!setType || g.set_type === setType));
    const specs: Array<[string, string, string, string]> = [
      ["/admin", "dashboard", "Tổng quan", "populated"],
      ["/admin/users", "users", "Danh sách người dùng", "populated"],
      ["/admin/users?q=khong-co-fixture%40invalid", "users", "Tìm kiếm người dùng", "empty search"],
      ["/admin/users/" + byEmail.get("free.learner@ui.invalid"), "users", "Chi tiết Free", "FREE"],
      ["/admin/users/" + byEmail.get("premium.learner@ui.invalid"), "users", "Chi tiết Premium", "PREMIUM"],
      ["/admin/users/" + adminId, "users", "Chi tiết Admin", "ADMIN/self action"],
      ["/admin/content", "content", "Tổng quan nội dung", "populated"],
      ["/admin/content/questions", "content", "Câu hỏi và nhóm", "populated"],
      ["/admin/content/questions?part=7", "content", "Lọc Part 7", "filtered"],
      ["/admin/content/questions?search=khong-co-fixture", "content", "Tìm câu hỏi", "empty search"],
      ["/admin/content/new", "content", "Tạo nhóm Draft", "create form"],
      ["/admin/content/import", "content", "Nhập câu hỏi", "disabled upload action"],
      ["/admin/content/media", "media", "Media và tải lên", "empty"],
      ["/admin/content/posts", "posts", "Danh sách bài viết", "populated"],
      ["/admin/content/posts/new", "posts", "Tạo bài viết", "create form"],
      ["/admin/challenges", "challenges", "Danh sách thử thách", challenges.length ? "populated" : "empty"],
      ["/admin/challenges/new", "challenges", "Tạo thử thách", "create form"],
      ["/admin/payments", "payments", "Lịch sử thanh toán", "empty"],
      ["/admin/audit", "audit", "Nhật ký quản trị", "current data"],
      ["/admin/access-denied", "states", "Từ chối truy cập", "direct route"],
    ];
    for (const part of [1, 2, 3, 4, 5, 6, 7]) {
      const g = findGroup(part);
      if (g) specs.push([`/admin/content/questions/${g.id}`, "content", `Chi tiết nhóm Part ${part}`, g.status]);
      if (part === 7) for (const kind of ["double", "triple"]) {
        const multi = findGroup(7, kind);
        if (multi) specs.push([`/admin/content/questions/${multi.id}`, "content", `Chi tiết Part 7 ${kind}`, multi.status]);
      }
    }
    if (posts[0]) {
      specs.push([`/admin/content/posts/${posts[0].id}`, "posts", "Sửa bài viết", posts[0].status]);
      specs.push([`/admin/content/posts/${posts[0].id}/preview`, "posts", "Xem trước bài viết", posts[0].status]);
    }
    if (challenges[0]) specs.push([`/admin/challenges/${challenges[0].id}`, "challenges", "Chi tiết thử thách", "current data"]);

    for (const [route, folder, purpose, state] of specs) {
      const slug = `${folder}-${purpose.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${state.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
      const captures: Record<string, string> = {};
      let note = "";
      for (const [label, size] of [["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]] as const) {
        await page.setViewportSize(size);
        const response = await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.locator("main").first().waitFor({ state: "visible", timeout: 30000 }).catch(() => {});
        await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}nextjs-portal{display:none!important}" });
        const actual = new URL(page.url()).pathname;
        if (response?.status() !== 200 || actual !== route.split("?")[0]) {
          note = `HTTP ${response?.status() ?? "?"}; route thực tế ${actual}`;
          captures[label] = "—";
          continue;
        }
        const relative = `${label}/${slug}-${label}.png`;
        await mkdir(path.join(output, label), { recursive: true });
        await page.screenshot({ path: path.join(output, relative), fullPage: true, animations: "disabled" });
        captures[label] = relative;
      }
      rows.push({ route, purpose, state, desktop: captures.desktop ?? "—", mobile: captures.mobile ?? "—", note });
    }
    await context.close();
    const matrix = rows.map((r) => `| \`${r.route}\` | ${r.purpose} | ${r.state} | ${r.desktop === "—" ? "—" : `[PNG](${r.desktop})`} | ${r.mobile === "—" ? "—" : `[PNG](${r.mobile})`} | ${r.note} |`).join("\n");
    await mkdir(output, { recursive: true });
    await writeFile(path.join(output, "ADMIN-UI-INVENTORY.md"), `# Kiểm kê giao diện Admin hiện tại\n\nChụp từ database test cục bộ \`127.0.0.1:15433/toeicgym_task17\` với tài khoản fixture. Không dùng dữ liệu production. Viewport: desktop 1440×1000, mobile 390×844.\n\n| Route | Màn hình | Trạng thái | Desktop | Mobile | Ghi chú |\n| --- | --- | --- | --- | --- | --- |\n${matrix}\n\n## Giới hạn dữ liệu và route\n\n- Database hiện không có media, payment order hay ranked challenge. Trang danh sách tương ứng được chụp ở trạng thái rỗng; route chi tiết challenge và media preview không có ID hợp lệ để render.\n- Không có route Admin riêng cho role/permission, passage, stimulus, option, solution, billing entitlement, system settings. Các thông tin này nằm trong trang người dùng hoặc chi tiết nhóm câu hỏi khi có.\n- Part 5 trong dữ liệu có thể là câu hỏi standalone; danh sách Admin chỉ liệt kê \`passage_sets\`, nên không thể mở từng câu standalone từ danh sách này.\n- Giao diện Admin dùng header và hàng liên kết có wrap trên màn hình hẹp; không có sidebar hoặc menu collapse. Một số bảng có \`min-width\` và vùng cuộn ngang. Form tạo Challenge không hiển thị AdminNav.\n- Bảng câu hỏi/nhóm trên mobile chỉ hiện cột đầu trong khung cuộn ngang; trạng thái, nguồn và số câu không nhìn thấy đồng thời. Header không có chỉ báo route đang chọn. Trang chi tiết nhóm lấy dữ liệu media nhưng không hiển thị association media trong JSX hiện tại.\n- Chưa có fixture an toàn cho media READY/unready, payment history và ranked challenge; vì vậy chưa thể kiểm toán các trạng thái này. Chưa chụp xác nhận hành động phá hủy, validation tương tác hoặc feedback thành công/thất bại; các trạng thái này cần lượt audit riêng với fixture reset được.\n- Không thực hiện hành động ghi nội dung, upload, cấp quyền, suspend, thanh toán hay đổi trạng thái.\n\n## Tái tạo\n\nChạy \`node --env-file=.env.local node_modules/@playwright/test/cli.js test e2e/admin-ui-audit.spec.ts --config=playwright.ui-screenshots.config.ts\` sau khi chuẩn bị database test cục bộ bằng fixture hiện có. Test từ chối kết nối database khác địa chỉ, cổng, tên database và user test nêu trên. Session được tạo trong database test qua cơ chế session hiện có.\n`);
    expect(rows.length).toBeGreaterThan(15);
  } finally { await pool.end(); }
});
