import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import uuidv4 from 'uuid/dist/v4';
import rest from '../storeRest';
import restAuth from '../storeAuth/storeRest';

const defaultState = {
  treeOpen: false,
  treeCategories: {
    items: [],
  },
  treeGroups: [],
  treeOpenItems: [
    'categories',
  ],
  roles: [],
  groupOrder: {
    id: null,
    items: [],
  },
  userSettings: {
    userTtlEnabled: false,
    userTtl: '',
    theme: null,
  },
};

function findDeepById(list, id, idProp = 'treeId', childrenProp = 'children') {
  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const idx in list) {
    if (list[idx][idProp] === id) {
      return list[idx];
    }
    if (list[idx][childrenProp] && list[idx][childrenProp].length) {
      const result = findDeepById(list[idx][childrenProp], id, idProp, childrenProp);
      if (result) {
        return result;
      }
    }
  }
  return undefined;
}

function findParentById(list, id, idProp = 'treeId', childrenProp = 'children') {
  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const idx in list) {
    if (list[idx][idProp] === id) {
      return null;
    }
    if (list[idx][childrenProp] && list[idx][childrenProp].length) {
      const result = findParentById(list[idx][childrenProp], id);
      if (result !== undefined) {
        return result || list[idx];
      }
    }
  }
  return undefined;
}

export default {
  namespaced: true,
  state: { ...defaultState },
  mutations: {
    setSettings(state, settings) {
      settings.forEach(({ id, name, items }) => {
        if (state[name] !== undefined) {
          Vue.set(state, name, { id, items });
        }
      });
    },
    setRoles(state, roles) {
      Vue.set(state, 'roles', roles);
    },
    setGroups(state, groups) {
      state.treeGroups = groups.map(({ name, id, dashs }) => ({
        type: 'group',
        treeId: `dash-${id}`,
        name,
        id,
        dashs,
        children: [],
      }));
    },
    treeOpenItems(state, val) {
      state.treeOpenItems = val;
    },
    toggleOpenTree(state) {
      state.treeOpen = !state.treeOpen;
    },
    setOpenTree(state, val) {
      if (state.treeOpen !== val) {
        Vue.set(state, 'treeOpen', !!val);
      }
    },
    resetState(state) {
      Object.keys(defaultState).forEach((key) => {
        state[key] = defaultState[key];
      });
    },
    removeCategoryItem(state, treeId) {
      const rootItemIdx = state.treeCategories.items.findIndex((item) => item.treeId === treeId);
      if (rootItemIdx > -1) {
        return state.treeCategories.items.splice(rootItemIdx, 1);
      }
      const parent = findParentById(state.treeCategories.items, treeId);
      if (parent) {
        const parentIdx = parent.children.findIndex((item) => item.treeId === treeId);
        return parent.children.splice(parentIdx, 1);
      }
      return false;
    },
    pushCategoryItem(state, { treeId, item }) {
      if (treeId === 'categories') {
        state.treeCategories.items.push(item);
        return true;
      }
      const founded = findDeepById(state.treeCategories.items, treeId);
      if (founded && founded.children) {
        founded.children.push(item);
        return true;
      }
      return false;
    },
    setCategoryItem(state, { treeId, props }) {
      if (treeId === 'categories') {
        Object.keys(props).forEach((prop) => {
          state.treeCategories.items[prop] = props[prop];
        });
        return true;
      }
      const founded = findDeepById(state.treeCategories.items, treeId);
      if (founded) {
        Object.keys(props).forEach((prop) => {
          founded[prop] = props[prop];
        });
        return true;
      }
      return false;
    },
    setGroupItem(state, { treeId, props }) {
      const founded = findDeepById(state.treeGroups, treeId);
      if (founded) {
        Object.keys(props).forEach((prop) => {
          founded[prop] = props[prop];
        });
        return true;
      }
      return false;
    },
    setUserSettings(state, settings) {
      state.userSettings = { ...settings };
    },
  },
  actions: {
    resetState({ commit }) {
      commit('resetState');
    },
    async getUserSettings({ commit, getters }) {
      const response = await rest.getUserSettings(restAuth, Vue.$jwt.decode().user_id);
      response.setting = response.setting
        .replaceAll("'", '"')
        .replaceAll('True', 'true')
        .replaceAll('False', 'false')
        .replaceAll('None', 'null');
      try {
        response.setting = JSON.parse(response.setting);
      } catch (err) {
        console.error(err);
        response.setting = {};
      }
      commit('setUserSettings', response.setting);
      return getters.userSettings;
    },
    getTreeCategoryItem({ state }, { id, idParam }) {
      return findDeepById(state.treeCategories.items, id, idParam);
    },
    getTreeGroupItem({ state }, { id, idParam }) {
      return findDeepById(state.treeGroups, id, idParam);
    },
    loadSettings: ({ commit, state }, lazy = false) => {
      if (lazy && !!state.treeCategories.items?.length) {
        return Promise.resolve();
      }
      return rest.getSettings()
        .then((settings) => commit('setSettings', settings));
    },
    loadRoles: ({ commit }) => restAuth.getEssenceList('roles')
      .then((roles) => commit('setRoles', roles)),
    loadGroups: ({ commit, state }, lazy = false) => {
      if (lazy && !!state.treeGroups.length) {
        return Promise.resolve();
      }
      return rest.getGroups(restAuth)
        .then((groups) => commit('setGroups', groups));
    },
    saveTreeCategories: ({ state }, categories) => rest.saveSettings([
      {
        id: state.treeCategories.id,
        name: 'treeCategories',
        body: categories,
      },
    ], restAuth),
    saveGroupOrder: ({ state, commit }, groupIds) => {
      const settings = [
        {
          id: state.groupOrder.id,
          name: 'groupOrder',
          body: groupIds,
        },
      ];
      return rest.saveSettings(settings, restAuth)
        .then((res) => commit('setSettings', res.map(({ id, name, body }) => ({
          id,
          name,
          items: body,
        }))));
    },
    getDashes(_, groupId) {
      return fetch(`/api/group/dashs?id=${groupId}`)
        .then((res) => {
          if (res.ok) {
            return res.json()
              .then(({ data }) => data.map((item) => ({ ...item, body: undefined })));
          }
          return Promise.reject(res.statusText);
        });
    },
    loadGroup({ state, commit, dispatch }, treeId) {
      const item = findDeepById(state.treeGroups, treeId);
      return dispatch('getDashes', item.id)
        .then((data) => commit('setGroupItem', {
          treeId,
          props: {
            children: data.sort((a, b) => a.order - b.order).map((dash) => ({
              ...dash,
              treeId: uuidv4(),
              type: 'dash',
            })),
          },
        }));
    },
    loadCategoryGroup({ state, commit, dispatch }, treeId) {
      const item = findDeepById(state.treeCategories.items, treeId);
      return dispatch('getDashes', item.id)
        .then((data) => commit('setCategoryItem', {
          treeId,
          props: {
            children: data.sort((a, b) => a.order - b.order).map((dash) => ({
              ...dash,
              treeId: uuidv4(),
              type: 'dash',
            })),
          },
        }))
        .catch(() => Promise.resolve());
    },
  },
  getters: {
    treeCategories: (state) => state.treeCategories.items,
    treeOpenItems: (state) => state.treeOpenItems,
    treeGroups: (state) => state.treeGroups,
    isOpenTree: (state) => !!state.treeOpen,
    hasCategories: (state) => !!state.treeCategories?.items,
    hasGroups: (state) => !!state.treeGroups,
    roles: (state) => state.roles,
    roleList: (state) => state.roles.map((item) => item.name),
    groupOrder: (state) => state.groupOrder.items,
    userSettings: (state) => state.userSettings,
  },
};
