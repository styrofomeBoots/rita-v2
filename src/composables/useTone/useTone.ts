import { ref } from "vue";
import {
  importToneJs,
  getToneIndex,
  buildNote,
  SCALES,
  OCTAVES,
} from "./useTone.helpers";
import { UseTone, BuildNoteOptions, ToneType, Octave, Note } from "./useTone.types";
import { Extent } from "ol/extent";
import { Coordinate } from "ol/coordinate";
let Tone: ToneType; // import * as Tone from "tone";

// coordinates are [lon, lat]
// extent is [lonMin (west), latMin (south), lonMax (east), latMax (west)]

const soundEnabled = ref(false);
const scale = ref(SCALES.c.pentatonic);
const scaleStep = ref(0);
const octaveStep = ref(0);
const scaleMin = ref(0);
const octaveMin = ref(0);

export const useTone = (): UseTone => {
  const toggleSoundEnabled = async (): Promise<void> => {
    soundEnabled.value = !soundEnabled.value;
    if (soundEnabled.value && !Tone) {
      await importToneJs();
      Tone = await importToneJs();
    }
  };

  const playTone = async (
    coordinate: Coordinate,
    options = {} as BuildNoteOptions
  ): Promise<void> => {
    if (!soundEnabled.value) return;
    const noteIndex = getToneIndex(
      coordinate[0],
      scaleMin.value,
      scaleStep.value,
      scale.value.length
    );
    const octaveIndex = getToneIndex(
      coordinate[1],
      octaveMin.value,
      octaveStep.value,
      OCTAVES.length
    );
    const note = scale.value[noteIndex] as Note;
    const octave = OCTAVES[octaveIndex] as Octave;
    const baseNote = buildNote(note, octave, options);
    await Tone.loaded();
    baseNote.start();
  };

  const setToneSteps = (extent: Extent): void => {
    scaleMin.value = extent[0];
    octaveMin.value = extent[1];
    const lonMax = extent[2];
    const latMax = extent[3];
    scaleStep.value = (lonMax - scaleMin.value) / scale.value.length;
    octaveStep.value = (latMax - octaveMin.value) / OCTAVES.length;
  };

  return { soundEnabled, toggleSoundEnabled, playTone, setToneSteps };
};
