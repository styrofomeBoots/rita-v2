import { ref, Ref } from "vue";
import {
  buildNote,
  Note,
  Octave,
  BuildNoteOptions,
  importToneJs,
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

let Tone: ToneModule;
const soundEnabled = ref(false);

export const useTone = (): UseTone => {
  const toggleSoundEnabled = async (): Promise<void> => {
    soundEnabled.value = !soundEnabled.value;
    if (soundEnabled.value && !Tone) {
      Tone = await importToneJs();
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
