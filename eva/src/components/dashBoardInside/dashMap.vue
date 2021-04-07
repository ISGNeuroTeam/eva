<template>
  <div class="dash-map">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <div
      v-if="!error"
      id="mapContainer"
      :style="{
        width: `${Math.trunc(widthFrom)}px`,
        height: `${Math.trunc(heightFrom) - top / 2}px`,
      }"
    />
  </div>
</template>


<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.tilelayer.colorfilter";

import "leaflet.markercluster";

export default {
  props: {
    // переменные полученные от родителя
    idFrom: null, // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда
    dataRestFrom: null, // данные полученые после выполнения запроса
    colorFrom: null, // цветовые переменные
    shouldFrom: null, // меняется в момент выбора источника данных у дашборда
    widthFrom: null, // ширина родительского компонента
    heightFrom: null, // выоста родительского компонента
  },
  data() {
    return {
      osmserver: null,
      error: null,
      library: null,
      map: null,
    };
  },
  computed: {
    top() {
      // для ряда управляющих иконок
      if (document.body.clientWidth <= 1600) {
        return 50;
      } else {
        return 60;
      }
    },
    maptheme() {
      let options = this.$store.getters.getOptions({
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
      if (options.maptheme) {
        return options.maptheme
      } else {
        return "default"
      }
    }
  },
  watch: {
    dataRestFrom(_dataRest) {
      this.clearMap();
      this.error = null;
      //получаем osm server
      this.getOSM();
      //получаем библиотеку
      this.generateLibrary(_dataRest);
      if (!this.error) {
        //создаем элемент карты
        this.createMap();
        //рисуем объекты на карте
        this.drawObjects(_dataRest);
        this.clustering(_dataRest);
      }
    },
  },
  mounted() {
    this.initMap();
  },
  methods: {
    clearMap() {
      this.map.eachLayer((layer) => {
        this.map.removeLayer(layer);
      });
    },
    getOSM() {
      let options = this.$store.getters.getOptions({
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
      if (options.osmserver) {
        this.osmserver = options.osmserver;
      } else {
        this.error = "Введите osm server";
      }
    },
    generateLibrary(dataRest) {
      const _tmp = dataRest[dataRest.length - 1].ID.replaceAll("'", '"');
      try {
        this.library = JSON.parse(_tmp);
      } catch {
        this.error = "Ошибка формата входных данных";
        this.map.remove();
        this.map = null;
      }
    },
    initMap() {
      this.map = L.map("mapContainer", {
        wheelPxPerZoomLevel: 600,
        zoomSnap: 0,
        zoom: 10,
        maxZoom: 17,
      });
    },
    drawObjects(dataRest) {
      for (let i = 0; i < dataRest.length - 1; i++) {
        if (dataRest[i].geometry_type?.toLowerCase() === "point") {
          this.addMarker(dataRest[i], dataRest[i].ID === "1" ? true : false);
        }
        if (dataRest[i].geometry_type?.toLowerCase() === "line") {
          this.addLine(dataRest[i]);
        }
      }
    },
    addMarker(element, isCenter) {
      const lib = this.library.objects[element.type];
      const icon = L.icon({
        iconUrl: `${window.location.origin}/svg/${lib.image}`,
        iconSize: [lib.width, lib.height],
      });

      const _point = element.coordinates.split(":");
      const _coord = _point[1].split(",");
      L.marker([_coord[0], _coord[1]], {
        icon: icon,
        zIndexOffset: -1000,
      }).addTo(this.map);

      if (isCenter === true) {
        this.map.setView([_coord[0], _coord[1]]);
      }
    },
    addLine(element) {
      const lib = this.library.objects[element.type];

      let latlngs = [];
      element.coordinates.split(";").forEach((point) => {
        let p = point.split(":");
        latlngs[p[0] - 1] = p[1].split(",");
      });

      L.polyline(latlngs, { color: lib.color, weight: lib.width }).addTo(
        this.map
      );
    },
    clustering(dataRest) {
      const cluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        iconCreateFunction: (layer) => {
          if (layer._zoom > 10) {
            return L.divIcon({
              iconSize: [0, 0],
              html:
                '<div class="leaflet-tooltip">' +
                layer.getAllChildMarkers().map((f) => f.getTooltip()._content) +
                "</div>",
            });
          } else {
            return L.divIcon({
              iconSize: [0, 0],
            });
          }
        },
      });
      const clusterOther = L.markerClusterGroup({
        showCoverageOnHover: false,
        iconCreateFunction: () => {
          return L.divIcon({
            iconSize: [0, 0]
          });

        },
      });
      for (let i = 0; i < dataRest.length - 1; i++) {
        if (dataRest[i].geometry_type?.toLowerCase() === "point") {
          if (dataRest[i].type === 1) {
            this.addTooltip(cluster, dataRest[i]);
          } else {
            this.addTooltip(clusterOther, dataRest[i]);
          }
        }
      }
    },
    addTooltip(cluster, element) {
      const lib = this.library.objects[element.type];
      const icon = L.divIcon({
        iconSize: [0, 0],
      });

      const _point = element.coordinates.split(":");
      const _coord = _point[1].split(",");

      const marker = L.marker([_coord[0], _coord[1]], {
        icon: icon,
      }).bindTooltip(element.label, {
        permanent: true,
        direction: "bottom",
        offset: [0, lib.height / 2],
      });

      cluster.addLayer(marker);
      this.map.addLayer(cluster);
    },
    createMap() {
      if(this.maptheme === 'black'){
        this.tileLayer = L.tileLayer.colorFilter(this.osmserver, {
          filter: ["grayscale:100%", "invert:100%"],
        });
      } else {
        this.tileLayer = L.tileLayer.colorFilter(this.osmserver, );
      }
     

      this.tileLayer.addTo(this.map);
    },
  },

};
</script>

<style>
#mapContainer {
  position: relative;
  background: #191919;
  left: -20px;
  top: 0px;
}
.error-message {
  display: flex;
  justify-content: center;
  flex-direction: column;
  font-size: 25px;
}
.leaflet-tooltip-left:before {
  margin-right: 0;
}
</style>