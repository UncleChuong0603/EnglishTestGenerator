# Premium pricing and 30-day trial — 27 October 2026

## Public market references

Prices checked on official product pages on 27 October 2026. These are advertised prices, not verified transaction prices; feature sets differ.

| Product | Monthly | 90 days / three months | Annual | Source |
| --- | ---: | ---: | ---: | --- |
| mobiEdu TOEIC | 60,000 VND | 150,000 VND | 500,000 VND | https://mobiedu.vn/khoa-hoc/chuong-trinh-on-luyen-toeic-2271 |
| ToeicPrep | 79,000 VND | 159,000 VND | Not listed on the checked page | https://toeicprep.com.vn/pricing |
| TOEIC Exam | 99,000 VND | 249,000 VND | 599,000 VND | https://toeicexamstore.com/premium |

mobiEdu advertises a seven-day first-registration trial. STUDY4 advertises its more extensive Complete TOEIC course at 1,050,000 VND on https://study4.com/courses/28/complete-toeic/register/; that is a course purchase and should not be compared as a monthly practice subscription. Some fetched pages can reflect cached offers.

## TOEIC GYM decision

| Fixed access duration | Previous production price | New price | Reduction |
| --- | ---: | ---: | ---: |
| 30 days | 59,000 VND | 29,000 VND | 50.8% |
| 90 days | 139,000 VND | 69,000 VND | 50.4% |
| 365 days | 399,000 VND | 199,000 VND | 50.1% |

This is an acquisition pricing hypothesis: a low entry price and a 90-day package suit a focused exam preparation period. The annual package supports continuing practice. The new monthly price is about 52–71% below the three monthly references above; this is not a claim that TOEIC GYM is the cheapest product or offers identical content. There is no margin or conversion evidence yet. Review trial activation, return visits, trial-to-paid conversion, revenue and serving cost after the first trial cohort has completed its 30 days.

Prices remain server environment configuration (`PREMIUM_30_PRICE_VND`, `PREMIUM_90_PRICE_VND`, `PREMIUM_365_PRICE_VND`). `.env.example` documents the new values. Missing/invalid prices or incomplete payment credentials still disable checkout. Existing orders keep their recorded amounts.

## Trial policy

- One self-activated trial per account, lasting exactly 30 × 24 hours from activation.
- Available immediately after email verification; no learning-day or answer-count prerequisite.
- Account must be active, not deleted, not an administrator, and have neither existing Premium access nor an unexpired pending checkout.
- Activation remains explicit. No payment card, automatic renewal or automatic charge.
- Lifetime trial uniqueness and the per-user transaction lock prevent duplicate grants. Expired/revoked trials cannot restart.
- At expiry, Free limits resume unless another Premium membership is active; learning records remain intact.
- The previous removal of learner promotional/manual memberships is retained. Those grants are not restored; eligible learners may choose the new trial.
- Production had no existing `TRIAL` memberships when inspected, so no existing trial duration migration is necessary.

## Deployment and verification

Deployed to `toeicgym.net` on 27 October 2026. Updated the active runtime environment and Dokploy's stored Compose environment with the three new prices. The source, previous runtime configuration and image reference were backed up under `/opt/toeicgym/backups/premium-pricing-20261027T150315Z` before deployment.

TypeScript, focused ESLint checks and 34 relevant tests passed. Live browser checks covered guest pricing, eligible-account billing/dashboard, and active-trial pricing/billing in Vietnamese and English at 375, 768, 1024 and 1440px, including keyboard focus and horizontal overflow. Screenshots are in `.tmp/premium-pricing/screenshots/`. A temporary verified QA account with no learning history activated exactly one trial; PostgreSQL confirmed a 30-day duration and the API returned active Premium with unlimited practice. The QA account, session and trial were removed after verification. Production health passed.
