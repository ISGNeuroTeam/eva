<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
    class="gauge"
    :class="{
      small: box.isSmall,
    }"
  >
    <div v-bind="$attrs">
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
        :height="box.height > box.width ? box.width * .6 : box.height - 120"
      />
      <div class="gauge-value-text">
        <span :style="`color: ${valueColor}`">{{ value | displayValue }}</span>
      </div>
      <div class="gauge-metric-text">
        <span>{{ dsMetricName || options.metricName }}</span>
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
import { Gauge } from './gauge.min';
import DashGaugeSettings from './dashGaugeSettings';

export default {
  name: 'DashGauge',
  components: { DashGaugeSettings },
  filters: {
    displayValue(val) {
      return (+val).toLocaleString('ru-RU');
    },
  },
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
        { color: '#cccccc', max: 100 },
      ]),
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
    valueColor() {
      let lastColor = this.theme.$main_text;
      // eslint-disable-next-line no-restricted-syntax
      for (const item of this.staticZones) {
        lastColor = item.strokeStyle;
        if (this.value >= item.min && this.value < item.max) {
          return item.strokeStyle;
        }
      }
      return lastColor;
    },
    staticZones() {
      let zones = [];
      if (this.dsZones.length) {
        zones = this.dsZones;
      } else if (this.zones.length) {
        zones = this.zones;
      } else {
        zones = this.defaultZones;
      }
      return zones.reduce((acc, { color, max }, i) => {
        acc.push({ strokeStyle: color, min: i > 0 ? acc[i - 1].max : 0, max });
        return acc;
      }, []);
    },
    staticLabels() {
      return {
        font: '15px sans-serif',
        labels: [0, ...this.staticZones.map(({ max }) => +max)],
        color: this.theme.$main_text, // Optional: Label text color
        fractionDigits: 0, // Optional: Numerical precision. 0=round off.
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
      return {
        angle: -0.1, // The span of the gauge arc
        lineWidth: 0.2, // The line thickness
        radiusScale: 0.95, // Relative radius
        limitMax: true, // If false, max value increases automatically if value > maxValue
        limitMin: false, // If true, the min value of the gauge will be fixed
        generateGradient: true,
        highDpiSupport: true, // High resolution support
        pointer: this.pointer,
        staticZones: structuredClone(this.staticZones),
        staticLabels: this.box.isSmall ? null : structuredClone(this.staticLabels),
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
  },
  methods: {
    initGauge() {
      if (!this.$refs.gauge) {
        return;
      }
      this.gauge = new Gauge(this.$refs.gauge);
      this.gauge.setOptions(this.gaugeOptions);
      this.gauge.minValue = 0;
      this.gauge.maxValue = this.staticZones[this.staticZones.length - 1].max;
      this.gauge.animationSpeed = 10;
      this.gauge.set(this.value);
    },
    resize() {
      // из за специфической работы фулскрина
      setTimeout(() => {
        this.initGauge();
      }, 10);
    },
    loadStoredZones() {
      const { zones } = this.options;
      if (zones) {
        this.zones = [];
        zones.forEach(({ color, max }) => {
          this.zones.push({ color: `${color}`, max: +max });
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
      this.gauge.maxValue = this.staticZones[this.staticZones.length - 1].max;
    },
    loadData(data) {
      if (!data.length) {
        return;
      }

      // set zones
      const zones = data
        .filter(({ color }) => (['string'].includes(typeof color) && color !== ''))
        // eslint-disable-next-line no-nested-ternary
        .sort((a, b) => ((a.max > b.max) ? 1 : (a.max < b.max) ? -1 : 0));
      this.dsZones = zones?.length ? zones : [];
      this.gauge.maxValue = this.staticZones[this.staticZones.length - 1].max;

      // set value
      const valueData = data.find(({ value }) => (value !== null && value !== ''));
      if (valueData) {
        this.value = valueData.value;
        this.gauge.setOptions(this.gaugeOptions);
        this.gauge.set(valueData.value);
        this.clearArtifact();
      }

      // set metricName
      const dsMetricName = data.find(({ metricName }) => (['string', 'number'].includes(typeof metricName)));
      this.dsMetricName = dsMetricName ? dsMetricName.metricName : null;
    },
    // Убираем баг со стрелкой
    clearArtifact() {
      const { ctx } = this.gauge;
      const { width, height } = this.gauge.canvas;
      // ctx.fillStyle = "#f006";
      // ctx.fillRect(0, 0, width * 0.31, height * 0.12);
      ctx.clearRect(0, 0, width * 0.338, height * 0.138);
    },
    closeSettings() {
      this.isSettingsComponentOpen = false;
    },
    saveSettings(options) {
      this.closeSettings();
      this.saveOptions({ ...options });
    },
  },
};
</script>

<style scoped lang="scss">
.gauge {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100% - 40px);
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
    margin-top: -16px;
    color: var(--main_text);
  }
  &-metric-text {
    font-size: 20px;
    text-align: center;
    color: var(--main_text);
  }
  &.small {
    .gauge-value-text {
      font-size: 32px;
      margin-top: -8px;
    }
    .gauge-metric-text {
      font-size: 14px;
    }
  }
}
</style>
