import { describe, expect, it } from "vitest";
import { toeicGymOrganizationStructuredData } from "./site-structured-data";

describe("TOEIC GYM organization structured data", () => {
  it("identifies the official site, logo and published social profiles", () => {
    const data = toeicGymOrganizationStructuredData("https://toeicgym.net");
    expect(data).toMatchObject({
      "@type": "Organization",
      "@id": "https://toeicgym.net#organization",
      name: "TOEIC GYM",
      logo: "https://toeicgym.net/brand/toeic-gym-logo.png",
    });
    expect(data.sameAs).toEqual([
      "https://www.facebook.com/profile.php?id=61594521208737",
      "https://www.facebook.com/groups/1632623558419538",
    ]);
  });
});
