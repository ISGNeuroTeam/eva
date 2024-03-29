<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      class="dash-guntt"
      v-bind="$attrs"
      :style="customStyle"
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
            :style="{ backgroundColor: getPhasesColor(item)
              ? getPhasesColor(item)
              : colors[index] }"
          />
          <div class="text">
            {{ item }}
          </div>
        </div>
      </div>
      <div
        v-if="!noMsg"
        ref="gunttBlock"
        key="gunttBlock"
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
  </portal>
</template>

<script>
import GunttClass from '../../js/classes/GunttClass';

export default {
  name: 'DashGuntt',
  inheritAttrs: false,
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
    sizeFrom: {
      type: Object,
      required: true,
    },
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
    customStyle: {
      type: Object,
      default: () => ({}),
    },
    customClass: {
      type: String,
      default: '',
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
    sizeFrom: {
      deep: true,
      handler(val, oldVal) {
        if (JSON.stringify(val) !== JSON.stringify(oldVal)) {
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
        }
      },
    },
    fullScreenMode(val) {
      this.$nextTick(() => {
        if (val) {
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
        }
      });
    },
  },
  mounted() {
    if (this.dataRestFrom?.length > 0) {
      this.dataRestFromWatch();
      this.$emit('setVissible', { element: this.id, overflow: 'hidden' });
    }
  },
  methods: {
    hiddenTooltip() {
      const tooltipBlock = this.$refs.tooltip;
      if (tooltipBlock) {
        tooltipBlock.style.opacity = '0';
        tooltipBlock.style.visibility = 'hidden';
      }
    },
    dataRestFromWatch() {
      this.$nextTick(() => {
        if (this.dataRestFrom?.length > 0) {
          if (
            this.dataRestFrom[0].start_date
              && this.dataRestFrom[0].end_date
          ) {
            if (this.dataReport) {
              if (this.activeElemFrom === this.id) {
                this.noMsg = false;
                if (this.guntt) {
                  this.guntt.removeGuntt();
                }
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
      return `dash-guntt-${this.id} ${this.customClass}`;
    },
    prepareChart(dataRest) {
      const prom = new Promise((resolve) => {
        // создаем promise чтобы затем отрисовать график асинхронно

        const sizeChart = { width: 0, height: 0 }; // получаем размеры от родителя
        sizeChart.width = this.sizeFrom.width;
        sizeChart.height = this.sizeFrom.height;

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
      const guntt = new GunttClass({
        elem: this.$refs.gunttBlock,
        width,
        height,
        margin,
        textColor: this.colorFrom.$main_text || 'white',
        colors: this.colors,
        paddings,
        timeAxisStyles,
        data,
        dateFormat,
        tooltipElem: this.$refs.tooltip,
      });
      this.guntt = Object.freeze(guntt);

      if (this.guntt.getPhases.length > 0) {
        this.legends = this.guntt.getPhases;
      }

      // Tooltip
      const tooltipBlock = this.$refs.tooltip;
      const tooltipMargin = 30;
      let tooltipWidth;

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

            tooltipBlock.innerHTML = tooltip;
            tooltipBlock.style.opacity = '0.9';
            tooltipBlock.style.visibility = 'visible';
            tooltipWidth = tooltipBlock.clientWidth;
            this.guntt.moveTooltip({
              offsetX: tooltipMargin,
              dashboardWidth: this.sizeFrom.width,
              tooltipWidth,
            });
          },
        },
        {
          name: 'mousemove',
          callback: () => {
            this.guntt.moveTooltip({
              offsetX: tooltipMargin,
              dashboardWidth: this.sizeFrom.width,
              tooltipWidth,
            });
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
      this.$store.commit('tokenAction', {
        idDash: this.idDash,
        elem: this.id,
        action: 'click',
        value: item,
      });
    },
    getPhasesColor(phases) {
      return this.dataRestFrom.find((item) => item.phase === phases)?.color || null;
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashGuntt.sass';
</style>
