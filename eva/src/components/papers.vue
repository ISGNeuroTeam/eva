<template>
  <v-app
    class="papers-app-main"
    :style="{ background: color.back }"
  >
    <header-top @setUsername="setUsername($event)" />
    <v-content>
      <v-container class="main-container container-paper">
        <div class="paper-block">
          <v-card
            class="file-block"
            :data-ready="dataReady"
            :style="{ background: color.backElement, color: color.text }"
          >
            <div
              v-show="fileBlock == 1"
              class="buttons-file-block"
            >
              <v-btn
                small
                :color="color.controls"
                class="file-btn"
                dark
                @click="
                  fileBlock = 2;
                  uploadFile = '';
                "
              >
                Загрузить отчет
              </v-btn>
              <v-btn
                small
                :color="color.controls"
                class="file-btn"
                dark
                @click="getAllPapers"
              >
                Выбрать отчет
              </v-btn>
            </div>
            <div
              v-show="fileBlock == 2"
              class="load-file-block"
            >
              <v-icon
                :color="color.controls"
                class="arrow-back"
                medium
                @click="fileBlock = 1"
              >
                {{ arrowBack }}
              </v-icon>
              <v-file-input
                ref="fileLoad"
                :style="{ color: color.text, fill: color.text }"
                :color="color.controls"
                class="file-load-itself"
                hide-details
                outlined
                label="Загрузить отчет"
                @change="uploadFile = $event"
              />
              <div
                class="error-msg"
                :class="{ showError: showError }"
                :style="{ color: color.controls }"
              >
                {{ errorMsg }}
              </div>
              <v-btn
                small
                :color="color.controls"
                class="file-load-btn"
                @click="setPaper"
              >
                Отправить отчет
              </v-btn>
            </div>
            <div
              v-show="fileBlock == 3"
              class="get-file-block"
            >
              <v-icon
                :color="color.controls"
                class="arrow-back"
                medium
                @click="returnArrow"
              >
                {{ arrowBack }}
              </v-icon>
              <v-autocomplete
                v-model="selectedFile"
                :items="allFiles"
                outlined
                :style="{ color: color.text, fill: color.text }"
                :color="color.controls"
                hide-details
                class="file-get-itself"
                label="Выбрать отчет"
                @click="changeColor"
              />
              <div
                class="error-msg"
                :class="{ showError: showError }"
                :style="{ color: color.controls }"
              >
                {{ errorMsg }}
              </div>
              <v-btn
                small
                :color="color.controls"
                class="file-get-btn"
                @click="choosePaper"
              >
                Получить отчет
              </v-btn>
            </div>
          </v-card>
          <v-card
            class="search-block"
            :style="{ background: color.backElement, color: color.text }"
          >
            <v-card-text
              class="search-card-block"
              :style="{ background: color.backElement, color: color.text }"
            >
              <div
                class="loading-divider"
                :class="{ loading: loading }"
              >
                <div
                  class="loading-bar"
                  :style="{ background: color.controls }"
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
                :data-ready="dataReady"
                :rows="rowsCount"
                :style="{
                  background: color.backElement,
                  color: `${color.text} !important`,
                }"
                placeholder="Введите запрос"
                @keyup.ctrl.\="addLineBreaks"
              />
              <v-tooltip
                bottom
                :color="color.controlsActive"
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    :color="color.controls"
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
                :color="color.controlsActive"
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    :color="color.controls"
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
            ref="stepper"
            class="stepper-paper"
            :style="{ background: color.backElement, color: color.text }"
          >
            <v-stepper
              ref="steppers"
              v-model="move"
              alt-labels
            >
              <v-stepper-header>
                <v-stepper-step
                  step="1"
                  :complete="steps['1'].complete"
                  :color="steps['1'].status"
                  :rules="steps['1'].error"
                >
                  Готов к работе
                </v-stepper-step>

                <div
                  :style="{ borderColor: color.text }"
                  class="loading-divider"
                  :class="{ loading: steps['1'].loading }"
                >
                  <div
                    class="loading-overlay"
                    :style="{ background: color.text }"
                  />
                  <div
                    class="loading-bar"
                    :style="{ background: color.controls }"
                  />
                </div>

                <v-stepper-step
                  step="2"
                  :complete="steps['2'].complete"
                  :color="steps['2'].status"
                  :rules="steps['2'].error"
                >
                  {{ steps['2'].text }}
                </v-stepper-step>

                <div
                  :style="{ borderColor: color.text }"
                  class="loading-divider"
                  :class="{ loading: steps['2'].loading }"
                >
                  <div
                    class="loading-overlay"
                    :style="{ background: color.text }"
                  />
                  <div
                    class="loading-bar"
                    :style="{ background: color.controls }"
                  />
                </div>

                <v-stepper-step
                  step="3"
                  :complete="steps['3'].complete"
                  :color="steps['3'].status"
                  :rules="steps['3'].error"
                >
                  {{ steps['3'].text }}
                </v-stepper-step>

                <div
                  :style="{ borderColor: color.text }"
                  class="loading-divider"
                  :class="{ loading: steps['3'].loading }"
                >
                  <div
                    class="loading-overlay"
                    :style="{ background: color.text }"
                  />
                  <div
                    class="loading-bar"
                    :style="{ background: color.controls }"
                  />
                </div>

                <v-stepper-step
                  step="4"
                  :complete="steps['4'].complete"
                  :color="steps['4'].status"
                  :rules="steps['4'].error"
                >
                  {{ steps['4'].text }}
                </v-stepper-step>
              </v-stepper-header>
            </v-stepper>
          </v-card>
          <div class="paper-download">
            <v-tooltip
              bottom
              :color="color.controlsActive"
            >
              <template v-slot:activator="{ on }">
                <v-icon
                  class="download-btn"
                  :color="color.controls"
                  x-large
                  :disabled="disabledDownload"
                  v-on="on"
                  @click="downloadFile"
                >
                  {{ save_icon }}
                </v-icon>
              </template>
              <span>Скачать отчет</span>
            </v-tooltip>
          </div>
          <v-card
            class="static-vis"
            :style="{ background: color.backElement, color: color.text }"
          >
            <v-tabs
              v-show="tabs.length > 1"
              class="vis-tabs"
              hide-slider
              @change="changeVisTab"
            >
              <v-tab
                v-for="name in tabs"
                :key="name"
                class="vis-tab"
                :style="{ borderColor: color.back, background: color.controls }"
              >
                {{ name }}
              </v-tab>
            </v-tabs>
            <div
              ref="vis"
              class="vis-content"
            />
          </v-card>
        </div>
      </v-container>
    </v-content>
    <footer-bottom />
    <modal-report
      :color-from="color"
      :modal-from="modal"
      :search-from="search"
      @cancelModal="cancelModal"
      @setSearch="setSearch($event)"
    />
  </v-app>
</template>

<script>
import {
  mdiPlay,
  mdiSettings,
  mdiArrowLeftBold,
  mdiPlus,
  mdiContentSave,
} from '@mdi/js';
//import  settings  from '../js/componentsSettings.js';

export default {
  data() {
    return {
      search: {
        parametrs: {},
      },
      play: mdiPlay,
      plus: mdiPlus,
      gear: mdiSettings,
      save_icon: mdiContentSave,
      modal: false,
      loading: false,
      rows: [],
      data: [],
      size: {
        width: 0,
        height: 0,
      },
      aboutElem: {},
      rowsCount: 9,
      color: {},
      fileBlock: 1,
      arrowBack: mdiArrowLeftBold,
      uploadFile: '',
      showError: false,
      errorMsg: 'Выберите файл',
      steps: {
        1: {
          complete: true,
          status: '',
          loading: false,
          error: [],
        },
        2: {
          complete: false,
          status: '',
          loading: false,
          error: [],
          text: 'Сформировать запрос',
        },
        3: {
          complete: false,
          status: '',
          loading: false,
          error: [],
          text: 'Выбрать отчет',
        },
        4: {
          complete: false,
          status: '',
          error: [],
          text: 'Обработать отчет',
        },
      },
      move: '1',
      selectedFile: '',
      allFiles: [],
      disabledDownload: true,
      fileLink: '',
      dispSid: 0,
      tabs: [],
      html: [],
    };
  },

  computed: {
    // getDataRest:  function() {
    //   if (this.shouldGet) {
    //     console.log(this.getDataAsynchrony());
    //   }
    //   return 'done'
    // },
    // shouldGet: function() {  // понимаем нужно ли запрашивтаь данные с реста
    //   return this.$store.getters.getShouldGet({id: 'table', idDash: 'reports'})
    // },
    // elements: function() {

    //   this.$store.getters.getReportElement.forEach( (item,i) => {
    //     this.$set(this.aboutElem,item,{});
    //     if (i == 0) {
    //       this.$set(this.aboutElem[item],'show',true);
    //       this.$set(this.aboutElem[item],'color',this.color.controls);
    //     } else {
    //       this.$set(this.aboutElem[item],'show',false);
    //       this.$set(this.aboutElem[item],'color',this.color.text);
    //     }
    //     this.$set(this.aboutElem[item],'tooltip',settings.reports[item].tooltip);
    //     this.$set(this.aboutElem[item],'icon',settings.reports[item].icon);
    //     this.$set(this.aboutElem[item],'key',i);
    //   })
    //   this.activeElem = 'table';
    //   return this.$store.getters.getReportElement
    // },
    dataReady: function () {
      if (this.steps['2'].complete && this.steps['3'].complete) {
        this.getPaper();
      }
      return true;
    },
    color: function () {
      return this.$store.getters.getTheme;
    },
  },
  mounted() {
    document.title = 'EVA | Конструирование отчетов';
    this.search = this.$store.getters.getPaperSearch;
    if (this.search.original_otl != '') {
      //this.getData();
      this.launchSearch();
    }
    // this.calcSize();
    // this.$refs.search.$el.addEventListener ("keypress", event =>{
    //   if (event.ctrlKey && event.keyCode == 13) {
    //     this.launchSearch();
    //   }
    // });
    // this.$refs.report.addEventListener('click', event => {
    //   if(!event.target.classList.contains('static-row')) {
    //     this.showStatistic = false;
    //   }
    // })

    if (screen.width > 1920) {
      this.rowsCount = 14;
    } else if (screen.width <= 1440) {
      this.rowsCount = 6;
    }
    //this.unitedData.color=  this.color.controls;
    Object.values(this.steps).forEach((item) => {
      item.status = this.color.controls;
    });
    this.$refs.steppers.$el
      .querySelectorAll('.v-stepper__step__step')
      .forEach((item) => {
        item.style.background = this.color.border;
      });
  },
  methods: {
    setPaper: async function () {
      if (this.uploadFile == '') {
        this.message('Выберите файл');
      } else {
        let formData = new FormData();
        formData.append('file', this.uploadFile);
        let result = await this.$store.getters.loadPaper(formData);
        if (result.status == 'success') {
          this.message('Файл успшено загружен');
          this.setPaperBack();
        } else {
          this.message('Ошибка при загрузке файла');
          this.setPaperBack();
        }
      }
    },
    setPaperBack: function () {
      setTimeout(() => {
        this.fileBlock = 1;
        this.uploadFile = '';
        this.$refs.fileLoad.$el
          .querySelector('.v-input__append-inner button')
          .click();
      }, 2000);
    },
    choosePaper: async function () {
      if (this.selectedFile == '') {
        this.message('Выберите файл');
      } else {
        this.steps['2'].loading = false;
        this.steps['3'].complete = true;
        this.steps['3'].text = 'Отчет выбран';
        this.returnArrow();
      }
    },
    message: function (text) {
      this.errorMsg = text;
      this.showError = true;
      setTimeout(() => {
        this.showError = false;
      }, 2000);
    },
    getPaper: async function () {
      this.move = 4;
      this.steps['3'].loading = true;
      this.steps['4'].error = [];
      this.steps['4'].text = 'Обрабатываю отчет';
      let formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('cid', JSON.stringify(this.dispSid));
      let result = await this.$store.getters.getPaper(formData);

      if (result.status == 'success') {
        this.steps['3'].loading = false;
        this.steps['4'].complete = true;
        this.steps['4'].text = 'Отчет готов';
        this.fileLink = result.file;
        this.disabledDownload = false;
        this.createVisPaper(result.html, result.names);
        //this.downloadFile(JSON.parse(result).file)

        // this.allFiles = JSON.parse(result).files;
      } else {
        // this.errorMsg = "Список отчетов получить не удалось. Вернитесь назад и попробуйте снова.";
        // this.showError = true;
        this.steps['3'].loading = false;
        this.steps['4'].error = [() => false];
        this.steps['4'].text = 'Ошибка обработки отчета';
      }
    },
    getAllPapers: async function () {
      this.selectedFile = '';
      this.fileBlock = 3;
      this.move = 3;
      this.steps['2'].loading = true;
      this.steps['3'].complete = false;
      this.steps['3'].text = 'Жду выбора отчета';
      this.steps['4'].error = [];
      this.clearReady();

      let result = await this.$store.getters.getAllPaper();
      try {
        if (JSON.parse(result).status == 'success') {
          this.allFiles = JSON.parse(result).files;
          this.showError = false;
        } else {
          this.errorMsg =
            'Список отчетов получить не удалось. Вернитесь назад и попробуйте снова.';
          this.showError = true;
          this.steps['2'].loading = false;
          this.steps['3'].error = [() => false];
          this.steps['3'].text = 'Ошибка получения списка';
        }
      } catch (error) {
        this.message(`Ошибка: ${error}`);
      }
    },
    downloadFile: function () {
      let namefile = this.fileLink.split('/')[2];
      let link = this.$refs.stepper.$el.appendChild(
        document.createElement('a')
      ); // создаем ссылку
      link.setAttribute('href', this.fileLink); // указываем ссылке что надо скачать наш файл csv
      link.setAttribute('download', namefile); // указываем имя файла
      link.click(); // жмем на скачку
      link.remove(); // удаляем ссылку
    },
    clearReady: function () {
      this.steps['4'].complete = false;
      this.steps['4'].text = 'Обработать отчет';
      this.fileLink = '';
      this.disabledDownload = true;
    },
    returnArrow: function () {
      this.fileBlock = 1;
      this.steps['3'].error = [];
      if (this.selectedFile == '') {
        this.move = 2;
        this.steps['3'].text = 'Выбрать отчет';
        this.steps['2'].loading = false;
        this.steps['3'].complete = false;
      }
    },

    // getData: function() {

    //   this.steps['2'].complete = false;
    //   this.steps['1'].loading = true;
    //   this.steps['2'].text = 'Получаю данные об отчете';
    //   this.move = 2;
    //   this.clearReady();

    //   let blob = new Blob([`onmessage=${this.getDataFromDb().toString()}`], { type: "text/javascript" }); // создаем blob объект чтобы с его помощью использовать функцию для web worker

    //   let blobURL = window.URL.createObjectURL(blob); // создаем ссылку из нашего blob ресурса

    //   let worker = new Worker(blobURL); // создаем новый worker и передаем ссылку на наш blob объект

    //   worker.onmessage = function(event) { // при успешном выполнении функции что передали в blob изначально сработает этот код

    //     if (event.data.length != 0) {
    //       this.data = event.data;
    //       this.steps['2'].complete = true;
    //       this.steps['1'].loading = false;
    //       this.steps['2'].text = 'Данные об отчете получены';
    //       this.steps['2'].error = [];
    //     } else {
    //       this.cancelSearch();
    //     }

    //     worker.terminate();

    //   }.bind(this);

    //   worker.postMessage(`papers-${this.search.sid}`);   // запускаем воркер на выполнение

    // },
    launchSearch: async function () {
      this.steps['2'].complete = false;
      this.steps['1'].loading = true;
      this.steps['2'].text = 'Валидирую запрос';
      this.steps['4'].error = [];
      this.move = 2;
      this.clearReady();

      this.search.sid = this.hashCode(this.search.original_otl);

      this.$store.auth.getters.putLog(`Запущен запрос  ${this.search.sid}`);

      this.loading = true;
      console.log('launch search');
      let response = await this.$store.getters.getDataApi({
        search: this.search,
        idDash: 'papers',
      });
      // вызывая метод в хранилище

      if (!response || response.length == 0) {
        // если что-то пошло не так

        this.loading = false;
        this.$store.commit('setErrorLogs', true);
        this.data = [];
        this.cancelSearch();
      } else {
        // если все нормально
        this.loading = false;
        this.$store.commit('setPaperSearch', this.search);
        //this.data = response;
        this.dispSid = response.sid;
        this.steps['2'].complete = true;
        this.steps['1'].loading = false;
        this.steps['2'].text = 'Запрос сформирован';
        this.steps['2'].error = [];

        console.log('data ready');

        // let responseDB = this.$store.getters.putIntoDB(response, this.search.sid, 'papers');
        // responseDB
        //   .then(
        //     result => {
        //       this.loading = false;
        //       this.$store.commit('setPaperSearch',this.search);
        //       this.data = response;
        //       this.steps['2'].complete = true;
        //       this.steps['1'].loading = false;
        //       this.steps['2'].text = 'Данные об отчете получены';
        //       this.steps['2'].error = [];

        //     },
        //   );
      }
    },
    cancelSearch: function () {
      this.steps['2'].complete = false;
      this.steps['1'].loading = false;
      this.steps['2'].text = 'Запрос завершился ошибкой ';
      this.steps['2'].error.push(() => 'false');
    },
    addLineBreaks: function (event) {
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
    setUsername: function (event) {
      this.search.parametrs.username = event;
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
    // getDataFromDb: function() {
    //   return function(event)  {
    //     let db = null;

    //     let searchSid = event.data;

    //     let request = indexedDB.open("EVA",1);

    //     request.onerror = function(event) {
    //       console.log("error: ",event);
    //     };

    //     request.onupgradeneeded = event => {
    //       console.log('create');
    //       db = event.target.result;
    //       if (!db.objectStoreNames.contains('searches')) { // if there's no "books" store
    //         db.createObjectStore('searches'); // create it
    //       }

    //       request.onsuccess = event => {
    //         db = request.result;
    //         console.log("successEvent: " + db);
    //       };
    //     }

    //     request.onsuccess =  event => {

    //       db = request.result;

    //       let transaction = db.transaction("searches"); // (1)

    //       // получить хранилище объектов для работы с ним
    //       let searches = transaction.objectStore("searches"); // (2)

    //       let query = searches.get(String(searchSid)); // (3) return store.get('Ire Aderinokun');

    //       query.onsuccess = event => { // (4)
    //         if (query.result) {
    //           self.postMessage(query.result);  // сообщение которое будет передаваться как результат выполнения функции
    //         } else {
    //           self.postMessage([]);  // сообщение которое будет передаваться как результат выполнения функции
    //         }
    //       };

    //       query.onerror = function() {
    //         console.log("Ошибка", query.error);
    //       };

    //     };

    //   }
    // },
    openSettings: function () {
      this.modal = true;
    },
    cancelModal: function () {
      this.modal = false;
    },
    setSearch: function (search) {
      this.search = Object.assign({}, search);
      this.modal = false;
    },
    changeColor: function () {
      if (document.querySelectorAll('.v-menu__content').length != 0) {
        document.querySelectorAll('.v-menu__content').forEach((item) => {
          // item.style.boxShadow = `0 5px 5px -3px ${this.color.border},0 8px 10px 1px ${this.color.border},0 3px 14px 2px ${this.color.border}`;
          item.style.background = this.color.back;
          item.style.color = this.color.text;
          item.style.border = `1px solid ${this.color.border}`;
        });
      }
    },
    createVisPaper: function (html, names) {
      this.tabs = [];
      this.html = [];
      if (names.length == 1) {
        let img = `<img class="vis-image" src="data:image/png;base64,${html[0]}" />`;
        this.$refs.vis.innerHTML = img;
      } else if (names.length < 6) {
        this.tabs = names;
        this.html = html;
      } else {
        this.$refs.vis.innerHTML =
          'К сожалению файлов слишком много для визуального отображения';
      }
      // if (html.length == 1) {
      //   this.$refs.vis.innerHTML = html;
      // } else {
      //   console.log(html)
      // }
    },
    changeVisTab: function (number) {
      let img = `<img class="vis-image" src="data:image/png;base64,${this.html[number]}" />`;
      this.$refs.vis.innerHTML = img;
    },
  },
};
</script>

<style lang="scss">
@import '../sass/papers.sass';
</style>
