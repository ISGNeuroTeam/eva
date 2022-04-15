<template>
  <v-dialog
    v-model="dialog"
    max-width="390"
  >
    <v-card
      class="dash-map-user-settings"
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
                <div>X:</div>
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
                <div>Y:</div>
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
</template>

<script>
import { mdiFormatListBulletedSquare, mdiSettings } from '@mdi/js';
import L from 'leaflet';

export default {
  name: 'DashMapUserSettings',
  props: {
    modalValue: {
      type: Boolean,
      default: false,
    },
    map: {
      type: Object,
      required: true,
    },
    idElement: {
      type: String,
      required: true,
    },
    idDashFrom: {
      type: String,
      required: true,
    },
    search: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      mdiSettings,
      mdiList: mdiFormatListBulletedSquare,
      options: {
        selected: 'яндекс',
        selectedLayer: null,
        zoomLevel: 10,
        zoomStep: 0.01,
        initialPoint: {
          x: 59.242065955847735,
          y: 74.35169122692963,
        },
        showLegend: true,
        mode: [],
        search: '',
      },
      currentTile: {},
    };
  },
  computed: {
    tileLayers() {
      return [
        {
          name: 'Заданная в настройках',
          tile: this.dashFromStore.options.osmserver || null,
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
      ];
    },
    dialog: {
      get() {
        return this.modalValue;
      },
      set(value) {
        this.$emit('update:modalValue', value);
      },
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    dashSettings() {
      return this.getOptions;
    },
    getOptions() {
      if (!this.idElement) {
        return [];
      }
      if (!this.dashFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.idElement, idDash: this.idElement });
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
    dashFromStore() {
      return this.$store.state[this.idDashFrom][this.idElement];
    },
    isDark() {
      return this.theme.$main_text === '#F4F4FA';
    },
    searches() {
      if (typeof this.$store.state[this.idDashFrom].searches === 'object') {
        return Object.values(this.$store.state[this.idDashFrom].searches);
      }
      return this.$store.state[this.idDashFrom]?.searches || [];
    },
  },
  watch: {
    modalValue(val) {
      if (val) {
        if (JSON.stringify(this.options)
            !== JSON.stringify(this.dashFromStore.options)) {
          this.options = JSON.parse(JSON.stringify(this.dashFromStore.options));
        }
        if (Object.keys(this.search)?.length > 0) {
          this.$set(this.options, 'search', this.search);
        } else {
          this.$set(this.options, 'search', this.searches.find((search) => search.id === this.dashFromStore.search));
        }
      }
    },
    options: {
      deep: true,
      handler(val, oldVal) {
        if (JSON.stringify(this.options) !== JSON.stringify(this.getOptions)) {
          if (val.mode !== oldVal.mode) this.updatePipeDataSource();
          this.updateOptions(val);
        }
      },
    },
  },
  mounted() {
    this.updateSelectedLayerValue();
  },
  methods: {
    updateTileLayer(e) {
      if (e?.tile) {
        this.map.removeLayer(this.currentTile);
        if (typeof e.tile === 'string') {
          let temp = e.tile;
          temp = [temp];
          this.currentTile = L.tileLayer(...temp);
          this.map.addLayer(this.currentTile);
          this.updateOptions({ selectedLayer: temp[0] || null });
          return;
        }
        this.currentTile = L.tileLayer(...e.tile);
        this.map.addLayer(this.currentTile);
        this.updateOptions({ selectedLayer: e.tile[0] || null });
      }
    },
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
      if (this.options.search) {
        this.$emit('updatePipeDataSource', this.options.search);
      }
    },
    updateOptions(newOptions) {
      this.$store.commit('updateOptions', {
        idDash: this.idDashFrom,
        idElement: this.idElement,
        options: { ...this.dashSettings, ...newOptions },
      });
    },
    updateSelectedLayerValue() {
      const options = JSON.parse(JSON.stringify(this.getOptions));
      this.tileLayers[0].tile = options.osmserver;
      // init store for reactivity
      if (!options.showLegend || !options.initialPoint) {
        const initOptions = {
          showLegend: true,
          zoomLevel: this.options.zoomLevel,
          zoomStep: this.options.zoomStep,
          selectedLayer: this.options.selectedLayer || options.selectedLayer,
          initialPoint: this.options.initialPoint,
        };
        this.$store.commit('setOptions', {
          idDash: this.idDashFrom,
          id: this.idElement,
          options: initOptions,
        });
      } else {
        this.$set(this, 'options', JSON.parse(JSON.stringify(options)));
      }
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

.theme--light.v-input input, .theme--light.v-input textarea
  color: var(--main_text) !important

.v-text-field__slot label
  color: var(--main_text) !important
.dash-map-user-settings
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
