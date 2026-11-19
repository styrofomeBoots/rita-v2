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
let bassFilter: InstanceType<ToneType["Filter"]> | null = null;
let bassSynth: InstanceType<ToneType["MonoSynth"]> | null = null;

// the map is split into left, middle and right lanes. each lane has its own
// pad and bell so a station on the west side sounds from the left speaker.
interface ToneLane {
  panner: InstanceType<ToneType["Panner"]>;
  bellPanner: InstanceType<ToneType["Panner"]>;
  pad: InstanceType<ToneType["PolySynth"]>;
  bell: InstanceType<ToneType["PolySynth"]>;
}
const LANE_PANS = [-0.55, 0, 0.55];
export const LANE_COUNT = LANE_PANS.length;
// pads swell for seconds, so only a few may ring per lane before it gets muddy
export const MAX_PAD_VOICES = 3;
const lanes: (ToneLane | null)[] = LANE_PANS.map(() => null);

// the hum follows the busiest part of the map. two slightly detuned saws and
// a sine an octave up, through a low filter that slowly breathes.
interface ToneHum {
  gain: InstanceType<ToneType["Gain"]>;
  panner: InstanceType<ToneType["Panner"]>;
  filter: InstanceType<ToneType["Filter"]>;
  lfo: InstanceType<ToneType["LFO"]>;
  oscillators: InstanceType<ToneType["Oscillator"]>[];
}
let hum: ToneHum | null = null;
const HUM_MAX_GAIN = 0.55;

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

export const getLane = (index: number): ToneLane => {
  const existing = lanes[index];
  if (existing) return existing;

  const panner = new Tone.Panner(LANE_PANS[index]).connect(getAmbientFilter());
  const pad = new Tone.PolySynth(Tone.Synth, {
    volume: -17,
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
  }).connect(panner);

  // the bell skips the ambient filter so each real event stays easy to hear
  const bellPanner = new Tone.Panner(LANE_PANS[index]).connect(getChorus());
  const bell = new Tone.PolySynth(Tone.Synth, {
    volume: -21,
    oscillator: {
      type: "sine",
    },
    envelope: {
      attack: 0.005,
      decay: 1.6,
      sustain: 0,
      release: 1.8,
    },
  }).connect(bellPanner);
  pad.set({ detune: (index - 1) * 4 });
  pad.maxPolyphony = MAX_PAD_VOICES + 1;
  bell.maxPolyphony = 8;

  const lane = { panner, bellPanner, pad, bell };
  lanes[index] = lane;
  return lane;
};

// a low swell for big jumps, which are usually a rebalancing truck
export const getBassSynth = (): InstanceType<ToneType["MonoSynth"]> => {
  if (!bassFilter) {
    bassFilter = new Tone.Filter({ type: "lowpass", frequency: 260, rolloff: -24 });
    bassFilter.connect(getReverb());
  }
  bassSynth ??= new Tone.MonoSynth({
    volume: -14,
    oscillator: { type: "sine" },
    envelope: { attack: 0.6, decay: 1.2, sustain: 0.5, release: 4 },
    filterEnvelope: {
      attack: 0.4,
      decay: 1,
      sustain: 0.3,
      release: 3,
      baseFrequency: 80,
      octaves: 2,
    },
  }).connect(bassFilter);
  return bassSynth;
};

export const getHum = (): ToneHum => {
  if (hum) return hum;
  const gain = new Tone.Gain(0).connect(getReverb());
  const panner = new Tone.Panner(0).connect(gain);
  const filter = new Tone.Filter({
    type: "lowpass",
    frequency: 220,
    rolloff: -24,
    Q: 1.2,
  }).connect(panner);
  const lfo = new Tone.LFO({ frequency: 0.06, min: 140, max: 360 }).start();
  lfo.connect(filter.frequency);
  const oscillators = [
    new Tone.Oscillator({
      type: "sawtooth",
      frequency: 65.4,
      detune: -7,
      volume: -16,
    }),
    new Tone.Oscillator({
      type: "sawtooth",
      frequency: 65.4,
      detune: 7,
      volume: -16,
    }),
    new Tone.Oscillator({ type: "sine", frequency: 130.8, volume: -12 }),
  ];
  oscillators.forEach(oscillator => oscillator.connect(filter).start());
  hum = { gain, panner, filter, lfo, oscillators };
  return hum;
};

// glide the hum toward a note, a position and a loudness over a few seconds
export const setHumTarget = (
  frequency: number,
  level: number,
  pan: number
): void => {
  const { gain, panner, oscillators } = getHum();
  if (level > 0) {
    oscillators[0].frequency.rampTo(frequency, 6);
    oscillators[1].frequency.rampTo(frequency, 6);
    oscillators[2].frequency.rampTo(frequency * 2, 6);
    panner.pan.rampTo(pan, 6);
  }
  gain.gain.rampTo(
    Math.min(Math.max(level, 0), 1) * HUM_MAX_GAIN,
    level > 0 ? 5 : 8
  );
};

export const hasHum = (): boolean => hum !== null;

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
  if (!chorus) {
    chorus = new Tone.Chorus({
      frequency: 0.08,
      delayTime: 4,
      depth: 0.35,
      spread: 120,
      wet: 0.18,
    }).start();
    chorus.connect(getReverb());
  }
  return chorus;
};

const getAmbientFilter = (): InstanceType<ToneType["Filter"]> => {
  if (!ambientFilter) {
    ambientFilter = new Tone.Filter({
      type: "lowpass",
      frequency: 680,
      rolloff: -24,
      Q: 0.7,
    });
    ambientFilter.connect(getChorus());
  }
  return ambientFilter;
};

export const disposeToneNodes = (): void => {
  lanes.forEach((lane, index) => {
    if (!lane) return;
    lane.pad.releaseAll();
    lane.bell.releaseAll();
    lane.pad.dispose();
    lane.bell.dispose();
    lane.panner.dispose();
    lane.bellPanner.dispose();
    lanes[index] = null;
  });

  if (hum) {
    hum.oscillators.forEach(oscillator => oscillator.stop().dispose());
    hum.lfo.stop().dispose();
    hum.filter.dispose();
    hum.panner.dispose();
    hum.gain.dispose();
    hum = null;
  }

  bassSynth?.dispose();
  bassSynth = null;
  bassFilter?.dispose();
  bassFilter = null;

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
