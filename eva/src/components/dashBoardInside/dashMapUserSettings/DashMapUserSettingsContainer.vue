<template>
  <div class="med">
    <v-container
      class="fill-height"
      style="align-items: normal"
    >
      <v-row class="ma-0 justify-end">
        <v-menu
          v-if="options.mode && options.mode[0] === 'Мониторинг'"
          v-model="toggleSelectPipeline"
          max-width="220"
          max-height="198"
          nudge-top="-25px"
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ on:menu }">
            <div class="d-flex flex-column">
              <v-btn
                rounded
                :style="`
                 background: ${theme.$secondary_bg};
                 color: ${theme.$main_text};
                 pointer-events: auto;
                 margin-right: 30px
                 `"
                class="med-btn"
                v-on="menu"
                @click="toggleSelectPipeline = !toggleSelectPipeline"
              >
                <v-icon :style="{ color: theme.$main_text }">
                  {{ mdiLayers }}
                </v-icon>
                <span class="med-btn__text">
                  Параметры трубопровода
                </span>
                <v-icon :style="{ color: theme.$main_text }">
                  {{ mdiChevronDown }}
                </v-icon>
              </v-btn>
            </div>
          </template>
          <div
            :style="`background: ${theme.$secondary_bg}; pointer-events: all`"
          >
            <div
              v-for="(item, i) in pipeline"
              :key="i"
              class="med-group"
            >
              <v-checkbox
                v-model="pipelineParameters"
                :value="item"
                :label="item.name"
                class="med-checkbox"
                multiple
                @change="changePipeline($event)"
              />
            </div>
          </div>
        </v-menu>
        <v-menu
          v-model="toggleSelect"
          z-index="1"
          content-class="med-menu"
        >
          <template v-slot:activator="{ on:menu }">
            <div class="d-flex flex-column">
              <v-btn
                rounded
                :style="`
                   background: ${theme.$secondary_bg};
                   color: ${theme.$main_text};
                   pointer-events: auto;
                   margin-right: 30px`"
                class="med-btn"
                v-on="menu"
                @click="toggleSelect = !toggleSelect"
              >
                <v-icon :style="{ color: theme.$main_text }">
                  {{ mdiClipboardText }}
                </v-icon>
                <span class="med-btn__text">
                  Режим
                </span>
                <v-icon :style="{ color: theme.$main_text }">
                  {{ mdiChevronDown }}
                </v-icon>
              </v-btn>
              <v-select
                :value="options.mode"
                :menu-props="{
                  value:toggleSelect,
                  maxWidth: 200
                }"
                :style="`visibility:hidden;background: ${theme.$secondary_bg}; position: absolute`"
                :items="mode"
                label="Режим"
                multiple
                @change="updatePipeDataSource($event)"
              />
            </div>
          </template>
        </v-menu>
        <v-menu
          v-model="toggleSelectLayer"
          max-width="220"
          max-height="198"
          nudge-top="-25px"
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ on:menu }">
            <div class="d-flex flex-column">
              <v-btn
                rounded
                :style="`
               background: ${theme.$secondary_bg};
               color: ${theme.$main_text};
               pointer-events: auto;
               margin-right: 30px
               `"
                class="med-btn"
                v-on="menu"
                @click="toggleSelectLayer = !toggleSelectLayer"
              >
                <v-icon :style="{ color: theme.$main_text }">
                  {{ mdiLayers }}
                </v-icon>
                <span class="med-btn__text">
                  Слои
                </span>
                <v-icon :style="{ color: theme.$main_text }">
                  {{ mdiChevronDown }}
                </v-icon>
              </v-btn>
            </div>
          </template>
          <draggable
            v-model="localLayerList"
            handle=".burger"
            :style="`background: ${theme.$secondary_bg}; pointer-events: all`"
            @change="onDrop"
          >
            <div
              v-for="(item, i) in localLayerList"
              :key="i"
              class="med-group"
            >
              <v-checkbox
                v-model="item.isActive"
                :label="item.name"
                class="med-checkbox"
                @change="change(item)"
              >
                <template v-slot:append>
                  <v-icon
                    :color="theme.$main_text"
                    size="18"
                    class="burger"
                    style="cursor: move"
                    v-text="mdiMenu"
                  />
                </template>
              </v-checkbox>
            </div>
          </draggable>
        </v-menu>
        <v-btn
          rounded
          :style="`
          background: ${theme.$secondary_bg};
           color: ${theme.$main_text};
           pointer-events: auto`"
          @click="$emit('openSettingsModal')"
        >
          <v-icon :style="{ color: theme.$main_text }">
            {{ mdiSettings }}
          </v-icon>
        </v-btn>
      </v-row>

      <v-row
        v-if="getOptions.showLegend && library && library.objects"
        align="end"
        align-content="end"
        class="mb-5 mr-0"
      >
        <v-spacer />
        <v-card
          style="max-height: 466px; pointer-events: auto"
          max-width="280"
          class="px-5 pb-5 test"
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
                    {{ options.nameLegend }}
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
              :color="theme.$main_bg"
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
import draggable from 'vuedraggable';
import {
  mdiSettings,
  mdiLayers,
  mdiClipboardText,
  mdiChevronDown,
  mdiMenu,
} from '@mdi/js';
import 'leaflet/dist/leaflet.css';

export default {
  name: 'DashMapUserSettingsContainer',
  components: {
    draggable,
  },
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
  },
  data() {
    return {
      toggleSelect: false,
      mode: ['Мониторинг', 'Сравнение', 'Аналитика', 'Поиск', 'Режим 5'],
      mdiSettings,
      mdiLayers,
      mdiClipboardText,
      mdiChevronDown,
      mdiMenu,
      base_svg_url: `${window.location.origin}/svg/`,
      options: {
        selected: 'яндекс',
        selectedLayer: '',
        zoomLevel: 10,
        initialPoint: {
          x: 59.242065955847735,
          y: 74.35169122692963,
        },
        showLegend: true,
        mode: [],
        search: '',
        nameLegend: 'Легенда',
      },
      localLayerList: [],
      toggleSelectLayer: false,
      toggleSelectPipeline: false,
      pipeline: [
        {
          type: 'P',
          name: 'Давление',
        },
        {
          type: 'S',
          name: 'Скорость потока',
        },
        {
          type: 'D',
          name: 'Диаметр',
        },
        {
          type: 'L',
          name: 'Длина',
        },
      ],
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
      return this.dashFromStore?.options?.library;
    },
    layerList: {
      get() {
        return this.dashFromStore?.options?.layerList || [];
      },
      set(val) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'layerList',
          value: val,
        }]);
      },
    },
    pipelineParameters: {
      get() {
        return this.dashFromStore?.options?.pipelineParameters || [];
      },
      set(val) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'pipelineParameters',
          value: val,
        }]);
      },
    },
    dashFromStore() {
      return this.$store.state[this.idDashFrom][this.idElement];
    },
    getOptions() {
      if (!this.idElement) {
        return [];
      }
      if (!this.dashFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.idElement, idDash: this.idElement });
      }
      if (!this.dashFromStore?.options.pipelineParameters) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'pipelineParameters',
          value: this.pipeline,
        }]);
      }
      if (!this.dashFromStore?.options?.nameLegend) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'nameLegend',
          value: 'Легенда',
        }]);
      }
      return this.dashFromStore.options;
    },
    searches() {
      if (typeof this.$store.state[this.idDashFrom].searches === 'object') {
        return Object.values(this.$store.state[this.idDashFrom].searches);
      }
      return this.$store.state[this.idDashFrom]?.searches || [];
    },
  },
  watch: {
    getOptions: {
      deep: true,
      handler() {
        if (JSON.stringify(this.options) !== JSON.stringify(this.getOptions)) {
          this.options = JSON.parse(JSON.stringify(this.getOptions));
        }
      },
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
    layerList(val) {
      this.localLayerList = JSON.parse(JSON.stringify(val));
    },
  },
  mounted() {
    const options = JSON.parse(JSON.stringify(this.getOptions));
    if (JSON.stringify(this.options) !== JSON.stringify(this.getOptions)) {
      this.options = JSON.parse(JSON.stringify(options));
    }
    this.localLayerList = JSON.parse(JSON.stringify(this.layerList));
    if (!this.getOptions.pipelineParameters && this.options.mode[0] === 'Мониторинг') {
      this.map.options.mode = this.options.mode;
      this.options.pipelineParameters = this.pipelineParameters;
      this.map.options.pipelineParameters = this.pipelineParameters;
    }
  },
  methods: {
    change(e) {
      if (e.isActive) {
        this.map.addLayerGroup(e.type);
      } else {
        this.map.removeLayerGroup(e.type);
      }
      this.layerList = JSON.parse(JSON.stringify(this.localLayerList));
    },
    creationLayer() {
      if (this.layerList.length === 0) {
        const key = Object.keys(this.library.objects);
        this.localLayerList = Object.values(this.library.objects);
        this.localLayerList.forEach((item, index) => {
          if (!item.type) {
            item.type = +key[index];
            item.isActive = true;
          }
        });
        this.layerList = JSON.parse(JSON.stringify(this.localLayerList));
      }
    },
    addLayer() {
      this.layerList.forEach((item, index) => {
        if (item.isActive && this.map) {
          this.change(item);
          this.map.changeIndexOffset(item.type, 10000 - (index * 100));
        }
      });
    },
    onDrop() {
      this.layerList = JSON.parse(JSON.stringify(this.localLayerList));
      this.changeZIndex();
    },
    changeZIndex() {
      this.layerList.forEach((item, i) => {
        this.map.changeIndexOffset(item.type, 10000 - (i * 100));
      });
    },
    updatePipeDataSource(e) {
      const set = new Set(e);
      if (this.options.mode) {
        set.delete(this.options.mode[0]);
      }
      this.options.mode = Array.from(set);
      this.$store.commit('setState', [{
        object: this.dashFromStore.options,
        prop: 'mode',
        value: this.options.mode,
      }]);
      this.map.options.mode = this.options.mode;
      if (this.options.search && this.options.mode[0] === 'Мониторинг') {
        this.$emit('updatePipeDataSource', this.options.search);
      }
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

    updateOptions(newOptions) {
      this.$store.commit('updateOptions', {
        idDash: this.idDashFrom,
        idElement: this.idElement,
        options: { ...this.dashSettings, ...newOptions },
      });
    },

    changePipeline(parameters) {
      this.map.options.pipelineParameters = parameters;
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
  max-width: 164px
  max-height: 27px
  overflow: hidden

.med
  height: 100%
  position: absolute
  right: 0
  z-index: 401
  pointer-events: none
  &-menu
    border: none !important

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

  &-checkbox
    margin-top: 0 !important
    padding: 7px 13px
    display: flex
    align-items: center
    background: var(--main_bg)
    &.v-input--is-label-active
      background: rgba(244, 244, 250, 0.2)
    .v-messages
      display: none
    .v-input__slot
      margin-bottom: 0
    .v-label
      color: var(--main_text)
    .v-input--selection-controls__input,
    .v-input__append-outer
      color: var(--main_text)
  &-btn
    .v-btn__content
      text-transform: capitalize
      font-size: 18px
    &__text
      margin: 0 8px 0 6px

.map-user-settings__input
  .v-input__slot
    padding: 0 1px 0 12px !important
  .v-text-field__slot
    margin: 0 -12px 0 -1px
</style>
