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
          @click="plusScale()"
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
          @click="minusScale()"
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
    {{ dataset }}
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

export default {
  props: {
    data: Array,
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
    theme() {
      return this.$store.getters.getTheme;
    },
    dataset() {
      let minTime = this.data[0]?._time;
      let maxTime = this.data[0]?._time;
      console.log(this.data);
      this.data.forEach((item) => {
        if (item._time < minTime) {
          minTime = item._time;
        }
        if (item._time > maxTime) {
          maxTime = item._time;
        }
      });
      let barTime = minTime;
      const dataset = {};
      let newDate;
      let datasetItemString;
      let deltaTime;
      let getActualLongData;
      if (this.select.value === 'min') {
        getActualLongData = this.getUntilMin;
        deltaTime = 60;
      } else if (this.select.value === 'hour') {
        getActualLongData = this.getUntilHours;
        deltaTime = 3600;
      } else if (this.select.value === 'day') {
        getActualLongData = this.getUntilDay;
        deltaTime = 86400;
      } else {
        getActualLongData = this.getUntilMonth;
        deltaTime = 2592000;
      }
      while (barTime < maxTime) {
        newDate = new Date(barTime * 1000);

        if (this.select.value === 'month') {
          const newDateMonth = newDate.getMonth();
          if (
            newDateMonth === 3
            || newDateMonth === 5
            || newDateMonth === 8
            || newDateMonth === 10
          ) {
            deltaTime = 2592000;
          }
          if (newDateMonth === 1 && newDate.getFullYear() % 4 === 0) {
            deltaTime = 2505600;
          }
          if (newDateMonth === 1 && newDate.getFullYear() % 4 !== 0) {
            deltaTime = 2419200;
          } else {
            deltaTime = 2678400;
          }
        }
        datasetItemString = getActualLongData(newDate);
        dataset[datasetItemString] = 0;
        barTime += deltaTime;
      }
      this.data.forEach((item) => {
        if (dataset[getActualLongData(item._time * 1000)] === undefined) {
          dataset[getActualLongData(item._time * 1000)] = 1;
        } else {
          dataset[getActualLongData(item._time * 1000)]++;
        }
      });
      if (Object.keys(dataset).length > 0) {
        for (
          let i = Object.keys(dataset).length;
          i < this.numberInTimeline;
          i++
        ) {
          dataset[`100${i}`] = 0;
        }
      }
      if (Object.keys(dataset).length > 0) {
        this.clearSVG(dataset);
      }
      return null;
    },
  },
  mounted() {
    // this.renderSVG()
  },
  methods: {
    setTimePeriod(item) {
      this.select = item;
    },
    getTimePart(date) {
      let period;
      if (this.select.value === 'min') {
        period = date.getMinutes();
      } else if (this.select.value === 'hour') {
        period = date.getHours();
      } else if (this.select.value === 'day') {
        period = date.getDate();
      } else {
        period = date.getMonth();
      }
      return period;
    },
    getUntilMin(date) {
      const options1 = {
        hour12: 'true',
        hour: 'numeric',
        minute: 'numeric',
      };
      const options2 = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      };
      return (
        `${new Intl.DateTimeFormat('ru', options1).format(date)
        } - ${
          new Intl.DateTimeFormat('ru', options2).format(date).slice(0, -3)}`
      );
    },
    getUntilHours(date) {
      const options1 = {
        hour12: 'true',
        hour: 'numeric',
      };
      const options2 = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      };
      return (
        `${new Intl.DateTimeFormat('ru', options1).format(date)
        } - ${
          new Intl.DateTimeFormat('ru', options2).format(date).slice(0, -3)}`
      );
    },
    getUntilDay(date) {
      const options = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      };
      return new Intl.DateTimeFormat('ru', options).format(date).slice(0, -3);
    },
    getUntilMonth(date) {
      const options = {
        month: 'long',
        year: 'numeric',
      };
      return new Intl.DateTimeFormat('ru', options).format(date).slice(0, -3);
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
      this.renderSVG(dataset);
    },
    plusScale() {
      if (this.numberInTimeline < 10) {
        this.numberInTimeline = 5;
      } else {
        this.numberInTimeline -= 5;
      }
    },
    minusScale() {
      if (this.numberInTimeline > 45) {
        this.numberInTimeline = 50;
      } else {
        this.numberInTimeline += 5;
      }
    },
    refreshScale() {
      this.numberInTimeline = 25;
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
      for (const dataItem in dataset) {
        dataForSvg.push({ time: dataItem, value: dataset[dataItem] });
      }
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

      for (let i = 0; i < 6; i++) {
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
          console.log(d);
          tooltip.html(`Событий (${d.value})` + `<br>${d.time}`);
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
      color: $main_text
    .v-input__slot:before
      border-color: $main_text
    .v-input__append-inner
      margin-bottom: 5px
  .scale-btn
    .scale-btn-text
      text-transform: capitalize
      color: $main_text
      font-weight: normal
.v-list
  background-color: $main_bg !important
  .v-list-item
    background-color: $main_bg
//.chart div {
//  font: 10px sans-serif;
//  background-color: steelblue;
//  text-align: right;
//  padding: 3px;
//  margin: 1px;
//  color: white;
//}
.container-chart
  /*width: 50%;*/
  margin: auto
.block-tooltip
  display: none
  padding: 6px
  background: #FFFFFF
  box-shadow: 0px 4px 6px rgba(142, 141, 158, 0.25), 0px 1px 2px rgba(142, 141, 158, 0.4)
  border-radius: 6px
</style>
