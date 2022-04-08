import moment from 'moment';

const getMessage = ({ code, value }) => {
  const messages = {
    1: `очень большое количество запросов,  запросов: ${value}`,
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
      const ttl = 1;
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
