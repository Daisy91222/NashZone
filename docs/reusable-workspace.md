# Reusable Workspace v1

The original Nashville demo remains at `/`. The independent workspace is at
`/workspace/`. Neither the new engine nor its example imports Nashville data.

## Implemented

- `core/project.mjs`: project validation, reviewed rule selection, polygon clipping,
  exclusions, multiple frontage half-planes and connected top-plate thresholds.
- `core/example.mjs`: an independent synthetic fixture with draft assumptions.
- `app/workspace/`: JSON project editing/import/export, plain-text source import,
  rule review, scenario calculation, height-slice plan, local save and JSON memo.
- The complete exported project carries sources, priorities, references, geometry,
  limitations, scenarios and inputs. Memo export adds results and review checklist.

## Contract

Use `core/example.mjs` or export a new study to obtain a complete example.
`schemaVersion` is 1. Coordinates and linear rules use `units` (`ft` or `m`);
area thresholds use its square. Coordinates must already be projected to a local
Cartesian plane, not longitude/latitude. Parcel and exclusions are closed rings.
Frontages have unique IDs, a two-point line and an explicit inward-side point.
Each scenario selects one or more frontage IDs; all selected half-planes intersect.

Exactly one active, reviewed rule is needed for each of `baseHeight`,
`retreatPerFloor`, and `offset`. Every rule requires a source ID and specific
reference. Priorities organize sources but do not silently settle applicability
or conflicts. Imported/edited projects require renewed review. FAR exemptions and
bonus remain separate future rule categories, never implied by geometry results.

Height is baseline plus added retreat steps times floor height. Steps are not a
count of total building floors. The largest connected polygon is tested at each
height; areas of disconnected pieces are not added. The first failing level is
retained for auditing. No maximum total floor area or profitability is computed.

## Limits And Next Steps

This is a developer-facing foundation, not an automated legal consultation system.
Parcel ID is metadata, not a connected GIS lookup. Sources can be imported as
UTF-8 text/Markdown; PDF parsing and LLM extraction are not connected. Source dates,
legal applicability and geometric validity need professional review. Use simple,
non-self-intersecting rings; automated topology validation and survey/GIS adapters
are next steps. All configured constraints are linear frontage retreat planes;
other regulation types require additional explicit rule evaluators.

Browser storage is a convenience, not secure storage or durable backup. Export
JSON for transfer. Draft content is local; no server or AI API receives uploads.
Memo exports are JSON review records, not formatted official submission documents.

Next: add topology validation and GIS adapter; PDF evidence extraction with exact
page links; structured rule editor and conflict review; jurisdiction adapters;
3D rendering from the same results; then benchmark reviewed examples before
claiming accuracy or efficiency improvements.
