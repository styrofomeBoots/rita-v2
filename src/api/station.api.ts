import { createAlova } from "alova";
import { axiosRequestAdapter } from "@alova/adapter-axios";
import { Note, Octave } from "@/composables/useTone/useTone.helpers";

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

interface Station extends StationInformation, StationStatus {
  note: Note;
  octave: Octave;
}

export interface Stations {
  [station_id: string]: Station;
}

const alova = createAlova({
  requestAdapter: axiosRequestAdapter(),
  cacheFor: null,
  responded(response) {
    if (response.status >= 400) {
      return Promise.reject(new Error("request error"));
    }
    return response.data;
  },
});

export const getStationInformation = async (): Promise<StationInformation[]> => {
  const response = await alova.Get<StationResponse>(
    "https://gbfs.capitalbikeshare.com/gbfs/en/station_information.json"
  );
  return response.data.stations as StationInformation[];
};

export const getStationStatus = async (): Promise<StationStatus[]> => {
  const response = await alova.Get<StationResponse>(
    "https://gbfs.capitalbikeshare.com/gbfs/en/station_status.json"
  );
  return response.data.stations as StationStatus[];
};

export const getStations = async (): Promise<Stations> => {
  const stations = {};
  const stationInformation = await getStationInformation();
  const stationStatuses = await getStationStatus();

  for (const info of stationInformation) {
    stations[info.station_id] = { ...info } as Station;
  }

  for (const status of stationStatuses) {
    if (stations[status.station_id]) {
      Object.assign(stations[status.station_id], status);
    }
  }

  return stations;
};

// export interface City {
//   name: string;
//   slug: string;
//   mapZoom: number;
//   mapCenter: [number, number];
//   isAvailable: boolean;
// }
// // spell-checker:disable
// export const cities: City[] = [
//   {
//     name: "bay area",
//     slug: "baywheels",
//     mapZoom: 12.5,
//     mapCenter: [-122.364474, 37.790515],
//     isAvailable: false,
//   },
//   {
//     name: "chicago",
//     slug: "divvybikes",
//     mapZoom: 13.1,
//     mapCenter: [-87.629227, 41.876942],
//     isAvailable: false,
//   },
//   {
//     name: "columbus",
//     slug: "cogobikeshare",
//     mapZoom: 13.1,
//     mapCenter: [-82.999207, 39.959423],
//     isAvailable: false,
//   },
//   {
//     name: "washington dc",
//     slug: "capitalbikeshare",
//     mapZoom: 13.1,
//     mapCenter: [-77.036548, 38.892112],
//     isAvailable: false,
//   },
//   {
//     name: "minneapolis",
//     slug: "niceridemn",
//     mapZoom: 13.1,
//     mapCenter: [-93.269558, 44.969344],
//     isAvailable: false,
//   },
//   {
//     name: "new york city",
//     slug: "citibike",
//     mapZoom: 13.1,
//     mapCenter: [-74.007902, 40.707783],
//     isAvailable: false,
//   },
//   {
//     name: "portland",
//     slug: "biketownpdx",
//     mapZoom: 13.1,
//     mapCenter: [-122.679884, 45.512515],
//     isAvailable: false,
//   },
// ];
// // spell-checker:enable
