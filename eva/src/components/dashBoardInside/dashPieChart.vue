<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      ref="pieChart"
      class="piechart-block"
    >
      <div
        v-if="nodata"
        class="nodata"
        :style="{
          color: theme.$main_text,
        }"
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
              selectedPie === idx
                ? 'legend-line_selected legend-line_hover'
                : ''
            "
            @mouseover="hoverLegendLine(idx)"
            @mouseleave="hoverLegendLine(-1)"
            @click="activateLegend(idx)"
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
  </portal>
</template>

<script>
import PiechartClass from '../../js/classes/PiechartClass';

export default {
  name: 'PieChart',
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
    sizeFrom: {
      type: Object,
      required: true,
    },
    isFullScreen: {
      type: Boolean,
      default: false,
    },
    fullScreenMode: {
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
      selectedPie: -1,
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
      if (!this.dashFromStore?.options) {
        this.$store.commit('setDefaultOptions', { id: this.idFrom, idDash: this.idDash });
      }

      if (!this.dashFromStore.options.pieType) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'pieType',
          value: 'pie',
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
      return this.sizeFrom;
    },
    change() {
      return true;
    },
    isDonat() {
      return this.dashOptions.pieType === 'donat';
    },
  },
  watch: {
    'dashOptions.colorsPie': {
      handler(val, old) {
        if (val && JSON.stringify(val) !== JSON.stringify(old)) {
          this.changePieChart();
        }
      },
      deep: true,
    },
    'dashOptions.positionlegend': {
      handler(val, old) {
        if (val && val !== old) {
          this.piechart.size = this.calculatedSize(this.legendSize());
        }
      },
      deep: true,
    },
    'dashOptions.metricsRelation': {
      deep: true,
      handler(val, old) {
        if (val && val !== old) {
          this.changePieChart();
        }
      },
    },
    isDonat(val) {
      if (val !== this.piechart?.isDonat) {
        this.piechart.isDonat = val;
        this.setActiveLegendLine(this.selectedPie);
      }
    },
    sizeFrom: {
      deep: true,
      handler(val, old) {
        if (JSON.stringify(val) !== JSON.stringify(old) && this.piechart) {
          this.piechart.size = this.calculatedSize(this.legendSize());
          this.setActiveLegendLine(this.selectedPie);
        }
      },
    },
    selectedPie(newVal) {
      if (newVal !== -1) this.setToken(newVal);
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
    fullScreenMode() {
      let legendSize = {};
      if (this.legends.length > 0) { legendSize = this.legendSize(); }
      this.$nextTick(() => {
        this.createPieChartDash(legendSize);
      });
    },
  },
  methods: {
    legendSize() {
      if (this.$refs.legends.getBoundingClientRect().width !== 0 && this.legends.length > 0) {
        return {
          width: Math.round(
            this.$refs.legends.getBoundingClientRect().width,
          ),
          height: Math.round(
            this.$refs.legends.getBoundingClientRect().height,
          ),
        };
      }
      return {
        width: 0,
        height: 0,
      };
    },
    calculatedSize(legendSize) {
      const MARGIN = 40; // отступ от контейнера
      let width = this.sizeFrom.width - MARGIN; // отступ по бокам
      let height = this.sizeFrom.height - 35; // минус шапка

      switch (this.dashOptions.positionlegend || 'right') {
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

      return {
        width,
        height,
      };
    },
    hoverLegendLine(legendLineIndex) {
      this.setActiveLegendLine(legendLineIndex);
    },
    setActiveLegendLine(legendLineIndex) {
      if (this.piechart) {
        this.piechart.selectActivePiepart(this.selectedPie, legendLineIndex);
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
    createPieChartDash(legendSize) {
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
            if (this.legends.length > 0) {
              this.$nextTick(() => {
                // TODO: Поправить передачу параметров
                this.createPieChart(
                  this.dataRestFrom,
                  this.dashSize,
                  metrics,
                  legendSize || this.legendSize(),
                  positionlegend,
                  colorsPie,
                ); // и собственно создаем график
                this.setActiveLegendLine(this.selectedPie);
              });
            } else {
              this.$nextTick(() => {
              // TODO: Поправить передачу параметров
                this.createPieChart(
                  this.dataRestFrom,
                  this.dashSize,
                  metrics,
                  { width: 0, height: 0 },
                  positionlegend,
                  colorsPie,
                ); // и собственно создаем график
                this.setActiveLegendLine(this.selectedPie);
              });
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
    activateLegend(idx) {
      if (this.selectedPie === idx) {
        this.selectedPie = -1;
      } else {
        this.selectedPie = idx;
      }
      this.piechart.activetetPiepart(this.selectedPie, idx);
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
      const { width, height } = this.calculatedSize(legendSize);

      const data = {};

      const selectedDefault = [];

      dataFrom.forEach((item) => {
        data[item[metrics[0]]] = item[metrics[1]];
        selectedDefault.push(item[metrics[2]]);
      });

      const tooltipEl = this.$refs.chartTooltip;

      const tooltipOffset = { x: 30, y: 5 };

      const piechart = new PiechartClass({
        elem: this.$refs.piechartItself,
        elemForLegend: this.$refs.legends,
        width,
        height,
        data,
        colors: this.dashOptions.themes[colorsPie.theme],
        isDonat: this.isDonat,
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
            if (i !== this.selectedPie) nodes[i].classList.remove('piepartSelect');
            tooltipEl.style.visibility = 'hidden';
            this.hoverLegendLine(-1);
          },
        },
        {
          eventName: 'click',
          callback: (_, i, nodes) => {
            const node = nodes[i];
            nodes.forEach((item) => {
              if (item !== node) {
                item.classList.remove('piepartSelect');
              }
            });
            if (this.selectedPie === i) {
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
