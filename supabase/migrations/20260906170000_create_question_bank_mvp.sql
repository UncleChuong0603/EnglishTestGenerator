-- One-time pivot away from the unfinished generated-test schema.
drop function if exists public.submit_reading_attempt(uuid, uuid, jsonb);
drop table if exists public.attempt_answers cascade;
drop table if exists public.attempt_questions cascade;
drop table if exists public.attempts cascade;
drop table if exists public.question_answer_keys cascade;
drop table if exists public.questions cascade;
drop table if exists public.tests cascade;

create table public.passages (
  id uuid primary key,
  title text not null check (char_length(title) between 3 and 160),
  content text not null check (char_length(content) >= 100),
  difficulty text not null check (difficulty in ('B1', 'B2', 'C1')),
  topic text not null check (char_length(topic) between 2 and 80),
  source_label text not null default 'VSTEP Practice editorial',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key,
  passage_id uuid not null references public.passages(id) on delete cascade,
  question_order integer not null check (question_order > 0),
  question text not null check (char_length(question) > 0),
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  correct_answer text not null check (correct_answer in ('A', 'B', 'C', 'D')),
  explanation text not null check (char_length(explanation) > 0),
  skill text not null check (skill in ('vocabulary', 'main_idea', 'detail', 'inference', 'reference')),
  sub_skill text,
  difficulty text not null check (difficulty in ('B1', 'B2', 'C1')),
  topic text not null check (char_length(topic) between 2 and 80),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (passage_id, question_order)
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  difficulty text not null check (difficulty in ('B1', 'B2', 'C1')),
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  correct_answers integer,
  total_questions integer,
  score_percent numeric(5, 2),
  check (
    (status = 'in_progress' and submitted_at is null and correct_answers is null and total_questions is null and score_percent is null)
    or
    (status = 'submitted' and submitted_at is not null and correct_answers is not null and total_questions is not null and score_percent is not null)
  )
);

create table public.attempt_questions (
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id),
  question_order integer not null check (question_order > 0),
  primary key (attempt_id, question_id),
  unique (attempt_id, question_order)
);

create table public.attempt_answers (
  attempt_id uuid not null,
  question_id uuid not null,
  selected_answer text check (selected_answer in ('A', 'B', 'C', 'D')),
  is_correct boolean not null,
  primary key (attempt_id, question_id),
  foreign key (attempt_id, question_id)
    references public.attempt_questions(attempt_id, question_id) on delete cascade
);

create index passages_active_difficulty_idx on public.passages(difficulty) where is_active;
create index questions_bank_selection_idx on public.questions(difficulty, skill, topic) where is_active;
create index questions_passage_order_idx on public.questions(passage_id, question_order);
create index attempts_user_history_idx on public.attempts(user_id, submitted_at desc);
create index attempt_questions_question_idx on public.attempt_questions(question_id);
create unique index attempts_one_open_difficulty_idx on public.attempts(user_id, difficulty) where status = 'in_progress';

alter table public.passages enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_questions enable row level security;
alter table public.attempt_answers enable row level security;

-- Passages/questions contain protected keys and are served only by trusted server code.
revoke all on public.passages, public.questions, public.attempts, public.attempt_questions, public.attempt_answers from anon, authenticated;
grant select on public.attempts, public.attempt_questions, public.attempt_answers to authenticated;

create policy "Learners can read their own attempts"
on public.attempts for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Learners can read their own attempt questions"
on public.attempt_questions for select to authenticated
using (exists (
  select 1 from public.attempts
  where attempts.id = attempt_questions.attempt_id
    and attempts.user_id = (select auth.uid())
));

create policy "Learners can read their own attempt answers"
on public.attempt_answers for select to authenticated
using (exists (
  select 1 from public.attempts
  where attempts.id = attempt_answers.attempt_id
    and attempts.user_id = (select auth.uid())
));

create function public.create_practice_attempt(
  p_user_id uuid,
  p_difficulty text,
  p_question_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_attempt_id uuid;
  question_id uuid;
  position integer := 0;
begin
  if p_difficulty not in ('B1', 'B2', 'C1') or coalesce(array_length(p_question_ids, 1), 0) <> 10 then
    raise exception 'Invalid practice selection';
  end if;

  if (select count(distinct selected_id) from unnest(p_question_ids) selected_id) <> 10 then
    raise exception 'Practice questions must be unique';
  end if;

  if (select count(*) from public.questions
      where id = any(p_question_ids) and is_active and difficulty = p_difficulty) <> 10 then
    raise exception 'Question selection is unavailable';
  end if;

  insert into public.attempts (user_id, difficulty)
  values (p_user_id, p_difficulty)
  returning id into new_attempt_id;

  foreach question_id in array p_question_ids loop
    position := position + 1;
    insert into public.attempt_questions (attempt_id, question_id, question_order)
    values (new_attempt_id, question_id, position);
  end loop;

  return new_attempt_id;
end;
$$;

create function public.submit_reading_attempt(
  p_attempt_id uuid,
  p_user_id uuid,
  p_answers jsonb
)
returns table (attempt_id uuid, correct_answers integer, total_questions integer, score_percent numeric)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_attempt public.attempts%rowtype;
  question_record record;
  selected text;
  correct_count integer := 0;
  question_total integer := 0;
begin
  select * into current_attempt from public.attempts
  where id = p_attempt_id and user_id = p_user_id for update;

  if current_attempt.id is null then raise exception 'Attempt not found'; end if;
  if current_attempt.status = 'submitted' then
    return query select current_attempt.id, current_attempt.correct_answers,
      current_attempt.total_questions, current_attempt.score_percent;
    return;
  end if;
  if jsonb_typeof(p_answers) <> 'array' then raise exception 'Answers must be an array'; end if;

  for question_record in
    select q.id, q.correct_answer
    from public.attempt_questions aq
    join public.questions q on q.id = aq.question_id
    where aq.attempt_id = current_attempt.id
    order by aq.question_order
  loop
    select answer.value ->> 'selectedAnswer' into selected
    from jsonb_array_elements(p_answers) answer(value)
    where answer.value ->> 'questionId' = question_record.id::text limit 1;
    if selected is not null and selected not in ('A', 'B', 'C', 'D') then raise exception 'Invalid answer'; end if;
    question_total := question_total + 1;
    if selected = question_record.correct_answer then correct_count := correct_count + 1; end if;
    insert into public.attempt_answers (attempt_id, question_id, selected_answer, is_correct)
    values (current_attempt.id, question_record.id, selected, coalesce(selected = question_record.correct_answer, false));
  end loop;

  update public.attempts set status = 'submitted', submitted_at = now(),
    correct_answers = correct_count, total_questions = question_total,
    score_percent = round((correct_count::numeric / nullif(question_total, 0)) * 100, 2)
  where id = current_attempt.id returning * into current_attempt;

  return query select current_attempt.id, current_attempt.correct_answers,
    current_attempt.total_questions, current_attempt.score_percent;
end;
$$;

revoke all on function public.create_practice_attempt(uuid, text, uuid[]) from public, anon, authenticated;
revoke all on function public.submit_reading_attempt(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.create_practice_attempt(uuid, text, uuid[]) to service_role;
grant execute on function public.submit_reading_attempt(uuid, uuid, jsonb) to service_role;
