<template>
    <div
        class="timeline"
        :style="{background: theme.$main_bg, color: theme.$main_text}"
    >
      <div class="select-wrap p-5">
        <v-select
            v-model="select"
            :items="periodItemsSelect"
            class="select"
            item-text="text"
            item-value="value"
            label="Select"
            persistent-hint
            return-object
            single-line
        ></v-select>
      </div>
      <svg ref="chart" class="chart1" height="50" style="width: 100%"></svg>
      {{dataset}}
    </div>
</template>


<script>
import * as d3 from "d3";
import { mdiRefresh, mdiMagnify } from '@mdi/js'

export default {
  props: {
    data: [],
  },
  data () {
    return {
      search: {
        parametrs: {}
      },
      select: { text: 'Колонка (1 мин.)', value: 'min' },
      periodItemsSelect: [
        { text: 'Колонка (1 мин.)', value: 'min' },
        { text: 'Колонка (1 час)', value: 'hour' },
        { text: 'Колонка (1 день)', value: 'day' },
        { text: 'Колонка (1 месяц)', value: 'month' },
      ],
      mdiRefresh: mdiRefresh,
      mdiMagnify: mdiMagnify,
    }
  },
  computed: {
    theme () {
      return this.$store.getters.getTheme
    },
    dataset () {
      let periodMarker = 9999
      let datasetItem
      let dataset = []
      let currentPeriod
      let options = {};
      let deltaTime
      if (this.select.value === 'min') {
        options = {
          hour12: 'true',
          hour: 'numeric',
          minute: 'numeric',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        };
        deltaTime = 60
      } else if (this.select.value === 'hour') {
        options = {
          hour12: 'true',
          hour: 'numeric',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        };
        deltaTime = 3600
      } else if (this.select.value === 'day') {
        options = {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }
        deltaTime = 86400
      } else {
        options = {
          month: 'long',
          year: 'numeric'
        }
        deltaTime = 2592000
      }
      let date
      let newDate
      let newItemTime
      let firstMarker = 0
      
      this.data.forEach(item => {
        
        date = new Date(item._time*1000);
        currentPeriod = this.getTimePart(date)
        
        if (periodMarker !== currentPeriod) {
          if (firstMarker === 1) {
            while (periodMarker !== currentPeriod) {
              dataset.push(datasetItem)
              newItemTime += deltaTime;
              newDate = new Date(newItemTime*1000);
              periodMarker = this.getTimePart(newDate)
              console.log(periodMarker)
              console.log(currentPeriod)
              datasetItem = { time: newDate.toLocaleString("ru", options), value: 0 }
            }
          }
          
          if (firstMarker === 0) {
            firstMarker = 1
            dataset.push(datasetItem)
          }
          
          periodMarker = currentPeriod
          datasetItem = { time: date.toLocaleString("ru", options), value: 1 }
        } else {
          datasetItem.value++
        }
        newDate = date
        periodMarker = currentPeriod
        newItemTime = item._time
      })
      
      dataset.push(datasetItem)
      dataset.shift()
      dataset = dataset.slice(dataset.length - 50)
      if (dataset.length > 0) {
        this.clearSVG(dataset)
      }
      return null
    },
  },
  methods: {
    getTimePart(date) {
      let period
      if (this.select.value === 'min') {
        period = date.getMinutes()
      } else if (this.select.value === 'hour') {
        period = date.getHours()
      } else if (this.select.value === 'day') {
        period = date.getDate()
      } else {
        period = date.getMonth()
      }
      return period
    },
    clearSVG (dataset) {
      console.log(d3.select('.chart1').nodes())
      d3.selectAll('rect')
          .nodes()
          .forEach((item) => {
            console.log(item)
            item.remove()
          })
      this.renderSVG(dataset)
    },
    renderSVG (dataset) {
      let marge = { top: 0, bottom: 0, left: 0, right: 0 }
      let svg = d3.select('.chart1')
      let width = this.$refs.chart.clientWidth
      let height = this.$refs.chart.clientHeight
      let g = svg.append('g')
          .attr('transform', 'translate(' + marge.top + ',' + marge.left + ')')
      // console.log(g)
      // let dataset = [
      //   { time: '3.12', value: 12 },
      //   { time: '4.12', value: 22 },
      //   { time: '5.12', value: 34 },
      //   { time: '6.12', value: 41 },
      //   { time: '7.12', value: 56 },
      //   { time: '8.12', value: 34 },
      //   { time: '9.12', value: 23 },
      //   { time: '10.12', value: 43 },
      // ]
      let maxY = dataset[0].value
      dataset.forEach(element => {
        if (element.value > maxY) {
          maxY = element.value
        }
      });

      // x , y 方向绘制坐标轴
      let xScale = d3.scaleBand()
          .domain(d3.range(dataset.length))
          .rangeRound([0, width - marge.left - marge.right])
      let xAxis = d3.axisBottom(xScale)

      let yScale = d3.scaleLinear()
          .domain([0, maxY])
          .range([height - marge.top - marge.bottom, 0])
      let yAxis = d3.axisLeft(yScale)

      // g.append('g')
      //     .attr('transform', 'translate(' + 0 + ',' + (height - marge.top - marge.bottom) + ')')
      //     .call(xAxis)
      for (let i = 0; i < 6; i++) {
        g.append('g')
            .append('line')
            .attr('class', 'grid-line-y')
            .attr('x1', 0)
            .attr('y1', (height - marge.top - marge.bottom)/5*i)
            .attr('x2', width - marge.left - marge.right)
            .attr('y2', (height - marge.top - marge.bottom)/5*i)
            .attr('stroke', this.theme.$secondary_border)
      }


      // 给矩形和对应文字创建分组
      let gs = g.selectAll('.rect')
          .data(dataset)
          .enter()
          .append('g')
      // 绘制矩形
      let rectPadding = 10

      let tooltip = d3.select("body")
          .append("div")
          .attr("class", "block-tooltip")
          .style("position", "absolute")
          .style("z-index", 10)
          .style("visibility", "hidden")
          .text("Simple text");

      gs.append('rect')
          .attr('x', function (d, i) {
            return xScale(i) + rectPadding / 2
          })
          .attr('y', function (d) {
            return yScale(d.value)
          })
          .attr('width', function () {
            return xScale.step() - rectPadding
          })
          .attr('height', function (d) {
            return height - marge.top - marge.bottom - yScale(d.value)
          })
          .attr('fill', 'rgba(76, 217, 100, 0.7)')
          .on("mouseover", d => {tooltip.html( 'Событий (' + d.value + ')' + '<br>' + d.time ); return tooltip.style("visibility", "visible")})
          .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-60)+"px").style("left",(d3.event.pageX-10)+"px");})
          .on("mouseout", () => tooltip.style("visibility", "hidden"))

      // gs
      //     .selectAll(`g.tick`)
      //     .append('line')
      //     .attr('class', 'grid-line-y')
      //     .attr('x1', 0)
      //     .attr('y1', 0)
      //     .attr('x2', this.width)
      //     .attr('y2', 0)
      //     .attr('stroke', this.theme.$main_text)
      //     .style('opacity', 0.3)
    }
  },
  mounted() {
    // this.renderSVG()
  }
}


</script>

<style lang="scss" >

//@import '../../sass/reportsV2/newSearch.sass'
.timeline {
  padding: 0 30px;
}

.select-wrap {
  display: flex;
  flex-direction: row-reverse;
  .select {
    max-width: 180px;
    .v-input__append-inner {
      margin-bottom: 5px;
    }
  }
}

//.chart div {
//  font: 10px sans-serif;
//  background-color: steelblue;
//  text-align: right;
//  padding: 3px;
//  margin: 1px;
//  color: white;
//}
.container-chart {
  /*width: 50%;*/
  margin: auto;
}
.block-tooltip {
  padding: 6px;
  background: #FFFFFF;
  box-shadow: 0px 4px 6px rgba(142, 141, 158, 0.25), 0px 1px 2px rgba(142, 141, 158, 0.4);
  border-radius: 6px;
}
</style>