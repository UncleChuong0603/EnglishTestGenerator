"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { aggregateStoredAnswers } from "@/lib/tests/analysis";
import { selectAdaptiveQuestions } from "@/lib/tests/adaptive";
import { difficulties, skills, type Difficulty, type QuestionCandidate, type Skill } from "@/lib/tests/types";

export type ActionResult = { ok: true; id: string } | { ok: false; message: string };

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createPractice(
  difficulty: string,
): Promise<ActionResult> {
  if (!difficulties.includes(difficulty as Difficulty)) {
    return {
      ok: false,
      message: "Choose a valid level.",
    };
  }

  const { supabase, user } = await getUser();

  if (!user) {
    return {
      ok: false,
      message: "Sign in to start practising.",
    };
  }

  try {
    /*
     * Reuse an existing unfinished attempt at the same level.
     */
    
const {
  data: openAttempt,
  error: openAttemptError,
} = await supabase
  .from("attempts")
  .select("id")
  .eq("status", "in_progress")
  .maybeSingle();

if (openAttemptError) {
  console.error(
    "Failed to check existing attempt:",
    openAttemptError,
  );

  return {
    ok: false,
    message: "We could not check your current practice.",
  };
}

if (openAttempt) {
  return {
    ok: true,
    id: openAttempt.id,
  };
}

    /*
     * Load the learner's completed attempts.
     */
    const {
      data: attempts,
      error: attemptsError,
    } = await supabase
      .from("attempts")
      .select("id")
      .eq("status", "submitted");

    if (attemptsError) {
      console.error(
        "Failed to load practice history:",
        attemptsError,
      );

      return {
        ok: false,
        message: "We could not load your practice history.",
      };
    }

    const admin = createAdminClient();

    const attemptIds =
      attempts?.map((attempt) => attempt.id) ?? [];

    /*
     * Read previous answers server-side.
     */
    const {
      data: priorAnswers,
      error: priorAnswersError,
    } = attemptIds.length
      ? await admin
          .from("attempt_answers")
          .select("question_id, is_correct")
          .in("attempt_id", attemptIds)
      : {
          data: [],
          error: null,
        };

    if (priorAnswersError) {
      console.error(
        "Failed to load previous answers:",
        priorAnswersError,
      );

      return {
        ok: false,
        message: "We could not analyse your previous practice.",
      };
    }

    const priorQuestionIds = [
      ...new Set(
        (priorAnswers ?? []).map(
          (answer) => answer.question_id,
        ),
      ),
    ];

    /*
     * Get skills for previously answered questions.
     */
    const {
      data: priorQuestions,
      error: priorQuestionsError,
    } = priorQuestionIds.length
      ? await admin
          .from("questions")
          .select("id, skill")
          .in("id", priorQuestionIds)
      : {
          data: [],
          error: null,
        };

    if (priorQuestionsError) {
      console.error(
        "Failed to load question skills:",
        priorQuestionsError,
      );

      return {
        ok: false,
        message: "We could not analyse your skill history.",
      };
    }

    const skillMap = new Map(
      (priorQuestions ?? []).map((question) => [
        question.id,
        question.skill as Skill,
      ]),
    );

    const history = aggregateStoredAnswers(
      (priorAnswers ?? []).flatMap((answer) => {
        const skill = skillMap.get(answer.question_id);

        if (!skill) {
          return [];
        }

        return [
          {
            skill,
            isCorrect: answer.is_correct,
          },
        ];
      }),
    ).map(({ skill, correct, total }) => ({
      skill,
      correct,
      total,
    }));

    /*
     * Count how often each question has already been used.
     */
    const usage = new Map<string, number>();

    for (const answer of priorAnswers ?? []) {
      usage.set(
        answer.question_id,
        (usage.get(answer.question_id) ?? 0) + 1,
      );
    }

    /*
     * Load candidate questions for each skill.
     */
    const candidateResults = await Promise.all(
      skills.map(async (skill, index) => {
        const createQuery = () =>
          admin
            .from("questions")
            .select(
              "id, passage_id, skill, passages!inner(is_active)",
              { count: "exact" },
            )
            .eq("difficulty", difficulty)
            .eq("skill", skill)
            .eq("is_active", true)
            .eq("passages.is_active", true);

        const {
          count,
          error: countError,
        } = await createQuery().limit(1);

        if (countError) {
          throw new Error(
            `Failed loading ${skill} candidates: ${countError.message}`,
          );
        }

        const maximumOffset = Math.max(
          0,
          (count ?? 0) - 100,
        );

        const offset = maximumOffset
          ? (Date.now() + index * 997) %
            (maximumOffset + 1)
          : 0;

        const result = await createQuery()
          .order("id")
          .range(offset, offset + 99);

        if (result.error) {
          throw new Error(
            `Failed loading ${skill} questions: ${result.error.message}`,
          );
        }

        return result;
      }),
    );

    const bankQuestions = candidateResults.flatMap(
      (result) => result.data ?? [],
    );

    if (bankQuestions.length < 10) {
      return {
        ok: false,
        message:
          "There are not enough curated questions at this level yet.",
      };
    }

    const candidates: QuestionCandidate[] =
      bankQuestions.map((question) => ({
        id: question.id,
        passageId: question.passage_id,
        skill: question.skill as Skill,
        previousUses: usage.get(question.id) ?? 0,
      }));

    const selected = selectAdaptiveQuestions(
      candidates,
      history,
      10,
      `${user.id}:${Date.now()}`,
    );

    if (selected.length < 10) {
      return {
        ok: false,
        message:
          "We could not build a balanced practice set. Please try another level.",
      };
    }

    /*
     * Create attempt and snapshot the selected questions.
     */
    const {
      data: attemptId,
      error: createError,
    } = await admin.rpc("create_practice_attempt", {
      p_user_id: user.id,
      p_difficulty: difficulty,
      p_question_ids: selected.map(
        (question) => question.id,
      ),
    });

    if (createError || !attemptId) {
      console.error(
        "create_practice_attempt failed:",
        createError,
      );

      /*
       * Another request may have created the attempt first.
       */
      const { data: racedAttempt } = await supabase
        .from("attempts")
        .select("id")
        .eq("status", "in_progress")
        .maybeSingle();

      if (racedAttempt) {
        return {
          ok: true,
          id: racedAttempt.id,
        };
      }

      return {
        ok: false,
        message:
          "We could not start a practice set. Please try again.",
      };
    }

    return {
      ok: true,
      id: attemptId as string,
    };
  } catch (error) {
    console.error(
      "Adaptive practice creation failed:",
      error instanceof Error
        ? error.message
        : error,
    );

    return {
      ok: false,
      message:
        "We could not build a practice set right now. Please try again.",
    };
  }
}
