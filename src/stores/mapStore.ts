import { defineStore } from "pinia";
import { ref } from "vue";
import { getStationInformation, getStationStatus } from "@/api/station.api";
import type { StationInformation, StationStatus } from "@/api/station.api";

interface Station extends StationInformation, StationStatus {
  note: string;
  octave: number;
}

interface Stations {
  [station_id: string]: Station;
}

interface Bounds {
  min: number;
  max: number;
}

interface MapBounds {
  lat: Bounds;
  lon: Bounds;
}

const NOTES = ["G", "A", "B", "C", "D", "E", "F"];
const OCTAVES = [1, 2, 3, 4, 5];

export const useMapStore = defineStore("mapStore", () => {
  const stations = ref<Stations>({});
  const mapBounds = ref<MapBounds>({
    lat: { min: Infinity, max: -Infinity },
    lon: { min: Infinity, max: -Infinity },
  });

  const getMapBounds = (stations: StationInformation[]): void => {
    const bounds = {
      lat: { min: Infinity, max: -Infinity },
      lon: { min: Infinity, max: -Infinity },
    };
    for (const { lat, lon } of stations) {
      if (lat > bounds.lat.max) bounds.lat.max = lat;
      if (lat < bounds.lat.min) bounds.lat.min = lat;
      if (lon > bounds.lon.max) bounds.lon.max = lon;
      if (lon < bounds.lon.min) bounds.lon.min = lon;
    }

    mapBounds.value = bounds;
  };

  const setupStations = async (): Promise<void> => {
    stations.value = {};
    const stationInformation = await getStationInformation();
    const stationsStatus = await getStationStatus();

    for (const info of stationInformation) {
      stations.value[info.station_id] = { ...info } as Station;
    }

    for (const status of stationsStatus) {
      if (stations.value[status.station_id]) {
        Object.assign(stations.value[status.station_id], status);
      }
    }

    getMapBounds(stationInformation);
    const latStep =
      (mapBounds.value.lat.max - mapBounds.value.lat.min) / OCTAVES.length;
    const lonStep =
      (mapBounds.value.lon.max - mapBounds.value.lon.min) / NOTES.length;

    for (const stationId in stations.value) {
      const station = stations.value[stationId];
      const octaveIndex = Math.min(
        Math.floor((station.lat - mapBounds.value.lat.min) / latStep),
        OCTAVES.length - 1
      );
      station.octave = OCTAVES[octaveIndex];

      const noteIndex = Math.min(
        Math.floor((station.lon - mapBounds.value.lon.min) / lonStep),
        NOTES.length - 1
      );
      station.note = NOTES[noteIndex];
    }
  };

  return { getMapBounds, setupStations, stations };
});
