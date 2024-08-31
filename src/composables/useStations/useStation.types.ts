import { Ref } from "vue";
import { Coordinate } from "ol/coordinate";

// ---------- COORDINATES ARE [LON, LAT] ----------

export interface UseStations {
  isReady: Ref<boolean>;
  stations: Ref<Stations>;
  stationUpdate: Ref<StationUpdate | null>;
  stationUpdates: Ref<StationUpdate[]>;
  stationBounds: Ref<StationBounds | null>;
  setupStations: () => Promise<void>;
  updateStations: () => Promise<void>;
  startStationPolling: () => void;
  resetStations: () => void;
}

export interface StationResponse {
  data: { stations: StationInformation[] | StationStatus[] };
  last_updated: number;
  ttl: number;
  version: string;
}

export interface StationInformation {
  station_id: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number;
}

export interface StationStatus {
  station_id: string;
  last_reported: number;
  is_renting: number;
  is_returning: number;
  num_bikes_available: number;
  num_bikes_disabled: number;
  num_docks_available: number;
  num_docks_disabled: number;
  num_ebikes_available: number;
}

export type Coordinates = [lon: number, lat: number];

export interface Station extends StationInformation, StationStatus {
  coordinate: Coordinate;
}

export interface Stations {
  [station_id: string]: Station;
}

export interface StationUpdate {
  name: string;
  coordinate: Coordinate;
  bikesDelta: number;
}

export interface StationBounds {
  min: Coordinate;
  max: Coordinate;
}
