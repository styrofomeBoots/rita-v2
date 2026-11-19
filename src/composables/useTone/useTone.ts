import { Coordinate } from "ol/coordinate";
import { Extent } from "ol/extent";
import { computed, ref, watch } from "vue";
import {
  buildTonePattern,
  disposeToneNodes,
  ensureReverbReady,
  getBassSynth,
  getLane,
  getScaleById,
  hasHum,
  setHumTarget,
  getToneIndex,
  importToneJs,
  LANE_COUNT,
  MAX_PAD_VOICES,
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
// when each recent event played, used to tell how busy the city is right now
const recentEventTimes: number[] = [];
const BIG_CHANGE = 5;

const getEventsPerMinute = (): number => {
  const now = Date.now();
  while (recentEventTimes.length && now - recentEventTimes[0] > 60000) {
    recentEventTimes.shift();
  }
  return recentEventTimes.length;
};

const humanize = (amount: number): number => 1 + (Math.random() * 2 - 1) * amount;

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
    recentEventTimes.push(Date.now());
    const eventsPerMinute = getEventsPerMinute();
    // a busy city plays each note a little softer and the whole thing opens up
    const crowd = 1 / Math.sqrt(Math.max(1, eventsPerMinute / 12));
    setAmbientFilterFrequency(
      420 +
        Math.min(eventsPerMinute, 60) * 11 +
        (pattern.filterFrequency - 520) * 0.4
    );

    const span = scaleStep.value * scale.value.length;
    const position = span > 0 ? (coordinate[0] - scaleMin.value) / span : 0.5;
    const laneIndex = Math.min(
      LANE_COUNT - 1,
      Math.max(0, Math.floor(position * LANE_COUNT))
    );
    const lane = getLane(laneIndex);
    const startTime = tone.now() + Math.random() * 0.03;
    const noteNames = pattern.notes.map(({ note, octave }) => `${note}${octave}`);

    if (lane.pad.activeVoices < MAX_PAD_VOICES) {
      lane.pad.triggerAttackRelease(
        noteNames,
        pattern.duration * humanize(0.15),
        startTime,
        pattern.velocity * crowd * humanize(0.1)
      );
    }

    // real changes get a bell: two quick notes that rise for a checkout and
    // fall for a return. made up activity gets one softer note, so it blends
    // in but a careful ear can still tell.
    {
      const intensity = Math.min(Math.abs(bikesDelta), 3);
      const bellNotes = isSynthetic ? pattern.notes.slice(0, 1) : pattern.notes;
      const softness = isSynthetic ? 0.5 : 1;
      bellNotes.forEach(({ note, octave }, index) => {
        const bellOctave = Math.min(Math.max(octave + 1, 3), 6);
        lane.bell.triggerAttackRelease(
          `${note}${bellOctave}`,
          1.2,
          startTime + index * 0.11 * humanize(0.2),
          (0.28 + intensity * 0.04) * crowd * softness * humanize(0.12)
        );
      });
    }

    if (!isSynthetic && Math.abs(bikesDelta) >= BIG_CHANGE) {
      getBassSynth().triggerAttackRelease(
        bikesDelta < 0 ? "G1" : "C2",
        3.5,
        startTime,
        0.6
      );
    }
  };

  // level 0 fades the hum out. otherwise it glides to the note under the
  // busy area, low in the mix, and pans toward it.
  const setHum = (coordinate: Coordinate | null, level: number): void => {
    if (!Tone) return;
    if (!soundEnabled.value || !coordinate || level <= 0) {
      if (hasHum()) setHumTarget(0, 0, 0);
      return;
    }
    const noteIndex = getToneIndex(
      coordinate[0],
      scaleMin.value,
      scaleStep.value,
      scale.value.length
    );
    const frequency = Tone.Frequency(`${scale.value[noteIndex]}2`).toFrequency();
    const span = scaleStep.value * scale.value.length;
    const position = span > 0 ? (coordinate[0] - scaleMin.value) / span : 0.5;
    setHumTarget(frequency, level, Math.min(Math.max(position * 2 - 1, -0.7), 0.7));
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
    setHum,
    setToneSteps,
    disposeTone,
  };
};
