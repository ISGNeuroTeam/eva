<template>
  <div
    class="single-value-container pa-3"
    :class="{ 'header-active': dataModeFrom }"
  >
    <div class="header">
      <span class="data-title" v-text="tokenizedTitle"/>
      <v-icon
        v-show="!dataModeFrom"
        size="22"
        class="settings-icon"
        @click.stop="openSettings"
        v-text="mdiSettings"
      />
    </div>
    <div class="content pt-3">
      template = {{ metricCount }} - {{ template }}
      <div
        v-for="metric in metricList"
        :key="`metric-${metric.id}`"
      >
        {{ metric.title }} = {{ metric.value }}
      </div>
    </div>
    <SingleValueSettings
      :is-open="isSettingsComponentOpen"
      :received-settings="providedSettings"
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
    metricCount: 1,
    template: 1,
    providedSettings: {},
    isSettingsComponentOpen: false,
  }),
  computed: {
    tokenizedTitle() {
      const title = this.options?.settings?.title || '';
      return title.replaceAll('<title>', this.titleToken);
    },
  },
  watch: {
    dataRestFrom() {
      const metricList = [];
      const metricOptions = [];
      let idCount = 1;

      for (const data of this.dataRestFrom) {
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
          title: metric,
          color: 'main',
          icon: 'no_icon',
          fontSize: 18,
          fontWeight: 200,
        };

        metricList.push({ value, ...defaultMetricOption });
        metricOptions.push({ order, range, expanded: false, ...defaultMetricOption });
      }

      this.metricList = metricList;
      this.options.settings.metricOptions = metricOptions;
    },
  },
  mounted() {
    /** Getting saved component options from the store. */
    const { idFrom: id, idDashFrom: idDash } = this;
    const options = { ...this.$store.getters.getOptions({ id, idDash }) };
    if (!options.settings) {
      options.settings = {
        title: '',
        template: 1,
        metricCount: 1,
        metricOptions: {},
      };
    }
    const { template, metricCount } = options.settings;
    this.options = options;
    this.template = template;
    this.metricCount = metricCount;
  },
  methods: {
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
      this.isSettingsComponentOpen = true;
    },

    saveSettings(settings = {}) {
      const { metricCount, template } = settings;
      this.template = template;
      this.metricCount = metricCount;
      /** Applying settings from the SingleValueSettings. */
      this.options.settings = { ...settings };
    },

    closeSettings() {
      this.isSettingsComponentOpen = false;
    },
  },
};
</script>

<style lang="sass" scoped>
@import './sass/dashSingleValue'
</style>
