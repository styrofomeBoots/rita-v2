export interface City {
  name: string;
  slug: string;
  mapZoom: number;
  mapCenter: [number, number];
  isAvailable: boolean;
}

export interface Response {
  data: Data;
  last_updated: number;
  ttl: number;
  version: string;
}

export interface Data {
  stations: StationInformation[] | StationStatus[];
}

export interface StationInformation {
  region_id?: string;
  rental_uris: RentalUris;
  station_id: string;
  short_name: string;
  has_kiosk: boolean;
  station_type: StationType;
  eightd_has_key_dispenser: boolean;
  external_id: string;
  electric_bike_surcharge_waiver: boolean;
  rental_methods: RentalMethod[];
  lon: number;
  name: string;
  capacity: number;
  lat: number;
  eightd_station_services: any[];
}

export interface StationStatus {
  num_scooters_unavailable?: number;
  num_docks_disabled: number;
  num_docks_available: number;
  is_returning: number;
  num_ebikes_available: number;
  num_scooters_available?: number;
  is_renting: number;
  num_bikes_disabled: number;
  last_reported: number;
  eightd_has_available_keys: boolean;
  is_installed: number;
  station_id: string;
  num_bikes_available: number;
  legacy_id: string;
}

export enum RentalMethod {
  CreditCard = "CREDITCARD",
  Key = "KEY",
}

export interface RentalUris {
  android: string;
  ios: string;
}

export enum StationType {
  Classic = "classic",
}
