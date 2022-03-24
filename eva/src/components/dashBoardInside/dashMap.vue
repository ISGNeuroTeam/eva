<template>
  <div
    ref="container"
    class="dash-map"
  >
    <div
      v-if="error"
      class="error-message"
    >
      {{ error }}
    </div>
    <div
      v-if="!error"
      ref="map"
      class="mapContainer"
      :style="mapStyleSize"
    />
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.tilelayer.colorfilter';
import 'leaflet.markercluster';
import Vue from 'vue';
import * as turf from '@turf/turf';
import * as utils from 'leaflet-geometryutil';
import vuetify from '../../plugins/vuetify';
import dashMapUserSettings from './dashMapUserSettings.vue';
import store from '../../store/index'; // подключаем файл с настройками хранилища Vuex

export default {
  props: {
    // переменные полученные от родителя
    idFrom: {
      type: String,
      required: true,
    }, // id элемнета (table, graph-2)
    idDashFrom: {
      type: String,
      required: true,
    }, // id дашборда
    dataRestFrom: {
      type: Array,
      default: () => ([]),
    }, // данные полученые после выполнения запроса
    colorFrom: {
      type: Object,
      required: true,
    }, // цветовые переменные
    widthFrom: {
      type: Number,
      required: true,
    }, // ширина родительского компонента
    heightFrom: {
      type: Number,
      required: true,
    }, // выоста родительского компонента
    options: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      actions: [
        { name: 'refresh', capture: [] },
        { name: 'button', capture: [] },
      ],
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
      mode: [],
      leftBottom: 0,
      rightTop: 0,
      pipelineData: [],
      pipelineDataDictionary: {},
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    idDash() {
      // получаем id страницы от родителя
      return this.idDashFrom;
    },
    element() {
      // получаем название элемента
      return this.idFrom;
    },
    dashFromStore() {
      return this.$store.state[this.idDash][this.idFrom];
    },
    getOptions() {
      if (!this.idDash) {
        return [];
      }
      if (!this.dashFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.idFrom, idDash: this.idDash });
      }

      if (!this.dashFromStore?.options.pinned) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'pinned',
          value: false,
        }]);
      }

      if (!this.dashFromStore.options.lastDot) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'lastDot',
          value: false,
        }]);
      }
      if (!this.dashFromStore.options.stringOX) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'stringOX',
          value: false,
        }]);
      }
      if (!this.dashFromStore?.options.united) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'united',
          value: false,
        }]);
      }

      return this.dashFromStore.options;
    },
    option() {
      return this.getOptions;
    },

    top() {
      // для ряда управляющих иконок
      return document.body.clientWidth <= 1600 ? 50 : 60;
    },
    mapStyleSize() {
      return {
        height: `${Math.trunc(this.heightFrom) - this.top / 2 - 45}px`,
      };
    },
  },
  watch: {
    options: {
      handler() {
        this.reDrawMap(this.dataRestFrom);
      },
      deep: true,
    },
    mapStyleSize() {
      // eslint-disable-next-line no-underscore-dangle
      this.map._onResize();
    },
    dataRestFrom(_dataRest) {
      // при обновлении данных перерисовать
      if (_dataRest) {
        this.reDrawMap(_dataRest);
      }
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
    store.subscribe((mutation) => {
      if (mutation.type === 'updateOptions') {
        if (this.options.initialPoint) {
          this.map.setView(
            [this.options.initialPoint.x, this.options.initialPoint.y],
            mutation.payload.options.zoomLevel,
          );
        } else {
          this.map.setView(
            this.startingPoint,
            mutation.payload.options.zoomLevel,
          );
        }
        this.map.wheelPxPerZoomLevel = 200;
        this.updateToken(
          mutation.payload.options.zoomLevel,
          this.map.getBounds(),
        );
      }
    });
    this.createTokens();
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDash,
      id: this.element,
    });
    this.loadDataForPipe(this.$store.getters.getPaperSearch);
  },
  methods: {
    async getDataFromRest(event) {
      // this.$set(this.loadings,event.sid,true);
      this.$store.commit('setLoading', {
        search: event.sid,
        idDash: this.idDash,
        should: true,
        error: false,
      });

      await this.$store.dispatch('auth/putLog', `Запущен запрос  ${event.sid}`);
      // собственно проводим все операции с данными
      const response = await this.$store.dispatch('getDataApi', {
        search: event,
        idDash: this.idDash,
      });
      console.log('response', response);
      // вызывая метод в хранилище
      if (response.length === 0) {
        // если что-то пошло не так
        this.$store.commit('setLoading', {
          search: event.sid,
          idDash: this.idDash,
          should: false,
          error: true,
        });
      } else {
        // если все нормально

        const responseDB = this.$store.dispatch(
          'putIntoDB',
          {
            result: response,
            sid: event.sid,
            idDash: this.idDash,
          },
        );
        responseDB.then(() => {
          this.$store.commit('setLoading', {
            search: event.sid,
            idDash: this.idDash,
            should: false,
            error: false,
          });
        });
      }

      return response;
    },
    async loadDataForPipe(search) {
      this.pipelineData = await this.getDataFromRest(search);
      const allPipes = {};
      console.log('pipelineData', this.pipelineData);
      this.pipelineData.forEach((x) => {
        if (!allPipes[x.ID]) {
          allPipes[x.ID] = [];
        }
        allPipes[x.ID].push(x);
      });

      this.pipelineDataDictionary = allPipes;
      this.reDrawMap(this.dataRestFrom);
    },
    updateToken(value) {
      const tokens = this.$store.state[this.idDash].tockens;
      Object.keys(tokens).forEach((i) => {
        if (
          tokens[i].elem === this.element
          && tokens[i].action === 'button'
          && tokens[i].capture === 'zoom_level'
        ) {
          this.$store.commit('setTocken', {
            token: tokens[i],
            idDash: this.idDash,
            value,
            store: this.$store,
          });
        } else if (
          tokens[i].elem === this.element
          && tokens[i].action === 'button'
          && tokens[i].capture === 'top_left_point'
        ) {
          this.$store.commit('setTocken', {
            token: tokens[i],
            idDash: this.idDash,
            value: this.leftBottom[1],
            store: this.$store,
          });
        } else if (
          tokens[i].elem === this.element
          && tokens[i].action === 'button'
          && tokens[i].capture === 'bottom_right_point'
        ) {
          this.$store.commit('setTocken', {
            token: tokens[i],
            idDash: this.idDash,
            value: this.rightTop[1],
            store: this.$store,
          });
        }
      });
    },
    createTokens() {
      const captures = ['top_left_point', 'bottom_right_point', 'zoom_level'];
      this.actions.forEach((item, i) => {
        this.$set(this.actions[i], 'capture', captures);
      });
    },
    reDrawMap(dataRest) {
      this.clearMap();
      this.error = null;
      // получаем osm server
      this.getOSM();
      // получаем библиотеку
      // get all icons that we need on map
      this.generateLibrary(dataRest, this.options?.primitivesLibrary);
      this.generateClusterPositionItems();
      this.initSettings();
      if (!this.error) {
        // создаем элемент карты
        this.createMap();
        // рисуем объекты на карте
        this.drawObjects(dataRest);
        if (this.options.initialPoint) {
          this.map.setView(
            [this.options.initialPoint.x, this.options.initialPoint.y],
            this.options.zoomLevel,
          );
        } else this.map.setView(this.startingPoint, this.options.zoomLevel);
        // this.clustering(dataRest);
      }
    },

    initSettings() {
      if (this.isSettings) return;
      const ComponentClass = Vue.extend(dashMapUserSettings);
      const test = new ComponentClass({
        propsData: {
          idDashFrom: this.idDashFrom,
          idElement: this.idFrom,
          map: this.map,
        },
        vuetify,
        store,
      });
      test.$on('updatePipeDataSource', (e) => this.loadDataForPipe(e));
      test.$mount();

      const element = this.$refs.map.getElementsByClassName(
        'leaflet-control-container',
      );
      const container = element[0];
      container.appendChild(test.$el);
      this.isSettings = true;
    },
    deleteTitleByAttribute() {
      const leafletControlZoomOut = this.$refs.map.querySelector(
        '.leaflet-control-zoom-out',
      );

      const leafletControlZoomIn = this.$refs.map.querySelector(
        '.leaflet-control-zoom-in',
      );
      leafletControlZoomOut.setAttribute('name', leafletControlZoomOut.getAttribute('title'));
      leafletControlZoomIn.setAttribute('name', leafletControlZoomIn.getAttribute('title'));

      leafletControlZoomOut.removeAttribute('title');
      leafletControlZoomIn.removeAttribute('title');
    },

    initTheme() {
      const options = this.getOptions;
      if (options.maptheme) {
        this.maptheme = options.maptheme;
      } else {
        this.maptheme = 'default';
      }
    },
    changeMapTheme(val) {
      const options = this.getOptions;
      options.maptheme = val;
    },
    initClusterTextCount() {
      const options = this.getOptions;
      if (options.clusterTextCount) {
        this.clusterTextCount = options.clusterTextCount;
      } else {
        this.clusterTextCount = 4;
      }
    },
    initClusterDelimiter() {
      const options = this.getOptions;
      if (options.clusterDelimiter) {
        this.clusterDelimiter = options.clusterDelimiter;
      } else {
        this.clusterDelimiter = ';';
      }
    },
    initClusterPosition() {
      const options = this.getOptions;
      if (options.clusterPosition) {
        this.clusterPosition = options.clusterPosition;
      } else {
        this.clusterPosition = null;
      }
    },
    changeClusterTextCount(val) {
      const options = this.getOptions;
      options.clusterTextCount = val;
    },
    blurClusterPosition() {
      const options = this.getOptions;
      if (this.clusterPosition.length > 0) {
        options.clusterPosition = this.clusterPosition;
      } else {
        options.clusterPosition = null;
      }

      this.clearCluster();
      this.clustering(this.dataRestFrom);
    },
    blurClusterDelimiter() {
      const options = this.getOptions;
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
      const options = this.getOptions;
      if (options.selectedLayer) {
        this.osmserver = options.selectedLayer;
      } else if (options.osmserver) {
        this.osmserver = options.osmserver;
      } else {
        this.error = 'Введите osm server';
      }
    },
    generateLibrary(dataRest, options) {
      const tmp = dataRest[dataRest.length - 1]?.ID.replaceAll("'", '"');
      try {
        if (options) {
          this.library = JSON.parse(options);
        } else {
          this.library = JSON.parse(tmp);
        }
        this.$store.commit('setLibrary', {
          library: this.library,
          id: this.idFrom, // id элемнета (table, graph-2)
          idDash: this.idDashFrom,
        });
      } catch {
        this.error = 'Ошибка формата входных данных';
        this.map.remove();
        this.map = null;
      }

      if (!this.isLegendGenerated) {
        this.createLegend();
      }
    },

    createLegend() {
      let generatedListHTML = '';
      Object.keys(this.library.objects).forEach((key) => {
        generatedListHTML += `<li>${this.library.objects[key].name}</li>`;
      });
      L.Control.Legend = L.Control.extend({
        onAdd() {
          const img = L.DomUtil.create('div');
          img.innerHTML = `
              <div>
                <p>Легенда</p>
                <ul class="fa-ul">
                ${generatedListHTML}
                </ul>
              </div>`;
          img.style.width = '280px';
          img.style.maxHeight = '466px';
          img.style.background = 'black';
          return img;
        },
      });

      L.control.legend = function (opts) {
        return new L.Control.Legend(opts);
      };

      L.control.legend({ position: 'bottomright' }).addTo(this.map);
      this.isLegendGenerated = true;
    },

    generateClusterPositionItems() {
      this.clusterPositionItems = null;
      if (this.library?.objects) {
        Object.entries(this.library.objects).forEach((object) => {
          if (object[1].image) {
            const tmpObject = { ...object[1], id: Number(object[0]) };
            this.clusterPositionItems = [tmpObject];
          }
        });

        if (!this.clusterPosition) {
        // пустые значения
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
      }
    },

    initMap() {
      this.map = L.map(this.$refs.map, {
        wheelPxPerZoomLevel: 1 / this.options.zoomStep || 30,
        zoomSnap: 0,
        zoom: 10,
        maxZoom: 25,
        center: [0, 0],
      });
      this.map.on('moveend', () => {
        [this.leftBottom, this.rightTop] = Object.entries(this.map.getBounds());
        this.updateToken(this.map.getZoom());
      });
      // TODO: Пока просили приостановить работу с ГИС.
      // this.map.on('zoomend', () => {
      //   const layers = document.getElementsByClassName('leaflet-marker-icon');
      //   layers.forEach((layer) => {
      //     layer.style.width = `${(layer.naturalWidth / 10) * this.map.getZoom()}px`;
      //     layer.style.height = `${(layer.naturalHeight / 10) * this.map.getZoom()}px`;
      //   });
      // });

      this.deleteTitleByAttribute();

      this.$nextTick(() => {
        // eslint-disable-next-line no-underscore-dangle
        this.map._onResize();
      });
    },

    drawObjects(dataRest) {
      for (let i = 0; i < dataRest.length - 1; i += 1) {
        if (
          !!dataRest
          && dataRest[i]?.type
          && this.library.objects
          && this.library.objects[dataRest[i].type]
        ) {
          // choosing drawing type for each object
          const lib = this.library.objects[dataRest[i].type];
          if (lib) {
            if (dataRest[i].ID === '1') {
              const point = dataRest[i].coordinates.split(':');
              const coord = point[1].split(',');

              this.startingPoint = [coord[0], coord[1]];
            }
            if (dataRest[i].geometry_type?.toLowerCase() === 'point') {
              this.addMarker(dataRest[i], dataRest[i].ID === '1', lib);
            }
            if (dataRest[i].geometry_type?.toLowerCase() === 'line') {
              this.addLine(dataRest[i], lib);
            }
          }
        }
      }
    },

    addMarker(element, isCenter, lib) {
      const type = this.getElementDrawType(lib);
      if (type === 'SVG') {
        this.drawMarkerSVG(lib, element, isCenter);
      } else {
        this.drawMarkerHTML({ lib, element, isCenter });
      }
    },

    getElementDrawType(lib) {
      if (lib.view_type === 'html') {
        return 'HTML';
      }
      return 'SVG';
    },

    drawMarkerSVG(lib, element) {
      const icon = L.icon({
        iconUrl: `${window.location.origin}/svg/${lib.image}`,
        iconSize: [lib.width, lib.height],
      });

      const point = element.coordinates.split(':');
      const coord = point[1].split(',');
      this.startingPoint = [coord[0], coord[1]];
      const marker = L.marker([coord[0], coord[1]], {
        icon,
        zIndexOffset: -1000,
        riseOnHover: true,
      })
        .addTo(this.map)
        .bindTooltip(element.label, {
          permanent: false,
          direction: 'top',
          className: 'leaftet-hover',
        });
      // eslint-disable-next-line no-underscore-dangle
      L.DomUtil.addClass(marker._icon, 'className');
    },

    drawMarkerHTML({ lib, element }) {
      const {
        text_color: textColor = '#FFFFFF',
        background_color: color = '65, 62, 218',
        opacity = 0.6,
        border_radius: borderRadius = '2px',
        border = 'none',
        width,
        height,
      } = lib;
      const icon = L.divIcon({
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
            font-weight: 600;
        ">
          <span style="color:${textColor}">${element.label}<span>
        </div>`,
        iconSize: [width, height],
      });
      const point = element.coordinates.split(':');
      const coord = point[1].split(',');
      L.marker([coord[0], coord[1]], {
        icon,
        zIndexOffset: -1000,
        riseOnHover: true,
      })
        .addTo(this.map)
        .bindTooltip(element.label, {
          permanent: false,
          direction: 'top',
          className: 'leaftet-hover',
          interactive: true,
        });
    },

    addLine(element, lib) {
      const { option } = this;

      const pipelineData = this.pipelineDataDictionary[element.ID];

      const latlngs = [];
      element.coordinates.split(';').forEach((point) => {
        const p = point.split(':');
        latlngs[p[0] - 1] = p[1].split(',');
      });
      const line = L.polyline(latlngs, {
        color: lib.color,
        weight: lib.width,
        opacity: lib.opacity,
      });
      const tooltip = L.tooltip({
        permanent: false,
        direction: 'top',
        className: 'leaftet-hover',
        sticky: true,
      });

      function resetHighlight(e) {
        const layer = e.target;
        layer.setStyle({
          color: lib.color,
          weight: lib.width,
        });
      }

      const route = line.getLatLngs().map((el) => [el.lat, el.lng]);
      const lineTurf = turf.lineString(route);

      function highlightFeature(e) {
        const layer = e.target;
        layer.bringToFront();
        layer.setStyle({
          weight: lib.width + 3,
          color: lib.highlight_color,
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          layer.bringToFront();
        }
        if (!pipelineData) return;
        const closest = (arr, num) => (
          arr.reduce((acc, val) => {
            if (Math.abs(val.pos - num) < Math.abs(acc)) {
              return val.pos - num;
            }
            return acc;
          }, Infinity) + num
        );
        if (option?.mode[0] === 'Мониторинг') {
          const newLine = turf.lineSlice(
            route[0],
            [e.latlng.lat, e.latlng.lng],
            lineTurf,
          );
          const newLinePoly = L.polyline(newLine.geometry.coordinates);
          const distances = utils.accumulatedLengths(newLinePoly);
          const sum = distances[distances.length - 1];

          const closestData = closest(pipelineData, sum);

          const pipelineInfo = pipelineData.find((el) => el.pos === closestData);
          // div for tooltip
          const newDiv = document.createElement('div');
          newDiv.innerHTML = `<div style="text-align: left; background-color: #191919; color: white">
          <p>${pipelineInfo.label}</p>
          <p>P ${pipelineInfo.P}</p>
          <p>S ${pipelineInfo.S}</p>
          <p>L ${pipelineInfo.L}</p>
          </div>`;
          line.setTooltipContent(newDiv);
        }
      }

      line
        .addTo(this.map)
        .bindTooltip(tooltip)
        .on('mouseover', (e) => highlightFeature(e, line))
        .on('mouseout', resetHighlight);
      line.setTooltipContent(element.label);
    },

    clustering(dataRest) {
      this.cluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        iconCreateFunction: (cluster) => {
          const markers = cluster.getAllChildMarkers();
          // eslint-disable-next-line no-underscore-dangle
          if (cluster._zoom > 10) {
            const html = `<div class='leaflet-tooltip'>${
              this.generateHtml(markers)
            }</div>`;
            return L.divIcon({
              iconSize: [0, 0],
              html,
            });
          }
          return L.divIcon({
            iconSize: [0, 0],
          });
        },
      });
      const sortDataRest = this.sortForTooltip(dataRest);
      for (let i = 0; i < sortDataRest.length - 1; i += 1) {
        this.addTooltip(this.cluster, sortDataRest[i]);
      }
    },
    sortForTooltip(dataRest) {
      const sortDataRest = [];
      this.clusterPosition?.forEach((position) => {
        dataRest.forEach((dr) => {
          if (position === dr.type) {
            sortDataRest.push(dr);
          }
        });
      });
      return sortDataRest;
    },
    generateHtml(markers) {
      // eslint-disable-next-line no-underscore-dangle
      let html = "<div class ='leaftet-flex'>";
      // eslint-disable-next-line no-underscore-dangle
      let count = 0;
      let i;
      for (
        i = 0;
        i < markers.length - 1 && count < this.clusterTextCount;
        i += 1
      ) {
        // eslint-disable-next-line no-underscore-dangle
        html = `${html}<div>${markers[i].getTooltip()._content}</div>`;
        html += `<div> ${this.clusterDelimiter} </div>`;
        count += 1;
      }
      // удаление лишенего дилителя
      html = html.substr(
        0,
        html.length - `<div> ${this.clusterDelimiter} </div>`.length,
      );
      // закрываем leaftet-flex
      html += '</div>';
      if (i !== markers.length - 1) {
        html += "<div class ='leaftet-flex'>...</div>";
      }
      return html;
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
      const point = element.coordinates.split(':');
      const coord = point[1].split(',');
      const marker = L.marker([coord[0], coord[1]], {
        icon,
      }).bindTooltip(element.label, {
        permanent: true,
        direction: 'bottom',
        offset: [0, lib.height / 2],
      });

      cluster.addLayer(marker);
      this.map.addLayer(cluster);
    },
    createMap() {
      let tileLayer;
      if (!this.osmserver) return;
      if (typeof this.osmserver === 'string') {
        if (this.maptheme === 'black') {
          tileLayer = L.tileLayer.colorFilter(this.osmserver, {
            filter: ['grayscale:100%', 'invert:100%'],
          });
        } else {
          tileLayer = L.tileLayer.colorFilter(this.osmserver);
        }
      } else {
        if (!this.osmserver.tile) return;

        let temp = this.osmserver.tile;
        if (typeof this.osmserver.tile === 'string') {
          temp = [this.osmserver.tile];
        }
        if (this.maptheme === 'black') {
          temp[1].filter = ['grayscale:100%', 'invert:100%'];
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
<style lang="sass">
@import '../../sass/dashMap.sass'
</style>
