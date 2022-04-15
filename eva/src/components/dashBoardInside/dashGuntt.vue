<template>
  <div
    class="dash-guntt"
    :class="idDashClass()"
  >
    <div
      v-if="!noMsg && guntt && guntt.getPhases.length > 0"
      class="legend-block"
    >
      <div
        v-for="(item, index) in guntt.getPhases"
        :key="`${item}${index}`"
        class="legends-itself"
      >
        <div
          class="circle"
          :style="{ backgroundColor: colors[index] }"
        />
        <div class="text">
          {{ item }}
        </div>
      </div>
    </div>
    <div
      v-if="!noMsg"
      ref="gunttBlock"
      class="guntt-block"
    />
    <div
      ref="tooltip"
      class="tooltipGuntt"
      :style="{
        backgroundColor: colorFrom.$secondary_bg,
        border: `1px solid ${colorFrom.$main_text}`,
      }"
    />
    <div
      v-if="noMsg"
      class="mt-4"
    >
      {{ msgText }}
    </div>
  </div>
</template>

<script>
import GunttClass from '../../js/classes/GunttClass';

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
    colorFrom: {
      type: Object,
      required: true,
    }, // цветовые переменные
    widthFrom: {
      type: Number,
      required: true,
    }, // ширина родительского компонента
    heightFrom: {
      type: Number,
      required: true,
    }, // высота родительского компонента
    timeFormatFrom: {
      type: String,
      required: true,
    }, // настройки родительского компонента
    activeElemFrom: {
      type: String,
      default: '',
    },
    dataReport: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      actions: [{ name: 'click', capture: [] }],
      msgText: 'Нет данных для отображения',
      noMsg: true,
      colors: [
        this.colorFrom.controls || this.colorFrom.$accent_ui_color,
        this.colorFrom.controlsActive || this.colorFrom.$primary_button_hover,
        '#660099',
        '#3366FF',
        '#e5194a',
        '#fbbe18',
        '#26295a',
        '#228B22',
      ],
      legends: [],
      firstTime: true, // определяем первый ли раз зашли на страницу, ничего лучше не придумал
      guntt: null,
    };
  },
  computed: {
    // осоновные параметры, которые чатсо меняются и которы следует отслеживать
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },
    getTockens() {
      return this.$store.state[this.idDash].tockens;
    },
  },
  watch: {
    dataRestFrom() {
      this.dataRestFromWatch();
    },
    colorFrom() {
      if (this.dataRestFrom.length > 0) {
        if (this.dataRestFrom[0].start_date && this.dataRestFrom[0].end_date) {
          if (this.dataReport) {
            if (this.activeElemFrom === this.id) {
              this.prepareChart(this.dataRestFrom);
            } else if (this.guntt) {
              this.guntt.removeGuntt();
            }
          } else {
            this.prepareChart(this.dataRestFrom);
          }
        } else {
          this.msgText = 'Данные не подходят для построения диаграммы гантта';
          this.noMsg = true;
        }
      } else {
        this.msgText = 'Нет данных для отображения';
        this.noMsg = true;
      }
    },
    timeFormatFrom() {
      if (this.dataRestFrom.length > 0) {
        if (this.dataRestFrom[0].start_date && this.dataRestFrom[0].end_date) {
          if (this.dataReport) {
            if (this.activeElemFrom === this.id) {
              this.prepareChart(this.dataRestFrom);
            } else if (this.guntt) {
              this.guntt.removeGuntt();
            }
          } else {
            this.prepareChart(this.dataRestFrom);
          }
        } else {
          this.msgText = 'Данные не подходят для построения диаграммы гантта';
          this.noMsg = true;
        }
      } else {
        this.msgText = 'Нет данных для отображения';
        this.noMsg = true;
      }
    },
    widthFrom() {
      if (this.dataRestFrom.length > 0) {
        if (this.dataRestFrom[0].start_date && this.dataRestFrom[0].end_date) {
          this.hiddenTooltip();
          if (this.dataReport) {
            if (this.activeElemFrom === this.id) {
              this.prepareChart(this.dataRestFrom);
            } else if (this.guntt) {
              this.guntt.removeGuntt();
            }
          } else {
            this.prepareChart(this.dataRestFrom);
          }
        }
      }
    },
    heightFrom() {
      if (this.dataRestFrom.length > 0) {
        if (this.dataRestFrom[0].start_date && this.dataRestFrom[0].end_date) {
          if (this.dataReport) {
            if (this.activeElemFrom === this.id) {
              this.prepareChart(this.dataRestFrom);
            } else if (this.guntt) {
              this.guntt.removeGuntt();
            }
          } else {
            this.prepareChart(this.dataRestFrom);
          }
        }
      }
    },
  },
  mounted() {
    this.dataRestFromWatch();
    this.$emit('setVissible', { element: this.id, overflow: 'hidden' });
  },
  methods: {
    hiddenTooltip() {
      const tooltipBlock = this.$refs.tooltip;
      tooltipBlock.style.opacity = '0';
      tooltipBlock.style.visibility = 'hidden';
    },
    dataRestFromWatch() {
      this.$nextTick(() => {
        if (this.dataRestFrom && Object.keys(this.dataRestFrom).length !== 0) {
          if (
            this.dataRestFrom[0].start_date
              && this.dataRestFrom[0].end_date
          ) {
            if (this.dataReport) {
              if (this.activeElemFrom === this.id) {
                this.noMsg = false;
                this.prepareChart(this.dataRestFrom);
              } else if (this.guntt) {
                this.guntt.removeGuntt();
              }
            } else {
              this.noMsg = false;
              this.prepareChart(this.dataRestFrom);
            }
          } else {
            this.msgText = 'Данные не подходят для построения диаграммы гантта';
            this.noMsg = true;
          }
        } else {
          this.msgText = 'Нет данных  для отображения';
          this.noMsg = true;
        }
      });
    },
    idDashClass() {
      return `dash-guntt-${this.id}`;
    },
    prepareChart(dataRest) {
      const prom = new Promise((resolve) => {
        // создаем promise чтобы затем отрисовать график асинхронно

        const sizeChart = { width: 0, height: 0 }; // получаем размеры от родителя
        sizeChart.width = this.widthFrom;
        sizeChart.height = this.heightFrom;

        this.actions[0].capture = Object.keys(dataRest[0]);

        if (
          this.$store.state[this.idDash][this.idFrom].actions?.length
          !== this.actions.length
        ) {
          this.$store.commit('setActions', {
            actions: this.actions,
            idDash: this.idDash,
            id: this.id,
          });
        }
        resolve(sizeChart);
      });

      prom.then((sizeChart) => {
        // как раз тут делаем асинхронность
        this.createChart(sizeChart, this, dataRest);
      });
    },
    createChart(sizeChart, that, dataRest) {
      const margin = {
        top: 20,
        right: 20,
        bottom: window.screen.width <= 1600 ? 10 : 30,
        left: 20,
      };
      const paddings = {
        right: 80,
        left: window.screen.width > 1920 ? 90 : 70,
      };
      const timeAxisStyles = {
        height: window.screen.width > 1920 ? 60 : 50,
        paddingTop: window.screen.width > 1920 ? 15 : 10,
        paddingLeft: window.screen.width < 1400 ? -10 : 0,
      };
      const width = sizeChart.width - margin.left - margin.right;
      const height = sizeChart.height - margin.top - margin.bottom;
      const dateFormat = this.timeFormatFrom || '%Y-%m-%d %H:%M:%S';

      const data = [];
      dataRest.forEach((item) => {
        data.push({ ...{}, ...item });
      });
      if (this.guntt) {
        this.guntt.removeGuntt();
      }

      this.guntt = new GunttClass({
        elem: this.$refs.gunttBlock,
        width,
        height,
        margin,
        textColor: this.colorFrom.text || 'white',
        colors: this.colors,
        paddings,
        timeAxisStyles,
        data,
        dateFormat,
        tooltipElem: this.$refs.tooltip,
      });

      if (this.guntt.getPhases.length > 0) {
        this.legends = this.guntt.getPhases;
      }

      // Tooltip
      const tooltipBlock = this.$refs.tooltip;
      const tooltipMargin = this.$attrs['is-full-screen'] ? 200 : 30;

      function transformDescription(text) {
        let rows = text.split('\\n');
        rows = rows.map((item) => `<p class="row-toolrip">${item}</p>`);
        return rows.join('');
      }

      this.guntt.setEventsOnLines([
        {
          name: 'mouseover',
          callback: (event) => {
            let tooltip = '';

            if (data[0].description) {
              tooltip = transformDescription(event.description);
            } else {
              Object.keys(event).forEach((key) => {
                tooltip += `<p class="row-toolrip"><span>${key}</span>: ${event[key]}</p>`;
              });
            }
            this.guntt.moveTooltip(tooltipMargin);
            tooltipBlock.innerHTML = tooltip;
            tooltipBlock.style.opacity = '0.9';
            tooltipBlock.style.visibility = 'visible';
          },
        },
        {
          name: 'mousemove',
          callback: () => {
            this.guntt.moveTooltip(tooltipMargin);
          },
        },
        {
          name: 'mouseout',
          callback: () => {
            tooltipBlock.style.opacity = '0';
            tooltipBlock.style.visibility = 'hidden';
          },
        },
        {
          name: 'click',
          callback: (d) => that.setClick(d),
        },
      ]);

      this.guntt.setEventsOnTexts([
        {
          name: 'mouseover',
          callback: () => {
            tooltipBlock.style.opacity = '0.9';
            tooltipBlock.style.visibility = 'visible';
          },
        },
        {
          name: 'mousemove',
          callback: () => {
            this.guntt.moveTooltip(tooltipMargin);
          },
        },
        {
          name: 'mouseout',
          callback: () => {
            tooltipBlock.style.opacity = '0';
            tooltipBlock.style.visibility = 'hidden';
          },
        },
        {
          name: 'click',
          callback: (d) => that.setClick(d),
        },
      ]);
    },

    setClick(item) {
      const tockens = this.getTockens;
      let tocken = {};

      Object.keys(tockens).forEach((i) => {
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture,
        };
        if (tockens[i].elem === this.id && tockens[i].action === 'click') {
          this.$store.commit('setTocken', {
            token: tocken,
            idDash: this.idDash,
            value: item[tockens[i].capture],
            store: this.$store,
          });
        }
      });
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashGuntt.sass';
</style>
