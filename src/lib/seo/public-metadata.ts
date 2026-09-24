import type { Metadata } from "next";

type PublicPageMetadata = {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  socialTitle?: string;
  socialDescription?: string;
};

export function publicPageMetadata({
  title,
  description,
  canonical,
  image = "/brand/toeic-gym-social.png",
  socialTitle,
  socialDescription,
}: PublicPageMetadata): Metadata {
  const shareTitle = socialTitle ?? `${title} | TOEIC GYM`;
  const shareDescription = socialDescription ?? description;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: shareTitle,
      description: shareDescription,
      type: "website",
      siteName: "TOEIC GYM",
      url: canonical,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: shareDescription,
      images: [image],
    },
  };
}
