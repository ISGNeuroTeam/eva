
import {  mdiGraph, mdiGestureTap, mdiBrush, mdiChartLine,   mdiPoll, mdiViewGrid, 
  mdiCardTextOutline, mdiChartGantt, mdiChartMultiline,  mdiNumeric,  mdiTableLarge,  mdiFormatListBulleted,  mdiCalendarMonth, } from '@mdi/js'

export default {  
  tools: [
    {name: 'Таблица', img: mdiTableLarge, type: 'table'},
    {name: 'Линейный график', img: mdiChartLine, type: 'lineChart'},
    {name: 'Мультилинейный график', img: mdiChartMultiline, type: 'multiLine'},
    {name: 'Cтолбцовая диаграмма', img: mdiPoll , type: 'barchart'},
    {name: 'Выпадающий список', img: mdiFormatListBulleted, type: 'select'},
    {name: 'Выбор времени', img: mdiCalendarMonth, type: 'picker'},
    {name: 'Граф', img: mdiGraph , type: 'graph'},
    {name: 'Диаграмма Гантта', img: mdiChartGantt, type: 'guntt'},
    {name: 'Плитка', img: mdiViewGrid , type: 'tile'},
    {name: 'Изображение', img: mdiBrush , type: 'csvg'},
    {name: 'Число', img: mdiNumeric, type: 'single'},
    {name: 'Кнопка', img: mdiGestureTap , type: 'button'},
    {name: 'Текстовый блок', img: mdiCardTextOutline , type: 'textarea'},
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
    lineChart: {
      width: 700,
      height: 400
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
    barchart: {
      width: 700,
      height: 450
    },
    tile: {
      width: 470,
      height: 400
    },  
    csvg: {
      width: 500,
      height: 400
    }  
  },
  icons: {
    table: mdiTableLarge,
    lineChart: mdiChartLine,
    multiLine: mdiChartMultiline,
    graph: mdiGraph,
    guntt: mdiChartGantt,
    select: mdiFormatListBulleted,
    picker: mdiCalendarMonth,
    single: mdiNumeric,
    button: mdiGestureTap,
    textarea: mdiCardTextOutline,
    barchart: mdiPoll,
    tile: mdiViewGrid,
    csvg: mdiBrush,
  }, 
  options: {
    lineChart: ['visible','level','boxShadow','lastDot'],
    multiLine: ['visible','level','boxShadow','united','lastDot','metrics'], 
    barchart: ['visible','level','boxShadow'],
    table: ['visible','level','boxShadow','rowcolor','columncolor','cellcolor'],
    select: ['visible','level','boxShadow','multiple'],
    picker: ['visible','level'],
    graph: ['visible','level','boxShadow'],
    single: ['visible','level','subnumber','color','boxShadow','fontSize'],
    button: ['visible','level','color','backgroundcolor','name','fontSize','underline'],
    textarea: ['visible','level'],
    guntt: ['visible','level','timeFormat'],
    tile: ['visible','level','widthTile','heightTile'],
    csvg: ['visible','level','tooltip']
  },
  reporstElements: ['table','lineChart','multiLine','barchart','graph','guntt','tile','csvg'],
  reports: {
    table: {
      tooltip: 'Таблица',
      icon: mdiTableLarge
    },
    lineChart: {
      tooltip: 'Линейный график',
      icon: mdiChartLine
    },
    multiLine: {
      tooltip: 'Мультилинейный график',
      icon: mdiChartMultiline
    },
    barchart: {
      tooltip: 'Столбцовая диаграмма',
      icon: mdiPoll
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
  }
}