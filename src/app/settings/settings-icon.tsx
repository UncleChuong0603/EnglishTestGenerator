type SettingsIconName =
  | "profile"
  | "goal"
  | "language"
  | "email"
  | "security"
  | "privacy"
  | "data"
  | "plan"
  | "chevron"
  | "back"
  | "check"
  | "download";

const paths: Record<SettingsIconName, React.ReactNode> = {
  profile: <><circle cx="12" cy="8" r="3.25" /><path d="M5.5 19c.7-3.4 3-5.25 6.5-5.25s5.8 1.85 6.5 5.25" /></>,
  goal: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.25" /><path d="m15.25 8.75 4.5-4.5M16.25 4.25h3.5v3.5" /></>,
  language: <><path d="M4 5h10M9 3v2c0 5-2.25 8.25-6 10.25M6 9.5c1.5 2.25 3.5 3.9 6 5" /><path d="m13 19 3.25-8 3.25 8M14.2 16h4.1" /></>,
  email: <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m5 7 7 5 7-5" /></>,
  security: <><path d="M6.5 10V7.75a5.5 5.5 0 0 1 11 0V10" /><rect x="4.5" y="10" width="15" height="10" rx="2.5" /><path d="M12 14v2.5" /></>,
  privacy: <><path d="M12 3.5 19 6v5.25c0 4.5-2.9 7.6-7 9.25-4.1-1.65-7-4.75-7-9.25V6Z" /><path d="m9 12 2 2 4-4" /></>,
  data: <><ellipse cx="12" cy="6" rx="7.5" ry="3" /><path d="M4.5 6v6c0 1.65 3.35 3 7.5 3s7.5-1.35 7.5-3V6M4.5 12v6c0 1.65 3.35 3 7.5 3s7.5-1.35 7.5-3v-6" /></>,
  plan: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  chevron: <path d="m9 5 7 7-7 7" />,
  back: <><path d="m15 18-6-6 6-6" /><path d="M9 12h10" /></>,
  check: <path d="m5 12 4 4 10-10" />,
  download: <><path d="M12 3v12m-4-4 4 4 4-4" /><path d="M5 20h14" /></>,
};

export function SettingsIcon({
  className = "size-5",
  name,
}: {
  className?: string;
  name: SettingsIconName;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}
