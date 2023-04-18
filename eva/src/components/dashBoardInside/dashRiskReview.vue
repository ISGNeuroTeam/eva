<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      class="FGKRiskReview"
      :style="{
        ...customStyle,
        'width': `${sizeFrom.width - 22}px`,
        'height': `${sizeFrom.height - 60}px`,
        background: isPanelBackHide ? 'transparent' : theme.$secondary_bg,
        margin: '0 10px',
      }"
      :class="customClass"
      v-bind="$attrs"
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
        <div class="col-3">
          <div
            class="FGKRiskReview__col-title px-3"
            :class="leftTitle ? '' : 'py-3'"
          >
            {{ leftTitle }}
          </div>
          <div
            class="titles-container px-3"
            :style="titlesContainerStyle"
          >
            <div
              v-for="(item, i) in titles"
              :key="`t-${i}`"
              class="FGKRiskReview__left-text"
              :style="{
                height: `${barHeight}px`,
                marginTop: `${i === 0 ? 0 : chartPaddingInner}px`
              }"
            >
              <div
                v-if="item.title"
                class="bar-title"
              >
                {{ item.title }}:
              </div>
              <div class="bar-list">
                <div
                  v-for="(listItem, listIndex) in item.list"
                  :key="`left-${i}-${listIndex}`"
                  class="bar-list__item"
                >
                  {{ listIndex + 1 }}. {{ listItem.title }}
                  <span
                    v-if="listItem.value"
                    class="bar-list__value-text"
                  >
                    (<span
                      class="bar-list__value"
                      :style="{
                        color: valueColor,
                      }"
                    >{{ listItem.value >= 0 ? '+' : '-' }}{{ listItem.value }}</span>)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col">
          <div
            ref="svgContainer"
            class="svg-container"
          />
        </div>
        <div class="col-3">
          <div
            class="FGKRiskReview__col-title px-3"
            :class="leftTitle ? '' : 'py-3'"
          >
            {{ rightTitle }}
          </div>
          <div
            class="titles-container titles-container--second px-3"
            :style="titlesContainerStyle"
          >
            <div
              v-for="(item, i) in secondTitles"
              :key="`t-${i}`"
              class="FGKRiskReview__right-text"
              :style="{
                height: `${barHeight}px`,
                marginTop: `${i === 0 ? 0 : chartPaddingInner}px`
              }"
            >
              <div
                v-if="item.title"
                class="bar-title bar-title--second"
              >
                {{ item.title }}
              </div>
              <div class="bar-list bar-list--second">
                <div
                  v-for="(listItem, listIndex) in item.list"
                  :key="`right-${i}-${listIndex}`"
                  class="bar-list__item bar-list__item--second"
                >
                  {{ listIndex + 1 }}. {{ listItem.title }}
                  <span
                    v-if="listItem.value"
                    class="bar-list__value-text bar-list__value-text--second"
                  >
                    (<span
                      class="bar-list__value bar-list__value--second"
                      :style="{
                        color: secondValueColor,
                      }"
                    >{{ listItem.value >= 0 ? '+' : '-' }}{{ listItem.value }}</span>)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="isVisibleResidualImpactPanel"
          class="col-2"
        >
          <div class="FGKRiskReview__col-title FGKRiskReview__col-title--residual">
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
          :color="theme.$secondary_bg"
        >
          <template v-slot:activator="{ on }">
            <button
              v-on="on"
            >
              <v-icon
                class="control-button edit-icon theme--dark"
                :style="{ color: theme.$main_text }"
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
  </portal>
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
    marginX: 40,
    marginY: 0,
    barHeight: 0,
    chartPaddingInner: 0,
    chartPaddingOuter: 0,
    /** Chart user config data. */
    titleColName: 'risk_name',
    listColName: 'riskfactor_name',
    listColValue: 'riskfactor_value',
    secondListColName: 'measure_name',
    secondListColValue: 'measure_value',
    residualEffectField: 'residual',
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
        return this.dataRestFrom.map((elem) => this.getFormattedTitles(
          elem,
          {
            titleColName: this.titleColName,
            listColName: this.listColName,
            listColValue: this.listColValue,
          },
        ));
      }
      return [];
    },
    formattedTitles() {
      if (this.dataRestFrom?.length > 0) {
        return this.dataRestFrom.map((ds) => ds[this.titleColName]);
      }
      return [];
    },
    secondTitles() {
      if (this.dataRestFrom?.length > 0) {
        return this.dataRestFrom.map((elem) => this.getFormattedTitles(
          elem,
          {
            listColName: this.secondListColName,
            listColValue: this.secondListColValue,
          },
        ));
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
    dashFromStore() {
      return this.$store.state[this.idDashFrom];
    },
    optionsFromStore() {
      return this.dashFromStore[this.idFrom].options;
    },
    isVisibleResidualImpactPanel() {
      return this.optionsFromStore?.visibleResidualImpactPanel;
    },
    isPanelBackHide() {
      return this.dashFromStore[this.idFrom].options?.panelBackHide || false;
    },
    barParts() {
      if (this.optionsFromStore.primitivesLibrary) {
        return JSON.parse(this.optionsFromStore.primitivesLibrary);
      }
      return [];
    },
    leftTitle() {
      return this.optionsFromStore.leftTitle || '';
    },
    rightTitle() {
      return this.optionsFromStore.rightTitle || '';
    },
    valueColor() {
      return this.optionsFromStore.leftValueColor || this.theme.main_text;
    },
    secondValueColor() {
      return this.optionsFromStore.rightValueColor || this.theme.main_text;
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
        if (!this.fullScreenMode) {
          this.$nextTick(() => {
            this.$nextTick(() => {
              this.render();
            });
          });
        }
      },
    },
    fullScreenMode(val) {
      if (val) {
        this.$nextTick(() => {
          this.$nextTick(() => {
            this.render();
          });
        });
      }
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
        xScale, yScale, barHeight, barParts, toDivide,
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
                .text(Number(xData) >= 0 ? `+${toDivide(xData)}` : `-${toDivide(xData)}`)
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

    getFormattedTitles(elem, {
      titleColName = '',
      listColName,
      listColValue,
    }) {
      const result = {
        list: [],
      };
      if (titleColName && elem[titleColName]) {
        result.title = elem[titleColName];
      }

      Object.keys(elem).forEach((key) => {
        if (key.includes(listColName) || key.includes(listColValue)) {
          const fieldName = key.includes(listColName)
            ? listColName
            : listColValue;
          const index = key.replace(`${fieldName}_`, '');
          const listKey = key.includes(listColName)
            ? 'title'
            : 'value';
          // const colorFrom = defaultBarParts.find((el) => el.id === );
          if (index) {
            if (!result.list[index]) {
              result.list[index] = {
                [listKey]: listKey === 'value' ? this.toDivide(elem[key]) : elem[key],
              };
            } else {
              result.list[index][listKey] = listKey === 'value' ? this.toDivide(elem[key]) : elem[key];
            }
          }
        }
      });
      return result;
    },
    toDivide(number) {
      return number.toLocaleString()
        .replace(',', ' ');
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
    white-space: nowrap;
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
    .Icon {
      color: var(--border_secondary);
      font-size: 100px;
      margin-bottom: 8px;
    }
  }

  &__left-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    text-align: left;
  }

  .titles-container {
    color: var(--main_text);
    font-size: 15px;
    display: flex;
    flex-direction: column;
    height: 100%;
    .bar-title {
      font-weight: bold;
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
    .bar-list {
      color: var(--secondary_text);
      &--second {
        text-align: left;
      }
      &__value {
        font-weight: bold;
      }
      &__value-text {
        white-space: nowrap;
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
      fill: transparent;
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
