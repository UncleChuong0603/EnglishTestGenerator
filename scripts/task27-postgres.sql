\set ON_ERROR_STOP on

create extension if not exists pgcrypto;
create table users (id uuid primary key, created_at timestamptz not null);
create table practice_sessions (
  id uuid primary key, user_id uuid not null references users(id), status text not null,
  source text not null, practice_type text not null, started_at timestamptz not null,
  submitted_at timestamptz, score_total int, score_correct int
);
create table attempt_answers (id uuid primary key, session_id uuid not null references practice_sessions(id), user_id uuid not null references users(id), answered_at timestamptz);

insert into users values
 ('00000000-0000-0000-0000-00000000000a','2026-09-15T00:00:00Z'),
 ('00000000-0000-0000-0000-00000000000b','2026-09-15T00:00:00Z'),
 ('00000000-0000-0000-0000-00000000000c','2026-09-15T00:00:00Z'),
 ('00000000-0000-0000-0000-00000000000d','2026-09-15T00:00:00Z'),
 ('00000000-0000-0000-0000-00000000000e','2026-09-15T00:00:00Z'),
 ('00000000-0000-0000-0000-00000000000f','2026-09-15T00:00:00Z');

insert into practice_sessions values
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000b','submitted','recommended','part_5','2026-09-18T10:00:00Z','2026-09-18T10:10:00Z',10,7),
 ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-00000000000c','submitted','custom','part_5','2026-09-17T10:00:00Z','2026-09-17T10:10:00Z',10,8),
 ('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-00000000000c','submitted','recommended','part_5','2026-09-18T10:00:00Z','2026-09-18T10:10:00Z',10,9),
 ('10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-00000000000d','submitted','custom','part_5','2026-09-16T10:00:00Z','2026-09-16T10:10:00Z',10,6),
 ('10000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-00000000000d','submitted','recommended','part_5','2026-09-17T10:00:00Z','2026-09-17T10:10:00Z',10,7),
 ('10000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-00000000000d','submitted','mastery_review','part_5','2026-09-18T10:00:00Z','2026-09-18T10:10:00Z',10,8),
 ('10000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-00000000000e','submitted','diagnostic','diagnostic','2026-09-18T09:00:00Z','2026-09-18T09:30:00Z',20,10),
 ('10000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-00000000000e','submitted','mastery_review','part_5','2026-09-18T10:00:00Z','2026-09-18T10:10:00Z',10,9),
 ('10000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-00000000000f','submitted','recommended','part_5','2026-09-18T16:59:59Z','2026-09-18T16:59:59Z',10,8),
 ('10000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-00000000000f','submitted','recommended','part_5','2026-09-18T17:00:00Z','2026-09-18T17:00:00Z',10,9);

insert into attempt_answers
select gen_random_uuid(), id, user_id, submitted_at from practice_sessions, generate_series(1, score_total);

do $$
declare two_plus int; three_plus int; no_learning int; boundary_days int; questions_f int;
begin
  with days as (
    select user_id, count(distinct timezone('Asia/Ho_Chi_Minh',submitted_at)::date)::int n
    from practice_sessions where status='submitted' and source not in ('diagnostic','full_mock','ranked_challenge') and practice_type <> 'demo_test'
    group by user_id
  ) select count(*) filter(where n>=2),count(*) filter(where n>=3) into two_plus,three_plus from days;
  select count(*) into no_learning from users u where not exists (select 1 from practice_sessions ps where ps.user_id=u.id and ps.status='submitted' and ps.source not in ('diagnostic','full_mock','ranked_challenge') and ps.practice_type <> 'demo_test');
  select count(distinct timezone('Asia/Ho_Chi_Minh',submitted_at)::date), (select count(*) from attempt_answers where user_id='00000000-0000-0000-0000-00000000000f') into boundary_days,questions_f from practice_sessions where user_id='00000000-0000-0000-0000-00000000000f';
  if two_plus <> 3 or three_plus <> 1 or no_learning <> 1 or boundary_days <> 2 or questions_f <> 20 then raise exception 'Task 27 assertion failed: %, %, %, %, %',two_plus,three_plus,no_learning,boundary_days,questions_f; end if;
end $$;

select version();
select 'PASS' result;
