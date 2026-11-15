# Single Step Forward — Quick-Pass Review Notes

Date: November 15, 2026. Source: supplied `SSF-11-15-26 large update.zip`. **This is a review-only package; not deployed.**

## What changed
- Added eleven clean-path static pages: `/support/`, `/support-the-project/`, `/privacy-policy/`, `/terms-of-service/`, `/learn/`, and six `/learn/.../` topics. Requested no-slash versions should redirect to these directory paths on GitHub Pages.
- Updated existing root `404.html` with Dawn, emergency bar, help links, and contextual broken-link mailto.
- Added footer links across all existing pages, donation-info affordance on homepage, learning hub cross-link on existing `learn.html`.
- Enabled contextual `Report an issue` mailto on rendered resource cards, and added a compose-email action to the existing local suggestion-note tool.
- Patched Calm View native select option contrast and portrait backplate; added a prefers-reduced-motion style.
- Reused the existing **`assets/support-the-project-large.webp`** and **`assets/support-the-project-small.webp`**, retaining file names.
- Updated `sitemap.xml` with 11 clean page routes. Resource records and source-check dates were not changed.

## Critical outstanding items before publish
1. **No verified Ko-fi URL** was supplied or found in the archive. Monetary support page explicitly says contributions are not enabled. Never replace this with a guessed URL. When ready, independently verify account ownership, platform/processing fee settings, recipient disclosure, and refunds before linking.
2. Legal policy pages are **initial drafts**, not counsel-reviewed terms. Compare their statements against the actual deployed site, Cloudflare account settings, inbox retention, and payment operator before using them for payments or formal organization operations.
3. The build keeps existing site translations, but newly added educational pages are English-only. Do not advertise them as translated.
4. Test requested paths on **GitHub Pages**. Directory index routing normally redirects `/support` → `/support/`; the final canonical uses the slash. A local Python static server will not emulate GitHub Pages' custom 404 behavior.
5. Exercise 404 URL and HTTP status on GitHub Pages or a compatible preview after deployment (not via a normal file-server 404).
6. Confirm outgoing replies use an existing private inbox; Cloudflare Email Routing does not provide domain-branded outbound email.
7. No externally transmitted forms, AI processing, inbox filters, or automated publishing were introduced.
8. Preserve source dates until genuine reviews occur. Content on the learning pages is a first pass with linked sources, not professional certification or clinical instruction.

## Release and rollback
1. Upload site files to a **review branch** or inspect locally; never publish without explicit approval.
2. Compare output with initial archive, especially scripts and `review-sheets/`.
3. Run `node scripts/import-city-review-sheets.js` (only if intentionally rebuilding; importer may rewrite generated data), `node scripts/validate-data.js`, and `node scripts/audit-resources.js --offline`.
4. Test homepage, ZIP discovery, the guide selector, Dawn, both email links, emergency routes, resource cards, Calm View native select on Windows Chrome, mobile display, nested pages, direct URL and refresh, and the missing-page response on GitHub Pages.
5. Rollback by redeploying the original source archive/commit. No DNS or database migrations are involved.
