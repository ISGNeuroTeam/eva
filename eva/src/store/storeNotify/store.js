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
    addNotification(state, payload) {
      const time = moment().unix();
      const newItem = {
        ...payload,
        time,
      };
      const savedItem = state.notifications.find((item) => item.id === payload.id);
      if (savedItem) {
        Object.assign(savedItem, newItem);
      } else {
        // @todo: check please
        state.notifications.push({
          ...newItem,
          read: false,
        });
      }
    },
    dismiss(state, payload) {
      state.notifications[payload].read = true;
    },
  },
  actions: {
  },
  getters: {
  },
};
