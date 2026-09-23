import { mkdir, mkdtemp, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LocalMediaStorage, safeMediaPath, signLocalMedia, verifyLocalMediaSignature } from "./local-storage";

describe("LocalMediaStorage", () => {
  it("writes atomically, reads existence and deletes", async () => { const root=await mkdtemp(path.join(tmpdir(),"toeicgym-media-")); const s=new LocalMediaStorage(root,"https://example.test","x".repeat(32)); await s.upload({key:"content/listening/audio/a.mp3",body:new Uint8Array([1,2,3]),contentType:"audio/mpeg"}); expect(await s.exists("content/listening/audio/a.mp3")).toBe(true); expect([...await readFile(path.join(root,"content/listening/audio/a.mp3"))]).toEqual([1,2,3]); expect((await readdir(path.join(root,"content/listening/audio"))).some(x=>x.endsWith(".tmp"))).toBe(false); await s.delete("content/listening/audio/a.mp3"); expect(await s.exists("content/listening/audio/a.mp3")).toBe(false); });
  it.each(["../x","a/../../x","/etc/passwd","C:\\Windows\\x","%2e%2e/x","a%2f..%2fx","a\\..\\x","a%00x"])("rejects unsafe key %s", key => expect(()=>safeMediaPath("/safe/root",key)).toThrow("MEDIA_KEY_INVALID"));
  it("creates and verifies short-lived tamper-resistant URLs", async()=>{const secret="s".repeat(32), now=Date.now(), expires=Math.floor(now/1000)+300, key="content/a.png", sig=signLocalMedia(key,expires,secret); expect(verifyLocalMediaSignature(key,expires,sig,secret,now)).toBe(true); expect(verifyLocalMediaSignature("content/b.png",expires,sig,secret,now)).toBe(false); expect(verifyLocalMediaSignature(key,expires,sig,secret,(expires+1)*1000)).toBe(false);});
  it("cleans temporary files after failed finalization", async()=>{const root=await mkdtemp(path.join(tmpdir(),"toeicgym-media-")); const s=new LocalMediaStorage(root,"https://example.test","x".repeat(32)); await mkdir(path.join(root,"content","x"),{recursive:true}); await expect(s.upload({key:"content/x",body:new Uint8Array([2]),contentType:"x"})).rejects.toThrow(); expect((await readdir(path.join(root,"content"))).filter(x=>x.endsWith(".tmp"))).toHaveLength(0);});
});
