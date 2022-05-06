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
        v-click-outside="onClose"
        class="DTpicker"
        :class="{ show_picker_elem: show_picker_elem }"
      >
        <div
          class="DTPicker-btn"
          :style="{ background: theme.$accent_ui_color }"
          @click="openHidden"
        >
          <p>Выберите время и дату</p>
          <v-icon
            :style="{ color: theme.$main_text }"
            class="picker-arrow"
          >
            {{ arrow.elem }}
          </v-icon>
        </div>
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
          <div
            class="name-of-picker"
            :style="{ color: theme.$title }"
          >
            Выбор времени и даты
          </div>
          <DTPicker
            v-model="start"
            label="Начальная дата и время"
            format="YYYY-MM-DD HH:mm"
            button-now-translation="Сейчас"
            :color="theme.$accent_ui_color"
            :button-color="theme.$primary_button"
            class="dtpicker"
            @validate="setTocken('dt')"
          />
          <DTPicker
            v-model="end"
            label="Конечная дата и время"
            format="YYYY-MM-DD HH:mm"
            button-now-translation="Сейчас"
            :color="theme.$accent_ui_color"
            :button-color="theme.$primary_button"
            class="dtpicker"
            @validate="setTocken('dt')"
          />
          <div
            class="name-of-picker"
            :style="{ color: theme.$title }"
          >
            Диапазон дат
          </div>
          <DTPicker
            v-model="range"
            range
            label="Диапазон дат"
            format="YYYY-MM-DD"
            :color="theme.$accent_ui_color"
            :button-color="theme.$primary_button"
            :custom-shortcuts="DTPickerCustomShortcuts"
            class="dtpicker range-picker"
            @validate="setTocken('range')"
          />
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
            :append-icon="check"
            :color="theme[start_custom.color]"
            hide-details
            outlined
            class="dtpicker custom-picker"
            @blur="start_custom.color = 'controlsActive'"
            @click:append="customDate('begin')"
          />
          <v-text-field
            v-model="end_custom.value"
            label="Конечная дата"
            counter="500"
            :style="{ color: theme.$main_text }"
            clearable
            :append-icon="check"
            :color="theme[end_custom.color]"
            hide-details
            outlined
            class="dtpicker custom-picker"
            @blur="end_custom.color = 'controlsActive'"
            @click:append="customDate('end')"
          />
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
      <div
        class="current-date"
        :style="{
          color: theme.$main_text,
          border: `1px solid ${theme.$main_border}`
        }"
        :class="{ show_curent: show_curent }"
      >
        {{ curDate }}
      </div>
    </div>
  </portal>
</template>

<script>
import { mdiChevronDown, mdiChevronUp, mdiCheckBold } from '@mdi/js';

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
      up: mdiChevronUp,
      down: mdiChevronDown,
      check: mdiCheckBold,
      arrow: {
        direct: 'down',
        elem: mdiChevronDown,
      },
      show_picker_elem: false,
      show_curent: false,
      date: {},
      curDate: '',
      startForStore: '',
      endForStore: '',
    };
  },
  computed: {
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
        this.arrow.direct = 'down';
        this.arrow.elem = this.down;
        this.showCurrent();
        this.curDate = this.calcCurrentDate();
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
        current = `${data.startCus} - `;
        this.start_custom.value = data.startCus;
        if (data.endCus != null) {
          current += data.endCus;
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
    openHidden() {
      this.show_picker_elem = !this.show_picker_elem;
      if (this.arrow.direct === 'down') {
        this.$emit('setVissible', { element: this.id, overflow: 'visible' });

        this.arrow.direct = 'up';
        this.arrow.elem = this.up;
        this.show_curent = false;
      } else {
        this.onClose();
      }
    },
    customDate(elem) {
      if (elem === 'begin') {
        this.start_custom.color = 'controls';
      } else {
        this.end_custom.color = 'controls';
      }
      this.setTocken('custom');
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
          this.startForStore = parseInt(new Date(this.start).getTime() / 1000, 10);
          this.endForStore = parseInt(new Date(this.end).getTime() / 1000, 10);
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
          this.startForStore = parseInt(
            new Date(this.range.start).getTime() / 1000,
            10,
          );
          this.endForStore = parseInt(
            new Date(this.range.end).getTime() / 1000,
            10,
          );
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

          this.startForStore = ((Date.now() - period) / 1000).toFixed(0);
          this.endForStore = (Date.now() / 1000).toFixed(0);
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
      this.openHidden();
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashDTPicker.sass';
</style>

<style lang="sass" scoped>
.dash-picker
  ::v-deep .datepicker-container
    .datepicker-days
      .datepicker-day
        &.first, &.between, &.last
          color: white !important

</style>
