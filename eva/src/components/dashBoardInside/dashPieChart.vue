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
        :class="dashOptions.positionlegend === 'top'
          || dashOptions.positionlegend === 'bottom'
          ? 'legend-block-pie__horizontally'
          : 'legend-block-pie__vertically'"
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
          @mouseleave="hoverLegendLine(-1)"
          @click="selectedPie = idx"
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
import PiechartClass from '../../js/classes/PiechartClass';

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
    selectedPieIndex: {
      type: Number,
      default: -1,
    }, // индекс активного элемента
    isFullScreen: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      nodata: true,
      message: 'Нет данных для отображения',
      legends: [],
      positionLegends: 'row nowrap',
      timeout: '',
      piechart: null,
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
    selectedPie: {
      get() {
        return this.selectedPieIndex;
      },
      set(val) {
        this.$emit('changeSelectPie', val);
      },
    },
  },
  watch: {
    'dashOptions.colorsPie': {
      handler(val, old) {
        if (val && val !== old) {
          this.changePieChart();
        }
      },
      deep: true,
    },
    'dashOptions.positionlegend': {
      handler(val, old) {
        if (val && val !== old) {
          this.changePieChart();
        }
      },
      deep: true,
    },
    widthFrom(val, old) {
      if (val !== old) {
        this.changePieChart();
      }
    },
    heightFrom(val, old) {
      if (val !== old) {
        this.changePieChart();
      }
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
          this.createPieChartDash();
        }
      },
    },
  },
  methods: {
    hoverLegendLine(legendLineIndex) {
      this.setActiveLegendLine(legendLineIndex);
    },
    setActiveLegendLine(legendLineIndex) {
      if (this.piechart) {
        this.piechart.selectActivePiepart(this.selectedPieIndex, legendLineIndex);
        this.piechart.selectActiveLegendLine(legendLineIndex, 'legend-line');
      }
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
            this.piechart.removePiechart(); // и еще график очищаем, чтобы не мешался
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
                    this.setActiveLegendLine(this.selectedPieIndex);
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
              this.setActiveLegendLine(this.selectedPieIndex);
            }
          }
        } else {
          // если первое значение первого элемнета (подразумеваем что это time не число)
          this.nodata = true; // показываем сообщение о некорректности данных
          this.message = 'К сожалению данные не подходят к диаграмме'; // выводим сообщение
          this.legends = [];
          this.piechart.removePiechart(); // и еще график очищаем, чтобы не мешался
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
      if (this.piechart) {
        this.piechart.removePiechart();
      }
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

      const data = {};

      const selectedDefault = [];

      dataFrom.forEach((item) => {
        data[item[metrics[0]]] = item[metrics[1]];
        selectedDefault.push(item[metrics[2]]);
      });

      // const hoverLegendLine = this.hoverLegendLine;
      const tooltipEl = this.$refs.chartTooltip;

      const tooltipOffset = { x: 30, y: 5 };

      const piechart = new PiechartClass({
        elem: this.$refs.piechartItself,
        elemForLegend: this.$refs.legends,
        width,
        height,
        margin: MARGIN,
        data,
        colors: this.dashOptions.themes[colorsPie.theme],
      });

      this.piechart = Object.freeze(piechart);

      this.piechart.setEvents([
        {
          eventName: 'mouseover',
          callback: (d, i, nodes) => {
            const node = nodes[i];
            if (!node.classList.contains('piepartSelect')) nodes[i].classList.add('piepartSelect');
            tooltipEl.textContent = `${d.data.key} - ${d.data.value}`;
            // eslint-disable-next-line no-restricted-globals
            tooltipEl.style.left = `${event.offsetX + tooltipOffset.x}px`;
            // eslint-disable-next-line no-restricted-globals
            tooltipEl.style.top = `${event.offsetY - tooltipOffset.y}px`;
            tooltipEl.style.visibility = 'visible';
            this.hoverLegendLine(i);
          },
        },
        {
          eventName: 'mousemove',
          callback: () => {
            // eslint-disable-next-line no-restricted-globals
            tooltipEl.style.left = `${event.offsetX + tooltipOffset.x}px`;
            // eslint-disable-next-line no-restricted-globals
            tooltipEl.style.top = `${event.offsetY - tooltipOffset.y}px`;
          },
        },
        {
          eventName: 'mouseout',
          callback: (_, i, nodes) => {
            if (i !== this.selectedPieIndex) nodes[i].classList.remove('piepartSelect');
            tooltipEl.style.visibility = 'hidden';
            this.hoverLegendLine(-1);
          },
        },
        {
          eventName: 'click',
          callback: (_, i, nodes) => {
            const node = nodes[i];
            if (this.selectedPieIndex === i) {
              this.selectedPie = -1;
              node.classList.remove('piepartSelect');
            } else {
              this.selectedPie = i;
              node.classList.add('piepartSelect');
            }
          },
        },
      ]);
    },
    setToken(pieIndex) {
      const tokens = this.$store.state[this.idDashFrom].tockens;
      if (tokens?.length > 0) {
        tokens.forEach((tocken) => {
          if (tocken.elem === this.idFrom) {
            const value = ` ${this.dataRestFrom[pieIndex][tocken.capture]} `;
            this.$store.commit('setTocken', {
              token: tocken,
              value,
              idDash: this.idDashFrom,
              store: this.$store,
            });
          }
        });
      }
    },
    changePieChart() {
      this.createPieChartDash();
    },
  },
};
</script>

<style lang="sass">
@import '../../sass/dashPieChart.sass'
</style>
