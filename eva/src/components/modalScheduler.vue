<!-- Модальное окно для выбора ИС -->

<template>
  <modal-persistent
    v-model="active"
    width="600"
    :theme="theme"
    :persistent="isChanged"
    :is-confirm="isChanged"
    @cancelModal="cancel"
  >
    <v-card
      :style="{ background: theme.$main_bg }"
      class="shedule-modal"
    >
      <div class="schedule-block">
        <div
          class="zagolovok"
          :style="{ color: theme.$title }"
        >
          Расписание для запроса
          <b>
            {{ sid }}
          </b>
        </div>
        <div class="tab-block">
          <v-tabs
            v-model="schedulerTab"
            :color="theme.$primary_button"
            :background-color="theme.$main_bg"
          >
            <v-tabs-slider />
            <v-tab :style="{ color: theme.$main_text }">
              Периодичность
            </v-tab>
            <v-tab-item
              :value="0"
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
                  @input="isChanged = true"
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
              <p
                class="time-select"
                :style="{ color: theme.$main_text }"
              >
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
                  @input="isChanged = true"
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
            <v-tab :style="{ color: theme.$main_text }">
              Планирование
            </v-tab>
            <v-tab-item :value="1" />
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
          :disabled="disabledStart || isDisable"
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
  </modal-persistent>
</template>

<script>
export default {
  name: 'ModalScheduler',
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    idDashFrom: {
      type: String,
      required: true,
    },
    modalFrom: {
      type: Boolean,
      default: false,
    },
    dataSidFrom: {
      type: [String, Number],
      required: true,
    },
    modalValue: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      schedulerTab: 'tab-1',
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
      isChanged: false,
    };
  },
  computed: {
    // получаем название элемента от родителя
    idDash() {
      return this.idDashFrom;
    },
    active: {
      get() {
        return this.modalValue;
      },
      set(value) {
        this.$emit('updateModalValue', value);
      },
    },
    sid() {
      return this.dataSidFrom;
    },
    dashFromStore() {
      return this.$store.state[this.idDash];
    },
    getSchedulers() {
      if (!this.dashFromStore.schedulers) {
        this.$store.commit('setState', [{
          object: this.dashFromStore,
          prop: 'schedulers',
          value: {},
        }]);
      }
      return this.dashFromStore.schedulers;
    },
    schedulers() {
      return this.getSchedulers;
    },
    getSearches() {
      return this.$store.state[this.idDash]?.searches || [];
    },
    searches() {
      return this.getSearches;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    isDisable() {
      return !(this.time && this.every > 0);
    },
  },
  watch: {
    active() {
      // получаем статус открытия или нет окна модального
      if (this.modalValue) {
        if (this.schedulers?.length !== 0) {
          this.setData();
        }
      } else {
        this.schedulerTab = 0;
        this.isChanged = false;
      }
    },
  },
  mounted() {
    const { schedulers } = this;
    const searches = this.getSearches;
    let shedule = {};
    let curTime = {};

    // при обновлении страницы нужно понять  есть ли уже планировщики и снова их запустить
    if (Object.keys(schedulers).length !== 0) {
      // пробегаемся по всем планировщикам
      Object.keys(schedulers).forEach((scheduler) => {
        // создаем объект на основе настроек планировщика
        shedule = {
          time: schedulers[scheduler].time,
          every: schedulers[scheduler].every,
          timeLast: schedulers[scheduler].timeLast,
          everyLast: schedulers[scheduler].everyLast,
        };

        if (schedulers[scheduler].schedulerID) {
          clearInterval(schedulers[scheduler].schedulerID);
        }

        // переводим в правильный формат время
        curTime = this.countTime(shedule.time, shedule.every) * 1000;
        // выоплняем серч один раз
        this.executeSearch(searches, scheduler, shedule);
        // и запускаем в цикле
        this.timers[scheduler] = setInterval(() => {
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
    setData() {
      // отображаем цвета и доступность кнопок исходя из того запущен ли планировщик
      if (this.schedulers[this.sid]) {
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
    },
    cancel() {
      // закрываем окно
      this.active = false;
    },
    // выставляем время и меняем цвета у кнопок
    setTime(time, tense) {
      this.isChanged = true;
      if (!this.disabledEvery) {
        if (tense === 'every') {
          this.time = time;
          Object.keys(this.color).forEach((item) => {
            this.color[item] = '$accent_ui_color';
          });
          if (this.color[time] === '$accent_ui_color') {
            this.color[time] = '$primary_button';
          } else {
            this.color[time] = '$accent_ui_color';
          }
        } else if (tense === 'last') {
          this.timeLast = time;
          Object.keys(this.colorLast).forEach((item) => {
            this.colorLast[item] = '$accent_ui_color';
          });
          if (this.colorLast[time] === '$accent_ui_color') {
            this.colorLast[time] = '$primary_button';
          } else {
            this.colorLast[time] = '$accent_ui_color';
          }
        }
      }
    },
    // переводим строковые значения времени в числовые
    countTime(time, every) {
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
        default:
          break;
      }
      return period;
    },
    // выполняем серч меняя его временны рамки
    executeSearch(searches, sid, shedule) {
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
          this.$store.commit('setState', [{
            object: item.parametrs,
            prop: 'tws',
            value: tws,
          }, {
            object: item.parametrs,
            prop: 'twf',
            value: twf,
          }]);
          this.$store.commit('updateSearchStatus', {
            idDash: this.idDash,
            sid: item.sid,
            status: 'empty',
          });
        }
      });
    },
    // запускаем планировщик
    startSchedule() {
      const schedule = {
        time: this.time,
        every: this.every,
        timeLast: this.timeLast,
        everyLast: this.everyLast,
      };
      const { sid } = this;

      const searches = this.getSearches;
      const curTime = this.countTime(schedule.time, schedule.every) * 1000;
      // сперва первый раз просто выполняем серч
      this.executeSearch(searches, sid, schedule);
      // а затем уже выполняем его в цикле
      this.timers[sid] = setInterval(() => {
        this.executeSearch(searches, sid, schedule);
      }, curTime);

      this.$store.commit('setSchedule', {
        idDash: this.idDash,
        sid: this.sid,
        every: this.every,
        time: this.time,
        everyLast: this.everyLast,
        timeLast: this.timeLast,
        schedulerID: this.timers[sid],
      });
      this.cancel();
    },
    cancelSchedule() {
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
