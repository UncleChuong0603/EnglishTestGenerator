import { redirect } from "next/navigation";

import { LearnerNav } from "@/components/learner-nav";
import { getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import { createClient } from "@/lib/supabase/server";
import { PreferencesForm } from "./preferences-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const preferences = await getPreferences(user.id);
  const t = getTranslations(preferences.interfaceLanguage);
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl"><LearnerNav locale={preferences.interfaceLanguage} /><section className="mx-auto mt-10 max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"><p className="text-sm font-bold uppercase tracking-wider text-teal-700">{t.settings.eyebrow}</p><h1 className="mt-2 text-3xl font-black">{t.settings.title}</h1><p className="mt-3 leading-7 text-slate-600">{t.settings.intro}</p><PreferencesForm preferences={preferences} t={t} /></section></div></main>;
}
