import { Extent } from "ol/extent";
import { Ref } from "vue";

export interface UseTone {
  soundEnabled: Ref<boolean>;
  toggleSoundEnabled: () => void;
  playTone: (
    note: Note,
    octave: Octave,
    options?: BuildNoteOptions
  ) => Promise<void>;
  setSteps: (extent: Extent) => void;
}

export type ToneType = typeof import("tone");
export type Note = "G" | "A" | "B" | "C" | "D" | "E" | "F";
export type Octave = 1 | 2 | 3 | 4 | 5;

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
