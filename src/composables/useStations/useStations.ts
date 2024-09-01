import { ref, onMounted, onUnmounted, watch } from "vue";
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
  isWithinStationBounds,
} from "./useStations.helpers";
import { Extent } from "ol/extent";

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

watch(stationBounds, () => {
  if (!stationBounds.value) return;
  stagedStationUpdates.value = stagedStationUpdates.value.filter(update =>
    isWithinStationBounds(
      update.coordinate[0],
      update.coordinate[1],
      stationBounds.value
    )
  );
});

export const useStations = (): UseStations => {
  const setupStations = async (): Promise<void> => {
    const stationData = await getStations();
    stations.value = stationData.stations;
    lastStationUpdate.value = stationData.lastStationUpdate;
    stationBounds.value = getStationBounds(stationData.stations);
    isReady.value = true;
  };

  const getStationUpdates = async (): Promise<void> => {
    const stationData = await getStationStatuses();
    if (stationData.last_updated === lastStationUpdate.value) return;

    lastStationUpdate.value = stationData.last_updated;
    for (const status of stationData.data.stations as StationStatus[]) {
      if (!stations.value[status.station_id]) continue;

      const station = stations.value[status.station_id];
      if (!isWithinStationBounds(station.lon, station.lat, stationBounds.value)) {
        continue;
      }

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
    const update = stagedStationUpdates.value.splice(
      Math.floor(Math.random() * stagedStationUpdates.value.length),
      1
    )[0];
    if (
      !isWithinStationBounds(
        update.coordinate[0],
        update.coordinate[1],
        stationBounds.value
      )
    )
      return;

    stationUpdate.value = update;
    if (stationUpdate.value) stationUpdates.value.unshift(stationUpdate.value);
    if (stationUpdates.value.length > 2000) stationUpdates.value.length = 30;

    const randomInterval = getRandomInterval(2000, 7500);
    timeoutId.value = setTimeout(() => {
      selectStagedUpdate();
    }, randomInterval) as unknown as number;
  };

  const startStationPolling = (): void => {
    setupStations();
    pollingInterval.value = setInterval(
      getStationUpdates,
      5000
    ) as unknown as number;
  };

  const updateStationBounds = (extent: Extent): void => {
    stationBounds.value = {
      min: [extent[0], extent[1]],
      max: [extent[2], extent[3]],
    };
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
    getStationUpdates,
    startStationPolling,
    updateStationBounds,
    resetStations,
  };
};
