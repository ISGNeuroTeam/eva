<template>
  <div class="dash-map">
    <div
      id="mapContainer"
      :style="{
        width: `${Math.trunc(widthFrom) - 20}px`,
        height: `${Math.trunc(heightFrom) - top}px`,
      }"
    />
  </div>
</template>


<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.tilelayer.colorfilter";

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
  },
  watch: {
    dataRestFrom(_dataRest) {
      this.error = null;
      //получаем osm server
      this.getOSM();
      //получаем библиотеку
      this.generateLibrary(_dataRest);
      //создаем элемент карты
      this.createMap()
    },
  },
  methods: {
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
      }
    },
    initMap() {
      this.map = L.map("mapContainer", {
        wheelPxPerZoomLevel: 600,
        zoomSnap: 0,
        center: [59.16, 74.1],
        zoom: 10,
        maxZoom: 17,
      })
          
    },
    createMap(){
      this.tileLayer = L.tileLayer.colorFilter(this.osmserver+"{z}/{x}/{y}.png", {
        filter: ["grayscale:100%", "invert:100%"],
      });
      
      this.tileLayer.addTo(this.map);  
    }
  },
  mounted() {
    this.initMap();
  },
};
</script>

<style>
#mapContainer {
  position: relative;
  background: #191919;
}
</style>