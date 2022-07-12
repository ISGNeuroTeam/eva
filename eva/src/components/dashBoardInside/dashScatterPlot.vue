<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      v-bind="$attrs"
      class="scatter-plot"
    >
      <div
        ref="legend"
        class="legend"
        @mouseleave="chart.highlightMetric(null)"
      >
        <div
          v-for="(metric, nMetric) in legendItems"
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
      </div>
      <div
        v-show="isOptionsComplete && !loading && dataRestFrom.length > 0"
        ref="svgContainer"
        class="dash-content"
      />
      <div
        v-if="dataRestFrom.length === 0"
        class="pa-1 text-center"
      >
        Нет данных для отображения
      </div>
      <div
        v-else-if="!isOptionsComplete"
        class="pa-1 text-center"
      >
        Укажите метрики для X и Y осей
      </div>
    </div>
  </portal>
</template>

<script>
import * as d3 from 'd3';
import ChartClass from '../../js/classes/ChartClass';

export default {
  name: 'DashScatterPlot',
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
    dataReport: Boolean,
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    sizeFrom: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      actions: [
        { name: 'click', capture: [] },
      ],
    };
  },
  computed: {
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },
    box() {
      const { sizeFrom } = this;
      const { width, height } = sizeFrom;
      return {
        width: Math.round(width - 8),
        height: Math.round(height - 55),
      };
    },
    firstDataRow() {
      const [firstRow] = this.dataRestFrom;
      return firstRow || {};
    },
    firstDataRowMetricList() {
      return Object.keys(this.firstDataRow);
    },
    metrics() {
      return [...this.firstDataRowMetricList];
    },
    metricsByGroup() {
      const { yMetric, metricGroup } = this.options;
      return [
        [
          {
            name: yMetric,
            type: 'scatter', // barplot
            dotSize: 4,
            nice: 9,
            metricGroup,
            coloredYAxis: false,
          },
        ],
      ];
    },
    groups() {
      if (!this.options.metricGroup) {
        return [];
      }
      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }
      return this.dataRestFrom
        .map((item) => item[this.options.metricGroup])
        .filter(onlyUnique);
    },
    legendItems() {
      const color = d3.scaleOrdinal().range(d3.schemeSet2);
      return this.groups.map((item) => ({
        name: item,
        color: color(item),
      }));
    },
    xAxisSettings() {
      return {
        type: 'linear',
        textRotate: 0,
        verticalLines: false,
        xSelection: false,
      };
    },
    dashStore() {
      const { id, idDash } = this;
      return this.$store.state[idDash][id];
    },
    options() {
      return {
        ...this.dashStore.options,
      };
    },
    xMetric() {
      return this.options.xMetric;
    },
    isOptionsComplete() {
      return this.xMetric && this.options.yMetric;
    },
    tokensStore() {
      const { idDash } = this;
      return this.$store.state[idDash].tockens;
    },
    actionsWithCapture() {
      return this.actions.map((action) => ({
        ...action,
        capture: this.metrics,
      }));
    },
  },
  watch: {
    dataRestFrom() {
      this.updateData();
    },
    options() {
      this.updateData();
    },
    groups() {
      this.$nextTick(() => {
        this.updateBox();
      });
    },
    box(val, old) {
      if (JSON.stringify(val) !== JSON.stringify(old)) {
        this.updateBox();
      }
    },
    fullScreenMode() {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.chart.moveInNewContainer(this.$refs.svgContainer);
          this.updateBox();
        });
      });
    },
    metrics(metrics) {
      if (metrics && metrics.length) {
        this.setLastMetrics(metrics);
        const { id, idDash } = this;
        const { actionsWithCapture: actions } = this;
        this.$store.commit('setActions', { id, idDash, actions });
      }
    },
    chartOptions() {
      return {
        yGroupLabel: this.options.yMetric,
        xAxis: {
          type: 'linear',
          label: this.xMetric,
        },
      };
    },
  },
  mounted() {
    this.createChart();
    this.updateData();
    this.setLastMetrics(this.metrics);
    const { id, idDash } = this;
    const { actionsWithCapture: actions } = this;
    console.log({actions})
    this.$store.commit('setActions', { id, idDash, actions });
  },
  methods: {
    setLastMetrics(metrics) {
      this.$store.commit('setLastMetrics', {
        id: this.idFrom,
        idDash: this.idDashFrom,
        metrics,
      });
    },
    createChart() {
      const { legend, svgContainer } = this.$refs;
      const { width, height } = this.box;
      const topOffset = legend.offsetHeight;
      this.chart = new ChartClass(svgContainer, width, height - topOffset, this.chartOptions);
      this.chart.onClick((d) => this.onClickDot(d));
    },
    updateData() {
      this.chart.update(this.metricsByGroup, this.xAxisSettings, this.dataRestFrom, this.xMetric);
      this.$nextTick(() => {
        this.updateBox();
      });
    },
    updateBox() {
      const { width, height } = this.box;
      const topOffset = this.$refs.legend.offsetHeight;
      this.chart.updateBox(width, height - topOffset);
    },
    onClickDot(d) {
      if (!this.tokensStore) {
        return;
      }
      const { id, idDash } = this;
      const tokens = this.tokensStore
        .filter(({ elem, action }) => (elem === id && action === 'click'));

      tokens.forEach(({ action, name, capture }) => {
        const token = {
          name,
          action,
          capture,
          filterParam: this.xMetric,
        };
        this.$store.commit('setTocken', {
          token,
          value: d[capture],
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
        } else if (event.action === 'go') {
          this.$store.commit('letEventGo', {
            idDash,
            event,
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
  },
};
</script>

<style scoped lang="sass">
.scatter-plot, .dash-content, .settings-icon
  color: var(--main_text)

.dash-content
  margin: 0 10px
  position: relative

.legend
  text-align: left
  font-size: 14px
  min-height: 30px
  margin: 0 10px
  color: var(--main_text)
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
