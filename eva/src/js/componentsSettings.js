
import {  mdiGraph, mdiGestureTap, mdiBrush, mdiViewGrid,
  mdiCardTextOutline, mdiChartGantt, mdiMapMarker, mdiChartMultiline,  mdiNumeric,  mdiTableLarge, mdiChartPie,  mdiFormatListBulleted,  mdiCalendarMonth, mdiGraphql, mdiChartScatterPlot, mdiGrid } from '@mdi/js'

export default {
  tools: [
    {name: 'Таблица', img: mdiTableLarge, type: 'table'},
    {name: 'Мультилинейный график', img: mdiChartMultiline, type: 'multiLine'},
    {name: 'Карта',img: mdiMapMarker, type: 'map'},
    {name: 'Круговая диаграмма', img: mdiChartPie, type: 'piechart'},
    {name: 'Выпадающий список', img: mdiFormatListBulleted, type: 'select'},
    {name: 'Выбор времени', img: mdiCalendarMonth, type: 'picker'},
    {name: 'Граф', img: mdiGraphql , type: 'ygraph'},
    {name: 'Кустовая схема', img: mdiChartScatterPlot, type: 'bush'},
    {name: 'Диаграмма Гантта', img: mdiChartGantt, type: 'guntt'},
    {name: 'Плитка', img: mdiViewGrid , type: 'tile'},
    {name: 'Изображение', img: mdiBrush , type: 'csvg'},
    {name: 'Число', img: mdiNumeric, type: 'single'},
    {name: 'Кнопка', img: mdiGestureTap , type: 'button'},
    {name: 'Текстовый блок', img: mdiCardTextOutline , type: 'textarea'},
    {name: 'Граф_old', img: mdiGraph , type: 'graph'},
    {name: 'Тепловая карта', img: mdiGrid , type: 'heatmap'},
    {name: 'Single Value', img: mdiNumeric, type: 'singleValue'},
  ],
  size: {
    picker: {
      width: 365,
      height: 195
    },
    select: {
      width: 480,
      height: 205
    },
    piechart: {
      width: 600,
      height: 550,
    },
    graph: {
      width: 1000,
      height: 600
    },
    table: {
      width: 500,
      height: 480
    },
    single: {
      width: 345,
      height: 195
    },
    guntt: {
      width: 580,
      height: 270
    },
    multiLine: {
      width: 700,
      height: 400
    },
    button: {
      width: 345,
      height: 100
    },
    textarea: {
      width: 400,
      height: 80
    },
    tile: {
      width: 470,
      height: 400
    },
    csvg: {
      width: 500,
      height: 400
    },
    ygraph: {
      width: 930,
      height: 850
    },
    bush: {
      width: 930,
      height: 850
    },
    map: {
      width: 930,
      height: 850
    },
    heatmap: {
      width: 500,
      height: 300
    },
    singleValue: {
      width: 500,
      height: 300,
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
  },
  options: {
    multiLine: ['visible','level','boxShadow','united','lastDot','metrics', 'timeFormat', 'lastResult', 'strokeWidth', 'thememultiline', 'pinned'],
    piechart: ['visible','level','metricsRelation','showlegend','positionlegend', 'colorsPie','themes', 'pinned'],
    table: ['visible','level','boxShadow','rowcolor','columncolor','cellcolor', 'lastResult', 'titles', 'pinned'],
    select: ['visible','level','boxShadow','multiple', 'pinned'],
    picker: ['visible','level', 'pinned'],
    graph: ['visible','level','boxShadow', 'pinned'],
    single: ['visible','level','subnumber','color','boxShadow','fontSize', 'lastResult', 'pinned'],
    button: ['visible','level','color','backgroundcolor','name','fontSize','underline', 'pinned'],
    textarea: ['visible','level', 'searchBtn', 'pinned'],
    guntt: ['visible','level','timeFormat', 'pinned'],
    tile: ['visible','level','widthTile','heightTile', 'pinned'],
    csvg: ['visible','level','tooltip', 'pinned'],
    ygraph: ['visible','level', 'pinned'],
    bush: ['visible','level', 'pinned'],
    map: ['visible','level', 'osmserver', 'primitivesLibrary', 'pinned'],
    heatmap: ['visible','level', 'dataFormat', 'pinned'],
    singleValue: ['visible', 'level', 'pinned'],
  },
  reporstElements: ['table','multiLine','piechart','guntt','tile','csvg'],
  reports: {
    table: {
      tooltip: 'Таблица',
      icon: mdiTableLarge
    },
    multiLine: {
      tooltip: 'Мультилинейный график',
      icon: mdiChartMultiline
    },
    piechart: {
      tooltip: 'Круговая диаграмма',
      icon: mdiChartPie
    },
    graph: {
      tooltip: 'Граф',
      icon: mdiGraph
    },
    guntt: {
      tooltip: 'Диаграмма Гантта',
      icon: mdiChartGantt
    },
    tile: {
      tooltip: 'Плитка',
      icon: mdiViewGrid
    },
    csvg: {
      tooltip: 'Изображение',
      icon: mdiBrush
    },
    ygraph: {
      tooltip: 'Граф',
      icon: mdiGraphql
    },
    bush: {
      tooltip: 'Кустовая схема',
      icon: mdiChartScatterPlot
    },
    map: {
      tooltip: 'Карта',
      icon: mdiMapMarker
    },
    heatmap: {
      tooltip: 'Тепловая карта',
      icon: mdiGrid
    },
    singleValue: {
      tooltip: 'Single Value',
      icon: mdiNumeric
    },
  }
}
