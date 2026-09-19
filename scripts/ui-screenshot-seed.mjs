import assert from "node:assert/strict";
import argon2 from "argon2";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL ?? "");
assert.deepEqual(
  { host: url.hostname, port: url.port, database: url.pathname, user: url.username },
  { host: "127.0.0.1", port: "15433", database: "/toeicgym_task17", user: "toeicgym_test" },
);

const pool = new pg.Pool({ connectionString: url.href });
const password = "Ui-review-2026!";
const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

async function upsertUser(email, fullName, premium) {
  const user = (await pool.query(
    `insert into users(email,email_normalized,password_hash,email_verified_at,status)
     values ($1,$1,$2,now(),'active')
     on conflict (email_normalized) do update set password_hash=excluded.password_hash,email_verified_at=now(),status='active'
     returning id`,
    [email, passwordHash],
  )).rows[0];
  await pool.query(
    `insert into profiles(id,full_name,interface_language,explanation_language,ranking_visibility)
     values ($1,$2,'vi','both','PUBLIC')
     on conflict (id) do update set full_name=excluded.full_name,interface_language='vi',ranking_visibility='PUBLIC'`,
    [user.id, fullName],
  );
  await pool.query(`delete from user_plan_memberships where user_id=$1`, [user.id]);
  if (premium) await pool.query(
    `insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at)
     values ($1,'PREMIUM','MANUAL',now()-interval '3 days',now()+interval '87 days')`,
    [user.id],
  );
  await pool.query(
    `insert into study_streaks(user_id,current_days,best_days,last_study_date)
     values ($1,6,14,current_date::text)
     on conflict (user_id) do update set current_days=6,best_days=14,last_study_date=current_date::text`,
    [user.id],
  );
  return user.id;
}

try {
  const identity = (await pool.query("select current_database() database,current_user db_user")).rows[0];
  assert.deepEqual(identity, { database: "toeicgym_task17", db_user: "toeicgym_test" });
  const freeId = await upsertUser("free.learner@ui.invalid", "Nguyễn Minh Anh", false);
  const premiumId = await upsertUser("premium.learner@ui.invalid", "Trần Gia Huy", true);

  const questions = (await pool.query(
    `select q.id, row_number() over(order by q.toeic_part,q.id) n
     from questions q where q.status='published' and q.skill_area='READING' limit 8`,
  )).rows;
  assert.ok(questions.length >= 8, "Run the reading seed before the screenshot fixture.");
  for (const userId of [freeId, premiumId]) {
    await pool.query(`delete from question_mastery where user_id=$1`, [userId]);
    for (const [index, question] of questions.slice(0, 4).entries()) await pool.query(
      `insert into question_mastery(user_id,question_id,status,first_missed_at,last_missed_at,last_reviewed_at,review_attempt_count,review_success_streak,mastered_at)
       values ($1,$2,$3,now()-interval '12 days',now()-interval '2 days',$4,$5,$6,$7)`,
      [userId, question.id, index < 3 ? "UNRESOLVED" : "MASTERED", index < 3 ? null : new Date(), index + 1, index < 3 ? 0 : 2, index < 3 ? null : new Date()],
    );
    await pool.query(`delete from gamification_events where user_id=$1`, [userId]);
    for (let day = 0; day < 5; day++) await pool.query(
      `insert into gamification_events(user_id,event_type,source_type,source_id,local_date,xp_awarded,rank_points_awarded,created_at)
       values ($1,'STUDY_DAY','PRACTICE_SESSION',gen_random_uuid(),(current_date-$2::int)::text,$3,$4,now()-($2||' days')::interval)`,
      [userId, day, 30 + day * 4, 12 + day * 3],
    );
  }

  const authorId = premiumId;
  const post = (await pool.query(
    `insert into content_posts(title,slug,excerpt,content,status,category,seo_title,seo_description,canonical_path,published_at,created_by,updated_by)
     values ('Chiến lược TOEIC Part 5 hiệu quả','chien-luoc-toeic-part-5-ui-review','Hướng dẫn ngắn gọn để luyện Part 5 có hệ thống.',
     '# Chiến lược Part 5\n\nPart 5 kiểm tra khả năng nhận diện **ngữ pháp và từ vựng** trong ngữ cảnh.\n\n## Cách luyện tập\n\n- Xác định loại từ cần điền.\n- Quan sát dấu hiệu quanh chỗ trống.\n- Ghi lại lỗi sai và ôn tập.\n\nHãy [bắt đầu luyện tập](/practice) khi bạn sẵn sàng.\n\n> Tiến bộ bền vững đến từ việc luyện đúng trọng tâm.',
     'PUBLISHED','GRAMMAR','Chiến lược TOEIC Part 5','Cách luyện TOEIC Part 5 có hệ thống.','/blog/chien-luoc-toeic-part-5-ui-review',now(),$1,$1)
     on conflict (slug) do update set status='PUBLISHED',published_at=now(),content=excluded.content,excerpt=excluded.excerpt,updated_by=$1
     returning id`,
    [authorId],
  )).rows[0];
  for (const [name, slug] of [["Part 5", "part-5"], ["Ngữ pháp", "ngu-phap"]]) {
    const tag = (await pool.query(`insert into content_tags(name,slug) values($1,$2) on conflict(slug) do update set name=excluded.name returning id`, [name, slug])).rows[0];
    await pool.query(`insert into content_post_tags(post_id,tag_id) values($1,$2) on conflict do nothing`, [post.id, tag.id]);
  }
  console.log(JSON.stringify({ database: identity.database, free: "free.learner@ui.invalid", premium: "premium.learner@ui.invalid", password, realPayments: 0, payosCalls: 0 }));
} finally {
  await pool.end();
}
