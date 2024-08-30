import { defineStore } from "pinia";
import { ref, onMounted, onUnmounted } from "vue";
import { Stations, getStations, getStationStatus } from "@/api/station.api";
import {
  EMPTY_BOUNDS,
  MapBounds,
  StationUpdate,
  getMapBounds,
  getRandomInterval,
  getStationNotesAndOctaves,
} from "./mapStore.helpers";

export const useMapStore = defineStore("mapStore", () => {
  const isReady = ref(false);
  const stations = ref<Stations>({});
  const stagedStationUpdates = ref<StationUpdate[]>([]);
  const stationUpdates = ref<StationUpdate[]>([]);
  const mapBounds = ref<MapBounds>(EMPTY_BOUNDS);
  const pollingInterval = ref<number | null>(null);
  const timeoutId = ref<number | null>(null);

  const setupStations = async (): Promise<void> => {
    const stationData = await getStations();
    mapBounds.value = getMapBounds(stationData);
    stations.value = getStationNotesAndOctaves(stationData, mapBounds.value);
    isReady.value = true;
  };

  const updateStations = async (): Promise<void> => {
    const stationStatuses = await getStationStatus();
    for (const status of stationStatuses) {
      if (!stations.value[status.station_id]) continue;
      const station = stations.value[status.station_id];
      if (status.num_bikes_available !== station.num_bikes_available) {
        const stationUpdate: StationUpdate = {
          name: station.name,
          lat: station.lat,
          lon: station.lon,
          note: station.note,
          octave: station.octave,
          bikesDelta: status.num_bikes_available - station.num_bikes_available,
        };
        stations.value[status.station_id] = { ...station, ...status };
        stagedStationUpdates.value.push(stationUpdate);
      }
    }
    if (stagedStationUpdates.value.length > 0 && timeoutId.value === null) {
      processStagedUpdates();
    }
  };

  const startPolling = (): void => {
    setupStations();
    pollingInterval.value = setInterval(updateStations, 5000) as unknown as number;
  };

  const processStagedUpdates = (): void => {
    if (stagedStationUpdates.value.length === 0) {
      if (timeoutId.value !== null) {
        clearTimeout(timeoutId.value);
        timeoutId.value = null;
      }
      return;
    }
    const randomIndex = Math.floor(
      Math.random() * stagedStationUpdates.value.length
    );
    const update = stagedStationUpdates.value.splice(randomIndex, 1)[0];
    if (update) stationUpdates.value.unshift(update);
    const randomInterval = getRandomInterval(500, 7500);
    timeoutId.value = setTimeout(() => {
      processStagedUpdates();
    }, randomInterval) as unknown as number;
  };

  const resetStore = (): void => {
    stations.value = {};
    stagedStationUpdates.value = [];
    stationUpdates.value = [];
    mapBounds.value = EMPTY_BOUNDS;
    if (pollingInterval.value !== null) {
      clearInterval(pollingInterval.value);
      pollingInterval.value = null;
    }
    if (timeoutId.value !== null) {
      clearTimeout(timeoutId.value);
      timeoutId.value = null;
    }
  };

  onMounted(() => startPolling());

  onUnmounted(() => {
    resetStore();
  });

  return {
    isReady,
    stations,
    stationUpdates,
    mapBounds,
    getMapBounds,
    setupStations,
    startPolling,
    resetStore,
  };
});
