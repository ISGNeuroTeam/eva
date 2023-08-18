import moment from 'moment';

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
    notifications: [],
    dismissed: [],
  },
  mutations: {
    setNotify(state, payload) {
      state.notifications = payload;
    },
    removeOldNotifications(state) {
      const time = moment().unix();
      const ttl = 60; // минуту
      state.notifications = state.notifications
        .filter((item) => item.time > (time - ttl));
    },
    addNotifications(state, items) {
      this.commit('notify/removeOldNotifications');
      items.forEach((item) => {
        const id = `notif-code-${item.code || 'last'}`;
        this.commit('notify/addNotification', {
          id,
          message: getMessage(item),
          ...item,
        });
      });
    },
    addNotification(state, { newItem, savedItem }) {console.log('addNotification', newItem, savedItem);
      if (savedItem) {
        Object.assign(savedItem, newItem);
        savedItem.read = false;
      } else {
        // @todo: check please
        state.notifications.push({
          ...newItem,
          read: false,
        });
      }
    },
    dismiss(state, payload) {
      if (state.notifications && state.notifications[payload]) {
        state.notifications[payload].read = true;
      }
    },
  },
  actions: {
    addNotification({ state, commit }, payload) {
      commit('removeOldNotifications');
      const time = moment().unix();
      const newItem = {
        ...payload,
        time,
      };
      const savedItem = state.notifications.find((item) => item.id === payload.id);
      commit('addNotification', { newItem, savedItem });

      let id;
      if (savedItem) {
        id = state.notifications.indexOf(savedItem);
      } else {
        id = state.notifications.indexOf(state.notifications
          .find((item) => item.id === payload.id));
      }

      setTimeout(() => {
        commit('dismiss', id);
      }, 3000);
    },

    addNotifications({ state, commit, dispatch }, items) {
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
  },
};
