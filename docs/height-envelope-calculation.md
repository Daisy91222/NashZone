# Height envelope calculation: user-reviewed direction

User clarification: all three selected frontages are All Other Streets. Use 48 ft as the scenario build-to-line height reference. This is an exploratory UDO geometry calculation, not a verified entitlement.

## Four scenarios

1. F1: short Cleghorn frontage.
2. F2: right internal-road frontage.
3. F3: middle/lower internal-road highlighted frontage.
4. F2 + F3: simultaneous right and middle/lower frontage retreat.

## Inputs

- Dimensionally calibrated parcel polygon and selected frontage line geometry.
- Explicit building-side orientation for each frontage segment.
- Minimum top-floor plate area x in square feet, strictly positive.
- Build-to offset s in [0, 5] feet, selected explicitly.
- Baseline occupied height H0 (default scenario 48 ft, clearly labeled).
- Added floor height h > 0, or an explicit list of added floor heights.
- Other applicable setbacks, road exclusion areas and constraints, with coverage status.
- Whether a connected top plate is required (default yes; disconnected areas cannot be summed to satisfy x).

## Geometry

Start with a valid baseline feasible polygon P0 after applying modeled road exclusions, other constraints and initial build-to position. For a straight frontage define signed perpendicular distance d_i(p) positive toward the building side, measured from the frontage reference line.

At extra-floor count n, require d_i(p) >= s_i + 10*n for each selected frontage i. Intersect these regions with P0. All selected constraints apply together in the combined scenario. Do not add independently derived heights or areas.

For a bent frontage, retain its ordered line segments and explicitly choose a reviewed inward offset interpretation. Do not silently replace it with a chord, use radial distance to endpoints, or intersect infinite half-planes for an arbitrary concave polyline without checking the intended building-side region.

Compute perpendicular cross-sections through the polygon for depth visualization. Multiple intervals may occur in a concave parcel. Preserve those intervals; a single longest distance is not an adequate area model.

Let A(n) be the area of the largest connected component of the remaining plate at level n. The geometric extra-floor limit is the largest integer n >= 0 with A(n) >= x. If A(0) < x, return infeasible for the requested top-plate size. Detect empty geometry and report unmet constraints.

For constant added floor height h, H_geometry = H0 + n*h. Do not assume 10 ft of horizontal retreat equals 10 ft of vertical height. For varied floor heights, sum the provided heights. Report added floors only if no height input exists. No project maximum floor-area output is requested.

## Regulatory accounting

This limit is conditional geometry only. Each floor above the applicable height must separately satisfy the UDO bonus-space requirement and all remaining applicable rules. FAR exemptions remain separate from bonus until user review changes the treatment. Without verified bonus inputs, the geometric result must not be labeled maximum permitted height.

## Data readiness

The supplied PDF has edge lengths but no surveyed bearings. The annotated PNG identifies the desired frontages but is not a survey. Calibrate and check extracted/traced geometry against independent labeled dimensions before using it. If inconsistent, retain approximate status and report residuals. The lower highlighted frontage is not automatically the 640-ft boundary. No computed n or height is established by this specification.

## Acceptance checks for implementation

- Rectangle with width W and depth D: one-sided retreat area is W*max(D-s-10*n, 0) before other constraints.
- Two adjacent perpendicular frontage constraints: area is max(W-s1-10*n, 0)*max(D-s2-10*n, 0).
- Combined-scenario area cannot exceed either individual scenario at the same n and baseline constraints.
- Increasing x cannot increase the resulting n; increasing retreat cannot increase plate area.
- Disconnected components are not summed when connected mode is selected.
- Invalid x, h, geometry or inward directions must be rejected.
