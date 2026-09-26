import { unsubscribeLearningEmail } from "@/lib/email/lifecycle";

export const dynamic = "force-dynamic";
const headers = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex" };
const shell = (body: string) => `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email học tập · TOEICGym</title><main style="font:16px system-ui;max-width:34rem;margin:4rem auto;padding:1rem"><h1>Email học tập & nhắc luyện</h1>${body}</main></html>`;

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) return new Response(shell("<p>Liên kết không hợp lệ.</p>"), { status: 400, headers });
  return new Response(shell(`<p>Bạn có thể ngừng nhận email nhắc học bất kỳ lúc nào. Email xác minh và bảo mật vẫn được gửi khi cần.</p><form method="post"><input type="hidden" name="token" value="${token}"><button style="padding:.7rem 1rem;cursor:pointer">Hủy đăng ký email học tập</button></form>`), { headers });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const token = form.get("token");
  const ok = typeof token === "string" && await unsubscribeLearningEmail(token);
  return new Response(shell(ok ? "<p>Đã tắt email học tập. Bạn có thể bật lại trong Cài đặt.</p>" : "<p>Liên kết không hợp lệ hoặc đã được dùng.</p>"), { status: ok ? 200 : 400, headers });
}
