import { describe, expect, it, vi } from "vitest";
import { Pool } from "pg";
vi.mock("server-only", () => ({}));

const enabled = process.env.TASK19_DB_INTEGRATION === "1";
describe.skipIf(!enabled)("Task 19 isolated PostgreSQL", () => {
  it("imports one draft group atomically and rejects re-import", async () => {
    const url = new URL(process.env.DATABASE_URL!);
    expect([url.hostname,url.port,url.pathname.slice(1),url.username]).toEqual(["127.0.0.1","15433","toeicgym_task17","toeicgym_test"]);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
    try {
      const identity = await pool.query("select current_database(), current_user");
      expect(identity.rows[0]).toEqual({current_database:"toeicgym_task17",current_user:"toeicgym_test"});
      const { commitQuestionImport, validateQuestionImport } = await import("./service");
      const actor="19000000-0000-4000-8000-000000000001";
      await pool.query("insert into users(id,email,email_normalized,status) values($1,'task19@test.local','task19@test.local','active') on conflict(id) do update set status='active'",[actor]);
      await pool.query("insert into user_roles(user_id,role,created_by) values($1,'ADMIN',$1) on conflict do nothing",[actor]);
      const stamp=Date.now().toString(36),batchKey=`task19-${stamp}`;
      const payload=JSON.stringify({schemaVersion:"1.0",batch:{batchKey,name:"Task 19 integration",sourceType:"ORIGINAL",rightsNote:"Original automated fixture.",language:"bilingual",reviewStatus:"UNREVIEWED"},items:[{externalItemId:`P5-${stamp}`,part:5,title:`Task 19 ${stamp}`,setType:"standalone",passages:[],questions:[{externalQuestionId:`P5-${stamp}-Q1`,text:`The integration report ${stamp} _____ complete.`,options:[{key:"A",text:"is"},{key:"B",text:"are"},{key:"C",text:"be"},{key:"D",text:"being"}],correctOptionKey:"A",explanation:{en:"A singular subject takes is.",vi:"Chủ ngữ số ít dùng is."},skill:"grammar",subSkill:"subject_verb_agreement",difficulty:"easy"}]}]});
      expect((await validateQuestionImport(payload)).valid).toBe(true);
      const result=await commitQuestionImport(actor,"task19.json",payload);
      expect(result.questionsCreated).toBe(1);
      const rows=await pool.query("select s.status group_status,q.status question_status,count(o.id)::int options from question_import_items i join passage_sets s on s.id=i.question_group_id join questions q on q.passage_set_id=s.id join question_options o on o.question_id=q.id where i.import_batch_id=$1 group by s.status,q.status",[result.importId]);
      expect(rows.rows[0]).toEqual({group_status:"draft",question_status:"draft",options:4});
      expect((await validateQuestionImport(payload)).issues.some((x)=>x.code==="ALREADY_IMPORTED")).toBe(true);
      await expect(commitQuestionImport(actor,"task19.json",payload)).rejects.toThrow();
      const specs:Record<number,{type:string;skill:string;subSkill:string;count:number}>={1:{type:"photographs",skill:"photographs",subSkill:"action",count:1},2:{type:"question_response",skill:"question_response",subSkill:"direct_response",count:1},3:{type:"conversation",skill:"conversation",subSkill:"detail",count:3},4:{type:"talk",skill:"talk",subSkill:"detail",count:3},6:{type:"part6",skill:"grammar",subSkill:"word_form",count:4},7:{type:"single",skill:"detail",subSkill:"explicit_information",count:1}};
      const items=Object.entries(specs).map(([partText,s])=>{const part=Number(partText);return{externalItemId:`P${part}-${stamp}`,part,title:`Task 19 P${part} ${stamp}`,setType:s.type,passages:part>=6?[{content:`Original development passage ${stamp} for P${part}.`}]:[],...(part<=4?{transcript:`Original spoken transcript ${stamp} P${part}.`}:{}),...(part<=4?{media:{audio:{pending:true},...(part===1?{image:{pending:true}}:{})}}:{}),questions:Array.from({length:s.count},(_,i)=>({externalQuestionId:`P${part}-${stamp}-Q${i+1}`,text:part<=2?"":`Original P${part} question ${i+1} ${stamp}?`,options:Array.from({length:part===2?3:4},(_,j)=>({key:String.fromCharCode(65+j),text:`P${part} answer ${i+1}-${j+1} ${stamp}`})),correctOptionKey:"A",explanation:{en:"Original English explanation.",vi:"Giải thích tiếng Việt gốc."},skill:s.skill,subSkill:s.subSkill,difficulty:"medium"}))}});
      const multi=JSON.stringify({schemaVersion:"1.0",batch:{batchKey:`all-parts-${stamp}`,name:"All parts integration",sourceType:"ORIGINAL",rightsNote:"Original automated fixture.",reviewStatus:"UNREVIEWED"},items});
      expect((await validateQuestionImport(multi)).valid).toBe(true);
      const allParts=await commitQuestionImport(actor,"all-parts.json",multi);
      expect(allParts.questionsCreated).toBe(13);
      const parts=await pool.query("select distinct s.toeic_part from question_import_items i join passage_sets s on s.id=i.question_group_id where i.import_batch_id=$1 order by s.toeic_part",[allParts.importId]);
      expect(parts.rows.map((x)=>x.toeic_part)).toEqual([1,2,3,4,6,7]);
    } finally { await pool.end(); }
  },30000);
});
