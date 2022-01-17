<template>
  <v-app
      class="reports-v2-app-main"
      :style="{background: theme.$secondary_bg}"
  >
    <header-top @setUsername="setUsername($event)" :inside="true"/>
    <v-content>
      <div class="main-container container-report" style="margin-top: 53px">
        <div
            ref="report"
            class="report-block"
        >
          <newSearch class="new-search component-block" @launchSearch="launchSearch($event)" :data="data" :loading="loading"></newSearch>
          <timeline v-show="data.length > 0" class="timeline component-block" :data="data">111</timeline>
          <div class="tab-block component-block d-flex justify-content-between">
            <v-tabs
                v-model="tab" class="tabs"
            >
              <v-tab>События ({{data.length}})</v-tab>
              <v-tab>Статистика</v-tab>
              <v-tab>Визуализация</v-tab>
            </v-tabs>
            <div class="d-flex">
              <report :length="data.length"></report>
              <download :data="data"></download>
            </div>
          </div>
          <v-row class="mb-0" v-if="data.length > 0">
            <v-col cols="2" class="pr-0">
              <intresting v-if="tab===0" class="events component-block" :rows="rows"></intresting>
            </v-col>
            <v-col cols="10" class="pl-0">
              <events v-if="tab===0" class="events component-block" :data="data"></events>
            </v-col>
          </v-row>
          <statistic v-if="tab===1" class="statistic component-block" :data="data" :size="size"></statistic>
          <visualisation v-if="tab===2 && data.length > 0" class="visualisation component-block" :data="data" :shouldGet="shouldGet"></visualisation>
        </div>
      </div>
    </v-content>
    <footer-bottom />
    <modal-report
        :modalFrom="modal"
        :searchFrom="search"
        @cancelModal="cancelModal"
        @setSearch="setSearch($event)"
    />
  </v-app>
</template>


<script>
import { mdiPlay, mdiSettings, mdiMerge,  mdiPlus } from '@mdi/js'
import  settings  from '../../js/componentsSettings.js';
import DashHeatMapLinear from "../dashBoardInside/dashHeatMapLinear";
import  newSearch  from './newSearch.vue';
import  timeline  from './timeline.vue';
import  report  from './report.vue';
import  download  from './download.vue';
import  events  from './events.vue';
import  statistic  from './statistic.vue';
import visualisation from "./visualisation";
import intresting from "./intresting";


export default {

  components: { newSearch, intresting, events, timeline, statistic, visualisation, download, report },
  data () {
    return {
      tab: 0,
      search: {
        parametrs: {}
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
        united: false
      },
      tooltipSvg: {
        'texts': [],
        'links': [],
        'buttons': []
      },
      activeElem: 'table',
    }
  },
  asyncComputed: {
    async static_rows() {
      console.log(this.shouldGet)
      if (this.shouldGet) {
        console.log('this.shouldGet === true')
        this.getData();
      }
      this.$store.commit('setShould', { idDash: 'reports',  id: 'table', status: false});
      return true
    },

  },
  computed: {
    // getDataRest:  function() {
    //   if (this.shouldGet) {
    //     console.log(this.getDataAsynchrony());
    //   }
    //   return 'done'
    // },
    theme: function() {
      return this.$store.getters.getTheme
    },
    shouldGet: function() {  // понимаем нужно ли запрашивтаь данные с реста
      return this.$store.getters.getShouldGet({id: 'table', idDash: 'reports'})
    },
    elements: function() {
      this.$store.getters.getReportElement.forEach( (item,i) => {
        this.$set(this.aboutElem,item,{});
        if (i == 0) {
          this.$set(this.aboutElem[item],'show',true);
          this.$set(this.aboutElem[item],'color',this.theme.controls);
        } else {
          this.$set(this.aboutElem[item],'show',false);
          this.$set(this.aboutElem[item],'color',this.theme.text);
        }
        this.$set(this.aboutElem[item],'tooltip',settings.reports[item].tooltip);
        this.$set(this.aboutElem[item],'icon',settings.reports[item].icon);
        this.$set(this.aboutElem[item],'key',i);
      })
      this.activeElem = 'table';
      return this.$store.getters.getReportElement
    },
  },
  methods: {
    getData: function() {
      let blob = new Blob([`onmessage=${this.getDataFromDb().toString()}`], { type: "text/javascript" }); // создаем blob объект чтобы с его помощью использовать функцию для web worker

      let blobURL = window.URL.createObjectURL(blob); // создаем ссылку из нашего blob ресурса

      let worker = new Worker(blobURL); // создаем новый worker и передаем ссылку на наш blob объект

      worker.onmessage = function(event) { // при успешном выполнении функции что передали в blob изначально сработает этот код


        let statistic = '';
        this.rows = [];
        if (event.data.data.length != 0) {
          console.log('event.data.data.length != 0')
          this.shema = event.data.shema;
          this.data = event.data.data;

          let text = '';
          Object.keys(this.shema).forEach( (item,i) => {

            statistic = this.createStatistic(item,event.data.data);
            let count = 0
            event.data.data.forEach( element => {
              if (element[item]) {
                count++
              }
            })
            this.rows.push({ 'id': i,'text': item,'static': statistic, 'totalCount': count });


          })
        }

        worker.terminate();

      }.bind(this);

      worker.postMessage(`reports-${this.search.sid}`);   // запускаем воркер на выполнение
    },
    launchSearch: async function(search) {
      this.search.original_otl = search.original_otl
      this.search.parametrs.tws = search.parametrs.tws
      this.search.parametrs.twf = search.parametrs.twf
      this.search.sid = this.hashCode(this.search.original_otl);

      this.$store.auth.getters.putLog(`Запущен запрос  ${this.search.sid}`);

      this.loading = true;
      console.log('launch search')
      console.log(this.search)
      let response = await this.$store.getters.getDataApi({search: this.search, idDash: 'reports'});
      // вызывая метод в хранилище  

      console.log(response)
      if (!response.data || response.data.length == 0) {  // если что-то пошло не так 
        this.loading = false;
        this.$store.commit('setErrorLogs',true);
        this.data = [];
        this.rows = [];
      } else {  // если все нормально
        console.log('data ready')

        let responseDB = this.$store.getters.putIntoDB(response, this.search.sid, 'reports');
        responseDB
            .then(
                result => {
                  let refresh =  this.$store.getters.refreshElements('reports', this.search.sid, );
                  this.loading = false;
                  this.$store.commit('setReportSearch',this.search);
                },
            );
      }
    },
    addLineBreaks: function(event) {
      this.search.original_otl = this.search.original_otl.replaceAll('|', '\n' + '|')
      if (this.search.original_otl[0] === '\n') {
        this.search.original_otl = this.search.original_otl.substring(1)
      }
      this.search.original_otl = this.search.original_otl.replaceAll("\n\n" + '|', '\n' + '|')
      this.search.original_otl = this.search.original_otl.replaceAll('|' + '\n', '| ')
      this.search.original_otl = this.search.original_otl.replaceAll('| ' + '\n', '| ')
    },
    setUsername: function(event) {
      this.search.parametrs.username = event;
    },
    hashCode: function(otl) {
      return otl.split('').reduce((prevHash, currVal) =>
          (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
    },
    getDataFromDb: function() {
      return function(event)  {
        let db = null;

        let searchSid = event.data;

        let request = indexedDB.open("EVA",1);

        request.onerror = function(event) {
          console.log("error: ",event);
        };

        request.onupgradeneeded = event => {
          console.log('create');
          db = event.target.result;
          if (!db.objectStoreNames.contains('searches')) { // if there's no "books" store
            db.createObjectStore('searches'); // create it
          }

          request.onsuccess = event => {
            db = request.result;
            console.log("successEvent: " + db);
          };
        }

        request.onsuccess =  event => {

          db = request.result;

          let transaction = db.transaction("searches"); // (1)

          // получить хранилище объектов для работы с ним
          let searches = transaction.objectStore("searches"); // (2)


          let query = searches.get(String(searchSid)); // (3) return store.get('Ire Aderinokun');


          query.onsuccess = event => { // (4)
            if (query.result) {
              self.postMessage(query.result);  // сообщение которое будет передаваться как результат выполнения функции
            } else {
              self.postMessage([]);  // сообщение которое будет передаваться как результат выполнения функции
            }
          };

          query.onerror = function() {
            console.log("Ошибка", query.error);
          };


        };


      }
    },
    openSettings: function() {
      this.modal = true;
    },
    cancelModal: function() {
      this.modal = false;
    },
    changeTab: function(elem) {
      if (elem == 'multiLine'){
        this.unitedShow = true;
      } else {
        this.unitedShow = false;
      }
      Object.keys(this.aboutElem).forEach( item => {
        if (item != elem) {
          this.$set(this.aboutElem[item],'show',false);
          this.$set(this.aboutElem[item],'color',this.theme.text);
        } else {
          this.activeElem = item;
          this.$set(this.aboutElem[item],'show',true);
          this.$set(this.aboutElem[item],'color',this.theme.controls);
        }
      })
    },
    changeUnited: function() {
      console.log('changeUnited')
      if (!this.unitedData.united) {
        this.unitedData.united = true;
        this.unitedData.color = this.theme.controlsActive;
      } else {
        this.unitedData.united = false;
        this.unitedData.color = this.theme.controls;
      }
      this.$store.commit('setOptions',  { idDash: 'reports', id: 'multiLine', options: {united: this.unitedData.united} });
    },
    createStatistic: function(key,data) {
      let how_much = {};
      let result = [];
      let length = data.length;
      data.forEach( item => {
        if (how_much[item[key]]) {
          how_much[item[key]]++;
        } else {
          how_much[item[key]] = 1
        }
      })
      Object.keys(how_much).forEach( item => {
        let percent
        if (length > 300) {
          percent = ((how_much[item]*100)/length).toFixed(2)
        } else if (length > 30) {
          percent = ((how_much[item]*100)/length).toFixed(1)
        } else {
          percent = ((how_much[item]*100)/length).toFixed()
        }
        result.push(
            {
              'value': item,
              'count': how_much[item],
              '%': percent
            }
        );
      })


      return result

    },
    setSearch: function(search) {
      this.search = Object.assign({},search);
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
    calcSize: function() {
      // console.log('calcSize')
      // console.log(this.$refs)
      let size = this.$refs.vis.$el.getBoundingClientRect();
      this.size.width = Math.round(size.width) - 16;
      this.size.height = Math.round(size.height) - 66;
      // console.log(size)
    },
    setRange (range) {
      this.data = this.data.filter(item => (item.day > range[0] && item.day < range[1]));
    },
    ResetRange () {
      console.log('resetRange')
    }
  },
  beforeCreate() {
    this.$store.commit('createReportSearch');
  },
  mounted() {
    document.title="EVA | Исследование данных"
    this.search = this.$store.getters.getReportSearch;
    if (this.search.original_otl != '') {
      this.$store.commit('setShould', { idDash: 'reports',  id: 'table', status: true});
    }
    this.calcSize();
    this.$refs.search.$el.addEventListener ("keypress", event =>{
      if (event.ctrlKey && event.keyCode == 13) {
        this.launchSearch();
      }
    });
    this.$refs.report.addEventListener('click', event => {
      if(!event.target.classList.contains('static-row')) {
        this.showStatistic = false;
      }
    })

    if (screen.width > 1920) {
      this.rowsCount = 14;
    } else if (screen.width <= 1440) {
      this.rowsCount = 6;
    }
    this.unitedData.color=  this.theme.controls;
  }
}


</script>

<style lang="scss" >

@import '../../sass/reportsV2/index.sass'

</style>