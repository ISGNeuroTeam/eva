<template>
  <div class="tile-template">
    <div
      v-show="!noMsg"
      class="dash-tile"
      :style="{ height: `${height - otstupBottom}px` }"
    >
      <div class="tile-block" :data-status="change">
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
    <div v-show="noMsg" class="errormsg">
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
          name: "click",
          capture: [],
        },
      ],
      captures: {},
      noMsg: false,
      msgText: "",
      dataTile: [],
    };
  },
  computed: {
    // осоновные параметры, которые чатсо меняются и которы следует отслеживать
    id: function () {
      return this.idFrom;
    },
    idDash: function () {
      return this.idDashFrom;
    },
    // dataRest: function() {
    //   if (!this.dataRestFrom.length || this.dataRestFrom.length == 0) {
    //     this.noMsg = true;
    //     this.msgText = "Нет данных для отображения";
    //   } else if (!this.dataRestFrom[0].caption || !this.dataRestFrom[0].color) {
    //     this.noMsg = true;
    //     this.msgText = "Ожидается поле caption и color";
    //   } else {
    //     this.pushDataAsynchrony();

    //   }
    //   return 'done'
    // },
    change: function () {
      if (!this.dataRestFrom.length || this.dataRestFrom.length == 0) {
        this.noMsg = true;
        this.msgText = "Нет данных для отображения";
      } else if (!this.dataRestFrom[0].caption || !this.dataRestFrom[0].color) {
        this.noMsg = true;
        this.msgText = "Ожидается поле caption и color";
      } else {
        if (this.dataReport) {
          if (this.activeElemFrom == this.id) {
            this.pushDataAsynchrony();
          } else {
            this.dataTile = [];
          }
        } else {
          this.pushDataAsynchrony();
        }
      }
      return true;
    },
    otstupBottom: function () {
      let otstup = null;
      if (this.dataModeFrom) {
        otstup = 50;
        if (screen.width <= 1600) {
          otstup = 35;
        }
      } else {
        otstup = 10;
      }
      return otstup;
    },
    color: function () {
      return this.colorFrom;
    },
    height: function () {
      return this.heightFrom;
    },
    widthTile: function () {
      return this.setSize("width");
    },
    heightTile: function () {
      return this.setSize("height");
    },
  },
  watch: {
    captures: function (captures) {
      this.actions[0].capture = captures;
      this.$store.commit("setActions", {
        actions: this.actions,
        idDash: this.idDash,
        id: this.id,
      });
    },
  },
  methods: {
    pushDataAsynchrony: function () {
      let prom = new Promise((resolve) => {
        // создаем promise чтобы затем отрисовать график асинхронно
        resolve();
      });

      prom.then(() => {
        // как раз тут делаем асинхронность
        this.dataTile = [];
        this.noMsg = false;
        this.dataRestFrom.forEach((item) => {
          this.dataTile.push({ ...{}, ...item });
        });
        this.captures = Object.keys(this.dataRestFrom[0]);
      });
    },
    setClick: function (item) {
      let tockens = this.$store.getters.getTockens(this.idDash);
      let tocken = {};

      Object.keys(tockens).forEach((i) => {
        tocken = {
          name: tockens[i].name,
          action: tockens[i].action,
          capture: tockens[i].capture,
        };
        if (tockens[i].elem == this.id && tockens[i].action == "click") {
          this.$store.commit("setTocken", {
            tocken: tocken,
            idDash: this.idDash,
            value: item[tockens[i].capture],
            store: this.$store,
          });
        }
      });

      let events = this.$store.getters.getEvents({
        idDash: this.idDash,
        event: "onclick",
        element: this.id,
        partelement: "empty",
      });

      if (events.length != 0) {
        events.forEach((item) => {
          if (item.action == "set") {
            this.$store.commit("letEventSet", {
              events: events,
              idDash: this.idDash,
            });
          } else if (item.action == "go") {
            this.$store.commit("letEventGo", {
              event: item,
              idDash: this.idDash,
              route: this.$router,
              store: this.$store,
            });
          }
        });
      }
    },
    checkName: function (name) {
      return name.replace("\\n", "<br>");
    },
    setSize: function (sizeFrom) {
      let size = "";
      if (this.sizeTileFrom[sizeFrom] == "") {
        size = "100px";
      } else {
        if (this.sizeTileFrom[sizeFrom].indexOf("px") != -1) {
          size = this.sizeTileFrom[sizeFrom];
        } else {
          size = `${this.sizeTileFrom[sizeFrom]}px`;
        }
      }
      return size;
    },
    borderColor: function (border) {
      if (border == "1") {
        return this.colorFrom.controlsSystem;
      } else if (border == "0" || border == null) {
        return "transparent";
      } else {
        return border;
      }
    },
  },
  mounted() {
    //  В первый раз раскомментить чтобы создать события для элемнета, а затем лучше закоментить чтобы каждый раз не обращаться к store
    this.$store.commit("setActions", {
      actions: this.actions,
      idDash: this.idDash,
      id: this.id,
    });
  },
};
</script>

<style lang="sass" >
@import '../../sass/dashTile.sass'
</style>
