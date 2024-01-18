<template>
  <portal
    :to="idVisual"
    :disabled="!isFullScreen"
  >
    <div
      class="date-picker"
      :style="{
        maxHeight: `${parentHeight}px`,
        maxWidth: `${parentWidth}px`,
      }"
    >
      <div class="date-picker__wrapper">
        <div class="date-picker__text">
          {{ formattedValue || 'Дата не установлена' }}
        </div>
        <v-btn
          :id="`picker-btn-${idVisual}`"
          icon
          small
          :color="getTheme.$main_text"
          @click="openPopup"
        >
          <v-icon>
            {{ mdiCalendarMonthOutline }}
          </v-icon>
        </v-btn>
        <v-menu
          v-model="modelPopup"
          content-class="date-picker__menu"
          absolute
          eager
          z-index="1000"
          :position-x="popupPositionX"
          :position-y="popupPositionY"
          :close-on-content-click="false"
          offset-y
          offset-x
          @input="closePopupHandler"
        >
          <div class="date-picker__popup">
            <template v-if="pickerMode === 'range'">
              <div class="date-picker__group">
                <div class="date-picker__name mb-3">
                  Выбор диапазона дат
                </div>
                <DTPicker
                  :id="`${idVisual}-range`"
                  :ref="`${idVisual}-range`"
                  v-model="reactiveValue"
                  range
                  label="Диапазон дат"
                  :shortcut="`${reactiveValue.shortcut}`"
                  :format="formatForPicker"
                  :formatted="formatForPicker"
                  :color="getTheme.$accent_ui_color"
                  :button-color="getTheme.$primary_button"
                  :custom-shortcuts="getShortcuts"
                  @input="updateLocalValue"
                />
              </div>
            </template>
            <template v-if="pickerMode === 'startEnd'">
              <div class="date-picker__group">
                <div class="date-picker__name mb-3">
                  Выбор начальной и конечной даты
                </div>
                <DTPicker
                  :id="`${idVisual}-start`"
                  v-model="reactiveValue.start"
                  label="Начальная дата"
                  class="mb-3"
                  :format="formatForPicker"
                  :formatted="formatForPicker"
                  :color="getTheme.$accent_ui_color"
                  :button-color="getTheme.$primary_button"
                  :only-date="hideTime"
                  button-now-translation="Сейчас"
                  @input="updateLocalValue"
                />
                <DTPicker
                  :id="`${idVisual}-end`"
                  v-model="reactiveValue.end"
                  button-now-translation="Сейчас"
                  label="Конечная дата"
                  :format="formatForPicker"
                  :formatted="formatForPicker"
                  :color="getTheme.$accent_ui_color"
                  :button-color="getTheme.$primary_button"
                  :only-date="hideTime"
                  @input="updateLocalValue"
                />
              </div>
            </template>
            <template v-if="pickerMode === 'exact'">
              <div class="date-picker__group">
                <div class="date-picker__name mb-3">
                  Выбор точной даты
                </div>
                <DTPicker
                  :id="`${idVisual}-exact`"
                  v-model="reactiveValue.date"
                  label="Выбор даты"
                  class="mb-3"
                  :format="formatForPicker"
                  :formatted="formatForPicker"
                  :color="getTheme.$accent_ui_color"
                  :button-color="getTheme.$primary_button"
                  :only-date="hideTime"
                  button-now-translation="Сейчас"
                  @input="updateLocalValue"
                />
              </div>
            </template>
            <template v-if="pickerMode === 'time'">
              <div class="date-picker__group">
                <div class="date-picker__name mb-3">
                  Выбор времени
                </div>
                <div class="row">
                  <div class="col-12">
                    <v-text-field
                      v-model="reactiveValue.count"
                      :color="getTheme.$main_text"
                      dense
                      outlined
                      hide-details
                      label="Количество"
                      @input="updateLocalValue"
                    />
                  </div>
                  <div class="col-12">
                    <v-select
                      v-model="reactiveValue.type"
                      label="Единица времени"
                      hide-details
                      :color="getTheme.$main_text"
                      dense
                      outlined
                      :items="lastTimeTypes"
                      @input="updateLocalValue"
                    />
                  </div>
                </div>
              </div>
            </template>
            <template v-if="pickerMode === 'startEndManual'">
              <div class="date-picker__group">
                <div class="date-picker__name mb-3">
                  Ввод начальной и конечной даты
                </div>
                <v-text-field
                  v-model="reactiveValue.start"
                  :color="getTheme.$main_text"
                  :background-color="getTheme.$main_bg"
                  dense
                  outlined
                  hide-details
                  label="Ввод начальной даты:"
                  class="mb-3"
                  @input="updateLocalValue"
                />
                <v-text-field
                  v-model="reactiveValue.end"
                  :color="getTheme.$main_text"
                  :background-color="getTheme.$main_bg"
                  dense
                  outlined
                  hide-details
                  label="Ввод конечной даты:"
                  class="mb-3"
                  @input="updateLocalValue"
                />
              </div>
            </template>
            <template v-if="pickerMode === 'exactManual'">
              <div class="date-picker__group">
                <div class="date-picker__name mb-3">
                  Выбор точной даты
                </div>
                <v-text-field
                  v-model="reactiveValue.date"
                  :color="getTheme.$main_text"
                  :background-color="getTheme.$main_bg"
                  dense
                  outlined
                  hide-details
                  label="Ввод даты:"
                  class="mb-3"
                  @input="updateLocalValue"
                />
              </div>
            </template>
            <v-btn
              class="mt-3"
              small
              :color="getTheme.$accent_ui_color"
            >
              <span
                :style="{
                  color: 'white'
                }"
                @click="setDate"
              >
                Установить
              </span>
            </v-btn>
          </div>
        </v-menu>
      </div>
    </div>
  </portal>
</template>

<script>
import {
  mdiCalendarMonthOutline,
  mdiCheckBold,
} from '@mdi/js';
import moment from 'moment';
import componentsSettings from '@/js/componentsSettings';
import { throttle } from '@/js/utils/throttle';
import { pluralizeTime } from '@/js/utils/pluralizeFn';

export default {
  name: 'DashDatePickerV2',
  props: {
    idDashFrom: {
      type: String,
      required: true,
    },
    idFrom: {
      type: String,
      required: true,
    },
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
    sizeFrom: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    mdiCalendarMonthOutline,
    mdiCheckBold,
    actions: [{ name: 'select', capture: [] }],
    captures: ['start', 'end', 'exact'],
    lastTimeTypes: [
      {
        text: 'День',
        value: 'day',
      },
      {
        text: 'Час',
        value: 'hour',
      },
      {
        text: 'Минута',
        value: 'minute',
      },
      {
        text: 'Секунда',
        value: 'second',
      },
    ],
    // Форматированное значение для пользователя
    formattedValue: '',
    // Значение в пикере
    reactiveValue: {},
    // Значение в компоненте
    localValue: {},
    // Модалка с пикером
    modelPopup: false,
    // Позиция модалки
    popupPositionX: 0,
    popupPositionY: 0,
    // Значения по-умолчанию
    defaultValueByMode: {
      range: {
        start: '',
        end: '',
        shortcut: '',
      },
      startEnd: {
        start: '',
        end: '',
      },
      exact: {
        date: '',
      },
      time: {
        count: '',
        type: '',
        start: '',
        end: '',
        period: '',
      },
      startEndManual: {
        start: '',
        end: '',
      },
      exactManual: {
        date: '',
      },
    },
    // Формат даты по-умолчанию
    defaultFormat: {
      date: 'YYYY-MM-DD',
      dateTime: 'YYYY-MM-DD HH:mm',
    },
    // Только для режима range
    defaultRangeBtnList: [
      'thisDay',
      'lastDay',
      'thisWeek',
      'lastWeek',
      'last7Days',
      'last30Days',
      'thisMonth',
      'lastMonth',
      'thisYear',
      'lastYear',
    ],
    rangeBtnOptions: {
      thisDay: { label: 'текущий день', value: 'day' },
      lastDay: { label: 'предыдущий день', value: '-day' },
      thisWeek: { label: 'текущая неделя', value: 'isoWeek' },
      lastWeek: { label: 'пред. неделя', value: '-isoWeek' },
      last7Days: { label: 'последние 7 дней', value: 7 },
      last30Days: { label: 'последние 30 дней', value: 30 },
      thisMonth: { label: 'текущий месяц', value: 'month' },
      lastMonth: { label: 'пред. месяц', value: '-month' },
      thisYear: { label: 'текущий год', value: 'year' },
      lastYear: { label: 'пред. год', value: '-year' },
    },
  }),
  computed: {
    idDash() {
      return this.idDashFrom;
    },
    idVisual() {
      return this.idFrom || '';
    },
    isFullScreen() {
      return !!this.fullScreenMode;
    },
    parentHeight() {
      return this.sizeFrom.height - 40;
    },
    parentWidth() {
      return this.sizeFrom.width;
    },
    getTheme() {
      return this.$store.getters.getTheme;
    },
    getDashFromStore() {
      return this.$store.state[this.idDash];
    },
    getVisualFromStore() {
      return this.getDashFromStore[this.idVisual];
    },
    getTokens() {
      return this.getDashFromStore?.tockens;
    },
    getOptions() {
      return this.getVisualFromStore.options;
    },
    pickerMode() {
      return this.getOptions.pickerMode;
    },
    outputFormat() {
      return this.getOptions.outputFormat;
    },
    rangeButtonsList() {
      return this.getOptions.rangeBtnList;
    },
    formatForPicker() {
      if (this.outputFormat) {
        return this.outputFormat;
      }
      if (this.hideTime) {
        return this.defaultFormat.date;
      }
      return this.defaultFormat.dateTime;
    },
    useTimestampInToken() {
      return this.getOptions.useTimestampInToken;
    },
    hideTime() {
      if (this.outputFormat) {
        return this.checkFormatOnIncludesTime(this.outputFormat);
      }
      return this.getOptions.hideTime;
    },
    useTimeTemplate() {
      return this.getOptions.useTimeTemplate;
    },
    timeTemplateStart() {
      return this.getOptions.timeTemplateStart;
    },
    timeTemplateEnd() {
      return this.getOptions.timeTemplateEnd;
    },
    expandRangeButtonsSet() {
      return this.getOptions.expandRangeButtonsSet;
    },
    getShortcuts() {
      const rangeBtnList = this.rangeButtonsList || this.defaultRangeBtnList;
      const vk2title = new Map();
      vk2title.set('kv1-2', '1 пг.');
      vk2title.set('kv1-3', '9 месяцев');
      vk2title.set('kv3-4', '2 пг.');
      // eslint-disable-next-line array-callback-return,consistent-return
      return rangeBtnList.map((key) => {
        if (key in this.rangeBtnOptions) {
          return {
            key,
            ...this.rangeBtnOptions[key],
          };
        }
        if (key.startsWith('kv')) {
          const [, kv] = key.match(/^kv([\d-]+)$/);
          return {
            key: `${kv}kv`,
            label: vk2title.get(key) || `${kv} кв.`,
            value: () => {
              const [start, end] = kv.includes('-') ? kv.split('-') : [kv, kv];
              return {
                start: moment().quarter(start).startOf('quarter'),
                end: moment().quarter(end).endOf('quarter'),
              };
            },
            callback: () => {
              this.$set(this.reactiveValue, 'shortcut', `${kv}kv`);
            },
          };
        }
      });
    },
  },
  watch: {
    pickerMode(val, oldVal) {
      if (val !== oldVal) {
        this.clearValue();
        this.updateFormattedValue();
        this.updateValueInStore();
      }
    },
    outputFormat(format, oldFormat) {
      if (format && oldFormat) {
        this.updateFormat({
          format, oldFormat,
        });
      }
      if (format && !oldFormat) {
        this.updateFormat({
          format,
          oldFormat: this.hideTime
            ? this.defaultFormat.date
            : this.defaultFormat.dateTime,
        });
      }
      if (!format && oldFormat) {
        this.updateFormat({
          format: this.hideTime
            ? this.defaultFormat.date
            : this.defaultFormat.dateTime,
          oldFormat,
        });
      }
      this.updateValueInStore();
      this.setTokenValue();
    },
    useTimestampInToken() {
      this.setTokenValue();
    },
    hideTime(val, oldVal) {
      const curValue = !!val;
      const prevValue = !!oldVal;
      if (curValue !== prevValue) {
        if (!this.outputFormat) {
          if (val) {
            this.updateFormat({
              format: this.defaultFormat.date,
              oldFormat: this.defaultFormat.dateTime,
            });
          } else {
            this.updateFormat({
              format: this.defaultFormat.dateTime,
              oldFormat: this.defaultFormat.date,
            });
          }
          this.updateValueInStore();
          this.setTokenValue();
        }
      }
    },
    localValue: {
      handler() {
        this.setDateFromTokens();
      },
      deep: true,
    },
    getTokens: {
      handler(tokens) {
        if (this.pickerMode === 'exactManual') {
          tokens.forEach(({ name }) => {
            if (this.localValue.date.includes(`$${name}$`)) {
              this.setDateFromTokens();
            }
          });
        } else if (this.pickerMode === 'startEndManual') {
          tokens.forEach(({ name }) => {
            if (this.localValue.start.includes(`$${name}$`)
            || this.localValue.end.includes(`$${name}$`)) {
              this.setDateFromTokens();
            }
          });
        }
      },
      deep: true,
    },
    getShortcuts: {
      handler(val, oldVal) {
        const valToStr = JSON.stringify(val);
        const oldValToStr = JSON.stringify(oldVal);
        if (valToStr !== oldValToStr) {
          this.clearValue();
          this.setDate();
        }
      },
      deep: true,
    },
  },
  created() {
    this.setDefaultOptions();
    this.setTokenAction();
    this.loadValueFromStore();
  },
  mounted() {
    this.setTokenValue = throttle(this.setTokenValue, 200);
    this.updateValueInStore = throttle(this.updateValueInStore, 200);
    if (this.pickerMode === 'range') {
      this.setDateFromShortcut();
    }
    this.setDate();
    // Для старых значений
    this.updater();
  },
  methods: {
    // TODO: Преобразование значений старого пикера в новые
    updater() {
      const oldDate = this.getVisualFromStore.date;
      if (oldDate) {
        const {
          end = null,
          endCus = null,
          range = null,
          start = null,
          startCus = null,
          exactDate = null,
          exactDateCustom = null,
          last = null,
        } = oldDate;

        let mode = null;
        let value = null;
        let format = null;
        let hideTime = null;

        if (range) {
          mode = 'range';
          format = this.getVisualFromStore.timeOutputFormat;
          hideTime = this.getVisualFromStore.hideTimeSelect;
          if (range?.shortcut) {
            const defaultFormat = hideTime || this.hideTime
              ? this.defaultFormat.dateTime
              : this.defaultFormat.date;
            const dateByShortcuts = this.calcDateByShortcut(
              range.shortcut,
              format || this.outputFormat || defaultFormat,
            );
            value = {
              start: dateByShortcuts.start,
              shortcut: range.shortcut,
              end: dateByShortcuts.end,
            };
          } else {
            value = {
              start: range.start,
              shortcut: null,
              end: range.end,
            };
          }
        } else if (end || start) {
          mode = 'startEnd';
          value = {
            start,
            end,
          };
          format = this.getVisualFromStore.timeOutputFormat;
          hideTime = this.getVisualFromStore.hideTimeSelect;
        } else if (endCus || startCus) {
          mode = 'startEndManual';
          value = {
            start: startCus,
            end: endCus,
          };
        } else if (exactDate) {
          mode = 'exact';
          value = {
            date: exactDate,
          };
          format = this.getVisualFromStore.timeOutputFormat;
          hideTime = this.getVisualFromStore.hideTimeSelect;
        } else if (exactDateCustom) {
          mode = 'exactManual';
          value = {
            date: exactDateCustom,
          };
        } else if (last && last?.every && last?.time) {
          mode = 'time';
          value = {
            count: last.every,
            type: last.time,
            start: '',
            end: '',
            period: '',
          };
        }
        if (mode && value) {
          // Чтобы изменения точно применились после setDate
          this.$nextTick(() => {
            this.$nextTick(() => {
              this.$store.commit('setState', [{
                object: this.getOptions,
                prop: 'pickerMode',
                value: mode,
              }]);
              this.$nextTick(() => {
                this.$store.commit('setState', [{
                  object: this.getVisualFromStore,
                  prop: 'pickerValue',
                  value,
                }]);
                this.localValue = value;
                this.updateFormattedValue();
                this.updateValueInStore();
                this.setTokenValue();
                this.$store.commit('setState', [{
                  object: this.getVisualFromStore,
                  prop: 'date',
                  value: null,
                }]);
              });
            });
          });
        }
        if (hideTime !== null && hideTime !== undefined) {
          this.$store.commit('setState', [{
            object: this.getOptions,
            prop: 'hideTime',
            value: hideTime,
          }]);
        }
        if (format !== null && format !== undefined) {
          this.$store.commit('setState', [{
            object: this.getOptions,
            prop: 'outputFormat',
            value: format,
          }]);
        }
      }
    },
    checkFormatOnIncludesTime(format) {
      const tokensTimeFormat = ['h', 'H', 's', 'k', 'm', 'a', 'A'];
      let isFormatWithoutTime = true;
      let index = 0;
      while (index < tokensTimeFormat.length && isFormatWithoutTime === true) {
        if (format.includes(tokensTimeFormat[index])) {
          isFormatWithoutTime = false;
          break;
        }
        index += 1;
      }
      return isFormatWithoutTime;
    },
    closePopup() {
      this.modelPopup = false;
    },
    openPopup(e) {
      e.preventDefault();
      this.closePopup();
      this.setPopupPosition({
        x: e.clientX,
        y: e.clientY,
      });
      this.reactiveValue = structuredClone(this.localValue);
      this.$nextTick(() => {
        this.modelPopup = true;
        if (this.pickerMode === 'range') {
          if (!this.localValue?.shortcut) {
            this.disableSelectionOnShortcut();
          } else {
            this.setSelectionOnShortcut();
          }
        }
      });
    },
    setPopupPosition({ x, y }) {
      this.popupPositionX = x;
      this.popupPositionY = y;
    },
    setDefaultOptions() {
      const options = componentsSettings.options.picker;
      const defaultOptions = {};
      componentsSettings.optionFields.forEach((field) => {
        // Относится ли настройка к этой визуализации и есть ли у неё default
        if (options.includes(field.option) && typeof field.default !== 'undefined') {
          // Если отсутствует на данный момент в store
          if (typeof this.getOptions[field.option] === 'undefined') {
            defaultOptions[field.option] = field.default;
          }
        }
      });
      this.$store.commit('setState', [{
        object: this.getVisualFromStore,
        prop: 'options',
        value: {
          ...this.getOptions,
          ...defaultOptions,
        },
      }]);
    },
    updateValueInStore() {
      // Добавляем поле, в случае его его еще нет в store
      if (typeof this.getVisualFromStore.pickerValue === 'undefined') {
        this.$store.commit('setState', [{
          object: this.getVisualFromStore,
          prop: 'pickerValue',
          value: null,
        }]);
      }
      this.$nextTick(() => {
        this.$store.commit('setState', [{
          object: this.getVisualFromStore,
          prop: 'pickerValue',
          value: structuredClone(this.localValue),
        }]);
      });
    },
    setDefaultLocalValue() {
      this.localValue = this.defaultValueByMode[this.pickerMode];
    },
    setDefaultReactiveValue() {
      this.reactiveValue = this.defaultValueByMode[this.pickerMode];
    },
    clearValue() {
      this.setDefaultLocalValue();
      this.setDefaultReactiveValue();
    },
    loadValueFromStore() {
      if (!this.getVisualFromStore?.pickerValue) {
        // Если в store нет значения - ставим default
        this.clearValue();
        // Затем устанавливаем это значение в store
        this.updateValueInStore();
      } else {
        this.localValue = structuredClone(this.getVisualFromStore.pickerValue);
      }
    },
    closePopupHandler() {
      this.reactiveValue = this.defaultValueByMode[this.pickerMode];
      this.loadValueFromStore();
    },
    setDate() {
      if (this.modelPopup) {
        this.closePopup();
      }
      if (this.reactiveValue) {
        this.setDefaultReactiveValue();
        this.updateFormattedValue();
      } else {
        this.updateFormattedValue();
        this.clearValue();
      }
      this.updateValueInStore();
      this.setTokenValue();
    },
    setDateFromTokens() {
      if (this.pickerMode === 'exactManual') {
        this.formattedValue = this.replaceTokens(this.localValue.date);
      }
      if (this.pickerMode === 'startEndManual') {
        const start = this.replaceTokens(this.localValue.start);
        const end = this.replaceTokens(this.localValue.end);
        this.formattedValue = `${start || '...'} - ${end || '...'}`;
      }
    },
    setDateFromShortcut() {
      if (this.localValue?.shortcut) {
        const defaultFormat = this.hideTime
          ? this.defaultFormat.date
          : this.defaultFormat.dateTime;

        this.localValue = this.calcDateByShortcut(
          this.localValue.shortcut || this.localValue?.shortcutKey || '',
          this.outputFormat || defaultFormat,
        );
      }
    },
    updateLocalValue() {
      if (this.reactiveValue) {
        this.$nextTick(() => {
          this.localValue = {
            ...this.localValue,
            ...this.reactiveValue,
          };
        });
      } else {
        this.clearValue();
      }
    },
    updateFormattedValue() {
      if (
        this.pickerMode === 'range'
          || this.pickerMode === 'startEnd'
      ) {
        if (!(this.localValue.start && this.localValue.end)) {
          this.formattedValue = '';
        } else {
          this.formattedValue = `${this.localValue.start || '...'} - ${this.localValue.end || '...'}`;
        }
      }
      if (this.pickerMode === 'exact') {
        this.formattedValue = `${this.localValue.date || ''}`;
      }
      if (
        this.pickerMode === 'exactManual'
          || this.pickerMode === 'startEndManual'
      ) {
        this.setDateFromTokens();
      }
      if (this.pickerMode === 'time') {
        if (this.localValue.type && this.localValue.count) {
          this.formattedValue = this.getLastTimeTextByType(
            this.localValue.type,
            this.localValue.count,
          );
        } else {
          this.formattedValue = '';
        }
      }
    },
    getLastTimeTextByType(type, count) {
      switch (type) {
        case 'second':
          return pluralizeTime(
            count,
            ['секунда', 'секунды', 'секунд'],
            'Период:',
          );
        case 'minute':
          return pluralizeTime(
            count,
            ['минута', 'минуты', 'минут'],
            'Период:',
          );
        case 'hour':
          return pluralizeTime(
            count,
            ['час', 'часа', 'часов'],
            'Период:',
          );
        case 'day':
          return pluralizeTime(
            count,
            ['день', 'дня', 'дней'],
            'Период:',
          );
        default:
          return '';
      }
    },
    getTimePeriod(time, type) {
      let period = '';
      if (time) {
        switch (type) {
          case 'second':
            period = Number(time);
            break;
          case 'minute':
            period = Number(time) * 60;
            break;
          case 'hour':
            period = Number(time) * 3600;
            break;
          case 'day':
            period = Number(time) * 3600 * 24;
            break;
          default:
            period = '';
            break;
        }
      }
      if (this.useTimeTemplate) {
        const secPeriod = period.toFixed();
        let start = '';
        let end = '';
        if (this.timeTemplateStart) {
          // eslint-disable-next-line no-template-curly-in-string
          start = this.timeTemplateStart.replace('${sec}', secPeriod);
        }
        if (this.timeTemplateEnd) {
          // eslint-disable-next-line no-template-curly-in-string
          end = this.timeTemplateEnd.replace('${sec}', secPeriod);
        }
        return {
          start,
          end,
          period,
        };
      }
      return {
        start: period ? +moment().format('X') - period : '',
        end: period ? +moment().format('X') : '',
      };
    },
    updateFormat({ format, oldFormat }) {
      if (['range', 'startEnd'].includes(this.pickerMode)) {
        const start = this.localValue.start
          ? moment(this.localValue.start, oldFormat).format(format)
          : '...';
        let end = this.localValue.end
          ? moment(this.localValue.end, oldFormat).format(format)
          : '...';
        if (this.pickerMode === 'range') {
          if (end !== '...') {
            end = moment(this.localValue.end, format).set({
              hour: 23,
              minute: 59,
            }).format(format);
          }
        }
        this.formattedValue = `${start} - ${end}`;
        this.$set(this.localValue, 'start', start === '...' ? null : start);
        this.$set(this.localValue, 'end', end === '...' ? null : end);
      }
      if (['exact'].includes(this.pickerMode)) {
        if (this.formattedValue) {
          this.formattedValue = moment(this.formattedValue, oldFormat).format(format);
          this.$set(this.localValue, 'date', this.formattedValue);
        }
      }
    },
    formatForToken(date) {
      if (!date) {
        return '';
      }
      if (this.outputFormat) {
        if (this.useTimestampInToken) {
          return moment(date, this.outputFormat).format('X');
        }
        return date;
      }
      return moment(date, this.outputFormat).format('X');
    },
    getValueForTokens() {
      const result = {
        start: '',
        end: '',
        exact: '',
      };
      const copyValue = structuredClone(this.localValue);
      if (this.pickerMode === 'range') {
        result.start = this.formatForToken(copyValue.start);
        result.end = this.formatForToken(copyValue.end);
        return result;
      }
      if (this.pickerMode === 'startEnd') {
        result.start = this.formatForToken(copyValue.start);
        result.end = this.formatForToken(copyValue.end);
        return result;
      }
      if (this.pickerMode === 'exact') {
        result.exact = this.formatForToken(copyValue.date);
        return result;
      }
      if (this.pickerMode === 'startEndManual') {
        result.start = this.replaceTokens(copyValue.start, true);
        result.end = this.replaceTokens(copyValue.end, true);
        return result;
      }
      if (this.pickerMode === 'exactManual') {
        result.exact = this.replaceTokens(copyValue.date, true);
        return result;
      }
      if (this.pickerMode === 'time') {
        const {
          start,
          end,
        } = this.getTimePeriod(
          copyValue.count,
          copyValue.type,
        );
        result.start = start;
        result.end = end;
        return result;
      }
      return result;
    },
    disableSelectionOnShortcut() {
      this.$nextTick(() => {
        const pickerHTMLElement = this.$refs[`${this.idVisual}-range`].$el;
        const shortcutContainer = pickerHTMLElement.querySelector('.shortcuts-container');
        const shortcutButtons = shortcutContainer.querySelectorAll('button');
        shortcutButtons.forEach((buttonEl) => {
          if (buttonEl.classList.contains('is-selected')) {
            buttonEl.classList.remove('is-selected');
          }
        });
      });
    },
    setSelectionOnShortcut() {
      // TODO: Костыль для выделения функциональных шорткатов
      const picker = this.$refs[`${this.idVisual}-range`];
      const childrenList = picker.$children;
      const containerId = `${this.idVisual}-range-picker-container`;
      const modalContainerId = `${this.idVisual}-range-picker-container-DatePicker`;
      if (childrenList) {
        const pickerContainer = childrenList
          .find((el) => el.$attrs.id === containerId);
        if (pickerContainer) {
          const modalContainer = pickerContainer.$children
            .find((el) => el.$el.id === modalContainerId);
          if (modalContainer) {
            const shortcutContainer = modalContainer.$children
              .find((el) => el.$el.classList.contains('shortcuts-container'));
            if (shortcutContainer) {
              const currentShortcut = this.getShortcuts
                .find((el) => (el?.key === this.localValue.shortcut)
                    || (el.value === this.localValue.shortcut));
              if (currentShortcut) {
                shortcutContainer.select(currentShortcut);
              } else {
                this.clearValue();
              }
            }
          }
        }
      }
    },
    setTokenAction() {
      const actions = this.actions.map((action) => ({
        ...action,
        capture: this.captures,
      }));
      this.$store.commit('setActions', {
        actions,
        idDash: this.idDash,
        id: this.idVisual,
      });
    },
    setTokenValue() {
      const {
        start,
        end,
        exact,
      } = this.getValueForTokens();
      this.$store.commit('tokenAction', {
        idDash: this.idDashFrom,
        elem: this.idFrom,
        action: 'select',
        value: {
          start,
          end,
          exact,
        },
      });
    },
    replaceTokens(value, noFormat = false) {
      let format = this.defaultFormat.dateTime;
      if (this.outputFormat) {
        format = this.outputFormat;
      } else if (this.hideTime) {
        format = this.defaultFormat.date;
      }
      let updatedValue = value;

      if (/\$\w+\$/.test(value)) {
        this.getTokens.forEach((token) => {
          updatedValue = updatedValue
            .replaceAll(`$${token.name}$`, token.value);
        });
        if (/^\d+$/.test(updatedValue) && !noFormat) {
          updatedValue = moment(+updatedValue * 1000).format(format);
        }
      }
      return `${updatedValue}`;
    },
    calcDateByShortcut(shortcut, format) {
      const date = {
        start: '',
        shortcut,
        end: '',
      };
      if (!shortcut) {
        return date;
      }
      const today = moment();
      // Текущий день
      if (shortcut === 'thisDay' || shortcut === 'day') {
        date.start = today.clone().startOf('day');
        date.end = today.clone().endOf('day');
      // Предыущий день
      } else if (shortcut === 'lastDay' || shortcut === '-day') {
        date.start = today.clone().subtract(1, 'day').startOf('day');
        date.end = today.clone().subtract(1, 'day').endOf('day');
      // Текущая неделя
      } else if (shortcut === 'thisWeek' || shortcut === 'isoWeek') {
        date.start = today.clone().startOf('isoWeek');
        date.end = today.clone().endOf('isoWeek');
      // Предыдущая неделя
      } else if (shortcut === 'lastWeek' || shortcut === '-isoWeek') {
        date.start = today.clone().subtract(1, 'week').startOf('isoWeek');
        date.end = today.clone().subtract(1, 'week').endOf('isoWeek');
      // Последние 7 дней
      } else if (shortcut === 'last7Days' || `${shortcut}` === '7') {
        date.start = today.clone().subtract(7, 'days');
        date.end = today.clone().endOf('day');
      // Последние 30 дней
      } else if (shortcut === 'last30Days' || `${shortcut}` === '30') {
        date.start = today.clone().subtract(30, 'days');
        date.end = today.clone().endOf('day');
      // Текущий месяц
      } else if (shortcut === 'thisMonth' || shortcut === 'month') {
        date.start = today.clone().startOf('month');
        date.end = today.clone().endOf('month');
      // Предыдущий месяц
      } else if (shortcut === 'lastMonth' || shortcut === '-month') {
        date.start = today.clone().subtract(1, 'month').startOf('month');
        date.end = today.clone().subtract(1, 'month').endOf('month');
      // Текущий год
      } else if (shortcut === 'thisYear' || shortcut === 'year') {
        date.start = today.clone().startOf('year');
        date.end = today.clone().endOf('year');
      // Предыдущий год
      } else if (shortcut === 'lastYear' || shortcut === '-year') {
        date.start = today.clone().subtract(1, 'year').startOf('year');
        date.end = today.clone().subtract(1, 'year').endOf('year');
      // Кварталы
      } else if (shortcut?.length > 0 && shortcut.includes('kv')) {
        // Немного дублируется код из getShortcuts
        // Пока оставлено как есть, в связи с пробемами обратной совместимости
        const [, kv] = shortcut.match(/^([\d-]+)kv$/);
        const [start, end] = kv.includes('-') ? kv.split('-') : [kv, kv];
        date.start = moment().quarter(start).startOf('quarter');
        date.end = moment().quarter(end).endOf('quarter');
      } else {
        return date;
      }

      if (date.start && date.end) {
        date.start = date.start.format(format);
        date.end = date.end.format(format);
      }
      return date;
    },
  },
};
</script>

<style lang="scss" scoped>
$picker-bg: var(--secondary_bg);
$picker-text: var(--main_text);

$picker-active-bg: var(--accent_ui_color);
$picker-active-text: white;

$picker-between-active-bg: var(--accent_ui_color);
$picker-between-active-text: white;

$picker-hover-bg: var(--accent_ui_color);
$picker-hover-text: white;

$picker-border: var(--main_border);
.date-picker {
  padding: 6px;
  color: $picker-text;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  &__wrapper {
    padding: 6px 10px;
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    border: 1px solid $picker-border;
    border-radius: 4px;
    max-width: 350px;
  }
  &__text {
    font-size: 14px;
    line-height: 1.1;
  }
  &__popup {
    padding: 10px;
    width: 320px;
  }
  &__name {
    font-size: 14px;
    line-height: 1.1;
    font-weight: bold;
    margin-bottom: 5px;
    color: $picker-text;
  }
  &__menu {
    overflow-y: visible;
    overflow-x: visible;
    contain: initial;
  }
  &__group {
    &::v-deep .time-picker-column-item {
      color: $picker-text;
    }
    &::v-deep .field-label {
      color: $picker-text;
    }
    &::v-deep {
      .field.is-focused {
        .field-label {
          color: $picker-between-active-text !important;
        }
      }
    }
    &::v-deep .header-picker {
      color: $picker-text;
      background-color: $picker-bg !important;
    }
    &::v-deep .datepicker {
      border: 1px solid $picker-border;
    }
    &::v-deep .field {
      .field-input {
        background-color: $picker-bg;
        border-color: $picker-border;
        color: $picker-text;
      }
      &.is-focused {
        .field-input {
          background-color: $picker-bg;
          border-color: $picker-border !important;
          color: $picker-text;
        }
      }
    }
    &::v-deep .datetimepicker .datepicker {
      background: $picker-bg;
      .pickers-container {
        background: $picker-bg;
      }
    }
    &::v-deep .custom-button {
      background: $picker-bg;
      span {
        color: $picker-text !important;
      }
      .custom-button-effect {
        background-color: $picker-bg !important;
      }
      &:hover {
        .custom-button-effect {
          background-color: $picker-hover-bg !important;
        }
      }
    }
    &::v-deep .datepicker-button.validate {
      border-color: transparent !important;
      svg {
        fill: $picker-text !important;
      }
      .datepicker-button-effect {
        background-color: $picker-bg !important;
      }
      &:hover {
        svg {
          fill: $picker-hover-text !important;
        }
        .datepicker-button-effect {
          background-color: $picker-hover-bg !important;
        }
      }
    }
    &::v-deep .datepicker-buttons-container {
      background: $picker-bg;
      border-color: $picker-border;
      .datepicker-button {
        background: $picker-bg;
        border-color: $picker-border;
      }
    }
    &::v-deep button.datepicker-day {
      &.enable {
        .datepicker-day-text {
          color: $picker-text !important;
        }
        .datepicker-day-effect {
          background-color: $picker-bg !important;
        }
        &.selected {
          .datepicker-day-text {
            color: $picker-active-text !important;
          }
          .datepicker-day-effect {
            background-color: $picker-active-bg !important;
          }
        }
        &.between {
          .datepicker-day-text {
            color: $picker-between-active-text !important;
          }
          .datepicker-day-effect {
            background-color: $picker-between-active-bg !important;
          }
        }
      }
      &:hover {
        .datepicker-day-text {
          color: $picker-hover-text !important;
        }
        .datepicker-day-effect {
          background-color: $picker-hover-bg !important;
        }
      }
    }
    &::v-deep .datepicker-today {
      background-color: transparent !important;
      border: 1px solid;
    }
    &::v-deep .datepicker-container .datepicker-controls {
      .datepicker-button {

        svg {
          fill: $picker-text !important;
        }
      }
    }
    &::v-deep .date-time-picker {
      color: $picker-text !important;
    }
    &::v-deep .time-picker {
        .time-picker-column-item {
          .time-picker-column-item-text {
            color: $picker-text !important;
          }
          .time-picker-column-item-effect {
            background-color: $picker-bg !important;
          }
          &.active {
            .time-picker-column-item-text {
              color: $picker-active-text !important;
            }
            .time-picker-column-item-effect {
              background-color: $picker-active-bg !important;
            }
          }
          &:hover {
            .time-picker-column-item-text {
              color: $picker-hover-text !important;
            }
            .time-picker-column-item-effect {
              background-color: $picker-hover-bg !important;
            }
          }
        }
    }
    &::v-deep .shortcuts-container {
      border-color: transparent;
      .custom-button-content {
        span {
          white-space: nowrap;
          color: $picker-text !important;
        }
      }
      .custom-button-effect {
        background-color: $picker-bg !important;
      }
      .custom-button {
        border-color: transparent !important;
        &.is-selected {
          .custom-button-content {
            color: $picker-active-text !important;
            span {
              color: $picker-active-text !important;
            }
          }
          .custom-button-effect {
            background-color: $picker-active-bg !important;
          }
        }
        &:hover {
          .custom-button-content {
            span {
              color: $picker-hover-text !important;
            }
          }
          .custom-button-effect {
            background-color: $picker-hover-bg !important;
          }
        }

      }
    }
    &::v-deep .year-month-selector {
      background-color: $picker-bg;
      .custom-button {
        border-color: transparent !important;
        .custom-button-content {
          color: $picker-text !important;
          fill: $picker-text !important;
        }
        .custom-button-effect {
          background-color: $picker-bg !important;
        }
        &.is-selected {
          .custom-button-content {
            color: $picker-active-text !important;
          }
          .custom-button-effect {
            background-color: $picker-active-bg !important;
          }
        }
        &:hover {
          .custom-button-content {
            color: $picker-hover-text !important;
            span {
              fill: $picker-hover-text !important;
            }
          }
          .custom-button-effect {
            background-color: $picker-hover-bg !important;
          }
        }
      }
    }
  }
}
</style>
