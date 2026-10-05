import Link from "next/link";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { featureAccessLabel, featureGroups, productFeatures } from "@/lib/marketing/features";
import styles from "./feature-directory.module.css";

function FeatureIcon({ id }: { id: string }) {
  const paths: Record<string, React.ReactNode> = {
    quick: <><path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h5M10 14l2 2 4-5"/></>,
    parts: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    diagnostic: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></>,
    mock: <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></>,
    listening: <><path d="M4 14v-2a8 8 0 0116 0v2M4 14h3v6H5a1 1 0 01-1-1zM20 14h-3v6h2a1 1 0 001-1z"/></>,
    vocabulary: <><path d="M4 5a3 3 0 013-3h5v18H7a3 3 0 00-3 2zM20 5a3 3 0 00-3-3h-5v18h5a3 3 0 013 2z"/></>,
    mistakes: <><path d="M6 3h9l4 4v14H6zM15 3v5h5M9.5 12.5l5 5M14.5 12.5l-5 5"/></>,
    grammar: <><path d="M4 5a3 3 0 013-3h5v18H7a3 3 0 00-3 2zM20 5a3 3 0 00-3-3h-5v18h5a3 3 0 013 2zM7 7h2M15 7h2"/></>,
    workout: <><path d="M13 2L5 14h6l-1 8 9-13h-6z"/></>,
    progress: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    goal: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
    "weekly-plan": <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M8 14h3M8 17h6"/></>,
    "weekly-review": <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M8 15l2 2 5-5"/></>,
    checklist: <><path d="M9 4h6M9 2v4M7 4H5v18h14V4h-2M8 12l2 2 4-4M8 18h7"/></>,
    ranking: <><path d="M8 4h8v4a4 4 0 01-8 0zM8 6H4v1a4 4 0 004 4M16 6h4v1a4 4 0 01-4 4M12 12v5M8 21h8M9 17h6"/></>,
    "ranked-challenges": <><circle cx="12" cy="9" r="6"/><path d="M9 14l-2 8 5-3 5 3-2-8M12 6v6M9 9h6"/></>,
  };

  return <svg aria-hidden="true" className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">{paths[id]}</svg>;
}

export function FeatureDirectory({ locale, compact = false, tone = "light" }: { locale: InterfaceLanguage; compact?: boolean; tone?: "light" | "dark" }) {
  return <div className={`${styles.directory} ${compact ? styles.compactDirectory : ""} ${tone === "dark" ? styles.dark : ""}`}>{featureGroups.map(group => <section aria-labelledby={`feature-group-${group.id}`} className={`${styles.group} ${compact ? styles.compactGroup : ""}`} key={group.id}>
    <h3 id={`feature-group-${group.id}`}>{group[locale]}</h3>
    <ul className={compact ? styles.compactList : undefined}>{group.features.map(id => {
      const feature = productFeatures.find(item => item.id === id)!;
      const t = feature[locale];
      if (compact) return <li key={id}><Link className={styles.compactFeature} href={feature.href} prefetch={false}>
        <span className={styles.iconFrame}><FeatureIcon id={id} /></span>
        <h4>{t.title}</h4>
        <span aria-hidden="true" className={styles.arrow}>↗</span>
      </Link></li>;
      return <li key={id}><Link className={styles.feature} href={feature.href}>
        <div className={styles.name}><h4>{t.title}</h4><span className={styles.access}>{featureAccessLabel(feature.access, locale)}</span></div>
        <p>{t.description}</p>
        <span className={styles.action}>{t.action}<span aria-hidden="true">↗</span></span>
      </Link></li>;
    })}</ul>
  </section>)}</div>;
}
