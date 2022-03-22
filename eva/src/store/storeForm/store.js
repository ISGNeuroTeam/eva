import Vue from 'vue';
import rest from './storeRest';

export default {
  namespaced: true,
  state: {},
  mutations: {
    setCreateForm(state, options) {
      Vue.set(state, 'createForm', options);
    },
    setTemplate(state, cells) {
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
    setOptionsForm(state, options) {
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
    setContent(state, content) {
      if (!state.createForm.content) {
        state.createForm.content = {};
      }
      state.createForm.content[content.id] = content.value;
    },
    setAllContent(state, content) {
      if (!state.createForm.content) {
        state.createForm.content = {};
      }
      if (content !== 'empty') {
        state.createForm.content = content;
      } else {
        state.createForm.content = {};
      }
    },
    setDisabled(state, disabled) {
      state.createForm.disabled = disabled;
    },
  },
  actions: {
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
    deleteTemplate(state, id) {
      rest.deleteTemplate(id);
    },
    getAllForm: () => (id) => rest.getAllForm(id),
    getFormContent: () => (ids) => rest.getFormContent(ids),
    getAllTemplates: () => rest.getTemplateList(),
    getTemplate: () => (id) => rest.getTemplate(id),
  },
  getters: {
    getCreateForm: (state) => state.createForm,
    getAllContent: (state) => {
      if (state.createForm.content) {
        return state.createForm.content;
      }
      return 'empty';
    },
    getDisabled: (state) => {
      if (!state.createForm.disabled) {
        state.createForm.disabled = false;
      }
      return state.createForm.disabled;
    },
    getFormLocal: (state) => state.createForm.cells,

  },
};
