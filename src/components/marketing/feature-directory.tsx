import Link from "next/link";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { featureAccessLabel, featureGroups, productFeatures } from "@/lib/marketing/features";
import styles from "./feature-directory.module.css";

export function FeatureDirectory({ locale }: { locale: InterfaceLanguage }) {
  return <div className={styles.directory}>{featureGroups.map(group => <section aria-labelledby={`feature-group-${group.id}`} className={styles.group} key={group.id}>
    <h3 id={`feature-group-${group.id}`}>{group[locale]}</h3>
    <ul>{group.features.map(id => {
      const feature = productFeatures.find(item => item.id === id)!;
      const t = feature[locale];
      return <li key={id}><Link className={styles.feature} href={feature.href}>
        <div className={styles.name}><h4>{t.title}</h4><span className={styles.access}>{featureAccessLabel(feature.access, locale)}</span></div>
        <p>{t.description}</p>
        <span className={styles.action}>{t.action}<span aria-hidden="true">↗</span></span>
      </Link></li>;
    })}</ul>
  </section>)}</div>;
}
