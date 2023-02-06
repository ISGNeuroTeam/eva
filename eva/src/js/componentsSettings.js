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
  mdiDotsHorizontal,
  mdiGroup,
  mdiInboxMultipleOutline,
  mdiGauge,
} from '@mdi/js';

export default {
  tools: [
    { name: 'Выпадающий список', img: mdiFormatListBulleted, type: 'select' },
    { name: 'Динамическая форма', img: mdiInboxMultipleOutline, type: 'dynamicForm' },
    {
      name: 'Динамические визуализации',
      img: mdiGroup,
      type: 'gridGroup',
      dataSourceDescription:
        'Выберите источник данных в котором указано какие визуализации '
        + 'необходимо отрисовать.\n'
        + '#### Обязательные поля:\n'
        + '- **id** - уникальное значение, строка/число\n'
        + '- **size** - размер в сетке через запятую, пример 4,3 (ширина, высота), строка\n'
        + '- **visualization** - название (код) визуализации для добавления, строка\n'
        + '- **source** - название источника данных для визуализации, строка\n\n'
        + '#### Коды визуализаций:\n'
        + '- **multiline** - Мультилинейный график\n'
        + '- **ygraph** - Граф\n'
        + '- **singlevalue** - Показатели\n'
        + '- **piechart** - Круговая диаграмма\n'
        + '- **tile** - Плитка\n'
        + '- **accumulators** - Накопитель',
    },
    { name: 'Круговая диаграмма', img: mdiChartPie, type: 'piechart' },
    {
      name: 'Мультилинейный график',
      img: mdiChartMultiline,
      type: 'multiLine',
    },
    {
      name: 'Частотный график',
      img: mdiDotsHorizontal,
      type: 'frequencyGraph',
      dataSourceDescription:
        'Выберите источник данных.\n'
        + '#### Обязательные поля:\n'
        + '- **_time** - время unixtime, число\n'
        + '- **event** - название события, строка\n',
    },

    { name: 'Выбор времени', img: mdiCalendarMonth, type: 'picker' },
    { name: 'Граф', img: mdiGraphql, type: 'ygraph' },
    // { name: 'Граф_old', img: mdiGraph, type: 'graph' },
    { name: 'Диаграмма Гантта', img: mdiChartGantt, type: 'guntt' },
    { name: 'Изображение', img: mdiBrush, type: 'csvg' },
    { name: 'Карта', img: mdiMapMarker, type: 'map' },
    { name: 'Кнопка', img: mdiGestureTap, type: 'button' },
    { name: 'Конструктор схем', img: mdiTuneVertical, type: 'constructorSchemes' },
    { name: 'Круговая шкала', img: mdiImageFilterTiltShift, type: 'dial' },
    { name: 'Кустовая схема', img: mdiChartScatterPlot, type: 'bush' },
    { name: 'Меню', img: 'eva-edit_list_checklist', type: 'menu' },
    { name: 'Накопитель', img: 'eva-chart_bar_chart_horizontal', type: 'accumulators' },
    { name: 'Плитка', img: mdiViewGrid, type: 'tile' },
    { name: 'Показатели', img: mdiNumeric, type: 'singleValue' },
    { name: 'Ползунок', img: 'eva-basic_slider_01', type: 'tune' },
    { name: 'Таблица', img: mdiTableLarge, type: 'table' },
    { name: 'Текстовый блок', img: mdiCardTextOutline, type: 'textarea' },
    { name: 'Тепловая карта', img: mdiGrid, type: 'heatmap' },
    { name: 'Точечный график', img: mdiScatterPlotOutline, type: 'scatterPlot' },
    { name: 'Число', img: mdiNumeric, type: 'single' },
    {
      name: 'Спидометр',
      img: mdiGauge,
      type: 'gauge',
      dataSourceDescription:
        '#### Обязательные поля:\n'
        + '- ```value``` - значение спидометра, число\n'
        + '#### Доп. поля с настройками:\n'
        + '- ```metricName``` - Подпись значения\n'
        + '- ```color, min, max``` - Цвет, минимум и максимум зоны\n'
        + '#### Пример данных:\n'
        + '| value | metricName | color | min | max |\n'
        + '| :--- | :---: | :---: | ---: | ---: |\n'
        + '| 120 | Speed | | | |\n'
        + '| | | blue | -20 | 0 |\n'
        + '| | | green | 0 | 60 |\n'
        + '| | | yellow | 60 | 110 |\n'
        + '| | | #ff0000 | 110 | 180 |\n',
    },
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
    gridGroup: {
      width: 900,
      height: 600,
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
    dynamicForm: {
      width: 400,
      height: 400,
    },
    frequencyGraph: {
      width: 700,
      height: 240,
    },
    gauge: {
      width: 400,
      height: 400,
    },
  },
  icons: {
    table: mdiTableLarge,
    multiLine: mdiChartMultiline,
    gridGroup: mdiGroup,
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
    dynamicForm: mdiInboxMultipleOutline,
    frequencyGraph: mdiDotsHorizontal,
    gauge: mdiGauge,
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
      'resetValuesWhichAreNot',
    ],
    picker: [
      'showLastTimeBlock',
      'showChoseDateAndTimeBlock',
      'showRangeDateBlock',
      'showCustomInputBlock',
      'timeOutputFormat',
      'hideTimeSelect',
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
      'onButtonToken',
      'ListTokens',
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
      'readOnly',
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
    gridGroup: [
      'colNum',
      'rowHeight',
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
    constructorSchemes: [
      'visible',
      'level',
      'pinned',
      'schemeSetting',
      'searchForBuildScheme',
      'alwaysUpdateScheme',
      'isEdgeRouterSupport',
      'isBridgeEdgeSupport',
      'primitives',
      'primitivesLibrary',
    ],
    dynamicForm: ['visible', 'level', 'pinned', 'formGenerator', 'formOptions'],
    frequencyGraph: [
      'groupMetric',
      'tooltipMetrics',
    ],
    gauge: [
    ],
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
      option: 'readOnly',
      description: 'Только чтение',
      elem: 'switch',
      default: false,
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
      option: 'showLastTimeBlock',
      description: 'Показать блок: Выбор времени',
      elem: 'switch',
      default: true,
    },
    {
      option: 'showChoseDateAndTimeBlock',
      description: 'Показать блок: Выбор времени и даты',
      elem: 'switch',
      default: true,
    },
    {
      option: 'showRangeDateBlock',
      description: 'Показать блок: Диапазон дат',
      elem: 'switch',
      default: true,
    },
    {
      option: 'showCustomInputBlock',
      description: 'Показать блок: Ввод даты и времени вручную',
      elem: 'switch',
      default: true,
    },
    {
      option: 'timeOutputFormat',
      description: 'Формат даты для результата',
      elem: 'text-field',
      default: '',
      placeholder: 'Пример: YYYY-MM-DD HH:mm',
    },
    {
      option: 'hideTimeSelect',
      description: 'Скрыть выбор времени в календаре',
      elem: 'switch',
      default: false,
    },

    // dashSingle
    {
      option: 'subnumber',
      description: 'Выводит дополнительную надпись под числом',
      elem: 'text-field',
    },

    // gridGroup
    {
      option: 'colNum',
      description: 'Количество столбцов в сетке',
      elem: 'text-field',
      placeholder: '10',
    },
    {
      option: 'rowHeight',
      description: 'Высота одной ячейки',
      elem: 'text-field',
      placeholder: '60',
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
    {
      label: 'Submit',
      option: 'onButtonToken',
      description: 'Обнулять токены из списка',
      elem: 'switch',
      default: false,
    },
    {
      relation: ['onButtonToken'],
      label: 'ListTokens',
      option: 'ListTokens',
      description: '-',
      elem: 'checkbox-list',
      default: [],
      items() {
        const tokens = this.$store.state[this.idDash]?.tockens;
        if (tokens) {
          return new Set(this.$store.state[this.idDash]?.tockens
            .map(({ name }) => name) || []);
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
    {
      option: 'resetValuesWhichAreNot',
      description: 'Сбросить значения, если источник данных их не содержит',
      elem: 'switch',
      default: false,
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

    // frequencyGraph
    {
      option: 'groupMetric',
      description: 'Поле для группировки (название события)',
      elem: 'text-field',
      placeholder: 'event',
    },
    {
      option: 'tooltipMetrics',
      description: 'Метирики в тултипе',
      elem: 'checkbox-list',
      default: [],
      items() {
        const storeElement = this.$store.state[this.idDash][this.element];
        const savedTitles = storeElement?.options?.tooltipMetrics || [];
        const curTitles = storeElement?.lastMetrics || [];
        return new Set([...savedTitles, ...curTitles]);
      },
    },

    // dashSingleValue
    {
      option: 'numberPerDigit',
      description: 'Разделять число на разряды',
      elem: 'switch',
    },

    {
      group: 'Настройки ConstructorSchemes',
      option: 'schemeSetting',
    },
    {
      relation() {
        return this.isDashBoard && !!this.$store.state[this.idDash].searches;
      },
      optionGroup: 'schemeSetting',
      option: 'searchForBuildScheme',
      description: 'Источник данных для построения схемы',
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
      relation: ['searchForBuildScheme'],
      optionGroup: 'schemeSetting',
      option: 'alwaysUpdateScheme',
      description: 'Всегда обновлять схему',
      elem: 'switch',
      default: false,
    },
    {
      relation: ['searchForBuildScheme'],
      optionGroup: 'schemeSetting',
      option: 'isEdgeRouterSupport',
      description: 'Включить алгоритм маршрутизации линий',
      elem: 'switch',
      default: false,
    },
    {
      relation: ['searchForBuildScheme'],
      optionGroup: 'schemeSetting',
      option: 'isBridgeEdgeSupport',
      description: 'Включить отображение пересечения линий',
      elem: 'switch',
      default: false,
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
    // formGenerator
    {
      group: 'Исходные данные для формы',
      option: 'formGenerator',
    },
    {
      optionGroup: 'formGenerator',
      option: 'formOptions',
      elem: 'code-editor',
      isFullWidth: true,
      importantExport: true,
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
    'constructorSchemes',
    'gauge',
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
    constructorSchemes: {
      tooltip: 'Конструктор схем',
      icon: mdiTuneVertical,
    },
    gauge: {
      tooltip: 'Спидометр',
      icon: mdiGauge,
    },
  },
  excludes: {
    fromTitleActions: [
      'menu',
    ],
    fromDataSearches: [
      'menu',
      'picker',
      'dynamicForm',
    ],
  },
};
