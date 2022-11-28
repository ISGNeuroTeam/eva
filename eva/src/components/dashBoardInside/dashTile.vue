<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      :style="customStyle"
      :class="customClass"
      v-bind="$attrs"
      class="tile-template"
    >
      <div
        v-if="dataTile.length > 0 && !noMsg"
        class="dash-tile"
        :style="{ height: `${height - marginBottom}px` }"
      >
        <div class="tile-block">
          <div class="row ma-0">
            <div
              v-for="i in dataTile.length"
              :key="i"
              :class="`col-${getColumn}`"
              class="pa-1"
            >
              <div
                class="tile"
                :style="{
                  backgroundColor: tileStyleIsNotRange
                    ? `${getOptions.tileStyle}3F`
                    : `${dataTile[i - 1].color}`,
                }"
                @click="setClick(dataTile[i - 1])"
              >
                <p
                  :style="{
                    color: tileStyleIsNotRange ? getOptions.tileStyle : '#FFFFFF',
                  }"
                  v-html="checkName(dataTile[i - 1].caption)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="errormsg"
      >
        {{ msgText }}
      </div>
    </div>
  </portal>
</template>

<script>
export default {
  name: 'DashTile',
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
    dataRestFrom: {
      type: Array,
      required: true,
    }, // данные полученые после выполнения запроса
    colorFrom: {
      type: Object,
      required: true,
    }, // цветовые переменные
    sizeTileFrom: {
      type: Object,
      required: true,
    }, // размер плиток
    heightFrom: {
      type: Number,
      required: true,
    }, // высота родительского элемента
    dataModeFrom: {
      type: Boolean,
      default: false,
    }, // включена ли шапка
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
    options: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      actions: [
        {
          name: 'click',
          capture: [],
        },
      ],
      captures: {},
      noMsg: false,
      msgText: '',
      maxColumnCount: 12,
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
    marginBottom() {
      let margin;
      if (this.dataModeFrom) {
        margin = 50;
        if (window.screen.width <= 1600) {
          margin = 35;
        }
      } else {
        margin = 10;
      }
      return margin;
    },
    color() {
      return this.colorFrom;
    },
    height() {
      return this.sizeFrom.height;
    },
    widthTile() {
      return this.setSize('width');
    },
    heightTile() {
      return this.setSize('height');
    },
    dataTile() {
      // Report logic
      if (this.dataReport) {
        if (this.activeElemFrom === this.id) {
          return this.dataRestFrom.map((item) => ({ ...item }));
        }
        return [];
      }
      // default logic
      return this.dataRestFrom.map((item) => ({ ...item }));
    },
    dashFromStore() {
      return this.$store.state[this.idDashFrom][this.idFrom];
    },
    getOptions() {
      return this.dashFromStore?.options || {};
    },
    getColumn() {
      if (this.getOptions?.columnCount) {
        return this.maxColumnCount / Number(this.getOptions.columnCount);
      }
      return 'auto';
    },
    tileStyleIsNotRange() {
      return typeof this.getOptions?.tileStyle === 'string';
    },
  },
  watch: {
    dataRestFrom: {
      handler(dataRestFrom) {
        this.checkDataRestFrom(dataRestFrom);
      },
      deep: true,
    },
    captures(captures) {
      const localActions = JSON.parse(JSON.stringify(this.actions));
      localActions[0].capture = captures;
      // this.actions[0].capture = captures;
      this.$store.commit('setActions', {
        actions: localActions,
        idDash: this.idDash,
        id: this.id,
      });
    },
  },
  mounted() {
    //  В первый раз раскомментить чтобы создать события для элемнета,
    //  а затем лучше закоментить чтобы каждый раз не обращаться к store
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDash,
      id: this.id,
    });
    this.checkDataRestFrom();
  },
  methods: {
    checkDataRestFrom(dataRestFrom = this.dataRestFrom) {
      if (!dataRestFrom.length || dataRestFrom.length === 0) {
        this.noMsg = true;
        this.msgText = 'Нет данных для отображения';
      } else if (!dataRestFrom[0].caption || !dataRestFrom[0].color) {
        this.noMsg = true;
        this.msgText = 'Ожидается поле caption и color';
      } else {
        this.noMsg = false;
        this.msgText = '';
        this.captures = Object.keys(dataRestFrom[0]);
      }
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
    setClick(item) {
      const { tockens } = this.$store.state[this.idDash];
      let tocken = {};

      if (tockens) {
        Object.keys(tockens).forEach((i) => {
          tocken = {
            name: tockens[i].name,
            action: tockens[i].action,
            capture: tockens[i].capture,
          };
          if (tockens[i].elem === this.id && tockens[i].action === 'click') {
            this.$store.commit('setTocken', {
              token: tocken,
              idDash: this.idDash,
              value: item[tockens[i].capture],
              store: this.$store,
            });
          }
        });
      }

      const events = this.getEvents({
        event: 'onclick',
        partelement: 'empty',
      });

      if (events?.length > 0) {
        events.forEach((event) => {
          if (event.action === 'set') {
            this.$store.commit('letEventSet', {
              events,
              idDash: this.idDash,
            });
          } else if (event.action === 'go') {
            event.value[0] = item.caption;
            this.$store.dispatch('letEventGo', {
              event,
              id: this.id,
              idDash: this.idDash,
              route: this.$router,
              store: this.$store,
            });
          }
        });
      }
    },
    checkName(name) {
      if (name) {
        return name.replace('\\n', '<br>');
      }
      return '';
    },
    setSize(sizeFrom) {
      let size;
      if (!this.sizeTileFrom[sizeFrom] || this.sizeTileFrom[sizeFrom] === '') {
        size = '100px';
      } else if (this.sizeTileFrom[sizeFrom].indexOf('px') !== -1) {
        size = this.sizeTileFrom[sizeFrom];
      } else {
        size = `${this.sizeTileFrom[sizeFrom]}px`;
      }
      return size;
    },
    borderColor(border) {
      if (border === '1') {
        return this.colorFrom.controlsSystem;
      } if (border === '0' || border == null) {
        return 'transparent';
      }
      return border;
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashTile.sass';
</style>
