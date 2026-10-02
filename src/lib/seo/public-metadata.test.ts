import { describe, expect, it } from "vitest";
import { publicPageMetadata } from "./public-metadata";

describe("public page titles", () => {
  it("keeps a title containing the brand from inheriting another brand suffix", () => {
    const title = "Về TOEIC GYM: phương pháp luyện và nguồn nội dung";
    const metadata = publicPageMetadata({ title, description: "Thông tin về nội dung", canonical: "/ve-toeic-gym" });
    expect(metadata.title).toEqual({ absolute: title });
    expect(metadata.openGraph?.title).toBe(title);
    expect(metadata.twitter?.title).toBe(title);
    expect(metadata.alternates?.canonical).toBe("/ve-toeic-gym");
  });
  it("retains the layout title template for topic titles and supports editorial social titles", () => {
    const metadata = publicPageMetadata({ title: "Luyện TOEIC Part 5", description: "Bài luyện", canonical: "/toeic/part-5", socialTitle: "Thử câu hỏi Part 5 | TOEIC GYM" });
    expect(metadata.title).toBe("Luyện TOEIC Part 5");
    expect(metadata.openGraph?.title).toBe("Thử câu hỏi Part 5 | TOEIC GYM");
    expect(metadata.twitter?.title).toBe("Thử câu hỏi Part 5 | TOEIC GYM");
  });
});
