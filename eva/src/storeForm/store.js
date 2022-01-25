import rest from './storeRest.js';
import Vue from 'vue';
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
      let template = {
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
          options.options[item]
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
    getCreateForm: (state) => {
      return state.createForm;
    },
    getAllForm: () => {
      return (id) => {
        return rest.getAllForm(id);
      };
    },
    getOption: (state) => {
      return (options) => {
        if (state.createForm.cells[options.key].options) {
          return state.createForm.cells[options.key].options;
        } else {
          return 'empty';
        }
      };
    },
    getFormLocal: (state) => {
      return state.createForm.cells;
    },
    getFormContent: () => {
      return (ids) => {
        return rest.getFormContent(ids);
      };
    },
    getContent: (state) => {
      return (id) => {
        if (state.createForm.content) {
          return state.createForm.content[id];
        } else {
          return 'empty';
        }
      };
    },
    getAllContent: (state) => {
      if (state.createForm.content) {
        return state.createForm.content;
      } else {
        return 'empty';
      }
    },
    getAllTemplates: () => {
      return rest.getTemplateList();
    },
    getTemplate: () => {
      return (id) => {
        return rest.getTemplate(id);
      };
    },
    getDisabled: (state) => {
      if (!state.createForm.disabled) {
        state.createForm.disabled = false;
      }
      return state.createForm.disabled;
    },
  },
};
