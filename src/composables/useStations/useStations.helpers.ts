import { createAlova } from "alova";
import { axiosRequestAdapter } from "@alova/adapter-axios";
import {
  City,
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

const getStationInformation = async (url: City["url"]): Promise<StationResponse> => {
  const response = await alova.Get<StationResponse>(
    `${url}/station_information.json`
  );
  return response;
};

export const getStationStatuses = async (
  url: City["url"]
): Promise<StationResponse> => {
  const response = await alova.Get<StationResponse>(`${url}/station_status.json`);
  return response;
};

export const getStations = async (
  url: City["url"]
): Promise<{
  stations: Stations;
  lastStationUpdate: number;
}> => {
  const stations: Stations = {};
  const infoResponse = await getStationInformation(url);
  const statusesResponse = await getStationStatuses(url);
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

// spell-checker:disable
export const cities: City[] = [
  { city: "austin", url: "https://gbfs.bcycle.com/bcycle_austin" },
  {
    city: "barcelona",
    url: "https://barcelona.publicbikesystem.net/customer/gbfs/v2/en",
  },
  { city: "bay area", url: "https://gbfs.baywheels.com/gbfs/en" },
  { city: "chicago", url: "https://gbfs.divvybikes.com/gbfs/en" },
  { city: "columbus", url: "https://gbfs.cogobikeshare.com/gbfs/en" },
  { city: "denver", url: "https://gbfs.lyft.com/gbfs/2.3/den/en" },
  { city: "los angeles", url: "https://gbfs.bcycle.com/bcycle_lametro" },
  { city: "new york city", url: "https://gbfs.lyft.com/gbfs/2.3/bkn/en" },
  { city: "oslo", url: "https://api.entur.io/mobility/v2/gbfs/v3/oslobysykkel" },
  { city: "philedelphia", url: "https://gbfs.bcycle.com/bcycle_indego" },
  { city: "portland", url: "https://gbfs.biketownpdx.com/gbfs/en" },
  { city: "tel aviv", url: "https://gbfs.api.ridedott.com/public/v2/tel-aviv" },
  {
    city: "tokyo",
    url: "https://api-public.odpt.org/api/v4/gbfs/docomo-cycle-tokyo",
  },
  { city: "washington dc", url: "https://gbfs.capitalbikeshare.com/gbfs/en" },
];
// spell-checker:enable
