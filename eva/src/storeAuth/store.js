import rest from './storeRest.js';

export default {
  state: {},
  mutations: {},
  actions: {},
  getters: {
    getEssenceList: () => (role, create) => {
      if (!create) {
        switch (role) {
          case 1:
            return rest.getEssenceList('users', create);
          case 2:
            return rest.getEssenceList('roles', create);
          case 3:
            return rest.getEssenceList('permissions', create);
          case 4:
            return rest.getEssenceList('groups', create);
          case 5:
            return rest.getEssenceList('indexes', create);
        }
      } else {
        return rest.getEssenceList(role, create);
      }
    },
    getEssence: () => (essence, id) => rest.getEssence(essence, id),
    setEssence: () => (data) => rest.setEssence(data),
    deleteEssence: () => (data) => {
      switch (data.essence) {
        case 1:
          data.essence = 'user';
          break;
        case 2:
          data.essence = 'role';
          break;
        case 3:
          data.essence = 'permission';
          break;
        case 4:
          data.essence = 'group';
          break;
        case 5:
          data.essence = 'index';
          break;
        case 6:
          data.essence = 'dash';
          break;
      }
      return rest.deleteEssence(data);
    },
    saveLogIntoBack: (state, getters) => () => {
      const text = getters.getLog('back');
      const response = text.then((res) => {
        let newBack = res.split('<br>');
        newBack.pop();
        newBack.reverse();
        newBack = newBack.join('<br>');
        return rest.saveLogIntoBack(newBack);
      });
      return response;
    },
    putLog: () => (text) => rest.putLog(text),
    getLog: () => (side) => rest.getLog(side),
    deleteLog: () => () => rest.deleteLog(),
  },
};
