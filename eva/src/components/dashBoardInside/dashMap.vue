<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      ref="container"
      class="dash-map"
      :style="customStyle"
      :class="customClass"
      v-bind="$attrs"
    >
      <div
        v-if="error"
        :key="`error-message-${idDashFrom}`"
        class="error-message"
      >
        {{ error }}
      </div>
      <div
        v-show="!error"
        :key="`mapContainer-${idDashFrom}`"
        ref="map"
        class="mapContainer"
        :style="mapStyleSize"
      >
        <dash-map-user-settings-container
          v-if="map"
          ref="setting"
          :map="map"
          :id-dash-from="idDashFrom"
          :id-element="idFrom"
          :data-rest-from="dataRestFrom"
          @openSettingsModal="modalSettingsValue = true"
          @searchUpdate="searchUpdate"
        />
      </div>
      <dash-map-user-settings-new
        v-if="map"
        :modal-value="modalSettingsValue"
        :map="map"
        :id-dash-from="idDashFrom"
        :id-element="idFrom"
        :search="search"
        @update:modalValue="updateModalValue"
        @updatePipeDataSource="loadDataForPipe"
      />
    </div>
  </portal>
</template>

<script>
import DashMapUserSettingsContainer from './dashMapUserSettings/DashMapUserSettingsContainer.vue';
import dashMapUserSettingsNew from './dashMapUserSettings/dashMapUserSettings.vue';
import store from '../../store/index'; // подключаем файл с настройками хранилища Vuex
import MapClass from '../../js/classes/MapClass';

export default {
  name: 'DashMap',
  components: {
    DashMapUserSettingsContainer,
    dashMapUserSettingsNew,
  },
  inheritAttrs: false,
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
    options: {
      type: Object,
      required: true,
    },
    search: {
      type: Object,
      default: () => ({}),
    },
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
    sizeFrom: {
      type: Object,
      required: true,
    }, // выоста\ширина родительского компонента
    customStyle: {
      type: Object,
      default: () => ({}),
    },
    customClass: {
      type: String,
      default: '',
    },
    dataSources: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      modalSettingsValue: false,
      actions: [
        { name: 'refresh', capture: [] },
        { name: 'button', capture: [] },
        { name: 'click', capture: [] },
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
      isSettings: false,
      mode: [],
      leftBottom: 0,
      rightTop: 0,
      pipelineData: [],
      pipelineDataDictionary: {},
      position: null,
      layerGroup: {},
      defaultZoomLevel: 10,
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
      if (!this.dashFromStore?.options.search) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'search',
          value: this.search || '',
        }]);
      }
      if (!this.dashFromStore?.options.initialPoint) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'initialPoint',
          value: {
            x: 59.242065955847735,
            y: 74.35169122692963,
          },
        }]);
      }
      // eslint-disable-next-line no-restricted-globals
      if (!this.dashFromStore?.options.zoomLevel || isNaN(this.dashFromStore?.options.zoomLevel)) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'zoomLevel',
          value: 10,
        }]);
      }

      return this.dashFromStore.options;
    },
    top() {
      // для ряда управляющих иконок
      return document.body.clientWidth <= 1600 ? 50 : 60;
    },
    mapStyleSize() {
      return {
        height: `${Math.trunc(this.sizeFrom.height) - this.top / 2 - 10}px`,
      };
    },
    getCurrentPosition() {
      return this.position
        ? [this.position.lat, this.position.lng]
        : [this.options?.initialPoint?.x || 0, this.options?.initialPoint?.y || 0];
    },
    getLibrary() {
      return this.dashFromStore.options.primitivesLibrary;
    },
    getTokens() {
      return this.$store.state[this.idDash].tockens;
    },
    getServer() {
      let OSM = this.getOptions.osmserver;
      if (OSM) {
        if (OSM.indexOf('$$') !== -1) {
          this.getTokens.forEach((token) => {
            OSM = OSM.replaceAll(`$${token.name}$`, token.value);
          });
        }
        const tile = { tile: [] };
        tile.tile.push(OSM);
        tile.tile.push({
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution: '<a http="google.ru" target="_blank">Google</a>',
        });
        return tile;
      }
      return OSM;
    },
    getTargetElement() {
      if (this.dashFromStore.options?.tokenByCenteredElement) {
        const tokenName = this.dashFromStore.options?.tokenByCenteredElement;
        return this.getTokens.find((token) => token.name === tokenName)?.value;
      }
      return '';
    },
  },
  watch: {
    error(val) {
      if (!val && this.map) {
        this.map.resize();
      }
    },
    getLibrary(value) {
      if (value && this.map && this.dataRestFrom) {
        this.reDrawMap(this.dataRestFrom);
        this.$nextTick().then(() => {
          if (this.library?.objects) {
            this.$refs.setting.creationLayer();
            this.$refs.setting.addLayer();
          }
        });
      }
    },
    // TODO: Временный коммент
    // getOptions: {
    //   handler(val, old) {
    //     if (this.map && JSON.stringify(val) !== JSON.stringify(old)) {
    //       if (this.options?.library) {
    //         this.map.library = this.library;
    //       }
    //       this.map.options.wheelPxPerZoomLevel = 101 - val.zoomStep;
    //       this.map.map.options.wheelPxPerZoomLevel = 101 - val.zoomStep;
    //       this.reDrawMap(this.dataRestFrom);
    //     }
    //   },
    //   deep: true,
    // },
    'getOptions.selectedLayer': {
      handler(val, old) {
        if (JSON.stringify(val) !== JSON.stringify(old) && !old && this.map) {
          this.map.remove();
          this.init();
        }
      },
      deep: true,
    },
    // mapStyleSize() {
    //  if (this.map) {
    //    this.map.resize();
    //  }
    // },
    dataRestFrom(_dataRest) {
      // при обновлении данных перерисовать
      if (_dataRest && this.map) {
        this.reDrawMap(_dataRest);
        this.$nextTick().then(() => {
          if (this.library?.objects) {
            this.$refs.setting.creationLayer();
            this.$refs.setting.addLayer();
          }
        });
      }
      this.createTokens();
    },
    clusterTextCount() {
      if (this.map) {
        this.map.clearCluster(this.cluster);
        this.map.clustering(this.dataRestFrom);
      }
    },
    maptheme() {
      if (this.map) {
        this.map.createMap(this.maptheme);
      }
    },
    fullScreenMode() {
      this.$nextTick().then(() => {
        this.map.remove();
        this.map = null;
        this.init();
      });
    },
    sizeFrom(val, oldVal) {
      if (this.map && JSON.stringify(val) !== JSON.stringify(oldVal)) {
        this.map.resize();
      }
    },
    dataSources: {
      handler() {
        if (this.getOptions.search?.id) {
          this.loadDataForPipe(this.getOptions.search);
        }
      },
      deep: true,
    },
    getServer(val, old) {
      if (val && JSON.stringify(val) !== JSON.stringify(old)) {
        if (old && old.tile) {
          this.map.removeLayer(old.tile);
        }
        this.map.addLayer(val.tile);
        this.updateOptions({ selectedLayer: val.tile || null });
      }
    },
    getTargetElement(value) {
      if (this.map) {
        if (value) {
          this.map.goToElement(this.dataRestFrom, value);
        } else {
          this.centerMap(this.dataRestFrom);
        }
      }
    },
  },
  mounted() {
    if (this.$refs.map) {
      this.init();
    }
    this.defaultZoomLevel = this.options.zoomLevel;
  },
  methods: {
    updateOptions(newOptions) {
      this.$store.commit('updateOptions', {
        idDash: this.idDashFrom,
        idElement: this.element,
        options: { ...this.getOptions, ...newOptions },
      });
    },
    updateModalValue() {
      this.modalSettingsValue = !this.modalSettingsValue;
    },
    init() {
      this.$nextTick(() => {
        this.initMap();
        this.initTheme();
        this.initCluster();
        if (this.map) {
          store.subscribe((mutation) => {
            if (mutation.type === 'updateOptions') {
              if (this.options.initialPoint) {
                this.map.setView(
                  this.getCurrentPosition,
                  mutation.payload.options.zoomLevel,
                );
              } else {
                this.map.setView(
                  this.map.startingPoint,
                  mutation.payload.options.zoomLevel,
                );
              }
              this.map.wheelPxPerZoomLevel = 200;
              // TODO: Временный коммент
              // this.updateToken(
              //   mutation.payload.options.zoomLevel,
              //   this.map.bounds,
              // );
            }
          });

          this.createTokens();
          this.$store.commit('setActions', {
            actions: JSON.parse(JSON.stringify(this.actions)),
            idDash: this.idDash,
            id: this.element,
          });
          this.loadDataForPipe(this.getOptions.search);
        }
      });
    },
    async loadDataForPipe(search) {
      if (this.getOptions.mode && this.getOptions.mode[0] === 'Мониторинг' && this.map) {
        this.pipelineData = this.dataSources[search.id].data;
        const allPipes = {};
        if (Array.isArray(this.pipelineData)) {
          this.pipelineData.forEach((x) => {
            if (!allPipes[x.ID]) {
              allPipes[x.ID] = [];
            }
            allPipes[x.ID].push(x);
          });
        }

        this.pipelineDataDictionary = allPipes;
      }

      if (this.map) {
        this.reDrawMap(this.dataRestFrom);
        this.$nextTick(() => {
          this.$nextTick().then(() => {
            if (this.map && this.library?.objects) {
              this.$refs.setting.creationLayer();
              this.$refs.setting.addLayer();
            }
          });
        });
      }
    },
    updateTokenOnClickAction(value) {
      this.$store.commit('tokenAction', {
        idDash: this.idDashFrom,
        elem: this.idFrom,
        action: 'click',
        value,
      });
    },
    updateToken(value) {
      const valueObj = {
        zoom_level: value,
        top_left_point: this.leftBottom[1],
        bottom_right_point: this.rightTop[1],
      };
      this.$store.commit('tokenAction', {
        idDash: this.idDashFrom,
        elem: this.idFrom,
        action: 'button',
        value: { ...value, ...valueObj },
      });
    },
    createTokens() {
      const captures = ['top_left_point', 'bottom_right_point', 'zoom_level', 'dash_id', 'tab'];
      this.actions.forEach((item, i) => {
        this.$set(this.actions[i], 'capture', captures);
      });
      this.$store.commit('setActions', {
        actions: JSON.parse(JSON.stringify(this.actions)),
        idDash: this.idDash,
        id: this.element,
      });
    },
    reDrawMap(dataRest) {
      this.$nextTick().then(() => {
        if (this.map) {
          this.map.layerGroup = {};
          this.layerGroup = {};
          this.map.clearMap();
          this.error = null;
          // получаем osm server
          this.getOSM();
          // получаем библиотеку
          // get all icons that we need on maps
          this.generateLibrary(dataRest, this.getLibrary);
          if (this.library?.objects) {
            Object.keys(this.library.objects).forEach((item) => {
              if (!this.map.layerGroup[item]) {
                this.map.addGroup(item);
              }
            });
          }
          this.map.library = this.library;
          this.map.generateClusterPositionItems();
          if (!this.error && dataRest.length > 0) {
            // создаем элемент карты
            this.map.createMap(this.maptheme);
            // рисуем объекты на карте
            this.map.drawObjects({
              dataRest,
              pipelineDataDictionary: this.pipelineDataDictionary,
              callback: (id, element, evn) => {
                this.updateTokenOnClickAction(element);
                this.setClick(id, element, evn?.originalEvent.ctrlKey);
              },
            });
            if (this.map) {
              this.centerMap(dataRest);
            }
          }
        }
      });
    },
    centerMap(dataRest, isAutoCenter = false) {
      if (this.options.isAutoCenter || isAutoCenter) {
        const centerPoint = MapClass
          .getCenterPointFromData(dataRest.filter((el) => el.coordinates));
        if (centerPoint) {
          this.map.setView(
            centerPoint,
            this.defaultZoomLevel,
          );
        }
      } else if (this.options.initialPoint && !this.options.isAutoCenter) {
        this.map.setView(
          this.getCurrentPosition,
          this.defaultZoomLevel,
        );
      } else this.map.setView(this.map.startingPoint, this.defaultZoomLevel);
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
      this.map.mapTheme = options.maptheme ? options.maptheme : 'default';
    },
    initCluster() {
      const options = this.getOptions;
      this.map.clusterTextCount = options.clusterTextCount ? options.clusterTextCount : 4;
      this.map.clusterDelimiter = options.clusterDelimiter ? options.clusterDelimiter : ';';
      this.map.clusterPosition = options.clusterPosition ? options.clusterPosition : null;
    },
    getOSM() {
      const options = this.getOptions;
      if (options?.selectedLayer?.tile) {
        this.map.osmServer = options.selectedLayer;
      } else if (options?.osmserver) {
        this.map.osmServer = this.getServer;
      } else {
        this.error = 'Введите osm server';
      }
    },
    generateLibrary(dataRest, options) {
      const tmp = `${dataRest[dataRest.length - 1]?.ID}`.replaceAll("'", '"');
      if (tmp) {
        try {
          if (options) {
            this.library = JSON.parse(options);
          } else {
            this.library = JSON.parse(tmp);
          }
          if (
            !this.options?.library
              || (this.options?.library
              && JSON.stringify(this.library) !== JSON.stringify(this.options.library))
          ) {
            this.$store.commit('setLibrary', {
              library: this.library,
              id: this.idFrom, // id элемнета (table, graph-2)
              idDash: this.idDashFrom,
            });
            this.$store.commit('setState', [{
              object: this.dashFromStore.options,
              prop: 'primitivesLibrary',
              value: JSON.stringify(this.library),
            }]);
          }
        } catch {
          this.error = 'Ошибка формата входных данных';
          this.map.remove();
          this.map = null;
        }
        if (this.map && !this.map.isLegendGenerated) {
          this.map.library = this.library;
          this.map.layerGroup = this.layerGroup;
          this.map.createLegend(this.library);
        }
      }
    },

    initMap() {
      const map = new MapClass({
        mapRef: this.$refs.map,
        wheelPxPerZoomLevel: 101 - (this.options?.zoomStep || 200),
        zoomSnap: 0,
        zoom: this.getOptions.zoomLevel,
        maxZoom: 25,
        center: this.getCurrentPosition,
        layerGroup: this.layerGroup,
        library: this.library,
        mode: this.getOptions.mode,
        pipelineParameters: this.getOptions.pipelineParameters,
      });
      this.map = Object.freeze(map);
      this.map.setEvents([
        {
          event: 'moveend',
          callback: () => {
            this.position = this.map.center;
            [this.leftBottom, this.rightTop] = Object.entries(this.map.bounds);
            if (this.getOptions.zoomLevel !== this.map.zoom) {
              this.$store.commit('setState', [{
                object: this.dashFromStore.options,
                prop: 'zoomLevel',
                value: this.map.zoom,
              }]);
              this.updateToken(this.map.zoom);
            }
          },
        },
        {
          event: 'mouseout',
          callback: () => {
            this.map.scrollWheelZoom();
          },
        },
      ]);
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
        if (this.map) {
          this.map.resize();
        }
      });
    },

    setClick(tokenValue, element, ctrlKey) {
      const events = this.getEvents({
        event: ctrlKey ? 'onctrlclick' : 'onclick',
        partelement: 'empty',
      });
      if (events.length !== 0) {
        events.forEach((item) => {
          const copyItem = structuredClone(item);
          if (item.action === 'go') {
            copyItem.value[0] = tokenValue;
            copyItem.dashId = element.dashId;
            copyItem.tab = element?.tab;
            this.$store.dispatch('letEventGo', {
              event: copyItem,
              id: this.element,
              idDash: this.idDash,
              route: this.$router,
              store: this.$store,
            });
          }
        });
      }
    },
    getEvents({ event, partelement }) {
      let result = [];
      if (!this.$store.state[this.idDash].events) {
        this.$store.commit('setState', [{
          object: this.$store.state[this.idDash],
          prop: 'events',
          value: [],
        }]);
        return [];
      }
      if (partelement) {
        result = this.$store.state[this.idDash].events.filter((item) => (
          item.event === event
            && item.element === this.element
            && item.partelement === partelement
        ));
      } else {
        result = this.$store.state[this.idDash].events.filter(
          (item) => item.event === event
                && item.target === this.element,
        );
      }
      return result;
    },
    searchUpdate(value) {
      const searchZoomLevel = this.getOptions?.zoomLevelSearch || this.defaultZoomLevel;
      if (this.map) {
        if (value) {
          this.map.goToElement(this.dataRestFrom, value, searchZoomLevel).then((response) => {
            this.map.selectElement(response);
          });
        } else {
          this.map.unselectAllElements();
          this.centerMap(this.dataRestFrom, true);
        }
      }
    },
  },
};
</script>
<style lang="sass">
@import '../../sass/dashMap.sass'
</style>
