import { ref } from "vue";
import { buildNote, importToneJs, SCALES, OCTAVES } from "./useTone.helpers";
import { UseTone, Note, Octave, BuildNoteOptions, ToneType } from "./useTone.types";
import { Extent } from "ol/extent";
let Tone: ToneType; // import * as Tone from "tone";

// coordinates are [lon, lat]
// extent is [minLon (west), minLat (south), maxLon (east), maxLat (west)]

const soundEnabled = ref(false);
const scale = ref(SCALES.c.pentatonic);
const scaleStep = ref(0);
const octaveStep = ref(0);

export const useTone = (): UseTone => {
  const toggleSoundEnabled = async (): Promise<void> => {
    soundEnabled.value = !soundEnabled.value;
    if (soundEnabled.value && !Tone) {
      await importToneJs();
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

  const setSteps = (extent: Extent): void => {
    const lonMin = extent[0];
    const latMin = extent[1];
    const lonMax = extent[2];
    const latMax = extent[3];
    scaleStep.value = (lonMax - lonMin) / scale.value.length;
    octaveStep.value = (latMax - latMin) / OCTAVES.length;
  };

  return { soundEnabled, toggleSoundEnabled, playTone, setSteps };
};
