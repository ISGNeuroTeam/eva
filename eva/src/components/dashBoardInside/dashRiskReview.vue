<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      class="risk-review"
      :style="{
        ...customStyle,
        'width': `${widthFrom}px`,
        'height': `${heightFromOuter}px`,
        background: isPanelBackHide ? 'transparent' : theme.$secondary_bg,
        margin: '0 10px',
      }"
      :class="customClass"
      v-bind="$attrs"
    >
      <div
        v-if="isDataError || filteredData.length === 0"
        class="risk-review__dataError"
      >
        {{ errorMessage || 'Данные не отображаются из-за настроек' }}
      </div>
      <div
        v-show="!isDataError"
        :style="{
          'width': `${widthFrom}px`,
          'height': `${heightFromInner}px`,
          ...gridStyles,
        }"
        class="risk-review__grid-container"
      >
        <div
          v-if="listColName || listColValue || leftTitle"
          class="risk-review__left-descriptions"
        >
          <div
            class="risk-review__col-title pl-3 pr-2"
            :style="{
              height: leftTitle ? 'auto' : '27px',
            }"
          >
            {{ leftTitle }}
          </div>
          <div
            class="titles-container pl-3 pr-2"
            :style="titlesContainerStyle"
          >
            <div
              v-for="(item, i) in titles"
              :key="`t-${i}`"
              class="risk-review__left-text"
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
                <template v-for="(listItem, listIndex) in item.list">
                  <div
                    v-if="listItem.value && listItem.value !== 0 && listItem.title"
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
                      >{{ listItem.value >= 0 ? '+' : '' }}{{ listItem.value }}</span>)
                    </span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="risk-review__svg">
          <div
            ref="svgContainer"
            class="svg-container"
          />
        </div>
        <div
          v-if="secondListColName || secondListColValue || rightTitle"
          class="risk-review__right-descriptions"
        >
          <div
            class="risk-review__col-title px-2"
            :style="{
              height: rightTitle ? 'auto' : '27px',
            }"
          >
            {{ rightTitle }}
          </div>
          <div
            class="titles-container titles-container--second px-2"
            :style="titlesContainerStyle"
          >
            <div
              v-for="(item, i) in secondTitles"
              :key="`t-${i}`"
              class="risk-review__right-text"
              :style="{
                height: `${barHeight}px`,
                marginTop: `${i === 0 ? 0 : chartPaddingInner}px`
              }"
            >
              <div
                v-if="item && item.title"
                class="bar-title bar-title--second"
              >
                {{ item.title }}
              </div>
              <div class="bar-list bar-list--second">
                <template v-for="(listItem, listIndex) in item.list">
                  <div
                    v-if="listItem && listItem.title && listItem.value && listItem.value !== 0"
                    :key="`right-${i}-${listIndex}`"
                    class="bar-list__item bar-list__item--second"
                  >
                    {{ listIndex + 1 }}. {{ listItem.title }}
                    <span
                      class="bar-list__value-text bar-list__value-text--second"
                    >
                      (<span
                        class="bar-list__value bar-list__value--second"
                        :style="{
                          color: secondValueColor,
                        }"
                      >{{ listItem.value >= 0 ? '+' : '' }}{{ listItem.value }}</span>)
                    </span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="isVisibleResidualImpactPanel"
          class="risk-review__residual"
        >
          <div class="risk-review__col-title risk-review__col-title--residual">
            Остаточное влияние
          </div>
          <div
            class="titles-container titles-container--residual px-2"
            :style="titlesContainerStyle"
          >
            <div
              v-for="(value, i) in residualEffectList"
              :key="`t-${i}`"
              class="bar-title bar-title--residual"
              :style="{
                height: `${barHeight}px`,
                marginTop: `${i === 0 ? 0 : chartPaddingInner}px`
              }"
              v-text="toDivide(value)"
            />
          </div>
        </div>
      </div>
      <div
        v-if="!isDataError && !hideLegend && filteredData.length > 0"
        ref="riskReviewLegend"
        class="risk-review-legend px-3"
      >
        <div
          v-for="(part, i) in barParts"
          :key="`legend-${i}`"
          class="risk-review-legend__item"
        >
          <div
            v-if="part.title"
            class="risk-review-legend__color"
            :style="{
              backgroundColor: part.fill,
            }"
          />
          <div
            class="risk-review-legend__text"
            v-text="part.title"
          />
        </div>
      </div>
    </div>
  </portal>
</template>

<script>
import { mdiHelp } from '@mdi/js';

import { mapGetters } from 'vuex';
import RiskReviewClass from '../../js/classes/RIskReviewClass';

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
    marginX: 0,
    marginY: 0,
    barHeight: 0,
    chartPaddingInner: 0,
    chartPaddingOuter: 0,
    /** Chart user config data. */
    iconHelp: mdiHelp,
    // Высота шапки визуализации
    // TODO: По возможности сделать не статичным числом, а вычисляемым значением
    dashHeaderHeight: 48,
    // Размер X-отступов визуализации
    // TODO: По возможности сделать не статичным числом, а вычисляемым значением
    dashXPadding: 22,
    // Высота элемента с легендой
    legendHeight: 0,
    gridStyles: {},
  }),
  computed: {
    ...mapGetters('app', [
      'userSettings',
    ]),
    globalSettings() {
      const {
        numberFormat,
        decimalPlacesLimits,
      } = this.userSettings;
      return {
        numberFormat,
        decimalPlacesLimits,
      };
    },
    titlesContainerStyle() {
      const { chartPaddingOuter, marginY } = this;
      return { paddingTop: `${(chartPaddingOuter - 24) + marginY}px` };
    },
    dataset() {
      if (this.filteredData?.length > 0) {
        return this.filteredData;
      }
      return [];
    },
    titles() {
      if (this.filteredData?.length > 0) {
        return this.filteredData.map((elem) => this.getFormattedTitles(
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
      if (this.filteredData?.length > 0) {
        return this.filteredData.map((ds) => ds[this.titleColName]);
      }
      return [];
    },
    secondTitles() {
      if (this.filteredData?.length > 0) {
        return this.filteredData.map((elem) => this.getFormattedTitles(
          elem,
          {
            titleColName: this.secondTitleColName,
            listColName: this.secondListColName,
            listColValue: this.secondListColValue,
          },
        ));
      }
      return [];
    },
    residualEffectList() {
      if (this.filteredData?.length > 0) {
        return this.filteredData.map((ds) => ds[this.residualEffectField]);
      }
      return [];
    },
    widthFrom() {
      return this.sizeFrom.width - this.dashXPadding;
    },
    heightFromOuter() {
      if (this.idDashFrom === 'reports') {
        // Для страницы ИД
        // TODO: По возможности сделать не статичным числом, а вычисляемым значением
        return this.sizeFrom.height - this.dashHeaderHeight + 15;
      }
      return this.sizeFrom.height - this.dashHeaderHeight;
    },
    heightFromInner() {
      return this.sizeFrom.height - this.dashHeaderHeight - this.legendHeight;
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
      return this.optionsFromStore.leftTitle;
    },
    rightTitle() {
      return this.optionsFromStore.rightTitle;
    },
    valueColor() {
      return this.optionsFromStore.leftValueColor || this.theme.main_text;
    },
    secondValueColor() {
      return this.optionsFromStore.rightValueColor || this.theme.main_text;
    },
    titleColName() {
      return this.optionsFromStore.titleColName || '';
    },
    listColName() {
      return this.optionsFromStore.listColName || '';
    },
    listColValue() {
      return this.optionsFromStore.listColValue || '';
    },
    secondListColName() {
      return this.optionsFromStore.secondListColName || '';
    },
    secondListColValue() {
      return this.optionsFromStore.secondListColValue || '';
    },
    residualEffectField() {
      return this.optionsFromStore.residualEffectField || '';
    },
    secondTitleColName() {
      return this.optionsFromStore.secondTitleColName || '';
    },
    hideLegend() {
      return this.optionsFromStore?.hideLegend;
    },
    filteredData() {
      const result = [];
      let fieldsCount = 0;
      this.dataRestFrom.forEach((el) => {
        const updatedEl = structuredClone(el);
        const barFields = {};
        this.barParts.forEach((option) => {
          if (option?.hideZeroValue === true) {
            if (Number(el[option.id]) === 0) {
              delete updatedEl[option.id];
            } else {
              fieldsCount += 1;
              barFields[option.id] = el[option.id];
            }
          } else {
            fieldsCount += 1;
            barFields[option.id] = el[option.id];
          }
        });
        if (Object.keys(barFields).length > 0) {
          result.push(updatedEl);
        }
      });
      return fieldsCount > 0 ? result : [];
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
          this.$nextTick(() => {
            this.getLegendHeight();
            this.render();
          });
        });
      },
    },
    hideLegend() {
      this.render();
    },
  },
  mounted() {
    this.getLegendHeight();
    this.render();
  },
  methods: {
    setGridStyles() {
      const leftDescArea = (this.listColName || this.listColValue || this.leftTitle)
        ? 'left-descr '
        : '';
      const leftDescSize = leftDescArea
        ? 'minmax(auto, 20%) '
        : '';
      const rightDescArea = (this.secondListColName || this.secondListColValue || this.rightTitle)
        ? ' right-descr'
        : '';
      const rightDescSize = rightDescArea
        ? ' minmax(auto, 20%)'
        : '';
      const residualArea = this.isVisibleResidualImpactPanel
        ? ' residual'
        : '';
      const residualSize = residualArea
        ? ' minmax(auto, 13%)'
        : '';
      this.gridStyles = {
        display: 'grid',
        'grid-template-rows': '1fr',
        'grid-template-columns': `${leftDescSize}1fr${rightDescSize}${residualSize}`,
        'grid-template-areas': `"${leftDescArea}svg${rightDescArea}${residualArea}"`,
      };
    },
    getLegendHeight() {
      if (this.$refs.riskReviewLegend) {
        this.legendHeight = this.$refs.riskReviewLegend.offsetHeight + 4;
      }
    },

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

    setError(text = '', show = false) {
      this.errorMessage = text;
      this.isDataError = show;
    },

    render() {
      this.setGridStyles();
      this.$nextTick(() => {
        const validate = RiskReviewClass.validateData;

        const { isValid, error } = validate(
          this.dataRestFrom,
          this.barParts,
          this.loading,
        );

        if (!isValid) {
          this.setError(error, true);
        } else {
          this.setError('', false);
          this.$nextTick(() => {
            const riskReview = new RiskReviewClass({
              container: this.$refs.svgContainer,
              width: this.sizeFrom.width,
              marginX: this.marginX,
              marginY: this.marginY,
              height: this.hideLegend
                ? this.sizeFrom.height
                : this.sizeFrom.height - this.$refs.riskReviewLegend.offsetHeight - 16,
              barParts: this.barParts,
              dataRest: this.filteredData,
              setTokenFn: this.setTokens,
              toDivideFn: this.toDivide,
            });
            this.$nextTick(() => {
              this.barHeight = riskReview.barHeight;
              this.chartPaddingInner = riskReview.chartPaddingInner;
              this.chartPaddingOuter = riskReview.chartPaddingOuter;
            });
          });
        }
      });
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
          if (index && elem[key]) {
            if (!result.list[index]) {
              if ((!result.list[index - 1] && index > 0)) {
                result.list[index - 1] = {
                  [listKey]: listKey === 'value' ? this.toDivide(elem[key]) : elem[key],
                };
              } else {
                result.list[index] = {
                  [listKey]: listKey === 'value' ? this.toDivide(elem[key]) : elem[key],
                };
              }
            } else {
              result.list[index][listKey] = listKey === 'value' ? this.toDivide(elem[key]) : elem[key];
            }
          }
        }
      });
      return result;
    },

    toDivide(value) {
      const {
        numberFormat,
        decimalPlacesLimits,
      } = this.globalSettings;
      const strToNumber = typeof value === 'number'
        ? value
        : Number(value);
      return strToNumber.toLocaleString(numberFormat, {
        maximumFractionDigits: decimalPlacesLimits,
      });
    },
  },
};
</script>

<style lang="scss">
.risk-review {
  font-family: 'Proxima Nova', serif;
  position: relative;
  width: 100%;
  padding-left: 0 !important;
  padding-right: 0 !important;
  & > * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  &__grid-container {
    overflow: hidden;
  }

  &__left-description {
    grid-area: left-descr;
  }

  &__svg {
    grid-area: svg;
  }

  &__right-description {
    grid-area: right-descr;
  }

  &__residual {
    grid-area: residual;
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

  &__left-text, &__right-text {
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
        display: flex;
        align-items: center;
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

.risk-review-legend {
  display: flex !important;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  &__item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    flex-wrap: nowrap;
  }
  &__color {
    width: 15px;
    height: 15px;
    border: 1px solid var(--main_border);
  }
  &__text {
    white-space: nowrap;
    color: var(--main_text);
    font-size: 14px;
  }
}
</style>
