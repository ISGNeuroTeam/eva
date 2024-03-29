<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
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
      >
        <div
          v-for="(metric) in metricsForRender"
          :key="`metric-${metric.startId}`"
          class="item"
          :style="{ gridArea: `item-${metric.listOrder}` }"
        >
          <span class="metric-title">
            <span
              v-show="metric.icon !== 'no_icon'"
              class="icon"
              v-html="getIconSvgByID(metric.icon)"
            />
            <v-icon
              v-show="metric.icon === 'no_icon'"
              class="icon"
              color="#E0E0EC"
              v-text="getIcon(metric)"
            />
            <span
              class="title-text"
              v-text="metric.title"
            />
          </span>
          <span
            v-if="metric.value !== undefined && metric.value.toString"
            class="metric-value"
            :class="`color-${metric.color}`"
            style="
               color: #5980f8;
             "
            :style="{
              ...getColor(metric),
              fontSize: `${metric.fontSize || 16}px`,
              fontWeight: `${metric.fontWeight || 200}`,
              display: `${
                metric.value
                && metric.value.toString(10).split(',').length > 1
                  ? 'flex'
                  : 'block'}`
            }"
          >
            <span
              v-for="(value, inx) in metric.value.toString().split(',')"
              :key="inx"
            >
              {{ value + (inx !== metric.value.toString().split(',').length -1
                ? ', '
                : '') | filterNumber(getOptions) }}
            </span>
          </span>
        </div>
      </div>
      <SingleValueSettings
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
import SingleValueSettings from './SingleValueSettings.vue';
import metricTitleIcons from './metricTitleIcons';
import iconlist from '@/fonts/eva-iconfont/eva-iconlist.json';
import { throttle } from '@/js/utils/throttle';

export default {
  name: 'SingleValue',
  components: { SingleValueSettings },
  filters: {
    filterNumber: (value, options) => {
      if (Number.isNaN(value) || `${value}` === '') return '';
      if (!options?.numberPerDigit) return value;
      const numberOfDigits = (num) => Number(num).toLocaleString('ru-RU');
      if (value.match(/^-?\d+$/)) {
        // number
        return numberOfDigits(value);
      }
      if (value.match(/^\d+\.\d+$/)) {
        // float
        const filteredValue = numberOfDigits(value.split('.')[0]);
        return `${filteredValue}.${value.split('.')[1]}`;
      }
      // not number
      return value;
    },
  },
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
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    mdiSettings,
    metricTitleIcons,
    titleToken: '',
    metricList: [],
    metricCount: 0,
    template: 1,
    providedSettings: {
      metricOptions: [],
    },
    defaultSettings: {},
    isSettingsComponentOpen: false,
    update: 1,
    isHeaderOpen: true,
  }),
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },

    error() {
      if (this.dataRestFrom.length) {
        if (this.dataRestFrom.findIndex(({ _order }) => !_order) !== -1) {
          return 'В запросе отсутствует обязательное поле "_order"';
        }
        if (
          this.dataRestFrom.map(({ _order }) => _order)
            .sort((a, b) => a - b)
            .findIndex((order, idx) => order !== idx + 1) !== -1
        ) {
          return 'Допущен пропуск номеров в последовательности значений поля "_order"';
        }
      }
      return '';
    },

    metricsForRender() {
      const metricCount = this.getOptions.settings.metricCount || this.metricCount;
      const elementsToShow = this.metricList.slice(0, metricCount);
      if (elementsToShow.length !== elementsToShow.filter(Boolean).length) {
        this.$store.commit('setState', [{
          object: this.getOptions.settings,
          prop: 'metricOptions',
          value: [],
        }]);
        return [];
      }
      return elementsToShow;
    },

    tockens() {
      return this.$store.state[this.idDashFrom]?.tockens || [];
    },

    tokenizedTitle() {
      let title = this.getOptions?.settings?.title || '';

      this.tockens.forEach((token) => {
        title = title.replaceAll(`$${token.name}$`, token.value);
      });

      return title.replaceAll('<title>', this.titleToken);
    },

    metricTemplateClass() {
      return `metric-${this.getOptions.settings.metricCount || this.metricCount} v-${this.getOptions.settings.template || this.template}`;
    },
    dashFromStore() {
      return this.$store.state[this.idDashFrom][this.idFrom] || {};
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
          const isNew = val.length !== oldVal.length;
          const options = structuredClone(this.getOptions);
          this.setOptionsFromOtl(structuredClone(val[0]));
          this.setVisual(
            this.currentSettings.metricOptions?.length > 0
              ? this.currentSettings.metricOptions
              : options.settings?.metricOptions || [],
            isNew,
          );
        }
      },
      deep: true,
    },
    currentSettings(val, old) {
      if (JSON.stringify(val) === JSON.stringify(old)) {
        return;
      }
      const currentSettings = {
        metricOptions: [],
        ...this.currentSettings,
      };
      // this.providedSettings = currentSettings;
      this.$set(this, 'providedSettings', currentSettings);
      this.init(currentSettings);
    },
  },
  mounted() {
    /** Getting saved component options from the store. */
    this.init(null, true);
    this.setOptionsFromOtl(structuredClone(this.dataRestFrom[0]));
  },
  methods: {
    setOptionsFromOtl(options) {
      if (options) {
        const settingsFromStore = this.getOptions.settings;
        const settings = {};
        Object.keys(options).forEach((key) => {
          if (settingsFromStore[key]) {
            settings[key] = options[key];
          }
        });
        this.$store.commit('setState', [{
          object: this.getOptions,
          prop: 'settings',
          value: {
            ...this.getOptions.settings,
            ...settings,
          },
        }]);
      }
    },
    getIcon(metric) {
      if (!metric.metadata) {
        return undefined;
      }
      const ranges = JSON.parse(metric.metadata.replaceAll("'", '"'));
      if (ranges.icon) {
        return iconlist.find((icon) => ranges.icon === icon);
      }
      return '';
    },
    getColor(metric) {
      if (metric.metadata && metric.color === 'range') {
        let color;
        const ranges = JSON.parse(metric.metadata.replaceAll("'", '"'));
        if (!ranges.range) {
          Object.keys(ranges).forEach((key) => {
            ranges[key] = `${ranges[key]}`.split(':');
          });
          if (!Number.isNaN(+metric.value)) {
            const val = Number(metric.value);
            color = Object.keys(ranges).reduce((resultColor, currentColor) => {
              const range = ranges[currentColor];
              // eslint-disable-next-line no-nested-ternary
              const colorRange = range[0]
                ? range[0] < range[1]
                  ? val >= range[0] && val <= range[1]
                  : val >= range[0]
                : val <= range[1];
              return colorRange ? currentColor : resultColor;
            }, null);
          } else {
            const val = metric.value;
            color = Object.keys(ranges)
              .reduce((resultColor, currentColor) => (
                ranges[currentColor].includes(val) ? currentColor : resultColor), null);
          }
        } else if (ranges?.range.length > 0) {
          ranges.range.forEach((item, index) => {
            ranges.range[index] = item.split(':');
          });
          if (ranges.range.length === ranges.colors.length) {
            if (!Number.isNaN(+metric.value)) {
              const val = Number(metric.value);
              color = ranges.colors.reduce((resultColor, currentColor, index) => {
                const range = ranges.range[index];
                // eslint-disable-next-line no-nested-ternary
                const colorRange = range[0]
                  ? range[0] < range[1]
                    ? val >= range[0] && val <= range[1]
                    : val >= range[0]
                  : val <= range[1];
                return colorRange ? currentColor : resultColor;
              }, null);
            } else {
              const val = metric.value;
              color = ranges.colors.reduce((resultColor, currentColor, index) => {
                const range = ranges.range[index];
                if (range.includes(val)) {
                  return currentColor;
                }
                return resultColor;
              }, null);
            }
          }
        }
        return { color };
      }
      if (metric.color === 'secondary') {
        return { color: '#e0e0ec' };
      }
      return { color: '#5980f8' };
    },
    init(settings, up) {
      const options = structuredClone(this.getOptions);
      if (!options.settings && !settings) {
        options.settings = {
          title: '',
          template: 1,
          metricCount: this.metricCount || 1,
          metricOptions: [],
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
      // this.metricCount = this.metricCount || metricCount;
      this.$set(this, 'metricCount', this.metricCount || metricCount);
      this.updateVisual(settings || options.settings);
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

      this.setVisual({});
    },
    setVisual(metricOptionsCurrent) {
      if (metricOptionsCurrent === undefined || metricOptionsCurrent.filter === undefined) {
        return;
      }
      const metricList = [];
      const metricOptions = [];
      structuredClone(this.dataRestFrom).forEach((data) => {
        const {
          metric, value, metadata, _order: sortOrder, color,
        } = data;
        const id = sortOrder;
        if (metric === '_title') {
          this.titleToken = String(value);
        } else {
          if (
            metricOptionsCurrent
            && metricOptionsCurrent.length !== metricOptionsCurrent.filter(Boolean).length
          ) {
            this.$store.commit('setState', [{
              object: this.getOptions.settings,
              prop: 'metricOptions',
              value: [],
            }]);
          }
          if (!sortOrder) {
            metricList.length = 0;
            metricOptions.length = 0;
            return;
          }
          if (this.error) return;

          let range;

          if (!metadata || typeof metadata !== 'string') {
            range = null;
          } else {
            range = metadata;
          }
          const startId = `${metric}_${id}`;
          const metricCurrent = metricOptionsCurrent?.find(
            (m) => m?.startId === startId,
          );

          const defaultMetricOption = {
            title: metric || data.phase,
            ...metricCurrent,
            id: metricCurrent?.listOrder === undefined
              ? sortOrder
              : metricCurrent?.listOrder,
            startId: metricCurrent?.startId || startId,
            metadata,
            color: color || metricCurrent?.color || 'main',
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
      // this.$set(this, 'metricList', settings.metricOptions?.map((item, idx) => ({
      //   ...item,
      //   listOrder: idx,
      //   title: item.name || item.title,
      //   fontWeight: 400,
      //   value: item.startId?.value,
      // })));

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
      const { metricCount, template, metricOptions = [] } = settings;
      const updatedMetricOptions = metricOptions.map((item, idx) => ({
        ...item,
        id: idx + 1,
        listOrder: idx + 1,
      }));
      const newSettings = { ...settings, metricOptions: updatedMetricOptions };
      this.template = template;
      this.metricCount = metricCount;
      /** Applying settings from the SingleValueSettings. */
      this.$store.commit('setState', [{
        object: this.dashFromStore.options,
        prop: 'settings',
        value: newSettings,
      }]);

      /** Updated local metricList array. */
      const newMetricList = updatedMetricOptions
        .reduce((acc, updatedMetric, index) => {
          const {
            icon, title, color, fontSize, fontWeight,
          } = updatedMetric;
          const metric = this.metricList.find((m) => m && m.id === updatedMetric.id);
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
                listOrder: index + 1,
              },
            ];
          }
          return acc;
        }, []);

      this.$set(this, 'metricList', [...newMetricList]);

      this.$set(this, 'providedSettings', { ...newSettings });

      if (this.updateSettings) this.updateSettings(newSettings);
      this.update += 1;
      this.$store.commit('setState', [{
        object: this.getOptions.settings,
        prop: 'fromOtl',
        value: false,
      }]);
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
@import './sass/dashSingleValue'
</style>
