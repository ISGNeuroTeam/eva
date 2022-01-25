<template>
  <div
    class="search-block"
    :style="{ background: theme.$main_bg, color: theme.$main_text }"
  >
    <div
      class="search-card-block"
      :style="{ background: theme.$main_bg, color: theme.$main_text }"
    >
      <div class="loading-divider" :class="{ loading: loading }">
        <div
          class="loading-bar"
          :style="{ background: theme.$primary_button }"
        />
      </div>
      <div class="search-block-header">
        <div class="search-block-title" :style="{ color: theme.$title }">
          Новый поиск
        </div>
        <v-btn text @click="refreshInput">
          <span class="refresh-btn-text" :style="{ color: theme.$main_text }">
            Сбросить
          </span>
          <v-icon :style="{ color: theme.$main_text }">{{ mdiRefresh }}</v-icon>
        </v-btn>
      </div>
      <v-textarea
        ref="search"
        v-model="search.original_otl"
        placeholder="Введите запрос"
        spellcheck="false"
        auto-grow
        filled
        outlined
        rows="1"
        row-height="15"
        @keyup.ctrl.\="addLineBreaks"
      ></v-textarea>
      <div class="search-block-footer">
        <div class="search-block-title" :style="{ color: theme.$title }">
          <div v-if="data.length > 0" :color="theme.$secondary_text">
            <v-icon :color="theme.$ok_color">{{ mdiCheck }}</v-icon>
            {{ data.length }} результатов
            <!--            <span v-if="dates.length>0">(c {{ dates[0] }} {{ timeStart }} по  {{dates[1]}} {{ timeFinish }})</span>-->
          </div>
        </div>
        <div class="d-flex">
          <div class="time-picker mt-1">
            <v-menu
              v-model="menuDropdown"
              :close-on-content-click="false"
              offset-y
              max-width="150"
            >
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">
                  {{ timeRangeValue }}
                  <v-icon :color="theme.$main_text">{{
                    mdiChevronDown
                  }}</v-icon>
                </div>
              </template>
              <div class="dropdown-range">
                <div class="dropdown-range-block">
                  <div class="dropdown-range-title">Общие</div>
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
                  <div class="dropdown-range-title">Недавние</div>
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
                  <div class="dropdown-range-title">Гибкий поиск</div>
                  <v-menu
                    v-model="menuCalendar"
                    class="calendar"
                    :close-on-content-click="false"
                    nudge-left="300"
                    nudge-top="308"
                    max-width="290"
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
                    <div>
                      <v-date-picker v-model="dates" range></v-date-picker>
                      <div class="d-flex justify-space-around p-3">
                        <div>c {{ dates[0] }}</div>
                        <div>по {{ dates[1] }}</div>
                      </div>
                      <div class="d-flex justify-space-around p-3">
                        <input v-model="timeStart" type="time" />
                        <input v-model="timeFinish" type="time" />
                      </div>
                      <div class="picker-actions d-flex justify-space-around">
                        <v-btn depressed small @click="menuCalendar = false"
                          >Отменить</v-btn
                        >
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
            dark
            depressed
            small
            :color="theme.$ok_color"
            :loading="loading"
            @click="launchSearch"
          >
            <span class="refresh-btn-text">Поиск</span>
            <v-icon>{{ mdiMagnify }}</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  mdiRefresh,
  mdiMagnify,
  mdiChevronDown,
  mdiCalendarMonthOutline,
  mdiCheck,
} from '@mdi/js';

export default {
  props: {
    data: [],
    loading: false,
  },
  data() {
    return {
      twf: '',
      search: {
        parameters: {
          tws: 0,
          twf: 0,
        },
      },
      mdiRefresh: mdiRefresh,
      mdiMagnify: mdiMagnify,
      mdiChevronDown: mdiChevronDown,
      mdiCheck: mdiCheck,
      mdiCalendarMonthOutline: mdiCalendarMonthOutline,
      timeRangeValue: 'За все время',
      menuCalendar: false,
      menuDropdown: false,
      dates: [],
      timeStart: '00:00',
      timeFinish: '00:00',
      timeRanges: [
        { text: 'Последние 60 минут', timeHours: 1 },
        { text: 'Последние 4 часа', timeHours: 4 },
        { text: 'Последние 24 часа', timeHours: 24 },
        { text: 'Последние 7 дней', timeHours: 168 },
        { text: 'Последние 30 дней', timeHours: 720 },
      ],
    };
  },
  computed: {
    theme: function () {
      return this.$store.getters.getTheme;
    },
    dateRangeText() {
      return this.dates.join(' ~ ');
    },
  },
  mounted() {
    document.title = 'EVA | Исследование данных';
    this.search = this.$store.getters.getReportSearch;
    if (this.search.original_otl != '') {
      this.$store.commit('setShould', {
        idDash: 'reports',
        id: 'table',
        status: true,
      });
    }
    // this.calcSize();
    this.$refs.search.$el.addEventListener('keypress', (event) => {
      if (event.ctrlKey && event.keyCode == 13) {
        this.launchSearch();
      }
    });
    this.$refs.report.addEventListener('click', (event) => {
      if (!event.target.classList.contains('static-row')) {
        this.showStatistic = false;
      }
    });
    this.unitedData.color = this.theme.controls;
  },
  methods: {
    addLineBreaks(event) {
      this.search.original_otl = this.search.original_otl.replaceAll(
        '|',
        '\n' + '|'
      );
      if (this.search.original_otl[0] === '\n') {
        this.search.original_otl = this.search.original_otl.substring(1);
      }
      this.search.original_otl = this.search.original_otl.replaceAll(
        '\n\n' + '|',
        '\n' + '|'
      );
      this.search.original_otl = this.search.original_otl.replaceAll(
        '|' + '\n',
        '| '
      );
      this.search.original_otl = this.search.original_otl.replaceAll(
        '| ' + '\n',
        '| '
      );
    },
    refreshInput() {
      this.search.original_otl = '';
    },
    launchSearch: async function () {
      this.$emit('launchSearch', this.search);
    },
    hashCode: function (otl) {
      return otl
        .split('')
        .reduce(
          (prevHash, currVal) =>
            ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0,
          0
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
      let timeStartArr = timeStart.split(':');
      twsArr = twsArr.concat(timeStartArr);
      let tws =
        new Date(
          twsArr[0],
          twsArr[1],
          twsArr[2],
          twsArr[3],
          twsArr[4]
        ).getTime() / 1000;
      let twfArr = dates[1].split('-');
      let timeFinishArr = timeFinish.split(':');
      twfArr = twfArr.concat(timeFinishArr);
      let twf =
        new Date(
          twfArr[0],
          twfArr[1],
          twfArr[2],
          twfArr[3],
          twfArr[4]
        ).getTime() / 1000;
      this.timeRangeValue = 'c ' + dates[0] + ' по ' + dates[1];
      this.setTwsTwf(tws, twf);
    },
    setTwsTwf(tws, twf) {
      this.search.parametrs.tws = tws;
      this.search.parametrs.twf = twf;
      this.menuCalendar = false;
      this.menuDropdown = false;
    },
  },
};
</script>

<style lang="sass">
@import ./../../sass/_colors
.time-picker
  margin-right: 20px
.v-date-picker-table
  height: 212px
//.calendar
//  .v-menu__content
//    max-width: 150px
.v-menu__content
  //width: 150px
  .dropdown-range
    padding: 6px
    max-width: 150px
    .dropdown-range-block
      margin-bottom: 36px
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
  .picker-actions
    padding: 10px
.search-block-footer
  .v-input
    padding-top: 0
    margin-top: 0
    .v-input__slot:before
      display: none
.v-picker__title
  display: none
</style>
