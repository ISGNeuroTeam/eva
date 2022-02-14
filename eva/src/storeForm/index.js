import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import store from './store.js'; // это подключаем чтобы после перезагрузки страницы он сохранял состояние

Vue.use(Vuex);

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    store,
  },
  plugins: [createPersistedState()],
});
