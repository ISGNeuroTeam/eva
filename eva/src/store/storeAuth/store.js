import rest from './storeRest';

export default {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {},
  getters: {
    getEssenceList: () => async (role, create) => {
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
    getEssence: () => (essence, id) => rest.getEssence(essence, id),
    setEssence: () => (data) => rest.setEssence(data),
    deleteEssence: () => (data) => {
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
    saveLogIntoBack: (state, getters) => () => {
      const text = getters.getLog('back');
      return text.then((res) => {
        let newBack = res.split('<br>');
        newBack.pop();
        newBack.reverse();
        newBack = newBack.join('<br>');
        return rest.saveLogIntoBack(newBack);
      });
    },
    putLog: () => (text) => rest.putLog(text),
    getLog: () => (side) => rest.getLog(side),
    deleteLog: () => () => rest.deleteLog(),
  },
};
