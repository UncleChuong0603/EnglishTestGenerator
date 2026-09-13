-- Timed, resumable TOEIC Reading demo tests built on the Reading practice model.

alter table public.practice_sessions drop constraint practice_sessions_practice_type_check;
alter table public.practice_sessions drop constraint practice_sessions_part_check;
alter table public.practice_sessions drop constraint practice_sessions_question_count_check;
alter table public.practice_sessions drop constraint practice_sessions_source_check;
alter table public.practice_sessions drop constraint practice_sessions_requested_question_count_check;

alter table public.practice_sessions
  add constraint practice_sessions_practice_type_check
    check (practice_type in ('part_5', 'part_6', 'part_7', 'mixed_reading', 'demo_test')),
  add constraint practice_sessions_part_check
    check ((practice_type in ('mixed_reading', 'demo_test') and part is null)
      or (practice_type = 'part_5' and part = 5)
      or (practice_type = 'part_6' and part = 6)
      or (practice_type = 'part_7' and part = 7)),
  add constraint practice_sessions_question_count_check check (question_count between 1 and 100),
  add constraint practice_sessions_source_check check (source in ('recommended', 'custom', 'demo_test')),
  add constraint practice_sessions_requested_question_count_check
    check (requested_question_count in (10, 15, 20, 100)),
  add column expires_at timestamptz,
  add column submission_reason text check (submission_reason in ('manual', 'time_expired')),
  add constraint practice_sessions_demo_timing_check check (
    (practice_type <> 'demo_test' and expires_at is null and submission_reason is null)
    or (practice_type = 'demo_test' and expires_at is not null and expires_at > started_at
      and ((status = 'in_progress' and submission_reason is null)
        or (status = 'submitted' and submission_reason is not null)
        or status = 'abandoned'))
  );

drop index practice_sessions_one_open_reading_idx;
create unique index practice_sessions_one_open_practice_idx
  on public.practice_sessions(user_id) where status = 'in_progress' and practice_type <> 'demo_test';
create unique index practice_sessions_one_open_demo_idx
  on public.practice_sessions(user_id) where status = 'in_progress' and practice_type = 'demo_test';
create index practice_sessions_demo_history_idx
  on public.practice_sessions(user_id, submitted_at desc) where practice_type = 'demo_test';

create table public.demo_test_answers (
  session_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null,
  selected_option_id uuid not null,
  response_time_ms integer check (response_time_ms between 0 and 86400000),
  answered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (session_id, question_id),
  foreign key (session_id, user_id)
    references public.practice_sessions(id, user_id) on delete cascade,
  foreign key (session_id, question_id)
    references public.practice_session_questions(session_id, question_id) on delete cascade,
  foreign key (selected_option_id, question_id)
    references public.question_options(id, question_id) on delete restrict
);

create index demo_test_answers_user_session_idx on public.demo_test_answers(user_id, session_id);
alter table public.demo_test_answers enable row level security;
revoke all on public.demo_test_answers from anon, authenticated;
grant select on public.demo_test_answers to authenticated;
grant all on public.demo_test_answers to service_role;
create policy "Learners can read their own saved demo answers"
on public.demo_test_answers for select to authenticated
using ((select auth.uid()) = user_id);

create function public.create_reading_demo_test(
  p_user_id uuid,
  p_assignments jsonb,
  p_duration_seconds integer default 4500
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_id uuid;
  new_id uuid;
  assignment_count integer;
begin
  if p_user_id is null or jsonb_typeof(p_assignments) is distinct from 'array'
    or p_duration_seconds < 30 or p_duration_seconds > 4500 then
    raise exception 'Invalid demo test request';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text || ':reading-demo', 0)
  );
  select id into existing_id from public.practice_sessions
    where user_id = p_user_id and practice_type = 'demo_test' and status = 'in_progress'
    order by created_at desc limit 1;
  if existing_id is not null then return existing_id; end if;

  create temporary table demo_assignments on commit drop as
  select (value ->> 'questionId')::uuid question_id,
    nullif(value ->> 'passageSetId', '')::uuid passage_set_id,
    ordinality::smallint display_order
  from jsonb_array_elements(p_assignments) with ordinality;

  select count(*) into assignment_count from demo_assignments;
  if assignment_count <> 100
    or (select count(distinct question_id) from demo_assignments) <> 100
    or (select count(*) from demo_assignments a join public.questions q on q.id = a.question_id
        where q.status = 'published' and q.toeic_part = 5 and a.passage_set_id is null) <> 30
    or (select count(*) from demo_assignments a join public.questions q on q.id = a.question_id
        where q.status = 'published' and q.toeic_part = 6 and a.passage_set_id = q.passage_set_id) <> 16
    or (select count(*) from demo_assignments a join public.questions q on q.id = a.question_id
        where q.status = 'published' and q.toeic_part = 7 and a.passage_set_id = q.passage_set_id) <> 54
    or exists (select 1 from demo_assignments a join public.questions q on q.id = a.question_id
        where (select count(*) from public.question_options o where o.question_id = q.id) <> 4
          or not exists (select 1 from public.question_solutions s where s.question_id = q.id))
    or exists (
      select 1 from (select distinct passage_set_id from demo_assignments where passage_set_id is not null) chosen
      join public.passage_sets ps on ps.id = chosen.passage_set_id
      where ps.status <> 'published'
        or (select count(*) from demo_assignments a where a.passage_set_id = chosen.passage_set_id)
          <> (select count(*) from public.questions q where q.passage_set_id = chosen.passage_set_id and q.status = 'published')
        or exists (select 1 from public.passages p where p.passage_set_id = chosen.passage_set_id and p.status <> 'published')
        or (select min(position) from public.passages p where p.passage_set_id = chosen.passage_set_id) <> 1
        or (select max(position) from public.passages p where p.passage_set_id = chosen.passage_set_id)
          <> (select count(*) from public.passages p where p.passage_set_id = chosen.passage_set_id)
    ) then raise exception 'Invalid demo test composition';
  end if;

  insert into public.practice_sessions (
    user_id, practice_type, part, status, question_count, source,
    requested_question_count, started_at, expires_at
  ) values (
    p_user_id, 'demo_test', null, 'in_progress', 100, 'demo_test',
    100, now(), now() + pg_catalog.make_interval(secs => p_duration_seconds)
  ) returning id into new_id;

  insert into public.practice_session_questions (session_id, question_id, display_order, passage_set_id)
  select new_id, question_id, display_order, passage_set_id from demo_assignments order by display_order;
  return new_id;
end;
$$;

create function public.save_reading_demo_answer(
  p_session_id uuid,
  p_user_id uuid,
  p_question_id uuid,
  p_selected_option_id uuid,
  p_response_time_ms integer default null
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare current_session public.practice_sessions%rowtype;
begin
  select * into current_session from public.practice_sessions
    where id = p_session_id and user_id = p_user_id and practice_type = 'demo_test' for update;
  if current_session.id is null then raise exception 'Demo test not found'; end if;
  if current_session.status <> 'in_progress' or now() >= current_session.expires_at then
    raise exception 'Demo test expired';
  end if;
  if not exists (select 1 from public.practice_session_questions
      where session_id = current_session.id and question_id = p_question_id)
    or not exists (select 1 from public.question_options
      where id = p_selected_option_id and question_id = p_question_id) then
    raise exception 'Invalid demo answer';
  end if;
  if p_response_time_ms is not null and (p_response_time_ms < 0 or p_response_time_ms > 86400000) then
    raise exception 'Invalid response time';
  end if;
  insert into public.demo_test_answers (
    session_id, user_id, question_id, selected_option_id, response_time_ms
  ) values (current_session.id, current_session.user_id, p_question_id, p_selected_option_id, p_response_time_ms)
  on conflict (session_id, question_id) do update set
    selected_option_id = excluded.selected_option_id,
    response_time_ms = coalesce(public.demo_test_answers.response_time_ms, excluded.response_time_ms),
    answered_at = now(), updated_at = now();
  return current_session.expires_at;
end;
$$;

create function public.submit_reading_demo_test(
  p_session_id uuid,
  p_user_id uuid,
  p_reason text default 'manual'
)
returns table (session_id uuid, score_correct integer, score_total integer, submission_reason text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_session public.practice_sessions%rowtype;
  correct_count integer;
  final_reason text;
begin
  if p_reason not in ('manual', 'time_expired') then raise exception 'Invalid submission reason'; end if;
  select * into current_session from public.practice_sessions
    where id = p_session_id and user_id = p_user_id and practice_type = 'demo_test' for update;
  if current_session.id is null then raise exception 'Demo test not found'; end if;
  if current_session.status = 'submitted' then
    return query select current_session.id, current_session.score_correct::integer,
      current_session.score_total::integer, current_session.submission_reason;
    return;
  end if;
  if current_session.status <> 'in_progress' then raise exception 'Demo test is not active'; end if;
  if current_session.question_count <> 100
    or (select count(*) from public.practice_session_questions where session_id = current_session.id) <> 100 then
    raise exception 'Demo test question data is incomplete';
  end if;

  final_reason := case when now() >= current_session.expires_at then 'time_expired' else p_reason end;
  insert into public.attempt_answers (
    session_id, user_id, question_id, selected_option_id, is_correct, response_time_ms, answered_at
  )
  select psq.session_id, current_session.user_id, psq.question_id, dta.selected_option_id,
    coalesce(dta.selected_option_id = s.correct_option_id, false), dta.response_time_ms, dta.answered_at
  from public.practice_session_questions psq
  join public.question_solutions s on s.question_id = psq.question_id
  left join public.demo_test_answers dta on dta.session_id = psq.session_id and dta.question_id = psq.question_id
  where psq.session_id = current_session.id
  order by psq.display_order;

  select count(*) filter (where is_correct) into correct_count
    from public.attempt_answers where session_id = current_session.id;
  update public.practice_sessions set status = 'submitted', submitted_at = now(),
    score_correct = correct_count, score_total = 100, submission_reason = final_reason
  where id = current_session.id returning * into current_session;
  delete from public.demo_test_answers where session_id = current_session.id;

  return query select current_session.id, current_session.score_correct::integer,
    current_session.score_total::integer, current_session.submission_reason;
end;
$$;

revoke all on function public.create_reading_demo_test(uuid, jsonb, integer) from public, anon, authenticated;
revoke all on function public.save_reading_demo_answer(uuid, uuid, uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.submit_reading_demo_test(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.create_reading_demo_test(uuid, jsonb, integer) to service_role;
grant execute on function public.save_reading_demo_answer(uuid, uuid, uuid, uuid, integer) to service_role;
grant execute on function public.submit_reading_demo_test(uuid, uuid, text) to service_role;

comment on table public.demo_test_answers is
  'Mutable learner choices during an active demo test. Contains no correctness or solution data.';
comment on column public.practice_sessions.expires_at is
  'Server-authoritative deadline for demo tests; null for ordinary practice.';
