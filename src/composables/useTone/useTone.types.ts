import { Coordinate } from "ol/coordinate";
import { Extent } from "ol/extent";
import { Ref } from "vue";

export interface UseTone {
  soundEnabled: Ref<boolean>;
  selectedScaleId: Ref<ScaleId>;
  selectableScales: Ref<ToneScaleOption[]>;
  toggleSoundEnabled: () => Promise<void>;
  playTone: (event: ToneEvent) => Promise<void>;
  setToneSteps: (extent: Extent) => void;
  disposeTone: () => void;
}

export type ToneType = typeof import("tone");
export type Note = "Bb" | "C" | "D" | "Eb" | "E" | "F" | "G" | "A" | "B";
export type Octave = 1 | 2 | 3 | 4 | 5;
export type ScaleId =
  | "cOpen"
  | "cMajorPentatonic"
  | "cMinorPentatonic"
  | "cMajor";

export interface ToneScaleOption {
  id: ScaleId;
  label: string;
  notes: Note[];
}

export interface ToneEvent {
  coordinate: Coordinate;
  bikesDelta: number;
  isSynthetic: boolean;
}

export interface ToneNote {
  note: Note;
  octave: Octave;
}

export interface TonePattern {
  notes: ToneNote[];
  duration: number;
  velocity: number;
  filterFrequency: number;
}
