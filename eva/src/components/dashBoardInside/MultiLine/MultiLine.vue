<template>
  <div class="multiline-container pa-0">
    <div v-if="isNodata" class="nodata-block" v-text="message" />
    <div ref="legendContainer" class="legend">
      <div v-show="!isNodata" v-for="item in legendList" :key="item.name" class="legend-item">
        <div class="circle" :style="{ backgroundColor: item.color }" />
        <div class="text" :style="{ color: theme.$main_text }" v-text="item.name" />
      </div>
    </div>
    <div ref="svgContainer" v-show="!isNodata" class="svg-container" :data-status="change">
      <div class="graph-tooltip"/>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'dashMultiLine',
  props: {
    idFrom: String,
    idDashFrom: String,
    widthFrom: Number,
    heightFrom: Number,
    dataRestFrom: Array,
    dataModeFrom: Boolean,
    isFullScreen: Boolean,
    /** Props from Reports page. */
    dataReport: Boolean,
    activeElemFrom: String,
  },
  data: () => ({
    metrics: [],
    metricNames: [],
    isNodata: true,
    message: 'Нет данных для отображения',
    legendList: [],
    actions: [
      { name: 'click', capture: ['pointX', 'pointY'] },
      { name: 'select', capture: ['start', 'end'] },
    ],
    defaultBrushObj: {
      direction: 'right',
      mouseDown: false,
      startX: 0,
      endX: 0,
      selections: [],
    },
    svg: null,
    width: 0,
    height: 0,
    line: null,
    xAxis: null,
    xMetric: '',
    isTime: false,
    stringOX: false,
    isUnitedMode: false,
    secondTransf: 1,
    timeFormat: '',
    minX: 0,
    maxX: 0,
    xAxisCaptionRotate: 0,
    allLinesWithBreak: [],
    unitedBars: []
  }),
  computed: {
    id() {
      return this.idFrom
    },

    idDash() {
      return this.idDashFrom
    },

    theme() {
      return this.$store.getters.getTheme
    },

    legendColors() {
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
      ]
    },

    strokeWidth() {
      const { id, idDash } = this
      const { strokeWidth } = this.$store.getters.getOptions({ id, idDash })
      return strokeWidth ? Number(strokeWidth) : 1.5
    },

    change() {
      if (this.widthFrom && this.heightFrom && this.dataRestFrom.length !== 0) {
        this.setNoData(true)
        this.setLegendItems()
        if ((this.dataReport && this.id === this.activeElemFrom) || !this.dataReport) {
          this.getDataAsynchrony()
        } else this.clearSvgContainer()
      } else {
        this.setNoData(true)
      }
      return true
    },
  },
  watch: {
    metrics() {
      const { id, idDash, metrics } = this
      this.$store.commit('setMetricsMulti', { id, idDash, metrics })
    },
  },
  mounted() {
    const { id, idDash, actions } = this
    this.$store.commit('setActions', { id, idDash, actions })
  },
  methods: {
    async setLegendItems(items = []) {
      const list = items.map((name, i) => ({ name, color: this.legendColors[i] }))
      this.legendList = [...list]
    },

    setNoData(value = true) {
      this.isNodata = !!value
    },

    showErrorMessage(message = '') {
      this.message = message
      this.setNoData(true)
    },

    clearSvgContainer() {
      d3.select(this.$refs.svgContainer)
        .selectAll('svg')
        .nodes()
        .forEach((item) => item.remove())
      this.allLinesWithBreak = []
    },

    getDataAsynchrony() {
      if (this.dataRestFrom.error) {
        return this.showErrorMessage(this.dataRestFrom.error)
      }

      const firstDataRow = this.dataRestFrom[0]
      const firstDataRowKeys = Object.keys(firstDataRow)
      const rowValue = firstDataRow[firstDataRowKeys[0]]

      this.setNoData(false)

      const {
        metrics,
        united = false,
        stringOX = false,
        lastDot = false,
        isDataAlwaysShow = false,
        xAxisCaptionRotate = 0,
        barplotBarWidth = 0,
        timeFormat,
        yAxesBinding = { axesCount: 1, metrics: {}, metricTypes: {} },
      } = this.$store.getters.getOptions({ id: this.id, idDash: this.idDash })
      
      this.stringOX = stringOX

      if (!this.stringOX && (typeof rowValue !== 'number')) {
        return this.showErrorMessage('К сожалению, тип данных string не подходят к этому типу графика. Чтобы построить график, вы можете изменить значение "Ось X - строки" на "true" в настройках.')
      }
      if (this.stringOX) {
        this.isTime = false
      } else {
        this.isTime = rowValue > 1000000000 && rowValue < 2000000000
      }
      this.isUnitedMode = united
      this.timeFormat = timeFormat || '%Y-%m-%d %H:%M:%S'
      this.xAxisCaptionRotate = xAxisCaptionRotate

      const metricOptions = metrics ? [...metrics] : []

      const render = () => {
        this.renderSVG(
          lastDot,
          isDataAlwaysShow,
          barplotBarWidth,
          metricOptions,
          yAxesBinding
        )
      }

      if (this.legendList.length > 0) {
        return render()
      }

      const metricList = firstDataRowKeys.filter(
        (key) => key.indexOf('caption') === -1 && key.indexOf('annotation') === -1
      )

      if (metricList.length <= 0) {
        return this.showErrorMessage('Данные не подходят для построения графика')
      }

      this.metrics = [...metricList]
      metricList.splice(0, 1)
      this.metricNames = metricList

      this.setLegendItems(metricList).then(() => render())
    },

    setClick(point, actionName) {
      const { id, idDash } = this
      const store = this.$store
      const tokens = this.$store.getters.getTockens(this.idDash)

      for (const { elem, action, name, capture } of tokens) {
        if (elem === id && action === actionName) {
          const tocken = { name, action, capture }
          const values = {
            pointX: point.x,
            pointY: point.y,
            start: point[0],
            end: point[1],
          }
          const value = values[capture]
          
          tocken.filterParam = Object.keys(this.dataRestFrom[0])[0]
          this.$store.commit('setTocken', { tocken, value, idDash, store })
        }
      }

      const events = this.$store.getters.getEvents({
        idDash,
        element: id,
        event: 'onclick',
        partelement: 'point',
      })

      for (const event of events) {
        if (event.action === 'set') {
          this.$store.commit('letEventSet', { idDash, events })
        } else if (event.action === 'go' && actionName !== 'select') {
          this.$store.commit('letEventGo', { idDash, store, event, route: this.$router })
        }
      }
    },

    checkExtraDot() {
      const count = {}
      const value = []
      const nullArr = []

      Object.values(this.dataRestFrom).forEach((item) => {
        Object.keys(item).forEach((key, i) => {
          if (i !== 0) {
            if (!Number(item[key]) && item[key] !== 0) {
              if (!nullArr.includes(key)) nullArr.push(key)
            } else {
              count[key] = !count[key] ? 1 : count[key] + 1
            }
          }
        })
      })

      const filteredNullArr = nullArr.filter((item) => count[item] === 1)

      filteredNullArr.forEach((key) => {
        Object.values(this.dataRestFrom).forEach((item) => {
          if (Number(item[key]) || Number(item[key]) === 0) {
            value.push({ ...item, ...{ column: key } })
          }
        })
      })

      return value
    },

    createVerticalGridLines() {
      const lineClass = 'grid-line-x'

      this.svg
        .selectAll(`.${lineClass}`)
        .nodes()
        .forEach((item) => item.remove())

      this.xAxis
        .selectAll('g.tick')
        .append('line')
        .attr('class', lineClass)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', -(this.height - 20))
        .attr('stroke', this.theme.$main_text)
        .style('opacity', 0.3)
    },

    putLabelDot(x, attr, className, d, y, metricName, dot, elem, brushObj) {
      dot.setAttribute(attr, 'true')

      const text = this.svg
        .append('text')
        .text(d[metricName])
        .attr('class', className)
        .attr('transform', `translate(${x(d[this.xMetric] * this.secondTransf) - 5}, ${y})`)
        .attr('font-size', '11')
        .attr('text-anchor', 'end')
        .attr('fill', this.theme.$main_text)

      if (elem === 'line') {
        text
          .on('mouseover', () => {
            if (brushObj.mouseDown) brushObj.selectionMove()
          })
          .on('mousemove', () => {
            if (brushObj.mouseDown) brushObj.selectionMove()
          })
          .on('mouseup', () => {
            brushObj.selectionUp()
          })
      }
    },

    createAnnotationLine(x, data, annotationName, i, tooltip) {
      const group = this.svg.append('g').attr('class', 'vetical-line-group').style('opacity', 0.7)
      const xVal = data[this.xMetric] * this.secondTransf

      group
        .append('line')
        .attr('class', 'vetical-line')
        .attr('x1', x(xVal))
        .attr('y1', 20)
        .attr('x2', x(xVal))
        .attr('y2', this.height)
        .attr('xVal', xVal)
        .attr('stroke', this.legendColors[i])
        .attr('stroke-width', this.strokeWidth)

      const { width } = this

      group
        .append('circle')
        .attr('class', 'dot-vertical')
        .attr('cx', x(xVal))
        .attr('cy', 20)
        .attr('r', 2.5 * this.strokeWidth)
        .attr('xVal', xVal)
        .attr('fill', this.legendColors[i])
        .on('mouseenter', function () {
          const { offsetX, offsetY } = d3.event

          tooltip
            .html(`<p>${data[annotationName]}</p>`)
            .style('top', `${offsetY - 30}px`)
            .style('left', `${offsetX + 20}px`)
            .style('right', 'auto')
            .style('opacity', 1)
            .style('visibility', 'visible')

          if (offsetX + 100 > width) {
            tooltip.style('left', 'auto').style('right', `${width - offsetX + 110}px`)
          }
        })
        .on('mouseleave', () => {
          tooltip.style('opacity', 0).style('visibility', 'hidden')
        })
    },

    updateData(x, yValue, selectRange, id = -1) {
      const invertStart = x.invert(selectRange[0])
      const invertEnd = x.invert(selectRange[1])
      const range = this.isTime
        ? [
            parseInt(new Date(invertStart).getTime() / 1000),
            parseInt(new Date(invertEnd).getTime() / 1000),
          ]
        : [
            parseFloat(invertStart.toFixed(5)),
            parseFloat(invertEnd.toFixed(5))
          ]
      this.$emit("SetRange", {'range': range, 'xMetric': this.xMetric});
      this.setClick(range, 'select')
      // this.zoom(x, yValue, selectRange, id)
    },

    zoom(x, yValue, selectRange = [], id) {
      const [rangeStart, rangeEnd] = selectRange

      x.domain([x.invert(rangeStart), x.invert(rangeEnd)])

      if (this.isTime) {
        this.xAxis
          .transition()
          .duration(this.secondTransf)
          .call(
            d3.axisBottom(x)
              .tickFormat(d3.timeFormat(this.timeFormat))
              .tickValues(x.ticks().filter((item, i) => i % 2 === 0))
              .ticks(5)
          )
      } else {
        this.xAxis.transition().duration(1000).call(d3.axisBottom(x))
      }

      this.createVerticalGridLines()

      if (id === -1) {
        this.metricNames.forEach((item, i) => this.changeZoom(x, yValue, 1000, i))
      } else {
        this.changeZoom(x, yValue, 1000, id)
      }

      this.unitedBars.forEach(bar => {
        this.svg
          .select(`#${bar.id}`)
          .transition()
          .duration(1000)
          .attr('opacity', 0)
          .attr('visibility', 'hidden')
      })

      this.setXAxisCaptionsRotate()

      this.svg.on('dblclick', () => {
        if (this.isTime) {
          x.domain(d3.extent(this.dataRestFrom, (d) => new Date(d[this.xMetric] * this.secondTransf)))
          this.xAxis
            .transition()
            .duration(this.secondTransf)
            .call(
              d3.axisBottom(x)
                .tickFormat(d3.timeFormat(this.timeFormat))
                .tickValues(x.ticks().filter((item, i) => i % 2 === 0))
                .ticks(5)
            )
        } else {
          x.domain([this.minX, this.maxX])
          this.xAxis.transition().duration(1000).call(d3.axisBottom(x))
        }

        this.unitedBars.forEach(bar => {
          this.svg
            .select(`#${bar.id}`)
            .transition()
            .duration(1000)
            .attr('opacity', 1)
            .attr('visibility', 'visible')
        })

        this.createVerticalGridLines()
        this.setXAxisCaptionsRotate()

        this.metricNames.forEach((item, i) => this.changeZoom(x, yValue, 300, i))
      })
    },

    changeZoom(x, yValue, duration, i) {
      const { isUnitedMode, secondTransf, metricNames, xMetric } = this
      const lineChange = isUnitedMode ? this.line : this.line[i]

      const y = this.isUnitedMode ? yValue[i] : yValue

      if (this.allLinesWithBreak[i]) {
        this.allLinesWithBreak[i].forEach((lineItself, lineIndex) => {
          lineChange
            .select(`.line-${i}-${lineIndex}`)
            .transition()
            .duration(duration)
            .attr(
              'd',
              d3.line()
                .x((d) => x(d[xMetric] * secondTransf))
                .y((d) => (isUnitedMode ? y(d[metricNames[i]]) : y[i](d[metricNames[i]])))
            )
        })
      }

      const dotLabelPos = []
      let lastDotPos = null

      this.svg
        .selectAll(`.dot-${i}`)
        .transition()
        .duration(duration)
        .attr('cx', function (d) {
          const xVal = x(d[xMetric] * secondTransf)
          const yVal = isUnitedMode ? y(d[metricNames[i]]) : y[i](d[metricNames[i]])

          if (this.getAttribute('data-with-caption')) {
            dotLabelPos.push({ x: xVal, y: yVal })
          }

          if (this.getAttribute('data-last-dot')) {
            lastDotPos = { x: xVal, y: yVal }
          }

          return xVal
        })
        .attr('cy', (d) => (isUnitedMode ? y(d[metricNames[i]]) : y[i](d[metricNames[i]])))

      this.svg
        .selectAll(`.caption-dot-text-${metricNames[i]}`)
        .transition()
        .duration(duration)
        .attr(
          'transform',
          (d, i) => `translate(${dotLabelPos[i].x - 5}, ${dotLabelPos[i].y - 5})`
        )

      if (lastDotPos !== null) {
        this.svg
          .select(`.last-dot-text-${metricNames[i]}`)
          .transition()
          .duration(duration)
          .attr('transform', `translate(${lastDotPos.x - 5}, ${lastDotPos.y - 5})`)
      }

      const group = this.svg.selectAll('.vetical-line-group')

      group
        .selectAll('.vetical-line')
        .transition()
        .duration(duration)
        .attr('x1', function () {
          return x(this.getAttribute('xVal'))
        })
        .attr('x2', function () {
          return x(this.getAttribute('xVal'))
        })

      group
        .selectAll('.dot-vertical')
        .transition()
        .duration(duration)
        .attr('cx', function () {
          return x(this.getAttribute('xVal'))
        })
    },

    setXAxisCaptionsRotate() {
      const captions = this.xAxis.selectAll('text')

      switch (this.xAxisCaptionRotate) {
        case 45:
          captions
            .style('text-anchor', 'start')
            .attr('transform', `rotate(45)`)
          break
        case -45:
          captions
            .style('text-anchor', 'end')
            .attr('transform', `rotate(-45)`)
          break
        case 90:
          captions
            .style('text-anchor', 'start')
            .attr('transform', `rotate(90) translate(10, -12)`)
          break
        case -90:
          captions
            .style('text-anchor', 'end')
            .attr('transform', `rotate(-90) translate(-10, -13)`)
          break
      }

      const maxCaptionWidth = d3.max(
        captions.nodes().map(node => node.getBBox().width)
      )

      return maxCaptionWidth
    },

    renderSVG(isLastDotShow, isDataAlwaysShow, barplotBarWidth, metricOptions, yAxesBinding) {
      this.clearSvgContainer()

      const metricNamesCount = this.metricNames.length

      if (metricNamesCount <= 0) {
        return this.showErrorMessage(
          'Ни одной метрики не найдено. Проверьте корректность данных.'
        )
      }

      const { svgContainer, legendContainer } = this.$refs

      const legendContainerHeight = legendContainer.getBoundingClientRect().height
      const margin = { top: legendContainerHeight - 10, bottom: 20, left: 70, right: 50 }

      this.width = this.widthFrom - margin.left - margin.right - 20
      this.height = this.heightFrom - margin.top - margin.bottom - 50

      const xMetric = Object.keys(this.dataRestFrom[0])[0]
      this.xMetric = xMetric

      if (this.isTime) this.secondTransf = 1000

      const extentForX = this.isTime
        ? d3.extent(this.dataRestFrom.map(d => new Date(d[xMetric] * this.secondTransf)))
        : d3.extent(this.dataRestFrom.map(d => d[xMetric]))

      this.minX = this.isTime ? 0 : extentForX[0]
      this.maxX = this.isTime ? 0 : extentForX[1]

      let x;
      if (this.stringOX) {
        x = d3.scalePoint()
          .range([0, this.width])
          .domain(this.dataRestFrom.map(function(d) { return d.day; }));
      } else {
        x = this.isTime
            ? d3.scaleTime().range([0, this.width]).domain(extentForX)
            : d3.scaleLinear().range([0, this.width]).domain(extentForX)
      }
      
      const svgWidth = this.width + margin.left + margin.right
      const svgHeight = this.height + margin.top + margin.bottom + 10

      this.svg = d3
        .select(svgContainer)
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

      const clipPathID = this.isFullScreen ? `clip-${this.id}-full` : `clip-${this.id}`

      this.svg
        .append('defs')
        .append('clipPath')
        .attr('id', clipPathID)
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', this.width)
        .attr('height', this.height)

      this.xAxis = this.svg
        .append('g')
        .attr('class', `${this.isFullScreen ? 'xAxis-full' : 'xAxis'}`)
        .attr('transform', `translate(0, ${this.height})`)

      if (this.isTime) {
        let step = svgWidth < 500 ? 3 : 2
        if (svgWidth < 400) step = 4
        if (svgWidth < 300) step = 5
        if (svgWidth < 250) step = 6
        this.xAxis.call(
          d3.axisBottom(x)
            .tickFormat(d3.timeFormat(this.timeFormat))
            .tickValues(x.ticks().filter((item, i) => i % step === 0))
        )
      } else this.xAxis.call(d3.axisBottom(x))

      const maxXAxisCaptionWidth = this.setXAxisCaptionsRotate()

      if (this.xAxisCaptionRotate !== 0) {
        if ([90, -90].includes(this.xAxisCaptionRotate)) {
          this.height = this.height - maxXAxisCaptionWidth + 10
        }
        if ([45, -45].includes(this.xAxisCaptionRotate)) {
          this.height = this.height - maxXAxisCaptionWidth + 40
        }
        this.xAxis.attr('transform', `translate(0, ${this.height})`)
      }

      this.line = this.isUnitedMode ? this.svg.append('g').attr('clip-path', `url(#${clipPathID})`) : []

      this.createVerticalGridLines()

      const tooltip = d3.select(svgContainer).select('.graph-tooltip')
      const [tooltipBlock] = tooltip.nodes()

      const lineDot = this.svg
        .append('g')
        .append('line')
        .attr('class', 'line-dot')
        .attr('x1', 0)
        .attr('y1', 20)
        .attr('x2', 0)
        .attr('y2', this.height)
        .attr('opacity', 0)
        .attr('stroke', this.theme.$main_text)
        .attr('stroke-dasharray', '3 3')

      const putLabel = (...args) => this.putLabelDot(x, ...args)
      const createAnnotation = (...args) => this.createAnnotationLine(x, ...args)

      const { svg, isTime, width, height, secondTransf } = this
      const extraDot = this.checkExtraDot()

      const annotationList = Object.keys(this.dataRestFrom[0]).filter(
        (item) => item.indexOf('annotation') !== -1
      )

      const dataRestLength = this.dataRestFrom.length
      const minMetricsValues = this.metricNames.map((item) => d3.min(this.dataRestFrom, (d) => d[item]))
      const maxMetricsValues = this.metricNames.map((item) => d3.max(this.dataRestFrom, (d) => d[item]))

      const dataRest = [...this.dataRestFrom]

      if (this.isUnitedMode) {
        const yScales = []
        const mustSee = []
        const brushObj = { ...this.defaultBrushObj }

        const bars = []
        
        let numberLeft = 0
        let numberRight = 0
        this.metricNames.forEach((metricName, metricIndex) => {
          const minVal = minMetricsValues[metricIndex]
          const maxVal = maxMetricsValues[metricIndex]

          const extra = (val) => Math.abs(val * 10 / 100)

          const yScale = d3
            .scaleLinear()
            .range([this.height, 20])
            .domain([minVal - extra(minVal), maxVal + extra(maxVal)])
          
          yScales.push(yScale)

          const yAxisClass = `yAxis-${metricName}`


          let yDomainArr = [
            Math.round(minVal - extra(minVal)),
            Math.round((maxVal - minVal + 2*extra(maxVal))/3 + minVal - extra(minVal)),
            Math.round((maxVal - minVal + 2*extra(maxVal))/3*2 + minVal - extra(minVal)),
            Math.round(maxVal + extra(maxVal))
          ]
          let yRangeArr = [this.height, (this.height-20)/3*2+20, (this.height-20)/3+20, 20]

          let yScal = d3.scaleOrdinal()
              .domain(yDomainArr)
              .range(yRangeArr);
          

          if (yAxesBinding.axesCount === 1 || yAxesBinding.metrics[metricName] === 'left') {
            let translateY
            if (numberLeft === 0) {
              translateY = 0
            } else if (numberLeft % 2 !== 0) {
              translateY = ((numberLeft+1)/2)*10
            } else {
              translateY = -(numberLeft/2)*10
            }
            this.svg.append('g')
                .attr('transform', 'translate(0, ' + translateY + ')')
                .attr('class', yAxisClass)
                .call(d3.axisLeft(yScal));
            if (numberLeft !== 0) {
              this.svg
                  .selectAll(`g.${yAxisClass} g.tick line`)
                  .style('visibility', 'hidden')
              this.svg.selectAll(`g.${yAxisClass} .domain`).style('visibility', 'hidden')
            } else {
              this.svg
                  .selectAll(`g.${yAxisClass} g.tick`)
                  .append('line')
                  .attr('class', 'grid-line-y')
                  .attr('x1', 0)
                  .attr('y1', 0)
                  .attr('x2', this.width)
                  .attr('y2', 0)
                  .attr('stroke', this.theme.$main_text)
                  .style('opacity', 0.3)
            }
            numberLeft++
          } else {
            let translateY
            if (numberRight === 0) {
              translateY = 0
            } else if (numberRight % 2 !== 0) {
              translateY = ((numberRight+1)/2)*10
            } else {
              translateY = -(numberRight/2)*10
            }
            this.svg.append('g')
                .attr('transform', `translate( ${this.width}, ${translateY})`)
                .attr('class', yAxisClass)
                .call(d3.axisRight(yScal));
            if (numberRight !== 0) {
              this.svg
                  .selectAll(`g.${yAxisClass} g.tick line`)
                  .style('visibility', 'hidden')
              this.svg.selectAll(`g.${yAxisClass} .domain`).style('visibility', 'hidden')
            } else {
              this.svg
                  .selectAll(`g.${yAxisClass} g.tick`)
                  .append('line')
                  .attr('class', 'grid-line-y')
                  .attr('x1', 0)
                  .attr('y1', 0)
                  .attr('x2', -this.width)
                  .attr('y2', 0)
                  .attr('stroke', this.theme.$main_text)
                  .style('opacity', 0.3)
            }
            numberRight++
          }

          this.svg
            .selectAll(`g.${yAxisClass} g.tick text`)
            .attr('fill', this.legendColors[metricIndex])

          if (yAxesBinding.metricTypes[metricName] === 'barplot') {
            const thisMetrics = [...this.metrics]
            let allDotHover = []

            const barPostfix = this.isFullScreen ? '-full' : ''
            const getBarID = (i) => `bar--${metricName}--${i}--${barPostfix}`

            this.line
              .selectAll(`bar-${metricName}`)
              .data(this.dataRestFrom)
              .enter()
              .append('rect')
              .attr('id', (d, i) => getBarID(i))
              .attr('x', (d) => this.isTime? x(d[xMetric] * this.secondTransf) : x(d[xMetric]))
              .attr('y', (d) => yScale(d[metricName]))
              .attr('width', () => {
                if (!barplotBarWidth || barplotBarWidth <= 0) {
                  return d3.scaleBand()
                        .range([0, this.width])
                        .domain(this.dataRestFrom.map((d) => this.isTime? d[xMetric] * this.secondTransf : d[xMetric]))
                        .bandwidth()
                }
                return barplotBarWidth
              })
              .attr('height', function (d, j) {
                const setLabel = (attr, classText, metricText) => {
                  putLabel(
                    attr,
                    classText,
                    d,
                    yScale(d[metricName]) - 5,
                    metricText,
                    this,
                    'bar'
                  )
                }

                if (isLastDotShow && j === dataRest.length - 1) {
                  setLabel('data-last-bar', 'last-bar-text', metricName)
                }

                const h = height - yScale(d[metricName])
                bars.push({ id: getBarID(j), height: h })

                return h
              })
              .attr('transform', function (d, j) {
                const w = this.width.baseVal.value
                let translate = j === 0 ? 0 : w / 2
                if (j === dataRest.length - 1) translate = w
                return `translate(-${translate}, 0)`
              })
              .attr('fill', this.legendColors[metricIndex])
              .on('mouseenter', function (d) {
                const date = new Date(d[xMetric] * secondTransf)

                const xVal = !isTime
                  ? d[xMetric]
                  : `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`

                tooltip.html(
                  thisMetrics.reduce((prev, cur) => {
                    const value = cur === xMetric ? xVal : d[cur]
                    return prev + `<p><span>${cur}</span>: ${value}</p>`
                  }, '')
                )

                const rectX = +d3.select(this).attr('x')

                allDotHover = svg
                  .selectAll('circle')
                  .nodes()
                  .filter((dot) => {
                    if (
                      dot.classList.contains('dot') &&
                      dot['__data__'][xMetric] === d[xMetric] * secondTransf &&
                      dot['__data__'][dot.getAttribute('metric')] !== null
                    ) {
                      dot.style.opacity = 1
                      return dot
                    }
                  })

                lineDot.attr('x1', rectX).attr('x2', rectX).attr('opacity', 0.7)
                tooltip.style('opacity', 1).style('visibility', 'visible')
              })
              .on('mousemove', function () {
                const { offsetX, offsetY } = d3.event
                const tooltipWidth = tooltipBlock.offsetWidth
                const tooltipHalfHeight = tooltipBlock.offsetHeight / 2

                if (brushObj.mouseDown) brushObj.selectionMove()

                let left = offsetX + 20
                let top = offsetY - tooltipHalfHeight

                if (left + tooltipWidth > width + margin.left + 15) {
                  left = left - tooltipWidth - 20
                }

                if (top + tooltipHalfHeight > height) {
                  top = top - tooltipHalfHeight
                }

                tooltip.style('left', `${left}px`).style('top', `${top}px`)
              })
              .on('mouseleave', function () {
                if (!this.getAttribute('data-last-bar')) {
                  allDotHover.forEach((dot) => {
                    if (extraDot.indexOf(dot['__data__']) === -1) {
                      dot.style.opacity = 0
                    }
                    if (dot.getAttribute('data-with-caption')) {
                      dot.style.opacity = 1
                    }
                  })
                }
                lineDot.attr('opacity', 0)
                tooltip.style('opacity', 0).style('visibility', 'hidden')
              })
          }

          if (yAxesBinding.metricTypes[metricName] === 'linechart' || yAxesBinding.metricTypes[metricName] === undefined) {
            const linesWithBreak = []
            let dotDate = null
            let nullValue = -1
            let allDotHover = []
            let onelinesWithBreak = []

            extraDot.forEach((item, j) => {
              if (metricName === item.column) nullValue = j
            })

            if (nullValue !== -1) {
              dotDate = [extraDot[nullValue]]
            } else {
              this.dataRestFrom.forEach((line) => {
                if (!Number(line[metricName]) && line[metricName] !== 0) {
                  if (onelinesWithBreak.length === 1) mustSee.push(onelinesWithBreak[0])
                  linesWithBreak.push(onelinesWithBreak)
                  onelinesWithBreak = []
                } else {
                  onelinesWithBreak.push(line)
                }
              })

              if (onelinesWithBreak.length === 1) mustSee.push(onelinesWithBreak[0])

              linesWithBreak.push(onelinesWithBreak)
              this.allLinesWithBreak.push(linesWithBreak)

              linesWithBreak.forEach((lineItself, lineIndex) => {
                this.line
                  .append('path')
                  .datum(lineItself)
                  .attr('class', `line-${metricIndex}-${lineIndex}`)
                  .attr('fill', 'none')
                  .attr('stroke', this.legendColors[metricIndex])
                  .attr('stroke-width', this.strokeWidth)
                  .attr(
                    'd',
                    d3.line()
                      .x((d) => this.isTime? x(d[xMetric] * this.secondTransf) : x(d[xMetric]))
                      .y((d) => yScale(d[metricName]))
                  )
              })

              dotDate = this.dataRestFrom
            }

            this.svg
              .append('g')
              .selectAll('dot')
              .data(dotDate)
              .enter()
              .append('circle')
              .attr('class', `dot dot-${metricIndex}`)
              .attr('cx', (d) => this.isTime? x(d[xMetric] * this.secondTransf) : x(d[xMetric]))
              .attr('cy', (d) => yScale(d[metricName]))
              .attr('r', 5)
              .attr('metric', metricName)
              .attr('fill', this.legendColors[metricIndex])
              .style('opacity', function (d, j) {
                let opacity = nullValue !== -1 ? 1 : 0

                mustSee.forEach((item) => {
                  if (item[metricName] == d[metricName]) opacity = 1
                })

                const setLabel = (attr, classText, metricText) => {
                  putLabel(
                    attr,
                    classText,
                    d,
                    yScale(d[metricName]) - 5,
                    metricText,
                    this,
                    'line',
                    brushObj
                  )
                }

                if (isDataAlwaysShow && isDataAlwaysShow === 'data') {
                  opacity = 1
                  setLabel('data-always-dot', `data-always-dot-text-${metricName}`, metricName)
                }

                if (isDataAlwaysShow && isDataAlwaysShow === 'caption') {
                  opacity = 1
                  setLabel('data-always-dot', `data-always-dot-text-${metricName}`, `_${metricName}_caption`)
                }

                if (isLastDotShow && j === dataRestLength - 1) {
                  opacity = 1
                  setLabel('data-last-dot', `last-dot-text-${metricName}`, metricName)
                }

                annotationList.forEach((annotation, i) => {
                  if (d[annotation]) {
                    createAnnotation(d, annotation, metricNamesCount + 1 + i, tooltip)
                  }
                })

                return opacity
              })
              .on('click', (d) => this.setClick({ x: d[xMetric], y: d[metricName] }, 'click'))
              .on('mouseup', () => brushObj.selectionUp())
              .on('mousedown', () => brushObj.selectionDown())
              .on('mouseenter', function (d) {
                const date = new Date(d[xMetric] * secondTransf)
                const day = date.getDate()
                const month = date.getMonth()
                const year = date.getFullYear()

                const xVal = isTime ? `${day}-${month + 1}-${year}` : d[xMetric]

                tooltip.html(
                  Object.keys(d).reduce((prev, cur) => {
                    let value = ''
                    if (cur === xMetric) value = xVal
                    else if (cur.indexOf('annotation') === -1) value = d[cur]
                    return prev + `<p><span>${cur}</span>: ${value}</p>`
                  }, '')
                )

                const cx = d3.select(this).attr('cx')
                const cy = d3.select(this).attr('cy')

                const [mouseX, mouseY] = d3.mouse(this)
                const diffX = Math.ceil(mouseX) - d3.event.offsetX
                const diffY = Math.ceil(mouseY) - d3.event.offsetY

                const tooltipWidth = tooltipBlock.offsetWidth
                const tooltipHalfHeight = tooltipBlock.offsetHeight / 2

                let left = cx - diffX + 20
                let top = cy - diffY - tooltipHalfHeight

                if (left + tooltipWidth > width - diffX) {
                  left = left - tooltipWidth - 25
                }

                if (top + tooltipHalfHeight > height) {
                  top = top - tooltipHalfHeight
                }

                tooltip.style('left', `${left}px`).style('top', `${top}px`)

                allDotHover = svg
                  .selectAll('circle')
                  .nodes()
                  .filter((dot) => {
                    if (
                      dot.classList.contains('dot') &&
                      dot['__data__'][dot.getAttribute('metric')] !== null &&
                      dot.getAttribute('cx') === x(d[xMetric] * secondTransf)
                    ) {
                      dot.style.opacity = 1
                      return dot
                    }
                  })

                this.style.opacity = 1
                lineDot.attr('x1', cx).attr('x2', cx).attr('opacity', 0.7)
                tooltip.style('opacity', 1).style('visibility', 'visible')
              })
              .on('mousemove', () => {
                if (brushObj.mouseDown) brushObj.selectionMove()
              })
              .on('mouseleave', function (d) {
                let opacity = 1

                if (!this.getAttribute('data-last-dot')) {
                  allDotHover.forEach((dot) => {
                    if (extraDot.indexOf(dot['__data__']) === -1) {
                      dot.style.opacity = 0
                    }
                    if (dot.getAttribute('data-with-caption') || dot.getAttribute('data-always-dot')) {
                      dot.style.opacity = 1
                    }
                  })
                  opacity = nullValue === -1 ? 0 : opacity
                }

                if (
                  this.getAttribute('data-with-caption') ||
                  this.getAttribute('data-always-dot')
                ) opacity = 1

                mustSee.forEach((item) => {
                  if (item[metricName] === d[metricName]) opacity = 1
                })

                this.style.opacity = opacity
                lineDot.attr('opacity', 0)
                tooltip.style('opacity', 0).style('visibility', 'hidden')
              })
          }
        })

        const sortedBars = bars.sort((a, b) => a.height - b.height)
        sortedBars.reverse().forEach(item => {
          this.svg
            .append('use')
            .attr('xlink:href',`#${item.id}`)
        })

        this.unitedBars = [...sortedBars]

        const brush = this.line.append('g').attr('class', 'brush')

        brush
          .append('rect')
          .attr('class', 'overlay')
          .attr('x', 0)
          .attr('y', 20)
          .attr('width', this.width)
          .attr('height', this.height - 20)
          .attr('fill', 'none')
          .attr('pointer-events', 'all')
          .on('mouseup', () => brushObj.selectionUp())
          .on('mousedown', () => brushObj.selectionDown())
          .on('mousemove', () => brushObj.selectionMove())

        brushObj.selectionDown = () => {
          brushObj.mouseDown = true
          brushObj.clearBrush()
          brushObj.startX = d3.event.offsetX - 70
          brush
            .append('rect')
            .attr('class', 'selection')
            .attr('x', brushObj.startX)
            .attr('y', 20)
            .attr('width', 0)
            .attr('height', this.height - 20)
            .attr('fill', this.theme.$accent_ui_color)
            .style('opacity', 0.3)
            .on('mouseup', () => brushObj.selectionUp())
            .on('mousemove', () => brushObj.selectionMove())
        }

        brushObj.selectionUp = () => {
          brushObj.mouseDown = false

          if (brushObj.direction === 'left') {
            const change = brushObj.startX
            brushObj.startX = brushObj.endX
            brushObj.endX = change
          }

          if (brush.select(`.selection`).attr('width') > 5) {
            this.updateData(x, yScales, [brushObj.startX, brushObj.endX])
          }

          brushObj.clearBrush()
        }

        brushObj.selectionMove = () => {
          if (brushObj.mouseDown) {
            const startX = brushObj.startX
            const offsetX = d3.event.offsetX - 70
            const selectWidth = offsetX - startX
            const isWidthPositive = selectWidth > 0

            brushObj.direction = isWidthPositive ? 'right' : 'left'
            brushObj.endX = isWidthPositive ? offsetX : startX + selectWidth

            if (isWidthPositive) {
              brush
                .select('.selection')
                .attr('width', selectWidth)
            } else {
              brush
                .select(`.selection`)
                .attr('x', startX + selectWidth)
                .attr('width', -selectWidth)
            }
          }
        }

        brushObj.clearBrush = () => {
          brushObj.selections = brush.selectAll(`.selection`).nodes()
          brushObj.selections.forEach((sel) => sel.remove())
        }
        return null
      }

      const step = ((this.height - 20) / metricNamesCount).toFixed(5)
      const startY = [20]

      annotationList.forEach((annotation, i) => {
        this.dataRestFrom.forEach((data) => {
          if (data[annotation]) {
            createAnnotation(data, annotation, metricNamesCount + 1 + i, tooltip)
          }
        })
      })

      const y = []
      let maxLength = 0

      this.metricNames.forEach((metric, metricIndex) => {
        if (metricIndex > 0) {
          this.svg
            .append('g')
            .append('line')
            .attr('x1', 0)
            .attr('y1', step * metricIndex + 20)
            .attr('x2', this.width)
            .attr('y2', step * metricIndex + 20)
            .attr('opacity', 0.3)
            .attr('stroke', this.theme.$main_text)
        }

        const foundOptions = metricOptions.find(o => o.name === metric)
        const options = foundOptions ? foundOptions : {}
        const optionsKeys = Object.keys(options)

        const minY = optionsKeys.length === 0
          ? minMetricsValues[metricIndex]
          : options.manual
            ? minMetricsValues[metricIndex]
            : parseFloat(options.lowborder)

        const maxY = optionsKeys.length === 0
          ? maxMetricsValues[metricIndex]
          : options.manual
            ? maxMetricsValues[metricIndex]
            : parseFloat(options.upborder)

        const maxYTop = maxY + 0.1 * Math.abs(maxY)
        const minYBottom = minY - 0.1 * Math.abs(minY)

        const yRangeStart = metricIndex === 0
          ? parseFloat(step) + 20
          : parseFloat(step * (metricIndex + 1)) + 20

        y.push(
          d3.scaleLinear()
            .domain([minYBottom, maxYTop])
            .range([yRangeStart, startY[metricIndex]])
        )

        const tickValues = minYBottom === maxYTop
          ? [minYBottom]
          : minYBottom < 0
            ? [minYBottom, 0, maxYTop]
            : [minYBottom, maxYTop]

        const metricUnits = this.$store.getters.getMetricsMulti({
          id: this.id,
          idDash: this.idDash
        })

        this.svg
          .append('g')
          .attr('class', `yAxis-${metricIndex}`)
          .call(
            d3.axisLeft(y[metricIndex])
              .tickValues(tickValues)
              .tickFormat(
                (x) => `${x} ${metricUnits[metricIndex] ? metricUnits[metricIndex].units : ''}`
              )
          )
          .selectAll('.tick > text')
          .each(function () {
            const w = this.getBBox().width
            if (w > maxLength) maxLength = w
          })

        startY.push(yRangeStart)

        const textNodes = this.svg.selectAll(`.yAxis-${metricIndex} .tick`).select('text').nodes()
        textNodes.forEach((node, i) => {
          const value = textNodes.length > 1
            ? i === 0
              ? -5
              : (i === textNodes.length - 1) ? 5 : 0
            : 5
          node.style.transform = `translateY(${value}px)`
        })

        this.line.push(this.svg.append('g').attr('clip-path', `url(#${clipPathID})`))

        // if (optionsKeys.length === 0 || options.type === 'Line chart') {
          const mustSee = []
          let dotDate = null
          let onelinesWithBreak = []
          let allDotHover = []

          const linesWithBreak = []
          const brushObj = { ...this.defaultBrushObj }

          let nullValue = -1

          extraDot.forEach((item, j) => {
            if (metric === item.column) nullValue = j
          })

          const cutData = this.dataRestFrom.filter((item) => item[metric] >= minY && item[metric] <= maxY)

          if (nullValue !== -1) {
            dotDate = [extraDot[nullValue]]
          } else {
            if (optionsKeys.length === 0 || options.type === 'Line chart' || !options.type) {
              cutData.forEach((line) => {
                if (!Number(line[metric]) && line[metric] !== 0) {
                  if (onelinesWithBreak.length === 1) mustSee.push(onelinesWithBreak[0])
                  linesWithBreak.push(onelinesWithBreak)
                  onelinesWithBreak = []
                } else {
                  onelinesWithBreak.push(line)
                }
              })

              if (onelinesWithBreak.length === 1) mustSee.push(onelinesWithBreak[0])

              linesWithBreak.push(onelinesWithBreak)
              this.allLinesWithBreak[metricIndex] = linesWithBreak
              linesWithBreak.forEach((lineItself, lineIndex) => {
                this.line[metricIndex]
                    .append('path')
                    .datum(lineItself)
                    .attr('class', `line-${metricIndex}-${lineIndex}`)
                    .attr('fill', 'none')
                    .attr('stroke', this.legendColors[metricIndex])
                    .attr('stroke-width', this.strokeWidth)
                    .attr(
                        'd',
                        d3.line()
                            .x((d) => this.isTime? x(d[xMetric] * this.secondTransf) : x(d[xMetric]))
                            .y((d) => y[metricIndex](d[metric]))
                    )
              })
              if (minY < 0) {
                this.line[metricIndex]
                  .append('line')
                  .attr('class', `zero-line-${metricIndex}`)
                  .attr('x1', 0)
                  .attr('y1', y[metricIndex](0))
                  .attr('x2', this.width)
                  .attr('y2', y[metricIndex](0))
                  .attr('opacity', '.3')
                  .attr('stroke', this.theme.$main_text)
                  .attr('stroke-dasharray', '3 3')
              }
            }

            dotDate = cutData
          }

          const thisMetrics = [...this.metrics]

          this.svg
            .append('g')
            .selectAll('dot')
            .data(dotDate)
            .enter()
            .append('circle')
            .attr('class', `dot dot-${metricIndex}`)
            .attr('cx', (d) => this.isTime? x(d[xMetric] * this.secondTransf) : x(d[xMetric]))
            .attr('cy', (d) => y[metricIndex](d[metric]))
            .attr('r', 5)
            .attr('metric', metric)
            .attr('fill', this.legendColors[metricIndex])
            .style('opacity', function (d, j) {
              let opacity = nullValue !== -1 ? 1 : 0

              mustSee.forEach((item) => {
                if (item[metric] === d[metric]) opacity = 1
              })

              const setLabel = (attr, classText, metricText) => {
                putLabel(
                  attr,
                  classText,
                  d,
                  y[metricIndex](d[metric]) - 5,
                  metricText,
                  this,
                  'line',
                  brushObj
                )
              }

              if (isDataAlwaysShow && isDataAlwaysShow === 'data') {
                opacity = 1
                setLabel('data-always-dot', `data-always-dot-text-${metric}`, metric)
              }

              if (isDataAlwaysShow && isDataAlwaysShow === 'caption') {
                opacity = 1
                setLabel('data-always-dot', `data-always-dot-text-${metric}`, `_${metric}_caption`)
              }

              if (isLastDotShow && j === dataRestLength - 1) {
                opacity = 1
                setLabel('data-last-dot', `last-dot-text-${metric}`, metric)
              }

              return opacity
            })
            .on('click', (d) => this.setClick({ x: d[xMetric], y: d[metric] }, 'click'))
            .on('mouseup', () => brushObj.selectionUp())
            .on('mousedown', () => brushObj.selectionDown())
            .on('mouseenter', function (d) {
              const xVal = isTime
                ? (() => {
                  const date = new Date(d[xMetric] * secondTransf)
                  const day = date.getDate()
                  const month = date.getMonth()
                  const year = date.getFullYear()
                  const hours = ('0' + date.getHours()).substr(-2)
                  const minutes = ('0' + date.getMinutes()).substr(-2)
                  const seconds = ('0' + date.getSeconds()).substr(-2)
                  return `${day}-${month + 1}-${year} ${hours}:${minutes}:${seconds}`
                })()
                : d[xMetric]

              tooltip.html(
                thisMetrics.reduce((prev, cur) => {
                  const value = cur === xMetric ? xVal : d[cur]
                  return prev + `<p><span>${cur}</span>: ${value}</p>`
                }, '')
              )

              const cx = d3.select(this).attr('cx')
              const cy = d3.select(this).attr('cy')

              const [mouseX, mouseY] = d3.mouse(this)
              const diffX = Math.ceil(mouseX) - d3.event.offsetX
              const diffY = Math.ceil(mouseY) - d3.event.offsetY

              const tooltipWidth = tooltipBlock.offsetWidth
              const tooltipHalfHeight = tooltipBlock.offsetHeight / 2

              let left = cx - diffX + 20
              let top = cy - diffY - tooltipHalfHeight

              if (left + tooltipWidth > width - diffX) {
                left = left - tooltipWidth - 25
              }

              if (top + tooltipHalfHeight > height) {
                top = top - tooltipHalfHeight
              }

              tooltip.style('left', `${left}px`).style('top', `${top}px`)

              allDotHover = svg
                .selectAll('circle')
                .nodes()
                .filter((dot) => {
                  if (
                    dot.classList.contains('dot') &&
                    dot['__data__'][dot.getAttribute('metric')] !== null &&
                    dot.getAttribute('cx') === x(d[xMetric] * secondTransf)
                  ) {
                    dot.style.opacity = 1
                    return dot
                  }
                })

              this.style.opacity = 1
              lineDot.attr('x1', cx).attr('x2', cx).attr('opacity', 0.7)
              tooltip.style('opacity', 1).style('visibility', 'visible')
            })
            .on('mousemove', () => {
              if (brushObj.mouseDown) brushObj.selectionMove()
            })
            .on('mouseleave', function (d) {
              let opacity = 1

              if (!this.getAttribute('data-last-dot')) {
                allDotHover.forEach((dot) => {
                  if (extraDot.indexOf(dot['__data__']) === -1) {
                    dot.style.opacity = 0
                  }
                  if (dot.getAttribute('data-with-caption') || dot.getAttribute('data-always-dot')) {
                    dot.style.opacity = 1
                  }
                })
                opacity = nullValue === -1 ? 0 : opacity
              }

              if (
                this.getAttribute('data-with-caption') ||
                this.getAttribute('data-always-dot')
              ) opacity = 1

              mustSee.forEach((item) => {
                if (item[metric] === d[metric]) opacity = 1
              })

              this.style.opacity = opacity
              lineDot.attr('opacity', 0)
              tooltip.style('opacity', 0).style('visibility', 'hidden')
            })

          const brush = this.line[metricIndex].append('g').attr('class', `brush-${metricIndex}`)

          if (metricIndex === 0) {
            brush
                .append('rect')
                .attr('class', `overlay-${metricIndex}`)
                .attr('x', 0)
                .attr('y', startY[metricIndex])
                .attr('width', this.width)
                .attr('height', this.height)
                .attr('fill', 'none')
                .attr('pointer-events', 'all')
                .on('mouseup', () => brushObj.selectionUp())
                .on('mousedown', () => brushObj.selectionDown())
                .on('mousemove', () => brushObj.selectionMove())

            brushObj.selectionDown = () => {
              brushObj.mouseDown = true
              brushObj.clearBrush()
              brushObj.startX = d3.event.offsetX - Math.ceil(maxLength)
              brush
                  .append('rect')
                  .attr('class', `selection-${metricIndex}`)
                  .attr('x', brushObj.startX)
                  .attr('y', startY[metricIndex])
                  .attr('width', 0)
                  .attr('height', this.height)
                  .attr('fill', this.theme.$accent_ui_color)
                  .style('opacity', 0.3)
                  .on('mouseup', () => brushObj.selectionUp())
                  .on('mousemove', () => brushObj.selectionMove())
            }
            brushObj.selectionUp = () => {
              brushObj.mouseDown = false

              if (brushObj.direction === 'left') {
                const change = brushObj.startX
                brushObj.startX = brushObj.endX
                brushObj.endX = change
              }

              if (brush.select(`.selection-${metricIndex}`).attr('width') > 5) {
                this.updateData(x, y, [brushObj.startX, brushObj.endX], metricIndex)
              }

              brushObj.clearBrush()
            }

            brushObj.selectionMove = () => {
              if (brushObj.mouseDown) {
                const startX = brushObj.startX
                const offsetX = d3.event.offsetX - Math.ceil(maxLength)
                const selectWidth = offsetX - startX
                const isWidthPositive = selectWidth > 0

                brushObj.direction = isWidthPositive ? 'right' : 'left'
                brushObj.endX = isWidthPositive ? offsetX : startX + selectWidth

                if (selectWidth > 0) {
                  brush
                      .select(`.selection-${metricIndex}`)
                      .attr('width', selectWidth)
                } else {
                  brush
                      .select(`.selection-${metricIndex}`)
                      .attr('x', startX + selectWidth)
                      .attr('width', -selectWidth)
                }
              }
            }

            brushObj.clearBrush = () => {
              brushObj.selections = brush.selectAll(`.selection-${metricIndex}`).nodes()
              brushObj.selections.forEach((sel) => sel.remove())
            }
          }



        // }

        if (options.type === 'Bar chart') {
          let allDotHover = []

          x = this.isTime
            ? d3.scaleTime()
                .range([0, this.width])
                .domain(d3.extent(this.dataRestFrom, (d) => new Date(d[xMetric] * this.secondTransf)))
            : d3.scaleBand()
                .range([0, this.width])
                .domain(this.dataRestFrom.map((d) => this.isTime? d[xMetric] * this.secondTransf : d[xMetric]))

          this.svg
            .append('g')
            .attr('transform', `translate(0, ${startY[metricIndex + 1]})`)
            .style('opacity', 0)
            .call(d3.axisBottom(x))

          const cutData = this.dataRestFrom.filter(
            (item) => item[options.name] >= minY && item[options.name] <= maxY
          )

          const thisMetrics = [...this.metrics]
          const isNegative = minY < 0

          this.line[metricIndex]
            .selectAll(`bar-${metricIndex}`)
            .data(cutData)
            .enter()
            .append('rect')
            .attr('x', (d) => this.isTime? x(d[xMetric] * this.secondTransf) : x(d[xMetric]))
            .attr('y', (d) => {
              if (isNegative) {
                const abs = Math.abs(y[metricIndex](d[options.name]) - y[metricIndex](0))
                return d[options.name] > 0 ? y[metricIndex](0) - abs : y[metricIndex](0)
              }
              return y[metricIndex](d[options.name])
            })
            .attr('fill', this.legendColors[metricIndex])
            .attr('width', () => {
              if (!barplotBarWidth || barplotBarWidth <= 0) {
                return d3.scaleBand()
                      .range([0, this.width])
                      .domain(this.dataRestFrom.map((d) => this.isTime? d[xMetric] * this.secondTransf : d[xMetric]))
                      .bandwidth()
              }
              return barplotBarWidth
            })
            .attr('height', function (d, j) {
              const setLabel = (attr, classText, metricText) => {
                putLabel(
                  attr,
                  classText,
                  d,
                  y[metricIndex](d[options.name]) - 5,
                  metricText,
                  this,
                  'bar'
                )
              }

              if (isLastDotShow && j === cutData.length - 1) {
                setLabel('data-last-bar', 'last-bar-text', options.name)
              }

              if (d[`_${options.name}_caption`]) {
                setLabel('data-with-caption', 'caption-bar-text', `_${options.name}_caption`)
              }

              if (d[options.name] === 0) return 0

              return isNegative
                ? Math.abs(y[metricIndex](d[options.name]) - y[metricIndex](0))
                : startY[metricIndex + 1] - y[metricIndex](d[options.name])
            })
            .attr('transform', function (d, j) {
              const w = this.width.baseVal.value
              let translate = j === 0 ? 0 : w / 2
              if (j === dataRest.length - 1) translate = w
              return `translate(-${translate}, 0)`
            })
            .on('click', (d) => this.setClick({ x: d[xMetric], y: d[options.name] }, 'click'))
            .on('mouseenter', function (d) {
              const date = new Date(d[xMetric] * secondTransf)

              const xVal = !isTime
                ? d[xMetric]
                : `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`

              tooltip.html(
                thisMetrics.reduce((prev, cur) => {
                  const value = cur === xMetric ? xVal : d[cur]
                  return prev + `<p><span>${cur}</span>: ${value}</p>`
                }, '')
              )

              const rectX = +d3.select(this).attr('x')

              allDotHover = svg
                .selectAll('circle')
                .nodes()
                .filter((dot) => {
                  if (
                    dot.classList.contains('dot') &&
                    dot['__data__'][xMetric] === d[xMetric] * secondTransf &&
                    dot['__data__'][dot.getAttribute('metric')] !== null
                  ) {
                    dot.style.opacity = 1
                    return dot
                  }
                })

              lineDot.attr('x1', rectX).attr('x2', rectX).attr('opacity', 0.7)
              tooltip.style('opacity', 1).style('visibility', 'visible')
            })
            .on('mousemove', function () {
              const { offsetX, offsetY } = d3.event
              const tooltipWidth = tooltipBlock.offsetWidth
              const tooltipHalfHeight = tooltipBlock.offsetHeight / 2

              let left = offsetX + 20
              let top = offsetY - tooltipHalfHeight

              if (left + tooltipWidth > width + maxLength + 15) {
                left = left - tooltipWidth - 20
              }

              if (top + tooltipHalfHeight > height) {
                top = top - tooltipHalfHeight
              }

              tooltip.style('left', `${left}px`).style('top', `${top}px`)
            })
            .on('mouseleave', function () {
              if (!this.getAttribute('data-last-bar')) {
                allDotHover.forEach((dot) => {
                  if (extraDot.indexOf(dot['__data__']) === -1) {
                    dot.style.opacity = 0
                  }
                  if (dot.getAttribute('data-with-caption')) {
                    dot.style.opacity = 1
                  }
                })
              }
              lineDot.attr('opacity', 0)
              tooltip.style('opacity', 0).style('visibility', 'hidden')
            })
        }
      })

      this.svg.attr('transform', `translate(${maxLength + 15}, ${margin.top})`)
    },
  },
}
</script>

<style lang="sass" scoped>
@import ./sass/MultiLine
</style>
