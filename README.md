# rita

An audio-visual map of city bike share systems. `rita` polls live GBFS station feeds, plots stations on an interactive map, and turns bike availability changes into map pulses, tones, and a scrolling activity feed.

## What It Does

- Loads bike-share station metadata and live status updates from public GBFS feeds.
- Renders station locations on an `OpenLayers` map.
- Translates station activity into audio with `Tone.js`.
- Shows recent station changes in a side drawer.
- Lets you switch cities and toggle sound from the in-app settings modal.

## Stack

- `Vue 3` + `TypeScript`
- `Vite`
- `OpenLayers`
- `Tone.js`
- `Tailwind CSS` + `daisyUI`
- `alova` with the Axios adapter for feed requests

## Getting Started

### Install

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Use `npm run dev:h` if you want Vite exposed on your local network.

## Scripts

- `npm run dev` - start the Vite dev server
- `npm run dev:h` - start the dev server on `0.0.0.0`
- `npm run serve` - alias for `vite`
- `npm run serve:h` - alias for `vite --host`
- `npm run build` - type-check and build for production
- `npm run preview` - preview the production build locally

## Notes

- City options are sourced from a curated list of GBFS feeds in `src/composables/useStations/useStations.helpers.ts`.
- Safari support is limited to feeds that currently work around cross-origin issues.
- Audio is opt-in and only starts after enabling sound in the app settings.

## Changelog

### Unreleased - 2026-04-23

- Added a `fake updates` setting to generate synthetic station activity for demos and testing when live feeds are quiet.
- Marked synthetic updates in both the side drawer and map animation so generated activity is visually distinct from real feed changes.
- Improved station update handling by adding stable update IDs, capping queued and visible updates, and filtering updates to the current map bounds.
- Reduced audio and map lifecycle leaks by reusing Tone nodes, disposing active players when sound is disabled, and cleaning up OpenLayers listeners on unmount.
