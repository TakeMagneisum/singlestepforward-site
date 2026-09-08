# Single Step Forward

A two-page, privacy-first community resource prototype for Liberty County, Georgia.

## What is included

- index.html — brand, mission, operating standards, and resource-suggestion flow
- find-help.html — working next-step guide and filterable local resource directory
- assets/resources.js — the checked resource dataset
- assets/guide.js — private, client-side matching and urgent-language routing
- assets/site.js — local suggestion-note generator
- CNAME — custom-domain configuration for singlestepforward.com
- .nojekyll — tells GitHub Pages to serve the static files directly

No build step, database, account, analytics service, or API key is required.

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

Edit the objects in assets/resources.js. Each listing includes categories, search keywords, source type, scope, summary, direct next step, official URL, and optional phone/address.

Re-check time-sensitive information regularly and update both:

- window.SSF_RESOURCE_VERSION in assets/resources.js
- the review date in the two HTML footers

## Adding a real AI assistant later

The current guide is intentionally deterministic and stays in the visitor’s browser. A future AI service should be called only through a secure server-side endpoint. Never place an API key in this static repository, and preserve the fixed 911/988 routing outside the AI layer.
