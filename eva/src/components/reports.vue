<template>
  <v-app
    class="reports-app-main"
    :style="{ background: theme.$secondary_bg }"
  >
    <header-top
      :inside="true"
      @setUsername="setUsername($event)"
    />
    <v-content>
      <v-container class="main-container container-report">
        <div
          ref="report"
          class="report-block"
        >
          <v-card
            class="static-block"
            :style="{ background: theme.$main_bg, color: theme.$main_text }"
          >
            <v-card-title class="static-title">
              <p>Статистика</p>
              <div
                class="static-divider"
                :style="{ background: theme.$main_text }"
              />
            </v-card-title>
            <v-card-text
              class="static-overflow-block"
              :style="{ color: theme.$main_text }"
            >
              <div
                v-for="item in rows"
                :key="item.id"
                class="static-row"
                @click="openStatistic(item)"
                v-html="item.text"
              />
            </v-card-text>
          </v-card>
          <v-card
            class="search-block"
            :style="{ background: theme.$main_bg, color: theme.$main_text }"
          >
            <v-card-text
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
              <v-textarea
                ref="search"
                v-model="search.original_otl"
                solo
                spellcheck="false"
                flat
                no-resize
                hide-details
                :rows="rowsCount"
                :style="{
                  background: theme.$main_bg,
                  color: `${theme.$main_text} !important`,
                }"
                placeholder="Введите запрос"
                @keyup.ctrl.\="addLineBreaks"
              />
              <router-link
                :to="{ path: '/reports' }"
                target="_blank"
              >
                <v-tooltip
                  bottom
                  :color="theme.$accent_ui_color"
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      :color="theme.$primary_button"
                      fab
                      dark
                      small
                      absolute
                      class="new-btn"
                      top
                      right
                      v-on="on"
                    >
                      <v-icon>{{ plus }}</v-icon>
                    </v-btn>
                  </template>
                  <span>Открыть новое Исследование данных</span>
                </v-tooltip>
              </router-link>
              <v-tooltip
                bottom
                :color="theme.$accent_ui_color"
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    :color="theme.$primary_button"
                    fab
                    dark
                    small
                    absolute
                    class="play-btn"
                    top
                    right
                    v-on="on"
                    @click="launchSearch"
                  >
                    <v-icon>{{ play }}</v-icon>
                  </v-btn>
                </template>
                <span>Запустить</span>
              </v-tooltip>
              <v-tooltip
                bottom
                :color="theme.$accent_ui_color"
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    :color="theme.$primary_button"
                    fab
                    dark
                    small
                    absolute
                    top
                    right
                    v-on="on"
                    @click="openSettings"
                  >
                    <v-icon>{{ gear }}</v-icon>
                  </v-btn>
                </template>
                <span>Настройки</span>
              </v-tooltip>
            </v-card-text>
          </v-card>
          <v-card
            ref="vis"
            class="static-vis"
            :style="{ background: theme.$main_bg, color: theme.$main_text }"
          >
            <v-card-text :style="{ color: theme.$main_text }">
              <v-card-title class="title-vis">
                <v-tooltip
                  v-for="i in elements"
                  :key="aboutElem[i].key"
                  bottom
                  :color="theme.$accent_ui_color"
                  @click="changeTab(i)"
                >
                  <template v-slot:activator="{ on }">
                    <v-icon
                      class="title-icon"
                      :color="aboutElem[i].color"
                      v-on="on"
                      @click="changeTab(i)"
                    >
                      {{ aboutElem[i].icon }}
                    </v-icon>
                  </template>
                  <span>{{ aboutElem[i].tooltip }}</span>
                </v-tooltip>
                <div
                  class="divider-tab"
                  :style="{ background: theme.$primary_button }"
                />
              </v-card-title>
              <v-card-text
                :is="`dash-${i}`"
                v-for="i in elements"
                v-show="aboutElem[i].show"
                :key="i"
                :id-from="i"
                :color-from="theme"
                :active-elem-from="activeElem"
                id-dash-from="reports"
                :width-from="size.width"
                :height-from="size.height"
                :time-format-from="''"
                :size-tile-from="{ width: '', height: '' }"
                :search-rep="true"
                :tooltip-from="tooltipSvg"
                :should-get="shouldGet"
                :data-report="true"
                :data-rest-from="data"
                @SetRange="setRange($event)"
                @ResetRange="resetRange($event)"
              />
              <v-tooltip
                bottom
                :color="theme.$accent_ui_color"
              >
                <template v-slot:activator="{ on }">
                  <v-icon
                    v-show="unitedShow"
                    class="title-icon merge"
                    :color="unitedData.color"
                    v-on="on"
                    @click="changeUnited"
                  >
                    {{ merge }}
                  </v-icon>
                </template>
                <span>Режим отображения</span>
              </v-tooltip>
            </v-card-text>
          </v-card>
          <v-card
            class="statistic-block"
            :style="{
              backgroundColor: theme.$secondary_bg,
              border: `1px solid ${theme.$main_border}`,
            }"
            :class="{ showStatistic: showStatistic }"
          >
            <v-card-text>
              <v-data-table
                :style="{
                  backgroundColor: theme.$secondary_bg,
                  color: theme.$main_text,
                }"
                disable-pagination
                hide-default-footer
                :headers="[
                  { text: 'value', value: 'value' },
                  { text: 'count', value: 'count' },
                  { text: '%', value: '%' },
                ]"
                :items="statistic"
              />
            </v-card-text>
          </v-card>
        </div>
      </v-container>
    </v-content>
    <footer-bottom />
    <modal-report
      :modal-from="modal"
      :search-from="search"
      @cancelModal="cancelModal"
      @setSearch="setSearch($event)"
    />
  </v-app>
</template>

<script>
import {
  mdiPlay, mdiSettings, mdiMerge, mdiPlus,
} from '@mdi/js';
import settings from '../js/componentsSettings.js';

export default {
  data() {
    return {
      search: {
        parametrs: {},
      },
      limit: 1000,
      play: mdiPlay,
      plus: mdiPlus,
      gear: mdiSettings,
      merge: mdiMerge,
      modal: false,
      loading: false,
      rows: [],
      data: [],
      test: [],
      statistic: [],
      showStatistic: false,
      statisticKey: null,
      curTab: null,
      size: {
        width: 0,
        height: 0,
      },
      aboutElem: {},
      rowsCount: 9,
      unitedShow: false,
      unitedData: {
        color: '',
        united: false,
      },
      tooltipSvg: {
        texts: [],
        links: [],
        buttons: [],
      },
      activeElem: 'table',
    };
  },
  asyncComputed: {
    async static_rows() {
      if (this.shouldGet) {
        this.getData();
      }
      this.$store.commit('setShould', {
        idDash: 'reports',
        id: 'table',
        status: false,
      });
      return true;
    },
  },
  computed: {
    // getDataRest:  function() {
    //   if (this.shouldGet) {
    //     console.log(this.getDataAsynchrony());
    //   }
    //   return 'done'
    // },
    theme() {
      return this.$store.getters.getTheme;
    },
    shouldGet() {
      // понимаем нужно ли запрашивтаь данные с реста
      return this.$store.getters.getShouldGet({
        id: 'table',
        idDash: 'reports',
      });
    },
    elements() {
      this.$store.getters.getReportElement.forEach((item, i) => {
        this.$set(this.aboutElem, item, {});
        if (i == 0) {
          this.$set(this.aboutElem[item], 'show', true);
          this.$set(this.aboutElem[item], 'color', this.theme.controls);
        } else {
          this.$set(this.aboutElem[item], 'show', false);
          this.$set(this.aboutElem[item], 'color', this.theme.text);
        }
        this.$set(
          this.aboutElem[item],
          'tooltip',
          settings.reports[item].tooltip,
        );
        this.$set(this.aboutElem[item], 'icon', settings.reports[item].icon);
        this.$set(this.aboutElem[item], 'key', i);
      });
      this.setActiveElem('table');
      return this.$store.getters.getReportElement;
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
    this.calcSize();
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

    if (screen.width > 1920) {
      this.rowsCount = 14;
    } else if (screen.width <= 1440) {
      this.rowsCount = 6;
    }
    this.unitedData.color = this.theme.controls;
  },
  methods: {
    getData() {
      const blob = new Blob([`onmessage=${this.getDataFromDb().toString()}`], {
        type: 'text/javascript',
      }); // создаем blob объект чтобы с его помощью использовать функцию для web worker

      const blobURL = window.URL.createObjectURL(blob); // создаем ссылку из нашего blob ресурса

      const worker = new Worker(blobURL); // создаем новый worker и передаем ссылку на наш blob объект

      worker.onmessage = function (event) {
        // при успешном выполнении функции что передали в blob изначально сработает этот код

        let statistic = '';
        this.rows = [];
        if (event.data.data.length != 0) {
          this.shema = event.data.shema;
          this.data = event.data.data;

          let text = '';
          Object.keys(this.shema).forEach((item, i) => {
            statistic = this.createStatistic(item, event.data.data);

            text = `${item}&nbsp;&nbsp;&nbsp;[${this.shema[item]}]`;
            this.rows.push({ id: i, text, static: statistic });
          });
        }

        worker.terminate();
      }.bind(this);

      worker.postMessage(`reports-${this.search.sid}`); // запускаем воркер на выполнение
    },
    async launchSearch() {
      this.search.sid = this.hashCode(this.search.original_otl);

      this.$store.auth.getters.putLog(`Запущен запрос  ${this.search.sid}`);

      this.loading = true;
      console.log('launch search');
      const response = await this.$store.getters.getDataApi({
        search: this.search,
        idDash: 'reports',
      });
      // вызывая метод в хранилище

      if (!response.data || response.data.length == 0) {
        // если что-то пошло не так
        this.loading = false;
        this.$store.commit('setErrorLogs', true);
        this.data = [];
        this.rows = [];
      } else {
        // если все нормально
        console.log('data ready');

        const responseDB = this.$store.getters.putIntoDB(
          response,
          this.search.sid,
          'reports',
        );
        responseDB.then(() => {
          this.$store.getters.refreshElements(
            'reports',
            this.search.sid,
          );
          this.loading = false;
          this.$store.commit('setReportSearch', this.search);
        });
      }
    },
    addLineBreaks() {
      this.search.original_otl = this.search.original_otl.replaceAll(
        '|',
        '\n' + '|',
      );
      if (this.search.original_otl[0] === '\n') {
        this.search.original_otl = this.search.original_otl.substring(1);
      }
      this.search.original_otl = this.search.original_otl.replaceAll(
        '\n\n' + '|',
        '\n' + '|',
      );
      this.search.original_otl = this.search.original_otl.replaceAll(
        '|' + '\n',
        '| ',
      );
      this.search.original_otl = this.search.original_otl.replaceAll(
        '| ' + '\n',
        '| ',
      );
    },
    setUsername(event) {
      this.search.parametrs.username = event;
    },
    hashCode(otl) {
      return otl
        .split('')
        .reduce(
          (prevHash, currVal) => ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0,
          0,
        );
    },
    getDataFromDb() {
      return function (event) {
        let db = null;

        const searchSid = event.data;

        const request = indexedDB.open('EVA', 1);

        request.onerror = function (event) {
          console.log('error: ', event);
        };

        request.onupgradeneeded = (event) => {
          console.log('create');
          db = event.target.result;
          if (!db.objectStoreNames.contains('searches')) {
            // if there's no "books" store
            db.createObjectStore('searches'); // create it
          }

          request.onsuccess = () => {
            db = request.result;
            console.log(`successEvent: ${db}`);
          };
        };

        request.onsuccess = () => {
          db = request.result;

          const transaction = db.transaction('searches'); // (1)

          // получить хранилище объектов для работы с ним
          const searches = transaction.objectStore('searches'); // (2)

          const query = searches.get(String(searchSid)); // (3) return store.get('Ire Aderinokun');

          query.onsuccess = () => {
            // (4)
            if (query.result) {
              self.postMessage(query.result); // сообщение которое будет передаваться как результат выполнения функции
            } else {
              self.postMessage([]); // сообщение которое будет передаваться как результат выполнения функции
            }
          };

          query.onerror = function () {
            console.log('Ошибка', query.error);
          };
        };
      };
    },
    openSettings() {
      this.modal = true;
    },
    cancelModal() {
      this.modal = false;
    },
    changeTab(elem) {
      if (elem == 'multiLine') {
        this.unitedShow = true;
      } else {
        this.unitedShow = false;
      }
      Object.keys(this.aboutElem).forEach((item) => {
        if (item != elem) {
          this.$set(this.aboutElem[item], 'show', false);
          this.$set(this.aboutElem[item], 'color', this.theme.text);
        } else {
          this.activeElem = item;
          this.$set(this.aboutElem[item], 'show', true);
          this.$set(this.aboutElem[item], 'color', this.theme.controls);
        }
      });
    },
    changeUnited() {
      if (!this.unitedData.united) {
        this.unitedData.united = true;
        this.unitedData.color = this.theme.controlsActive;
      } else {
        this.unitedData.united = false;
        this.unitedData.color = this.theme.controls;
      }
      this.$store.commit('setOptions', {
        idDash: 'reports',
        id: 'multiLine',
        options: { united: this.unitedData.united },
      });
    },
    createStatistic(key, data) {
      const how_much = {};
      const result = [];
      const { length } = data;
      data.forEach((item) => {
        if (how_much[item[key]]) {
          how_much[item[key]]++;
        } else {
          how_much[item[key]] = 1;
        }
      });
      Object.keys(how_much).forEach((item) => {
        result.push({
          value: item,
          count: how_much[item],
          '%': Math.round((how_much[item] * 100) / length),
        });
      });

      return result;
    },
    setSearch(search) {
      this.search = { ...search };
      this.modal = false;
    },
    setActiveElem() {
      this.activeElem = 'table';
    },
    openStatistic(statistic) {
      if (this.showStatistic) {
        if (this.statisticKey == statistic.text) {
          this.showStatistic = false;
        } else {
          this.statisticKey = statistic.text;
          this.statistic = statistic.static;
        }
      } else {
        this.showStatistic = true;
        this.statisticKey = statistic.text;
        this.statistic = statistic.static;
      }
    },
    calcSize() {
      const size = this.$refs.vis.$el.getBoundingClientRect();
      this.size.width = Math.round(size.width) - 16;
      this.size.height = Math.round(size.height) - 66;
    },
    setRange(range) {
      this.data = this.data.filter(
        (item) => item.day > range[0] && item.day < range[1],
      );
    },
    ResetRange() {
      console.log('resetRange');
    },
  },
};
</script>

<style lang="scss">
@import '../sass/reports.sass';
</style>
