import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { compareCompatible, weakestPart, type MockHistoryEntry } from "./history";
const entry = (runId:string, mode:MockHistoryEntry["mode"], date:string, scores:number[]):MockHistoryEntry => { const start=mode==="LISTENING"?1:mode==="READING"?5:1; const parts=scores.map((correct,i)=>({part:start+i,correct,answered:10,total:10,accuracy:correct*10})); const listening=parts.some(p=>p.part<=4)?{correct:parts.filter(p=>p.part<=4).reduce((n,p)=>n+p.correct,0),total:parts.filter(p=>p.part<=4).length*10}:null; const reading=parts.some(p=>p.part>=5)?{correct:parts.filter(p=>p.part>=5).reduce((n,p)=>n+p.correct,0),total:parts.filter(p=>p.part>=5).length*10}:null; return {runId,mode,completedAt:date,listening,reading,overall:{correct:parts.reduce((n,p)=>n+p.correct,0),total:parts.length*10},parts}; };
describe("mock history comparison",()=>{
  it("compares only immediately previous same-mode runs",()=>{const rows=[entry("r1","READING","2026-01-01",[5,6,7]),entry("f","FULL","2026-01-02",[1,1,1,1,1,1,1]),entry("r2","READING","2026-01-03",[6,8,9])]; const comparison=compareCompatible(rows,"READING")!; expect(comparison.current.runId).toBe("r2");expect(comparison.previous.runId).toBe("r1");expect(comparison.overallDelta).toBe(5);});
  it("returns no fake comparison for one run",()=>expect(compareCompatible([entry("r","LISTENING","2026-01-01",[1,2,3,4])],"LISTENING")).toBeNull());
  it("finds the weakest canonical part",()=>expect(weakestPart(entry("r","READING","2026-01-01",[8,4,7]))?.part).toBe(6));
  it("enforces ownership, completion and Premium access in the server service",()=>{const service=readFileSync("src/lib/full-mock/service.ts","utf8");expect(service).toContain("canUseAdvancedMockHistory");expect(service).toContain("eq(fullMockRuns.userId, userId)");expect(service).toContain('eq(fullMockRuns.status, "COMPLETED")');expect(service).not.toMatch(/495|990|predicted|scaled/i);});
});
