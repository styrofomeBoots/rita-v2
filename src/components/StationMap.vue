<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
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
import { EventsKey } from "ol/events";
import { boundingExtent, Extent } from "ol/extent";
import { Coordinate } from "ol/coordinate";
import { useStations } from "@/composables/useStations/useStations";
import { useTone } from "@/composables/useTone/useTone";

// coordinates are [lon, lat]
// extent is [lonMin (west), latMin (south), lonMax (east), latMax (west)]

const { stationBounds, stations, stationUpdate, updateStationBounds } =
  useStations();
const { playTone, setToneSteps, disposeTone } = useTone();

const mapUrl: string =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png";
const syntheticUpdateColor = "rgba(143, 122, 90, ";

const mapRef = ref<HTMLDivElement>();
const map = ref<Map>();
const currentExtent = ref<Extent | null>(null);
const mapListenerKeys: EventsKey[] = [];
const animationListenerKeys: EventsKey[] = [];

const tileLayer = new TileLayer({
  source: new XYZ({
    url: mapUrl,
  }),
});
const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
});
const markerStyle = new Style({
  image: new CircleStyle({
    radius: 2,
    fill: new Fill({
      color: "#8F959E",
    }),
  }),
});

const addStationMarkers = (): void => {
  for (const s in stations.value) {
    const marker = new Feature({
      geometry: new Point(stations.value[s].coordinate),
    });
    marker.set("name", stations.value[s].name);
    marker.setStyle(markerStyle);
    vectorSource.addFeature(marker);
  }
};

const showStationUpdate = (coordinate: Coordinate, isSynthetic: boolean): void => {
  const geom = new Point(coordinate);
  const feature = new Feature(geom);
  feature.set("isSynthetic", isSynthetic);
  vectorSource.addFeature(feature);
  vectorSource.removeFeature(feature);
};

const animateUpdate = (feature: Feature): void => {
  const duration = 3000;
  const start = Date.now();
  const flashGeom = feature.getGeometry()?.clone();
  const isSynthetic = feature.get("isSynthetic") === true;
  if (!flashGeom) return;

  const listenerKey = tileLayer.on("postrender", (event: RenderEvent): void => {
    if (!event.frameState?.time) {
      cleanupAnimationListener(listenerKey as EventsKey);
      return;
    }
    const elapsed = event.frameState.time - start;
    if (elapsed >= duration) {
      cleanupAnimationListener(listenerKey as EventsKey);
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
          color: isSynthetic
            ? syntheticUpdateColor + opacity + ")"
            : "rgba(143, 149, 158, " + opacity + ")",
          width: 0.25 + opacity,
        }),
      }),
    });
    vectorContext.setStyle(style);
    vectorContext.drawGeometry(flashGeom);
    map.value?.render();
  }) as EventsKey;
  animationListenerKeys.push(listenerKey);
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
    await playTone(stationUpdate.value);
    showStationUpdate(
      stationUpdate.value.coordinate,
      stationUpdate.value.isSynthetic
    );
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
  mapListenerKeys.push(
    vectorSource.on("addfeature", e => {
      if (e.feature) animateUpdate(e.feature);
    }) as EventsKey
  );

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

  disposeTone();
  vectorSource.clear();
  map.value?.removeLayer(vectorLayer);
  map.value?.setTarget(undefined);
  map.value = undefined;
  currentExtent.value = null;
});
</script>
<template>
  <div ref="mapRef" class="h-dvh w-dvw"></div>
</template>
