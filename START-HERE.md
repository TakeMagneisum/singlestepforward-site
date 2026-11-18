# Single Step Forward — researched guide package

Source check: November 18, 2026. Status: **source-checked guide drafts; local review pending**.

## Open first

Extract the ZIP, then open **OPEN-GUIDES.html** in a browser. Choose a location and press “Open selected guide.” All guide text is included locally; external service pages need internet access. The browser document is a review aid, not a deployed website.

Each location also has a readable Markdown guide in `guides/` and a matching ten-column CSV in `review-sheets/pending/`. `ALL-GUIDES.md` contains the full collection. Use `location-index.csv` to locate files.

## What is finished

- 41 populated guides: Chicago refresh, suburban Cook County, 32 London boroughs plus the City of London, and Auckland, Christchurch, Wellington, Hamilton, Tauranga and Dunedin metropolitan research areas.
- 1,181 resource placements, backed by 250 distinct source pages. These are not 1,181 different organisations: national and regional routes are intentionally reused.
- Every guide has a source-checked navigation route in each of the 16 coverage categories. The 656 checklist cells identify the actual resources used. Coverage means at least one relevant route, not a complete inventory of every local service.
- Entries explain the practical next step and actual service area. Narrower local services are distinguished from regional or national routes.
- Chicago’s earlier sheet is retained unchanged in `reference/`; refreshed entries, replacements and exclusions are documented separately.
- No reviewer names, confirmations or review dates have been invented. The five reviewer columns remain empty.

## What “source-checked” means

The source content was retrieved and reviewed for the named service or navigation route. Most evidence comes from government, public authority or provider pages. Healthpoint is a provider directory, and other named directories are used as referral routes, not as guarantees about every listed service. Source types and retrieval methods are recorded in `source-registry.json`.

Checks establish a usable starting point. They do not establish an available shelter bed, an open funding allocation, a clinical appointment, individual eligibility, or a guaranteed response. No providers were called or emailed. Phone numbers were not automatically copied from older sheets; a blank phone field means to use the verified linked contact route.

## Remaining review before publication

1. Ask a local reviewer to confirm catchments, intake options, accessible contact routes and important omissions in the matching CSV. They should check practical access rather than disclose anyone’s case details.
2. Recheck time-sensitive application windows, hours, numbers and funding availability close to publication. Read `RESEARCH-NOTES.md` for exceptions found during this pass.
3. Integrate the country-aware guides only after review. Preserve location IDs and treat Chicago as a refresh of its existing edition. `generate` and `publish` remain false in the research plan.

The research drafting is finished at the navigation-guide level. Local operational review and website integration remain separate work. These guides are not exhaustive local service audits, and the checklist does not certify all needs are met.

## Geographic rules for integration

- **Chicago:** city limits. **Suburban Cook County:** Cook County outside Chicago; not the entire Chicago metropolitan region. Provider and township restrictions still apply.
- **Greater London:** 33 separate authorities, including City of London. Use `GB` as the country code and explain that these guides cover England/London; do not imply coverage of Scotland, Wales or Northern Ireland.
- **New Zealand:** six Stats NZ 2026 metropolitan functional urban research areas. These are discovery labels, not verified address-to-provider eligibility polygons. The recorded FUA codes are retained in the plan. No automatic postcode, council or service-boundary crosswalk has been generated. Wellington-related entries name their real Wellington/Hutt/Porirua or regional coverage; listing a wider provider does not redefine the metro boundary.
- A future country menu must change emergency guidance and location input appropriately. Never display US-only crisis guidance as universal. Do not apply the US five-digit ZIP validation to UK or NZ addresses.

## Package files

| File | Purpose |
|---|---|
| `OPEN-GUIDES.html` | Browser-readable guide collection and location selector |
| `guides/*.md` | 41 individual readable guides |
| `review-sheets/pending/*.csv` | 41 matching reviewer sheets, existing ten-column format |
| `research-ledger.json` | Row IDs, categories, scopes, source IDs and next steps |
| `source-registry.json` | Deduplicated source titles, URLs, dates and retrieval notes |
| `research-checklist.csv` | 16 coverage categories for every location |
| `location-plan.json` | Stable IDs, geographic notes and pending publication status |
| `location-index.csv` | File index and counts |
| `RESEARCH-NOTES.md` | Specific source limitations and replacement decisions |
| `chicago-refresh-audit.csv` | Treatment of each historical Chicago entry |
| `validate-guides.py` | Offline structure, coverage and consistency checks |
| `validation-report.json` | Result of those checks; not a clinical or legal certification |
| `reference/` | Original Chicago sheet and supplied geographic source metadata |

Run `python validate-guides.py` from the extracted package to check its structure. The validator does not re-fetch websites or replace human source review.
