import type { InterfaceLanguage } from "@/lib/i18n/config";

export type LearnerNavIconName = "today" | "practice" | "progress";
export type LearnerNavItem = {
  href: string;
  label: string;
  icon?: LearnerNavIconName;
};

type PrimaryLabels = {
  progress: string;
  practice: string;
  today: string;
  mockTests: string;
};

function learnerHref(path: string, signedIn: boolean) {
  return signedIn ? path : `/sign-in?next=${encodeURIComponent(path)}`;
}

export function getLearnerPrimaryNavigation(
  signedIn: boolean,
  labels: PrimaryLabels,
): readonly LearnerNavItem[] {
  return [
    {
      href: learnerHref("/progress", signedIn),
      label: labels.progress,
      icon: "progress",
    },
    {
      href: learnerHref("/practice", signedIn),
      label: labels.practice,
      icon: "practice",
    },
    {
      href: learnerHref("/dashboard", signedIn),
      label: labels.today,
      icon: "today",
    },
    {
      href: learnerHref("/full-mock", signedIn),
      label: labels.mockTests,
      icon: "practice",
    },
  ];
}

export function getLearnerSecondaryNavigation(
  locale: InterfaceLanguage,
): readonly LearnerNavItem[] {
  const vi = locale === "vi";
  return [
    { href: "/blog", label: vi ? "Kiến thức" : "Guides" },
    { href: "/ranking", label: vi ? "Xếp hạng" : "Ranking" },
    {
      href: "/support",
      label: vi ? "Trợ giúp & phản hồi" : "Support & feedback",
    },
  ];
}

export function matchesLearnerRoute(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`) || (href === "/full-mock" && (path === "/demo-test" || path.startsWith("/demo-test/")));
}
