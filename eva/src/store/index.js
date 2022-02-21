// хранилище Vuex

import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import store from './store'; // это подключаем чтобы после перезагрузки страницы он сохранял состояние
import auth from './storeAuth/store';
import form from './storeForm/store';
import dataResearch from './dataResearch/store';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  ...store,
  modules: {
    auth,
    form,
    dataResearch,
  },
  plugins: [createPersistedState()],
});
