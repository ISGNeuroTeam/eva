<template>
  <div
    class="search-block"
    :style="{ background: theme.$main_bg, color: theme.$main_text }"
  >
    <div
      class="search-card-block"
      :style="{ background: theme.$main_bg, color: theme.$main_text }"
    >
      <div
        class="loading-divider"
        :class="{ loading: loading }"
      >
        <div
          class="loading-bar"
          :style="{ background: theme.$primary_button }"
        />
      </div>
      <div class="search-block-header">
        <div
          class="search-block-title"
          :style="{ color: theme.$title }"
        >
          Новый поиск
        </div>
        <v-btn
          class="search-block-header__btn"
          :class="historySizeUndo"
          text
          @click="backInput"
        >
          <v-icon
            class="search-block-header__icon"
            :class="historySizeUndo"
          >
            {{ mdiArrowLeftThick }}
          </v-icon>
          <span
            class="search-block-header__text"
            :class="historySizeUndo"
          >
            Шаг назад
          </span>
        </v-btn>
        <v-btn
          class="search-block-header__btn"
          :class="historySizeRedo"
          text
          @click="forwardInput"
        >
          <span
            class="search-block-header__text"
            :class="historySizeRedo"
          >
            Шаг вперед
          </span>
          <v-icon
            class="search-block-header__icon"
            :class="historySizeRedo"
          >
            {{ mdiArrowRightThick }}
          </v-icon>
        </v-btn>
        <v-btn
          class="action-btn"
          text
          @click="refreshInput"
        >
          <span
            class="action-btn-text"
            :style="{ color: theme.$main_text }"
          >
            Сбросить
          </span>
          <v-icon
            class="action-btn-icon"
            :style="{ color: theme.$main_text }"
          >
            {{ mdiRefresh }}
          </v-icon>
        </v-btn>
      </div>
      <!--      <v-textarea-->
      <!--        ref="search"-->
      <!--        v-model="search.original_otl"-->
      <!--        class="textarea"-->
      <!--        :color="theme.$main_text"-->
      <!--        :style="{ color: `${theme.$main_text} !important` }"-->
      <!--        placeholder="Введите запрос"-->
      <!--        spellcheck="false"-->
      <!--        auto-grow-->
      <!--        filled-->
      <!--        outlined-->
      <!--        rows="1"-->
      <!--        row-height="15"-->
      <!--        @keyup.ctrl.\="addLineBreaks"-->
      <!--        @keyup.ctrl.enter.prevent="keypressCtrlEnter"-->
      <!--      />-->
      <codemirror
        ref="search"
        v-model="search.original_otl"
        :options="cmOption"
        class="search-block-codemirror"
        :style="`height: ${heightCodemirror}px`"
        @keyup.ctrl.\="addLineBreaks"
        @change="keypressCtrlEnter($event)"
        @input="changeInput"
      />
      <div class="search-block-footer">
        <div
          class="search-block-title"
          :style="{ color: theme.$title }"
        >
          <div
            v-if="data.length > 0"
            :style="{ color: theme.$secondary_text }"
          >
            <v-icon :color="theme.$ok_color">
              {{ mdiCheck }}
            </v-icon>
            <span>{{ data.length }} результатов </span>
            <span v-if="searchTimeInterval">( {{ searchTimeInterval }} )</span>
          </div>
        </div>
        <div class="d-flex align-center">
          <div class="search-block-footer-settings">
            <v-menu
              v-model="settings"
              offset-y
              :close-on-content-click="false"
            >
              <template v-slot:activator="{ on, attrs }">
                <div
                  class="search-block-footer-settings__btn"
                  v-bind="attrs"
                  v-on="on"
                >
                  Настройки поиска
                  <v-icon :color="theme.$main_text">
                    {{
                      mdiChevronDown
                    }}
                  </v-icon>
                </div>
              </template>
              <div class="search-block-footer-settings__search">
                <div class="search-block-footer-settings__text">
                  Автоперенос на новую строку
                  <v-switch
                    v-model="cmOption.lineWrapping"
                    inset
                    @change="autoTransfer"
                  />
                </div>
                <v-menu
                  :offset-x="true"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <div
                      class="search-block-footer-settings__text"
                      v-bind="attrs"
                      v-on="on"
                    >
                      <div>
                        Число отображаемых строк
                        <v-icon
                          :color="theme.$main_text"
                          style="transform: rotate(-90deg)"
                        >
                          {{
                            mdiChevronDown
                          }}
                        </v-icon>
                      </div>
                    </div>
                  </template>
                  <div class="search-block-footer-settings__search">
                    <div
                      v-for="item in searchSize"
                      :key="item"
                      class="search-block-footer-settings__text"
                      :class="item === heightCodemirror / 24
                        ? 'search-block-footer-settings__text--active'
                        : ''"
                      @click="changeHeightCodemirror(item)"
                    >
                      {{ item }} строк
                    </div>
                    <div
                      class="search-block-footer-settings__text"
                      @click="numberLineModal = true"
                    >
                      Пользовательское значение
                    </div>
                  </div>
                </v-menu>
              </div>
            </v-menu>
          </div>
          <div class="date-time-picker-wrap mt-1 mr-5">
            <v-menu
              v-model="menuDropdown"
              :close-on-content-click="false"
              offset-y
              max-width="150"
            >
              <template v-slot:activator="{ on, attrs }">
                <div
                  class="date-time-picker-text"
                  v-bind="attrs"
                  v-on="on"
                >
                  {{ timeRangeValue }}
                  <v-icon :color="theme.$main_text">
                    {{
                      mdiChevronDown
                    }}
                  </v-icon>
                </div>
              </template>
              <div class="dropdown-range">
                <div class="dropdown-range-block">
                  <div class="dropdown-range-title">
                    Общие
                  </div>
                  <div
                    class="dropdown-range-item"
                    @click="
                      changeTimeRange({
                        text: 'За все время',
                        timeHours: 'all',
                      })
                    "
                  >
                    За все время
                  </div>
                </div>
                <div class="dropdown-range-block">
                  <div class="dropdown-range-title">
                    Недавние
                  </div>
                  <div
                    v-for="item in timeRanges"
                    :key="item.time"
                    class="dropdown-range-item"
                    @click="changeTimeRange(item)"
                  >
                    {{ item.text }}
                  </div>
                </div>
                <div class="dropdown-range-block">
                  <div class="dropdown-range-title">
                    Гибкий поиск
                  </div>
                  <v-menu
                    v-model="menuCalendar"
                    class="calendar"
                    :close-on-content-click="false"
                    nudge-left="260"
                    nudge-top="298"
                    max-width="250"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <div
                        class="dropdown-range-item flex-between"
                        v-bind="attrs"
                        v-on="on"
                      >
                        <div>Выбрать дату</div>
                        <div>
                          <v-icon>{{ mdiCalendarMonthOutline }}</v-icon>
                        </div>
                      </div>
                    </template>
                    <div class="date-picker-wrap">
                      <v-date-picker
                        v-model="dates"
                        :first-day-of-week="1"
                        range
                      />
                      <div class="d-flex justify-space-around date-range-wrap">
                        <div class="date-range-string">
                          c {{ dates[0] }}
                        </div>
                        <div class="date-range-string">
                          по {{ dates[1] }}
                        </div>
                      </div>
                      <div class="time-picker d-flex justify-space-around p-3">
                        <input
                          v-model="timeStart"
                          type="time"
                        >
                        <input
                          v-model="timeFinish"
                          type="time"
                        >
                      </div>
                      <div class="picker-actions d-flex justify-space-around">
                        <v-btn
                          depressed
                          small
                          @click="menuCalendar = false"
                        >
                          Отменить
                        </v-btn>
                        <v-btn
                          depressed
                          small
                          dark
                          :color="theme.$primary_button"
                          :disabled="dates.length < 2"
                          @click="
                            setTimeFromPicker(dates, timeStart, timeFinish)
                          "
                        >
                          Выбрать
                        </v-btn>
                      </div>
                    </div>
                  </v-menu>
                </div>
              </div>
            </v-menu>
          </div>
          <v-btn
            class="action-btn"
            dark
            depressed
            small
            :color="theme.$ok_color"
            :loading="loading"
            @click="launchSearch"
          >
            <span class="action-btn-text">Поиск</span>
            <v-icon class="action-btn-icon">
              {{ mdiMagnify }}
            </v-icon>
          </v-btn>
        </div>
      </div>
    </div>
    <number-line-modal
      v-model="numberLineModal"
      @change="changeHeightCodemirror($event)"
      @close="numberLineModal = false"
    />
  </div>
</template>

<script>
import {
  mdiRefresh,
  mdiMagnify,
  mdiChevronDown,
  mdiCalendarMonthOutline,
  mdiCheck,
  mdiArrowLeftThick,
  mdiArrowRightThick,
} from '@mdi/js';

import { codemirror } from 'vue-codemirror';
import numberLineModal from '@/components/reportsV2/numberLineModal';

import 'codemirror/mode/python/python.js';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/indent-fold.js';

export default {
  components: {
    codemirror,
    numberLineModal,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      twf: '',
      search: {
        parametrs: {
          tws: 0,
          twf: 0,
        },
      },
      mdiRefresh,
      mdiMagnify,
      mdiChevronDown,
      mdiCheck,
      mdiCalendarMonthOutline,
      mdiArrowLeftThick,
      mdiArrowRightThick,
      timeRangeValue: 'За все время',
      menuCalendar: false,
      menuDropdown: false,
      dates: [],
      timeStart: '00:00',
      timeFinish: '00:00',
      searchTimeInterval: '',
      timeRanges: [
        { text: 'Последние 60 минут', timeHours: 1 },
        { text: 'Последние 4 часа', timeHours: 4 },
        { text: 'Последние 24 часа', timeHours: 24 },
        { text: 'Последние 7 дней', timeHours: 168 },
        { text: 'Последние 30 дней', timeHours: 720 },
      ],
      cmOption: {
        tabSize: 4,
        styleActiveLine: false,
        lineNumbers: true,
        styleSelectedText: false,
        line: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
        mode: 'text/x-python',
        hintOptions: {
          completeSingle: false,
        },
        matchBrackets: true,
        showCursorWhenSelecting: true,
        theme: 'default',
        lineWrapping: false,
      },
      searchSize: [10, 15, 20, 30, 40, 50],
      heightCodemirror: 240,
      numberLineModal: false,
      settings: false,
      historySize: {
        redo: 0,
        undo: 0,
      },
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    dateRangeText() {
      return this.dates.join(' ~ ');
    },
    historySizeRedo() {
      return this.historySize?.redo === 0 ? 'disabled' : '';
    },
    historySizeUndo() {
      return this.historySize?.undo === 0 ? 'disabled' : '';
    },
    // effectiveDateRange () {
    //   return this.dates.sort().join(' - ');
    // }
  },
  watch: {
    loading(val) {
      if (val === false) {
        const options = {
          hour12: 'true',
          hour: 'numeric',
          minute: 'numeric',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        };
        if (
          this.search.parametrs.twf === 0
          && this.search.parametrs.twf === 0
        ) {
          this.searchTimeInterval = 'за все время';
        } else {
          this.searchTimeInterval = `c ${
            new Intl.DateTimeFormat('ru', options).format(
              this.search.parametrs.tws * 1000,
            )
          } по ${
            new Intl.DateTimeFormat('ru', options).format(
              this.search.parametrs.twf * 1000,
            )}`;
        }
      }
    },
  },
  created() {
    this.$set(this, 'search', JSON.parse(JSON.stringify(this.$store.getters.getReportSearch)));
  },
  mounted() {
    document.title = 'EVA | Исследование данных';
    if (this.search.original_otl !== '') {
      this.$store.commit('setShould', {
        idDash: 'reports',
        id: 'table',
        status: true,
      });
    }
    this.$refs.search.$el.addEventListener('keypress', (event) => {
      if (event.ctrlKey && event.keyCode === 10) {
        this.launchSearch();
      }
    });
  },
  methods: {
    changeInput() {
      // eslint-disable-next-line no-underscore-dangle
      this.historySize = this.$refs.search._data.cminstance.doc.historySize();
    },
    keypressCtrlEnter(e) {
      if (e.ctrlKey) {
        this.launchSearch();
      }
    },
    addLineBreaks() {
      this.search.original_otl = this.search.original_otl.replaceAll(
        '|',
        '\n|',
      );
      if (this.search.original_otl[0] === '\n') {
        this.search.original_otl = this.search.original_otl.substring(1);
      }
      this.search.original_otl = this.search.original_otl.replaceAll(
        '\n\n|',
        '\n|',
      );
      this.search.original_otl = this.search.original_otl.replaceAll(
        '|\n',
        '| ',
      );
      this.search.original_otl = this.search.original_otl.replaceAll(
        '| \n',
        '| ',
      );
    },
    refreshInput() {
      this.search.original_otl = '';
    },
    async launchSearch() {
      this.$emit('launchSearch', JSON.parse(JSON.stringify(this.search)));
    },
    hashCode(otl) {
      return otl
        .split('')
        .reduce(
          (prevHash, currVal) => ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0,
          0,
        );
    },
    changeTimeRange(range) {
      let twf;
      let tws;
      if (range.timeHours === 'all') {
        twf = 0;
        tws = 0;
      } else {
        twf = Math.round(Date.now() / 1000);
        tws = twf - range.timeHours * 3600;
      }
      this.timeRangeValue = range.text;
      this.setTwsTwf(tws, twf);
    },
    setTimeFromPicker(dates, timeStart, timeFinish) {
      let twsArr = dates[0].split('-');
      const timeStartArr = timeStart.split(':');
      twsArr = twsArr.concat(timeStartArr);
      const tws = new Date(
        twsArr[0],
        twsArr[1] - 1,
        twsArr[2],
        twsArr[3],
        twsArr[4],
      ).getTime() / 1000;
      let twfArr = dates[1].split('-');
      const timeFinishArr = timeFinish.split(':');
      twfArr = twfArr.concat(timeFinishArr);
      const twf = new Date(
        twfArr[0],
        twfArr[1] - 1,
        twfArr[2],
        twfArr[3],
        twfArr[4],
      ).getTime() / 1000;
      this.timeRangeValue = `c ${dates[0]} по ${dates[1]}`;
      this.setTwsTwf(tws, twf);
    },
    setTwsTwf(tws, twf) {
      let temp;
      if (tws > twf) {
        temp = tws;
        tws = twf;
        twf = temp;
        this.sortDates();
      }
      this.$set(this.search.parametrs, 'tws', tws);
      this.$set(this.search.parametrs, 'twf', twf);
      this.menuCalendar = false;
      this.menuDropdown = false;
    },
    sortDates() {
      this.timeRangeValue = `c ${this.dates[1]} по ${this.dates[0]}`;
    },
    backInput() {
      // eslint-disable-next-line no-underscore-dangle
      this.$refs.search._data.cminstance.doc.undo();
    },
    forwardInput() {
      // eslint-disable-next-line no-underscore-dangle
      this.$refs.search._data.cminstance.doc.redo();
    },
    autoTransfer() {
      // eslint-disable-next-line no-underscore-dangle
      this.$refs.search._data.cminstance.doc.cm.refresh();
    },
    // 24 - высота строки
    changeHeightCodemirror(item) {
      this.heightCodemirror = +item * 24;
      this.settings = false;
    },
  },
};
</script>

<style lang="sass">
@import ./../../sass/_colors
@import 'codemirror/lib/codemirror'

.textarea
  max-height: 420px
  overflow: auto

//.calendar
//  .v-menu__content
//    max-width: 150px
.date-time-picker-wrap
  .date-time-picker-text
    font-size: 14px
.v-menu__content
  //width: 150px
  .dropdown-range
    padding: 6px
    max-width: 150px
    .dropdown-range-block
      margin-bottom: 31px
    .dropdown-range-title
      font-size: 16px
      font-weight: 600
      line-height: 25px
      color: $secondary_text
    .dropdown-range-item
      font-size: 14px
      line-height: 23px
      color: $primary_button
      cursor: pointer
    .flex-between
      display: flex
      justify-content: space-between
      .v-icon__svg
        width: 12px

  .date-picker-wrap
    .v-picker__body
      width: 246px !important
      background-color: $main_bg !important
      .v-date-picker-header
        button
          color: $primary_button !important
          font-weight: 500
          &:first-letter
            text-transform: uppercase !important
      .v-date-picker-table
        height: 195px
        table
          thead
            th
              color: $accent_ui_color !important
          tbody
            tr
              td
                width: 28px !important
                button
                  height: 28px
                  width: 28px
                  .v-btn__content
                    color: $main_text !important
                    font-weight: 400
                    font-size: 14px
                .accent
                  background-color: $primary_button !important
                  .v-btn__content
                    color: white !important
                .accent--text
                  color: $primary_button !important
                &:nth-child(6), &:nth-child(7)
                  button
                    .v-btn__content
                      color: $error_color
  .date-range-wrap
    .date-range-string
      font-size: 14px
  .time-picker
    margin-bottom: 10px
    input
      color: $accent_ui_color
      font-weight: 500
      border: solid $main_border 1px
      border-color: $main_border !important
      border-radius: 5px
      padding-left: 5px
      padding-right: 5px
      font-size: 14px
      &:focus
        border: solid $primary_button 1px !important
      &:active
        border: solid $primary_button 1px !important
  .picker-actions
    padding: 10px 0
    .v-btn
      height: 24px !important
      .v-btn__content
        height: 24px !important
        text-transform: capitalize
        letter-spacing: 0.25px

.search-block-header
  &__btn
    background: rgba(6, 154, 238, 0.12)
    height: 24px !important
    margin-right: 12px
    &.disabled
      background: $main_border
  &__icon,
  &__text
    color: $primary_button !important
    font-size: 12px !important
    &.disabled
      color: $secondary_border !important
  &__icon
    .v-icon__svg
      height: 15px
.search-block-codemirror
  margin-bottom: 8px
  .CodeMirror
    border-radius: 10px
    border: 1px solid $secondary_border
    background: $secondary_bg
    color: $main_text
    caret-color: $main_text
    height: 100%
  .CodeMirror-cursor
    border-left: 1px solid $main_text
  .CodeMirror-gutters
    color: $main_text
    background: $main_bg
  .CodeMirror-vscrollbar
    width: 7px
    transition: all .3s
    cursor: pointer
    &:hover
      width: 13px
      &::-webkit-scrollbar-track
        background: var(--secondary_border)
    &::-webkit-scrollbar
      transition: all .3s
      width: 7px
      &:hover
        width: 13px
  .CodeMirror-hscrollbar
    height: 7px
    transition: all .3s
    cursor: pointer
    &:hover
      height: 13px
      &::-webkit-scrollbar-track
        background: var(--secondary_border)
    &::-webkit-scrollbar
      transition: all .3s
      height: 7px
      &:hover
        height: 13px
  .CodeMirror-vscrollbar,
  .CodeMirror-hscrollbar
    &::-webkit-scrollbar-track
      background: rgba(0,0,0,0)
      border-radius: 5px
      transition: all .3s
.search-block-footer
  .v-input
    padding-top: 0
    margin-top: 0
    .v-input__slot:before
      display: none
  &-settings
    &__search
      padding: 6px
    &__text
      display: flex
      align-items: center
      font-size: 12px
      cursor: pointer
      transition: all .3s ease-in-out
      &--active
        color: #1976d2
      &:hover
        color: #1976d2
      .v-input
        margin-left: 8px
      .v-input--selection-controls
        margin-top: 0
        padding-top: 0
      .v-input__slot
        margin-bottom: 0
      .v-messages
        display: none
      .v-input--selection-controls__input
        margin-right: 0
    &__btn
      display: flex
      align-items: center
      margin-right: 12px
      font-size: 14px
.action-btn
  .action-btn-text
    text-transform: capitalize
    font-size: 14px
    margin-right: 5px
    letter-spacing: 0.25px
    font-weight: 400
  .action-btn-icon
    width: 20px
.v-picker__title
  display: none

.theme--light.v-input input,
.theme--light.v-input textarea,
.theme--light.v-input textarea::placeholder
    color: $secondary_text
.v-input__slot fieldset
  color: $secondary_text !important
</style>
