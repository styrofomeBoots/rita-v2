import { Extent } from "ol/extent";
import { computed, ref, watch } from "vue";
import {
  buildTonePattern,
  disposeToneNodes,
  ensureReverbReady,
  getAmbientSynth,
  getScaleById,
  getToneIndex,
  importToneJs,
  OCTAVES,
  SCALE_OPTIONS,
  setAmbientFilterFrequency,
} from "./useTone.helpers";
import { ScaleId, ToneEvent, ToneType, UseTone } from "./useTone.types";
let Tone: ToneType;

// coordinates are [lon, lat]
// extent is [lonMin (west), latMin (south), lonMax (east), latMax (west)]

const soundEnabled = ref(false);
const selectedScaleId = ref<ScaleId>("cOpen");
const selectableScales = ref(SCALE_OPTIONS);
const scale = computed(() => getScaleById(selectedScaleId.value).notes);
const scaleStep = ref(0);
const octaveStep = ref(0);
const scaleMin = ref(0);
const octaveMin = ref(0);
const lastExtent = ref<Extent | null>(null);

const updateToneSteps = (extent: Extent): void => {
  scaleMin.value = extent[0];
  octaveMin.value = extent[1];
  const lonMax = extent[2];
  const latMax = extent[3];
  scaleStep.value = (lonMax - scaleMin.value) / scale.value.length;
  octaveStep.value = (latMax - octaveMin.value) / OCTAVES.length;
};

watch(selectedScaleId, () => {
  if (!lastExtent.value) return;
  updateToneSteps(lastExtent.value);
});

export const useTone = (): UseTone => {
  const ensureToneModule = async (): Promise<ToneType> => {
    if (!Tone) {
      Tone = await importToneJs();
    }

    return Tone;
  };

  const ensureToneReady = async (): Promise<boolean> => {
    const tone = await ensureToneModule();
    const context = tone.getContext();

    try {
      if (context.state !== "running") {
        await tone.start();
      }
      await ensureReverbReady();
      return true;
    } catch (error) {
      console.error("Unable to start audio playback.", error);
      return false;
    }
  };

  const toggleSoundEnabled = async (): Promise<void> => {
    const nextEnabled = !soundEnabled.value;
    if (!nextEnabled) {
      soundEnabled.value = false;
      disposeToneNodes();
      return;
    }

    soundEnabled.value = await ensureToneReady();
  };

  const playTone = async ({
    coordinate,
    bikesDelta,
    isSynthetic,
  }: ToneEvent): Promise<void> => {
    if (!soundEnabled.value) return;
    const tone = await ensureToneModule();
    if (!(await ensureToneReady())) return;

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
    const pattern = buildTonePattern(
      scale.value,
      OCTAVES,
      noteIndex,
      octaveIndex,
      bikesDelta,
      isSynthetic
    );
    const ambientSynth = getAmbientSynth();
    const startTime = tone.now();
    setAmbientFilterFrequency(pattern.filterFrequency);
    ambientSynth.releaseAll(startTime);
    ambientSynth.triggerAttackRelease(
      pattern.notes.map(({ note, octave }) => `${note}${octave}`),
      pattern.duration,
      startTime,
      pattern.velocity
    );
  };

  const setToneSteps = (extent: Extent): void => {
    lastExtent.value = extent;
    updateToneSteps(extent);
  };

  const disposeTone = (): void => {
    disposeToneNodes();
  };

  return {
    soundEnabled,
    selectedScaleId,
    selectableScales,
    toggleSoundEnabled,
    playTone,
    setToneSteps,
    disposeTone,
  };
};
