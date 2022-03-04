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
    async getTimeline({ commit }, cid) {
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
        console.error(error)
      })
      if (test.status == 200) {
        // если получилось
        return test.json().then((answerTest) => {
          console.log(answerTest)
          commit('SET_TIMELINE', answerTest);
        })
      }
    },
    // async getInterestingFields({commit}, cid) {
    //   const test2 = await fetch(
    //       `/api/getinterestingfields?cid=${cid}`,
    //   ).catch((error) => {
    //     console.log(error)
    //   }).then((data) => {
    //     return data
    //     // console.log(data)
    //   });
    // }
  },
};
