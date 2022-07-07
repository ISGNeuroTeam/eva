import rest from './storeRest';
import router from '../../route';

export default {
  namespaced: true,
  state: {
    userName: '',
    essence: [],
  },
  mutations: {
    setUserName(state, userName) {
      state.userName = userName;
    },
    setEssence(state, data) {
      state.essence = structuredClone(data);
    },
    dropEssence(state) {
      state.essence = structuredClone({});
    },
  },
  actions: {
    deleteLog: () => rest.deleteLog(),
    getLog: (context, side) => rest.getLog(side),
    saveLogIntoBack: ({ dispatch }) => {
      const text = dispatch('getLog', 'back');
      return text.then((res) => {
        let newBack = res.split('<br>');
        newBack.pop();
        newBack.reverse();
        newBack = newBack.join('<br>');
        return rest.saveLogIntoBack(newBack);
      });
    },
    putLog: (context, text) => rest.putLog(text),
    deleteEssence: (context, data) => {
      const localData = data;
      switch (localData.essence) {
        case 1:
          localData.essence = 'user';
          break;
        case 2:
          localData.essence = 'role';
          break;
        case 3:
          localData.essence = 'permission';
          break;
        case 4:
          localData.essence = 'group';
          break;
        case 5:
          localData.essence = 'index';
          break;
        case 6:
          localData.essence = 'dash';
          break;
        default:
          break;
      }
      return rest.deleteEssence(localData);
    },
    setEssence: (context, data) => rest.setEssence(data),
    async getEssence({ commit }, { essence, id }) {
      const localEssence = await rest.getEssence(essence, id);
      commit('setEssence', localEssence);
      return localEssence;
    },
    getEssenceList: async (context, { role, create }) => {
      let data;
      if (!create) {
        switch (role) {
          case 1:
            data = await rest.getEssenceList('users', create);
            break;
          case 2:
            data = await rest.getEssenceList('roles', create);
            break;
          case 3:
            data = await rest.getEssenceList('permissions', create);
            break;
          case 4:
            data = await rest.getEssenceList('groups', create);
            break;
          case 5:
            data = await rest.getEssenceList('indexes', create);
            break;
          default:
            return false;
        }
      } else {
        data = await rest.getEssenceList(role, create);
      }
      return data;
    },
    logout({ commit }) {
      document.cookie = "eva-dashPage=''; max-age=0 ; path=/";
      document.cookie = "eva_token=''; max-age=0 ; path=/";
      commit({ type: 'clearState' }, { root: true });
      commit('setUserName', '');
      router.push('/');
    },
  },
  getters: {
    essence: (state) => state.essence,
    userName: (state) => state.userName,
  },
};
