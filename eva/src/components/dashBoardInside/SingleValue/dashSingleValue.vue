<template>
  <div
    class="single-value-container pa-3"
    :class="{ 'header-active': dataModeFrom }"
  >
    <div class="header">
      <div>
        <span v-if="providedSettings.showTitle" class="data-title" v-text="tokenizedTitle"/>
      </div>
      <v-icon
        v-show="dataModeFrom"
        size="22"
        class="settings-icon"
        @click.stop="openSettings"
        v-text="mdiSettings"
      />
    </div>

    <div class="content pt-3" :class="metricTemplateClass">
      <div
        v-for="metric in dataToRender"
        :key="`metric-${metric.id}`"
        class="item"
        :style="{ gridArea: `item-${metric.listOrder+1}` }"
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
          class="metric-value"
          :class="`color-${metric.color}`"
          :style="`
            font-size: ${metric.fontSize || 16}px;
            font-weight: ${metric.fontWeight || 200};
            `"
        >
          <span v-text="metric.value"></span>
        </span>
      </div>
    </div>

    <SingleValueSettings
      :is-open="isSettingsComponentOpen"
      :received-settings="providedSettings"
      :updateCount="updateCount"
      :default-settings="defaultSettings"
      @save="saveSettings"
      @close="closeSettings"
    />
  </div>
</template>

<script>
import SingleValueSettings from './SingleValueSettings';
import metricTitleIcons from './metricTitleIcons';
import { mdiSettings } from '@mdi/js';

export default {
  name: 'singleValue',
  components: { SingleValueSettings },
  props: {
    idFrom: String,
    idDashFrom: String,
    dataRestFrom: Array,
    dataModeFrom: Boolean,
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
  }),
  computed: {
    dataToRender() {
      let temp = [...this.metricList].sort((a,b) => a.listOrder - b.listOrder)
      // console.log(temp)
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
  },
  watch: {
    dataRestFrom() {
      this.setVisual()
    },
  },
  mounted() {
    /** Getting saved component options from the store. */
    this.init();
  },
  methods: {
    init() {
      const { idFrom: id, idDashFrom: idDash } = this;
      const options = { ...this.$store.getters.getOptions({ id, idDash }) };
      if (!options.settings) {
        options.settings = {
          title: '',
          template: 1,
          metricCount: this.metricCount || 1,
          metricOptions: {},
        };
      }
      const { template, metricCount } = options.settings;
      this.options = options;
      this.template = template;
      this.metricCount = this.metricCount || metricCount;
      this.setVisual();
    },
    updateCount(count) {
      const { idFrom: id, idDashFrom: idDash } = this;
      const options = { ...this.$store.getters.getOptions({ id, idDash }) };
      this.metricCount = count;

      const newSettings = options.settings ? { ...options.settings, metricCount: count } : { metricCount: count }
      this.$store.commit('setOptions', newSettings)
      this.setVisual();
    },
    setVisual() {
      const metricList = [];
      const metricOptions = [];
      let idCount = 1;

      for (const [index, data] of this.dataRestFrom.entries()) {
        const { metric, value, order, metadata } = data;

        if (metric === '_title') {
          this.titleToken = String(value);
          continue;
        }

        const metricID = idCount++;
        let range = metadata;

        if (!metadata || typeof metadata !== 'string') {
          range = null;
        }

        const defaultMetricOption = {
          id: metricID,
          title: metric || data.phase,
          color: 'main',
          icon: 'no_icon',
          fontSize: 54,
          fontWeight: 200,
          listOrder: order - 1,
        };

        metricList.push({ value, ...defaultMetricOption });
        metricOptions.push({ order, range, expanded: false, ...defaultMetricOption });
      }

      this.metricList = metricList;
      this.options.settings.metricOptions = metricOptions;
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
      this.providedSettings = { ... this.options.settings };
      this.defaultSettings = { ... this.options.settings }
      this.isSettingsComponentOpen = true;
    },

    saveSettings(settings = {}) {
      const { metricCount, template, metricOptions } = settings;
      this.template = template;
      this.metricCount = metricCount;
      /** Applying settings from the SingleValueSettings. */
      this.options.settings = { ...settings };
      /** Updated local metricList array. */
      for (const [index, updatedMetric] of metricOptions.entries()) {
        const { icon, title, color, fontSize, fontWeight } = updatedMetric;
        const metric = this.metricList.find(m => m.id === updatedMetric.id);
        metric.icon = icon;
        metric.title = title;
        metric.color = color;
        metric.fontSize = fontSize;
        metric.fontWeight = fontWeight;
        metric.listOrder = index;
      }
      this.providedSettings = settings;
      this.update++;
    },

    closeSettings() {
      this.isSettingsComponentOpen = false;
    },

    getIconSvgByID(id) {
      const icon = this.metricTitleIcons.find(m => m.id === id);
      return icon?.svg;
    },
  },
};
</script>

<style lang="sass" scoped>
@import './sass/dashSingleValue'
</style>
