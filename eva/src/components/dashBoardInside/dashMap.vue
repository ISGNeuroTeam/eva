<template>
  <div class="dash-map">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <div v-if="!error" class="wrapper-property">
      <v-select
        v-model="maptheme"
        class="select-property"
        :items="['default', 'black']"
        label="Тема"
        @change="changeMapTheme"
      />
      <v-select
        v-model="clusterTextCount"
        class="select-property"
        :items="[3, 4, 5]"
        label="Количество элементов в строке подписей"
        @change="changeClusterTextCount"
      />
      <v-select
        v-model="clusterPosition"
        class="select-property"
        :items="clusterPositionItems"
        item-text="name"
        chips
        multiple 
        label="Порядок элементов"
        @blur="blurClusterPosition" 
      />
    </div>
    <div
      ref="map"
      v-if="!error"
      id="mapContainer"
      :style="{
        width: `${Math.trunc(widthFrom)}px`,
        height: `${Math.trunc(heightFrom) - top / 2 - 45}px`,
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
      clusterTextCount: null,
      maptheme: null,
      cluster: null,
      clusterPosition: null,
      clusterPositionItems: null,
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
  },
  watch: {
    dataRestFrom(_dataRest) {
      //при обновлении данных перерисовать
      this.reDrawMap(_dataRest);
    },
    clusterTextCount() {
      this.clearCluster();
      this.clustering(this.dataRestFrom);
    },
    maptheme() {
      this.createMap();
    },
  },
  mounted() {
    this.initMap();
    this.initTheme();
    this.initClusterTextCount();
    this.initClusterPosition();
  },
  methods: {
    reDrawMap(dataRest) {
      this.clearMap();
      this.error = null;
      //получаем osm server
      this.getOSM();
      //получаем библиотеку
      this.generateLibrary(dataRest);
      this.generateClusterPositionItems()
      if (!this.error) {
        //создаем элемент карты
        this.createMap();
        //рисуем объекты на карте
        this.drawObjects(dataRest);
        this.clustering(dataRest);
      }
    },
    initTheme() {
      let options = this.$store.getters.getOptions({
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
      if (options.maptheme) {
        this.maptheme = options.maptheme;
      } else {
        this.maptheme = "default";
      }
    },
    changeMapTheme(val) {
      let options = this.$store.getters.getOptions({
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
      options.maptheme = val;
    },
    initClusterTextCount() {
      let options = this.$store.getters.getOptions({
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
      if (options.clusterTextCount) {
        this.clusterTextCount = options.clusterTextCount;
      } else {
        this.clusterTextCount = 4;
      }
    },
    initClusterPosition() {
      let options = this.$store.getters.getOptions({
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
      if (options.clusterPosition) {
        this.clusterPosition = options.clusterPosition;
      } else {
        this.clusterPosition = null;
      }
    },
    changeClusterTextCount(val) {
      let options = this.$store.getters.getOptions({
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
      options.clusterTextCount = val;
    },
    blurClusterPosition(){
      let options = this.$store.getters.getOptions({
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
      options.clusterPosition = this.clusterPosition;

      this.clearCluster();
      this.clustering(this.dataRestFrom);
    },
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
    generateClusterPositionItems() {
      this.clusterPositionItems = null
      Object.values(this.library.objects).forEach((object) => {
        if (object.image) {
          if (this.clusterPositionItems === null) {
            this.clusterPositionItems = [object];
          } else {
            this.clusterPositionItems.push(object);
          }
        }
      });
    },
    initMap() {
      this.map = L.map(this.$refs.map, {
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
      this.cluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        iconCreateFunction: (cluster) => {
          const markers = cluster.getAllChildMarkers();
          if (cluster._zoom > 10) {
            let _html =
              `<div class='leaflet-tooltip leaftet-grid' style="grid-template-columns: repeat(${this.clusterTextCount}, 1fr);">` +
              this.generateHtml(markers) +
              "</div>";
            return L.divIcon({
              iconSize: [0, 0],
              html: _html,
            });
          } else {
            return L.divIcon({
              iconSize: [0, 0],
            });
          }
        },
      });
      //sort
      for (let i = 0; i < dataRest.length - 1; i++) {
        if (dataRest[i].geometry_type?.toLowerCase() === "point") {
          this.addTooltip(this.cluster, dataRest[i]);
        }
      }
    },
    generateHtml(markers) {
      let _html = "";
      let _count = 0;
      let i;
      for (
        i = 0;
        i < markers.length - 1 && _count < this.clusterTextCount;
        i++
      ) {
        _count++;
        _html = _html + "<div>" + markers[i].getTooltip()._content + "</div>";
      }
      if (i !== markers.length - 1) {
        _html = _html + "<div>...</div>";
      }
      return _html;
    },
    clearCluster() {
      if (this.map.hasLayer(this.cluster)) {
        this.map.removeLayer(this.cluster);
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

      //
      this.map.addLayer(cluster);
    },
    createMap() {
      if (this.maptheme === "black") {
        this.tileLayer = L.tileLayer.colorFilter(this.osmserver, {
          filter: ["grayscale:100%", "invert:100%"],
        });
      } else {
        this.tileLayer = L.tileLayer.colorFilter(this.osmserver);
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
.leaftet-grid {
  display: grid;
  grid-row-gap: 5px;
  grid-column-gap: 5px;
  justify-items: left;
}
.wrapper-property {
  height: 40px;
  display: grid;
  grid-template-columns: repeat(2,1fr) auto;
}
</style>