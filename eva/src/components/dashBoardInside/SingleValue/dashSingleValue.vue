<template>
  <div
    class="single-value-container pa-3"
    :class="{ 'header-active': dataModeFrom, 'is-header-open': !isHeaderOpen }"
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
      class="content pt-3"
      :class="metricTemplateClass"
    >
      <div
        v-for="(metric, idx) in dataToRender"
        :key="`metric-${metric.id}`"
        class="item"
        :style="{ gridArea: `item-${idx + 1}` }"
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
    <SingleValueSettings
      v-model="isSettingsComponentOpen"
      :received-settings="providedSettings"
      :update-count="updateCount"
      :default-settings="defaultSettings"
      @save="saveSettings"
      @close="closeSettings"
    />
  </div>
</template>

<script>
import { mdiSettings } from '@mdi/js';
import SingleValueSettings from './SingleValueSettings.vue';
import metricTitleIcons from './metricTitleIcons';

export default {
  name: 'SingleValue',
  components: { SingleValueSettings },
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
      required: true,
    },
    updateSettings: {
      type: Function,
      required: true,
    },
    currentSettings: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    mdiSettings,
    metricTitleIcons,
    titleToken: '',
    options: {},
    metricList: [],
    metricCount: 0,
    template: 1,
    providedSettings: {},
    defaultSettings: {},
    isSettingsComponentOpen: false,
    update: 1,
    isHeaderOpen: true,
  }),
  computed: {
    dataToRender() {
      const temp = [...this.metricList].sort((a, b) => a.listOrder - b.listOrder);
      return this.update && temp.slice(0, this.metricCount);
    },

    theme() {
      return this.$store.getters.getTheme;
    },

    tokenizedTitle() {
      const title = this.options?.settings?.title || '';
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
    dataRestFrom() {
      const options = JSON.parse(
        JSON.stringify(this.getOptions),
      );
      this.setVisual(
        this.currentSettings.metricOptions?.length
          ? this.currentSettings.metricOptions
          : options.settings?.metricOptions,
      );
    },
    currentSettings() {
      const currentSettings = {
        metricOptions: [],
        ...this.currentSettings,
      };
      this.providedSettings = currentSettings;
      this.init(currentSettings);
    },
  },
  mounted() {
    /** Getting saved component options from the store. */
    this.init(null, true);
  },
  methods: {
    getColor(metric) {
      if (!metric.metadata) {
        return undefined;
      }
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

          return '#5BD97A';
        }
      }

      if (metric.color === 'secondary') {
        return '#e0e0ec';
      }

      return '#5980f8';
    },
    init(settings, up) {
      const options = JSON.parse(
        JSON.stringify(this.getOptions),
      );
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
      this.providedSettings = settings || options.settings;
      const { template, metricCount } = settings || options.settings;

      this.options = {
        ...options,
        settings: settings || options.settings,
      };
      this.template = template;
      this.isHeaderOpen = !!settings?.showTitle;
      this.metricCount = this.metricCount || metricCount;
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

      this.setVisual();
    },
    setVisual(metricOptionsCurrent) {
      const metricList = [];
      const metricOptions = [];
      this.dataRestFrom.forEach((data, index) => {
        const {
          metric, value, metadata,
        } = data;
        const id = index + 1;
        if (metric === '_title') {
          this.titleToken = String(value);
        } else {
          let range = metadata;

          if (!metadata || typeof metadata !== 'string') {
            range = null;
          }
          const startId = `${metric}_${id}`;
          const metricCurrent = metricOptionsCurrent?.find(
            (m) => m.startId === startId,
          );
          const defaultMetricOption = {
            id: metricCurrent?.id || id,
            startId: metricCurrent?.startId || startId,
            metadata,
            title: metric || data.phase,
            color: metricCurrent?.color || 'main',
            icon: metricCurrent?.icon || 'no_icon',
            fontSize: metricCurrent?.fontSize || 54,
            fontWeight: metricCurrent?.fontWeight || 400,
            listOrder:
              metricCurrent?.listOrder === undefined
                ? index
                : metricCurrent?.listOrder,
            ...metricCurrent,
          };
          metricList.push({ value, ...defaultMetricOption });
          metricOptions.push({
            id,
            range,
            expanded: false,
            ...defaultMetricOption,
          });
        }
      });

      if (
        this.dataRestFrom.length === 6
        && !this.dataRestFrom.find((i) => i.metric === '_title')
      ) {
        this.titleToken = '';
      }
      this.metricList = metricList;
      this.options.settings.metricOptions = metricOptions;
    },
    updateVisual(settings) {
      this.metricList = settings.metricOptions?.map((item, idx) => ({
        ...item,
        listOrder: idx,
        title: item.name || item.title,
        fontWeight: 400,
        value: item.startId?.value,
      }));

      this.setVisual(settings.metricOptions);
    },
    updateOptions() {
      this.$store.commit('setOptions', {
        id: this.idFrom,
        idDash: this.idDashFrom,
        options: { ...this.options },
      });
    },

    openSettings() {
      /** Updating the settings provided to the SingleValueSettings. */
      this.providedSettings = { ...this.options.settings };
      this.defaultSettings = { ...this.options.settings };
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
      this.options.settings = newSettings;

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

      this.metricList = [...newMetricList];
      this.providedSettings = { ...newSettings };

      this.$store.commit('setOptions', {
        id: this.idFrom,
        idDash: this.idDashFrom,
        options: { ...this.options, settings: newSettings },
      });

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
@import './sass/dashSingleValue'
</style>
