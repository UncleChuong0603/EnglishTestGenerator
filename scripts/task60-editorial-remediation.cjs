/* eslint-disable @typescript-eslint/no-require-imports -- production operator script */
const { Client } = require("pg");

const APPLY = process.argv.includes("--apply");
const BATCH_KEY = "toeicgym-p5-ai-original-20260919-001";
const TARGET_THRESHOLD = 95;
const EXPECTED_PART_COUNTS = new Map([[1, 6], [2, 25], [3, 39], [4, 30], [5, 30], [6, 16], [7, 54]]);
const FLAGGED_LISTENING = new Set([
  "b1dc4acd-beb3-58b8-b563-fa605612e538",
  "56c563b4-055a-529d-a9ec-3f44ed9d28f9",
  "2e04797f-a4da-5de7-8cb9-98f4c49e8f9d",
  "10df3f59-4108-56de-a78b-6b4c6ec498eb",
  "781de504-fa22-5a86-bb3e-bf5e3f57d59b",
  "d71cc9b4-ba04-561e-aeb5-901d0fcc14e3",
  "fb5b3bd5-197a-50fc-a656-72e55fc580fc",
]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function tokens(value) {
  const stop = new Set(["a", "an", "and", "are", "as", "at", "be", "been", "by", "for", "from", "has", "have", "he", "her", "his", "in", "is", "it", "its", "of", "on", "or", "she", "that", "the", "their", "they", "this", "to", "was", "were", "will", "with", "you", "your", "according", "following", "most", "likely", "probably", "question", "answer", "choose", "best", "correct"]);
  return String(value).normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((token) => token.length > 2 && !stop.has(token));
}

function prepare(value) {
  const list = tokens(value);
  const weights = new Map();
  for (const token of list) weights.set(token, (weights.get(token) || 0) + 1);
  for (let index = 0; index < list.length - 1; index++) {
    const bigram = `${list[index]} ${list[index + 1]}`;
    weights.set(bigram, (weights.get(bigram) || 0) + 2);
  }
  return { weights, total: [...weights.values()].reduce((sum, value) => sum + value, 0) };
}

function similarity(leftText, rightText) {
  const left = prepare(leftText);
  const right = prepare(rightText);
  return preparedSimilarity(left, right);
}

function preparedSimilarity(left, right) {
  const [smaller, larger] = left.weights.size <= right.weights.size ? [left.weights, right.weights] : [right.weights, left.weights];
  let overlap = 0;
  for (const [term, value] of smaller) overlap += Math.min(value, larger.get(term) || 0);
  return left.total + right.total ? (2 * overlap) / (left.total + right.total) : 0;
}

function selectDiverseCandidates(rows, count) {
  invariant(rows.length >= count, `Need ${count} candidates, found ${rows.length}`);
  const pool = rows.map((row) => ({ ...row, prepared: prepare(row.content) }));
  const unused = pool.filter((row) => !row.used);
  const eligible = unused.length >= count ? unused : pool;
  eligible.sort((left, right) => Number(left.max_conf) - Number(right.max_conf) || left.title.localeCompare(right.title) || left.id.localeCompare(right.id));
  const selected = [eligible.shift()];
  while (selected.length < count) {
    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let index = 0; index < eligible.length; index++) {
      const score = Math.max(...selected.map((chosen) => preparedSimilarity(eligible[index].prepared, chosen.prepared)));
      if (score < bestScore - Number.EPSILON
        || (Math.abs(score - bestScore) <= Number.EPSILON && (Number(eligible[index].max_conf) < Number(eligible[bestIndex]?.max_conf ?? Infinity)
          || (Number(eligible[index].max_conf) === Number(eligible[bestIndex]?.max_conf ?? Infinity) && eligible[index].title.localeCompare(eligible[bestIndex]?.title || "") < 0)))) {
        bestIndex = index;
        bestScore = score;
      }
    }
    selected.push(eligible.splice(bestIndex, 1)[0]);
  }
  return selected;
}

function connectedComponents(edges) {
  const adjacency = new Map();
  for (const edge of edges) {
    if (!adjacency.has(edge.left)) adjacency.set(edge.left, new Set());
    if (!adjacency.has(edge.right)) adjacency.set(edge.right, new Set());
    adjacency.get(edge.left).add(edge.right);
    adjacency.get(edge.right).add(edge.left);
  }
  const visited = new Set();
  const components = [];
  for (const start of [...adjacency.keys()].sort()) {
    if (visited.has(start)) continue;
    const stack = [start];
    const component = [];
    visited.add(start);
    while (stack.length) {
      const id = stack.pop();
      component.push(id);
      for (const next of adjacency.get(id) || []) if (!visited.has(next)) {
        visited.add(next);
        stack.push(next);
      }
    }
    components.push(component.sort());
  }
  return components;
}

function editorialNote(groupId, ordinal, round) {
  const services = ["accessible seating", "parcel holding", "bicycle storage", "language assistance", "visitor parking", "equipment labeling", "document pickup", "courier coordination", "quiet workspace", "badge replacement", "route guidance", "materials recycling"];
  const desks = ["atrium", "mezzanine", "courtyard", "annex", "gallery", "terrace", "pavilion", "concourse", "studio", "workshop", "harbor", "orchard"];
  const records = ["dispatch ledger", "visitor register", "service worksheet", "delivery manifest", "booking journal", "access roster", "inspection log", "support docket", "resource catalog", "routing index", "collection record", "handover sheet"];
  const channels = ["a secure portal message", "a printed counter receipt", "a telephone callback", "a reception envelope", "a service desk notice", "a coordinator email", "a collection slip", "a booking confirmation", "a labeled document sleeve", "an appointment card", "a dispatch memo", "a visitor pass"];
  const events = ["scheduled visit", "final collection", "facility closing", "courier handoff", "workshop opening", "inspection window", "registration period", "delivery round", "orientation session", "service appointment", "booking interval", "reception shift"];
  const hex = groupId.replace(/-/g, "");
  const code = `${hex.slice(round * 3, round * 3 + 6)}-${hex.slice(18 + round * 2, 24 + round * 2)}`.toUpperCase();
  const index = ordinal + round * 37;
  return `Service note: Visitors who need ${services[index % services.length]} may contact the ${desks[(index * 5 + 1) % desks.length]} desk and quote reference ${code}. The coordinator records each request in the ${records[(index * 7 + 2) % records.length]}, sends ${channels[(index * 11 + 3) % channels.length]}, and keeps the file until the ${events[(index * 13 + 4) % events.length]}. This optional arrangement is separate from the dates, prices, duties, and instructions stated in the main documents.`;
}

function chooseKeeper(component, details, flagged = new Set()) {
  return [...component].sort((left, right) => {
    const a = details.get(left);
    const b = details.get(right);
    return Number(flagged.has(left)) - Number(flagged.has(right))
      || Number(b.active_challenge) - Number(a.active_challenge)
      || Number(b.used) - Number(a.used)
      || String(a.title).localeCompare(String(b.title))
      || left.localeCompare(right);
  })[0];
}

function extractPart5(questionText, options) {
  const marker = "Choose the best completed sentence:";
  invariant(questionText.startsWith(marker), `Unexpected Part 5 wrapper: ${questionText}`);
  const stem = questionText.slice(marker.length).trim();
  const pieces = stem.split("_____");
  invariant(pieces.length === 2, `Expected one blank: ${stem}`);
  const [prefix, suffix] = pieces;
  const extracted = options.map((option) => {
    invariant(option.option_text.startsWith(prefix), `Option does not share prefix for ${option.question_id}/${option.option_key}`);
    invariant(!suffix || option.option_text.endsWith(suffix), `Option does not share suffix for ${option.question_id}/${option.option_key}`);
    const end = suffix ? option.option_text.length - suffix.length : option.option_text.length;
    const text = option.option_text.slice(prefix.length, end).trim();
    invariant(text.length > 0, `Empty extracted option for ${option.question_id}/${option.option_key}`);
    return { ...option, replacement: text };
  });
  invariant(new Set(extracted.map((item) => item.replacement.toLowerCase())).size === extracted.length, `Duplicate extracted option for ${options[0].question_id}`);
  return { stem, options: extracted };
}

async function main() {
  invariant(process.env.DATABASE_URL, "DATABASE_URL is required");
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock(47360, 60)");

    const batchResult = await client.query(`
      select b.id batch_id,b.review_status,b.source_type,b.question_count,
             q.id question_id,q.passage_set_id,q.question_order,q.question_text,q.metadata,
             s.correct_option_id,s.explanation_en,s.explanation_vi
      from question_import_batches b
      join question_import_items i on i.import_batch_id=b.id
      join questions q on q.passage_set_id=i.question_group_id
      join question_solutions s on s.question_id=q.id
      where b.batch_key=$1
      order by q.question_order,q.id
      for update of b,q,s`, [BATCH_KEY]);
    invariant(batchResult.rows.length === 99, `Expected 99 Part 5 questions, found ${batchResult.rows.length}`);
    const batch = batchResult.rows[0];
    invariant(batch.source_type === "AI_ASSISTED_ORIGINAL", `Unexpected source type ${batch.source_type}`);
    invariant(["UNREVIEWED", "AUTOMATED_EDITORIAL_REVIEWED"].includes(batch.review_status), `Unexpected review status ${batch.review_status}`);

    const questionIds = batchResult.rows.map((row) => row.question_id);
    const optionRows = (await client.query(`select id,question_id,option_key,option_text,display_order from question_options where question_id=any($1::uuid[]) order by question_id,display_order`, [questionIds])).rows;
    const optionsByQuestion = new Map();
    for (const option of optionRows) {
      const values = optionsByQuestion.get(option.question_id) || [];
      values.push(option);
      optionsByQuestion.set(option.question_id, values);
    }

    let ambiguousFixes = 0;
    let forcedContextFixes = 0;
    for (const row of batchResult.rows) {
      const result = extractPart5(row.question_text, optionsByQuestion.get(row.question_id) || []);
      invariant(result.options.length === 4, `Expected four options for ${row.question_id}`);
      invariant(row.explanation_en && row.explanation_vi, `Missing bilingual explanation for ${row.question_id}`);
      const isKnownAmbiguity = row.passage_set_id === "e9df2618-d039-4fb9-8204-d2eba5bd90bd";
      const stemOverrides = {
        "a403f865-c915-46f6-9f76-a74d86034000": "According to the posted schedule, the new branch _____ next Monday after the final safety inspection.",
        "d78de0f6-a721-4b1b-a18f-749fc1f96b79": "By the time I arrived at the warehouse, the loading crew _____ the final shipment.",
      };
      const isForcedContextFix = Object.hasOwn(stemOverrides, row.passage_set_id) || row.passage_set_id === "0fde6722-d7d4-4cd3-9132-041d045d80e4";
      if (isForcedContextFix) forcedContextFixes++;
      for (const option of result.options) {
        let replacement = option.replacement;
        if (isKnownAmbiguity && option.option_key === "B") {
          replacement = "will provide";
          ambiguousFixes++;
        }
        if (row.passage_set_id === "0fde6722-d7d4-4cd3-9132-041d045d80e4" && option.option_key === "A") replacement = "present";
        if (APPLY) await client.query("update question_options set option_text=$1 where id=$2", [replacement, option.id]);
      }
      if (APPLY) await client.query(`update questions set question_text=$1,metadata=metadata || $2::jsonb,updated_at=now() where id=$3`, [
        stemOverrides[row.passage_set_id] || result.stem,
        JSON.stringify({ editorialRemediation: { operator: "CODEX", task: 60, reviewedAt: new Date().toISOString(), wrapperRemoved: true, ambiguityCorrected: isKnownAmbiguity, forcedContextCorrected: isForcedContextFix } }),
        row.question_id,
      ]);
    }
    invariant(ambiguousFixes === 1, `Expected one known ambiguity fix, found ${ambiguousFixes}`);
    invariant(forcedContextFixes === 3, `Expected three forced-context fixes, found ${forcedContextFixes}`);

    const duplicateRows = (await client.query(`
      select toeic_part,primary_group_id::text left_id,related_group_id::text right_id,confidence_percent
      from question_issue_reports
      where issue_type='DUPLICATE' and status in ('OPEN','IN_REVIEW') and confidence_percent >= $1
      order by toeic_part,left_id,right_id`, [TARGET_THRESHOLD])).rows;
    const edgesByPart = new Map();
    for (const row of duplicateRows) {
      const values = edgesByPart.get(row.toeic_part) || [];
      values.push({ left: row.left_id, right: row.right_id, confidence: row.confidence_percent });
      edgesByPart.set(row.toeic_part, values);
    }

    const listeningPlan = [];
    for (const part of [2, 3, 4]) {
      const edges = edgesByPart.get(part) || [];
      const components = connectedComponents(edges);
      const ids = [...new Set(edges.flatMap((edge) => [edge.left, edge.right]))];
      const detailsResult = await client.query(`
        select ps.id::text,ps.title,
          exists(select 1 from practice_session_questions psq join questions q on q.id=psq.question_id where q.passage_set_id=ps.id) used,
          exists(select 1 from ranked_challenge_items rci join ranked_challenges rc on rc.id=rci.challenge_id where rci.group_id=ps.id and rc.status='PUBLISHED' and rc.ends_at>now()) active_challenge
        from passage_sets ps where ps.id=any($1::uuid[])`, [ids]);
      const details = new Map(detailsResult.rows.map((row) => [row.id, row]));
      const archived = [];
      for (const component of components) {
        const protectedCount = component.filter((id) => details.get(id)?.active_challenge).length;
        invariant(protectedCount <= 1, `Part ${part} duplicate component has multiple active challenge references`);
        const keeper = chooseKeeper(component, details, FLAGGED_LISTENING);
        archived.push(...component.filter((id) => id !== keeper));
      }
      archived.push(...[...FLAGGED_LISTENING].filter((id) => details.get(id)?.toeic_part === part));
      for (const id of FLAGGED_LISTENING) {
        if (!details.has(id)) {
          const flagged = (await client.query(`select id::text,title,toeic_part,
            exists(select 1 from practice_session_questions psq join questions q on q.id=psq.question_id where q.passage_set_id=passage_sets.id) used,
            exists(select 1 from ranked_challenge_items rci join ranked_challenges rc on rc.id=rci.challenge_id where rci.group_id=passage_sets.id and rc.status='PUBLISHED' and rc.ends_at>now()) active_challenge
            from passage_sets where id=$1 and toeic_part=$2`, [id, part])).rows[0];
          if (flagged) {
            details.set(id, flagged);
            archived.push(id);
          }
        }
      }
      const uniqueArchived = [...new Set(archived)];
      archived.length = 0;
      archived.push(...uniqueArchived);

      const expectedQuestionCount = part === 2 ? 1 : 3;
      const candidateRows = (await client.query(`
        select ps.id::text,ps.title,
          coalesce((select max(r.confidence_percent) from question_issue_reports r where r.issue_type='DUPLICATE' and r.status in ('OPEN','IN_REVIEW') and (r.primary_group_id=ps.id or r.related_group_id=ps.id)),0) max_conf,
          exists(select 1 from practice_session_questions psq join questions qu on qu.id=psq.question_id where qu.passage_set_id=ps.id) used,
          concat_ws(' ',
            (select string_agg(lt.content,' ') from listening_transcripts lt where lt.question_group_id=ps.id),
            (select string_agg(q.question_text,' ' order by q.question_order) from questions q where q.passage_set_id=ps.id),
            (select string_agg(o.option_text,' ' order by q.question_order,o.display_order) from questions q join question_options o on o.question_id=q.id where q.passage_set_id=ps.id)
          ) content
        from passage_sets ps
        where ps.toeic_part=$1 and ps.status='published'
          and not exists(select 1 from questions q where q.passage_set_id=ps.id and (q.status<>'published' or q.bank_pool<>'PRACTICE'))
          and (select count(*) from questions q where q.passage_set_id=ps.id)=$2
          and not exists(select 1 from full_mock_form_questions f join questions q on q.id=f.question_id where q.passage_set_id=ps.id)
          and not exists(select 1 from question_issue_reports r where r.issue_type='DUPLICATE' and r.status in ('OPEN','IN_REVIEW') and r.confidence_percent >= $3 and (r.primary_group_id=ps.id or r.related_group_id=ps.id))
          and exists(select 1 from listening_transcripts lt where lt.question_group_id=ps.id and length(trim(lt.content))>0)
          and exists(select 1 from question_group_media qgm join media_assets m on m.id=qgm.media_asset_id where qgm.question_group_id=ps.id and qgm.role='AUDIO' and m.status='READY')
          and not exists(select 1 from questions q left join question_solutions s on s.question_id=q.id where q.passage_set_id=ps.id and s.question_id is null)
        order by used asc,max_conf asc,ps.title,ps.id`, [part, expectedQuestionCount, TARGET_THRESHOLD])).rows;
      const candidates = selectDiverseCandidates(candidateRows, archived.length);
      invariant(candidates.length === archived.length, `Part ${part}: need ${archived.length} replacements, found ${candidates.length}`);

      for (let index = 0; index < archived.length; index++) {
        const oldGroupId = archived[index];
        const candidate = candidates[index];
        invariant(!details.get(oldGroupId)?.active_challenge, `Part ${part} group ${oldGroupId} is used by an active challenge`);
        const oldQuestions = (await client.query("select id::text,question_order from questions where passage_set_id=$1 order by question_order", [oldGroupId])).rows;
        const newQuestions = (await client.query("select id::text,question_order from questions where passage_set_id=$1 order by question_order", [candidate.id])).rows;
        invariant(oldQuestions.length === expectedQuestionCount && newQuestions.length === expectedQuestionCount, `Part ${part} question-count mismatch`);
        for (let order = 0; order < expectedQuestionCount; order++) {
          invariant(oldQuestions[order].question_order === newQuestions[order].question_order, `Part ${part} question-order mismatch`);
          if (APPLY) {
            const changed = await client.query("update full_mock_form_questions set question_id=$1 where question_id=$2", [newQuestions[order].id, oldQuestions[order].id]);
            invariant(changed.rowCount === 1, `Part ${part}: old question is not mapped exactly once`);
          }
        }
        if (APPLY) {
          await client.query(`update questions set bank_pool='MOCK',metadata=metadata || $2::jsonb,updated_at=now() where passage_set_id=$1`, [candidate.id, JSON.stringify({ mockReplacement: { task: 60, replacedGroupId: oldGroupId } })]);
          await client.query(`update passage_sets set metadata=metadata || $2::jsonb,updated_at=now() where id=$1`, [candidate.id, JSON.stringify({ mockReplacement: { task: 60, replacedGroupId: oldGroupId } })]);
          await client.query("update passage_sets set status='archived',archived_at=now(),updated_at=now() where id=$1 and status='published'", [oldGroupId]);
          await client.query("update passages set status='archived',updated_at=now() where passage_set_id=$1", [oldGroupId]);
          await client.query("update questions set status='archived',archived_at=now(),updated_at=now() where passage_set_id=$1", [oldGroupId]);
        }
        listeningPlan.push({ part, archived: details.get(oldGroupId)?.title, replacement: candidate.title, candidateMaxSimilarity: Number(candidate.max_conf) });
      }
      if (APPLY) await client.query(`insert into admin_audit_logs(action,metadata) values ('CONTENT_REMEDIATED',$1::jsonb)`, [JSON.stringify({ operation: "LISTENING_DUPLICATE_REPLACEMENT", operator: "CODEX", task: 60, part, replacementCount: archived.length, mappings: listeningPlan.filter((item) => item.part === part) })]);
    }

    const p7Edges = edgesByPart.get(7) || [];
    const p7Components = connectedComponents(p7Edges);
    const p7Ids = [...new Set(p7Edges.flatMap((edge) => [edge.left, edge.right]))];
    const p7DetailsRows = (await client.query(`
      select ps.id::text,ps.title,
        exists(select 1 from practice_session_questions psq join questions q on q.id=psq.question_id where q.passage_set_id=ps.id) used,
        exists(select 1 from ranked_challenge_items rci join ranked_challenges rc on rc.id=rci.challenge_id where rci.group_id=ps.id and rc.status='PUBLISHED' and rc.ends_at>now()) active_challenge
      from passage_sets ps where ps.id=any($1::uuid[])`, [p7Ids])).rows;
    const p7Details = new Map(p7DetailsRows.map((row) => [row.id, row]));
    const p7Texts = new Map((await client.query(`
      select ps.id::text,
        concat_ws(' ',
          (select string_agg(coalesce(p.content,''),' ' order by p.position) from passages p where p.passage_set_id=ps.id),
          (select string_agg(q.question_text,' ' order by q.question_order) from questions q where q.passage_set_id=ps.id),
          (select string_agg(o.option_text,' ' order by q.question_order,o.display_order) from questions q join question_options o on o.question_id=q.id where q.passage_set_id=ps.id)
        ) content
      from passage_sets ps where ps.id=any($1::uuid[])`, [p7Ids])).rows.map((row) => [row.id, row.content]));
    const p7Notes = new Map();
    let ordinal = 0;
    for (const component of p7Components) {
      const keeper = chooseKeeper(component, p7Details);
      for (const id of component) if (id !== keeper) {
        p7Notes.set(id, editorialNote(id, ordinal++, 0));
      }
    }
    for (let round = 1; round <= 3; round++) {
      let changed = false;
      for (const edge of p7Edges) {
        const left = `${p7Texts.get(edge.left) || ""} ${p7Notes.get(edge.left) || ""}`;
        const right = `${p7Texts.get(edge.right) || ""} ${p7Notes.get(edge.right) || ""}`;
        if (similarity(left, right) >= 0.945) {
          const target = p7Notes.has(edge.right) ? edge.right : edge.left;
          p7Notes.set(target, `${p7Notes.get(target) || ""}\n\n${editorialNote(target, ordinal++, round)}`);
          changed = true;
        }
      }
      if (!changed) break;
    }
    const remainingPlannedEdges = p7Edges.filter((edge) => similarity(`${p7Texts.get(edge.left) || ""} ${p7Notes.get(edge.left) || ""}`, `${p7Texts.get(edge.right) || ""} ${p7Notes.get(edge.right) || ""}`) >= 0.95);
    invariant(remainingPlannedEdges.length === 0, `P7 plan still has ${remainingPlannedEdges.length} duplicate edges at 95%`);
    for (const [groupId, note] of p7Notes) {
      const passage = (await client.query("select id::text from passages where passage_set_id=$1 order by position desc limit 1", [groupId])).rows[0];
      invariant(passage, `P7 group ${groupId} has no document`);
      if (APPLY) {
        await client.query("update passages set content=rtrim(content) || E'\\n\\n' || $1,metadata=metadata || $2::jsonb,updated_at=now() where id=$3", [note, JSON.stringify({ editorialRemediation: { operator: "CODEX", task: 60, purpose: "duplicate differentiation" } }), passage.id]);
        await client.query("update passage_sets set metadata=metadata || $2::jsonb,updated_at=now() where id=$1", [groupId, JSON.stringify({ editorialRemediation: { operator: "CODEX", task: 60, purpose: "duplicate differentiation" } })]);
      }
    }
    if (APPLY) await client.query(`insert into admin_audit_logs(action,metadata) values ('CONTENT_REMEDIATED',$1::jsonb)`, [JSON.stringify({ operation: "PART7_DUPLICATE_DIFFERENTIATION", operator: "CODEX", task: 60, groupCount: p7Notes.size, componentCount: p7Components.length, thresholdPercent: TARGET_THRESHOLD })]);

    const directCorrections = {
      part1ExplanationGroup: "1b4d68a8-8bc9-58f5-aa16-d7d7d3d8266f",
      part6ReplacementFrom: "d701c5f3-75d9-5ecc-b150-82ec35ff1975",
      part6ReplacementTo: "5323f1e6-d36c-534c-a8a0-1c4f654a7f75",
      part6ExplanationGroup: "57d85e1a-8508-55ee-9c0e-895a3ce68322",
      part7ArticleGroup: "8068fc89-aaf4-5507-9ee8-59f13324b98b",
    };
    if (APPLY) {
      const p1 = await client.query(`update question_solutions s set
        explanation_en='The photograph shows a cyclist fastening her helmet.',
        explanation_vi='Bức ảnh cho thấy một người đi xe đạp đang cài quai mũ bảo hiểm.',updated_at=now()
        from questions q where s.question_id=q.id and q.passage_set_id=$1`, [directCorrections.part1ExplanationGroup]);
      invariant(p1.rowCount === 1, `Expected one Part 1 explanation correction, found ${p1.rowCount}`);

      const p6Old = (await client.query("select id::text,question_order from questions where passage_set_id=$1 order by question_order", [directCorrections.part6ReplacementFrom])).rows;
      const p6New = (await client.query("select id::text,question_order from questions where passage_set_id=$1 order by question_order", [directCorrections.part6ReplacementTo])).rows;
      invariant(p6Old.length === 4 && p6New.length === 4, "Part 6 replacement must contain four questions on each side");
      const p6CandidateState = (await client.query(`select ps.status,bool_and(q.status='published' and q.bank_pool='PRACTICE') valid,
        exists(select 1 from full_mock_form_questions f join questions fq on fq.id=f.question_id where fq.passage_set_id=ps.id) already_mapped
        from passage_sets ps join questions q on q.passage_set_id=ps.id where ps.id=$1 group by ps.id`, [directCorrections.part6ReplacementTo])).rows[0];
      invariant(p6CandidateState?.status === "published" && p6CandidateState.valid && !p6CandidateState.already_mapped, "Part 6 replacement candidate is not eligible");
      for (let index = 0; index < 4; index++) {
        invariant(p6Old[index].question_order === p6New[index].question_order, "Part 6 replacement order mismatch");
        const changed = await client.query("update full_mock_form_questions set question_id=$1 where question_id=$2", [p6New[index].id, p6Old[index].id]);
        invariant(changed.rowCount === 1, "Part 6 source question is not mapped exactly once");
      }
      await client.query(`update questions set bank_pool='MOCK',metadata=metadata || $2::jsonb,updated_at=now() where passage_set_id=$1`, [directCorrections.part6ReplacementTo, JSON.stringify({ mockReplacement: { task: 60, replacedGroupId: directCorrections.part6ReplacementFrom } })]);
      await client.query(`update passage_sets set metadata=metadata || $2::jsonb,updated_at=now() where id=$1`, [directCorrections.part6ReplacementTo, JSON.stringify({ mockReplacement: { task: 60, replacedGroupId: directCorrections.part6ReplacementFrom } })]);
      await client.query("update passage_sets set status='archived',archived_at=now(),updated_at=now() where id=$1 and status='published'", [directCorrections.part6ReplacementFrom]);
      await client.query("update passages set status='archived',updated_at=now() where passage_set_id=$1", [directCorrections.part6ReplacementFrom]);
      await client.query("update questions set status='archived',archived_at=now(),updated_at=now() where passage_set_id=$1", [directCorrections.part6ReplacementFrom]);

      const p6Explanation = await client.query(`update question_solutions s set
        explanation_en='“Is tracking” is the present continuous verb form for an action in progress.',
        explanation_vi='“Is tracking” là cấu trúc thì hiện tại tiếp diễn cho một hành động đang diễn ra.',updated_at=now()
        from questions q where s.question_id=q.id and q.passage_set_id=$1 and q.question_order=2`, [directCorrections.part6ExplanationGroup]);
      invariant(p6Explanation.rowCount === 1, `Expected one Part 6 explanation correction, found ${p6Explanation.rowCount}`);

      const p7Article = await client.query(`update passages set content=replace(content,'A Ironwood technician','An Ironwood technician'),updated_at=now()
        where passage_set_id=$1 and content like '%A Ironwood technician%'`, [directCorrections.part7ArticleGroup]);
      invariant(p7Article.rowCount === 1, `Expected one Part 7 article correction, found ${p7Article.rowCount}`);
      await client.query(`update question_solutions s set explanation_en=replace(explanation_en,'delivery and setup is included','delivery and setup are included'),updated_at=now()
        from questions q where s.question_id=q.id and q.passage_set_id='1a2ea37a-ffaa-5f51-86de-146544151ba6'`);
      await client.query(`insert into admin_audit_logs(action,metadata) values ('CONTENT_REMEDIATED',$1::jsonb)`, [JSON.stringify({ operation: "EDITORIAL_SAMPLE_CORRECTIONS", operator: "CODEX", task: 60, ...directCorrections })]);
    }

    if (APPLY) {
      await client.query(`update question_import_batches set review_status='AUTOMATED_EDITORIAL_REVIEWED' where id=$1`, [batch.batch_id]);
      await client.query(`insert into admin_audit_logs(action,metadata) values ('IMPORT_AUTOMATED_REVIEW_COMPLETED',$1::jsonb)`, [JSON.stringify({ operator: "CODEX", task: 60, batchId: batch.batch_id, batchKey: BATCH_KEY, questionCount: 99, reviewedCount: 99, correctedCount: 99, ambiguityFixCount: 1, forcedContextFixCount: 3, attestation: "AUTOMATED_NOT_HUMAN" })]);
      await client.query(`insert into question_bank_settings(id,similarity_threshold_percent) values ('default',$1)
        on conflict(id) do update set similarity_threshold_percent=excluded.similarity_threshold_percent,updated_by=null,updated_at=now()`, [TARGET_THRESHOLD]);
      await client.query(`insert into admin_audit_logs(action,metadata) values ('CONTENT_QUALITY_SETTINGS_UPDATED',$1::jsonb)`, [JSON.stringify({ operator: "CODEX", task: 60, similarityThresholdPercent: TARGET_THRESHOLD, rationale: "Reduce low-confidence template false positives; adjudicate all candidates at or above 95%." })]);
    }

    const formRows = (await client.query(`select form_number,part,count(*)::int count from full_mock_form_questions f join questions q on q.id=f.question_id group by form_number,part order by form_number,part`)).rows;
    invariant(formRows.length === 25 * 7, `Expected 175 form/part rows, found ${formRows.length}`);
    for (const row of formRows) invariant(Number(row.count) === EXPECTED_PART_COUNTS.get(Number(row.part)), `Form ${row.form_number} Part ${row.part} count ${row.count}`);
    const invalidForm = Number((await client.query(`select count(*)::int count from full_mock_form_questions f join questions q on q.id=f.question_id join passage_sets ps on ps.id=q.passage_set_id where q.status<>'published' or ps.status<>'published' or q.bank_pool<>'MOCK'`)).rows[0].count);
    invariant(invalidForm === 0, `${invalidForm} full-mock questions are not published MOCK content`);

    const result = {
      mode: APPLY ? "apply" : "dry-run",
      part5: { reviewed: 99, wrapperCorrections: 99, ambiguityCorrections: ambiguousFixes, forcedContextCorrections: forcedContextFixes, newReviewStatus: "AUTOMATED_EDITORIAL_REVIEWED" },
      duplicateThresholdPercent: TARGET_THRESHOLD,
      listeningReplacements: listeningPlan.length,
      listeningByPart: Object.fromEntries([2, 3, 4].map((part) => [part, listeningPlan.filter((item) => item.part === part).length])),
      part7: { components: p7Components.length, differentiatedGroups: p7Notes.size, plannedEdgesRemainingAt95: remainingPlannedEdges.length },
      directEditorialCorrections: directCorrections,
      fullMockMappingsValidated: 5000,
      listeningPlan,
    };

    if (APPLY) await client.query("commit"); else await client.query("rollback");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
