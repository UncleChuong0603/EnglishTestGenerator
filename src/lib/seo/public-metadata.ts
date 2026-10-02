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
  const titleIncludesBrand = /\bTOEIC\s*GYM\b/i.test(title);
  const shareTitle = socialTitle ?? (titleIncludesBrand ? title : `${title} | TOEIC GYM`);
  const shareDescription = socialDescription ?? description;
  return {
    title: titleIncludesBrand ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      title: shareTitle,
      description: shareDescription,
      type: "website",
      siteName: "TOEIC GYM",
      locale: "vi_VN",
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
