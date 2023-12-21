import axios from "axios";
import { City } from "../types/api.types";

// spell-checker:disable
export const cities: City[] = [
  {
    name: "bay area",
    slug: "baywheels",
    mapZoom: 12.5,
    mapCenter: [-122.364474, 37.790515],
    isAvailable: false,
  },
  {
    name: "chicago",
    slug: "divvybikes",
    mapZoom: 13.1,
    mapCenter: [-87.629227, 41.876942],
    isAvailable: false,
  },
  {
    name: "columbus",
    slug: "cogobikeshare",
    mapZoom: 13.1,
    mapCenter: [-82.999207, 39.959423],
    isAvailable: false,
  },
  {
    name: "washington dc",
    slug: "capitalbikeshare",
    mapZoom: 13.1,
    mapCenter: [-77.036548, 38.892112],
    isAvailable: false,
  },
  {
    name: "minneapolis",
    slug: "niceridemn",
    mapZoom: 13.1,
    mapCenter: [-93.269558, 44.969344],
    isAvailable: false,
  },
  {
    name: "new york city",
    slug: "citibike",
    mapZoom: 13.1,
    mapCenter: [-74.007902, 40.707783],
    isAvailable: false,
  },
  {
    name: "portland",
    slug: "biketownpdx",
    mapZoom: 13.1,
    mapCenter: [-122.679884, 45.512515],
    isAvailable: false,
  },
];
// spell-checker:enable

export async function getStationInfo(slug: string) {
  const response = await axios.get(
    `https://gbfs.${slug}.com/gbfs/en/station_information.json`
  );
  return response.data.data.stations;
}

export async function getStationStatus(slug: string) {
  const response = await axios.get(
    `https://gbfs.${slug}.com/gbfs/en/station_status.json`
  );
  return response.data.data.stations;
}

// dunno where or how this should happen yet
export async function getAllStationStatus() {
  for (const city in cities) {
    console.log(city);
  }
}
