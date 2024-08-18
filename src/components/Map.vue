<script setup lang="ts">
import { ref, Ref, onMounted } from "vue";
import { getStationInfo, getStationStatus } from "../services/api.service";
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

const url: string =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png";
const map = ref<HTMLDivElement>();
const popup = ref() as Ref<HTMLDivElement>;
const vectorSource = new VectorSource();
const tileLayer = new TileLayer({
  source: new XYZ({
    url: url,
  }),
});

const stations = ref<any>({});
const stationCoords: any[][] = [];
const selectedStationName = ref("");

async function addRandomFeature() {
  const entries: [string, any][] = Object.entries(stations.value);
  const randomIndex = Math.floor(Math.random() * entries.length);
  const coordinates = entries[randomIndex][1].coordinates;
  const geom = new Point(coordinates);
  const feature = new Feature(geom);
  vectorSource.addFeature(feature);
  vectorSource.removeFeature(feature);
}

const getStationData = async () => {
  const info = await getStationInfo("capitalbikeshare");
  for (const i of info) {
    stations.value[i.station_id] = {};
    stations.value[i.station_id].name = i.name;
    stations.value[i.station_id].coordinates = [i.lon, i.lat];
    stationCoords.push([i.lon, i.lat]);
  }

  const status = await getStationStatus("capitalbikeshare");
  for (const s of status) {
    stations.value[s.station_id].availableDocks = s.num_docks_available;
    stations.value[s.station_id].availableBikes = s.num_bikes_available;
  }
};

const addMarker = (coordinate: number[], name: string) => {
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

const mapInstance = ref();
onMounted(async () => {
  mapInstance.value = new Map({
    target: map.value,
    controls: [],
    layers: [tileLayer],
    view: new View({
      projection: "EPSG:4326",
    }),
  });

  await getStationData();

  mapInstance.value.getView().fit(boundingExtent(stationCoords), {
    padding: [20, 20, 20, 20],
    duration: 1000,
    maxZoom: 16,
  });

  for (const s in stations.value) {
    addMarker(stations.value[s].coordinates, stations.value[s].name);
  }
  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });
  vectorSource.on("addfeature", function (e) {
    flash(e.feature!);
  });
  mapInstance.value.addLayer(vectorLayer);

  const popupOverlay = new Overlay({
    element: popup.value,
    positioning: "bottom-center",
    stopEvent: false,
    offset: [0, -10],
  });
  mapInstance.value.addOverlay(popupOverlay);
  mapInstance.value.on("pointermove", (event: { pixel: any }) => {
    const feature = mapInstance.value.forEachFeatureAtPixel(
      event.pixel,
      function (feature: any) {
        return feature;
      }
    ) as Feature<Point>;

    if (feature) {
      const coordinates = feature.getGeometry()?.getCoordinates();
      popupOverlay.setPosition(coordinates);
      selectedStationName.value = feature.get("name");
    } else {
      selectedStationName.value = "";
    }
  });
  window.setInterval(addRandomFeature, 2000);
});

const duration = 3000;
function flash(feature: Feature) {
  const start = Date.now();
  const flashGeom = feature.getGeometry()?.clone();
  const listenerKey = tileLayer.on("postrender", animate);

  function animate(event: RenderEvent) {
    const frameState = event.frameState;
    const elapsed = frameState!.time - start;
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
    vectorContext.drawGeometry(flashGeom!);
    mapInstance.value.render();
  }
}
</script>
<template>
  <div ref="map" class="h-screen w-screen"></div>
  <div
    ref="popup"
    :class="selectedStationName ? 'block' : 'hidden'"
    class="absolute bg-white p-1.5 rounded border border-black"
  >
    {{ selectedStationName }}
  </div>
</template>
