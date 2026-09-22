"""Validate Day 1 contracts and preserve the sample's unresolved facts."""

import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]


def main():
    schema = json.loads((ROOT / "schemas/contracts.schema.json").read_text(encoding="utf-8"))
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    paths = list((ROOT / "examples").glob("*/input.json"))
    if not paths:
        raise ValueError("No example inputs found")
    for path in paths:
        data = json.loads(path.read_text(encoding="utf-8"))
        validator.validate(data)
        sources = {item["id"] for item in data["sources"]}
        facts = {item["id"]: item for item in data["facts"]}
        if len(sources) != len(data["sources"]) or len(facts) != len(data["facts"]):
            raise ValueError("Duplicate source or fact IDs")
        for fact in facts.values():
            if fact["source_id"] not in sources:
                raise ValueError(f"Unresolved source: {fact['source_id']}")
        for check in data["derived_checks"]:
            if not set(check["input_fact_ids"]).issubset(facts):
                raise ValueError("Calculation references missing facts")
        if data["parcel_id"] == "11714015900":
            if facts["square_footage_unclassified"]["status"] != "unresolved":
                raise ValueError("Unclassified area must remain unresolved")
            if "existing_building_area_sf" in facts:
                raise ValueError("Building area has not been established")
            conversion = facts["site_area_reported"]["value"] * 43560
            if abs(conversion - data["derived_checks"][0]["result"]) > 0.001:
                raise ValueError("Incorrect acreage conversion")
        print(f"PASS {path.relative_to(ROOT)}")
    print("PASS schema structure, input contracts, provenance links and sample invariants")
    rule_path = ROOT / "data/local/udo-rules.json"
    if rule_path.exists():
        rule_schema = {"$schema": schema["$schema"], "$defs": schema["$defs"], "$ref": "#/$defs/rule"}
        rule_validator = Draft202012Validator(rule_schema)
        rules = json.loads(rule_path.read_text(encoding="utf-8"))
        page_index = json.loads((ROOT / "data/local/udo-pages.json").read_text(encoding="utf-8"))
        pages = {page["physical_page"]: page for page in page_index["pages"]}
        identifiers = [rule["id"] for rule in rules]
        if len(set(identifiers)) != len(identifiers):
            raise ValueError("Duplicate rule IDs")
        for rule in rules:
            rule_validator.validate(rule)
            for evidence in rule["evidence"]:
                page = pages[evidence["physical_page"]]
                if evidence["source_id"] != page_index["id"]:
                    raise ValueError("Unknown evidence source")
                if evidence["printed_page"] != page["printed_page"] or evidence["excerpt"] != page["text"]:
                    raise ValueError("Evidence does not match indexed page")
        print(f"PASS {len(rules)} rule contracts, unique IDs and exact page evidence links")
    print("Regulatory conclusions and source currency have not been validated.")


if __name__ == "__main__":
    main()
