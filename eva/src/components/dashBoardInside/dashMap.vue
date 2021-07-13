<template>
  <div class="dash-map" ref="container">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <div
      v-if="!error"
      id="mapContainer"
      ref="map"
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
import vuetify from "../../plugins/vuetify";
import dashMapUserSettings from "./dashMapUserSettings.vue";
import store from "../../store/index.js"; // подключаем файл с настройками хранилища Vuex
import Vue from "vue";
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
    options: Object,
  },
  data() {
    return {
      showLegend: false,
      osmserver: null,
      error: null,
      library: null,
      map: null,
      clusterTextCount: null,
      maptheme: null,
      cluster: null,
      clusterPosition: null,
      clusterPositionItems: null,
      clusterDelimiter: null,
      isLegendGenerated: true,
      isSettings: false,
      startingPoint: [],
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
    this.initClusterDelimiter();
    const unsubscribe = store.subscribe((mutation, state) => {
      if (mutation.type == "updateOptions") {
        if (this.options.initialPoint) {
          this.map.setView(
            [this.options.initialPoint.x, this.options.initialPoint.y],
            mutation.payload.options.zoomLevel
          );
        } else {
          this.map.setView(
            this.startingPoint,
            mutation.payload.options.zoomLevel
          );
        }
        this.map.wheelPxPerZoomLevel = 200;
      }
    });
  },
  methods: {
    reDrawMap(dataRest) {
      this.clearMap();
      this.error = null;
      //получаем osm server
      this.getOSM();
      //получаем библиотеку
      this.generateLibrary(dataRest, this.options?.primitivesLibrary); // get all icons that we need on map
      this.generateClusterPositionItems();
      this.initSettings();
      if (!this.error) {
        //создаем элемент карты
        this.createMap();
        //рисуем объекты на карте
        this.drawObjects(dataRest);
        if (this.options.initialPoint)
          this.map.setView(
            [this.options.initialPoint.x, this.options.initialPoint.y],
            this.options.zoomLevel
          );
        else this.map.setView(this.startingPoint, this.options.zoomLevel);
        // this.clustering(dataRest);
      }
    },

    initSettings() {
      if (this.isSettings) return;
      let ComponentClass = Vue.extend(dashMapUserSettings);
      let test = new ComponentClass({
        propsData: {
          idDashFrom: this.idDashFrom,
          idElement: this.idFrom,
          map: this.map,
        },
        vuetify,
        store,
      });
      test.$mount();
      let element = document.getElementsByClassName(
        "leaflet-control-container"
      );
      let container = element[0];
      container.appendChild(test.$el);
      this.isSettings = true;
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
    initClusterDelimiter() {
      let options = this.$store.getters.getOptions({
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
      if (options.clusterDelimiter) {
        this.clusterDelimiter = options.clusterDelimiter;
      } else {
        this.clusterDelimiter = ";";
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
    blurClusterPosition() {
      let options = this.$store.getters.getOptions({
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
      if (this.clusterPosition.length > 0) {
        options.clusterPosition = this.clusterPosition;
      } else {
        options.clusterPosition = null;
      }

      this.clearCluster();
      this.clustering(this.dataRestFrom);
    },
    blurClusterDelimiter() {
      let options = this.$store.getters.getOptions({
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
      options.clusterDelimiter = this.clusterDelimiter;
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
      if (options.selectedLayer) {
        this.osmserver = options.selectedLayer;
      } else if (options.osmserver) {
        this.osmserver = options.osmserver;
      } else {
        this.error = "Введите osm server";
      }
    },
    generateLibrary(dataRest, options) {
      const _tmp = dataRest[dataRest.length - 1].ID.replaceAll("'", '"');
      try {
        if (options) {
          this.library = JSON.parse(options);
        } else {
          this.library = JSON.parse(_tmp);
        }
        this.$store.commit("setLibrary", {
          library: this.library,
          id: this.idFrom, // id элемнета (table, graph-2)
          idDash: this.idDashFrom,
        });
      } catch {
        this.error = "Ошибка формата входных данных";
        this.map.remove();
        this.map = null;
      }

      if (!this.isLegendGenerated) {
        this.createLegend();
      }
    },

    createLegend() {
      let generatedListHTML = "";
      for (let x of Object.values(this.library.objects)) {
        generatedListHTML += `<li>${x.name}</li>`;
      }
      L.Control.Legend = L.Control.extend({
        onAdd: function (map) {
          var img = L.DomUtil.create("div");
          img.innerHTML = `
              <div>
                <p>Легенда</p>
                <ul class="fa-ul">
                ${generatedListHTML}
                </ul>
              </div>`;
          img.style.width = `280px`;
          img.style.maxHeight = `466px`;
          img.style.background = "black";
          return img;
        },

        onRemove: function (map) {
          // Nothing to do here
        },
      });

      L.control.legend = function (opts) {
        return new L.Control.Legend(opts);
      };

      L.control.legend({ position: "bottomright" }).addTo(this.map);
      this.isLegendGenerated = true;
    },

    generateClusterPositionItems() {
      this.clusterPositionItems = null;
      Object.entries(this.library.objects).forEach((object) => {
        if (object[1].image) {
          const _tmpObject = { ...object[1], id: Number(object[0]) };
          this.clusterPositionItems = [_tmpObject];
        }
      });

      if (!this.clusterPosition) {
        //пустые значения
        Object.entries(this.library.objects).forEach((object) => {
          if (object[1].image) {
            if (this.clusterPosition === null) {
              this.clusterPosition = [Number(object[0])];
            } else {
              this.clusterPosition.push(Number(object[0]));
            }
          }
        });
      }
    },

    initMap() {
      this.map = L.map(this.$refs.map, {
        wheelPxPerZoomLevel: 1 / this.options.zoomStep || 30,
        zoomSnap: 0,
        zoom: 10,
        maxZoom: 25,
      });
      this.map.on("zoomend", () => {
        let layers = document.getElementsByClassName("leaflet-marker-icon");
        for (let x of layers) {
          x.style.width = (x.naturalWidth / 10) * this.map.getZoom() + "px";
          x.style.height = (x.naturalHeight / 10) * this.map.getZoom() + "px";
        }
      });
    },

    drawObjects(dataRest) {
      for (let i = 0; i < dataRest.length - 1; i++) {
        const lib = this.library.objects[dataRest[i].type]; // choosing drawing type for each object
        if (!lib) {
          // if no lib for drawing object - just skip
          continue;
        }
        if (dataRest[i].ID === "1") {
          const _point = dataRest[i].coordinates.split(":");
          const _coord = _point[1].split(",");
          this.startingPoint = [_coord[0], _coord[1]];
        }
        if (dataRest[i].geometry_type?.toLowerCase() === "point") {
          this.addMarker(dataRest[i], dataRest[i].ID === "1", lib);
        }
        if (dataRest[i].geometry_type?.toLowerCase() === "line") {
          this.addLine(dataRest[i], lib);
        }
      }
    },

    addMarker(element, isCenter, lib) {
      let type = this.getElementDrawType(lib);
      if (type === "SVG") {
        this.drawMarkerSVG(lib, element, isCenter);
      } else {
        this.drawMarkerHTML({ lib, element, isCenter });
      }
    },

    getElementDrawType(lib) {
      if (lib.view_type == "html") {
        return "HTML";
      }
      return "SVG";
    },

    drawMarkerSVG(lib, element, isCenter) {
      const icon = L.icon({
        iconUrl: `${window.location.origin}/svg/${lib.image}`,
        iconSize: [lib.width, lib.height],
      });

      const _point = element.coordinates.split(":");
      const _coord = _point[1].split(",");
      this.startingPoint = [_coord[0], _coord[1]];
      let marker = L.marker([_coord[0], _coord[1]], {
        icon: icon,
        zIndexOffset: -1000,
        riseOnHover: true,
      })
        .addTo(this.map)
        .bindTooltip(element.label, {
          permanent: false,
          direction: "top",
          className: "leaftet-hover",
        });
      L.DomUtil.addClass(marker._icon, "className");
    },

    drawMarkerHTML({ lib, element, isCenter }) {
      let {
        text_color: textColor = "#FFFFFF",
        background_color: color = "65, 62, 218",
        opacity = 0.6,
        label_field: text = "КП-240",
        border_radius: borderRadius = "2px",
        border = "none",
        width,
        height,
      } = lib;
      let icon = L.divIcon({
        className: "location-pin",
        riseOnHover: true,
        html: `<div class="leaflet-div-icon" 
          style="
            background-color: ${color};
            opacity: ${opacity};
            mix-blend-mode: normal;
            border: ${border};
            border-radius: ${borderRadius}px;
            padding: 2px 6px;
            display: inline-block;
            font-size: 14px;
            font-weight: 600;
        ">
          <span style="color:${textColor}">${element.label}<span>
        </div>`,
        iconSize: [width, height],
      });
      const _point = element.coordinates.split(":");
      const _coord = _point[1].split(",");
      L.marker([_coord[0], _coord[1]], {
        icon: icon,
        zIndexOffset: -1000,
        riseOnHover: true,
      })
        .addTo(this.map)
        .bindTooltip(element.label, {
          permanent: false,
          direction: "top",
          className: "leaftet-hover",
        });
    },

    addLine(element, lib) {
      let latlngs = [];
      element.coordinates.split(";").forEach((point) => {
        let p = point.split(":");
        latlngs[p[0] - 1] = p[1].split(",");
      });
      L.polyline(latlngs, {
        color: lib.color,
        weight: lib.width,
        opacity: lib.opacity,
      })
        .addTo(this.map)
        .bindTooltip(element.label, {
          permanent: false,
          direction: "top",
          className: "leaftet-hover",
        })
        .on("mouseover", highlightFeature)
        .on("mouseout", resetHighlight);

      function resetHighlight(e) {
        var layer = e.target;
        layer.setStyle({
          color: lib.color,
          weight: lib.width,
        });
      }

      function highlightFeature(e) {
        var layer = e.target;
        layer.bringToFront();
        layer.setStyle({
          weight: lib.width + 3,
          color: lib.highlight_color,
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          layer.bringToFront();
        }
      }
    },

    clustering(dataRest) {
      this.cluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        iconCreateFunction: (cluster) => {
          const markers = cluster.getAllChildMarkers();
          if (cluster._zoom > 10) {
            let _html =
              "<div class='leaflet-tooltip'>" +
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
      const _sortDataRest = this.sortForTooltip(dataRest);
      for (let i = 0; i < _sortDataRest.length - 1; i++) {
        this.addTooltip(this.cluster, _sortDataRest[i]);
      }
    },
    sortForTooltip(dataRest) {
      let _sortDataRest = [];
      this.clusterPosition.forEach((position) => {
        dataRest.forEach((dr) => {
          if (position === dr.type) {
            _sortDataRest.push(dr);
          }
        });
      });
      return _sortDataRest;
    },
    generateHtml(markers) {
      let _html = "<div class ='leaftet-flex'>";
      let _count = 0;
      let i;
      for (
        i = 0;
        i < markers.length - 1 && _count < this.clusterTextCount;
        i++
      ) {
        _html = _html + "<div>" + markers[i].getTooltip()._content + "</div>";
        _html = _html + `<div> ${this.clusterDelimiter} </div>`;
        _count++;
      }
      //удаление лишенего дилителя
      _html = _html.substr(
        0,
        _html.length - `<div> ${this.clusterDelimiter} </div>`.length
      );
      //закрываем leaftet-flex
      _html = _html + "</div>";
      if (i !== markers.length - 1) {
        _html = _html + "<div class ='leaftet-flex'>...</div>";
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
      this.map.addLayer(cluster);
    },
    createMap() {
      let tileLayer;
      if (!this.osmserver) return;
      if (typeof this.osmserver === "string") {
        if (this.maptheme === "black") {
          tileLayer = L.tileLayer.colorFilter(this.osmserver, {
            filter: ["grayscale:100%", "invert:100%"],
          });
        } else {
          tileLayer = L.tileLayer.colorFilter(this.osmserver);
        }
      } else {
        if (!this.osmserver.tile) return;

        let temp = this.osmserver.tile;
        if (typeof this.osmserver.tile === "string") {
          temp = [this.osmserver.tile];
        }
        if (this.maptheme === "black") {
          temp[1].filter = ["grayscale:100%", "invert:100%"];
          tileLayer = L.tileLayer.colorFilter(...temp);
        } else {
          tileLayer = L.tileLayer(...temp);
        }
      }
      tileLayer.addTo(this.map);
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
.leaftet-flex {
  display: flex;
  gap: 5px;
  justify-items: left;
}
.wrapper-property {
  height: 40px;
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto;
}
.leaftet-hover {
  border: 2px solid #c88dcc;
}
.leaftet-hover::before {
  margin-bottom: 0;
}
</style>