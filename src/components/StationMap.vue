<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import CircleGeom from "ol/geom/Circle";
import VectorLayer from "ol/layer/Vector";
import HeatmapLayer from "ol/layer/Heatmap";
import VectorSource from "ol/source/Vector";
import Fill from "ol/style/Fill";
import RenderEvent from "ol/render/Event";
import { Circle as CircleStyle, Style, Stroke } from "ol/style";
import { easeIn, easeOut } from "ol/easing.js";
import { getVectorContext } from "ol/render";
import { unByKey } from "ol/Observable";
import { EventsKey } from "ol/events";
import { boundingExtent, Extent } from "ol/extent";
import { Coordinate } from "ol/coordinate";
import { useStations } from "@/composables/useStations/useStations";
import { useTone } from "@/composables/useTone/useTone";
import { palette, rgba } from "@/palette";

// coordinates are [lon, lat]
// extent is [lonMin (west), latMin (south), lonMax (east), latMax (west)]

const { stationBounds, stations, stationUpdate, updateStationBounds, hotSpot } =
  useStations();
const { playTone, setHum, setToneSteps, disposeTone } = useTone();

const mapUrl: string =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png";
const BIG_CHANGE = 5;
// made up activity uses the same colors and motion, just fainter and thinner
const SYNTHETIC_FADE = 0.5;

// stations warm up a little when real bikes come and go, then cool off.
// a cluster of warm stations becomes a hot area: a soft ember glow on the map
// and a long low hum.
const HEAT_LEVELS = 8;
const HEAT_HALF_LIFE_MS = 5 * 60 * 1000;
const HEAT_FOR_FULL_GLOW = 4;
// how much summed station heat a patch of the map needs before it hums
const HOT_AREA_MIN = 2.5;
const HOT_AREA_FULL = 10;
const HOT_GRID = 4;
const coolDot = palette.dotCool;
const warmDot = palette.dotWarm;
const markerStyles = Array.from({ length: HEAT_LEVELS + 1 }, (_, level) => {
  const k = level / HEAT_LEVELS;
  const [r, g, b] = coolDot.map((c, i) => Math.round(c + (warmDot[i] - c) * k));
  return new Style({
    image: new CircleStyle({
      radius: 2 + k * 1.6,
      fill: new Fill({ color: `rgba(${r}, ${g}, ${b}, ${0.85 + k * 0.15})` }),
    }),
  });
});
const stationFeatures = new globalThis.Map<string, Feature>();
const stationHeat = new globalThis.Map<
  string,
  { heat: number; at: number; level: number }
>();
let heatIntervalId: number | null = null;

const mapRef = ref<HTMLDivElement>();
const map = ref<Map>();
const currentExtent = ref<Extent | null>(null);
const mapListenerKeys: EventsKey[] = [];
const animationListenerKeys: EventsKey[] = [];

const tileLayer = new TileLayer({
  className: "rita-tiles",
  source: new XYZ({
    url: mapUrl,
  }),
});
const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
});
const ember = palette.hot;
const hotLayer = new HeatmapLayer({
  source: vectorSource,
  blur: 44,
  radius: 16,
  opacity: 0.8,
  weight: (feature): number => feature.get("hotWeight") ?? 0,
  gradient: [
    rgba(ember, 0),
    rgba([96, 58, 36], 0.7),
    rgba([170, 84, 44], 0.85),
    rgba(ember, 0.95),
    rgba([246, 186, 128], 1),
    rgba(palette.dotWarm, 1),
  ],
});

const addStationMarkers = (): void => {
  for (const s in stations.value) {
    const marker = new Feature({
      geometry: new Point(stations.value[s].coordinate),
    });
    marker.set("name", stations.value[s].name);
    marker.setStyle(markerStyles[0]);
    stationFeatures.set(s, marker);
    vectorSource.addFeature(marker);
  }
};

const currentHeat = (stationId: string, now: number): number => {
  const entry = stationHeat.get(stationId);
  if (!entry) return 0;
  return entry.heat * Math.pow(0.5, (now - entry.at) / HEAT_HALF_LIFE_MS);
};

// a single checkout should not glow on its own. it takes a few in a row.
const hotWeight = (heat: number): number =>
  Math.min(Math.max((heat - 0.6) / 3, 0), 1);

const heatLevel = (heat: number): number =>
  Math.round(Math.min(1, heat / HEAT_FOR_FULL_GLOW) * HEAT_LEVELS);

const warmStation = (stationId: string, bikesDelta: number): void => {
  const feature = stationFeatures.get(stationId);
  if (!feature) return;
  const now = Date.now();
  const heat = Math.min(
    HEAT_FOR_FULL_GLOW * 1.5,
    currentHeat(stationId, now) + 0.7 + Math.min(Math.abs(bikesDelta), 4) * 0.2
  );
  const level = heatLevel(heat);
  stationHeat.set(stationId, { heat, at: now, level });
  feature.setStyle(markerStyles[level]);
  feature.set("hotWeight", hotWeight(heat));
};

const coolStations = (): void => {
  const now = Date.now();
  for (const [stationId, entry] of stationHeat) {
    const heat = currentHeat(stationId, now);
    const feature = stationFeatures.get(stationId);
    feature?.set("hotWeight", hotWeight(heat));
    const level = heatLevel(heat);
    if (level !== entry.level) {
      entry.level = level;
      feature?.setStyle(markerStyles[level]);
    }
    if (level === 0 && hotWeight(heat) === 0) stationHeat.delete(stationId);
  }
  updateHotArea(now);
};

// split the visible map into a grid and find the patch with the most heat.
// that patch drives the hum, and its busiest station names the hot spot.
const updateHotArea = (now: number): void => {
  const extent = currentExtent.value;
  if (!extent) return;
  const cellWidth = (extent[2] - extent[0]) / HOT_GRID;
  const cellHeight = (extent[3] - extent[1]) / HOT_GRID;
  const cells = new globalThis.Map<
    number,
    { heat: number; lon: number; lat: number; topHeat: number; topName: string }
  >();

  for (const stationId of stationHeat.keys()) {
    const station = stations.value[stationId];
    if (!station) continue;
    const { lon, lat } = station;
    if (lon < extent[0] || lon > extent[2] || lat < extent[1] || lat > extent[3]) {
      continue;
    }
    const heat = currentHeat(stationId, now);
    const col = Math.min(HOT_GRID - 1, Math.floor((lon - extent[0]) / cellWidth));
    const row = Math.min(HOT_GRID - 1, Math.floor((lat - extent[1]) / cellHeight));
    const key = row * HOT_GRID + col;
    const cell = cells.get(key) ?? {
      heat: 0,
      lon: 0,
      lat: 0,
      topHeat: 0,
      topName: "",
    };
    cell.heat += heat;
    cell.lon += lon * heat;
    cell.lat += lat * heat;
    if (heat > cell.topHeat) {
      cell.topHeat = heat;
      cell.topName = station.name;
    }
    cells.set(key, cell);
  }

  let hottest: { heat: number; lon: number; lat: number; topName: string } | null =
    null;
  for (const cell of cells.values()) {
    if (!hottest || cell.heat > hottest.heat) hottest = cell;
  }

  if (!hottest || hottest.heat < HOT_AREA_MIN) {
    hotSpot.value = null;
    setHum(null, 0);
    return;
  }
  const level = Math.min(
    (hottest.heat - HOT_AREA_MIN) / (HOT_AREA_FULL - HOT_AREA_MIN) + 0.25,
    1
  );
  hotSpot.value = hottest.topName;
  setHum([hottest.lon / hottest.heat, hottest.lat / hottest.heat], level);
};

// checkouts ripple outward as a bike leaves. returns close in on the station
// as a bike arrives. bigger changes reach further, and a truck sized change
// sends out a few slow rings. every ring is a little different on purpose.
const animateUpdate = (
  coordinate: Coordinate,
  bikesDelta: number,
  isSynthetic: boolean
): void => {
  // nobody can see rings in a hidden tab, and they would all fire at once on return
  if (document.hidden) return;
  // one shape and one style per ring, changed in place each frame. building a
  // new circle style every frame made a new offscreen canvas every frame, and
  // those piled up to around a gig of memory over time.
  const ringGeom = new CircleGeom(coordinate, 0);
  const ringStroke = new Stroke({ color: "transparent", width: 1 });
  const ringStyle = new Style({ stroke: ringStroke });
  const magnitude = Math.min(Math.abs(bikesDelta), 4);
  const isReturn = bikesDelta > 0;
  const isBig = !isSynthetic && Math.abs(bikesDelta) >= BIG_CHANGE;
  const rings = isBig ? 3 : 1;
  const stagger = 700;
  const reach =
    (14 + magnitude * 6) * (0.85 + Math.random() * 0.3) * (isBig ? 1.6 : 1);
  const duration =
    (isReturn ? 2600 : 3000) * (0.9 + Math.random() * 0.25) * (isBig ? 1.5 : 1);
  const rgb = isBig ? palette.hot : isReturn ? palette.in : palette.out;
  const fade = isSynthetic ? SYNTHETIC_FADE : 1;
  const start = Date.now();

  const listenerKey = vectorLayer.on("postrender", (event: RenderEvent): void => {
    if (!event.frameState?.time) {
      cleanupAnimationListener(listenerKey as EventsKey);
      return;
    }
    const elapsed = event.frameState.time - start;
    if (elapsed >= duration + (rings - 1) * stagger) {
      cleanupAnimationListener(listenerKey as EventsKey);
      return;
    }
    const vectorContext = getVectorContext(event);
    // ring sizes are in pixels, the map is in degrees
    const resolution = event.frameState.viewState.resolution;

    for (let ring = 0; ring < rings; ring++) {
      const progress = (elapsed - ring * stagger) / duration;
      if (progress < 0 || progress > 1) continue;
      const radius = isReturn
        ? 3 + reach * (1 - easeIn(progress))
        : 4 + reach * easeOut(progress);
      const opacity = isReturn
        ? Math.sin(Math.PI * progress) * 0.9
        : easeOut(1 - progress);

      ringGeom.setRadius(radius * resolution);
      ringStroke.setColor(rgba(rgb, opacity * fade));
      ringStroke.setWidth(
        (0.3 + opacity * 1.1) * (isBig ? 1.4 : 1) * (isSynthetic ? 0.7 : 1)
      );
      vectorContext.setStyle(ringStyle);
      vectorContext.drawGeometry(ringGeom);
    }
    map.value?.render();
  }) as EventsKey;
  animationListenerKeys.push(listenerKey);
  map.value?.render();
};

const cleanupAnimationListener = (listenerKey: EventsKey): void => {
  unByKey(listenerKey);
  const listenerIndex = animationListenerKeys.indexOf(listenerKey);
  if (listenerIndex >= 0) {
    animationListenerKeys.splice(listenerIndex, 1);
  }
};

// fits the view to coordinates
// then, sets the extent to only that area
const setMapBoundingExtent = (): void => {
  if (!map.value || !stationBounds.value) return;
  map.value
    .getView()
    .fit(boundingExtent([stationBounds.value.min, stationBounds.value?.max]), {
      padding: [20, 20, 20, 20],
    });
  const extent = map.value.getView().calculateExtent(map.value.getSize()) as Extent;
  const view = new View({
    projection: "EPSG:4326",
    extent: extent,
    maxZoom: 16,
  });
  view.fit(extent);
  map.value.setView(view);
  currentExtent.value = extent;
};

watch(
  stationUpdate,
  async () => {
    if (!stationUpdate.value) return;
    const { coordinate, bikesDelta, isSynthetic, stationId } = stationUpdate.value;
    animateUpdate(coordinate, bikesDelta, isSynthetic);
    if (!isSynthetic) warmStation(stationId, bikesDelta);
    await playTone(stationUpdate.value);
  },
  { deep: true }
);

watch(
  currentExtent,
  () => {
    if (!currentExtent.value) return;
    updateStationBounds(currentExtent.value);
    setToneSteps(currentExtent.value);
  },
  { deep: true }
);

onMounted(async () => {
  map.value = new Map({
    target: mapRef.value,
    controls: [],
    layers: [tileLayer],
    view: new View({
      projection: "EPSG:4326",
    }),
  });

  setMapBoundingExtent();
  addStationMarkers();
  if (currentExtent.value) {
    updateStationBounds(currentExtent.value);
    setToneSteps(currentExtent.value);
  }

  heatIntervalId = setInterval(coolStations, 3000) as unknown as number;

  map.value.addLayer(hotLayer);
  map.value.addLayer(vectorLayer);

  // gets extent after zoom
  mapListenerKeys.push(
    map.value.on("moveend", () => {
      currentExtent.value = map.value
        ?.getView()
        .calculateExtent(map.value.getSize()) as Extent;
    }) as EventsKey
  );
});

onBeforeUnmount(() => {
  for (const listenerKey of animationListenerKeys.splice(0)) {
    unByKey(listenerKey);
  }
  for (const listenerKey of mapListenerKeys.splice(0)) {
    unByKey(listenerKey);
  }

  if (heatIntervalId !== null) clearInterval(heatIntervalId);
  heatIntervalId = null;
  stationFeatures.clear();
  stationHeat.clear();
  hotSpot.value = null;
  disposeTone();
  vectorSource.clear();
  map.value?.removeLayer(hotLayer);
  map.value?.removeLayer(vectorLayer);
  map.value?.setTarget(undefined);
  map.value = undefined;
  currentExtent.value = null;
});
</script>
<template>
  <div ref="mapRef" class="h-dvh w-dvw"></div>
</template>
