<template>
  <div class="tile-template">
    <div
      v-show="!noMsg"
      class="dash-tile"
      :style="{ height: `${height - otstupBottom}px` }"
    >
      <div class="tile-block">
        <div
          v-for="i in dataTile.length"
          :key="i"
          class="tile"
          :style="{
            backgroundColor: dataTile[i - 1].color,
            border: `3px inset ${borderColor(dataTile[i - 1].border)}`,
            width: widthTile,
            height: heightTile,
          }"
          @click="setClick(dataTile[i - 1])"
        >
          <p v-html="checkName(dataTile[i - 1].caption)" />
        </div>
      </div>
    </div>
    <div
      v-show="noMsg"
      class="errormsg"
    >
      {{ msgText }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // переменные полученные от родителя
    idFrom: null, // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда
    dataRestFrom: null, // данные полученые после выполнения запроса
    colorFrom: null, // цветовые переменные
    sizeTileFrom: null, // размер плиток
    heightFrom: null, // высота родительского элемента
    dataModeFrom: null, // включена ли шапка
    activeElemFrom: null,
    dataReport: null,
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
    otstupBottom() {
      let otstup;
      if (this.dataModeFrom) {
        otstup = 50;
        if (window.screen.width <= 1600) {
          otstup = 35;
        }
      } else {
        otstup = 10;
      }
      return otstup;
    },
    color() {
      return this.colorFrom;
    },
    height() {
      return this.heightFrom;
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
  },
  watch: {
    dataRestFrom(dataRestFrom) {
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
    captures(captures) {
      this.actions[0].capture = captures;
      this.$store.commit('setActions', {
        actions: this.actions,
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
  },
  methods: {
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

      Object.keys(tockens).forEach((i) => {
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture,
        };
        if (tockens[i].elem === this.id && tockens[i].action === 'click') {
          this.$store.commit('setTocken', {
            tocken,
            idDash: this.idDash,
            value: item[tockens[i].capture],
            store: this.$store,
          });
        }
      });

      const events = this.getEvents({
        event: 'onclick',
        partelement: 'empty',
      });

      if (events.length !== 0) {
        events.forEach((event) => {
          if (event.action === 'set') {
            this.$store.commit('letEventSet', {
              events,
              idDash: this.idDash,
            });
          } else if (event.action === 'go') {
            this.$store.dispatch('letEventGo', {
              event,
              idDash: this.idDash,
              route: this.$router,
              store: this.$store,
            });
          }
        });
      }
    },
    checkName(name) {
      return name.replace('\\n', '<br>');
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
