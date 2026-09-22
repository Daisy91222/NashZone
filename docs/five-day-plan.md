# Five-Day Delivery Plan

Assumption: one developer, roughly 5-7 focused hours per day. Days are work sessions, not promises of calendar completion when source verification is blocked.

| Day | Work | Reviewable output | Exit condition |
| --- | --- | --- | --- |
| 1 | Scope, workflow, contracts, source inventory, sample facts | README, specification, sample JSON, report template and evaluation plan | Input validates; unknown facts and product boundaries explicit |
| 2 | Extract PDF appendix and definitions; inspect maps/tables; obtain base code and parcel-specific amendments | Evidence index and manually reviewed rule set | Each priority topic has cited rules or an explicit coverage gap |
| 3 | Implement retrieval, applicability, calculations and report validation | Runnable baseline pipeline and test results | Facts to findings to citations traceable; unsupported figures withheld |
| 4 | Build text-focused report interface and export | Parcel summary, height/building/parking tabs, evidence panel, memo and checklist | Client can navigate a finding to its source and unresolved dependencies |
| 5 | Evaluate, package, document and publish | Reproducible demo, sample report, measured evaluation, repository and Pages viewer | Clean-start run succeeds; Pages works without exposing credentials |

## Day 1 completed by these artifacts

- General product with Nashville as first case, not a hard-coded zoning tool.
- Baseline-first input; no invented development assumptions.
- Provenance, applicability and uncertainty contracts.
- Report and evaluation templates.

## Day 2 sequence

1. Verify current parcel zoning, UDO identity and relevant amendment history.
2. Inspect UDO appendix, applicability language, diagrams and incentive provisions.
3. Resolve the BL2007-1360 lead against parcel identity and geographic boundaries.
4. Retrieve SCR use and bulk rules plus referenced definitions and parking provisions.
5. Build a reviewed matrix for height, building, bonus and parking; record coverage gaps.

## Publication architecture

GitHub Pages hosts a static interactive case report and project documentation. A downloadable/local pipeline provides generation; a live API deployment is optional and separately configured. Static hosting must never contain model credentials. Link original public sources; check redistribution permission before committing uploaded source documents. Verify repository destination and visibility before publication.

## Remaining user materials

Already received: parcel table, code link, PDF, research workflow, preferred output categories and mixed-use interest. No need to repeat these or invent a development program.

Useful when available: parcel boundary/frontage map; record capture date; survey or plat identifying streets, easements and dimensions. These improve numerical conclusions but do not block baseline implementation. A past analysis sample is optional. Repository account/destination is needed for external publication, not local development.

## Contingencies

If current sources cannot be obtained, label snapshot dates and incomplete coverage. If source evidence is insufficient for capacity, publish a qualitative baseline with unresolved dependencies. If live backend deployment is unavailable, deliver the local generator and static sample viewer. Never substitute fabricated outputs for blocked work.
