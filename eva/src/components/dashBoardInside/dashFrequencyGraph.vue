<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      v-bind="$attrs"
      class="frequency-graph"
    >
      <div
        v-if="data.length === 0"
        class="no-data-text"
      >
        <span>Нет данных для отображения</span>
      </div>
      <div ref="svgContainer" />
    </div>
  </portal>
</template>

<script>
import * as d3 from 'd3';

const color = d3.scaleOrdinal().range(d3.schemeSet2);

export default {
  name: 'DashFrequencyGraph',
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
    xMetric: {
      type: String,
      default: '_time',
    },
    durationAnimation: {
      type: Number,
      default: 600,
    },
  },
  data() {
    return {
      actions: [],
      margin: {
        top: 10,
        right: 20,
        bottom: 20,
        left: 20,
      },
      defaultOptions: {
        groupMetric: 'event',
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
    box() {
      let { width, height } = this.sizeFrom;
      width -= 8;
      height -= 55;

      const {
        left, top,
        right, bottom,
      } = this.margin;
      return {
        width,
        height,
        chartWidth: width - left - right,
        chartHeight: height - top - bottom,
      };
    },
    data() {
      return this.dataRestFrom || [];
    },
    groups() {
      return [...new Set(this.data.map((d) => d[this.groupMetric]))];
    },
    timeList() {
      return this.data.map((d) => d[this.xMetric]);
    },
    xDomainMin() {
      return d3.min(this.timeList);
    },
    xDomainMax() {
      return d3.max(this.timeList);
    },
    tooltipFields() {
      if (!this.data || !this.data.length) {
        return [];
      }
      return Object.keys(this.data[0])
        .filter((field) => field[0] !== '_' && ![this.xMetric, this.groupMetric].includes(field));
    },
    dashStore() {
      const { id, idDash } = this;
      return this.$store.state[idDash][id];
    },
    options() {
      return {
        ...this.defaultOptions,
        ...this.dashStore.options,
      };
    },
    groupMetric() {
      return this.options.groupMetric || this.defaultOptions.groupMetric;
    },
  },
  watch: {
    box(a, b) {
      if (JSON.stringify(a) !== JSON.stringify(b)) {
        this.render();
      }
    },
    data() {
      this.render();
    },
    options: {
      deep: true,
      handler() {
        this.render();
      },
    },
    fullScreenMode() {
      this.$nextTick()
        .then(this.render);
    },
    tooltipFields(val, old) {
      if (val && val.length && JSON.stringify(val) !== JSON.stringify(old)) {
        this.setLastMetrics(val);
      }
    },
  },
  mounted() {
    this.render();
    this.setLastMetrics(this.tooltipFields);
    this.$on('resetZoom', this.resetZoom);
  },
  methods: {
    resetZoom() {
      // emit double click
      this.updateChart();
      this.updateChart();
    },
    clear() {
      d3.select(this.$refs.svgContainer).selectAll('svg').remove();
    },
    render() {
      this.clear();
      this.createGraph();
      this.createTooltip();
      this.createClipArea();
      this.addDots();
      this.updateChart();
    },
    createTooltip() {
      this.tooltip = d3.select(this.$refs.svgContainer)
        .append('div')
        .style('position', 'absolute')
        .style('background-color', 'var(--secondary_bg)')
        .style('border', '1px solid var(--main_border)')
        .style('border-radius', '4px')
        .style('color', 'var(--main_text)')
        .style('padding', '5px')
        .style('font-size', '12px')
        .style('white-space', 'nowrap')
        .style('z-index', '2')
        .style('pointer-events', 'none')
        .style('text-align', 'left')
        .style('visibility', 'hidden')
        .style('white-space', 'pre-wrap');
    },
    createGraph() {
      const { width, height } = this.box;
      const { left, top } = this.margin;
      this.svg = d3.select(this.$refs.svgContainer)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${left},${top})`);
      this.createGraphAxisX();
      this.createGraphAxisY();
    },
    createClipArea() {
      const { chartWidth, chartHeight } = this.box;
      this.clip = this.svg.append('defs').append('svg:clipPath')
        // .attr('id', 'clip')
        .append('svg:rect')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .attr('x', 0)
        .attr('y', 0);

      this.brush = d3.brushX()
        .extent([[0, 0], [chartWidth, chartHeight]])
        .on('end', () => {
          this.updateChart();
        });
    },
    updateChart() {
      const extent = d3.event?.selection;
      if (!extent) {
        if (!this.idleTimeout) {
          this.idleTimeout = setTimeout(() => {
            this.idleTimeout = null;
          }, 350);
          return;
        }
        this.x.domain([new Date(this.xDomainMin * 1000), new Date(this.xDomainMax * 1000)]);
      } else {
        this.x.domain([this.x.invert(extent[0]), this.x.invert(extent[1])]);
        this.brushGroup.call(this.brush.move, null);
      }

      // Update axis and circle position
      this.xAxis.transition()
        .duration(this.durationAnimation)
        .call(d3.axisBottom(this.x));

      this.dotsGroup
        .selectAll('circle')
        .transition()
        .duration(this.durationAnimation)
        .attr('cx', (d) => this.x(new Date(d[this.xMetric] * 1000)))
        .attr('cy', (d) => this.y(d[this.groupMetric]) + this.y.bandwidth() / 2);

      this.addXAxisLines();
    },
    addXAxisLines() {
      const { chartHeight } = this.box;
      const groupHeight = chartHeight / this.groups.length;
      this.xAxis.selectAll('line.x-line').remove();
      this.groups.forEach((group, n) => {
        this.xAxis.selectAll('g.tick')
          .append('line')
          .attr('class', 'x-line')
          .attr('stroke', 'currentColor')
          .attr('opacity', 0.3)
          .attr('y1', -10 - groupHeight * n)
          .attr('y2', 10 - groupHeight * (n + 1));
      });
    },
    createGraphAxisX() {
      const { chartWidth, chartHeight } = this.box;
      this.x = d3.scaleTime()
        .domain([new Date(this.xDomainMin * 1000), new Date(this.xDomainMax * 1000)])
        .range([0, chartWidth]);
      this.xAxis = this.svg.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(this.x));

      this.addXAxisLines();
    },
    createGraphAxisY() {
      const { chartWidth, chartHeight } = this.box;
      this.y = d3.scaleBand()
        .domain(this.groups)
        .range([chartHeight, 0]);
      const yAxis = this.svg.append('g')
        .call(d3.axisLeft(this.y));

      // remove texts, lines and domain of y
      yAxis.selectAll('text, line, path.domain').remove();

      // Add group titles
      yAxis.selectAll('g.tick')
        .append('text')
        .attr('x', chartWidth / 2)
        .attr('y', 8 - this.y.bandwidth() / 2)
        .attr('text-anchor', 'middle')
        .style('fill', 'currentColor') // color
        .text((d) => d);
    },
    addDots() {
      this.scatter = this.svg.append('g');
      // .attr('clip-path', 'url(#clip)')

      this.brushGroup = this.scatter
        .append('g')
        .attr('class', 'brush');
      if (this.brush) {
        this.brushGroup.call(this.brush);
      }

      this.dotsGroup = this.scatter.append('g');

      const dot = this.dotsGroup.selectAll('circle')
        .data(this.data)
        .enter()
        .append('circle')
        .style('fill', (d) => color(d[this.groupMetric]))
        .attr('cx', (d) => this.x(new Date(d[this.xMetric] * 1000)))
        .attr('cy', (d) => this.y(d[this.groupMetric]) + this.y.bandwidth() / 2)
        .attr('r', 5);

      if (this.tooltip) {
        dot
          .on('mouseover', (d) => {
            const time = new Date(d[this.xMetric] * 1000).toLocaleString();
            let text = `Время: ${time}`;
            const fields = this.options?.tooltipMetrics || this.tooltipFields;
            fields.forEach((field) => {
              if (d[field] !== undefined) {
                text += `\n${field}: ${d[field]}`;
              }
            });
            this.tooltip
              .text(text)
              .style('visibility', 'visible')
              .style('opacity', 1);
          })
          .on('mousemove', () => {
            // eslint-disable-next-line no-restricted-globals,prefer-const
            let { offsetX, offsetY } = event;
            const offset = 10;
            const rightHalf = (offsetX > this.box.width / 2);
            const { width } = this.tooltip.node().getBoundingClientRect();
            if (rightHalf) {
              offsetX -= (width + offset * 2);
            } else {
              offsetX += offset * 2;
            }
            this.tooltip
              .style('left', `${offsetX}px`)
              .style('top', `${offsetY}px`);
          })
          .on('mouseleave', () => {
            this.tooltip
              .transition()
              .duration(200)
              .style('opacity', 0);
          });
      }
    },
    setLastMetrics(metrics) {
      this.$store.commit('setLastMetrics', {
        id: this.idFrom,
        idDash: this.idDashFrom,
        metrics,
      });
    },
  },
};
</script>

<style scoped lang="sass">
.frequency-graph::v-deep
  color: var(--main_text)

  .no-data-text
    padding: 16px
    text-align: center

  svg
    color: var(--main_text)
</style>
