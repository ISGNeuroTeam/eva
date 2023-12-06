<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      :style="customStyle"
      :class="customClass"
      v-bind="$attrs"
      class="dash-picker"
    >
      <div
        class="current-date show_curent"
        :style="{
          color: theme.$main_text,
          border: `1px solid ${theme.$main_border}`
        }"
      >
        <span
          v-if="curDate"
          class="cur-date"
        >
          {{ curDate }}
        </span>
        <span
          v-else
          class="cur-date--placeholder"
        >
          Дата не установлена
        </span>
        <div
          v-click-outside="onClose"
          class="DTpicker"
          :class="{ show_picker_elem: show_picker_elem }"
        >
          <v-btn
            icon
            :color="theme.$main_text"
            @click="openHidden"
          >
            <v-icon>{{ calendar }}</v-icon>
          </v-btn>
          <div
            class="DTPicker-elem"
            :style="{
              boxShadow: getBoxShadow,
              background: theme.$main_bg,
              color: theme.$main_text,
              border: `1px solid ${theme.$main_border}`
            }"
          >
            <template v-if="showLastTimeBlock">
              <div class="last-time-block">
                <div
                  class="name-of-picker"
                  :style="{ color: theme.$title }"
                >
                  Выбор времени
                </div>
                <div class="choose-period">
                  <p :style="{ color: theme.$main_text }">
                    Последние
                  </p>
                  <v-text-field
                    v-model="lastEvery"
                    class="textarea-item"
                    outlined
                    :color="theme.$accent_ui_color"
                    :style="{ color: theme.$main_text }"
                    hide-details
                    @input="setLast($event)"
                  />
                </div>
                <div class="choose-time">
                  <v-chip
                    :color="theme[color.day]"
                    class="time"
                    @click="setTime('day')"
                  >
                    День
                  </v-chip>
                  <v-chip
                    :color="theme[color.hour]"
                    class="time"
                    @click="setTime('hour')"
                  >
                    Часов
                  </v-chip>
                  <v-chip
                    :color="theme[color.minute]"
                    class="time"
                    @click="setTime('minute')"
                  >
                    Минут
                  </v-chip>
                  <v-chip
                    :color="theme[color.second]"
                    class="time"
                    @click="setTime('second')"
                  >
                    Секунд
                  </v-chip>
                </div>
              </div>
            </template>

            <template v-if="showChoseDateAndTimeBlock">
              <div class="date-time-block">
                <div
                  class="name-of-picker"
                  :style="{ color: theme.$title }"
                >
                  Выбор времени и даты
                </div>
                <template v-if="isRangeMode">
                  <DTPicker
                    :id="`${id}-start`"
                    v-model="start"
                    label="Начальная дата и время"
                    :format="dateTimeFormat"
                    :formatted="dateTimeFormat"
                    button-now-translation="Сейчас"
                    :color="theme.$accent_ui_color"
                    :button-color="theme.$primary_button"
                    class="dtpicker"
                    :only-date="hideTimeSelect"
                    @input="setToken('dt')"
                  />
                  <DTPicker
                    :id="`${id}-end`"
                    v-model="end"
                    label="Конечная дата и время"
                    :format="dateTimeFormat"
                    :formatted="dateTimeFormat"
                    button-now-translation="Сейчас"
                    :color="theme.$accent_ui_color"
                    :button-color="theme.$primary_button"
                    class="dtpicker"
                    :only-date="hideTimeSelect"
                    @input="setToken('dt')"
                  />
                </template>
                <template v-else>
                  <DTPicker
                    :id="`${id}-exact`"
                    v-model="exactDate"
                    label="Дата и время"
                    :shortcut="shortcut"
                    :custom-shortcuts="DTPickerCustomShortcuts"
                    :format="dateTimeFormat"
                    :formatted="dateTimeFormat"
                    button-now-translation="Сейчас"
                    :color="theme.$accent_ui_color"
                    :button-color="theme.$primary_button"
                    class="dtpicker"
                    :only-date="hideTimeSelect"
                    @input="setToken('exactDate')"
                  />
                </template>
              </div>
            </template>

            <template v-if="showRangeDateBlock">
              <div class="range-date-block">
                <div
                  class="name-of-picker"
                  :style="{ color: theme.$title }"
                >
                  Диапазон дат
                </div>
                <DTPicker
                  :id="`${id}-between`"
                  v-model="range"
                  range
                  label="Диапазон дат"
                  :shortcut="shortcut"
                  :format="dateTimeFormat"
                  :formatted="dateTimeFormat"
                  :color="theme.$accent_ui_color"
                  :button-color="theme.$primary_button"
                  :custom-shortcuts="DTPickerCustomShortcuts"
                  class="dtpicker range-picker"
                  @input="setToken('range')"
                />
              </div>
            </template>

            <template v-if="showCustomInputBlock">
              <div
                v-if="isRangeMode"
                class="custom-input-block"
              >
                <div
                  class="name-of-picker"
                  :style="{ color: theme.$title }"
                >
                  Ввод даты и времени вручную
                </div>
                <v-text-field
                  v-model="start_custom.value"
                  label="Начальная дата"
                  counter="500"
                  :style="{ color: theme.$main_text }"
                  clearable
                  :color="theme[start_custom.color]"
                  hide-details
                  outlined
                  class="dtpicker custom-picker"
                  @blur="start_custom.color = 'controlsActive'"
                  @input="setToken('custom-range')"
                />
                <v-text-field
                  v-model="end_custom.value"
                  label="Конечная дата"
                  counter="500"
                  :style="{ color: theme.$main_text }"
                  clearable
                  :color="theme[end_custom.color]"
                  hide-details
                  outlined
                  class="dtpicker custom-picker"
                  @blur="end_custom.color = 'controlsActive'"
                  @input="setToken('custom-range')"
                />
              </div>
              <div
                v-else
                class="custom-input-block"
              >
                <div
                  class="name-of-picker"
                  :style="{ color: theme.$title }"
                >
                  Ввод даты и времени вручную
                </div>
                <v-text-field
                  v-model="exactDateCustom.value"
                  label="Дата и время"
                  counter="500"
                  :style="{ color: theme.$main_text }"
                  clearable
                  :color="theme[exactDateCustom.color]"
                  hide-details
                  outlined
                  class="dtpicker custom-picker"
                  @blur="exactDateCustom.color = 'controlsActive'"
                  @input="setToken('exactDateCustom')"
                />
              </div>
            </template>

            <div class="set-btn-block">
              <v-btn
                small
                :color="theme.$primary_button"
                class="set-btn"
                @click="setDate"
              >
                Установить
              </v-btn>
            </div>
          </div>
        </div>
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

export default {
  name: 'DashDatePicker',
  props: {
    idFrom: {
      type: String,
      required: true,
    },
    idDashFrom: {
      type: String,
      required: true,
    },
    dataRestFrom: {
      type: Array,
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
      actions: [{ name: 'select', capture: [] }],
      captures: ['start', 'end', 'exact'],
      start: null,
      end: null,
      range: null,
      exactDate: null,
      last: {
        every: null,
        time: null,
      },
      color: {
        day: '$accent_ui_color',
        hour: '$accent_ui_color',
        minute: '$accent_ui_color',
        second: '$accent_ui_color',
      },
      start_custom: {
        value: null,
        color: 'controlsActive',
      },
      exactDateCustom: {
        value: null,
        color: 'controlsActive',
      },
      end_custom: {
        value: null,
        color: 'controlsActive',
      },
      check: mdiCheckBold,
      calendar: mdiCalendarMonthOutline,
      show_picker_elem: false,
      show_curent: false,
      date: {},
      curDate: '',
      startForStore: '',
      exactDateForStore: '',
      endForStore: '',
      defaultOptions: {
        showLastTimeBlock: true,
        showChoseDateAndTimeBlock: true,
        showRangeDateBlock: true,
        showCustomInputBlock: true,
        timeOutputFormat: '',
      },
      lastControlElement: null,
      defaultFormat: 'YYYY-MM-DD HH:mm',
      defaultFormatWithoutTime: 'YYYY-MM-DD',
      shortcut: '',
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
    };
  },
  computed: {
    dateTimeFormat() {
      const {
        timeOutputFormat,
        hideTimeSelect,
      } = this.options;
      if (timeOutputFormat) {
        return timeOutputFormat;
      }
      return hideTimeSelect ? this.defaultFormatWithoutTime : this.defaultFormat;
    },
    hideTimeSelect() {
      const {
        timeOutputFormat,
        hideTimeSelect,
      } = this.options;
      if (hideTimeSelect) {
        return hideTimeSelect;
      }
      if (timeOutputFormat) {
        return !timeOutputFormat.includes('HH') && !timeOutputFormat.includes('mm');
      }
      return false;
    },
    lastEvery: {
      get() {
        return this.last.every;
      },
      set(every) {
        this.$store.commit('setState', [{
          object: this.last,
          prop: 'every',
          value: every,
        }]);
      },
    },
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },
    dataRest() {
      return this.dataRestFrom;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    dashFromStore() {
      return this.$store.state[this.idDash][this.id];
    },
    getPickerDate() {
      if (!this.dashFromStore.date) {
        this.$store.commit('setState', [
          {
            object: this.dashFromStore,
            prop: 'date',
            value: {
              end: null,
              endForStore: null,
              endCus: null,
              range: null,
              start: null,
              startForStore: null,
              startCus: null,
              exactDate: null,
              exactDateForStore: null,
              exactDateCustom: null,
            },
          },
          {
            object: this.dashFromStore,
            prop: 'changeDate',
            value: false,
          },
        ]);
      }
      // возвращаем либо новый созданный либо имеющийся
      return this.dashFromStore.date;
    },
    getTockens() {
      return this.$store.state[this.idDash].tockens;
    },
    dashStore() {
      const { id, idDash } = this;
      return this.$store.state[idDash][id];
    },
    options() {
      return {
        ...this.defaultOptions,
        ...this.dashStore.options,
      };
    },
    isRangeMode() {
      return !this.options.selectingExactDate;
    },
    showLastTimeBlock() {
      if (!this.isRangeMode) {
        return false;
      }
      return this.options.showLastTimeBlock;
    },
    showChoseDateAndTimeBlock() {
      return this.options.showChoseDateAndTimeBlock;
    },
    showRangeDateBlock() {
      if (!this.isRangeMode) {
        return false;
      }
      return this.options.showRangeDateBlock;
    },
    showCustomInputBlock() {
      return this.options.showCustomInputBlock;
    },
    getBoxShadow() {
      const shadows = [
        `0 5px 5px -3px ${this.theme.$main_border}`,
        `0 8px 10px 1px ${this.theme.$main_border}`,
        `0 3px 14px 2px ${this.theme.$main_border}`,
      ];
      return `${shadows[0]}, ${shadows[1]}, ${shadows[2]}`;
    },
    getElementType() {
      if (this.exactDate) {
        return 'exactDate';
      }
      if (this.start || this.end) {
        return 'dt';
      }
      if (this.range) {
        return 'range';
      }
      if (this.start_custom.value || this.end_custom.value) {
        return 'custom-range';
      }
      if (this.exactDateCustom.value) {
        return 'exactDateCustom';
      }
      if (this.last.time !== null) {
        return 'time';
      }
      return '';
    },
    DTPickerCustomShortcuts() {
      const rangeBtnList = this.options?.rangeBtnList || this.defaultRangeBtnList;
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
          };
        }
      });
    },
  },
  watch: {
    isRangeMode(value) {
      this.changePickerMode(value);
    },
    options(val, oldVal) {
      if (this.lastControlElement === 'time') {
        const newOpts = {
          useLastTimeTemplate: val.useLastTimeTemplate,
          lastTimeTemplateStart: val.lastTimeTemplateStart,
          lastTimeTemplateEnd: val.lastTimeTemplateEnd,
        };
        const oldOpts = {
          useLastTimeTemplate: oldVal.useLastTimeTemplate,
          lastTimeTemplateStart: oldVal.lastTimeTemplateStart,
          lastTimeTemplateEnd: oldVal.lastTimeTemplateEnd,
        };
        if (JSON.stringify(newOpts) !== JSON.stringify(oldOpts)) {
          this.setToken('time');
          this.commitTokenValue();
        }
      }
    },
    dateTimeFormat(format, oldFormat) {
      const newFormat = format || this.dateTimeFormat;
      if (this.range) {
        this.updateFormat('range', oldFormat, newFormat);
      } else if (this.start || this.end) {
        this.updateFormat('dt', oldFormat, newFormat);
      } else if (this.exactDate) {
        this.updateFormat('exactDate', oldFormat, newFormat);
      } else if (this.last.time) {
        this.updateFormat('time', oldFormat, newFormat);
      } else if (this.start_custom.value || this.end_custom.value) {
        this.updateFormat('custom-range', oldFormat, newFormat);
      } else if (this.exactDateCustom.value) {
        this.updateFormat('exactDateCustom', oldFormat, newFormat);
      }
    },
  },
  created() {
    const data = this.getPickerDate;
    // eslint-disable-next-line no-prototype-builtins
    if (data?.range !== null && data.range.hasOwnProperty('shortcut')) {
      const updateShortcut = this.DTPickerCustomShortcuts.find(
        (sc) => sc.value === data.range.shortcut,
      )?.key || '';
      if (updateShortcut !== this.shortcut) {
        this.shortcut = updateShortcut;
      }
    }
  },
  mounted() {
    this.setTokenAction();
    this.date = structuredClone(this.getPickerDate);
    if (this.date?.last?.time) {
      this.last = this.date.last;
      this.setTime(this.date.last.time);
    }
    this.$emit('hideDS', this.id);
    this.curDate = this.calcCurrentDate();
  },
  methods: {
    setColor() {
      Object.keys(this.color).forEach((item) => {
        this.color[item] = '$accent_ui_color';
      });
    },
    clearFields(exceptions = []) {
      const allFields = [
        {
          field: 'exactDateForStore',
          key: null,
        },
        {
          field: 'startForStore',
          key: null,
        },
        {
          field: 'endForStore',
          key: null,
        },
        {
          field: 'start',
          key: null,
        },
        {
          field: 'end',
          key: null,
        },
        {
          field: 'range',
          key: null,
        },
        {
          field: 'exactDate',
          key: null,
        },
        {
          field: 'exactDateCustom',
          key: 'value',
        },
        {
          field: 'start_custom',
          key: 'value',
        },
        {
          field: 'end_custom',
          key: 'value',
        },
        {
          field: 'last',
          key: 'time',
        },
        {
          field: 'last',
          key: 'every',
        },
      ];
      allFields.forEach(({ field, key }) => {
        if (!exceptions.includes(field)) {
          if (key) {
            this.$set(this[field], key, null);
          } else {
            this[field] = null;
          }
        }
      });
    },
    changePickerMode(isRange) {
      if (isRange) {
        if (this.exactDate) {
          this.start = this.exactDate;
          this.curDate = `${this.start} - ...`;
          this.clearFields(['start']);
          this.setToken('dt');
        } else if (this.exactDateCustom.value) {
          this.start_custom.value = this.exactDateCustom.value;
          this.curDate = this.replaceTokens(this.start_custom.value, '', ' - ');
          this.clearFields(['start_custom']);
          this.setToken('custom-range');
        }
      }
      if (!isRange) {
        if (this.last.time) {
          this.curDate = '';
          this.clearFields();
          this.setToken('exactDate');
        } else if ((this.start || this.end) || this.range) {
          this.exactDate = this.start
              || this.end
              || this.range.start
              || this.range.end;
          this.curDate = this.exactDate;
          this.clearFields(['exactDate']);
          this.setToken('exactDate');
        } else if (this.start_custom.value || this.end_custom.value) {
          this.$set(
            this.exactDateCustom,
            'value',
            this.start_custom.value || this.end_custom.value,
          );
          this.curDate = this.replaceTokens(this.exactDateCustom.value);
          this.clearFields(['exactDateCustom']);
          this.setToken('exactDateCustom');
        }
      }
      this.commitTokenValue();
      this.setTokenAction();
      this.updateValueInStore();
    },
    updateFormat(elem, oldFormat, newFormat) {
      this.setToken(elem, oldFormat, newFormat);
      this.commitTokenValue();
      this.updateValueInStore();
      this.curDate = this.calcCurrentDate({
        start: this.start,
        end: this.end,
        exactDate: this.exactDate,
        exactDateCustom: this.exactDateCustom.value,
        range: this.range,
        startCus: this.start_custom.value,
        endCus: this.end_custom.value,
        last: this.last,
      });
    },
    setTokenAction() {
      const actions = this.actions.map((action) => ({
        ...action,
        capture: this.captures,
      }));
      this.$store.commit('setActions', {
        actions,
        idDash: this.idDash,
        id: this.id,
      });
    },
    onClose() {
      if (this.show_picker_elem) {
        this.show_picker_elem = false;
        this.$emit('setVissible', { element: this.id, overflow: 'scroll' });

        this.changeDate = !this.changeDate;
      }
    },
    replaceTokens(value, prefix = '', suffix = '') {
      let updatedValue = value;

      if (/\$\w+\$/.test(value)) {
        updatedValue = this.convertingTokens(value);
        if (/^\d+$/.test(updatedValue)) {
          updatedValue = moment(+updatedValue * 1000).format(this.dateTimeFormat);
        }
      }
      if (/^\d+$/.test(value)) {
        updatedValue = moment(+value * 1000).format(this.dateTimeFormat);
      }
      return `${prefix}${updatedValue}${suffix}`;
    },
    replaceOldFormat(elem, oldFormat, newFormat) {
      const range = {
        start: null,
        end: null,
        shortcut: undefined,
      };
      const start = null;
      const end = null;
      const rangeStr = '';
      switch (elem) {
        case 'dt':
          if (this.start) {
            this.start = this.formatDateToResult({
              date: this.start,
              oldFormat,
              newFormat,
            });
          } else {
            this.start = null;
          }
          if (this.end) {
            this.end = this.formatDateToResult({
              date: this.end,
              oldFormat,
              newFormat,
            });
          } else {
            this.end = null;
          }
          break;
        case 'range':
          if (this.range.start) {
            range.start = this.formatDateToResult({
              date: this.range.start,
              oldFormat,
              newFormat,
            });
          }
          if (this.range.end) {
            range.end = this.formatDateToResult({
              date: this.range.end,
              oldFormat,
              newFormat,
            });
          }
          this.range = range;
          break;
        case 'exactDate':
          this.exactDate = this.formatDateToResult({
            date: this.exactDate,
            oldFormat,
            newFormat,
          });
          break;
        case 'time':
          if (!this.options.useLastTimeTemplate) {
            if (this.last.time !== null && this.last.every !== null) {
              const period = this.getTimePeriod();
              this.startForStore = this.formatDateToResult({
                date: Date.now() - period,
                isTime: true,
                newFormat,
              });
              this.endForStore = this.formatDateToResult({
                date: Date.now(),
                isTime: true,
                newFormat,
              });
            }
          }
          break;
        default:
          break;
      }
    },
    getTimePeriod() {
      switch (this.last.time) {
        case 'second':
          return Number(this.last.every) * 1000;
        case 'minute':
          return Number(this.last.every) * 1000 * 60;
        case 'hour':
          return Number(this.last.every) * 1000 * 3600;
        case 'day':
          return Number(this.last.every) * 1000 * 3600 * 24;
        default:
          return 0;
      }
    },
    calcCurrentDate(forceUpdateValue) {
      const data = forceUpdateValue || this.getPickerDate;
      let current = '';

      if (data.exactDate !== null) {
        current = data.exactDate;
        this.exactDate = data.exactDate;
      }

      if (data.exactDateCustom !== null) {
        current = this.replaceTokens(data.exactDateCustom);
        this.exactDateCustom.value = data.exactDateCustom;
      }

      if (data.start !== null) {
        current = `${data.start} - `;
        this.start = data.start;
        if (data.end !== null) {
          current += data.end;
          this.end = data.end;
        } else {
          current += '...';
        }
      } else if (data.end !== null) {
        current = `... - ${data.end}`;
      }

      if (data.range !== null) {
        // eslint-disable-next-line no-prototype-builtins
        if (data.range?.shortcut) {
          this.commitTokenValue();
        } else {
          this.range = data.range;
        }
        current = [
          data.range?.start || '',
          data.range?.end || '',
        ].join(' - ');
      }

      if (data.startCus !== null) {
        current = this.replaceTokens(data.startCus, '', ' - ');
        this.start_custom.value = data.startCus;

        if (data.endCus !== null) {
          current += this.replaceTokens(data.endCus);
          this.end_custom.value = data.endCus;
        } else {
          current += '...';
        }
      } else if (data.endCus !== null) {
        current = `... - ${data.endCus}`;
      }
      if (this.last.every !== null && this.last.time !== null) {
        let time = '...';
        switch (this.last.time) {
          case 'second':
            time = 'секунд';
            break;
          case 'minute':
            time = 'минут';
            break;
          case 'hour':
            time = 'часов';
            break;
          case 'day':
            time = 'дней';
            break;
          default:
            break;
        }
        current = `Последние  ${this.last.every} ${time}`;
      }

      this.show_curent = current !== '';
      return current;
    },
    convertingTokens(element) {
      this.getTockens.forEach((token) => {
        element = element.replaceAll(`$${token.name}$`, token.value);
      });
      return element;
    },
    openHidden() {
      if (!this.show_picker_elem) {
        this.$emit('setVissible', { element: this.id, overflow: 'visible' });
        this.show_picker_elem = !this.show_picker_elem;
        this.show_curent = false;
      } else {
        this.onClose();
      }
    },
    updateValueInStore() {
      this.$set(this.date, 'start', this.start);
      this.$set(this.date, 'startForStore', this.startForStore || '');
      this.$set(this.date, 'end', this.end);
      this.$set(this.date, 'endForStore', this.endForStore || '');
      this.$set(this.date, 'range', structuredClone(this.range));
      this.$set(this.date, 'startCus', this.start_custom.value);
      this.$set(this.date, 'endCus', this.end_custom.value);
      this.$set(this.date, 'last', this.last);
      this.$set(this.date, 'exactDate', this.exactDate);
      this.$set(this.date, 'exactDateForStore', this.exactDateForStore || '');
      this.$set(this.date, 'exactDateCustom', this.exactDateCustom.value);
      this.$store.commit('setPickerDate', {
        date: structuredClone(this.date),
        idDash: this.idDash,
        id: this.id,
      });
    },
    setLast(event) {
      this.last.every = event;
      this.setToken('time');
    },
    setTime(time) {
      this.$set(this.last, 'time', time);
      Object.keys(this.color).forEach((item) => {
        this.color[item] = '$accent_ui_color';
      });
      if (this.color[time] === '$accent_ui_color') {
        this.color[time] = '$primary_button';
      } else {
        this.color[time] = '$accent_ui_color';
      }
      this.setToken('time');
    },
    setToken(elem, oldFormat = '', newFormat = '') {
      this.lastControlElement = elem;
      const isFormatUpdated = (oldFormat && newFormat) && (oldFormat !== newFormat);
      if (isFormatUpdated) {
        this.replaceOldFormat(elem, oldFormat, newFormat);
      }
      let period = 0;
      switch (elem) {
        case 'dt':
          this.startForStore = this.formatDateToResult({
            date: this.start,
          });
          this.endForStore = this.formatDateToResult({
            date: this.end,
          });
          this.clearFields([
            'start',
            'end',
            'startForStore',
            'endForStore',
          ]);
          this.setColor();
          break;

        case 'range':
          if (this.range) {
            this.startForStore = this.formatDateToResult({
              date: this.range.start,
            });
            this.endForStore = this.formatDateToResult({
              date: this.range.end,
            });
          }
          this.clearFields([
            'range',
            'startForStore',
            'endForStore',
          ]);
          this.setColor();
          break;

        case 'exactDate':
          this.exactDateForStore = this.formatDateToResult({
            date: this.exactDate,
          });
          this.clearFields([
            'exactDate',
            'exactDateForStore',
          ]);
          this.setColor();
          break;

        case 'custom-range':
          this.startForStore = this.start_custom.value;
          this.endForStore = this.end_custom.value;
          this.clearFields([
            'start_custom',
            'end_custom',
            'startForStore',
            'endForStore',
          ]);
          this.setColor();
          break;

        case 'exactDateCustom':
          this.exactDateForStore = this.exactDateCustom.value;
          this.clearFields([
            'exactDateCustom',
            'exactDateForStore',
          ]);
          this.setColor();
          break;

        case 'time':
          if (this.last.time !== null && this.last.every !== null) {
            period = this.getTimePeriod();
            // eslint-disable-next-line no-case-declarations
            const {
              useLastTimeTemplate,
              lastTimeTemplateStart,
              lastTimeTemplateEnd,
            } = this.options;
            this.startForStore = this.formatDateToResult({
              date: Date.now() - period,
              isTime: true,
            });
            this.endForStore = this.formatDateToResult({
              date: Date.now(),
              isTime: true,
            });
            if (useLastTimeTemplate) {
              const secPeriod = (period / 1000).toFixed();
              if (lastTimeTemplateStart) {
                // eslint-disable-next-line no-template-curly-in-string
                this.startForStore = lastTimeTemplateStart.replace('${sec}', secPeriod);
              }
              if (lastTimeTemplateEnd) {
                // eslint-disable-next-line no-template-curly-in-string
                this.endForStore = lastTimeTemplateEnd.replace('${sec}', secPeriod);
              }
            }
            this.clearFields([
              'last',
              'startForStore',
              'endForStore',
            ]);
          }
          break;
        default:
          break;
      }
    },
    formatDateToResult({
      date, oldFormat, newFormat, isTime,
    }) {
      if (date === null) return '';
      const {
        timeOutputFormat = null,
      } = this.options;
      if (isTime) {
        if (timeOutputFormat || newFormat) {
          return moment(date).format(timeOutputFormat || newFormat);
        }
        return parseInt(
          new Date(date).getTime() / 1000,
          10,
        );
      }
      if (oldFormat && newFormat) {
        return moment(date, oldFormat).format(newFormat);
      }
      if (timeOutputFormat) {
        return moment(date, timeOutputFormat).format(timeOutputFormat);
      }
      return parseInt(
        new Date(date).getTime() / 1000,
        10,
      );
    },
    setDate() {
      if (this.getElementType) {
        this.setToken(this.getElementType);
      }

      this.commitTokenValue();
      this.updateValueInStore();
      this.curDate = this.calcCurrentDate();
      this.openHidden();
    },
    commitTokenValue() {
      this.$store.commit('tokenAction', {
        idDash: this.idDashFrom,
        elem: this.idFrom,
        action: 'select',
        value: {
          start: this.startForStore || '',
          end: this.endForStore || '',
          exact: this.exactDateForStore || '',
        },
      });
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashDTPicker.sass';
</style>

<style lang="scss" scoped>
.DTPicker-elem::v-deep > div .dtpicker {
  background-color: var(--main_bg) !important;
}
.dash-picker {

  ::v-deep .datetimepicker, .datepicker {
    .time-picker-column-item {
      &.active, &:hover {
        color: white !important;
      }
    }
    .datepicker-days {
      button.datepicker-day {
        &.first, &.between, &.last, &.selected, &:hover {
          color: white !important;
        }
      }
    }

  }

  .cur-date--placeholder {
    opacity: .4;
  }
}

</style>
