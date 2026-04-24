import { Extent } from "ol/extent";
import { ref, watch } from "vue";
import {
  City,
  Station,
  StationBounds,
  Stations,
  StationStatus,
  StationUpdate,
  UseStations,
} from "./useStation.types";
import {
  getRandomInterval,
  getSelectableCities,
  getStationBounds,
  getStations,
  getStationStatuses,
  isWithinStationBounds,
} from "./useStations.helpers";

const isReady = ref(false);

const selectedCity = ref<City>({
  city: "bay area",
  url: "https://gbfs.baywheels.com/gbfs/en",
  browsers: ["chrome", "safari"],
});
const selectableCities = ref<City[]>([]);
const stations = ref<Stations>({});
const lastStationUpdate = ref(0);
const ambientActivityEnabled = ref(false);
const stagedStationUpdates = ref<StationUpdate[]>([]);
const stationUpdate = ref<StationUpdate | null>(null);
const stationUpdates = ref<StationUpdate[]>([]);
const stationBounds = ref<StationBounds | null>(null);
const pollingInterval = ref<number | null>(null);
const timeoutId = ref<number | null>(null);
const ambientActivityTimeoutId = ref<number | null>(null);
const MAX_STAGED_UPDATES = 250;
const MAX_VISIBLE_UPDATES = 30;

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

const clearAmbientActivityTimeoutId = (): void => {
  if (ambientActivityTimeoutId.value === null) return;
  clearTimeout(ambientActivityTimeoutId.value);
  ambientActivityTimeoutId.value = null;
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

watch(
  selectedCity,
  () => {
    useStations().resetStations();
    useStations().startStationPolling();
  },
  { deep: true }
);

export const useStations = (): UseStations => {
  const queueStationUpdate = (update: StationUpdate): void => {
    stagedStationUpdates.value.push(update);
    if (stagedStationUpdates.value.length > MAX_STAGED_UPDATES) {
      stagedStationUpdates.value.splice(
        0,
        stagedStationUpdates.value.length - MAX_STAGED_UPDATES
      );
    }

    if (timeoutId.value === null) {
      selectStagedUpdate();
    }
  };

  const getVisibleStations = (): Station[] => {
    return Object.values(stations.value).filter(station =>
      isWithinStationBounds(station.lon, station.lat, stationBounds.value)
    );
  };

  const createSyntheticStationUpdate = (): void => {
    const candidates = getVisibleStations()
      .map(station => ({
        station,
        maxIncrease: Math.min(2, station.capacity - station.num_bikes_available),
        maxDecrease: Math.min(2, station.num_bikes_available),
      }))
      .filter(candidate => candidate.maxIncrease > 0 || candidate.maxDecrease > 0);

    if (candidates.length === 0) return;

    const candidate = candidates[Math.floor(Math.random() * candidates.length)];
    const possibleDeltas = [
      ...Array.from({ length: candidate.maxDecrease }, (_, index) => -(index + 1)),
      ...Array.from({ length: candidate.maxIncrease }, (_, index) => index + 1),
    ];
    const bikesDelta =
      possibleDeltas[Math.floor(Math.random() * possibleDeltas.length)];

    candidate.station.num_bikes_available += bikesDelta;
    candidate.station.num_docks_available = Math.max(
      0,
      candidate.station.capacity - candidate.station.num_bikes_available
    );
    candidate.station.last_reported = Math.floor(Date.now() / 1000);

    queueStationUpdate({
      id: `synthetic-${candidate.station.station_id}-${Date.now()}`,
      name: candidate.station.name,
      coordinate: [candidate.station.lon, candidate.station.lat],
      bikesDelta,
      isSynthetic: true,
    });
  };

  const scheduleAmbientActivityUpdate = (): void => {
    if (!ambientActivityEnabled.value || ambientActivityTimeoutId.value !== null)
      return;

    ambientActivityTimeoutId.value = setTimeout(
      () => {
        ambientActivityTimeoutId.value = null;
        createSyntheticStationUpdate();
        scheduleAmbientActivityUpdate();
      },
      getRandomInterval(2500, 6000)
    ) as unknown as number;
  };

  const setupStations = async (): Promise<void> => {
    selectableCities.value = getSelectableCities();
    const stationData = await getStations(selectedCity.value.url);
    stations.value = stationData.stations;
    lastStationUpdate.value = stationData.lastStationUpdate;
    stationBounds.value = getStationBounds(stationData.stations);
    isReady.value = true;
    scheduleAmbientActivityUpdate();
  };

  const getStationUpdates = async (): Promise<void> => {
    const stationData = await getStationStatuses(selectedCity.value.url);
    if (stationData.last_updated === lastStationUpdate.value) return;

    lastStationUpdate.value = stationData.last_updated;
    for (const status of stationData.data.stations as StationStatus[]) {
      if (!stations.value[status.station_id]) continue;

      const station = stations.value[status.station_id];
      if (!isWithinStationBounds(station.lon, station.lat, stationBounds.value)) {
        continue;
      }

      if (status.num_bikes_available === station.num_bikes_available) continue;

      const bikesDelta = status.num_bikes_available - station.num_bikes_available;
      Object.assign(station, status);
      queueStationUpdate({
        id: `${status.station_id}-${stationData.last_updated}`,
        name: station.name,
        coordinate: [station.lon, station.lat],
        bikesDelta,
        isSynthetic: false,
      });
    }
  };

  const selectStagedUpdate = (): void => {
    let update: StationUpdate | undefined;
    while (stagedStationUpdates.value.length > 0) {
      const candidate = stagedStationUpdates.value.splice(
        Math.floor(Math.random() * stagedStationUpdates.value.length),
        1
      )[0];
      if (
        isWithinStationBounds(
          candidate.coordinate[0],
          candidate.coordinate[1],
          stationBounds.value
        )
      ) {
        update = candidate;
        break;
      }
    }

    if (!update) {
      clearTimeoutId();
      return;
    }

    stationUpdate.value = update;
    if (stationUpdate.value) stationUpdates.value.unshift(stationUpdate.value);
    if (stationUpdates.value.length > MAX_VISIBLE_UPDATES) {
      stationUpdates.value.length = MAX_VISIBLE_UPDATES;
    }

    const randomInterval = getRandomInterval(2000, 7500);
    timeoutId.value = setTimeout(() => {
      timeoutId.value = null;
      selectStagedUpdate();
    }, randomInterval) as unknown as number;
  };

  const startStationPolling = (): void => {
    clearPollingInterval();
    void setupStations();
    pollingInterval.value = setInterval(
      () => void getStationUpdates(),
      5000
    ) as unknown as number;
  };

  const toggleAmbientActivityEnabled = (): void => {
    ambientActivityEnabled.value = !ambientActivityEnabled.value;
    if (!ambientActivityEnabled.value) {
      clearAmbientActivityTimeoutId();
      return;
    }
    scheduleAmbientActivityUpdate();
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
    clearAmbientActivityTimeoutId();
  };

  return {
    isReady,
    stations,
    selectableCities,
    selectedCity,
    ambientActivityEnabled,
    stationUpdate,
    stationUpdates,
    stationBounds,
    setupStations,
    getStationUpdates,
    startStationPolling,
    toggleAmbientActivityEnabled,
    updateStationBounds,
    resetStations,
  };
};
