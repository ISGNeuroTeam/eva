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
    active: {
      type: Boolean,
      required: true,
    },
    sid: {
      type: String,
      required: true,
    },
    idDash: {
      type: String,
      required: true,
    },
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
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  watch: {
    active() {
      if (this.active) {
        this.getAllPapers();
        this.getData();
      }
    },
  },
  methods: {
    cancelModal() {
      this.selectedFile = '';
      this.data = [];
      this.$emit('cancelModal');
    },
    async startPaper() {
      if (this.selectedFile === '') {
        this.message('Выберит файл');
      } else {
        await this.getPaper();
      }
    },
    downloadFile(fileLink) {
      const namefile = fileLink.split('/')[2];
      const link = this.$refs.paperBlock.appendChild(document.createElement('a')); // создаем ссылку
      link.setAttribute('href', `/${fileLink}`); // указываем ссылке что надо скачать наш файл csv
      link.setAttribute('download', namefile); // указываем имя файла
      link.click(); // жмем на скачку
      link.remove(); // удаляем ссылку
    },
    async getPaper() {
      this.loadingShow = true;

      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('data', JSON.stringify(this.data));
      const result = await this.$store.dispatch('getPaper', formData);
      try {
        if (result.status === 'success') {
          this.downloadFile(result.file);
          this.loadingShow = false;
          // this.showError = false;
        } else {
          this.errorMsg = 'Отчет сформировать не удалось. Вернитесь назад и попробуйте снова.';
          this.showError = true;
          this.loadingShow = false;
        }
      } catch (error) {
        this.message(`Ошибка: ${error}`);
        this.loadingShow = false;
      }
    },
    async getAllPapers() {
      const result = await this.$store.dispatch('getAllPaper');
      try {
        if (JSON.parse(result).status === 'success') {
          this.allFiles = JSON.parse(result).files;
          this.showError = false;
        } else {
          this.errorMsg = 'Список отчетов получить не удалось. Вернитесь назад и попробуйте снова.';
          this.showError = true;
        }
      } catch (error) {
        this.message(`Ошибка: ${error}`);
      }
    },
    message(text) {
      this.errorMsg = text;
      this.showError = true;
      setTimeout(() => {
        this.showError = false;
      }, 2000);
    },
    changeColor() {
      if (document.querySelectorAll('.v-menu__content').length !== 0) {
        document.querySelectorAll('.v-menu__content').forEach((item) => {
          item.style.boxShadow = `0 5px 5px -3px ${this.color.border},0 8px 10px 1px ${this.color.border},0 3px 14px 2px ${this.color.border}`;
          item.style.background = this.color.back;
          item.style.color = this.color.text;
          item.style.border = `1px solid ${this.color.border}`;
        });
      }
    },
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
        if (event.data.length !== 0) {
          this.data = event.data;
        } else {
          this.errorMsg = 'Получить данные для отчета не удалось.';
          this.showError = true;
        }

        worker.terminate();
      }.bind(this);

      worker.postMessage(`${this.idDash}-${this.sid}`); // запускаем воркер на выполнение
    },
    getDataFromDb() {
      return (event) => {
        let db = null;

        const searchSid = event.data;

        const request = indexedDB.open('EVA', 1);

        request.onerror = (error) => {
          console.log('error: ', error);
        };

        request.onupgradeneeded = (onUpgradeNeededEvent) => {
          console.log('create');
          db = onUpgradeNeededEvent.target.result;
          if (!db.objectStoreNames.contains('searches')) {
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

          // (3) return store.get('Ire Aderinokun');
          const query = searches.get(String(searchSid));

          // (4)
          query.onsuccess = () => {
            if (query.result) {
              // сообщение которое будет передаваться как результат выполнения функции
              self.postMessage(query.result);
            } else {
              // сообщение которое будет передаваться как результат выполнения функции
              self.postMessage([]);
            }
          };

          query.onerror = () => {
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
