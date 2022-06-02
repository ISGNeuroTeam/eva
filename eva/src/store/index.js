// хранилище Vuex

import Vue from 'vue';
import Vuex from 'vuex';
// это подключаем чтобы после перезагрузки страницы он сохранял состояние
import createPersistedState from 'vuex-persistedstate';

import store from './store'; // это подключаем чтобы после перезагрузки страницы он сохранял состояние
import auth from './storeAuth/store';
import form from './storeForm/store';
import rest from './storeRest';
import restAuth from './storeAuth/storeRest';
import themes from '../js/themeSettings';
import settings from '../js/componentsSettings';
import { filterCompile } from '../components/dash-filter-panel/utils/filter-otl-compile';
import dataResearch from './dataResearch/store';
import notify from './storeNotify/store';

Vue.use(Vuex);

const defaultOptions = {
  change: false,
  visible: true,
  level: 1,
  boxShadow: false,
  lastResult: false,
  searchBtn: false,
};

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    ...store.state,
    theme: {
      name: 'dark',
      settings: themes.dark,
    },
  },
  mutations: {
    ...store.mutations,
    /* метод для добавления реактивных свойств
   * payload - массив объектов {object, prop, value}
   * */
    setState(state, payload) {
      payload.forEach(({ object, prop, value }) => {
        Vue.set(object, prop, value);
      });
    },
    setDefaultOptions(state, { idDash, id }) {
      Vue.set(
        state[idDash][id],
        'options',
        {},
      );
      Object.keys(defaultOptions).forEach((option) => {
        Vue.set(
          state[idDash][id].options,
          option,
          defaultOptions[option],
        );
      });
    },
    // проверяет и создает объект в хранилище для настроек
    // path - это idDash либо произвольное место хранения настроек например research
    // element - например multiLine, multiLine-2, table, table-2 ...
    prepareSettingsStore(state, { path, element }) {
      let localPath = path;
      const idExists = element !== undefined && element !== '';
      if (typeof localPath === 'number') {
        localPath = localPath.toString();
      }
      if (!state[localPath.toString()]) {
        state[localPath] = {};
        if (idExists) {
          state[localPath][element] = {};
        }
      }
      if (idExists) {
        if (!state[localPath][element].modalSettings) {
          state[localPath][element].modalSettings = {
            element: '',
            status: false,
          };
        }
        if (!state[localPath][element].options) {
          // state[localPath][element].options = {};
          Vue.set(state[localPath][element], 'options', {});
        }
      } else {
        if (!state[localPath].modalSettings) {
          state[localPath].modalSettings = {
            element: '',
            status: false,
          };
        }
        if (!state[localPath].options) {
          Vue.set(state[localPath], 'options', {});
          // state[localPath].options = {};
        }
      }
    },
    setNameDash(state, { idDash, id, name }) {
      // изменения имени самого элемента
      state[idDash][id].name_elem = name;
    },
    setPosDash(state, {
      idDash, id, top, left,
    }) {
      // задание позиции элемента
      state[idDash][id].top = top;
      state[idDash][id].left = left;
    },
    setSizeDash(state, {
      idDash, id, width, height,
    }) {
      // задание размеров элемента
      state[idDash][id].width = width;
      state[idDash][id].height = height;
    },
    setSearch(state, { idDash, reload, search }) {
      const checkId = search.sid;
      search.status = search.isStartImmediately ? 'empty' : 'stop';
      if (reload) {
        state[idDash].searches.forEach((item, i) => {
          if (checkId === item.sid || search.currentSid === item.sid) {
            delete search.currentSid;
            Vue.set(state[idDash].searches, i, search);
          }
        });
      } else {
        state[idDash].searches.push({ ...search });
      }
    },
    // удаление источника данных
    deleteSearch(state, search) {
      // если нужный ИС передан
      if (search) {
        // то ищем его среди всех ИС фильтруя массив и отбрасывая его из массива
        // и обновляем массив ИС
        state[search.idDash].searches = state[search.idDash].searches
          .filter((item) => item.sid !== search.sid);
      }
    },
    // открывает или закрывает модальное окно с ИС
    setModalSearch(state, modal) {
      if (!state[modal.id].modalSearch) {
        Vue.set(state[modal.id], 'modalSearch', {});
        Vue.set(state[modal.id].modalSearch, 'elem', '');
        Vue.set(state[modal.id].modalSearch, 'status', true);
      }
      state[modal.id].modalSearch.status = modal.status;
      // если пришёл элемент с которого октрыли модальное окно
      if (modal.elem) {
        // то и его занесем в объект настроек
        state[modal.id].modalSearch.elem = modal.elem;
      }
    },
    // открывает модалку импорта экспорта
    setModalExin(state, modal) {
      // одна модалка для главной странице
      if (modal.idDash === 'layout') {
        state.modalExin.status = modal.status;
        if (modal.event) {
          state.modalExin.event = modal.event;
        }
      } else {
        // и одна на странице дашборда
        state[modal.idDash].modalExin.status = modal.status;
        if (modal.event) {
          state[modal.idDash].modalExin.event = modal.event;
        }
      }
    },
    // позволяет запустить выбранный ИС для нужного элемента
    setDataSource(state, datasource) {
      // получаем элемнет для которого будем обновлять данные
      const { elem } = state[datasource.id].modalSearch;
      // задаем id ИС
      state[datasource.id][elem].search = datasource.searchid;
      // сообщаем что нужно обновить
      state[datasource.id][elem].should = true;
      // и перключить на вкладку с результатами
      state[datasource.id][elem].switch = true;
      if (state[datasource.id].tockens?.length > 0) {
        state[datasource.id].tockens.forEach((item) => {
          if (item.elem === elem) {
            item.value = '';
          }
        });
      }
      if (elem.split('-')[0] === 'select') {
        if (state[datasource.id][elem].selected) {
          state[datasource.id][elem].selected = {
            elem: '',
            elemlink: '',
            elemDeep: '',
          };
        }
      }
    },
    // TODO fix table
    // отдельно можно переключать отображения вариантов элемента между выбором ИС и результатами
    setSwitch(state, { idDash, id, status }) {
      state[idDash][id].switch = status;
      if (id.includes('table')) {
        delete state[idDash][id].selectedTableTitles;
        delete state[idDash][id].availableTableTitles;
      }
    },
    // отдельно можно дать понять стоит ли обновлять данные, например при загрузки страницы.
    setShould(state, { idDash, id, status }) {
      state[idDash][id].should = status;
    },
    changeTokenName(state, { tocken, idDash, value }) {
      //  проверяем есть ли такой токен уже
      const token = state[idDash].tockens.find((item) => item.name === tocken.name);
      if (token) {
        token.name = value;
      }
    },
    updateManualTokens(state, { idDash }) {
      if (state[idDash]?.tockens?.length > 0) {
        state[idDash].tockens.forEach((token) => {
          if (token.onButton) {
            state[idDash].searches.forEach((search) => {
              if (search.original_otl.includes(`$${token.name}$`)) {
                this.commit('updateSearchStatus', {
                  idDash,
                  id: search.id,
                  sid: search.sid,
                  status: 'empty',
                });
              }
            });
          }
        });
      }
    },
    // TODO refactor
    // сохранение токена в хранилище
    setTocken(state, { token, idDash, value }) {
      const id = Object.keys(state[idDash].tockens)
        .find((item) => state[idDash].tockens[item].name === token.name
          && state[idDash].tockens[item].action === token.action
          && state[idDash].tockens[item].capture === token.capture);
      // если токен нашелся
      if (id) {
        // если value задано, то присваиваем его токену
        if (value) {
          state[idDash].tockens[id].value = value;
          // если нет, то присваиваем токену дефолтное значение
        } else {
          state[idDash].tockens[id].value = state[idDash].tockens[id].defaultValue;
        }

        // если события вообще есть
        if (state[idDash].events) {
          // пробегаемся по всем
          const eventAll = state[idDash].events.reduce((acc, item, i) => {
            // если в нашем событии есть упоминание нашего токена
            if (item.token === state[idDash].tockens[id].name) {
              // то добовляем событие в заготовленный массив
              return [
                ...acc,
                i,
              ];
            }
            return acc;
          }, []);

          // если список события с токеном внутри есть
          if (eventAll.length !== 0) {
            let data = null;
            // пробегаемся по всем событиям
            eventAll.forEach((item) => {
              let localValue;
              let foundItem;

              // проверяем какое именно событие должно произойти
              switch (state[idDash].events[item].compare) {
                case 'equals':
                  // в случаях когда нужно сравнить значения токена по равенству,
                  // это может быть строка, а значит нужно обрезать пробелы,
                  // чтобы сравнение было корректным
                  localValue = state[idDash].tockens[id].value.replace(/\s/g, '');
                  // сравниваем значения в событии и значение токена
                  if (localValue === state[idDash].events[item].tokenval) {
                    // вызываем метод обновляйщий элемент
                    this.commit('letEventSet', {
                      events: [state[idDash].events[item]],
                      idDash,
                    });
                  }
                  break;
                // все тоже самое для других событий
                case 'over':
                  if (
                    state[idDash].tockens[id].value
                    > state[idDash].events[item].tokenval
                  ) {
                    this.commit('letEventSet', {
                      events: [state[idDash].events[item]],
                      idDash,
                    });
                  }
                  break;
                case 'less':
                  if (
                    state[idDash].tockens[id].value
                    < state[idDash].events[item].tokenval
                  ) {
                    this.commit('letEventSet', {
                      events: [state[idDash].events[item]],
                      idDash,
                    });
                  }
                  break;
                // для события вхождения значеия в массив
                case 'in':
                  // отбрасываем скобки массива и разбиваем на масив элемнетов по запятой
                  data = state[idDash].events[item].tokenval
                    .replace(/\[|\]/g, '')
                    .split(',');

                  foundItem = data.find(
                    (dataItem) => `${dataItem}` === `${state[idDash].tockens[id].value}`,
                  );
                  if (foundItem) {
                    // если число нашлось
                    this.commit('letEventSet', {
                      events: [state[idDash].events[item]],
                      idDash,
                    }); // вызываем метод обновляйщий элемент
                  }
                  break;
                // тоже самое для условия что токен внутри рамок массива
                case 'between':
                  data = state[idDash].events[item].tokenval
                    .replace(/\[|\]/g, '')
                    .split(',');
                  if (state[idDash].tockens[id].value >= data[0]
                    && state[idDash].tockens[id].value <= data[1]) {
                    // если число нашлось
                    this.commit('letEventSet', {
                      events: [state[idDash].events[item]],
                      idDash,
                    }); // вызываем метод обновляйщий элемент
                  }
                  break;
                default:
                  break;
              }
            });
          }
        }

        const tempToken = state[idDash].tockens.find(
          (el) => el.name === token.name,
        );

        state[idDash].searches.forEach((search) => {
          if (
            search.original_otl.includes(`$${token.name}$`)
            && !tempToken.onButton
          ) {
            this.commit('updateSearchStatus', {
              idDash,
              sid: search.sid,
              status: 'empty',
            });
          }
        });
      }
      // Add filterParam(for multiLine)
      state[idDash].tockens.forEach((localToken) => {
        if (localToken.name === token.name) {
          localToken.filterParam = token.filterParam;
        }
      });
      // Add value to temp values of filter
      if (state[idDash].focusedFilter) {
        this.commit('addTokenToFilterParts', { token, idDash, value });
      }
    },
    setActions(state, { idDash, id, actions }) {
      // устанавливаем список событий для элемента
      state[idDash][id].actions = actions;
    },
    setReportSearch(state, search) {
      Vue.set(state.reports.searches, search.sid, search);
      Vue.set(state.reports.table, 'search', search.sid);
    },
    setReportUserSettings(state, value) {
      Vue.set(state.reports.userSettings, 'heightCodemirror', value);
    },
    setPickerDate(state, { idDash, id, date }) {
      // отдельно можно проверить если ИС прикреплен то переключить и обновить
      state[idDash][id].date = date;
      state[idDash][id].changeDate = !state[idDash][id].changeDate;
    },
    setSelected(state, {
      idDash, id, element, value,
    }) {
      // храним выбранные пользователем данные
      if (!state[idDash][id].selected) {
        state[idDash][id].selected = {
          elem: '',
          elemlink: '',
          elemDeep: '',
        };
      }
      state[idDash][id].selected[element] = value;
    },
    createElementSelected(state, { idDash, id }) {
      state[idDash][id].selected = {
        elem: '',
        elemlink: '',
        elemDeep: '',
      };
    },
    setElementSelected(state, {
      idDash, id, element, value,
    }) {
      state[idDash][id].selected[element] = value;
    },
    setDash(state, { data, getters }) {
      // обновляем порядок layout на странице
      const dashboard = data;
      if (!state[dashboard.id]) {
        Vue.set(state, dashboard.id, {});
        Vue.set(state[dashboard.id], 'name', dashboard.name);
        Vue.set(state[dashboard.id], 'idgroup', dashboard.idgroup);
        Vue.set(state[dashboard.id], 'currentTab', dashboard?.currentTab || 1);
        Vue.set(state[dashboard.id], 'modified', dashboard.modified);
        Vue.set(state[dashboard.id], 'tabs', false);
        // TODO: убрать геттер из мутации
        getters({ id: dashboard.id, first: true });
      }
    },
    changeDashboard(state, { data }) {
      const dashboard = data;
      if (state[dashboard.id]) {
        Vue.set(state[dashboard.id], 'name', dashboard.name);
        Vue.set(state[dashboard.id], 'idgroup', dashboard.idgroup);
        Vue.set(state[dashboard.id], 'modified', dashboard.modified);
      }
    },
    updateDash(state, { dash, modified }) {
      if (dash.body !== '') {
        state[dash.id] = {
          ...state[dash.id],
          ...JSON.parse(dash.body),
        };
      }
      if (modified !== '') {
        state[dash.id].modified = modified;
      }
    },
    setLoading(state, {
      idDash, search, should, error, name,
    }) {
      state[idDash].elements.forEach((item) => {
        if (state[idDash][item].search === search) {
          if (!state[idDash][item].loading) {
            state[idDash][item].loading = '';
          }

          state[idDash][item].loading = should;
        } else if (search
            && state[idDash][item].name_elem.toLowerCase() === name.toLowerCase()) {
          state[idDash][item].loading = should;
        } else {
          state[idDash][item].loading = should;
        }
      });
      Vue.set(state, 'logError', error);
    },
    setErrorLogs(state, error) {
      Vue.set(state, 'logError', error);
    },
    // TODO: refactor
    // TODO: rename method
    createDashboardVisualization(state, { idDash, dashboard, spaceName }) {
      // создаем новый элемент
      const dash = dashboard;
      let id = Object.keys(dash)[0];
      const data = dash[id];
      if (spaceName) {
        id = `${id}-${spaceName}`;
        if (state[idDash] && !state[idDash][`elements${spaceName}`]) {
          Vue.set(state[idDash], `elements${spaceName}`, []);
        }
      } else if (!state[idDash]?.elements) {
        Vue.set(state[idDash], 'elements', []);
      }

      const stateElements = spaceName ? state[idDash][`elements${spaceName}`] : state[idDash]?.elements;
      const elements = stateElements.filter((item) => item.indexOf(id) !== -1);
      // и если есть
      if (elements.length > 0) {
        // флаг чтобы понимать есть ли такой элемнет уже
        let j = -1;
        // пробегаем по циклу размером с общее число элементов
        for (let i = 1; i < elements.length + 2; i += 1) {
          // находим первое свободное для размещение место (свободный id)
          if (!stateElements.includes(`${id}-${i}`)) {
            // и запоминаем его
            j = i;
          }
        }

        // если и правда мы не можем добавить элемент, потому что он уже есть
        if (j !== -1) {
          // то проверяем если он не самый первый
          if (j !== 1) {
            // то смлео заполняем свободное место
            id = `${id}-${j}`;
          }
          // а если вполне можем добавить элеммент который изначлаьно хотели
        } else {
          // то добвляем элемент
          id = `${id}-${elements.length + 1}`;
        }
      }
      state[idDash][id] = data;
      state[idDash][id].tab = state[idDash].currentTab || 1;
      stateElements.push(id);
    },
    // удаляем элемент с помощью модального окна
    deleteDashboardVisualization(state, {
      page, idDash, id, name, spaceName,
    }) {
      let localId = -1;
      // проверяем что именно удаляем
      if (page === 'dash') {
        // проверяем относится ли элемент к какому нибудь списку имен
        const elements = spaceName ? `elements${spaceName}` : 'elements';
        // потом ищем его в массиве элементов дашборда
        state[idDash][elements].forEach((item, i) => {
          if (item === id) {
            localId = i;
          }
        });
        // и удаляем его в массиве элемнетов
        state[idDash][elements].splice(localId, 1);
        // и потом сам элемнет тоже удаляем
        delete state[idDash][id];
      } else if (page === 'tocken') {
        localId = -1;
        state[idDash].tockens.forEach((item, i) => {
          if (item.name === name) {
            localId = i;
          }
        });
        state[idDash].tockens.splice(localId, 1);
      } else if (page === 'search') {
        localId = -1;
        state[idDash].searches.forEach((item, i) => {
          if (item.sid === name) {
            localId = i;
          }
        });
        state[idDash].searches.splice(localId, 1);
      }
    },
    // добовляем данные об удаляемом объекте в модальное окно
    setModalDelete(state, modalsetting) {
      if (!state[modalsetting.id].modalDelete) {
        Vue.set(state[modalsetting.id], 'modalDelete', {});
        Vue.set(state[modalsetting.id].modalDelete, 'active', false);
        Vue.set(state[modalsetting.id].modalDelete, 'id', '');
        Vue.set(state[modalsetting.id].modalDelete, 'name', '');
      }
      if (
        modalsetting.page === 'dash'
        || modalsetting.page === 'tocken'
        || modalsetting.page === 'search'
      ) {
        // если удаляем элемент то его характеристики заносим в объект моадльного окна
        Vue.set(state[modalsetting.id].modalDelete, 'active', modalsetting.status);
        Vue.set(state[modalsetting.id].modalDelete, 'id', modalsetting.elem);
        Vue.set(state[modalsetting.id].modalDelete, 'name', modalsetting.name);
        if (!modalsetting.status) {
          Vue.set(state[modalsetting.id].modalDelete, 'page', '');
        } else {
          Vue.set(state[modalsetting.id].modalDelete, 'page', modalsetting.page);
        }
      }
    },
    // добовляем данные о скриншоте
    setEvents(state, event) {
      if (!state[event.idDash].events && !state[event.idDash].eventFull) {
        state[event.idDash].events = [];
        state[event.idDash].eventFull = '';
      }
      if (event.event != null) {
        state[event.idDash].events = event.event;
        state[event.idDash].eventFull = event.eventFull;
      } else {
        state[event.idDash].events = [];
        state[event.idDash].eventFull = '';
      }
    },
    // добовляем данные о скриншоте
    setScreenShot(state, screen) {
      state[screen.id].screenshot = screen.screen;
    },
    // утсанавливает объект для планировщика
    setSchedule(state, schedule) {
      state[schedule.idDash].schedulers[schedule.sid] = {
        every: schedule.every,
        time: schedule.time,
        everyLast: schedule.everyLast,
        timeLast: schedule.timeLast,
        schedulerID: schedule.schedulerID,
      };
    },
    setSchedulerID(state, { idDash, search, schedulerID }) {
      Vue.set(state[idDash].schedulers[search], 'schedulerID', schedulerID);
    },
    // удаляет объект с планировщиком
    deleteSchedule(state, { idDash, sid }) {
      delete state[idDash].schedulers[sid];
    },
    // TODO createTockens vs setTocken
    // создаем токен
    createTockens(state, { idDash, tocken }) {
      // console.log('tockens.push');
      let foundItem = null;
      //  проверяем есть ли такой токен уже
      if (state[idDash]?.tockens) {
        foundItem = state[idDash].tockens.find((item) => item.name === tocken.name);
      } else {
        Vue.set(state[idDash], 'tockens', []);
      }
      if (foundItem) {
        //  если такой токен уже есть
        foundItem.name = tocken.name; // обновляем его данные
        foundItem.elem = tocken.elem;
        foundItem.action = tocken.action;
        foundItem.capture = tocken.capture;
        foundItem.prefix = tocken.prefix;
        foundItem.sufix = tocken.sufix;
        foundItem.delimetr = tocken.delimetr;
        foundItem.defaultValue = tocken.defaultValue;
        foundItem.onButton = tocken.onButton;
      } else {
        // а елси нету
        state[idDash].tockens.push(
          // то создаем новый токен
          {
            name: tocken.name,
            elem: tocken.elem,
            action: tocken.action,
            capture: tocken.capture,
            prefix: tocken.prefix,
            sufix: tocken.sufix,
            delimetr: tocken.delimetr,
            defaultValue: tocken.defaultValue,
            value: '',
            onButton: tocken.onButton,
          },
        );
      }
    },
    createFilter(state, { filter, index }) {
      if (!state[filter.idDash].filters) {
        Vue.set(state[filter.idDash], 'filters', []);
      }
      const foundFilter = state[filter.idDash].filters.find(
        (filterInState) => filterInState.id === filter.id,
      );
      if (foundFilter) {
        // eslint-disable-next-line no-alert
        alert('Фильтр с таким именем уже существует');
      } else {
        state[filter.idDash].filters.splice(index + 1, 0, filter);
      }
    },
    deleteFilter(state, filter) {
      if (!state[filter.idDash].filters) {
        Vue.set(state[filter.idDash], 'filters', []);
      }
      const index = state[filter.idDash].filters.indexOf(filter);
      state[filter.idDash].filters.splice(index, 1);
    },
    saveFilterPart(state, { idDash, filterPart, filterPartIndex }) {
      // TODO: Number.isFinite избыточно
      if (Number.isFinite(filterPartIndex)) {
        state[idDash].focusedFilter.parts[filterPartIndex] = filterPart;
      } else {
        state[idDash].focusedFilter.parts.push({ ...filterPart });
      }
    },
    setLibrary(state, options) {
      Vue.set(
        state[options.idDash][options.id].options,
        'library',
        options.library,
      );
    },
    // добовляем данные о скриншоте
    setOptions(state, {
      idDash, id, options, titles,
    }) {
      // пробегаемся по всем настройкам, что к нам пришли
      Object.keys(options).forEach((item) => {
        // если это натсройка change
        if (item === 'change') {
          // то ее всегда меняем на противоположную, давая понять, что натсройки обновились
          state[idDash][id].options.change = !state[idDash][id].options.change;
        } else {
          // для любой другой настройки
          // просто обновляем ее значение на новое
          Vue.set(
            state[idDash][id].options,
            item,
            options[item],
          );
        }
      });
      if (titles) {
        Vue.set(state[idDash][id], 'selectedTableTitles', titles);
      }
    },
    updateOptions(state, { idDash, idElement, options }) {
      // state[idDash][idElement].options = options;
      Vue.set(state[idDash][idElement], 'options', options);
    },
    // метод который обновляет какое-либо свойство у элемнета
    letEventSet(state, events) {
      events.events.forEach((item) => {
        // если опций еще нет
        if (!state[events.idDash][item.target].options) {
          // то создаем объект опций с плем change по умолчанию
          Vue.set(state[events.idDash][item.target], 'options', {
            change: false,
          });
        }
        // переводи строковое значение в bolean
        if (item.value === 'true') {
          item.value = true;
        }
        if (item.value === 'false') {
          item.value = false;
        }
        Vue.set(
          state[events.idDash][item.target].options,
          item.prop,
          item.value,
        );
      });
    },
    // метод влияющий на модалку настроек
    setModalSettings(state, {
      idDash, status, element, titles,
    }) {
      // если объект с натсройками модального окна натсроек еще нет
      if (!state[idDash]?.modalSettings) {
        // то создаем его сразу реактивным
        Vue.set(state[idDash], 'modalSettings', {});
        Vue.set(state[idDash].modalSettings, 'element', '');
        Vue.set(state[idDash].modalSettings, 'status', false);
      }
      // и заносим пару значения вроде элемнета и статуса,
      // чтобы понимать открыто оно или закрыто и чьи настройки подгрузить
      state[idDash].modalSettings.status = status;
      state[idDash].modalSettings.element = element;
      if (titles) {
        Vue.set(
          state[idDash][element],
          'availableTableTitles',
          titles,
        );
      }
      if (
        element
        && (element.includes('table')
          || element.includes('heatmap'))
      ) {
        if (!state[idDash][element].selectedTableTitles) {
          Vue.set(
            state[idDash][element],
            'selectedTableTitles',
            titles,
          );
        }
      }
    },
    setDefaultTheme(state, themeName) {
      state.theme.name = themeName;
      state.theme.settings = themes[themeName];
    },
    setTheme(state, theme) {
      // устанавливает объект цвета в хранилище
      state.theme.name = theme.themeName;
      state.theme.settings = { ...themes.dark, ...theme.settings };
    },
    // TODO: мутация ничего не делает
    // устанавливает объект цвета в хранилище
    setThemeBack(state, theme) {
      rest.setThemeBack(theme, restAuth);
    },
    setGraphTree(state, {
      idDash, id, tree, direct, alies,
    }) {
      // мтеод сохраняет структуру и позицию графа
      state[idDash][id].tree = tree;
      state[idDash][id].direct = direct;
      state[idDash][id].alies = alies;
    },
    setTextArea(state, { idDash, id, textarea }) {
      if (!state[idDash][id].textarea) {
        state[idDash][id].textarea = '';
      }
      state[idDash][id].textarea = textarea;
    },
    createReportSearch(state) {
      if (!state.reports) {
        Vue.set(state, 'reports', {});
        Vue.set(state.reports, 'elements', settings.reporstElements);
        Vue.set(state.reports, 'searches', {});
        Vue.set(state.reports, 'userSettings', {});
        settings.reporstElements.forEach((item) => {
          Vue.set(state.reports, item, {});
          Vue.set(state.reports[item], 'search', '');
          Vue.set(state.reports[item], 'should', false);
        });
      }
    },
    deleteDashFromMain(state, { id, name }) {
      if (id && state[id]) {
        delete state[id];
      }
      const localName = name[0].toUpperCase() + name.slice(1);
      restAuth.putLog(`Удален дашборд ${localName} с id ${id}`);
    },
    // TODO: избавится от этого метода, он вычищает не только root,
    //  но и все отсальные модули
    clearState(state) {
      const exclude = [
        'auth',
        'dataResearch',
        'form',
        'theme',
        'notify',
      ];
      Object.keys(state).forEach((key) => {
        if (!exclude.includes(key)) {
          delete state[key];
        }
      });
      window.localStorage.clear();
    },
    setMetricsMulti(state, { metrics, idDash, id }) {
      const localMetrics = metrics.map((metric) => ({ name: metric, units: '' }));
      if (!state[idDash][id].metrics) {
        Vue.set(state[idDash][id], 'metrics', []);
      } else {
        localMetrics.forEach((metric) => {
          const temp = state[idDash][id].metrics.find(
            (m) => m.name === metric.name,
          );
          if (temp) {
            metric.units = temp.units;
          }
        });
      }
      state[idDash][id].metrics = localMetrics;
    },
    setMultilineMetricUnits(state, { idDash, elem, units }) {
      state[idDash][elem].metrics.forEach((metric) => {
        metric.units = units[metric.name] ? units[metric.name] : '';
      });
    },
    setMetricsPie(state, { metrics, idDash, id }) {
      Vue.set(state[idDash][id], 'options', state[idDash][id].options);
      const localMetrics = [...[], ...metrics];
      if (!state[idDash][id].options.metricsRelation) {
        Vue.set(state[idDash][id].options, 'metricsRelation', {});
        Vue.set(state[idDash][id].options.metricsRelation, 'relations', localMetrics);
        Vue.set(state[idDash][id].options.metricsRelation, 'namesMetric', [
          'Категория',
          'Процентное соотношение',
        ]);
      }
      Vue.set(state[idDash][id].options.metricsRelation, 'metrics', localMetrics);
    },
    setThemePie(state, dash) {
      const localThemes = { ...{}, ...dash.themes };
      if (!state[dash.idDash][dash.id].options.themes) {
        state[dash.idDash][dash.id].options.themes = localThemes;
      }
    },
    setSizeGrid(state, { id, grid }) {
      if (!state[id].grid) {
        Vue.set(state[id], 'grid', {});
      }
      state[id].grid = grid;
    },
    setDragResize(state, { id, item }) {
      if (!state[id].dragRes) {
        Vue.set(state[id], 'dragRes', 'true');
      }
      state[id].dragRes = item;
    },
    setGridShow(state, { id, item }) {
      if (!state[id].gridShow) {
        Vue.set(state[id], 'gridShow', 'true');
      }
      state[id].gridShow = item;
    },
    addNewTab(state, { idDash, tabID, tabName }) {
      if (!state[idDash].tabList) {
        Vue.set(state[idDash], 'tabList', []);
      }
      state[idDash].tabList.push({
        id: tabID,
        name: tabName,
      });
    },
    changeCurrentTab(state, { idDash, tab }) {
      Vue.set(state[idDash], 'currentTab', tab);
    },
    deleteDashTab(state, { idDash, tabID }) {
      if (state[idDash]?.elements && state[idDash].elements?.length > 0) {
        const tempArr = state[idDash].elements.filter((elem) => {
          if (state[idDash][elem].tab === tabID) {
            delete state[idDash][elem];
            return true;
          }
          return false;
        });
        state[idDash].elements = state[idDash].elements.filter(
          (elem) => !tempArr.includes(elem),
        );
      }
      state[idDash].tabList = state[idDash].tabList.filter(
        (tab) => tab.id !== tabID,
      );
      if (state[idDash].currentTab === tabID) {
        Vue.set(state[idDash], 'currentTab', state[idDash].tabList[0].id);
      }
    },
    setTabMode(state, { idDash, mode }) {
      state[idDash].tabs = mode;
    },
    editTabName(state, { idDash, tabID, newName }) {
      const tab = state[idDash].tabList.find((tabElement) => tabElement.id === tabID);
      if (tab) {
        tab.name = newName;
      }
    },
    clearFocusedFilter(state, idDash) {
      state[idDash].focusedFilter = null;
      state[idDash].stashedFilterParts = null;
    },
    setFocusedFilter(state, filter) {
      state[filter.idDash].focusedFilter = filter;
      state[filter.idDash].stashedFilterParts = [];
      Object.keys(filter.parts).forEach((key) => {
        state[filter.idDash].stashedFilterParts.push({
          ...filter.parts[key],
          values: filter.parts[key].values ? [...filter.parts[key].values] : [],
        });
      });
    },
    addTokenToFilterParts(state, { token, idDash, value }) {
      const { parts } = state[idDash].focusedFilter;
      Object.keys(parts).forEach((key) => {
        if (
          parts[key].filterPartType === 'token'
          && parts[key].token.name === token.name
        ) {
          if (parts[key].values.indexOf(value) === -1) {
            parts[key].token.value = value;
            if (parts[key].token.elem.includes('multiLine')) {
              parts[key].values = [];
            }
            parts[key].values.push(value);
          }
        }
      });
      this.commit('sortFilterParts', { idDash });
    },
    sortFilterParts(state, { idDash }) {
      // idDash as property to case when sort not for focusedFilter (backward compatibility)
      state[idDash].focusedFilter.parts.sort(
        (part1, part2) => {
          if (part2.values && part1.values) {
            return part2.values.length - part1.values.length;
          } if (!part2.values) {
            return 0;
          }
          return 1;
        },
      );
    },
    declineFilterChanges(state, idDash) {
      state[idDash].focusedFilter.parts = state[idDash].stashedFilterParts;
    },
    refreshFilter(state, { idDash, id }) {
      const foundFilter = state[idDash].filters.find(
        (val) => id === val.id,
      );
      foundFilter.parts.forEach((part) => {
        part.values = [];
      });
    },
    deleteFilterPart(state, { idDash, filterIndex, filterPartIndex }) {
      state[idDash].filters[filterIndex].parts.splice(filterPartIndex, 1);
    },
    removeFilterPartValue(
      state,
      {
        idDash, filterIndex, filterPartIndex, valueIndex,
      },
    ) {
      state[idDash].filters[filterIndex].parts[filterPartIndex].values.splice(
        valueIndex,
        1,
      );
    },
    refreshFilterPart(state, { idDash, filterIndex, filterPartIndex }) {
      Vue.set(
        state[idDash].filters[filterIndex].parts[filterPartIndex],
        'values',
        [],
      );
    },
    restartSearches(state, { idDash, filter }) {
      const { searches } = state[idDash];
      searches.forEach((search) => {
        if (search.original_otl.includes(`$${filter}$`)) {
          this.commit('updateSearchStatus', {
            idDash,
            sid: search.sid,
            status: 'empty',
          });
        }
      });
    },
    updateSearchStatus: (state, {
      idDash, sid, status, id,
    }) => {
      const search = state[idDash].searches.find(
        (searchItem) => searchItem.sid === sid || searchItem?.id === id,
      );
      Vue.set(search, 'status', status);
    },
    setVisualisationModalData(state, { idDash, data }) {
      if (!state[idDash]?.visualisationModalData) {
        Vue.set(state[idDash], 'visualisationModalData', {});
      }

      state[idDash].visualisationModalData = structuredClone(data);
    },
  },
  actions: {
    ...store.actions,
    // метод получающий данные из rest
    getDataApi({ state }, searchFrom) {
      // создаем произвольный хэш чтобы наши запросы не повторялись
      const hash = Math.floor(Math.random() * 1000);

      // получаем нужный ИС на основе полученных при вызове настроек
      // let search = getters.getSearch(searchOut);
      const { search } = searchFrom;
      const { idDash } = searchFrom;
      let otl = search.original_otl;
      let { tws } = search.parametrs;
      let { twf } = search.parametrs;
      let reg = null;
      if (state[idDash].filters) {
        Object.values(state[idDash].filters).forEach((filter) => {
          reg = new RegExp(`\\$${filter.id}\\$`, 'g');
          if (otl.indexOf(`$${filter.id}$`) !== -1) {
            const filterOtlText = filterCompile(filter);
            otl = otl.replace(reg, filterOtlText);
          }
        });
      }
      if (otl.indexOf('$evaTknLogin$') !== -1) {
        if (Vue.$jwt.hasToken()) {
          otl = otl.replaceAll('$evaTknLogin$', Vue.$jwt.decode().username);
        }
      }
      if (state[idDash].tockens) {
        Object.keys(state[idDash].tockens).forEach((item) => {
          // если есть токены в запросе то меняем временные метки в зависимости от значения токена
          // let reg = `\\$${state[idDash].tockens[item].name}`;
          reg = new RegExp(`\\$${state[idDash].tockens[item].name}\\$`, 'g');
          if (otl.indexOf(`$${state[idDash].tockens[item].name}$`) !== -1) {
            if (state[idDash].tockens[item].value) {
              otl = otl.replace(reg, state[idDash].tockens[item].value);
            } else {
              otl = otl.replace(
                reg,
                state[idDash].tockens[item].defaultValue,
              );
            }
          }

          if (
            typeof tws === 'string'
            && tws.indexOf(`$${state[idDash].tockens[item].name}$`) !== -1
          ) {
            tws = state[idDash].tockens[item].value;
          }

          if (
            typeof twf === 'string'
            && twf.indexOf(`$${state[idDash].tockens[item].name}$`) !== -1
          ) {
            twf = state[idDash].tockens[item].value;
          }

          if (
            state[idDash].tockens[item].elem === 'picker'
            && state[idDash].tockens[item].capture === 'start'
          ) {
            if (typeof search.parametrs.tws !== 'number') {
              if (
                search.parametrs.tws.indexOf(
                  `$${state[idDash].tockens[item].name}$`,
                ) !== -1
              ) {
                tws = state[idDash].tockens[item].value;
              }
            }
          }
          if (
            state[idDash].tockens[item].elem === 'picker'
            && state[idDash].tockens[item].capture === 'end'
          ) {
            if (typeof search.parametrs.twf !== 'number') {
              if (
                search.parametrs.twf.indexOf(
                  `$${state[idDash].tockens[item].name}$`,
                ) !== -1
              ) {
                twf = state[idDash].tockens[item].value;
              }
            }
          }
        });
      }
      if (search.limit > 0 && !otl.includes('head')) {
        // добавляем ограничитель кол-ва строк ответа, если в тексте запроса это не прописано явно
        otl += `|head ${search.limit}`;
      }

      otl = otl.replace(/\r|\n/g, '');

      // формируем объект для передачи RESTу
      const formData = new FormData();
      formData.append('sid', `${search.sid}+${hash}`);
      formData.append('original_otl', String(otl));
      formData.append('tws', tws);
      formData.append('twf', twf);
      formData.append('username', search.parametrs.username);
      formData.append('preview', search.parametrs.preview);
      formData.append('field_extraction', search.parametrs.field_extraction);
      formData.append('cache_ttl', search.parametrs.cache_ttl);
      formData.append('timeout', search.parametrs.timeout);

      const searchForRest = {
        sid: search.sid,
        otl: String(otl),
        tws,
        twf,
        cache_ttl: search.parametrs.cache_ttl,
      };
      rest.setStore(this);
      // отправляем в файл storeRest.js
      return rest.rest(formData, searchForRest, restAuth, idDash);
    },
    createSearchesId({ state }, payload) {
      const data = payload?.bodyData || state[payload?.id];
      // Начальное значение id
      let newSearchId = 0;
      // Создаем уникальные id
      const checkAllSearch = (searchId = 0) => {
        if (data.searches.find((searchEl) => searchEl?.id === searchId)) {
          checkAllSearch(searchId + 1);
        } else {
          newSearchId = searchId;
        }
      };
      // Присваиваем
      data.searches.forEach((el) => {
        if (!(el?.id >= 0)) {
          checkAllSearch();
          el.id = newSearchId;
        }
      });
      return data.searches;
    },
    checkAlreadyDash({ state, commit, dispatch }, { id, first }) {
      return new Promise((resolve) => {
        const result = rest.getState(id, restAuth);
        result.then((stateFrom) => {
          if (stateFrom) {
            if (!state[id]) {
              commit('setState', [
                {
                  object: state,
                  prop: id,
                  value: {},
                },
              ]);
              if (stateFrom.body !== '') {
                commit('setState', [
                  {
                    object: state,
                    prop: id,
                    value: JSON.parse(stateFrom.body),
                  },
                ]);
              }
              commit('setState', [
                {
                  object: state[id],
                  prop: 'name',
                  value: stateFrom.name,
                },
                {
                  object: state[id],
                  prop: 'idgroup',
                  value: stateFrom.idgroup,
                },
                {
                  object: state[id],
                  prop: 'modified',
                  value: stateFrom.modified,
                },
              ]);
            }
            if (stateFrom.modified > state[id].modified) {
              resolve({
                status: 'exist',
                body: stateFrom.body,
                name: stateFrom.name,
                id: stateFrom.id,
                modified: stateFrom.modified,
              });
            }
            if (first) {
              if (stateFrom.body !== '') {
                commit('setState', [
                  {
                    object: state,
                    prop: id,
                    value: JSON.parse(stateFrom.body),
                  },
                  {
                    object: state[id],
                    prop: 'idgroup',
                    value: stateFrom.idgroup,
                  },
                  {
                    object: state[id],
                    prop: 'name',
                    value: stateFrom.name,
                  },
                  {
                    object: state[id],
                    prop: 'modified',
                    value: stateFrom.modified,
                  },
                ]);
              }
            }
            if (state[id].elements) {
              state[id].elements.forEach((elem) => {
                if (!state[id][elem].tab) {
                  commit('setState', [
                    {
                      object: state[id][elem],
                      prop: 'tab',
                      value: 1,
                    },
                  ]);
                }
              });
            }
            if (!state[id]?.tabList || state[id]?.tabList?.length === 0) {
              commit('setState', [
                {
                  object: state[id],
                  prop: 'tabList',
                  value: [{ id: 1, name: 'Без названия' }],
                },
              ]);
            }
            if (!state[id]?.currentTab) {
              commit('setState', [
                {
                  object: state[id],
                  prop: 'currentTab',
                  value: 1,
                },
              ]);
            }
            if (typeof state[id].tabs === 'undefined') {
              commit('setState', [
                {
                  object: state[id],
                  prop: 'tabs',
                  value: false,
                },
              ]);
            }
            state[id].filters?.forEach((filter) => {
              if (filter.idDash !== id) {
                commit('setState', [
                  {
                    object: filter,
                    prop: 'idDash',
                    value: id,
                  },
                ]);
              }
            });

            if (state[id].searches) {
              if (state[id].searches?.length > 0) {
                dispatch('createSearchesId', { id }).then((response) => {
                  commit('setState', [
                    {
                      object: state[id],
                      prop: 'searches',
                      value: response,
                    },
                  ]);
                });
                // TODO: Временно
                //  Нужно для замены строковых id источникка данных
                //  элемента визуализации на числовой
                if (state[id]?.elements?.length > 0) {
                  state[id].elements.forEach((element) => {
                    if (typeof state[id][element]?.search === 'string') {
                      let searchValue = '';
                      searchValue = state[id].searches
                        .find((searchEl) => searchEl.sid === state[id][element].search)?.id;
                      if (searchValue !== undefined) {
                        commit('setState', [
                          {
                            object: state[id][element],
                            prop: 'search',
                            value: searchValue,
                          },
                        ]);
                      }
                    }
                  });
                }
              }
              state[id].searches.forEach((search) => {
                if (
                  search.parametrs?.isStartImmediately
                  || search.parametrs.isStartImmediately === undefined
                ) {
                  commit('setState', [
                    {
                      object: search,
                      prop: 'status',
                      value: 'empty',
                    },
                  ]);
                } else {
                  commit('setState', [
                    {
                      object: search,
                      prop: 'status',
                      value: 'stop',
                    },
                  ]);
                }
              });
            }
            resolve({ status: 'finish' });
            // }
          } else {
            resolve({ status: 'failed' });
          }
        });
      });
    },
    getGroups() {
      return rest.getGroups(restAuth);
    },
    checkDataSearch(context, sid) {
      return new Promise((resolve) => {
        function setTransaction(dB) {
          const transaction = dB.transaction('searches', 'readwrite'); // (1)

          // получить хранилище объектов для работы с ним
          const searches = transaction.objectStore('searches'); // (2)

          const query = searches.get(sid); // (3) return store.get('Ire Aderinokun');

          query.onsuccess = () => {
            // (4)

            if (query.result) {
              resolve(true);
            } else {
              resolve(false);
            }
          };

          query.onerror = () => {
            // console.log('Ошибка', query.error);
          };
        }
        let db = null;

        const request = indexedDB.open('EVA', 1);

        request.onerror = (event) => {
          console.error('error:', event);
        };

        request.onupgradeneeded = (event) => {
          // console.log('create');
          db = event.target.result;
          if (!db.objectStoreNames.contains('searches')) {
            // if there's no "books" store
            db.createObjectStore('searches'); // create it
          }

          request.onsuccess = () => {
            db = request.result;
            // this.alreadyDB = request.result;
            // console.log(`success: ${db}`);

            setTransaction(db);
          };
        };

        request.onsuccess = () => {
          db = request.result;

          setTransaction(db);
        };
      });
    },
    // затем полученные данные нужно положить в indexed db
    putIntoDB(context, { result, sid, idDash }) {
      return new Promise((resolve) => {
        function setTransaction(db, res, key) {
          const transaction = db.transaction('searches', 'readwrite'); // (1)

          // получить хранилище объектов для работы с ним
          const searches = transaction.objectStore('searches'); // (2)

          const query = searches.put(res, key); // (3)

          query.onsuccess = () => {
            // (4)
            resolve('result');
            restAuth.putLog(`Добавлен запрос ${query.result}`);
          };

          query.onerror = () => {
            // console.log('Ошибка', query.error);
          };
        }

        let db = null;
        const key = `${idDash}-${sid}`;

        const request = indexedDB.open('EVA', 1);

        request.onerror = (event) => {
          console.error('error:', event);
        };

        request.onupgradeneeded = (event) => {
          // console.log('create');
          db = event.target.result;
          if (!db.objectStoreNames.contains('searches')) {
            // if there's no "books" store
            db.createObjectStore('searches'); // create it
          }

          request.onsuccess = () => {
            db = request.result;
            // console.log(`success: ${db}`);

            setTransaction(db, result, key, idDash);
          };
        };

        request.onsuccess = () => {
          db = request.result;

          setTransaction(db, result, key, idDash);
        };
      });
    },
    saveDashboard(context, dash) {
      return new Promise((resolve) => {
        const response = restAuth.setEssence({
          formData: JSON.stringify(dash),
          essence: 'dash',
          method: 'PUT',
        });
        response.then((res) => {
          if (res.status === 200) {
            res.json().then((data) => {
              resolve({ status: 200, data });
            });
          } else if (res.status === 409) {
            resolve({ status: 409 });
          }
        });
      });
    },
    // отправляем в файл storeRest.js
    getSvg(context, svg) {
      return rest.getSvg(svg, restAuth);
    },
    // отправляем в файл storeRest.js
    setSvg(context, svg) {
      return rest.setSvg(svg, restAuth);
    },
    // отправляем в файл storeRest.js
    exportDash(context, dash) {
      return rest.exportDash(dash, restAuth);
    },
    // отправляем в файл storeRest.js
    importDash(context, dash) {
      return rest.importDash(dash, restAuth);
    },
    // получения списка дашбордов
    getDashs(context, id) {
      return rest.getDashs(id, restAuth);
    },
    // удаляем данные источников данных из базы данных indexed db
    deleteFromDb(context, { ids, idDash }) {
      let db = null;
      const nameDash = idDash;
      const searchName = ids.reduce((acc, id) => [
        ...acc,
        `${nameDash}-${id}`,
      ], []);

      const request = indexedDB.open('EVA', 1);

      request.onerror = () => {
        // console.log('error: ');
      };

      request.onsuccess = () => {
        db = request.result;

        const transaction = db.transaction('searches', 'readwrite'); // (1)

        // получить хранилище объектов для работы с ним
        const searches = transaction.objectStore('searches'); // (2)

        searchName.forEach((item) => {
          searches.delete(String(item)); // (3) return store.get('Ire Aderinokun');
        });
      };
    },

    refreshElements({ state, commit }, { idDash, key }) {
      if (idDash === 'reports') {
        commit('setState', [{
          object: state[idDash].table,
          prop: 'should',
          value: true,
        }]);
      } else {
        // пробегаемся по всем элементам
        state[idDash].elements.forEach((item) => {
          // то смотрим если наш элемент завязан на search который поменялся
          if (state[idDash][item].search === key) {
            // то его нужно пересчитать
            commit('setState', [{
              object: state[idDash][item],
              prop: 'should',
              value: true,
            }]);
          }
        });
      }
    },

    actionGetElementSelected({ state, commit }, element) {
      const selected = state[element.idDash][element.id]?.selected;
      if (!selected) {
        commit('setSelected', { ...element });
      }
      return state[element.idDash][element.id]?.selected;
    },

    // сохранение настроек
    saveSettingsToPath(
      { state, commit },
      { path, element, options },
    ) {
      commit('prepareSettingsStore', { path, element });
      commit('setOptions', { idDash: path, id: element, options });
      // return dispatch('getOptions', { idDash: path, id: element });
      return state[path][element].options;
    },

    // получение настроек
    getSettingsByPath({ state, commit }, { path, element }) {
      commit('prepareSettingsStore', { path, element });
      // return dispatch('getOptions', { idDash: path, id: element });
      return state[path][element].options;
    },
    // открыть окно настроек
    // произвольный вызов this.$store
    // .dispatch("openModalSettings", { path: 'research', element: 'multiLine' });
    openModalSettings({ commit }, { path, element, titles }) {
      commit('prepareSettingsStore', { path, element });
      commit('setModalSettings', {
        idDash: path,
        element,
        status: true,
        titles,
      });
    },
    loader({ state, commit }, { id, first }) {
      return new Promise((resolve) => {
        const result = rest.getState(id, restAuth);
        result.then((stateFrom) => {
          if (stateFrom) {
            if (!state[id]) {
              commit('setState', [{
                object: state,
                prop: id,
                value: {},
              }]);
              if (stateFrom.body) {
                commit('setState', [{
                  object: state,
                  prop: id,
                  value: JSON.parse(stateFrom.body),
                }]);
              }
              commit('setState', [
                {
                  object: state[id],
                  prop: 'name',
                  value: stateFrom.name,
                },
                {
                  object: state[id],
                  prop: 'idgroup',
                  value: stateFrom.idgroup,
                },
                {
                  object: state[id],
                  prop: 'modified',
                  value: stateFrom.modified,
                },
              ]);
            }
            if (stateFrom.modified > state[id].modified) {
              resolve({
                status: 'exist',
                body: stateFrom.body,
                name: stateFrom.name,
                id: stateFrom.id,
                modified: stateFrom.modified,
              });
            }
            if (first) {
              if (stateFrom.body !== '') {
                commit('setState', [
                  {
                    object: state,
                    prop: id,
                    value: JSON.parse(stateFrom.body),
                  },
                  {
                    object: state[id],
                    prop: 'idgroup',
                    value: stateFrom.idgroup,
                  },
                  {
                    object: state[id],
                    prop: 'name',
                    value: stateFrom.name,
                  },
                  {
                    object: state[id],
                    prop: 'modified',
                    value: stateFrom.modified,
                  },
                ]);
              }
            }
            if (state[id].elements) {
              state[id].elements.forEach((elem) => {
                if (!state[id][elem].tab) {
                  commit('setState', [{
                    object: state[id][elem],
                    prop: 'tab',
                    value: 1,
                  }]);
                }
              });
            }
            if (state[id].searches) {
              state[id].searches.forEach((search) => commit('setState', [{
                object: search,
                prop: 'status',
                value: 'empty',
              }]));
            }
            resolve({ status: 'finish' });
            // }
          } else {
            resolve({ status: 'failed' });
          }
        });
      });
    },
    // TODO refactor checkalreadydash
    letEventGo: async ({
      state, commit, dispatch,
    }, event) => {
      // load dash

      // при переходе на другой дашборд нам нужно обновить определенный токен
      const item = { ...event.event };
      if (item.prop[0] === '') {
        return;
      }
      const { tockens } = state[event.idDash];
      let id = -1;
      if (Number.isInteger(+item.target)) {
        id = item.target;
      }
      if (id) await dispatch('loader', { id });

      let tockensTarget = [];
      Object.keys(state).forEach((key) => {
        if (state[key].name) {
          if (state[key].name.toLowerCase() === item.target.toLowerCase()) {
            id = key;
          }
        }
      });

      const values = item.value.reduce((acc, itemValue, k) => {
        if (typeof itemValue === 'string' && itemValue.indexOf('$') !== -1) {
          itemValue = itemValue.replace(/\$/g, '');
          return {
            ...acc,
            [k]: tockens.find((tockenDeep) => tockenDeep.name === itemValue).value,
          };
        }
        return {
          ...acc,
          [k]: itemValue,
        };
      }, {});

      if (id === -1) {
        const response = await rest.getDashByName(
          { name: item.target, idgroup: state[event.idDash].idgroup },
          restAuth,
        );
        if (response) {
          id = response.id;
          commit('setState', [{
            object: state,
            prop: response.id,
            value: {},
          }]);

          if (response.body !== '') {
            commit('setState', [{
              object: state,
              prop: id,
              value: JSON.parse(response.body),
            }]);
          }
          commit('setState', [
            {
              object: state[response.id],
              prop: 'name',
              value: response.name,
            },
            {
              object: state[response.id],
              prop: 'idgroup',
              value: response.idgroup,
            },
            {
              object: state[response.id],
              prop: 'modified',
              value: response.modified,
            },
          ]);
        }
      }
      if (state[id] && state[id].tockens) {
        tockensTarget = state[id].tockens;
      }

      const changed = [];
      item.prop.forEach((itemProp, j) => {
        tockensTarget.forEach((itemTock, i) => {
          if (itemProp === itemTock.name) {
            if (itemTock.elem.indexOf('select') !== -1) {
              commit('setState', [{
                object: state[id][itemTock.elem].selected,
                prop: 'elemDeep',
                value: values[j],
              }]);
            }
            commit('setState', [{
              object: state[id].tockens[i],
              prop: 'value',
              value: values[j],
            }]);
            changed.push(itemProp);
          }
        });
      });
      let newCurrentTabValue = 1;
      const { options } = state[event.idDash][event.id];
      const currentTab = event.event.tab || state[id]?.currentTab;
      const isTabMode = state[id]?.tabs;
      const lastEl = state[id]?.tabList
        .find((el) => el.id.toString() === event.event.tab);
      if (!options?.openNewScreen) {
        if (!isTabMode) {
          event.route.push(`/dashboards/${id}`);
          newCurrentTabValue = 1;
        } else if (!event.event.tab) {
          event.route.push(`/dashboards/${id}`);
          newCurrentTabValue = currentTab || 1;
        } else if (event.event.tab > state[id].tabList.length) {
          event.route.push(`/dashboards/${id}`);
          newCurrentTabValue = state[id].tabList.length;
        } else {
          event.route.push(`/dashboards/${id}`);
          newCurrentTabValue = lastEl?.id || 1;
        }
      } else if (!isTabMode) {
        window.open(`/dashboards/${id}`);
        newCurrentTabValue = 1;
      } else if (!event.event.tab) {
        window.open(`/dashboards/${id}`);
        newCurrentTabValue = currentTab || 1;
      }
      commit('changeCurrentTab', {
        idDash: id,
        tab: newCurrentTabValue,
      });
      const { searches } = state[id];

      if (searches) {
        // также при обновлении токена нужно заново запускать серч и обновлять информацию
        searches.forEach((searchItem) => {
          changed.forEach((itemTok) => {
            if (searchItem.original_otl.indexOf(`$${itemTok}$`) !== -1) {
              // если в тексте запроса есть наш токен

              commit('setLoading', {
                search: searchItem.sid,
                idDash: id,
                should: true,
                error: false,
              });

              dispatch('getDataApi', {
                search: searchItem,
                idDash: id,
              }).then((response) => {
                if (response.length !== 0) {
                  dispatch('putIntoDB', {
                    result: response,
                    sid: searchItem.sid,
                    idDash: id,
                  }).then(() => {
                    commit('setLoading', {
                      search: searchItem.sid,
                      idDash: id,
                      should: false,
                      error: false,
                    });
                  });
                } else {
                  commit('setLoading', {
                    search: item.sid,
                    idDash: id,
                    should: false,
                    error: true,
                  });
                }
              });
            }
          });
        });
      }
    },
  },
  getters: {
    // ...store.getters,
    getReportSearch: (state) => {
      const key = state.reports?.table?.search || '';
      if (key !== '') {
        return state.reports.searches[key];
      }
      return {
        sid: '',
        original_otl: '',
        parametrs: {
          tws: 0,
          twf: 0,
          timeout: 100,
          preview: false,
          field_extraction: false,
          cache_ttl: 100,
        },
        limit: 1000,
      };
    },

    getPaperSearch: () => ({ // TODO: разобраться нужно ли
      sid: '',
      original_otl: '',
      parametrs: {
        tws: 0,
        twf: 0,
        timeout: 100,
        preview: false,
        field_extraction: false,
        cache_ttl: 100,
      },
    }),
    getReportElement: (state) => state.reports?.elements || [],
    getThemeTitle(state) {
      return state.theme.name;
    },
    getTheme(state) {
      return state.theme.settings;
    },
  },
  modules: {
    auth,
    form,
    dataResearch,
    notify,
  },
  plugins: [createPersistedState()],
});
