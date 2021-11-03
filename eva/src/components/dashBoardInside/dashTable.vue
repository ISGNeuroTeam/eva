<template>
  <div class="table-block" :data-change="change">
    <div class="v-data-table--container">
      <v-data-table
        class="dash-table report-table"
        v-show="!props.nodata"
        ref="table"
        v-model="props.input"
        :headers="props.titles"
        :items.sync="filteredTableData"
        :data-id="id"
        item-key="none"
        :hide-default-footer="props.hideFooter"
        :footer-props="{
          itemsPerPageOptions: [100, 500, 1000, -1],
        }"
        :height="height"
        fixed-header
        :style="{ borderColor: theme.$secondary_border }"
      >
        <template
          v-for="title in numericTitles"
          v-slot:[`header.${title}`]="{ header }"
        >
          <v-menu offset-y :key="title">
            <template  v-slot:activator="{ on, attrs }">
              <v-menu z-index="100000" offset-y :close-on-content-click="false">
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                    large
                    class="icon"
                    :color="theme.$main_border"
                    >{{ mdiMagnify }}</v-icon
                  >
                </template>
                <v-row>
                  <v-col cols="6">
                    <v-select
                      :items="compare"
                      label="Знак"
                      @change="filterData(title, $event, 'compare')"
                    ></v-select>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field label="значение" @change="filterData(title, $event)"></v-text-field>
                  </v-col>
                </v-row>
              </v-menu>
            </template>
            <v-list>
              <v-list-item v-for="(item, index) in items" :key="index">
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-tooltip bottom :key="header.value">
            <template v-slot:activator="{ on }">
              <span v-on="on">{{ header.text }}</span>
            </template>
          </v-tooltip>
        </template>
      </v-data-table>
    </div>
    <div v-show="props.nodata" class="no-data-table">
      {{ props.message }}
    </div>
  </div>
</template>

<script>
import { mdiMagnify } from "@mdi/js";
export default {
  props: {
    dataRestFrom: null,
    //shouldGet: null,
    idFrom: null,
    idDashFrom: null,
    heightFrom: null,
    dataReport: null,
    activeElemFrom: null,
    dataModeFrom: null,
    titles: Array,
    colorFrom: null,
  },
  data() {
    return {
      compare: ['>', '<', '='],
      mdiMagnify: mdiMagnify,
      eventRows: [],
      props: {
        titles: [],
        nodata: true,
        message: "Нет данных для отображения",
        actions: [
          { name: "click", capture: [] },
          { name: "mouseover", capture: [] },
        ],
        selected: {},
        justCreate: true,
        hideFooter: false,
        itemsForTable: [],
      },
      numericTitles: [],
      filters: {},
    };
  },
  computed: {
    filteredTableData() {
      let temp = this.props.itemsForTable
      console.log(temp)
      for (let [key, val] of Object.entries(this.filters)) {
        console.log(key, val);
        if (val.compare === '>')
          temp = temp.filter(x => x[key] > +val.value)
        if (val.compare === '<')
          temp = temp.filter(x => x[key] < +val.value)
        if (val.compare === '=')
          temp = temp.filter(x => x[key] == +val.value)
      }
      return temp
    },
    events() {
      let events = this.$store.getters.getEvents({
        idDash: this.idDash,
        event: "OnDataCompare",
        element: this.id,
      });
      return events;
    },
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
    theme: function () {
      return this.$store.getters.getTheme;
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
      if (newValue) this.createTitles(newValue);
    },
    dataRestFrom: {
      deep: true,
      handler(oldVal) {
        console.log(JSON.parse(JSON.stringify(oldVal)));
        this.checkForNumeric(oldVal[0]);
        this.setEventColor();
      },
    },
    events() {
      this.setEventColor();
    },
  },
  mounted() {
    this.$store.commit("setActions", {
      actions: JSON.parse(JSON.stringify(this.props.actions)),
      idDash: this.idDash,
      id: this.id,
    });
    this.setEventColor();
  },
  methods: {
    filterData(title, event, compare) {
      if (!this.filters[title])
        this.filters[title] = {}
      if (compare === "compare") {
        this.filters[title].compare = event
      }
      else {
        this.filters[title].value = event
      }
      this.filters = {...this.filters}
    },
    checkForNumeric(val) {
      function isNumber(n) {
        return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
      }
      for (let [key, val] of Object.entries(val)) {
        console.log(key, val, typeof val);
        if (isNumber(val)) {
          this.numericTitles.push(key);
        }
      }
    },
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
          } else {
            temp.push({ text: x, value: x, sortable: true, align: " d-none" });
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
      this.$store.commit("setActions", {
        actions: JSON.parse(JSON.stringify(this.props.actions)),
        idDash: this.idDash,
        id: this.id,
      });
    },
    setEventColor: function () {
      if (this.eventRows.length > 0) {
        for (let x of this.eventRows) {
          x.style.background = "";
          x.classList.remove("event");
        }
      }
      this.eventRows = [];
      let events = this.$store.getters.getEvents({
        idDash: this.idDash,
        event: "OnDataCompare",
        element: this.id,
      });
      let table, column;
      let eventObj = {};
      events.forEach((item, index) => {
        eventObj[index] = {};
        eventObj[index]["compare"] = item.compare;
        eventObj[index]["column"] = item.column;
        eventObj[index]["row"] = item.row;
        eventObj[index]["color"] = item.value[0];
        eventObj[index]["prop"] = item.prop[0];
        table = this.$refs.table.$el;

        if (
          eventObj[index]["prop"] == "rowcolor" ||
          eventObj[index]["prop"] == "columncolor" ||
          eventObj[index]["prop"] == "cellcolor"
        ) {
          let readyTh = setTimeout(
            function tick() {
              table.querySelectorAll("thead th").style =
                "background-color: red";
              if (table.querySelectorAll("thead th").length != 0) {
                clearTimeout(readyTh);
                let sp = 0;
                table.querySelectorAll("thead span").forEach((itemSpan) => {
                  if (itemSpan.innerText != 0) {
                    if (itemSpan.innerText == eventObj[index]["column"]) {
                      column = sp;
                    }
                    sp++;
                  }
                });

                table.querySelectorAll("tbody tr").forEach((itemRow) => {
                  itemRow.querySelectorAll("td").forEach((itemTd, i) => {
                    if (i == column) {
                      // itemRow.style.backgroundColor = 'yellow';
                      let needItem = null,
                        row,
                        k = -1;

                      switch (eventObj[index]["compare"]) {
                        case "equals":
                          if (itemTd.innerText == eventObj[index]["row"]) {
                            needItem = itemRow;
                          }

                          break;
                        case "over":
                          if (itemTd.innerText > eventObj[index]["row"]) {
                            needItem = itemRow;
                          }
                          break;
                        case "less":
                          if (itemTd.innerText < eventObj[index]["row"]) {
                            needItem = itemRow;
                          }
                          break;
                        case "in":
                          row = eventObj[index]["row"]
                            .replace(/\[|\]/g, "")
                            .split(",");
                          k = -1;
                          row.forEach((rowValue) => {
                            if (itemTd.innerText == rowValue) {
                              k = 0;
                            }
                          });
                          if (k != -1) {
                            needItem = itemRow;
                          }
                          break;
                        case "between":
                          row = eventObj[index]["row"]
                            .replace(/\[|\]/g, "")
                            .split(",");
                          if (
                            itemTd.innerText > row[0] &&
                            itemTd.innerText < row[1]
                          ) {
                            needItem = itemRow;
                          }
                          break;
                      }
                      if (needItem != null) {
                        needItem.classList.add("event");
                        this.eventRows.push(needItem);
                      }
                    }
                  });
                });

                if (table.querySelectorAll(".event").length > 0) {
                  if (item.prop[0] == "rowcolor") {
                    let rows = table.querySelectorAll(".event");
                    rows.forEach((res) => {
                      res.style.background = eventObj[index]["color"];
                      //res.style.color = this.color.back;
                    });
                  } else if (item.prop[0] == "cellcolor") {
                    table.querySelectorAll(".event").forEach((res) => {
                      res.children[column].style.background =
                        eventObj[index]["color"];
                      //res.children[column].style.color = this.color.back;
                    });
                  } else if (item.prop[0] == "columncolor") {
                    table.querySelectorAll("tbody tr").forEach((itemRow) => {
                      itemRow.children[column].style.background =
                        eventObj[index]["color"];
                      //itemRow.children[column].style.color = this.color.back;
                    });
                  }
                }
              } else {
                readyTh = setTimeout(tick, 100);
              }
            }.bind(this),
            0
          );
        }
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
                  // item.style = `background: transparent !important`;
                });
              event.target.parentElement.classList.add("selected");
            }

            let headers = Array.from(
              this.$refs.table.$el.querySelector("thead tr").childNodes
            ).map((item) => item.textContent);

            let cellRowIndex = Array.from(
              event.target.parentElement.childNodes
            ).findIndex((item) => item == event.target);

            let tokens = this.$store.getters.getTockens(this.idDash);

            tokens.forEach((token) => {
              if (
                token.elem == this.id &&
                token.action == "click" &&
                headers[cellRowIndex] === token.capture
              ) {
                let value = event.target.textContent;
                this.$store.commit("setTocken", {
                  tocken: token,
                  idDash: this.idDash,
                  store: this.$store,
                  value,
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
                }
              });
            }
          }
        });
    },
  },
};
</script>

<style lang="scss">
@import "../../sass/dashTable.sass";
</style>
