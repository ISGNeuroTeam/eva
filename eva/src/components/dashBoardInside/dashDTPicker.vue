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
                <template v-if="isPeriod">
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
                    @input="setTocken('dt')"
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
                    @input="setTocken('dt')"
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
                    @input="setTocken('exactDate')"
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
                  @input="setTocken('range')"
                />
              </div>
            </template>

            <template v-if="showCustomInputBlock">
              <div
                v-if="isPeriod"
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
                  @input="setTocken('custom-range')"
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
                  @input="setTocken('custom-range')"
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
                  @input="setTocken('exactDateCustom')"
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
    DTPickerCustomShortcuts: {
      type: Array,
      default: function _default() {
        return [
          { key: 'thisDay', label: 'текущий день', value: 'day' },
          { key: 'lastDay', label: 'предыдущий день', value: '-day' },
          { key: 'thisWeek', label: 'текущая неделя', value: 'isoWeek' },
          { key: 'lastWeek', label: 'пред. неделя', value: '-isoWeek' },
          { key: 'last7Days', label: 'последние 7 дней', value: 7 },
          { key: 'last30Days', label: 'последние 30 дней', value: 30 },
          { key: 'thisMonth', label: 'текущий месяц', value: 'month' },
          { key: 'lastMonth', label: 'пред. месяц', value: '-month' },
          { key: 'thisYear', label: 'текущий год', value: 'year' },
          { key: 'lastYear', label: 'пред. год', value: '-year' },
        ];
      },
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
        every: 0,
        time: '',
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
              endCus: null,
              range: null,
              start: null,
              startCus: null,
              exactDate: null,
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
    isPeriod() {
      return !this.options.selectingExactDate;
    },
    showLastTimeBlock() {
      if (!this.isPeriod) {
        return false;
      }
      return this.options.showLastTimeBlock;
    },
    showChoseDateAndTimeBlock() {
      return this.options.showChoseDateAndTimeBlock;
    },
    showRangeDateBlock() {
      if (!this.isPeriod) {
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
  },
  watch: {
    isPeriod(val) {
      if (val) {
        if (this.exactDate) {
          this.start = this.exactDate;
          this.curDate = `${this.start} - ...`;
          this.exactDate = null;
          this.setTocken('dt');
        }
      }
      if (!val) {
        if (this.start) {
          this.exactDate = this.start;
          this.curDate = this.exactDate;
          this.start = null;
          this.end = null;
          this.setTocken('exactDate');
        }
      }
      this.commitTokenValue();
      this.setTokenAction();
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
          this.setTocken('time');
          this.commitTokenValue();
        }
      }
    },
  },
  created() {
    const data = this.getPickerDate;
    if (data.range != null && data.range.hasOwnProperty('shortcut')) {
      this.shortcut = this.DTPickerCustomShortcuts.find(
        (sc) => sc.value === data.range.shortcut,
      ).key;
    }
  },
  mounted() {
    this.setTokenAction();
    if (this.getPickerDate?.last?.time) {
      this.last = this.getPickerDate.last;
      this.setTime(this.getPickerDate.last.time);
    }
    this.date = structuredClone(this.getPickerDate);
    this.$emit('hideDS', this.id);
    this.curDate = this.calcCurrentDate();
  },
  methods: {
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
      }
      if (/^\d+$/.test(value)) {
        updatedValue = moment(+value * 1000).format(this.dateTimeFormat);
      }
      return `${prefix}${updatedValue}${suffix}`;
    },

    calcCurrentDate() {
      const data = this.getPickerDate;
      let current = '';

      if (data.exactDate !== null) {
        current = data.exactDate;
        this.exactDate = data.exactDate;
      }

      if (data.exactDateCustom !== null) {
        current = this.replaceTokens(data.exactDateCustom);
        this.exactDateCustom.value = data.exactDateCustom;
      }

      if (data.start != null) {
        current = `${data.start} - `;
        this.start = data.start;
        if (data.end != null) {
          current += data.end;
          this.end = data.end;
        } else {
          current += '...';
        }
      } else if (data.end != null) {
        current = `... - ${data.end}`;
      }

      if (data.range != null) {
        if (data.range.hasOwnProperty('shortcut')) {
          this.commitTokenValue();
        } else {
          this.range = data.range;
        }

        current = [
          this.range.start,
          this.range.end,
        ].join(' - ');
      }

      if (data.startCus != null) {
        current = this.replaceTokens(data.startCus, '', ' - ');
        this.start_custom.value = data.startCus;

        if (data.endCus != null) {
          current += this.replaceTokens(data.endCus);
          this.end_custom.value = data.endCus;
        } else {
          current += '...';
        }
      } else if (data.endCus != null) {
        current = `... - ${data.endCus}`;
      }
      if (data.last != null) {
        if (data.last.every !== 0 && data.last.time !== '') {
          let time = '...';
          switch (data.last.time) {
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
          current = `Последние  ${data.last.every} ${time}`;
        }
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
    showCurrent() {
      this.$set(this.date, 'start', this.start);
      this.$set(this.date, 'end', this.end);
      this.$set(this.date, 'range', this.range);
      this.$set(this.date, 'startCus', this.start_custom.value);
      this.$set(this.date, 'endCus', this.end_custom.value);
      this.$set(this.date, 'last', this.last);
      this.$set(this.date, 'exactDate', this.exactDate);
      this.$set(this.date, 'exactDateCustom', this.exactDateCustom.value);
      this.$store.commit('setPickerDate', {
        date: structuredClone(this.date),
        idDash: this.idDash,
        id: this.id,
      });
    },
    setLast(event) {
      this.last.every = event;
      this.setTocken('time');
    },
    setTime(time) {
      // this.last.time = time;
      this.$store.commit('setState', [{
        object: this.last,
        prop: 'time',
        value: time,
      }]);
      Object.keys(this.color).forEach((item) => {
        this.color[item] = '$accent_ui_color';
      });
      if (this.color[time] === '$accent_ui_color') {
        this.color[time] = '$primary_button';
      } else {
        this.color[time] = '$accent_ui_color';
      }
      this.setTocken('time');
    },
    setTocken(elem) {
      this.lastControlElement = elem;
      let period = 0;
      switch (elem) {
        case 'dt':
          this.startForStore = this.formatDateToResult(this.start);
          this.endForStore = this.formatDateToResult(this.end);
          this.exactDateForStore = null;
          this.range = null;
          this.exactDate = null;
          this.start_custom.value = null;
          this.exactDateCustom.value = null;
          this.end_custom.value = null;
          this.last.time = '';
          this.last.every = 0;
          Object.keys(this.color).forEach((item) => {
            this.color[item] = '$accent_ui_color';
          });
          break;

        case 'range':
          if (this.range) {
            this.startForStore = this.formatDateToResult(this.range.start);
            this.endForStore = this.formatDateToResult(this.range.end);
          }
          this.start = null;
          this.end = null;
          this.exactDate = null;
          this.start_custom.value = null;
          this.end_custom.value = null;
          this.last.time = '';
          this.last.every = 0;
          Object.keys(this.color).forEach((item) => {
            this.color[item] = '$accent_ui_color';
          });
          break;

        case 'exactDate':
          this.exactDateForStore = this.formatDateToResult(this.exactDate);
          this.start = null;
          this.end = null;
          this.start_custom.value = null;
          this.exactDateCustom.value = null;
          this.end_custom.value = null;
          this.last.time = '';
          this.last.every = 0;
          Object.keys(this.color).forEach((item) => {
            this.color[item] = '$accent_ui_color';
          });
          break;

        case 'custom-range':
          this.startForStore = this.start_custom.value;
          this.endForStore = this.end_custom.value;
          this.exactDateForStore = null;
          this.start = null;
          this.exactDate = null;
          this.exactDateCustom.value = null;
          this.end = null;
          this.range = null;
          this.last.time = '';
          this.last.every = 0;
          Object.keys(this.color).forEach((item) => {
            this.color[item] = '$accent_ui_color';
          });
          break;

        case 'exactDateCustom':
          this.exactDateForStore = this.exactDateCustom.value;
          this.start = null;
          this.end = null;
          this.exactDate = null;
          this.start_custom.value = null;
          this.end_custom.value = null;
          this.range = null;
          this.last.time = '';
          this.last.every = 0;
          Object.keys(this.color).forEach((item) => {
            this.color[item] = '$accent_ui_color';
          });
          break;

        case 'time':
          switch (this.last.time) {
            case 'second':
              period = Number(this.last.every) * 1000;
              break;

            case 'minute':
              period = Number(this.last.every) * 1000 * 60;
              break;

            case 'hour':
              period = Number(this.last.every) * 1000 * 3600;
              break;
            case 'day':
              period = Number(this.last.every) * 1000 * 3600 * 24;
              break;
            default:
              break;
          }
          // eslint-disable-next-line no-case-declarations
          const {
            useLastTimeTemplate,
            lastTimeTemplateStart,
            lastTimeTemplateEnd,
          } = this.options;
          this.startForStore = this.formatDateToResult(Date.now() - period);
          this.endForStore = this.formatDateToResult(Date.now());
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
          this.start = null;
          this.end = null;
          this.range = null;
          this.exactDateForStore = null;
          this.start_custom.value = null;
          this.end_custom.value = null;
          break;
        default:
          break;
      }
    },
    formatDateToResult(date) {
      if (date === null) return '';
      const {
        timeOutputFormat = null,
      } = this.options;
      if (timeOutputFormat) {
        return moment(date, timeOutputFormat).format(timeOutputFormat);
      }
      return parseInt(
        new Date(date).getTime() / 1000,
        10,
      );
    },
    setDate() {
      if (this.lastControlElement) {
        this.setTocken(this.lastControlElement);
      }

      this.commitTokenValue();

      this.showCurrent();
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
