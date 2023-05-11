<template>
  <div
    :id="idFrom"
    class="dash-table-v2-container"
    style="height: calc(100% - 28px)"
  >
    <div
      v-if="title"
      class="title"
      v-text="title"
    />
    <dash-tableV2-control
      v-if="activeButtons.length > 0"
      :write-status="writeStatus"
      :active-buttons="activeButtons"
      @action="execute"
    />
    <div :style="`height: ${tableHeight}`">
      <div
        ref="table"
        class="editable-table"
      />
    </div>
  </div>
</template>

<script>
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import {
  mdiFilter,
} from '@mdi/js';
import Vue from 'vue';
import { throttle } from '@/js/utils/throttle';
import DashTableV2Filter from './dashTableV2Filter.vue';

const colorFixed = function (cell, formatterParams, onRendered) {
  cell.getElement().style.backgroundColor = this.sanitizeHTML(cell.getValue());

  return '&nbsp;';
};

export default {
  name: 'DashTableV2',
  props: {
    title: {
      type: String,
      default: '',
    },
    dataRestFrom: {
      type: Array,
      default: () => ([]),
    },
    // columns: {
    //   type: Array,
    //   default: () => ([])
    // },
    idFrom: {
      type: String,
      required: true,
    },
    idDashFrom: {
      type: String,
      required: true,
    },
    searchSchema: {
      type: Object,
      default: () => ({}),
    },
    // columnOptions: {
    //   type: Object,
    //   default: () => ({}),
    // },
    writeStatus: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      mdiFilter,
      tabulator: null, // variable to hold your table
      tableData: [],
      isLoadFromFile: false,
      activeButtons: [],
      headerFilters: {},
      test: false,
      // TODO: Перенести в настройки через библиотеку примитивов
      options: {
        frozenRows: 1,
        fixedColumns: ['_time'],
        selectable: false,
        selectColumn: false,
        rowHeight: 40,
        paginationSizeSelector: [100, 500, 1000, true],
        paginationCounter: 'rows',
        movableColumns: true,
      },
      columnOptions: {
        _time: {
          frozen: true,
          headerMenu: false,
          headerFilter: true,
        },
        a: {
          frozen: true,
          headerMenu: false,
          headerFilter: true,
        },
        b: {
          frozen: true,
          headerMenu: false,
          headerFilter: true,
        },
        field_a: {
          frozen: true,
          headerMenu: false,
          headerFilter: true,
        },
        field_b: {
          frozen: false,
          headerMenu: false,
          headerFilter: true,
        },
      },
      actions: [
        { name: 'click', capture: [] },
        { name: 'mouseover', capture: [] },
      ],
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    dashFromStore() {
      return this.$store.state[this.idDashFrom][this.idFrom];
    },
    tableHeight() {
      let offset = this.activeButtons?.length > 0 ? 38 : 0;
      offset += this.title ? 33 : 0;
      return `calc(100% - ${offset}px)`;
    },
    columns() {
      const defaultColumns = this.options.selectColumn ? [
        {
          title: 'Выделение',
          formatter: 'rowSelection',
          titleFormatter: 'rowSelection',
          width: 50,
          hozAlign: 'center',
          headerHozAlign: 'center',
          headerSort: false,
          cellClick(e, cell) {
            cell.getRow().toggleSelect();
          },
        },
      ] : [];

      if (this.columnOptions && !!Object.keys(this.columnOptions).length) {
        return Object.keys(this.searchSchema).reduce((acc, key) => {
          if (key === '_columnOptions') {
            return acc;
          }
          const options = this.columnOptions[key];
          const column = {
            field: key,
            title: options?.title || key,
            frozen: options?.frozen || false,
            headerFilter: options?.headerFilter ? this.headerFilter : false,
            editor: options?.editor || false,
            headerMenu: options?.headerMenu ? this.headerMenu : false,
            cellClick: this.cellClickEvent,
          };
          if (options?.formatter) {
            if (options?.formatter === 'color') {
              column.formatter = colorFixed;
            } else {
              column.formatter = options?.formatter;
            }
          }
          if (options?.formatter === 'tickCross') {
            column.headerFilterParams = { tristate: true };
            column.headerFilterEmptyCheck = function (value) {
              return value === null;
            };
          }
          if (options?.editor === 'list' && options?.editorParams) {
            column.editorParams = options.editorParams;
            column.headerFilter = 'input';
          }
          return [
            ...acc,
            column,
          ];
        }, defaultColumns);
      }

      return Object.keys(this.searchSchema).reduce((acc, key) => {
        const column = {
          field: key,
          title: key,
          // editor: this.searchSchema[key] === 'BOOLEAN' ? 'tickCross' : true,
          editor: false,
          headerMenu: this.headerMenu,
          cellClick: this.cellClickEvent,
        };

        if (this.searchSchema[key] === 'BOOLEAN') {
          column.formatter = 'tickCross';
          column.headerFilterParams = { tristate: true };
          column.headerFilterEmptyCheck = function (value) { return value === null; };
        }
        return [
          ...acc,
          column,
        ];
      }, defaultColumns);
    },
    events() {
      return this.getEvents({
        idDash: this.idDashFrom,
        event: 'OnDataCompare',
        element: this.idFrom,
      });
    },
    getTokens() {
      return this.$store.state[this.idDashFrom].tockens
        .filter((el) => el.elem === this.idFrom) || [];
    },
  },
  watch: {
    searchSchema: {
      handler(val) {
        this.createHeaderFilters();
        this.setAction(val);
      },
      deep: true,
    },
    dataRestFrom: {
      handler(val, oldVal) {
        if (val?.length > 0 && this.searchSchema) {
          if (JSON.stringify(val) !== JSON.stringify(oldVal)) {
            this.$nextTick(() => {
              this.createTable();
            });
          }
          this.updateDataInTable(val);
          this.onDataCompare();
        }
      },
      deep: true,
    },
    columnOptions: {
      handler() {
        this.updateColumnDefinition();
      },
      deep: true,
    },
  },
  mounted() {
    if (this.dataRestFrom?.length > 0) {
      this.$nextTick(() => {
        this.setAction(this.searchSchema);
        this.redrawTable();
        this.createHeaderFilters();
      });
    }
  },
  created() {
    this.createTable = throttle(this.createTable, 500);
    this.setFilter = throttle(this.setFilter, 50);
  },
  methods: {
    headerFilter(cell) {
      const field = cell.getField();
      const container = document.createElement('span');
      container.classList.add('dash-table-v2-container__filter-container');
      // create and style inputs
      const select = document.createElement('select');
      select.classList.add('dash-table-v2-container__filter-select');
      ['', '>', '<', '=', '>=', '<=', '!='].forEach((item) => {
        const option = document.createElement('option');
        option.classList.add('dash-table-v2-container__filter-select-option');
        option.setAttribute('value', item);
        option.innerHTML = item;
        select.appendChild(option);
      });
      select.setAttribute('placeholder', 'Знак');
      select.style.padding = '4px';
      select.style.boxSizing = 'border-box';

      const textInput = document.createElement('input');
      textInput.setAttribute('type', 'text');
      textInput.classList.add('dash-table-v2-container__filter-input');
      textInput.setAttribute('placeholder', 'Значение');

      let selectValue = select.value;
      let textValue = '';

      select.addEventListener('change', (e) => {
        if (e.target.value !== '') {
          selectValue = e.target.value;
          this.setFilter(field, selectValue, textValue);
        } else {
          textInput.value = '';
          this.tabulator.clearFilter();
        }
      });
      select.addEventListener('blur', (e) => {
        if (e.target.value !== '') {
          selectValue = e.target.value;
          this.setFilter(field, selectValue, textValue);
        } else {
          textInput.value = '';
          this.tabulator.clearFilter();
        }
      });

      textInput.addEventListener('change', (e) => {
        if (selectValue && e.target.value) {
          textValue = e.target.value;
          this.setFilter(field, selectValue, e.target.value);
        }
      });
      textInput.addEventListener('keyup', (e) => {
        if (selectValue && e.target.value) {
          textValue = e.target.value;
          this.setFilter(field, selectValue, e.target.value);
        }
      });

      container.appendChild(select);
      container.appendChild(textInput);

      return container;
    },
    getPosition(el, offset = 0) {
      let xPosition = 0;
      let yPosition = 0;

      while (el) {
        if (el.tagName === 'BODY') {
          // deal with browser quirks with body/window/document and page scroll
          const xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
          const yScrollPos = el.scrollTop || document.documentElement.scrollTop;

          xPosition += (el.offsetLeft - xScrollPos + el.clientLeft);
          yPosition += (el.offsetTop - yScrollPos + el.clientTop);
        } else {
          xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
          yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
        }

        el = el.offsetParent;
      }
      return {
        x: xPosition,
        y: yPosition - offset,
      };
    },
    closePopup() {
      document.addEventListener('click', () => {
        const result = structuredClone(this.headerFilters);
        Object.keys(result).forEach((key) => {
          result[key].isOpen = false;
        });
        this.headerFilters = result;
      });
    },
    createHeaderFilters() {
      const result = {};
      Object.keys(this.searchSchema).forEach((key) => {
        result[key] = {
          isOpen: false,
        };
      });
      this.headerFilters = result;
    },
    rowFormatter(row) {
      this.events.forEach((event) => {
        const type = event.prop[0];
        const color = event.value[0];
        const {
          compare,
          column: targetField,
          row: compareField,
        } = event;
        row.getCells().forEach((cell, index, arr) => {
          const cellField = cell.getColumn().getField();
          if (cellField === targetField) {
            const cellValue = cell.getValue();
            const secondCell = arr.find((el) => el.getColumn().getField() === compareField);
            const secondCellValue = secondCell ? secondCell.getValue() : compareField;
            if (compare === 'equals' && `${cellValue}` === `${secondCellValue}`) {
              this.changeColorElement({ cell, row }, type, color);
            } else if (compare === 'over' && cellValue > secondCellValue) {
              this.changeColorElement({ cell, row }, type, color);
            } else if (compare === 'less' && cellValue < secondCellValue) {
              this.changeColorElement({ cell, row }, type, color);
            }
          }
        });
      });
      return '';
    },
    changeColorElement({ cell, row }, type, color) {
      if (type === 'cellcolor') {
        this.changeCellColor(cell, color);
      } else if (type === 'rowcolor') {
        this.changeRowColor(row, color);
      } else if (type === 'colcolor') {
        this.changeColumnColor(cell.getColumn(), color);
      }
    },
    changeColumnColor(column, color) {
      column.getCells().forEach((el) => {
        el.getElement().style.backgroundColor = color;
      });
    },
    changeRowColor(row, color) {
      row.getElement().classList.add('on-data-compare-color');
      row.getElement().style.backgroundColor = color;
    },
    changeCellColor(cell, color) {
      cell.getElement().style.backgroundColor = color;
    },
    updateDataInTable(data) {
      this.tableData = structuredClone(data);
      this.isLoadFromFile = false;
      if (this.tabulator) {
        // const newColumns =
        // this.tabulator.setColumns(this.columns);
        setTimeout(() => {
          // this.tabulator.updateColumnDefinition(this.columns);
          this.tabulator.setData(this.dataRestFrom);
        }, 100);
      }
    },
    redrawTable() {
      this.createTable();
      this.updateDataInTable(this.dataRestFrom);
    },
    async updateColumnDefinition() {
      if (this.tabulator && Object.keys(this.dataRestFrom).length > 0) {
        const tabulatorColumns = this.tabulator.getColumns();
        const columnDefinition = this.columns.reduce((acc, col) => {
          if (!col.field) {
            return [
              ...acc,
              col,
            ];
          }
          // eslint-disable-next-line no-underscore-dangle
          const tCol = tabulatorColumns.find((item) => item?._column.field === col.field);
          return [
            ...acc,
            {
              ...col,
              // eslint-disable-next-line no-underscore-dangle
              width: tCol._column.width,
            },
          ];
        }, []);

        this.tabulator.setColumns(columnDefinition);
      }
    },
    createTable() {
      if (this.tabulator) {
        this.tabulator.destroy();
        this.tabulator = null;
      }
      this.tabulator = new Tabulator(this.$refs.table, {
        addRowPos: 'top',
        placeholder: 'No Data Available', // display message to user on empty table
        popupContainer: `#${this.idFrom}`,
        maxHeight: '100%',
        height: '100%',
        layout: 'fitDataFill',
        // frozenRows: 2,
        rowHeight: 48,
        selectable: 1,
        rowFormatter: this.rowFormatter,
        persistence: {
          columns: ['width', 'visible'],
        },
        persistenceID: this.idFrom,
        data: this.tableData, // link data to table
        reactiveData: true, // enable data reactivity

        // define table columns
        autoColumns: this.isLoadFromFile,

        // autoColumnsDefinitions: (definitions) => {
        //   definitions.forEach((column) => {
        //     column.headerFilter = true; // add header filter to every column
        //     column.editor = 'input';
        //     column.headerMenu = this.headerMenu;
        //   });
        //
        //   // eslint-disable-next-line max-len
        //   // definitions.push({ title: 'Выделение', formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerHozAlign:"center", headerSort:false, cellClick:function(e, cell){
        //   //     cell.getRow().toggleSelect();
        //   //   }},)
        //   return definitions;
        // },

        columns: this.columns,

        pagination: 'local',
        paginationSize: true,
        paginationSizeSelector: [100, 500, 1000, true],
        paginationCounter: 'rows',
        movableColumns: true,

        // history
        history: true,
        persistenceWriterFunc: this.persistenceWriterFunc,
        persistenceReaderFunc: this.persistenceReaderFunc,
      });
    },
    headerMenu() {
      const menu = [];
      const columns = this.tabulator.getColumns();

      // eslint-disable-next-line no-restricted-syntax
      for (const column of columns) {
        // create checkbox element using font awesome icons
        const icon = document.createElement('span');
        icon.classList.add('FontIcon');
        icon.classList.add(column.isVisible() ? 'name_check' : 'name_closeBig');

        // build label
        const label = document.createElement('span');
        const title = document.createElement('span');

        title.textContent = ` ${column.getDefinition().title}`;

        label.appendChild(icon);
        label.appendChild(title);

        // create menu item
        menu.push({
          label,
          action(e) {
            // prevent menu closing
            e.stopPropagation();

            const visibleColumns = columns.filter((item) => item.isVisible()).length;

            if (visibleColumns > 1) {
              // toggle current column visibility
              column.toggle();
            } else if (visibleColumns === 1 && !column.isVisible()) {
              column.toggle();
            }

            // change menu item icon
            if (column.isVisible()) {
              icon.classList.remove('name_closeBig');
              icon.classList.add('name_check');
            } else {
              icon.classList.remove('name_check');
              icon.classList.add('name_closeBig');
            }
          },
        });
      }

      return menu;
    },
    cellClickEvent(e, { _cell: cell }) {
      // For token\click-event
      const allCellInRow = cell.row.cells
        .map((el) => ({ field: el.column.field, value: el.value }))
        .reduce((acc, cur) => {
          acc[cur.field] = cur.value;
          return acc;
        }, {});
      const data = {
        clickedCell: cell.value,
        allCellInRow,
      };
      this.setToken('click', data);
      // For edit
      // if (e instanceof FocusEvent) {
      //   const column = cell.column.field;
      //   const { value } = cell;
      //   const row = cell.row.position;
      //
      //   this.$emit('cellClick', { row, column, value });
      // }
    },
    writeData() {
      this.tableData = this.tabulator.getData();
      this.$root.writeData({ data: structuredClone(this.tableData), schema: this.searchSchema });
    },
    // undo button
    undo() {
      this.tabulator.undo();
    },
    // redo button
    redo() {
      this.tabulator.redo();
    },
    addDataRow() {
      const newRow = Object.keys(this.searchSchema).reduce((acc, item) => {
        const defaultValue = this.searchSchema[item] === 'BOOLEAN'
          ? false
          : '';
        return {
          ...acc,
          [item]: defaultValue,
        };
      }, {});
      this.tabulator.addRow(newRow);

      this.tableData = this.tabulator.getData();
    },
    removeDataRow() {
      this.tabulator.getSelectedRows().forEach((row) => {
        row.delete();
      });

      this.tableData = this.tabulator.getData();
    },
    // trigger download of data.csv file
    downloadCSV() {
      this.tabulator.download('csv', 'data.csv');
    },
    // trigger download of data.json file
    downloadJSON() {
      this.tabulator.download('json', 'data.json');
    },
    // trigger download of data.xlsx file
    downloadXLSX() {
      this.tabulator.download('xlsx', 'data.xlsx', { sheetName: 'My Data' }, { compress: false });
    },
    // trigger download of data.pdf file
    downloadPDF() {
      this.tabulator.download('pdf', 'data.pdf', {
        orientation: 'portrait', // set page orientation to portrait
      });
    },
    // trigger download of data.html file
    downloadHTML() {
      this.tabulator.download('html', 'data.html', { style: true });
    },
    loadCSV() {
      this.tabulator.importFormat = 'csv';
      this.isLoadFromFile = true;
      this.tabulator.import('csv', '.csv')
        .then(() => {
          this.tableData = this.tabulator.getData();
          this.createTable();
          delete this.tabulator.importFormat;
          this.isLoadFromFile = false;
        })
        .catch(() => {
          this.tableData = [];
        });
    },
    loadJSON() {
      this.tabulator.import('json', '.json')
        .then(() => {
          this.isLoadFromFile = true;
          this.tableData = this.tabulator.getData();
          this.createTable();
        })
        .catch(() => {
          this.tableData = [];
        });
    },
    execute(action) {
      this[action]();
    },
    getDataFromTable() {
      return this.tabulator.getData();
    },
    destroyTable() {
      if (this.tabulator) {
        this.tabulator.destroy();
      }
    },
    persistenceWriterFunc(id, type, data) {
      if (data?.length > 0 && this.dataRestFrom?.length > 0) {
        // console.log('persistenceWriterFunc', data);
        // console.log('persistenceWriterFunc store', this.dashFromStore.tableOptions[`${id}-${type}`]);
        if (!this.dashFromStore?.tableOptions) {
          this.$store.commit('setState', [{
            object: this.dashFromStore,
            prop: 'tableOptions',
            value: {},
          }]);
        }
        if (!this.dashFromStore.tableOptions[`${id}-${type}`]) {
          this.$store.commit('setState', [{
            object: this.dashFromStore.tableOptions,
            prop: `${id}-${type}`,
            value: [],
          }]);
        }
        this.$store.commit('setState', [{
          object: this.dashFromStore.tableOptions,
          prop: `${id}-${type}`,
          value: structuredClone(data),
        }]);
      }
    },
    persistenceReaderFunc(id, type) {
      // console.log('persistenceReaderFunc', this.dashFromStore?.tableOptions);
      if (this.dashFromStore?.tableOptions && this.dashFromStore.tableOptions[`${id}-${type}`]
          && this.dashFromStore.tableOptions[`${id}-${type}`].length > 0) {
        return structuredClone(this.dashFromStore.tableOptions[`${id}-${type}`]);
      }
      return false;
    },
    getEvents({ event, partelement }) {
      let result = [];
      if (!this.$store.state[this.idDashFrom].events) {
        this.$store.commit('setState', [{
          object: this.$store.state[this.idDashFrom],
          prop: 'events',
          value: [],
        }]);
        return [];
      }
      if (partelement) {
        result = this.$store.state[this.idDashFrom].events.filter((item) => (
          item.event === event
            && item.element === this.idFrom
            && item.partelement === partelement
        ));
      } else {
        result = this.$store.state[this.idDashFrom].events.filter(
          (item) => item.event === event
                && item.target === this.idFrom,
        );
      }
      return result;
    },
    setToken(event, data) {
      const targetTokens = this.getTokens.filter((el) => el.action === event);
      targetTokens.forEach((token) => {
        if (token.capture) {
          this.$store.commit('setTocken', {
            token,
            idDash: this.idDashFrom,
            store: this.$store,
            value: `${data.allCellInRow[token.capture]}`,
          });
        } else {
          this.$store.commit('setTocken', {
            token,
            idDash: this.idDashFrom,
            store: this.$store,
            value: `${data.clickedCell}`,
          });
        }
      });
    },
    setAction(data) {
      this.actions.forEach((action) => {
        action.capture = Object.keys(data);
      });
      this.$store.commit('setActions', {
        actions: structuredClone(this.actions),
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
    },
    onDataCompare() {
      const compareEval = {
        equals: '=',
        over: '>',
        less: '<',
      };
      if (this.tabulator) {
        const rows = this.tabulator.rowManager.getRows();
        if (rows) {
          rows.forEach((row) => {
            if (row.getCells()) {
              let eventType;
              let targetCell;
              let firstValue;
              let secondValue;
              let color;
              let compare;
              let cellElement;
              row.getCells().forEach((cell) => {
                this.events.forEach((event) => {
                  console.log(event);
                  if (event.prop[0] === 'cellcolor') {
                    [eventType] = event.prop;
                    compare = compareEval[event.compare];
                    [color] = event.value;
                    if (event.column === cell.column.getField()) {
                      targetCell = cell.element;
                      cellElement = cell;
                      firstValue = cell.getValue();
                    }
                    if (this.searchSchema[event.row]) {
                      if (event.row === cell.column.getField()) {
                        secondValue = cell.getValue();
                      }
                    } else {
                      secondValue = event.row;
                    }
                    // console.group();
                    // console.log('event', event);
                    // console.log('compare', compare);
                    // console.log('cell', cell);
                    // console.log('cell_name', cell.column.getField());
                    // console.log('cell_value', cell.getValue());
                    // console.log('cell_element', cell.getElement());
                    // console.groupEnd();
                  }
                });
              });
              if (eventType && eventType === 'cellcolor') {
                console.log('targetCell', targetCell);
                const comparisonResult = this.getComparisonResult(compare, {
                  val: firstValue,
                  secondVal: secondValue,
                });
                if (comparisonResult && color) {
                  targetCell.style.backgroundColor = color;
                  cellElement.element = targetCell;
                  // console.log([...document
                  //   .getElementById(this.idFrom)
                  //   .querySelectorAll('[tabulator-field=a]')]
                  //   .filter((el) => el.classList.contains('tabulator-cell')
                  //   && el.innerHTML === '1'));
                }
              }
            }
          });
        }
      }
    },
    getComparisonResult(compare, { val, secondVal }) {
      switch (compare) {
        case '>':
          return val > secondVal;
        case '<':
          return val < secondVal;
        case '=':
          return val === secondVal;
        default:
          return false;
      }
    },
    emptyHeaderFilter() {
      return document.createElement('div');
    },
    setFilter(field, selectValue, textValue) {
      this.tabulator.setFilter(field, selectValue, textValue);
    },
  },
};
</script>

<style lang="scss">
@import "../../../scss/tabulator.scss";

.dash-table-v2-container {
  padding: 10px;

  .title {

    color: var(--main_text);
    font-size: 18px;
    font-weight: 700;
    line-height: 25px;
    padding-bottom: 8px;
  }
  &__filter-container {
    display: grid;
    grid-template-columns: 25% 75%;
    gap: 5px;
    padding: 0 8px 0 0;
  }
  &__filter-select {
    border: 1px solid var(--main_border);
    border-radius: 4px;
    color: var(--main_text);
    outline: none;
    text-align: center;
    cursor: pointer;
  }
  &__filter-select-option {
    background-color: var(--main_bg);
    color: var(--main_text);
    outline: none;
    border-left: 2px solid var(--main_border);
    border-right: 2px solid var(--main_border);
    cursor: pointer;
    &:first-child {
      border-top: 2px solid var(--main_border);
    }
    &:last-child {
      border-bottom: 2px solid var(--main_border);
    }
  }
  &__filter-input {
    border: 1px solid var(--main_border);
    border-radius: 4px;
    color: var(--main_text);
    outline: none;
  }
}

/*Theme the Tabulator element*/
.editable-table {
  *::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  background-color: var(--main_bg)!important;
  border: none;
  border-radius: 4px;

  /*Theme the header*/
  .tabulator-header {
    background: var(--main_bg)!important;
    color: var(--main_text)!important;
    border-color: var(--main_border) !important;

    /*Allow column header names to wrap lines*/
    .tabulator-col,
    .tabulator-col-row-handle {
      background: var(--main_bg)!important;
      white-space: normal;
    }
    .tabulator-col {
      border-color: var(--main_border) !important;
    }

    .tabulator-header-filter input {
      background-color: var(--main_bg);
      border: 1px solid var(--main_border);
      border-radius: 4.44px;
      padding: 6px 6px;
      font-size: 13px;
      line-height: 1.23;
      color: var(--main_text);
      transition: border-color 0.3s, background-color 0.3s;
    }
  }

  .tabulator-row{
    color: var(--main_text)!important;
    background-color: var(--main_bg);
    transition: background-color .3s, color .3s;
    border-bottom: 1px solid var(--main_border);
    &.on-data-compare-color {
      background-color: transparent;
    }

    /*Color even rows*/
    &:nth-child(even) {
      background-color: var(--main_bg)!important;
      &.on-data-compare-color {
        background-color: transparent;
      }
    }
    .tabulator-cell {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    &.tabulator-selectable {
      &:hover {
        background-color: var(--main_text) !important;
        cursor: pointer;
        color: var(--main_bg) !important;
      }
      &.tabulator-selected {
        background-color: var(--main_text) !important;
        cursor: pointer;
        color: var(--main_bg) !important;
      }
    }
  }
  /*Color the table rows*/
  .tabulator-cell {
    border-color: var(--main_border) !important;
  }
  .tabulator-footer {
    background: var(--main_bg)!important;
    border-top: 1px solid var(--main_border)!important;
    color: var(--main_text)!important;

    .tabulator-paginator {
      color: var(--main_text)!important;
    }

    .tabulator-page-size {
      background-color: var(--main_bg);
      border: 1px solid var(--main_border);
      border-radius: 4.44px;
      //padding: 5px 25px 5px 12px;
      color: var(--main_text);
      transition: border-color 0.3s, background-color 0.3s;
      font-size: 13px;
      line-height: 1.218;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;

      .option {
        cursor: pointer;
        background-color: var(--main_bg);
        border-top: 1px solid var(--main_border);
        color: var(--secondary_text);
      }
    }

    .tabulator-page-size:focus-visible {
      outline: none;
    }

    .tabulator-page {
      font-size: 11px;
      padding: 4px 13px;
      border-radius: 4.66px;
      transition: background-color 0.3s;
      color: var(--main_bg);
      background-color: var(--primary_button);
      border: none;

      &:hover {
        background-color: var(--primary_button)!important;
        color: var(--main_bg)!important;
      }

      &.active {
        color: var(--background_main)!important;
        background-color: var(--primary_button)!important;
      }
    }
  }
  .tabulator-frozen-rows-holder {
    border-bottom: 2px solid var(--main_border) !important;
  }
  .tabulator-frozen-left {
    border-right: 2px solid var(--main_border) !important;
  }
  .tabulator-col-title {
    //padding-left: 15px;
    input[type=checkbox] {
      //margin-left: -15px;
    }
  }

}
//.tabulator-menu.tabulator-popup-container {
//  & > .tabulator-menu-item {
//    color: var(--main_text)!important;
//    background-color: var(--main_bg)!important;
//    transition: all 0.3s ease-in-out;
//
//    &:hover {
//      background-color: var(--primary_button)!important;
//      color: var(--main_bg)!important;
//    }
//
//  }
//
//}

</style>
