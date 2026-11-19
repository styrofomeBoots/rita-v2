// one place for rita's colors, used by the map (canvas) and tailwind (drawer).
// warm charcoal and stone, with three activity colors:
// slate for bikes leaving, sand for bikes arriving, ember for busy spots.
export const palette = {
  out: [159, 180, 199],
  in: [226, 194, 144],
  hot: [224, 122, 63],
  dotCool: [128, 133, 140],
  dotWarm: [236, 214, 176],
} as const;

export const hex = (rgb: readonly number[]): string =>
  "#" + rgb.map(c => c.toString(16).padStart(2, "0")).join("");

export const rgba = (rgb: readonly number[], alpha: number): string =>
  `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
