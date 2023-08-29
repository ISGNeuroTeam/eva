import moment from 'moment';
import Vue from 'vue';

const getMessage = ({ code, value }) => {
  const messages = {
    1: `В данный момент наблюдается деградация производительности в связи с большим количеством запросов: ${value}`,
    2: `Количество данных в запросе могло быть ограничено системой. Ограничение: ${value}`,
    3: 'Загрузка файла прошла успешно',
  };
  return messages[code] || `код уведомления ${code}`;
};

export default {
  namespaced: true,
  state: {
    notifications: {},
    hasNewNotify: false,
  },
  mutations: {
    hasNewNotify(state, payload) {
      state.hasNewNotify = payload;
    },
    addNotification(state, newItem) {
      const { id } = newItem;
      const isHasNotify = Object.hasOwn(state.notifications, id);
      if (isHasNotify) {
        Vue.delete(state.notifications, id);
      }
      Vue.set(state.notifications, id, {
        ...newItem,
        read: false,
      });
    },
    dismiss(state, id) {
      if (Object.hasOwn(state.notifications, id)) {
        const notify = state.notifications[id];
        notify.read = true;
      }
    },
    removeAlert(state, id) {
      if (Object.hasOwn(state.notifications, id)) {
        Vue.delete(state.notifications, id);
      }
    },
    removeAllAlert(state) {
      Vue.set(state, 'notifications', {});
    },
  },
  actions: {

    addNotification({ commit }, payload) {
      // commit('removeOldNotifications');
      const time = moment().unix();
      const newItem = {
        ...payload,
        time,
      };

      commit('addNotification', newItem);
      commit('hasNewNotify', true);

      setTimeout(() => {
        commit('dismiss', payload.id);
      }, 3000);
    },

    addNotifications({ state, dispatch }, items) {
      items.forEach((item) => {
        const id = `notif-code-${item.code || 'last'}`;
        dispatch('addNotification', {
          id,
          message: getMessage(item),
          ...item,
        });
      });
    },
  },
  getters: {
    notifications(state) {
      return state.notifications;
    },
  },
};
