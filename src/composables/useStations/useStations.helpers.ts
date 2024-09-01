import { createAlova } from "alova";
import { axiosRequestAdapter } from "@alova/adapter-axios";
import {
  Station,
  Stations,
  StationResponse,
  StationBounds,
  StationInformation,
  StationStatus,
} from "./useStation.types";

// coordinates are [lon, lat]
// extent is [lonMin (west), latMin (south), lonMax (east), latMax (west)]

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

export const getStationInformation = async (): Promise<StationResponse> => {
  const response = await alova.Get<StationResponse>(
    "https://gbfs.capitalbikeshare.com/gbfs/en/station_information.json"
  );
  return response;
};

export const getStationStatuses = async (): Promise<StationResponse> => {
  const response = await alova.Get<StationResponse>(
    "https://gbfs.capitalbikeshare.com/gbfs/en/station_status.json"
  );
  return response;
};

export const getStations = async (): Promise<{
  stations: Stations;
  lastStationUpdate: number;
}> => {
  const stations: Stations = {};
  const infoResponse = await getStationInformation();
  const statusesResponse = await getStationStatuses();
  const stationInformation = infoResponse.data.stations as StationInformation[];
  const stationStatuses = statusesResponse.data.stations as StationStatus[];
  const lastStationUpdate = statusesResponse.last_updated;

  for (const info of stationInformation) {
    stations[info.station_id] = {
      ...info,
      coordinate: [info.lon, info.lat],
    } as Station;
  }

  for (const status of stationStatuses) {
    if (stations[status.station_id]) {
      Object.assign(stations[status.station_id], status);
    }
  }

  return { stations, lastStationUpdate };
};

export const getStationBounds = (stations: Stations): StationBounds => {
  let lonMin = Infinity;
  let latMin = Infinity;
  let lonMax = -Infinity;
  let latMax = -Infinity;

  for (const stationId in stations) {
    const { lat, lon } = stations[stationId];
    if (lon < lonMin) lonMin = lon;
    if (lat < latMin) latMin = lat;
    if (lon > lonMax) lonMax = lon;
    if (lat > latMax) latMax = lat;
  }

  return {
    min: [lonMin, latMin],
    max: [lonMax, latMax],
  };
};

export const getRandomInterval = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const isWithinStationBounds = (
  lon: number,
  lat: number,
  stationBounds: StationBounds | null
): boolean => {
  if (stationBounds === null) return false;
  const [lonMin, latMin] = stationBounds.min;
  const [lonMax, latMax] = stationBounds.max;
  return lon >= lonMin && lon <= lonMax && lat >= latMin && lat <= latMax;
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
