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
            v-if="getTimeline.length > 0"
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
              :style="{background: theme.$secondary_bg}"
            >
              <v-col
                cols="2"
                class="pr-0"
              >
                <interesting
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
              :loading="loading"
              :search="search"
              :data-page-from="page"
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
import { mapGetters } from 'vuex';
import settings from '../../js/componentsSettings';
import newSearch from './newSearch.vue';
import timeline from './timeline.vue';
import report from './report.vue';
import download from './download.vue';
import events from './events.vue';
import statistic from './statistic.vue';
import visualisation from './visualisation.vue';
import Interesting from './interesting.vue';

export default {
  components: {
    newSearch,
    Interesting,
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
      page: 'reports',
      search: {
        parametrs: {
          tws: 0,
          twf: 0,
        },
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
        height: screen.height ?? 0,
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
    ...mapGetters('dataResearch', ['getTimeline']),
    theme() {
      return this.$store.getters.getTheme;
    },
    shouldGet() {
      // понимаем нужно ли запрашивтаь данные с реста
      return this.$store.state.reports.table.should;
    },
    elements() {
      this.$store.getters.getReportElement.forEach((item, i) => {
        this.$set(this.aboutElem, item, {});
        if (i === 0) {
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
    this.$set(this, 'search', JSON.parse(JSON.stringify(this.$store.getters.getReportSearch)));
    if (this.search.original_otl !== '') {
      this.$store.commit('setShould', {
        idDash: 'reports',
        id: 'table',
        status: true,
      });
    }
    this.$refs.report.addEventListener('click', (event) => {
      if (!event.target.classList.contains('static-row')) {
        this.showStatistic = false;
      }
    });

    if (window.screen.width > 1920) {
      this.rowsCount = 14;
    } else if (window.screen.width <= 1440) {
      this.rowsCount = 6;
    }
    this.unitedData.color = this.theme.controls;
  },
  methods: {
    getData() {
      // создаем blob объект чтобы с его помощью использовать функцию для web worker
      const blob = new Blob([`onmessage=${this.getDataFromDb().toString()}`], {
        type: 'text/javascript',
      });
      // создаем ссылку из нашего blob ресурса
      const blobURL = window.URL.createObjectURL(blob);
      // создаем новый worker и передаем ссылку на наш blob объект
      const worker = new Worker(blobURL);
      // при успешном выполнении функции что передали в blob изначально сработает этот код
      worker.onmessage = function (event) {
        let localStatistic = '';
        this.rows = [];
        if (event.data.data.length !== 0) {
          this.shema = event.data.shema;
          // this.data = event.data.data;
          this.$set(this, 'data', event.data.data);

          Object.keys(this.shema).forEach((item, i) => {
            localStatistic = this.createStatistic(item, event.data.data);
            let count = 0;
            event.data.data.forEach((element) => {
              if (element[item]) {
                count += 1;
              }
            });
            this.rows.push({
              id: i,
              text: item,
              static: localStatistic,
              totalCount: count,
            });
          });
        }

        worker.terminate();
      }.bind(this);

      worker.postMessage(`reports-${this.search.sid}`); // запускаем воркер на выполнение
    },
    async launchSearch(search) {
      this.$set(this, 'search', JSON.parse(JSON.stringify({
        ...search,
        sid: this.hashCode(search.original_otl),
      })));
      await this.$store.dispatch('auth/putLog', `Запущен запрос  ${this.search.sid}`);

      this.loading = true;
      await this.$store.dispatch('getDataApi', {
        search: this.search,
        idDash: 'reports',
      }).then((response) => {
        this.$store.dispatch('dataResearch/fetchTimeline', response.cid);
        this.$store.dispatch('dataResearch/getInterestingFields', response.cid);
        // вызывая метод в хранилище
        if (!response?.data || response.data.length === 0) {
          // если что-то пошло не так
          this.loading = false;
          this.$store.commit('setErrorLogs', true);
          this.data = [];
          this.rows = [];
        } else {
          // если все нормально
          // console.log('data ready');

          const responseDB = this.$store.dispatch(
            'putIntoDB',
            {
              result: response,
              sid: this.search.sid,
              idDash: 'reports',
            },
          );
          responseDB.then(() => {
            this.$store.dispatch('refreshElements', {
              idDash: 'reports',
              key: this.search.sid,
            });
            this.loading = false;
            this.$store.commit('setReportSearch', this.search);
          });
        }
      });
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
        '| \n',
        '| ',
      );
      this.search.original_otl = this.search.original_otl.replaceAll(
        '| \n',
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

        request.onerror = (requestEvent) => {
          console.error('error: ', requestEvent);
        };

        request.onupgradeneeded = (requestEvent) => {
          db = requestEvent.target.result;
          // if there's no "books" store
          if (!db.objectStoreNames.contains('searches')) {
            db.createObjectStore('searches'); // create it
          }

          request.onsuccess = () => {
            db = request.result;
          };
        };

        request.onsuccess = () => {
          db = request.result;

          const transaction = db.transaction('searches'); // (1)

          // получить хранилище объектов для работы с ним
          const searches = transaction.objectStore('searches'); // (2)

          const query = searches.get(String(searchSid)); // (3) return store.get('Ire Aderinokun');

          // (4)
          query.onsuccess = () => {
            if (query.result) {
              // сообщение которое будет передаваться как результат выполнения функции
              // eslint-disable-next-line no-restricted-globals
              self.postMessage(query.result);
            } else {
              // сообщение которое будет передаваться как результат выполнения функции
              // eslint-disable-next-line no-restricted-globals
              self.postMessage([]);
            }
          };

          query.onerror = () => {
            console.error('Ошибка', query.error);
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
      this.unitedShow = elem === 'multiLine';
      Object.keys(this.aboutElem).forEach((item) => {
        if (item !== elem) {
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
      const howMuch = {};
      const result = [];
      const { length } = data;
      data.forEach((item) => {
        if (howMuch[item[key]]) {
          howMuch[item[key]] += 1;
        } else {
          howMuch[item[key]] = 1;
        }
      });
      Object.keys(howMuch).forEach((item) => {
        let percent;
        if (length > 300) {
          percent = ((howMuch[item] * 100) / length).toFixed(2);
        } else if (length > 30) {
          percent = ((howMuch[item] * 100) / length).toFixed(1);
        } else {
          percent = ((howMuch[item] * 100) / length).toFixed();
        }
        result.push({
          value: item,
          count: howMuch[item],
          '%': percent,
        });
      });

      return result;
    },
    setActiveElem(elemName) {
      this.activeElem = elemName;
    },
    setSearch(search) {
      this.search = JSON.parse(JSON.stringify(search));
      this.modal = false;
    },
    setRange(range) {
      const data = this.data.filter(
        (item) => item.day > range[0] && item.day < range[1],
      );
      this.$set(this, 'data', data);
    },
    ResetRange() {
      // console.log('resetRange');
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/reportsV2/index.sass';
</style>
