# TOEIC GYM: 100-word vocabulary PDF — 2026-10-02

## Resource

The public topic collection now offers `/seo/toeic-100-tu-vung.pdf`, a printable A4 version of the 100 visible entries at `/toeic/tu-vung`. The PDF is generated from the rendered page so the downloadable terms, meanings and examples stay aligned with the HTML collection.

The HTML page links to the PDF with a descriptive download label. The printable output hides the topic navigation and follow-up CTA while keeping the learning content and attribution. It is intended as a shareable study resource, not a separate keyword landing page.

## Verification

- PDF header: `%PDF-1.4`.
- Local standalone server: PDF HTTP 200, `application/pdf`, 157,352 bytes.
- HTML route: HTTP 200, one H1, 100 term entries and the PDF link.
- Next build after adding the asset: pass, 89 routes.
- Smoke test now checks the PDF content type alongside the public listening assets.

The file is local until deployment. After release, verify `/seo/toeic-100-tu-vung.pdf` through the production smoke test and keep the PDF link canonical through the HTML collection page.
