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
        v-model="menuDropdown"
        offset-y
        max-width="160"
        class="select"
      >
        <template v-slot:activator="{ on, attrs }">
          <div
            v-bind="attrs"
            v-on="on"
          >
            {{ aboutElem[activeElem].tooltip }}
            <v-icon>{{ mdiChevronDown }}</v-icon>
          </div>
        </template>
        <div style="min-height: 40px">
          <v-tooltip
            v-for="i in elements"
            :key="aboutElem[i].key"
            bottom
            :color="theme.$accent_ui_color"
            @click="changeTab(i)"
          >
            <template
              v-slot:activator="{ on }"
              class="p-5"
            >
              <v-icon
                class="title-icon"
                :color="aboutElem[i].color"
                v-on="on"
                @click="changeTab(i)"
              >
                {{ aboutElem[i].icon }}
              </v-icon>
            </template>
            <span>{{ aboutElem[i].tooltip }}</span>
          </v-tooltip>
        </div>
      </v-menu>
      <v-spacer />
      <v-tooltip
        v-if="aboutElem.multiLine.show && displayingRange"
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
        <span>aboutElem.multiLine.show</span>
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
    <template
      v-for="i in elements"
    >
      <v-card-text
        :is="`dash-${i}`"
        v-if="aboutElem[i].show"
        :key="i"
        :id-from="i"
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
    </template>
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
      menuDropdown: false,
      aboutElem: {},
      activeElem: 'table',
      tooltipSvg: { texts: [], links: [], buttons: [] },
      mdiRefresh,
      mdiMagnify,
      mdiChevronDown,
      mdiSettings,
      mdiMagnifyMinusOutline,
      size: {
        width: 500,
        height: 500,
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
      if (this.aboutElem.multiLine.show && this.displayingRange) {
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
      if (!this.dashFromStore || !this.dashFromStore.modalSettings) {
        this.$store.commit('setState', [
          {
            object: this.dashFromStore,
            prop: 'modalSettings',
            value: {},
          },
        ]);
        this.$store.commit('setState', [
          {
            object: this.dashFromStore.modalSettings,
            prop: 'element',
            value: '',
          },
          {
            object: this.dashFromStore.modalSettings,
            prop: 'status',
            value: false,
          },
        ]);
      }
      return this.dashFromStore.modalSettings;
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
      this.$store.getters.getReportElement.forEach((item, i) => {
        this.$set(this.aboutElem, item, {});
        if (i === 0) {
          this.$set(this.aboutElem[item], 'show', true);
          this.$set(this.aboutElem[item], 'color', this.theme.controls);
        } else {
          this.$set(this.aboutElem[item], 'show', false);
          this.$set(this.aboutElem[item], 'color', this.theme.text);
        }
        this.$set(
          this.aboutElem[item],
          'tooltip',
          settings.reports[item].tooltip,
        );
        this.$set(this.aboutElem[item], 'icon', settings.reports[item].icon);
        this.$set(this.aboutElem[item], 'key', i);
      });
      this.setActiveElem('table');
      return this.$store.getters.getReportElement;
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
      if (!this.dashFromStore[this.activeElem]?.options?.pinned) {
        this.$store.commit('setState', [{
          object: this.dashFromStore[this.activeElem].options,
          prop: 'pinned',
          value: false,
        }]);
      }

      if (!this.dashFromStore[this.activeElem]?.options?.lastDot) {
        this.$store.commit('setState', [{
          object: this.dashFromStore[this.activeElem].options,
          prop: 'lastDot',
          value: false,
        }]);
      }
      if (!this.dashFromStore[this.activeElem]?.options?.stringOX) {
        this.$store.commit('setState', [{
          object: this.dashFromStore[this.activeElem].options,
          prop: 'stringOX',
          value: false,
        }]);
      }
      if (!this.dashFromStore[this.activeElem]?.options?.united) {
        this.$store.commit('setState', [{
          object: this.dashFromStore[this.activeElem].options,
          prop: 'united',
          value: false,
        }]);
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
      this.unitedShow = elem === 'multiLine';
      Object.keys(this.aboutElem).forEach((item) => {
        if (item !== elem) {
          this.$set(this.aboutElem[item], 'show', false);
          this.$set(this.aboutElem[item], 'color', this.theme.text);
        } else {
          this.setActiveElem(item);
          this.$set(this.aboutElem[item], 'show', true);
          this.$set(this.aboutElem[item], 'color', this.theme.controls);
        }
      });
      this.setOptions();
      this.setMetrics();
    },
    calcSize() {
      const size = this.$refs.vis.getBoundingClientRect();
      this.size.width = Math.round(size.width) - 16;
      if (Math.round(size.height) - 66 < 500) {
        this.size.height = 500;
      } else {
        this.size.height = Math.round(size.height) - 66;
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
  .theme--light.v-icon {
    color: inherit !important;
  }
}
.header-settings{
  display: flex;
  justify-content: space-between;
}
</style>
