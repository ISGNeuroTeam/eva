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
        <v-select
          v-model="options.selectedLayer"
          outlined
          return-object
          :items="tileLayers"
          light
          dense
          item-text="name"
          item-value="tile[0]"
          :dark="isDark"
          label="Подложка"
          class="map-user-settings__select mb-3"
          :style="{ color: theme.$main_text }"
          @change="updateTileLayer($event)"
        />
        <p
          class="mb-1"
          style="font-size: 16px"
        >
          Начальный зум
        </p>
        <div class="row align-center mb-3 mt-0">
          <div class="col-9 pb-0 pt-0">
            <v-slider
              v-model="options.zoomLevel"
              :style="`color: ${theme.$main_text} !important`"
              class="map-user-settings__slider align-center"
              dense
              max="25"
              min="0"
            />
          </div>
          <div class="col-3 pb-0 pt-0">
            <v-text-field
              v-model.number="options.zoomLevel"
              outlined
              dense
              :dark="isDark"
              class="map-user-settings__input"
              hide-details
              single-line
            />
          </div>
        </div>
        <p
          class="mb-1"
          style="font-size: 16px"
        >
          Зум при поиске
        </p>
        <div class="row align-center mb-3 mt-0">
          <div class="col-9 pb-0 pt-0">
            <v-slider
              v-model="options.zoomLevelSearch"
              :style="`color: ${theme.$main_text} !important`"
              class="map-user-settings__slider align-center"
              max="25"
              min="0"
            />
          </div>
          <div class="col-3 pb-0 pt-0">
            <v-text-field
              v-model.number="options.zoomLevelSearch"
              outlined
              dense
              :dark="isDark"
              class="map-user-settings__input"
              hide-details
              single-line
            />
          </div>
        </div>

        <p
          class="mb-1"
          style="font-size: 16px"
        >
          Шаг масштаба
        </p>
        <div class="row align-center mb-3 mt-0">
          <div class="col-9 pb-0 pt-0">
            <v-slider
              v-model="options.zoomStep"
              class="map-user-settings__slider align-center"
              max="100"
              min="1"
              step="1"
            />
          </div>
          <div class="col-3 pb-0 pt-0">
            <v-text-field
              v-model.number="options.zoomStep"
              outlined
              dense
              :dark="isDark"
              class="map-user-settings__input"
              hide-details
              single-line
            />
          </div>
        </div>

        <p
          :class="options.isAutoCenter ? 'mb-1' : 'mb-3'"
          style="font-size: 16px"
        >
          Начальная точка
        </p>
        <div class="mb-2">
          <div
            v-if="!options.isAutoCenter"
            class="row align-center"
          >
            <div class="col-5">
              <v-text-field
                v-model.number="options.initialPoint.x"
                outlined
                dense
                :disabled="options.isAutoCenter"
                :dark="isDark"
                class="map-user-settings__input mt-0 mb-0"
                :style="`color: ${theme.$secondary_text} !important`"
              >
                <template v-slot:label>
                  <div>X-координата:</div>
                </template>
              </v-text-field>
            </div>
            <div class="col-5">
              <v-text-field
                v-model.number="options.initialPoint.y"
                outlined
                dense
                :dark="isDark"
                :disabled="options.isAutoCenter"
                class="map-user-settings__input mt-0 mb-0"
                :style="`color: ${theme.$secondary_text} !important`"
              >
                <template v-slot:label>
                  <div>Y-координата:</div>
                </template>
              </v-text-field>
            </div>
            <div
              class="col-2"
            >
              <v-tooltip
                bottom
                :color="theme.$primary_button"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    outlined
                    :color="theme.$main_text"
                    class="pa-0"
                    min-width="36px"
                    height="40px"
                  >
                    <v-icon
                      :color="theme.$main_text"
                      v-bind="attrs"
                      v-on="on"
                      @click="onClickChoosingCoordinates"
                    >
                      {{ mdiMapMarker }}
                    </v-icon>
                  </v-btn>
                </template>
                <span>Указать на карте</span>
              </v-tooltip>
            </div>
          </div>
        </div>

        <v-checkbox
          v-model="options.isAutoCenter"
          hide-details
          dense
          class="mt-0 mb-3"
        >
          <template v-slot:label>
            <div style="font-size: 14px">
              Авто-центрирование
            </div>
          </template>
        </v-checkbox>

        <p
          class="mb-1"
          style="font-size: 16px"
        >
          Легенда карты
        </p>
        <v-checkbox
          v-model="options.showLegend"
          hide-details
          dense
          class="mt-0 mb-3"
        >
          <template v-slot:label>
            <span :style="`color: ${theme.$main_text} !important; font-size: 14px`">
              Включить отображение легенды
            </span>
          </template>
        </v-checkbox>
        <v-text-field
          v-model="options.nameLegend"
          label="Имя легенды"
          :color="theme.$accent_ui_color"
          class="mb-4"
          outlined
          dense
          hide-details
          clearable
        />
        <v-select
          v-model="options.search"
          outlined
          dense
          label="ИД для режима мониторинга"
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

import {
  mdiMapMarker,
} from '@mdi/js';

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
      options: {
        zoomLevelSearch: 10,
        selected: 'яндекс',
        selectedLayer: null,
        zoomLevel: 10,
        zoomStep: 1,
        isAutoCenter: false,
        initialPoint: {
          x: 59.242065955847735,
          y: 74.35169122692963,
        },
        showLegend: true,
        mode: [],
        search: '',
        nameLegend: 'Легенда',
      },
      currentTile: {},
      // icons
      mdiMapMarker,
    };
  },
  computed: {
    tileLayers() {
      return [
        {
          name: 'Заданная в настройках',
          tile: [
            this.dashFromStore.options.osmserver || null,
            {
              subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
              attribution: '<a http="google.ru" target="_blank">Google</a>',
            },
          ],
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
          this.options = structuredClone(this.dashFromStore.options);
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
    'options.zoomStep': {
      deep: true,
      handler(val, oldVal) {
        if (val && val !== oldVal) {
          this.map.options.wheelPxPerZoomLevel = 101 - val;
          this.map.map.options.wheelPxPerZoomLevel = 101 - val;
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
        this.map.removeLayer(e.tile);
        if (typeof e.tile === 'string') {
          let temp = e.tile;
          temp = [temp];
          this.map.addLayer(temp);
          this.updateOptions({ selectedLayer: temp[0] || null });
          return;
        }
        this.map.addLayer(e.tile);
        this.updateOptions({ selectedLayer: e.tile[0] || null });
      }
    },
    onClickChoosingCoordinates() {
      const cursorCssClass = 'cursor-crosshair';
      this.dialog = false;
      this.map.addClass(cursorCssClass);
      const clickEvent = (event) => {
        this.map.removeClass(cursorCssClass);
        this.options.initialPoint.x = event.latlng.lat;
        this.options.initialPoint.y = event.latlng.lng;
        this.$store.commit('setState', [{
          object: this.dashFromStore.options.initialPoint,
          prop: 'x',
          value: this.options.initialPoint.x,
        }]);
        this.$store.commit('setState', [{
          object: this.dashFromStore.options.initialPoint,
          prop: 'y',
          value: this.options.initialPoint.y,
        }]);
        this.dialog = true;
        this.map.stopEvents('click');
      };
      this.map.setEvents([
        {
          event: 'click',
          callback: (e) => {
            clickEvent(e);
          },
        },
      ]);
    },
    updatePipeDataSource() {
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
      const options = structuredClone(this.getOptions);
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
          options: { ...initOptions, ...options },
        });
      } else {
        this.$set(this, 'options', structuredClone(options));
      }
    },
  },
};
</script>

<style lang="sass">
.theme--light.v-select .v-select__selections
  color: var(--main_text) !important

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
    margin-bottom: 0 !important
    //padding: 0 1px 0 10px !important
    //overflow: hidden
  .v-text-field__slot
    //margin: 0 -12px 0 -1px
  .v-text-field__details
    display: none
.map-user-settings__slider
  .v-messages
    display: none
  .v-input__slot
    margin-bottom: 0
.map-user-settings__select
  .v-text-field__details
    display: none
</style>
