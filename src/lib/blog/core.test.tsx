import { renderToStaticMarkup } from "react-dom/server";
import { describe,expect,it } from "vitest";
import { Markdown } from "../../components/blog/markdown";
import { isValidSlug,safeHref,slugify,validatePost } from "./core";

describe("Task 18 blog core",()=>{
  it("creates stable ASCII-safe Vietnamese slugs",()=>{expect(slugify("Cách làm Part 5 TOEIC hiệu quả")).toBe("cach-lam-part-5-toeic-hieu-qua");expect(isValidSlug("cach-lam-part-5")).toBe(true);expect(isValidSlug("Sai Slug")).toBe(false);});
  it("allows drafts but enforces publish content",()=>{const draft={title:"Bài",slug:"bai",excerpt:"",content:"",category:"READING" as const,tags:[]};expect(validatePost(draft)).toEqual([]);expect(validatePost(draft,true)).toEqual(expect.arrayContaining(["CONTENT_REQUIRED","EXCERPT_REQUIRED"]));});
  it("blocks unsafe link schemes and escapes raw HTML",()=>{expect(safeHref("javascript:alert(1)")).toBeNull();expect(safeHref("data:text/html,x")).toBeNull();const html=renderToStaticMarkup(<Markdown content={'<script>alert(1)</script> [x](javascript:alert(1))'}/>);expect(html).not.toContain("<script>");expect(html).not.toContain('href="javascript:');expect(html).toContain("&lt;script&gt;");});
});
