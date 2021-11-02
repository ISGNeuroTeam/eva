import rest from './storeRest.js';
import restAuth from '../storeAuth/storeRest.js';
import settings from '../js/componentsSettings.js';
import Vue from 'vue';
import themes from '../js/themeSettings.js';
import { filterCompile } from '../components/dash-filter-panel/utils/filter-otl-compile.js';

export default {
  // приблизительный объект хранилища, может отличаться от реального
  state: {
    theme: {
      name: 'dark',
      settings: themes['dark'],
    },
  },
  mutations: {
    setNameDash: (state, newName) => {
      // изменения имени самого элемента
      state[newName.idDash][newName.id].name_elem = newName.name;
    },
    setPosDash: (state, pos) => {
      // задание позиции элемента
      state[pos.idDash][pos.id].top = pos.top;
      state[pos.idDash][pos.id].left = pos.left;
    },
    setSizeDash: (state, size) => {
      // задание размеров элемента
      state[size.idDash][size.id].width = size.width;
      state[size.idDash][size.id].height = size.height;
    },
    setSearch: (state, payload) => {
      const { idDash, reload, search } = payload;
      search.status = 'empty';
      if (reload) {
        state[idDash].searches.forEach((item, i) => {
          if (search.sid === item.sid) {
            Vue.set(state[idDash].searches, i, search);
          }
        });
      } else {
        state[idDash].searches.push({ ...search });
      }
    },
    deleteSearch: (state, search) => {
      // удаление источника данных
      if (search) {
        // если нужный ИС передан
        let newSearches = state[search.idDash].searches.filter(item => {
          // то ищем его среди всех ИС фильтруя массив и отбрасывая его из массива
          return item.sid != search.sid;
        });
        state[search.idDash].searches = newSearches; // обновляем массив ИС
      }
    },
    setModalSearch: (state, modal) => {
      // открывает или закрывает модальное окно с ИС
      if (!state[modal.id].modalSearch) {
        Vue.set(state[modal.id], 'modalSearch', {});
        Vue.set(state[modal.id].modalSearch, 'elem', '');
        Vue.set(state[modal.id].modalSearch, 'status', true);
      }
      state[modal.id].modalSearch.status = modal.status;
      if (modal.elem) {
        // если пришёл элемент с которого октрыли модальное окно
        state[modal.id].modalSearch.elem = modal.elem; // то и его занесем в объект настроек
      }
    },
    setModalExin: (state, modal) => {
      // открывает модалку импорта экспорта
      if (modal.idDash == 'layout') {
        // одна модалка для главной странице
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
    setDataSource: (state, datasource) => {
      // позволяет запустить выбранный ИС для нужного элемента
      let elem = state[datasource.id].modalSearch.elem; // получаем элемнет для которого будем обновлять данные
      state[datasource.id][elem].search = datasource.searchid; // задаем id ИС
      state[datasource.id][elem].should = true; // сообщаем что нужно обновить
      state[datasource.id][elem].switch = true; // и перключить на вкладку с результатами
      state[datasource.id].tockens.forEach(item => {
        if (item.elem == elem) {
          item.value = '';
        }
      });
      if (elem.split('-')[0] == 'select') {
        if (state[datasource.id][elem].selected) {
          state[datasource.id][elem].selected = {
            elem: '',
            elemlink: '',
            elemDeep: '',
          };
        }
      }
    },
    setSwitch: (state, status) => {
      // отдельно можно переключать отображения вариантов элемента между выбором ИС и результатами
      state[status.idDash][status.id].switch = status.status;
      if (status.id.includes('table')) {
        delete state[status.idDash][status.id].selectedTableTitles;
        delete state[status.idDash][status.id].availableTableTitles;
      }
    },
    setShould: (state, status) => {
      // отдельно можно дать понять стоит ли обновлять данные, например при загрузки страницы.
      state[status.idDash][status.id].should = status.status;
    },
    setTocken(state, payload) {
      const { tocken, idDash, value } = payload;
      // сохранение токена в хранилище
      let id = -1;
      Object.keys(state[idDash].tockens).forEach(item => {
        // ищем пришедший токен среди всех токенов
        if (
          state[idDash].tockens[item].name === tocken.name &&
          state[idDash].tockens[item].action === tocken.action &&
          state[idDash].tockens[item].capture === tocken.capture
        ) {
          id = item;
        }
      });
      if (id !== -1) {
        // если токен нашелся
        
        if (value) {
          // если value задано, то присваиваем его токену, если нет, то присваиваем токену дефолтное значение
          state[idDash].tockens[id].value = value;
        } else {
          state[idDash].tockens[id].value = state[idDash].tockens[id].defaultValue;
        }

        let eventAll = []; // сюда будем заносить все события с нужным токеном

        if (state[idDash].events) {
          // если события вообще есть
          state[idDash].events.forEach((item, i) => {
            // пробегаемся по всем
            if (item.token === state[idDash].tockens[id].name) {
              // если в нашем событии есть упоминание нашего токена
              eventAll.push(i); // то добовляем событие в заготовленный массив
            }
          });
        }

        if (eventAll.length !== 0) {
          // если список события с токеном внутри есть
          let data = null;
          eventAll.forEach(item => {
            // пробегаемся по всем событиям

            switch (
              state[idDash].events[item].compare // проверяем какое именно событие должно произойти
            ) {
              case 'equals':
                let value = state[idDash].tockens[id].value.replace(/\s/g, ''); // в случаях когда нужно сравнить значения токена по равенству,
                // это может быть строка, а значит нужно обрезать пробелы, чтобы сравнение было корректным
                if (value === state[idDash].events[item].tokenval) {
                  // сравниваем значения в событии и значение токена

                  this.commit('letEventSet', {
                    events: [state[idDash].events[item]],
                    idDash,
                  }); // вызываем метод обновляйщий элемент
                }
                break;
              case 'over': // все тоже самое для других событий
                if (state[idDash].tockens[id].value > state[idDash].events[item].tokenval) {
                  this.commit('letEventSet', {
                    events: [state[idDash].events[item]],
                    idDash,
                  });
                }
                break;
              case 'less':
                if (state[idDash].tockens[id].value < state[idDash].events[item].tokenval) {
                  this.commit('letEventSet', {
                    events: [state[idDash].events[item]],
                    idDash,
                  });
                }
                break;
              case 'in': // для события вхождения значеия в массив
                data = state[idDash].events[item].tokenval.replace(/\[|\]/g, '').split(','); // отбрасываем скобки массива и разбиваем на масив элемнетов по запятой
                let k = -1;
                data.forEach(item => {
                  // каждое значнеие нужно сравнить со значением в событии
                  if (!Number(item) && Number(state[idDash].tockens[id].value)) {
                    // нам нужно проверить что это цифры сравниваются
                    if (Number(item) === Number(state[idDash].tockens[id].value)) {
                      // и если число вошло в массив чисел
                      k = 0; // то меняем переменную
                    }
                  } else {
                    if (item === state[idDash].tockens[id].value) {
                      // предполагаю что это излишне ПРОВЕРИТЬ!!!!
                      k = 0;
                    }
                  }
                });
                if (k !== -1) {
                  // если число нашлось
                  this.commit('letEventSet', {
                    events: [state[idDash].events[item]],
                    idDash,
                  }); // вызываем метод обновляйщий элемент
                }
                break;
              case 'between': // тоже самое для условия что токен внутри рамок массива
                data = state[idDash].events[item].tokenval.replace(/\[|\]/g, '').split(',');

                if (Number(data[0]) && Number(data[1]) && Number(state[idDash].tockens[id].value)) {
                  // нам нужно проверить что это цифры сравниваются
                  if (
                    Number(state[idDash].tockens[id].value) >= Number(data[0]) &&
                    Number(state[idDash].tockens[id].value) <= Number(data[1])
                  ) {
                    // и если число вошло в массив чисел
                    k = 0; // то меняем переменную
                  }
                } else {
                  if (
                    state[idDash].tockens[id].value >= data[0] &&
                    state[idDash].tockens[id].value <= data[1]
                  ) {
                    // предполагаю что это излишне ПРОВЕРИТЬ!!!!
                    k = 0;
                  }
                }
                if (k !== -1) {
                  // если число нашлось
                  this.commit('letEventSet', {
                    events: [state[idDash].events[item]],
                    idDash,
                  }); // вызываем метод обновляйщий элемент
                }
                break;
            }
          });
        }

        state[idDash].searches.forEach(search => {
          if (search.original_otl.includes(`$${tocken.name}$`)) {
            this.commit('updateSearchStatus', {
              idDash,
              sid: search.sid,
              status: 'empty',
            });
          }
        });
      }
      // Add filterParam(for multiLine)
      state[idDash].tockens.forEach(tocken => {
        if (tocken.name === payload.tocken.name) {
          tocken.filterParam = payload.tocken.filterParam
        }
      });
      // Add value to temp values of filter
      if (state[idDash].focusedFilter) {
        this.commit('addTokenToFilterParts', payload);
      }
    },
    setActions: (state, actions) => {
      // устанавливаем список событий для элемента
      state[actions.idDash][actions.id].actions = actions.actions;
    },
    setReportSearch: (state, search) => {
      Vue.set(state.reports.searches, search.sid, search);
      state.reports.table.search = search.sid;
    },
    setPaperSearch: (state, search) => {
      Vue.set(state.papers.searches, search.sid, search);
      Vue.set(state.papers, 'cursearch', search.sid);
    },
    setSearchStatus: (state, status) => {
      // отдельно можно проверить если ИС прикреплен то переключить и обновить
      if (state[status.idDash][status.id].search != -1) {
        state[status.idDash][status.id].switch = true;
        state[status.idDash][status.id].should = true;
      }
    },
    setPickerDate: (state, date) => {
      // отдельно можно проверить если ИС прикреплен то переключить и обновить
      state[date.idDash][date.id].date = date.date;
      state[date.idDash][date.id].changeDate = !state[date.idDash][date.id].changeDate;
    },
    setSelected: (state, select) => {
      // храним выбранные пользователем данные
      if (!state[select.idDash][select.id].selected) {
        state[select.idDash][select.id].selected = {
          elem: '',
          elemlink: '',
          elemDeep: '',
        };
      }
      state[select.idDash][select.id].selected[select.element] = select.value;
    },
    setDash: (state, dash) => {
      // обновляем порядок layout на странице
      let dashboard = dash.data;
      if (!state[dashboard.id]) {
        Vue.set(state, dashboard.id, {});
        Vue.set(state[dashboard.id], 'name', dashboard.name);
        Vue.set(state[dashboard.id], 'idgroup', dashboard.idgroup);
        Vue.set(state[dashboard.id], 'modified', dashboard.modified);
        dash.getters(dashboard.id, true);
      }
    },
    updateDash: (state, dash) => {
      if (dash.dash.body != '') {
        state[dash.dash.id] = { ...state[dash.dash.id], ...JSON.parse(dash.dash.body) };
      }
      if (dash.modified != '') {
        state[dash.dash.id].modified = dash.modified;
      }
    },
    setLoading: (state, load) => {
      state[load.idDash].elements.forEach(item => {
        if (state[load.idDash][item].search == load.search) {
          if (!state[load.idDash][item].loading) {
            state[load.idDash][item].loading = '';
          }

          state[load.idDash][item].loading = load.should;
        }
      });
      Vue.set(state, 'logError', load.error);
    },
    setErrorLogs: (state, error) => {
      Vue.set(state, 'logError', error);
    },
    createDashBoard: (state, dashboard) => {
      // создаем новый элемент
      let dash = dashboard.dashboard;
      let id = Object.keys(dash)[0];
      let data = dash[id];
      let stateElements = state[dashboard.idDash].elements;
      let elements = stateElements.filter(item => {
        // тут проверяем нет ли такого элемнета уже
        if (item.indexOf(id) != -1) {
          return item;
        }
      });

      if (elements.length + 1 != 1) {
        // и если есть
        let j = -1; // флаг чтобы понимать есть ли такой элемнет уже
        for (let i = 1; i < elements.length + 2; i++) {
          // пробегаем по циклу размером с общее число элементов
          if (!stateElements.includes(`${id}-${i}`)) {
            // находим первое свободное для размещение место (свободный id)
            j = i; // и запоминаем его
          }
        }
        if (j != -1) {
          // если и правда мы не можем добавить элемент, потому что он уже есть
          if (j != 1) {
            // то проверяем если он не самый первый
            id = `${id}-${j}`; // то смлео заполняем свободное место
          }
        } else {
          // а если вполне можем добавить элеммент который изначлаьно хотели
          id = `${id}-${elements.length + 1}`; // то добвляем элемент
        }
      }

      state[dashboard.idDash][id] = data;
      state[dashboard.idDash][id].tab = state[dashboard.idDash].currentTab;
      state[dashboard.idDash].elements.push(id);
    },
    deleteDashBoard: (state, dashboard) => {
      // удаляем элемент с помощью модального окна

      let id = -1;
      if (dashboard.page == 'dash') {
        // проверяем что именно удаляем

        state[dashboard.idDash].elements.forEach((item, i) => {
          // потом ищем его в массиве элементов дашборда
          if (item == dashboard.id) {
            id = i;
          }
        });
        state[dashboard.idDash].elements.splice(id, 1); // и удаляем его в массиве элемнетов
        delete state[dashboard.idDash][dashboard.id]; // и потом сам элемнет тоже удаляем
      } else if (dashboard.page == 'tocken') {
        let id = -1;
        state[dashboard.idDash].tockens.forEach((item, i) => {
          if (item.name == dashboard.name) {
            id = i;
          }
        });
        state[dashboard.idDash].tockens.splice(id, 1);
      } else if (dashboard.page == 'search') {
        let id = -1;
        state[dashboard.idDash].searches.forEach((item, i) => {
          if (item.sid == dashboard.name) {
            id = i;
          }
        });
        state[dashboard.idDash].searches.splice(id, 1);
      }
    },
    createlayout: (state, layout) => {
      // создание дашборда

      state[layout.name] = layout.layout[layout.name]; // добовляем/обновляем дашборд в хранилище
      let flag = false;
      state.layouts.forEach(item => {
        // перед тем как добавить его в массив дашбордов, нужно проверить не находиться ли он уже там
        item == layout.name ? (flag = true) : false;
      });
      if (!flag) {
        // если его еще нет (т.е. новый дашборд а не обновление существующего)
        state.layouts.push(layout.name); // то добвляем его в массив элементов
      }
    },
    editlayout: (state, layout) => {
      // поменять имя дашборда

      state[layout.name] = state[layout.old_name]; // делаем копию дашборда
      state[layout.name].name = layout.name[0].toUpperCase() + layout.name.substring(1); // но меняем в нем имя с большой буквы для красоты
      delete state[layout.old_name]; // удаляем старый дашборд с которого скопировали
      let layouts = state.layouts.map(item => {
        // пробегаем массив дашбордов и в нем заменяем имя старого дашборда на новый
        if (item == layout.old_name) {
          return layout.name;
        } else {
          return item;
        }
      });
      state.layouts = layouts;
    },
    setModalDelete: (state, modalsetting) => {
      // добовляем данные об удаляемом объекте в   модальное окно
      if (!state[modalsetting.id].modalDelete) {
        Vue.set(state[modalsetting.id], 'modalDelete', {});
        Vue.set(state[modalsetting.id].modalDelete, 'active', false);
        Vue.set(state[modalsetting.id].modalDelete, 'id', '');
        Vue.set(state[modalsetting.id].modalDelete, 'name', '');
      }
      if (
        modalsetting.page == 'dash' ||
        modalsetting.page == 'tocken' ||
        modalsetting.page == 'search'
      ) {
        // если удаляем элемнет то его характеристики заносим в объект моадльного окна

        state[modalsetting.id].modalDelete.active = modalsetting.status;
        state[modalsetting.id].modalDelete.id = modalsetting.elem;
        state[modalsetting.id].modalDelete.name = modalsetting.name;
        if (!modalsetting.status) {
          state[modalsetting.id].modalDelete.page = '';
        } else {
          state[modalsetting.id].modalDelete.page = modalsetting.page;
        }
      }
    },
    setScreenShot: (state, screen) => {
      // добовляем данные о скриншоте
      state[screen.id].screenshot = screen.screen;
    },
    setEvents: (state, event) => {
      // добовляем данные о скриншоте
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
    setSchedule: (state, schedule) => {
      // утсанавливает объект для планировщика
      state[schedule.idDash].schedulers[schedule.sid] = {
        every: schedule.every,
        time: schedule.time,
        everyLast: schedule.everyLast,
        timeLast: schedule.timeLast,
        schedulerID: schedule.schedulerID
      };
    },
    setSchedulerID: (state, payload) => {
      const { idDash, search, schedulerID} = payload;
      Vue.set(state[idDash].schedulers[search], 'schedulerID', schedulerID)
    },
    deleteSchedule: (state, schedule) => {
      // удаляет объект с планировщиком
      delete state[schedule.idDash].schedulers[schedule.sid];
    },
    createTockens: (state, tocken) => {
      // создаем токен

      let j = -1;
      state[tocken.idDash].tockens.forEach((item, i) => {
        //  проверяем есть ли такой токен уже
        if (item.name == tocken.tocken.name) {
          j = i;
        }
      });
      if (j != -1) {
        //  если такой токен уже есть
        state[tocken.idDash].tockens[j].name = tocken.tocken.name; // обновляем его данные
        state[tocken.idDash].tockens[j].elem = tocken.tocken.elem;
        state[tocken.idDash].tockens[j].action = tocken.tocken.action;
        state[tocken.idDash].tockens[j].capture = tocken.tocken.capture;
        state[tocken.idDash].tockens[j].prefix = tocken.tocken.prefix;
        state[tocken.idDash].tockens[j].sufix = tocken.tocken.sufix;
        state[tocken.idDash].tockens[j].delimetr = tocken.tocken.delimetr;
        state[tocken.idDash].tockens[j].defaultValue = tocken.tocken.defaultValue;
      } else {
        // а елси нету
        state[tocken.idDash].tockens.push(
          // то создаем новый токен
          {
            name: tocken.tocken.name,
            elem: tocken.tocken.elem,
            action: tocken.tocken.action,
            capture: tocken.tocken.capture,
            prefix: tocken.tocken.prefix,
            sufix: tocken.tocken.sufix,
            delimetr: tocken.tocken.delimetr,
            defaultValue: tocken.tocken.defaultValue,
            value: '',
          }
        );
      }
    },
    createFilter(state, { filter, index }) {
      if (!state[filter.idDash].filters) {
        Vue.set(state[filter.idDash], 'filters', []);
      }

      if (state[filter.idDash].filters.find(filterInState => filterInState.id === filter.id)) {
        alert('Фильтр с таким именем уже существует');
      } else {
        state[filter.idDash].filters.splice(index + 1, 0, filter);
      }
    },
    deleteFilter(state, filter) {
      if (!state[filter.idDash].filters) {
        Vue.set(state[filter.idDash], 'filters', []);
      }

      let index = state[filter.idDash].filters.indexOf(filter);
      state[filter.idDash].filters.splice(index, 1);
    },
    saveFilterPart(state, { idDash, filterPart, filterPartIndex }) {
      if (Number.isFinite(filterPartIndex))
        state[idDash].focusedFilter.parts[filterPartIndex] = filterPart;
      else state[idDash].focusedFilter.parts.push(filterPart);
    },
    setLibrary: (state, options) => {
      Vue.set(state[options.idDash][options.id].options, 'library', options.library);
    },

    setOptions: (state, options) => {
      // добовляем данные о скриншоте
      Object.keys(options.options).forEach(item => {
        // пробегаемся по всем настройкам, что к нам пришли
        if (item == 'change') {
          // если это натсройка change

          state[options.idDash][options.id].options.change = !state[options.idDash][options.id]
            .options.change; // то ее всегда меняем на противоположную, давая понять, что натсройки обновились
        } else {
          // для любой другой настройки
          // if (item == 'metrics') {
          //   console.log(state[options.idDash][options.id].options[item])
          // }

          Vue.set(state[options.idDash][options.id].options, item, options.options[item]); // просто обновляем ее значение на новое
        }
      });
      if (options.titles) {
        state[options.idDash][options.id].selectedTableTitles = options.titles;
      }
    },

    updateOptions: (state, payload) => {
      state[payload.idDash][payload.idElement].options = payload.options;
    },

    letEventSet: (state, events) => {
      // метод который обновляет какое-либо свойство у элемнета
      events.events.forEach(item => {
        if (!state[events.idDash][item.target].options) {
          // если опций еще нет
          state[events.idDash][item.target].options = {
            // то создаем объект опций с плем change по умолчанию
            change: false,
          };
        }
        item.value == 'true' ? (item.value = true) : false; // переводи строковое значение в bolean
        item.value == 'false' ? (item.value = false) : false;
        Vue.set(state[events.idDash][item.target].options, item.prop, item.value);
      });
    },
    letEventGo: async (state, event) => {
      //load dash
      let loader = (id, first) => {
        return new Promise(resolve => {
          let result = rest.getState(id, restAuth);
          result.then(stateFrom => {
            if (stateFrom) {
              if (!state[id]) {
                Vue.set(state, id, {});
                if (stateFrom.body !== '') {
                  Vue.set(state, id, JSON.parse(stateFrom.body));
                }
                Vue.set(state[id], 'name', stateFrom.name);
                Vue.set(state[id], 'idgroup', stateFrom.idgroup);
                Vue.set(state[id], 'modified', stateFrom.modified);
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
                  Vue.set(state, id, JSON.parse(stateFrom.body));
                  Vue.set(state[id], 'idgroup', stateFrom.idgroup);
                  Vue.set(state[id], 'name', stateFrom.name);
                  Vue.set(state[id], 'modified', stateFrom.modified);
                }
              }
              if (state[id].elements) {
                state[id].elements.forEach(elem => {
                  if (!state[id][elem].tab) {
                    Vue.set(state[id][elem], 'tab', 1);
                  }
                });
              }
              if (state[id].searches) {
                state[id].searches.forEach(search => Vue.set(search, 'status', 'empty'));
              }
              resolve({ status: 'finish' });
              // }
            } else {
              resolve({ status: 'failed' });
            }
          });
        });
      };

      // при переходе на другой дашборд нам нужно обновить определенный токен
      let item = Object.assign({}, event.event);
      if (item.prop[0] == '') {
        return;
      }
      let tockens = state[event.idDash].tockens;
      let id = -1;
      if (Number.isInteger(+item.target)) {
        id = item.target;
      }
      if (id) await loader(id);

      let tockensTarget = [];
      Object.keys(state).forEach(key => {
        if (state[key].name) {
          if (state[key].name.toLowerCase() == item.target.toLowerCase()) {
            id = key;
          }
        }
      });

      let values = {};
      let changed = [];

      item.value.forEach((itemValue, k) => {
        if (itemValue.indexOf('$') != -1) {
          itemValue = itemValue.replace(/\$/g, '');

          tockens.forEach((tockenDeep, l) => {
            if (tockenDeep.name == itemValue) {
              values[k] = tockenDeep.value;
            }
          });
        } else {
          values[k] = itemValue;
        }
      });

      if (id == -1) {
        let response = await rest.getDashByName(
          { name: item.target, idgroup: state[event.idDash].idgroup },
          restAuth
        );
        if (response) {
          id = response.id;
          Vue.set(state, response.id, {});

          if (response.body != '') {
            Vue.set(state, id, JSON.parse(response.body));
          }
          Vue.set(state[response.id], 'name', response.name);
          Vue.set(state[response.id], 'idgroup', response.idgroup);
          Vue.set(state[response.id], 'modified', response.modified);
        }
      }
      if (state[id] && state[id].tockens) {
        tockensTarget = state[id].tockens;
      }

      item.prop.forEach((itemProp, j) => {
        tockensTarget.forEach((itemTock, i) => {
          if (itemProp == itemTock.name) {
            if (itemTock.elem.indexOf('select') != -1) {
              state[id][itemTock.elem].selected.elemDeep = values[j];
            }
            state[id].tockens[i].value = values[j];
            changed.push(itemProp);
          }
        });
      });

      //event.route.push(`/dashboards/${id}`);
      // event.route.go();
      const options = state[event.idDash][event.id].options;
     
      if (!options?.openNewScreen) {
        event.route.push(`/dashboards/${id}`);
      } else {
        window.open(`/dashboards/${id}`);
      }
      let searches = state[id].searches;

      let response = {};

      if (searches) {
        searches.forEach(async item => {
          // также при обновлении токена нужно заново запускать серч и обновлять информацию

          changed.forEach(async itemTok => {
            if (item.original_otl.indexOf(`$${itemTok}$`) != -1) {
              // если в тексте запроса есть наш токен

              event.store.commit('setLoading', {
                search: item.sid,
                idDash: id,
                should: true,
                error: false,
              });

              response = await event.store.getters.getDataApi({ search: item, idDash: id });
              if (response.length != 0) {
                let responseDB = event.store.getters.putIntoDB(response, item.sid, id);
                responseDB.then(result => {
                  let refresh = event.store.getters.refreshElements(id, item.sid);
                  event.store.commit('setLoading', {
                    search: item.sid,
                    idDash: id,
                    should: false,
                    error: false,
                  });
                });
              } else {
                event.store.commit('setLoading', {
                  search: item.sid,
                  idDash: id,
                  should: false,
                  error: true,
                });
              }
            }
          });
        });
      }
    },
    setModalSettings: (state, settings) => {
      // метод влияющий на модалку настроек
      if (!state[settings.idDash].modalSettings) {
        // если объект с натсройками модального окна натсроек еще нет
        Vue.set(state[settings.idDash], 'modalSettings', {}); // то создаем его сразу реактивным
        Vue.set(state[settings.idDash].modalSettings, 'element', '');
        Vue.set(state[settings.idDash].modalSettings, 'status', false);
      }
      state[settings.idDash].modalSettings.status = settings.status; // и заносим пару значения вроде элемнета и статуса чтобы понимать открыто оно или закрыто и чьи настройки подгрузить
      state[settings.idDash].modalSettings.element = settings.element;
      if (
        settings.element &&
        (settings.element.includes('table') || settings.element.includes('heatmap'))
      ) {
        Vue.set(state[settings.idDash][settings.element], 'availableTableTitles', settings?.titles);
        if (!state[settings.idDash][settings.element].selectedTableTitles) {
          Vue.set(
            state[settings.idDash][settings.element],
            'selectedTableTitles',
            settings?.titles
          );
        }
      }
    },
    setTheme: (state, theme) => {
      // устанавливает объект цвета в хранилище
      state.theme.name = theme.themeName;
      state.theme.settings = Object.assign({}, themes['dark'], theme.settings);
    },
    setDefaultTheme: (state, themeName) => {
      state.theme.name = themeName;
      state.theme.settings = themes[themeName];
    },
    setThemeBack: (state, theme) => {
      // устанавливает объект цвета в хранилище
      rest.setThemeBack(theme, restAuth);
    },
    setGraphTree: (state, tree) => {
      // мтеод сохраняет структуру и позицию графа
      state[tree.idDash][tree.id].tree = tree.tree;
      state[tree.idDash][tree.id].direct = tree.direct;
      state[tree.idDash][tree.id].alies = tree.alies;
    },
    setTextArea: (state, textarea) => {
      if (!state[textarea.idDash][textarea.id].textarea) {
        state[textarea.idDash][textarea.id].textarea = '';
      }
      state[textarea.idDash][textarea.id].textarea = textarea.textarea;
    },
    createReportSearch: state => {
      if (!state.reports) {
        Vue.set(state, 'reports', {});
        Vue.set(state.reports, 'elements', settings.reporstElements);
        Vue.set(state.reports, 'searches', {});
        settings.reporstElements.forEach(item => {
          Vue.set(state.reports, item, {});
          Vue.set(state.reports[item], 'search', '');
          Vue.set(state.reports[item], 'should', false);
        });
      }
    },
    createPaperSearch: state => {
      if (!state.papers) {
        Vue.set(state, 'papers', {});
        Vue.set(state.papers, 'searches', {});
        Vue.set(state.papers, 'cursearch', 0);
      }
    },
    deleteDashFromMain: (state, dash) => {
      delete state[dash.id];
      let name = dash.name[0].toUpperCase() + dash.name.slice(1);
      restAuth.putLog(`Удален дашборд ${name} с id ${dash.id}`);
    },
    clearState: state => {
      Object.keys(state).forEach(key => {
        if (key !== 'theme') {
          delete state[key];
        }
      });
    },
    setMetricsMulti: (state, dash) => {
      let metrics = dash.metrics.map(metric => ({ name: metric, units: '' }));
      metrics.splice(0, 1);
      if (!state[dash.idDash][dash.id].metrics) {
        Vue.set(state[dash.idDash][dash.id], 'metrics', []);
      } else {
        metrics.forEach(metric => {
          const temp = state[dash.idDash][dash.id].metrics.find(m => m.name === metric.name);
          if (temp) {
            metric.units = temp.units;
          }
        });
      }
      state[dash.idDash][dash.id].metrics = metrics;
    },
    setMultilineMetricUnits: (state, payload) => {
      const { idDash, elem, units } = payload;
      state[idDash][elem].metrics.forEach(metric => {
        metric.units = units[metric.name] ? units[metric.name] : '';
      });
    },
    setMetricsPie: (state, dash) => {
      let metrics = [...[], ...dash.metrics];
      if (!state[dash.idDash][dash.id].options.metricsRelation) {
        state[dash.idDash][dash.id].options.metricsRelation = {};
        state[dash.idDash][dash.id].options.metricsRelation['relations'] = metrics;
        state[dash.idDash][dash.id].options.metricsRelation['namesMetric'] = [
          'Категория',
          'Процентное соотношение',
        ];
      }
      state[dash.idDash][dash.id].options.metricsRelation['metrics'] = metrics;
    },
    setThemePie: (state, dash) => {
      let themes = { ...{}, ...dash.themes };
      if (!state[dash.idDash][dash.id].options.themes) {
        state[dash.idDash][dash.id].options.themes = themes;
      }
    },
    setSizeGrid: (state, sizeGrid) => {
      if (!state[sizeGrid.id].grid) {
        Vue.set(state[sizeGrid.id], 'grid', {});
      }
      state[sizeGrid.id].grid = sizeGrid.grid;
    },
    setDragResize: (state, dragRes) => {
      if (!state[dragRes.id].dragRes) {
        Vue.set(state[dragRes.id], 'dragRes', 'true');
      }
      state[dragRes.id].dragRes = dragRes.item;
    },
    setGridShow: (state, gridShow) => {
      if (!state[gridShow.id].gridShow) {
        Vue.set(state[gridShow.id], 'gridShow', 'true');
      }
      state[gridShow.id].gridShow = gridShow.item;
    },
    addNewTab: (state, payload) => {
      state[payload.idDash].tabList.push({ id: payload.tabID, name: payload.tabName });
    },
    changeCurrentTab: (state, payload) => {
      state[payload.idDash].currentTab = payload.tab;
    },
    deleteDashTab: (state, payload) => {
      const { idDash, tabID } = payload;
      const tempArr = [];
      state[idDash].elements.forEach(elem => {
        if (state[idDash][elem].tab === tabID) {
          delete state[idDash][elem];
          tempArr.push(elem);
        }
      });
      state[idDash].elements = state[idDash].elements.filter(elem => !tempArr.includes(elem));

      state[idDash].tabList = state[idDash].tabList.filter(tab => tab.id !== tabID);
      if (state[idDash].currentTab === tabID) {
        Vue.set(state[idDash], 'currentTab', state[idDash].tabList[0].id);
      }
    },
    setTabMode: (state, payload) => {
      state[payload.idDash].tabs = payload.mode;
    },
    editTabName: (state, payload) => {
      const { idDash, tabID, newName } = payload;
      const tab = state[idDash].tabList.find(tab => tab.id === tabID);
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
      for (let part of filter.parts) {
        state[filter.idDash].stashedFilterParts.push({ ...part, values: [...part.values] });
      }
    },
    addTokenToFilterParts(state, tocken) {
      let focusedFilterParts = state[tocken.idDash].focusedFilter.parts;
      for (let part of focusedFilterParts) {
        if (part.filterPartType === 'token' && part.token.name === tocken.tocken.name) {
          if (part.values.indexOf(tocken.value) === -1) part.values.push(tocken.value);
        }
      }
      this.commit('sortFilterParts', { idDash: tocken.idDash });
    },
    sortFilterParts(state, { idDash }) {
      // idDash as property to case when sort not for focusedFilter (backward compatibility)
      state[idDash].focusedFilter.parts.sort(
        (part1, part2) => part2.values.length - part1.values.length
      );
    },
    declineFilterChanges(state, idDash) {
      state[idDash].focusedFilter.parts = state[idDash].stashedFilterParts;
    },
    refreshFilter(state, filter) {
      let foundFilter = state[filter.idDash].filters.find(val => filter.id === val.id);
      foundFilter.parts.forEach(part => (part.values = []));
    },
    deleteFilterPart(state, { idDash, filterIndex, filterPartIndex }) {
      state[idDash].filters[filterIndex].parts.splice(filterPartIndex, 1);
    },
    removeFilterPartValue(state, { idDash, filterIndex, filterPartIndex, valueIndex }) {
      state[idDash].filters[filterIndex].parts[filterPartIndex].values.splice(valueIndex, 1);
    },
    refreshFilterPart(state, { idDash, filterIndex, filterPartIndex }) {
      Vue.set(state[idDash].filters[filterIndex].parts[filterPartIndex], 'values', []);
    },
    restartSearches(state, payload) {
      const { idDash, filter } = payload;
      const searches = state[idDash].searches;
      searches.forEach(search => {
        if (search.original_otl.includes(`$${filter}$`)) {
          this.commit('updateSearchStatus', {
            idDash,
            sid: search.sid,
            status: 'empty',
          });
        }
      });
    },
    updateSearchStatus: (state, payload) => {
      const { idDash, sid, status } = payload;
      const search = state[idDash].searches.find(search => search.sid === sid);
      Vue.set(search, 'status', status);
    },
  },
  getters: {
    getDashTabs: state => id => {
      if (!state[id].tabList) {
        Vue.set(state[id], 'tabList', [{ id: 1, name: 'Без названия' }]);
      }
      return state[id].tabList;
    },
    getCurrentDashTab: state => id => {
      if (!state[id].currentTab) {
        Vue.set(state[id], 'currentTab', 1);
      }
      return state[id].currentTab;
    },
    getShowTabs: state => idDash => {
      if (!state[idDash].tabs) {
        Vue.set(state[idDash], 'tabs', false);
      }
      return state[idDash].tabs;
    },
    getName(state) {
      // получаем имя дашборда
      return id => {
        return state[id].name;
      };
    },
    getElements: state => id => {
      if (!state[id].elements) {
        Vue.set(state[id], 'elements', []);
      }
      return state[id].elements.filter(
        elem => state[id][elem].tab === state[id].currentTab || state[id][elem].options.pinned
      );
    },
    getElementsWithSearches: state => id => {
      return state[id].elements
        .filter(
          elem => state[id][elem].tab === state[id].currentTab || state[id][elem].options.pinned
        )
        .map(elem => ({ elem, search: state[id][elem].search }));
    },
    getAllElements: state => id => {
      if (!state[id].elements) {
        Vue.set(state[id], 'elements', []);
      }
      return state[id].elements;
    },

    getNameDash(state) {
      // получаем имя самого элемента
      return ids => {
        return state[ids.idDash][ids.id].name_elem;
      };
    },
    getPosDash(state) {
      // получаем позицию элемнета
      return ids => {
        return { top: state[ids.idDash][ids.id].top, left: state[ids.idDash][ids.id].left };
      };
    },
    getSizeDash(state) {
      // получаем размер элемента
      return ids => {
        return { width: state[ids.idDash][ids.id].width, height: state[ids.idDash][ids.id].height };
      };
    },
    getSearches(state) {
      // получаем все ИС
      return id => {
        if (!state[id].searches) {
          Vue.set(state[id], 'searches', []);
        }
        return state[id].searches;
      };
    },
    getModalSearch(state) {
      // получаем статус модального окна, чтобы знать открыто оно или нет
      return id => {
        if (!state[id].modalSearch) {
          Vue.set(state[id], 'modalSearch', {});
          Vue.set(state[id].modalDelete, 'elem', '');
          Vue.set(state[id].modalDelete, 'status', true);
        }
        return state[id].modalSearch.status;
      };
    },
    getSearch(state) {
      // получаем определенный ИС по переданному id
      return ids => {
        let id = state[ids.idDash][ids.id].search;
        let search = state[ids.idDash].searches.filter(item => {
          return item.sid == id;
        })[0];
        return search;
      };
    },
    getShouldGet(state) {
      // получаем статус должен ли элемнет запрашивать данные
      return ids => {
        return state[ids.idDash][ids.id].should;
      };
    },
    getSearchID(state) {
      // получаем статус должен ли элемнет запрашивать данные
      return ids => {
        return state[ids.idDash][ids.id].search;
      };
    },
    getSwitch(state) {
      // получаем статус какой режим сейчас выбран у элемента
      return ids => {
        return state[ids.idDash][ids.id].switch;
      };
    },
    getTockens(state) {
      // получаем массив с токенами
      return id => {
        if (!state[id].tockens) {
          Vue.set(state[id], 'tockens', []);
        }
        return state[id].tockens;
      };
    },
    getActions(state) {
      // получаем массив с событиями элемента
      return elem => {
        if (state[elem.idDash][elem.elem]) {
          return state[elem.idDash][elem.elem].actions;
        } else {
          return [];
        }
      };
    },
    getCapture(state) {
      // получаем массив с событиями элемента
      return elem => {
        if (state[elem.idDash][elem.elem]) {
          let j = -1;
          Object.keys(state[elem.idDash][elem.elem].actions).forEach(item => {
            if (state[elem.idDash][elem.elem].actions[item].name == elem.action) {
              j = item;
            }
          });

          if (j != -1) {
            return state[elem.idDash][elem.elem].actions[j].capture;
          } else {
            return [];
          }
        } else {
          return [];
        }
      };
    },
    getGraphTree: state => {
      // получаем структуру и позицию графа
      return tree => {
        if (
          state[tree.idDash][tree.id].tree &&
          state[tree.idDash][tree.id].direct &&
          state[tree.idDash][tree.id].alies
        ) {
          // если все это существует то просто возвращаем их
          return {
            tree: state[tree.idDash][tree.id].tree,
            direct: state[tree.idDash][tree.id].direct,
            alies: state[tree.idDash][tree.id].alies,
          };
        }
        return {
          tree: {
            // если нет, то возвращаем пустую заготовку
            vertical: {},
            horizontal: {},
          },
          direct: 'vertical',
          alies: {},
        };
      };
    },
    getPickerDate(state) {
      // получаем объект с выбором даты
      return elem => {
        if (!state[elem.idDash][elem.id].date) {
          // если его нет то создаем пустой шаблон
          state[elem.idDash][elem.id].date = {
            end: null,
            endCus: null,
            range: null,
            start: null,
            startCus: null,
          };
          state[elem.idDash][elem.id].changeDate = false;
        }
        return state[elem.idDash][elem.id].date; // возвращаем либо новый созданный либо имеющийся
      };
    },
    getSelected(state) {
      // получаем объект в котором храниться информация для элемнета select
      return elem => {
        if (!state[elem.idDash][elem.id].selected) {
          state[elem.idDash][elem.id].selected = {
            elem: '',
            elemlink: '',
            elemDeep: '',
          };
        }

        return state[elem.idDash][elem.id].selected;
      };
    },
    getDataApi(state) {
      // метод получающий данные из rest
      return searchFrom => {
        let hash = Math.floor(Math.random() * 1000); // создаем произвольный хэш чтобы наши запросы не повторялись

        // let search = getters.getSearch(searchOut);  // получаем нужный ИС на основе полученных при вызове настроек
        let search = searchFrom.search;
        let idDash = searchFrom.idDash;
        let otl = search.original_otl;
        let tws = search.parametrs.tws;
        let twf = search.parametrs.twf;
        let reg = null;
        if (state[idDash].filters) {
          Object.values(state[idDash].filters).forEach(filter => {
            reg = new RegExp(`\\$${filter.id}\\$`, 'g');
            if (otl.indexOf(`$${filter.id}$`) != -1) {
              let filterOtlText = filterCompile(filter);
              otl = otl.replace(reg, filterOtlText);
            }
          });
        }

        if (state[idDash].tockens) {
          Object.keys(state[idDash].tockens).forEach(item => {
            // если есть токены в запросе то меняем временные метки в зависимости от значения токена
            //let reg = `\\$${state[idDash].tockens[item].name}`;
            reg = new RegExp(`\\$${state[idDash].tockens[item].name}\\$`, 'g');
            if (otl.indexOf(`$${state[idDash].tockens[item].name}$`) != -1) {
              if(state[idDash].tockens[item].value) {
                otl = otl.replace(reg, state[idDash].tockens[item].value);
              } else {
                otl = otl.replace(reg, state[idDash].tockens[item].defaultValue);
              }
            }

            if (
              typeof tws == 'string' &&
              tws.indexOf(`$${state[idDash].tockens[item].name}$`) != -1
            ) {
              tws = state[idDash].tockens[item].value;
            }

            if (
              typeof twf == 'string' &&
              twf.indexOf(`$${state[idDash].tockens[item].name}$`) != -1
            ) {
              twf = state[idDash].tockens[item].value;
            }

            if (
              state[idDash].tockens[item].elem == 'picker' &&
              state[idDash].tockens[item].capture == 'start'
            ) {
              if (typeof search.parametrs.tws != 'number') {
                if (search.parametrs.tws.indexOf(`$${state[idDash].tockens[item].name}$`) != -1) {
                  tws = state[idDash].tockens[item].value;
                }
              }
            }
            if (
              state[idDash].tockens[item].elem == 'picker' &&
              state[idDash].tockens[item].capture == 'end'
            ) {
              if (typeof search.parametrs.twf != 'number') {
                if (search.parametrs.twf.indexOf(`$${state[idDash].tockens[item].name}$`) != -1) {
                  twf = state[idDash].tockens[item].value;
                }
              }
            }
          });
        }
        if (search.limit > 0 && !otl.includes('head')) {
          // добавляем ограничитель кол-ва строк ответа, если в тексте запроса это не прописано явно
          otl +='|head ' + search.limit
        }
        
        otl = otl.replace(/\r|\n/g, '');

        let formData = new FormData(); // формируем объект для передачи RESTу
        formData.append('sid', `${search.sid}+${hash}`);
        formData.append('original_otl', String(otl));
        formData.append('tws', tws);
        formData.append('twf', twf);
        formData.append('username', search.parametrs.username);
        formData.append('preview', search.parametrs.preview);
        formData.append('field_extraction', search.parametrs.field_extraction);
        formData.append('cache_ttl', search.parametrs.cache_ttl);
        formData.append('timeout', search.parametrs.timeout);

        let searchForRest = {
          sid: search.sid,
          otl: String(otl),
          tws: tws,
          twf: twf,
          cache_ttl: search.parametrs.cache_ttl,
        };
        return rest.rest(formData, searchForRest, restAuth, idDash); // отправляем в файл storeRest.js
      };
    },
    putIntoDB() {
      // затем полученные данные нужно положить в indexed db
      return (result, sid, idDash) => {
        return new Promise((resolve, reject) => {
          let db = null;
          let id = idDash;
          let key = `${id}-${sid}`;

          let request = indexedDB.open('EVA', 1);

          request.onerror = function(event) {
            console.log('error:', event);
          };

          request.onupgradeneeded = event => {
            console.log('create');
            db = event.target.result;
            if (!db.objectStoreNames.contains('searches')) {
              // if there's no "books" store
              db.createObjectStore('searches'); // create it
            }

            request.onsuccess = event => {
              db = request.result;
              console.log('success: ' + db);

              setTransaction(db, result, key, idDash);
            };
          };

          request.onsuccess = event => {
            db = request.result;

            setTransaction(db, result, key, idDash);
          };

          function setTransaction(db, result, key) {
            let transaction = db.transaction('searches', 'readwrite'); // (1)

            // получить хранилище объектов для работы с ним
            let searches = transaction.objectStore('searches'); // (2)

            let search = result;

            let query = searches.put(search, key); // (3)

            query.onsuccess = function() {
              // (4)
              resolve('result');
              restAuth.putLog(`Добавлен запрос ${query.result}`);
            };

            query.onerror = function() {
              console.log('Ошибка', query.error);
            };
          }
        });
      };
    },
    refreshElements(state) {
      return (idDash, key) => {
        if (idDash == 'reports') {
          state[idDash].table.should = true;
        } else {
          state[idDash].elements.forEach(item => {
            // пробегаемся по всем элементам
            if (state[idDash][item].search == key) {
              // то смотрим если наш элемент завязан на search который поменялся
              state[idDash][item].should = true; // то его нужно пересчитать
            }
          });
        }
      };
    },
    deleteFromDb() {
      // удаляем данные источников данных из базы данных indexed db
      return (ids, idDash) => {
        let db = null;
        let nameDash = idDash;
        let searchName = [];
        ids.forEach(id => {
          searchName.push(`${nameDash}-${id}`);
        });

        let request = indexedDB.open('EVA', 1);

        request.onerror = function(event) {
          console.log('error: ');
        };

        request.onsuccess = event => {
          db = request.result;

          let transaction = db.transaction('searches', 'readwrite'); // (1)

          // получить хранилище объектов для работы с ним
          let searches = transaction.objectStore('searches'); // (2)

          searchName.forEach(item => {
            searches.delete(String(item)); // (3) return store.get('Ire Aderinokun');
          });
        };
      };
    },
    getReportSearch: state => {
      let key = state.reports.table.search;
      if (key != '') {
        return state.reports.searches[key];
      } else {
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
          limit: 1000
        };
      }
    },
    getPaperSearch: state => {
      let key = state.papers?.cursearch || 0;
      if (key != 0) {
        return state.papers.searches[key];
      } else {
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
        };
      }
    },
    getReportElement: state => {
      return state.reports.elements;
    },
    getGroups() {
      return () => {
        return rest.getGroups(restAuth);
      };
    },
    getDashs: () => {
      // получения списка дашбордов
      return id => {
        return rest.getDashs(id, restAuth);
      };
    },
    getModalDelete(state) {
      // получаем объект модального окна в котором храним тот элемнет что хотим удалить
      return ids => {
        if (!state[ids.id].modalDelete) {
          Vue.set(state[ids.id], 'modalDelete', {});
          Vue.set(state[ids.id].modalDelete, 'active', false);
          Vue.set(state[ids.id].modalDelete, 'id', '');
          Vue.set(state[ids.id].modalDelete, 'name', '');
        }
        return state[ids.id].modalDelete;
      };
    },
    getModalExin(state) {
      // получаем объект модального окна в котором храним тот элемнет что хотим удалить
      return ids => {
        if (ids.page == 'dash') {
          return state[ids.id].modalExin;
        } else if (ids.page == 'layout') {
          return state.modalExin;
        }
      };
    },
    getScreenShot(state) {
      // получаем скриншот страницы
      return id => {
        return state[id].screenshot;
      };
    },
    getDashboard(state) {
      // получаем скриншот страницы
      return id => {
        return state[id];
      };
    },
    getLoading(state) {
      // получаем скриншот страницы
      return (elem, id) => {
        if (!state[id][elem].loading) {
          Vue.set(state[id][elem], 'loading', false);
        }
        return state[id][elem].loading;
      };
    },
    getOptions(state) {
      // получаем скриншот страницы
      return id => {
        if (!state[id.idDash][id.id].options) {
          Vue.set(state[id.idDash][id.id], 'options', {});
          Vue.set(state[id.idDash][id.id].options, 'change', false);
          Vue.set(state[id.idDash][id.id].options, 'visible', true);
          Vue.set(state[id.idDash][id.id].options, 'level', 1);
          Vue.set(state[id.idDash][id.id].options, 'boxShadow', false);
          Vue.set(state[id.idDash][id.id].options, 'lastResult', false);
          Vue.set(state[id.idDash][id.id].options, 'searchBtn', false);
        }
        if (!state[id.idDash][id.id].options.pinned) {
          Vue.set(state[id.idDash][id.id].options, 'pinned', false);
        }
        return state[id.idDash][id.id].options;
      };
    },
    getEventFull(state) {
      // получаем скриншот страницы

      return id => {
        if (state[id].eventFull) {
          return state[id].eventFull;
        } else {
          return '';
        }
      };
    },
    getDragRes(state) {
      return id => {
        return state[id.idDash].dragRes;
      };
    },

    getEvents(state) {
      // получаем скриншот страницы
      return event => {
        let result = [];
        if (!state[event.idDash].events) {
          state[event.idDash].events = [];
          return [];
        } else {
          if (event.partelement) {
            result = state[event.idDash].events.filter(item => {
              return (
                item.event == event.event &&
                item.element == event.element &&
                item.partelement == event.partelement
              );
            });
          } else {
            result = state[event.idDash].events.filter(item => {
              return item.event == event.event && item.target == event.element;
            });
          }
          return result;
        }
      };
    },
    getChangeDate(state) {
      // получаем скриншот страницы
      return date => {
        return state[date.idDash][date.id].changeDate;
      };
    },
    getSchedulers(state) {
      // получаем все планировщики что были созданы
      return id => {
        if (!state[id].schedulers) {
          state[id].schedulers = {};
        }
        return state[id].schedulers;
      };
    },
    getThemeTitle(state) {
      return state.theme.name;
    },
    getTheme(state) {
      return state.theme.settings;
    },
    getThemeBack(state) {
      return () => {
        return rest.getThemeBack(restAuth);
      };
    },
    getModalSettings(state) {
      // получаем объект с настройками моадлки натсроек
      return idDash => {
        if (!state[idDash].modalSettings) {
          Vue.set(state[idDash], 'modalSettings', {});
          Vue.set(state[idDash].modalSettings, 'element', '');
          Vue.set(state[idDash].modalSettings, 'status', false);
        }
        return state[idDash].modalSettings;
      };
    },
    getTextArea(state) {
      return textarea => {
        if (!state[textarea.idDash][textarea.id].textarea) {
          return '';
        }
        return state[textarea.idDash][textarea.id].textarea;
      };
    },
    saveDashboard: () => {
      return dash => {
        return new Promise((resolve, reject) => {
          let response = restAuth.setEssence({
            formData: JSON.stringify(dash),
            essence: 'dash',
            method: 'PUT',
          });
          response.then(res => {
            if (res.status == 200) {
              res.json().then(data => {
                resolve({ status: 200, data: data });
              });
            } else if (res.status == 409) {
              resolve({ status: 409 });
            }
          });
        });
      };
    },
    checkAlreadyDash: state => {
      return (id, first) => {
        return new Promise(resolve => {
          let result = rest.getState(id, restAuth);
          result.then(stateFrom => {
            if (stateFrom) {
              if (!state[id]) {
                Vue.set(state, id, {});
                if (stateFrom.body !== '') {
                  Vue.set(state, id, JSON.parse(stateFrom.body));
                }
                Vue.set(state[id], 'name', stateFrom.name);
                Vue.set(state[id], 'idgroup', stateFrom.idgroup);
                Vue.set(state[id], 'modified', stateFrom.modified);
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
                  Vue.set(state, id, JSON.parse(stateFrom.body));
                  Vue.set(state[id], 'idgroup', stateFrom.idgroup);
                  Vue.set(state[id], 'name', stateFrom.name);
                  Vue.set(state[id], 'modified', stateFrom.modified);
                }
              }
              if (state[id].elements) {
                state[id].elements.forEach(elem => {
                  if (!state[id][elem].tab) {
                    Vue.set(state[id][elem], 'tab', 1);
                  }
                });
              }
              if (state[id].searches) {
                state[id].searches.forEach(search => Vue.set(search, 'status', 'empty'));
              }
              resolve({ status: 'finish' });
              // }
            } else {
              resolve({ status: 'failed' });
            }
          });
        });
      };
    },
    checkDataSearch: () => {
      return sid => {
        return new Promise((resolve, reject) => {
          let db = null;

          let request = indexedDB.open('EVA', 1);

          request.onerror = function(event) {
            console.log('error:', event);
          };

          request.onupgradeneeded = event => {
            console.log('create');
            db = event.target.result;
            if (!db.objectStoreNames.contains('searches')) {
              // if there's no "books" store
              db.createObjectStore('searches'); // create it
            }

            request.onsuccess = event => {
              db = request.result;
              // this.alreadyDB = request.result;
              console.log('success: ' + db);

              setTransaction(db);
            };
          };

          request.onsuccess = event => {
            db = request.result;

            setTransaction(db);
          };

          function setTransaction(db) {
            let transaction = db.transaction('searches', 'readwrite'); // (1)

            // получить хранилище объектов для работы с ним
            let searches = transaction.objectStore('searches'); // (2)

            let query = searches.get(sid); // (3) return store.get('Ire Aderinokun');

            query.onsuccess = event => {
              // (4)

              if (query.result) {
                resolve(true);
              } else {
                resolve(false);
              }
            };

            query.onerror = function() {
              console.log('Ошибка', query.error);
            };
          }
        });
      };
    },
    getColorError: state => {
      if (!state.logError) {
        Vue.set(state, 'logError', false);
      }
      return state.logError;
    },
    getSvg: () => {
      return svg => {
        return rest.getSvg(svg, restAuth); // отправляем в файл storeRest.js
      };
    },
    setSvg: () => {
      return svg => {
        return rest.setSvg(svg, restAuth); // отправляем в файл storeRest.js
      };
    },
    exportDash: () => {
      return dash => {
        return rest.exportDash(dash, restAuth); // отправляем в файл storeRest.js
      };
    },
    importDash: () => {
      return dash => {
        return rest.importDash(dash, restAuth); // отправляем в файл storeRest.js
      };
    },
    getMetricsMulti: state => {
      return dash => {
        if (!state[dash.idDash][dash.id].metrics) {
          Vue.set(state[dash.idDash][dash.id], 'metrics', []);
        }
        return state[dash.idDash][dash.id].metrics;
      };
    },
    getSizeGrid: state => {
      return id => {
        if (!state[id]?.grid) {
          Vue.set(state[id], 'grid', {});
          Vue.set(state[id]?.grid, 'vert', '32');
          Vue.set(state[id]?.grid, 'hor', '18');
        }
        return state[id]?.grid;
      };
    },
    getDragResize: state => {
      return id => {
        if (!state[id].dragRes) {
          Vue.set(state[id], 'dragRes', 'true');
        }
        return state[id].dragRes;
      };
    },
    getGridShow: state => {
      return id => {
        if (!state[id].gridShow) {
          Vue.set(state[id], 'gridShow', 'true');
        }
        return state[id].gridShow;
      };
    },
    loadPaper: () => {
      return paper => {
        return rest.loadPaper(paper, restAuth);
      };
    },
    getAllPaper: () => {
      return () => {
        return rest.getAllPaper(restAuth);
      };
    },
    getPaper: () => {
      return fileData => {
        return rest.getPaper(restAuth, fileData);
      };
    },
    getPaperVis: () => {
      return url => {
        return rest.getPaperVis(restAuth, url);
      };
    },
    getSelectedTableTitles: state => {
      return (dashId, elementId) => {
        return state[dashId][elementId]?.selectedTableTitles;
      };
    },
    getAvailableTableTitles: state => {
      return (dashId, elementId) => {
        return state[dashId][elementId]?.availableTableTitles;
      };
    },
    getSelectedDataFormat: state => {
      return (dashId, elementId) => {
        return state[dashId][elementId]?.selectedDataFormat;
      };
    },
    getAvailableDataFormat: state => {
      return (dashId, elementId) => {
        return state[dashId][elementId]?.availableDataFormat;
      };
    },
    getLibrary: state => {
      return (dashId, elementId) => {
        return state[dashId][elementId]?.options?.library;
      };
    },
    getFilters: state => {
      return dashId => {
        return state[dashId].filters ? state[dashId].filters : [];
      };
    },
    getFocusedFilter(state) {
      return dashId => {
        return state[dashId].focusedFilter;
      };
    },
  },
};
