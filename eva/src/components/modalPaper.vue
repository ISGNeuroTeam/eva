<template>
  <v-dialog
    v-model="active"
    width="500"
    persistent
  >
    <div
      ref="paperBlock"
      class="paper-modal-block"
    >
      <v-card :style="{ background: theme.$main_bg }">
        <v-card-text class="headline">
          <div
            class="paper-title"
            :style="{ color: theme.$title }"
          >
            Создание отчета
          </div>
        </v-card-text>
        <div class="get-file-block">
          <v-autocomplete
            v-model="selectedFile"
            :items="allFiles"
            outlined
            :style="{ color: theme.$main_text, fill: theme.$main_text }"
            :color="theme.$accent_ui_color"
            hide-details
            class="file-get-itself"
            label="Выбрать отчет"
          />
          <div class="error-block">
            <div
              v-show="loadingShow"
              class="loading-block"
            >
              <v-icon
                :color="theme.$primary_button"
                medium
              >
                {{ gear }}
              </v-icon>
            </div>
            <div
              class="error-msg"
              :class="{ showError: showError }"
              :style="{ color: theme.$error_color }"
            >
              {{ errorMsg }}
            </div>
          </div>
          <v-btn
            small
            :color="theme.$primary_button"
            class="file-get-btn"
            @click="startPaper"
          >
            Скачать отчет
          </v-btn>
        </div>
        <v-card-actions class="paper-action">
          <v-spacer />
          <v-btn
            small
            :color="theme.$primary_button"
            class="close-btn"
            @click="cancelModal"
          >
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
import { mdiSettings } from '@mdi/js';

export default {
  props: {
    active: null,
    sid: null,
    idDash: null,
  },
  data() {
    return {
      selectedFile: '',
      allFiles: [],
      data: [],
      showError: false,
      errorMsg: 'Ошибка',
      gear: mdiSettings,
      loadingShow: false,
    };
  },
  computed: {
    theme: function () {
      return this.$store.getters.getTheme;
    },
  },
  watch: {
    active: function () {
      if (this.active) {
        this.getAllPapers();
        this.getData();
      }
    },
  },
  methods: {
    cancelModal: function () {
      this.selectedFile = '';
      this.data = [];
      this.$emit('cancelModal');
    },
    startPaper: async function () {
      if (this.selectedFile == '') {
        this.message('Выберит файл');
      } else {
        this.getPaper();
      }
    },
    downloadFile: function (fileLink) {
      let namefile = fileLink.split('/')[2];
      let link = this.$refs.paperBlock.appendChild(document.createElement('a')); // создаем ссылку
      link.setAttribute('href', `/${fileLink}`); // указываем ссылке что надо скачать наш файл csv
      link.setAttribute('download', namefile); // указываем имя файла
      link.click(); // жмем на скачку
      link.remove(); // удаляем ссылку
    },
    getPaper: async function () {
      this.loadingShow = true;

      let formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('data', JSON.stringify(this.data));
      let result = await this.$store.getters.getPaper(formData);
      try {
        if (result.status == 'success') {
          this.downloadFile(result.file);
          this.loadingShow = false;
          //this.showError = false;
        } else {
          this.errorMsg =
            'Отчет сформировать не удалось. Вернитесь назад и попробуйте снова.';
          this.showError = true;
          this.loadingShow = false;
        }
      } catch (error) {
        this.message(`Ошибка: ${error}`);
        this.loadingShow = false;
      }
    },
    getAllPapers: async function () {
      let result = await this.$store.getters.getAllPaper();
      try {
        if (JSON.parse(result).status == 'success') {
          this.allFiles = JSON.parse(result).files;
          this.showError = false;
        } else {
          this.errorMsg =
            'Список отчетов получить не удалось. Вернитесь назад и попробуйте снова.';
          this.showError = true;
        }
      } catch (error) {
        this.message(`Ошибка: ${error}`);
      }
    },
    message: function (text) {
      this.errorMsg = text;
      this.showError = true;
      setTimeout(() => {
        this.showError = false;
      }, 2000);
    },
    changeColor: function () {
      if (document.querySelectorAll('.v-menu__content').length != 0) {
        document.querySelectorAll('.v-menu__content').forEach((item) => {
          item.style.boxShadow = `0 5px 5px -3px ${this.color.border},0 8px 10px 1px ${this.color.border},0 3px 14px 2px ${this.color.border}`;
          item.style.background = this.color.back;
          item.style.color = this.color.text;
          item.style.border = `1px solid ${this.color.border}`;
        });
      }
    },
    getData: function () {
      let blob = new Blob([`onmessage=${this.getDataFromDb().toString()}`], {
        type: 'text/javascript',
      }); // создаем blob объект чтобы с его помощью использовать функцию для web worker

      let blobURL = window.URL.createObjectURL(blob); // создаем ссылку из нашего blob ресурса

      let worker = new Worker(blobURL); // создаем новый worker и передаем ссылку на наш blob объект

      worker.onmessage = function (event) {
        // при успешном выполнении функции что передали в blob изначально сработает этот код

        if (event.data.length != 0) {
          this.data = event.data;
        } else {
          this.errorMsg = 'Получить данные для отчета не удалось.';
          this.showError = true;
        }

        worker.terminate();
      }.bind(this);

      worker.postMessage(`${this.idDash}-${this.sid}`); // запускаем воркер на выполнение
    },
    getDataFromDb: function () {
      return function (event) {
        let db = null;

        let searchSid = event.data;

        let request = indexedDB.open('EVA', 1);

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
            console.log('successEvent: ' + db);
          };
        };

        request.onsuccess = () => {
          db = request.result;

          let transaction = db.transaction('searches'); // (1)

          // получить хранилище объектов для работы с ним
          let searches = transaction.objectStore('searches'); // (2)

          let query = searches.get(String(searchSid)); // (3) return store.get('Ire Aderinokun');

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
  },
};
</script>

<style lang="scss">
@import '../sass/modalPaper.sass';
</style>
