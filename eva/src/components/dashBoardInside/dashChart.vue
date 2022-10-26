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
      <div
        v-if="dataModeFrom"
        class="d-inline-block settings-icon"
        @click.stop="openSettings"
      >
        <svg
          height="22px"
          width="22px"
        >
          <path
            :d="mdiSettings"
            :fill="theme.$main_text"
          />
        </svg>
      </div>
      <div
        ref="legend"
        class="legend"
        @mouseleave="chart.highlightMetric(null)"
      >
        <template v-for="(group, nGroup) in metricsByGroup">
          <div
            v-for="(metric, nMetric) in group
              .filter(({name, hideLegend}) => !hideLegend && name !== xMetric)"
            :key="metric.name"
            @mouseenter="chart.highlightMetric(metric)"
            @click="openSettingsForMetric(metric, nGroup, nMetric)"
          >
            <div
              class="circle"
              :style="`background-color: ${metric.color}`"
            />
            {{ metric.title || metric.name }}
          </div>
        </template>
      </div>
      <div v-if="dataRestFrom.length === 0">
        <span>Нет данных для отображения</span>
      </div>
      <div
        ref="svgContainer"
        class="svg-container"
        @dblclick="$emit('resetRange')"
      />
      <div
        v-show="dataRestFrom.length"
        class="x-metric-text"
      >
        {{ xMetric }}
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
      defaultSettings: {
        useGroups: true,
      },
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
      if (!this.$store.state[idDash][id] || !this.$store.state[idDash][id].options) {
        this.$store.commit('setDefaultOptions', { id, idDash });
      }
      return this.$store.state[idDash][id];
    },
    tokensStore() {
      const { idDash } = this;
      return this.$store.state[idDash].tockens;
    },
    options() {
      return {
        ...this.defaultSettings,
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
      return [...this.firstDataRowMetricList.filter((item) => item !== this.xMetric)];
    },
    xAxisSettings() {
      if (this.options.xAxis) {
        return {
          ...this.options.xAxis,
          allMetrics: this.firstDataRowMetricList,
        };
      }
      const {
        timeFormat,
        xAxisCaptionRotate,
        barplotstyle,
      } = this.options;
      return {
        xMetric: this.xMetric,
        type: (this.options.stringOX || !ChartClass.isTimestamp(this.firstDataRow[this.xMetric]))
          ? 'linear' // linear, time, - log, point, band
          : 'time',
        timeFormat,
        textRotate: +xAxisCaptionRotate || -45,
        barplotType: barplotstyle || 'divided',
        allMetrics: this.firstDataRowMetricList,
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
              if (!this.options.useGroups) {
                metricsByGroup.push([metric]);
              } else {
                metrics.push(metric);
              }
            }
          });
          if (metrics.length) {
            metricsByGroup.push(metrics);
          }
        });
      }

      // add new metrics config
      const newMetrics = this.metrics.filter((i) => existsMetrics.indexOf(i) < 0);
      if (newMetrics.length) {
        metricsByGroup.push([]);
        newMetrics.forEach((metricName, nN) => {
          const metric = this.getOldMetricConfig(metricName);
          if (!this.options.useGroups && metricsByGroup[metricsByGroup.length - 1].length > 0) {
            metricsByGroup.push([]);
          }
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
      const { xAxis = {} } = this.options;
      const { xMetric = null } = xAxis;
      if (xMetric) {
        return xMetric;
      }
      const [firstMetric] = this.firstDataRowMetricList;
      return firstMetric;
    },

    box() {
      const { sizeFrom } = this;
      const { width, height } = sizeFrom;
      return {
        width: Math.round(width - 42),
        height: Math.round(height - 55) - 45,
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
        useGroups: !!this.options.useGroups,
      };
    },
  },
  watch: {
    box(val, old) {
      if (JSON.stringify(val) !== JSON.stringify(old)) {
        this.updateBox();
      }
    },
    dataRestFrom() {
      this.updateData();
    },
    fullScreenMode() {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.chart.moveInNewContainer(this.$refs.svgContainer);
          this.updateBox();
        });
      });
    },
    theme(val, old) {
      if (JSON.stringify(val) !== JSON.stringify(old)) {
        this.chart.theme = this.theme;
        this.chart.moveInNewContainer(this.$refs.svgContainer);
        this.updateBox();
      }
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
      const { width, height } = this.box;
      this.chart = new ChartClass(this.$refs.svgContainer, width, height, this.theme, {
        useGroups: !!this.options.useGroups,
        xAxis: {
          type: 'time', // linear, time, - log, point, band
          timeFormat: '%d.%m.%y %H:%M',
          nice: 100, // count
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
          this.$store.dispatch('letEventGo', {
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
      this.chart.update(this.metricsByGroup, this.xAxisSettings, this.dataRestFrom, this.xMetric);
    },
    updateBox() {
      const { width, height } = this.box;
      this.chart.updateBox(width, height);
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

    getOldMetricConfig(name) {
      const {
        metricTypes = {},
        optionsColor = {},
        // metricsAxis = {},
        yAxesBinding,
        color: optionColor = {},
        // eslint-disable-next-line camelcase
        conclusion_count = {},
        // eslint-disable-next-line camelcase
        replace_count = {},
        isDataAlwaysShow = false,
        lastDot = false,
      } = this.options;

      const metricOptions = this.options.metrics?.find((item) => item.name === name) || {};
      const metricTypesOptions = metricTypes[name] || metricOptions.type || 'line';

      const isBarplot = (yAxesBinding && yAxesBinding.metricTypes[name])
        ? (yAxesBinding.metricTypes[name] === 'barplot' || metricTypes[name] === 'barplot')
        : ['Bar chart', 'barplot'].includes(metricTypesOptions);

      const color = (!isBarplot && !this.options.united)
        ? (optionsColor[name] || optionColor[name] || this.color(name))
        : this.color(name);

      const zerosAfterDot = parseInt(replace_count[name], 10) ?? null;
      const enabledBounding = metricOptions.manualBorder === true;
      const upperBound = parseFloat(metricOptions.upborder);
      const lowerBound = parseFloat(metricOptions.lowborder);
      const typeLine = (!isBarplot && !this.options.united && this.options.type_line)
        ? this.options.type_line[name]
        : null;
      const unit = this.metricUnits.find((d) => d.name === name);

      return {
        color,
        name,
        type: isBarplot ? 'barplot' : 'line',
        // yAxisSide: (this.options.united && metricsAxis[name]) === 'right' ? 'right' : 'left',
        yAxisSide: 'left',
        // eslint-disable-next-line no-nested-ternary
        lastDot: conclusion_count[name] || (isDataAlwaysShow ? 1 : (lastDot ? 0 : '')),
        // eslint-disable-next-line no-restricted-globals
        zerosAfterDot: isNaN(zerosAfterDot) ? 2 : zerosAfterDot,
        peakTextData: isDataAlwaysShow || false,
        showPeakDots: conclusion_count[name] > 0
          || isDataAlwaysShow
          || lastDot,
        showText: isDataAlwaysShow
          || conclusion_count[name] > 0
          || lastDot,
        // eslint-disable-next-line no-restricted-globals
        upperBound: (!enabledBounding || isNaN(upperBound)) ? null : upperBound,
        // eslint-disable-next-line no-restricted-globals
        lowerBound: (!enabledBounding || isNaN(lowerBound)) ? null : lowerBound,
        dotSize: 4,
        strokeDasharray: this.getStyleLine(typeLine),
        unit: unit?.units,
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
      const { metricsByGroup, xAxis, useGroups } = settings;
      this.$store.commit('setOptions', {
        id: this.idFrom,
        idDash: this.idDashFrom,
        options: {
          ...this.options,
          useGroups,
          metricsByGroup,
          xAxis,
          version: 3,
        },
      });
      this.chart.update(this.metricsByGroup, this.xAxisSettings, this.dataRestFrom, this.xMetric);
    },
  },
};
</script>

<style lang="sass" scoped>
@import ../../sass/_colors

.settings-icon
  float: right
  margin: 8px 2px
  color: $secondary-text !important
  cursor: pointer
  margin-bottom: -8px

.svg-container
  position: relative
  min-height: 100px

.x-metric-text
  font-size: 11px

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
