<template>
  <div
    class="timeline"
    :style="{ background: theme.$main_bg, color: theme.$main_text }"
  >
    <div class="select-wrap p-5">
      <div>
        <v-btn
          class="scale-btn"
          text
          small
          @click="plusScale"
        >
          <v-icon
            :color="theme.$main_text"
            small
          >
            {{ mdiPlus }}
          </v-icon>
          <span class="scale-btn-text">Увеличить</span>
        </v-btn>
        <v-btn
          class="scale-btn"
          text
          small
          @click="minusScale"
        >
          <v-icon
            :color="theme.$main_text"
            small
          >
            {{ mdiMinus }}
          </v-icon>
          <span class="scale-btn-text">Уменьшить</span>
        </v-btn>
        <v-btn
          class="scale-btn"
          text
          small
          @click="refreshScale()"
        >
          <v-icon
            :color="theme.$main_text"
            small
          >
            {{ mdiRefresh }}
          </v-icon>
          <span class="scale-btn-text">Исходный вид</span>
        </v-btn>
      </div>
      <v-menu
        v-model="menuDropdown"
        offset-y
        max-width="180"
        class="select"
      >
        <template v-slot:activator="{ on, attrs }">
          <div
            v-bind="attrs"
            v-on="on"
          >
            <span style="font-size: 15px">{{ select.text }}</span>
            <v-icon :color="theme.$main_text">
              {{ mdiChevronDown }}
            </v-icon>
          </div>
        </template>
        <v-list>
          <v-list-item
            v-for="item in periodItemsSelect"
            :key="item.value"
            link
            @click="setTimePeriod(item)"
          >
            <v-list-item-title v-text="item.text" />
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <svg
      ref="chart"
      class="chart1"
      height="50"
      style="width: 100%"
    />
  </div>
</template>

<script>
import * as d3 from 'd3';
import {
  mdiRefresh,
  mdiMagnify,
  mdiChevronDown,
  mdiPlus,
  mdiMinus,
} from '@mdi/js';
import { mapGetters } from 'vuex';
import moment from 'moment';

const timelineEnum = {
  min: 0,
  hour: 1,
  day: 2,
  month: 3,
};

export default {
  name: 'Timeline',
  props: {
    data: {
      type: Array,
      default: () => ([]),
    },
  },
  data() {
    return {
      search: {
        parametrs: {},
      },
      numberInTimeline: 25,
      menuDropdown: false,
      select: { text: 'Колонка (1 день)', value: 'day' },
      periodItemsSelect: [
        { text: 'Колонка (1 мин.)', value: 'min' },
        { text: 'Колонка (1 час)', value: 'hour' },
        { text: 'Колонка (1 день)', value: 'day' },
        { text: 'Колонка (1 месяц)', value: 'month' },
      ],
      mdiRefresh,
      mdiMagnify,
      mdiChevronDown,
      mdiPlus,
      mdiMinus,
    };
  },
  computed: {
    ...mapGetters('dataResearch', ['getTimeline']),
    getPreparedTimeLine() {
      const timeLineFormats = {
        min: 'h:mm A - DD MMMM YYYY',
        hour: 'h A - DD MMMM YYYY',
        day: 'DD MMMM YYYY',
        month: 'MMMM YYYY',
      };
      return this.getTimeline[timelineEnum[this.select.value]]
        .reduce((acc, { time, value }) => ({
          ...acc,
          [moment.unix(time).format(timeLineFormats[this.select.value])]: value,
        }), {});
    },
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  watch: {
    getPreparedTimeLine: {
      handler(newVal) {
        this.clearSVG(newVal);
      },
      deep: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.clearSVG(this.getPreparedTimeLine);
    });
  },
  methods: {
    setTimePeriod(item) {
      this.select = item;
    },
    plusScale() {
      if (this.numberInTimeline < 10) {
        this.numberInTimeline = 5;
      } else {
        this.numberInTimeline -= 5;
      }
      this.clearSVG(this.getPreparedTimeLine);
    },
    minusScale() {
      if (this.numberInTimeline > 45) {
        this.numberInTimeline = 50;
      } else {
        this.numberInTimeline += 5;
      }
      this.clearSVG(this.getPreparedTimeLine);
    },
    refreshScale() {
      this.numberInTimeline = 25;
    },
    clearSVG(dataset) {
      d3.select('.block-tooltip')
        .nodes()
        .forEach((item) => {
          item.remove();
        });
      d3.selectAll('rect')
        .nodes()
        .forEach((item) => {
          item.remove();
        });
      if (this.$refs.chart) {
        this.renderSVG(dataset);
      } else {
        console.error('элемент для отрисовки таймлайна не найдет');
      }
    },
    renderSVG(dataset) {
      const marge = {
        top: 0, bottom: 0, left: 0, right: 0,
      };
      const svg = d3.select('.chart1');
      const width = this.$refs.chart.clientWidth;
      const height = this.$refs.chart.clientHeight;
      const g = svg
        .append('g')
        .attr('transform', `translate(${marge.top},${marge.left})`);
      let dataForSvg = [];
      dataForSvg = Object.keys(dataset).reduce((acc, dataItem) => [
        ...acc,
        {
          time: dataItem,
          value: dataset[dataItem],
        },
      ], []);
      dataForSvg = dataForSvg.slice(dataForSvg.length - this.numberInTimeline);
      let maxY = dataForSvg[0].value;
      dataForSvg.forEach((element) => {
        if (element.value > maxY) {
          maxY = element.value;
        }
      });

      const xScale = d3
        .scaleBand()
        .domain(d3.range(dataForSvg.length))
        .rangeRound([0, width - marge.left - marge.right]);

      const yScale = d3
        .scaleLinear()
        .domain([0, maxY])
        .range([height - marge.top - marge.bottom, 0]);

      for (let i = 0; i < 6; i += 1) {
        g.append('g')
          .append('line')
          .attr('class', 'grid-line-y')
          .attr('x1', 0)
          .attr('y1', ((height - marge.top - marge.bottom) / 5) * i)
          .attr('x2', width - marge.left - marge.right)
          .attr('y2', ((height - marge.top - marge.bottom) / 5) * i)
          .attr('stroke', this.theme.$secondary_border);
      }
      const gs = g.selectAll('.rect').data(dataForSvg).enter().append('g');
      const rectPadding = 10;

      const tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'block-tooltip')
        .style('position', 'absolute')
        .style('z-index', 10)
        .style('visibility', 'hidden')
        .text('Simple text');
      gs.append('rect')
        .attr('x', (d, i) => xScale(i) + rectPadding / 2)
        .attr('y', (d) => yScale(d.value))
        .attr('width', () => xScale.step() - rectPadding)
        .attr('height', (d) => height - marge.top - marge.bottom - yScale(d.value))
        .attr('fill', 'rgba(76, 217, 100, 0.7)')
        .on('mouseover', (d) => {
          tooltip.html(`Событий (${d.value})<br>${d.time}`);
          tooltip.style('display', 'block');
          return tooltip.style('visibility', 'visible');
        })
        .on('mousemove', () => tooltip
          .style('top', `${d3.event.pageY - 60}px`)
          .style('left', `${d3.event.pageX - 10}px`))
        .on('mouseout', () => tooltip.style('visibility', 'hidden'));
    },
  },
};
</script>

<!-- eslint-disable -->
<style lang="sass">
@import './../../sass/_colors'
.timeline
  padding: 0 30px
.select-wrap
  display: flex
  justify-content: space-between
  padding-top: 10px
  padding-bottom: 10px
  background-color: $main_bg !important
  .select
    max-width: 180px
    .v-select__selection
      color: $main_text !important
    .v-input__slot:before
      border-color: $main_text !important
    .v-input__append-inner
      margin-bottom: 5px
  .scale-btn
    .scale-btn-text
      text-transform: capitalize
      color: $main_text !important
      font-weight: normal
.v-list
  background-color: $main_bg !important
  .v-list-item
    background-color: $main_bg !important

.container-chart
  margin: auto
.block-tooltip
  pointer-events: none
  display: none
  padding: 6px
  background: #FFFFFF
  box-shadow: 0px 4px 6px rgba(142, 141, 158, 0.25), 0px 1px 2px rgba(142, 141, 158, 0.4)
  border-radius: 6px
</style>
