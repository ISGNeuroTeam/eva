<template>
  <div
    ref="pieChart"
    class="piechart-block"
  >
    <div
      v-if="nodata"
      class="nodata"
    >
      {{ message }}
    </div>
    <div
      ref="chartTooltip"
      style="
        position: absolute;
        visibility: hidden;
        border-radius: 3px;
        padding: 5px;
      "
      :style="{
        color: theme.$main_text,
        backgroundColor: theme.$secondary_bg,
        border: `1px solid ${theme.$secondary_border}`,
      }"
    >
      Наведите курсор на график
    </div>

    <div
      v-show="dataLoading || !dataRestFrom.length"
      class="mt-4"
    >
      <p>Нет данных для отображения</p>
    </div>
    <div
      v-show="!dataLoading && !!dataRestFrom.length"
      class="piechart-legend-block"
      :style="{ flexFlow: positionLegends }"
    >
      <div
        ref="piechartItself"
        :class="`dash-piechart ${idFrom}`"
      />
      <div
        ref="legends"
        class="legend-block-pie"
      >
        <div
          v-for="(item, idx) in legends"
          :key="idx"
          class="legend-line"
          :class="
            selectedPieIndex === idx
              ? 'legend-line_selected legend-line_hover'
              : ''
          "
          @mouseover="hoverLegendLine(idx)"
          @mouseleave="hoverLegendLine(null)"
          @click="selectedPieIndex = idx"
        >
          <div
            class="square"
            :style="{ backgroundColor: item.color }"
          />
          <div
            class="text"
            :style="{ color: theme.$main_text }"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  props: {
    // переменные полученные от родителя
    idFrom: {
      type: String,
      required: true,
    }, // id элемнета (table, graph-2)
    idDashFrom: {
      type: String,
      required: true,
    }, // id дашборда
    dataRestFrom: {
      type: Array,
      required: true,
    }, // данные полученые после выполнения запроса
    shouldFrom: null, // меняется в момент выбора источника данных у дашборда
    dataLoadingFrom: null, // сообщает что компонент в режиме получения данных
    widthFrom: {
      type: Number,
      required: true,
    }, // ширина родительского компонента
    heightFrom: {
      type: Number,
      required: true,
    }, // высота родительского компонента
  },
  data() {
    return {
      nodata: true,
      selectedPieIndex: null,
      message: 'Нет данных для отображения',
      legends: [],
      positionLegends: 'row nowrap',
      timeout: '',
      tolate: false,
    };
  },
  computed: {
    idDash() {
      return this.idDashFrom;
    },
    dashFromStore() {
      return this.$store.state[this.idDash][this.idFrom];
    },
    getOptions() {
      if (!this.idDash) {
        return [];
      }
      if (!this.dashFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.idFrom, idDash: this.idDash });
      }

      if (!this.dashFromStore?.options.pinned) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'pinned',
          value: false,
        }]);
      }

      if (!this.dashFromStore.options.lastDot) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'lastDot',
          value: false,
        }]);
      }
      if (!this.dashFromStore.options.stringOX) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'stringOX',
          value: false,
        }]);
      }
      if (!this.dashFromStore?.options.united) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'united',
          value: false,
        }]);
      }

      return this.dashFromStore.options;
    },
    // осоновные параметры, которые чатсо меняются и которы следует отслеживать
    dashOptions() {
      return this.getOptions;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    colors() {
      return {
        neitral: [
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
        ],
        indicted: [
          '#FF7F37',
          '#EB2F2F',
          '#920000',
          '#600000',
          '#D34C00',
          '#660099',
          '#3366FF',
          '#e5194a',
          '#fbbe18',
          '#26295a',
          '#CCCC00',
          '#CC0000',
          '#9933FF',
          '#0099CC',
          '#009966',
          '#FF4500',
          '#FFC125',
          '#FF6A6A',
          '#483D8B',
          '#2F4F4F',
        ],
        custom: [],
      };
    },
    dataLoading() {
      return this.dataLoadingFrom;
    },
    dashSize() {
      return {
        width: this.widthFrom,
        height: this.heightFrom,
      };
    },
    change() {
      return true;
    },
  },
  watch: {
    'dashOptions.colorsPie': {
      handler(val, old) {
        if (val !== old) {
          const graphics = d3
            .select(this.$refs.piechartItself)
            .selectAll('svg')
            .nodes();
          if (graphics.length !== 0) {
            graphics[0].remove();
            this.createPieChartDash();
          } else {
            this.createPieChartDash();
          }
        }
      },
      deep: true,
    },
    selectedPieIndex(newVal) {
      if (newVal !== null) this.setToken(newVal);
    },
    dataRestFrom: {
      immediate: true,
      handler(newVal) {
        if (newVal[0]) {
          const captures = Object.keys(this.dataRestFrom[0]);
          const actions = [{ name: 'click', capture: captures }];

          this.setMetrics();

          this.$store.commit('setActions', {
            actions,
            idDash: this.idDashFrom,
            id: this.idFrom,
          });

          const graphics = d3
            .select(this.$refs.piechartItself)
            .selectAll('svg')
            .nodes();
          if (graphics.length !== 0) {
            graphics[0].remove();
            this.createPieChartDash();
          } else {
            this.createPieChartDash();
          }
        }

        this.$nextTick(() => {
          if (
            this.dataRestFrom
            && Object.keys(this.dataRestFrom).length
            && this.dashSize
          ) {
            const graphics = d3
              .select(this.$refs.piechartItself)
              .selectAll('svg')
              .nodes();

            if (graphics.length !== 0) {
              graphics[0].remove();
              // если строим заново(изменились данные) - очищаем токены
              this.createPieChartDash();
            } else {
              this.createPieChartDash();
            }
          }
        });
      },
    },
  },
  methods: {
    hoverLegendLine(legendLineIndex) {
      d3.select(this.$refs.pieChart)
        .selectAll('.piepart')
        .each((_, i, nodes) => {
          const node = nodes[i];
          if (i === legendLineIndex) node.classList.add('piepartSelect');
          else if (
            node.classList.contains('piepartSelect')
            && this.selectedPieIndex !== i
          ) node.classList.remove('piepartSelect');
        });

      d3.select(this.$refs.legends)
        .selectAll('.legend-line')
        .each((_, i, nodes) => {
          const node = nodes[i];
          if (legendLineIndex === i) {
            node.classList.add('legend-line_hover');
          } else if (node.classList.contains('legend-line_hover')) node.classList.remove('legend-line_hover');
        });
    },
    setMetrics() {
      this.$store.commit('setMetricsPie', {
        metrics: Object.keys(this.dataRestFrom[0]),
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
      this.$store.commit('setThemePie', {
        themes: this.colors,
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
    },
    createPieChartDash() {
      if (this.dataRestFrom.error) {
        // смотрим если с ошибкой
        this.message = this.dataRestFrom.error; // то выводим сообщение о ошибке
      }

      let { showlegend } = this.dashOptions;

      if (showlegend === undefined) {
        showlegend = true;
      }

      let { positionlegend } = this.dashOptions;

      if (positionlegend === undefined) {
        positionlegend = 'right';
      }

      let { colorsPie } = this.dashOptions;

      // SETTING DEFAULT COLORS
      if (colorsPie === undefined) {
        colorsPie = {
          theme: 'neitral',
          colors: '',
          nametheme: '',
        };
      }

      if (this.dashOptions?.metricsRelation?.relations) {
        const metrics = this.dashOptions.metricsRelation.relations;

        if (typeof this.dataRestFrom[0]?.[metrics[1]] === 'number') {
          // если все-таки число
          this.nodata = false; // то убираем соощение о отсутствии данных
          if (this.dataRestFrom.length > 20) {
            // если элемнетов больше 20
            this.nodata = true; // показываем сообщение о некорректности данных
            this.legends = [];
            this.message = 'К сожалению данных слишком много для построения диаграммы'; // выводим сообщение
            d3.select(this.$refs.piechartItself).selectAll('svg').remove(); // и еще график очищаем, чтобы не мешался
          } else {
            this.createLegend(this.dataRestFrom, metrics, showlegend, colorsPie);
            let legendSize = {};
            if (this.legends.length > 0) {
              let timeOut = setTimeout(
                function tick() {
                  // важно чтобы наш график построился
                  // толкьо после того когда создался блок с легендой

                  if (this.$refs.legends.getBoundingClientRect().width !== 0) {
                    legendSize = {
                      width: Math.round(
                        this.$refs.legends.getBoundingClientRect().width,
                      ),
                      height: Math.round(
                        this.$refs.legends.getBoundingClientRect().height,
                      ),
                    };
                    this.createPieChart(
                      this.dataRestFrom,
                      this.dashSize,
                      metrics,
                      legendSize,
                      positionlegend,
                      colorsPie,
                    ); // и собственно создаем график
                    clearTimeout(timeOut);
                  } else {
                    timeOut = setTimeout(tick.bind(this), 100);
                  }
                }.bind(this),
                0,
              );
            } else {
              legendSize = { width: 0, height: 0 };
              this.createPieChart(
                this.dataRestFrom,
                this.dashSize,
                metrics,
                legendSize,
                positionlegend,
                colorsPie,
              ); // и собственно создаем график
            }
          }
        } else {
          // если первое значение первого элемнета (подразумеваем что это time не число)
          this.nodata = true; // показываем сообщение о некорректности данных
          this.message = 'К сожалению данные не подходят к диаграмме'; // выводим сообщение
          this.legends = [];
          d3.select(this.$refs.piechartItself).selectAll('svg').remove(); // и еще график очищаем, чтобы не мешался
        }
      }
    },

    createLegend(data, metrics, showlegend, colorsPie) {
      this.legends = [];
      if (showlegend) {
        const colors = this.dashOptions.themes[colorsPie.theme];
        data.forEach((item, i) => {
          this.legends.push({
            color: colors[i % colors.length],
            label: `${item[metrics[0]]} - ${item[metrics[1]]}`,
          });
        });
      }
    },
    createPieChart(
      dataFrom,
      sizeLine,
      metrics,
      legendSize,
      positionlegend,
      colorsPie,
    ) {
      // создает диаграмму
      d3.select(this.$refs.piechartItself).selectAll('svg').remove();
      const MARGIN = 40; // отступ от контейнера
      let width = sizeLine.width - MARGIN; // отступ по бокам
      let height = sizeLine.height - 35; // минус шапка

      switch (positionlegend) {
        case 'right':
          this.positionLegends = 'row nowrap';
          width -= legendSize.width;
          break;

        case 'left':
          this.positionLegends = 'row-reverse nowrap';
          width -= legendSize.width;
          break;

        case 'top':
          this.positionLegends = 'column-reverse nowrap';
          height = height - legendSize.height - MARGIN;
          break;

        case 'bottom':
          this.positionLegends = 'column nowrap';
          height = height - legendSize.height - MARGIN;
          break;
        default:
          break;
      }

      // радиус диаграммы это половина длины или ширины, смотря что меньше и еще отступ отнимаем
      const radius = Math.min(width, height) / 2 - MARGIN;

      // добовляем svg объект в нужный div
      const svg = d3
        .select(this.$refs.piechartItself)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

      const data = {};

      const selectedDefault = [];

      dataFrom.forEach((item) => {
        data[item[metrics[0]]] = item[metrics[1]];
        selectedDefault.push(item[metrics[2]]);
      });

      const color = d3
        .scaleOrdinal() // устанавливаем цветовую схему для pie chart
        .domain(data)
        .range(this.dashOptions.themes[colorsPie.theme]);

      const pie = d3.pie().value((d) => d.value);
      // eslint-disable-next-line camelcase
      const data_ready = pie(d3.entries(data));

      const tooltipEl = this.$refs.chartTooltip;
      const tooltipOffset = { x: 30, y: 5 };

      const hoverLegendLine = this.hoverLegendLine.bind(this);

      svg
        .selectAll('pies')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d3.arc().innerRadius(0).outerRadius(radius))
        .attr('class', 'piepart')
        .attr('fill', (d) => color(d.data.key))
        .attr('stroke', this.theme.$main_bg)
        .style('stroke-width', '2px')
        .on('mouseover', (d, i, nodes) => {
          const node = nodes[i];
          if (!node.classList.contains('piepartSelect')) nodes[i].classList.add('piepartSelect');
          tooltipEl.textContent = `${d.data.key} - ${d.data.value}`;
          tooltipEl.style.left = `${event.offsetX + tooltipOffset.x}px`;
          tooltipEl.style.top = `${event.offsetY - tooltipOffset.y}px`;
          tooltipEl.style.visibility = 'visible';
          hoverLegendLine(i);
        })
        .on('mousemove', () => {
          tooltipEl.style.left = `${event.offsetX + tooltipOffset.x}px`;
          tooltipEl.style.top = `${event.offsetY - tooltipOffset.y}px`;
        })
        .on('mouseout', (_, i, nodes) => {
          if (i !== this.selectedPieIndex) nodes[i].classList.remove('piepartSelect');
          tooltipEl.style.visibility = 'hidden';
          hoverLegendLine(null);
        })
        .on('click', (_, i, nodes) => {
          const node = nodes[i];
          if (this.selectedPieIndex === i) {
            this.selectedPieIndex = null;
            node.classList.remove('piepartSelect');
          } else {
            this.selectedPieIndex = i;
            node.classList.add('piepartSelect');
          }
        });
    },
    setToken(pieIndex) {
      const tokens = this.$store.state[this.idDashFrom].tockens;

      tokens.forEach((tocken) => {
        if (tocken.elem === this.idFrom) {
          const value = this.dataRestFrom[pieIndex][tocken.capture];
          this.$store.commit('setTocken', {
            token: tocken,
            value,
            idDash: this.idDashFrom,
            store: this.$store,
          });
        }
      });
    },
  },
};
</script>

<style lang="sass">
@import '../../sass/dashPieChart.sass'
</style>
