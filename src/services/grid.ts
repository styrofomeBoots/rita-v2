export const SCALES = {
  major: ["G", "A", "B", "C", "D", "E", "F"],
  pentatonic: ["G", "A", "C", "D", "E"],
};

export const OCTAVES = [1, 2, 3, 4, 5];

function getBounds(stations) {
  const bounds = { max: [], min: [] };
  for (const i of ["lat", "lon"]) {
    const max = Math.max.apply(
      Math,
      stations.map((x) => x[i])
    );
    const min = Math.min.apply(
      Math,
      stations.map((x) => x[i])
    );
    bounds.max.push(max);
    bounds.min.push(min);
  }
  return bounds;
}

// TODO: refactor these...
function getGridByLocation(stations, scale) {
  const bounds = getBounds(stations);
  const latStep = (bounds.max[0] - bounds.min[0]) / OCTAVES.length;
  const lonStep = (bounds.max[1] - bounds.min[1]) / SCALES[scale].length;
  for (const station of stations) {
    for (const index in OCTAVES) {
      const latBound = bounds.min[0] + latStep * index;
      if (latBound > station.lat) break;
      station.octave = OCTAVES[index];
    }
    for (const index in SCALES[scale]) {
      const lonBound = bounds.min[1] + lonStep * index;
      if (lonBound > station.lon) break;
      station.note = SCALES[scale][index];
    }
  }
  return stations;
}

function getGridByCount(stations, scale) {
  const latStep = stations.length / OCTAVES.length;
  const lonStep = stations.length / SCALES[scale].length;
  let sortedStations = stations.sort((a, b) => a.lat - b.lat);
  for (const stationIndex in sortedStations) {
    for (const octaveIndex in OCTAVES) {
      const indexBound = latStep * octaveIndex;
      if (indexBound > stationIndex) break;
      sortedStations[stationIndex].octave = OCTAVES[octaveIndex];
    }
  }
  sortedStations = sortedStations.sort((a, b) => a.lon - b.lon);
  for (const stationIndex in sortedStations) {
    for (const noteIndex in SCALES[scale]) {
      const indexBound = lonStep * noteIndex;
      if (indexBound > stationIndex) break;
      sortedStations[stationIndex].note = SCALES[scale][noteIndex];
    }
  }
  return sortedStations;
}

export function setupStationGrid(stations, sortAlg, scale) {
  let stationsWithNotes;
  if (sortAlg === "location") {
    stationsWithNotes = getGridByLocation(stations, scale);
  }
  if (sortAlg === "count") {
    stationsWithNotes = getGridByCount(stations, scale);
  }
  return stationsWithNotes;
}
