import assert from "node:assert/strict"; import { spawnSync } from "node:child_process";
const raw=process.env.TASK17_TEST_DATABASE_URL??process.env.TASK16_TEST_DATABASE_URL??"";const url=new URL(raw);assert.equal(url.hostname,"127.0.0.1");assert.equal(url.port,"15433");
const env={...process.env,DATABASE_URL:url.href,PAYMENT_PROVIDER:"FAKE",PREMIUM_30_PRICE_VND:"59000",PREMIUM_90_PRICE_VND:"139000",PREMIUM_365_PRICE_VND:"399000",TASK17_E2E_PAYMENT_ENABLED:"true",APP_URL:"http://127.0.0.1:3100"};
for(const key of ["PAYOS_CLIENT_ID","PAYOS_API_KEY","PAYOS_CHECKSUM_KEY"])delete env[key];
for(const args of [["--conditions=react-server","--import","tsx","scripts/task17b-browser-seed.mts"],["node_modules/@playwright/test/cli.js","test","e2e/payments.spec.ts"]]){const result=spawnSync(process.execPath,args,{stdio:"inherit",env});if(result.status!==0)process.exit(result.status??1)}
