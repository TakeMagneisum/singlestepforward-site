# Single Step Forward

Single Step Forward is a privacy-first, static navigation guide for discovering possible forms of help, preparing local searches, and opening source-checked local directories. The site also includes a dedicated accessibility-and-inclusion learning page with links to government, standards, disability-led, and established nonprofit sources.

A privacy-first awareness and navigation prototype that offers useful starting points for any five-digit U.S. ZIP code, plus 65 selectable, source-checked local guides. The international pilot includes Santiago, Greater Valparaíso, and Greater Concepción in Chile. Puerto Rico is treated as its own service jurisdiction with guides for San Juan, Bayamón, Carolina, and Ponce, while 58 continental U.S. editions—including Lewis and Clark, Yellowstone, and Missoula Counties in Montana—remain available.

Single Step Forward helps visitors discover forms of assistance they may not know exist, learn useful service terminology, and reach a practical next step. The universal discovery layer provides educational guidance, established national starting points, 211, and prepared local web searches. Reviewed local guides add researched organizations, direct links, phone numbers, service notes, and visible source-check dates.

## What is included

- index.html — nationwide awareness message, ZIP entry, operating standards, sharing, and resource-suggestion flow
- discover.html — universal ZIP-based education, official starting points, and prepared local searches
- find-help.html — working next-step guide and filterable reviewed local directory
- learn.html — accessibility, respectful-language, learning-disability, Down syndrome, neurodiversity, school-advocacy, and workplace-accommodation learning hub
- assets/discovery-data.js — universal discovery topics, category-icon paths, search templates, official starting points, and the reviewed-area ZIP snapshot
- assets/discovery.js — ZIP validation, local-guide suggestions, prepared-search generation, and deliberate share/copy behavior
- assets/calm.js — persistent low-stimulus mode; styles.css keeps the Calm View palette consistent while preserving distinct emergency and crisis colors
- assets/resources.js — the source-checked Liberty, Dallas, Wake, and Volusia County resource datasets and 65-edition international registry
- assets/colorado-resources.js — the source-checked Colorado statewide, Denver County, and El Paso County resource datasets
- assets/massachusetts-resources.js — the source-checked Massachusetts statewide and Plymouth County resource dataset
- assets/new-york-resources.js — the source-checked New York statewide, Erie County, and Madison County resource datasets
- assets/illinois-resources.js — the source-checked Illinois statewide and Plainfield resource dataset, with Will/Kendall County boundaries labeled in the next steps
- assets/city-resources.js — generated browser-ready datasets for editions marked `"generate": true` in the location manifest
- assets/area.js — country-filtered select-then-open guide controls, saved deliberate country and guide preferences, country-aware emergency links, and dynamic guide labels
- assets/i18n.js — local English/Spanish interface translation and deliberate language preference; no third-party translation request is made
- assets/calm.js — persistent low-stimulus Calm View with critical emergency routes kept visible
- assets/icon-*.webp — twelve topic pictograms and eight compact functional symbols used as visual recognition cues
- assets/dawn-full.png and assets/dawn-portait.png — production-size Dawn artwork for the main illustration and guide avatar
- assets/dawn-full.webp and assets/dawn-portait.webp — lightweight Dawn variants for small decorative placements
- assets/urgent.js — fixed urgent-language routing rules shared by the directory and validation suite
- assets/guide.js — private, deterministic client-side matching
- assets/site.js — local suggestion-note generator
- scripts/validate-data.js — deploy-time checks for IDs, routing targets, HTTPS URLs, phones, dates, selectors, categories, reviewer sheets, Calm View, and 140+ English/Spanish urgent-language cases
- scripts/audit-resources.js — non-destructive source-date and link triage; bot-blocked pages are reported for human review and are never removed automatically
- scripts/export-review-sheets.js — creates one reviewer-friendly CSV for each local edition
- scripts/import-city-review-sheets.js — verifies every reviewer CSV against the manifest and converts maintained CSV editions into browser-ready directory data
- scripts/create-montana-review-sheets.js — documents the shared Montana research layer and recreates the three 36-row county reviewer sheets
- review-sheets/locations.json — versioned manifest for every live edition, its reviewer sheet, jurisdiction type, state, source-check date, and production-data mode
- review-sheets/ — per-edition worksheets with “still correct?”, correction, and missing-resource columns for local reviewers
- .github/workflows/resource-audit.yml — scheduled 1st-and-15th validation, freshness, and dead-link report
- CNAME — custom-domain configuration for singlestepforward.com
- .nojekyll — tells GitHub Pages to serve the static files directly

No build step, database, account, analytics service, external ZIP API, translation API, or API key is required. Deliberate country, guide, and interface-language selections are remembered in the visitor's browser; geolocation is not used. U.S. ZIP discovery remains a separate U.S.-only tool. Search text entered into Dawn is not sent or saved.

## Preview locally

Open index.html directly, or serve this folder with any simple static server.

## Publish with GitHub Pages

1. Create a GitHub repository.
2. Upload the contents of this folder to the repository root.
3. In Settings → Pages, choose Deploy from a branch.
4. Select main and / (root), then save.
5. Point the domain’s DNS records to GitHub Pages and verify the custom domain in GitHub.

If you are not ready to use singlestepforward.com, remove the CNAME file before publishing.

## Updating the directory

The reviewer CSV is the human-facing review record. Every live edition must also have exactly one entry in `review-sheets/locations.json`; validation fails when a CSV, manifest entry, or live guide is missing from either of the other two layers. For editions marked `"generate": true`, edit the matching CSV and run `node scripts/import-city-review-sheets.js` to regenerate `assets/city-resources.js`. The ten earlier editions remain in their established resource modules during the gradual migration, which protects their hand-tuned IDs and urgent-routing targets.

When adding a generated edition, add its CSV and manifest entry together. Give it a stable lowercase ID, unique uppercase constant, jurisdiction type, two-letter state code, ISO source-check date, and `"generate": true`. The importer discovers all `*-review.csv` files automatically and refuses to continue if any sheet is unregistered.

Re-check time-sensitive information regularly and update both:

- the edition's `reviewed` value in `window.SSF_RESOURCE_AREAS`
- the linked source, phone, scope, and next-step language for every changed listing

Each selector value matches an edition ID in `window.SSF_RESOURCE_AREAS`. The globe control filters guides among the United States, Puerto Rico, and Chile without geolocation. Choosing an item does not navigate unexpectedly: the visitor explicitly activates the adjacent Open guide button. The homepage begins in a neutral state; a guide is remembered only after the visitor deliberately opens it. The language selector translates site controls and common interface guidance locally; official organization names and source-linked material retain their authoritative wording.

## Updating universal discovery

Edit the discovery category array in assets/discovery-data.js to maintain the educational descriptions, icon path, prepared search template, and official or established national starting points. Every topic must have a unique lowercase ID, an existing transparent icon in `assets/`, a summary that avoids promising availability or eligibility, a query containing the ZIP placeholder, and at least one direct starting point. Urgent topics must keep established crisis services before open-ended web search.

Category icons are supporting cues, not replacements for text labels. Keep the 150×150 source assets proportional, render them at roughly 56–78 CSS pixels, preserve empty alternative text when the adjacent heading already names the topic, and do not force unrelated icons onto local-guide categories that lack an exact match.

The reviewed ZIP groups in assets/discovery-data.js are used only to suggest that a reviewed guide may cover the visitor's ZIP, including the four Puerto Rico municipal pilots. They do not make an eligibility or jurisdiction decision.

The reviewed-area ZIP snapshot was extended on November 9, 2026. New city mappings use active standard ZIPs associated with the primary postal city in the same zipcodes 3.0.0 dataset; they are not complete municipal boundary coverage. The original county mappings were generated at build time from the zipcodes 3.0.0 dataset; city, Puerto Rico municipal, and Chilean metro editions add associated ZIP or locality sets. The package is not a runtime dependency and is not shipped with the site.

Important limitation: ZIP codes are postal delivery constructs, not county boundaries. A ZIP can cross county or municipal lines, and a single primary county label can hide that overlap. The public interface therefore says a guide “may cover” a ZIP and tells visitors to confirm their county before relying on county-specific programs. Refresh this snapshot when reviewed areas change or when the postal dataset is updated.

Before packaging or publishing, run:

```sh
node scripts/import-city-review-sheets.js
node scripts/validate-data.js
node scripts/audit-resources.js --offline
```

The reviewer CSVs are the source of truth for generated city datasets. Run `scripts/export-review-sheets.js` only when intentionally rebuilding reviewer sheets from edited JavaScript data; it is not part of the routine publish path.

GitHub Actions also runs a live audit on the 1st and 15th of each month. HTTP 404 and 410 responses are flagged as likely broken; sign-in walls, bot blocks, and rate limits are separated for manual confirmation. The audit never changes or deletes directory data.

“Source checked” means the link, phone, service area, and basic purpose were compared with an official or provider source on the listed date. It is not the same as local reviewer confirmation. Keep the public pilot note visible until a named local reviewer has completed the matching CSV sheet; do not imply a current opening, appointment, bed, funding, or eligibility guarantee.

## Adding a real AI assistant later

The current guide is intentionally deterministic and stays in the visitor’s browser. A future AI service should be called only through a secure server-side endpoint. Never place an API key in this static repository, and preserve country-specific emergency routing outside the AI layer.

## November 9, 2026 integration

Added all 33 previously unregistered reviewer sheets: Albuquerque, Atlanta, Austin, Baltimore, Boston, Charlotte, Columbus, Detroit, Fresno, Indianapolis, Kansas City, Las Vegas, Long Beach, Louisville/Jefferson County, Memphis, Mesa, Miami, Milwaukee, Minneapolis, Nashville, Oakland, Oklahoma City, Omaha, Orlando, Portland, Sacramento, San Francisco, San Jose, Seattle, Tucson, Tulsa, Virginia Beach, Washington. The directory now has 65 editions. Each source-check date remains the date printed in its CSV; local reviewer confirmation remains pending. The duplicate Austin download was identical and is represented once.

New editions use `register: true` and explicit `routing_titles` in the location manifest. The importer generates their registry metadata as well as resource arrays, and fails if a route title is missing. The existing 32 editions retain their registry, IDs, routing, and dates. ZIP discovery, both guide selectors, the sitemap, and asset cache versions include the additions.

Known coverage limits: Omaha has no dedicated source-checked pet-help listing yet; its guide discloses this gap and points to universal discovery or 211. ZIPs 46280 and 46290 are associated with both Carmel and Indianapolis, so discovery offers both guides. The offline freshness audit flags the existing Liberty County edition (September 8, 2026) for a future source recheck; its date has not been reset.
