import rest from './storeRest.js';

export default {
  state: {},
  mutations: {},
  actions: {},
  getters: {
    getEssenceList: () => {
      return (role, create) => {
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
      };
    },
    getEssence: () => {
      return (essence, id) => {
        return rest.getEssence(essence, id);
      };
    },
    setEssence: () => {
      return (data) => {
        return rest.setEssence(data);
      };
    },
    deleteEssence: () => {
      return (data) => {
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
      };
    },
    saveLogIntoBack: (state, getters) => {
      return () => {
        let text = getters.getLog('back');
        let response = text.then((res) => {
          let newBack = res.split('<br>');
          newBack.pop();
          newBack.reverse();
          newBack = newBack.join('<br>');
          return rest.saveLogIntoBack(newBack);
        });
        return response;
      };
    },
    putLog: () => {
      return (text) => {
        return rest.putLog(text);
      };
    },
    getLog: () => {
      return (side) => {
        return rest.getLog(side);
      };
    },
    deleteLog: () => {
      return () => {
        return rest.deleteLog();
      };
    },
  },
};
