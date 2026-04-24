import {
  BuildNoteOptions,
  Note,
  Octave,
  SoundFontInstruments,
  SoundFontLibraries,
  ToneType,
} from "./useTone.types";
let Tone: ToneType;
let reverb: InstanceType<ToneType["Reverb"]> | null = null;
let backingSynth: InstanceType<ToneType["Synth"]> | null = null;
const activePlayers = new Set<InstanceType<ToneType["Player"]>>();

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
  activePlayers.add(baseNote);
  baseNote.fadeIn = fadeIn;
  baseNote.fadeOut = fadeOut;
  baseNote.onstop = () => {
    activePlayers.delete(baseNote);
    baseNote.disconnect();
    baseNote.dispose();
  };
  baseNote.connect(getReverb());
  return baseNote;
};

export const getBackingNote = (): InstanceType<ToneType["Synth"]> => {
  backingSynth ??= new Tone.Synth({
    volume: -40,
    envelope: {
      attack: 2,
      attackCurve: "exponential",
      decay: 2,
      decayCurve: "linear",
      release: 3,
      releaseCurve: "linear",
      sustain: 0.5,
    },
  }).toDestination();
  return backingSynth;
};

const getReverb = (): InstanceType<ToneType["Reverb"]> => {
  reverb ??= new Tone.Reverb({
    decay: 20,
    preDelay: 0.1,
    wet: 0.5,
  }).toDestination();
  return reverb;
};

export const disposeToneNodes = (): void => {
  for (const player of activePlayers) {
    activePlayers.delete(player);
    player.disconnect();
    player.dispose();
  }

  backingSynth?.disconnect();
  backingSynth?.dispose();
  backingSynth = null;

  reverb?.disconnect();
  reverb?.dispose();
  reverb = null;
};
