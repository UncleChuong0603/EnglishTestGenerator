import { describe,expect,it } from "vitest";
import { IMPORT_MAX_BYTES,parseAndValidateImport,validateImportValue } from "./schema";
const taxonomy:Record<number,[string,string]>={1:["photographs","visual_detail"],2:["question_response","direct_response"],3:["conversation","detail"],4:["talk","detail"],5:["grammar","verb_tense"],6:["grammar","word_form"],7:["detail","explicit_information"]};
function item(part:number){const count=part===6?4:[3,4].includes(part)?3:1;const setType=({1:"photographs",2:"question_response",3:"conversation",4:"talk",5:"standalone",6:"part6",7:"single"} as Record<number,string>)[part];return{externalItemId:`P${part}-G1`,part,title:`Part ${part}`,setType,passages:part===6||part===7?[{content:"Original development passage."}]:[],...(part<=4?{transcript:"Original transcript."}:{}),questions:Array.from({length:count},(_,i)=>({externalQuestionId:`P${part}-Q${i+1}`,text:part<=2?"":`Question ${i+1}?`,options:Array.from({length:part===2?3:4},(_,j)=>({key:String.fromCharCode(65+j),text:`Option ${j+1}`})),correctOptionKey:"A",explanation:{en:"English explanation.",vi:"Giải thích tiếng Việt."},skill:taxonomy[part][0],subSkill:taxonomy[part][1],difficulty:"medium"}))};}
function file(items:unknown[]){return{schemaVersion:"1.0",batch:{batchKey:"test-batch",name:"Test",sourceType:"ORIGINAL",rightsNote:"Original test fixture.",language:"bilingual",reviewStatus:"UNREVIEWED"},items};}
describe("question import schema",()=>{
  for(const part of [1,2,3,4,5,6,7])it(`accepts valid P${part}`,()=>expect(validateImportValue(file([item(part)])).valid).toBe(true));
  it("rejects malformed JSON",()=>expect(parseAndValidateImport("{").issues[0].code).toBe("MALFORMED_JSON"));
  it("rejects schema drift and unsupported versions",()=>expect(validateImportValue({...file([item(5)]),schemaVersion:"2.0",extra:true}).valid).toBe(false));
  it("rejects invalid taxonomy",()=>{const x=item(5);x.questions[0].subSkill="invented";expect(validateImportValue(file([x])).issues.some(i=>i.code==="UNKNOWN_TAXONOMY")).toBe(true)});
  it("rejects wrong option count",()=>{const x=item(5);x.questions[0].options.pop();expect(validateImportValue(file([x])).issues.some(i=>i.code==="INVALID_OPTION_COUNT")).toBe(true)});
  it("rejects bad answer reference",()=>{const x=item(5);x.questions[0].correctOptionKey="D";x.questions[0].options.pop();expect(validateImportValue(file([x])).issues.some(i=>i.code==="INVALID_CORRECT_ANSWER")).toBe(true)});
  it("rejects duplicate options",()=>{const x=item(5);x.questions[0].options[1].text=x.questions[0].options[0].text;expect(validateImportValue(file([x])).issues.some(i=>i.code==="DUPLICATE_OPTION")).toBe(true)});
  it("rejects missing explanation",()=>{const x=item(5);x.questions[0].explanation.en="";expect(validateImportValue(file([x])).valid).toBe(false)});
  it("rejects invalid group size",()=>{const x=item(3);x.questions.pop();expect(validateImportValue(file([x])).issues.some(i=>i.code==="GROUP_SIZE_MISMATCH")).toBe(true)});
  it("rejects duplicate keys/content",()=>{const x=item(5);expect(validateImportValue(file([x,x])).issues.some(i=>i.code==="DUPLICATE_IN_BATCH")).toBe(true)});
  it("warns for pending listening media",()=>expect(validateImportValue(file([item(1)])).issues.some(i=>i.code==="MEDIA_PENDING")).toBe(true));
  it("rejects oversized input",()=>expect(parseAndValidateImport("x".repeat(IMPORT_MAX_BYTES+1)).issues[0].code).toBe("FILE_TOO_LARGE"));
});
