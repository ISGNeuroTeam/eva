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
          01.01.2001
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
              boxShadow: `0 5px 5px -3px ${theme.$main_border},
          0 8px 10px 1px ${theme.$main_border},0 3px 14px 2px ${theme.$main_border}`,
              background: theme.$main_bg,
              color: theme.$main_text,
              border: `1px solid ${theme.$main_border}`
            }"
          >
            <div v-if="options.canLastTimeEnter && options.canChooseTime">
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

            <div v-if="options.canChooseTime">
              <div
                  class="name-of-picker"
                  :style="{ color: theme.$title }"
              >
                Выбор <span v-if="options.canChooseTime"> времени и </span> даты
              </div>
              <DTPicker
                  :id="`${id}-start`"
                  v-model="start"
                  :label="`Начальная дата ${options.canChooseTime ? ' и время' : ''}`"
                  :format="dateTimeFormat"
                  button-now-translation="Сейчас"
                  :color="theme.$accent_ui_color"
                  :button-color="theme.$primary_button"
                  :only-date="!options.canChooseTime"
                  class="dtpicker"
                  @input="setTocken('dt')"
              />
              <DTPicker
                  :id="`${id}-end`"
                  v-model="end"
                  :label="`Конечная дата ${options.canChooseTime ? ' и время' : ''}`"
                  :format="dateTimeFormat"
                  button-now-translation="Сейчас"
                  :color="theme.$accent_ui_color"
                  :button-color="theme.$primary_button"
                  :only-date="!options.canChooseTime"
                  class="dtpicker"
                  @input="setTocken('dt')"
              />
            </div>

            <div v-else>
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
                :format="dateTimeFormat"
                :color="theme.$accent_ui_color"
                :button-color="theme.$primary_button"
                :custom-shortcuts="DTPickerCustomShortcuts"
                class="dtpicker range-picker"
                @input="setTocken('range')"
              />
            </div>

            <div v-if="options.canManuallyEnter">
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
                @input="setTocken('custom')"
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
                @input="setTocken('custom')"
              />
            </div>

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
      actions: [{ name: 'select', capture: ['start', 'end'] }],
      start: null,
      end: null,
      range: null,
      last: {
        every: 0,
        time: '',
      },
      color: {
        hour: '$accent_ui_color',
        minute: '$accent_ui_color',
        second: '$accent_ui_color',
      },
      start_custom: {
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
      endForStore: '',
      defaultOptions: {
        timeOutputFormat: '',
        canManuallyEnter: true,
        canRangeEnter: true,
        canLastTimeEnter: true,
        canChooseTime: true,
      },
    };
  },
  computed: {
    dateTimeFormat() {
      const {
        canChooseTime,
      } = this.options;
      if (canChooseTime) {
        return 'YYYY-MM-DD hh:mm';
      }
      return 'YYYY-MM-DD';
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
  },
  mounted() {
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDash,
      id: this.id,
    });
    this.$emit('hideDS', this.id);
    this.curDate = this.calcCurrentDate();
  },
  methods: {
    onClose() {
      if (this.show_picker_elem) {
        this.show_picker_elem = false;
        this.$emit('setVissible', { element: this.id, overflow: 'scroll' });

        this.changeDate = !this.changeDate;
      }
    },
    calcCurrentDate() {
      const data = this.getPickerDate;
      let current = '';

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
        current = `${data.range.start} - ${data.range.end}`;
        this.range = data.range;
      }

      if (data.startCus != null) {
        if (data.startCus.indexOf('$$')) {
          current = `${moment(this.convertingTokens(data.startCus) * 1000).format('YYYY-MM-DD')} - `;
        } else {
          current = `${data.startCus} - `;
        }
        this.start_custom.value = data.startCus;
        if (data.endCus != null) {
          if (data.endCus.indexOf('$$')) {
            current += moment(this.convertingTokens(data.endCus) * 1000).format('YYYY-MM-DD');
          } else {
            current += data.endCus;
          }
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
      this.$store.commit('setPickerDate', {
        date: JSON.parse(JSON.stringify(this.date)),
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
      let period = 0;
      switch (elem) {
        case 'dt':
          this.startForStore = this.formatDateToResult(this.start);
          this.endForStore = this.formatDateToResult(this.end);
          this.range = null;
          this.start_custom.value = null;
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
          this.start_custom.value = null;
          this.end_custom.value = null;
          this.last.time = '';
          this.last.every = 0;
          Object.keys(this.color).forEach((item) => {
            this.color[item] = '$accent_ui_color';
          });
          break;

        case 'custom':
          this.startForStore = this.start_custom.value;
          this.endForStore = this.end_custom.value;
          this.start = null;
          this.end = null;
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
            default:
              break;
          }
          this.startForStore = this.formatDateToResult(Date.now() - period);
          this.endForStore = this.formatDateToResult(Date.now());
          this.start = null;
          this.end = null;
          this.range = null;
          this.start_custom.value = null;
          this.end_custom.value = null;
          break;
        default:
          break;
      }
    },
    formatDateToResult(date) {
      const {
        timeOutputFormat = null,
      } = this.options;
      if (timeOutputFormat) {
        return moment(date).format(timeOutputFormat);
      }
      return parseInt(
        new Date(date).getTime() / 1000,
        10,
      );
    },
    setDate() {
      const tockens = this.$store.state[this.idDash].tockens || {};
      let tocken = {};

      const setTocken = (value) => {
        this.$store.commit('setTocken', {
          token: tocken,
          idDash: this.idDash,
          value,
          store: this.$store,
        });
      };
      Object.keys(tockens).forEach((i) => {
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture,
        };
        if (
          tockens[i].elem === this.id
          && tockens[i].action === 'select'
          && tockens[i].capture === 'start'
        ) {
          if (this.startForStore != null) {
            setTocken(this.startForStore);
          }
        }
        if (
          tockens[i].elem === this.id
          && tockens[i].action === 'select'
          && tockens[i].capture === 'end'
        ) {
          if (this.endForStore != null) {
            setTocken(this.endForStore);
          }
        }
      });
      this.showCurrent();
      this.curDate = this.calcCurrentDate();
      this.openHidden();
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
