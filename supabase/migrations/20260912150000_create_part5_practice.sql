-- Minimal learner attempt model for TOEIC Part 5 practice.

create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  practice_type text not null default 'part_5' check (practice_type = 'part_5'),
  part smallint not null default 5 check (part = 5),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'submitted', 'abandoned')),
  question_count smallint not null check (question_count between 1 and 20),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score_correct smallint,
  score_total smallint,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  check (
    (status = 'in_progress' and submitted_at is null and score_correct is null and score_total is null)
    or (status = 'abandoned' and submitted_at is null and score_correct is null and score_total is null)
    or (
      status = 'submitted' and submitted_at is not null
      and score_correct is not null and score_total = question_count
      and score_correct between 0 and score_total
    )
  )
);

create table public.practice_session_questions (
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  display_order smallint not null check (display_order > 0),
  primary key (session_id, question_id),
  unique (session_id, display_order)
);

create table public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null,
  selected_option_id uuid,
  is_correct boolean not null,
  response_time_ms integer check (response_time_ms between 0 and 86400000),
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  unique (session_id, question_id),
  foreign key (session_id, user_id)
    references public.practice_sessions(id, user_id) on delete cascade,
  foreign key (session_id, question_id)
    references public.practice_session_questions(session_id, question_id) on delete cascade,
  foreign key (selected_option_id, question_id)
    references public.question_options(id, question_id) on delete restrict
);

create index practice_sessions_user_created_idx
  on public.practice_sessions(user_id, created_at desc);
create unique index practice_sessions_one_open_part5_idx
  on public.practice_sessions(user_id, part) where status = 'in_progress';
create index practice_session_questions_question_idx
  on public.practice_session_questions(question_id);
create index attempt_answers_user_session_idx
  on public.attempt_answers(user_id, session_id);

alter table public.practice_sessions enable row level security;
alter table public.practice_session_questions enable row level security;
alter table public.attempt_answers enable row level security;

revoke all on public.practice_sessions, public.practice_session_questions,
  public.attempt_answers from anon, authenticated;
grant select on public.practice_sessions, public.practice_session_questions,
  public.attempt_answers to authenticated;
grant all on public.practice_sessions, public.practice_session_questions,
  public.attempt_answers to service_role;

create policy "Learners can read their own practice sessions"
on public.practice_sessions for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Learners can read their own session questions"
on public.practice_session_questions for select to authenticated
using (exists (
  select 1 from public.practice_sessions
  where practice_sessions.id = practice_session_questions.session_id
    and practice_sessions.user_id = (select auth.uid())
));

create policy "Learners can read their own attempt answers"
on public.attempt_answers for select to authenticated
using ((select auth.uid()) = user_id);

create function public.create_part5_practice_session(
  p_user_id uuid,
  p_question_count integer default 10
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_session_id uuid;
  new_session_id uuid;
  selected_count integer;
begin
  if p_user_id is null or p_question_count not in (10, 20) then
    raise exception 'Invalid practice request';
  end if;

  -- Serialize starts for this learner so concurrent clicks cannot race the
  -- one-open-session index.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text || ':part5', 0)
  );

  select id into existing_session_id
  from public.practice_sessions
  where user_id = p_user_id and part = 5 and status = 'in_progress'
  order by created_at desc limit 1;

  if existing_session_id is not null then
    return existing_session_id;
  end if;

  create temporary table selected_part5_questions on commit drop as
  select selected.id, row_number() over (order by random())::smallint as display_order
  from (
    select q.id
    from public.questions q
    where q.toeic_part = 5 and q.status = 'published'
      and exists (select 1 from public.question_solutions s where s.question_id = q.id)
      and (select count(*) from public.question_options o where o.question_id = q.id) = 4
    order by random()
    limit p_question_count
  ) selected;

  select count(*) into selected_count from selected_part5_questions;
  if selected_count = 0 then
    raise exception 'No published Part 5 questions are available';
  end if;

  insert into public.practice_sessions (user_id, question_count)
  values (p_user_id, selected_count)
  returning id into new_session_id;

  insert into public.practice_session_questions (session_id, question_id, display_order)
  select new_session_id, id, display_order from selected_part5_questions;

  return new_session_id;
end;
$$;

create function public.submit_part5_practice_session(
  p_session_id uuid,
  p_user_id uuid,
  p_answers jsonb
)
returns table (session_id uuid, score_correct integer, score_total integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_session public.practice_sessions%rowtype;
  question_record record;
  answer_record jsonb;
  selected_id uuid;
  response_ms integer;
  correct_count integer := 0;
  processed_count integer := 0;
begin
  if jsonb_typeof(p_answers) is distinct from 'array' then
    raise exception 'Answers must be an array';
  end if;

  select * into current_session from public.practice_sessions
  where id = p_session_id and user_id = p_user_id for update;

  if current_session.id is null then raise exception 'Practice session not found'; end if;
  if current_session.status = 'submitted' then
    return query select current_session.id, current_session.score_correct::integer,
      current_session.score_total::integer;
    return;
  end if;
  if current_session.status <> 'in_progress' then raise exception 'Practice session is not active'; end if;

  if jsonb_array_length(p_answers) > current_session.question_count
    or (select count(distinct value ->> 'questionId') from jsonb_array_elements(p_answers))
      <> jsonb_array_length(p_answers) then
    raise exception 'Invalid answer list';
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_answers) answer(value)
    where not exists (
      select 1 from public.practice_session_questions psq
      where psq.session_id = current_session.id
        and psq.question_id::text = answer.value ->> 'questionId'
    )
  ) then raise exception 'Answer contains a question outside this session'; end if;

  for question_record in
    select psq.question_id, s.correct_option_id
    from public.practice_session_questions psq
    join public.question_solutions s on s.question_id = psq.question_id
    where psq.session_id = current_session.id order by psq.display_order
  loop
    processed_count := processed_count + 1;
    select value into answer_record from jsonb_array_elements(p_answers)
    where value ->> 'questionId' = question_record.question_id::text limit 1;
    selected_id := null;
    response_ms := null;

    if answer_record is not null and nullif(answer_record ->> 'selectedOptionId', '') is not null then
      begin
        selected_id := (answer_record ->> 'selectedOptionId')::uuid;
      exception when invalid_text_representation then
        raise exception 'Invalid selected option';
      end;
      if not exists (
        select 1 from public.question_options
        where id = selected_id and question_id = question_record.question_id
      ) then raise exception 'Selected option does not belong to the question'; end if;
    end if;

    if answer_record is not null and nullif(answer_record ->> 'responseTimeMs', '') is not null then
      begin
        response_ms := (answer_record ->> 'responseTimeMs')::integer;
      exception when invalid_text_representation or numeric_value_out_of_range then
        raise exception 'Invalid response time';
      end;
      if response_ms < 0 or response_ms > 86400000 then raise exception 'Invalid response time'; end if;
    end if;

    if selected_id = question_record.correct_option_id then correct_count := correct_count + 1; end if;
    insert into public.attempt_answers (
      session_id, user_id, question_id, selected_option_id, is_correct,
      response_time_ms, answered_at
    ) values (
      current_session.id, current_session.user_id, question_record.question_id,
      selected_id, coalesce(selected_id = question_record.correct_option_id, false),
      response_ms, case when selected_id is null then null else now() end
    );
  end loop;

  if processed_count <> current_session.question_count then
    raise exception 'Practice session question data is incomplete';
  end if;

  update public.practice_sessions set status = 'submitted', submitted_at = now(),
    score_correct = correct_count, score_total = question_count
  where id = current_session.id returning * into current_session;

  return query select current_session.id, current_session.score_correct::integer,
    current_session.score_total::integer;
end;
$$;

revoke all on function public.create_part5_practice_session(uuid, integer)
  from public, anon, authenticated;
revoke all on function public.submit_part5_practice_session(uuid, uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.create_part5_practice_session(uuid, integer) to service_role;
grant execute on function public.submit_part5_practice_session(uuid, uuid, jsonb) to service_role;

comment on table public.attempt_answers is
  'Server-graded Part 5 answers. Learners have read-only access to their own rows.';
