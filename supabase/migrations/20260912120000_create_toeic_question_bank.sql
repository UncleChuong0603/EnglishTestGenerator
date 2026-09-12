-- TOEIC Listening & Reading question-bank foundation.
-- Correct answers and explanations intentionally live outside learner-readable tables.

-- Remove the obsolete VSTEP practice schema while preserving auth.users and profiles.
drop function if exists public.submit_reading_attempt(uuid, uuid, jsonb);
drop function if exists public.create_practice_attempt(uuid, text, uuid[]);
drop table if exists public.attempt_answers cascade;
drop table if exists public.attempt_questions cascade;
drop table if exists public.attempts cascade;
drop table if exists public.question_answer_keys cascade;
drop table if exists public.questions cascade;
drop table if exists public.passages cascade;
drop table if exists public.tests cascade;


create extension if not exists pgcrypto;

create table public.passages (
  id uuid primary key default gen_random_uuid(),
  toeic_part smallint not null check (toeic_part between 1 and 7),
  passage_type text not null check (passage_type in (
    'photo', 'conversation', 'talk', 'text_completion',
    'single_passage', 'double_passage', 'triple_passage'
  )),
  title text,
  content text,
  audio_url text,
  image_url text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, toeic_part),
  check (
    status <> 'published'
    or content is not null
    or audio_url is not null
    or image_url is not null
  )
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  toeic_part smallint not null check (toeic_part between 1 and 7),
  question_type text not null check (char_length(trim(question_type)) > 0),
  skill text not null check (char_length(trim(skill)) > 0),
  sub_skill text not null check (char_length(trim(sub_skill)) > 0),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  question_text text not null check (char_length(trim(question_text)) > 0),
  passage_id uuid,
  audio_url text,
  image_url text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (passage_id, toeic_part)
    references public.passages(id, toeic_part) on delete restrict
);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_key text not null check (char_length(trim(option_key)) between 1 and 12),
  option_text text not null check (char_length(trim(option_text)) > 0),
  display_order smallint not null check (display_order > 0),
  created_at timestamptz not null default now(),
  unique (question_id, option_key),
  unique (question_id, display_order),
  unique (id, question_id)
);

-- This table has no learner grants or policies. Trusted server code uses it for grading
-- and may return explanations only after it has verified ownership/submission state.
create table public.question_solutions (
  question_id uuid primary key references public.questions(id) on delete cascade,
  correct_option_id uuid not null,
  explanation_en text,
  explanation_vi text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (correct_option_id, question_id)
    references public.question_options(id, question_id) on delete restrict,
  check (coalesce(explanation_en, explanation_vi) is not null)
);

create index passages_published_part_idx
  on public.passages(toeic_part, passage_type) where status = 'published';
create index questions_published_taxonomy_idx
  on public.questions(toeic_part, skill, sub_skill, difficulty) where status = 'published';
create index questions_passage_idx on public.questions(passage_id) where passage_id is not null;
create index question_options_question_order_idx on public.question_options(question_id, display_order);

create function public.set_question_bank_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_passages_updated_at
before update on public.passages
for each row execute function public.set_question_bank_updated_at();

create trigger set_questions_updated_at
before update on public.questions
for each row execute function public.set_question_bank_updated_at();

create trigger set_question_solutions_updated_at
before update on public.question_solutions
for each row execute function public.set_question_bank_updated_at();

alter table public.passages enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.question_solutions enable row level security;

revoke all on public.passages, public.questions, public.question_options,
  public.question_solutions from anon, authenticated;
grant select on public.passages, public.questions, public.question_options to authenticated;
grant all on public.passages, public.questions, public.question_options,
  public.question_solutions to service_role;

create policy "Authenticated learners can read published passages"
on public.passages for select to authenticated
using (status = 'published');

create policy "Authenticated learners can read published questions"
on public.questions for select to authenticated
using (
  status = 'published'
  and (
    passage_id is null
    or exists (
      select 1 from public.passages
      where passages.id = questions.passage_id
        and passages.status = 'published'
    )
  )
);

create policy "Authenticated learners can read published question options"
on public.question_options for select to authenticated
using (
  exists (
    select 1 from public.questions
    where questions.id = question_options.question_id
      and questions.status = 'published'
      and (
        questions.passage_id is null
        or exists (
          select 1 from public.passages
          where passages.id = questions.passage_id
            and passages.status = 'published'
        )
      )
  )
);

comment on table public.question_solutions is
  'Server-only answer keys and bilingual explanations; never select from learner clients.';
comment on column public.questions.audio_url is
  'Question-specific audio, primarily Part 2; shared Part 3/4 audio belongs on passages.';
comment on column public.questions.image_url is
  'Question-specific image, primarily Part 1; shared media may instead live on passages.';
