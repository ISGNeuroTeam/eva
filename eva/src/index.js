import Vue from 'vue';
import './fonts.css';
import './scroll.css';
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
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
// подключаем файл с настройками хранилища Vuex
import moment from 'moment';
import store from './store/index';
// подключаем файл с настройками хранилища Vuex (формы)
// import storeForm from './store/storeForm/index';
// подключаем файл с настройками хранилища Vuex (авторизация)
// import storeAuth from './store/storeAuth/index';
// подключаем визуальную библиотеку Vuetify для красивого отображения элемнетов
import vuetify from './plugins/vuetify';
// подключаем файл с настройками адресации между компонентами
import router from './route/index';
// подключаем файл с настройками плагина для скриншотов
import screenshot from './plugins/screenshot';

import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';
import App from './App.vue';

Vue.use(PortalVue);
// подключаем библиотеку для перемещения и изменения размеров dashboard
Vue.use(AsyncComputed);
// подключаем стили для этого компонента
Vue.component('vue-draggable-resizable', VueDraggableResizable);
// сопоставляем подключенный компонент с комопнентом vue
Vue.component('DTPicker', VueCtkDateTimePicker);

// далее объявляем компоненты так как потом будем их вызывать в html коде
Vue.component('app', () => import('./App.vue'));
// верхняя панель на странице
Vue.component('header-top', () => import('./components/header.vue'));
// верхняя панель на странице
Vue.component('footer-bottom', () => import('./components/footer.vue'));
// главная страница с приветствием и выбором разных дашбордов
// Vue.component('main-page', () => import('./components/mainPage.vue'))
// страница самого дашборда с разными элементами
// Vue.component('main-title', () => import('./components/mainTitle.vue'))
// обертка элемнета для drag-and-drop
Vue.component('move-able', () => import('./components/moveAble.vue'));
// сам элемент
Vue.component('dash-board', () => import('./components/dashBoard.vue'));
// верхняя панель дашборда с разными инструментами
Vue.component('dash-panel-bord', () => import('./components/dashPanelBoard.vue'));
// модальное окно для удаления чего-либо
Vue.component('modal-delete', () => import('./components/modalDelete.vue'));
// модальное окно для удаления групп и дашбордов
Vue.component('modal-delete-main', () => import('./components/modalDeleteFromMain.vue'));
// модальное окно для выбора search
Vue.component('modal-search', () => import('./components/modalSearch.vue'));
// модальное окно для создания нового дашборда
Vue.component('modal-create', () => import('./components/modalCreate.vue'));
// модальное окно для создания нового дашборда
Vue.component('modal-schedule', () => import('./components/modalScheduler.vue'));
// модальное окно для импорта и экспорта
Vue.component('modal-exim', () => import('./components/modalExim.vue'));
// модальное окно для подтверждения закрытия другого модального окна
Vue.component('modal-confirm', () => import('./components/modalConfirm.vue'));
// модальное окно с подтверждением закрытия
Vue.component('modal-persistent', () => import('./components/modalPersistent.vue'));
// модальное окно с источниками данных
Vue.component('modal-create-search', () => import('./components/modalCreateSearch.vue'));
// модальное окно настроект
Vue.component('modal-settings', () => import('./components/modalSettings.vue'));
// настройки системы
Vue.component('theme-settings', () => import('./components/themeSettings.vue'));
// настройки дашборда
Vue.component('dash-settings', () => import('./components/dashSettings.vue'));
// настройки темы
Vue.component('modal-themes', () => import('./components/modalThemes.vue'));
// элемент таблицы
Vue.component('dash-table', () => import('./components/dashBoardInside/dashTable.vue'));
// элемент диаграммы ганта
Vue.component('dash-guntt', () => import('./components/dashBoardInside/dashGuntt.vue'));
// элемент графа
Vue.component('dash-graph', () => import('./components/dashBoardInside/dashGraph.vue'));
// элемент графика
Vue.component('dash-lineChart', () => import('./components/dashBoardInside/dashLineChart.vue'));
// элемент графика с несоклькими линиями
// Vue.component(
//   'dash-multiLine',
//   () => import('./components/dashBoardInside/MultiLine/MultiLine.vue')
// );
Vue.component('dash-multiLine', () => import('./components/dashBoardInside/dashChart.vue'));
// элемент графика
Vue.component('dash-select', () => import('./components/dashBoardInside/dashSelect.vue'));
// элемент выбора даты и времени
Vue.component('dash-picker', () => import('./components/dashBoardInside/dashDTPicker.vue'));
// элемент вывода числа
Vue.component('dash-single', () => import('./components/dashBoardInside/dashSingle.vue'));
// элумент круговой шкалы
Vue.component('dash-dial', () => import('./components/dashBoardInside/dashScale/dashDial.vue'));
// элемент кнопки
Vue.component('dash-button', () => import('./components/dashBoardInside/dashButton.vue'));
// элемент текстового поля
Vue.component('dash-textarea', () => import('./components/dashBoardInside/dashTextArea.vue'));
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
// компонент Single Value
Vue.component('dash-singleValue', () => import('./components/dashBoardInside/SingleValue/dashSingleValue.vue'));
// компонент Accumulators
Vue.component('dash-accumulators', () => import('./components/dashBoardInside/dashAccumulators.vue'));
// компонент Menu
Vue.component('dash-menu', () => import('./components/dashBoardInside/dashMenu.vue'));
// элемнет поиска пока не актуален
// Vue.component('dash-search', () => import('./components/dashBoardInside/dashSearch.vue'))
// фильтр для таблицы пока не актуален
// Vue.component('dash-filter', () => import('./components/dashBoardInside/dashFilter.vue'))
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
Vue.component('modal-log', () => import('./components/autorization/modalLog.vue'));
//  компонент для получения данных для пользователя
Vue.component('data-profile', () => import('./components/autorization/dataForProfile.vue'));
//  компонент для загрузки svg
Vue.component('modal-loading-svg', () => import('./components/modalLoadingSvg.vue'));
// Точечный график
Vue.component('dash-scatterPlot', () => import('./components/dashBoardInside/dashScatterPlot.vue'));
// Компонент редактора кода
Vue.component('code-editor', () => import('./components/codeEditor.vue'));
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
