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
    getTimeline({ commit }, sid) {
      return fetch(`/api/gettimelines?cid=${sid}`)
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
