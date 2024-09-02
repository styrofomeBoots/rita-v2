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

// to get around the cors stuff that happens in safari
// hopefully only temporary
export const getSelectableCities = (): City[] => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    return cities.filter(city => city.browsers.includes("safari"));
  }
  return cities;
};

// spell-checker:disable
export const cities: City[] = [
  {
    city: "austin",
    url: "https://gbfs.bcycle.com/bcycle_austin",
    browsers: ["chrome"],
  },
  {
    city: "barcelona",
    url: "https://barcelona.publicbikesystem.net/customer/gbfs/v2/en",
    browsers: ["chrome"],
  },
  {
    city: "bay area",
    url: "https://gbfs.baywheels.com/gbfs/en",
    browsers: ["chrome", "safari"],
  },
  {
    city: "chicago",
    url: "https://gbfs.divvybikes.com/gbfs/en",
    browsers: ["chrome"],
  },
  {
    city: "columbus",
    url: "https://gbfs.cogobikeshare.com/gbfs/en",
    browsers: ["chrome"],
  },
  {
    city: "denver",
    url: "https://gbfs.lyft.com/gbfs/2.3/den/en",
    browsers: ["chrome"],
  },
  {
    city: "los angeles",
    url: "https://gbfs.bcycle.com/bcycle_lametro",
    browsers: ["chrome"],
  },
  {
    city: "new york city",
    url: "https://gbfs.lyft.com/gbfs/2.3/bkn/en",
    browsers: ["chrome"],
  },
  {
    city: "oslo",
    url: "https://api.entur.io/mobility/v2/gbfs/v3/oslobysykkel",
    browsers: ["chrome", "safari"],
  },
  {
    city: "philedelphia",
    url: "https://gbfs.bcycle.com/bcycle_indego",
    browsers: ["chrome"],
  },
  {
    city: "portland",
    url: "https://gbfs.biketownpdx.com/gbfs/en",
    browsers: ["chrome"],
  },
  {
    city: "tel aviv",
    url: "https://gbfs.api.ridedott.com/public/v2/tel-aviv",
    browsers: ["chrome", "safari"],
  },
  {
    city: "tokyo",
    url: "https://api-public.odpt.org/api/v4/gbfs/docomo-cycle-tokyo",
    browsers: ["chrome"],
  },
  {
    city: "washington dc",
    url: "https://gbfs.capitalbikeshare.com/gbfs/en",
    browsers: ["chrome"],
  },
];
// spell-checker:enable
