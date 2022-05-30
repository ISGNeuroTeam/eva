<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      :style="customStyle"
      :class="customClass"
      v-bind="$attrs"
      class="muililine-new"
    >
      <v-icon
        size="22"
        class="settings-icon"
        @click.stop="openSettings"
        v-text="mdiSettings"
      />
      <div
        ref="legend"
        class="legend"
        @mouseleave="chart.highlightMetric(null)">
        <template v-for="(group, nGroup) in metricsByGroup">
          <div
            v-for="(metric, nMetric) in group.filter(metric => !metric.hideLegend)"
            :key="metric.name"
            @mouseenter="chart.highlightMetric(metric)"
            @click="openSettingsForMetric(metric, nGroup, nMetric)"
          >
            <div
              class="circle"
              :style="`background-color: ${metric.color}`"
            ></div>
            {{ metric.title || metric.name }}
          </div>
        </template>
      </div>
      <div v-if="data.length === 0">
        <span>Нет данных для отображения</span>
      </div>
      <div
        ref="svgContainer"
        class="svg-container"
        @dblclick="$emit('resetRange')"
      >
      </div>
    </div>
    <DashChartSettings
      ref="chartSettings"
      v-model="isSettingsComponentOpen"
      :received-settings="receivedSettings"
      @save="saveSettings"
      @close="closeSettings"
    />
  </portal>
</template>

<script>
import { mdiSettings } from '@mdi/js';
import * as d3 from 'd3';
import ChartClass from '../../js/classes/ChartClass';
import DashChartSettings from './dashChartSettings';

export default {
  name: 'DashChart',
  components: { DashChartSettings },
  inheritAttrs: false,
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
    dataModeFrom: Boolean,
    /** Props from Reports page. */
    dataReport: Boolean,
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
  data() {
    return {
      actions: [
        { name: 'click', capture: ['pointX', 'pointY'] },
        { name: 'select', capture: ['start', 'end'] },
      ],
      chart: null,
      mdiSettings,
      isSettingsComponentOpen: false,
      defaultSettings: {},
    };
  },
  computed: {
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    dashStore() {
      const { id, idDash } = this;
      return this.$store.state[idDash][id];
    },
    tokensStore() {
      const { idDash } = this;
      return this.$store.state[idDash].tockens;
    },
    options() {
      return {
        ...this.dashStore.options,
      };
    },
    colors() {
      return [
        this.theme.$grass,
        this.theme.$forest,
        this.theme.$blue,
        this.theme.$plum,
        this.theme.$purple,
        this.theme.$orange,
        this.theme.$peach,
        this.theme.$raspberry,
        this.theme.$coral,
        this.theme.$beet,
        this.theme.$sun,
        this.theme.$kiwi,
        this.theme.$sea,
      ];
    },
    firstDataRow() {
      return this.dataRestFrom[0] || {};
    },
    firstDataRowMetricList() {
      return Object.keys(this.firstDataRow).filter(
        (key) => key.indexOf('caption') === -1 && key.indexOf('annotation') === -1,
      );
    },
    metrics() {
      const metrics = [...this.firstDataRowMetricList];
      metrics.splice(0, 1);
      return metrics;
    },
    xAxisSettings() {
      if (this.options.xAxis) {
        return {
          ...this.options.xAxis,
        };
      }
      const {
        timeFormat,
        xAxisCaptionRotate,
        barplotstyle,
      } = this.options;
      // @todo: user deprecated property: stringOX
      return {
        type: (this.options.stringOX || !ChartClass.isTimestamp(this.firstDataRow[this.xMetric]))
          ? 'linear' // linear, time, - log, point, band
          : 'time',
        timeFormat,
        textRotate: xAxisCaptionRotate,
        barplotType: barplotstyle || 'divided',
      };
    },
    metricsByGroup() {
      // check current metrics config
      const metricsByGroup = [];
      const existsMetrics = [];
      if (this.options.metricsByGroup && this.options.metricsByGroup.length) {
        this.options.metricsByGroup.forEach((group) => {
          const metrics = [];
          group.forEach((metric) => {
            if (this.metrics.includes(metric.name)) {
              existsMetrics.push(metric.name);
              metrics.push(metric);
            }
          });
          if (metrics.length) {
            metricsByGroup.push(metrics);
          }
        });
      }

      // add new metrics config
      const newMetrics = this.metrics.filter(i => existsMetrics.indexOf(i) < 0);
      if (newMetrics.length) {
        metricsByGroup.push([]);
        newMetrics.forEach((metricName, nN) => {
          const metric = this.getOldMetricConfig(metricName);
          metricsByGroup[metricsByGroup.length - 1].push(metric);
          // если тащим настройки со старого мультилайна то добавим группы для не united графиков
          if (this.options.united === false && nN !== newMetrics.length - 1) {
            metricsByGroup.push([]);
          }
        });
      }
      return metricsByGroup;
    },

    xMetric() {
      const [xMetric] = this.firstDataRowMetricList;
      return xMetric;
    },

    data() {
      return this.dataRestFrom;
    },

    box() {
      const { sizeFrom } = this;
      const { width, height } = sizeFrom;
      return {
        width: Math.round(width - 42),
        height: Math.round(height - 55) - 60, // @todo: legend height
      };
    },

    color() {
      return d3.scaleOrdinal()
        .domain(this.metrics)
        .range(this.colors);
    },

    metricUnits() {
      return this.dashStore.metrics || [];
    },

    receivedSettings() {
      return {
        metricsByGroup: [...this.metricsByGroup],
        xAxis: { ...this.xAxisSettings },
      };
    },
  },
  watch: {
    box(val, old) {
      if (JSON.stringify(val) !== JSON.stringify(old)) {
        this.updateBox();
      }
    },
    data() {
      this.updateData();
    },
    /*
    metrics(val, old) {
      this.reRenderChart();
      if (val.length && JSON.stringify(val) !== JSON.stringify(old)) {
        this.sendMetricsToStore();
      }
    },
    theme() {
      this.reRenderChart();
    },
    options: {
      deep: true,
      handler() {
        this.reRenderChart();
      },
    },*/
    fullScreenMode() {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.chart.moveInNewContainer(this.$refs.svgContainer);
          this.updateBox();
        });
      });
    },
  },
  mounted() {
    const { id, idDash, actions } = this;
    this.$store.commit('setActions', { id, idDash, actions });
    this.createChart();
    this.updateData();
  },
  methods: {
    createChart() {
      console.log('- createChart')
      const { width, height } = this.box;
      this.chart = new ChartClass(this.$refs.svgContainer, width, height, {
        xAxis: {
          type: 'time', // linear, time, - log, point, band
          //barplotType: 'divided', // overlay, divided, accumulation
          timeFormat: '%d.%m.%y %H:%M',
          nice: 100, // count
          // textRotate: 90,
          // textTranslate: [12, 8],
        },
      });
      this.chart.onZoom((range) => {
         this.$emit('SetRange', {
          range,
          xMetric: this.xMetric,
        });
        this.setClick(range, 'select');
      });
      this.chart.onClick((range) => {
        this.setClick(range, 'click');
      });
    },

    setClick(point, actionName) {
      if (!this.tokensStore) {
        return;
      }
      const { id, idDash } = this;
      const tokens = this.tokensStore
        .filter(({ elem, action }) => (elem === id && action === actionName));
      const values = {
        pointX: point[0],
        pointY: point[1],
        start: point[0],
        end: point[1],
      };
      tokens.forEach(({ action, name, capture }) => {
        const token = {
          name,
          action,
          capture,
          filterParam: this.xMetric,
        };
        this.$store.commit('setTocken', {
          token,
          value: values[capture],
          idDash,
        });
      });
      const events = this.eventsStore({
        idDash,
        event: 'onclick',
        partelement: 'point',
      });
      events.forEach(({ event }) => {
        if (event.action === 'set') {
          this.$store.commit('letEventSet', { idDash, events });
        } else if (event.action === 'go' && actionName !== 'select') {
          this.$store.commit('letEventGo', {
            idDash,
            event,
            store: this.$store,
            route: this.$router,
          });
        }
      });
    },

    eventsStore({ event, partelement }) {
      const { idDash } = this;
      let result = [];
      if (partelement) {
        result = this.$store.state[idDash].events?.filter((item) => (
          item.event === event
          && item.element === this.id
          && item.partelement === partelement
        )) || [];
      } else {
        result = this.$store.state[idDash].events?.filter(
          (item) => item.event === event
            && item.target === this.id,
        ) || [];
      }
      return result;
    },

    updateData() {
      this.chart.update(this.metricsByGroup, this.xAxisSettings, this.data, this.xMetric);
    },
    updateBox() {
      const { height } = this.box;
      this.chart.updateBox(this.$refs.svgContainer.offsetWidth, height);
    },
    openSettingsForMetric(metric, nGroup, nMetric) {
      const panelMetric = [];
      panelMetric[nGroup] = nMetric;
      this.$refs.chartSettings.panelMetric = panelMetric;
      this.openSettings();
    },

    getStyleLine(type) {
      if (type === 'dashed') {
        return '5,5';
      } if (type === 'dotted') {
        return '1,3';
      } if (type === 'double') {
        return '1, 3, 6, 3';
      }
      return '0';
    },

    getOldMetricConfig (name) {
      const {
        // eslint-disable-next-line camelcase
        conclusion_count = {},
        metricTypes = {},
        optionsColor = {},
        // eslint-disable-next-line camelcase
        replace_count = {},
        metricsAxis = {},
        yAxesBinding,
        color: optionColor = {},
      } = this.options;

      const metricOptions = this.options.metrics?.find((item) => item.name === name) || {
        type: 'line',
      };
      const metricTypesOptions = metricTypes[name] || metricOptions.type;

      const isBarplot = (yAxesBinding && yAxesBinding.metricTypes[name])
          ? (yAxesBinding.metricTypes[name] === 'barplot' || metricTypes[name] === 'barplot')
          : ['Bar chart', 'barplot'].includes(metricTypesOptions);

      const color = (!isBarplot && !this.options.united)
          ? (optionsColor[name] || optionColor[name] || this.color(name))
          : this.color(name);

      const zerosAfterDot = parseInt(replace_count[name]) ?? null;
      const enabledBounding = metricOptions.manualBorder === true;
      const upperBound = parseFloat(metricOptions.upborder);
      const lowerBound = parseFloat(metricOptions.lowborder);
      const typeLine = !isBarplot && !this.options.united && this.options.type_line
          ? this.options.type_line[name]
          : null;
      const unit = this.metricUnits.find(d => d.name === name);

      // @todo: need optimization
      return {
        color,
        name,
        type: isBarplot ? 'barplot' : 'line',
        yAxisSide: (this.options.united && metricsAxis[name]) === 'right' ? 'right' : 'left',
        lastDot: conclusion_count[name] || (this.options.isDataAlwaysShow ? 1 : (this.options.lastDot ? 0 : '')),
        zerosAfterDot: isNaN(zerosAfterDot) ? 2 : zerosAfterDot,
        peakTextData: this.options.isDataAlwaysShow || false,
        showPeakDots: conclusion_count[name] > 0 || !!this.options.isDataAlwaysShow || this.options.lastDot,
        showText: !!this.options.isDataAlwaysShow || conclusion_count[name] > 0 || this.options.lastDot,
        upperBound: (!enabledBounding || isNaN(upperBound)) ? null : upperBound,
        lowerBound: (!enabledBounding || isNaN(lowerBound)) ? null : lowerBound,
        dotSize: 4,
        strokeDasharray: this.getStyleLine(typeLine),
        unit: unit?.units,

        // @todo: need adaption
        strokeWidth: 1,
      };
    },

    openSettings() {
      this.isSettingsComponentOpen = true;
    },

    closeSettings() {
      this.isSettingsComponentOpen = false;
    },

    saveSettings(settings = {}) {
      const { metricsByGroup, xAxis } = settings;
      this.$store.commit('setOptions', {
        id: this.idFrom,
        idDash: this.idDashFrom,
        options: { ...this.options, metricsByGroup, xAxis, version: 3 },
      });
      this.chart.update(this.metricsByGroup, this.xAxisSettings, this.data, this.xMetric);
    },
  },
};
</script>

<style lang="sass" scoped>
@import ../../sass/_colors

.settings-icon
  float: right
  margin: 8px 2px
  color: $secondary-text

.svg-container
  position: relative
  min-height: 100px

.legend
  text-align: left
  cursor: pointer
  font-size: 14px
  min-height: 30px
  > div
    display: inline-block
    padding: 2px 16px 2px 0

  .circle
    display: inline-block
    border-radius: 50%
    width: 10px
    height: 10px
    margin-right: 4px

</style>
