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
    { name: 'Single Value', img: mdiNumeric, type: 'singleValue' },
    { name: 'Ползунок', img: mdiTuneVertical, type: 'tune' },
    { name: 'Накопитель', img: mdiTuneVertical, type: 'accumulators' },
    { name: 'Меню', img: mdiTuneVertical, type: 'menu' },
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
    tune: mdiTuneVertical,
    accumulators: mdiTuneVertical,
    menu: mdiTuneVertical,
  },
  options: {
    // component to options
    multiLine: [
      'visible',
      'level',
      'boxShadow',
      'metrics',
      'lastResult',
      'pinned',
    ],
    piechart: [
      'visible',
      'level',
      'metricsRelation',
      'showlegend',
      'positionlegend',
      'colorsPie',
      'themes',
      'pinned',
      'piechartSettings',
      'pieType',
    ],
    table: [
      'visible',
      'level',
      'boxShadow',
      'rowcolor',
      'columncolor',
      'cellcolor',
      'lastResult',
      'titles',
      'pinned',
    ],
    select: ['visible', 'level', 'boxShadow', 'multiple', 'pinned'],
    picker: ['visible', 'level', 'pinned'],
    graph: ['visible', 'level', 'boxShadow', 'pinned'],
    single: [
      'visible',
      'level',
      'subnumber',
      'color',
      'boxShadow',
      'fontSize',
      'lastResult',
      'pinned',
    ],
    button: [
      'visible',
      'level',
      'color',
      'backgroundcolor',
      'name',
      'fontSize',
      'underline',
      'pinned',
      'onButton',
    ],
    textarea: [
      'visible',
      'level',
      'searchBtn',
      'pinned',
      'validationGroup',
      'validationType',
      'validationNumberRangeMin',
      'validationNumberRangeMax',
      'textFontSize',
      'fontWeight',
    ],
    guntt: ['visible', 'level', 'timeFormat', 'pinned'],
    tile: ['visible', 'level', 'widthTile', 'heightTile', 'pinned'],
    csvg: ['visible', 'level', 'tooltip', 'pinned'],
    ygraph: ['visible', 'level', 'pinned'],
    bush: ['visible', 'level', 'pinned'],
    map: ['visible', 'level', 'osmserver', 'primitivesLibrary', 'pinned'],
    heatmap: [
      'visible',
      'level',
      'dataFormat',
      'pinned',
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
    singleValue: ['visible', 'level', 'pinned'],
    tune: ['visible', 'level', 'pinned'],
    accumulators: [
      'visible',
      'level',
      'boxShadow',
      'pinned',
      'metrics',
      'fillColor',
    ],
    menu: [
      'visible',
      'level',
      'boxShadow',
      'pinned',
      'metrics',
      'fillColor',
    ],
  },
  optionFields: [
    // описание типов полей и их характеристик
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
      group: 'Валидация',
      option: 'validationGroup',
    },
    {
      optionGroup: 'validationGroup',
      option: 'validationType',
      description: 'Валидация данных',
      elem: 'select',
      items: [
        { value: null, text: 'Нет вализации' },
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
        return this.$store.state[this.idDash][this.element]?.availableTableTitles;
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
      description: 'Перезапускать серчи по кнопке',
      elem: 'switch',
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
      tooltip: 'Single Value',
      icon: mdiNumeric,
    },
    tune: {
      tooltip: 'Ползунок',
      icon: mdiTuneVertical,
    },
  },
  excludes: {
    fromTitleActions: [
      'menu',
    ],
    fromDataSearches: [
      'menu',
    ],
  },
};
