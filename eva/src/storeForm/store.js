import Vue from 'vue';
import rest from './storeRest.js';

export default {
  state: {},
  mutations: {
    setCreateForm: (state, options) => {
      Vue.set(state, 'createForm', options);
    },
    saveForm: (state, form) => {
      rest.saveForm(form);
    },
    saveTemplateForm: (state) => {
      const template = {
        name: state.createForm.name,
        cells: state.createForm.cells,
      };
      rest.saveTemplateForm(template);
    },
    setTemplate: (state, cells) => {
      if (!state.createForm) {
        Vue.set(state, 'createForm', {
          name: '',
          rows: '',
          columns: '',
          disabled: false,
        });
      }
      state.createForm.cells = cells;
    },
    setOptionsForm: (state, options) => {
      if (!state.createForm.cells[options.element].options) {
        state.createForm.cells[options.element].options = {};
      }
      state.createForm.cells[options.element].options = {};
      Object.keys(options.options).forEach((item) => {
        Vue.set(
          state.createForm.cells[options.element].options,
          item,
          options.options[item],
        );
      });
    },
    setContent: (state, content) => {
      if (!state.createForm.content) {
        state.createForm.content = {};
      }
      state.createForm.content[content.id] = content.value;
    },
    setAllContent: (state, content) => {
      if (!state.createForm.content) {
        state.createForm.content = {};
      }
      if (content != 'empty') {
        state.createForm.content = content;
      } else {
        state.createForm.content = {};
      }
    },
    setDisabled: (state, disabled) => {
      state.createForm.disabled = disabled;
    },
    deleteTemplate: (state, id) => {
      rest.deleteTemplate(id);
    },
  },
  actions: {},
  getters: {
    getCreateForm: (state) => state.createForm,
    getAllForm: () => (id) => rest.getAllForm(id),
    getOption: (state) => (options) => {
      if (state.createForm.cells[options.key].options) {
        return state.createForm.cells[options.key].options;
      }
      return 'empty';
    },
    getFormLocal: (state) => state.createForm.cells,
    getFormContent: () => (ids) => rest.getFormContent(ids),
    getContent: (state) => (id) => {
      if (state.createForm.content) {
        return state.createForm.content[id];
      }
      return 'empty';
    },
    getAllContent: (state) => {
      if (state.createForm.content) {
        return state.createForm.content;
      }
      return 'empty';
    },
    getAllTemplates: () => rest.getTemplateList(),
    getTemplate: () => (id) => rest.getTemplate(id),
    getDisabled: (state) => {
      if (!state.createForm.disabled) {
        state.createForm.disabled = false;
      }
      return state.createForm.disabled;
    },
  },
};
