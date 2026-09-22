# Parcel frontage review

Source: user-supplied `parcel dimension.pdf`, page 1, visually reviewed 2026-09-22. Diagram-relative orientation only; no surveyed bearings or north arrow. Road public/private legal status is not established by the drawing.

The eight labeled boundary lengths are 52.2, 225.9, 371.4, 211.7, 20, 176.6, 357.5 and 640 ft. These are transcribed observations, not a surveyed polygon or independently verified distances.

| Candidate | Observed geometry | Frontage status | Height analysis status |
| --- | --- | --- | --- |
| F1 Cleghorn | 52.2-ft short end of narrow arm | Candidate external-road contact | No parcel height assigned |
| F2 right internal road | 357.5-ft right edge | Candidate internal-road contact | No parcel height assigned |
| F3 lower internal road | User highlighted road-facing line from main-body notch toward lower road bend | User-selected analysis frontage; length unresolved, not automatically 640 ft | No parcel height assigned |

The 225.9-ft edge is the upper side of the narrow arm; the 371.4-ft edge belongs to the left side of the main body. Neither should be assumed to be a long road frontage based only on label proximity. The upper 20-ft jog is a boundary segment, not a building setback.

## Accepted user decisions

- Examine parcel-specific ordinance first.
- Keep FAR exemptions and bonuses separate until user review explicitly changes this.
- Treat all three roads as the user's proposed "other roads" classification, preserving that provenance.
- Do not output maximum building area.
- Compare candidate frontage height controls; do not assume electing one side eliminates controls on others.

## Next calculation inputs

The drawing supports identification of candidate edges but does not uniquely define parcel geometry from lengths alone. Need bearings/coordinates or a confirmed scaled tracing before precise inward offsets. Need legal street/right-of-way/easement lines to determine build-to reference lines, especially the lower internal road. A private/internal road label does not itself prove statutory frontage eligibility.

Height reference, floor-to-floor assumptions, build-to offset, simultaneous frontage constraints and eligibility of upper-floor bonus space must be explicit. An exploratory tracing can show geometric effects if labeled approximate; it cannot establish permitted height. Preserve the distinction between existing boundary length and perpendicular buildable depth.

## User clarification received 2026-09-22

The user confirmed the lower road is internal and supplied yellow highlights selecting all three analysis frontages. The user has previously analyzed each separately. This resolves which lines to compare; do not request the same selection again. It does not establish recorded easement terms or legal road status. F3 is the highlighted road-facing line, not automatically the long lower parcel boundary. No independent F3 length was provided.

The next comparison should retain three separate scenarios with a common rule interpretation and separate geometry. Frontage length affects potential wall placement; perpendicular depth and shape control retreat geometry. Do not derive height by multiplying frontage length by a ratio or merging FAR exemptions with bonus area. The user's earlier calculations, if shared, can serve as comparison cases after their assumptions and rule references are recorded; they are not automatically legal ground truth.

## Subsequent user correction

The user confirmed All Other Streets for all selected frontages and added a fourth scenario applying F2 and F3 simultaneously. The objective is now maximum geometric height retaining at least an input x square feet on the highest plate. The updated four-scenario method is defined in `height-envelope-calculation.md` and supersedes the three-scenario-only instruction above.
