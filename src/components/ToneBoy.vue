<!-- <script setup lang="ts">
import * as Tone from "tone";
import { ref } from "vue";

const NOTES = ref(["G", "A", "B", "C", "D", "E", "F"]);
const OCTAVES = ref([1, 2, 3, 4, 5]);
const SF_URL = "https://gleitz.github.io/midi-js-soundfonts";
const LIBRARIES = ref({
  musyng: "MusyngKite",
  fluid: "FluidR3_GM",
  fatBoy: "FatBoy",
});
const INSTRUMENTS = ref({
  clavinet: "clavinet-mp3",
  piano: "electric_piano_1-mp3",
  guitarHarmonics: "guitar_harmonics-mp3",
  cello: "cello-mp3",
});

const note = ref(NOTES.value[0]);
const fadeIn = ref(0.1);
const fadeOut = ref(3);
const octave = ref(OCTAVES.value[3]);
const library = ref(LIBRARIES.value.musyng);
const instrument = ref(INSTRUMENTS.value.piano);

const useHarmony = ref(true);
const hFadeIn = ref(0.1);
const hFadeOut = ref(3);
const hNote = ref(NOTES.value[0]);
const hOctave = ref(OCTAVES.value[3]);
const hLibrary = ref(LIBRARIES.value.musyng);
const hInstrument = ref(INSTRUMENTS.value.piano);

async function playTone(): Promise<void> {
  const baseNote = new Tone.Player(
    `${SF_URL}/${library.value}/${instrument.value}/${note.value + octave.value}.mp3`
  );
  baseNote.fadeIn = fadeIn.value;
  baseNote.fadeOut = fadeOut.value;
  const reverb = new Tone.Reverb({
    decay: 20,
    preDelay: 0.01,
    wet: 0.9,
  }).toDestination();
  const chorus = new Tone.Freeverb({
    roomSize: 0.5,
    dampening: 4,
  }).toDestination();
  let harmonyNote;
  if (useHarmony.value) {
    harmonyNote = new Tone.Player(
      `${SF_URL}/${hLibrary.value}/${hInstrument.value}/${hNote.value + hOctave.value}.mp3`
    ).toDestination();
    harmonyNote.fadeIn = hFadeIn.value;
    harmonyNote.fadeOut = hFadeOut.value;
  }
  baseNote.connect(reverb);
  baseNote.connect(chorus);
  await Tone.loaded();
  baseNote.start();
  if (useHarmony.value) harmonyNote.start();
}

function findHarmonyNote(note: string, interval: number): string {
  const noteIndex = NOTES.indexOf(note);
  const harmonyIndex = (noteIndex + interval) % NOTES.length;
  return NOTES[harmonyIndex];
}
function buildTone(update: { note: string; octave: number; isReturn: boolean }) {
  const baseNote = update.note;
  const baseOctave = update.octave;
  const stepDirection = update.isReturn ? 1 : -1;
  const harmonyNote = findHarmonyNote(update.note, harmonyStep.value);
  console.log(harmonyNote);
  let harmonyOctave: number;
  if (baseOctave === 1 || baseOctave === 5) {
    harmonyOctave = baseOctave;
  } else {
    harmonyOctave = baseOctave + stepDirection;
  }
  return { baseNote, baseOctave, harmonyOctave, harmonyNote };
}
</script>
<template>
  <label class="w-full">
    <div class="label">
      <span class="label-text"></span>
    </div>
  </label>
  <div class="mt-28 flex justify-center">
    <div class="rounded-xl border-2 p-4">
      <div class="flex gap-12">
        <div>
          <div class="text-lg">base note</div>
          <div class="flex gap-2">
            <label class="w-full">
              <div class="label">
                <span class="label-text">note</span>
              </div>
              <select v-model="note" class="select select-bordered w-full max-w-xs">
                <option v-for="n in NOTES" :key="n">
                  {{ n }}
                </option>
              </select>
            </label>
            <label class="w-full">
              <div class="label">
                <span class="label-text">octave</span>
              </div>
              <select
                v-model="octave"
                class="select select-bordered w-full max-w-xs"
              >
                <option v-for="o in OCTAVES" :key="o">
                  {{ o }}
                </option>
              </select>
            </label>
          </div>
          <div class="flex gap-2">
            <label class="w-full">
              <div class="label">
                <span class="label-text">fade in</span>
              </div>
              <input
                v-model="fadeIn"
                type="number"
                class="input input-bordered w-full"
                min="0"
                max="10"
                step=".1"
              />
            </label>
            <label class="w-full">
              <div class="label">
                <span class="label-text">fade out</span>
              </div>
              <input
                v-model="fadeOut"
                type="number"
                class="input input-bordered w-full"
                min="0"
                max="10"
                step=".1"
              />
            </label>
          </div>
          <label class="w-full">
            <div class="label">
              <span class="label-text">library</span>
            </div>
            <select v-model="library" class="select select-bordered w-full max-w-xs">
              <option v-for="lib in LIBRARIES" :key="lib">
                {{ lib }}
              </option>
            </select>
          </label>
          <label class="w-full">
            <div class="label">
              <span class="label-text">instrument</span>
            </div>
            <select
              v-model="instrument"
              class="select select-bordered w-full max-w-xs"
            >
              <option v-for="inst in INSTRUMENTS" :key="inst">
                {{ inst }}
              </option>
            </select>
          </label>
        </div>
        <div>
          <div class="text-lg">harmony note</div>
          <div class="flex gap-2">
            <label class="w-full">
              <div class="label">
                <span class="label-text">note</span>
              </div>
              <select v-model="hNote" class="select select-bordered w-full max-w-xs">
                <option v-for="n in NOTES" :key="n">
                  {{ n }}
                </option>
              </select>
            </label>
            <label class="w-full">
              <div class="label">
                <span class="label-text">octave</span>
              </div>
              <select
                v-model="hOctave"
                class="select select-bordered w-full max-w-xs"
              >
                <option v-for="o in OCTAVES" :key="o">
                  {{ o }}
                </option>
              </select>
            </label>
          </div>
          <div class="flex gap-2">
            <label class="w-full">
              <div class="label">
                <span class="label-text">fade in</span>
              </div>
              <input
                v-model="hFadeIn"
                type="number"
                class="input input-bordered w-full"
                min="0"
                max="10"
                step=".1"
              />
            </label>
            <label class="w-full">
              <div class="label">
                <span class="label-text">fade out</span>
              </div>
              <input
                v-model="hFadeOut"
                type="number"
                class="input input-bordered w-full"
                min="0"
                max="10"
                step=".1"
              />
            </label>
          </div>
          <label class="w-full">
            <div class="label">
              <span class="label-text">library</span>
            </div>
            <select
              v-model="hLibrary"
              class="select select-bordered w-full max-w-xs"
            >
              <option v-for="lib in LIBRARIES" :key="lib">
                {{ lib }}
              </option>
            </select>
          </label>
          <label class="w-full">
            <div class="label">
              <span class="label-text">instrument</span>
            </div>
            <select
              v-model="hInstrument"
              class="select select-bordered w-full max-w-xs"
            >
              <option v-for="inst in INSTRUMENTS" :key="inst">
                {{ inst }}
              </option>
            </select>
          </label>
        </div>
      </div>
      <div class="flex justify-end pt-2">
        <button class="btn btn-outline" @click="playTone">play tone</button>
      </div>
    </div>
  </div>
</template> -->
