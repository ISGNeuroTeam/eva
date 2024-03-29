<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      v-if="optionsData.onButton || getOptions.onButtonToken"
      :style="{
        ...customStyle,
        height: `${height}px`,
      }"
      :class="customClass"
      class="dash-button"
      v-bind="$attrs"
    >
      <v-btn
        class="name"
        :disabled="eventLoading || timeout_waiting"
        :loading="eventLoading"
        :class="{ textDecoration: underline }"
        :style="{
          color: optionsData.colorText || theme.$main_text,
          height: `${height}px`,
          width: '100%',
          fontSize: `${fontSize}px`,
          background: optionsData.background,
        }"
        @click="onClickBtn"
      >
        {{ optionsData.name ? optionsData.name : 'Подтвердить' }}
      </v-btn>
    </div>
    <div
      v-else
      ref="buttonEl"
      class="dash-button"
      :class="{
        'button-disabled': eventLoading,
        'button-loading': eventLoading,
      }"
      style="padding: 0"
      @click="setClick"
    >
      <div
        class="name d-flex align-center justify-center"
        :class="{
          textDecoration: underline,
        }"
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
      eventLoading: false,
      underline: false,
      timeout_waiting: false,
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
      return this.sizeFrom.height - 36;
    },
    visualisationFromStore() {
      return this.$store.state[this.idDash][this.id];
    },
    dashFromStore() {
      return this.$store.state[this.idDash];
    },
    getOptions() {
      if (!this.idDash) {
        return [];
      }
      if (!this.visualisationFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.id, idDash: this.idDash });
      }

      return this.visualisationFromStore.options;
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
      this.timeout_waiting = false;
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
    onClickBtn() {
      const {
        btnDebounce,
        btnDebounceTime,
      } = this.getOptions;
      if (btnDebounce) {
        if (this.timeout_waiting) {
          return;
        }
        this.timeout_waiting = true;
        this.update();
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.timeout_waiting = false;
        }, Math.abs((btnDebounceTime || 1) * 1000));
      } else {
        this.update();
      }
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
    actionOpenModal(item) {
      this.$store.commit('setVisualisationModalData', { idDash: this.idDash, data: item });
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
            this.$store.dispatch('letEventGo', {
              event: item,
              idDash: this.idDash,
              route: this.$router,
              store: this.$store,
            });
          } else if (item.action.toLowerCase() === 'openmodal') {
            this.actionOpenModal(item);
          } else if (item.action.toLowerCase() === 'open') {
            // если экшен open
            this.actionOpen(
              item.target.toLowerCase(),
              item.header,
              item.widthPersent,
              item.heightPersent,
            );
          } else if (item.action.toLowerCase() === 'download') {
            this.downloadEvent(item);
          }
        });
      }
    },
    downloadEvent({ searchName }) {
      this.eventLoading = true;
      const targetSearch = Object.values(this.dashFromStore.searches)
        .find((search) => searchName === search.sid);
      this.$store.dispatch('letEventDownload', {
        search: targetSearch,
        idDash: this.idDash,
      }).then((response) => {
        if (response?.data?.length > 0) {
          response.data.forEach((dataElement, i) => {
            if (dataElement?.path_to_file) {
              this.downloadFile(dataElement?.path_to_file);
            } else {
              console.error(`Отсутствует значение поля или поле: path_to_file, строка: ${i + 1}`);
            }
          });
        } else {
          console.error('Нет данных');
        }
      }).finally(() => {
        this.eventLoading = false;
      });
    },
    downloadFile(link) {
      const namefile = link.split('/')[link.split('/').length - 1];
      const fileLink = link[0] === '/' ? link.substring(1) : link;
      const url = `${window.location.protocol}//${window.location.host}/${fileLink}`;
      const el = this.$refs.buttonEl.parentElement.appendChild(
        document.createElement('a'),
      ); // создаем ссылку
      el.setAttribute('href', url); // указываем ссылке что надо скачать наш файл csv
      el.setAttribute('download', namefile); // указываем имя файла
      el.click(); // жмем на скачку
      el.remove(); // удаляем ссылку
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
  },
};
</script>

<style lang="scss">
@import '../../sass/dashButton.sass';
</style>
