export default {
  namespaced: true,
  state: {
    timeline: [],
    interesting: [],
  },
  mutations: {
    SET_TIMELINE(state, data) {
      state.timeline = data;
    },
    SET_INTERESTING(state, data) {
      state.interesting = data;
    },
  },
  actions: {
    async fetchTimeline({ commit }, cid) {
      // return fetch(`/api/gettimelines?cid=${sid}`)
      //   .then((response) => {
      //     console.log(response);
      //     commit('SET_TIMELINE', response);
      //   })
      //   .catch((error) => {
      //     console.error(error);
      //   });
      const test = await fetch(
        `/api/gettimelines?cid=${cid}`,
      ).catch((error) => {
        console.error(error);
      });
      if (test.status === 200) {
        // если получилось
        test.json().then((answerTest) => {
          // console.log('answerTest', answerTest);
          commit('SET_TIMELINE', answerTest);
        });
      }
    },
    async getInterestingFields({ commit }, cid) {
      await fetch(
        `/api/getinterestingfields?cid=${cid}`,
      ).catch((error) => {
        console.log(error);
      }).then((data) => {
        data.json().then((interesting) => {
          console.log('Interesting', interesting);
          commit('SET_INTERESTING', interesting);
        });
        // console.log(data);
        return data;
      });
    },
  },
  getters: {
    getTimeline(state) {
      return state.timeline || [];
    },
    getInteresting(state) {
      return state.interesting || [];
    },
  },
};
