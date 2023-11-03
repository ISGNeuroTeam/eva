<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      class="gauge"
      :class="{
        small: box.isSmall,
      }"
      v-bind="$attrs"
    >
      <v-icon
        v-if="dataModeFrom && !fullScreenMode"
        class="options-icon"
        :color="theme.$main_border"
        @click="isSettingsComponentOpen = true"
      >
        {{ icons.mdiSettings }}
      </v-icon>
      <canvas
        ref="gauge"
        :width="box.width"
        :height="canvasHeight"
      />
      <div class="gauge-value-text">
        <span :style="`color: ${valueColor}`">{{ displayValue }}</span>
      </div>
      <div class="gauge-metric-text">
        <span>{{ options.metricName || dsMetricName }}</span>
      </div>
      <DashGaugeSettings
        ref="gaugeSettings"
        v-model="isSettingsComponentOpen"
        :received-settings="options"
        @save="saveSettings"
        @close="closeSettings"
      />
    </div>
  </portal>
</template>

<script>
import { mapGetters } from 'vuex';
import { mdiSettings } from '@mdi/js';
import { Gauge } from './gauge.js';
import DashGaugeSettings from './dashGaugeSettings';

export default {
  name: 'DashGauge',
  components: { DashGaugeSettings },
  props: {
    sizeFrom: {
      type: Object,
      required: true,
    },
    dataRestFrom: {
      type: Array,
      required: true,
    },
    idFrom: {
      type: String,
      required: true,
    },
    idDashFrom: {
      type: String,
      required: true,
    },
    options: {
      type: Object,
      default: null,
    },
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
    dataModeFrom: {
      type: Boolean,
      default: false,
    },
    icons: {
      type: Object,
      default: () => ({
        mdiSettings,
      }),
    },
    defaultZones: {
      type: Array,
      default: () => ([
        { color: '#cccccc', min: 0, max: 100 },
      ]),
    },
    updateSettings: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      value: 0,
      zones: [],
      dsZones: [],
      isSettingsComponentOpen: false,
      dsMetricName: null,
    };
  },
  computed: {
    ...mapGetters({
      theme: 'getTheme',
    }),
    ...mapGetters('app', [
      'userSettings',
    ]),
    canvasHeight() {
      if (this.box.isSmall) {
        return this.box.height > this.box.width
          ? this.box.width * 0.6
          : this.box.height - 55;
      }
      return this.box.height > this.box.width
        ? this.box.width * 0.6
        : this.box.height - 90;
    },
    dashFromStore() {
      return this.$store.state[this.idDashFrom][this.idFrom];
    },
    box() {
      const { width, height } = this.sizeFrom;
      const smallSize = 250;
      return {
        width: Math.round(width),
        height: Math.round(height),
        isSmall: width < smallSize || height < smallSize,
      };
    },
    displayValue() {
      const { numberFormat = false } = this.userSettings;
      return (this.value).toLocaleString(numberFormat);
    },
    valueColor() {
      const zone = this.staticZones.find(({ min, max }) => (this.value >= min && this.value < max));
      if (zone) {
        return zone.strokeStyle;
      }
      if (this.value <= this.gauge.minValue) {
        return this.staticZones[0].strokeStyle;
      }
      if (this.value >= this.gauge.minValue) {
        return this.staticZones[this.staticZones.length - 1].strokeStyle;
      }
      return this.theme.$main_text;
    },
    staticZones() {
      let zones = [];
      if (this.zones.length) {
        zones = this.zones;
      } else if (this.dsZones.length) {
        zones = this.dsZones;
      } else {
        zones = this.defaultZones;
      }
      return zones.reduce((acc, { color, min, max }) => {
        acc.push({ strokeStyle: color, min: +min, max: +max });
        return acc;
      }, []);
    },
    staticLabels() {
      return {
        font: '15px sans-serif',
        labels: [0, ...this.staticZones.map(({ min, max }) => ([min, max])).flat()]
          .filter((value, index, self) => (self.indexOf(value) === index))
          .sort((a, b) => ((a > b) ? 1 : (a < b) ? -1 : 0)),
        color: this.theme.$main_text, // Optional: Label text color
      };
    },
    pointer() {
      return {
        length: 0.36,
        strokeWidth: 0.08,
        color: this.valueColor,
      };
    },
    gaugeOptions() {
      const { numberFormat = false } = this.userSettings;
      return {
        angle: -0.1, // The span of the gauge arc
        lineWidth: 0.2, // The line thickness
        radiusScale: 0.9, // Relative radius
        limitMax: true, // If false, max value increases automatically if value > maxValue
        limitMin: true, // If true, the min value of the gauge will be fixed
        generateGradient: true,
        highDpiSupport: true, // High resolution support
        pointer: this.pointer,
        staticZones: structuredClone(this.staticZones),
        staticLabels: this.box.isSmall ? null : structuredClone(this.staticLabels),
        numberFormat,
      };
    },
  },
  watch: {
    box(val, old) {
      if (JSON.stringify(val) !== JSON.stringify(old)) {
        this.resize();
      }
    },
    dataRestFrom(data) {
      if (data.length) {
        this.loadData(data);
      }
    },
    theme() {
      this.resize();
    },
    zones() {
      this.initGauge();
    },
    fullScreenMode() {
      this.resize();
    },
  },
  mounted() {
    this.loadStoredZones();
    this.initGauge();
    this.loadData(this.dataRestFrom);
    this.resize();
  },
  methods: {
    initGauge() {
      if (!this.$refs.gauge) {
        return;
      }
      this.gauge = new Gauge(this.$refs.gauge);
      this.gauge.setOptions(this.gaugeOptions);
      this.setGaugeMinMax();
      this.gauge.animationSpeed = 10;
      this.gauge.set(this.value);
    },
    setGaugeMinMax() {
      this.gauge.minValue = Math.min(...this.staticZones.map(({ min }) => (+min)));
      this.gauge.maxValue = Math.max(...this.staticZones.map(({ max }) => (+max)));
    },
    resize() {
      // из-за специфической работы фулскрина
      setTimeout(() => {
        this.initGauge();
      }, 10);
    },
    loadStoredZones() {
      const { zones } = this.options;
      if (zones) {
        this.zones = [];
        zones.forEach(({ color, min, max }) => {
          this.zones.push({ color: `${color}`, min: +min, max: +max });
        });
      }
    },
    saveOptions(options) {
      this.$store.commit('setOptions', {
        id: this.idFrom,
        idDash: this.idDashFrom,
        options,
      });
      this.zones = options.zones;
      this.setGaugeMinMax();
    },
    loadData(data) {
      if (!data.length) {
        return;
      }

      // set zones
      const zones = data
        .filter(({ color, min, max }) => (['string'].includes(typeof color) && color !== '' && !Number.isNaN(+min) && !Number.isNaN(+max)))
        // eslint-disable-next-line no-nested-ternary
        .sort((a, b) => ((a.max > b.max) ? 1 : (a.max < b.max) ? -1 : 0));
      this.dsZones = zones?.length ? zones : [];
      this.setGaugeMinMax();

      // set value
      const valueData = data.find(({ value }) => (value !== null && value !== ''));
      if (valueData) {
        this.value = valueData.value;
        this.gauge.setOptions(this.gaugeOptions);
        this.gauge.set(valueData.value);
      }

      // set metricName
      const dsMetricName = data.find(({ metricName }) => (['string', 'number'].includes(typeof metricName)));
      this.dsMetricName = dsMetricName ? dsMetricName.metricName : null;
    },
    closeSettings() {
      this.isSettingsComponentOpen = false;
    },
    saveSettings(options) {
      this.closeSettings();
      this.saveOptions({ ...options });
      if (this.updateSettings) this.updateSettings(options);
    },
  },
};
</script>

<style scoped lang="scss">
.gauge {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto auto;
  justify-content: center;
  justify-items: center;
  align-items: center;
  height: inherit;
  color: var(--main_text);
  .options-icon {
    position: absolute;
    top: 50px;
    right: 18px;
  }
  &-value-text {
    text-align: center;
    font-size: 48px;
    font-weight: bold;
    line-height: 1;
    color: var(--main_text);
    margin-top: -32px;
  }
  &-metric-text {
    font-size: 20px;
    text-align: center;
    color: var(--main_text);
    //margin-top: -16px;
  }
  &.small {
    min-height: 100px;
    .gauge-value-text {
      font-size: 28px;
      margin-top: -56px;
    }
    .gauge-metric-text {
      font-size: 14px;
      margin-top: -24px;
    }
  }
}
</style>
