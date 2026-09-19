import type { InterfaceLanguage } from "@/lib/i18n/config";
import { LearnerNav as AccountLearnerNav } from "./learner-nav";

export function LearnerNav({ locale }: { locale: InterfaceLanguage }) {
  return <AccountLearnerNav locale={locale} showPremiumIdentity={false}/>;
}
