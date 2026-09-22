# Day 2 Evidence Review

Research date: 2026-09-18. Status: source-grounded UDO rule seeds; incomplete current parcel entitlement analysis.

## Material findings

The enacted [Substitute BL2007-1360](https://legisarchive.nashville.gov/mc/ordinances/term_2003_2007/bl2007_1360.htm), Section 1, identifies 3821 Green Hills Village Drive, Map 117-14 Parcel 159, and applies all UDO provisions to this property. It became effective March 23, 2007. This is strong historical parcel-specific evidence; later changes remain to be checked. It prevents blindly applying the general incentive opt-in narrative on PDF page 13. It does not prove that every incentive is automatically earned.

Section 3 of that ordinance uses the wording "PUD plan" despite the ordinance addressing a UDO. Preserve this inconsistency and request the approved corrected plan and staff interpretation. Do not invent a PUD overlay or conclude the historical filing condition was unmet.

The [official community-plan page](https://www.nashville.gov/departments/planning/long-range-planning/community-plans/green-hills-midtown) currently links a [53-page UDO PDF](https://www.nashville.gov/sites/default/files/2025-10/11-GH-UDOupdated2015.pdf?ct=1759507806) with the same title and listed amendments as the uploaded document. Byte equivalence and completeness of subsequent amendments have not been established. Upload timestamp and filename are not effective dates.

## Evidence matrix

References below are to the uploaded PDF. Physical page and printed label are different in the appendix.

| Topic | Sections; physical / printed pages | Supported source reading | Parcel conclusion |
| --- | --- | --- | --- |
| Mixed use | A, B opening; 44 / 46 | Three revenue-producing uses; each multi-story building three uses; incentives require build-to compliance | User interest fits a candidate mix, but use permissions and actual program unresolved |
| Height | B.5; 44 / 46 | Build-to height 60 ft Hillsboro Pike, 48 ft named other streets/New Street | No final site height; Cleghorn and Green Hills Village not expressly listed in this table |
| Upper floors | C.2(c)(3); 47-48 / 49-50 | Entire extra-floor area must be bonus; each floor steps back 10 ft | No floor count or overall height without geometry and bonus interpretation |
| Shared parking bonus | B.1; 44 / 46 | Peak-space difference times 340 sf, with use/share qualifications | No area calculated without parking study |
| FAR exclusions | B.2, B.6, B.12; 44-46 / 46-48 | Principal-use garage, qualifying 50-ft-deep street-level space, residential area have distinct rules | Exempt floor area does not mean unlimited development |
| Plaza | B.7(a-b); 45 / 47 | 6:1 residential or 3:1 other; plaza/public-access conditions or contribution pathway | No selected plaza or bonus quantity |
| Transit | B.7(c); 45-46 / 47-48 | Formula presents parking reduction OR area bonus | Preserve and/or versus OR ambiguity; no double award |
| Build-to | C.1; 46-47 / 48-49 | Street-dependent ranges; 75% front wall; notice requirement | Need legal frontage, boundary and parcel-specific interpretation |
| Parking | B.8-9, D; 46,48-49 / 48,50-51 | Residential exemption and alternative mixed-use table are conditional | Current code, UZO status, use classification and rounding unresolved |
| Facade | F; 52 / 54 | Glazing, massing, roof/material and entrance conditions | Can list obligations; cannot certify design compliance |
| Landscape | G; 53 / 55 | Screening plus conditional buffer waivers | Boundaries and landscape context unresolved |
| Street works | B.10; 46 / 48 | Concept-plan street dedication incentive | No parcel dedication or construction obligation inferred solely from concept diagram |

## Extraction and review

Run `python scripts/build_evidence.py` with Poppler `pdftotext` on PATH. It creates a SHA-256-tagged 53-page index and 29 structured rule seeds under ignored `data/local/`. Seeds contain whole-page evidence to preserve context and are marked `extracted`, not professionally reviewed. They are a first retrieval set, not exhaustive code coverage. Applicability text and formula summaries require a later executable rule layer.

Visually checked physical pages 13, 14, 44-49, 52-53, including the alternative parking table. Printed labels on appendix pages are physical page + 2; no global offset is assumed. The boundary diagram is context, not a survey or current GIS determination. Signage and narrative streetscape details are not yet structured; all pages remain searchable in the local index.

## Coverage gaps and dependencies

| Gap | Why it matters | Next evidence |
| --- | --- | --- |
| Current parcel record | Historical ordinance does not establish today's zoning or geometry | Current Parcel Viewer/GIS and zoning history |
| Current SCR use table | UDO mixed-use definition is not permission for each use | 17.08.030 plus applicable 17.16 conditions |
| Base bulk controls | Total FAR/height/side-rear setbacks cannot be finalized | Current 17.12.020, 17.12.030, 17.12.060 and referenced definitions |
| Current parking interaction | Old UDO table must be read with current overlay and parking rules | Current 17.20 and UZO applicability; USD tax district is not UZO membership |
| Lot-area basis | Two supplied area figures disagree | Survey/plat and field definition |
| Height mapping | B.5 does not name the site's reported street | Full narrative, approved plans and Planning interpretation |
| Incentive accounting | Exemption versus bonus and duplicate counting affect upper-floor eligibility | Approved calculation method and interpretation of B.11/C.2(c)(3) |
| Submission requirements | No current official project checklist reviewed | Current agency application and review requirements |

Municode direct web extraction returned no body for the supplied Chapter 17.08 link in earlier research and for Chapter 17.12 this session. Search results also returned explicitly versioned older code; these were not promoted to current rules. No base FAR or permitted-use outcome is asserted from those snippets.

## Planner questions (draft, not sent)

1. Confirm current effect of BL2007-1360 and provide the latest approved plan and subsequent amendments.
2. Clarify how all-provisions applicability interacts with general incentive eligibility and build-to election.
3. Confirm height rules for Cleghorn/Green Hills Village frontage and allowable bonus floor accounting.
4. Confirm current parking baseline, UZO interaction, table classification and incentive administration.
5. Identify regulatory lot area and applicable submission requirements for redevelopment.

## Day 2 boundary

The initial rule library and evidence review are delivered. Day 2's topic coverage criterion is met through sourced rules or explicit gaps. Full current-code and parcel verification remains open and blocks definitive numerical entitlement, not subsequent retrieval/reporting implementation.
