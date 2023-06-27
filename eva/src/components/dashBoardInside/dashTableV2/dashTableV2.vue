<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      :id="idFrom"
      class="dash-table-v2-container"
      :style="{
        ...customStyle,
        height: Math.round(sizeFrom.height) - 42 + 'px',
        width: Math.round(sizeFrom.width - 4) + 'px',
      }"
      :class="customClass"
      v-bind="$attrs"
    >
      <dash-table-control
        v-if="activeButtons.length > 0"
        v-show="!isLoading && isValidSchema"
        :write-status="writeStatus"
        :active-buttons="activeButtons"
        @action="execute"
      />
      <div
        v-show="!isLoading && isValidSchema"
        :style="`height: ${tableHeight}`"
      >
        <div
          v-if="fullScreenMode"
          :ref="idFrom"
          class="editable-table"
        />
        <div
          v-else
          :ref="idFrom"
          class="editable-table"
        />
      </div>

      <div
        v-if="isLoading"
        class="pa-5"
      >
        Загрузка...
      </div>
      <div
        v-if="!isValidSchema && !isLoading"
        class="pa-5"
      >
        Данные не отображаются из-за настроек
      </div>
      <v-dialog
        v-model="isDownloadModal"
        width="350"
      >
        <v-card class="report-card">
          <v-card-title
            class="card-title justify-space-between"
            :style="{ background: theme.$main_bg, color: theme.$main_text }"
          >
            <div>
              <v-icon
                :style="{ color: theme.$main_text }"
                class="download-icon"
              >
                {{ mdiDownload }}
              </v-icon>
              Отчет
            </div>
            <div>
              <v-btn
                icon
                :color="theme.$main_text"
                @click="isDownloadModal = false"
              >
                <v-icon>{{ mdiClose }}</v-icon>
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text
            class="card-text pt-4 d-flex justify-center"
            :style="{ background: theme.$secondary_bg, color: theme.$main_text }"
          >
            <div class="row align-stretch">
              <div
                v-for="(item, index) in downloadFiles"
                :key="index"
                class="col-6"
              >
                <v-btn
                  small
                  text
                  :color="theme.$main_text"
                  class="d-flex align-center"
                  @click="execute(index)"
                >
                  <v-icon :color="theme.$main_text">
                    {{ mdiDownload }}
                  </v-icon>
                  <span>
                    Скачать {{ item }}
                  </span>
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </portal>
</template>

<script>
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import {
  mdiFilter,
  mdiDownload,
  mdiClose,
} from '@mdi/js';
import { throttle } from '@/js/utils/throttle';

// eslint-disable-next-line func-names
const colorFixed = function (cell) {
  cell.getElement().style.backgroundColor = this.sanitizeHTML(cell.getValue());

  return '&nbsp;';
};

// eslint-disable-next-line func-names
const headerFilter = function (cell/* , onRendered, success, cancel , editorParams */) {
  const vueComponent = this;
  const filterId = vueComponent.persistenceFilterId;
  const field = cell.getField();
  const elementId = `${filterId}-${field}`;

  const container = document.createElement('span');
  container.id = elementId;
  container.classList.add('dash-table-v2-container__filter-container');

  // create and style select element
  const select = document.createElement('select');
  select.id = `${elementId}-select`;
  select.classList.add('dash-table-v2-container__filter-select');
  const filters = vueComponent.searchSchema[field] === 'STRING'
    ? ['', '>', '<', '=', '==', '>=', '<=', '!=']
    : ['', '>', '<', '=', '>=', '<=', '!='];
  filters.forEach((item) => {
    const option = document.createElement('option');
    option.classList.add('dash-table-v2-container__filter-select-option');
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });
  select.placeholder = 'Знак';
  select.style.padding = '4px';
  select.style.boxSizing = 'border-box';

  // create and style text input element
  const textInput = document.createElement('input');
  textInput.id = `${elementId}-textInput`;
  textInput.type = 'text';
  textInput.classList.add('dash-table-v2-container__filter-input');
  textInput.placeholder = 'Значение';

  let selectValue = '';
  let textValue = '';

  function buildValues() {
    vueComponent.persistenceFilterWriter(
      filterId,
      field,
      {
        filterType: {
          el: select.id,
          value: selectValue,
        },
        filterValue: {
          el: textInput.id,
          value: textValue,
        },
      },
    );
  }

  function updateTextValue(value) {
    if (value !== '') {
      textValue = Number.isNaN(+value) ? value : +value;
    } else {
      textValue = value;
    }
  }

  // add event listeners
  select.addEventListener('change', (e) => {
    selectValue = e.target.value;
    updateTextValue(textInput?.value);
    buildValues();
  });

  textInput.addEventListener('input', (e) => {
    updateTextValue(e.target.value);
    selectValue = select.value;
    buildValues();
  });

  // append elements to container
  container.appendChild(select);
  container.appendChild(textInput);

  return container;
};

// eslint-disable-next-line func-names
const sorterFn = function (a, b/* , aRow, bRow, column, dir, sorterParams */) {
  // a, b - the two values being compared
  // aRow, bRow - the row components for the values being compared
  // (useful if you need to access additional fields in the row data for the sort)
  // column - the column component for the column being sorted
  // dir - the direction of the sort ("asc" or "desc")
  // sorterParams - sorterParams object from column definition array
  return a - b; // you must return the difference between the two values
};

export default {
  name: 'DashTableV2',
  props: {
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    customStyle: {
      type: Object,
      default: () => ({}),
    },
    customClass: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    dataRestFrom: {
      type: Array,
      default: () => ([]),
    },
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
    writeStatus: {
      type: String,
      default: '',
    },
    sizeFrom: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      mdiFilter,
      mdiDownload,
      mdiClose,
      // tabulator: null, // variable to hold your table
      tableData: [],
      isLoadFromFile: false,
      activeButtons: [],
      headerFilters: {},
      options: {
        selectColumn: false,
        paginationSize: 100,
        paginationSizeSelector: [10, 50, 100, 500, 1000, true],
        paginationCounter: 'rows',
      },
      actions: [
        { name: 'click', capture: [] },
        { name: 'mouseover', capture: [] },
      ],
      isDownloadModal: false,
      isLoading: false,
      downloadFiles: {
        downloadCSV: 'CSV',
        downloadJSON: 'JSON',
        downloadXLSX: 'XLSX',
        downloadHTML: 'HTML',
      },
      filters: [],
      sorters: [],
      timeout: null,
      timer: 0,
    };
  },
  computed: {
    isResized() {
      return this.dashFromStore.tableOptions.columnResized;
    },
    pageSize() {
      return this.dashFromStore?.tableOptions?.pageSize
          || this.options.paginationSize;
    },
    isEdit() {
      return this.$store.state[this.idDashFrom].editMode;
    },
    fields() {
      if (this.isValidSchema) {
        return this.getOptions?.fieldList || [];
      }
      return [];
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    dashFromStore() {
      return this.$store.state[this.idDashFrom][this.idFrom];
    },
    getOptions() {
      return this.dashFromStore.options;
    },
    tableHeight() {
      let offset = this.activeButtons?.length > 0 ? 38 : 0;
      offset += this.title ? 33 : 0;
      return `calc(100% - ${offset}px)`;
    },
    columnOptions() {
      const columnOptions = {};
      const {
        numberFormat,
        decimalPlacesLimits,
      } = this.$store.getters['app/userSettings'];
      if (this.isValidSchema) {
        Object.keys(this.searchSchema).forEach((column) => {
          columnOptions[column] = {
            headerFilter: this.defaultFilterAllColumns,
            headerMenu: true,
            frozen: this.frozenColumns.includes(column),
            formatter: (this.enableDecimalPlacesLimits) ? (cell) => {
              const num = cell.getValue();
              if (typeof num === 'number') {
                return num.toLocaleString(numberFormat, {
                  maximumFractionDigits: decimalPlacesLimits || 10,
                });
              }
              return num;
            } : undefined,
          };
        });
      }
      return columnOptions;
    },
    columns() {
      const columnsFromStore = this.idDashFrom !== 'reports' && this.dashFromStore?.tableOptions
        ? this.dashFromStore.tableOptions[`tabulator-${this.idFrom}-columns`]
        : [];
      const defaultColumns = this.options.selectColumn
        ? [
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
        ]
        : [];
      const fields = this.idDashFrom === 'reports' ? Object.keys(this.searchSchema) : this.fields;

      const processColumn = (key, options, columnFromStore) => {
        let column = {
          field: key,
          title: options?.title || key,
          resizable: 'header',
          frozen: options?.frozen || false,
          headerFilter: options?.headerFilter ? headerFilter.bind(this) : false,
          headerFilterLiveFilter: false,
          editor: options?.editor || false,
          sorter: this.searchSchema[key] === 'STRING' ? 'string' : sorterFn,
          headerSortTristate: true,
          sorterParams: this.searchSchema[key] === 'STRING' ? {
            locale: true,
            alignEmptyValues: 'top',
          } : false,
          headerMenu: options?.headerMenu && this.isEdit ? this.headerMenu : false,
          cellClick: this.cellClickEvent,
          minWidth: options?.minWidth || (options?.headerFilter ? 150 : 80),
        };

        if (options?.formatter) {
          column.formatter = options.formatter === 'color' ? colorFixed : options.formatter;
        }

        if (options?.formatter === 'tickCross') {
          column.headerFilterParams = { tristate: true };
          column.headerFilterEmptyCheck = (value) => value === null;
        }

        if (options?.editor === 'list' && options.editorParams) {
          column.editorParams = options.editorParams;
          column.headerFilter = 'input';
        }

        if (columnFromStore !== undefined) {
          column = {
            ...columnFromStore,
            ...column,
          };
        }

        return column;
      };

      const generateColumns = (acc, key) => {
        if (key === '_columnOptions') {
          return acc;
        }

        const options = this.columnOptions[key];
        const columnFromStore = columnsFromStore?.find((el) => el.field === key);

        return [...acc, processColumn(key, options, columnFromStore)];
      };

      const generateDefaultColumns = (acc, key) => {
        const columnFromStore = columnsFromStore?.find((el) => el.field === key);

        return [...acc, processColumn(key, null, columnFromStore)];
      };

      if (this.columnOptions && Object.keys(this.columnOptions).length) {
        return fields.reduce(generateColumns, defaultColumns);
      }

      return fields.reduce(generateDefaultColumns, defaultColumns);
    },
    events() {
      return this.getEvents({
        idDash: this.idDashFrom,
        event: 'OnDataCompare',
        element: this.idFrom,
      });
    },
    getTokens() {
      if (this.$store.state[this.idDashFrom]?.tockens?.length > 0) {
        return this.$store.state[this.idDashFrom].tockens
          .filter((el) => el.elem === this.idFrom) || [];
      }
      return [];
    },
    // options
    frozenColumns() {
      return this.getOptions?.frozenColumns || [];
    },
    enableDecimalPlacesLimits() {
      return this.getOptions?.enableDecimalPlacesLimits;
    },
    visibleColumns() {
      return this.getOptions?.titles || [];
    },
    selectableRow() {
      return !!this.getOptions?.selectableRow;
    },
    movableColumns() {
      if (this.isEdit) {
        return this.getOptions?.movableColumns || false;
      }
      return false;
    },
    defaultFilterAllColumns() {
      if (this.idDashFrom === 'reports') {
        return true;
      }
      return this.getOptions?.defaultFilterAllColumns || false;
    },
    saveMovedColumnPosition() {
      return !!this.getOptions?.saveMovedColumnPosition;
    },
    isValidSchema() {
      if (this.searchSchema) {
        return Object.keys(this.searchSchema)?.length > 0;
      }
      return false;
    },
    persistenceFilterId() {
      return `tabulator-${this.idFrom}-filters`;
    },
  },
  watch: {
    events(val, oldVal) {
      if (JSON.stringify(val) !== JSON.stringify(oldVal)) {
        this.redrawTable();
      }
    },
    fields(val, oldVal) {
      if (val?.length && JSON.stringify(val) !== JSON.stringify(oldVal)) {
        this.setAction(this.searchSchema);
      }
    },
    searchSchema: {
      handler(value) {
        if (Object.keys(value)?.length > 0 && this.idDashFrom !== 'reports') {
          const isUpdatedValue = this.fields?.length > 0
            ? this.checkFieldList(Object.keys(value), structuredClone(this.fields))
            : true;
          if (isUpdatedValue) {
            this.setColumnResized(false);
            this.clearFrozenColumns();
            this.clearPersistenceFilter();
            this.updateFieldListInStore(Object.keys(value));
          }
        }
      },
      deep: true,
    },
    dataRestFrom: {
      handler(val) {
        if (this.isValidSchema) {
          if (this.idDashFrom === 'reports') {
            this.updateDataInTable(val);
          }
          this.onDataCompare();
        }
      },
      deep: true,
    },
    columnOptions: {
      handler(val, oldVal) {
        if (JSON.stringify(val) !== JSON.stringify(oldVal)) {
          this.updateColumnDefinition();
        }
      },
      deep: true,
    },
    columns: {
      handler(val, oldVal) {
        if (this.tabulator && (JSON.stringify(val) !== JSON.stringify(oldVal))) {
          this.updateTable();
        }
      },
      deep: true,
    },
    fullScreenMode(val, oldVal) {
      if (val !== oldVal) {
        this.redrawTable();
      }
    },
    frozenColumns: {
      handler(val, oldVal) {
        if (JSON.stringify(val) !== JSON.stringify(oldVal)) {
          this.updateTable();
        }
      },
      deep: true,
    },
    selectableRow(val, oldVal) {
      if (val !== oldVal) {
        this.redrawTable();
      }
    },
    movableColumns(val, oldVal) {
      if (val !== oldVal) {
        this.redrawTable();
      }
    },
    saveMovedColumnPosition(val, oldVal) {
      if (val !== oldVal) {
        this.redrawTable();
      }
    },
    defaultFilterAllColumns(val, oldVal) {
      if (val !== oldVal) {
        this.updateColumnDefinition();
      }
    },
    isEdit() {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.createTable();
        });
      });
    },
    loading(val) {
      if (!val) {
        this.redrawTable();
      } else {
        this.isLoading = val;
      }
    },
  },
  mounted() {
    if (this.isValidSchema) {
      this.setAction(this.searchSchema);
      this.redrawTable();
      if (this.idDashFrom !== 'reports') {
        if (this.checkFieldList(this.fields, Object.keys(this.searchSchema))) {
          this.setColumnResized(false);
          this.clearFrozenColumns();
          this.updateFieldListInStore(Object.keys(this.searchSchema));
        }
      }
    }
  },
  created() {
    this.createFieldInStore('tableOptions', {});
    this.createFieldInStore('columnResized', false, 'tableOptions');
    this.createTable = throttle(this.createTable, 500);
    this.redrawTable = throttle(this.redrawTable, 1000);
    this.updateTable = throttle(this.updateTable, 1000);
  },
  beforeDestroy() {
    this.destroyTable();
  },
  methods: {
    clearFrozenColumns() {
      this.$store.commit('setState', [{
        object: this.dashFromStore.options,
        prop: 'frozenColumns',
        value: [],
      }]);
    },
    setColumnResized(value) {
      this.$store.commit('setState', [{
        object: this.dashFromStore.tableOptions,
        prop: 'columnResized',
        value,
      }]);
    },
    checkFieldList(arr, oldArr) {
      const sortedOldArr = [...oldArr].sort().join(',');
      const sortedArr = [...arr].sort().join(',');
      return sortedArr !== sortedOldArr;
    },
    openDownloadModal() {
      this.isDownloadModal = true;
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
      row.getElement().style.backgroundColor = color;
    },
    changeCellColor(cell, color) {
      cell.getElement().style.backgroundColor = color;
    },
    updateDataInTable(data) {
      this.tableData = structuredClone(data);
      this.isLoadFromFile = false;
      if (this.tabulator) {
        setTimeout(() => {
          this.tabulator.setData(this.dataRestFrom);
        }, 100);
      }
    },
    updateTable() {
      this.tabulator.redraw();
    },
    redrawTable() {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.createTable();
          this.updateDataInTable(this.dataRestFrom);
        });
      });
    },
    async updateColumnDefinition() {
      if (this.tabulator && this.isValidSchema) {
        const tabulatorColumns = this.tabulator.getColumns();
        const columnDefinition = this.columns.reduce((acc, col) => {
          const colField = col.field;
          // eslint-disable-next-line no-underscore-dangle
          const tCol = tabulatorColumns.find((item) => item?._column.field === colField);
          if (!colField || !tCol) {
            return [
              ...acc,
              col,
            ];
          }
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
      this.tabulator = new Tabulator(this.$refs[this.idFrom], {
        addRowPos: 'top',
        placeholder: 'Данные не отображаются из-за настроек', // display message to user on empty table
        popupContainer: `#${this.idFrom}`,
        maxHeight: '100%',
        height: '100%',
        layout: 'fitDataStretch',
        layoutColumnsOnNewData: true,
        frozenRows: false,
        nestedFieldSeparator: '|',
        selectable: this.selectableRow ? 1 : false,
        rowFormatter: this.rowFormatter,
        persistence: this.idDashFrom === 'reports' ? false : {
          columns: ['width', 'frozen', 'visible'],
          sort: true,
        },
        langs: {
          default: {
            data: {
              loading: 'Загрузка', // data loader text
              error: 'Ошибка', // data error text
            },
            pagination: {
              page_size: 'Строк на странице', // label for the page size select element
              page_title: '', // tooltip text for the numeric page button, appears in front of the page number (eg. "Show Page" will result in a tool tip of "Show Page 1" on the page 1 button)
              first: '', // text for the first page button
              first_title: 'Первая', // tooltip text for the first page button
              last: '',
              last_title: 'Последняя',
              prev: '',
              prev_title: 'Предыдущая',
              next: '',
              next_title: 'Следующая',
              all: 'Все',
            },
          },
        },
        persistenceID: this.idFrom,
        data: this.tableData, // link data to table
        reactiveData: false, // enable data reactivity

        // define table columns
        autoColumns: this.isLoadFromFile,
        columns: this.columns,
        pagination: 'local',
        paginationCounter(pageSize, currentRow, currentPage, totalRows/* , totalPages */) {
          return `${currentRow}-${pageSize} из ${totalRows}`;
        },
        paginationSize: this.pageSize,
        paginationSizeSelector: this.options.paginationSizeSelector,
        // paginationCounter: this.options.paginationCounter,
        movableColumns: this.movableColumns,
        // history
        persistenceWriterFunc: this.persistenceWriterFunc,
        persistenceReaderFunc: this.persistenceReaderFunc,
      });
      this.tabulator.on('columnResized', () => {
        // column - column component of the resized column
        if (this.idDashFrom !== 'reports') {
          this.setColumnResized(true);
        }
      });
      this.tabulator.on('columnMoved', (column, columns) => {
        if (this.saveMovedColumnPosition) {
          const fields = columns.map((el) => el.getField());
          this.updateFieldListInStore(fields);
          if (this.idDashFrom !== 'reports') {
            this.setColumnResized(true);
          }
        }
      });
      this.tabulator.on('tableBuilt', () => {
        setTimeout(() => {
          this.isLoading = false;
          if (this.checkFieldList(this.fields, Object.keys(this.searchSchema))) {
            this.clearPersistenceFilter();
          } else {
            this.persistenceFilterReader();
          }
        }, 500);
      });
      this.tabulator.on('dataSorted', (sorters/* , rows */) => {
        // sorters - array of the sorters currently applied
        // rows - array of row components in their new order
        if (sorters?.length === 0) {
          this.sorters = [];
        }
      });
      this.tabulator.on('pageSizeChanged', (pageSize) => {
        // pageSize - the number of rows per page
        this.changeDefaultPagination(pageSize);
      });
    },
    updateFieldListInStore(fieldList) {
      if (!this.fields) {
        this.$store.commit('setState', [{
          object: this.getOptions,
          prop: 'fieldList',
          value: [],
        }]);
      }
      this.$store.commit('setState', [{
        object: this.getOptions,
        prop: 'fieldList',
        value: fieldList,
      }]);
    },
    headerMenu() {
      const menu = [];
      const columns = this.tabulator.getColumns();

      // eslint-disable-next-line no-restricted-syntax
      for (const column of columns) {
        // create checkbox element using font awesome icons
        const icon = document.createElement('span');
        icon.style.fontSize = '20px';
        // icon.classList.add('FontIcon');
        icon.classList.add('eva-basic_check_big');
        icon.classList.add(column.isVisible() ? 'eva-basic_checkbox_checked' : 'eva-basic_checkbox');

        // build label
        const label = document.createElement('span');
        label.style.display = 'inline-flex';
        label.style.alignItems = 'center';
        label.style.gap = '5px';
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
              icon.classList.remove('eva-basic_checkbox');
              icon.classList.add('eva-basic_checkbox_checked');
            } else {
              icon.classList.remove('eva-basic_checkbox_checked');
              icon.classList.add('eva-basic_checkbox');
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
      // onclick\onCtrlClick
      this.setEvent({
        event: e.ctrlKey ? 'onctrlclick' : 'onclick',
        partElement: 'empty',
      });

      // For edit
      // TODO: Временно закомменчено
      // if (e instanceof FocusEvent) {
      //   const column = cell.column.field;
      //   const { value } = cell;
      //   const row = cell.row.position;
      //
      //   this.$emit('cellClick', { row, column, value });
      // }
    },
    setEvent(eventData) {
      const events = this.getEvents({
        event: eventData.event,
        partelement: eventData.partElement,
      });
      if (events?.length > 0) {
        events.forEach((item) => {
          if (item.action === 'set') {
            this.$store.commit('letEventSet', {
              events,
              idDash: this.idDashFrom,
            });
          } else if (item.action === 'go') {
            this.$store.dispatch('letEventGo', {
              event: item,
              id: this.idFrom,
              idDash: this.idDashFrom,
              route: this.$router,
              store: this.$store,
            });
          }
        });
      }
    },
    writeData() {
      this.tableData = this.tabulator.getData();
      this.$root.writeData({
        data: structuredClone(this.tableData),
        schema: this.searchSchema,
      });
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
      this.isDownloadModal = false;
      this[action]();
    },
    getDataFromTable() {
      return this.tabulator.getData();
    },
    destroyTable() {
      if (this.tabulator) {
        this.tabulator.destroy();
        this.tabulator = null;
      }
    },
    persistenceFilterWriter(id, field, data) {
      if (this.isValidSchema) {
        // Список фильтров без текущего
        const filters = structuredClone(this.filters)
          .filter((filter) => filter.field !== field);
        const type = data?.filterType?.value;
        const value = data?.filterValue?.value;
        if (type && value.toString()) {
          filters.push({
            field,
            data,
          });
          this.setFilter(field, type, value);
        } else {
          this.tabulator.clearFilter();
          filters.forEach((filter) => {
            this.setFilter(
              filter.field,
              filter.data.filterType.value,
              filter.data.filterValue.value,
            );
          });
        }
        this.filters = filters;
      }
    },
    persistenceFilterReader() {
      if (this.defaultFilterAllColumns && this.filters?.length > 0) {
        this.filters.forEach((el) => {
          const { field } = el;
          const type = el.data.filterType.value;
          const { value } = el.data.filterValue;
          const selectId = el.data.filterType.el;
          const textInputId = el.data.filterValue.el;
          this.setFilter(
            field,
            type,
            value,
          );
          const select = document.querySelector(`#${selectId}`);
          const textInput = document.querySelector(`#${textInputId}`);
          select.value = type;
          textInput.value = value;
        });
      }
    },
    clearPersistenceFilter() {
      if (this.dashFromStore.tableOptions[this.persistenceFilterId]) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.tableOptions,
          prop: this.persistenceFilterId,
          value: {},
        }]);
      }
    },
    setFilter(field, type, value) {
      const filterTypes = {
        '>': '>',
        '<': '<',
        '=': typeof value === 'string' ? 'like' : '=',
        '==': '=',
        '>=': '>=',
        '<=': '<=',
        '!=': '!=',
      };
      const filterType = typeof value === 'string'
        ? filterTypes[type]
        : type;
      if (this.filters?.length > 0) {
        const filters = this.tabulator.getFilters();
        filters.forEach((filter) => {
          if (filter.field === field) {
            this.removeFilter(field, filter.type, filter.value);
          }
        });
      }
      this.tabulator.addFilter(
        field,
        filterType,
        value,
      );
    },
    removeFilter(field, type, value) {
      this.tabulator.removeFilter(field, type, value);
    },
    persistenceReaderFunc(id, type) {
      if (type === 'sort') {
        return this.sorters;
      }
      const { tableOptions } = this.dashFromStore;
      if (tableOptions && tableOptions[`${id}-${type}`]
          && tableOptions[`${id}-${type}`].length > 0) {
        return structuredClone(tableOptions[`${id}-${type}`]);
      }
      return false;
    },
    localThrottleFn(fn, timeout = 500) {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timer = timeout;
      this.timeout = setTimeout(fn, this.timer);
    },
    persistenceWriterFunc(id, type, data) {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timer = 500;
      this.timeout = setTimeout(() => {
        if (data?.length > 0 && this.isValidSchema) {
          if (type !== 'sort') {
            this.createFieldInStore(
              `${id}-${type}`,
              [],
              'tableOptions',
            );
            const dataFromStore = this.dashFromStore.tableOptions[`${id}-${type}`];
            if (JSON.stringify(dataFromStore) !== JSON.stringify(data)) {
              const fields = this.idDashFrom === 'reports' ? Object.keys(this.searchSchema) : this.fields;
              const updatedData = fields.map((key) => {
                const el = data.find((item) => item?.field === key);
                if (this.isResized) {
                  return el;
                }
                return {
                  field: key,
                  frozen: el.frozen,
                  visible: el.visible,
                };
              });
              this.$store.commit('setState', [{
                object: this.dashFromStore.tableOptions,
                prop: `${id}-${type}`,
                value: structuredClone(updatedData),
              }]);
            }
          } else {
            this.sorters = data;
          }
        }
      }, this.timer);
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
      if (this.getTokens?.length > 0) {
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
      }
    },
    setAction(data) {
      this.actions = this.actions.map((action) => ({
        ...action,
        capture: Object.keys(data),
      }));
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

      if (!this.tabulator?.rowManager?.getRows()) {
        return;
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const row of this.tabulator.rowManager.getRows()) {
        if (!row.getCells()) {
          // eslint-disable-next-line no-continue
          continue;
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const cell of row.getCells()) {
          const field = cell.column.getField();
          const event = this.findEvent(field);

          if (!event) {
            // eslint-disable-next-line no-continue
            continue;
          }

          const [eventType, compare, color, secondValue] = event.prop;

          if (eventType !== 'cellcolor') {
            // eslint-disable-next-line no-continue
            continue;
          }

          const targetCell = cell.element;
          const firstValue = cell.getValue();
          const comparisonResult = this.getComparisonResult(
            compareEval[compare],
            { val: firstValue, secondVal: secondValue },
          );

          if (comparisonResult && color) {
            targetCell.style.backgroundColor = color;
            cell.element = targetCell;
          }
        }
      }
    },
    findEvent(field) {
      // eslint-disable-next-line no-restricted-syntax
      for (const event of this.events) {
        if (event.prop[0] === 'cellcolor' && event.column === field) {
          return event;
        }
      }

      return null;
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
    setDefaultPagination() {
      // this.tabulator.setPageSize(this.pageSize);
    },
    changeDefaultPagination(pageSize) {
      if (`${pageSize}` !== `${this.dashFromStore?.tableOptions?.pageSize}`) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.tableOptions,
          prop: 'pageSize',
          value: pageSize,
        }]);
      }
    },
    createFieldInStore(fieldName, defaultValue, parentField) {
      if (parentField && this.dashFromStore[parentField][fieldName] === undefined) {
        this.$store.commit('setState', [{
          object: this.dashFromStore[parentField],
          prop: fieldName,
          value: defaultValue,
        }]);
      } else if (this.dashFromStore[fieldName] === undefined) {
        this.$store.commit('setState', [{
          object: this.dashFromStore,
          prop: fieldName,
          value: defaultValue,
        }]);
      }
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

/*Theme the this.tabulator element*/
.editable-table {
  *::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  *::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: var(--secondary_text);
  }

  *::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.2);
    border-radius: 10px;
    background-color: var(--secondary_bg) !important;
  }

  *::-webkit-scrollbar-corner {
    background-color: var(--secondary_bg);
  }

  background-color: transparent!important;
  border: none;
  border-radius: 4px;
  /*Theme the header*/
  .tabulator-header {
    background: transparent!important;
    color: var(--main_text)!important;
    border-color: var(--main_border) !important;

    /*Allow column header names to wrap lines*/
    .tabulator-col,
    .tabulator-col-row-handle {
      background: transparent!important;
      white-space: normal;
    }
    .tabulator-col {
      border-color: var(--main_border) !important;
      &.tabulator-frozen {
        background-color: var(--main_bg) !important;
      }
    }

    .tabulator-header-filter input {
      background-color: transparent;
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
    display: flex;
    align-items: stretch !important;
    color: var(--main_text)!important;
    background-color: transparent;
    transition: background-color .3s, color .3s;
    border-bottom: 1px solid var(--main_border);
    &.on-data-compare-color {
      background-color: transparent;
    }

    /*Color even rows*/
    &:nth-child(even) {
      background-color: transparent!important;
      &.on-data-compare-color {
        background-color: transparent;
      }
    }
    .tabulator-cell {
      display: inline-flex;
      flex: 1 1 auto;
      align-items: center;
      text-align: center;
      justify-content: center;
      transition: background-color .3s;
      height: auto !important;
      white-space: normal;
      &.tabulator-frozen {
        background-color: var(--main_bg);
      }
    }
    &:hover {
      background-color: var(--main_text) !important;
      cursor: pointer;
      color: var(--main_bg) !important;
      .tabulator-cell {
        background-color: var(--main_text) !important;
      }
    }
    &.tabulator-selectable {
      &.tabulator-selected {
        background-color: var(--main_text) !important;
        cursor: pointer;
        color: var(--main_bg) !important;
        .tabulator-cell {
          background-color: var(--main_text) !important;
        }
      }
    }
  }
  /*Color the table rows*/
  .tabulator-cell {
    border-color: var(--main_border) !important;
  }
  .tabulator-footer {
    background: transparent !important;
    border-top: 1px solid var(--main_border)!important;
    color: var(--main_text)!important;

    .tabulator-paginator {
      align-items: center;
      display: flex;
      justify-content: flex-end;
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
        background-color: transparent;
        border-top: 1px solid var(--main_border);
        color: var(--secondary_text);
      }
    }

    .tabulator-page-size:focus-visible {
      outline: none;
    }

    .tabulator-page {
      font-size: 11px;
      padding: 2px 13px;
      border-radius: 4px;
      transition: background-color 0.3s;
      color: var(--main_text);
      background-color: var(--main_bg);
      border: 1px solid var(--main_text);
      opacity: 1!important;
      height: 22px;
      position: relative;

      &:hover {
        background-color: var(--main_text) !important;
        color: var(--main_bg) !important;
        &[data-page="prev"],
        &[data-page="next"],
        &[data-page="last"],
        &[data-page="first"] {
          color: transparent !important;
          &:before {
            color: var(--main_bg) !important;
          }
        }
      }
      &.active {
        color: var(--main_text) !important;
        background-color: var(--secondary_bg)!important;
      }
      &[data-page="prev"],
      &[data-page="next"],
      &[data-page="last"],
      &[data-page="first"] {
        color: transparent !important;
        padding: 0 4px;
        width: 32px;
       &:before {
         font-family: 'eva-icons' !important;
         speak: never;
         font-style: normal;
         font-weight: normal;
         font-variant: normal;
         text-transform: none;
         line-height: 1;
         /* Better Font Rendering =========== */
         -webkit-font-smoothing: antialiased;
         -moz-osx-font-smoothing: grayscale;
         position: absolute;
         left: 50%;
         top: 50%;
         transform: translate(-50%, -50%);
         width: 15px;
         height: 15px;
         font-size: 15px;
         color: var(--main_text);
         transition: color .3s;
       }
      }
      &[data-page="first"]:before {
        content: "\e919";
      }
      &[data-page="last"]:before {
        content: "\e91a";
      }
      &[data-page="next"]:before {
        content: "\e90e";
      }
      &[data-page="prev"]:before {
        content: "\e90d";
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
.tabulator-menu.tabulator-popup-container {
  max-height: 180px;
  text-align: left;
  border-radius: 2px;
  & > .tabulator-menu-item {
    color: var(--main_text)!important;
    background-color: var(--main_bg)!important;
    transition: all 0.3s ease-in-out;

    &:hover {
      background-color: var(--main_text)!important;
      color: var(--main_bg)!important;
    }

  }

}

</style>
