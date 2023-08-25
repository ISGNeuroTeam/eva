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
        v-show="!(isDataError || filteredData.length === 0)"
        :style="gridContainerStyles"
        class="risk-review__grid-container"
      >
        <div
          v-if="isShowLeftColumn"
          class="risk-review__left-descriptions"
        >
          <div
            class="risk-review__col-title pl-3 pr-2"
            :style="{
              height: firstMetricTitle ? 'auto' : '27px',
            }"
          >
            {{ firstMetricTitle }}
          </div>
          <div
            v-if="getDataForHtmlTemplate && getDataForHtmlTemplate.length > 0"
            class="titles-container pl-3 pr-2"
            :style="titlesContainerStyle"
          >
            <div
              v-for="(element, i) in getDataForHtmlTemplate"
              :key="`t-${i}`"
              class="risk-review__left-text"
              :style="{
                height: `${barHeight}px`,
                marginTop: `${i === 0 ? 0 : chartPaddingInner}px`
              }"
            >
              <template v-if="element && element.firstList">
                <div
                  v-if="element.firstList[metricKeys.firstListTitle]"
                  class="bar-title"
                >
                  {{ element.firstList[metricKeys.firstListTitle] }}:
                </div>
                <div class="bar-list">
                  <template v-for="(listItem, listIndex) in element.firstList.items">
                    <div
                      v-if="listItem.value && listItem.value !== 0 && listItem.text"
                      :key="`left-${i}-${listIndex}`"
                      class="bar-list__item"
                    >
                      {{ listIndex + 1 }}. {{ listItem.text }}
                      <span
                        v-if="listItem.value"
                        class="bar-list__value-text"
                      >
                        (<span
                          class="bar-list__value"
                          :style="{
                            color: leftValueColor,
                          }"
                        >{{ listItem.value >= 0 ? '+' : '' }}{{ toDivide(listItem.value) }}</span>)
                      </span>
                    </div>
                  </template>
                </div>
              </template>
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
          v-if="isShowRightColumn"
          class="risk-review__right-descriptions"
        >
          <div
            class="risk-review__col-title px-2"
            :style="{
              height: secondMetricTitle ? 'auto' : '27px',
            }"
          >
            {{ secondMetricTitle }}
          </div>
          <div
            v-if="getDataForHtmlTemplate && getDataForHtmlTemplate.length > 0"
            class="titles-container titles-container--second px-2"
            :style="titlesContainerStyle"
          >
            <div
              v-for="(element, i) in getDataForHtmlTemplate"
              :key="`t-${i}`"
              class="risk-review__right-text"
              :style="{
                height: `${barHeight}px`,
                marginTop: `${i === 0 ? 0 : chartPaddingInner}px`
              }"
            >
              <template v-if="element && element.secondList">
                <div
                  v-if="element.secondList[metricKeys.secondListTitle]"
                  class="bar-title bar-title--second"
                >
                  {{ element.secondList[metricKeys.secondListTitle] }}
                </div>
                <div class="bar-list bar-list--second">
                  <template v-for="(listItem, listIndex) in element.secondList.items">
                    <div
                      v-if="listItem && listItem.text && listItem.value && listItem.value !== 0"
                      :key="`right-${i}-${listIndex}`"
                      class="bar-list__item bar-list__item--second"
                    >
                      {{ listIndex + 1 }}. {{ listItem.text }}
                      <span
                        class="bar-list__value-text bar-list__value-text--second"
                      >
                        (<span
                          class="bar-list__value bar-list__value--second"
                          :style="{
                            color: rightValueColor,
                          }"
                        >{{ listItem.value >= 0 ? '+' : '' }}{{ toDivide(listItem.value) }}</span>)
                      </span>
                    </div>
                  </template>
                </div>
              </template>
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
              v-text="toDivide(value || 0)"
            />
          </div>
        </div>
      </div>
      <div
        v-if="isLegendShow"
        ref="riskReviewLegend"
        class="risk-review-legend px-3"
      >
        <template
          v-for="(part, i) in generatedOptions.metricOptions"
        >
          <div
            v-if="part.legend && part.isLegendShow"
            :key="`legend-${i}`"
            class="risk-review-legend__item"
          >
            <div

              class="risk-review-legend__color"
              :style="{
                backgroundColor: part.fill,
              }"
            />
            <div
              class="risk-review-legend__text"
              v-text="part.legend"
            />
          </div>
        </template>
      </div>
      <v-icon
        v-if="!fullScreenMode && !isDataError && filteredData.length > 0 && isEdit"
        class="risk-review__settings"
        :color="theme.$main_border"
        @click="isModalSettings = true"
      >
        {{ iconSettings }}
      </v-icon>
      <risk-review-settings
        v-model="isModalSettings"
        :options="generatedOptions"
        :metric-keys="metricKeys"
        @updateSettings="updateOptionsInStore"
      />
    </div>
  </portal>
</template>

<script>
import { mdiHelp, mdiSettings } from '@mdi/js';

import { mapGetters } from 'vuex';
import RiskReviewClass from '../../../js/classes/RIskReviewClass';
import DashRiskReviewSettings from '@/components/dashBoardInside/dashRiskReview/dashRiskReviewSettings';

export default {
  name: 'RiskReview',
  components: {
    RiskReviewSettings: DashRiskReviewSettings,
  },
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
    marginY: 0,
    barHeight: 0,
    chartPaddingInner: 0,
    chartPaddingOuter: 0,
    /** Chart user config data. */
    iconHelp: mdiHelp,
    iconSettings: mdiSettings,
    // Высота шапки визуализации
    // TODO: По возможности сделать не статичным числом, а вычисляемым значением
    dashHeaderHeight: 48,
    // Размер X-отступов визуализации
    // TODO: По возможности сделать не статичным числом, а вычисляемым значением
    dashXPadding: 22,
    // Высота элемента с легендой
    legendHeight: 0,
    gridStyles: {},
    isModalSettings: false,
    localOptions: {},
  }),
  computed: {
    ...mapGetters('app', [
      'userSettings',
    ]),
    firstMainMetric() {
      return this.optionsFromStore.firstMainMetric || 'left';
    },
    secondMainMetric() {
      return this.optionsFromStore.secondMainMetric || 'right';
    },
    titleSuffix() {
      return this.optionsFromStore.titleSuffix || '_title';
    },
    listTitleSuffix() {
      return this.optionsFromStore.listTitleSuffix || '_list_title';
    },
    listTextSuffix() {
      return this.optionsFromStore.listTextSuffix || '_list_text';
    },
    listValueSuffix() {
      return this.optionsFromStore.listValueSuffix || '_list_value';
    },
    residualMetric() {
      return this.optionsFromStore.residualMetric || 'residual';
    },
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
      const { chartPaddingOuter, marginY, legendHeight } = this;
      return {
        paddingTop: `${legendHeight > 0
          ? chartPaddingOuter
          : (chartPaddingOuter) + marginY}px`,
      };
    },
    residualEffectList() {
      if (this.filteredData?.length > 0) {
        // eslint-disable-next-line no-restricted-globals
        return this.filteredData.map((ds) => (isNaN(Number(ds[this.metricKeys.residualMetric]))
          ? 0
          : Number(ds[this.metricKeys.residualMetric])));
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
      return this.optionsFromStore[this.metricKeys.residualMetric];
    },
    isPanelBackHide() {
      return this.dashFromStore[this.idFrom].options?.panelBackHide || false;
    },
    barPartsOld() {
      if (this.optionsFromStore.primitivesLibrary) {
        return JSON.parse(this.optionsFromStore.primitivesLibrary);
      }
      return [];
    },
    barParts() {
      if (this.preparedDataRest) {
        return this.preparedDataRest.metricOptions;
      }
      return [];
    },
    generatedOptions() {
      const {
        // Настройки для метрик
        metricOptions,
        // Отображение легенды
        isLegendShow,
      } = this.optionsFromStore;
      const isResidual = typeof this.optionsFromStore[this.metricKeys.residualMetric] !== 'undefined';
      const firstTitle = this.barParts[0][this.metricKeys.firstTitle] || '';
      const secondTitle = this.barParts[0][this.metricKeys.secondTitle] || '';
      const result = {
        isLegendShow: typeof isLegendShow !== 'undefined' ? isLegendShow : false,
        [this.metricKeys.residualMetric]: isResidual
          ? this.optionsFromStore[this.metricKeys.residualMetric]
          : false,
        [this.metricKeys.firstTitle]: this.optionsFromStore[this.metricKeys.firstTitle]
        || firstTitle || '',
        leftValueColor: this.leftValueColor,
        [this.metricKeys.secondTitle]: this.optionsFromStore[this.metricKeys.secondTitle]
        || secondTitle || '',
        rightValueColor: this.rightValueColor,
      };
      if (metricOptions) {
        const metricIDListFromData = this.barParts.map((metric) => metric.id);
        const currentMetricIDList = metricOptions.map((metric) => metric.id);
        const resultMetricList = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const metric of metricOptions) {
          if (metricIDListFromData.includes(metric.id)) {
            resultMetricList.push({
              ...metric,
              fill: this.hexToHexa(metric.fill),
              textColor: this.hexaToHex(metric.textColor),
            });
          }
        }
        // eslint-disable-next-line no-restricted-syntax
        for (const metric of this.barParts) {
          if (!currentMetricIDList.includes(metric.id)) {
            resultMetricList.push(metric);
          }
        }
        result.metricOptions = resultMetricList.filter((metric) => metric.id !== '_order'
            && metric.id !== '_time'
            && metric.id !== this.metricKeys.residualMetric);
      } else {
        // Для новой визуализации, генерим метрики
        result.metricOptions = this.barParts;
      }
      return structuredClone(result);
    },
    leftValueColor() {
      const color = this.optionsFromStore.leftValueColor;
      if (color) {
        return this.hexaToHex(color);
      }
      return '#FF0000';
    },
    rightValueColor() {
      const color = this.optionsFromStore.rightValueColor;
      if (color) {
        return this.hexaToHex(color);
      }
      return this.optionsFromStore.rightValueColor || '#00FF00';
    },
    isListValid() {
      if (this.getDataForHtmlTemplate?.length > 0) {
        const allFirstListItems = [];
        const allSecondListItems = [];
        this.getDataForHtmlTemplate.forEach((element) => {
          if (element?.firstList) {
            allFirstListItems.push(...element.firstList.items);
          }
          if (element?.secondList) {
            allSecondListItems.push(...element.secondList.items);
          }
        });
        return {
          first: allFirstListItems.length > 0,
          second: allSecondListItems.length > 0,
        };
      }
      return {
        first: false,
        second: false,
      };
    },

    isLegendShow() {
      return !this.isDataError
      && this.filteredData?.length > 0
      && this.generatedOptions?.metricOptions?.length > 0
        ? this.optionsFromStore?.isLegendShow
        : false;
    },
    dataRestFromWIthOrder() {
      if (this.dataRestFrom?.length > 0) {
        return this.dataRestFrom.map((el, index) => ({
          ...el,
          // eslint-disable-next-line no-underscore-dangle
          _order: typeof el._order !== 'undefined' ? el._order : index,
        }));
      }
      return [];
    },
    filteredData() {
      const result = [];
      let fieldsCount = 0;
      this.dataRestFromWIthOrder.forEach((el) => {
        const updatedEl = structuredClone(el);
        const barFields = {};
        if (this.barParts?.length > 0) {
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
        }
      });
      return fieldsCount > 0 ? result.sort((a, b) => {
        // eslint-disable-next-line no-underscore-dangle
        const nameA = a._order; // ignore upper and lowercase
        // eslint-disable-next-line no-underscore-dangle
        const nameB = b._order; // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      }) : [];
    },
    gridContainerStyles() {
      const leftDescArea = (this.firstMetricTitle || this.isListValid.first)
        ? 'left-descr '
        : '';
      const leftDescSize = leftDescArea
        ? 'minmax(auto, 27%) '
        : '';
      const rightDescArea = (this.secondMetricTitle || this.isListValid.second)
        ? ' right-descr'
        : '';
      const rightDescSize = rightDescArea
        ? ' minmax(auto, 27%)'
        : '';
      const residualArea = this.isVisibleResidualImpactPanel
        ? ' residual'
        : '';
      const residualSize = residualArea
        ? ' minmax(10px, 0.5fr)'
        : '';
      return {
        width: `${this.widthFrom}px`,
        height: `${this.heightFromInner}px`,
        display: 'grid',
        'grid-template-rows': '1fr',
        'grid-template-columns': `${leftDescSize}1fr${rightDescSize}${residualSize}`,
        'grid-template-areas': `"${leftDescArea}svg${rightDescArea}${residualArea}"`,
      };
    },
    preparedDataRest() {
      if (this.dataRestFromWIthOrder?.length === 0) {
        return null;
      }
      // Убираем приставку this(просто для сокращения кода)
      const {
        firstMainMetric,
        secondMainMetric,
        metricKeys,
      } = this;
      // Список всех метрик
      const metricList = [];
      // Настройки для не основных метрик
      const metricOptions = [];
      const data = [];
      // eslint-disable-next-line no-restricted-syntax
      for (let index = 0; index < this.dataRestFromWIthOrder.length; index += 1) {
        const element = this.dataRestFromWIthOrder[index];
        // eslint-disable-next-line no-underscore-dangle
        const order = element._order;
        const params = {};
        // Убираем поле _time, residual, _order
        const fieldList = Object.keys(element).filter((field) => field !== '_time'
            && field !== this.metricKeys.residualMetric
            && field !== '_order');
        // Список элементов (text\value) для первой основной метрики
        const firstList = {
          items: [],
        };
        // Список элементов(text\value) для второй основной метрики
        const secondList = {
          items: [],
        };
        // eslint-disable-next-line no-restricted-syntax
        for (const field of fieldList) {
          // Проверка на то, основая ли это метрика
          const isMainMetric = field.startsWith(firstMainMetric)
              || field.startsWith(secondMainMetric);
          if (isMainMetric) {
            if (!metricList.includes(firstMainMetric)) {
              // Добавляем первую основную метрику в список метрик, если её там еще нет
              metricList.push(firstMainMetric);
            } else if (!metricList.includes(secondMainMetric)) {
              // Добавляем вторую основную метрику в список метрик, если её там еще нет
              metricList.push(secondMainMetric);
            }
            if (field === metricKeys.firstTitle) {
              // Достаем заголовок блока первой основной метрики
              params[metricKeys.firstTitle] = element[field];
            } else if (field === metricKeys.secondTitle) {
              // Достаем заголовок блока второй основной метрики
              params[metricKeys.secondTitle] = element[field];
            } else {
              if (field === metricKeys.firstListTitle) {
                // Достаем заголовок для списка в блоке первой основной метрики
                firstList[metricKeys.firstListTitle] = element[field];
              } else if (field === metricKeys.secondListTitle) {
                // Достаем заголовок для списка в блоке второй основной метрики
                secondList[metricKeys.secondListTitle] = element[field];
              }
              const listIndex = Number(field.substring(field.length - 1, field.length));
              // eslint-disable-next-line no-restricted-globals
              if (!isNaN(listIndex)) {
                // Добавляем элемент списка для блока первой основной метрики(если его нет)
                if (field.startsWith(firstMainMetric) && !firstList.items[listIndex]) {
                  firstList.items[listIndex] = {};
                }
                // Добавляем элемент списка для блока второй основной метрики(если его нет)
                if (field.startsWith(secondMainMetric) && !secondList.items[listIndex]) {
                  secondList.items[listIndex] = {};
                }
                if (field.startsWith(metricKeys.firstListText)) {
                  // Добавляем текст элемента списка для блока первой основной метрики
                  firstList.items[listIndex].text = element[field];
                } else if (field.startsWith(metricKeys.secondListText)) {
                  // Добавляем текст элемента списка для блока второй основной метрики
                  secondList.items[listIndex].text = element[field];
                } else if (field.startsWith(metricKeys.firstListValue)) {
                  firstList.items[listIndex].value = element[field];
                } else if (field.startsWith(metricKeys.secondListValue)) {
                  secondList.items[listIndex].value = element[field];
                }
              }
            }
          } else if (!metricList.includes(field)) {
            metricList.push(field);
          }
        }
        data[order] = {
          ...params,
          firstList,
          secondList,
        };
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const metricName of metricList) {
        const oldSettings = this.barPartsOld.find((metric) => metric?.id === metricName);
        const savedSettings = this.optionsFromStore?.metricOptions?.length > 0
          ? this.optionsFromStore.metricOptions.find((metric) => metric.id === metricName)
          : null;
        let defaultMetricFill = this.theme.$main_text;
        if (metricName.indexOf(this.firstMainMetric) !== -1) defaultMetricFill = '#FF0000';
        if (metricName.indexOf(this.secondMainMetric) !== -1) defaultMetricFill = '#00FF00';
        metricOptions.push({
          id: metricName,
          idStart: oldSettings?.idStart || savedSettings?.idStart || null,
          legend: oldSettings?.title || savedSettings?.title || metricName,
          isLegendShow: oldSettings?.isLegendShow
          || typeof savedSettings?.isLegendShow !== 'undefined'
            ? savedSettings?.isLegendShow : true,
          type: oldSettings?.type || savedSettings?.type || 'bar',
          types: [
            {
              label: 'Барчарт',
              value: 'bar',
            },
            {
              label: 'Линия',
              value: 'line',
            },
          ],
          fill: this.hexToHexa(oldSettings?.fill)
              || this.hexToHexa(savedSettings?.fill)
              || this.hexToHexa(defaultMetricFill),
          textColor: this.hexaToHex(oldSettings?.textColor)
              || this.hexaToHex(savedSettings?.textColor)
              || this.hexaToHex(defaultMetricFill),
          textOffset: oldSettings?.textOffset || savedSettings?.textOffset || 10,
          textPosY: oldSettings?.textPosY || savedSettings?.textPosY || 'center',
          textPosYItems: [
            {
              label: 'Сверху',
              value: 'top',
            },
            {
              label: 'По-центру',
              value: 'center',
            },
            {
              label: 'Снизу',
              value: 'bottom',
            },
          ],
          textPosX: oldSettings?.textPosX || savedSettings?.textPosX || 'default',
          textPosXItems: [
            {
              label: 'По-умолчанию',
              value: 'default',
            },
            {
              label: 'По центру',
              value: 'center',
            },
          ],
          isTitleShow: oldSettings?.isTitleShow
          || typeof savedSettings?.isTitleShow !== 'undefined'
            ? savedSettings?.isTitleShow : true,
          isFullHeight: oldSettings?.isFullHeight
          || typeof savedSettings?.isFullHeight !== 'undefined'
            ? savedSettings?.isFullHeight : true,
          hideZeroValue: oldSettings?.hideZeroValue
          || typeof savedSettings?.hideZeroValue !== 'undefined'
            ? savedSettings?.hideZeroValue : false,
        });
      }
      return {
        metricOptions,
        data,
      };
    },
    getDataForHtmlTemplate() {
      if (this.preparedDataRest) {
        return this.preparedDataRest.data;
      }
      return null;
    },
    metricKeys() {
      const {
        titleSuffix,
        listTitleSuffix,
        listTextSuffix,
        listValueSuffix,
        firstMainMetric,
        secondMainMetric,
        residualMetric,
      } = this;
      return {
        firstMainMetric,
        secondMainMetric,
        firstTitle: `${firstMainMetric}${titleSuffix}`,
        secondTitle: `${secondMainMetric}${titleSuffix}`,
        firstListTitle: `${firstMainMetric}${listTitleSuffix}`,
        secondListTitle: `${secondMainMetric}${listTitleSuffix}`,
        firstListText: `${firstMainMetric}${listTextSuffix}`,
        secondListText: `${secondMainMetric}${listTextSuffix}`,
        firstListValue: `${firstMainMetric}${listValueSuffix}`,
        secondListValue: `${secondMainMetric}${listValueSuffix}`,
        residualMetric,
      };
    },
    firstMetricTitle() {
      if (this.optionsFromStore[this.metricKeys.firstTitle]) {
        return this.optionsFromStore[this.metricKeys.firstTitle];
      }
      if (this.getDataForHtmlTemplate) {
        return this.getDataForHtmlTemplate[this.metricKeys.firstTitle];
      }
      return '';
    },
    secondMetricTitle() {
      if (this.optionsFromStore[this.metricKeys.secondTitle]) {
        return this.optionsFromStore[this.metricKeys.secondTitle];
      }
      if (this.getDataForHtmlTemplate) {
        return this.getDataForHtmlTemplate[this.metricKeys.secondTitle];
      }
      return '';
    },
    isShowLeftColumn() {
      return this.firstMetricTitle
          || (this.getDataForHtmlTemplate && this.isListValid.first);
    },
    isShowRightColumn() {
      return this.secondMetricTitle
          || (this.getDataForHtmlTemplate && this.isListValid.second);
    },
    isEdit() {
      if (this.idDashFrom === 'reports') {
        return true;
      }
      return this.dashFromStore.editMode;
    },
  },
  watch: {
    filteredData: {
      deep: true,
      handler(val, oldVal) {
        const updatedValue = JSON.stringify(val) !== JSON.stringify(oldVal);
        if (val?.length > 0 && updatedValue) {
          this.redraw(val);
        }
      },
    },
    sizeFrom: {
      deep: true,
      handler(val, oldVal) {
        const isUpdatedSize = JSON.stringify(val) !== JSON.stringify(oldVal);
        if (this.filteredData?.length > 0 && isUpdatedSize) {
          this.redraw();
        }
      },
    },
    barParts: {
      deep: true,
      handler(val, oldVal) {
        const isUpdatedValue = JSON.stringify(val) !== JSON.stringify(oldVal);
        if (isUpdatedValue) {
          this.redraw();
        }
      },
    },
    isLegendShow(val, oldVal) {
      if (val !== oldVal) {
        this.render();
      }
    },
  },
  mounted() {
    if (this.filteredData?.length > 0) {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.getLegendHeight();
          this.render();
        });
      });
    }
  },
  methods: {
    redraw(dataForUpdateAction) {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.getLegendHeight();
          this.render();
          if (dataForUpdateAction) {
            this.updateActionCapture(dataForUpdateAction);
          }
        });
      });
    },
    loadOptionsFromStore() {
      const {
        // Настройки для метрик
        metricOptions,
        // Отображение легенды
        isLegendShow,
      } = this.optionsFromStore;
      const isResidual = typeof this.optionsFromStore[this.metricKeys.residualMetric] !== 'undefined';
      const result = {
        isLegendShow: typeof isLegendShow !== 'undefined' ? isLegendShow : false,
        [this.metricKeys.residualMetric]: isResidual
          ? this.optionsFromStore[this.metricKeys.residualMetric]
          : false,
        [this.metricKeys.firstTitle]: this.optionsFromStore[this.metricKeys.firstTitle]
        || '',
        leftValueColor: this.leftValueColor,
        [this.metricKeys.secondTitle]: this.optionsFromStore[this.metricKeys.secondTitle]
        || '',
        rightValueColor: this.rightValueColor,
      };
      if (metricOptions) {
        const metricIDListFromData = this.barParts.map((metric) => metric.id);
        const currentMetricIDList = metricOptions.map((metric) => metric.id);
        const resultMetricList = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const metric of metricOptions) {
          if (metricIDListFromData.includes(metric.id)) {
            resultMetricList.push(metric);
          }
        }
        // eslint-disable-next-line no-restricted-syntax
        for (const metric of this.barParts) {
          if (!currentMetricIDList.includes(metric.id)) {
            resultMetricList.push(metric);
          }
        }
        result.metricOptions = resultMetricList.filter((metric) => metric.id !== '_order'
            && metric.id !== '_time'
            && metric.id !== this.metricKeys.residualMetric);
      } else {
        // Для новой визуализации, генерим метрики
        result.metricOptions = this.barParts;
      }
      this.localOptions = structuredClone(result);
    },

    updateOptionsInStore(updatedOptions) {
      this.$store.commit('setState', [
        {
          object: this.dashFromStore[this.idFrom],
          prop: 'options',
          value: {
            ...structuredClone(this.optionsFromStore),
            ...structuredClone(updatedOptions),
          },
        },
      ]);
      this.redraw();
    },

    getLegendHeight() {
      if (this.$refs?.riskReviewLegend?.offsetHeight) {
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
      this.loadOptionsFromStore();
      this.$nextTick(() => {
        const validate = RiskReviewClass.validateData;
        const requiredFields = [
          this.firstMainMetric,
          this.secondMainMetric,
        ];
        const { isValid, error } = validate(
          this.dataRestFromWIthOrder,
          requiredFields,
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
              marginY: this.marginY,
              height: !this.isLegendShow
                ? this.sizeFrom.height
                : this.sizeFrom.height - this.legendHeight - 16,
              barParts: [...this.generatedOptions.metricOptions].reverse(),
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

    hexToHexa(color) {
      if (color && typeof color === 'string') {
        if (color.startsWith('#') && color.length === 7) {
          return `${color}FF`;
        }
      }
      return color;
    },

    hexaToHex(color) {
      if (color && typeof color === 'string') {
        if (color.startsWith('#') && color.length === 9) {
          return color.substring(0, color.length - 2);
        }
      }
      return color;
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

  &__settings {
    position: absolute !important;
    right: 16px;
    bottom: 16px;
    width: 24px;
    height: 24px;
    z-index: 1;
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
  min-height: 24px;
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
