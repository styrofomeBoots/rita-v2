<script setup lang="ts">
import { ref, Ref, onMounted, watch } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Fill from "ol/style/Fill";
import Overlay from "ol/Overlay";
import RenderEvent from "ol/render/Event";
import { Circle as CircleStyle, Style, Stroke } from "ol/style";
import { easeOut } from "ol/easing.js";
import { getVectorContext } from "ol/render";
import { unByKey } from "ol/Observable";
import { boundingExtent } from "ol/extent";
import { Pixel } from "ol/pixel";
import { useMapStore } from "@/stores/mapStore";

const { mapBounds, stations, stationUpdates } = useMapStore();

const map = ref<HTMLDivElement>();
const mapInstance = ref<Map>();
const mapUrl: string =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png";
const tileLayer = new TileLayer({
  source: new XYZ({
    url: mapUrl,
  }),
});
const vectorSource = new VectorSource();

const usePopup = ref(false);
const popup = ref<HTMLDivElement>() as Ref<HTMLDivElement>;
const popupStationName = ref("");

const showStationUpdate = ([lon, lat]): void => {
  const geom = new Point([lon, lat]);
  const feature = new Feature(geom);
  vectorSource.addFeature(feature);
  vectorSource.removeFeature(feature);
};

watch(
  stationUpdates,
  () => {
    const update = stationUpdates[0];
    showStationUpdate([update.lon, update.lat]);
  },
  { deep: true }
);

onMounted(async () => {
  mapInstance.value = new Map({
    target: map.value,
    controls: [],
    layers: [tileLayer],
    view: new View({
      projection: "EPSG:4326",
    }),
  });

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

  mapInstance.value.getView().fit(
    boundingExtent([
      [mapBounds.lon.min, mapBounds.lat.min],
      [mapBounds.lon.max, mapBounds.lat.max],
    ]),
    {
      padding: [20, 20, 20, 20],
      duration: 1000,
      maxZoom: 16,
    }
  );

  for (const s in stations) {
    const lon = stations[s].lon;
    const lat = stations[s].lat;
    addMarker([lon, lat], stations[s].name);
  }

  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });
  vectorSource.on("addfeature", e => {
    if (e.feature) flash(e.feature);
  });
  mapInstance.value.addLayer(vectorLayer);

  if (usePopup.value) {
    const popupOverlay = new Overlay({
      element: popup.value,
      positioning: "bottom-center",
      stopEvent: false,
      offset: [0, -10],
    });
    mapInstance.value.addOverlay(popupOverlay);
    mapInstance.value.on("pointermove", (event: { pixel: Pixel }) => {
      const feature = mapInstance.value?.forEachFeatureAtPixel(
        event.pixel,
        feature => {
          return feature;
        }
      ) as Feature<Point>;
      if (feature) {
        const coordinates = feature.getGeometry()?.getCoordinates();
        popupOverlay.setPosition(coordinates);
        popupStationName.value = feature.get("name");
      } else {
        popupStationName.value = "";
      }
    });
  }
});

const flash = (feature: Feature): void => {
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
    mapInstance.value?.render();
  });
};
</script>
<template>
  <div ref="map" class="h-screen w-screen"></div>
  <div
    v-if="usePopup"
    ref="popup"
    :class="popupStationName ? 'block' : 'hidden'"
    class="absolute rounded border border-black bg-white p-1.5"
  >
    {{ popupStationName }}
  </div>
</template>
