import * as Tone from "tone";

const NOTES = ["G", "A", "B", "C", "D", "E", "F"];
const OCTAVES = [1, 2, 3, 4, 5];
const SF_URL = "https://gleitz.github.io/midi-js-soundfonts";
const LIBRARIES = {
  musyng: "MusyngKite",
  fluid: "FluidR3_GM",
  fatBoy: "FatBoy",
};
const INSTRUMENTS = {
  clavinet: "clavinet-mp3",
  piano: "electric_piano_1-mp3",
  guitarHarmonics: "guitar_harmonics-mp3",
  cello: "cello-mp3",
};

const fadeIn = 0.1;
const fadeOut = 3;
const library = LIBRARIES.musyng;
const instrument = INSTRUMENTS.piano;

const useHarmony = false;
const hFadeIn = 0.1;
const hFadeOut = 3;
const hNote = NOTES[0];
const hOctave = OCTAVES[3];
const hLibrary = LIBRARIES.musyng;
const hInstrument = INSTRUMENTS.piano;

export const playTone = async (note: string, octave: number): Promise<void> => {
  const baseNote = new Tone.Player(
    `${SF_URL}/${library}/${instrument}/${note + octave}.mp3`
  );
  baseNote.fadeIn = fadeIn;
  baseNote.fadeOut = fadeOut;
  const reverb = new Tone.Reverb({
    decay: 20,
    preDelay: 0.01,
    wet: 0.1,
  }).toDestination();
  // const freeverb = new Tone.Freeverb({
  //   roomSize: 0.5,
  //   dampening: 4,
  // }).toDestination();
  baseNote.connect(reverb);
  // baseNote.connect(freeverb);
  let harmonyNote;
  if (useHarmony) {
    harmonyNote = new Tone.Player(
      `${SF_URL}/${hLibrary}/${hInstrument}/${hNote + hOctave}.mp3`
    ).toDestination();
    harmonyNote.fadeIn = hFadeIn;
    harmonyNote.fadeOut = hFadeOut;
  }

  await Tone.loaded();
  baseNote.start();
  if (useHarmony) harmonyNote.start();
};
