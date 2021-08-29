<template>
  <div
    class="table-block"
    :data-change="change"
  >
    <v-data-table
      v-show="!props.nodata"
      :ref="id"
      v-model="props.input"
      :headers="props.titles"
      :items.sync="props.itemsForTable"
      class="dash-table report-table"
      :data-id="id"
      item-key="none"
      :hide-default-footer="props.hideFooter"
      :footer-props="{
        itemsPerPageOptions: [100, 500, 1000, -1],
      }"
      :height="height"
      fixed-header
      :style="{ borderColor: theme.$secondary_border }"
    />
    <div
      v-show="props.nodata"
      class="no-data-table"
    >
      {{ props.message }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    dataRestFrom: null,
    shouldGet: null,
    idFrom: null,
    idDashFrom: null,
    heightFrom: null,
    dataReport: null,
    activeElemFrom: null,
    dataModeFrom: null,
    titles: Array,
  },
  data() {
    return {
      props: {
        titles: [],
        superheroes: [],
        nodata: true,
        message: "Нет данных для отображения",
        hash: 0,
        actions: [
          { name: "click", capture: [] },
          { name: "mouseover", capture: [] },
        ],
        selected: {},
        justCreate: true,
        hideFooter: false,
        itemsForTable: [],
      },
    };
  },
  computed: {
    id: function () {
      return this.idFrom;
    },
    idDash: function () {
      return this.idDashFrom;
    },
    change: function () {
      if (!this.dataRestFrom || this.dataRestFrom.length === 0) {
        this.props.itemsForTable = [];
        this.props.nodata = true;
      } else {
        this.getDataAsynchrony(this.dataRestFrom);
      }
      return true;
    },
    theme: function() {
      return this.$store.getters.getTheme
    },
    height: function () {
      let otstup = 100;
      if (screen.width <= 1600) {
        otstup = 80;
      }
      if (screen.width <= 1400) {
        otstup = 70;
      }
      if (this.props.hideFooter) {
        otstup = 45;
      }
      if (this.dataReport) {
        otstup = otstup - 30;
      }
      let height = this.heightFrom - otstup; // 120 это размер блока с пагинацией таблицы + шапка с настройками самого блока
      return height;
    },
    lastResult: function () {
      let options = this.$store.getters.getOptions({
        idDash: this.idDash,
        id: this.id,
      });
      return options.lastResult;
    },
  },
  watch: {
    titles(newValue) {
      if (newValue)
        this.createTitles(newValue);
    },
  },
  mounted() {
    this.$store.commit("setActions", {
      actions: JSON.parse(JSON.stringify(this.props.actions)),
      idDash: this.idDash,
      id: this.id,
    });
  },
  methods: {
    getDataAsynchrony: function (data) {
      let prom = new Promise((resolve) => {
        if (data.error) {
          this.props.message = data.error;
          this.props.nodata = true;
        } else {
          resolve(data);
        }
      });
      prom.then((data) => {
        data.length <= 100
          ? (this.props.hideFooter = true)
          : (this.props.hideFooter = false);
        this.createTitles(data);
        this.createTockens(data);
        if (this.props.justCreate) {
          this.selectRow();
          this.props.justCreate = false;
        }

        this.props.nodata = false;
        this.props.itemsForTable = data;
      });
    },

    createTitles: function (result) {
      let titlesParsed = Object.keys(result[0]).map((item) => {
        return { text: item, value: item, sortable: true };
      });
      if (this.titles) {
        let allTitles = Object.keys(this.dataRestFrom[0]);
        let temp = [];
        for (let x of allTitles) {
          if (this.titles.includes(x)) {
            temp.push({ text: x, value: x, sortable: true });
          }
          else {
            temp.push({ text: x, value: x, sortable: true, align: ' d-none' });
          }
        }
        this.props.titles = temp;
      } else {
        this.props.titles = titlesParsed;
      }

    },
    createTockens: function (result) {
      let captures = Object.keys(result[0]);
      this.props.actions.forEach((item, i) => {
        this.$set(this.props.actions[i], "capture", captures);
      });
    },
    selectRow: function () {
      document
        .querySelector(`[data-id=${this.id}]`)
        .addEventListener("click", (event) => {
          if (event.target.tagName.toLowerCase() == "td") {
            if (event.target.parentElement.classList.contains("selected")) {
              event.target.parentElement.classList.remove("selected");
            } else {
              event.target.parentElement.parentElement
                .querySelectorAll(".selected")
                .forEach((item) => {
                  item.classList.remove("selected");
                  item.style = `background: transparent !important`;
                });
              event.target.parentElement.classList.add("selected");
            }

            let tockens = this.$store.getters.getTockens(this.idDash);

            Object.keys(tockens).forEach((i) => {
              if (tockens[i].elem == this.id && tockens[i].action == "click") {
                let row = [];
                let value = "";
                event.target.parentElement.childNodes.forEach((item) => {
                  row.push(item.textContent);
                });
                this.$refs[this.id].$el
                  .querySelector("thead tr")
                  .childNodes.forEach((item, j) => {
                    if (item.textContent == tockens[i].capture) {
                      value = row[j];
                    }
                  });

                this.$store.commit("setTocken", {
                  tocken: tockens[i],
                  idDash: this.idDash,
                  value: value,
                  store: this.$store,
                });
              }
            });

            let events = this.$store.getters.getEvents({
              idDash: this.idDash,
              event: "onclick",
              element: this.id,
              partelement: "row",
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
                  // this.$router.push(`/dashboards/${item.target.toLowerCase()}`);
                }
              });
            }
          }
        });
    }
  },
};
</script>

<style lang="scss" >
@import '../../sass/dashTable.sass'
</style>