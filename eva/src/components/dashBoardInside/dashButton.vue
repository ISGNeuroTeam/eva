<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      v-if="optionsData.onButton || getOptions.onButtonToken"
      :style="customStyle"
      :class="customClass"
      class="dash-button"
      v-bind="$attrs"
    >
      <v-btn
        class="name"
        :class="{ textDecoration: underline }"
        :style="{
          color: optionsData.colorText || theme.$main_text,
          height: `${height}px`,
          width: '100%',
          fontSize: `${fontSize}px`,
          background: optionsData.background,
        }"
        @click="update()"
      >
        {{ optionsData.name ? optionsData.name : 'Подтвердить' }}
      </v-btn>
    </div>
    <div
      v-else
      ref="buttonEl"
      class="dash-button"
      style="padding: 0"
      @click="setClick"
    >
      <div
        class="name d-flex align-center justify-center"
        :class="{ textDecoration: underline }"
        :style="{
          color: optionsData.colorText || theme.$main_text,
          height: `${height}px`,
          width: '100%',
          fontSize: `${fontSize}px`,
          background: optionsData.background,
        }"
      >
        {{ optionsData.name }}
      </div>
    </div>
  </portal>
</template>

<script>
export default {
  name: 'DashButton',
  props: {
    // переменные полученные от родителя
    idFrom: {
      type: String,
      required: true,
    }, // id элемнета (table, graph-2)
    idDashFrom: {
      type: String,
      required: true,
    }, // id дашборда
    colorFrom: {
      type: Object,
      required: true,
    }, // цветовые переменные
    dataModeFrom: {
      type: Boolean,
      default: false,
    },
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
    sizeFrom: {
      type: Object,
      required: true,
    },
    customStyle: {
      type: Object,
      default: () => ({}),
    },
    customClass: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      actions: [{ name: 'click', capture: ['inverse'] }],
      optionsData: {
        name: '',
        background: '',
        colorText: '',
        onButton: false,
      },
      underline: false,
    };
  },
  computed: {
    // осоновные параметры, которые чатсо меняются и которы следует отслеживать
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },
    color() {
      return this.colorFrom;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    height() {
      return this.sizeFrom.height - 59;
    },
    dashFromStore() {
      return this.$store.state[this.idDash][this.id];
    },
    getOptions() {
      if (!this.idDash) {
        return [];
      }
      if (!this.dashFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.id, idDash: this.idDash });
      }

      return this.dashFromStore.options;
    },
    fontSize() {
      const { fontSize } = this.getOptions;
      return fontSize ? fontSize.split('px')[0] : '30';
    },
    underlineWidth() {
      let width = 30;
      if (this.fontSize > 30) {
        width = 90;
      } else if (this.fontSize > 20) {
        width = 70;
      } else if (this.fontSize > 10) {
        width = 50;
      }
      return width;
    },
    updatedOptions() {
      return this.getOptions;
    },
  },
  watch: {
    updatedOptions: {
      immediate: true,
      deep: true,
      handler() {
        this.updateOptionsData();
      },
    },
  },
  mounted() {
    this.$emit('hideDS', this.id);
    this.$emit('hideLoading');
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDash,
      id: this.id,
    });
  },
  methods: {
    updateOptionsData() {
      const options = this.getOptions;
      if (options.color) {
        this.optionsData.colorText = options.color;
      } else {
        this.optionsData.colorText = this.color.text;
      }
      if (options.backgroundcolor) {
        this.optionsData.background = options.backgroundcolor;
      } else {
        this.optionsData.background = 'transparent';
      }
      if (options.name) {
        this.optionsData.name = options.name;
      } else {
        this.optionsData.name = '';
      }
      this.underline = options.underline;
      this.optionsData.onButton = options?.onButton;
    },
    update() {
      if (this.optionsData.onButton) {
        this.updateSearches();
      }
      if (this.getOptions.onButtonToken) {
        this.updateToken();
      }
      this.setClick();
    },
    updateSearches() {
      const { idDash, id } = this;
      this.$store.commit('updateManualTokens', {
        idDash,
        id,
      });
    },
    updateToken() {
      const { idDash, id } = this;
      const tokens = this.getOptions?.ListTokens;
      this.$store.commit('removeTokens', {
        idDash,
        id,
        tokens,
      });
    },
    actionOpen(targetLink, header, widthPersent, heightPersent) {
      // размер нового окна
      const width = window.screen.width * widthPersent;
      const height = window.screen.height * heightPersent;

      // устанавливаем положение нового окна.
      const left = (window.screen.width - window.screen.width * widthPersent) / 2;
      const top = (window.screen.height - window.screen.height * heightPersent) / 3;

      // адрес перехода
      const link = `${window.location.origin}/dashboards/${targetLink}${
        header === 'false' || header === '0' ? '?header=false' : ''
      }`;
      window.open(
        link,
        '',
        `width=${width}, height=${height}, top=${top}, left=${left}`,
      );
    },
    createReport(item, type) {
      this.getData(item.sid, item.file, type);
    },
    exportSearch(item, type) {
      item.searches.forEach((sid) => {
        this.getData(sid, '', type);
      });
    },
    getEvents({ event, partelement }) {
      let result = [];
      if (!this.$store.state[this.idDash].events) {
        this.$store.commit('setState', [{
          object: this.$store.state[this.idDash],
          prop: 'events',
          value: [],
        }]);
        return [];
      }
      if (partelement) {
        result = this.$store.state[this.idDash].events.filter((item) => (
          item.event === event
          && item.element === this.id
          && item.partelement === partelement
        ));
      } else {
        result = this.$store.state[this.idDash].events.filter(
          (item) => item.event === event
            && item.target === this.id,
        );
      }
      return result;
    },
    setClick() {
      const { tockens } = this.$store.state[this.idDash];
      let tocken = {};
      let value = false;

      if (tockens) {
        Object.keys(tockens).forEach((i) => {
          tocken = {
            name: tockens[i].name,
            action: tockens[i].action,
            capture: tockens[i].capture,
          };
          if (
            tockens[i].elem === this.id
            && tockens[i].action === 'click'
            && tockens[i].capture === 'inverse'
          ) {
            switch (tockens[i].value) {
              case '':
                value = true;
                break;
              case true:
                value = false;
                break;
              case false:
                value = true;
                break;
              default:
                break;
            }

            this.$store.commit('setTocken', {
              token: tocken,
              idDash: this.idDash,
              value,
              store: this.$store,
            });
          }
        });
      }

      const events = this.getEvents({
        event: 'onclick',
        partelement: 'empty',
      });
      if (events.length !== 0) {
        events.forEach((item) => {
          if (item.action === 'set') {
            this.$store.commit('letEventSet', {
              events,
              idDash: this.idDash,
            });
          } else if (item.action === 'go') {
            this.$store.commit('letEventGo', {
              event: item,
              idDash: this.idDash,
              route: this.$router,
              store: this.$store,
            });
          } else if (item.action.toLowerCase() === 'open') {
            // если экшен open
            this.actionOpen(
              item.target.toLowerCase(),
              item.header,
              item.widthPersent,
              item.heightPersent,
            );
          } else if (
            item.action.toLowerCase() === 'changeReport'.toLowerCase()
          ) {
            // если экшен open
            this.createReport(item, 'report');
          } else if (
            item.action.toLowerCase() === 'exportSearch'.toLowerCase()
          ) {
            // если экшен open
            this.exportSearch(item, 'search');
          }
        });
      }
    },
    downloadFile(fileLink) {
      const namefile = fileLink.split('/')[2];
      const url = `${window.location.protocol}//${window.location.host}/${fileLink}`;
      const link = this.$refs.buttonEl.parentElement.appendChild(
        document.createElement('a'),
      ); // создаем ссылку
      link.setAttribute('href', url); // указываем ссылке что надо скачать наш файл csv
      link.setAttribute('download', namefile); // указываем имя файла
      link.click(); // жмем на скачку
      link.remove(); // удаляем ссылку
    },
    getSearch(search, sid) {
      let csvContent = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,'; // задаем кодировку csv файла
      const keys = Object.keys(search[0]); // получаем ключи для заголовков столбцов
      csvContent += encodeURIComponent(`${keys.join(',')}\n`); // добавляем ключи в файл
      csvContent += encodeURIComponent(
        search.map((item) => Object.values(item).join(',')).join('\n'),
      ); // добовляем все значения по ключам в файл
      const link = this.$refs.buttonEl.parentElement.appendChild(
        document.createElement('a'),
      ); // создаем ссылку
      link.setAttribute('href', csvContent); // указываем ссылке что надо скачать наш файл csv
      link.setAttribute('download', `${this.idDash}-${sid}.csv`); // указываем имя файла
      link.click(); // жмем на скачку
      link.remove(); // удаляем ссылку
    },
    getData(sid, file, type) {
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
          // this.data = event.data;
          if (type !== 'report') {
            this.getSearch(event.data, sid);
          }
        } else {
          // this.errorMsg = "Получить данные для отчета не удалось.";
          // this.showError = true;
        }

        worker.terminate();
      }.bind(this);

      worker.postMessage(`${this.idDash}-${sid}`); // запускаем воркер на выполнение
    },
    getDataFromDb() {
      return function ({ data }) {
        let db = null;

        const searchSid = data;

        const request = indexedDB.open('EVA', 1);

        request.onupgradeneeded = (event) => {
          db = event.target.result;
          if (!db.objectStoreNames.contains('searches')) {
            // if there's no "books" store
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

          query.onsuccess = () => {
            // (4)
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
        };
      };
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashButton.sass';
</style>
