import { ConfiguredR2MediaStorage } from "../src/lib/media/r2-client.ts";

const storage = new ConfiguredR2MediaStorage({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucketName: process.env.R2_BUCKET_NAME,
});
const key = "content/preflight/r2-write-test.txt";
let put = false;
let head = false;
let deleted = false;

try {
  await storage.upload({ key, body: Buffer.from("task12-r2-preflight"), contentType: "text/plain" });
  put = true;
  console.log("PutObject PASS");
  if (!await storage.exists(key)) throw new Error("R2_HEAD_OBJECT_NOT_FOUND");
  head = true;
  console.log("HeadObject PASS");
  await storage.delete(key);
  deleted = true;
  console.log("DeleteObject PASS");
} catch (error) {
  console.error(`${put ? (head ? "DeleteObject" : "HeadObject") : "PutObject"} FAIL`);
  console.error(`ErrorType=${error?.name ?? "Unknown"}`);
  console.error(`ErrorCode=${error?.Code ?? error?.code ?? "Unknown"}`);
  console.error(`HttpStatus=${error?.$metadata?.httpStatusCode ?? "Unknown"}`);
  process.exitCode = 1;
} finally {
  if (put && !deleted) {
    try {
      await storage.delete(key);
      console.log("Cleanup PASS");
    } catch {
      console.error("Cleanup FAIL");
    }
  }
}
