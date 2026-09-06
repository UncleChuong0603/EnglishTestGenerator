create table public.tests (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  passage text not null check (char_length(passage) >= 100),
  test_type text not null default 'reading' check (test_type = 'reading'),
  difficulty text not null check (difficulty in ('B1', 'B2', 'C1')),
  focus text not null check (focus in ('mixed', 'vocabulary', 'main_idea', 'detail', 'inference')),
  question_count integer not null check (question_count in (10, 20)),
  created_by uuid not null references auth.users(id) on delete cascade,
  generation_source text not null default 'openai' check (generation_source in ('openai', 'curated')),
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  question_order integer not null check (question_order > 0),
  question text not null check (char_length(question) > 0),
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  skill text not null check (skill in ('vocabulary', 'main_idea', 'detail', 'inference', 'reference', 'purpose_tone')),
  sub_skill text not null check (char_length(sub_skill) > 0),
  difficulty text not null check (difficulty in ('B1', 'B2', 'C1')),
  unique (test_id, question_order)
);

-- Correct answers are deliberately separated from learner-readable question content.
create table public.question_answer_keys (
  question_id uuid primary key references public.questions(id) on delete cascade,
  correct_answer text not null check (correct_answer in ('A', 'B', 'C', 'D')),
  explanation text not null check (char_length(explanation) > 0)
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_id uuid not null references public.tests(id) on delete cascade,
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

create table public.attempt_answers (
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_answer text check (selected_answer in ('A', 'B', 'C', 'D')),
  is_correct boolean not null,
  primary key (attempt_id, question_id)
);

create index tests_created_by_created_at_idx on public.tests(created_by, created_at desc);
create index questions_test_id_order_idx on public.questions(test_id, question_order);
create index attempts_user_id_started_at_idx on public.attempts(user_id, started_at desc);

alter table public.tests enable row level security;
alter table public.questions enable row level security;
alter table public.question_answer_keys enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;

revoke all on public.tests, public.questions, public.question_answer_keys, public.attempts, public.attempt_answers from anon, authenticated;
grant select on public.tests, public.questions, public.attempts, public.attempt_answers to authenticated;

create policy "Learners can read their own tests"
on public.tests for select to authenticated
using ((select auth.uid()) = created_by);

create policy "Learners can read questions from their own tests"
on public.questions for select to authenticated
using (exists (
  select 1 from public.tests
  where tests.id = questions.test_id and tests.created_by = (select auth.uid())
));

create policy "Learners can read their own attempts"
on public.attempts for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Learners can read answers from their own attempts"
on public.attempt_answers for select to authenticated
using (exists (
  select 1 from public.attempts
  where attempts.id = attempt_answers.attempt_id and attempts.user_id = (select auth.uid())
));

-- No authenticated policy or grant exists for answer keys or learner writes.
-- Trusted Next.js server code performs generation and scoring with a server-only Supabase secret.

create unique index attempts_one_open_test_idx
on public.attempts(user_id, test_id)
where status = 'in_progress';

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
  select * into current_attempt
  from public.attempts
  where id = p_attempt_id and user_id = p_user_id
  for update;

  if current_attempt.id is null then
    raise exception 'Attempt not found';
  end if;

  if current_attempt.status = 'submitted' then
    return query select current_attempt.id, current_attempt.correct_answers,
      current_attempt.total_questions, current_attempt.score_percent;
    return;
  end if;

  if jsonb_typeof(p_answers) <> 'array' then
    raise exception 'Answers must be an array';
  end if;

  for question_record in
    select q.id, k.correct_answer
    from public.questions q
    join public.question_answer_keys k on k.question_id = q.id
    where q.test_id = current_attempt.test_id
    order by q.question_order
  loop
    select answer.value ->> 'selectedAnswer' into selected
    from jsonb_array_elements(p_answers) answer(value)
    where answer.value ->> 'questionId' = question_record.id::text
    limit 1;

    if selected is not null and selected not in ('A', 'B', 'C', 'D') then
      raise exception 'Invalid answer';
    end if;

    question_total := question_total + 1;
    if selected = question_record.correct_answer then
      correct_count := correct_count + 1;
    end if;

    insert into public.attempt_answers (attempt_id, question_id, selected_answer, is_correct)
    values (current_attempt.id, question_record.id, selected, coalesce(selected = question_record.correct_answer, false))
    on conflict (attempt_id, question_id) do nothing;
  end loop;

  update public.attempts
  set status = 'submitted',
      submitted_at = now(),
      correct_answers = correct_count,
      total_questions = question_total,
      score_percent = round((correct_count::numeric / nullif(question_total, 0)) * 100, 2)
  where id = current_attempt.id
  returning * into current_attempt;

  return query select current_attempt.id, current_attempt.correct_answers,
    current_attempt.total_questions, current_attempt.score_percent;
end;
$$;

revoke all on function public.submit_reading_attempt(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.submit_reading_attempt(uuid, uuid, jsonb) to service_role;
