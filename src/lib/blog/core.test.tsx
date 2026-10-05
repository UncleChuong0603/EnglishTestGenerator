import { renderToStaticMarkup } from "react-dom/server";
import { describe,expect,it } from "vitest";
import { Markdown } from "../../components/blog/markdown";
import { isValidSlug,safeHref,slugify,validatePost } from "./core";

describe("Task 18 blog core",()=>{
  it("creates stable ASCII-safe Vietnamese slugs",()=>{expect(slugify("Cách làm Part 5 TOEIC hiệu quả")).toBe("cach-lam-part-5-toeic-hieu-qua");expect(isValidSlug("cach-lam-part-5")).toBe(true);expect(isValidSlug("Sai Slug")).toBe(false);});
  it("allows drafts but enforces publish content",()=>{const draft={title:"Bài",slug:"bai",excerpt:"",content:"",category:"READING" as const,tags:[]};expect(validatePost(draft)).toEqual([]);expect(validatePost(draft,true)).toEqual(expect.arrayContaining(["CONTENT_REQUIRED","EXCERPT_REQUIRED"]));});
  it("blocks unsafe link schemes and escapes raw HTML",()=>{expect(safeHref("javascript:alert(1)")).toBeNull();expect(safeHref("data:text/html,x")).toBeNull();const html=renderToStaticMarkup(<Markdown content={'<script>alert(1)</script> [x](javascript:alert(1))'}/>);expect(html).not.toContain("<script>");expect(html).not.toContain('href="javascript:');expect(html).toContain("&lt;script&gt;");});
  it("formats inline multiple-choice examples as a responsive choice grid",()=>{const html=renderToStaticMarkup(<Markdown content={'**The team _____ the report.** (A) review (B) reviews (C) reviewing (D) reviewed\n\n**Đáp án B.** Chủ ngữ số ít cần *reviews*.'}/>);expect(html).toContain('aria-label="Câu hỏi ví dụ"');expect(html).toContain('aria-label="Các lựa chọn"');expect(html.match(/<li/g)).toHaveLength(4);expect(html).toContain('sm:grid-cols-2');expect(html).toContain('border-l-4');});
  it("formats A-D bullet lists as choices without changing ordinary lists",()=>{const html=renderToStaticMarkup(<Markdown content={'- A. First option\n- B. Second option\n- C. Third option\n- D. Fourth option\n\n- Keep this note\n- Keep that note'}/>);expect(html).toContain('aria-label="Các lựa chọn"');expect(html).toContain('list-disc');});
  it("rejects malformed custom canonicals and protocol-relative links",()=>{expect(validatePost({title:"Bài",slug:"bai",excerpt:"Tóm tắt",content:"Nội dung",category:"READING",tags:[],canonicalPath:"//evil.example"},true)).toContain("CANONICAL_PATH_INVALID");expect(safeHref("//evil.example")).toBeNull();});
  it("does not block publishing for missing image or short content",()=>{expect(validatePost({title:"Bài",slug:"bai",excerpt:"Tóm tắt",content:"Có ích.",category:"READING",tags:[]},true)).toEqual([]);});
});
