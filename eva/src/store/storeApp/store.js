import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid';
import rest from '../storeRest';
import restAuth from '../storeAuth/storeRest';

const defaultState = {
  treeOpen: false,
  treeCategories: [],
  treeGroups: [],
  treeOpenItems: [
    'categories',
  ],
  roles: [],
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
      settings.forEach(({ name, body }) => {
        if (state[name] !== undefined) {
          Vue.set(state, name, body);
        }
      });
    },
    setRoles(state, roles) {
      Vue.set(state, 'roles', roles);
    },
    setGroups(state, groups) {
      state.treeGroups = groups.map(({ name, id }) => ({
        type: 'group',
        treeId: `dash-${id}`,
        name,
        id,
        children: [],
      }));
    },
    treeOpenItems(state, val) {
      console.log('%ccommit treeOpenItems', 'color: green', val);
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
      const rootItemIdx = state.treeCategories.findIndex((item) => item.treeId === treeId);
      if (rootItemIdx > -1) {
        return state.treeCategories.splice(rootItemIdx, 1);
      }
      const parent = findParentById(state.treeCategories, treeId);
      if (parent) {
        const parentIdx = parent.children.findIndex((item) => item.treeId === treeId);
        return parent.children.splice(parentIdx, 1);
      }
      return false;
    },
    pushCategoryItem(state, { treeId, item }) {
      if (treeId === 'categories') {
        state.treeCategories.push(item);
        return true;
      }
      const founded = findDeepById(state.treeCategories, treeId);
      if (founded && founded.children) {
        founded.children.push(item);
        return true;
      }
      return false;
    },
    setCategoryItem(state, { treeId, props }) {
      if (treeId === 'categories') {
        Object.keys(props).forEach((prop) => {
          state.treeCategories[prop] = props[prop];
        });
        return true;
      }
      const founded = findDeepById(state.treeCategories, treeId);
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
  },
  actions: {
    resetState({ commit }) {
      commit('resetState');
    },
    getTreeCategoryItem({ state }, { id, idParam }) {
      return findDeepById(state.treeCategories, id, idParam);
    },
    getTreeGroupItem({ state }, { id, idParam }) {
      return findDeepById(state.treeGroups, id, idParam);
    },
    loadSettings: ({ commit, state }, lazy = false) => {
      if (lazy && !!state.treeCategories.length) {
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
    saveTreeCategories: (_, categories) => rest.saveSettings([
      {
        id: 1,
        name: 'treeCategories',
        body: categories,
      },
    ], restAuth),
    getDashes(_, groupId) {
      return fetch(`/api/group/dashs?id=${groupId}`)
        .then((res) => {
          if (res.ok) {
            return res.json().then(({ data }) => data);
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
            children: data.map((dash) => ({
              ...dash,
              treeId: uuidv4(),
              type: 'dash',
            })),
          },
        }));
    },
    loadCategoryGroup({ state, commit, dispatch }, treeId) {
      const item = findDeepById(state.treeCategories, treeId);
      return dispatch('getDashes', item.id)
        .then((data) => commit('setCategoryItem', {
          treeId,
          props: {
            children: data.map((dash) => ({
              ...dash,
              treeId: uuidv4(),
              type: 'dash',
            })),
          },
        }));
    },
  },
  getters: {
    treeCategories(state) {
      // @todo: add filter by role
      return state.treeCategories;
    },
    treeOpenItems: (state) => state.treeOpenItems,
    treeGroups: (state) => state.treeGroups,
    isOpenTree: (state) => !!state.treeOpen,
    hasCategories: (state) => !!state.treeCategories,
    hasGroups: (state) => !!state.treeGroups,
    roles: (state) => state.roles,
    roleList: (state) => state.roles.map((item) => item.name),
  },
};
