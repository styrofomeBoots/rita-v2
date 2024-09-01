<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Fill from "ol/style/Fill";
import RenderEvent from "ol/render/Event";
import { Circle as CircleStyle, Style, Stroke } from "ol/style";
import { easeOut } from "ol/easing.js";
import { getVectorContext } from "ol/render";
import { unByKey } from "ol/Observable";
import { boundingExtent, Extent } from "ol/extent";
import { Coordinate } from "ol/coordinate";
import { useStations } from "@/composables/useStations/useStations";
import { useTone } from "@/composables/useTone/useTone";

// coordinates are [lon, lat]
// extent is [lonMin (west), latMin (south), lonMax (east), latMax (west)]

const { stationBounds, stations, stationUpdate, updateStationBounds } =
  useStations();
const { playTone, setToneSteps } = useTone();

const mapUrl: string =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png";

const mapRef = ref<HTMLDivElement>();
const map = ref<Map>();
const currentExtent = ref<Extent | null>(null);

const tileLayer = new TileLayer({
  source: new XYZ({
    url: mapUrl,
  }),
});
const vectorSource = new VectorSource();

const addStationMarkers = (): void => {
  for (const s in stations.value) {
    const marker = new Feature({
      geometry: new Point(stations.value[s].coordinate),
    });
    marker.set("name", stations.value[s].name);
    marker.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 2,
          fill: new Fill({
            color: "#8F959E",
          }),
        }),
      })
    );
    vectorSource.addFeature(marker);
  }
};

const showStationUpdate = (coordinate: Coordinate): void => {
  const geom = new Point(coordinate);
  const feature = new Feature(geom);
  vectorSource.addFeature(feature);
  vectorSource.removeFeature(feature);
};

const animateUpdate = (feature: Feature): void => {
  const duration = 3000;
  const start = Date.now();
  const flashGeom = feature.getGeometry()?.clone();
  const listenerKey = tileLayer.on("postrender", (event: RenderEvent): void => {
    if (!flashGeom) return;
    if (!event.frameState?.time) return;
    const elapsed = event.frameState.time - start;
    if (elapsed >= duration) {
      unByKey(listenerKey);
      return;
    }
    const vectorContext = getVectorContext(event);
    const elapsedRatio = elapsed / duration;
    const radius = easeOut(elapsedRatio) * 25 + 5;
    const opacity = easeOut(1 - elapsedRatio);

    const style = new Style({
      image: new CircleStyle({
        radius: radius,
        stroke: new Stroke({
          color: "rgba(143, 149, 158, " + opacity + ")",
          width: 0.25 + opacity,
        }),
      }),
    });
    vectorContext.setStyle(style);
    vectorContext.drawGeometry(flashGeom);
    map.value?.render();
  });
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
    await playTone(stationUpdate.value.coordinate);
    showStationUpdate(stationUpdate.value.coordinate);
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

  // allows any new features (updates) added to be animated
  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });
  vectorSource.on("addfeature", e => {
    if (e.feature) animateUpdate(e.feature);
  });

  map.value.addLayer(vectorLayer);

  // gets extent after zoom
  map.value.on("moveend", () => {
    currentExtent.value = map.value
      ?.getView()
      .calculateExtent(map.value.getSize()) as Extent;
  });
});
</script>
<template>
  <div ref="mapRef" class="h-screen w-screen"></div>
</template>
