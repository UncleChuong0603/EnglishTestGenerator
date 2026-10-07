import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { POST_CATEGORIES } from "./core";
import { EDITORIAL_POSTS, getEditorialPost, grammarImageForSlug } from "./editorial";
import { practiceForSlug } from "@/lib/seo/mini-practice";
import { checkPublication } from "./publication-quality";

describe("editorial TOEIC library", () => {
  it("ships at least one SEO-ready article for every public category", () => {
    for (const category of POST_CATEGORIES.filter(category => category !== "EXAM_REVIEW")) {
      const posts = EDITORIAL_POSTS.filter(post => post.category === category);
      expect(posts.length).toBeGreaterThanOrEqual(1);
      for (const post of posts) {
        expect(post.seoTitle.trim()).not.toBe("");
        expect(post.seoDescription.trim()).not.toBe("");
        expect(post.content).toMatch(/^## /m);
        expect(post.content).toMatch(/\]\(\//);
      }
    }
  });

  it("includes an ETS sample review with its own illustration", () => {
    expect(POST_CATEGORIES).toContain("EXAM_REVIEW");
    const review = EDITORIAL_POSTS.find(post => post.category === "EXAM_REVIEW");
    expect(review).toBeDefined();
    expect(review?.content).toContain("toeic-listening-reading-sample-test.pdf");
    expect(review?.editorialCover).toBe("/blog/ets-2025-reading-sample-review.webp");
    expect(existsSync("public/blog/ets-2025-reading-sample-review.webp")).toBe(true);
    expect(review?.content).toContain("Câu 101–130");
    expect(review?.content).toContain("Câu 176–200");
    expect(review?.content.trim().split(/\s+/).length).toBeGreaterThan(1400);
  });

  it("ships substantial intent-led growth articles instead of thin placeholder posts", () => {
    const growthSlugs = [
      "toeic-la-gi-cau-truc-thang-diem",
      "lo-trinh-hoc-toeic-cho-nguoi-mat-goc",
      "toeic-650-can-dung-bao-nhieu-cau",
      "cach-hoc-tu-vung-tieng-anh-nho-lau-theo-cum",
    ];
    for (const slug of growthSlugs) {
      const post = getEditorialPost(slug);
      expect(post, slug).toBeDefined();
      expect(post?.content.trim().split(/\s+/).length, slug).toBeGreaterThan(650);
      expect(post?.content.match(/^## /gm)?.length ?? 0, slug).toBeGreaterThanOrEqual(5);
      expect(post?.content.match(/\]\(\//g)?.length ?? 0, slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("covers high-intent exam decisions with sourced, substantial guides", () => {
    const decisionSlugs = [
      "bang-toeic-co-thoi-han-bao-lau",
      "toeic-2-ky-nang-va-4-ky-nang",
      "dang-ky-thi-toeic-online-iig",
      "toeic-va-ielts-nen-hoc-chung-chi-nao",
    ];
    for (const slug of decisionSlugs) {
      const post = getEditorialPost(slug);
      expect(post, slug).toBeDefined();
      expect(post?.content.trim().split(/\s+/).length, slug).toBeGreaterThan(650);
      expect(post?.content.match(/^## /gm)?.length ?? 0, slug).toBeGreaterThanOrEqual(6);
      expect(post?.content.match(/\]\(\//g)?.length ?? 0, slug).toBeGreaterThanOrEqual(3);
      expect(post?.content).toMatch(/https:\/\/(?:www\.)?(?:ets\.org|ielts\.org|online\.iigvietnam\.com|iigvietnam\.com)/);
    }
  });

  it("builds a deep general-English listening cluster with a real practice path", () => {
    const listeningSlugs = [
      "cach-luyen-nghe-tieng-anh-cho-nguoi-mat-goc",
      "shadowing-la-gi-cach-luyen-tieng-anh",
      "dictation-la-gi-cach-nghe-chep-chinh-ta-tieng-anh",
      "noi-am-tieng-anh-cach-nghe-connected-speech",
    ];
    for (const slug of listeningSlugs) {
      const post = getEditorialPost(slug);
      expect(post, slug).toBeDefined();
      expect(post?.content.trim().split(/\s+/).length, slug).toBeGreaterThan(800);
      expect(post?.content.match(/^## /gm)?.length ?? 0, slug).toBeGreaterThanOrEqual(7);
      expect(post?.content.match(/\]\(\//g)?.length ?? 0, slug).toBeGreaterThanOrEqual(5);
      expect(post?.content).toContain("/listening-lessons");
    }
  });

  it("ships a practice-led workplace vocabulary cluster", () => {
    const vocabularySlugs = [
      "collocation-la-gi-cum-tu-toeic-thong-dung",
      "phrasal-verbs-toeic-theo-chu-de-cong-viec",
      "tu-de-nham-trong-tieng-anh-toeic-part-5",
      "cach-viet-email-tieng-anh-cong-viec-mau",
    ];
    for (const slug of vocabularySlugs) {
      const post = getEditorialPost(slug);
      expect(post, slug).toBeDefined();
      expect(post?.content.trim().split(/\s+/).length, slug).toBeGreaterThan(850);
      expect(post?.content.match(/^## /gm)?.length ?? 0, slug).toBeGreaterThanOrEqual(7);
      expect(post?.content.match(/\]\(\//g)?.length ?? 0, slug).toBeGreaterThanOrEqual(4);
      expect(post?.content).toMatch(/(?:Ví dụ|Mẫu|Checklist|Quy trình)/i);
      expect(practiceForSlug(slug), slug).toHaveLength(4);
      expect(post!.updatedAt.getTime(), slug).toBeGreaterThanOrEqual(post!.publishedAt.getTime());
      const publicationInput = { ...post!, coverMediaId: undefined, tags: post!.tags.map(tag => tag.name) };
      expect(checkPublication(publicationInput, EDITORIAL_POSTS.filter(peer => peer.slug !== slug)).errors, slug).toEqual([]);
    }

    const collocations = getEditorialPost(vocabularySlugs[0])!.content
      .split("## Cách nhận ra câu collocation", 1)[0]
      .matchAll(/^- \*\*([^*]+):\*\*/gm);
    expect([...collocations].flatMap(match => match[1].split(" / "))).toHaveLength(44);

    const phrasalVerbs = getEditorialPost(vocabularySlugs[1])!.content
      .split("## Cụm tách được", 1)[0]
      .match(/^- \*\*[^*]+:\*\*/gm);
    expect(phrasalVerbs).toHaveLength(30);

    const confusingPairs = getEditorialPost(vocabularySlugs[2])!.content.match(/^### /gm);
    expect(confusingPairs).toHaveLength(20);

    const emailTemplates = getEditorialPost(vocabularySlugs[3])!.content.match(/^## Mẫu \d+:/gm);
    expect(emailTemplates).toHaveLength(5);
  });

  it("resolves bundled articles by slug", () => {
    const first = EDITORIAL_POSTS[0];
    expect(getEditorialPost(first.slug)?.id).toBe(first.id);
    expect(getEditorialPost("not-a-real-post")).toBeNull();
  });

  it("covers every TOEIC part with a distinct, linked guide", () => {
    const slugs = EDITORIAL_POSTS.map(post => post.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const part of [1, 2, 5, 6, 7]) {
      expect(EDITORIAL_POSTS.some(post => post.slug.startsWith(`meo-lam-toeic-part-${part}-`))).toBe(true);
    }
    expect(EDITORIAL_POSTS.some(post => post.slug === "cach-luyen-nghe-toeic-part-3-4")).toBe(true);
  });

  it("keeps canonical paths aligned with public slugs", () => {
    for (const post of EDITORIAL_POSTS) {
      expect(post.canonicalPath).toBe(`/blog/${post.slug}`);
    }
  });

  it("keeps inline practice choices complete, ordered, and separate from explanations", () => {
    const examples = EDITORIAL_POSTS.flatMap(post =>
      post.content
        .split("\n")
        .filter(line => /\s\(A\)\s/.test(line))
        .map(line => ({ post: post.slug, line })),
    );

    expect(examples.length).toBeGreaterThan(80);
    for (const example of examples) {
      const labels = [...example.line.matchAll(/\s\(([A-D])\)\s/g)].map(match => match[1]);
      expect(labels.length, example.post).toBeGreaterThanOrEqual(2);
      expect(labels, example.post).toEqual(labels.map((_, index) => String.fromCharCode(65 + index)));
      expect(example.line, `${example.post} keeps its explanation on the question line`).not.toMatch(/\([^)]*D\)[^\n]*(?:Đáp án|Chọn)\s/i);
    }
  });

  it("answers the observed grammar and Listening searches on their existing canonical pages", () => {
    expect(getEditorialPost("sua-de-mau-ets-toeic-2025-reading-part-5-6-7")?.content).toContain("ETS TOEIC 2025” có phải tên một đề mẫu chính thức?");
    expect(getEditorialPost("hien-tai-hoan-thanh-va-qua-khu-don")?.content).toContain("Yesterday dùng since hay for?");
    expect(getEditorialPost("cau-tuong-thuat-tieng-anh-said-told-asked")?.content).toContain("Said và told khác nhau thế nào?");
    expect(getEditorialPost("used-to-be-used-to-get-used-to")?.content).toContain("Bảng chọn nhanh used to");
    const listening = getEditorialPost("cach-luyen-nghe-toeic-part-3-4");
    expect(listening?.content).toContain("Part 3 và Part 4 TOEIC khác nhau ở đâu?");
    expect(listening?.content).toContain("/toeic/part-4");
  });

  it("keeps editorial learning links and illustrations resolvable", () => {
    const slugs = new Set([...EDITORIAL_POSTS.map(post => post.slug), "ngu-phap"]);
    for (const post of EDITORIAL_POSTS) {
      for (const [, slug] of post.content.matchAll(/\]\(\/blog\/([a-z0-9-]+)\)/g)) {
        expect(slugs.has(slug), `${post.slug} links to missing article ${slug}`).toBe(true);
      }
    }
    expect(existsSync("public/blog/reading-75-minute-plan.svg")).toBe(true);
    for (const post of EDITORIAL_POSTS) {
      const image = grammarImageForSlug(post.slug);
      if (image) expect(existsSync(`public${image}`), `missing image for ${post.slug}`).toBe(true);
      if (post.editorialCover.startsWith("/blog/") && !post.editorialCover.startsWith("/blog/cover/")) {
        expect(existsSync(`public${post.editorialCover}`), `missing cover for ${post.slug}`).toBe(true);
      }
    }
  });
});
