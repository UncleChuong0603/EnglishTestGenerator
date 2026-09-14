import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const scalar = async (sql) => Number((await pool.query(sql)).rows[0].count);
const hasSubset = (sizes, target) => {
  const sums = new Set([0]);
  for (const size of sizes) for (const sum of [...sums].sort((a, b) => b - a)) if (sum + size <= target) sums.add(sum + size);
  return sums.has(target);
};

async function run() {
  const counts = {};
  for (const table of ["users", "profiles", "auth_identities", "passage_sets", "passages", "questions", "question_options", "question_solutions", "practice_sessions", "practice_session_questions", "attempt_answers", "demo_test_answers"]) {
    counts[table] = await scalar(`select count(*)::int count from ${table}`);
  }

  const integrity = {
    duplicateEmails: await scalar("select count(*)::int count from (select email_normalized from users group by email_normalized having count(*) > 1) x"),
    duplicateGoogleIdentities: await scalar("select count(*)::int count from (select provider, provider_account_id from auth_identities group by provider, provider_account_id having count(*) > 1) x"),
    missingProfiles: await scalar("select count(*)::int count from users u left join profiles p on p.id=u.id where p.id is null"),
    orphanedPracticeOwners: await scalar("select count(*)::int count from practice_sessions s left join users u on u.id=s.user_id where u.id is null"),
    orphanedAttemptOwners: await scalar("select count(*)::int count from attempt_answers a left join users u on u.id=a.user_id left join practice_sessions s on s.id=a.session_id where u.id is null or s.id is null or s.user_id<>a.user_id"),
    orphanedDemoOwners: await scalar("select count(*)::int count from demo_test_answers a left join users u on u.id=a.user_id left join practice_sessions s on s.id=a.session_id where u.id is null or s.id is null or s.user_id<>a.user_id"),
    invalidPublishedQuestions: await scalar("select count(*)::int count from questions q left join question_solutions s on s.question_id=q.id left join (select question_id,count(*) n from question_options group by question_id) o on o.question_id=q.id where q.status='published' and (s.question_id is null or coalesce(o.n,0)<>4 or nullif(s.explanation_en,'') is null or nullif(s.explanation_vi,'') is null)"),
    invalidPublishedPassageSets: await scalar("select count(*)::int count from passage_sets ps left join (select passage_set_id,count(*) n,count(distinct position) positions,min(position) min_position,max(position) max_position,bool_and(status='published') all_published from passages group by passage_set_id) p on p.passage_set_id=ps.id where ps.status='published' and (ps.toeic_part not in (6,7) or ps.set_type not in ('part6','single','double','triple') or coalesce(p.n,0)<>case ps.set_type when 'double' then 2 when 'triple' then 3 else 1 end or p.positions<>p.n or p.min_position<>1 or p.max_position<>p.n or not coalesce(p.all_published,false))"),
  };

  const bankRows = (await pool.query(`
    select q.toeic_part, coalesce(ps.set_type, 'standalone') set_type, q.passage_set_id, count(*)::int question_count
    from questions q left join passage_sets ps on ps.id=q.passage_set_id
    where q.status='published'
    group by q.toeic_part, ps.set_type, q.passage_set_id
    order by q.toeic_part, ps.set_type, q.passage_set_id
  `)).rows;
  const countQuestions = (part, type) => bankRows.filter((row) => Number(row.toeic_part) === part && (!type || row.set_type === type)).reduce((sum, row) => sum + Number(row.question_count), 0);
  const countSets = (part, type) => bankRows.filter((row) => Number(row.toeic_part) === part && row.set_type === type).length;
  const sizes = (part) => bankRows.filter((row) => Number(row.toeic_part) === part).map((row) => Number(row.question_count));
  const questionBank = {
    part5Questions: countQuestions(5),
    part6Sets: countSets(6, "part6"),
    part6Questions: countQuestions(6),
    part7SingleSets: countSets(7, "single"),
    part7SingleQuestions: countQuestions(7, "single"),
    part7DoubleSets: countSets(7, "double"),
    part7DoubleQuestions: countQuestions(7, "double"),
    part7TripleSets: countSets(7, "triple"),
    part7TripleQuestions: countQuestions(7, "triple"),
  };
  const clean = Object.values(integrity).every((value) => value === 0);
  const demoReady = clean && questionBank.part5Questions >= 30 && hasSubset(sizes(6), 16) && hasSubset(sizes(7), 54)
    && questionBank.part7SingleSets > 0 && questionBank.part7DoubleSets > 0 && questionBank.part7TripleSets > 0;
  console.log(JSON.stringify({ counts, integrity, questionBank, demoComposition: "30/16/54", demoReady, clean }, null, 2));
  if (!clean || !demoReady) process.exitCode = 1;
}

run().finally(() => pool.end()).catch((error) => { console.error(error instanceof Error ? error.message : "Production database verification failed"); process.exitCode = 1; });
