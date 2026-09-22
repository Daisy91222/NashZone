"""Extract the two line-only vector paths from the supplied dimension drawing.

This is a source-specific importer. PDF coordinates are preserved; one fitted
scale minimizes squared edge-length residuals. It is not survey reconstruction.
"""
import hashlib
import json
import math
from pathlib import Path
from pypdf import PdfReader
from pypdf.generic import ContentStream

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "parcel dimension.pdf"
reader = PdfReader(source)
paths, stack = [], []
offset = [0, 0]
current = []
for args, op in ContentStream(reader.pages[0].get_contents(), reader).operations:
    if op == b"q":
        stack.append(offset[:])
    elif op == b"Q":
        offset = stack.pop()
    elif op == b"cm":
        a, b, c, d, e, f = map(float, args)
        if (a, b, c, d) != (1, 0, 0, 1):
            raise ValueError("Importer only accepts translation transforms")
        offset = [offset[0] + e, offset[1] + f]
    elif op in (b"m", b"l"):
        if op == b"m":
            current = []
        current.append([float(args[0]) + offset[0], float(args[1]) + offset[1]])
    elif op == b"S" and current:
        paths.append(current)
        current = []
if len(paths) != 2 or len(paths[1]) != 9:
    raise ValueError("Unexpected source geometry; review importer")
road, parcel = paths
labels = [52.2, 640, 357.5, 176.6, 20, 211.7, 371.4, 225.9]
lengths = [math.dist(parcel[i], parcel[i+1]) for i in range(8)]
scale = sum(a*b for a, b in zip(lengths, labels)) / sum(a*a for a in lengths)
origin = parcel[1]
def convert(points):
    return [[round((x-origin[0])*scale, 6), round((y-origin[1])*scale, 6)] for x, y in points]
parcel_ft, road_ft = convert(parcel), convert(road)
data = {
    "source": "parcel dimension.pdf", "sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
    "units": "ft", "quality": "approximate_vector_diagram",
    "scale_ft_per_pdf_unit": scale,
    "calibration": [{"label_ft": label, "fitted_ft": length*scale, "residual_ft": length*scale-label} for label, length in zip(labels, lengths)],
    "parcel": parcel_ft, "road": road_ft,
    "frontages": {
        "F1": {"name": "Cleghorn", "lines": [[parcel_ft[0], parcel_ft[1]]]},
        "F2": {"name": "Right internal road", "lines": [[parcel_ft[2], parcel_ft[3]]]},
        "F3": {"name": "Middle internal road", "lines": [[road_ft[8], road_ft[7]], [road_ft[7], road_ft[6]]]}
    },
    "building_side_point": convert([[460, 340]])[0],
    "assumptions": [
        "Gray closed road outline treated as an exclusion polygon; not a verified ROW or easement.",
        "F3 uses two connected straight segments of the upper road edge; extended inward half-planes intersect to preserve its convex bend.",
        "F1 and F2 use user-selected parcel edges; road subtraction precedes all scenario clipping.",
        "No side or rear setbacks. Zero build-to offset. 48 ft baseline. Bonus adequacy not evaluated.",
        "Highest plate must be connected; area test uses the largest connected component."
    ]
}
out = ROOT / "app/data/geometry.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(data, indent=2), encoding="utf-8")
print(json.dumps({"scale": scale, "max_edge_residual_ft": max(abs(c["residual_ft"]) for c in data["calibration"])}))
