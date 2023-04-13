<template>
  <div
    class="FGKRiskReview"
    :style="{
      width: widthFrom,
      height: heightFrom,
    }"
  >
    <div
      v-if="isDataError"
      class="FGKRiskReview__dataError"
    >
      {{ errorMessage }}
    </div>
    <div
      v-show="!isDataError"
      class="row fill-height align-stretch"
    >
      <div class="col-auto">
        <div class="FGKRiskReview__col-title px-3">
          {{ titleColText }}
        </div>
        <div
          class="titles-container px-3"
          :style="titlesContainerStyle"
        >
          <div
            v-for="(title, i) in titles"
            :key="`t-${i}`"
            class="bar-title"
            :style="{
              height: `${barHeight}px`,
              marginTop: `${i === 0 ? 0 : chartPaddingInner}px`
            }"
            v-text="title"
          />
        </div>
      </div>
      <div class="col">
        <div
          ref="svgContainer"
          class="svg-container px-3"
        />
      </div>
      <div class="col-auto">
        <div class="FGKRiskReview__col-title px-3">
          {{ secondTitleColText }}
        </div>
        <div
          class="titles-container titles-container--second px-3"
          :style="titlesContainerStyle"
        >
          <div
            v-for="(title, i) in secondTitles"
            :key="`t-${i}`"
            class="bar-title bar-title--second"
            :style="{
              height: `${barHeight}px`,
              marginTop: `${i === 0 ? 0 : chartPaddingInner}px`
            }"
            v-text="title"
          />
        </div>
      </div>
      <div
        v-if="isVisibleResidualImpactPanel"
        class="col-auto"
      >
        <div class="FGKRiskReview__col-title FGKRiskReview__col-title--residual px-3">
          Остаточное влияние
        </div>
        <div
          class="titles-container titles-container--residual px-3"
          :style="titlesContainerStyle"
        >
          <div
            v-for="(title, i) in residualEffectList"
            :key="`t-${i}`"
            class="bar-title bar-title--residual"
            :style="{
              height: `${barHeight}px`,
              marginTop: `${i === 0 ? 0 : chartPaddingInner}px`
            }"
            v-text="title"
          />
        </div>
      </div>
    </div>
    <div
      v-if="!isDataError"
      class="FGKRiskReview__help-btn"
    >
      <v-tooltip
        top
        :nudge-top="5"
        :color="theme.$accent_ui_color"
      >
        <template v-slot:activator="{ on }">
          <button
            v-on="on"
          >
            <v-icon
              class="control-button edit-icon theme--dark"
              :style="{ color: theme.$secondary_text }"
            >
              {{ iconHelp }}
            </v-icon>
          </button>
        </template>
        <div class="column pa-3">
          <div
            v-for="(part, i) in barParts"
            :key="`legend-${i}`"
            class="d-flex align-center"
            :class="(i + 1) !== barParts.length ? 'mb-2' : ''"
          >
            <div
              class="mr-2"
              :style="{
                backgroundColor: part.fill,
                width: '15px',
                height: '15px',
              }"
            />
            <div
              class="risk-review-legend-container__text"
              v-text="part.title"
            />
          </div>
        </div>
      </v-tooltip>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { mdiHelp } from '@mdi/js';
import defaultBarParts from '../../js/defaultBarParts';

export default {
  name: 'RiskReview',
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
    loading: {
      type: Boolean,
      default: true,
    }, // сообщает что компонент в режиме получения данных
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
    sizeFrom: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    actions: [
      { name: 'click', capture: [] },
    ],
    /** Chart technical data. */
    isDataError: false,
    errorMessage: '',
    dataAttr: '',
    svg: null,
    xScale: null,
    yScale: null,
    marginX: 0,
    marginY: 0,
    barHeight: 0,
    chartPaddingInner: 0,
    chartPaddingOuter: 0,
    /** Chart user config data. */
    titleColName: 'title',
    secondTitleColName: 'second_title',
    residualEffectField: 'ost',
    barParts: defaultBarParts,
    iconHelp: mdiHelp,
  }),
  computed: {
    titlesContainerStyle() {
      const { chartPaddingOuter, marginY } = this;
      return { paddingTop: `${(chartPaddingOuter - 24) + marginY}px` };
    },
    dataset() {
      if (this.dataRestFrom?.length > 0) {
        return this.dataRestFrom;
      }
      return [];
    },
    titles() {
      if (this.dataRestFrom?.length > 0) {
        return this.dataRestFrom.map((ds) => ds[this.titleColName]);
      }
      return [];
    },
    secondTitles() {
      if (this.dataRestFrom?.length > 0) {
        return this.dataRestFrom.map((ds) => ds[this.secondTitleColName]);
      }
      return [];
    },
    residualEffectList() {
      if (this.dataRestFrom?.length > 0) {
        return this.dataRestFrom.map((ds) => ds[this.residualEffectField]);
      }
      return [];
    },
    widthFrom() {
      return `${this.sizeFrom?.width}px` || '100%';
    },
    heightFrom() {
      if (this.sizeFrom?.height) {
        return `${this.sizeFrom.height - 30}px` || '100%';
      }
      return '100%';
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    titleColText() {
      if (this.dataRestFrom?.length > 0) {
        return [...new Set(this.dataRestFrom.map((ds) => ds.title_col))][0];
      }
      return '';
    },
    secondTitleColText() {
      if (this.dataRestFrom?.length > 0) {
        return [...new Set(this.dataRestFrom.map((ds) => ds.second_title_col))][0];
      }
      return '';
    },
    dashFromStore() {
      return this.$store.state[this.idDashFrom];
    },
    optionsFromStore() {
      return this.dashFromStore[this.idFrom].options;
    },
    isVisibleResidualImpactPanel() {
      return this.optionsFromStore?.visibleResidualImpactPanel;
    },
  },
  watch: {
    dataset: {
      deep: true,
      handler(val) {
        if (val?.length > 0) {
          this.render();
          this.updateActionCapture(val);
        }
      },
    },
    sizeFrom: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.render();
        });
      },
    },
  },
  mounted() {
    const { svgContainer } = this.$refs;
    const attrs = svgContainer.getAttributeNames();
    /** Used to support scoped styles. */
    this.$nextTick(() => {
      this.dataAttr = attrs.find((attr) => attr.startsWith('data-'));
      this.render();
    });
  },
  methods: {
    setActions() {
      this.$store.commit('setActions', {
        actions: structuredClone(this.actions),
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
    },
    updateActionCapture(updatedData) {
      if (updatedData?.length > 0) {
        const fields = [];
        updatedData.forEach((el) => {
          fields.push(...Object.keys(el));
        });
        const capture = [...new Set(fields)];
        this.actions = this.actions.map((action) => ({
          ...action,
          capture,
        }));
        this.setActions();
      }
    },
    setTitleColName(name = '') {
      this.titleColName = name;
      this.render();
    },

    setBarParts(barParts) {
      this.barParts = barParts;
      this.render();
    },

    setError(text = '', show = false) {
      this.errorMessage = text;
      this.isDataError = show;
    },

    render() {
      const { isValid, error } = this.validateData();

      if (!isValid) {
        this.setError(error, true);
      } else {
        this.setError('', false);
        this.$nextTick(() => {
          this.clearSvgContainer();
          this.prepareRenderData();
          this.createAxisX();
          this.createBars();
          this.createLines();
        });
      }
    },

    validateData() {
      const { dataset, barParts } = this;

      if (dataset.length <= 0) {
        if (this.loading) {
          return { isValid: false, error: 'Загрузка' };
        }
        return { isValid: false, error: 'Нет данных для построения' };
      }

      if (barParts.length <= 0) {
        return { isValid: false, error: 'Не указаны части столбцов' };
      }

      const dsCols = Object.keys(dataset[0]);

      // eslint-disable-next-line no-restricted-syntax
      for (const id of barParts.map((p) => p.id)) {
        if (!dsCols.includes(id)) {
          return { isValid: false, error: `Отсутствует столбец данных "${id}"` };
        }
      }

      return { isValid: true, error: '' };
    },

    clearSvgContainer() {
      d3.select(this.$refs.svgContainer).select('svg').remove();
    },

    prepareRenderData() {
      const { svgContainer } = this.$refs;

      this.svg = d3.select(svgContainer)
        .append('svg')
        .attr(this.dataAttr, '')
        .attr('class', 'content')
        .append('g')
        .attr('transform', `translate(${this.marginX}, ${this.marginY})`);

      this.svg.append('rect')
        .attr(this.dataAttr, '')
        .attr('class', 'chart-back')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', '100%')
        .attr('height', '100%');

      const extent = [];

      this.barParts.forEach((part) => {
        this.dataset.forEach((ds) => {
          extent.push(ds[part.id]);
        });
      });

      const xDomain = d3.extent(extent);
      const width = svgContainer.offsetWidth - this.marginX * 2;

      this.xScale = d3.scaleLinear()
        .range([35, width - 35])
        .domain(d3.extent(xDomain));

      const padInner = 0.3;
      const padOuter = 0.7;
      const height = svgContainer.offsetHeight - this.marginY * 2;

      this.yScale = d3.scaleBand()
        .range([0, height])
        .domain(this.dataset.map((b, i) => i))
        .paddingInner(padInner)
        .paddingOuter(padOuter);

      this.barHeight = this.yScale.bandwidth();
      this.chartPaddingInner = this.yScale.step() * padInner;
      this.chartPaddingOuter = this.yScale.step() * padOuter;
    },

    createAxisX() {
      const paddingXOfChart = 70;
      const sizeOfChar = 10;
      const paddingXOfChar = 16;
      const sizeOfNumber = this.getMaxCountChars() * sizeOfChar + paddingXOfChar;
      const widthSVGContainer = this.$refs.svgContainer.offsetWidth - this.marginX * 2;
      const axis = this.svg
        .append('g').attr('fill', 'black')
        .call(d3.axisBottom(this.xScale)
          .ticks((widthSVGContainer - paddingXOfChart) / sizeOfNumber));

      // eslint-disable-next-line func-names
      axis.selectAll('.tick line').each(function () {
        d3.select(this).remove();
      });
      const { dataAttr } = this;
      // eslint-disable-next-line func-names
      axis.selectAll('.tick text').each(function () {
        d3.select(this)
          .attr(dataAttr, '')
          .attr('class', 'x-axis-tick-caption');
      });
      axis.select('.domain').remove();
    },

    createBars() {
      const {
        xScale, yScale, barHeight, barParts,
      } = this;
      const halfBarHeight = barHeight / 2;

      // eslint-disable-next-line no-restricted-syntax
      for (const part of barParts) {
        const { id, type } = part;

        // eslint-disable-next-line no-continue
        if (type !== 'bar') continue;

        const {
          fill = 'var(--text_secondary)',
          isTitleShow = false,
          isFullHeight = true,
        } = part;

        const height = isFullHeight ? barHeight : halfBarHeight;

        this.svg.selectAll()
          .data(this.dataset)
          .enter()
          .append('rect')
          .attr('x', (d) => xScale(Math.min(0, d[id])))
          .attr('y', (d, i) => {
            const y = yScale(i);

            if (isTitleShow) {
              const xData = d[id];
              const x = xScale(xData);
              const xAttr = xData >= 0 ? x + 10 : x - 10;
              const yAttr = y + barHeight / 2;
              const anchor = xData >= 0 ? 'start' : 'end';
              this.svg.append('text')
                .text(xData)
                .attr(this.dataAttr, '')
                .attr('class', 'bar-text-caption')
                .attr('fill', fill)
                .attr('text-anchor', anchor)
                .attr('x', xAttr)
                .attr('y', yAttr)
              // eslint-disable-next-line func-names
                .attr('dy', function () {
                  const textHeight = this.getBBox().height;
                  return textHeight / 3;
                });
            }

            return isFullHeight ? y : y + height / 2;
          })
          .attr('fill', fill)
          .attr('height', height)
          .attr('width', (d) => {
            const width = Math.abs(xScale(d[id]) - xScale(0));
            // eslint-disable-next-line no-restricted-globals
            return isNaN(width) ? 0 : width;
          })
          .on('click', (event, d) => {
            this.setTokens(event);
          });
      }
    },

    setTokens(data) {
      const { tockens: tokens } = this.$store.state[this.idDashFrom];
      if (tokens) {
        tokens.forEach(({
          name,
          action,
          capture,
          elem,
        }) => {
          if (elem === this.idFrom) {
            if (action === 'click' && data[capture]) {
              this.$store.commit('setTocken', {
                token: { name, action, capture },
                idDash: this.idDashFrom,
                value: data[capture],
                store: this.$store,
              });
            }
          }
        });
      }
    },

    createLines() {
      const {
        xScale, yScale, barHeight, barParts,
      } = this;
      // eslint-disable-next-line no-restricted-syntax
      for (const part of barParts) {
        const {
          id, type, fill = 'var(--pink)', isTitleShow = true,
        } = part;

        // eslint-disable-next-line no-continue
        if (type !== 'line') continue;

        this.dataset.forEach((bar, i) => {
          const value = bar[id];
          const x = xScale(value);
          const y = yScale(i);
          const line = d3.line();

          this.svg.append('path')
            .attr('stroke', fill)
            .attr('stroke-width', 3)
            .attr('d', line([[x, y - 5], [x, y + barHeight + 5]]));

          if (isTitleShow) {
            this.svg.append('text')
              .text(value)
              .attr(this.dataAttr, '')
              .attr('class', 'bar-text-caption')
              .attr('fill', fill)
              .attr('text-anchor', 'end')
              .attr('x', x - 5)
              .attr('y', y + barHeight / 2)
            // eslint-disable-next-line func-names
              .attr('dy', function () {
                const textHeight = this.getBBox().height;
                return textHeight / 3;
              });
          }
        });
      }
    },

    getMaxCountChars() {
      let maxNumLength = 0;

      this.barParts.forEach((part) => {
        this.dataset.forEach((ds) => {
          const number = ds[part.id];
          const numLength = number.toString().length;
          if (numLength > maxNumLength) {
            maxNumLength = numLength;
          }
        });
      });

      return maxNumLength;
    },
  },
};
</script>

<style lang="scss" scoped>
.FGKRiskReview {
  font-family: 'Proxima Nova', serif;
  position: relative;
  padding: 10px;
  width: 100%;
  & > * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  &__help-btn {
    position: absolute;
    left: 20px;
    bottom: 20px;
  }

  &__col-title {
    color: var(--main_text);
    font-weight: 500;
    text-align: center;
    font-size: 18px;
  }

  &__dataError {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: var(--main_text);
    background-color: var(--background_main);
    .Icon {
      color: var(--border_secondary);
      font-size: 100px;
      margin-bottom: 8px;
    }
  }

  .titles-container {
    color: var(--text_main);
    font-size: 15px;
    display: flex;
    flex-direction: column;
    height: 100%;
    .bar-title {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      text-align: right;
      line-height: 18px;
      color: var(--main_text);
      &--second {
        justify-content: flex-start;
        text-align: left;
      }
      &--residual {
        justify-content: center;
        text-align: center;
        font-size: 24px;
        font-weight: 700;
        color: var(--primary_button);
      }
    }
  }

  .svg-container {
    width: 100%;
    overflow: hidden;
    height: 100%;
    .content {
      width: 100%;
      height: 100%;
    }

    .chart-back {
      fill: var(--main_bg);
    }

    .x-axis-tick-caption {
      fill: var(--main_text);
      font-size: 13px;
      font-weight: 600;
      text-anchor: middle;
    }

    .bar-text-caption {
      font-size: 15px;
      font-weight: 600;
    }
  }

  &.mobileLayout {
    flex-wrap: wrap;
    row-gap: 15px;

    .titles-container {
      max-width: calc(40% - 5px);
    }

    .svg-container {
      max-width: calc(60% - 5px);
    }

    .legend-container {
      align-items: flex-start;
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
}
</style>
