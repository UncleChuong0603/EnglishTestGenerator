import pg from "pg";
import { productionListening } from "./content-manifest.mjs";
import { part5Questions, readingPassageSets } from "./reading-seed-data.mjs";
import { validateReadingSeed } from "./validate-reading-seed.mjs";

const size = set => Number(set.questionCount ?? set.question_count ?? set.questions?.length ?? 0);
const sum = sets => sets.reduce((total, set) => total + size(set), 0);
const canChoose = (sets, groups, questions, at = 0) => groups === 0 ? questions === 0 : questions > 0 && sets.length - at >= groups && sets.slice(at).some((set, offset) => canChoose(sets, groups - 1, questions - size(set), at + offset + 1));

async function productionCoverage() {
  if (!process.env.DATABASE_URL) return null;
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const listening = await pool.query(`select ps.id, ps.toeic_part as part, count(distinct q.id)::int as question_count
      from passage_sets ps join questions q on q.passage_set_id=ps.id and q.status='published'
      where ps.skill_area='LISTENING' and ps.status='published'
        and exists(select 1 from listening_transcripts lt where lt.question_group_id=ps.id and length(trim(lt.content))>0)
        and exists(select 1 from question_group_media qgm join media_assets ma on ma.id=qgm.media_asset_id where qgm.question_group_id=ps.id and qgm.role='AUDIO' and ma.status='READY' and ma.access_scope='CONTENT')
        and (ps.toeic_part<>1 or exists(select 1 from question_group_media qgm join media_assets ma on ma.id=qgm.media_asset_id where qgm.question_group_id=ps.id and qgm.role='IMAGE' and ma.status='READY' and ma.access_scope='CONTENT'))
        and not exists(select 1 from questions q2 left join question_solutions qs on qs.question_id=q2.id where q2.passage_set_id=ps.id and (qs.question_id is null or coalesce(trim(qs.explanation_en),'')='' or coalesce(trim(qs.explanation_vi),'')=''))
      group by ps.id,ps.toeic_part`);
    const reading = await pool.query(`select ps.id, ps.toeic_part as part, ps.set_type, count(q.id)::int as question_count from passage_sets ps join questions q on q.passage_set_id=ps.id and q.status='published' where ps.skill_area='READING' and ps.status='published' group by ps.id,ps.toeic_part,ps.set_type`);
    const p5 = await pool.query(`select count(*)::int as count from questions where skill_area='READING' and toeic_part=5 and status='published'`);
    return { listening: listening.rows, reading: reading.rows, p5: p5.rows[0].count };
  } finally { await pool.end(); }
}

const db = await productionCoverage();
const sourceOnly = !db;
const listenGroups = part => sourceOnly ? productionListening.filter(item => item.part === part).map(item => ({ questionCount: item.questions?.length ?? 1 })) : db.listening.filter(item => item.part === part);
const part6 = sourceOnly ? readingPassageSets.filter(set => set.toeicPart === 6 && set.status === "published" && set.questions.length === 4) : db.reading.filter(set => set.part === 6 && set.question_count === 4);
const p7Single = sourceOnly ? readingPassageSets.filter(set => set.toeicPart === 7 && set.status === "published" && set.setType === "single") : db.reading.filter(set => set.part === 7 && set.set_type === "single");
const p7Multiple = sourceOnly ? readingPassageSets.filter(set => set.toeicPart === 7 && set.status === "published" && ["double", "triple"].includes(set.setType)) : db.reading.filter(set => set.part === 7 && ["double", "triple"].includes(set.set_type));
const coverage = { p1: sum(listenGroups(1)), p2: sum(listenGroups(2)), p3Groups: listenGroups(3).filter(g => size(g) === 3).length, p4Groups: listenGroups(4).filter(g => size(g) === 3).length, p5: sourceOnly ? part5Questions.filter(q => q.status === "published").length : db.p5, p6Groups: part6.length, p6: sum(part6), p7SingleGroups: p7Single.length, p7SingleQuestions: sum(p7Single), p7MultipleGroups: p7Multiple.length, p7MultipleQuestions: sum(p7Multiple) };
const listeningFeasible = coverage.p1 >= 6 && coverage.p2 >= 25 && coverage.p3Groups >= 13 && coverage.p4Groups >= 10;
const readingFeasible = validateReadingSeed().errors.length === 0 && coverage.p5 >= 30 && canChoose(part6,4,16) && canChoose(p7Single,10,29) && canChoose(p7Multiple,5,25);
const listeningReady = !sourceOnly && listeningFeasible, readingReady = !sourceOnly && readingFeasible, fullReady = listeningReady && readingReady;
console.log(["MOCK TEST HUB READINESS", sourceOnly ? "Mode: SOURCE FEASIBILITY (DATABASE_URL unavailable; activation cannot be certified)" : "Mode: CURRENT DATABASE", "", "Listening", `P1: ${coverage.p1} / 6`, `P2: ${coverage.p2} / 25`, `P3 groups: ${coverage.p3Groups} / 13`, `P4 groups: ${coverage.p4Groups} / 10`, `LISTENING READY: ${listeningReady?"YES":"NO"}`, "", "Reading", `P5: ${coverage.p5} / 30`, `P6: ${coverage.p6Groups} complete groups, ${coverage.p6} questions / 16`, `P7 single: ${coverage.p7SingleGroups} groups, ${coverage.p7SingleQuestions} questions; exact 10 / 29: ${canChoose(p7Single,10,29)?"YES":"NO"}`, `P7 multiple: ${coverage.p7MultipleGroups} groups, ${coverage.p7MultipleQuestions} questions; exact 5 / 25: ${canChoose(p7Multiple,5,25)?"YES":"NO"}`, `READING READY: ${readingReady?"YES":"NO"}`, "", `FULL READY: ${fullReady?"YES":"NO"}`].join("\n"));
if (!listeningReady || !readingReady || !fullReady) process.exitCode = 1;
