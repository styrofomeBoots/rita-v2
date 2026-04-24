# Changelog

## 2026-04-24

- Shipped ambient activity enabled by default so new sessions stay active even when live feeds are quiet.
- Added musical scale selection and replaced the previous sample-based note playback with a responsive ambient synth that reacts to station position, checkout vs return direction, and change intensity.
- Updated the settings and about copy to describe the new audio behavior and fit the added scale control.
- Corrected station notification wording so checkout and return messages match the underlying bike-count deltas.
- Refined synthetic update styling with a more earthy accent color that better complements the map palette.

## 2026-04-23

- Added an `ambient activity` setting to generate synthetic station activity for demos and testing when live feeds are quiet.
- Marked synthetic updates in both the side drawer and map animation so generated activity is visually distinct from real feed changes.
- Improved station update handling by adding stable update IDs, capping queued and visible updates, and filtering updates to the current map bounds.
- Reduced audio and map lifecycle leaks by reusing Tone nodes, disposing active players when sound is disabled, and cleaning up OpenLayers listeners on unmount.
