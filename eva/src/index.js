import Vue from 'vue';
import './fonts.css';
import './scroll.css';
import './sass/main.sass';
import './scss/globalStyles.scss';

// Подключаем кастомный мконочный шрифт
import './fonts/eva-iconfont/style.css';
// import regeneratorRuntime from "regenerator-runtime";  // НЕ УДАЛЯТЬ
import PortalVue from 'portal-vue';
import AsyncComputed from 'vue-async-computed';
// сопоставляем подключенный компонент с комопнентом vue
import VueDraggableResizable from 'vue-draggable-resizable';
// подключаем компонент для выбора даты и времени
// TODO: что это за модуль, почему ide считает что он не установлен
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.common.js';
// подключаем файл с настройками хранилища Vuex
import moment from 'moment';
import * as XLSX from './js/utils/xlsx.full.min';
import store from './store/index';
// подключаем визуальную библиотеку Vuetify для красивого отображения элемнетов
import vuetify from './plugins/vuetify';
// подключаем файл с настройками адресации между компонентами
import router from './route/index';
// подключаем файл с настройками плагина для скриншотов
import screenshot from './plugins/screenshot';

import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';
import App from './App.vue';

window.XLSX = XLSX;
Vue.use(PortalVue);
// подключаем библиотеку для перемещения и изменения размеров dashboard
Vue.use(AsyncComputed);
// подключаем стили для этого компонента
Vue.component('vue-draggable-resizable', VueDraggableResizable);
// сопоставляем подключенный компонент с комопнентом vue
Vue.component('DTPicker', VueCtkDateTimePicker);

// далее объявляем компоненты так как потом будем их вызывать в html коде
Vue.component('app', require('./App.vue').default);
// верхняя панель на странице
Vue.component('header-top', require('./components/header.vue').default);
// верхняя панель на странице
Vue.component('footer-bottom', require('./components/footer.vue').default);
// обертка элемнета для drag-and-drop
Vue.component('move-able', require('./components/moveAble.vue').default);
// сам элемент
Vue.component('dash-board', require('./components/dashBoard.vue').default);
// верхняя панель дашборда с разными инструментами
Vue.component('dash-panel-bord', require('./components/dashPanelBoard.vue').default);
// модальное окно для удаления чего-либо
Vue.component('modal-delete', require('./components/modalDelete.vue').default);
// модальное окно для удаления групп и дашбордов
Vue.component('modal-delete-main', require('./components/modalDeleteFromMain.vue').default);
// модальное окно для выбора search
Vue.component('modal-search', require('./components/modalSearch.vue').default);
// модальное окно для создания нового дашборда
Vue.component('modal-create', () => import('./components/modalCreate.vue'));
// модальное окно для создания нового дашборда
Vue.component('modal-schedule', require('./components/modalScheduler.vue').default);
// модальное окно для импорта и экспорта
Vue.component('modal-exim', require('./components/modalExim.vue').default);
// модальное окно для подтверждения закрытия другого модального окна
Vue.component('modal-confirm', require('./components/modalConfirm.vue').default);
// модальное окно с подтверждением закрытия
Vue.component('modal-persistent', require('./components/modalPersistent.vue').default);
// модальное окно с источниками данных
Vue.component('modal-create-search', require('./components/modalCreateSearch.vue').default);
// модальное окно настроект
Vue.component('modal-settings', require('./components/modalSettings.vue').default);
// модальное окно скачивания
Vue.component('modal-download', require('./components/modalDownload.vue').default);
// настройки системы
Vue.component('theme-settings', require('./components/themeSettings.vue').default);
// настройки дашборда
Vue.component('dash-settings', require('./components/dashSettings.vue').default);
// настройки темы
Vue.component('modal-themes', require('./components/modalThemes.vue').default);
Vue.component('navigation-tree-view', require('./components/navigationTreeView.vue').default);
Vue.component('modal-visualisation', require('./components/modalVisualisation.vue').default);
// элемент таблицы
Vue.component('dash-tableOld', () => import('./components/dashBoardInside/dashTable.vue'));
// элемент диаграммы ганта
Vue.component('dash-guntt', () => import('./components/dashBoardInside/dashGuntt.vue'));
// элемент графа
Vue.component('dash-graph', () => import('./components/dashBoardInside/dashGraph.vue'));
// элемент графика
Vue.component('dash-lineChart', () => import('./components/dashBoardInside/dashLineChart.vue'));
// элемент графика с несоклькими линиями
Vue.component('dash-multiLine', () => import('./components/dashBoardInside/dashChart.vue'));
// элемент динамические визуализации
Vue.component(
  'dash-gridGroup',
  () => import('./components/dashBoardInside/dashGridGroup/dashGridGroup.vue'),
);
// элемент селект
Vue.component('dash-select', require('./components/dashBoardInside/dashSelect.vue').default);
// элемент выбора даты и времени
Vue.component('dash-picker', () => import('./components/dashBoardInside/dashDTPicker.vue'));
// элемент вывода числа
Vue.component('dash-single', () => import('./components/dashBoardInside/dashSingle.vue'));
// элумент круговой шкалы
Vue.component('dash-dial', () => import('./components/dashBoardInside/dashScale/dashDial.vue'));
// элемент кнопки
Vue.component('dash-button', require('./components/dashBoardInside/dashButton.vue').default);
// элемент текстового поля
Vue.component('dash-textarea', require('./components/dashBoardInside/dashTextArea.vue').default);
// элемент столбцовой диаграммы
Vue.component('dash-barchart', () => import('./components/dashBoardInside/dashBarChart.vue'));
// элемент плиточной визуализации
Vue.component('dash-tile', () => import('./components/dashBoardInside/dashTile.vue'));
// элемент  визуализации svg
Vue.component('dash-csvg', () => import('./components/dashBoardInside/dashCSvg.vue'));
// элемент  визуализации svg
Vue.component('dash-piechart', () => import('./components/dashBoardInside/dashPieChart.vue'));
// граф. новая версия
Vue.component('dash-ygraph', () => import('./components/dashBoardInside/dashYGraph.vue'));
// компонент куст. на yfiles
Vue.component('dash-bush', () => import('./components/dashBoardInside/dashBush.vue'));
// компонент карта
Vue.component('dash-map', () => import('./components/dashBoardInside/dashMap.vue'));
// компонент тепловая карта
Vue.component('dash-heatmap', () => import('./components/dashBoardInside/dashHeatMap.vue'));
// компонент ползунок
Vue.component('dash-tune', () => import('./components/dashBoardInside/dashTune.vue'));
// конструктор схем
Vue.component('dash-constructorSchemes', () => import('./components/dashBoardInside/dashConstructorScheme/dashConstructorSchemes.vue'));
Vue.component('dash-constructor-schemes-settings', () => import('./components/dashBoardInside/dashConstructorScheme/dashConstructorSchemesSettings.vue'));
Vue.component('dash-constructor-schemes-keymap', () => import('./components/dashBoardInside/dashConstructorScheme/dashConstructorSchemesKeymap.vue'));
// компонент детализация рисков
Vue.component('dash-riskReview', () => import('./components/dashBoardInside/dashRiskReview/dashRiskReview.vue'));
// компонент Single Value
Vue.component('dash-singleValue', () => import('./components/dashBoardInside/SingleValue/dashSingleValue.vue'));
// компонент Accumulators
Vue.component('dash-accumulators', () => import('./components/dashBoardInside/dashAccumulators.vue'));

// компонент Menu
Vue.component('dash-menu', require('./components/dashBoardInside/dashMenu.vue').default);

Vue.component('dash-dynamicForm', () => import('./components/dashBoardInside/dynamicForm.vue'));
// элемент создания формы
Vue.component('modal-create-form', () => import('./components/forms/modalCreateForm.vue'));
// элемент выбора элементов
Vue.component('modal-choose-element', () => import('./components/forms/modalChooseElement.vue'));
// элемент настроек элемента
Vue.component('modal-setting-form', () => import('./components/forms/modalSettingsForm.vue'));
// элемент шаблона элемнета формы
Vue.component('template-elements-form', () => import('./components/forms/formTemplateElements.vue'));
// верхняя панель на странице
Vue.component('modal-profile', () => import('./components/autorization/modalProfile.vue'));
// модальное окно для компонента Search&Reports
Vue.component('modal-report', () => import('./components/modalReports.vue'));
// модалка для удаления сущностей пользователей
Vue.component('modal-delete-profile', () => import('./components/autorization/modalDeleteProfile.vue'));
// модалка для вывода лога
Vue.component('modal-log', require('./components/autorization/modalLog.vue').default);
//  компонент для получения данных для пользователя
Vue.component('data-profile', () => import('./components/autorization/dataForProfile.vue'));
//  компонент для загрузки svg
Vue.component('modal-loading-svg', require('./components/modalLoadingSvg.vue').default);
// Точечный график
Vue.component('dash-scatterPlot', () => import('./components/dashBoardInside/dashScatterPlot.vue'));
// Частотный график
Vue.component('dash-frequencyGraph', () => import('./components/dashBoardInside/dashFrequencyGraph.vue'));
// Компонент редактора кода
Vue.component('code-editor', require('./components/codeEditor.vue').default);
// Спидометр
Vue.component('dash-gauge', () => import('./components/dashBoardInside/dashGauge/dashGauge'));
// Водопад
Vue.component('dash-waterfall', () => import('./components/dashBoardInside/dashWaterfall/dashWaterfall'));
// Таблица v2
Vue.component('dash-table', require('./components/dashBoardInside/dashTableV2/dashTableV2.vue').default);
Vue.component('dash-table-control', require('./components/dashBoardInside/dashTableV2/dashTableV2Control.vue').default);
// убирает фокус с элемена сразу либо через переданное ms v-blur="140"
Vue.directive('blur', {
  inserted(el, binding) {
    // eslint-disable-next-line no-param-reassign
    el.onfocus = (ev) => setTimeout(() => ev.target.blur(), binding.value || 0);
  },
});

moment.locale('ru');

Vue.config.productionTip = true;
// создаем экземпляр vue где подключаем самое главное переадрасицию,
// визуализацию элемнетов и хранилище
new Vue({
  store,
  vuetify,
  router,
  screenshot,
  render: (h) => h(App),
}).$mount('#mount');
