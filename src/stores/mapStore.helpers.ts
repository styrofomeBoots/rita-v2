import { Stations } from "@/api/station.api";

export interface Bounds {
  min: number;
  max: number;
}

export interface MapBounds {
  lat: Bounds;
  lon: Bounds;
}

export interface StationUpdate {
  name: string;
  lat: number;
  lon: number;
  note: string;
  octave: number;
  bikesDelta: number;
}

export const NOTES = ["G", "A", "B", "C", "D", "E", "F"];
export const OCTAVES = [1, 2, 3, 4, 5];
export const EMPTY_BOUNDS: MapBounds = {
  lat: { min: Infinity, max: -Infinity },
  lon: { min: Infinity, max: -Infinity },
};

export const getRandomInterval = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const getMapBounds = (stations: Stations): MapBounds => {
  const bounds: MapBounds = {
    lat: { min: Infinity, max: -Infinity },
    lon: { min: Infinity, max: -Infinity },
  };
  for (const stationId in stations) {
    const { lat, lon } = stations[stationId];
    if (lat > bounds.lat.max) bounds.lat.max = lat;
    if (lat < bounds.lat.min) bounds.lat.min = lat;
    if (lon > bounds.lon.max) bounds.lon.max = lon;
    if (lon < bounds.lon.min) bounds.lon.min = lon;
  }
  return bounds;
};

export const getStationNotesAndOctaves = (
  stations: Stations,
  mapBounds: MapBounds
): Stations => {
  const latStep = (mapBounds.lat.max - mapBounds.lat.min) / OCTAVES.length;
  const lonStep = (mapBounds.lon.max - mapBounds.lon.min) / NOTES.length;

  for (const stationId in stations) {
    const station = stations[stationId];
    const octaveIndex = Math.min(
      Math.floor((station.lat - mapBounds.lat.min) / latStep),
      OCTAVES.length - 1
    );
    station.octave = OCTAVES[octaveIndex];

    const noteIndex = Math.min(
      Math.floor((station.lon - mapBounds.lon.min) / lonStep),
      NOTES.length - 1
    );
    station.note = NOTES[noteIndex];
  }
  return stations;
};
