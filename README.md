# Single Step Forward

A privacy-first awareness and navigation prototype that offers useful starting points for any five-digit U.S. ZIP code, plus nineteen selectable, source-checked local guides. The reviewed editions cover Liberty County, Dallas County, Wake County, Volusia County, Denver County, El Paso County, Plymouth County, Erie County, Madison County, Plainfield, New York City, Chicago, Los Angeles, Philadelphia, Houston, Phoenix, San Diego, San Antonio, and Fort Worth.

Single Step Forward helps visitors discover forms of assistance they may not know exist, learn useful service terminology, and reach a practical next step. The universal discovery layer provides educational guidance, established national starting points, 211, and prepared local web searches. Reviewed local guides add researched organizations, direct links, phone numbers, service notes, and visible source-check dates.

## What is included

- index.html — nationwide awareness message, ZIP entry, operating standards, sharing, and resource-suggestion flow
- discover.html — universal ZIP-based education, official starting points, and prepared local searches
- find-help.html — working next-step guide and filterable reviewed local directory
- assets/discovery-data.js — universal discovery topics, category-icon paths, search templates, official starting points, and the reviewed-area ZIP snapshot
- assets/discovery.js — ZIP validation, local-guide suggestions, prepared-search generation, and deliberate share/copy behavior
- assets/resources.js — the source-checked Liberty, Dallas, Wake, and Volusia County resource datasets and nineteen-edition registry
- assets/colorado-resources.js — the source-checked Colorado statewide, Denver County, and El Paso County resource datasets
- assets/massachusetts-resources.js — the source-checked Massachusetts statewide and Plymouth County resource dataset
- assets/new-york-resources.js — the source-checked New York statewide, Erie County, and Madison County resource datasets
- assets/illinois-resources.js — the source-checked Illinois statewide and Plainfield resource dataset, with Will/Kendall County boundaries labeled in the next steps
- assets/city-resources.js — generated browser-ready datasets for the nine city editions added from reviewer CSVs
- assets/area.js — explicit select-then-open local-guide controls, saved deliberate guide preference, and dynamic guide labels
- assets/icon-*.webp — twelve topic pictograms and eight compact functional symbols used as visual recognition cues
- assets/dawn-full.png and assets/dawn-portait.png — production-size Dawn artwork for the main illustration and guide avatar
- assets/dawn-full.webp and assets/dawn-portait.webp — lightweight Dawn variants for small decorative placements
- assets/urgent.js — fixed urgent-language routing rules shared by the directory and validation suite
- assets/guide.js — private, deterministic client-side matching
- assets/site.js — local suggestion-note generator
- scripts/validate-data.js — deploy-time checks for IDs, routing targets, HTTPS URLs, phones, dates, selectors, categories, reviewer sheets, and 100+ urgent-language cases
- scripts/export-review-sheets.js — creates one reviewer-friendly CSV for each local edition
- scripts/import-city-review-sheets.js — converts the nine maintained city reviewer CSVs into browser-ready directory data
- review-sheets/ — per-edition worksheets with “still correct?”, correction, and missing-resource columns for local reviewers
- CNAME — custom-domain configuration for singlestepforward.com
- .nojekyll — tells GitHub Pages to serve the static files directly

No build step, database, account, analytics service, external ZIP API, or API key is required. The selected reviewed local guide is remembered in the visitor's browser. A ZIP entered for universal discovery is placed only in the page URL, is not saved by Single Step Forward, and is not sent to an outside service until the visitor deliberately opens an external search. Search text entered into Dawn is not sent or saved.

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

Edit the appropriate local array in assets/resources.js, assets/colorado-resources.js, assets/massachusetts-resources.js, assets/new-york-resources.js, or assets/illinois-resources.js. For the nine city editions, edit the matching file in review-sheets/ and run `node scripts/import-city-review-sheets.js` to regenerate assets/city-resources.js. Each listing includes categories, search keywords, source type, scope, summary, direct next step, official URL, and optional phone/address.

Re-check time-sensitive information regularly and update both:

- the edition's `reviewed` value in `window.SSF_RESOURCE_AREAS`
- the linked source, phone, scope, and next-step language for every changed listing

Each selector value matches an edition ID in `window.SSF_RESOURCE_AREAS`, including the nine new city IDs. Choosing an item does not navigate unexpectedly: the visitor explicitly activates the adjacent Open guide button. The homepage begins in a neutral state; a guide is remembered only after the visitor deliberately opens it.

## Updating universal discovery

Edit the discovery category array in assets/discovery-data.js to maintain the educational descriptions, icon path, prepared search template, and official or established national starting points. Every topic must have a unique lowercase ID, an existing transparent icon in `assets/`, a summary that avoids promising availability or eligibility, a query containing the ZIP placeholder, and at least one direct starting point. Urgent topics must keep established crisis services before open-ended web search.

Category icons are supporting cues, not replacements for text labels. Keep the 150×150 source assets proportional, render them at roughly 56–78 CSS pixels, preserve empty alternative text when the adjacent heading already names the topic, and do not force unrelated icons onto local-guide categories that lack an exact match.

The reviewed ZIP groups in assets/discovery-data.js are used only to suggest that a reviewed guide may cover the visitor's ZIP. They do not make an eligibility or jurisdiction decision.

The reviewed-area ZIP snapshot was refreshed on November 1, 2026. The original county mappings were generated at build time from the zipcodes 3.0.0 dataset; the new city editions add city-associated ZIP sets. The package is not a runtime dependency and is not shipped with the site.

Important limitation: ZIP codes are postal delivery constructs, not county boundaries. A ZIP can cross county or municipal lines, and a single primary county label can hide that overlap. The public interface therefore says a guide “may cover” a ZIP and tells visitors to confirm their county before relying on county-specific programs. Refresh this snapshot when reviewed areas change or when the postal dataset is updated.

Before packaging or publishing, run:

```sh
node scripts/import-city-review-sheets.js
node scripts/export-review-sheets.js
node scripts/validate-data.js
```

“Source checked” means the link, phone, service area, and basic purpose were compared with an official or provider source on the listed date. It is not the same as local reviewer confirmation. Keep the public pilot note visible until a named local reviewer has completed the matching CSV sheet; do not imply a current opening, appointment, bed, funding, or eligibility guarantee.

## Adding a real AI assistant later

The current guide is intentionally deterministic and stays in the visitor’s browser. A future AI service should be called only through a secure server-side endpoint. Never place an API key in this static repository, and preserve the fixed 911/988 routing outside the AI layer.
