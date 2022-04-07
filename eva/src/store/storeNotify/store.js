import moment from 'moment';

const messages = {
  1: 'очень большое количество запросов',
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
      const notifications = payload.reduce((acc, item, index) => {
        let idItemToReplace = -1;
        const foundItem = state.notifications.find((test) => {
          if (test.code === item.code) {
            if (
              moment.unix(time)
                .diff(moment.unix(test.time), 'minutes', true) - 1 > 0
              && !test.show
            ) {
              idItemToReplace = index;
              return false;
            }
            return true;
          }
          return false;
        });
        const isItemInAcc = acc.find((accItem) => accItem.code === item.code);
        if (!isItemInAcc) {
          if (!foundItem && idItemToReplace === -1) {
            acc.push(
              {
                code: item.code,
                message: messages[item.code],
                time,
                show: true,
              },
            );
            return acc;
          }
          if (idItemToReplace >= 0) {
            state.notifications.splice(idItemToReplace, 1);
            acc.push(
              {
                code: item.code,
                message: messages[item.code],
                time,
                show: true,
              },
            );
            return acc;
          }
        }
        console.groupEnd();
        return acc;
      }, []);
      state.notifications = [
        ...state.notifications,
        ...notifications,
      ];
    },
    dismiss(state, payload) {
      state.notifications[payload].show = false;
    },
  },
  actions: {
  },
  getters: {
  },
};
