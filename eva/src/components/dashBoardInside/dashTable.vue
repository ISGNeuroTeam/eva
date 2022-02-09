<template>
  <div class="table-block" :data-change="change">
    <div class="v-data-table--container">
      <v-data-table
        v-show="!props.nodata"
        ref="table"
        v-model="props.input"
        class="dash-table report-table"
        :headers="props.titles"
        :items.sync="eventedTableData"
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
        <!-- search menu -->
        <template
          v-for="(value, title) in typedTitles"
          v-slot:[`header.${title}`]="{ header }"
        >
          <v-menu :key="`${title + value}`" offset-y>
            <template v-slot:activator>
              <v-menu z-index="100000" offset-y :close-on-content-click="false">
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    large
                    class="icon"
                    :color="theme.$main_border"
                    v-on="on"
                    >{{ mdiMagnify }}</v-icon
                  >
                </template>
                <v-row v-if="value !== 'string'">
                  <v-col cols="6">
                    <v-select
                      :items="compare"
                      label="Знак"
                      @change="setFilterData(title, $event, 'compare')"
                    ></v-select>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      label="значение"
                      @change="setFilterData(title, $event)"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row v-else>
                  <v-col cols="12">
                    <v-text-field
                      label="значение"
                      @change="
                        setFilterData(title, '=', 'compare');
                        setFilterData(title, $event);
                      "
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-menu>
            </template>
          </v-menu>
          <v-tooltip :key="header.value + value" bottom>
            <template v-slot:activator="{ on }">
              <span v-on="on">{{ header.text }}</span>
            </template>
          </v-tooltip>
        </template>
        <template v-for="(title) in props.titles" v-slot:item="{ item }">
          <tr
            :key="title + item.rowIndex"
            :style="item.rowColor && `background-color: ${item.rowColor}`"
          >
            <template v-for="(col, colIndex) in item">
              <td
                v-if="!excludeColumns.includes(colIndex)"
                :key="colIndex"
                class="text-start"
                :style="
                  (item.cellColor &&
                    item.cellColor[colIndex] &&
                    `background-color: ${item.cellColor[colIndex]}`) ||
                  (item.columnColor &&
                    item.columnColor[colIndex] &&
                    `background-color: ${item.columnColor[colIndex]}`)
                "
              >
                {{ col }}
              </td>
            </template>
          </tr>
        </template>
      </v-data-table>
    </div>
    <div v-show="props.nodata" class="no-data-table">
      {{ props.message }}
    </div>
  </div>
</template>

<script>
import {mdiMagnify} from '@mdi/js';

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
    colorFrom: null,
    options: Object,
  },
  data() {
    return {
      compare: ['>', '<', '='],
      mdiMagnify: mdiMagnify,
      eventRows: [],
      props: {
        titles: [],
        nodata: true,
        message: 'Нет данных для отображения',
        actions: [
          { name: 'click', capture: [] },
          { name: 'mouseover', capture: [] },
        ],
        selected: {},
        justCreate: true,
        hideFooter: false,
        itemsForTable: [],
      },
      numericTitles: [],
      typedTitles: {},
      filtersForTypedTitles: {},
      dataTitles: [],
      stringTitles: [],
      filters: {},
      excludeColumns: ['rowColor', 'columnColor', 'cellColor', 'rowIndex'],
    };
  },
  computed: {
    eventedTableData() {
      const items = [...this.filteredTableData].map((item, index) => ({
        ...item,
        rowIndex: index,
      }));
      this.eventRows.forEach((event) => {
        if (event.prop[0] === 'rowcolor') {
          items.forEach((item) => {
            if (this[event.compare](item[event.column], event.row)) {
              item.rowColor = event.value[0];
            }
          });
        }
        if (event.prop[0] === 'columncolor') {
          let isColumnMatch = items.reduce((acc, item) => {
            return acc || this[event.compare](item[event.column], event.row);
          }, false);
          if (isColumnMatch) {
            items.forEach((item) => {
              if (!item.columnColor) {
                item.columnColor = {};
              }
              item.columnColor[event.column] = event.value[0];
            });
          }
        }
        if (event.prop[0] === 'cellcolor') {
          items.forEach((item) => {
            if (this[event.compare](item[event.column], event.row)) {
              if (!item.cellColor) {
                item.cellColor = [];
              }
              item.cellColor[event.column] = event.value[0];
            }
          });
        }
      });
      return items;
    },
    filteredTableData() {
      let chooseSort = function (dataFormat, sortType, value) {
        if (dataFormat === 'date') {
          let sort;
          let parseDate = function (val) {
            let parts = val.split('.');
            return new Date(
              Number(parts[0]),
              Number(parts[1]) - 1,
              Number(parts[2])
            );
          };
          if (sortType === '>')
            sort = (el) => {
              let elDate = parseDate(el);
              let valueDate = parseDate(value);
              return valueDate < elDate;
            };
          else if (sortType === '<')
            sort = (el) => {
              let elDate = parseDate(el);
              let valueDate = parseDate(value);
              return valueDate > elDate;
            };
          else if (sortType === '=')
            sort = (el) => {
              let elDate = parseDate(el);
              let valueDate = parseDate(value);
              return valueDate.getTime() === elDate.getTime();
            };
          return sort;
        } else if (dataFormat === 'number') {
          let sort;
          if (sortType === '>')
            sort = (el) => {
              return +el > +value;
            };
          else if (sortType === '<')
            sort = (el) => {
              return +el < +value;
            };
          else if (sortType === '=')
            sort = (el) => {
              return +value === +el;
            };
          return sort;
        } else if (dataFormat === 'string') {
          let sort;
          if (sortType === '>')
            sort = (el) => {
              return el > value;
            };
          else if (sortType === '<')
            sort = (el) => {
              return el < value;
            };
          else if (sortType === '=')
            sort = (el) => {
              return value === el;
            };
          return sort;
        }
      };
      let temp = this.dataRestFrom;
      if (!temp) return;
      for (let [key, val] of Object.entries(this.filters)) {
        let sort;
        let type = this.getType(key);
        if (val.value && val.compare) {
          sort = chooseSort(type, val.compare, val.value);
          temp = temp.filter((el) => sort(el[key]));
        }
      }
      return temp;

    },
    events() {
      return this.$store.getters.getEvents({
        idDash: this.idDash,
        event: 'OnDataCompare',
        element: this.id,
      });
    },
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },
    change() {
      if (!this.dataRestFrom || this.dataRestFrom.length === 0) {
        this.setNoData()
      } else {
        this.getDataAsynchrony(this.dataRestFrom);
      }
      return true;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    height() {
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
       // 120 это размер блока с пагинацией таблицы + шапка с настройками самого блока
      return this.heightFrom - otstup;
    },
    lastResult() {
      let options = this.$store.getters.getOptions({
        idDash: this.idDash,
        id: this.id,
      });
      return options.lastResult;
    },
  },
  watch: {
    options: {
      deep: true,
      handler(newValue) {
        if (newValue) this.createTitles(newValue.titles);
      },
    },
    dataRestFrom: {
      deep: true,
      handler(val) {
        if (val && val.length) {
          this.indexTitles(val);
        }
        this.setEventColor();
      },
    },
    events() {
      this.setEventColor();
    },
  },
  mounted() {
    this.$store.commit('setActions', {
      actions: JSON.parse(JSON.stringify(this.props.actions)),
      idDash: this.idDash,
      id: this.id,
    });
    this.setEventColor();
  },
  methods: {
    setNoData() {
      this.props.itemsForTable = [];
      this.props.nodata = true;
    },
    indexTitles(oldVal) {
      let type = 'no';
      for (let [key, val] of Object.entries(oldVal[0])) {
        if (this.checkForDate(val)) type = 'date';
        else if (this.checkForNumeric(val)) type = 'number';
        else if (this.checkForString(val)) type = 'string';
        else type = 'none';
        this.typedTitles[key] = type;
        this.filtersForTypedTitles[key] = { action: '', value: '' };
      }
      this.typedTitles = { ...this.typedTitles };
      this.filtersForTypedTitles = { ...this.filtersForTypedTitles };
      //make filter objects

      //make title: type object
    },
    getType(title) {
      return this.typedTitles[title];
    },
    setFilterData(title, event, compare) {
      if (!this.filters[title]) this.filters[title] = {};
      if (compare === 'compare') {
        this.filters[title].compare = event;
      } else {
        this.filters[title].value = event;
      }
      this.filters = { ...this.filters };
    },
    checkForNumeric(val) {
      function isNumber(n) {
        return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
      }
      return isNumber(val);

    },
    checkForString(val) {
      return Object.prototype.toString.call(val) === '[object String]';
    },
    checkForDate(val) {
      if (typeof val != 'string') return false;
      let parts = val.split('.');
      if (parts.length < 3) return false;
      let result;
      let mydate = new Date(+parts[2], +parts[1] - 1, +parts[0]);
      if (
        +parts[2] === mydate.getYear() &&
        +parts[1] - 1 === mydate.getMonth() &&
        +parts[0] === mydate.getDate()
      ) {
        result = 0;
      } else {
        result = 1;
      }
      return result;
    },
    getDataAsynchrony(data) {
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
    createTitles(result) {
      if (this.options?.titles) {
        let allTitles = Object.keys(this.dataRestFrom[0]);
        this.props.titles = allTitles.map((x) => ({
          text: x,
          value: x,
          sortable: true,
          align:
            this.options.titles.length === 0 || this.options.titles.includes(x)
              ? undefined
              : ' d-none',
        }));
      } else {
        if (result && result.length) {
          this.props.titles = Object.keys(result[0]).map((item) => {
            if (!this.excludeColumns.includes(item)) {
              return { text: item, value: item, sortable: true };
            }
          });
        }
      }
    },
    createTockens(result) {
      let captures = Object.keys(result[0]);
      this.props.actions.forEach((item, i) => {
        this.$set(this.props.actions[i], 'capture', captures);
      });
      this.$store.commit('setActions', {
        actions: JSON.parse(JSON.stringify(this.props.actions)),
        idDash: this.idDash,
        id: this.id,
      });
    },
    equals(a, b) {
      return a === b;
    },
    over(a, b) {
      return +a > +b;
    },
    less(a, b) {
      return +a < +b;
    },
    in(a, b) {
      return b.includes(a);
    },
    between(a, b) {
      return b[0] < a || a < b[1];
    },
    setEventColor() {
      this.eventRows = this.$store.getters.getEvents({
        idDash: this.idDash,
        event: 'OnDataCompare',
        element: this.id,
      });
    },
    selectRow() {
      document
        .querySelector(`[data-id=${this.id}]`)
        .addEventListener('click', (event) => {
          if (event.target.tagName.toLowerCase() === 'td') {
            if (event.target.parentElement.classList.contains('selected')) {
              event.target.parentElement.classList.remove('selected');
            } else {
              event.target.parentElement.parentElement
                .querySelectorAll('.selected')
                .forEach((item) => {
                  item.classList.remove('selected');
                  // item.style = `background: transparent !important`;
                });
              event.target.parentElement.classList.add('selected');
            }

            let headers = Array.from(
              this.$refs.table.$el.querySelector('thead tr').childNodes
            ).map((item) => item.textContent);

            let cellRowIndex = Array.from(
              event.target.parentElement.childNodes
            ).findIndex((item) => item === event.target);

            let tokens = this.$store.getters.getTockens(this.idDash);

            tokens.forEach((token) => {
              if (
                token.elem === this.id &&
                token.action === 'click' &&
                headers[cellRowIndex] === token.capture
              ) {
                let value = event.target.textContent;
                this.$store.commit('setTocken', {
                  tocken: token,
                  idDash: this.idDash,
                  store: this.$store,
                  value,
                });
              }
            });

            let events = this.$store.getters.getEvents({
              idDash: this.idDash,
              event: 'onclick',
              element: this.id,
              partelement: 'row',
            });

            if (events.length !== 0) {
              events.forEach((item) => {
                if (item.action === 'set') {
                  this.$store.commit('letEventSet', {
                    events: events,
                    idDash: this.idDash,
                  });
                } else if (item.action === 'go') {
                  this.$store.commit('letEventGo', {
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
@import '../../sass/dashTable.sass';
</style>
