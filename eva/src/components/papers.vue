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
              v-show="fileBlock === 1"
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
              v-show="fileBlock === 2"
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
              v-show="fileBlock === 3"
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
      v-model="modal"
      :color-from="color"
      :search-from="search"
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
    dataReady() {
      if (this.steps['2'].complete && this.steps['3'].complete) {
        this.getPaper();
      }
      return true;
    },
    color() {
      return this.$store.getters.getTheme;
    },
  },
  mounted() {
    document.title = 'EVA | Конструирование отчетов';
    this.search = this.$store.getters.getPaperSearch;
    if (this.search.original_otl !== '') {
      this.launchSearch();
    }

    if (window.screen.width > 1920) {
      this.rowsCount = 14;
    } else if (window.screen.width <= 1440) {
      this.rowsCount = 6;
    }
    // this.unitedData.color=  this.color.controls;
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
    async setPaper() {
      if (this.uploadFile === '') {
        this.message('Выберите файл');
      } else {
        const formData = new FormData();
        formData.append('file', this.uploadFile);
        const result = await this.$store.dispatch('loadPaper', formData);
        if (result.status === 'success') {
          this.message('Файл успшено загружен');
          this.setPaperBack();
        } else {
          this.message('Ошибка при загрузке файла');
          this.setPaperBack();
        }
      }
    },
    setPaperBack() {
      setTimeout(() => {
        this.fileBlock = 1;
        this.uploadFile = '';
        this.$refs.fileLoad.$el
          .querySelector('.v-input__append-inner button')
          .click();
      }, 2000);
    },
    async choosePaper() {
      if (this.selectedFile === '') {
        this.message('Выберите файл');
      } else {
        this.steps['2'].loading = false;
        this.steps['3'].complete = true;
        this.steps['3'].text = 'Отчет выбран';
        this.returnArrow();
      }
    },
    message(text) {
      this.errorMsg = text;
      this.showError = true;
      setTimeout(() => {
        this.showError = false;
      }, 2000);
    },
    async getPaper() {
      this.move = 4;
      this.steps['3'].loading = true;
      this.steps['4'].error = [];
      this.steps['4'].text = 'Обрабатываю отчет';
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('cid', JSON.stringify(this.dispSid));
      const result = await this.$store.dispatch('getPaper', formData);

      if (result.status === 'success') {
        this.steps['3'].loading = false;
        this.steps['4'].complete = true;
        this.steps['4'].text = 'Отчет готов';
        this.fileLink = result.file;
        this.disabledDownload = false;
        this.createVisPaper(result.html, result.names);
      } else {
        this.steps['3'].loading = false;
        this.steps['4'].error = [() => false];
        this.steps['4'].text = 'Ошибка обработки отчета';
      }
    },
    async getAllPapers() {
      this.selectedFile = '';
      this.fileBlock = 3;
      this.move = 3;
      this.steps['2'].loading = true;
      this.steps['3'].complete = false;
      this.steps['3'].text = 'Жду выбора отчета';
      this.steps['4'].error = [];
      this.clearReady();

      const result = await this.$store.dispatch('getAllPaper');
      try {
        if (JSON.parse(result).status === 'success') {
          this.allFiles = JSON.parse(result).files;
          this.showError = false;
        } else {
          this.errorMsg = 'Список отчетов получить не удалось. Вернитесь назад и попробуйте снова.';
          this.showError = true;
          this.steps['2'].loading = false;
          this.steps['3'].error = [() => false];
          this.steps['3'].text = 'Ошибка получения списка';
        }
      } catch (error) {
        this.message(`Ошибка: ${error}`);
      }
    },
    downloadFile() {
      const namefile = this.fileLink.split('/')[2];
      // создаем ссылку
      const link = this.$refs.stepper.$el.appendChild(
        document.createElement('a'),
      );
      // указываем ссылке что надо скачать наш файл csv
      link.setAttribute('href', this.fileLink);
      // указываем имя файла
      link.setAttribute('download', namefile);
      link.click(); // жмем на скачку
      link.remove(); // удаляем ссылку
    },
    clearReady() {
      this.steps['4'].complete = false;
      this.steps['4'].text = 'Обработать отчет';
      this.fileLink = '';
      this.disabledDownload = true;
    },
    returnArrow() {
      this.fileBlock = 1;
      this.steps['3'].error = [];
      if (this.selectedFile === '') {
        this.move = 2;
        this.steps['3'].text = 'Выбрать отчет';
        this.steps['2'].loading = false;
        this.steps['3'].complete = false;
      }
    },
    async launchSearch() {
      this.steps['2'].complete = false;
      this.steps['1'].loading = true;
      this.steps['2'].text = 'Валидирую запрос';
      this.steps['4'].error = [];
      this.move = 2;
      this.clearReady();

      this.search.sid = this.hashCode(this.search.original_otl);

      await this.$store.dispatch('auth/putLog', `Запущен запрос  ${this.search.sid}`);

      this.loading = true;
      // console.log('launch search');
      const response = await this.$store.dispatch('getDataApi', {
        search: this.search,
        idDash: 'papers',
      });
      // вызывая метод в хранилище

      if (!response || response.length === 0) {
        // если что-то пошло не так

        this.loading = false;
        this.$store.commit('setErrorLogs', true);
        this.data = [];
        this.cancelSearch();
      } else {
        // если все нормально
        this.loading = false;
        this.$store.commit('setPaperSearch', this.search);
        // this.data = response;
        this.dispSid = response.sid;
        this.steps['2'].complete = true;
        this.steps['1'].loading = false;
        this.steps['2'].text = 'Запрос сформирован';
        this.steps['2'].error = [];

        // console.log('data ready');
      }
    },
    cancelSearch() {
      this.steps['2'].complete = false;
      this.steps['1'].loading = false;
      this.steps['2'].text = 'Запрос завершился ошибкой ';
      this.steps['2'].error.push(() => 'false');
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
    openSettings() {
      this.modal = true;
    },
    cancelModal() {
      this.modal = false;
    },
    setSearch(search) {
      this.search = { ...search };
      this.modal = false;
    },
    changeColor() {
      if (document.querySelectorAll('.v-menu__content').length !== 0) {
        document.querySelectorAll('.v-menu__content').forEach((item) => {
          item.style.background = this.color.back;
          item.style.color = this.color.text;
          item.style.border = `1px solid ${this.color.border}`;
        });
      }
    },
    createVisPaper(html, names) {
      this.tabs = [];
      this.html = [];
      if (names.length === 1) {
        const img = `<img class="vis-image" src="data:image/png;base64,${html[0]}" />`;
        this.$refs.vis.innerHTML = img;
      } else if (names.length < 6) {
        this.tabs = names;
        this.html = html;
      } else {
        this.$refs.vis.innerHTML = 'К сожалению файлов слишком много для визуального отображения';
      }
      // if (html.length == 1) {
      //   this.$refs.vis.innerHTML = html;
      // } else {
      //   console.log(html)
      // }
    },
    changeVisTab(number) {
      const img = `<img class="vis-image" src="data:image/png;base64,${this.html[number]}" />`;
      this.$refs.vis.innerHTML = img;
    },
  },
};
</script>

<style lang="scss">
@import '../sass/papers.sass';
</style>
