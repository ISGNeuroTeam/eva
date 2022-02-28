<template>
  <div
    class="table-block"
    :data-change="change"
  >
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
        :items-per-page="tablePerPage"
        :style="{ borderColor: theme.$secondary_border }"
        :page="tablePage"
        @update:items-per-page="onItemsPerPageChange"
        @update:page="onItemsPageChange"
      >
        <!-- search menu -->
        <template
          v-for="(value, title) in typedTitles"
          v-slot:[`header.${title}`]="{ header }"
        >
          <v-menu
            :key="`${header.value + value}menu`"
            z-index="100000"
            offset-y
            :close-on-content-click="false"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                large
                class="icon"
                :color="theme.$main_border"
                v-on="on"
              >
                {{ mdiMagnify }}
              </v-icon>
            </template>
            <v-row v-if="value !== 'string' && value !== 'none'">
              <v-col cols="6">
                <v-select
                  :items="compare"
                  label="Знак"
                  @change="setFilterData(title, $event, 'compare')"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  label="значение"
                  @change="setFilterData(title, $event)"
                />
              </v-col>
            </v-row>

            <v-row v-else-if="value === 'none'">
              <v-col cols="12">
                <v-select
                  label="Значение"
                  :items="compareForBoolean"
                  @change="
                    onChangeForBoolean(title, $event)
                  "
                />
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
                />
              </v-col>
            </v-row>
          </v-menu>
          <v-tooltip
            :key="`${header.value + value}tooltip`"
            bottom
          >
            <template v-slot:activator="{ on }">
              <span v-on="on">{{ header.text }}</span>
            </template>
          </v-tooltip>
        </template>
        <template
          v-for="(title) in props.titles"
          v-slot:item="{ item }"
        >
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
    <div
      v-show="props.nodata"
      class="no-data-table"
    >
      {{ props.message }}
    </div>
  </div>
</template>

<script>
import { mdiMagnify } from '@mdi/js';

export default {
  props: {
    tablePerPage: {
      type: Number,
      default: 100,
    },
    tablePage: {
      type: Number,
      default: 1,
    },
    dataRestFrom: null,
    // shouldGet: null,
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
      mdiMagnify,
      compareForBoolean: ['-', false, true],
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
          const isColumnMatch = items.reduce((acc, item) => acc || this[event.compare](item[event.column], event.row), false);
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
      let temp = this.dataRestFrom;
      if (!temp) return [];
      Object.keys(this.filters).forEach((key) => {
        let sort;
        const type = this.getType(key);
        if (this.filters[key].value && this.filters[key].compare) {
          sort = this.chooseSort(type, this.filters[key].compare, this.filters[key].value);
          temp = temp.filter((el) => sort(el[key]));
        }
      });

      return temp;
    },
    events() {
      return this.getEvents({
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
        this.setNoData();
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
      if (window.screen.width <= 1600) {
        otstup = 80;
      }
      if (window.screen.width <= 1400) {
        otstup = 70;
      }
      if (this.props.hideFooter) {
        otstup = 45;
      }
      if (this.dataReport) {
        otstup -= 30;
      }
      // 120 это размер блока с пагинацией таблицы + шапка с настройками самого блока
      return this.heightFrom - otstup;
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
    lastResult() {
      const options = this.$store.getters.getOptions({
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
    getEvents({ event, partelement }) {
      let result = [];
      console.log(this.$store.state[this.idDash]);
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
    chooseSort(dataFormat, sortType, value) {
      if (dataFormat === 'date') {
        let sort;

        if (sortType === '>') {
          sort = (el) => {
            const elDate = this.parseDate(el);
            const valueDate = this.parseDate(value);
            return valueDate < elDate;
          };
        } else if (sortType === '<') {
          sort = (el) => {
            const elDate = this.parseDate(el);
            const valueDate = this.parseDate(value);
            return valueDate > elDate;
          };
        } else if (sortType === '=') {
          sort = (el) => {
            const elDate = this.parseDate(el);
            const valueDate = this.parseDate(value);
            return valueDate.getTime() === elDate.getTime();
          };
        }
        return sort;
      }
      if (dataFormat === 'number') {
        let sort;
        if (sortType === '>') sort = (el) => +el > +value;
        else if (sortType === '<') sort = (el) => +el < +value;
        else if (sortType === '=') sort = (el) => +value === +el;
        return sort;
      }
      if (dataFormat === 'string') {
        let sort;
        if (sortType === '>') sort = (el) => el > value;
        else if (sortType === '<') sort = (el) => el < value;
        else if (sortType === '=') sort = (el) => value === el;
        return sort;
      }
      return false;
    },
    parseDate(val) {
      const parts = val.split('.');
      return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2]),
      );
    },
    onChangeForBoolean(title, event) {
      this.setFilterData(title, '=', 'compare');
      this.setFilterData(title, event);
    },
    onItemsPageChange(page) {
      this.$emit('update:table-page', page);
    },
    onItemsPerPageChange(perPage) {
      this.$emit('update:table-per-page', perPage);
    },
    setNoData() {
      this.props.itemsForTable = [];
      this.props.nodata = true;
    },
    indexTitles(oldVal) {
      let type = 'no';
      Object.keys(oldVal[0]).forEach((key) => {
        if (this.checkForDate(oldVal[0][key])) type = 'date';
        else if (this.checkForNumeric(oldVal[0][key])) type = 'number';
        else if (this.checkForString(oldVal[0][key])) type = 'string';
        else type = 'none';
        this.typedTitles[key] = type;
        this.filtersForTypedTitles[key] = { action: '', value: '' };
      });
      this.typedTitles = { ...this.typedTitles };
      this.filtersForTypedTitles = { ...this.filtersForTypedTitles };
      // make filter objects

      // make title: type object
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
      if (typeof val !== 'string') return false;
      const parts = val.split('.');
      if (parts.length < 3) return false;
      let result;
      const mydate = new Date(+parts[2], +parts[1] - 1, +parts[0]);
      if (
        +parts[2] === mydate.getYear()
        && +parts[1] - 1 === mydate.getMonth()
        && +parts[0] === mydate.getDate()
      ) {
        result = 0;
      } else {
        result = 1;
      }
      return result;
    },
    getDataAsynchrony(data) {
      const prom = new Promise((resolve) => {
        if (data.error) {
          this.props.message = data.error;
          this.props.nodata = true;
        } else {
          resolve(data);
        }
      });
      prom.then((promData) => {
        this.props.hideFooter = promData.length <= 100;
        this.createTitles(promData);
        this.createTockens(promData);
        if (this.props.justCreate) {
          this.selectRow();
          this.props.justCreate = false;
        }

        this.props.nodata = false;
        this.props.itemsForTable = promData;
      });
    },
    createTitles(result) {
      if (this.options?.titles) {
        const allTitles = Object.keys(this.dataRestFrom[0]);
        this.props.titles = allTitles.map((x) => ({
          text: x,
          value: x,
          sortable: true,
          align:
            this.options.titles.length === 0 || this.options.titles.includes(x)
              ? undefined
              : ' d-none',
        }));
      } else if (result && result.length) {
        this.props.titles = Object.keys(result[0]).reduce((titles, item) => {
          if (!this.excludeColumns.includes(item)) {
            return [
              ...titles,
              { text: item, value: item, sortable: true },
            ];
          }
          return titles;
        }, []);
      }
    },
    createTockens(result) {
      const captures = Object.keys(result[0]);
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
      if (!this.$store.state[this.idDash].events) {
        this.eventRows = [];
      } else {
        this.eventRows = this.$store.state[this.idDash].events.filter(
          (item) => item.event === 'OnDataCompare'
            && item.target === this.id,
        );
      }
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

            const headers = Array.from(
              this.$refs.table.$el.querySelector('thead tr').childNodes,
            ).map((item) => item.textContent);

            const cellRowIndex = Array.from(
              event.target.parentElement.childNodes,
            ).findIndex((item) => item === event.target);

            const tokens = this.$store.state[this.idDash].tockens;

            tokens.forEach((token) => {
              if (
                token.elem === this.id
                && token.action === 'click'
                && headers[cellRowIndex] === token.capture
              ) {
                const value = event.target.textContent;
                this.$store.commit('setTocken', {
                  tocken: token,
                  idDash: this.idDash,
                  store: this.$store,
                  value,
                });
              }
            });

            const events = this.getEvents({
              event: 'onclick',
              partelement: 'row',
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
