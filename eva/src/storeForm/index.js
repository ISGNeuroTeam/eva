import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate'; // это подключаем чтобы после перезагрузки страницы он сохранял состояние

Vue.use(Vuex);

import store from './store.js';

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    store,
  },
  plugins: [createPersistedState()],
});
