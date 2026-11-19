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
  cities,
  getRandomInterval,
  getStationBounds,
  getStations,
  getStationStatuses,
  isWithinStationBounds,
} from "./useStations.helpers";

const isReady = ref(false);

// ?city=chicago or ?city=new-york-city opens that city. bay area otherwise.
const DEFAULT_CITY = "bay area";
const cityFromUrl = (): City => {
  const fallback = cities.find(city => city.city === DEFAULT_CITY) ?? cities[0];
  const query = new URLSearchParams(window.location.search).get("city");
  if (!query) return fallback;
  const name = query
    .toLowerCase()
    .replace(/[-_+]+/g, " ")
    .trim();
  return cities.find(city => city.city === name) ?? fallback;
};
const writeCityToUrl = (city: City): void => {
  const url = new URL(window.location.href);
  url.searchParams.set("city", city.city.replace(/ /g, "-"));
  window.history.replaceState(null, "", url);
};

const selectedCity = ref<City>(cityFromUrl());
const selectableCities = ref<City[]>(cities);
const stations = ref<Stations>({});
const lastStationUpdate = ref(0);
const feedTtl = ref(60);
const feedError = ref(false);
// name of a station in the busiest part of the map right now, set by the map
const hotSpot = ref<string | null>(null);
const ambientActivityEnabled = ref(true);
const stationUpdate = ref<StationUpdate | null>(null);
const stationUpdates = ref<StationUpdate[]>([]);
const stationBounds = ref<StationBounds | null>(null);
const pollingTimeoutId = ref<number | null>(null);
const ambientActivityTimeoutId = ref<number | null>(null);
const lastRealUpdateAt = ref(0);
// real updates waiting for their turn. cleared on city change.
const pendingUpdateTimeouts = new Set<number>();
const MAX_VISIBLE_UPDATES = 30;
// a big city at rush hour can change hundreds of stations in one refresh.
// past this many, the biggest changes win and the rest are skipped.
const MAX_UPDATES_PER_REFRESH = 90;
// ambient activity only fills in after this long without a real update
const QUIET_BEFORE_AMBIENT_MS = 9000;

const clearPollingTimeout = (): void => {
  if (pollingTimeoutId.value === null) return;
  clearTimeout(pollingTimeoutId.value);
  pollingTimeoutId.value = null;
};

const clearPendingUpdates = (): void => {
  for (const id of pendingUpdateTimeouts) clearTimeout(id);
  pendingUpdateTimeouts.clear();
};

const clearAmbientActivityTimeoutId = (): void => {
  if (ambientActivityTimeoutId.value === null) return;
  clearTimeout(ambientActivityTimeoutId.value);
  ambientActivityTimeoutId.value = null;
};

const shuffle = <T>(items: T[]): T[] => {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

watch(
  selectedCity,
  () => {
    writeCityToUrl(selectedCity.value);
    useStations().resetStations();
    useStations().startStationPolling();
  },
  { deep: true }
);

export const useStations = (): UseStations => {
  const playStationUpdate = (update: StationUpdate): void => {
    if (
      !isWithinStationBounds(
        update.coordinate[0],
        update.coordinate[1],
        stationBounds.value
      )
    ) {
      return;
    }
    if (!update.isSynthetic) lastRealUpdateAt.value = Date.now();

    stationUpdate.value = update;
    stationUpdates.value.unshift(update);
    if (stationUpdates.value.length > MAX_VISIBLE_UPDATES) {
      stationUpdates.value.length = MAX_VISIBLE_UPDATES;
    }
  };

  // feeds only refresh every ttl seconds (usually 60), so every change arrives
  // at once. spread them back out over the window so the city plays at the
  // pace it actually moved, busy at rush hour and sparse at 3am.
  const spreadStationUpdates = (
    updates: StationUpdate[],
    windowMs: number
  ): void => {
    const kept =
      updates.length > MAX_UPDATES_PER_REFRESH
        ? [...updates]
            .sort((a, b) => Math.abs(b.bikesDelta) - Math.abs(a.bikesDelta))
            .slice(0, MAX_UPDATES_PER_REFRESH)
        : updates;
    const ordered = shuffle(kept);
    const slot = windowMs / Math.max(ordered.length, 1);

    ordered.forEach((update, index) => {
      // a little jitter inside each slot so it never sounds like a metronome
      const delay = slot * index + Math.random() * slot * 0.8;
      const id = setTimeout(() => {
        pendingUpdateTimeouts.delete(id);
        playStationUpdate(update);
      }, delay) as unknown as number;
      pendingUpdateTimeouts.add(id);
    });
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

    // synthetic updates are only shown, never written back to the station,
    // so the next real refresh does not report our made up change as real
    playStationUpdate({
      id: `synthetic-${candidate.station.station_id}-${Date.now()}`,
      stationId: candidate.station.station_id,
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
        const isQuiet =
          Date.now() - lastRealUpdateAt.value > QUIET_BEFORE_AMBIENT_MS;
        if (isQuiet) createSyntheticStationUpdate();
        scheduleAmbientActivityUpdate();
      },
      getRandomInterval(2500, 6000)
    ) as unknown as number;
  };

  const schedulePoll = (): void => {
    clearPollingTimeout();
    // poll a bit faster than the ttl so a refresh is never missed by much
    const seconds = Math.min(Math.max(feedTtl.value / 4, 5), 15);
    pollingTimeoutId.value = setTimeout(async () => {
      await getStationUpdates();
      schedulePoll();
    }, seconds * 1000) as unknown as number;
  };

  const setupStations = async (): Promise<void> => {
    try {
      const stationData = await getStations(selectedCity.value.url);
      stations.value = stationData.stations;
      lastStationUpdate.value = stationData.lastStationUpdate;
      stationBounds.value = getStationBounds(stationData.stations);
      feedError.value = false;
      isReady.value = true;
      scheduleAmbientActivityUpdate();
      schedulePoll();
    } catch {
      feedError.value = true;
    }
  };

  const getStationUpdates = async (): Promise<void> => {
    let stationData;
    try {
      stationData = await getStationStatuses(selectedCity.value.url);
    } catch {
      // a missed refresh is fine, the next one catches up
      return;
    }
    if (stationData.last_updated === lastStationUpdate.value) return;

    if (stationData.ttl > 0) feedTtl.value = stationData.ttl;
    const elapsed = stationData.last_updated - lastStationUpdate.value;
    lastStationUpdate.value = stationData.last_updated;
    const windowMs = Math.min(Math.max(elapsed, 10), 90) * 1000;

    const updates: StationUpdate[] = [];
    for (const status of stationData.data.stations as StationStatus[]) {
      const station = stations.value[status.station_id];
      if (!station) continue;
      if (status.num_bikes_available === station.num_bikes_available) {
        Object.assign(station, status);
        continue;
      }

      const bikesDelta = status.num_bikes_available - station.num_bikes_available;
      Object.assign(station, status);
      updates.push({
        id: `${status.station_id}-${stationData.last_updated}`,
        stationId: status.station_id,
        name: station.name,
        coordinate: [station.lon, station.lat],
        bikesDelta,
        isSynthetic: false,
      });
    }

    spreadStationUpdates(updates, windowMs);
  };

  const startStationPolling = (): void => {
    clearPollingTimeout();
    void setupStations();
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
    feedError.value = false;
    hotSpot.value = null;
    stations.value = {};
    lastStationUpdate.value = 0;
    feedTtl.value = 60;
    stationUpdate.value = null;
    stationUpdates.value = [];
    stationBounds.value = { min: [0, 0], max: [0, 0] };
    clearPollingTimeout();
    clearPendingUpdates();
    clearAmbientActivityTimeoutId();
  };

  return {
    isReady,
    stations,
    selectableCities,
    selectedCity,
    ambientActivityEnabled,
    feedError,
    hotSpot,
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
