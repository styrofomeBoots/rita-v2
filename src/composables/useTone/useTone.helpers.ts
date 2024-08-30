export enum SoundFontLibraries {
  Musyng = "MusyngKite",
  Fluid = "FluidR3_GM",
  FatBoy = "FatBoy",
}

export enum SoundFontInstruments {
  Clavinet = "clavinet-mp3",
  Piano = "electric_piano_1-mp3",
  GuitarHarmonics = "guitar_harmonics-mp3",
  Cello = "cello-mp3",
}

export interface BuildNoteOptions {
  library: SoundFontLibraries;
  instrument: SoundFontInstruments;
  fadeIn: number;
  fadeOut: number;
}

export type ToneModule = typeof import("tone");
export type Note = "G" | "A" | "B" | "C" | "D" | "E" | "F";
export type Octave = 1 | 2 | 3 | 4 | 5;

export const SCALES = {
  c: {
    major: ["G", "A", "B", "C", "D", "E", "F"],
    pentatonic: ["G", "A", "C", "D", "E"],
  },
};
export const OCTAVES = [1, 2, 3, 4, 5];
export const SF_URL = "https://gleitz.github.io/midi-js-soundfonts";

// tone.js instantiates an audio context as soon as the import loads.
// necessary work around to stop console warnings. 🙃
let Tone: ToneModule;
export const importTone = async (): Promise<ToneModule> => {
  const module = await import("tone");
  Tone = module;
  return Tone;
};

export const buildNote = (
  note: Note,
  octave: Octave,
  options = {} as BuildNoteOptions
): InstanceType<ToneModule["Player"]> => {
  const {
    library = SoundFontLibraries.Musyng,
    instrument = SoundFontInstruments.Piano,
    fadeIn = 0.1,
    fadeOut = 2,
  } = options;
  const noteUrl = `${SF_URL}/${library}/${instrument}/${note + octave}.mp3`;
  const baseNote = new Tone.Player(noteUrl);
  baseNote.fadeIn = fadeIn;
  baseNote.fadeOut = fadeOut;
  const reverb = buildReverb();
  baseNote.connect(reverb);
  return baseNote;
};

const buildReverb = (): InstanceType<ToneModule["Reverb"]> => {
  const reverb = new Tone.Reverb({
    decay: 20,
    preDelay: 0.01,
    wet: 0.1,
  }).toDestination();
  return reverb;
};
