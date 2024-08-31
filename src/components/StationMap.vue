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
import { boundingExtent } from "ol/extent";
import { useMapStore } from "@/stores/mapStore";
import { useTone } from "@/composables/useTone/useTone";

const { mapBounds, stations, stationUpdates } = useMapStore();
const { playTone } = useTone();

const mapRef = ref<HTMLDivElement>();
const map = ref<Map>();
const mapUrl: string =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png";
const tileLayer = new TileLayer({
  source: new XYZ({
    url: mapUrl,
  }),
});
const vectorSource = new VectorSource();

const addMarker = (coordinate: number[], name: string): void => {
  const marker = new Feature({
    geometry: new Point(coordinate),
  });
  marker.set("name", name);
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
};

const showStationUpdate = ([lon, lat]): void => {
  const geom = new Point([lon, lat]);
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

watch(
  stationUpdates,
  async () => {
    const update = stationUpdates[0];
    await playTone(update.note, update.octave);
    showStationUpdate([update.lon, update.lat]);
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

  // fits the view to coordinates
  // then, sets the extent to only that area
  map.value.getView().fit(
    boundingExtent([
      [mapBounds.lon.min, mapBounds.lat.min],
      [mapBounds.lon.max, mapBounds.lat.max],
    ]),
    { padding: [20, 20, 20, 20] }
  );
  const extent = map.value.getView().calculateExtent(map.value.getSize());
  const view = new View({
    projection: "EPSG:4326",
    extent: extent,
    maxZoom: 14,
  });
  view.fit(extent);
  map.value.setView(view);

  // add stations
  for (const s in stations) {
    const lon = stations[s].lon;
    const lat = stations[s].lat;
    addMarker([lon, lat], stations[s].name);
  }

  // allows any new features (updates) added to be animated
  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });
  vectorSource.on("addfeature", e => {
    if (e.feature) animateUpdate(e.feature);
  });

  map.value.addLayer(vectorLayer);
});
</script>
<template>
  <div ref="mapRef" class="h-screen w-screen"></div>
</template>
