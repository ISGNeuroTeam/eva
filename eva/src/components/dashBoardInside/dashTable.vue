<template>
  <div class="table-block" :data-change="change">
    <div class="v-data-table--container">
      <v-data-table
        class="dash-table report-table"
        v-show="!props.nodata"
        ref="table"
        v-model="props.input"
        :headers="props.titles"
        :items.sync="props.itemsForTable"
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
    </div>
    <div v-show="props.nodata" class="no-data-table">
      {{ props.message }}
    </div>
  </div>
</template>

<script>
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
      let events = this.$store.getters.getEvents({
        idDash: this.idDash,
        event: "OnDataCompare",
        element: this.id,
      });
      console.log(events)
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
              console.log(table)
              console.log(table.querySelectorAll("thead th"))
              table.querySelectorAll("thead th").style ="background-color: red";
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
                    console.log(itemRow);
                    if (i == column) {
                      console.log("eq", itemTd.innerText, eventObj[index]["row"])
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
                      }
                    }
                  });
                });

                if (table.querySelectorAll(".event").length > 0) {
                  if (item.prop[0] == "rowcolor") {
                    table.querySelectorAll(".event").forEach((res) => {
                      res.style.background = eventObj[index]["color"];
                      res.style.color = this.color.back;
                    });
                  } else if (item.prop[0] == "cellcolor") {
                    table.querySelectorAll(".event").forEach((res) => {
                      res.children[column].style.background =
                        eventObj[index]["color"];
                      res.children[column].style.color = this.color.back;
                    });
                  } else if (item.prop[0] == "columncolor") {
                    table.querySelectorAll("tbody tr").forEach((itemRow) => {
                      itemRow.children[column].style.background =
                        eventObj[index]["color"];
                      itemRow.children[column].style.color = this.color.back;
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
      console.log("test")
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
                  .childNodes.forEach((item, index) => {
                    if (item.textContent == tockens[i].capture) {
                      value = row[index];
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
