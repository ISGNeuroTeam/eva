<template>
  <div class="muililine-new">
    <div v-if="showMessage">
      <span>{{ errorMessage }}</span>
    </div>
    <div v-else>
      <div
        ref="legend"
        class="legend"
      >
        <div
          v-for="item in legendItems"
          :key="item.name"
          class="legend-item"
        >
          <div
            class="circle"
            :style="{ backgroundColor: item.color }"
          />
          <div
            class="text"
            :style="{ color: theme.$main_text }"
            v-text="item.name"
          />
        </div>
      </div>
    </div>
    <div
      v-show="!showMessage"
      ref="svgContainer"
      class="svg-container"
      @dblclick="$emit('resetRange')"
    >
      <div class="graph-tooltip" />
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'DashMultiLine',
  props: {
    idFrom: {
      type: String,
      required: true,
    },
    idDashFrom: {
      type: String,
      required: true,
    },
    widthFrom: {
      type: Number,
      required: true,
    },
    heightFrom: {
      type: Number,
      required: true,
    },
    dataRestFrom: {
      type: Array,
      required: true,
    },
    dataModeFrom: Boolean,
    isFullScreen: Boolean,
    /** Props from Reports page. */
    dataReport: Boolean,
  },
  data() {
    return {
      actions: [
        { name: 'click', capture: ['pointX', 'pointY'] },
        { name: 'select', capture: ['start', 'end'] },
      ],
      margin: {
        top: 18, right: 10, bottom: 18, left: 30,
      },
      marginOffset: {
        top: 0, right: 0, bottom: 0, left: 0,
      },
      defaultOptions: {
        xAxisCaptionRotate: 0,
        strokeWidth: 1.5,
      },
      svg: null,
      idleTimeout: null,
      tempData: null,
      warningMessage: null,
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
    errorMessage() {
      return this.warningMessage || this.data.error || 'Нет данных для отображения';
    },
    showMessage() {
      return this.warningMessage || !this.data.length || this.data.error;
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
        ...this.defaultOptions,
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
    legendItems() {
      return this.metrics.map((name) => {
        const color = this.getCurrentMetricColor(name);
        return {
          name,
          color,
        };
      });
    },
    xMetric() {
      const [xMetric] = this.firstDataRowMetricList;
      return xMetric;
    },
    data() {
      const [first] = this.dataRestFrom;
      const isTimestamp = first && this.isTimestamp(first[this.xMetric]);
      if (!this.options.stringOX && isTimestamp) {
        return this.dataRestFrom
          .map((item) => ({
            ...item,
            [this.xMetric]: new Date(item[this.xMetric] * 1000),
          }));
      }
      return this.dataRestFrom;
    },
    lastDataItem() {
      return this.data[this.dataRestFrom.length - 1];
    },
    box() {
      const {
        widthFrom, heightFrom, margin, marginOffset,
      } = this;
      let minHeight = heightFrom;
      if (heightFrom < 100) {
        minHeight = 500;
      }
      return {
        margin,
        marginOffset,
        marginOffsetX: marginOffset.left + marginOffset.right,
        width: widthFrom - margin.left - margin.right
          - marginOffset.left - marginOffset.right,
        height: minHeight - margin.top - margin.bottom
          - marginOffset.bottom - marginOffset.top - 60,
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
    barplotMetrics() {
      const {
        united, metrics, metricTypes, yAxesBinding = {},
      } = this.options;
      if (!united) {
        if (metrics) {
          return metrics
            .filter((item) => item.type === 'Bar chart')
            .map((item) => item.name);
        }
        return [];
      }
      const types = metricTypes || yAxesBinding.metricTypes;
      return this.metrics
        .filter((item) => types && (types[item] === 'barplot'));
    },
    lineChartMetrics() {
      return this.metrics
        .filter((item) => !this.barplotMetrics.includes(item));
    },
  },
  watch: {
    data() {
      this.updateData();
    },
    box() {
      this.reRenderChart();
    },
    theme() {
      this.reRenderChart();
    },
    metrics() {
      this.reRenderChart();
      const { id, idDash, metrics } = this;
      // @todo: проверить и исправить данный метод как будет время
      this.$store.commit('setMetricsMulti', { id, idDash, metrics: [null, ...metrics] });
    },
    options: {
      deep: true,
      handler() {
        this.reRenderChart();
      },
    },
  },
  mounted() {
    const { id, idDash, actions } = this;
    this.$store.commit('setActions', { id, idDash, actions });
    this.createChart();
    this.updateData(this.data);
    this.testN = 0;
    this.tooltip = d3.select(this.$refs.svgContainer).select('.graph-tooltip');
    this.$on('fullScreenMode', (isFull) => {
      if (isFull) {
        this.reRenderChart();
      }
    });
  },
  methods: {
    eventsStore({ event, partelement }) {
      const { idDash } = this;
      let result = [];
      if (partelement) {
        result = this.$store.state[idDash].events.filter((item) => (
          item.event === event
          && item.element === this.id
          && item.partelement === partelement
        ));
      } else {
        result = this.$store.state[idDash].events.filter(
          (item) => item.event === event
            && item.target === this.id,
        );
      }
      return result;
    },
    reRenderChart() {
      this.clearSvgContainer();
      this.createChart();
      this.updateData();
    },
    clearSvgContainer() {
      d3.select(this.$refs.svgContainer)
        .selectAll('svg')
        .nodes()
        .forEach((item) => item.remove());
    },
    createChart() {
      this.warningMessage = null;
      const {
        margin, marginOffset, marginOffsetX, width, height,
      } = this.box;

      // append the svg object to the body of the page
      this.svg = d3.select(this.$refs.svgContainer)
        .append('svg')
        .attr('width', width + marginOffsetX)
        .attr('height', height + margin.top + margin.bottom + marginOffset.bottom - 10)
        .append('g')
        .attr(
          'transform',
          `translate(${marginOffset.left},${margin.top})`,
        );

      const {
        barplotstyle, united, yFromZero, axesCount,
        metricsAxis, stringOX, metrics = [],
      } = this.options;

      this.x = {};
      this.svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .attr('class', 'myXaxis');

      // Initialize an Y axis
      let allMaxYMetric; let allMinYMetric;
      if (united) {
        allMaxYMetric = d3.max(this.metrics.map((metric) => d3.max(this.data, (d) => d[metric])));
        allMinYMetric = d3.min(this.metrics.map((metric) => d3.min(this.data, (d) => d[metric])));
      }

      // максимум для accumulation barplot
      if (barplotstyle === 'accumulation') {
        allMinYMetric = 0;
        allMaxYMetric = 0;
        this.data.forEach((item) => {
          let up = 0; let down = 0;
          this.barplotMetrics.forEach((metric) => {
            const val = item[metric];
            if (val >= 0) {
              up += val;
            } else {
              down += val;
              // Negative values are not available in accumulation histograms
              this.warningMessage = 'Отрицательные значения недоступны на гистограммах накопления';
              throw new Error(this.warningMessage);
            }
          });
          if (up > allMaxYMetric) allMaxYMetric = up;
          if (down < allMinYMetric) allMinYMetric = down;
        });
      }

      this.y = {};
      const yHeight = this.options.united
        ? this.box.height
        : (this.box.height / this.metrics.length);

      this.metrics.forEach((metric, i) => {
        const currentColor = this.getCurrentMetricColor(metric);
        const metricType = this.getMetricType(metric);
        const groups = d3.map(this.data, (d) => d[this.xMetric]).keys();

        // x
        this.xZoom = d3.scaleTime()
          .domain([
            d3.min(this.data.map((item) => item[this.xMetric])),
            d3.max(this.data.map((item) => item[this.xMetric])),
          ])
          .range([0, width]);

        if (metricType === 'barplot') {
          if (stringOX) {
            this.x[metric] = d3.scaleBand()
              .domain(groups)
              .padding(0.1);
          } else {
            this.x[metric] = d3.scaleTime()
              .domain([
                d3.min(this.data.map((item) => item[this.xMetric])),
                d3.max(this.data.map((item) => item[this.xMetric])),
              ]);
          }
          this.x[metric].range([0, width]);
        } else {
          const [first] = this.dataRestFrom;
          this.x[metric] = (stringOX || !this.isTimestamp(first[this.xMetric]))
            ? d3.scaleLinear()
            : d3.scaleTime();
          this.x[metric]
            .domain(this.data.map((item) => item[this.xMetric]))
            .range([0, width]);
        }

        const yAxisClass = `yAxis-${i}`;

        this.xAxis = d3.axisBottom()
          .scale(this.x[metric])
          .ticks(this.data.length > 10 ? 5 : null)
          .tickFormat(this.tickFormat);

        // maxYMetric
        let maxYMetric;
        if (united && metricType === 'barplot') {
          maxYMetric = allMaxYMetric;
        } else {
          maxYMetric = d3.max(this.data, (d) => d[metric]);
          if (maxYMetric < 0) {
            maxYMetric = 0;
          } else {
            // round
            maxYMetric = Math.ceil(maxYMetric * 10) / 10;
          }
        }

        // minYMetric
        let minYMetric;
        if (yFromZero) {
          minYMetric = 0;
        } else {
          minYMetric = d3.min(this.data, (d) => d[metric]);
          if (metricType === 'barplot') {
            if (united) {
              minYMetric = allMinYMetric < 0 ? allMinYMetric : 0;
            } else if (minYMetric > 0) {
              minYMetric = 0;
            } else {
              // round
              if (minYMetric < 0) {
                minYMetric -= Math.abs(minYMetric - maxYMetric) * 0.1;
              } else {
                minYMetric += Math.abs(minYMetric - maxYMetric) * 0.1;
              }
            }
          }
        }

        // гринаци оси Y
        if (!united) {
          const opt = metrics.find((d) => d.name === metric) || {};

          // если у метрики только одно значение
          if (maxYMetric === minYMetric) {
            maxYMetric = maxYMetric % 1 === 0
              ? maxYMetric += 1
              : Math.ceil(maxYMetric);
            minYMetric = minYMetric % 1 === 0
              ? minYMetric -= 1
              : Math.floor(minYMetric);
          } else {
            if (opt.manual) {
              if (opt.upborder) {
                maxYMetric = +opt.upborder;
              }
              if (opt.lowborder) {
                minYMetric = +opt.lowborder;
              }
            }
            maxYMetric += Math.abs(maxYMetric) * 0.1;
          }
        }
        if (metricType === 'barplot') {
          maxYMetric += Math.abs(maxYMetric) * 0.1;
          if (minYMetric !== 0 && minYMetric < 0) {
            minYMetric -= Math.abs(minYMetric) * 0.1;
          }
          if (maxYMetric < 0 && minYMetric < 0) {
            maxYMetric = 0;
          }
        }
        minYMetric -= Math.abs(minYMetric) * 0.1;

        this.y[metric] = d3.scaleLinear()
          .range(united ? [yHeight, 0] : [yHeight + yHeight * i, yHeight * i])
          .domain([minYMetric, maxYMetric]);

        // позиция горизонтальных линий
        let tickValues;
        if (united) {
          tickValues = [
            minYMetric,
            minYMetric + (maxYMetric - minYMetric) / 3,
            minYMetric + ((maxYMetric - minYMetric) / 3) * 2,
            maxYMetric,
          ];
        } else {
          tickValues = [minYMetric];
          if (minYMetric < 0 && maxYMetric > 0) {
            tickValues.push(0);
          }
          tickValues.push(maxYMetric);
        }

        if (united) {
          tickValues = tickValues.sort().reduce((a, b) => {
            const result = [...a];
            if (result.length > 0 && a[result.length - 1] < 0 && b > 0) {
              result.push(0);
            }
            result.push(b);
            return result;
          }, []);
        }

        // y оси
        const axisMetricsToRight = (axesCount === 1 || !metricsAxis)
          ? []
          : this.metrics.filter((name) => metricsAxis[name] === 'right');

        const yAxisElem = this.svg
          .append('g')
          .attr('stroke', currentColor);
        let axisFunc;
        if (!united || !axisMetricsToRight.includes(metric)) {
          axisFunc = d3.axisLeft;
          yAxisElem
            .attr('class', `yAxis ${yAxisClass} left`);
        } else {
          axisFunc = d3.axisRight;
          yAxisElem
            .attr('transform', `translate(${this.box.width}, 0)`)
            .attr('class', `yAxis ${yAxisClass} right`);
        }
        yAxisElem.call(axisFunc(this.y[metric])
          .tickValues(tickValues)
          .tickFormat((y) => this.yTickFormat(y, metric)));

        // сдвиг надписей на Y оси
        const offsetYText = 5;
        if (united) {
          const offsetYTextUnited = (offsetYText + 5) * i;
          // eslint-disable-next-line no-mixed-operators
          const topOffset = this.metrics.length * (offsetYText + 2) / 2;
          this.svg
            .selectAll(`g.${yAxisClass} g.tick text`)
            .attr('transform', `translate(0, ${offsetYTextUnited - topOffset})`);
        } else {
          this.svg
            .selectAll(`g.${yAxisClass} g.tick:first-of-type text`)
            .attr('transform', `translate(0, -${offsetYText})`);
          this.svg
            .selectAll(`g.${yAxisClass} g.tick:last-of-type text`)
            .attr('transform', `translate(0, ${offsetYText})`);
        }
        this.svg
          .selectAll(`g.${yAxisClass} g.tick text`)
          .attr('stroke', 'none')
          .attr('fill', united ? currentColor : this.theme.$main_text);
      });
      this.renderHorizontalLines();

      // Add a clipPath: everything out of this area won't be drawn.
      const clipPathID = this.isFullScreen
        ? `clip-${this.id}-full`
        : `clip-${this.id}`;

      this.clip = this.svg.append('defs')
        .append('svg:clipPath')
        .attr('id', clipPathID)
        .append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        .attr('x', 0)
        .attr('y', 0);

      // Add brushing
      this.brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on('start', () => {
          this.hideTooltip();
          this.tooltipHide = true;
        })
        .on('end', this.zoomChart);

      // Create the line variable: where both the line and the brush take place
      this.line = this.svg.append('g')
        .attr('clip-path', `url(#${clipPathID})`);

      this.bars = this.svg.append('g')
        .attr('class', 'barplot')
        .attr('clip-path', `url(#${clipPathID})`);

      this.lines = {};
      this.metrics.forEach((metric) => {
        this.lines[metric] = this.svg.append('g')
          .attr('clip-path', `url(#${clipPathID})`);
      });

      // Add the brushing
      this.line
        .append('g')
        .attr('class', 'brush')
        .call(this.brush);

      // вертикальная линия под указателем
      this.lineDot = this.svg
        .append('g')
        .append('line')
        .attr('class', 'line-dot')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', this.box.height)
        .attr('opacity', 0)
        .attr('stroke', this.theme.$main_text)
        .attr('stroke-dasharray', '3 3');
    },
    zoomChart() {
      this.tooltipHide = false;
      const { selection } = d3.event;
      const { stringOX } = this.options;
      if (selection && this.xZoom) {
        const { invert } = this.xZoom;
        const range = selection.map((point) => {
          const column = invert(point);
          return (column instanceof Date)
            ? column.getTime() / (stringOX ? 1 : 1000)
            : column;
        });
        this.xZoom.domain(range);
        this.line.select('.brush').call(this.brush.move, null);
        this.$emit('SetRange', {
          range,
          xMetric: this.xMetric,
          zoomForAll: this.isZoomForAll,
        });
        this.setClick(range, 'select');
      }
      this.hideTooltip();
    },
    updateData(data = this.data) {
      if (!this.x) {
        this.x = {};
      }

      const { xMetric, xZoom } = this;
      const {
        united, barplotstyle, isDataAlwaysShow, lastDot,
      } = this.options;

      this.metrics
        .filter((metric) => this.x[metric])
        .forEach((metric) => {
          // update the X axis:
          const mainDomain = [
            d3.min(data, (d) => d[xMetric]),
            d3.max(data, (d) => d[xMetric]),
          ];
          this.x[metric].domain(mainDomain);
          xZoom.domain(mainDomain);
          this.svg.selectAll('.myXaxis').call(this.xAxis);
          this.setXAxisCaptionsRotate();
        });

      this.createVerticalGridLines();

      // create the Y axis
      let isAddedBarplots = false;

      this.metrics.forEach((metric, i) => {
        if (!this.x[metric]) {
          return;
        }
        const currentColor = this.getCurrentMetricColor(metric);
        // Create a update selection: bind to the new data
        this.line = this.svg.selectAll(`.line-${metric}`)
          .data([data], (d) => d[xMetric]);

        const metricType = this.getMetricType(metric);

        let xSubgroup;

        const currentBarWidth = this.getCurrentBarWidth();

        if (this.barplotMetrics.length) {
          // @todo: check it tomorrow
          const lineOffset = currentBarWidth / 2;
          const range = [
            lineOffset,
            this.box.width - lineOffset,
          ];
          this.xZoom.range(range);
          this.x[metric].range(range);
        }

        switch (metricType) {
          case 'barplot':
            // Another scale for subgroup position?
            xSubgroup = d3.scaleBand()
              .domain(this.barplotMetrics)
              .range([0, currentBarWidth]);

            if (united) {
              // draw grouped barplots
              if (!isAddedBarplots && this.barplotMetrics.length > 0) {
                isAddedBarplots = true;

                if (['accumulation', 'overlay'].includes(barplotstyle)) {
                  const stackedData = d3.stack()
                    .keys(this.barplotMetrics)(data);

                  this.bars.append('g')
                    .selectAll('g')
                    .data(stackedData)
                    .enter()
                    .append('g')
                    .attr('fill', (d) => this.getCurrentMetricColor(d.key))
                    .selectAll('rect')
                    .data((d) => d)
                    .enter()
                    .append('rect')
                    .attr('x', (d) => xZoom(d.data[xMetric]) - currentBarWidth / 2)
                    .attr('y', (d) => {
                      let val = d[1];
                      if (barplotstyle === 'overlay') {
                        val -= d[0];
                      }
                      if (val < 0) {
                        const height = this.y[metric](d[0]) - this.y[metric](d[1]);
                        return this.y[metric](val) + height;
                      }
                      return this.y[metric](val);
                    })
                    .attr('height', (d) => {
                      const height = this.y[metric](d[0]) - this.y[metric](d[1]);
                      return Math.abs(height);
                    })
                    .attr('width', currentBarWidth)
                    .on('click', (d) => this.setClick({
                      x: d.data[xMetric],
                      y: d[1] - d[0],
                    }, 'click'))
                    .on('mouseenter', this.showTooltip)
                    .on('mouseleave', this.hideTooltip)
                    .on('mousemove', (d) => {
                      this.updateTooltip(d.data);
                      const lineXPos = xZoom(d.data[xMetric]);
                      this.lineDot
                        .attr('x1', lineXPos)
                        .attr('x2', lineXPos);
                    });
                } else {
                  xSubgroup = d3.scaleBand()
                    .domain(this.barplotMetrics)
                    .range([0, currentBarWidth]);

                  this.bars
                    .selectAll('g')
                    .data(data)
                    .enter()
                    .append('g')
                    .attr('transform', (d) => {
                      const xOffset = xZoom(d[this.xMetric]);
                      return `translate(${xOffset},0)`;
                    })
                    .selectAll('rect')
                    .data((d) => this.barplotMetrics.map((key) => ({
                      key,
                      value: d[key],
                      data: d,
                    })))
                    .enter()
                    .append('rect')
                    .attr('x', (d) => xSubgroup(d.key) - currentBarWidth / 2)
                    .attr('y', (d) => {
                      const yHeight = this.y[metric](d.value);
                      if (d.value < 0) {
                        return this.y[metric](0);
                      }
                      return yHeight;
                    })
                    .attr('width', xSubgroup.bandwidth())
                    .attr('height', (d) => {
                      const valHeight = this.y[metric](d.value);
                      const zeroHeight = this.y[metric](0);
                      if (d.value < 0) {
                        return valHeight - zeroHeight;
                      }
                      return zeroHeight - valHeight;
                    })
                    .attr('fill', (d) => this.getCurrentMetricColor(d.key))
                    .on('click', (d) => this.setClick({
                      x: d.data[this.xMetric],
                      y: d.value,
                    }, 'click'))
                    .on('mouseenter', this.showTooltip)
                    .on('mouseleave', this.hideTooltip)
                    .on('mousemove', (d) => {
                      this.updateTooltip(d.data);
                      const lineXPos = this.xZoom(d.data[this.xMetric]);
                      this.lineDot
                        .attr('x1', lineXPos)
                        .attr('x2', lineXPos);
                    });
                }
              }
            } else {
              // overview
              const allHeight = this.box.height;
              const metricHeight = allHeight / this.metrics.length;
              const offsetHeight = metricHeight * i;
              this.line
                .data(data
                  // тут убираю бары с 0 высотой
                  .filter((d) => this.box.height !== this.y[metric](d[metric])))
                .enter()
                .append('rect')
                .attr('class', `line-${metric}`)
                .attr('x', (d) => this.x[metric](d[this.xMetric]) - currentBarWidth / 2)
                .attr('y', (d) => {
                  const val = d[metric];
                  const zeroHeight = this.y[metric](0);
                  const valHeight = this.y[metric](val);
                  return (val <= 0) ? zeroHeight : valHeight;
                })
                .attr('width', currentBarWidth)
                .attr('height', (d) => {
                  const val = d[metric];
                  const zeroHeight = this.y[metric](0);
                  const valHeight = this.y[metric](val);
                  const height = valHeight - offsetHeight;
                  if (val <= 0) {
                    return height + (offsetHeight - zeroHeight);
                  }
                  return zeroHeight - (offsetHeight + height);
                })
                .attr('fill', currentColor)
                .on('click', (d) => this.setClick({
                  x: d[this.xMetric],
                  y: d[metric],
                }, 'click'))
                .on('mouseenter', this.showTooltip)
                .on('mouseleave', this.hideTooltip)
                .on('mousemove', (d) => {
                  this.updateTooltip(d);
                  const lineXPos = this.x[metric](d[this.xMetric]);
                  this.lineDot
                    .attr('x1', lineXPos)
                    .attr('x2', lineXPos);
                });
            }

            break;
          default:
            // рисуем линии
            this.renderLines(data, metric);
            break;
        }

        // рисуем точки на линии
        if (metricType === 'linechart') {
          this.updateLineDots(data, metric);
        }

        // рисуем текст у вершин
        if (isDataAlwaysShow || lastDot) {
          const textData = isDataAlwaysShow ? this.data : [this.lastDataItem];
          this.renderPeakTexts(metric, metricType, textData);
        }
      });

      // добавляем captions
      if (this.xZoom && !isDataAlwaysShow) {
        const captionMetrics = Object.keys(this.firstDataRow)
          .filter((m, _, all) => all.includes(`_${m}_caption`));
        if (captionMetrics.length) {
          const captionData = this.data
            .map((d) => {
              const result = {
                [xMetric]: d[xMetric],
              };
              captionMetrics.forEach((name) => {
                result[name] = d[`_${name}_caption`];
              });
              return result;
            });
          captionMetrics.forEach((name) => {
            const metricType = this.getMetricType(name);
            this.renderPeakTexts(name, metricType, captionData);
          });
        }
      }
    },
    updateLineDots(data, metric) {
      const { isDataAlwaysShow, lastDot } = this.options;
      const currentColor = this.getCurrentMetricColor(metric);
      this.svg
        .append('g')
        .selectAll('dot')
        .data(data.filter((d) => d[metric] !== null))
        .enter()
        .append('circle')
        .attr('class', (d, i) => {
          const textToRight = (i === this.data.length - 1);
          const showDot = isDataAlwaysShow
            || (lastDot && textToRight)
            || data.length === 1;
          return `dot dot-${metric} ${(showDot ? 'dot-show' : '')}`;
        })
        .attr('cx', (d) => this.xZoom(d[this.xMetric]))
        .attr('cy', (d) => this.y[metric](d[metric]))
        .attr('r', 5)
        .attr('fill', currentColor)
        .on('click', (d) => this.setClick({
          x: d[this.xMetric],
          y: d[metric],
        }, 'click'))
        .on('mouseenter', this.showTooltip)
        .on('mouseleave', this.hideTooltip)
        .on('mousemove', (d) => {
          this.updateTooltip(d);
          const lineXPos = this.xZoom(d[this.xMetric]);
          this.lineDot
            .attr('x1', lineXPos)
            .attr('x2', lineXPos);
        });
    },
    getCurrentMetricColor(metric) {
      const { color, united } = this.options;
      return (!united && color && color[metric])
        ? color[metric]
        : this.color(metric);
    },
    renderPeakTexts(metric, metricType, data) {
      const { isDataAlwaysShow } = this.options;
      const isLine = (metricType === 'linechart');
      this.svg
        .append('g')
        .selectAll('dot')
        .data(data)
        .enter()
        .append('text')
        .attr('transform', (d, i) => {
          const textToRight = (i === 0);
          let translate = 0;
          if (isLine) {
            if (textToRight) {
              translate = 5;
            } else {
              translate = -5;
            }
          }
          return `translate(${translate}, -5)`;
        })
        .attr('font-size', '11')
        .attr('text-anchor', (d, i) => {
          const textToRight = (i === 0);
          let anchor = 'start';
          if (isLine) {
            anchor = textToRight ? 'start' : 'end';
          }
          return anchor;
        })
        .attr('fill', this.theme.$main_text)
        .text((d) => {
          const fieldName = (isDataAlwaysShow === 'data')
            ? metric
            : `_${metric}_caption`;
          if (isDataAlwaysShow === 'caption' && d[fieldName] !== undefined) {
            return d[fieldName];
          }
          const val = d[metric];
          return (val % 1) // is float
            ? Number.parseFloat(val).toFixed(2)
            : val;
        })
        .attr('x', (d) => this.xZoom(d[this.xMetric]))
        .attr('y', (d) => this.y[metric](d[metric]));
    },
    renderLines(data, metric) {
      const {
        // eslint-disable-next-line camelcase
        strokeWidth, type_line, united,
      } = this.options;
      // eslint-disable-next-line camelcase
      const typeLine = type_line || {};
      const currentColor = this.getCurrentMetricColor(metric);
      // разбиваем линию на отрезки по пустым ячейкам
      let line = [];
      data
        .reduce((prev, cur, currentIndex, arr) => {
          if (cur[metric] === null) {
            prev.push(line);
            line = [];
          } else {
            line.push(cur);
          }
          if (currentIndex === arr.length - 1) {
            prev.push(line);
          }
          return prev;
        }, [])
        // eslint-disable-next-line no-shadow
        .forEach((line, i) => {
          if (line.length === 0) {
            return;
          }
          this.lines[metric]
            .append('path')
            .datum(line)
            .attr('class', `test line-${metric}-${i}`)
            .attr('d', d3.line()
              .x((d) => this.xZoom(d[this.xMetric]))
              .y((d) => this.y[metric](d[metric])))
            .attr('fill', 'none')
            .attr('stroke', currentColor)
            .attr('stroke-width', strokeWidth)
            .style(
              'stroke-dasharray',
              this.getStyleLine(!united ? typeLine[metric] : null),
            );
          if (line.length === 1) {
            this.updateLineDots(line, metric);
          }
        });
    },
    updateTooltip(d) {
      const [left, top] = d3.mouse(this.$refs.svgContainer);
      const {
        marginOffset, height,
      } = this.box;
      const offset = 10;
      const pos = {
        top: null,
        right: null,
        bottom: null,
        left: null,
      };
      const width = this.$refs.svgContainer.offsetWidth;
      this.tooltip
        .html(
          this.firstDataRowMetricList.reduce((prev, cur) => {
            let value = d[cur];
            if (!this.options.stringOX && cur === this.xMetric) {
              value = this.tickFormat(value);
            }
            return `${prev}<p><span>${cur}</span>: ${value}</p>`;
          }, ''),
        );

      if (left > this.widthFrom / 2) {
        pos.right = width - left + offset;
      } else {
        pos.left = left + offset;
      }

      if (top > height / 2) {
        pos.bottom = height - top
          + marginOffset.bottom + offset;
      } else {
        pos.top = top + offset
          + marginOffset.top;
      }

      Object.keys(pos).forEach((key) => {
        const val = pos[key] === null ? 'auto' : `${pos[key]}px`;
        this.tooltip.style(key, val);
      });
    },
    setXAxisCaptionsRotate() {
      const rotateParams = {
        0: {
          textAnchor: 'center',
          transform: 'rotate(0)',
        },
        45: {
          textAnchor: 'start',
          transform: 'rotate(45)',
        },
        '-45': {
          textAnchor: 'end',
          transform: 'rotate(-45)',
        },
        90: {
          textAnchor: 'start',
          transform: 'rotate(90) translate(10, -12)',
        },
        '-90': {
          textAnchor: 'end',
          transform: 'rotate(-90) translate(-10, -13)',
        },
      };
      const params = rotateParams[this.options.xAxisCaptionRotate];
      if (params) {
        this.svg.selectAll('.myXaxis text')
          .attr('transform', params.transform)
          .style('text-anchor', params.textAnchor);
      }

      // отступы для текста осей
      const { xAxisCaptionRotate } = this.options;

      this.$nextTick(() => {
        const xTextMaxHeight = d3.max(
          this.svg.selectAll('.myXaxis text')
            .nodes()
            .map((item) => {
              const box = item.getBBox();
              if ([90, -90].includes(xAxisCaptionRotate)) {
                return box.width;
              } if ([45, -45].includes(xAxisCaptionRotate)) {
                return box.width * 0.75;
              }
              return box.height;
            }),
        );
        this.marginOffset.bottom = xTextMaxHeight + 5;
        this.marginOffset.top = this.$refs.legend.offsetHeight || 0;

        // ось Y
        this.marginOffset.left = d3.max(
          this.svg.selectAll('.yAxis.left .tick text')
            .nodes().map((node) => node.getBBox().width),
        ) + 10;
        this.marginOffset.right = d3.max(
          this.svg.selectAll('.yAxis.left .tick text')
            .nodes().map((node) => node.getBBox().width),
        ) + 10;
      });
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

    // является ли значение датой
    isTimestamp(value) {
      return value > 1000000000 && value < 2000000000;
    },

    // форматируем ось Y
    yTickFormat(y, metric) {
      const { units } = this.metricUnits
        .find((item) => item.name === metric) || { units: '' };
      const rounderValue = y.toFixed
        ? Number.parseFloat(y.toFixed(5))
        : y;
      return `${rounderValue} ${units}`;
    },

    // форматируем ось X
    tickFormat(d) {
      const { timeFormat } = this.options;
      if (d instanceof Date) {
        return d3.timeFormat(timeFormat || '%Y-%m-%d %H:%M:%S')(d);
      }
      return d;
    },

    // рисуем вертикальные линии на оси X
    createVerticalGridLines() {
      const lineClass = 'grid-line-x';

      this.svg
        .selectAll(`.${lineClass}`)
        .nodes()
        .forEach((item) => item.remove());

      this.svg
        .selectAll('.myXaxis g.tick')
        .append('line')
        .attr('class', lineClass)
        .attr('x1', 0)
        .attr('y1', -this.box.height)
        .attr('x2', 0)
        .attr('y2', 0)
        .attr('stroke', this.theme.$main_text)
        .style('opacity', 0.3);
    },

    showTooltip() {
      if (this.tooltipHide) return;
      this.tooltip.style('opacity', 1);
      this.lineDot.style('opacity', 0.7);
    },

    hideTooltip() {
      this.tooltip.style('opacity', 0);
      this.lineDot.style('opacity', 0);
    },

    getMetricType(metric) {
      const {
        united, metrics, metricTypes, yAxesBinding,
      } = this.options;
      if (!united && metrics) {
        const metricType = metrics
          .find((item) => item.name === metric)?.type;
        return (metricType === 'Bar chart') ? 'barplot' : 'linechart';
      }
      if (metricTypes) {
        return metricTypes[metric] || 'linechart';
      }
      if (yAxesBinding && yAxesBinding.metricTypes[metric]) {
        return yAxesBinding.metricTypes[metric] || 'linechart';
      }
      return 'linechart';
    },

    // горизонтальные полосы на графике
    renderHorizontalLines() {
      this.svg
        .select('g.yAxis.left')
        .selectAll('g.yAxis.left g.tick line')
        .remove();

      const els = this.options.united
        ? this.svg.select('g.yAxis.left')
        : this.svg;

      els
        .selectAll('g.yAxis.left g.tick')
        .append('line')
        .attr('class', 'grid-line-y')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', this.box.width)
        .attr('y2', 0)
        .attr('stroke', this.theme.$main_text)
        .style('opacity', 0.3);

      this.svg
        .selectAll('g.yAxis.left g.tick:first-of-type line')
        .remove();
    },

    setClick(point, actionName) {
      const { id, idDash } = this;
      const tokens = this.tokensStore
        .filter(({ elem, action }) => (elem === id && action === actionName));
      const values = {
        pointX: point.x,
        pointY: point.y,
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
    getCurrentBarWidth() {
      let maxBarWidth = (this.box.width / this.data.length) * 0.9;
      if (maxBarWidth < 1) {
        maxBarWidth = 1;
      }
      return +this.options.barplotBarWidth || maxBarWidth;
    },
  },
};
</script>

<style lang="sass" scoped>
@import ../../sass/_colors

.legend
  display: flex
  flex-flow: row wrap
  justify-content: flex-end
  align-items: center
  gap: 20px

  .legend-item
    display: flex
    flex-flow: row wrap
    justify-content: flex-start
    align-items: center

    .circle
      border-radius: 50%
      width: 10px
      height: 10px
      margin-right: 10px

    .text
      font-size: 14px

.svg-container
  position: relative

.svg-container::v-deep
  .dot
    opacity: 0
    cursor: pointer
    &:hover
      opacity: 1
    &.dot-show
      opacity: 1

  .graph-tooltip
    position: absolute
    background-color: $secondary_bg
    border: 1px solid $main_border
    border-radius: 4px
    color: $main_text !important
    padding: 5px 5px
    font-size: 12px
    white-space: nowrap
    text-align: left
    opacity: 0
    z-index: 2
    pointer-events: none

    p
      margin: 0
      padding: 0
      white-space: nowrap
      text-align: left

      span
        font-weight: bold
        display: inline-block
</style>
