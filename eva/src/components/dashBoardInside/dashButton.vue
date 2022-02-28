<template>
  <div v-if="optionsData.onButton">
    <div
      class="name"
      :class="{ textDecoration: underline }"
      :style="{
        color: optionsData.colorText,
        height: `${height}px`,
        fontSize: `${fontSize}px`,
        lineHeight: `${height - dataMode}px`,
        background: optionsData.background,
      }"
      @click="updateSearches"
    >
      Подтвердить
    </div>
  </div>
  <div
    v-else
    ref="buttonEl"
    class="dash-button"
    style="padding: 0"
    @click="setClick"
  >
    <div
      class="name"
      :class="{ textDecoration: underline }"
      :style="{
        color: optionsData.colorText,
        height: `${height}px`,
        fontSize: `${fontSize}px`,
        lineHeight: `${height - dataMode}px`,
        background: optionsData.background,
      }"
    >
      {{ optionsData.name }}
      <!-- <div
        v-if="underline"
        class="underline"
        :style="{background:optionsData.colorText, width: `${underlineWidth}%`}"
      /> -->
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // переменные полученные от родителя
    idFrom: null, // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда
    colorFrom: null, // цветовые переменные
    widthFrom: null, // ширина родительского компонента
    heightFrom: null, // выоста родительского компонента
    dataModeFrom: null,
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
    height() {
      return this.heightFrom;
    },
    dataMode() {
      if (this.dataModeFrom) {
        return 35;
      }
      return 0;
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

      if (!this.dashFromStore?.options.pinned) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'pinned',
          value: false,
        }]);
      }

      if (!this.dashFromStore.options.lastDot) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'lastDot',
          value: false,
        }]);
      }
      if (!this.dashFromStore.options.stringOX) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'stringOX',
          value: false,
        }]);
      }
      if (!this.dashFromStore?.options.united) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'united',
          value: false,
        }]);
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
    updateSearches() {
      this.$store.commit('updateManualTokens', { idDash: this.idDash });
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
            tocken,
            idDash: this.idDash,
            value,
            store: this.$store,
          });
        }
      });

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
    async getPaper(file, data) {
      this.$emit('setLoading', true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('data', JSON.stringify(data));
      const result = await this.$store.dispatch('getPaper', formData);
      try {
        if (result.status === 'success') {
          this.$emit('setLoading', false);
          this.downloadFile(result.file);
        } else {
          return false;
        }
      } catch (error) {

        // this.message(`Ошибка: ${error}`);
      }
      return false;
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
      const blob = new Blob([`onmessage=${this.getDataFromDb().toString()}`], {
        type: 'text/javascript',
      }); // создаем blob объект чтобы с его помощью использовать функцию для web worker

      const blobURL = window.URL.createObjectURL(blob); // создаем ссылку из нашего blob ресурса

      const worker = new Worker(blobURL); // создаем новый worker и передаем ссылку на наш blob объект

      worker.onmessage = function (event) {
        // при успешном выполнении функции что передали в blob изначально сработает этот код
        if (event.data.length !== 0) {
          // this.data = event.data;
          if (type === 'report') {
            this.getPaper(file, event.data);
          } else {
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
      return function (event) {
        let db = null;

        const searchSid = event.data;

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
              self.postMessage(query.result); // сообщение которое будет передаваться как результат выполнения функции
            } else {
              self.postMessage([]); // сообщение которое будет передаваться как результат выполнения функции
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
