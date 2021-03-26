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
      }
    },
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
          //console.log()
        }
      }
    },
    addMarker(element, center) {
      const lib = this.library.objects[element.type];
      const icon = L.icon({
        iconUrl: `svg/${lib.image}`,
        iconSize: [lib.width, lib.height],
      });

      const _coord = element.coordinates
        .substring(1, element.coordinates.length - 1)
        .split(",");

      L.marker([_coord[0], _coord[1]], { icon: icon })
        .bindTooltip(element.label, { permanent: true })
        .addTo(this.map);

      if (center === true) {
        this.map.setView([_coord[0], _coord[1]]);
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