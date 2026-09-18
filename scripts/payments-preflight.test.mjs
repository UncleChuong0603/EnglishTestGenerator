import { execFileSync } from "node:child_process";
import { mkdtempSync,writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join,resolve } from "node:path";
import { describe,it,expect } from "vitest";
const script=resolve("scripts/payments-preflight.mjs");
const run=(extra={})=>execFileSync(process.execPath,[script],{encoding:"utf8",env:{PATH:process.env.PATH,NODE_ENV:"production",APP_URL:"https://toeicgym.net",...extra}});
describe("payment production preflight",()=>{
  it("is disabled without credentials/prices",()=>{const out=run();expect(out).toContain("Checkout: DISABLED");expect(out).toContain("Client ID: NOT CONFIGURED");expect(out).toContain("Fake provider: BLOCKED")});
  it("stays disabled with credentials but no prices",()=>{const out=run({PAYOS_CLIENT_ID:"secret-a",PAYOS_API_KEY:"secret-b",PAYOS_CHECKSUM_KEY:"secret-c"});expect(out).toContain("Checkout: DISABLED");expect(out).not.toContain("secret-")});
  it("enables only complete credentials and prices",()=>{const out=run({PAYOS_CLIENT_ID:"secret-a",PAYOS_API_KEY:"secret-b",PAYOS_CHECKSUM_KEY:"secret-c",PREMIUM_30_PRICE_VND:"59000",PREMIUM_90_PRICE_VND:"139000",PREMIUM_365_PRICE_VND:"399000"});expect(out).toContain("Checkout: ENABLED");expect(out).toContain("Webhook URL: https://toeicgym.net/api/payments/payos/webhook");expect(out).not.toContain("secret-")});
  it("fails closed for prices with a missing credential",()=>{const out=run({PAYOS_CLIENT_ID:"secret-a",PAYOS_API_KEY:"secret-b",PREMIUM_30_PRICE_VND:"59000",PREMIUM_90_PRICE_VND:"139000",PREMIUM_365_PRICE_VND:"399000"});expect(out).toContain("Checkout: DISABLED")});
  it("loads .env.local when present",()=>{const cwd=mkdtempSync(join(tmpdir(),"toeicgym-preflight-"));writeFileSync(join(cwd,".env.local"),"APP_URL=https://toeicgym.net\nPAYMENT_PROVIDER=PAYOS\nPAYOS_CLIENT_ID=local-a\nPAYOS_API_KEY=local-b\nPAYOS_CHECKSUM_KEY=local-c\n");const out=execFileSync(process.execPath,["--env-file-if-exists=.env.local",script],{cwd,encoding:"utf8",env:{PATH:process.env.PATH,NODE_ENV:"production"}});expect(out).toContain("Client ID: CONFIGURED");expect(out).toContain("Application origin: https://toeicgym.net");expect(out).not.toContain("local-")});
  it("keeps injected process env authoritative",()=>{const cwd=mkdtempSync(join(tmpdir(),"toeicgym-preflight-"));writeFileSync(join(cwd,".env.local"),"APP_URL=https://wrong.invalid\nPAYOS_CLIENT_ID=file-value\n");const out=execFileSync(process.execPath,["--env-file-if-exists=.env.local",script],{cwd,encoding:"utf8",env:{PATH:process.env.PATH,NODE_ENV:"production",APP_URL:"https://toeicgym.net",PAYOS_CLIENT_ID:"injected",PAYOS_API_KEY:"injected",PAYOS_CHECKSUM_KEY:"injected"}});expect(out).toContain("Application origin: https://toeicgym.net");expect(out).not.toContain("file-value");expect(out).not.toContain("injected")});
  it("rejects invalid production origin and Fake",()=>{expect(run({APP_URL:"http://localhost:3000",PAYMENT_PROVIDER:"FAKE"})).toContain("Fake provider: BLOCKED");expect(run({APP_URL:"http://localhost:3000"})).toContain("Application origin: INVALID")});
});
