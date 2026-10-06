"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import {
  DAILY_STUDY_MINUTES,
  STUDY_DAYS_PER_WEEK,
  TARGET_SCORE_PRESETS,
  dateInTimeZone,
  type GoalProfile,
} from "@/lib/goals/domain";
import { saveGoal, type GoalActionState } from "./goal-actions";
import { SettingsIcon } from "./settings-icon";

const initialState: GoalActionState = { ok: false };
const optionClass =
  "group relative flex min-h-13 cursor-pointer items-center gap-3 rounded-xl border border-[#cbd7cb] bg-white px-4 py-3 text-left transition-colors hover:border-[#84a58f] hover:bg-[#f7faf6] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#245a43] has-checked:border-[#245a43] has-checked:bg-[#edf5ef]";

function ChoiceMark() {
  return (
    <span className="grid size-5 shrink-0 place-items-center rounded-full border border-[#9eaaa2] bg-white text-transparent transition-colors group-has-checked:border-[#245a43] group-has-checked:bg-[#245a43] group-has-checked:text-white">
      <SettingsIcon className="size-3.5" name="check" />
    </span>
  );
}

function StepHeading({ description, number, title }: { description?: string; number: number; title: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e7eee8] text-sm font-black text-[#245a43]">{number}</span>
      <div>
        <h3 className="font-bold text-[#172821]">{title}</h3>
        {description ? <p className="mt-1 text-sm leading-6 text-[#52645a]">{description}</p> : null}
      </div>
    </div>
  );
}

export function GoalForm({ goal, locale }: { goal: GoalProfile | null; locale: InterfaceLanguage }) {
  const [state, action, pending] = useActionState(saveGoal, initialState);
  const vi = locale === "vi";
  const preset = goal?.targetScore && TARGET_SCORE_PRESETS.includes(goal.targetScore as never)
    ? String(goal.targetScore)
    : goal?.targetScore
      ? "custom"
      : "";
  const [targetChoice, setTargetChoice] = useState(preset);

  return (
    <form action={action} aria-busy={pending} className="mt-6">
      <div className="rounded-2xl border border-[#cbd7cb] bg-[#f3f8f1] p-4 sm:p-5">
        <div className="flex gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#245a43] ring-1 ring-[#dce3d9]">
            <SettingsIcon name="goal" />
          </span>
          <div>
            <p className="font-bold text-[#183e2b]">{vi ? "Xây lộ trình vừa với bạn" : "Build a plan that fits you"}</p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#52645a]">
              {vi
                ? "Mục tiêu và thời gian rảnh giúp TOEIC GYM điều chỉnh kế hoạch tuần. Bạn có thể đổi lại bất cứ lúc nào."
                : "Your target and available time help TOEIC GYM tune your weekly plan. You can change them at any time."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 space-y-8">
        <fieldset>
          <legend className="sr-only">{vi ? "Mục tiêu TOEIC" : "Target TOEIC score"}</legend>
          <StepHeading
            description={vi ? "Tổng điểm Listening & Reading, từ 10 đến 990 theo bước 5 điểm." : "Listening & Reading total, from 10 to 990 in 5-point steps."}
            number={1}
            title={vi ? "Bạn muốn đạt bao nhiêu điểm?" : "What score are you aiming for?"}
          />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            <label className={optionClass}>
              <input className="sr-only" defaultChecked={!preset} name="targetChoice" onChange={() => setTargetChoice("")} type="radio" value="" />
              <ChoiceMark />
              <span className="font-semibold">{vi ? "Chưa xác định" : "Not decided"}</span>
            </label>
            {TARGET_SCORE_PRESETS.map((value) => (
              <label className={optionClass} key={value}>
                <input className="sr-only" defaultChecked={preset === String(value)} name="targetChoice" onChange={() => setTargetChoice(String(value))} type="radio" value={value} />
                <ChoiceMark />
                <span className="font-bold tabular-nums">{value}+</span>
              </label>
            ))}
            <label className={optionClass}>
              <input className="sr-only" defaultChecked={preset === "custom"} name="targetChoice" onChange={() => setTargetChoice("custom")} type="radio" value="custom" />
              <ChoiceMark />
              <span className="font-semibold">{vi ? "Điểm khác" : "Custom"}</span>
            </label>
          </div>
          {targetChoice === "custom" ? (
            <div className="mt-3 rounded-xl border border-[#dce3d9] bg-[#f7f6f1] p-4">
              <label className="block text-sm font-bold" htmlFor="customTarget">{vi ? "Nhập điểm mục tiêu" : "Enter your target score"}</label>
              <input
                aria-describedby="custom-target-help"
                autoFocus
                className="mt-2 min-h-12 w-full max-w-48 rounded-xl border border-[#aebcb2] bg-white px-4 text-base font-semibold tabular-nums outline-none focus:border-[#245a43] focus:ring-2 focus:ring-[#245a43]/20"
                defaultValue={preset === "custom" ? goal?.targetScore ?? "" : ""}
                id="customTarget"
                inputMode="numeric"
                max={990}
                min={10}
                name="customTarget"
                placeholder="10–990"
                required
                step={5}
                type="number"
              />
              <p className="mt-2 text-xs leading-5 text-[#52645a]" id="custom-target-help">{vi ? "Ví dụ: 725 hoặc 905." : "For example: 725 or 905."}</p>
            </div>
          ) : <input name="customTarget" type="hidden" value="" />}
        </fieldset>

        <div className="border-t border-[#edf1eb] pt-8">
          <StepHeading
            description={vi ? "Không bắt buộc — để trống nếu bạn chưa chốt lịch thi." : "Optional — leave blank if your test date is not confirmed."}
            number={2}
            title={vi ? "Khi nào bạn dự định thi?" : "When do you plan to take the test?"}
          />
          <label className="sr-only" htmlFor="examDate">{vi ? "Ngày thi dự kiến" : "Expected test date"}</label>
          <input className="mt-4 min-h-12 w-full max-w-sm rounded-xl border border-[#aebcb2] bg-white px-4 text-base outline-none focus:border-[#245a43] focus:ring-2 focus:ring-[#245a43]/20" defaultValue={goal?.examDate ?? ""} id="examDate" min={dateInTimeZone()} name="examDate" type="date" />
        </div>

        <fieldset className="border-t border-[#edf1eb] pt-8">
          <legend className="sr-only">{vi ? "Thời gian học mỗi ngày" : "Study time per day"}</legend>
          <StepHeading
            description={vi ? "Chọn mức bạn có thể duy trì đều đặn." : "Choose a pace you can maintain consistently."}
            number={3}
            title={vi ? "Mỗi ngày bạn có bao nhiêu phút?" : "How many minutes do you have each day?"}
          />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <label className={optionClass}>
              <input className="sr-only" defaultChecked={!goal?.dailyStudyMinutes} name="dailyStudyMinutes" type="radio" value="" />
              <ChoiceMark />
              <span className="font-semibold">{vi ? "Chưa chọn" : "Not set"}</span>
            </label>
            {DAILY_STUDY_MINUTES.map((value) => (
              <label className={optionClass} key={value}>
                <input className="sr-only" defaultChecked={goal?.dailyStudyMinutes === value} name="dailyStudyMinutes" type="radio" value={value} />
                <ChoiceMark />
                <span className="font-semibold tabular-nums">{value} {vi ? "phút" : "min"}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="border-t border-[#edf1eb] pt-8">
          <legend className="sr-only">{vi ? "Số ngày học mỗi tuần" : "Study days per week"}</legend>
          <StepHeading
            description={vi ? "Lịch học sẽ được dàn đều theo nhịp này." : "Your weekly plan will be spread across this rhythm."}
            number={4}
            title={vi ? "Bạn muốn học mấy ngày mỗi tuần?" : "How many days do you want to study each week?"}
          />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label className={optionClass}>
              <input className="sr-only" defaultChecked={!goal?.studyDaysPerWeek} name="studyDaysPerWeek" type="radio" value="" />
              <ChoiceMark />
              <span className="font-semibold">{vi ? "Chưa chọn" : "Not set"}</span>
            </label>
            {STUDY_DAYS_PER_WEEK.map((value) => (
              <label className={optionClass} key={value}>
                <input className="sr-only" defaultChecked={goal?.studyDaysPerWeek === value} name="studyDaysPerWeek" type="radio" value={value} />
                <ChoiceMark />
                <span className="font-semibold tabular-nums">{value} {vi ? "ngày" : "days"}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {state.error ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert">
          {state.error === "invalid" ? (vi ? "Hãy kiểm tra điểm mục tiêu, ngày thi và lịch học." : "Check the target score, test date, and study schedule.") : (vi ? "Không thể lưu mục tiêu. Vui lòng thử lại." : "We couldn't save your goal. Please try again.")}
        </p>
      ) : state.ok ? (
        <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800" role="status">{vi ? "Đã lưu mục tiêu học tập." : "Learning goal saved."}</p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 border-t border-[#edf1eb] pt-6 sm:flex-row sm:items-center">
        <button className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#245a43] px-6 py-3 font-bold text-white transition-colors hover:bg-[#184631] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43] disabled:cursor-not-allowed disabled:opacity-50" disabled={pending} type="submit">
          {pending ? (vi ? "Đang lưu…" : "Saving…") : vi ? "Lưu mục tiêu" : "Save goal"}
        </button>
        {!goal ? <Link className="inline-flex min-h-11 items-center justify-center px-3 font-semibold text-[#52645a] hover:text-[#172821] focus-visible:outline-2 focus-visible:outline-[#245a43]" href="/dashboard">{vi ? "Bỏ qua lúc này" : "Skip for now"}</Link> : null}
      </div>
    </form>
  );
}
