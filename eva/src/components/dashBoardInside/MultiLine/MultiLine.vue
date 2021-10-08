<template>
  <div class="multiline-container pa-0" :class="{ full: !dataModeFrom }">
    <div v-if="isNodata" class="nodata-block" v-text="message" />
    <div ref="legendContainer" class="legend">
      <div v-for="item in legendList" :key="item.name" class="legend-item">
        <div class="circle" :style="{ backgroundColor: item.color }" />
        <div class="text" :style="{ color: theme.$main_text }" v-text="item.name" />
      </div>
    </div>
    <div ref="svgContainer" class="svg-container" :data-status="change">
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
    /** Props from Reports page. */
    dataReport: Boolean,
    activeElemFrom: String,
  },
  data: () => ({
    metrics: [],
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
    }
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
        this.generateGraphLegend()
        if ((this.dataReport && this.id === this.activeElemFrom) || !this.dataReport) {
          this.getDataAsynchrony()
        } else this.clearSvgContainer()
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
    async generateGraphLegend(metricList = []) {
      const list = metricList.map((name, i) => ({ name, color: this.legendColors[i] }))
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
    },

    getDataAsynchrony() {
      if (this.dataRestFrom.error) {
        return this.showErrorMessage(this.dataRestFrom.error)
      }

      const firstDataRow = this.dataRestFrom[0]
      const firstDataRowKeys = Object.keys(firstDataRow)
      const rowValue = firstDataRow[firstDataRowKeys[0]]

      if (typeof rowValue !== 'number') {
        return this.showErrorMessage('К сожалению, данные не подходят к линейному графику')
      }

      this.setNoData(false)

      const {
        metrics,
        united = false,
        lastDot = false,
        isDataAlwaysShow = false,
        xAxisCaptionRotate = 0,
        barplotBarWidth = 0,
        timeFormat
      } = this.$store.getters.getOptions({ id: this.id, idDash: this.idDash })

      const render = () => {
        const isTime = rowValue > 1000000000 && rowValue < 2000000000
        const metricOptions = metrics ? [...metrics] : []
        this.renderSVG(
          isTime,
          united,
          lastDot,
          isDataAlwaysShow,
          xAxisCaptionRotate,
          barplotBarWidth,
          timeFormat,
          metricOptions
        )
      }

      if (this.legendList.length > 0) {
        return render()
      }

      const metricNames = firstDataRowKeys.filter(
        (key) => key.indexOf('caption') === -1 && key.indexOf('annotation') === -1
      )

      if (metricNames.length <= 0) {
        return this.showErrorMessage('Данные не подходят для построения графика')
      }

      this.metrics = [...metricNames]
      metricNames.splice(0, 1)
      this.generateGraphLegend(metricNames).then(() => render())
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

    checkExtraDot(data) {
      const count = {}
      const value = []
      const nullArr = []

      Object.values(data).forEach((item) => {
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

      if (filteredNullArr.length > 0) {
        filteredNullArr.forEach((key) => {
          Object.values(data).forEach((item) => {
            if (Number(item[key]) || Number(item[key]) === 0) {
              value.push({ ...item, ...{ column: key } })
            }
          })
        })
      }

      return value
    },

    createVerticalGridLines(svg, height) {
      const lineClass = 'grid-line-x'

      svg
        .selectAll(`.${lineClass}`)
        .nodes()
        .forEach((item) => item.remove())

      svg
        .selectAll('g.xAxis g.tick')
        .append('line')
        .attr('class', lineClass)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', -(height - 20))
        .attr('stroke', this.theme.$main_text)
        .style('opacity', 0.3)
    },

    renderSVG(isTime, isUnitedMode, isLastDotShow, isDataAlwaysShow, xAxisCaptionRotate, barplotBarWidth, timeFormat, metricOptions) {
      this.clearSvgContainer()

      const metricNames = [...this.metrics]
      metricNames.splice(0, 1)

      if (metricNames.length <= 0) {
        return this.showErrorMessage(
          'Ни одной метрики не найдено. Проверьте корректность данных.'
        )
      }

      const { svgContainer, legendContainer } = this.$refs

      const mTop = legendContainer.getBoundingClientRect().height - 10
      const margin = { top: mTop, bottom: 20, left: 70, right: 50 }
      const width = this.widthFrom - margin.left - margin.right - 20
      const height = this.heightFrom - margin.top - margin.bottom - 50

      const dataRest = [...this.dataRestFrom]
      // метрика времени (подразумеваем, что она первая по счету)
      const xMetric = Object.keys(dataRest[0])[0]

      const secondTransf = isTime ? 1000 : 1
      const extentForX = isTime
        ? d3.extent(dataRest, (d) => new Date(d[xMetric] * secondTransf))
        : d3.extent(dataRest.map((data) => data[xMetric]))

      const minX = isTime ? 0 : extentForX[0]
      const maxX = isTime ? 0 : extentForX[1]

      let x = isTime
        ? d3.scaleTime().range([0, width]).domain(extentForX)
        : d3.scaleLinear().range([0, width]).domain(extentForX)

      const svgWidth = width + margin.left + margin.right

      const svg = d3
        .select(svgContainer)
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', height + margin.top + margin.bottom + 10)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

      svg
        .append('defs')
        .append('clipPath')
        .attr('id', `clip-${this.id}`)
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)

      const xAxis = svg
        .append('g')
        .attr('class', 'xAxis')
        .attr('transform', `translate(0, ${height})`)

      if (isTime) {
        let step = svgWidth < 500 ? 3 : 2
        if (svgWidth < 400) step = 4
        if (svgWidth < 300) step = 5
        if (svgWidth < 250) step = 6
        xAxis.call(
          d3.axisBottom(x)
            .tickFormat(d3.timeFormat(!timeFormat ? '%Y-%m-%d %H:%M:%S' : timeFormat))
            .tickValues(x.ticks().filter((item, i) => i % step === 0))
        )
      } else xAxis.call(d3.axisBottom(x))

      const xAxisCaptions = svg.selectAll('g.xAxis g.tick text')

      if (xAxisCaptionRotate && xAxisCaptionRotate !== 0) {
        xAxisCaptions.attr('transform', `rotate(${xAxisCaptionRotate})`)
      }

      /** ---------- START: Inner methods ---------- */
      const putLabelDot = (attr, classText, d, y, metricText, dot, elem, brushObj) => {
        dot.setAttribute(attr, 'true')

        const text = svg
          .append('text')
          .text(d[metricText])
          .attr('class', classText)
          .attr('transform', `translate(${x(d[xMetric] * secondTransf)}, ${y})`)
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
      }

      const createAnnotationLine = (data, annotationName, i, tooltip) => {
        const group = svg.append('g').attr('class', 'vetical-line-group').style('opacity', 0.7)
        const dValue = data[xMetric]

        group
          .append('line')
          .attr('class', 'vetical-line')
          .attr('x1', x(dValue * secondTransf))
          .attr('y1', 20)
          .attr('x2', x(dValue * secondTransf))
          .attr('y2', height)
          .attr('xVal', dValue * secondTransf)
          .attr('stroke', this.legendColors[i])
          .attr('stroke-width', this.strokeWidth)

        group
          .append('circle')
          .attr('class', 'dot-vertical')
          .attr('cx', x(dValue * secondTransf))
          .attr('cy', 20)
          .attr('r', 2.5 * this.strokeWidth)
          .attr('xVal', dValue * secondTransf)
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
      }

      const updateData = (y, selectRange, id) => {
        const invertStart = x.invert(selectRange[0])
        const invertEnd = x.invert(selectRange[1])
        const range = isTime
          ? [
              parseInt(new Date(invertStart).getTime() / 1000),
              parseInt(new Date(invertEnd).getTime() / 1000),
            ]
          : [
              parseFloat(invertStart.toFixed(5)),
              parseFloat(invertEnd.toFixed(5))
            ]
        this.setClick(range, 'select')
        zoom(y, selectRange, id)
      }

      const zoom = (y, selectRange = [], id) => {
        const [rangeStart, rangeEnd] = selectRange

        x.domain([x.invert(rangeStart), x.invert(rangeEnd)])

        if (isTime) {
          xAxis
            .transition()
            .duration(secondTransf)
            .call(
              d3.axisBottom(x)
                .tickFormat(d3.timeFormat(timeFormat))
                .tickValues(x.ticks().filter((item, i) => i % 2 === 0))
                .ticks(5)
            )
        } else {
          xAxis.transition().duration(1000).call(d3.axisBottom(x))
        }

        this.createVerticalGridLines(svg, height)

        if (id === -1) {
          metricNames.forEach((item, i) => changeZoom(y, 1000, i))
        } else {
          changeZoom(y, 1000, id)
        }

        svg.on('dblclick', () => {
          if (isTime) {
            x.domain(d3.extent(dataRest, (d) => new Date(d[xMetric] * secondTransf)))
            xAxis
              .transition()
              .duration(secondTransf)
              .call(
                d3.axisBottom(x)
                  .tickFormat(d3.timeFormat(timeFormat))
                  .tickValues(x.ticks().filter((item, i) => i % 2 === 0))
                  .ticks(5)
              )
          } else {
            x.domain([minX, maxX])
            xAxis.transition().duration(1000).call(d3.axisBottom(x))
          }
          this.createVerticalGridLines(svg, height)
          metricNames.forEach((item, i) => changeZoom(y, 300, i))
        })
      }

      const line = isUnitedMode ? svg.append('g').attr('clip-path', `url(#clip-${this.id})`) : []
      let allLinesWithBreak = []

      const changeZoom = (y, duration, i) => {
        const dotLabelPos = []
        const lineChange = isUnitedMode ? line : line[i]

        let lastDotPos = null

        if (allLinesWithBreak[i]) {
          allLinesWithBreak[i].forEach((lineItself, lineIndex) => {
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

        svg
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

        svg
          .selectAll(`.caption-dot-text-${metricNames[i]}`)
          .transition()
          .duration(duration)
          .attr(
            'transform',
            (d, i) => `translate(${dotLabelPos[i].x - 5}, ${dotLabelPos[i].y - 5})`
          )

        if (lastDotPos !== null) {
          svg
            .select(`.last-dot-text-${metricNames[i]}`)
            .transition()
            .duration(duration)
            .attr('transform', `translate(${lastDotPos.x - 5}, ${lastDotPos.y - 5})`)
        }

        const group = svg.selectAll('.vetical-line-group')

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
      }
      /** ---------- END: Inner methods ---------- */

      this.createVerticalGridLines(svg, height)

      const minMetricsValues = metricNames.map((item) => d3.min(dataRest, (d) => d[item]))
      const maxMetricsValues = metricNames.map((item) => d3.max(dataRest, (d) => d[item]))

      const tooltip = d3.select(svgContainer).select('.graph-tooltip')
      const [tooltipBlock] = tooltip.nodes()

      const lineDot = svg
        .append('g')
        .append('line')
        .attr('class', 'line-dot')
        .attr('x1', 0)
        .attr('y1', 20)
        .attr('x2', 0)
        .attr('y2', height)
        .attr('opacity', 0)
        .attr('stroke', this.theme.$main_text)
        .attr('stroke-dasharray', '3 3')

      const annotationList = Object.keys(dataRest[0]).filter(
        (item) => item.indexOf('annotation') !== -1
      )

      const extraDot = this.checkExtraDot(dataRest)
      const putLabel = (...args) => putLabelDot(...args)

      let y = []

      if (isUnitedMode) {
        const maxValue = d3.max(maxMetricsValues)
        const indentPercent = (10 * maxValue) / 100

        y = d3
          .scaleLinear()
          .domain([0, maxValue + indentPercent])
          .range([height, 20])

        svg
          .append('g')
          .attr('class', 'yAxis')
          .call(d3.axisLeft(y).ticks(y.ticks().length / 2))

        svg
          .selectAll('g.yAxis g.tick')
          .append('line')
          .attr('class', 'grid-line-y')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', width)
          .attr('y2', 0)
          .attr('stroke', this.theme.$main_text)
          .style('opacity', 0.3)

        const mustSee = []
        const brushObj = { ...this.defaultBrushObj }

        metricNames.forEach((metricName, metricIndex) => {
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
            dataRest.forEach((line) => {
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
            allLinesWithBreak.push(linesWithBreak)

            linesWithBreak.forEach((lineItself, lineIndex) => {
              line
                .append('path')
                .datum(lineItself)
                .attr('class', `line-${metricIndex}-${lineIndex}`)
                .attr('fill', 'none')
                .attr('stroke', this.legendColors[metricIndex])
                .attr('stroke-width', this.strokeWidth)
                .attr(
                  'd',
                  d3.line()
                    .x((d) => x(d[xMetric] * secondTransf))
                    .y((d) => y(d[metricName]))
                )
            })

            dotDate = dataRest
          }

          svg
            .append('g')
            .selectAll('dot')
            .data(dotDate)
            .enter()
            .append('circle')
            .attr('class', `dot dot-${metricIndex}`)
            .attr('cx', (d) => x(d[xMetric] * secondTransf))
            .attr('cy', (d) => y(d[metricName]))
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
                  y(d[metricName]) - 5,
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

              if (isLastDotShow && j === dataRest.length - 1) {
                opacity = 1
                setLabel('data-last-dot', `last-dot-text-${metricName}`, metricName)
              }

              annotationList.forEach((annotation, i) => {
                if (d[annotation]) {
                  createAnnotationLine(d, annotation, metricNames.length + 1 + i, tooltip)
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
        })

        const brush = line.append('g').attr('class', 'brush')

        brush
          .append('rect')
          .attr('class', 'overlay')
          .attr('x', 0)
          .attr('y', 20)
          .attr('width', width)
          .attr('height', height)
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
            .attr('height', height)
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
            updateData(y, [brushObj.startX, brushObj.endX], -1)
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

      const step = ((height - 20) / metricNames.length).toFixed(5)
      const startY = [20]

      allLinesWithBreak = []

      annotationList.forEach((annotation, i) => {
        dataRest.forEach((data) => {
          if (data[annotation]) {
            createAnnotationLine(data, annotation, metricNames.length + 1 + i, tooltip)
          }
        })
      })

      let maxLength = 0

      metricNames.forEach((metric, metricIndex) => {
        if (metricIndex > 0) {
          svg
            .append('g')
            .append('line')
            .attr('x1', 0)
            .attr('y1', step * metricIndex + 20)
            .attr('x2', width)
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

        svg
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

        const textNodes = svg.selectAll(`.yAxis-${metricIndex} .tick`).select('text').nodes()
        textNodes.forEach((node, i) => {
          const value = textNodes.length > 1
            ? i === 0
              ? -5
              : (i === textNodes.length - 1) ? 5 : 0
            : 5
          node.style.transform = `translateY(${value}px)`
        })

        line.push(svg.append('g').attr('clip-path', `url(#clip-${this.id})`))

        if (optionsKeys.length === 0 || options.type === 'Line chart') {
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

          const cutData = dataRest.filter((item) => item[metric] >= minY && item[metric] <= maxY)

          if (nullValue !== -1) {
            dotDate = [extraDot[nullValue]]
          } else {
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
            allLinesWithBreak[metricIndex] = linesWithBreak

            linesWithBreak.forEach((lineItself, lineIndex) => {
              line[metricIndex]
                .append('path')
                .datum(lineItself)
                .attr('class', `line-${metricIndex}-${lineIndex}`)
                .attr('fill', 'none')
                .attr('stroke', this.legendColors[metricIndex])
                .attr('stroke-width', this.strokeWidth)
                .attr(
                  'd',
                  d3.line()
                    .x((d) => x(d[xMetric] * secondTransf))
                    .y((d) => y[metricIndex](d[metric]))
                )
            })

            if (minY < 0) {
              line[metricIndex]
                .append('line')
                .attr('class', `zero-line-${metricIndex}`)
                .attr('x1', 0)
                .attr('y1', y[metricIndex](0))
                .attr('x2', width)
                .attr('y2', y[metricIndex](0))
                .attr('opacity', '.3')
                .attr('stroke', this.theme.$main_text)
                .attr('stroke-dasharray', '3 3')
            }

            dotDate = cutData
          }

          const thisMetrics = [...this.metrics]

          svg
            .append('g')
            .selectAll('dot')
            .data(dotDate)
            .enter()
            .append('circle')
            .attr('class', `dot dot-${metricIndex}`)
            .attr('cx', (d) => x(d[xMetric] * secondTransf))
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

              if (isLastDotShow && j === dataRest.length - 1) {
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

          const brush = line[metricIndex].append('g').attr('class', `brush-${metricIndex}`)

          brush
            .append('rect')
            .attr('class', `overlay-${metricIndex}`)
            .attr('x', 0)
            .attr('y', startY[metricIndex])
            .attr('width', width)
            .attr('height', parseFloat(step * (metricIndex + 1)) + 20)
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
              .attr('height', parseFloat(step))
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
              updateData(y, [brushObj.startX, brushObj.endX], metricIndex)
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

        if (optionsKeys.length > 0 || options.type === 'Bar chart') {
          let allDotHover = []

          x = isTime
            ? d3.scaleTime()
                .range([0, width])
                .domain(d3.extent(dataRest, (d) => new Date(d[xMetric] * secondTransf)))
            : d3.scaleBand()
                .range([0, width])
                .domain(dataRest.map((d) => d[xMetric] * secondTransf))

          svg
            .append('g')
            .attr('transform', `translate(0, ${startY[metricIndex + 1]})`)
            .style('opacity', 0)
            .call(d3.axisBottom(x))

          const cutData = dataRest.filter(
            (item) => item[options.name] >= minY && item[options.name] <= maxY
          )

          const thisMetrics = [...this.metrics]
          const isNegative = minY < 0

          line[metricIndex]
            .selectAll(`bar-${metricIndex}`)
            .data(cutData)
            .enter()
            .append('rect')
            .attr('x', (d) => x(d[xMetric] * secondTransf))
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
                return isTime
                  ? d3.scaleBand()
                      .range([0, width])
                      .domain(dataRest.map((d) => d[xMetric] * secondTransf))
                      .bandwidth()
                  : x.bandwidth()
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

      maxLength += 15
      svg.attr('transform', `translate(${maxLength}, ${margin.top})`)
    },
  },
}
</script>

<style lang="sass" scoped>
@import ./sass/MultiLine
</style>
