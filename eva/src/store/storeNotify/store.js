import moment from 'moment';

const getMessage = ({ code, value }) => {
  const messages = {
    1: `В данный момент наблюдается деградация производительности в связи с большим количеством запросов: ${value}`,
    2: `Количество данных в запросе могло быть ограничено системой. Ограничение: ${value}`,
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
    addNotifications(state, payload) {
      const time = moment().unix();
      const ttl = 60; // минуту
      const currentItems = state.notifications.filter((item) => item.time > (time - ttl));
      const existsNotificationsIds = currentItems.map((item) => item.code);

      const newNotification = payload
        .filter((item) => !existsNotificationsIds.includes(item.code))
        .map((item) => ({
          ...item,
          time,
          read: false,
          message: getMessage(item),
        }));

      state.notifications = [
        ...currentItems,
        ...newNotification,
      ];
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
