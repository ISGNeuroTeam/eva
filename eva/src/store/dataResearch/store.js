export default {
  namespaced: true,
  state: {
    timeline: [],
  },
  mutations: {
    SET_TIMELINE(state, data) {
      state.timeline = data;
    },
  },
  actions: {
    getTimeline({ commit }) {
      alert(1)
      return fetch('/api/gettimelines?cid=79')
        .then((response) => {
          console.log(response);
          commit('SET_TIMELINE', response);
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
};
