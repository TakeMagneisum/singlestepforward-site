# Single Step Forward

A two-page, privacy-first community resource prototype with selectable local editions for Liberty County, Georgia; Dallas County, Texas; Wake County, North Carolina; and Volusia County, Florida.

## What is included

- index.html — brand, mission, operating standards, and resource-suggestion flow
- find-help.html — working next-step guide and filterable local resource directory
- assets/resources.js — the checked Liberty, Dallas, Wake, and Volusia County resource datasets
- assets/area.js — local-edition selection, saved preference, dynamic labels, and area-aware links
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

Edit the appropriate county array in assets/resources.js. Each listing includes categories, search keywords, source type, scope, summary, direct next step, official URL, and optional phone/address.

Re-check time-sensitive information regularly and update both:

- the edition's `reviewed` value in `window.SSF_RESOURCE_AREAS`
- the linked source, phone, scope, and next-step language for every changed listing

The selector uses `?area=liberty`, `?area=dallas`, `?area=wake`, and `?area=volusia`, remembers the last edition in the visitor's browser, and carries the selection between the landing page and directory.

## Adding a real AI assistant later

The current guide is intentionally deterministic and stays in the visitor’s browser. A future AI service should be called only through a secure server-side endpoint. Never place an API key in this static repository, and preserve the fixed 911/988 routing outside the AI layer.
