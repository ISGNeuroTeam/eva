<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
    style="height: calc(100% - 28px)"
  >
    <div
      class="single-value-container pa-3"
      :style="customStyle"
      :class="getClass"
      v-bind="$attrs"
    >
      <div class="header">
        <div>
          <span
            class="data-title"
            v-text="tokenizedTitle"
          />
        </div>

        <v-icon
          v-show="dataModeFrom"
          size="22"
          class="settings-icon"
          @click.stop="openSettings"
          v-text="mdiSettings"
        />
      </div>
      <div
        v-if="error"
        :key="`error-message-${idDashFrom}`"
        class="error-message"
      >
        {{ error }}
      </div>
      <div
        v-else
        class="content pt-3"
        :class="metricTemplateClass"
        :style="`max-width: ${maxSize}px; max-height: ${maxSize}px`"
      >
        <div
          v-for="(metric) in metricsForRender"
          :key="`metric-${metric.listOrder}`"
          class="item"
          :style="{ gridArea: `item-${metric.listOrder}` }"
        >
          <span class="metric-title">
            <span
              v-show="metric.icon !== 'no_icon'"
              class="icon"
              v-html="getIconSvgByID(metric.icon)"
            />
            <span
              class="title-text"
              v-text="metric.title"
            />
          </span>
          <span
            v-if="metric.value"
            class="metric-value"
            :class="`color-${metric.color}`"
            :style="`
            color: ${getColor(metric)};
            font-size: ${metric.fontSize || 16}px;
            font-weight: ${metric.fontWeight || 200};
            display: ${
              metric.value
              && metric.value.toString(10).split(',').length > 1
                ? 'flex'
                : 'block'};
            `"
          >
            <span
              v-for="(value, inx) in metric.value.toString(10).split(',')"
              :key="inx"
              v-text="value + (inx !== metric.value.toString(10).split(',').length -1 ? ', ' : '') "
            />
          </span>
        </div>
      </div>
      <div
        v-if="!error"
        ref="pie"
        class="circle-scale"
      />
      <scale-settings
        v-model="isSettingsComponentOpen"
        :received-settings="providedSettings"
        :update-count="updateCount"
        :default-settings="defaultSettings"
        @save="saveSettings"
        @close="closeSettings"
      />
    </div>
  </portal>
</template>

<script>
import { mdiSettings } from '@mdi/js';
import moment from 'moment';
import scaleSettings from './dashScaleSettings.vue';
import metricTitleIcons from './metricTitleIcons';
import ScaleClass from '../../../js/classes/ScaleClass';

export default {
  name: 'Scale',
  components: { scaleSettings },
  props: {
    idFrom: {
      type: String,
      required: true,
    },
    idDashFrom: {
      type: String,
      required: true,
    },
    dataRestFrom: {
      type: Array,
      required: true,
    },
    dataModeFrom: {
      type: Boolean,
      default: false,
    },
    updateSettings: {
      type: Function,
      required: true,
    },
    currentSettings: {
      type: Object,
      required: true,
    },
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
    sizeFrom: {
      type: Object,
      required: true,
    },
    customStyle: {
      type: Object,
      default: () => ({}),
    },
    customClass: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    mdiSettings,
    metricTitleIcons,
    titleToken: '',
    metricList: [],
    metricCount: 0,
    template: 1,
    providedSettings: {},
    defaultSettings: {},
    isSettingsComponentOpen: false,
    update: 1,
    isHeaderOpen: true,
    error: '',
    scale: null,
    colors: [],
    maxSize: 200,
  }),
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },

    metricsForRender() {
      return this.metricList.slice(0, this.metricCount);
    },

    tokenizedTitle() {
      const title = this.getOptions?.settings?.title || '';
      return title.replaceAll('<title>', this.titleToken);
    },

    metricTemplateClass() {
      return `metric-${this.metricCount} v-${this.template}`;
    },
    dashFromStore() {
      return this.$store.state[this.idDashFrom][this.idFrom];
    },
    getOptions() {
      if (!this.idFrom) {
        return [];
      }
      if (!this.dashFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.idFrom, idDash: this.idDashFrom });
      }
      if (!this.dashFromStore?.options.settings) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'settings',
          value: {
            metricCount: 1,
            showTitle: false,
            template: 1,
            title: '',
            selectSections: 1,
            countSections: [1],
          },
        }]);
      }

      return this.dashFromStore.options;
    },
    getClass() {
      return `${this.customClass} ${this.dataModeFrom
        ? 'header-active '
        : ''} ${!this.isHeaderOpen
        ? 'is-header-open'
        : ''}`;
    },
  },
  watch: {
    dataRestFrom: {
      handler(val, oldVal) {
        if (val.length > 0) {
          const isNew = val.length !== oldVal.langth;
          const options = structuredClone(this.getOptions);
          this.setVisual(
            this.currentSettings.metricOptions?.length > 0
              ? this.currentSettings.metricOptions
              : options.settings?.metricOptions,
            isNew,
          );
        }
      },
      deep: true,
    },
    currentSettings() {
      const currentSettings = {
        metricOptions: [],
        ...this.currentSettings,
      };
      this.$set(this, 'providedSettings', currentSettings);
      this.checkTime();
      this.init(currentSettings);
    },
    sizeFrom: {
      deep: true,
      handler(val, old) {
        if (JSON.stringify(val) !== JSON.stringify(old) && this.scale) {
          this.scale.size = {
            width: val.width - 30,
            height: val.height - 60,
          };
          this.maxSize = this.scale.radius * 1.5;
        }
      },
    },
    fullScreenMode() {
      this.$nextTick(() => {
        this.init();
      });
    },
  },
  mounted() {
    /** Getting saved component options from the store. */
    this.init(null, true);
    this.checkTime();
  },
  methods: {
    checkTime() {
      if (
        this.currentSettings.countSections
          && this.currentSettings.countSections.length > 0
      ) {
        const elem = this.currentSettings.countSections.length;
        const time = moment().format('HH');
        const color = 24 / elem;
        const amountColor = Math.floor(time / color);
        this.colors = [];
        this.currentSettings.countSections.forEach((item, i) => {
          if (i + 1 <= amountColor) {
            this.colors.push('#069AEE');
          } else {
            this.colors.push('#E5E5F2');
          }
        });
      }
    },
    getColor(metric) {
      if (metric.metadata) {
        // eslint-disable-next-line no-eval
        const ranges = eval(`({obj:[${metric.metadata}]})`).obj[0];
        Object.keys(ranges).forEach((key) => {
          ranges[key] = `${ranges[key]}`.split(':').map(Number);
        });

        if (metric.color === 'range') {
          if (!Number.isNaN(metric.value)) {
            const val = Number(metric.value);
            if (val >= ranges.red[0] && val <= ranges.red[1]) {
              return '#FF5147';
            }

            if (val >= ranges.yellow[0] && val <= ranges.yellow[1]) {
              return '#FFE065';
            }
            const greenrange = ranges.green[0] < ranges.green[1]
              ? val >= ranges.green[0] && val <= ranges.green[1]
              : val >= ranges.green[0];
            if (greenrange) {
              return '#5BD97A';
            }
          }
        }

        if (metric.color === 'secondary') {
          return '#e0e0ec';
        }
      }
      return '#5980f8';
    },
    init(settings, up) {
      const options = structuredClone(this.getOptions);
      if (!options.settings && !settings) {
        options.settings = {
          title: '',
          template: 1,
          metricCount: this.metricCount || 1,
          metricOptions: [],
          selectSections: 1,
          countSections: [1],
        };
      }
      if (this.updateSettings && up) {
        this.updateSettings(settings || options.settings);
      }
      this.$set(this, 'providedSettings', settings || options.settings);
      const { template, metricCount } = settings || options.settings;

      if (settings?.metricOptions.length > 0) {
        this.$store.commit('setState', [{
          object: this.getOptions,
          prop: 'settings',
          value: settings || options.settings,
        }]);
      }

      this.template = template;
      this.isHeaderOpen = !!settings?.showTitle;
      this.$set(this, 'metricCount', this.metricCount || metricCount);
      this.updateVisual(settings || options.settings);
      if (this.scale) {
        this.scale.removePiechart();
      }
      const piechart = new ScaleClass({
        elem: this.$refs.pie,
        width: this.sizeFrom.width - 30,
        height: this.sizeFrom.height - 60,
        data: { ...this.currentSettings.countSections },
        colors: this.colors,
      });
      this.scale = Object.freeze(piechart);
      if (this.scale) {
        this.maxSize = this.scale.radius * 1.5;
      }
    },
    updateCount(count) {
      const options = { ...this.getOptions };
      this.metricCount = count;

      const newSettings = {
        options: {},
        metricCount: count,
        ...options.settings,
      };

      this.$store.commit('setOptions', newSettings);
      if (this.updateSettings) {
        this.updateSettings(newSettings);
      }

      this.setVisual();
    },
    setVisual(metricOptionsCurrent) {
      const metricList = [];
      const metricOptions = [];
      structuredClone(this.dataRestFrom).forEach((data) => {
        const {
          metric, value, metadata, _order: sortOrder,
        } = data;
        const id = sortOrder;
        if (metric === '_title') {
          this.titleToken = String(value);
        } else {
          if (!sortOrder || this.error) {
            this.error = 'В запросе отсутствует обязательное поле "_order"';
            metricList.length = 0;
            metricOptions.length = 0;
            return;
          }
          this.error = '';
          let range;

          if (!metadata || typeof metadata !== 'string') {
            range = null;
          } else {
            range = metadata;
          }
          const startId = `${metric}_${id}`;
          const metricCurrent = metricOptionsCurrent?.find(
            (m) => m.startId === startId,
          );
          const defaultMetricOption = {
            title: metric || data.phase,
            ...metricCurrent,
            id: metricCurrent?.id || id,
            startId: metricCurrent?.startId || startId,
            metadata,
            color: metricCurrent?.color || 'main',
            icon: metricCurrent?.icon || 'no_icon',
            fontSize: metricCurrent?.fontSize || 54,
            fontWeight: metricCurrent?.fontWeight || 400,
            listOrder:
              metricCurrent?.listOrder === undefined
                ? sortOrder
                : metricCurrent?.listOrder,
          };
          metricList[(metricCurrent?.listOrder ?? sortOrder) - 1] = {
            value,
            ...defaultMetricOption,
          };

          metricOptions[(metricCurrent?.listOrder ?? sortOrder) - 1] = {
            ...defaultMetricOption,
            id,
            expanded: false,
            range,
          };
        }
      });

      if (
        this.dataRestFrom.length === 6
        && !this.dataRestFrom.find((i) => i.metric === '_title')
      ) {
        this.titleToken = '';
      }
      if (metricOptions.length > 0 && metricList.length > 0) {
        this.$set(this, 'metricList', metricList);
        this.$store.commit('setState', [{
          object: this.getOptions.settings,
          prop: 'metricOptions',
          value: metricOptions,
        }]);
      }
    },
    updateVisual(settings) {
      this.setVisual(settings.metricOptions);
    },
    updateOptions() {
    },

    openSettings() {
      /** Updating the settings provided to the SingleValueSettings. */
      this.providedSettings = { ...this.getOptions.settings };
      this.defaultSettings = { ...this.getOptions.settings };
      this.isSettingsComponentOpen = true;
    },

    saveSettings(settings = {}) {
      const { metricCount, template, metricOptions } = settings;
      metricOptions.forEach((item, idx) => {
        item.id = idx + 1;
        item.listOrder = idx + 1;
      });
      const newSettings = { ...settings, metricOptions };
      this.template = template;
      this.metricCount = metricCount;
      /** Applying settings from the SingleValueSettings. */
      this.$store.commit('setState', [{
        object: this.getOptions,
        prop: 'settings',
        value: newSettings,
      }]);

      /** Updated local metricList array. */
      const newMetricList = metricOptions
        .reduce((acc, updatedMetric, index) => {
          const {
            icon, title, color, fontSize, fontWeight,
          } = updatedMetric;
          const metric = this.metricList.find((m) => m.id === updatedMetric.id);
          if (metric) {
            return [
              ...acc,
              {
                ...metric,
                icon,
                title,
                color,
                fontSize,
                fontWeight,
                listOrder: index,
              },
            ];
          }
          return acc;
        }, []);

      this.$set(this, 'metricList', { ...newMetricList });

      this.$set(this, 'providedSettings', { ...newSettings });

      if (this.updateSettings) this.updateSettings(newSettings);
      this.update += 1;
    },

    closeSettings() {
      this.isSettingsComponentOpen = false;
    },

    getIconSvgByID(id) {
      const icon = this.metricTitleIcons.find((m) => m.id === id);
      return icon?.svg;
    },
  },
};
</script>

<style lang="sass" scoped>
@import 'sass/dashScale'
.circle-scale
  position: absolute
  top: 52%
  left: 50%
  z-index: 1
  transform: translate(-50%, -50%)
</style>
