import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const read=(path:string)=>readFileSync(path,"utf8");

describe("Task 17E Premium presentation",()=>{
  it("derives private UI identity from the authoritative effective plan",()=>{const source=read("src/lib/premium/presentation.ts");expect(source).toContain("getEffectivePlan");expect(source).not.toMatch(/localStorage|sessionStorage|isPremium.*profile/i)});
  it("renders text plus an explicit avatar ring state",()=>{expect(read("src/components/premium/premium-badge.tsx")).toContain(">Premium<");expect(read("src/components/premium/premium-avatar.tsx")).toContain("data-premium-avatar")});
  it("naturally renders Free when effective Premium is inactive",()=>{const card=read("src/components/premium/premium-status-card.tsx");expect(card).toContain("if(!isPremium)");expect(card).toContain("copy.free")});
  it("keeps competitive navigation free of paid decoration",()=>{const nav=read("src/components/competitive-learner-nav.tsx");const ranking=read("src/app/ranking/page.tsx");expect(nav).toContain("showPremiumIdentity={false}");expect(ranking).toContain("competitive-learner-nav");expect(ranking).not.toContain("PremiumBadge")});
  it("does not expose Premium on public learner profiles",()=>expect(read("src/app/learners/[publicProfileId]/page.tsx")).not.toMatch(/PremiumBadge|isPremium|payment/i));
  it("keeps Admin and Premium presentation independent",()=>{const source=read("src/lib/premium/presentation.ts");expect(source).not.toMatch(/userRoles|ADMIN/);expect(read("src/lib/admin/authorization.ts")).not.toMatch(/getEffectivePlan|PREMIUM/)});
  it("uses fixed-duration language without renewal claims",()=>{const billing=read("src/app/billing/page.tsx");expect(billing).toContain("fixed-duration");expect(billing).not.toMatch(/auto-renew|renews on|next billing date/i)});
});
