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
        :items="[3, 4, 5, 6]"
        label="Количество элементов в строке подписей"
        @change="changeClusterTextCount"
      />
      <v-text-field
        v-model="clusterDelimiter"
        label="Разделитель"
        @blur="blurClusterDelimiter"
        @keyup.enter="blurClusterDelimiter"
      />
      <v-select
        v-model="clusterPosition"
        class="select-property"
        :items="clusterPositionItems"
        item-text="name"
        item-value="id"
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
    options: Object,
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
      clusterDelimiter: null,
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
  },
  methods: {
    reDrawMap(dataRest) {
      this.clearMap();
      this.error = null;
      //получаем osm server
      this.getOSM();
      //получаем библиотеку
      if (!this.options?.primitivesLibrary) {
        this.generateLibrary(dataRest); // get all icons that we need on map
      }
      else {
        try {
          this.library = JSON.parse(this.options.primitivesLibrary);
        } catch {
          this.error = "Ошибка формата входных данных";
          this.map.remove();
          this.map = null;
        }
      }
      this.generateClusterPositionItems();
      if (!this.error) {
        //создаем элемент карты
        this.createMap();
        //рисуем объекты на карте
        this.drawObjects(dataRest);
        // this.clustering(dataRest);
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
      if(this.clusterPosition.length > 0){
        options.clusterPosition = this.clusterPosition;
      } else {
        options.clusterPosition = null
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
      this.clusterPositionItems = null;
      Object.entries(this.library.objects).forEach((object) => {
        if (object[1].image) {
          const _tmpObject = { ...object[1], id: Number(object[0]) };
          this.clusterPositionItems = [_tmpObject];
        }
      });

      if(!this.clusterPosition) {//пустые значения
        Object.entries(this.library.objects).forEach((object) => {
          if (object[1].image) {
            if(this.clusterPosition === null){
              this.clusterPosition = [ Number(object[0]) ]
            } else {
              this.clusterPosition.push(  Number(object[0])   )
            }
          }
        })
      }
    },

    initMap() {
      this.map = L.map(this.$refs.map, {
        wheelPxPerZoomLevel: 100,
        zoomSnap: 0,
        zoom: 10,
        maxZoom: 17,
      });
    },

    drawObjects(dataRest) {
      for (let i = 0; i < dataRest.length - 1; i++) {
        const lib = this.library.objects[dataRest[i].type]; // choosing drawing type for each object
        if (!lib) {                                         // if no lib for drawing object - just skip
          continue;
        }
        if (dataRest[i].geometry_type?.toLowerCase() === "point") {
          this.addMarker(dataRest[i], dataRest[i].ID === "1" ? true : false, lib);
        }
        if (dataRest[i].geometry_type?.toLowerCase() === "line") {
          this.addLine(dataRest[i], lib);
        }
      }
    },

    addMarker(element, isCenter, lib) {
      let type = this.getElementDrawType(lib);
      if (type === "SVG") {
        this.drawMarkerSVG(lib, element, isCenter)
      }
      else {
        this.drawMarkerHTML({lib, element, isCenter})
      }
    },

    getElementDrawType(lib) {
      if (lib.view_type == "html") {
        return "HTML"
      }
      return "SVG"
    },

    drawMarkerSVG(lib, element, isCenter) {
      const icon = L.icon({
        iconUrl: `${window.location.origin}/svg/${lib.image}`,
        iconSize: [lib.width, lib.height],
      });
      const _point = element.coordinates.split(":");
      const _coord = _point[1].split(",");
      L.marker([_coord[0], _coord[1]], {
        icon: icon,
        zIndexOffset: -1000,
        riseOnHover: true,
      })
      .addTo(this.map)
      .bindTooltip(element.label,  {
        permanent: false,
        direction: "top",
        className: "leaftet-hover"
      })
      if (isCenter === true) {
        this.map.setView([_coord[0], _coord[1]]);
      }
    },

    drawMarkerHTML({ lib, element, isCenter }) {
      let {
        text_color: textColor = "#FFFFFF",
        background_color: color="65, 62, 218",
        opacity = 0.6,
        label_field: text = "КП-240",
        border_radius: borderRadius="2px",
        border = "none",
        width,
        height,
      } = lib;
      let icon = L.divIcon({
        className: 'location-pin',
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
            font-weight: 600px;
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
      .bindTooltip(element.label,  {
        permanent: false,
        direction: "top",
        className: "leaftet-hover"
      })
      if (isCenter === true) {
        this.map.setView([_coord[0], _coord[1]]);
      }
    },

    addLine(element, lib) {
      let latlngs = [];
      element.coordinates.split(";").forEach((point) => {
        let p = point.split(":");
        latlngs[p[0] - 1] = p[1].split(",");
      });
      L.polyline(latlngs, { color: lib.color, weight: lib.width, opacity: lib.opacity })
      .addTo(this.map)
      .bindTooltip(element.label,  {
        permanent: false,
        direction: "top",
        className: "leaftet-hover"
      })
      .on('mouseover', highlightFeature)
      .on('mouseout', resetHighlight)

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
      const _sortDataRest =  this.sortForTooltip(dataRest)
      for (let i = 0; i < _sortDataRest.length - 1; i++) {
        this.addTooltip(this.cluster, _sortDataRest[i]);
      }
    },
    sortForTooltip(dataRest){
      let _sortDataRest = []
      this.clusterPosition.forEach(position=>{
        dataRest.forEach(dr=>{
          if(position===dr.type){
            _sortDataRest.push(dr)
          }
        })
      })
      return _sortDataRest
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
.leaftet-hover{
  border: 2px solid #c88dcc;
}
.leaftet-hover::before{
  margin-bottom: 0;
}
</style>