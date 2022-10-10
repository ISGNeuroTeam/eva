import {
  mdiGraph,
  mdiGestureTap,
  mdiBrush,
  mdiViewGrid,
  mdiCardTextOutline,
  mdiChartGantt,
  mdiMapMarker,
  mdiChartMultiline,
  mdiNumeric,
  mdiTableLarge,
  mdiChartPie,
  mdiFormatListBulleted,
  mdiCalendarMonth,
  mdiGraphql,
  mdiChartScatterPlot,
  mdiGrid,
  mdiTuneVertical,
  mdiImageFilterTiltShift,
  mdiScatterPlotOutline,
} from '@mdi/js';

export default {
  tools: [
    { name: 'Таблица', img: mdiTableLarge, type: 'table' },
    {
      name: 'Мультилинейный график',
      img: mdiChartMultiline,
      type: 'multiLine',
    },
    { name: 'Карта', img: mdiMapMarker, type: 'map' },
    { name: 'Круговая диаграмма', img: mdiChartPie, type: 'piechart' },
    { name: 'Выпадающий список', img: mdiFormatListBulleted, type: 'select' },
    { name: 'Выбор времени', img: mdiCalendarMonth, type: 'picker' },
    { name: 'Граф', img: mdiGraphql, type: 'ygraph' },
    { name: 'Кустовая схема', img: mdiChartScatterPlot, type: 'bush' },
    { name: 'Диаграмма Гантта', img: mdiChartGantt, type: 'guntt' },
    { name: 'Плитка', img: mdiViewGrid, type: 'tile' },
    { name: 'Изображение', img: mdiBrush, type: 'csvg' },
    { name: 'Число', img: mdiNumeric, type: 'single' },
    { name: 'Кнопка', img: mdiGestureTap, type: 'button' },
    { name: 'Текстовый блок', img: mdiCardTextOutline, type: 'textarea' },
    { name: 'Граф_old', img: mdiGraph, type: 'graph' },
    { name: 'Тепловая карта', img: mdiGrid, type: 'heatmap' },
    { name: 'Показатели', img: mdiNumeric, type: 'singleValue' },
    { name: 'Ползунок', img: 'eva-basic_slider_01', type: 'tune' },
    { name: 'Конструктор схем', img: mdiTuneVertical, type: 'constructorSchemes' },
    { name: 'Накопитель', img: 'eva-chart_bar_chart_horizontal', type: 'accumulators' },
    { name: 'Меню', img: 'eva-edit_list_checklist', type: 'menu' },
    { name: 'Круговая шкала', img: mdiImageFilterTiltShift, type: 'dial' },
    { name: 'Точечный график', img: mdiScatterPlotOutline, type: 'scatterPlot' },
  ],
  size: {
    picker: {
      width: 365,
      height: 195,
    },
    select: {
      width: 480,
      height: 205,
    },
    piechart: {
      width: 600,
      height: 550,
    },
    graph: {
      width: 1000,
      height: 600,
    },
    table: {
      width: 500,
      height: 480,
    },
    single: {
      width: 345,
      height: 195,
    },
    guntt: {
      width: 580,
      height: 270,
    },
    multiLine: {
      width: 700,
      height: 400,
    },
    button: {
      width: 345,
      height: 100,
    },
    textarea: {
      width: 400,
      height: 80,
    },
    tile: {
      width: 470,
      height: 400,
    },
    csvg: {
      width: 500,
      height: 400,
    },
    ygraph: {
      width: 930,
      height: 850,
    },
    bush: {
      width: 930,
      height: 850,
    },
    map: {
      width: 930,
      height: 850,
    },
    heatmap: {
      width: 500,
      height: 300,
    },
    singleValue: {
      width: 500,
      height: 300,
    },
    tune: {
      width: 400,
      height: 400,
    },
    accumulators: {
      width: 400,
      height: 400,
    },
    menu: {
      width: 400,
      height: 400,
    },
    dial: {
      width: 400,
      height: 400,
    },
    scatterPlot: {
      width: 500,
      height: 400,
    },
    constructorSchemes: {
      width: 930,
      height: 850,
    },
  },
  icons: {
    table: mdiTableLarge,
    multiLine: mdiChartMultiline,
    piechart: mdiChartPie,
    graph: mdiGraph,
    guntt: mdiChartGantt,
    select: mdiFormatListBulleted,
    picker: mdiCalendarMonth,
    single: mdiNumeric,
    button: mdiGestureTap,
    textarea: mdiCardTextOutline,
    tile: mdiViewGrid,
    csvg: mdiBrush,
    ygraph: mdiGraphql,
    bush: mdiChartScatterPlot,
    map: mdiMapMarker,
    heatmap: mdiGrid,
    singleValue: mdiNumeric,
    tune: 'eva-basic_slider_01',
    constructorSchemes: mdiTuneVertical,
    accumulators: 'eva-chart_bar_chart_horizontal',
    menu: 'eva-edit_list_checklist',
    dial: mdiImageFilterTiltShift,
    scatterPlot: mdiScatterPlotOutline,
  },
  commonOptions: [
    'panelSettings',
    'panelNameHide',
    'panelIconUpdate',
    'panelBackHide',
    'panelIconDownload',
    'panelIconFullscreen',
    'visible',
    'level',
    'pinned',
    'otherSettings',
  ],
  options: {
    // component to options
    multiLine: [
      'boxShadow',
      'metrics',
      'lastResult',
    ],
    piechart: [
      'metricsRelation',
      'showlegend',
      'positionlegend',
      'colorsPie',
      'themes',
      'piechartSettings',
      'pieType',
    ],
    table: [
      'boxShadow',
      'rowcolor',
      'columncolor',
      'cellcolor',
      'lastResult',
      'titles',
    ],
    select: [
      'boxShadow',
      'multiple',
      'defaultFromSourceData',
      'defaultSourceDataField',
      'defaultSourceDataUpdates',
    ],
    picker: [
      'canChooseTime',
      'canLastTimeEnter',
      'canRangeEnter',
      'canManuallyEnter',
      'timeOutputFormat',
    ],
    graph: ['boxShadow'],
    single: [
      'subnumber',
      'color',
      'boxShadow',
      'fontSize',
      'lastResult',
    ],
    button: [
      'color',
      'backgroundcolor',
      'name',
      'fontSize',
      'underline',
      'onButton',
      'SubmitByListDS',
      'ListDS',
    ],
    textarea: [
      'searchBtn',
      'textFontSize',
      'fontWeight',
      'defaultFromSourceData',
      'defaultSourceDataField',
      'defaultSourceDataUpdates',
      'validationGroup',
      'validationType',
      'validationNumberRangeMin',
      'validationNumberRangeMax',
    ],
    guntt: ['timeFormat'],
    tile: [
      'visible',
      'level',
      'pinned',
      'tileSettings',
      'columnCount',
      'tileStyle',
    ],
    csvg: ['tooltip', 'backgroundImage'],
    ygraph: [],
    bush: [],
    map: ['osmserver', 'primitives', 'primitivesLibrary'],
    heatmap: [
      'dataFormat',
      'x',
      'xFormat',
      'xSort',
      'y',
      'yFormat',
      'ySort',
      'data',
      'metadata',
      'detailValue',
    ],
    singleValue: [
      'numberPerDigit',
    ],
    tune: [
      'defaultFromSourceData',
      'defaultSourceDataField',
      'defaultSourceDataUpdates',
    ],
    accumulators: [
      'boxShadow',
      'metrics',
      'fillColor',
    ],
    menu: [
      'boxShadow',
      'metrics',
      'fillColor',
    ],
    dial: [],
    scatterPlot: [
      'scatterPlotGroup',
      'xMetric',
      'yMetric',
      'metricGroup',
      'scatterPlotLegend',
    ],
    constructorSchemes: ['visible', 'level', 'pinned', 'primitives', 'primitivesLibrary'],
  },
  optionFields: [
    // описание типов полей и их характеристик
    // common
    {
      group: 'Основные настройки',
      option: 'panelSettings',
      relation() {
        return this.isDashBoard;
      },
    },
    {
      optionGroup: 'panelSettings',
      option: 'panelNameHide',
      description: 'скрыть название панели',
      elem: 'switch',
      default: false,
      relation() {
        return this.isDashBoard;
      },
    },
    {
      optionGroup: 'panelSettings',
      option: 'panelIconUpdate',
      description: 'возможность вручную обновить данные',
      elem: 'switch',
      default: false,
      relation() {
        return this.isDashBoard;
      },
    },
    {
      optionGroup: 'panelSettings',
      option: 'panelBackHide',
      description: 'скрыть фон панели',
      elem: 'switch',
      default: false,
      relation() {
        return this.isDashBoard;
      },
    },
    {
      optionGroup: 'panelSettings',
      option: 'panelIconDownload',
      description: 'возможность скачать результаты',
      elem: 'switch',
      default: false,
      relation() {
        return this.isDashBoard;
      },
    },
    {
      optionGroup: 'panelSettings',
      option: 'panelIconFullscreen',
      description: 'возможность раскрывать на весь экран',
      elem: 'switch',
      default: false,
      relation() {
        return this.isDashBoard;
      },
    },
    {
      group: 'Дополнительные настройки',
      option: 'otherSettings',
    },

    // dashBoard
    {
      option: 'visible',
      description: 'Показывает / скрывает элемент',
      elem: 'switch',
    },
    {
      option: 'pinned',
      description: 'Закрепить на всех вкладках',
      elem: 'switch',
    },
    {
      option: 'level',
      description: 'Установить слой отображения элемента',
      elem: 'text-field',
    },
    {
      option: 'lastResult',
      description: 'Вывод предыдущих результатов',
      elem: 'switch',
    },

    // dashTextArea
    {
      option: 'boxShadow',
      description: 'Добавляет / удаляет тень',
      elem: 'switch',
    },
    {
      option: 'searchBtn',
      description: 'Показывать кнопку поиска',
      elem: 'switch',
    },
    {
      option: 'textFontSize',
      description: 'Выбрать размер шрифта',
      elem: 'select',
      items: [12, 14, 16, 18, 24, 28, 32, 36, 42, 48, 54, 62, 68, 72],
    },
    {
      option: 'fontWeight',
      description: 'Установить насыщенности текста',
      elem: 'select',
      items: [100, 200, 400, 500, 800],
    },
    {
      relation() {
        return this.isDashBoard && !!this.$store.state[this.idDash].searches;
      },
      option: 'defaultFromSourceData',
      description: 'Дефолтное значение из источника данных',
      elem: 'select',
      default: null,
      items() {
        const dashState = this.$store.state[this.idDash];
        if (!dashState?.searches || !dashState.searches.map) {
          return [];
        }
        const sourceDataList = dashState.searches.map(({ id, sid }) => ({
          value: id,
          text: sid,
        }));
        return [
          {
            value: null,
            text: '-- Не использовать --',
          },
          ...sourceDataList,
        ];
      },
    },
    {
      relation: ['defaultFromSourceData'],
      option: 'defaultSourceDataField',
      description: 'Поле для дефолтного значения из ИД',
      elem: 'text-field',
      default: 'value',
      placeholder: 'Default: value',
    },
    {
      relation: ['defaultFromSourceData'],
      option: 'defaultSourceDataUpdates',
      description: 'Обновлять значение компонента при изменениях в ИД для дефолтного значения',
      elem: 'switch',
      default: false,
    },
    {
      group: 'Валидация',
      option: 'validationGroup',
    },
    {
      optionGroup: 'validationGroup',
      option: 'validationType',
      description: 'Валидация данных',
      elem: 'select',
      items: [
        { value: null, text: 'Нет валидации' },
        { value: 'numberRange', text: 'Диапазон чисел' },
      ],
      default: null,
    },
    {
      optionGroup: 'validationGroup',
      option: 'validationNumberRangeMin',
      relation: ['validationType', { validationType: 'numberRange' }],
      description: 'Минимальное значение',
      elem: 'text-field',
      elemType: 'number',
    },
    {
      optionGroup: 'validationGroup',
      option: 'validationNumberRangeMax',
      relation: ['validationType', { validationType: 'numberRange' }],
      description: 'Максимальное значение',
      elem: 'text-field',
      elemType: 'number',
    },

    // dashMap
    {
      option: 'osmserver',
      description:
        'Сервер для набора tile Пример:\nhttps://tile.openstreetmap.org/{z}/{x}/{y}.png',
      elem: 'text-field',
    },

    // datepicker
    {
      option: 'canChooseTime',
      description: 'Выбор времени',
      elem: 'switch',
      default: true,
    },
    {
      option: 'canLastTimeEnter',
      description: 'Показать ввод: последние часы/мин/сек',
      elem: 'switch',
      default: true,
    },
    {
      option: 'canRangeEnter',
      description: 'Показать выбор диапазона дат',
      elem: 'switch',
      default: true,
    },
    {
      option: 'canManuallyEnter',
      description: 'Показать ручной ввод дат',
      elem: 'switch',
      default: true,
    },
    {
      option: 'timeOutputFormat',
      description: 'Формат даты для результата',
      elem: 'text-field',
      default: '',
      placeholder: 'Пример: YYYY-MM-DD hh:mm',
    },

    // dashSingle
    {
      option: 'subnumber',
      description: 'Выводит дополнительную надпись под числом',
      elem: 'text-field',
    },

    // dashTable
    {
      option: 'rowcolor',
      description: 'Выбрать цвет которым подсветится нужная строка',
      elem: 'text-field',
    },
    {
      option: 'columncolor',
      description: 'Выбрать цвет которым подсветится нужный столбец',
      elem: 'text-field',
    },
    {
      option: 'cellcolor',
      description: 'Выбрать цвет которым подсветится нужная ячейка',
      elem: 'text-field',
    },

    // dashSingle, dashButton
    {
      option: 'color',
      description: 'Выбрать цвет значения',
      elem: 'text-field',
    },

    // dashButton
    {
      option: 'backgroundcolor',
      description: 'Выбрать цвет фона',
      elem: 'text-field',
    },

    // dashButton, MultiLine
    {
      option: 'name',
      description: 'Выбрать название кнопки',
      elem: 'text-field',
    },

    // dashTable
    {
      option: 'titles',
      description: 'Столбцы для отображения',
      elem: 'checkbox-list',
      items() {
        // this is modalSettings context
        const storeElement = this.$store.state[this.idDash][this.element];
        const savedTitles = storeElement?.options?.titles || [];
        const curTitles = storeElement?.availableTableTitles || [];
        return new Set([...savedTitles, ...curTitles]);
      },
      default: [],
    },

    // dashHeatMap, (maybe dashTable, dashTable)
    {
      group: 'Формат данных',
      option: 'dataFormat',
    },
    {
      optionGroup: 'dataFormat',
      option: 'x',
      description: 'X axis',
      elem: 'select',
      items() {
        return this.$store.state[this.idDash][this.element]?.availableTableTitles;
      },
    },
    {
      optionGroup: 'dataFormat',
      option: 'xFormat',
      description: 'X-axis format',
      elem: 'select',
      items: ['Дата', 'Строка', 'Число'],
      default: 'Строка',
    },
    {
      optionGroup: 'dataFormat',
      option: 'xSort',
      description: 'Sorting by x-axis',
      elem: 'select',
      items: ['По возрастанию', 'По убыванию'],
      default: 'По возрастанию',
    },
    {
      optionGroup: 'dataFormat',
      option: 'y',
      description: 'Y axis',
      elem: 'select',
      items() {
        return this.$store.state[this.idDash][this.element]?.availableTableTitles;
      },
    },
    {
      optionGroup: 'dataFormat',
      option: 'yFormat',
      description: 'Y-axis format',
      elem: 'select',
      items: ['Дата', 'Строка', 'Число'],
      // default: 'Дата',
    },
    {
      optionGroup: 'dataFormat',
      option: 'ySort',
      description: 'Sorting by y-axis',
      elem: 'select',
      items: ['По возрастанию', 'По убыванию'],
      default: 'По возрастанию',
    },
    {
      optionGroup: 'dataFormat',
      option: 'data',
      description: 'Значение ячейки',
      elem: 'select',
      items() {
        return this.$store.state[this.idDash][this.element]?.availableTableTitles;
      },
    },
    {
      optionGroup: 'dataFormat',
      option: 'metadata',
      description: 'metadata',
      elem: 'select',
      items() {
        return this.$store.state[this.idDash][this.element]?.availableTableTitles;
      },
    },
    {
      optionGroup: 'dataFormat',
      option: 'detailValue',
      description: 'Поле для ссылки Детали',
      elem: 'select',
      items() {
        return this.$store.state[this.idDash][this.element]?.availableTableTitles;
      },
    },
    {
      option: 'columnCount',
      description: 'Количество столбцов',
      elem: 'select',
      items: [
        { value: '1', text: '1' },
        { value: '2', text: '2' },
        { value: '3', text: '3' },
        { value: '4', text: '4' },
        { value: '6', text: '6' },
        { value: '12', text: '12' },
      ],
      default: '1',
    },
    {
      option: 'tileStyle',
      description: 'Стиль плиток',
      elem: 'custom-select',
    },

    // dashBoard
    {
      option: 'widthTile',
      description: 'Введите ширину плитки',
      elem: 'text-field',
      placeholder: '100',
    },
    {
      option: 'heightTile',
      description: 'Введите высоту плитки',
      elem: 'text-field',
      placeholder: '100',
    },

    // dashSingle
    {
      option: 'fontSize',
      description: 'Выбрать размер шрифта',
      elem: 'text-field',
      placeholder: '30',
    },

    // dashButton
    {
      option: 'underline',
      description: 'Подчеркивает текст кнопки',
      elem: 'switch',
    },
    {
      label: 'Submit',
      option: 'onButton',
      description: 'Обновлять источники данных по клику',
      elem: 'switch',
    },
    {
      relation: ['onButton'],
      label: 'SubmitByListDS',
      option: 'SubmitByListDS',
      description: 'Обновлять только источники из списка',
      default: false,
      elem: 'switch',
    },
    {
      relation: ['SubmitByListDS'],
      label: 'ListDS',
      option: 'ListDS',
      description: 'Если токен содержится в ИД',
      elem: 'checkbox-list',
      default: [],
      items() {
        const searches = this.$store.state[this.idDash]?.searches;
        if (searches && searches.map) {
          return new Set(this.$store.state[this.idDash]?.searches
            .map(({ sid }) => sid) || []);
        }
        return [];
      },
    },

    // dashSelect
    {
      option: 'multiple',
      description: 'Возможность выбора нескольких значений',
      elem: 'switch',
    },

    // dashMap, dashPieChart
    {
      option: 'showlegend',
      description: 'Показывать ли легенду',
      elem: 'switch',
    },

    // dashBoard
    {
      option: 'timeFormat',
      description: 'Выбрать формат даты и времени',
      elem: 'text-field',
      placeholder: '%Y-%m-%d %H:%M:%S',
    },

    // scatter plot
    {
      group: 'Настройки ScatterPlot',
      option: 'scatterPlotGroup',
    },
    {
      optionGroup: 'scatterPlotGroup',
      option: 'xMetric',
      description: 'Метирика для оси X',
      elem: 'select',
      items() {
        return this.$store.state[this.idDash][this.element]?.lastMetrics || [];
      },
    },
    {
      optionGroup: 'scatterPlotGroup',
      option: 'yMetric',
      description: 'Метирика для оси Y',
      elem: 'select',
      items() {
        return this.$store.state[this.idDash][this.element]?.lastMetrics || [];
      },
    },
    {
      optionGroup: 'scatterPlotGroup',
      option: 'metricGroup',
      description: 'Метирика для группировки точек',
      elem: 'select',
      default: null,
      items() {
        const items = [
          {
            text: '-- Нет --',
            value: null,
          },
        ];
        const metrics = this.$store.state[this.idDash][this.element]?.lastMetrics || [];
        return [...items, ...metrics];
      },
    },
    {
      optionGroup: 'scatterPlotGroup',
      option: 'scatterPlotLegend',
      description: 'Линия регрессии для группы',
      elem: 'select-checkbox',
      items() {
        return this.$store.state[this.idDash][this.element]?.options?.group || [];
      },
    },

    // dashSingleValue
    {
      option: 'numberPerDigit',
      description: 'Разделять число на разряды',
      elem: 'switch',
    },

    // fullWidthGroup
    {
      group: 'Библиотека примитивов',
      option: 'primitives',
    },
    {
      optionGroup: 'primitives',
      option: 'primitivesLibrary',
      elem: 'code-editor',
      isFullWidth: true,
    },

  ],
  reporstElements: [
    'table',
    'multiLine',
    'piechart',
    'guntt',
    'tile',
    'csvg',
    'ygraph',
    'bush',
    'map',
    'heatmap',
    'singleValue',
    'tune',
    'scatterPlot',
  ],
  reports: {
    table: {
      tooltip: 'Таблица',
      icon: mdiTableLarge,
    },
    multiLine: {
      tooltip: 'Мультилинейный график',
      icon: mdiChartMultiline,
    },
    piechart: {
      tooltip: 'Круговая диаграмма',
      icon: mdiChartPie,
    },
    graph: {
      tooltip: 'Граф',
      icon: mdiGraph,
    },
    guntt: {
      tooltip: 'Диаграмма Гантта',
      icon: mdiChartGantt,
    },
    tile: {
      tooltip: 'Плитка',
      icon: mdiViewGrid,
    },
    csvg: {
      tooltip: 'Изображение',
      icon: mdiBrush,
    },
    ygraph: {
      tooltip: 'Граф',
      icon: mdiGraphql,
    },
    bush: {
      tooltip: 'Кустовая схема',
      icon: mdiChartScatterPlot,
    },
    map: {
      tooltip: 'Карта',
      icon: mdiMapMarker,
    },
    heatmap: {
      tooltip: 'Тепловая карта',
      icon: mdiGrid,
    },
    singleValue: {
      tooltip: 'Показатели',
      icon: mdiNumeric,
    },
    tune: {
      tooltip: 'Ползунок',
      icon: mdiTuneVertical,
    },
    scatterPlot: {
      tooltip: 'Точечный график',
      icon: mdiScatterPlotOutline,
    },
  },
  excludes: {
    fromTitleActions: [
      'menu',
    ],
    fromDataSearches: [
      'menu',
      'picker',
      'constructorSchemes',
    ],
  },
};
