-- Expand the TOEIC bank from standalone questions to ordered Reading passage sets.
-- Existing Part 5 rows and practice-session relationships remain unchanged.

create table public.passage_sets (
  id uuid primary key default gen_random_uuid(),
  toeic_part smallint not null check (toeic_part in (6, 7)),
  set_type text not null check (set_type in ('part6', 'single', 'double', 'triple')),
  title text not null check (char_length(trim(title)) between 3 and 160),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, toeic_part),
  check ((toeic_part = 6 and set_type = 'part6')
    or (toeic_part = 7 and set_type in ('single', 'double', 'triple')))
);

alter table public.passages
  add column passage_set_id uuid,
  add column position smallint,
  add column document_type text;

alter table public.passages
  add constraint passages_set_part_fk foreign key (passage_set_id, toeic_part)
    references public.passage_sets(id, toeic_part) on delete cascade,
  add constraint passages_reading_group_check check (
    (toeic_part in (6, 7) and passage_set_id is not null and position > 0
      and document_type in ('email', 'memo', 'notice', 'article', 'advertisement',
        'schedule', 'form', 'letter', 'text_message', 'web_page', 'announcement',
        'invoice', 'receipt', 'chart', 'table'))
    or (toeic_part not in (6, 7) and passage_set_id is null and position is null)
  ),
  add constraint passages_set_position_unique unique (passage_set_id, position),
  add constraint passages_id_set_part_unique unique (id, passage_set_id, toeic_part);

alter table public.questions
  add column passage_set_id uuid,
  add column question_order smallint not null default 1 check (question_order > 0);

alter table public.questions
  add constraint questions_set_part_fk foreign key (passage_set_id, toeic_part)
    references public.passage_sets(id, toeic_part) on delete restrict,
  add constraint questions_passage_set_part_fk foreign key (passage_id, passage_set_id, toeic_part)
    references public.passages(id, passage_set_id, toeic_part) on delete restrict,
  add constraint questions_reading_association_check check (
    (toeic_part = 5 and passage_set_id is null and passage_id is null and question_order = 1)
    or (toeic_part = 6 and passage_set_id is not null and passage_id is not null)
    or (toeic_part = 7 and passage_set_id is not null)
    or (toeic_part not in (5, 6, 7) and passage_set_id is null)
  ),
  add constraint questions_set_order_unique unique (passage_set_id, question_order),
  add constraint questions_reading_taxonomy_check check (
    toeic_part not in (5, 6, 7)
    or (toeic_part = 5 and skill in ('grammar', 'vocabulary') and sub_skill in (
      'verb_tense', 'subject_verb_agreement', 'passive_voice', 'word_form',
      'prepositions', 'conjunctions_connectors', 'relative_clauses',
      'pronouns_determiners', 'gerunds_infinitives', 'comparatives', 'modifiers',
      'business_vocabulary', 'contextual_vocabulary', 'collocations', 'phrasal_expressions'))
    or (toeic_part = 6 and skill in ('grammar', 'vocabulary', 'cohesion', 'context',
      'sentence_insertion') and sub_skill in ('word_form', 'tense', 'connectors',
      'reference_words', 'logical_flow', 'contextual_vocabulary', 'document_context',
      'sentence_fit'))
    or (toeic_part = 7 and skill in ('detail', 'inference', 'purpose',
      'vocabulary_in_context', 'reference', 'sentence_placement', 'cross_text')
      and sub_skill in ('explicit_information', 'implied_information', 'document_purpose',
        'word_meaning', 'referent', 'logical_position', 'information_synthesis'))
  );

create index passage_sets_published_part_type_idx
  on public.passage_sets(toeic_part, set_type) where status = 'published';
create index passages_set_position_idx on public.passages(passage_set_id, position);
create index questions_published_part_status_idx on public.questions(toeic_part, status);
create index questions_set_order_idx on public.questions(passage_set_id, question_order)
  where passage_set_id is not null;

create trigger set_passage_sets_updated_at before update on public.passage_sets
for each row execute function public.set_question_bank_updated_at();

alter table public.passage_sets enable row level security;
revoke all on public.passage_sets from anon, authenticated;
grant select on public.passage_sets to authenticated;
grant all on public.passage_sets to service_role;

create policy "Authenticated learners can read published passage sets"
on public.passage_sets for select to authenticated using (status = 'published');

drop policy "Authenticated learners can read published passages" on public.passages;
create policy "Authenticated learners can read published passages"
on public.passages for select to authenticated using (
  status = 'published' and (passage_set_id is null or exists (
    select 1 from public.passage_sets where passage_sets.id = passages.passage_set_id
      and passage_sets.status = 'published')));

drop policy "Authenticated learners can read published questions" on public.questions;
create policy "Authenticated learners can read published questions"
on public.questions for select to authenticated using (
  status = 'published'
  and (passage_set_id is null or exists (select 1 from public.passage_sets
    where passage_sets.id = questions.passage_set_id and passage_sets.status = 'published'))
  and (passage_id is null or exists (select 1 from public.passages
    where passages.id = questions.passage_id and passages.status = 'published')));

drop policy "Authenticated learners can read published question options" on public.question_options;
create policy "Authenticated learners can read published question options"
on public.question_options for select to authenticated using (exists (
  select 1 from public.questions where questions.id = question_options.question_id
    and questions.status = 'published'
    and (questions.passage_set_id is null or exists (select 1 from public.passage_sets
      where passage_sets.id = questions.passage_set_id and passage_sets.status = 'published'))
    and (questions.passage_id is null or exists (select 1 from public.passages
      where passages.id = questions.passage_id and passages.status = 'published'))));

comment on table public.passage_sets is
  'Ordered Part 6/7 content groups. Query complete sets rather than isolated grouped questions.';
comment on column public.passages.position is 'Stable one-based document order inside a passage set.';
comment on column public.questions.question_order is
  'Stable one-based question order inside a passage set; standalone Part 5 uses 1.';
