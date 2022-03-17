<template>
  <v-app
    class="reports-v2-app-main"
    :style="{ background: theme.$secondary_bg }"
  >
    <header-top
      :inside="true"
      @setUsername="setUsername($event)"
    />
    <v-content>
      <div class="main-container container-report">
        <div
          ref="report"
          class="report2-block"
        >
          <newSearch
            class="new-search component-block"
            :data="data"
            :loading="loading"
            @launchSearch="launchSearch($event)"
          />
          <timeline
            v-show="data.length > 0"
            class="timeline component-block"
            :data="data"
          >
            111
          </timeline>
          <div class="tab-block component-block d-flex justify-content-between">
            <v-tabs
              v-model="tab"
              class="tabs"
            >
              <v-tab>События ({{ data.length }})</v-tab>
              <v-tab>Статистика</v-tab>
              <v-tab>Визуализация</v-tab>
            </v-tabs>
            <div class="d-flex">
              <report :length="data.length" />
              <download :data="data" />
            </div>
          </div>
          <keep-alive>
            <v-row
              v-if="data.length > 0 && tab === 0"
              class="mb-0"
            >
              <v-col
                cols="2"
                class="pr-0"
              >
                <intresting
                  class="intresting component-block"
                  :rows="rows"
                />
              </v-col>
              <v-col
                cols="10"
                class="pl-0"
              >
                <events
                  class="events component-block"
                  :data="data"
                />
              </v-col>
            </v-row>
          </keep-alive>
          <keep-alive>
            <statistic
              v-if="tab === 1"
              class="statistic component-block"
              :data="data"
              :size="size"
            />
          </keep-alive>
          <keep-alive>
            <visualisation
              v-if="tab === 2 && data.length > 0"
              class="visualisation component-block"
              :data="data"
              :should-get="shouldGet"
            />
          </keep-alive>
        </div>
      </div>
    </v-content>
    <footer-bottom />
    <modal-report
      v-model="modal"
      :search-from="search"
      @setSearch="setSearch($event)"
    />
  </v-app>
</template>

<script>
import {
  mdiPlay, mdiSettings, mdiMerge, mdiPlus,
} from '@mdi/js';
import settings from '../../js/componentsSettings.js';
import newSearch from './newSearch.vue';
import timeline from './timeline.vue';
import report from './report.vue';
import download from './download.vue';
import events from './events.vue';
import statistic from './statistic.vue';
import visualisation from './visualisation';
import intresting from './intresting';

export default {
  components: {
    newSearch,
    intresting,
    events,
    timeline,
    statistic,
    visualisation,
    download,
    report,
  },
  data() {
    return {
      tab: 0,
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
      console.log(this.shouldGet);
      if (this.shouldGet) {
        console.log('this.shouldGet === true');
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
  beforeCreate() {
    this.$store.commit('createReportSearch');
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
          console.log('event.data.data.length != 0');
          this.shema = event.data.shema;
          this.data = event.data.data;

          Object.keys(this.shema).forEach((item, i) => {
            statistic = this.createStatistic(item, event.data.data);
            let count = 0;
            event.data.data.forEach((element) => {
              if (element[item]) {
                count++;
              }
            });
            this.rows.push({
              id: i,
              text: item,
              static: statistic,
              totalCount: count,
            });
          });
        }

        worker.terminate();
      }.bind(this);

      worker.postMessage(`reports-${this.search.sid}`); // запускаем воркер на выполнение
    },
    async launchSearch(search) {
      this.search.original_otl = search.original_otl;
      this.search.parametrs.tws = search.parametrs.tws;
      this.search.parametrs.twf = search.parametrs.twf;
      this.search.sid = this.hashCode(this.search.original_otl);

      this.$store.getters['auth/putLog'](`Запущен запрос  ${this.search.sid}`);

      this.loading = true;
      console.log('launch search');
      console.log(this.search);
      const response = await this.$store.getters.getDataApi({
        search: this.search,
        idDash: 'reports',
      });
      // вызывая метод в хранилище

      console.log(response);
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
      console.log('changeUnited');
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
        let percent;
        if (length > 300) {
          percent = ((how_much[item] * 100) / length).toFixed(2);
        } else if (length > 30) {
          percent = ((how_much[item] * 100) / length).toFixed(1);
        } else {
          percent = ((how_much[item] * 100) / length).toFixed();
        }
        result.push({
          value: item,
          count: how_much[item],
          '%': percent,
        });
      });

      return result;
    },
    setActiveElem(elemName) {
      this.activeElem = elemName;
    },
    setSearch(search) {
      this.search = { ...search };
      this.modal = false;
    },
    // openStatistic: function(statistic) {
    //   if (this.showStatistic) {
    //     if (this.statisticKey == statistic.text) {
    //       this.showStatistic = false;
    //     } else {
    //       this.statisticKey = statistic.text;
    //       this.statistic = statistic.static;
    //     }
    //   } else {
    //     this.showStatistic = true;
    //     this.statisticKey = statistic.text;
    //     this.statistic = statistic.static;
    //   }
    // },
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
@import '../../sass/reportsV2/index.sass';
</style>
