import {
  Note,
  Octave,
  ScaleId,
  ToneNote,
  TonePattern,
  ToneScaleOption,
  ToneType,
} from "./useTone.types";
let Tone: ToneType;
let reverb: InstanceType<ToneType["Reverb"]> | null = null;
let chorus: InstanceType<ToneType["Chorus"]> | null = null;
let ambientFilter: InstanceType<ToneType["Filter"]> | null = null;
let ambientSynth: InstanceType<ToneType["PolySynth"]> | null = null;

export const SCALE_OPTIONS: ToneScaleOption[] = [
  {
    id: "cOpen",
    label: "c open",
    notes: ["C", "D", "G", "A"],
  },
  {
    id: "cMajorPentatonic",
    label: "C major pentatonic",
    notes: ["G", "A", "C", "D", "E"],
  },
  {
    id: "cMinorPentatonic",
    label: "C minor pentatonic",
    notes: ["C", "Eb", "F", "G", "Bb"],
  },
  {
    id: "cMajor",
    label: "C major",
    notes: ["G", "A", "B", "C", "D", "E", "F"],
  },
];
export const OCTAVES: Octave[] = [1, 2, 3, 4, 5];

export const getScaleById = (scaleId: ScaleId): ToneScaleOption => {
  const scale = SCALE_OPTIONS.find(option => option.id === scaleId);

  return scale ?? SCALE_OPTIONS[0];
};

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

export const getAmbientSynth = (): InstanceType<ToneType["PolySynth"]> => {
  ambientSynth ??= new Tone.PolySynth(Tone.Synth, {
    volume: -16,
    oscillator: {
      type: "triangle",
    },
    envelope: {
      attack: 1.8,
      attackCurve: "sine",
      decay: 0.8,
      decayCurve: "linear",
      release: 5,
      releaseCurve: "linear",
      sustain: 0.7,
    },
  }).connect(getAmbientFilter());
  return ambientSynth;
};

export const ensureReverbReady = async (): Promise<void> => {
  await getReverb().ready;
};

export const setAmbientFilterFrequency = (frequency: number): void => {
  getAmbientFilter().frequency.rampTo(frequency, 1.2);
};

const getToneNoteAtOffset = (
  scale: readonly Note[],
  octaves: readonly Octave[],
  noteIndex: number,
  octaveIndex: number,
  offset: number
): ToneNote => {
  const flatRootIndex = octaveIndex * scale.length + noteIndex;
  const maxIndex = scale.length * octaves.length - 1;
  const flatIndex = Math.min(Math.max(flatRootIndex + offset, 0), maxIndex);

  return {
    note: scale[flatIndex % scale.length],
    octave: octaves[Math.floor(flatIndex / scale.length)],
  };
};

const isSameToneNote = (a: ToneNote, b: ToneNote): boolean => {
  return a.note === b.note && a.octave === b.octave;
};

export const buildTonePattern = (
  scale: readonly Note[],
  octaves: readonly Octave[],
  noteIndex: number,
  octaveIndex: number,
  bikesDelta: number,
  isSynthetic: boolean
): TonePattern => {
  const rootNote = getToneNoteAtOffset(scale, octaves, noteIndex, octaveIndex, 0);
  const direction = bikesDelta < 0 ? 1 : -1;
  const intervalSize = Math.min(Math.max(Math.abs(bikesDelta), 1), 2);
  const colorNote = getToneNoteAtOffset(
    scale,
    octaves,
    noteIndex,
    octaveIndex,
    direction * intervalSize
  );
  const notes = isSameToneNote(rootNote, colorNote)
    ? [rootNote]
    : [rootNote, colorNote];
  const activityIntensity = Math.min(Math.abs(bikesDelta), 3);

  return {
    notes,
    duration: (isSynthetic ? 2.6 : 3.4) + activityIntensity * 0.6,
    velocity: (isSynthetic ? 0.08 : 0.12) + activityIntensity * 0.015,
    filterFrequency: (isSynthetic ? 520 : 680) + activityIntensity * 90,
  };
};

const getReverb = (): InstanceType<ToneType["Reverb"]> => {
  reverb ??= new Tone.Reverb({
    decay: 14,
    preDelay: 0.04,
    wet: 0.42,
  }).toDestination();
  return reverb;
};

const getChorus = (): InstanceType<ToneType["Chorus"]> => {
  chorus ??= new Tone.Chorus({
    frequency: 0.08,
    delayTime: 4,
    depth: 0.35,
    spread: 120,
    wet: 0.18,
  }).start();
  chorus.connect(getReverb());
  return chorus;
};

const getAmbientFilter = (): InstanceType<ToneType["Filter"]> => {
  ambientFilter ??= new Tone.Filter({
    type: "lowpass",
    frequency: 680,
    rolloff: -24,
    Q: 0.7,
  });
  ambientFilter.connect(getChorus());
  return ambientFilter;
};

export const disposeToneNodes = (): void => {
  ambientSynth?.releaseAll();
  ambientSynth?.disconnect();
  ambientSynth?.dispose();
  ambientSynth = null;

  ambientFilter?.disconnect();
  ambientFilter?.dispose();
  ambientFilter = null;

  chorus?.disconnect();
  chorus?.dispose();
  chorus = null;

  reverb?.disconnect();
  reverb?.dispose();
  reverb = null;
};
