
import {  mdiGraph, mdiGestureTap, mdiBrush, mdiViewGrid, 
  mdiCardTextOutline, mdiChartGantt, mdiMapMarker, mdiChartMultiline,  mdiNumeric,  mdiTableLarge, mdiChartPie,  mdiFormatListBulleted,  mdiCalendarMonth, mdiGraphql,mdiChartScatterPlot } from '@mdi/js'

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
    }  
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
    map: mdiMapMarker
  }, 
  options: {
    multiLine: ['visible','level','boxShadow','united','lastDot','metrics', 'timeFormat', 'lastResult'], 
    piechart: ['visible','level','metricsRelation','showlegend','positionlegend', 'colorsPie','themes'],
    table: ['visible','level','boxShadow','rowcolor','columncolor','cellcolor', 'lastResult'],
    select: ['visible','level','boxShadow','multiple'],
    picker: ['visible','level'],
    graph: ['visible','level','boxShadow'],
    single: ['visible','level','subnumber','color','boxShadow','fontSize', 'lastResult'],
    button: ['visible','level','color','backgroundcolor','name','fontSize','underline'],
    textarea: ['visible','level', 'searchBtn'],
    guntt: ['visible','level','timeFormat'],
    tile: ['visible','level','widthTile','heightTile'],
    csvg: ['visible','level','tooltip'],
    ygraph: ['visible','level'],
    bush: ['visible','level'],
    map: ['visible','level','osmserver'],
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
    }
  }
}