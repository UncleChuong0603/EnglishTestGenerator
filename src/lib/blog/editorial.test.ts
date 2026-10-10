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

  it("builds a listening-led pronunciation cluster instead of a static rule dump", () => {
    const pronunciationSlugs = [
      "am-cuoi-tieng-anh-cach-phat-am-khong-them-am",
      "cach-phat-am-s-es-tieng-anh",
      "cach-phat-am-ed-tieng-anh",
      "trong-am-tu-tieng-anh-quy-tac-cach-tra",
    ];
    for (const slug of pronunciationSlugs) {
      const post = getEditorialPost(slug);
      expect(post, slug).toBeDefined();
      expect(post?.content.trim().split(/\s+/).length, slug).toBeGreaterThan(800);
      expect(post?.content.match(/^## /gm)?.length ?? 0, slug).toBeGreaterThanOrEqual(7);
      expect(post?.content.match(/\]\(\//g)?.length ?? 0, slug).toBeGreaterThanOrEqual(5);
      expect(post?.content).toMatch(/(?:Quy trình|Checklist|Bài luyện|Lộ trình)/i);
      expect(practiceForSlug(slug), slug).toHaveLength(4);
      expect(post!.updatedAt.getTime(), slug).toBeGreaterThanOrEqual(post!.publishedAt.getTime());
      const publicationInput = { ...post!, coverMediaId: undefined, tags: post!.tags.map(tag => tag.name) };
      expect(checkPublication(publicationInput, EDITORIAL_POSTS.filter(peer => peer.slug !== slug)).errors, slug).toEqual([]);
    }
  });

  it("covers productive TOEIC skills with original prompts and model responses", () => {
    const productiveSlugs = [
      "toeic-speaking-la-gi-cau-truc-11-cau",
      "toeic-speaking-mo-ta-tranh-khung-tra-loi",
      "toeic-writing-email-cach-viet-bai-mau",
      "toeic-writing-opinion-essay-cach-viet",
    ];
    for (const slug of productiveSlugs) {
      const post = getEditorialPost(slug);
      expect(post, slug).toBeDefined();
      expect(post?.content.trim().split(/\s+/).length, slug).toBeGreaterThan(850);
      expect(post?.content.match(/^## /gm)?.length ?? 0, slug).toBeGreaterThanOrEqual(7);
      expect(post?.content.match(/\]\(\//g)?.length ?? 0, slug).toBeGreaterThanOrEqual(4);
      expect(post?.content).toMatch(/(?:tự biên soạn|Bài mẫu|Prompt)/i);
      expect(post?.content).toContain("https://www.ets.org/");
      expect(practiceForSlug(slug), slug).toHaveLength(4);
      const publicationInput = { ...post!, coverMediaId: undefined, tags: post!.tags.map(tag => tag.name) };
      expect(checkPublication(publicationInput, EDITORIAL_POSTS.filter(peer => peer.slug !== slug)).errors, slug).toEqual([]);
    }

    const pictureModels = getEditorialPost(productiveSlugs[1])!.content.match(/^## Bài mẫu \d+:/gm);
    expect(pictureModels).toHaveLength(3);

    const emailModels = getEditorialPost(productiveSlugs[2])!.content.match(/^## Bài mẫu \d+:/gm);
    expect(emailModels).toHaveLength(3);

    const essaySection = getEditorialPost(productiveSlugs[3])!.content
      .split("## Bài mẫu tự biên soạn", 2)[1]
      .split("## Vì sao bài mẫu", 1)[0];
    const essayWords = [...essaySection.matchAll(/^\*(.+)\*$/gm)]
      .map(match => match[1])
      .join(" ")
      .split(/\s+/)
      .filter(Boolean);
    expect(essayWords.length).toBeGreaterThanOrEqual(300);
  });

  it("splits score-roadmap intent into evidence-led plans for three learner bands", () => {
    const scoreBandSlugs = [
      "lo-trinh-toeic-450-len-550",
      "lo-trinh-toeic-550-len-650",
      "lo-trinh-toeic-650-len-800",
    ];
    for (const slug of scoreBandSlugs) {
      const post = getEditorialPost(slug);
      expect(post, slug).toBeDefined();
      expect(post?.content.trim().split(/\s+/).length, slug).toBeGreaterThan(950);
      expect(post?.content.match(/^## /gm)?.length ?? 0, slug).toBeGreaterThanOrEqual(8);
      expect(post?.content.match(/\]\(\//g)?.length ?? 0, slug).toBeGreaterThanOrEqual(7);
      expect(post?.content).toMatch(/(?:bằng chứng|dữ liệu|audit|chẩn đoán)/i);
      expect(post?.content).toMatch(/(?:tuần|chu kỳ)/i);
      expect(post?.content).toContain("https://www.ets.org/");
      expect(practiceForSlug(slug), slug).toHaveLength(4);
      expect(post!.updatedAt.getTime(), slug).toBe(post!.publishedAt.getTime());
      const publicationInput = { ...post!, coverMediaId: undefined, tags: post!.tags.map(tag => tag.name) };
      expect(checkPublication(publicationInput, EDITORIAL_POSTS.filter(peer => peer.slug !== slug)).errors, slug).toEqual([]);
    }

    const pillar = getEditorialPost("chien-luoc-tang-diem-toeic-450-den-700")!;
    for (const slug of scoreBandSlugs) expect(pillar.content).toContain(`/blog/${slug}`);
    expect(pillar.updatedAt.toISOString()).toBe("2026-10-08T13:00:00.000Z");
  });

  it("covers current TOEIC exam logistics without freezing live schedules", () => {
    const logisticsSlugs = [
      "thi-toeic-tren-may-tinh-hay-tren-giay",
      "thi-toeic-bao-lau-co-ket-qua",
      "lich-thi-toeic-cach-tra-cuu-chon-ngay",
    ];
    for (const slug of logisticsSlugs) {
      const post = getEditorialPost(slug);
      expect(post, slug).toBeDefined();
      expect(post?.content.trim().split(/\s+/).length, slug).toBeGreaterThan(900);
      expect(post?.content.match(/^## /gm)?.length ?? 0, slug).toBeGreaterThanOrEqual(8);
      expect(post?.content.match(/\]\(\//g)?.length ?? 0, slug).toBeGreaterThanOrEqual(6);
      expect(post?.content).toContain("10/10/2026");
      expect(post?.content).toContain("https://");
      expect(practiceForSlug(slug), slug).toHaveLength(4);
      expect(post!.updatedAt.getTime(), slug).toBe(post!.publishedAt.getTime());
      const publicationInput = { ...post!, coverMediaId: undefined, tags: post!.tags.map(tag => tag.name) };
      expect(checkPublication(publicationInput, EDITORIAL_POSTS.filter(peer => peer.slug !== slug)).errors, slug).toEqual([]);
    }

    expect(getEditorialPost(logisticsSlugs[0])!.content).toContain(`/blog/${logisticsSlugs[1]}`);
    expect(getEditorialPost(logisticsSlugs[1])!.content).toContain(`/blog/${logisticsSlugs[2]}`);
    expect(getEditorialPost(logisticsSlugs[2])!.content).toContain(`/blog/${logisticsSlugs[0]}`);
  });

  it("turns advanced Listening search intents into original evidence-led practice", () => {
    const listeningSlugs = [
      "toeic-part-2-cau-tra-loi-gian-tiep",
      "toeic-part-3-hoi-thoai-ba-nguoi",
      "toeic-part-4-cau-hoi-bang-bieu",
      "toeic-part-3-4-cau-hoi-ham-y-ngu-y",
    ];
    for (const slug of listeningSlugs) {
      const post = getEditorialPost(slug);
      expect(post, slug).toBeDefined();
      expect(post?.content.trim().split(/\s+/).length, slug).toBeGreaterThan(900);
      expect(post?.content.match(/^## /gm)?.length ?? 0, slug).toBeGreaterThanOrEqual(9);
      expect(post?.content.match(/\]\(\//g)?.length ?? 0, slug).toBeGreaterThanOrEqual(5);
      expect(post?.content).toMatch(/tự biên soạn/i);
      expect(post?.content).toContain("https://www.ets.org/");
      expect(practiceForSlug(slug), slug).toHaveLength(4);
      const publicationInput = { ...post!, coverMediaId: undefined, tags: post!.tags.map(tag => tag.name) };
      expect(checkPublication(publicationInput, EDITORIAL_POSTS.filter(peer => peer.slug !== slug)).errors, slug).toEqual([]);
    }

    expect(getEditorialPost(listeningSlugs[0])!.content).toContain(`/blog/${listeningSlugs[1]}`);
    expect(getEditorialPost(listeningSlugs[1])!.content).toContain(`/blog/${listeningSlugs[2]}`);
    expect(getEditorialPost(listeningSlugs[2])!.content).toContain(`/blog/${listeningSlugs[1]}`);
    expect(getEditorialPost(listeningSlugs[3])!.content).toContain(`/blog/${listeningSlugs[0]}`);
  });

  it("upgrades the existing Part 1 guide instead of publishing a competing thin page", () => {
    const slug = "meo-lam-toeic-part-1-mo-ta-tranh";
    const post = getEditorialPost(slug)!;
    expect(post.content.trim().split(/\s+/).length).toBeGreaterThan(1_300);
    expect(post.content.match(/^## /gm)?.length ?? 0).toBeGreaterThanOrEqual(10);
    expect(post.content.match(/\]\(\//g)?.length ?? 0).toBeGreaterThanOrEqual(7);
    expect(post.content).toMatch(/Tranh có người/i);
    expect(post.content).toMatch(/Tranh không có người/i);
    expect(post.content).toMatch(/are being arranged/i);
    expect(post.content.match(/Ví dụ .*tự biên soạn/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(practiceForSlug(slug)).toHaveLength(4);
    expect(post.updatedAt.toISOString()).toBe("2026-10-10T10:00:00.000Z");
    const publicationInput = { ...post, coverMediaId: undefined, tags: post.tags.map(tag => tag.name) };
    expect(checkPublication(publicationInput, EDITORIAL_POSTS.filter(peer => peer.slug !== slug)).errors).toEqual([]);
    expect(EDITORIAL_POSTS.filter(candidate => candidate.targetTopic === post.targetTopic)).toHaveLength(1);
  });

  it("turns the existing Part 6 and Part 7 URLs into evidence-led Reading pillars", () => {
    const readingPillars = [
      {
        slug: "meo-lam-toeic-part-6-dien-doan-van",
        minWords: 1_300,
        patterns: [/Bản đồ bốn nhóm/i, /phép kiểm tra hai phía/i, /Đoạn mẫu bốn chỗ trống/i],
      },
      {
        slug: "meo-lam-toeic-part-7-doc-hieu-nhieu-van-ban",
        minWords: 1_500,
        patterns: [/Bản đồ sáu dạng/i, /kết luận tối thiểu/i, /Bài đôi và ba văn bản/i],
      },
    ];

    for (const { slug, minWords, patterns } of readingPillars) {
      const post = getEditorialPost(slug)!;
      expect(post.content.trim().split(/\s+/).length, slug).toBeGreaterThan(minWords);
      expect(post.content.match(/^## /gm)?.length ?? 0, slug).toBeGreaterThanOrEqual(11);
      expect(post.content.match(/\]\(\//g)?.length ?? 0, slug).toBeGreaterThanOrEqual(7);
      expect(post.content).toMatch(/tự biên soạn/i);
      expect(post.content).toContain("https://www.ets.org/");
      for (const pattern of patterns) expect(post.content, slug).toMatch(pattern);
      expect(practiceForSlug(slug), slug).toHaveLength(4);
      expect(post.updatedAt.toISOString(), slug).toBe("2026-10-10T14:00:00.000Z");
      const publicationInput = { ...post, coverMediaId: undefined, tags: post.tags.map(tag => tag.name) };
      expect(checkPublication(publicationInput, EDITORIAL_POSTS.filter(peer => peer.slug !== slug)).errors, slug).toEqual([]);
      expect(EDITORIAL_POSTS.filter(candidate => candidate.targetTopic === post.targetTopic), slug).toHaveLength(1);
    }

    expect(getEditorialPost(readingPillars[0].slug)!.content).toContain(`/blog/${readingPillars[1].slug}`);
    expect(getEditorialPost(readingPillars[1].slug)!.content).toContain(`/blog/${readingPillars[0].slug}`);
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
