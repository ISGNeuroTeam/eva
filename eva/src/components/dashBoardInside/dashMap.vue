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
      if (!this.error) {
        //получаем библиотеку
        this.generateLibrary(_dataRest);
        //создаем элемент карты
        this.createMap();
        //перемещаем к центру объекта их datarest
        this.mapTocenter(_dataRest);
      }
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
    mapTocenter(dataRest) {
      for (let i = 0; i < dataRest.length - 1; i++) {
        if (dataRest[i].ID === "1") {
          //id1 - center
          const _coord = JSON.parse(dataRest[i].coordinates);
          this.map.setView([_coord[1], _coord[0]]);
        }
      }
    },
    createMap() {
      this.tileLayer = L.tileLayer.colorFilter(this.osmserver, {
        filter: ["grayscale:100%", "invert:100%"],
      });

      this.tileLayer.addTo(this.map);
    },
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
  left: -20px;
  top: 0px;
}
.error-message {
  display: flex;
  justify-content: center;
  flex-direction: column;
  font-size: 25px;
}
</style>