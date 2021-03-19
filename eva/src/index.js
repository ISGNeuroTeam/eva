
window.Vue = require('vue') // подключаем Vue

//import Vue from "vue"

import regeneratorRuntime from "regenerator-runtime";  // НЕ УДАЛЯТЬ

import store from './store/index.js' // подключаем файл с настройками хранилища Vuex

import storeForm from './storeForm/index.js' // подключаем файл с настройками хранилища Vuex (формы)

import storeAuth from './storeAuth/index.js' // подключаем файл с настройками хранилища Vuex (авторизация)

import vuetify from './plugins/vuetify.js' // подключаем визуальную библиотеку Vuetify для красивого отображения элемнетов

import router from './route/index.js'  // подключаем файл с настройками адресации между компонентами

import screenshot from './plugins/screenshot.js'  // подключаем файл с настройками плагина для скриншотов

import AsyncComputed from 'vue-async-computed'  // позволяет создавтаь асинхронные computed
 
import VueDraggableResizable from 'vue-draggable-resizable'   // подключаем библиотеку для перемещения и изменения размеров dashboard
Vue.component('vue-draggable-resizable', VueDraggableResizable) // сопоставляем подключенный компонент с комопнентом vue

import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';  // подключаем компонент для выбора даты и времени
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';  // подключаем стили для этого компонента
Vue.component('DTPicker', VueCtkDateTimePicker);   // сопоставляем подключенный компонент с комопнентом vue


// далее объявляем компоненты так как потом будем их вызывать в html коде

Vue.component('header-top', require('./components/header.vue').default)  // верхняя панель на странице
Vue.component('footer-bottom', require('./components/footer.vue').default)  // верхняя панель на странице
// Vue.component('main-page', require('./components/mainPage.vue').default)  // главная страница с приветствием и выбором разных дашбордов
// Vue.component('main-title', require('./components/mainTitle.vue').default)  // страница самого дашборда с разными элементами
Vue.component('move-able', require('./components/moveAble.vue').default)  // обертка элемнета для drag-and-drop
Vue.component('dash-board', require('./components/dashBoard.vue').default) // сам элемент 
Vue.component('dash-panel-bord', require('./components/dashPanelBoard.vue').default) // верхняя панель дашборда с разными инструментами
Vue.component('modal-delete', require('./components/modalDelete.vue').default)  // модальное окно для удаления чего-либо
Vue.component('modal-delete-main', require('./components/modalDeleteFromMain.vue').default)  // модальное окно для удаления групп и дашбордов
Vue.component('modal-search', require('./components/modalSearch.vue').default)  // модальное окно для выбора search
Vue.component('modal-create', require('./components/modalCreate.vue').default)  // модальное окно для создания нового дашборда
Vue.component('modal-schedule', require('./components/modalScheduler.vue').default)  // модальное окно для создания нового дашборда
Vue.component('modal-exim', require('./components/modalExim.vue').default)  // модальное окно для импорта и экспорта
Vue.component('modal-create-search', require('./components/modalCreateSearch.vue').default)  // модальное окно для импорта и экспорта
Vue.component('modal-settings', require('./components/modalSettings.vue').default)  // модальное окно для импорта и экспорта
Vue.component('theme-settings', require('./components/themeSettings.vue').default)  // настройки системы
Vue.component('dash-settings', require('./components/dashSettings.vue').default)  // настройки дашборда
Vue.component('modal-paper', require('./components/modalPaper.vue').default)  // настройки дашборда

Vue.component('dash-table', require('./components/dashBoardInside/dashTable.vue').default)  // элемент таблицы
Vue.component('dash-guntt', require('./components/dashBoardInside/dashGuntt.vue').default)  // элемент диаграммы ганта
Vue.component('dash-graph', require('./components/dashBoardInside/dashGraph.vue').default)  // элемент графа
Vue.component('dash-lineChart', require('./components/dashBoardInside/dashLineChart.vue').default)  // элемент графика
Vue.component('dash-multiLine', require('./components/dashBoardInside/dashMultiLine.vue').default)  // элемент графика с несоклькими линиями
Vue.component('dash-select', require('./components/dashBoardInside/dashSelect.vue').default)  // элемент графика
Vue.component('dash-picker', require('./components/dashBoardInside/dashDTPicker.vue').default)  // элемент выбора даты и времени
Vue.component('dash-single', require('./components/dashBoardInside/dashSingle.vue').default)  // элемент вывода числа
Vue.component('dash-button', require('./components/dashBoardInside/dashButton.vue').default)  // элемент кнопки
Vue.component('dash-textarea', require('./components/dashBoardInside/dashTextArea.vue').default)  // элемент текстового поля
Vue.component('dash-barchart', require('./components/dashBoardInside/dashBarChart.vue').default)  // элемент столбцовой диаграммы
Vue.component('dash-tile', require('./components/dashBoardInside/dashTile.vue').default)  // элемент плиточной визуализации
Vue.component('dash-csvg', require('./components/dashBoardInside/dashCSvg.vue').default)  // элемент  визуализации svg
Vue.component('dash-piechart', require('./components/dashBoardInside/dashPieChart.vue').default)  // элемент  визуализации svg
Vue.component('dash-ygraph', require('./components/dashBoardInside/dashYGraph.vue').default)  // граф. новая версия
Vue.component('dash-bush', require('./components/dashBoardInside/dashBush.vue').default)  // компонент куст. на yfiles
Vue.component('dash-map', require('./components/dashBoardInside/dashMap.vue').default) //компонент карта

//Vue.component('block-exim', require('./components/blockExim.vue').default)  // блок экспорта импорта
//Vue.component('dash-search', require('./components/dashBoardInside/dashSearch.vue').default)  // элемнет поиска пока не актуален
// Vue.component('dash-filter', require('./components/dashBoardInside/dashFilter.vue').default)  // фильтр для таблицы пока не актуален
Vue.component('modal-create-form', require('./components/forms/modalCreateForm.vue').default)  // элемент создания формы
Vue.component('modal-choose-element', require('./components/forms/modalChooseElement.vue').default)  // элемент выбора элементов
Vue.component('modal-setting-form', require('./components/forms/modalSettingsForm.vue').default)  // элемент настроек элемента
Vue.component('template-elements-form', require('./components/forms/formTemplateElements.vue').default)  // элемент шаблона элемнета формы

Vue.component('modal-profile', require('./components/autorization/modalProfile.vue').default)  // верхняя панель на странице
Vue.component('modal-report', require('./components/modalReports.vue').default)  // модальное окно для компонента Search&Reports
Vue.component('modal-delete-profile', require('./components/autorization/modalDeleteProfile.vue').default)  // модалка для удаления сущностей пользователей
Vue.component('modal-log', require('./components/autorization/modalLog.vue').default)  // модалка для вывода лога
Vue.component('data-profile', require('./components/autorization/dataForProfile.vue').default)  //  компонент для получения данных для пользователя


store.form = storeForm;
store.auth = storeAuth;

import "./fonts.css"
import "./scroll.css"
import "./yfiles/es-modules/yfiles.css"

// создаем экземпляр vue где подключаем самое главное переадрасицию, визуализацию элемнетов и хранилище
new Vue({
  store: store,
  vuetify: vuetify,
  router: router,
  screenshot: screenshot,
  el: "#app"
})

