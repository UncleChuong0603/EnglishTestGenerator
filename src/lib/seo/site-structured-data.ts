import { getSiteUrl } from "./site-url";

const FACEBOOK_PAGE = "https://www.facebook.com/profile.php?id=61594521208737";
const FACEBOOK_GROUP = "https://www.facebook.com/groups/1632623558419538";

export function toeicGymOrganizationStructuredData(base = getSiteUrl()) {
  return {
    "@type": "Organization",
    "@id": `${base}#organization`,
    name: "TOEIC GYM",
    alternateName: "TOEICGym",
    url: base,
    logo: `${base}/brand/toeic-gym-logo.png`,
    sameAs: [FACEBOOK_PAGE, FACEBOOK_GROUP],
  };
}

export { FACEBOOK_PAGE, FACEBOOK_GROUP };
