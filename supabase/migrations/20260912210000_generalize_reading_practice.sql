-- Generalize Part 5 practice sessions for complete TOEIC Reading practice.

alter table public.practice_sessions drop constraint practice_sessions_practice_type_check;
alter table public.practice_sessions drop constraint practice_sessions_part_check;
alter table public.practice_sessions drop constraint practice_sessions_question_count_check;
alter table public.practice_sessions alter column part drop not null;
alter table public.practice_sessions
  add constraint practice_sessions_practice_type_check
    check (practice_type in ('part_5', 'part_6', 'part_7', 'mixed_reading')),
  add constraint practice_sessions_part_check
    check ((practice_type = 'mixed_reading' and part is null)
      or (practice_type = 'part_5' and part = 5)
      or (practice_type = 'part_6' and part = 6)
      or (practice_type = 'part_7' and part = 7)),
  add constraint practice_sessions_question_count_check check (question_count between 1 and 30),
  add column source text not null default 'custom' check (source in ('recommended', 'custom')),
  add column requested_question_count smallint not null default 10
    check (requested_question_count in (10, 15, 20)),
  add column requested_skill text,
  add column requested_sub_skill text;

alter table public.practice_session_questions
  add column passage_set_id uuid references public.passage_sets(id) on delete restrict;

drop index practice_sessions_one_open_part5_idx;
create unique index practice_sessions_one_open_reading_idx
  on public.practice_sessions(user_id) where status = 'in_progress';
create index practice_session_questions_set_idx
  on public.practice_session_questions(session_id, passage_set_id)
  where passage_set_id is not null;

create or replace function public.submit_reading_practice_session(
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
    where not exists (select 1 from public.practice_session_questions psq
      where psq.session_id = current_session.id
        and psq.question_id::text = answer.value ->> 'questionId')
  ) then raise exception 'Answer contains a question outside this session'; end if;

  -- A grouped question is valid only when its immutable bank association matches
  -- the passage set captured at session creation.
  if exists (
    select 1 from public.practice_session_questions psq
    join public.questions q on q.id = psq.question_id
    where psq.session_id = current_session.id
      and psq.passage_set_id is distinct from q.passage_set_id
  ) then raise exception 'Practice passage set data is invalid'; end if;

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
      begin selected_id := (answer_record ->> 'selectedOptionId')::uuid;
      exception when invalid_text_representation then raise exception 'Invalid selected option'; end;
      if not exists (select 1 from public.question_options
        where id = selected_id and question_id = question_record.question_id)
      then raise exception 'Selected option does not belong to the question'; end if;
    end if;
    if answer_record is not null and nullif(answer_record ->> 'responseTimeMs', '') is not null then
      begin response_ms := (answer_record ->> 'responseTimeMs')::integer;
      exception when invalid_text_representation or numeric_value_out_of_range
        then raise exception 'Invalid response time'; end;
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

revoke all on function public.submit_reading_practice_session(uuid, uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.submit_reading_practice_session(uuid, uuid, jsonb) to service_role;

comment on column public.practice_session_questions.passage_set_id is
  'Null for standalone Part 5; captures complete Part 6/7 set membership for validation and rendering.';
