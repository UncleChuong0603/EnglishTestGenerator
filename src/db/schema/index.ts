import { sql } from "drizzle-orm";
import { boolean, check, index, integer, jsonb, pgTable, primaryKey, smallint, text, timestamp, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  emailNormalized: text("email_normalized").notNull(),
  passwordHash: text("password_hash"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true, mode: "date" }),
  status: text("status").notNull().default("pending_verification"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
}, (table) => [
  uniqueIndex("users_email_normalized_uidx").on(table.emailNormalized),
  check("users_status_check", sql`${table.status} in ('active', 'disabled', 'pending_verification')`),
]);

export const userPlanMemberships = pgTable("user_plan_memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planKey: text("plan_key").notNull(),
  source: text("source").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true, mode: "date" }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true, mode: "date" }),
  revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
}, (table) => [
  index("user_plan_memberships_user_window_idx").on(table.userId, table.startsAt, table.endsAt, table.revokedAt),
  check("user_plan_memberships_plan_check", sql`${table.planKey} = 'PREMIUM'`),
  check("user_plan_memberships_source_check", sql`${table.source} in ('MANUAL','PROMOTION','PAYMENT')`),
  check("user_plan_memberships_range_check", sql`${table.endsAt} is null or ${table.endsAt} > ${table.startsAt}`),
]);

export const usageConsumptions = pgTable("usage_consumptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  entitlementKey: text("entitlement_key").notNull(),
  sourceType: text("source_type").notNull(),
  sourceId: uuid("source_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  unique("usage_consumptions_source_unique").on(table.userId, table.entitlementKey, table.sourceType, table.sourceId),
  index("usage_consumptions_user_entitlement_created_idx").on(table.userId, table.entitlementKey, table.createdAt),
  check("usage_consumptions_entitlement_check", sql`${table.entitlementKey} in ('TODAYS_WORKOUT','MANUAL_PRACTICE','MASTERY_REVIEW','FULL_MOCK')`),
  check("usage_consumptions_source_check", sql`${table.sourceType} in ('PRACTICE_SESSION','FULL_MOCK_RUN')`),
  check("usage_consumptions_quantity_check", sql`${table.quantity} > 0`),
]);

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  revokedBy: uuid("revoked_by").references(() => users.id, { onDelete: "set null" }),
}, (table) => [
  uniqueIndex("user_roles_active_role_uidx").on(table.userId, table.role).where(sql`${table.revokedAt} is null`),
  index("user_roles_user_active_idx").on(table.userId, table.revokedAt),
  check("user_roles_role_check", sql`${table.role} in ('ADMIN')`),
]);

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  targetUserId: uuid("target_user_id").references(() => users.id, { onDelete: "set null" }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  index("admin_audit_logs_created_idx").on(table.createdAt),
  index("admin_audit_logs_actor_idx").on(table.actorUserId),
  index("admin_audit_logs_target_idx").on(table.targetUserId),
  index("admin_audit_logs_action_idx").on(table.action),
  check("admin_audit_logs_action_check", sql`${table.action} in ('ADMIN_ROLE_GRANTED','ADMIN_ROLE_REVOKED','USER_SUSPENDED','USER_REACTIVATED','PREMIUM_GRANTED','PREMIUM_REVOKED')`),
]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  interfaceLanguage: text("interface_language").notNull().default("vi"),
  explanationLanguage: text("explanation_language").notNull().default("both"),
  rankingVisibility: text("ranking_visibility").notNull().default("ANONYMOUS"),
  publicProfileId: uuid("public_profile_id").notNull().defaultRandom(),
  ...timestamps,
}, (table) => [
  check("profiles_interface_language_check", sql`${table.interfaceLanguage} in ('en', 'vi')`),
  check("profiles_explanation_language_check", sql`${table.explanationLanguage} in ('en', 'vi', 'both')`),
  check("profiles_ranking_visibility_check", sql`${table.rankingVisibility} in ('PUBLIC','ANONYMOUS','HIDDEN')`),
  uniqueIndex("profiles_public_profile_uidx").on(table.publicProfileId),
]);

export const studyStreaks = pgTable("study_streaks", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  currentDays: integer("current_days").notNull().default(0),
  bestDays: integer("best_days").notNull().default(0),
  lastStudyDate: text("last_study_date"),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [check("study_streaks_counts_check", sql`${table.currentDays} >= 0 and ${table.bestDays} >= ${table.currentDays}`)]);

export const gamificationEvents = pgTable("gamification_events", {
  id: uuid("id").primaryKey().defaultRandom(), userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), sourceType: text("source_type").notNull(), sourceId: uuid("source_id").notNull(), questionId: uuid("question_id").references(() => questions.id, { onDelete: "restrict" }),
  localDate: text("local_date").notNull(), xpAwarded: integer("xp_awarded").notNull().default(0), rankPointsAwarded: integer("rank_points_awarded").notNull().default(0), createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  unique("gamification_events_source_unique").on(table.userId, table.eventType, table.sourceType, table.sourceId, table.questionId),
  index("gamification_events_user_created_idx").on(table.userId, table.createdAt), index("gamification_events_user_date_idx").on(table.userId, table.localDate), index("gamification_events_date_rank_idx").on(table.localDate, table.rankPointsAwarded),
  check("gamification_events_type_check", sql`${table.eventType} in ('QUESTION','STUDY_DAY','STREAK','WORKOUT_COMPLETE','MASTERY_COMPLETE','DIAGNOSTIC_COMPLETE','FULL_MOCK_COMPLETE','CHALLENGE_COMPLETE')`),
  check("gamification_events_points_check", sql`${table.xpAwarded} >= 0 and ${table.rankPointsAwarded} >= 0 and (${table.xpAwarded} > 0 or ${table.rankPointsAwarded} > 0)`),
]);

export const rankedChallenges = pgTable("ranked_challenges", {
  id: uuid("id").primaryKey().defaultRandom(), type: text("type").notNull(), status: text("status").notNull().default("DRAFT"), titleEn: text("title_en").notNull(), titleVi: text("title_vi").notNull(), startsAt: timestamp("starts_at", { withTimezone: true, mode: "date" }), endsAt: timestamp("ends_at", { withTimezone: true, mode: "date" }), publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }), cancelledAt: timestamp("cancelled_at", { withTimezone: true, mode: "date" }), createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "restrict" }), ...timestamps,
}, (table) => [index("ranked_challenges_status_window_idx").on(table.status, table.type, table.startsAt, table.endsAt), check("ranked_challenges_type_check", sql`${table.type} in ('READING_100','LISTENING_100','FULL_200')`), check("ranked_challenges_status_check", sql`${table.status} in ('DRAFT','PUBLISHED','CANCELLED')`), check("ranked_challenges_window_check", sql`(${table.status} = 'DRAFT') or (${table.startsAt} is not null and ${table.endsAt} > ${table.startsAt})`)]);

export const rankedChallengeItems = pgTable("ranked_challenge_items", {
  challengeId: uuid("challenge_id").notNull().references(() => rankedChallenges.id, { onDelete: "cascade" }), position: integer("position").notNull(), part: smallint("part").notNull(), questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "restrict" }), groupId: uuid("group_id").references(() => passageSets.id, { onDelete: "restrict" }),
}, (table) => [primaryKey({ columns: [table.challengeId, table.position] }), unique("ranked_challenge_question_unique").on(table.challengeId, table.questionId), check("ranked_challenge_item_part_check", sql`${table.part} between 1 and 7 and ${table.position} > 0`)]);

export const rankedChallengeRuns = pgTable("ranked_challenge_runs", {
  id: uuid("id").primaryKey().defaultRandom(), challengeId: uuid("challenge_id").notNull().references(() => rankedChallenges.id, { onDelete: "restrict" }), userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), fullMockRunId: uuid("full_mock_run_id").references(() => fullMockRuns.id, { onDelete: "restrict" }), status: text("status").notNull().default("IN_PROGRESS"), section: text("section"), listeningDeadline: timestamp("listening_deadline", {withTimezone:true,mode:"date"}), readingDeadline: timestamp("reading_deadline", {withTimezone:true,mode:"date"}), listeningScore: smallint("listening_score"), readingScore: smallint("reading_score"), totalScore: smallint("total_score"), startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(), completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" }), ...timestamps,
}, (table) => [unique("ranked_challenge_runs_user_unique").on(table.challengeId, table.userId), index("ranked_challenge_runs_leaderboard_idx").on(table.challengeId, table.status, table.totalScore), check("ranked_challenge_runs_status_check", sql`${table.status} in ('IN_PROGRESS','COMPLETED','EXPIRED')`), check("ranked_challenge_runs_section_check",sql`${table.section} is null or ${table.section} in ('LISTENING','READING')`), check("ranked_challenge_runs_scores_check", sql`(${table.listeningScore} is null or ${table.listeningScore} between 0 and 100) and (${table.readingScore} is null or ${table.readingScore} between 0 and 100) and (${table.totalScore} is null or ${table.totalScore} between 0 and 200)`)]);

export const userSessions = pgTable("user_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionTokenHash: text("session_token_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
}, (table) => [uniqueIndex("user_sessions_token_uidx").on(table.sessionTokenHash), index("user_sessions_user_idx").on(table.userId)]);

export const authIdentities = pgTable("auth_identities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  providerEmail: text("provider_email"),
  ...timestamps,
}, (table) => [
  unique("auth_identities_provider_account_unique").on(table.provider, table.providerAccountId),
  unique("auth_identities_user_provider_unique").on(table.userId, table.provider),
  check("auth_identities_provider_check", sql`${table.provider} in ('google')`),
]);

export const oauthStates = pgTable("oauth_states", {
  stateHash: text("state_hash").primaryKey(),
  codeVerifier: text("code_verifier").notNull(),
  linkUserId: uuid("link_user_id").references(() => users.id, { onDelete: "cascade" }),
  returnTo: text("return_to").notNull().default("/dashboard"),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

function bearerTokenTable(name: "email_verification_tokens" | "password_reset_tokens" | "account_activation_tokens") {
  return pgTable(name, {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    usedAt: timestamp("used_at", { withTimezone: true, mode: "date" }),
  }, (table) => [uniqueIndex(`${name}_hash_uidx`).on(table.tokenHash), index(`${name}_user_idx`).on(table.userId)]);
}

export const emailVerificationTokens = bearerTokenTable("email_verification_tokens");
export const passwordResetTokens = bearerTokenTable("password_reset_tokens");
export const accountActivationTokens = bearerTokenTable("account_activation_tokens");

export const authRateLimits = pgTable("auth_rate_limits", {
  keyHash: text("key_hash").primaryKey(),
  action: text("action").notNull(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  attempts: integer("attempts").notNull().default(1),
  blockedUntil: timestamp("blocked_until", { withTimezone: true, mode: "date" }),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const securityEvents = pgTable("security_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [index("security_events_user_created_idx").on(table.userId, table.createdAt)]);

export const passageSets = pgTable("passage_sets", {
  id: uuid("id").primaryKey().defaultRandom(), toeicPart: smallint("toeic_part").notNull(), skillArea: text("skill_area").notNull().default("READING"), setType: text("set_type").notNull(),
  title: text("title").notNull(), metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}), status: text("status").notNull().default("draft"), provenance: text("provenance").notNull().default("SEEDED"), revisionOfId: uuid("revision_of_id"), publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }), archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }), ...timestamps,
}, (table) => [
  index("passage_sets_admin_list_idx").on(table.status, table.skillArea, table.toeicPart, table.updatedAt),
  check("passage_sets_lifecycle_check", sql`${table.status} in ('draft','published','archived')`),
  check("passage_sets_provenance_check", sql`${table.provenance} in ('SEEDED','ADMIN')`),
  check("passage_sets_skill_part_check", sql`(${table.skillArea} = 'LISTENING' and ${table.toeicPart} between 1 and 4) or (${table.skillArea} = 'READING' and ${table.toeicPart} between 5 and 7)`),
]);

export const passages = pgTable("passages", {
  id: uuid("id").primaryKey().defaultRandom(), toeicPart: smallint("toeic_part").notNull(), passageType: text("passage_type").notNull(), title: text("title"), content: text("content"),
  audioUrl: text("audio_url"), imageUrl: text("image_url"), metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}), status: text("status").notNull().default("draft"),
  passageSetId: uuid("passage_set_id").references(() => passageSets.id, { onDelete: "cascade" }), position: smallint("position"), documentType: text("document_type"), ...timestamps,
}, (table) => [unique("passages_set_position_unique").on(table.passageSetId, table.position)]);

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind").notNull(),
  accessScope: text("access_scope").notNull(),
  storageProvider: text("storage_provider").notNull().default("R2"),
  storageKey: text("storage_key").notNull(),
  mimeType: text("mime_type").notNull(),
  byteSize: integer("byte_size").notNull(),
  checksum: text("checksum").notNull(),
  status: text("status").notNull().default("UPLOADING"),
  ownerUserId: uuid("owner_user_id").references(() => users.id, { onDelete: "restrict" }),
  audioDurationMs: integer("audio_duration_ms"),
  imageWidth: integer("image_width"),
  imageHeight: integer("image_height"),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
}, (table) => [
  uniqueIndex("media_assets_storage_key_uidx").on(table.storageKey),
  index("media_assets_checksum_idx").on(table.checksum),
  index("media_assets_owner_idx").on(table.ownerUserId),
  check("media_assets_kind_check", sql`${table.kind} in ('AUDIO','IMAGE')`),
  check("media_assets_access_scope_check", sql`${table.accessScope} in ('CONTENT','PRIVATE_USER')`),
  check("media_assets_provider_check", sql`${table.storageProvider} = 'R2'`),
  check("media_assets_status_check", sql`${table.status} in ('UPLOADING','READY','FAILED','ARCHIVED')`),
  check("media_assets_size_check", sql`${table.byteSize} > 0`),
  check("media_assets_owner_scope_check", sql`(${table.accessScope} = 'CONTENT' and ${table.ownerUserId} is null) or (${table.accessScope} = 'PRIVATE_USER' and ${table.ownerUserId} is not null)`),
]);

export const questionGroupMedia = pgTable("question_group_media", {
  questionGroupId: uuid("question_group_id").notNull().references(() => passageSets.id, { onDelete: "cascade" }),
  mediaAssetId: uuid("media_asset_id").notNull().references(() => mediaAssets.id, { onDelete: "restrict" }),
  role: text("role").notNull(),
  position: smallint("position").notNull().default(1),
  altText: text("alt_text"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.questionGroupId, table.mediaAssetId] }),
  unique("question_group_media_role_position_unique").on(table.questionGroupId, table.role, table.position),
  check("question_group_media_role_check", sql`${table.role} in ('AUDIO','IMAGE')`),
  check("question_group_media_position_check", sql`${table.position} > 0`),
]);

export const stimulusMedia = pgTable("stimulus_media", {
  stimulusId: uuid("stimulus_id").notNull().references(() => passages.id, { onDelete: "cascade" }),
  mediaAssetId: uuid("media_asset_id").notNull().references(() => mediaAssets.id, { onDelete: "restrict" }),
  role: text("role").notNull(),
  position: smallint("position").notNull().default(1),
  altText: text("alt_text"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.stimulusId, table.mediaAssetId] }),
  unique("stimulus_media_role_position_unique").on(table.stimulusId, table.role, table.position),
  check("stimulus_media_role_check", sql`${table.role} in ('AUDIO','IMAGE')`),
]);

export const listeningTranscripts = pgTable("listening_transcripts", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionGroupId: uuid("question_group_id").references(() => passageSets.id, { onDelete: "cascade" }),
  stimulusId: uuid("stimulus_id").references(() => passages.id, { onDelete: "cascade" }),
  mediaAssetId: uuid("media_asset_id").references(() => mediaAssets.id, { onDelete: "restrict" }),
  content: text("content").notNull(),
  ...timestamps,
}, (table) => [
  check("listening_transcripts_parent_check", sql`num_nonnulls(${table.questionGroupId}, ${table.stimulusId}, ${table.mediaAssetId}) = 1`),
]);

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(), toeicPart: smallint("toeic_part").notNull(), skillArea: text("skill_area").notNull().default("READING"), questionType: text("question_type").notNull(), responseType: text("response_type").notNull().default("MULTIPLE_CHOICE"), skill: text("skill").notNull(), subSkill: text("sub_skill").notNull(),
  difficulty: text("difficulty").notNull(), questionText: text("question_text").notNull(), passageId: uuid("passage_id").references(() => passages.id, { onDelete: "restrict" }), audioUrl: text("audio_url"), imageUrl: text("image_url"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}), status: text("status").notNull().default("draft"), provenance: text("provenance").notNull().default("SEEDED"), revisionOfId: uuid("revision_of_id"), publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }), archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }), passageSetId: uuid("passage_set_id").references(() => passageSets.id, { onDelete: "restrict" }), questionOrder: smallint("question_order").notNull().default(1), ...timestamps,
}, (table) => [
  index("questions_published_taxonomy_idx").on(table.skillArea, table.toeicPart, table.skill, table.subSkill, table.difficulty),
  index("questions_admin_list_idx").on(table.status, table.skillArea, table.toeicPart, table.updatedAt),
  unique("questions_set_order_unique").on(table.passageSetId, table.questionOrder),
  check("questions_skill_part_check", sql`(${table.skillArea} = 'LISTENING' and ${table.toeicPart} between 1 and 4) or (${table.skillArea} = 'READING' and ${table.toeicPart} between 5 and 7)`),
  check("questions_response_type_check", sql`${table.responseType} in ('MULTIPLE_CHOICE','TEXT','AUDIO')`),
  check("questions_lifecycle_check", sql`${table.status} in ('draft','published','archived')`),
  check("questions_provenance_check", sql`${table.provenance} in ('SEEDED','ADMIN')`),
]);

export const questionOptions = pgTable("question_options", {
  id: uuid("id").primaryKey().defaultRandom(), questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }), optionKey: text("option_key").notNull(), optionText: text("option_text").notNull(), displayOrder: smallint("display_order").notNull(), createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [unique("question_options_key_unique").on(table.questionId, table.optionKey), unique("question_options_order_unique").on(table.questionId, table.displayOrder), unique("question_options_id_question_unique").on(table.id, table.questionId)]);

export const questionSolutions = pgTable("question_solutions", {
  questionId: uuid("question_id").primaryKey().references(() => questions.id, { onDelete: "cascade" }), correctOptionId: uuid("correct_option_id").notNull().references(() => questionOptions.id, { onDelete: "restrict" }), explanationEn: text("explanation_en"), explanationVi: text("explanation_vi"), ...timestamps,
});

export const diagnosticRuns = pgTable("diagnostic_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  guestOwnerHash: text("guest_owner_hash"),
  status: text("status").notNull().default("IN_PROGRESS"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" }),
}, (table) => [
  index("diagnostic_runs_user_created_idx").on(table.userId, table.createdAt),
  index("diagnostic_runs_guest_created_idx").on(table.guestOwnerHash, table.createdAt),
  uniqueIndex("diagnostic_runs_one_active_user_idx").on(table.userId).where(sql`${table.status} = 'IN_PROGRESS' and ${table.userId} is not null`),
  uniqueIndex("diagnostic_runs_one_active_guest_idx").on(table.guestOwnerHash).where(sql`${table.status} = 'IN_PROGRESS' and ${table.guestOwnerHash} is not null`),
  check("diagnostic_runs_owner_check", sql`num_nonnulls(${table.userId}, ${table.guestOwnerHash}) = 1`),
  check("diagnostic_runs_status_check", sql`${table.status} in ('IN_PROGRESS','COMPLETED','EXPIRED')`),
  check("diagnostic_runs_lifecycle_check", sql`(${table.status} = 'COMPLETED' and ${table.completedAt} is not null) or (${table.status} <> 'COMPLETED' and ${table.completedAt} is null)`),
]);

export const fullMockRuns = pgTable("full_mock_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("LISTENING"),
  listeningStartedAt: timestamp("listening_started_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  listeningDeadline: timestamp("listening_deadline", { withTimezone: true, mode: "date" }).notNull(),
  listeningCompletedAt: timestamp("listening_completed_at", { withTimezone: true, mode: "date" }),
  readingStartedAt: timestamp("reading_started_at", { withTimezone: true, mode: "date" }),
  readingDeadline: timestamp("reading_deadline", { withTimezone: true, mode: "date" }),
  readingCompletedAt: timestamp("reading_completed_at", { withTimezone: true, mode: "date" }),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
}, (table) => [
  index("full_mock_runs_user_created_idx").on(table.userId, table.createdAt),
  uniqueIndex("full_mock_runs_one_active_user_idx").on(table.userId).where(sql`${table.status} in ('LISTENING','READING')`),
  check("full_mock_runs_status_check", sql`${table.status} in ('LISTENING','READING','COMPLETED','EXPIRED')`),
]);

export const practiceSessions = pgTable("practice_sessions", {
  id: uuid("id").primaryKey().defaultRandom(), userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }), guestOwnerHash: text("guest_owner_hash"), skillArea: text("skill_area").notNull().default("READING"), practiceType: text("practice_type").notNull().default("part_5"), part: smallint("part"), status: text("status").notNull().default("in_progress"), questionCount: smallint("question_count").notNull(), startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(), submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "date" }), scoreCorrect: smallint("score_correct"), scoreTotal: smallint("score_total"), createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(), source: text("source").notNull().default("custom"), requestedQuestionCount: smallint("requested_question_count").notNull().default(10), requestedSkill: text("requested_skill"), requestedSubSkill: text("requested_sub_skill"), expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }), submissionReason: text("submission_reason"), diagnosticRunId: uuid("diagnostic_run_id").references(() => diagnosticRuns.id, { onDelete: "cascade" }), diagnosticOrder: smallint("diagnostic_order"), fullMockRunId: uuid("full_mock_run_id").references(() => fullMockRuns.id, { onDelete: "cascade" }), fullMockOrder: smallint("full_mock_order"), rankedChallengeRunId: uuid("ranked_challenge_run_id").references(() => rankedChallengeRuns.id,{onDelete:"cascade"}), rankedChallengeOrder: smallint("ranked_challenge_order"),
}, (table) => [
  unique("practice_sessions_id_user_unique").on(table.id, table.userId), index("practice_sessions_user_created_idx").on(table.userId, table.createdAt), index("practice_sessions_guest_created_idx").on(table.guestOwnerHash, table.createdAt),
  unique("practice_sessions_diagnostic_order_unique").on(table.diagnosticRunId, table.diagnosticOrder), unique("practice_sessions_full_mock_order_unique").on(table.fullMockRunId, table.fullMockOrder),unique("practice_sessions_ranked_order_unique").on(table.rankedChallengeRunId,table.rankedChallengeOrder),index("practice_sessions_ranked_run_idx").on(table.rankedChallengeRunId,table.rankedChallengeOrder),
  uniqueIndex("practice_sessions_one_open_practice_idx").on(table.userId).where(sql`${table.status} = 'in_progress' and ${table.practiceType} <> 'demo_test' and ${table.source} not in ('diagnostic','full_mock','ranked_challenge') and ${table.userId} is not null`),
  uniqueIndex("practice_sessions_one_open_demo_idx").on(table.userId).where(sql`${table.status} = 'in_progress' and ${table.practiceType} = 'demo_test'`), uniqueIndex("practice_sessions_one_open_guest_idx").on(table.guestOwnerHash).where(sql`${table.status} = 'in_progress' and ${table.source} <> 'diagnostic' and ${table.guestOwnerHash} is not null`),
  check("practice_sessions_owner_check", sql`num_nonnulls(${table.userId}, ${table.guestOwnerHash}) = 1`), check("practice_sessions_diagnostic_link_check", sql`(${table.source} = 'diagnostic' and ${table.diagnosticRunId} is not null and ${table.diagnosticOrder} between 1 and 7) or (${table.source} <> 'diagnostic' and ${table.diagnosticRunId} is null and ${table.diagnosticOrder} is null)`),
  check("practice_sessions_full_mock_link_check", sql`(${table.source} = 'full_mock' and ${table.fullMockRunId} is not null and ${table.fullMockOrder} between 1 and 7 and ${table.userId} is not null and ${table.guestOwnerHash} is null) or (${table.source} <> 'full_mock' and ${table.fullMockRunId} is null and ${table.fullMockOrder} is null)`),
  check("practice_sessions_ranked_challenge_link_check",sql`(${table.source}='ranked_challenge' and ${table.rankedChallengeRunId} is not null and ${table.rankedChallengeOrder} between 1 and 7 and ${table.userId} is not null and ${table.guestOwnerHash} is null) or (${table.source}<>'ranked_challenge' and ${table.rankedChallengeRunId} is null and ${table.rankedChallengeOrder} is null)`),
  check("practice_sessions_count_check", sql`${table.questionCount} > 0 and (${table.requestedQuestionCount} is null or ${table.requestedQuestionCount} > 0)`),
  check("practice_sessions_demo_time_check", sql`(${table.practiceType} = 'demo_test' and ${table.guestOwnerHash} is null and ${table.expiresAt} > ${table.startedAt}) or (${table.practiceType} <> 'demo_test' and ${table.submissionReason} is null and ((${table.guestOwnerHash} is not null and ${table.expiresAt} > ${table.startedAt}) or (${table.guestOwnerHash} is null and (${table.expiresAt} is null or ${table.source} in ('diagnostic','full_mock'))))`), check("practice_sessions_skill_part_check", sql`(${table.skillArea} = 'READING' and (${table.part} is null or ${table.part} between 5 and 7)) or (${table.skillArea} = 'LISTENING' and (${table.part} is null or ${table.part} between 1 and 4))`),
]);

export const practiceSessionQuestions = pgTable("practice_session_questions", {
  sessionId: uuid("session_id").notNull().references(() => practiceSessions.id, { onDelete: "cascade" }), questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "restrict" }), displayOrder: smallint("display_order").notNull(), passageSetId: uuid("passage_set_id").references(() => passageSets.id, { onDelete: "restrict" }),
}, (table) => [primaryKey({ columns: [table.sessionId, table.questionId] }), unique("practice_session_questions_order_unique").on(table.sessionId, table.displayOrder)]);

export const attemptAnswers = pgTable("attempt_answers", {
  id: uuid("id").primaryKey().defaultRandom(), sessionId: uuid("session_id").notNull().references(() => practiceSessions.id, { onDelete: "cascade" }), userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }), questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "restrict" }), responseType: text("response_type").notNull().default("MULTIPLE_CHOICE"), selectedOptionId: uuid("selected_option_id").references(() => questionOptions.id, { onDelete: "restrict" }), isCorrect: boolean("is_correct").notNull(), responseTimeMs: integer("response_time_ms"), answeredAt: timestamp("answered_at", { withTimezone: true, mode: "date" }), createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [unique("attempt_answers_session_question_unique").on(table.sessionId, table.questionId), index("attempt_answers_user_session_idx").on(table.userId, table.sessionId), check("attempt_answers_response_type_check", sql`${table.responseType} = 'MULTIPLE_CHOICE'`)]);

export const questionMastery = pgTable("question_mastery", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "restrict" }),
  status: text("status").notNull().default("UNRESOLVED"),
  firstMissedAt: timestamp("first_missed_at", { withTimezone: true, mode: "date" }).notNull(),
  lastMissedAt: timestamp("last_missed_at", { withTimezone: true, mode: "date" }).notNull(),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true, mode: "date" }),
  reviewAttemptCount: integer("review_attempt_count").notNull().default(0),
  reviewSuccessStreak: integer("review_success_streak").notNull().default(0),
  masteredAt: timestamp("mastered_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
}, (table) => [
  unique("question_mastery_user_question_unique").on(table.userId, table.questionId),
  index("question_mastery_user_status_missed_idx").on(table.userId, table.status, table.lastMissedAt),
  index("question_mastery_question_idx").on(table.questionId),
  check("question_mastery_status_check", sql`${table.status} in ('UNRESOLVED','MASTERED')`),
  check("question_mastery_counts_check", sql`${table.reviewAttemptCount} >= 0 and ${table.reviewSuccessStreak} >= 0`),
]);

export const demoTestAnswers = pgTable("demo_test_answers", {
  sessionId: uuid("session_id").notNull().references(() => practiceSessions.id, { onDelete: "cascade" }), userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "restrict" }), selectedOptionId: uuid("selected_option_id").notNull().references(() => questionOptions.id, { onDelete: "restrict" }), responseTimeMs: integer("response_time_ms"), answeredAt: timestamp("answered_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.sessionId, table.questionId] }), index("demo_test_answers_user_session_idx").on(table.userId, table.sessionId)]);

export const fullMockAnswers = pgTable("full_mock_answers", {
  sessionId: uuid("session_id").notNull().references(() => practiceSessions.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "restrict" }),
  selectedOptionId: uuid("selected_option_id").notNull().references(() => questionOptions.id, { onDelete: "restrict" }),
  audioStartedAt: timestamp("audio_started_at", { withTimezone: true, mode: "date" }),
  answeredAt: timestamp("answered_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.sessionId, table.questionId] }), index("full_mock_answers_user_session_idx").on(table.userId, table.sessionId)]);
