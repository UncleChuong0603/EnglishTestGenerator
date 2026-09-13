-- Persist independent interface and explanation language preferences on the learner profile.
alter table public.profiles
  add column interface_language text not null default 'vi'
    check (interface_language in ('en', 'vi')),
  add column explanation_language text not null default 'both'
    check (explanation_language in ('en', 'vi', 'both'));

comment on column public.profiles.interface_language is
  'Learner UI language. TOEIC question and passage content always remains English.';
comment on column public.profiles.explanation_language is
  'Controls whether curated English, Vietnamese, or both explanations are shown.';
