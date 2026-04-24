# rita

<p align="center">
  <img src="src/assets/rita.svg" alt="rita icon" width="120" height="120" />
</p>

An audio-visual map of city bike share systems.

[Live demo](https://rita.city/)

`rita` turns live bike-share activity into an ambient instrument. Public GBFS station updates become motion on the map, a running activity feed, and tones shaped by where a station sits and how its bike count changes.

## Highlights

- Live GBFS station metadata and status updates rendered on an interactive city map
- A responsive ambient synth that turns station activity into harmony, motion, and intensity
- Selectable musical scales that remap the city into different tonal spaces
- Synthetic ambient activity that keeps quiet systems feeling alive
- A side drawer of recent station changes that mirrors what you see and hear

## How Audio Works

- Each station update becomes a tone event using the station's coordinate, bike-count delta, and whether the update is synthetic or live.
- Longitude maps the station into a note within the selected scale, while latitude maps it into octave bands.
- Checkout and return direction shift the supporting note in opposite directions.
- Larger bike-count changes make the sound slightly longer, brighter, and stronger, so busier stations produce a wider ambient swell.
- Synthetic activity follows the same rules with a softer touch to fill quiet moments without overwhelming the live feed.

## Built With

- `Vue 3`
- `TypeScript`
- `OpenLayers`
- `Tone.js`
- `Tailwind CSS`
- `daisyUI`
- `alova`

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.
