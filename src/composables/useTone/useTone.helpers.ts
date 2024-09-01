import {
  Note,
  Octave,
  BuildNoteOptions,
  SoundFontLibraries,
  SoundFontInstruments,
  ToneType,
} from "./useTone.types";
let Tone: ToneType; // import * as Tone from "tone";

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
export const importToneJs = async (): Promise<ToneType> => {
  const module = await import("tone");
  Tone = module;
  return Tone;
};

export const getToneIndex = (
  coordinate: number,
  coordinateMin: number,
  step: number,
  arrayLen: number
): number => {
  const index = Math.min(
    Math.floor((coordinate - coordinateMin) / step),
    arrayLen - 1
  );
  return index;
};

export const buildNote = (
  note: Note,
  octave: Octave,
  options = {} as BuildNoteOptions
): InstanceType<ToneType["Player"]> => {
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

const buildReverb = (): InstanceType<ToneType["Reverb"]> => {
  const reverb = new Tone.Reverb({
    decay: 20,
    preDelay: 0.01,
    wet: 0.1,
  }).toDestination();
  return reverb;
};
