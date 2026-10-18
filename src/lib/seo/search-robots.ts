import type { Metadata } from "next";

/**
 * Keep public pages eligible for the richest snippet Google can generate.
 * Page-level noindex metadata still overrides this default for account,
 * session, and other non-search surfaces.
 */
export const INDEXABLE_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

