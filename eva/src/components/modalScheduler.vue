<!-- Модальное окно для выбора ИС -->

<template>
  <v-dialog :value="active" width="600" persistent @keydown="checkEsc($event)">
    <v-card :style="{ background: theme.$main_bg }" class="shedule-modal">
      <div class="schedule-block">
        <div class="zagolovok" :style="{ color: theme.$title }">
          Расписание для запроса
          <b>
            {{ sid }}
          </b>
        </div>
        <div class="tab-block">
          <v-tabs
            :color="theme.$primary_button"
            :background-color="theme.$main_bg"
          >
            <v-tabs-slider />
            <v-tab :style="{ color: theme.$main_text }"> Периодичность </v-tab>
            <v-tab-item
              :style="{ color: theme.$main_text, background: theme.$main_bg }"
            >
              <div class="every">
                <p>Каждые</p>
                <v-text-field
                  v-model="every"
                  :color="theme.$accent_ui_color"
                  :style="{
                    color: theme.$main_text,
                    border: `1px solid ${theme.$main_border}`,
                  }"
                  class="textarea-item"
                  outlined
                  :disabled="disabledEvery"
                  hide-details
                />
                <div class="choose-time">
                  <v-chip
                    :color="theme[color.hour]"
                    class="time"
                    @click="setTime('hour', 'every')"
                  >
                    Часов
                  </v-chip>
                  <v-chip
                    :color="theme[color.minute]"
                    class="time"
                    @click="setTime('minute', 'every')"
                  >
                    Минут
                  </v-chip>
                  <v-chip
                    :color="theme[color.second]"
                    class="time"
                    @click="setTime('second', 'every')"
                  >
                    Секунд
                  </v-chip>
                </div>
              </div>
              <p class="time-select" :style="{ color: theme.$main_text }">
                Получать данные за последние
              </p>
              <v-divider
                :style="{ borderColor: theme.$main_bg, opacity: '0.5' }"
              />
              <div class="last">
                <v-text-field
                  v-model="everyLast"
                  :color="theme.$accent_ui_color"
                  :style="{
                    color: theme.$main_text,
                    border: `1px solid ${theme.$main_border}`,
                  }"
                  class="textarea-item"
                  outlined
                  :disabled="disabledEvery"
                  hide-details
                />
                <div class="choose-time">
                  <v-chip
                    :color="theme[colorLast.hour]"
                    class="time"
                    @click="setTime('hour', 'last')"
                  >
                    Часов
                  </v-chip>
                  <v-chip
                    :color="theme[colorLast.minute]"
                    class="time"
                    @click="setTime('minute', 'last')"
                  >
                    Минут
                  </v-chip>
                  <v-chip
                    :color="theme[colorLast.second]"
                    class="time"
                    @click="setTime('second', 'last')"
                  >
                    Секунд
                  </v-chip>
                </div>
              </div>
            </v-tab-item>
            <v-tab :style="{ color: theme.$main_text }"> Планирование </v-tab>
            <v-tab-item />
          </v-tabs>
        </div>
      </div>
      <v-card-actions>
        <v-spacer />
        <v-btn
          small
          :color="theme.$primary_button"
          class="delete-btn"
          :class="{ disable: disabledStop }"
          @click="cancelSchedule"
        >
          {{ msg }}
        </v-btn>
        <v-btn
          small
          :color="theme.$primary_button"
          class="delete-btn"
          :disabled="disabledStart"
          @click="startSchedule"
        >
          Подтвердить
        </v-btn>
        <v-btn
          small
          :color="theme.$primary_button"
          class="delete-btn"
          @click="cancel"
        >
          Отмена
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    idDashFrom: null,
    modalFrom: null,
    dataSidFrom: null,
  },
  data() {
    return {
      every: 0,
      time: '',
      everyLast: 0,
      timeLast: '',
      color: {
        hour: '$accent_ui_color',
        minute: '$accent_ui_color',
        second: '$accent_ui_color',
      },
      colorLast: {
        hour: '$accent_ui_color',
        minute: '$accent_ui_color',
        second: '$accent_ui_color',
      },
      disabledStop: true,
      disabledStart: false,
      disabledEvery: false,
      msg: 'Не запущен',
      timers: {},
      picker: {
        start: false,
        end: false,
      },
    };
  },
  computed: {
    idDash: function () {
      // получаем название элемента от родителя
      return this.idDashFrom;
    },
    active: function () {
      // получаем статус открытия или нет окна модального
      if (this.modalFrom) {
        if (this.schedulers.length != 0) {
          if (this.schedulers[this.sid]) {
            // отображаем цвета и доступность кнопок исходя из того запущен ли планировщик
            this.every = this.schedulers[this.sid].every;
            this.time = this.schedulers[this.sid].time;
            this.everyLast = this.schedulers[this.sid].everyLast;
            this.timeLast = this.schedulers[this.sid].timeLast;
            this.color[this.time] = '$primary_button';
            this.colorLast[this.timeLast] = '$primary_button';
            this.disabledStop = false;
            this.disabledStart = true;
            this.disabledEvery = true;
            this.msg = 'Остановить';
          } else {
            this.every = 0;
            this.time = '';
            this.everyLast = 0;
            this.timeLast = '';
            Object.keys(this.color).forEach((item) => {
              this.color[item] = '$accent_ui_color';
              this.colorLast[item] = '$accent_ui_color';
            });
            this.disabledStop = true;
            this.disabledStart = false;
            this.disabledEvery = false;
            this.msg = 'Не запущен';
          }
        }
      }
      return this.modalFrom;
    },
    sid: function () {
      return this.dataSidFrom;
    },
    schedulers: function () {
      return this.$store.getters.getSchedulers(this.idDash);
    },
    searches: function () {
      return this.$store.getters.getSearches(this.idDash);
    },
    theme: function () {
      return this.$store.getters.getTheme;
    },
  },
  mounted() {
    // this.$store.commit('setModalSearch', { id: this.idDash, status: false });  // при создании окна на странице выключаем все открытые ранее окна
    let schedulers = this.schedulers;
    let searches = this.$store.getters.getSearches(this.idDash);
    let shedule = {};
    let curTime = {};

    if (Object.keys(schedulers).length !== 0) {
      // при обновлении страницы нужно понять  есть ли уже планировщики и снова их запустить
      Object.keys(schedulers).forEach((scheduler) => {
        // пробегаемся по всем планировщикам
        shedule = {
          // создаем объект на основе настроек планировщика
          time: schedulers[scheduler].time,
          every: schedulers[scheduler].every,
          timeLast: schedulers[scheduler].timeLast,
          everyLast: schedulers[scheduler].everyLast,
        };

        if (schedulers[scheduler].schedulerID) {
          clearInterval(schedulers[scheduler].schedulerID);
        }

        curTime = this.countTime(shedule.time, shedule.every) * 1000; // переводим в правильный формат время
        this.executeSearch(searches, scheduler, shedule); // выоплняем серч один раз
        this.timers[scheduler] = setInterval(() => {
          // и запускаем в цикле
          this.executeSearch(searches, scheduler, shedule);
        }, curTime);
        this.$store.commit('setSchedulerID', {
          idDash: this.idDash,
          search: scheduler,
          schedulerID: this.timers[scheduler],
        });
      });
    }
  },
  methods: {
    cancel: function () {
      // закрываем окно
      this.$emit('cancel');
    },
    checkEsc: function (event) {
      if (event.code == 'Escape') {
        this.cancel();
      }
    },
    setTime: function (time, tense) {
      // выставляем время и меняем цвета у кнопок
      if (!this.disabledEvery) {
        if (tense == 'every') {
          this.time = time;
          Object.keys(this.color).forEach((item) => {
            this.color[item] = '$accent_ui_color';
          });
          if (this.color[time] == '$accent_ui_color') {
            this.color[time] = '$primary_button';
          } else {
            this.color[time] = '$accent_ui_color';
          }
        } else if (tense == 'last') {
          this.timeLast = time;
          Object.keys(this.colorLast).forEach((item) => {
            this.colorLast[item] = '$accent_ui_color';
          });
          if (this.colorLast[time] == '$accent_ui_color') {
            this.colorLast[time] = '$primary_button';
          } else {
            this.colorLast[time] = '$accent_ui_color';
          }
        }
      }
    },
    countTime(time, every) {
      // переводим строковые значения времени в числовые
      let period = 0;
      switch (time) {
        case 'second':
          period = Number(every);
          break;

        case 'minute':
          period = Number(every) * 60;
          break;

        case 'hour':
          period = Number(every) * 3600;
          break;
      }
      return period;
    },
    executeSearch: function (searches, sid, shedule) {
      // выполняем серч меняя его временны рамки
      let curTimeLast = 0;
      let tws = 0;
      let twf = 0;
      if (shedule.everyLast !== 0) {
        curTimeLast = this.countTime(shedule.timeLast, shedule.everyLast);
        tws = Math.floor(new Date().getTime() / 1000 - curTimeLast);
        twf = Math.floor(new Date().getTime() / 1000);
      }
      searches.forEach((item) => {
        if (item.sid === sid) {
          item.parametrs.tws = tws;
          item.parametrs.twf = twf;
          this.$store.commit('updateSearchStatus', {
            idDash: this.idDash,
            sid: item.sid,
            status: 'empty',
          });
        }
      });
    },
    startSchedule() {
      // запускаем планировщик
      let schedule = {
        time: this.time,
        every: this.every,
        timeLast: this.timeLast,
        everyLast: this.everyLast,
      };
      let sid = this.sid;

      let searches = this.$store.getters.getSearches(this.idDash);
      let curTime = this.countTime(schedule.time, schedule.every) * 1000;
      this.executeSearch(searches, sid, schedule); // сперва первый раз просто выполняем серч
      const intervalID = (this.timers[sid] = setInterval(() => {
        this.executeSearch(searches, sid, schedule); // а затем уже выполняем его в цикле
      }, curTime));

      this.$store.commit('setSchedule', {
        idDash: this.idDash,
        sid: this.sid,
        every: this.every,
        time: this.time,
        everyLast: this.everyLast,
        timeLast: this.timeLast,
        schedulerID: intervalID,
      });
      this.cancel();
    },
    cancelSchedule: function () {
      // отменить планировщик
      this.$store.commit('deleteSchedule', {
        idDash: this.idDash,
        sid: this.sid,
      });
      this.every = 0;
      this.color[this.time] = 'teal';
      this.time = '';
      this.disabledStop = true;
      this.disabledStart = false;
      this.disabledEvery = false;
      this.msg = 'Не запущен';
      clearInterval(this.timers[this.sid]);
      delete this.timers[this.sid];
    },
  },
};
</script>

<style lang="scss">
@import '../sass/modalScheduler.sass';
</style>
