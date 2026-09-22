"""Build a reproducible local PDF page index and reviewed rule seeds.

This performs extraction, not legal applicability determination. Full page text
stays in ignored local storage; published rule summaries reference the source.
"""

import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "17-GH_UDOupdated2015.pdf"

# Physical pages are deliberately independent from the document's printed labels.
# Each seed is (id, topic, section, pages, kind, summary, applicability).
SEEDS = [
    ("gh-definition", "use", "A", [44], "definition", "Mixed use requires at least three revenue-producing uses; each multi-story building must contain three.", "Verify permitted uses separately in base code."),
    ("gh-eligibility", "bonus", "B introduction", [44], "incentive", "Incentives require mixed-use development within the UDO and compliance with build-to provisions.", "Check parcel-specific ordinance; requirements do not automatically confer incentive eligibility."),
    ("gh-shared-parking", "bonus", "B.1", [44], "incentive", "Bonus GFA = (gross peak spaces - net peak spaces) * 340 sf. Three qualified uses with different parking peaks; each at least 15% of total GFA, restaurant exception 5000 sf; at most two uses from one category.", "Requires use classification, program areas and supported shared-parking study; categories: lodging, commercial, entertainment, office, residential."),
    ("gh-garage-exemption", "building_area", "B.2", [44], "incentive", "A garage designed and built as principal use may be excluded from FAR floor area.", "Principal-use garage and incentive eligibility required; not a blanket accessory-parking exclusion."),
    ("gh-dining", "frontage", "B.3", [44], "incentive", "Build-to range increases by 5 ft for an outdoor dining courtyard between property line and front wall.", "Courtyard design and incentive eligibility."),
    ("gh-isr", "building_area", "B.4", [44], "incentive", "Maximum impervious surface ratio is 1.00 under the incentive provisions.", "Does not establish building coverage, stormwater compliance or rentable floor area."),
    ("gh-height", "height", "B.5", [44], "incentive", "Build-to-line height is 60 ft on Hillsboro Pike; 48 ft on listed other streets and New Street.", "Cleghorn and Green Hills Village Drive are not expressly named in this appendix table; verify street mapping and narrative before applying a value."),
    ("gh-frontage-exemption", "building_area", "B.6", [45], "incentive", "Qualifying street-level leasable space of at least 50 ft depth is excluded from FAR calculation.", "Direct street frontage access and incentive eligibility; determine eligible area; do not equate with 30-ft garage liner requirement."),
    ("gh-plaza", "bonus", "B.7(a)", [45], "incentive", "Qualified plaza yields 6 sf residential or 3 sf other floor area per sf of plaza. Minimum 1000 sf; contiguous; maximum length:width 3:1; ADA compliant; public easement; front-line edge; frontage/access and feasible adjacent linkage conditions apply.", "All qualification conditions must be met; do not apply both multipliers to the same area without authority."),
    ("gh-contribution", "bonus", "B.7(b)", [45], "incentive", "Open-space contribution substitutes for plaza construction, using specified same-zone subject, adjoining and opposite properties' inflation-adjusted assessed land values and combined areas; collected at building permit.", "Do not substitute subject parcel assessed value alone; verify administration and bonus allocation."),
    ("gh-transit", "bonus", "B.7(c)", [45, 46], "incentive", "Approved integrated transit stop/shelter provides a 30% parking reduction OR floor area based on those spaces times 340 sf; covenant excludes advertising.", "Agency approval and eligibility required; introductory and/or wording versus formula OR requires review before any combined benefit."),
    ("gh-parking-contribution", "parking", "B.8", [46], "incentive", "Up to 10% parking reduction for contributions; excludes developments requiring 10 or fewer spaces. Per-space amounts: surface $750, below grade $7000, above grade $5000.", "Snapshot amounts only; confirm current administration, parking baseline and interaction with newer code."),
    ("gh-residential-parking", "parking", "B.9", [46], "incentive", "Floor space designed and built for residential use is exempt from required parking.", "Subject to Section B eligibility and current-code interaction; not a finding that no parking is needed for the whole development."),
    ("gh-dedication", "streets", "B.10", [46], "incentive", "Qualifying concept-plan street dedication retains rights usable on abutting property at 3 sf floor area per sf of right-of-way.", "Dedication must meet public street and UDO streetscape standards; establish receiving property and dedication geometry."),
    ("gh-cumulative", "building_area", "B.11", [46], "incentive", "Eligible incentive floor space can cumulatively exceed base maximum FAR.", "Verify each incentive and overlap; not permission to count one area repeatedly or ignore physical limits."),
    ("gh-residential-far", "building_area", "B.12", [46], "incentive", "Residential space in mixed-use buildings may be excluded from FAR floor area.", "Eligibility and use permission required; not unlimited total building area."),
    ("gh-base-fallback", "applicability", "C introduction", [46], "mandatory", "Base bulk standards remain where Section C does not vary them.", "Resolve explicit variations, cross-references and parcel-specific requirements."),
    ("gh-buildto-election", "frontage", "C.1(a)", [46], "mandatory", "General provision permits base setback or UDO build-to unless otherwise specified; using build-to triggers C.1(b-e) and registered-mail notice to adjacent owners on same block face with evidence in final plans.", "Parcel-specific BL2007-1360 may affect this choice; confirm with Planning."),
    ("gh-buildto", "frontage", "C.1(b-c)", [46, 47], "mandatory", "Hillsboro Pike: 5-15 ft; Hillsboro Circle, Abbott Martin, Richard Jones: 5-10 ft; Hillsboro Drive, Bandywood, Warfield and other roads: 0-5 ft. At least 75% of front building wall at build-to.", "Identify each legal frontage and applicable path; percentage is wall length, not parcel frontage."),
    ("gh-garage-liner", "parking", "C.1(d); C.2(a)", [47], "mandatory", "Principal-use garage needs build-to compliance and street-front ground-floor retail at least 30 ft deep with street access; incentive path adds flat plates, 12-ft minimum floor-to-floor height and facade cladding.", "Check principal-use status and applicable incentive/parcel triggers."),
    ("gh-commercial-access", "frontage", "C.2(b)", [47], "mandatory", "Ground-floor street access requires leasable commercial space and at least one access point for each establishment.", "Section C.2 incentive trigger and parcel-specific requirements."),
    ("gh-height-exception", "height", "C.2(c)(3)", [47, 48], "mandatory", "Every floor above the maximum must consist entirely of incentive bonus space and step back at least 10 ft from the floor below.", "Identify eligible bonus space, geometry and official interpretation; cannot calculate an overall height or floor count from this alone."),
    ("gh-corner-landmark", "height", "C.2(c)(1-2)", [47], "mandatory", "Hillsboro Pike corner height transitions within 100 ft of side street, extendable 25 ft per additional permitted floor; Planning-designated landmark features exempt.", "Actual corner frontage and agency landmark determination required."),
    ("gh-parking-general", "parking", "D.1", [48], "mandatory", "Only required employee parking may be outside UDO; legal immediately abutting on-street spaces may replace off-street requirements one-for-one up to 10, with at least 50% allocation rule for straddling spaces.", "Verify actual spaces and current applicable requirements."),
    ("gh-parking-table", "parking", "D.2(a), parking table", [48, 49], "mandatory", "Alternative table: general office 1/500 sf; general retail 1/300 sf; each first 2000 sf exempt. Medical and sales/leasing office differ from general office.", "Mixed-use redevelopment and build-to eligibility; confirm classification, exemption aggregation and rounding. Table alone is not current parcel parking determination."),
    ("gh-side-parking", "parking", "D.2(b)", [48], "mandatory", "Parking beside a building limited to one double-loaded aisle.", "Section D.2 trigger and parcel-specific applicability."),
    ("gh-glazing", "facade", "F.1(b-c)", [52], "mandatory", "Commercial ground-floor front facade: at least 40% transparent glazing, measured to 16 ft above grade; upper floors at least 25%. Specified Hillsboro Pike/Circle corner exception applies.", "Section F incentive trigger and parcel-specific applicability; identify actual facades."),
    ("gh-massing", "facade", "F.1(d-g)", [52], "mandatory", "Horizontal masses beyond 1:3 height:width need substantial variation; mansard roofs and vinyl siding prohibited; ground-floor public-way EIFS prohibited; non-emergency public-way entrances recessed or awning-defined.", "Section F trigger; retain full source conditions."),
    ("gh-screening", "public_space", "G.2-4", [53], "mandatory", "Parking screening: 4 ft initially and 6 ft at maturity, or matching-material wall at least 2.5 ft. Buffer waivers have boundary and contribution conditions.", "Confirm boundaries, landscaping standards and waiver conditions; not universal buffer exemption.")
]


def build():
    raw = subprocess.run(["pdftotext", "-layout", "-enc", "UTF-8", str(PDF), "-"], check=True, capture_output=True).stdout.decode("utf-8")
    pages = raw.split("\f")
    if not pages[-1].strip():
        pages.pop()
    index = []
    for number, text in enumerate(pages, 1):
        label = re.search(r"page (\d+) of 55", text)
        index.append({"physical_page": number, "printed_page": label.group(1) if label else None, "text": text})
    source = {"id": "green-hills-udo", "sha256": hashlib.sha256(PDF.read_bytes()).hexdigest(), "page_count": len(pages), "status": "local_snapshot_current_applicability_unverified", "pages": index}
    local = ROOT / "data/local"
    local.mkdir(parents=True, exist_ok=True)
    (local / "udo-pages.json").write_text(json.dumps(source, indent=2), encoding="utf-8")
    rules = []
    for ident, topic, section, numbers, kind, summary, condition in SEEDS:
        evidence = [{"source_id": "green-hills-udo", "section": section, "physical_page": n, "printed_page": index[n-1]["printed_page"], "excerpt": index[n-1]["text"]} for n in numbers]
        rules.append({"id": ident, "topic": topic, "text": summary, "kind": kind, "applicability": [condition, "Verify current source version and any later amendments."], "evidence": evidence, "relationships": [], "review_status": "extracted"})
    (local / "udo-rules.json").write_text(json.dumps(rules, indent=2), encoding="utf-8")
    print(f"Indexed {len(pages)} physical pages; built {len(rules)} rule seeds.")
    print("Visual source checks performed; professional applicability review remains pending.")


if __name__ == "__main__":
    build()
