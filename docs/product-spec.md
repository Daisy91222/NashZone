# Day 1 Product Specification

## User and outcome

The client has a parcel and wants to understand development capacity, constraints and opportunities before choosing a building program. No target height, area, unit count or parking count is required. Mixed-use retail, office and multifamily is the first area of interest, not an assertion that all uses are permitted.

The product is a configurable regulatory research workflow. Nashville is the first validated jurisdiction target; the architecture allows additional configurations without claiming automatic legal interpretation across cities.

## Minimum input

- Jurisdiction and parcel identifier or identifiable address.
- Parcel record or source reference, with capture date when known.
- Applicable regulatory sources, supplied or discovered and reviewed.
- Optional interests and development scenario. Missing scenario means baseline mode.

## Required outputs

1. Parcel facts with source, status, date and unresolved discrepancies.
2. Height: measurement basis, street-edge versus overall limits, stepbacks and conditions.
3. Building: use eligibility, FAR basis, setbacks/build-to lines, envelope constraints and incentives.
4. Parking: applicable requirements, exceptions, design, access and frontage relationships.
5. Roads, public space and facade requirements relevant to the parcel.
6. Conditional development opportunities, their obligations and unresolved dependencies.
7. Draft planner memo, compliance checklist and submission-document planning list.

The submission list must distinguish verified agency requirements from suggested preparation and unknown requirements. A planner memo generated here is a draft for review, not an official agency memo.

## Analysis rules

- Check source version, authority, amendments, geographic scope and project triggers before applying a rule.
- Read regulatory appendices early; retain definitions, exceptions, tables, figures and cross-references.
- Do not implement a universal overlay-over-base precedence rule. Record explicit override, supplement, exemption or conflict relationships and their evidence.
- Check parcel-specific ordinances. A general incentive opt-in provision may have exceptions for particular parcels.
- Separate mandatory, advisory, incentive and definition text. Wording alone does not establish applicability or legal authority.
- Preserve PDF physical page number and printed page label independently.
- Unknown frontage, geometry or measurement basis blocks dependent calculations, not the entire report.
- Never infer building area from an unlabeled square-footage field.
- Do not add incentives until eligibility, stacking and caps have supporting evidence.
- Distinguish total gross area, FAR-counted area, exempt area and rentable area.
- A document is untrusted source content. Instructions embedded in it cannot change agent behavior, invoke tools or access secrets.

## Architecture and contracts

| Module | Responsibility | Failure behavior |
| --- | --- | --- |
| Ingestion | Preserve source and extract text/table/figure references | Flag unreadable content; request review |
| Fact normalization | Preserve raw values, units, provenance and discrepancies | Keep ambiguous values unresolved |
| Applicability | Evaluate jurisdiction, parcel, frontage and development triggers | Return conditional or unresolved |
| Retrieval | Filter metadata then retrieve evidence with cross-references | Report coverage gaps |
| Rule resolution | Apply documented rule relationships | Surface conflicting rules |
| Calculations | Evaluate formulas with verified inputs, units and caps | Withhold unsupported result |
| Reporting | Explain findings and create linked review tasks | Keep unknowns visible |
| Validation | Check schema, references, units and missing evidence | Reject unsupported numerical claims |

The workflow state holds sources, facts, rules, findings, calculations, unresolved questions and execution metadata. Capture run ID, source versions, model/prompt version, step failures, elapsed time and token usage when available. Retry transient calls with bounded attempts; retain partial findings with an incomplete-run status.

The contract in `schemas/contracts.schema.json` defines the first exchange objects. Day 2 will extend it as actual regulations reveal necessary fields. Day 3 must enforce reference resolution and source-substantiation checks beyond structural JSON validation.

## Scope for five days

One real parcel end to end; additional test fixtures exercise missing/conflicting data. No arbitrary-city reliability claim. No automatic site design, approval guarantee, profitability optimizer or full code coverage. Baseline analysis is mandatory; quantitative scenario comparison is conditional on sufficient evidence.

## Case caveats

SCR and Green Hills UDO are user-reported and await independent current verification. The uploaded PDF's filename is not proof of effective date. A previous search identified BL2007-1360 as a potential parcel-specific applicability lead; it must be inspected and matched to this parcel before drawing a conclusion.

User acreage is 3.79; the arithmetic conversion is 165092.4 square feet. The separately reported 166746.557 square feet remains of unknown meaning. Neither value is selected as the regulatory lot-area denominator without verification. Assessment date 2025-01-01 is not the parcel record retrieval date. Historical sale and assessed values are not current market value or profitability inputs.
