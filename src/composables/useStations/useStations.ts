import { ref, onMounted, onUnmounted } from "vue";
import {
  UseStations,
  StationBounds,
  Stations,
  StationUpdate,
  StationStatus,
} from "./useStation.types";
import {
  getStations,
  getStationStatuses,
  getStationBounds,
  getRandomInterval,
} from "./useStations.helpers";

const isReady = ref(false);
const stations = ref<Stations>({});
const lastStationUpdate = ref(0);
const stagedStationUpdates = ref<StationUpdate[]>([]);
const stationUpdate = ref<StationUpdate | null>(null);
const stationUpdates = ref<StationUpdate[]>([]);
const stationBounds = ref<StationBounds | null>(null);
const pollingInterval = ref<number | null>(null);
const timeoutId = ref<number | null>(null);

const clearPollingInterval = (): void => {
  if (pollingInterval.value === null) return;
  clearInterval(pollingInterval.value);
  pollingInterval.value = null;
};

const clearTimeoutId = (): void => {
  if (timeoutId.value === null) return;
  clearTimeout(timeoutId.value);
  timeoutId.value = null;
};

export const useStations = (): UseStations => {
  const setupStations = async (): Promise<void> => {
    const stationData = await getStations();
    stations.value = stationData.stations;
    lastStationUpdate.value = stationData.lastStationUpdate;
    stationBounds.value = getStationBounds(stationData.stations);
    isReady.value = true;
  };

  const updateStations = async (): Promise<void> => {
    const stationData = await getStationStatuses();
    if (stationData.last_updated === lastStationUpdate.value) return;

    lastStationUpdate.value = stationData.last_updated;
    for (const status of stationData.data.stations as StationStatus[]) {
      if (!stations.value[status.station_id]) continue;

      const station = stations.value[status.station_id];
      if (status.num_bikes_available === station.num_bikes_available) continue;

      stations.value[status.station_id] = { ...station, ...status };
      stagedStationUpdates.value.push({
        name: station.name,
        coordinate: [station.lon, station.lat],
        bikesDelta: status.num_bikes_available - station.num_bikes_available,
      });
    }

    if (stagedStationUpdates.value.length > 0 && timeoutId.value === null) {
      selectStagedUpdate();
    }
  };

  const selectStagedUpdate = (): void => {
    if (stagedStationUpdates.value.length === 0) {
      clearTimeoutId();
      return;
    }

    stationUpdate.value = stagedStationUpdates.value.splice(
      Math.floor(Math.random() * stagedStationUpdates.value.length),
      1
    )[0];
    if (stationUpdate.value) stationUpdates.value.unshift(stationUpdate.value);

    const randomInterval = getRandomInterval(2000, 7500);
    timeoutId.value = setTimeout(() => {
      selectStagedUpdate();
    }, randomInterval) as unknown as number;
  };

  const startStationPolling = (): void => {
    setupStations();
    pollingInterval.value = setInterval(updateStations, 5000) as unknown as number;
  };

  const resetStations = (): void => {
    isReady.value = false;
    stations.value = {};
    lastStationUpdate.value = 0;
    stagedStationUpdates.value = [];
    stationUpdate.value = null;
    stationUpdates.value = [];
    stationBounds.value = { min: [0, 0], max: [0, 0] };
    clearPollingInterval();
    clearTimeoutId();
  };

  onMounted(() => {
    if (pollingInterval.value !== null) return;
    startStationPolling();
  });

  onUnmounted(() => resetStations());

  return {
    isReady,
    stations,
    stationUpdate,
    stationUpdates,
    stationBounds,
    setupStations,
    updateStations,
    startStationPolling,
    resetStations,
  };
};
