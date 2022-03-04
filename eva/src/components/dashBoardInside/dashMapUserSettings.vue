<template>
  <div class="med">
    <v-container
      class="fill-height"
      style="align-items: normal"
    >
      <v-row class="ma-0">
        <v-btn
          rounded
          :style="`background: ${theme.$secondary_bg}; color: ${theme.$main_text}`"
          @click="toggleSelect = !toggleSelect"
        >
          Режим
        </v-btn>
        <v-select
          :value="options.mode"
          :menu-props="{ value: toggleSelect }"
          :style="`visibility:hidden;background: ${theme.$secondary_bg}; position: absolute`"
          :items="mode"
          label="Режим"
          multiple
          @change="updatePipeDataSource($event)"
        />
        <v-spacer />
        <v-dialog
          v-model="dialog"
          max-width="390"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              rounded
              :style="`background: ${theme.$secondary_bg}`"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon :style="{ color: theme.$main_text }">
                {{ mdiSettings }}
              </v-icon>
            </v-btn>
          </template>
          <v-card
            :style="`background: ${theme.$secondary_bg}; color: ${theme.$main_text} !important`"
          >
            <v-card-title
              class="text-h5"
              :style="`background: ${theme.$main_bg} !important`"
            >
              Настройки
              <v-spacer />
              <a
                style="align-self: center"
                @click="dialog = false"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.8332 5.3415L14.6582 4.1665L9.99984 8.82484L5.3415 4.1665L4.1665
                     5.3415L8.82484 9.99984L4.1665 14.6582L5.3415 15.8332L9.99984
                     11.1748L14.6582 15.8332L15.8332 14.6582L11.1748 9.99984L15.8332 5.3415Z"
                    fill="#DADADA"
                  />
                </svg>
              </a>
            </v-card-title>
            <v-card-text
              :style="`color: ${theme.$main_text} !important; margin-top: 20px`"
            >
              <p>Подложка</p>
              <v-select
                v-model="options.selectedLayer"
                outlined
                return-object
                :items="tileLayers"
                light
                item-text="name"
                item-value="tile[0]"
                :dark="isDark"
                :style="{ color: theme.$main_text }"
                @change="updateTileLayer($event)"
              />
              <p>Начальный зум</p>
              <v-slider
                v-model="options.zoomLevel"
                :style="`color: ${theme.$main_text} !important`"
                class="align-center"
                max="25"
                min="0"
              >
                <template v-slot:label>
                  <v-text-field
                    v-model="options.zoomLevel"
                    outlined
                    dense
                    :dark="isDark"
                    class="mt-0 pt-0 map-user-settings__input"
                    hide-details
                    single-line
                    type="number"
                    style="width: 60px; margin-right: 10px;"
                  />
                </template>
              </v-slider>

              <p>Шаг масштаба</p>
              <v-slider
                v-model="options.zoomStep"
                class="align-center"
                max="1"
                min="0.01"
                step="0.01"
              >
                <template v-slot:label>
                  <v-text-field
                    v-model="options.zoomStep"
                    outlined
                    dense
                    :dark="isDark"
                    class="mt-0 pt-0 map-user-settings__input"
                    hide-details
                    single-line
                    type="number"
                    style="width: 60px; margin-right: 10px;"
                  />
                </template>
              </v-slider>

              <p>Начальная точка</p>
              <v-row>
                <v-col
                  cols="3"
                  style="padding-right: 0"
                >
                  <v-text-field
                    v-model="options.initialPoint.x"
                    outlined
                    dense
                    :dark="isDark"
                    type="number"
                    class="map-user-settings__input"
                    :style="`color: ${theme.$secondary_text} !important`"
                  >
                    <template v-slot:prepend>
                      <v-button>X:</v-button>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col
                  cols="3"
                  style="padding-right: 0"
                >
                  <v-text-field
                    v-model="options.initialPoint.y"
                    outlined
                    dense
                    :dark="isDark"
                    type="number"
                    class="map-user-settings__input"
                    :style="`color: ${theme.$secondary_text} !important`"
                  >
                    <template v-slot:prepend>
                      <v-button>Y:</v-button>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col class="flex-grow-0">
                  <v-btn
                    small
                    color="primary"
                    class="mt-3"
                    @click="onClickChoosingCoordinates"
                  >
                    Указать на карте
                  </v-btn>
                </v-col>
              </v-row>

              <p>Легенда карты</p>
              <v-checkbox
                v-model="options.showLegend"
                hide-details
              >
                <template v-slot:label>
                  <span :style="`color: ${theme.$secondary_text} !important`">
                    Включить отображение легенды
                  </span>
                </template>
              </v-checkbox>

              <p>ИД для режима мониторинга</p>
              <v-select
                v-model="options.search"
                outlined
                :dark="isDark"
                item-text="sid"
                :items="searches"
                :return-object="true"
                @change="updatePipeDataSource"
              />
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-row>

      <v-row
        v-show="options.showLegend"
        align="end"
        align-content="end"
        class="mb-5 mr-0"
      >
        <v-spacer />
        <v-card
          style="max-height: 466px"
          max-width="280"
          class="px-5 pb-5"
          :color="theme.$main_bg"
        >
          <v-subheader
            style="color: white"
            class="px-0"
          >
            <v-row class="ma-0 fill-height">
              <v-col class="ma-0 pa-0 fill-height">
                <v-row
                  class="mt-5 mx-0 pa-0"
                  justify="center"
                  align="center"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0)">
                      <path
                        d="M19 5V19H5V5H19ZM20.1 3H3.9C3.4 3 3 3.4 3 3.9V20.1C3 20.5 3.4 21 3.9
                         21H20.1C20.5 21 21 20.5 21 20.1V3.9C21 3.4 20.5 3 20.1 3ZM11
                         7H17V9H11V7ZM11 11H17V13H11V11ZM11 15H17V17H11V15ZM7
                         7H9V9H7V7ZM7 11H9V13H7V11ZM7 15H9V17H7V15Z"
                        fill="white"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0">
                        <rect
                          width="24"
                          height="24"
                          fill="white"
                        />
                      </clipPath>
                    </defs>
                  </svg>

                  <span
                    class="ml-2 legend-title"
                    :style="`color: ${theme.$main_text} !important;`"
                  >
                    Легенда
                  </span>
                  <v-spacer />
                  <a
                    style="align-self: center"
                    @click="closeLegend"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.8332 5.3415L14.6582 4.1665L9.99984 8.82484L5.3415 4.1665L4.1665
                         5.3415L8.82484 9.99984L4.1665 14.6582L5.3415 15.8332L9.99984
                         11.1748L14.6582 15.8332L15.8332 14.6582L11.1748 9.99984L15.8332 5.3415Z"
                        fill="#DADADA"
                      />
                    </svg>
                  </a>
                </v-row>
              </v-col>
            </v-row>
          </v-subheader>
          <v-divider
            style="margin-bottom: 10px; border: 1px solid #555454"
          />

          <v-card
            width="240"
            outlined
          >
            <v-list
              :style="`color: ${theme.$main_text} !important; max-height: 382px`"
              class="overflow-y-auto"
              :color="theme.$secondary_bg"
            >
              <v-list-item
                v-for="item in library.objects"
                :key="item.name"
              >
                <template v-if="item.image">
                  <v-list-item-avatar
                    size="20px"
                    style="align-self: center"
                  >
                    <v-img :src="base_svg_url + item.image" />
                  </v-list-item-avatar>

                  <v-list-item-title
                    :style="`color: ${theme.$main_text} !important; text-align: left`"
                    v-text="item.name"
                  />
                </template>

                <template v-else-if="item.background_color">
                  <v-list-item-avatar
                    size="20px"
                    style="align-self: center; border-radius: 0"
                    v-html="createHtmlIcon(item)"
                  />

                  <v-list-item-title
                    :style="`color: ${theme.$main_text} !important; text-align: left`"
                    v-text="item.name"
                  />
                </template>

                <template v-else>
                  <v-list-item-avatar
                    size="20px"
                    style="align-self: center"
                  >
                    <div>
                      <svg
                        height="210"
                        width="200"
                      >
                        <line
                          x1="0"
                          y1="0"
                          x2="200"
                          y2="200"
                          :stroke="item.color"
                          :stroke-width="item.width"
                        />
                      </svg>
                    </div>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title
                      :style="`color: ${theme.$main_text} !important; text-align: left`"
                      v-text="item.name"
                    />
                  </v-list-item-content>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-card>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { mdiFormatListBulletedSquare, mdiSettings } from '@mdi/js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.tilelayer.colorfilter';
import 'leaflet.markercluster';

export default {
  props: {
    idElement: {
      type: String,
      required: true,
    },
    idDashFrom: {
      type: String,
      required: true,
    },
    map: {
      type: Object,
      required: true,
    },
    // library: Object
  },
  data() {
    return {
      toggleSelect: false,
      mode: ['Мониторинг', 'Сравнение', 'Аналитика', 'Поиск', 'Режим 5'],
      mdiSettings,
      mdiList: mdiFormatListBulletedSquare,
      dialog: false,
      base_svg_url: `${window.location.origin}/svg/`,
      currentTile: {},
      searches: [],
      tileLayers: [
        {
          name: 'Заданная в настройках',
          tile: [],
        },
        {
          name: 'Google спутник',
          tile: [
            'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
            {
              subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
              attribution: '<a http="google.ru" target="_blank">Google</a>',
            },
          ],
        },
        {
          name: 'Google карты',
          tile: [
            'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
            {
              subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
              attribution: '<a http="google.ru" target="_blank">Google</a>',
            },
          ],
        },
      ],
      options: {
        selected: 'яндекс',
        selectedLayer: '',
        zoomLevel: 10,
        zoomStep: 0.01,
        initialPoint: {
          x: 59.242065955847735,
          y: 74.35169122692963,
        },
        showLegend: true,
        mode: '',
        search: '',
      },
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    isDark() {
      return this.theme.$main_text === '#F4F4FA';
    },
    dashSettings() {
      return this.getOptions;
    },
    library() {
      return this.getLibrary;
    },
    getLibrary() {
      return this.elementFromStore?.options?.library;
    },
    elementFromStore() {
      return this.$store.state[this.idDashFrom][this.idElement];
    },
    getOptions() {
      if (!this.idDash) {
        return [];
      }
      if (!this.dashFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.idElement, idDash: this.idDashFrom });
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
  },
  watch: {
    options: {
      deep: true,
      handler(val, oldVal) {
        if (val.mode !== oldVal.mode) this.updatePipeDataSource();
        this.updateOptions(val);
      },
    },
  },
  mounted() {
    const options = this.getOptions;
    this.tileLayers[0].tile = options.osmserver;
    // init store for reactivity
    if (!options.showLegend || !options.initialPoint) {
      const initOptions = {
        showLegend: true,
        zoomLevel: this.options.zoomLevel,
        zoomStep: this.options.zoomStep,
        selectedLayer: this.options.selectedLayer,
        initialPoint: this.options.initialPoint,
      };
      this.$store.commit('setOptions', {
        idDash: this.idDashFrom,
        id: this.idElement,
        options: initOptions,
      });
    } else {
      this.options = options;
    }

    this.searches = this.loadDataForPipe();
  },
  methods: {
    onClickChoosingCoordinates() {
      const cursorCssClass = 'cursor-crosshair';
      this.dialog = false;
      // eslint-disable-next-line no-underscore-dangle
      L.DomUtil.addClass(this.map._container, cursorCssClass);
      const clickEvent = (event) => {
        this.dialog = true;
        // eslint-disable-next-line no-underscore-dangle
        L.DomUtil.removeClass(this.map._container, cursorCssClass);
        this.options.initialPoint.x = event.latlng.lat;
        this.options.initialPoint.y = event.latlng.lng;
        this.map.off('click', clickEvent);
      };
      this.map.on('click', clickEvent);
    },
    updatePipeDataSource(e) {
      const set = new Set(e);
      set.delete(this.options.mode[0]);
      this.options.mode = Array.from(set);
      this.$emit('updatePipeDataSource', this.options.search);
    },
    loadDataForPipe() {
      return this.$store.state[this.idDashFrom].searches;
    },
    closeLegend() {
      this.options.showLegend = false;
    },
    createHtmlIcon(lib) {
      const {
        text_color: textColor = '#FFFFFF',
        background_color: color = '65, 62, 218',
        opacity = 0.6,
        border_radius: borderRadius = '2px',
        border = 'none',
      } = lib;
      return `<div class="leaflet-div-icon"
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
          <span style="color:${textColor}">кп<span>
        </div>`;
    },
    updateTileLayer(e) {
      this.map.removeLayer(this.currentTile);
      if (typeof e.tile === 'string') {
        let temp = e.tile;
        temp = [temp];
        this.currentTile = L.tileLayer(...temp);
        this.map.addLayer(this.currentTile);
        this.updateOptions({ selectedLayer: temp[0] });
        return;
      }
      this.currentTile = L.tileLayer(...e.tile);
      this.map.addLayer(this.currentTile);
      this.updateOptions({ selectedLayer: e.tile[0] });
    },

    updateOptions(newOptions) {
      this.$store.commit('updateOptions', {
        idDash: this.idDashFrom,
        idElement: this.idElement,
        options: { ...this.dashSettings, ...newOptions },
      });
    },

    setOptions() {
      // отправляем настройки в хранилище
      if (!this.options.level) {
        this.options.level = 1;
      }

      if (
        typeof this.options.timeFormat !== 'undefined'
        && this.options.timeFormat == null
      ) {
        this.options.timeFormat = '%Y-%m-%d %H:%M:%S';
      }
      if (typeof this.options.size !== 'undefined') {
        if (this.options.size == null) {
          this.options.size = '100px';
        } else if (String(this.options.size).indexOf('px') === -1) {
          this.options.size = `${this.options.size}px`;
        }
      }
      // let options = {...{},...this.options};
      if (this.element.indexOf('csvg') !== -1) {
        this.options.tooltip = this.tooltip;
      }
      if (this.element.indexOf('piechart') !== -1) {
        this.options.metricsRelation = JSON.parse(
          JSON.stringify(this.metricsRelation),
        );
        this.options.colorsPie = this.colorsPie;
        if (this.colorsPie.theme === 'custom') {
          this.themes[this.colorsPie.nametheme] = this.colorsPie.colors.split(',');
          this.colorsPie.theme = this.colorsPie.nametheme;
        }
        this.options.themes = this.themes;
      }
      if (this.element.indexOf('multiLine') !== -1) {
        const updateMetrics = this.metrics.map((item) => JSON.parse(JSON.stringify(item)));
        this.$set(this.options, 'metrics', updateMetrics);
      }
      this.$store.commit('setOptions', {
        idDash: this.idDash,
        id: this.element,
        options: this.options,
        titles: this.tableTitles,
      });
      this.cancelModal();
    },
  },
};
</script>

<style lang="sass">
.theme--light.v-select .v-select__selections
  color: var(--main_text) !important

.legend-title
  font-size: 18px
  font-weight: 600
  line-height: 22px

.med
  height: 100%
  position: absolute
  /* left: 0px; */
  right: 0
  z-index: 1000000

.theme--light.v-input input, .theme--light.v-input textarea
  color: var(--main_text) !important

.v-text-field__slot label
  color: var(--main_text) !important
.med
  color: var(--main_text) !important
  .v-text-field__slot input
    color: var(--main_text) !important
  .v-input__slot fieldset
    color: var(--main_text) !important
  .v-input__control
    .v-icon
      color: var(--main_text) !important
  .v-select__selections
    color: var(--main_text) !important
  .v-input input
    min-height: auto !important

.map-user-settings__input
  .v-input__slot
    padding: 0 1px 0 12px !important
  .v-text-field__slot
    margin: 0 -12px 0 -1px
</style>
