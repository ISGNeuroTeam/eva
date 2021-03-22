<template>
  <div class="dash-map">
    <div
      id="map"
      ref="map"
      :style="{ height: `calc(${Math.trunc(heightFrom)}px - ${top})` }"
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
        return "50px";
      } else {
        return "60px";
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
    createMap() {
      this.map = L.map(this.$refs.map, {
        wheelPxPerZoomLevel: 600,
        zoomSnap: 0,
        center: [59.16, 74.1],
        zoom: 10,
        maxZoom: 17,
      });
      L.tileLayer.colorFilter("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        filter: ["grayscale:100%", "invert:100%"],
      }).addTo(this.map);

    },
  },
  mounted() {
    this.createMap();
  },
};
</script>

<style>
#map {
  width: 100%;
  position: relative;
  background: #191919;
}
</style>