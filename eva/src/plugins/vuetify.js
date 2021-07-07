// настройки для плагина визуализации элементов и компонентов

import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import ru from 'vuetify/es5/locale/ru';

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'mdiSvg',
  },
  theme: { light: true },
  lang: {
    locales: { ru },
    current: 'ru',
  },
});
