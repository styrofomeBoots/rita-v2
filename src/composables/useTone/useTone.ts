import { ref, Ref } from "vue";
import {
  buildNote,
  Note,
  Octave,
  BuildNoteOptions,
  importTone,
  ToneModule,
} from "./useTone.helpers";

export interface UseTone {
  soundEnabled: Ref<boolean>;
  toggleSoundEnabled: () => void;
  playTone: (
    note: Note,
    octave: Octave,
    options?: BuildNoteOptions
  ) => Promise<void>;
}

const soundEnabled = ref(false);

let Tone: ToneModule;
export const useTone = (): UseTone => {
  const toggleSoundEnabled = async (): Promise<void> => {
    soundEnabled.value = !soundEnabled.value;
    if (soundEnabled.value && !Tone) {
      Tone = await importTone();
    }
  };

  const playTone = async (
    note: Note,
    octave: Octave,
    options = {} as BuildNoteOptions
  ): Promise<void> => {
    if (!soundEnabled.value) return;
    const baseNote = buildNote(note, octave, options);
    await Tone.loaded();
    baseNote.start();
  };

  return { soundEnabled, toggleSoundEnabled, playTone };
};
