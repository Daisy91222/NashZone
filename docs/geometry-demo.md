# Geometry Demo

Implemented 2026-09-22 as the geometric component of the agent. This does not yet implement LLM report generation or current-code entitlement verification.

## Run

Node.js 22 or newer:

```sh
npm ci
npm test
npm run dev
```

Open the URL printed by Vite (normally http://127.0.0.1:4317; it selects a different port if occupied). To select a port, run `npm run dev -- --port 4319`. The checked-in `app/data/geometry.json` makes the demo runnable without the local source PDF. Re-extraction requires Python with pypdf: `python scripts/extract_demo_geometry.py`.

The UI supports four scenarios, editable minimum highest-plate area and upper-floor height, continuous height surface and discrete stepped envelope, orbit/plan views, a plate-level slider, threshold comparison, calibration residuals and JSON export. No model API key is needed for this geometric calculation.

## Calculation

Use polyclip-ts for polygon difference and half-plane intersections, with a fixed precision tolerance and millifoot half-plane vertex quantization. Remove the supplied drawing's gray road polygon from the parcel first. Initial build-to offset is zero, baseline is 48 ft, retreat is 10 ft per added floor. No other setbacks are included at the user's request. Each successive plate is the road-excluded polygon intersected with inward half-planes at the applicable accumulated distance. F3 uses two segments of the road's upper edge. Their joint inward regions follow a convex bend; this is an explicit modeling assumption. F23 intersects F2 and F3 together.

Find the greatest integer n where the largest connected remaining plate has area >= x. Return H = 48 + n*h. The baseline's actual floor arrangement is not specified; n is added floors, not total building stories. For every accepted result retain the next rejected plate to explain the stopping point. No overall project floor-area maximum is calculated.

The height surface interpolates retreat into a continuous slope, capped at the discrete accepted height. It is a visual envelope, not a claim of a continuous-height regulatory rule or a structurally buildable design. The stepped view represents the discrete floor calculation. Bonus adequacy remains unresolved; FAR exemptions are not pooled with bonus.

## Source fidelity

Both parcel and gray road outlines were extracted from the PDF's line paths. A single least-squares scale fits all eight labeled lengths. The fitted geometry does not exactly match the dimension labels: maximum absolute edge residual is approximately 13.78 ft, and the short 52.2-ft edge is modeled at approximately 58.07 ft. Full residuals are visible in the UI and JSON. Do not represent this as survey accuracy or force agreement with the separately reported acreage.

The road outline is a drawing-based approximation, not a recorded ROW/easement. It removes approximately 5,609 sq ft within the polygon, leaving approximately 161,608 sq ft of geometric land area. These are calibration-model quantities, not approved lot-area or entitlement values. The lower frontage is not the entire 640-ft boundary. The far-reaching F1 envelope includes perpendicular distance across the narrow connection toward the main body; whether that treatment is acceptable for an actual development remains a separate review question.

## Default result

Inputs: x = 50,000 sq ft; h = 10 ft. Values below are approximate diagram-based geometry, not permitted heights.

| Scenario | Added floors | Geometric height (ft) | Highest plate (sq ft) | Next plate (sq ft) |
| --- | ---: | ---: | ---: | ---: |
| F1 Cleghorn | 47 | 518 | 52,295 | 48,519 |
| F2 right | 25 | 298 | 52,662 | 49,000 |
| F3 middle | 23 | 278 | 53,663 | 49,688 |
| F23 combined | 15 | 198 | 53,174 | 48,545 |

## Verification

Automated numerical tests cover analytical rectangles, simultaneous adjacent-frontage retreat, road subtraction and disconnected components, area monotonicity, independence of floor count from vertical layer height, threshold monotonicity and rejected invalid inputs. Browser verification covers desktop/mobile rendering, canvas pixels, camera movement, scenario/mode changes, edited parameters, infeasible thresholds and JSON downloads.

## Grasshopper integration

Retain this geometry contract as the adapter boundary: parcel, road exclusions, frontage lines, inward side, units, retreat, area threshold and floor height in; floor polygons, areas, floor count and threshold audit out. Rhino.Compute can solve a Grasshopper definition using these inputs once a reviewed definition and Rhino environment are available. Compare exported floor contours and areas against the existing Rhino workflow before replacing the calculation backend. The current demo does not require Rhino or claim an active Grasshopper connection.

References: https://developer.rhino3d.com/guides/compute/ ; https://github.com/luizbarboza/polyclip-ts
