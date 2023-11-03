<template>
  <div
    ref="vis"
    class="visualisation"
    :style="{
      background: theme.$main_bg,
      color: theme.$main_text,
      minHeight: activeElem ==='bush' ? '400px' : undefined }"
  >
    <div class="header-settings">
      <v-menu
        offset-y
        max-width="160"
        class="select"
      >
        <template v-slot:activator="{ on, attrs }">
          <div
            v-bind="attrs"
            v-on="on"
          >
            {{ activeElemTitle }}
            <v-icon>{{ mdiChevronDown }}</v-icon>
          </div>
        </template>
        <div style="min-height: 40px">
          <v-tooltip
            v-for="{code, tooltip, icon} in elements"
            :key="code"
            bottom
            :color="theme.$accent_ui_color"
          >
            <template
              v-slot:activator="{ on }"
              class="p-5"
            >
              <v-icon
                class="title-icon"
                :color="activeElem === code ? theme.controls : theme.text"
                v-on="on"
                @click="changeTab(code)"
              >
                {{ icon }}
              </v-icon>
            </template>
            <span>{{ tooltip }}</span>
          </v-tooltip>
        </div>
      </v-menu>
      <v-spacer />
      <v-tooltip
        v-if="activeElem === 'multiLine' && displayingRange"
        bottom
        :color="theme.$accent_ui_color"
        :open-delay="tooltipOpenDelay"
      >
        <template v-slot:activator="{ on }">
          <v-icon
            class="option mr-2"
            :color="theme.$main_border"
            v-on="on"
            @click="onResetRange"
          >
            {{ mdiMagnifyMinusOutline }}
          </v-icon>
        </template>
        <span>Убрать зум</span>
      </v-tooltip>
      <v-tooltip
        bottom
        :color="theme.$accent_ui_color"
        :open-delay="tooltipOpenDelay"
      >
        <template v-slot:activator="{ on }">
          <v-icon
            class="option"
            :color="theme.$main_border"
            v-on="on"
            @click="switchOP"
          >
            {{ mdiSettings }}
          </v-icon>
        </template>
        <span>Настройки</span>
      </v-tooltip>
    </div>
    <v-card-title class="title-vis">
      <div
        class="divider-tab"
        :style="{ background: theme.$primary_button }"
      />
    </v-card-title>
    <v-card-text
      :is="`dash-${activeElem}`"
      :id-from="activeElem"
      :color-from="theme"
      :active-elem-from="activeElem"
      :options="getOptions"
      :search="search"
      id-dash-from="reports"
      :width-from="size.width"
      :height-from="size.height"
      :size-from="{
        height: size.height,
        width: size.width,
      }"
      :size-tile-from="{
        width: getOptions ? getOptions.widthTile : '',
        height: getOptions ? getOptions.heightTile : ''
      }"
      :time-format-from="getTimeFormatFrom"
      :search-schema="schema"
      :search-rep="true"
      :tooltip-from="tooltipSvg"
      :should-get="shouldGet"
      :data-report="true"
      :data-rest-from="preparedData"
      :current-settings="settings"
      :update-settings="updateSettings"
      :data-mode-from="dataMode"
      :loading="loading"
      :selected-pie-index="selectedPieIndex"
      @changeSelectPie="changeSelectedPie"
      @SetRange="onSetRange"
      @resetRange="onResetRange"
    />
    <modal-settings
      v-if="activeSettingModal"
      :color-from="theme"
      :id-dash-from="idDash"
      :data-page-from="dataPageFrom"
    />
  </div>
</template>

<script>
import {
  mdiRefresh, mdiMagnify, mdiChevronDown, mdiSettings, mdiMagnifyMinusOutline,
} from '@mdi/js';
import settings from '../../js/componentsSettings';

export default {
  props: {
    data: {
      type: Array,
      default: () => ([]),
    },
    // size: {},
    shouldGet: {
      type: Boolean,
      required: true,
    },
    schema: {
      type: Object,
      default: () => ({}),
    },
    tooltipOpenDelay: {
      type: Number,
      default: 500,
    },
    loading: {
      type: Boolean,
      default: true,
    },
    search: {
      type: Object,
      default: () => ({}),
    },
    dataPageFrom: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      mode: true,
      options: {
        visible: true,
        change: false,
        level: 1,
        boxShadow: false,
      },
      differentOptions: {
        visible: true,
      },
      modalSettings: false,
      activeElem: 'table',
      tooltipSvg: { texts: [], links: [], buttons: [] },
      mdiRefresh,
      mdiMagnify,
      mdiChevronDown,
      mdiSettings,
      mdiMagnifyMinusOutline,
      size: {
        width: 500,
        height: 400,
      },
      settings: {
        showTitle: true,
      },
      disappear: true,
      selectedPieIndex: -1,
      displayingRange: null,
    };
  },
  computed: {
    preparedData() {
      // адаптация зума в мультилайне
      if (this.activeElem === 'multiLine' && this.displayingRange) {
        const { range, xMetric } = this.displayingRange;
        return this.data.filter((item) => {
          const x = item[xMetric];
          return x >= range[0] && x <= range[1];
        });
      }
      return this.data;
    },
    dataMode() {
      this.changeOptions(this.mode);
      this.setPropDisappear(true);

      return this.mode;
    },
    getOptions() {
      return this.$store.state[this.idDash][this.activeElem].options;
    },
    activeElemTitle() {
      return this.elements?.find((item) => item.code === this.activeElem).tooltip || '--';
    },
    idDash() {
      return 'reports';
    },
    dashFromStore() {
      if (this.idDash) {
        return this.$store.state[this.idDash];
      }
      return null;
    },
    getModalSettings() {
      return {
        modalSettings: {},
        element: '',
        status: false,
        ...this.dashFromStore.modalSettings,
      };
    },
    activeSettingModal: {
      get() {
        return this.getModalSettings.status;
      },
      set(value) {
        this.$store.dispatch('closeModalSettings', {
          path: this.idDash,
          status: value,
        });
      },
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    elements() {
      return this.$store.getters.getReportElement.map((code) => {
        const { tooltip, icon } = settings.reports[code];
        return {
          code,
          tooltip,
          icon,
        };
      });
    },
    getTimeFormatFrom() {
      return this.getOptions && this.getOptions.timeFormat ? this.getOptions.timeFormat : '';
    },
  },
  watch: {
    activeElem() {
      this.calcSize();
    },
  },
  mounted() {
    this.calcSize();
    this.setOptions();
    this.setMetrics();
  },
  methods: {
    setPropDisappear(val) {
      this.disappear = val;
    },
    changeOptions(mode) {
      const { level } = this.options;
      let opacity = 1;
      if (mode) {
        this.differentOptions.visible = true;
      } else if (!this.options.visible) {
        this.differentOptions.visible = false;
        opacity = 0;
      } else {
        this.differentOptions.visible = true;
        opacity = 1;
      }
      this.$emit('SetOpacity', opacity);
      this.$emit('SetLevel', level);
    },
    updateSettings(localSettings) {
      this.settings = JSON.parse(JSON.stringify(localSettings));
    },
    setMetrics() {
      if (this.data[0]
          && (!this.dashFromStore[this.activeElem]?.metrics
              || !this.dashFromStore[this.activeElem]?.metrics.length)
          && this.activeElem === 'multiLine') {
        const metrics = Object.keys(this.data[0]);
        metrics.splice(0, 1);
        this.$store.commit(
          'setMetricsMulti',
          {
            id: this.activeElem,
            idDash: this.idDash,
            metrics,
          },
        );
      }
    },
    setOptions() {
      if (!this.idDash) {
        return;
      }

      if (!this.dashFromStore[this.activeElem].options) {
        this.$store.commit('setDefaultOptions', { id: this.activeElem, idDash: this.idDash });
      }
    },
    switchOP() {
      this.$store.dispatch('openModalSettings', {
        path: this.idDash,
        element: this.activeElem,
        titles: this.data[0] ? Object.keys(this.data[0]) : [],
      });
    },
    changeTab(elem) {
      this.setActiveElem(elem);
      this.setOptions();
      this.setMetrics();
    },
    calcSize() {
      if (!this.$refs.vis) {
        return;
      }
      const size = this.$refs.vis.getBoundingClientRect();
      this.size.width = Math.round(size.width) - 16;
      if (Math.round(size.height) - 166 < 400) {
        this.size.height = 400;
      } else {
        this.size.height = Math.round(size.height) - 166;
      }
    },
    setActiveElem(elemName) {
      this.activeElem = elemName;
    },
    changeSelectedPie(val) {
      this.selectedPieIndex = val;
    },
    onSetRange(val) {
      this.displayingRange = val;
    },
    onResetRange() {
      this.displayingRange = null;
    },
  },
};
</script>

<style lang="scss">
.visualisation {
  flex-grow: 1;
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  @media print {
    height: auto;
  }
  .theme--light.v-icon {
    color: inherit !important;
  }
}
.header-settings{
  display: flex;
  justify-content: space-between;
}
</style>
