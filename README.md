# Single Step Forward

A two-page, privacy-first community resource prototype with ten selectable local editions: Liberty County, Georgia; Dallas County, Texas; Wake County, North Carolina; Volusia County, Florida; Denver County, Colorado; El Paso County, Colorado; Plymouth County, Massachusetts; Erie County, New York; Madison County, New York; and Plainfield, Illinois.

## What is included

- index.html — brand, mission, operating standards, and resource-suggestion flow
- find-help.html — working next-step guide and filterable local resource directory
- assets/resources.js — the source-checked Liberty, Dallas, Wake, and Volusia County resource datasets and ten-edition registry
- assets/colorado-resources.js — the source-checked Colorado statewide, Denver County, and El Paso County resource datasets
- assets/massachusetts-resources.js — the source-checked Massachusetts statewide and Plymouth County resource dataset
- assets/new-york-resources.js — the source-checked New York statewide, Erie County, and Madison County resource datasets
- assets/illinois-resources.js — the source-checked Illinois statewide and Plainfield resource dataset, with Will/Kendall County boundaries labeled in the next steps
- assets/area.js — local-edition selection, saved preference, dynamic labels, and area-aware links
- assets/urgent.js — fixed urgent-language routing rules shared by the directory and validation suite
- assets/guide.js — private, deterministic client-side matching
- assets/site.js — local suggestion-note generator
- scripts/validate-data.js — deploy-time checks for IDs, routing targets, HTTPS URLs, phones, dates, selectors, categories, reviewer sheets, and 100+ urgent-language cases
- scripts/export-review-sheets.js — creates one reviewer-friendly CSV for each local edition
- review-sheets/ — per-edition worksheets with “still correct?”, correction, and missing-resource columns for local reviewers
- CNAME — custom-domain configuration for singlestepforward.com
- .nojekyll — tells GitHub Pages to serve the static files directly

No build step, database, account, analytics service, or API key is required. The selected local edition is remembered in the visitor's browser; search text is not sent or saved.

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

Edit the appropriate local array in assets/resources.js, assets/colorado-resources.js, assets/massachusetts-resources.js, assets/new-york-resources.js, or assets/illinois-resources.js. Each listing includes categories, search keywords, source type, scope, summary, direct next step, official URL, and optional phone/address.

Re-check time-sensitive information regularly and update both:

- the edition's `reviewed` value in `window.SSF_RESOURCE_AREAS`
- the linked source, phone, scope, and next-step language for every changed listing

The selector uses `?area=liberty`, `?area=dallas`, `?area=wake`, `?area=volusia`, `?area=denver`, `?area=elpaso`, `?area=plymouth`, `?area=erie`, `?area=madison`, and `?area=plainfield`, remembers the last edition in the visitor's browser, and carries the selection between the landing page and directory.

Before packaging or publishing, run:

```sh
node scripts/export-review-sheets.js
node scripts/validate-data.js
```

“Source checked” means the link, phone, service area, and basic purpose were compared with an official or provider source on the listed date. It is not the same as local reviewer confirmation. Keep the public pilot note visible until a named local reviewer has completed the matching CSV sheet; do not imply a current opening, appointment, bed, funding, or eligibility guarantee.

## Adding a real AI assistant later

The current guide is intentionally deterministic and stays in the visitor’s browser. A future AI service should be called only through a secure server-side endpoint. Never place an API key in this static repository, and preserve the fixed 911/988 routing outside the AI layer.
